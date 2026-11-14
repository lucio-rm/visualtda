import React, { useState, useRef, useMemo } from 'react';
import { playStepPitch } from '../utils/audioFeedback';
import './TraceScrubber.css';

export interface TraceScrubberProps {
  currentStepIndex: number;
  totalSteps: number;
  onSeek: (stepIndex: number) => void;
  getStepLabel?: (stepIndex: number) => string | undefined;
  language?: 'es' | 'en';
  ariaLabel?: string;
  showCounter?: boolean;
  id?: string;
}

export const TraceScrubber: React.FC<TraceScrubberProps> = ({
  currentStepIndex,
  totalSteps,
  onSeek,
  getStepLabel,
  language = 'es',
  ariaLabel,
  showCounter = true,
  id
}) => {
  const [hoverStep, setHoverStep] = useState<number | null>(null);
  const [hoverXPercent, setHoverXPercent] = useState<number>(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const safeTotal = Math.max(1, totalSteps);
  const progressPercent = totalSteps > 1 ? (currentStepIndex / (totalSteps - 1)) * 100 : 100;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current || totalSteps <= 1) return;
    const rect = trackRef.current.getBoundingClientRect();
    const mouseX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const ratio = mouseX / rect.width;
    const targetStep = Math.round(ratio * (totalSteps - 1));
    setHoverStep(targetStep);
    setHoverXPercent(ratio * 100);
  };

  const handleMouseLeave = () => {
    setHoverStep(null);
  };

  // Generate milestone keyframe ticks (at most 7 evenly spaced marks)
  const keyframeIndices = useMemo(() => {
    if (totalSteps <= 1) return [0];
    if (totalSteps <= 7) return Array.from({ length: totalSteps }, (_, i) => i);
    const stepInterval = (totalSteps - 1) / 6;
    return [
      0,
      Math.round(stepInterval),
      Math.round(stepInterval * 2),
      Math.round(stepInterval * 3),
      Math.round(stepInterval * 4),
      Math.round(stepInterval * 5),
      totalSteps - 1
    ];
  }, [totalSteps]);

  const activeLabel = hoverStep !== null && getStepLabel ? getStepLabel(hoverStep) : undefined;

  return (
    <div
      className="trace-scrubber-container"
      role="region"
      aria-label={ariaLabel || (language === 'es' ? 'Línea de tiempo de la traza' : 'Trace timeline scrubber')}
    >
      <div
        ref={trackRef}
        className="trace-scrubber-track-wrap"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Floating Hover Tooltip */}
        {hoverStep !== null && (
          <div
            className="trace-scrubber-tooltip"
            style={{ left: `${hoverXPercent}%` }}
            role="tooltip"
          >
            <span className="tooltip-step-num">
              {language === 'es' ? `Paso ${hoverStep + 1}` : `Step ${hoverStep + 1}`}
            </span>
            {activeLabel && <span className="tooltip-step-desc">{activeLabel}</span>}
          </div>
        )}

        {/* Milestone Keyframe Ticks */}
        <div className="trace-scrubber-ticks" aria-hidden="true">
          {keyframeIndices.map((idx) => {
            const pct = (idx / (safeTotal - 1)) * 100;
            const isPassed = idx <= currentStepIndex;
            return (
              <div
                key={`tick-${idx}`}
                className={`scrubber-tick ${isPassed ? 'tick-passed' : ''} ${idx === currentStepIndex ? 'tick-current' : ''}`}
                style={{ left: `${pct}%` }}
              />
            );
          })}
        </div>

        {/* Real Range Input */}
        <input
          id={id}
          type="range"
          min={0}
          max={totalSteps > 0 ? totalSteps - 1 : 0}
          value={currentStepIndex}
          onChange={(e) => {
            const val = Number(e.target.value);
            onSeek(val);
            playStepPitch(val, totalSteps);
          }}
          className="trace-scrubber-input scrubber-slider timeline-slider timeline-progress-bar"
          aria-label={ariaLabel || (language === 'es' ? 'Deslizador de pasos de la traza' : 'Trace step slider')}
          aria-valuenow={currentStepIndex + 1}
          aria-valuemin={1}
          aria-valuemax={totalSteps}
          aria-valuetext={
            language === 'es'
              ? `Paso ${currentStepIndex + 1} de ${totalSteps}`
              : `Step ${currentStepIndex + 1} of ${totalSteps}`
          }
          style={{
            background: `linear-gradient(to right, var(--accent) 0%, var(--accent) ${progressPercent}%, var(--border-strong) ${progressPercent}%, var(--border-strong) 100%)`
          }}
        />
      </div>

      {showCounter && (
        <div className="trace-scrubber-counter scrubber-label">
          <span className="scrubber-counter-current">{currentStepIndex + 1}</span>
          <span className="scrubber-counter-divider">/</span>
          <span className="scrubber-counter-total">{totalSteps}</span>
        </div>
      )}
    </div>
  );
};
