import {
  BoardState,
  Rune,
  CellPos,
  RuneType,
} from "./types";
import {
  MAX_RUNE_ARROWS,
  MAX_RUNE_MIRRORS,
  MAX_RUNE_SPLITTERS,
  MAX_RUNE_ACCELERATORS,
  MAX_RUNE_TRAPS,
} from "./constants";
import { positionsEqual } from "./board";

/**
 * Заменить/добавить руну в указанной позиции.
 * Если в клетке уже есть руна — она удаляется.
 */
export function placeRune(board: BoardState, rune: Rune): BoardState {
  const filteredRunes = board.runes.filter(
    (r) => !positionsEqual(r.position, rune.position)
  );

  return {
    ...board,
    runes: [...filteredRunes, rune],
  };
}

/**
 * Удалить руну в указанной позиции (если есть).
 */
export function removeRuneAt(board: BoardState, pos: CellPos): BoardState {
  const filteredRunes = board.runes.filter(
    (r) => !positionsEqual(r.position, pos)
  );

  return {
    ...board,
    runes: filteredRunes,
  };
}

/**
 * Получить лимит для типа руны.
 */
function getLimitForRuneType(type: RuneType): number | null {
  switch (type) {
    case RuneType.Arrow:
      return MAX_RUNE_ARROWS;
    case RuneType.Mirror:
      return MAX_RUNE_MIRRORS;
    case RuneType.Splitter:
      return MAX_RUNE_SPLITTERS;
    case RuneType.Accelerator:
      return MAX_RUNE_ACCELERATORS;
    case RuneType.TrapOut:
      return MAX_RUNE_TRAPS;
    default:
      return null;
  }
}

/**
 * Подсчитать количество рун каждого типа на доске.
 */
export function countRunesByType(board: BoardState): Record<RuneType, number> {
  const result: Record<RuneType, number> = {
    [RuneType.Arrow]: 0,
    [RuneType.Mirror]: 0,
    [RuneType.Splitter]: 0,
    [RuneType.Accelerator]: 0,
    [RuneType.TrapOut]: 0,
  };

  for (const r of board.runes) {
    result[r.type] = (result[r.type] ?? 0) + 1;
  }

  return result;
}

/**
 * Проверить, можно ли поставить руну с учётом лимитов.
 */
export function canPlaceRuneWithLimits(
  board: BoardState,
  rune: Rune
): boolean {
  const limit = getLimitForRuneType(rune.type);
  if (limit == null) {
    return true;
  }

  const existingAtCell = board.runes.find((r) =>
    positionsEqual(r.position, rune.position)
  );

  const currentCount = board.runes.filter((r) => r.type === rune.type).length;

  // Если в клетке уже есть руна того же типа — по сути мы обновляем её, не увеличивая количество
  const delta =
    existingAtCell && existingAtCell.type === rune.type ? 0 : 1;

  const newCount = currentCount + delta;

  return newCount <= limit;
}

/**
 * Поставить руну на доску с проверкой лимитов.
 * Если лимит превышен — возвращает исходную доску без изменений.
 */
export function placeRuneWithLimits(
  board: BoardState,
  rune: Rune
): BoardState {
  if (!canPlaceRuneWithLimits(board, rune)) {
    // Превышен лимит — возвращаем доску без изменений
    return board;
  }

  return placeRune(board, rune);
}

