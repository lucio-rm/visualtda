// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { TraceScrubber } from '../src/components/TraceScrubber';

describe('TraceScrubber Timeline Keyframe Player', () => {
  it('renders progress, total steps, and triggers seek callbacks', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const onSeek = vi.fn();

    act(() => {
      root.render(
        <TraceScrubber
          currentStepIndex={2}
          totalSteps={10}
          onSeek={onSeek}
          getStepLabel={(step) => `Mensaje paso ${step}`}
          language="es"
        />
      );
    });

    const counter = container.querySelector('.trace-scrubber-counter');
    expect(counter?.textContent).toContain('3');
    expect(counter?.textContent).toContain('10');

    const input = container.querySelector('input[type="range"]') as HTMLInputElement;
    expect(input).toBeDefined();
    expect(input.value).toBe('2');

    // Simulate slider change
    act(() => {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        'value'
      )?.set;
      nativeInputValueSetter?.call(input, '5');
      input.dispatchEvent(new Event('change', { bubbles: true }));
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });

    expect(onSeek).toHaveBeenCalledWith(5);

    // Verify keyframe ticks rendered
    const ticks = container.querySelectorAll('.scrubber-tick');
    expect(ticks.length).toBeGreaterThan(0);

    root.unmount();
    document.body.removeChild(container);
  });
});
