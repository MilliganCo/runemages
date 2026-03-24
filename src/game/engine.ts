import {
  ManaBall,
  ManaColor,
  Direction,
  PlayerMatchState,
  WaveState,
  WaveConfig,
  GameState,
  GamePhase,
  BoardState,
} from "./types";
import {
  BOARD_COLS,
  ENTRY_ROW,
  ENTRY_COL,
  MAX_MANA_LIFETIME_TICKS,
  BASE_MANA_PER_WAVE,
  MANA_SPAWN_INTERVAL_TICKS,
  WAVES_PER_MATCH,
  PREP_PHASE_TICKS,
  FLOW_PHASE_TICKS,
  EDIT_ACTION_COOLDOWN_TICKS,
} from "./constants";
import { isInsideBoard, movePos, positionsEqual } from "./board";
import { nextManaId } from "./id";
import { runeEffectsRegistry } from "./runes";
import { CellPos, Rune } from "./types";

/**
 * Создать новый шарик маны в точке входа.
 */
function createManaBall(isDirty: boolean, color: ManaColor): ManaBall {
  return {
    id: nextManaId(),
    position: { row: ENTRY_ROW, col: ENTRY_COL },
    direction: Direction.Right,
    lifetimeLeft: MAX_MANA_LIFETIME_TICKS,
    isDirty,
    canSplit: true,
    speed: 1,
    color,
  };
}

/**
 * Подсчитать общее количество маны для спавна в волне.
 */
function getTotalManaToSpawn(config: WaveConfig): number {
  return config.baseManaCount + config.incomingDirtyMana;
}

/**
 * Получить цвет базовой маны для волны по индексу чистого шарика.
 */
function getBaseManaColorForWave(
  waveConfig: WaveConfig,
  cleanIndex: number
): ManaColor {
  // Простая цикличная схема: W, W, R, W, B, ...
  const pattern: ManaColor[] = [
    ManaColor.White,
    ManaColor.White,
    ManaColor.Red,
    ManaColor.White,
    ManaColor.Black,
  ];
  return pattern[cleanIndex % pattern.length];
}

/**
 * Инициализировать/добавить волны для игрока.
 */
export function createWaveConfig(
  index: number,
  incomingDirty: number
): WaveConfig {
  return {
    index,
    baseManaCount: BASE_MANA_PER_WAVE,
    incomingDirtyMana: incomingDirty,
  };
}

/**
 * Создать начальное состояние волны.
 */
function createInitialWaveState(config: WaveConfig): WaveState {
  return {
    config,
    tick: 0,
    spawnedManaCount: 0,
    finished: false,
    pureCollected: 0,
    dirtyCollected: 0,
    sentDirty: 0,
    scoreDelta: 0,
  };
}

/**
 * Результат шага для одной доски.
 */
interface BoardStepResult {
  board: BoardState;
}

/**
 * Найти руну в указанной позиции.
 */
function getRuneAtPosition(board: BoardState, pos: CellPos): Rune | undefined {
  return board.runes.find((rune) => positionsEqual(rune.position, pos));
}

/**
 * Подсчитать очки за чистую ману по её цвету.
 */
function scoreCleanManaBall(ball: ManaBall): number {
  switch (ball.color) {
    case ManaColor.White:
      return 1;
    case ManaColor.Red:
      return 2;
    case ManaColor.Black:
      return -1;
    default:
      return 1;
  }
}

/**
 * Один тик для одной доски (одного игрока): двигаем все шарики,
 * учитываем выход за границы, время жизни, и применяем руны.
 */
