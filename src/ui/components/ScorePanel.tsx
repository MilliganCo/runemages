import React from "react";
import { PlayerMatchState, WaveState } from "../../game";

interface ScorePanelProps {
  player: PlayerMatchState;
  wave: WaveState;
}

export const ScorePanel: React.FC<ScorePanelProps> = ({ player, wave }) => {
  return (
    <div className="rm-score-panel">
      <div>Total score: {player.totalScore}</div>
      <div>
        Wave score: {wave.scoreDelta} (clean score: {wave.pureCollected}, dirty
        balls: {wave.dirtyCollected})
      </div>
      <div>
        Sent dirty this wave: {wave.sentDirty} | Incoming dirty:{" "}
        {wave.config.incomingDirtyMana}
      </div>
    </div>
  );
};

