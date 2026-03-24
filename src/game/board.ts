import { CellPos, Direction } from "./types";
import { BOARD_ROWS, BOARD_COLS } from "./constants";

export function isInsideBoard(pos: CellPos): boolean {
  return (
    pos.row >= 0 &&
    pos.row < BOARD_ROWS &&
    pos.col >= 0 &&
    pos.col < BOARD_COLS
  );
}

export function positionsEqual(a: CellPos, b: CellPos): boolean {
  return a.row === b.row && a.col === b.col;
}

/**
 * Переместить позицию в заданном направлении на указанное расстояние.
 * @param pos Исходная позиция
 * @param dir Направление движения
 * @param distance Расстояние (по умолчанию 1)
 * @returns Новая позиция
 */
export function movePos(pos: CellPos, dir: Direction, distance = 1): CellPos {
  switch (dir) {
    case Direction.Up:
      return { row: pos.row - distance, col: pos.col };
    case Direction.Down:
      return { row: pos.row + distance, col: pos.col };
    case Direction.Left:
      return { row: pos.row, col: pos.col - distance };
    case Direction.Right:
      return { row: pos.row, col: pos.col + distance };
    default:
      return pos;
  }
}