function stepBoardWithRunes(board: BoardState): BoardStepResult {
  let updatedBoard: BoardState = {
    ...board,
    pureManaCollected: board.pureManaCollected,
    dirtyManaCollected: board.dirtyManaCollected,
    sentDirtyMana: board.sentDirtyMana,
  };

  const nextMana: ManaBall[] = [];

  for (const ball of board.mana) {
    const distance = ball.speed ?? 1;

    // 1. Движение по направлению на расстояние speed
    const targetPos = movePos(ball.position, ball.direction, distance);

    // 2. Проверка выхода за границы
    if (!isInsideBoard(targetPos)) {
      // Выход вправо — шарик попадает в чашу
      if (
        targetPos.col >= BOARD_COLS &&
        ball.position.col === BOARD_COLS - 1
      ) {
        if (ball.isDirty) {
          // Грязная мана: -1 в итоговом скоринге
          updatedBoard.dirtyManaCollected += 1;
        } else {
          // Чистая мана: скор зависит от цвета
          const delta = scoreCleanManaBall(ball);
          updatedBoard.pureManaCollected += delta;
        }
      }
      // Выход влево / вверх / вниз — шарик исчезает
      continue;
    }

    // 3. Обновляем lifetime
    const newLifetime = ball.lifetimeLeft - 1;
    if (newLifetime <= 0) {
      continue;
    }

    let updatedBall: ManaBall = {
      ...ball,
      position: targetPos,
      lifetimeLeft: newLifetime,
    };

    // 4. Проверяем наличие руны в целевой клетке
    const rune = getRuneAtPosition(updatedBoard, targetPos);
    if (rune) {
      const handler = runeEffectsRegistry[rune.type];
      if (handler) {
        const { board: boardAfterRune, manaList } = handler({
          board: updatedBoard,
          mana: updatedBall,
          rune,
        });

        updatedBoard = boardAfterRune;

        for (const m of manaList) {
          nextMana.push(m);
        }

        // Переходим к следующему шарику
        continue;
      }
    }

    // 5. Если руны нет или обработчик не найден — шарик просто остаётся как есть
    nextMana.push(updatedBall);
  }

  updatedBoard.mana = nextMana;
  return { board: updatedBoard };
}

/**
 * Попытаться заспавнить шарик маны для волны, если пришло время.
 */
function maybeSpawnManaForWave(
  board: BoardState,
  wave: WaveState
): { board: BoardState; wave: WaveState } {
  const totalToSpawn = getTotalManaToSpawn(wave.config);

  // Все шарики уже были выпущены
  if (wave.spawnedManaCount >= totalToSpawn) {
    return { board, wave };
  }

  // Спавним по интервалу MANA_SPAWN_INTERVAL_TICKS
  if (wave.tick % MANA_SPAWN_INTERVAL_TICKS !== 0) {
    return { board, wave };
  }

  const spawnIndex = wave.spawnedManaCount;
  const incomingDirtyCount = wave.config.incomingDirtyMana;

  let isDirty = false;
  let color: ManaColor;

  if (spawnIndex < incomingDirtyCount) {
    // Грязная мана от оппонента
    isDirty = true;
    color = ManaColor.White; // цвет не влияет на скоринг грязной маны
  } else {
    // Чистая мана базовой волны
    isDirty = false;
    const cleanIndex = spawnIndex - incomingDirtyCount;
    color = getBaseManaColorForWave(wave.config, cleanIndex);
  }

  const newBall = createManaBall(isDirty, color);

  const updatedBoard: BoardState = {
    ...board,
    mana: [...board.mana, newBall],
  };

  const updatedWave: WaveState = {
    ...wave,
    spawnedManaCount: spawnIndex + 1,
  };

  return { board: updatedBoard, wave: updatedWave };
}

/**
 * Один тик для одного игрока.
 */
