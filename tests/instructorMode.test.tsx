// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { App } from '../src/app/App';

// @ts-expect-error React act environment declaration for happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('Instructor Mode & Honest Skip Modal (Mission V3 Section 4)', () => {
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

  it('renders instructor mode toggle button in header', async () => {
    await act(async () => {
      root.render(<App />);
    });

    const toggleBtn = container.querySelector('.instructor-mode-toggle') as HTMLButtonElement;
    expect(toggleBtn).not.toBeNull();
    expect(toggleBtn.textContent).toContain('Modo Docente');
    expect(toggleBtn.getAttribute('aria-pressed')).toBe('false');
  });

  it('toggles instructor mode on click and persists state in localStorage', async () => {
    await act(async () => {
      root.render(<App />);
    });

    const toggleBtn = container.querySelector('.instructor-mode-toggle') as HTMLButtonElement;

    // Click to enable
    await act(async () => {
      toggleBtn.click();
    });

    expect(toggleBtn.classList.contains('active')).toBe(true);
    expect(toggleBtn.getAttribute('aria-pressed')).toBe('true');
    expect(localStorage.getItem('visual_tda_instructor_mode')).toBe('true');

    // Click to disable
    await act(async () => {
      toggleBtn.click();
    });

    expect(toggleBtn.classList.contains('active')).toBe(false);
    expect(toggleBtn.getAttribute('aria-pressed')).toBe('false');
    expect(localStorage.getItem('visual_tda_instructor_mode')).toBe('false');
  });

  it('automatically unlocks Understand phase and displays banner when instructor mode is pre-enabled', async () => {
    localStorage.setItem('visual_tda_instructor_mode', 'true');

    await act(async () => {
      root.render(<App />);
    });

    // Open first exercise (N-Queens)
    const openBtn = container.querySelector('.exercise-card .btn-open-exercise') as HTMLButtonElement;
    await act(async () => {
      openBtn.click();
    });

    // Instructor banner must be visible
    const banner = container.querySelector('.instructor-banner');
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toContain('Modo Docente activo');

    // Phase 3 (Understand) should have the unlocked checkmark tag
    const unlockedTag = container.querySelector('.phase-unlocked-tag');
    expect(unlockedTag).not.toBeNull();

    // Click Phase 3 directly from Discover
    const phaseButtons = Array.from(container.querySelectorAll('.phase-button')) as HTMLButtonElement[];
    expect(phaseButtons.length).toBe(3);

    await act(async () => {
      phaseButtons[2].click();
    });

    // Understand view rendered immediately without solving or skip modal
    const understandView = container.querySelector('.understand-view');
    expect(understandView).not.toBeNull();
    expect(container.textContent).toContain('Solución Canónica');
  });

  it('displays honest pedagogical friction copy in the Solve phase skip modal', async () => {
    await act(async () => {
      root.render(<App />);
    });

    const openBtn = container.querySelector('.exercise-card .btn-open-exercise') as HTMLButtonElement;
    await act(async () => {
      openBtn.click();
    });

    const phaseButtons = Array.from(container.querySelectorAll('.phase-button')) as HTMLButtonElement[];
    await act(async () => {
      phaseButtons[1].click(); // Go to Solve
    });

    const skipBtn = container.querySelector('.skip-solution-card .btn-secondary') as HTMLButtonElement;
    expect(skipBtn).not.toBeNull();

    await act(async () => {
      skipBtn.click();
    });

    // Verify modal contains honest pedagogical friction copy
    const modal = container.querySelector('.modal-card');
    expect(modal).not.toBeNull();
    expect(modal?.textContent).toContain('¿Revelar la solución canónica?');
    expect(modal?.textContent).toContain('sin penalización');
    expect(modal?.textContent).toContain('retención y comprensión profunda');
  });
});
