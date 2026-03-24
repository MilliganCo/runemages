import React from "react";
import {
  RuneType,
  Direction,
  MirrorOrientation,
  SplitterSecondaryDirection,
} from "../../game";

export type SelectedRuneConfig =
  | { type: RuneType.Arrow; direction: Direction }
  | { type: RuneType.Mirror; orientation: MirrorOrientation }
  | { type: RuneType.Splitter; secondaryDirection: SplitterSecondaryDirection }
  | { type: RuneType.Accelerator }
  | { type: RuneType.TrapOut };

interface RunePaletteProps {
  selected: SelectedRuneConfig | null;
  onChangeSelected: (cfg: SelectedRuneConfig | null) => void;
}

export const RunePalette: React.FC<RunePaletteProps> = ({
  selected,
  onChangeSelected,
}) => {
  const isSelectedType = (type: RuneType) => selected?.type === type;

  const handleSelectArrow = (direction: Direction) => {
    onChangeSelected({ type: RuneType.Arrow, direction });
  };

  const handleSelectMirror = (orientation: MirrorOrientation) => {
    onChangeSelected({ type: RuneType.Mirror, orientation });
  };

  const handleSelectSplitter = (secondaryDirection: SplitterSecondaryDirection) => {
    onChangeSelected({ type: RuneType.Splitter, secondaryDirection });
  };

  const handleSelectAccelerator = () => {
    onChangeSelected({ type: RuneType.Accelerator });
  };

  const handleSelectTrap = () => {
    onChangeSelected({ type: RuneType.TrapOut });
  };

  const handleClear = () => {
    onChangeSelected(null);
  };

  return (
    <div className="rm-rune-palette">
      <h3>Rune Palette (Player 1 build)</h3>
      <div className="rm-rune-group">
        <span className="rm-rune-group-label">Arrow:</span>
        <button
          className={
            "rm-btn " +
            (selected?.type === RuneType.Arrow &&
            (selected as any).direction === Direction.Up
              ? "rm-btn-active"
              : "")
          }
          onClick={() => handleSelectArrow(Direction.Up)}
        >
          ↑
        </button>
        <button
          className={
            "rm-btn " +
            (selected?.type === RuneType.Arrow &&
            (selected as any).direction === Direction.Right
              ? "rm-btn-active"
              : "")
          }
          onClick={() => handleSelectArrow(Direction.Right)}
        >
          →
        </button>
        <button
          className={
            "rm-btn " +
            (selected?.type === RuneType.Arrow &&
            (selected as any).direction === Direction.Down
              ? "rm-btn-active"
              : "")
          }
          onClick={() => handleSelectArrow(Direction.Down)}
        >
          ↓
        </button>
        <button
          className={
            "rm-btn " +
            (selected?.type === RuneType.Arrow &&
            (selected as any).direction === Direction.Left
              ? "rm-btn-active"
              : "")
          }
          onClick={() => handleSelectArrow(Direction.Left)}
        >
          ←
        </button>
      </div>
      <div className="rm-rune-group">
        <span className="rm-rune-group-label">Mirror:</span>
        <button
          className={
            "rm-btn " +
            (selected?.type === RuneType.Mirror &&
            (selected as any).orientation === MirrorOrientation.Slash
              ? "rm-btn-active"
              : "")
          }
          onClick={() => handleSelectMirror(MirrorOrientation.Slash)}
        >
          /
        </button>
        <button
          className={
            "rm-btn " +
            (selected?.type === RuneType.Mirror &&
            (selected as any).orientation === MirrorOrientation.Backslash
              ? "rm-btn-active"
              : "")
          }
          onClick={() => handleSelectMirror(MirrorOrientation.Backslash)}
        >
          \
        </button>
      </div>
      <div className="rm-rune-group">
        <span className="rm-rune-group-label">Splitter:</span>
        <button
          className={
            "rm-btn " +
            (selected?.type === RuneType.Splitter &&
            (selected as any).secondaryDirection ===
              SplitterSecondaryDirection.Up
              ? "rm-btn-active"
              : "")
          }
          onClick={() => handleSelectSplitter(SplitterSecondaryDirection.Up)}
        >
          Y↑
        </button>
        <button
          className={
            "rm-btn " +
            (selected?.type === RuneType.Splitter &&
            (selected as any).secondaryDirection ===
              SplitterSecondaryDirection.Down
              ? "rm-btn-active"
              : "")
          }
          onClick={() => handleSelectSplitter(SplitterSecondaryDirection.Down)}
        >
          Y↓
        </button>
      </div>
      <div className="rm-rune-group">
        <span className="rm-rune-group-label">Other:</span>
        <button
          className={
            "rm-btn " +
            (isSelectedType(RuneType.Accelerator) ? "rm-btn-active" : "")
          }
          onClick={handleSelectAccelerator}
        >
          Accel
        </button>
        <button
          className={
            "rm-btn " + (isSelectedType(RuneType.TrapOut) ? "rm-btn-active" : "")
          }
          onClick={handleSelectTrap}
        >
          Trap ☠
        </button>
        <button className="rm-btn" onClick={handleClear}>
          Clear selection
        </button>
      </div>
    </div>
  );
};