function stepPlayerTick(player: PlayerMatchState): PlayerMatchState {
  const currentWave = player.waves[player.currentWaveIndex];

  // Если матч для этого игрока уже прошёл все волны — просто возвращаем состояние
  if (currentWave.finished) {
    return player;
  }

  // На этом этапе игнорируем phase / таймеры фаз, считаем что всегда идёт "поток"
  const nextWaveTick = currentWave.tick + 1;
  let updatedWave: WaveState = {
    ...currentWave,
    tick: nextWaveTick,
  };

  // 1. Спавним шарик, если пришло время
  let updatedBoard = player.board;
  const spawnResult = maybeSpawnManaForWave(updatedBoard, updatedWave);
  updatedBoard = spawnResult.board;
  updatedWave = spawnResult.wave;

  // 2. Двигаем все шарики и обрабатываем выходы за границы (с учётом рун)
  const boardStep = stepBoardWithRunes(updatedBoard);
  updatedBoard = boardStep.board;

  // 3. Проверяем, закончилась ли волна: всё заспавнено и шариков больше нет
  const totalToSpawn = getTotalManaToSpawn(updatedWave.config);
  const allSpawned = updatedWave.spawnedManaCount >= totalToSpawn;
  const noActiveMana = updatedBoard.mana.length === 0;

  let updatedTotalScore = player.totalScore;

  if (allSpawned && noActiveMana) {
    const pure = updatedBoard.pureManaCollected;
    const dirty = updatedBoard.dirtyManaCollected;
    const sent = updatedBoard.sentDirtyMana;
    const scoreDelta = pure - dirty;

    updatedWave = {
      ...updatedWave,
      finished: true,
      pureCollected: pure,
      dirtyCollected: dirty,
      sentDirty: sent,
      scoreDelta,
    };

    updatedTotalScore += scoreDelta;
  }

  // 4. Обновляем массив волн
  const updatedWaves = [...player.waves];
  updatedWaves[player.currentWaveIndex] = updatedWave;

  return {
    ...player,
    board: updatedBoard,
    waves: updatedWaves,
    totalScore: updatedTotalScore,
  };
}

/**
 * Создать пустое состояние игрока перед началом матча.
 */
export function createEmptyPlayerMatchState(): PlayerMatchState {
  const waves: WaveState[] = [];

  for (let i = 0; i < WAVES_PER_MATCH; i++) {
    const config = createWaveConfig(i, 0); // на этом этапе грязной маны ещё нет
    waves.push(createInitialWaveState(config));
  }

  const board: BoardState = {
    runes: [],
    mana: [],
    pureManaCollected: 0,
    dirtyManaCollected: 0,
    sentDirtyMana: 0,
  };

  return {
    board,
    waves,
    currentWaveIndex: 0,
    phase: GamePhase.Prep,
    prepPhaseTicksLeft: PREP_PHASE_TICKS,
    flowPhaseTicksLeft: 0,
    editCooldownTicksLeft: 0,
    totalScore: 0,
  };
}

/**
 * Создать глобальное состояние матча (2 игрока).
 */
export function createInitialGameState(): GameState {
  const player1 = createEmptyPlayerMatchState();
  const player2 = createEmptyPlayerMatchState();

  return {
    players: [player1, player2],
    currentWaveGlobalIndex: 0,
    isMatchFinished: false,
  };
}

/**
 * Один шаг симуляции (один тик).
 * В следующих этапах будет обновлять все волны/шарики/таймеры.
 */
