import React from "react";

interface ControlsPanelProps {
  isRunning: boolean;
  isMatchFinished: boolean;
  onStart: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
}

export const ControlsPanel: React.FC<ControlsPanelProps> = ({
  isRunning,
  isMatchFinished,
  onStart,
  onPause,
  onStep,
  onReset,
}) => {
  return (
    <div className="rm-controls">
      <button
        className="rm-btn"
        onClick={onStart}
        disabled={isRunning || isMatchFinished}
      >
        Start
      </button>
      <button className="rm-btn" onClick={onPause} disabled={!isRunning}>
        Pause
      </button>
      <button
        className="rm-btn"
        onClick={onStep}
        disabled={isRunning || isMatchFinished}
      >
        Step
      </button>
      <button className="rm-btn" onClick={onReset}>
        Reset
      </button>
      {isMatchFinished && (
        <span className="rm-match-finished">Match finished</span>
      )}
    </div>
  );
};

