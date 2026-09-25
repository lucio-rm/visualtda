// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { App } from '../src/app/App';
import { PythonExecutionService } from '../src/runtime/pythonExecutionService';

// Enable React act environment flag
// @ts-expect-error React act environment declaration for happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('Phase D: Browser / User Journey Integration Verification (15 Core Flows)', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem('visual_tda_lang', 'es');
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

  const getNQueensOpenBtn = (): HTMLButtonElement => {
    const cards = Array.from(container.querySelectorAll('.exercise-card'));
    const card = cards.find((c) => c.textContent?.includes('N-Reinas') || c.textContent?.includes('N-Queens'));
    if (card) {
      return card.querySelector('.btn-open-exercise') as HTMLButtonElement;
    }
    return container.querySelector('.exercise-card .btn-open-exercise') as HTMLButtonElement;
  };

  it('Flow 1: Application loads successfully with landmarks, header, and exercise catalog', async () => {
    await act(async () => {
      root.render(<App />);
    });

    // Skip to content accessibility landmark
    const skipLink = container.querySelector('.skip-to-content');
    expect(skipLink).not.toBeNull();
    expect(skipLink?.getAttribute('href')).toBe('#main-content');

    // Header and brand
    const header = container.querySelector('header.app-header');
    expect(header).not.toBeNull();
    expect(container.textContent).toContain('Visual TDA');

    // Main landmark and catalog title
    const main = container.querySelector('main#main-content');
    expect(main).not.toBeNull();
    expect(container.textContent).toContain('Categorías y Técnicas');

    // Exercise cards rendered
    const cards = container.querySelectorAll('.exercise-card');
    expect(cards.length).toBeGreaterThanOrEqual(8);
  });

  it('Flow 2: Category navigation filters catalog items correctly', async () => {
    await act(async () => {
      root.render(<App />);
    });

    const categoryButtons = Array.from(container.querySelectorAll('.category-tab')) as HTMLButtonElement[];
    expect(categoryButtons.length).toBeGreaterThan(0);

    // Find "Greedy" category tab
    const greedyBtn = categoryButtons.find((btn) => btn.textContent?.includes('Greedy') || btn.textContent?.includes('Greedy'));
    expect(greedyBtn).toBeDefined();

    await act(async () => {
      greedyBtn?.click();
    });

    // After filtering by greedy, only greedy exercises should appear
    const badges = Array.from(container.querySelectorAll('.badge-technique'));
    expect(badges.length).toBeGreaterThan(0);
    for (const badge of badges) {
      expect(badge.textContent?.toLowerCase()).toContain('greedy');
    }
  });

  it('Flow 3: Exercise selection transitions to ExerciseView', async () => {
    await act(async () => {
      root.render(<App />);
    });

    const openBtn = container.querySelector('.exercise-card .btn-open-exercise') as HTMLButtonElement;
    expect(openBtn).not.toBeNull();

    await act(async () => {
      openBtn.click();
    });

    // ExerciseView should be rendered
    const exerciseView = container.querySelector('.exercise-view-wrapper');
    expect(exerciseView).not.toBeNull();

    // Back to catalog button must exist
    const backBtn = container.querySelector('.btn-back');
    expect(backBtn).not.toBeNull();
  });

  it('Flow 4: Discover phase renders intuition and interactive playground', async () => {
    await act(async () => {
      root.render(<App />);
    });

    const openBtn = getNQueensOpenBtn();
    await act(async () => {
      openBtn.click();
    });

    // Active phase should be discover by default
    const discoverSection = container.querySelector('.discover-view');
    expect(discoverSection).not.toBeNull();

    // Playground box should be present
    const playground = container.querySelector('.nqueens-playground-box');
    expect(playground).not.toBeNull();

    // Action button to proceed to solve
    const proceedBtn = container.querySelector('.phase-footer-action .btn-primary');
    expect(proceedBtn).not.toBeNull();
  });

  it('Flow 5: Solve phase renders problem statement, hints, code editor, and run button', async () => {
    await act(async () => {
      root.render(<App />);
    });

    const openBtn = getNQueensOpenBtn();
    await act(async () => {
      openBtn.click();
    });

    // Click Solve tab in phase switcher
    const phaseButtons = Array.from(container.querySelectorAll('.phase-button')) as HTMLButtonElement[];
    expect(phaseButtons.length).toBe(3);

    await act(async () => {
      phaseButtons[1].click(); // Phase 2: Solve
    });

    const solveView = container.querySelector('.solve-view');
    expect(solveView).not.toBeNull();

    // Code textarea must be present
    const codeTextarea = container.querySelector('.code-editor-input') as HTMLTextAreaElement;
    expect(codeTextarea).not.toBeNull();
    expect(codeTextarea.value).toContain('def resolver_n_reinas');

    // Fast test execution button must be present
    const runBtn = container.querySelector('.btn-fast-tests') as HTMLButtonElement;
    expect(runBtn).not.toBeNull();
  });

  it('Flow 6: Understand phase unlocks via skip modal and displays canonical trace visualizer', async () => {
    await act(async () => {
      root.render(<App />);
    });

    const openBtn = getNQueensOpenBtn();
    await act(async () => {
      openBtn.click();
    });

    const phaseButtons = Array.from(container.querySelectorAll('.phase-button')) as HTMLButtonElement[];
    await act(async () => {
      phaseButtons[1].click(); // Go to Solve
    });

    // Click "Ver solución canónica"
    const skipBtn = container.querySelector('.skip-solution-card .btn-secondary') as HTMLButtonElement;
    expect(skipBtn).not.toBeNull();
    await act(async () => {
      skipBtn.click();
    });

    // Confirm skip modal appears
    const modal = container.querySelector('.modal-card');
    expect(modal).not.toBeNull();

    const confirmBtn = container.querySelector('.modal-actions .btn-primary') as HTMLButtonElement;
    expect(confirmBtn).not.toBeNull();
    await act(async () => {
      confirmBtn.click();
    });

    // Understand phase is now active
    const understandView = container.querySelector('.understand-view');
    expect(understandView).not.toBeNull();

    // Canonical solution, complexity metrics, and visualizer should be present
    expect(container.textContent).toContain('Solución en Python');
    expect(container.textContent).toContain('O(N!)');
    const visualizer = container.querySelector('.nqueens-visualizer-card');
    expect(visualizer).not.toBeNull();
  });

  it('Flow 7: Language switching dynamically toggles UI text between ES and EN', async () => {
    await act(async () => {
      root.render(<App />);
    });

    const langSelect = container.querySelector('.lang-select') as HTMLSelectElement;
    expect(langSelect).not.toBeNull();
    expect(container.textContent).toContain('Categorías y Técnicas');

    // Select English
    await act(async () => {
      langSelect.value = 'en';
      langSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(container.textContent).toContain('Categories and Techniques');

    // Select Spanish
    await act(async () => {
      langSelect.value = 'es';
      langSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(container.textContent).toContain('Categorías y Técnicas');
  });

  it('Flow 8: Theme switching toggles theme mode and updates localStorage', async () => {
    await act(async () => {
      root.render(<App />);
    });

    const themeSelect = container.querySelector('.theme-toggle-label .theme-select') as HTMLSelectElement;
    expect(themeSelect).not.toBeNull();

    // Switch to dark
    await act(async () => {
      themeSelect.value = 'dark';
      themeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(localStorage.getItem('visual_tda_theme')).toBe('dark');

    // Switch to light
    await act(async () => {
      themeSelect.value = 'light';
      themeSelect.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(localStorage.getItem('visual_tda_theme')).toBe('light');
  });

  it('Flow 9: Timeline controls support play, step next, step prev, and reset', async () => {
    await act(async () => {
      root.render(<App />);
    });

    const openBtn = getNQueensOpenBtn();
    await act(async () => {
      openBtn.click();
    });

    const phaseButtons = Array.from(container.querySelectorAll('.phase-button')) as HTMLButtonElement[];
    await act(async () => {
      phaseButtons[1].click(); // Solve
    });

    const skipBtn = container.querySelector('.skip-solution-card .btn-secondary') as HTMLButtonElement;
    await act(async () => {
      skipBtn.click();
    });
    const confirmBtn = container.querySelector('.modal-actions .btn-primary') as HTMLButtonElement;
    await act(async () => {
      confirmBtn.click();
    });

    // Timeline playback controls
    const nextBtn = container.querySelector('button[aria-label="Paso siguiente"]') as HTMLButtonElement;
    const prevBtn = container.querySelector('button[aria-label="Paso anterior"]') as HTMLButtonElement;
    const resetBtn = container.querySelector('button[aria-label="Reiniciar ejecución"]') as HTMLButtonElement;
    expect(nextBtn).not.toBeNull();
    expect(prevBtn).not.toBeNull();
    expect(resetBtn).not.toBeNull();

    // Scrubber
    const scrubber = container.querySelector('.scrubber-slider') as HTMLInputElement;
    expect(scrubber).not.toBeNull();
    expect(Number(scrubber.value)).toBe(0);

    // Step forward
    await act(async () => {
      nextBtn.click();
    });
    expect(Number(scrubber.value)).toBe(1);

    // Step backward
    await act(async () => {
      prevBtn.click();
    });
    expect(Number(scrubber.value)).toBe(0);

    // Step forward then reset
    await act(async () => {
      nextBtn.click();
      nextBtn.click();
      resetBtn.click();
    });
    expect(Number(scrubber.value)).toBe(0);
  });

  it('Flow 10: Progressive hints reveal sequentially without penalty', async () => {
    await act(async () => {
      root.render(<App />);
    });

    const openBtn = getNQueensOpenBtn();
    await act(async () => {
      openBtn.click();
    });
    const phaseButtons = Array.from(container.querySelectorAll('.phase-button')) as HTMLButtonElement[];
    await act(async () => {
      phaseButtons[1].click(); // Solve
    });

    // Hints section
    const hintsCard = container.querySelector('.hints-card');
    expect(hintsCard).not.toBeNull();

    // Unlock first hint
    const hintTrigger = container.querySelector('.btn-toggle-hint') as HTMLButtonElement;
    expect(hintTrigger).not.toBeNull();

    await act(async () => {
      hintTrigger.click();
    });

    const revealedContent = container.querySelector('.hint-content');
    expect(revealedContent).not.toBeNull();
  });

  it('Flow 11: In-browser test execution with mock python execution updates test feedback', async () => {
    const { runPythonTests } = await import('../src/runtime/pythonTestRunner');

    const mockService = {
      isSupported: true,
      isReady: () => true,
      initWorker: async () => true,
      executePython: async (_code: string, _fn: string, args: unknown[]) => {
        const n = args[0] as number;
        return {
          id: 'req-test',
          type: 'run_result' as const,
          success: true,
          result: n === 1 ? [[0]] : [[1, 3, 0, 2], [2, 0, 3, 1]],
          stdout: 'Tests ejecutados exitosamente.\n',
          executionTimeMs: 25
        };
      }
    } as unknown as PythonExecutionService;

    const result = await runPythonTests('n-queens', 'def resolver_n_reinas(n): pass', mockService);
    expect(result.passed).toBe(true);
    expect(result.totalPassed).toBe(result.totalTests);
    expect(result.stdout).toContain('Tests ejecutados exitosamente');
  });

  it('Flow 12: Runtime error handling reports Python syntax error with traceback', async () => {
    const { runPythonTests } = await import('../src/runtime/pythonTestRunner');

    const mockErrorService = {
      isSupported: true,
      isReady: () => true,
      initWorker: async () => true,
      executePython: async () => ({
        id: 'req-err',
        type: 'run_result' as const,
        success: false,
        error: 'SyntaxError: unexpected EOF while parsing',
        executionTimeMs: 5
      })
    } as unknown as PythonExecutionService;

    const result = await runPythonTests('n-queens', 'def broken(', mockErrorService);
    expect(result.passed).toBe(false);
    expect(result.runtimeError).toContain('SyntaxError');
  });

  it('Flow 13: Worker timeout handling reports infinite loop mitigation error', async () => {
    const { runPythonTests } = await import('../src/runtime/pythonTestRunner');

    const mockTimeoutService = {
      isSupported: true,
      isReady: () => true,
      initWorker: async () => true,
      executePython: async () => ({
        id: 'req-timeout',
        type: 'run_result' as const,
        success: false,
        error: 'Tiempo de ejecución excedido (5000 ms). Se canceló la ejecución para prevenir un bucle infinito.',
        executionTimeMs: 5000
      })
    } as unknown as PythonExecutionService;

    const result = await runPythonTests('n-queens', 'while True: pass', mockTimeoutService);
    expect(result.passed).toBe(false);
    expect(result.runtimeError).toContain('bucle infinito');
  });

  it('Flow 14: Playground reset and manual manipulation operates smoothly', async () => {
    await act(async () => {
      root.render(<App />);
    });

    const openBtn = getNQueensOpenBtn();
    await act(async () => {
      openBtn.click();
    });

    const playground = container.querySelector('.nqueens-playground-box');
    expect(playground).not.toBeNull();

    // Click a chessboard cell to place a queen
    const cell = playground?.querySelector('.board-cell') as SVGElement;
    expect(cell).not.toBeNull();

    await act(async () => {
      cell.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    // Reset button should reset the board
    const clearBtn = Array.from(playground?.querySelectorAll('button') || []).find((b) =>
      b.textContent?.includes('Limpiar') || b.textContent?.includes('Clear')
    ) as HTMLButtonElement;

    expect(clearBtn).not.toBeNull();
    await act(async () => {
      clearBtn.click();
    });
  });

  it('Flow 15: Navigation back to catalog and switching to another exercise', async () => {
    await act(async () => {
      root.render(<App />);
    });

    const openBtn = getNQueensOpenBtn();
    await act(async () => {
      openBtn.click();
    });
    expect(container.textContent).toContain('N-Reinas');

    // Click "Volver al catálogo"
    const backBtn = container.querySelector('.btn-back') as HTMLButtonElement;
    expect(backBtn).not.toBeNull();

    await act(async () => {
      backBtn.click();
    });

    // Verify catalog is shown again
    expect(container.textContent).toContain('Categorías y Técnicas');

    // Select another exercise (second card)
    const cards = Array.from(container.querySelectorAll('.exercise-card'));
    expect(cards.length).toBeGreaterThan(1);
    const secondOpenBtn = cards[1].querySelector('.btn-open-exercise') as HTMLButtonElement;

    await act(async () => {
      secondOpenBtn.click();
    });

    // Verify new exercise view rendered
    expect(container.querySelector('.exercise-view-wrapper')).not.toBeNull();
  });
});