export function stepGameTick(state: GameState): GameState {
  if (state.isMatchFinished) {
    return state;
  }

  let players = [...state.players] as [PlayerMatchState, PlayerMatchState];
  const currentWaveIndex = state.currentWaveGlobalIndex;

  // Предполагаем, что фазы синхронны у обоих игроков
  const phase = players[0].phase;

  // -------------------
  // Фаза подготовки (Prep)
  // -------------------
  if (phase === GamePhase.Prep) {
    const newPrepTicks = Math.max(players[0].prepPhaseTicksLeft - 1, 0);

    players = players.map((p) => ({
      ...p,
      prepPhaseTicksLeft: newPrepTicks,
      editCooldownTicksLeft: 0, // в Prep кулдауна нет
    })) as [PlayerMatchState, PlayerMatchState];

    // Когда таймер подготовки истёк — переходим в Flow
    if (newPrepTicks <= 0) {
      players = players.map((p) => ({
        ...p,
        phase: GamePhase.Flow,
        flowPhaseTicksLeft: FLOW_PHASE_TICKS,
        editCooldownTicksLeft: 0, // на старте Flow кулдаун тоже нулевой
      })) as [PlayerMatchState, PlayerMatchState];
    }

    return {
      ...state,
      players,
    };
  }

  // -------------------
  // Фаза потока (Flow)
  // -------------------
  if (phase === GamePhase.Flow) {
    const newFlowTicks = Math.max(players[0].flowPhaseTicksLeft - 1, 0);

    players = players.map((p) => ({
      ...p,
      flowPhaseTicksLeft: newFlowTicks,
      editCooldownTicksLeft: Math.max(p.editCooldownTicksLeft - 1, 0),
    })) as [PlayerMatchState, PlayerMatchState];

    // Двигаем игру вперёд для каждого игрока
    players = players.map((p) => stepPlayerTick(p)) as [
      PlayerMatchState,
      PlayerMatchState
    ];

    let isMatchFinished: boolean = state.isMatchFinished;
    let nextWaveIndex = currentWaveIndex;

    const p0Wave = players[0].waves[currentWaveIndex];
    const p1Wave = players[1].waves[currentWaveIndex];

    if (p0Wave.finished && p1Wave.finished) {
      // Все волны сыграны?
      if (currentWaveIndex + 1 >= WAVES_PER_MATCH) {
        isMatchFinished = true;
        // Обозначаем фазу как Finished
        players = players.map((p) => ({
          ...p,
          phase: GamePhase.Finished,
          prepPhaseTicksLeft: 0,
          flowPhaseTicksLeft: 0,
        })) as [PlayerMatchState, PlayerMatchState];
      } else {
        // Переход к следующей волне
        nextWaveIndex = currentWaveIndex + 1;

        const p0SentDirty = p0Wave.sentDirty;
        const p1SentDirty = p1Wave.sentDirty;

        const p0Waves = [...players[0].waves];
        const p1Waves = [...players[1].waves];

        const p0NextWave: WaveState = {
          ...p0Waves[nextWaveIndex],
          config: {
            ...p0Waves[nextWaveIndex].config,
            incomingDirtyMana: p1SentDirty,
          },
        };

        const p1NextWave: WaveState = {
          ...p1Waves[nextWaveIndex],
          config: {
            ...p1Waves[nextWaveIndex].config,
            incomingDirtyMana: p0SentDirty,
          },
        };

        p0Waves[nextWaveIndex] = p0NextWave;
        p1Waves[nextWaveIndex] = p1NextWave;

        players[0] = {
          ...players[0],
          currentWaveIndex: nextWaveIndex,
          waves: p0Waves,
          board: {
            ...players[0].board,
            mana: [],
            pureManaCollected: 0,
            dirtyManaCollected: 0,
            sentDirtyMana: 0,
          },
          phase: GamePhase.Prep,
          prepPhaseTicksLeft: PREP_PHASE_TICKS,
          flowPhaseTicksLeft: 0,
          editCooldownTicksLeft: 0,
        };

        players[1] = {
          ...players[1],
          currentWaveIndex: nextWaveIndex,
          waves: p1Waves,
          board: {
            ...players[1].board,
            mana: [],
            pureManaCollected: 0,
            dirtyManaCollected: 0,
            sentDirtyMana: 0,
          },
          phase: GamePhase.Prep,
          prepPhaseTicksLeft: PREP_PHASE_TICKS,
          flowPhaseTicksLeft: 0,
          editCooldownTicksLeft: 0,
        };
      }

      return {
        ...state,
        players,
        currentWaveGlobalIndex: nextWaveIndex,
        isMatchFinished,
      };
    }

    // Волна ещё не завершена
    return {
      ...state,
      players,
      currentWaveGlobalIndex: currentWaveIndex,
      isMatchFinished,
    };
  }

  // -------------------
  // Матч завершён (на всякий случай)
  // -------------------
  return state;
}
