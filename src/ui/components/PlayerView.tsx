import React from "react";
import {
  PlayerMatchState,
  BOARD_ROWS,
  BOARD_COLS,
  WaveState,
  CellPos,
  GamePhase,
  TICKS_PER_SECOND,
} from "../../game";
import { BoardView } from "./BoardView";
import { ScorePanel } from "./ScorePanel";
import { RuneLimitsPanel } from "./RuneLimitsPanel";

interface PlayerViewProps {
  player: PlayerMatchState;
  index: 0 | 1;
  onCellClick?: (pos: CellPos) => void;
  isLocal?: boolean;
}

export const PlayerView: React.FC<PlayerViewProps> = ({
  player,
  index,
  onCellClick,
  isLocal = false,
}) => {
  const currentWave = player.waves[player.currentWaveIndex];

  let phaseLabel = "";
  let phaseTime = "";

  if (player.phase === GamePhase.Prep) {
    const secs = Math.ceil(player.prepPhaseTicksLeft / TICKS_PER_SECOND);
    phaseLabel = "Prep";
    phaseTime = `${secs}s left`;
  } else if (player.phase === GamePhase.Flow) {
    const secs = Math.ceil(player.flowPhaseTicksLeft / TICKS_PER_SECOND);
    phaseLabel = "Flow";
    phaseTime = `${secs}s left`;
  } else {
    phaseLabel = "Finished";
    phaseTime = "";
  }

  // Кулдаун редактирования (толкуется только для локального игрока)
  const editCooldownSecs = Math.ceil(
    player.editCooldownTicksLeft / TICKS_PER_SECOND
  );

  return (
    <div className="rm-player">
      <h2 className="rm-player-title">
        Player {index + 1}
        <span className="rm-player-phase">
          Wave {player.currentWaveIndex + 1} · Phase: {phaseLabel}
          {phaseTime ? ` (${phaseTime})` : ""}
          {isLocal && player.phase === GamePhase.Flow && (
            <>
              {" · "}
              {player.editCooldownTicksLeft === 0
                ? "Edit: ready"
                : `Edit in ${editCooldownSecs}s`}
            </>
          )}
        </span>
      </h2>
      <ScorePanel player={player} wave={currentWave} />
      <RuneLimitsPanel board={player.board} />
      <BoardView
        board={player.board}
        rows={BOARD_ROWS}
        cols={BOARD_COLS}
        onCellClick={onCellClick}
      />
    </div>
  );
};

