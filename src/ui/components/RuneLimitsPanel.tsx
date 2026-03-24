import React from "react";
import {
  BoardState,
  RuneType,
  countRunesByType,
  MAX_RUNE_ARROWS,
  MAX_RUNE_MIRRORS,
  MAX_RUNE_SPLITTERS,
  MAX_RUNE_ACCELERATORS,
  MAX_RUNE_TRAPS,
} from "../../game";

interface RuneLimitsPanelProps {
  board: BoardState;
}

export const RuneLimitsPanel: React.FC<RuneLimitsPanelProps> = ({ board }) => {
  const counts = countRunesByType(board);

  const items: {
    label: string;
    type: RuneType;
    used: number;
    max: number;
  }[] = [
    {
      label: "Arrow",
      type: RuneType.Arrow,
      used: counts[RuneType.Arrow] ?? 0,
      max: MAX_RUNE_ARROWS,
    },
    {
      label: "Mirror",
      type: RuneType.Mirror,
      used: counts[RuneType.Mirror] ?? 0,
      max: MAX_RUNE_MIRRORS,
    },
    {
      label: "Splitter",
      type: RuneType.Splitter,
      used: counts[RuneType.Splitter] ?? 0,
      max: MAX_RUNE_SPLITTERS,
    },
    {
      label: "Accel",
      type: RuneType.Accelerator,
      used: counts[RuneType.Accelerator] ?? 0,
      max: MAX_RUNE_ACCELERATORS,
    },
    {
      label: "Trap",
      type: RuneType.TrapOut,
      used: counts[RuneType.TrapOut] ?? 0,
      max: MAX_RUNE_TRAPS,
    },
  ];

  return (
    <div className="rm-rune-limits">
      <div className="rm-rune-limits-title">Rune limits (current wave)</div>
      <div className="rm-rune-limits-list">
        {items.map((item) => {
          const remaining = item.max - item.used;
          const exhausted = remaining <= 0;
          return (
            <div
              key={item.label}
              className={
                "rm-rune-limits-item" +
                (exhausted ? " rm-rune-limits-item-exhausted" : "")
              }
            >
              <span className="rm-rune-limits-label">{item.label}</span>
              <span className="rm-rune-limits-value">
                {item.used} / {item.max}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

