import { BOARD_ROWS, BOARD_COLS } from "./constants";

// 1. Направления
export enum Direction {
  Up = "up",
  Right = "right",
  Down = "down",
  Left = "left",
}

// 2. Типы рун
export enum RuneType {
  Arrow = "arrow",
  Mirror = "mirror",
  Splitter = "splitter",
  Accelerator = "accelerator",
  TrapOut = "trap_out",
}

// 3. Дополнительные параметры рун
export enum MirrorOrientation {
  Slash = "slash", // "/"
  Backslash = "backslash", // "\"
}

export enum SplitterSecondaryDirection {
  Up = "up",
  Down = "down",
}

// 4. Координаты клетки
export interface CellPos {
  row: number; // 0 .. BOARD_ROWS-1
  col: number; // 0 .. BOARD_COLS-1
}

// 5. Описание руны на поле
export interface RuneBase {
  id: string; // уникальный id для отладки/удаления
  type: RuneType;
  position: CellPos;
}

export interface ArrowRune extends RuneBase {
  type: RuneType.Arrow;
  direction: Direction;
}

export interface MirrorRune extends RuneBase {
  type: RuneType.Mirror;
  orientation: MirrorOrientation;
}

export interface SplitterRune extends RuneBase {
  type: RuneType.Splitter;
  secondaryDirection: SplitterSecondaryDirection;
}

export interface AcceleratorRune extends RuneBase {
  type: RuneType.Accelerator;
}

export interface TrapOutRune extends RuneBase {
  type: RuneType.TrapOut;
}

export type Rune =
  | ArrowRune
  | MirrorRune
  | SplitterRune
  | AcceleratorRune
  | TrapOutRune;

// 6. Мана (шарики)
export type ManaId = string;

export enum ManaColor {
  White = "white",
  Red = "red",
  Black = "black",
}

export interface ManaBall {
  id: ManaId;
  position: CellPos;
  direction: Direction;
  lifetimeLeft: number; // в тиках
  isDirty: boolean; // чистая / грязная мана
  canSplit: boolean; // флаг для разделителя
  speed: 1 | 2; // обычный тик или «ускоренный» (для будущей руны)
  color: ManaColor; // тип маны
}

// 7. Состояние поля игрока
export interface BoardState {
  runes: Rune[]; // список рун на поле
  mana: ManaBall[]; // все шарики на поле
  // Чаша и статистика
  pureManaCollected: number; // сколько чистой маны попало в чашу за текущую волну
  dirtyManaCollected: number; // сколько грязной маны попало в чашу (штраф)
  sentDirtyMana: number; // сколько шариков было отправлено через ловушки в эту волну
}

// 8. Фазы матча
export enum GamePhase {
  Prep = "prep",
  Flow = "flow",
  Finished = "finished",
}

// 9. Состояние волны
export interface WaveConfig {
  index: number; // порядковый номер волны (0..WAVES_PER_MATCH-1)
  baseManaCount: number; // N=20
  incomingDirtyMana: number; // M — грязь от оппонента
}

export interface WaveState {
  config: WaveConfig;
  tick: number; // номер тика с начала волны
  spawnedManaCount: number; // сколько шариков уже выпущено
  finished: boolean;
  // новые поля статистики по волне:
  pureCollected: number; // сколько чистых шариков попало в чашу
  dirtyCollected: number; // сколько грязных шариков попало в чашу
  sentDirty: number; // сколько шариков было отправлено TrapOut к оппоненту
  scoreDelta: number; // pureCollected - dirtyCollected
}

// 10. Состояние игрока в матче (без оппонента пока)
export interface PlayerMatchState {
  board: BoardState;
  waves: WaveState[];
  currentWaveIndex: number;
  phase: GamePhase;
  prepPhaseTicksLeft: number; // в тиках
  flowPhaseTicksLeft: number; // в тиках
  editCooldownTicksLeft: number; // тики до следующего разрешённого редактирования в Flow
  totalScore: number; // суммарный счёт по всем завершённым волнам
}

// 11. Общий GameState для будущей поддержки двух игроков
export interface GameState {
  players: [PlayerMatchState, PlayerMatchState]; // пока можем инициализировать только 1
  currentWaveGlobalIndex: number; // 0..WAVES_PER_MATCH-1
  isMatchFinished: boolean;
}

