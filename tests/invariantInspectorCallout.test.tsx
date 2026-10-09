// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { InvariantInspectorCallout } from '../src/components/InvariantInspectorCallout';

describe('InvariantInspectorCallout Component', () => {
  it('renders invariant formula with math typography and step counter', () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(
        <InvariantInspectorCallout
          title={{ es: 'Invariante DP', en: 'DP Invariant' }}
          invariantFormula="OPT(j) = \max(v_j + OPT(p(j)), OPT(j-1))"
          explanation={{
            es: 'Explicación del invariante inductivo.',
            en: 'Inductive invariant explanation.'
          }}
          currentStep={2}
          totalSteps={8}
          language="es"
        />
      );
    });

    expect(container.textContent).toContain('Invariante DP');
    expect(container.textContent).toContain('Paso 3 de 8');
    expect(container.textContent).toContain('OPT(j)');
    expect(container.textContent).toContain('Explicación del invariante inductivo.');

    // Test collapse toggle
    const toggleBtn = container.querySelector('.invariant-toggle-btn') as HTMLButtonElement;
    expect(toggleBtn).toBeDefined();

    act(() => {
      toggleBtn.click();
    });

    // When collapsed, explanation body should be hidden
    expect(container.querySelector('.invariant-callout-body')).toBeNull();

    act(() => {
      toggleBtn.click();
    });

    // When expanded again, explanation body should be visible
    expect(container.querySelector('.invariant-callout-body')).not.toBeNull();
  });
});
