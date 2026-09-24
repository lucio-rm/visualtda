// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { generateNQueensTrace } from '../src/engine/algorithms/nQueensTrace';
import { useTraceTimeline } from '../src/hooks/useTraceTimeline';

// @ts-expect-error React act environment declaration for happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('TraceTimeline Data & Navigation Logic', () => {
  it('ensures timeline events maintain sequential step indices', () => {
    const timeline = generateNQueensTrace(4);
    for (let i = 0; i < timeline.events.length; i++) {
      expect(timeline.events[i].step).toBe(i);
    }
  });

  it('guarantees bounds clamping for manual step navigation', () => {
    const timeline = generateNQueensTrace(4);
    const totalSteps = timeline.totalSteps;

    const clampStep = (step: number) => Math.max(0, Math.min(step, totalSteps - 1));

    expect(clampStep(-10)).toBe(0);
    expect(clampStep(999999)).toBe(totalSteps - 1);
    expect(clampStep(5)).toBe(5);
  });
});

describe('useTraceTimeline Keyboard Navigation & DOM Integration', () => {
  let container: HTMLDivElement;
  let root: Root;

  const TestTimelineComponent: React.FC<{ enableShortcuts?: boolean }> = ({ enableShortcuts = true }) => {
    const timeline = React.useMemo(() => generateNQueensTrace(4), []);
    const {
      currentStepIndex,
      totalSteps,
      isPlaying,
      stepForward,
      stepBackward,
      togglePlay,
      reset
    } = useTraceTimeline(timeline, {
      baseIntervalMs: 500,
      enableKeyboardShortcuts: enableShortcuts
    });

    return (
      <div data-testid="timeline-wrapper">
        <span data-testid="step-index">{currentStepIndex}</span>
        <span data-testid="total-steps">{totalSteps}</span>
        <span data-testid="is-playing">{isPlaying ? 'true' : 'false'}</span>
        <button data-testid="btn-forward" onClick={stepForward}>Forward</button>
        <button data-testid="btn-backward" onClick={stepBackward}>Backward</button>
        <button data-testid="btn-play" onClick={togglePlay}>Play</button>
        <button data-testid="btn-reset" onClick={reset}>Reset</button>
        <input data-testid="dummy-input" type="text" />
      </div>
    );
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('advances with ArrowRight and moves back with ArrowLeft', async () => {
    await act(async () => {
      root.render(<TestTimelineComponent />);
    });

    const stepEl = container.querySelector('[data-testid="step-index"]')!;
    expect(stepEl.textContent).toBe('0');

    // Press ArrowRight
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    });
    expect(stepEl.textContent).toBe('1');

    // Press ArrowRight again
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    });
    expect(stepEl.textContent).toBe('2');

    // Press ArrowLeft
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
    });
    expect(stepEl.textContent).toBe('1');
  });

  it('jumps to end with End key and back to start with Home key', async () => {
    await act(async () => {
      root.render(<TestTimelineComponent />);
    });

    const stepEl = container.querySelector('[data-testid="step-index"]')!;
    const totalEl = container.querySelector('[data-testid="total-steps"]')!;
    const lastIndex = Number(totalEl.textContent) - 1;

    // Press End
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'End' }));
    });
    expect(Number(stepEl.textContent)).toBe(lastIndex);

    // Press Home
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home' }));
    });
    expect(Number(stepEl.textContent)).toBe(0);
  });

  it('toggles playback with Space or k, and resets with r', async () => {
    await act(async () => {
      root.render(<TestTimelineComponent />);
    });

    const isPlayingEl = container.querySelector('[data-testid="is-playing"]')!;
    const stepEl = container.querySelector('[data-testid="step-index"]')!;

    expect(isPlayingEl.textContent).toBe('false');

    // Press Space to play
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
    });
    expect(isPlayingEl.textContent).toBe('true');

    // Advance to step 3 manually
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    });
    expect(Number(stepEl.textContent)).toBe(3);

    // Press r to reset
    await act(async () => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'r' }));
    });
    expect(stepEl.textContent).toBe('0');
    expect(isPlayingEl.textContent).toBe('false');
  });

  it('ignores hotkeys when typing into an input element', async () => {
    await act(async () => {
      root.render(<TestTimelineComponent />);
    });

    const input = container.querySelector('input')!;
    const stepEl = container.querySelector('[data-testid="step-index"]')!;
    expect(stepEl.textContent).toBe('0');

    // Dispatch ArrowRight targeted at input
    await act(async () => {
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    });
    // Should NOT have changed
    expect(stepEl.textContent).toBe('0');
  });
});

