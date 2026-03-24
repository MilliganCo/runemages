import {
  ManaBall,
  ManaColor,
  Rune,
  BoardState,
  RuneType,
  ArrowRune,
  MirrorRune,
  SplitterRune,
  AcceleratorRune,
  TrapOutRune,
  MirrorOrientation,
  SplitterSecondaryDirection,
  Direction,
} from "./types";
import { nextManaId } from "./id";

export interface RuneEffectContext {
  board: BoardState;
  mana: ManaBall;
  rune: Rune;
}

export interface RuneEffectResult {
  board: BoardState;
  manaList: ManaBall[]; // заменяет текущий шарик: 0, 1 или несколько
}

export type RuneEffectHandler = (ctx: RuneEffectContext) => RuneEffectResult;

// Реестр: один обработчик на каждый тип руны
export type RuneEffectsRegistry = Record<RuneType, RuneEffectHandler>;

/**
 * Применить отражение зеркала к направлению движения.
 */
function applyMirrorDirection(
  dir: Direction,
  orientation: MirrorOrientation
): Direction {
  if (orientation === MirrorOrientation.Slash) {
    // "/"
    switch (dir) {
      case Direction.Right:
        return Direction.Up; // шёл вправо → вверх
      case Direction.Up:
        return Direction.Right;
      case Direction.Left:
        return Direction.Down;
      case Direction.Down:
        return Direction.Left; // шёл вниз → влево
      default:
        return dir;
    }
  } else {
    // Backslash "\"
    switch (dir) {
      case Direction.Right:
        return Direction.Down;
      case Direction.Down:
        return Direction.Right;
      case Direction.Left:
        return Direction.Up;
      case Direction.Up:
        return Direction.Left;
      default:
        return dir;
    }
  }
}

/**
 * Обработчик руны "Стрела" - перенаправление маны.
 */
const arrowRuneEffect: RuneEffectHandler = ({ board, mana, rune }) => {
  const arrow = rune as ArrowRune;
  const updatedMana: ManaBall = {
    ...mana,
    direction: arrow.direction,
  };

  return {
    board,
    manaList: [updatedMana],
  };
};

/**
 * Обработчик руны "Отражатель" - отражение по диагонали.
 */
const mirrorRuneEffect: RuneEffectHandler = ({ board, mana, rune }) => {
  const mirror = rune as MirrorRune;
  const newDirection = applyMirrorDirection(mana.direction, mirror.orientation);

  const updatedMana: ManaBall = {
    ...mana,
    direction: newDirection,
  };

  return {
    board,
    manaList: [updatedMana],
  };
};

/**
 * Обработчик руны "Разделитель" - дублирование шарика.
 */
const splitterRuneEffect: RuneEffectHandler = ({ board, mana, rune }) => {
  const splitter = rune as SplitterRune;

  if (!mana.canSplit) {
    return {
      board,
      manaList: [mana],
    };
  }

  const original: ManaBall = {
    ...mana,
    canSplit: false,
  };

  const secondaryDir =
    splitter.secondaryDirection === SplitterSecondaryDirection.Up
      ? Direction.Up
      : Direction.Down;

  const duplicate: ManaBall = {
    ...mana,
    id: nextManaId(),
    direction: secondaryDir,
    canSplit: false,
  };

  return {
    board,
    manaList: [original, duplicate],
  };
};

/**
 * Обработчик руны "Ускоритель" - установка speed = 2.
 */
const acceleratorRuneEffect: RuneEffectHandler = ({ board, mana }) => {
  // Если уже ускорен, оставляем как есть
  if (mana.speed === 2) {
    return {
      board,
      manaList: [mana],
    };
  }

  const updatedMana: ManaBall = {
    ...mana,
    speed: 2,
  };

  return {
    board,
    manaList: [updatedMana],
  };
};

/**
 * Обработчик руны "Отвод в ловушку" - уничтожение шарика и увеличение sentDirtyMana.
 */
const trapOutRuneEffect: RuneEffectHandler = ({ board, mana }) => {
  let extraDirty = 0;

  if (!mana.isDirty) {
    switch (mana.color) {
      case ManaColor.White:
        extraDirty = 1;
        break;
      case ManaColor.Red:
        extraDirty = 2;
        break;
      case ManaColor.Black:
        extraDirty = 0; // чёрная через отвод не порождает эффект
        break;
      default:
        extraDirty = 1;
        break;
    }
  } else {
    // Грязная мана, попавшая в отвод:
    // "если грязный шарик теряется или уходит в ловушку → ничего не происходит"
    extraDirty = 0;
  }

  const updatedBoard: BoardState = {
    ...board,
    sentDirtyMana: board.sentDirtyMana + extraDirty,
  };

  // Шарик исчезает
  return {
    board: updatedBoard,
    manaList: [],
  };
};

/**
 * Реестр обработчиков рун.
 */
export const runeEffectsRegistry: RuneEffectsRegistry = {
  [RuneType.Arrow]: arrowRuneEffect,
  [RuneType.Mirror]: mirrorRuneEffect,
  [RuneType.Splitter]: splitterRuneEffect,
  [RuneType.Accelerator]: acceleratorRuneEffect,
  [RuneType.TrapOut]: trapOutRuneEffect,
};
