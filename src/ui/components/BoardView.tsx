import React from "react";
import {
  BoardState,
  CellPos,
  RuneType,
  ManaBall,
  Rune,
  ManaColor,
} from "../../game";

interface BoardViewProps {
  board: BoardState;
  rows: number;
  cols: number;
  onCellClick?: (pos: CellPos) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
  board,
  rows,
  cols,
  onCellClick,
}) => {
  const cells: JSX.Element[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const pos: CellPos = { row, col };

      const rune = board.runes.find(
        (r) => r.position.row === row && r.position.col === col
      );

      const manaHere = board.mana.filter(
        (m) => m.position.row === row && m.position.col === col
      );

      cells.push(
        <CellView
          key={`${row}-${col}`}
          pos={pos}
          rune={rune}
          mana={manaHere}
          onClick={onCellClick}
        />
      );
    }
  }

  return (
    <div
      className="rm-board"
      style={{
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
      }}
    >
      {cells}
    </div>
  );
};

interface CellViewProps {
  pos: CellPos;
  rune?: Rune;
  mana: ManaBall[];
  onClick?: (pos: CellPos) => void;
}

const CellView: React.FC<CellViewProps> = ({ pos, rune, mana, onClick }) => {
  const handleClick = () => {
    onClick?.(pos);
  };

  let runeLabel = "";
  if (rune) {
    switch (rune.type) {
      case RuneType.Arrow: {
        const arrow = rune as any;
        switch (arrow.direction) {
          case "up":
            runeLabel = "↑";
            break;
          case "right":
            runeLabel = "→";
            break;
          case "down":
            runeLabel = "↓";
            break;
          case "left":
            runeLabel = "←";
            break;
          default:
            runeLabel = "→";
        }
        break;
      }
      case RuneType.Mirror: {
        const mirror = rune as any;
        runeLabel = mirror.orientation === "slash" ? "/" : "\\";
        break;
      }
      case RuneType.Splitter:
        runeLabel = "Y";
        break;
      case RuneType.Accelerator:
        runeLabel = ">>";
        break;
      case RuneType.TrapOut:
        runeLabel = "☠";
        break;
      default:
        runeLabel = "?";
    }
  }

  const manaCount = mana.length;
  let manaClass = "";

  if (manaCount > 0) {
    const hasDirty = mana.some((m) => m.isDirty);
    if (hasDirty) {
      manaClass = "rm-cell-mana rm-cell-mana-dirty";
    } else {
      const main = mana[0]; // любой чистый шарик
      switch (main.color) {
        case ManaColor.Red:
          manaClass = "rm-cell-mana rm-cell-mana-red";
          break;
        case ManaColor.Black:
          manaClass = "rm-cell-mana rm-cell-mana-black";
          break;
        case ManaColor.White:
        default:
          manaClass = "rm-cell-mana rm-cell-mana-white";
          break;
      }
    }
  }

  return (
    <div className="rm-cell" onClick={handleClick}>
      {rune && <div className="rm-cell-rune">{runeLabel}</div>}
      {manaCount > 0 && (
        <div className={manaClass}>
          {manaCount > 1 ? manaCount : "●"}
        </div>
      )}
    </div>
  );
};

