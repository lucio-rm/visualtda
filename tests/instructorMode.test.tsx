// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { App } from '../src/app/App';
import { INSTRUCTOR_AUTH_STORAGE_KEY, INSTRUCTOR_AUTH_TOKEN, resetInstructorSession } from '../src/utils/cryptoAuth';

// @ts-expect-error React act environment declaration for happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('Instructor Mode & Honest Skip Modal (Mission V3 Section 4)', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    resetInstructorSession();
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

  it('opens authentication modal on click, requires 8-char password, and activates only with valid credential', async () => {
    await act(async () => {
      root.render(<App />);
    });

    const toggleBtn = container.querySelector('.instructor-mode-toggle') as HTMLButtonElement;

    // Click to open authentication modal
    await act(async () => {
      toggleBtn.click();
    });

    const modal = container.querySelector('.instructor-auth-card');
    expect(modal).not.toBeNull();
    expect(modal?.textContent).toContain('Acreditación de Modo Docente');

    const input = container.querySelector('#instructor-password-input') as HTMLInputElement;
    expect(input).not.toBeNull();

    const setInputValue = (el: HTMLInputElement, val: string) => {
      const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      nativeSetter?.call(el, val);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    };

    // Try submitting with wrong credential
    const form = container.querySelector('.instructor-auth-form') as HTMLFormElement;
    await act(async () => {
      setInputValue(input, 'WRONG_PW');
    });

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await new Promise((r) => setTimeout(r, 50));
    });

    // Should display invalid error and remain inactive
    expect(container.querySelector('.auth-error-banner')?.textContent).toContain('Contraseña de acreditación incorrecta');
    expect(toggleBtn.classList.contains('active')).toBe(false);

    // Enter correct 8-character credential (MEL75.29)
    await act(async () => {
      setInputValue(input, 'MEL75.29');
    });

    await act(async () => {
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      await new Promise((r) => setTimeout(r, 50));
    });

    // Modal should close and instructor mode becomes active
    expect(container.querySelector('.instructor-auth-card')).toBeNull();
    expect(toggleBtn.classList.contains('active')).toBe(true);
    expect(toggleBtn.getAttribute('aria-pressed')).toBe('true');
    expect(localStorage.getItem(INSTRUCTOR_AUTH_STORAGE_KEY)).toBe(INSTRUCTOR_AUTH_TOKEN);

    // Click again to deactivate
    await act(async () => {
      toggleBtn.click();
    });

    expect(toggleBtn.classList.contains('active')).toBe(false);
    expect(toggleBtn.getAttribute('aria-pressed')).toBe('false');
  });

  it('rejects unauthorized boolean tampering in localStorage without cryptographic token', async () => {
    // Attempt unauthorized privilege escalation via localStorage tampering
    localStorage.setItem('visual_tda_instructor_mode', 'true');

    await act(async () => {
      root.render(<App />);
    });

    const toggleBtn = container.querySelector('.instructor-mode-toggle') as HTMLButtonElement;
    expect(toggleBtn.classList.contains('active')).toBe(false);
  });

  it('automatically unlocks Understand phase and displays banner when instructor mode is pre-enabled with valid token', async () => {
    localStorage.setItem(INSTRUCTOR_AUTH_STORAGE_KEY, INSTRUCTOR_AUTH_TOKEN);

    await act(async () => {
      root.render(<App />);
    });

    // Open first exercise (Interval Scheduling)
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
    expect(container.textContent).toContain('Solución en Python');
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
    expect(modal?.textContent).toContain('¿Revelar la solución explicada?');
    expect(modal?.textContent).toContain('sin penalización');
    expect(modal?.textContent).toContain('retención y comprensión profunda');
  });

  it('intercepts direct click on Understand phase in PhaseSwitcher when locked and displays friction modal', async () => {
    await act(async () => {
      root.render(<App />);
    });

    const openBtn = container.querySelector('.exercise-card .btn-open-exercise') as HTMLButtonElement;
    await act(async () => {
      openBtn.click();
    });

    // Directly click Phase 3 (Understand) from Discover view without solving
    const phaseButtons = Array.from(container.querySelectorAll('.phase-button')) as HTMLButtonElement[];
    expect(phaseButtons.length).toBe(3);

    // Verify lock icon is present on phase 3 tab
    const lockedTag = container.querySelector('.phase-locked-tag');
    expect(lockedTag).not.toBeNull();

    await act(async () => {
      phaseButtons[2].click();
    });

    // Understand view should NOT be rendered yet
    expect(container.querySelector('.understand-view')).toBeNull();

    // Friction modal should be displayed
    const modal = container.querySelector('.modal-card');
    expect(modal).not.toBeNull();
    expect(modal?.textContent).toContain('¿Revelar la solución explicada?');

    // Clicking confirm in modal unlocks Understand phase
    const confirmBtn = container.querySelector('.modal-actions .btn-primary') as HTMLButtonElement;
    expect(confirmBtn).not.toBeNull();

    await act(async () => {
      confirmBtn.click();
    });

    // Now Understand view is rendered
    expect(container.querySelector('.understand-view')).not.toBeNull();
    expect(container.textContent).toContain('Solución en Python');
  });

  it('detects tampering and blocks solution if state flags are altered via DevTools without genuine crypto credential or test pass', async () => {
    // Attempting to render UnderstandView with solutionUnlocked=true without genuine crypto pass token
    const { registry } = await import('../src/engine/registry');
    const testExercise = registry.getExercise('road-antennas-greedy')!;

    const { UnderstandView } = await import('../src/components/UnderstandView');
    const { LanguageProvider } = await import('../src/i18n/LanguageContext');
    const { InstructorModeProvider } = await import('../src/context/InstructorModeContext');

    await act(async () => {
      root.render(
        <LanguageProvider>
          <InstructorModeProvider>
            <UnderstandView
              exercise={testExercise}
              canonicalPython="def solve(): # CANONICAL_SECRET_CODE"
              pseudocode="Algoritmo Greedy"
              correctnessExplanation="Demostración"
              timeComplexity="O(N)"
              spaceComplexity="O(1)"
              solutionUnlocked={true} // Tampered flag
            />
          </InstructorModeProvider>
        </LanguageProvider>
      );
    });

    // Tamper card must be displayed
    const tamperCard = container.querySelector('.solution-tamper-card');
    expect(tamperCard).not.toBeNull();
    expect(tamperCard?.textContent).toContain('Firma Criptográfica Inválida');
    expect(tamperCard?.textContent).toContain('Se detectó una alteración de variables en la consola/inspección de DevTools');

    // Secret python code must NOT be present anywhere in the DOM
    expect(container.textContent).not.toContain('CANONICAL_SECRET_CODE');
  });
});
