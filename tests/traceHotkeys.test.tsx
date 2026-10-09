// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useTraceHotkeys, UseTraceHotkeysOptions } from '../src/hooks/useTraceHotkeys';

// Test harness component
const TestComponent: React.FC<UseTraceHotkeysOptions> = (props) => {
  useTraceHotkeys(props);
  return <div data-testid="hotkey-receiver">Receiver</div>;
};

describe('useTraceHotkeys (Perfection 8)', () => {
  it('dispatches onStepForward on ArrowRight when not focused on input', async () => {
    const onStepForward = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<TestComponent onStepForward={onStepForward} />);
    });

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true });
    window.dispatchEvent(event);

    expect(onStepForward).toHaveBeenCalledTimes(1);

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('dispatches onStepBackward on ArrowLeft', async () => {
    const onStepBackward = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<TestComponent onStepBackward={onStepBackward} />);
    });

    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft', cancelable: true });
    window.dispatchEvent(event);

    expect(onStepBackward).toHaveBeenCalledTimes(1);

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('toggles play/pause on Space key', async () => {
    const onPlay = vi.fn();
    const onPause = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    // 1. When paused, Space calls onPlay
    await act(async () => {
      root.render(<TestComponent isPlaying={false} onPlay={onPlay} onPause={onPause} />);
    });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', cancelable: true }));
    expect(onPlay).toHaveBeenCalledTimes(1);
    expect(onPause).not.toHaveBeenCalled();

    // 2. When playing, Space calls onPause
    await act(async () => {
      root.render(<TestComponent isPlaying={true} onPlay={onPlay} onPause={onPause} />);
    });
    window.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', cancelable: true }));
    expect(onPause).toHaveBeenCalledTimes(1);

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('ignores hotkeys when typing inside an input element', async () => {
    const onStepForward = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(<TestComponent onStepForward={onStepForward} />);
    });

    const input = document.createElement('input');
    document.body.appendChild(input);

    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true });
    Object.defineProperty(event, 'target', { value: input });
    window.dispatchEvent(event);

    expect(onStepForward).not.toHaveBeenCalled();

    input.remove();
    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
