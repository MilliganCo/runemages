import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  createInitialGameState,
  stepGameTick,
  GameState,
  PlayerMatchState,
  BoardState,
  BOARD_ROWS,
  BOARD_COLS,
  TICKS_PER_SECOND,
  RuneType,
  Direction,
  MirrorOrientation,
  SplitterSecondaryDirection,
  placeRuneWithLimits,
  removeRuneAt,
  nextRuneId,
  CellPos,
  ArrowRune,
  MirrorRune,
  SplitterRune,
  AcceleratorRune,
  TrapOutRune,
  GamePhase,
  EDIT_ACTION_COOLDOWN_TICKS,
} from "../../game";
import { PlayerView } from "./PlayerView";
import { RunePalette, SelectedRuneConfig } from "./RunePalette";
import { ControlsPanel } from "./ControlsPanel";

const TICK_INTERVAL_MS = 1000 / TICKS_PER_SECOND;

function useGameLoop(
  isRunning: boolean,
  tickIntervalMs: number,
  onTick: () => void
) {
  const callbackRef = useRef(onTick);

  // Обновляем текущий callback без пересоздания интервала
  useEffect(() => {
    callbackRef.current = onTick;
  }, [onTick]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const id = setInterval(() => {
      callbackRef.current();
    }, tickIntervalMs);

    return () => clearInterval(id);
  }, [isRunning, tickIntervalMs]);
}

function createRuneFromSelection(
  id: string,
  position: CellPos,
  cfg: SelectedRuneConfig
): ArrowRune | MirrorRune | SplitterRune | AcceleratorRune | TrapOutRune {
  switch (cfg.type) {
    case RuneType.Arrow:
      return {
        id,
        type: RuneType.Arrow,
        position,
        direction: cfg.direction,
      };
    case RuneType.Mirror:
      return {
        id,
        type: RuneType.Mirror,
        position,
        orientation: cfg.orientation,
      };
    case RuneType.Splitter:
      return {
        id,
        type: RuneType.Splitter,
        position,
        secondaryDirection: cfg.secondaryDirection,
      };
    case RuneType.Accelerator:
      return {
        id,
        type: RuneType.Accelerator,
        position,
      };
    case RuneType.TrapOut:
      return {
        id,
        type: RuneType.TrapOut,
        position,
      };
    default:
      return {
        id,
        type: RuneType.Arrow,
        position,
        direction: Direction.Right,
      };
  }
}

export const GameView: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(() =>
    createInitialGameState()
  );
  const [isRunning, setIsRunning] = useState(false);
  const [selectedRune, setSelectedRune] = useState<SelectedRuneConfig | null>(
    null
  );

  // Автоматический игровой цикл
  useGameLoop(isRunning, TICK_INTERVAL_MS, () => {
    setGameState((prev) => {
      if (prev.isMatchFinished) {
        setIsRunning(false);
        return prev;
      }
      return stepGameTick(prev);
    });
  });

  const handleStart = () => {
    setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStep = () => {
    setGameState((prev) => {
      if (prev.isMatchFinished) {
        return prev;
      }
      return stepGameTick(prev);
    });
  };

  const handleReset = () => {
    setIsRunning(false);
    setGameState(createInitialGameState());
  };

  // Расстановка руны для игрока 0 с учётом фаз и кулдауна
  const handleCellClickPlayer0 = useCallback(
    (pos: CellPos) => {
      setGameState((prev) => {
        const players = [...prev.players] as [
          PlayerMatchState,
          PlayerMatchState
        ];
        const player0 = players[0];

        const board = player0.board;
        const phase = player0.phase;

        // Матч завершён — не редактируем
        if (phase === GamePhase.Finished) {
          return prev;
        }

        // В фазе Prep — редактирование без кулдауна
        if (phase === GamePhase.Prep) {
          // Удаление, если руна не выбрана
          if (!selectedRune) {
            const newBoard = removeRuneAt(board, pos);
            // Можно не проверять изменение и просто установить
            players[0] = { ...player0, board: newBoard };
            return { ...prev, players };
          }

          const runeId = nextRuneId();
          const rune = createRuneFromSelection(runeId, pos, selectedRune);
          const newBoard = placeRuneWithLimits(board, rune);

          players[0] = { ...player0, board: newBoard };
          return { ...prev, players };
        }

        // В фазе Flow — редактирование только при отсутствии кулдауна
        if (phase === GamePhase.Flow) {
          if (player0.editCooldownTicksLeft > 0) {
            // Кулдаун ещё не истёк — ничего не делаем
            return prev;
          }

          let newBoard: BoardState;

          if (!selectedRune) {
            newBoard = removeRuneAt(board, pos);
          } else {
            const runeId = nextRuneId();
            const rune = createRuneFromSelection(runeId, pos, selectedRune);
            newBoard = placeRuneWithLimits(board, rune);
          }

          // Засчитываем действие и запускаем кулдаун
          players[0] = {
            ...player0,
            board: newBoard,
            editCooldownTicksLeft: EDIT_ACTION_COOLDOWN_TICKS,
          };

          return { ...prev, players };
        }

        return prev;
      });
    },
    [selectedRune]
  );

  const p0 = gameState.players[0];
  const p1 = gameState.players[1];

  return (
    <div className="rm-root">
      <h1 className="rm-title">RuneMages (Prototype)</h1>
      <ControlsPanel
        isRunning={isRunning}
        onStart={handleStart}
        onPause={handlePause}
        onStep={handleStep}
        onReset={handleReset}
        isMatchFinished={gameState.isMatchFinished}
      />
      <div className="rm-players-row">
        <PlayerView
          player={p0}
          index={0}
          onCellClick={handleCellClickPlayer0}
          isLocal={true}
        />
        <PlayerView player={p1} index={1} isLocal={false} />
      </div>
      <RunePalette selected={selectedRune} onChangeSelected={setSelectedRune} />
    </div>
  );
};

