// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import React from 'react';
import { GraphColoringPlayground } from '../src/components/visualizers/GraphColoringPlayground';
import { ReductionIsVcPlayground } from '../src/components/visualizers/ReductionIsVcPlayground';
import { ClosestPairPlayground } from '../src/components/visualizers/ClosestPairPlayground';
import { HamiltonianCyclePlayground } from '../src/components/visualizers/HamiltonianCyclePlayground';
import { LanguageProvider } from '../src/i18n/LanguageContext';
import { StudentProgressProvider } from '../src/context/StudentProgressContext';

// @ts-expect-error React act environment declaration for happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('Playground Drag vs Click Movement Threshold (5px) Verification', () => {
  let container: HTMLDivElement;
  let root: Root;

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
    document.body.innerHTML = '';
  });

  const renderWithProviders = async (ui: React.ReactElement) => {
    await act(async () => {
      root.render(
        <LanguageProvider>
          <StudentProgressProvider>
            {ui}
          </StudentProgressProvider>
        </LanguageProvider>
      );
    });
  };

  it('GraphColoring: clicking vertex without movement changes color, dragging >5px suppresses click', async () => {
    await renderWithProviders(<GraphColoringPlayground />);

    const vertexG = container.querySelector('.gc-vertices-layer g');
    expect(vertexG).not.toBeNull();
    const circle = vertexG?.querySelector('circle');
    const initialFill = circle?.getAttribute('fill');

    // Case 1: Plain click (no pointer move)
    await act(async () => {
      vertexG?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    const afterClickFill = circle?.getAttribute('fill');
    expect(afterClickFill).not.toBe(initialFill); // Color changed to color 1 (red)

    // Case 2: Pointer down, drag > 5px, pointer up, click
    const prevFill = circle?.getAttribute('fill');
    const svg = container.querySelector('svg');
    await act(async () => {
      vertexG?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 100, clientY: 100 }));
    });
    await act(async () => {
      svg?.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 120, clientY: 120 }));
    });
    await act(async () => {
      svg?.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 120, clientY: 120 }));
      vertexG?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    // Fill should NOT have changed on click because it was dragged!
    expect(circle?.getAttribute('fill')).toBe(prevFill);
  });

  it('ReductionIsVc: dragging a vertex >5px does not toggle its selection', async () => {
    await renderWithProviders(<ReductionIsVcPlayground />);

    const vertexG = container.querySelector('svg g g[style*="cursor"]');
    expect(vertexG).not.toBeNull();

    // The selection indicator circle has stroke: var(--accent) when in VC (not selected in IS)
    const selectionRing = vertexG?.querySelector('circle[r="28"]');
    expect(selectionRing?.getAttribute('stroke')).toBe('var(--accent)');

    // Plain click selects it into Independent Set (stroke becomes var(--success))
    await act(async () => {
      vertexG?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(selectionRing?.getAttribute('stroke')).toBe('var(--success)');

    // Dragging > 5px and clicking does NOT deselect it
    const svg = container.querySelector('svg');
    await act(async () => {
      vertexG?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 50, clientY: 50 }));
    });
    await act(async () => {
      svg?.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 75, clientY: 75 }));
    });
    await act(async () => {
      svg?.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 75, clientY: 75 }));
      vertexG?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    // Still selected in IS because click was suppressed by movement threshold
    expect(selectionRing?.getAttribute('stroke')).toBe('var(--success)');
  });

  it('ClosestPair: dragging a point does not create a new point on mouseUp/click', async () => {
    await renderWithProviders(<ClosestPairPlayground />);

    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();

    // Default points is 8
    const totalPointsText = container.querySelector('.sdk-pg-controls strong');
    expect(totalPointsText?.textContent).toBe('8');

    const firstPoint = container.querySelector('svg g[style*="cursor"]');
    expect(firstPoint).not.toBeNull();

    // Drag point > 5px
    await act(async () => {
      firstPoint?.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, clientX: 50, clientY: 50 }));
    });
    await act(async () => {
      svg?.dispatchEvent(new MouseEvent('mousemove', { bubbles: true, clientX: 80, clientY: 80 }));
    });
    await act(async () => {
      container.querySelector('.closest-pair-playground')?.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      svg?.dispatchEvent(new MouseEvent('click', { bubbles: true, clientX: 80, clientY: 80 }));
    });

    // Total points should still be 8, no new point spawned
    expect(totalPointsText?.textContent).toBe('8');
  });

  it('HamiltonianCycle: dragging a selectable node does not add it to path', async () => {
    await renderWithProviders(<HamiltonianCyclePlayground />);

    const initialPathText = container.querySelector('.ham-cycle-card')?.textContent || '';

    // Node 1 is adjacent to 0 in default preset
    const node1 = container.querySelector('g[style*="cursor: pointer"]');
    expect(node1).not.toBeNull();

    const svg = container.querySelector('svg');
    await act(async () => {
      node1?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: 50, clientY: 50 }));
    });
    await act(async () => {
      svg?.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: 80, clientY: 80 }));
    });
    await act(async () => {
      svg?.dispatchEvent(new PointerEvent('pointerup', { bubbles: true, clientX: 80, clientY: 80 }));
      node1?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const newPathText = container.querySelector('.ham-cycle-card')?.textContent || '';
    expect(newPathText).toBe(initialPathText);
  });
});
