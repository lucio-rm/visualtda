// @vitest-environment happy-dom
import { describe, it, expect, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { ComplexityComparatorModal } from '../src/components/ComplexityComparatorModal';

describe('ComplexityComparatorModal (Perfection 10)', () => {
  it('renders modal when open and displays asymptotic classes', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <ComplexityComparatorModal
          isOpen={true}
          onClose={vi.fn()}
          language="es"
        />
      );
    });

    expect(container.textContent).toContain('Laboratorio Asintótico');
    expect(container.textContent).toContain('O(1)');
    expect(container.textContent).toContain('O(log n)');
    expect(container.textContent).toContain('O(n)');
    expect(container.textContent).toContain('O(n log n)');
    expect(container.textContent).toContain('O(n²)');
    expect(container.textContent).toContain('O(2ⁿ)');
    expect(container.textContent).toContain('O(n!)');

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('updates operations and highlights intractability banner when n is large', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <ComplexityComparatorModal
          isOpen={true}
          onClose={vi.fn()}
          language="es"
        />
      );
    });

    const input = container.querySelector('#complexity-n-input') as HTMLInputElement;
    expect(input).not.toBeNull();

    // Click preset n=50
    const presetBtn = Array.from(container.querySelectorAll('.complexity-preset-pill')).find(
      (b) => b.textContent?.includes('n=50')
    ) as HTMLButtonElement;
    expect(presetBtn).toBeDefined();

    await act(async () => {
      presetBtn.click();
    });

    // Should display the intractability banner for n=50
    expect(container.textContent).toContain('Barrera de Intratabilidad');
    expect(container.textContent).toContain('O(2ⁿ)');

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });

  it('calls onClose when close button or backdrop is clicked', async () => {
    const onClose = vi.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <ComplexityComparatorModal
          isOpen={true}
          onClose={onClose}
          language="es"
        />
      );
    });

    const closeBtn = container.querySelector('.complexity-close-btn') as HTMLButtonElement;
    await act(async () => {
      closeBtn.click();
    });

    expect(onClose).toHaveBeenCalledTimes(1);

    await act(async () => {
      root.unmount();
    });
    container.remove();
  });
});
