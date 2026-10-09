// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { EXERCISE_VIEW_REGISTRY } from '../src/engine/exerciseViewRegistry';
import { analyzeStudentCodeEffort } from '../src/utils/codeEffortAnalyzer';
import { getHintRequirements, getHintUnlockStatus } from '../src/utils/hintGating';
import {
  recordStudentAttempt,
  getStudentAttempts,
  getStudentAttemptCount,
  getApprovedStudentSolution,
  clearStudentAttempts
} from '../src/utils/studentAttempts';
import { cacheDecryptedSolution } from '../src/utils/solutionCrypto';
import { registry } from '../src/engine/registry';
import { UnderstandView } from '../src/components/UnderstandView';
import { LanguageProvider } from '../src/i18n/LanguageContext';
import { InstructorModeProvider } from '../src/context/InstructorModeContext';
import { INSTRUCTOR_AUTH_STORAGE_KEY, INSTRUCTOR_AUTH_TOKEN } from '../src/utils/cryptoAuth';
import { StudentProgressProvider } from '../src/context/StudentProgressContext';
import { TspBranchAndBoundPlayground } from '../src/components/visualizers/TspBranchAndBoundPlayground';
import { KnightsTourPlayground } from '../src/components/visualizers/KnightsTourPlayground';
import { CoinChangePlayground } from '../src/components/visualizers/CoinChangePlayground';
import { SudokuPlayground } from '../src/components/visualizers/SudokuPlayground';

// @ts-expect-error React act environment declaration for happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('Visualizers, Effort Analysis, Hint Gating & Attempt Tracking', () => {
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

  describe('1. Exercise Visualizers and Playgrounds Integrity', () => {
    it('provides non-null visualizer and discover playground slots for all registry exercises', () => {
      const allExercises = registry.getExercises();
      expect(allExercises.length).toBeGreaterThanOrEqual(37);

      for (const exercise of allExercises) {
        const config = EXERCISE_VIEW_REGISTRY[exercise.id];
        expect(config, `Missing EXERCISE_VIEW_REGISTRY entry for ${exercise.id}`).toBeDefined();
        expect(config.visualizerSlot, `Missing visualizerSlot for ${exercise.id}`).toBeDefined();
        expect(config.discoverPlaygroundSlot, `Missing discoverPlaygroundSlot for ${exercise.id}`).toBeDefined();
      }
    });

    it('renders all 38 visualizer and playground slots without fatal JavaScript exceptions', async () => {
      const allIds = Object.keys(EXERCISE_VIEW_REGISTRY);
      expect(allIds.length).toBeGreaterThanOrEqual(37);

      for (const id of allIds) {
        const config = EXERCISE_VIEW_REGISTRY[id];
        await act(async () => {
          root.render(
            <LanguageProvider>
              <div className="test-vis-wrapper">
                {config.visualizerSlot}
                {config.discoverPlaygroundSlot}
              </div>
            </LanguageProvider>
          );
        });
        expect(container.querySelector('.test-vis-wrapper'), `Failed mounting visualizers for ${id}`).not.toBeNull();
      }
    });
  });

  describe('2. Student Code Effort Analyzer (Líneas Basura Filtering)', () => {
    it('discards blank lines, whitespace-only lines, and comment lines', () => {
      const codeWithJunk = `
# Comentario 1
   # Comentario indentado
def mi_algoritmo():
    # Otro comentario
    pass
    print("debug")
`;
      const result = analyzeStudentCodeEffort(codeWithJunk, 'def mi_algoritmo():\n    pass');
      expect(result.meaningfulLinesAdded).toBe(0);
      expect(result.hasRealLogic).toBe(false);
    });

    it('discards multiline docstrings wrapped in triple quotes', () => {
      const codeWithDocstrings = `
"""
Este es un docstring multilinea
que describe algo largo
sin aportar codigo real.
"""
def solve():
    '''Docstring simple'''
    x = 10
    return x
`;
      const result = analyzeStudentCodeEffort(codeWithDocstrings, 'def solve(): pass');
      // Docstrings are excluded, only real instructions remain
      expect(result.meaningfulLinesAdded).toBeLessThanOrEqual(3);
    });

    it('discards duplicate lines from copy-paste inflation', () => {
      const inflatedCode = `
def solve():
    x = 1
    x = 1
    x = 1
    x = 1
    x = 1
`;
      const result = analyzeStudentCodeEffort(inflatedCode, 'def solve(): pass');
      expect(result.meaningfulLinesAdded).toBeLessThanOrEqual(3);
    });

    it('discards dummy literal and arithmetic assignments (e.g. cualquier = 0, a = 1 + 2)', () => {
      const dummyCode = `
def solve():
    cualquier = 0
    cualquier = 0 + 1
    a = 1 + 2
    dummy_text = "test"
    empty_list = []
    return
`;
      const result = analyzeStudentCodeEffort(dummyCode, 'def solve():\n    pass');
      expect(result.meaningfulLinesAdded).toBe(0);
      expect(result.hasRealLogic).toBe(false);
    });

    it('accurately counts genuine algorithmic code lines', () => {
      const algorithmCode = `
def resolver_scheduling(intervalos):
    if not intervalos:
        return []
    ordenados = sorted(intervalos, key=lambda x: x[1])
    seleccionados = []
    ultimo_fin = -float('inf')
    for inicio, fin in ordenados:
        if inicio >= ultimo_fin:
            seleccionados.append((inicio, fin))
            ultimo_fin = fin
    return seleccionados
`;
      const result = analyzeStudentCodeEffort(algorithmCode, 'def resolver_scheduling(): pass');
      expect(result.meaningfulLinesAdded).toBeGreaterThanOrEqual(10);
      expect(result.hasRealLogic).toBe(true);
    });
  });

  describe('3. Hint Gating Requirements and Unlock Calculation', () => {
    it('defines expected tier thresholds for Hints 1, 2, and 3 dynamically per category', () => {
      // Default (unspecified or general)
      expect(getHintRequirements(0)).toEqual({ attempts: 3, lines: 10 });
      expect(getHintRequirements(1)).toEqual({ attempts: 5, lines: 15 });
      expect(getHintRequirements(2)).toEqual({ attempts: 7, lines: 20 });

      // Dynamic Programming requires more algorithmic structure
      expect(getHintRequirements(0, 'knapsack-dp')).toEqual({ attempts: 3, lines: 16 });
      expect(getHintRequirements(1, 'knapsack-dp')).toEqual({ attempts: 5, lines: 22 });
      expect(getHintRequirements(2, 'knapsack-dp')).toEqual({ attempts: 7, lines: 28 });

      // Greedy requires concise decision logic
      expect(getHintRequirements(0, 'interval-scheduling')).toEqual({ attempts: 3, lines: 8 });
      expect(getHintRequirements(1, 'interval-scheduling')).toEqual({ attempts: 5, lines: 12 });
      expect(getHintRequirements(2, 'interval-scheduling')).toEqual({ attempts: 7, lines: 16 });

      // Backtracking is simpler than Dynamic Programming
      expect(getHintRequirements(0, 'n-queens')).toEqual({ attempts: 3, lines: 8 });
      expect(getHintRequirements(1, 'n-queens')).toEqual({ attempts: 5, lines: 12 });
      expect(getHintRequirements(2, 'n-queens')).toEqual({ attempts: 7, lines: 16 });
    });

    it('keeps Hint 1 locked when student has 0 attempts and 0 meaningful lines', () => {
      const status = getHintUnlockStatus('test-ex', 0, 'def solve(): pass', 'def solve(): pass', false);
      expect(status.isUnlocked).toBe(false);
      expect(status.attemptsFulfilled).toBe(false);
      expect(status.linesFulfilled).toBe(false);
      expect(status.attemptsProgress).toBe(0);
      expect(status.linesProgress).toBe(0);
    });

    it('keeps Hint 1 locked when student spams test runs on unmodified starter stub', () => {
      clearStudentAttempts('test-spam-stub');
      recordStudentAttempt('test-spam-stub', 'def solve(): pass', 'def solve(): pass', false, 0, 3);
      recordStudentAttempt('test-spam-stub', 'def solve(): pass', 'def solve(): pass', false, 0, 3);
      recordStudentAttempt('test-spam-stub', 'def solve(): pass', 'def solve(): pass', false, 0, 3);

      const status = getHintUnlockStatus('test-spam-stub', 0, 'def solve(): pass', 'def solve(): pass', false);
      expect(status.currentAttempts).toBe(0);
      expect(status.attemptsFulfilled).toBe(false);
      expect(status.isUnlocked).toBe(false);
    });

    it('keeps Hint 1 locked when student has 3 attempts but only 5 lines of code', () => {
      recordStudentAttempt('test-ex-lines', 'def solve():\n    return 1', 'def solve(): pass', false, 0, 3);
      recordStudentAttempt('test-ex-lines', 'def solve():\n    return 1', 'def solve(): pass', false, 0, 3);
      recordStudentAttempt('test-ex-lines', 'def solve():\n    return 1', 'def solve(): pass', false, 0, 3);

      const status = getHintUnlockStatus('test-ex-lines', 0, 'def solve():\n    return 1', 'def solve(): pass', false);
      expect(status.attemptsFulfilled).toBe(true);
      expect(status.linesFulfilled).toBe(false);
      expect(status.isUnlocked).toBe(false);
    });

    it('unlocks Hint 1 when student has >= 3 attempts and >= 20 meaningful lines', () => {
      const complexCode = `
def solve(items):
    n = len(items)
    dp = [0] * (n + 1)
    res = []
    for i in range(n):
        val = items[i]
        if val > 0:
            dp[i + 1] = dp[i] + val
            res.append(val)
        else:
            dp[i + 1] = dp[i]
    total = sum(res)
    for x in res:
        if x % 2 == 0:
            total += x * 2
        else:
            total += x
    ans = max(total, dp[n])
    if ans > 100:
        return ans
    return dp[n]
`;
      recordStudentAttempt('test-ex-full', complexCode, 'def solve(): pass', false, 0, 3);
      recordStudentAttempt('test-ex-full', complexCode, 'def solve(): pass', false, 0, 3);
      recordStudentAttempt('test-ex-full', complexCode, 'def solve(): pass', false, 0, 3);

      const status = getHintUnlockStatus('test-ex-full', 0, complexCode, 'def solve(): pass', false);
      expect(status.attemptsFulfilled).toBe(true);
      expect(status.linesFulfilled).toBe(true);
      expect(status.isUnlocked).toBe(true);
      expect(status.attemptsProgress).toBe(100);
      expect(status.linesProgress).toBe(100);
    });

    it('bypasses all requirements when instructor mode is active', () => {
      const status = getHintUnlockStatus('any-ex', 0, '', '', true);
      expect(status.isUnlocked).toBe(true);
      expect(status.isInstructorBypassed).toBe(true);
      expect(status.attemptsProgress).toBe(100);
      expect(status.linesProgress).toBe(100);
    });
  });

  describe('4. Student Attempts Persistence and Approved Solution Storage', () => {
    it('records attempts and tracks run counts per exercise', () => {
      clearStudentAttempts('ex-tracking');
      expect(getStudentAttemptCount('ex-tracking')).toBe(0);

      recordStudentAttempt('ex-tracking', 'code 1', 'starter', false, 1, 4, 15);
      recordStudentAttempt('ex-tracking', 'code 2', 'starter', false, 2, 4, 18);
      recordStudentAttempt('ex-tracking', 'code 3', 'starter', true, 4, 4, 12);

      const attempts = getStudentAttempts('ex-tracking');
      expect(attempts.length).toBe(3);
      expect(getStudentAttemptCount('ex-tracking')).toBe(3);

      const approved = getApprovedStudentSolution('ex-tracking');
      expect(approved).not.toBeNull();
      expect(approved?.code).toBe('code 3');
      expect(approved?.passed).toBe(true);
    });
  });

  describe('5. Understand View Access Control (Students vs. Faculty)', () => {
    it('restricts canonical Python and pseudocode for non-faculty students, providing Tu Solucion tab', async () => {
      const exercise = registry.getExercise('interval-scheduling')!;
      expect(exercise).toBeDefined();

      await act(async () => {
        root.render(
          <LanguageProvider>
            <InstructorModeProvider>
              <UnderstandView
                exercise={exercise}
                canonicalPython="def solve(): # CANONICAL_HIDDEN_CODE"
                pseudocode="Algoritmo Greedy O(N log N)"
                correctnessExplanation="Demostración Formal"
                timeComplexity="O(N log N)"
                spaceComplexity="O(1)"
                solutionUnlocked={false}
              />
            </InstructorModeProvider>
          </LanguageProvider>
        );
      });

      // Canonical hidden code must not be exposed to students
      expect(container.textContent).not.toContain('CANONICAL_HIDDEN_CODE');

      // Tabs "Tu Solución" and "Intentos" must be present
      expect(container.textContent).toContain('Tu Solución');
      expect(container.textContent).toContain('Intentos (0)');

      // Clicking faculty tabs reveals locked message
      const facultyPythonBtn = Array.from(container.querySelectorAll('.btn-code-toggle')).find(
        (b) => b.textContent?.includes('Python 3 (Docentes)')
      ) as HTMLButtonElement;
      expect(facultyPythonBtn).toBeDefined();

      await act(async () => {
        facultyPythonBtn.click();
      });

      expect(container.querySelector('.solution-locked-card')).not.toBeNull();
      expect(container.textContent).toContain('Acceso Exclusivo Docente');
      expect(container.textContent).not.toContain('CANONICAL_HIDDEN_CODE');
    });

    it('permits authenticated faculty to view canonical Python and pseudocode', async () => {
      localStorage.setItem(INSTRUCTOR_AUTH_STORAGE_KEY, INSTRUCTOR_AUTH_TOKEN);
      const exercise = registry.getExercise('interval-scheduling')!;
      expect(exercise).toBeDefined();

      // Pre-cache decrypted solution so synchronous render can display immediately
      cacheDecryptedSolution('interval-scheduling', 'def canonical_teacher_code(): pass');

      await act(async () => {
        root.render(
          <LanguageProvider>
            <InstructorModeProvider>
              <UnderstandView
                exercise={exercise}
                canonicalPython="def canonical_teacher_code(): pass"
                pseudocode="Algoritmo de la Cátedra"
                correctnessExplanation="Demostración"
                timeComplexity="O(N log N)"
                spaceComplexity="O(1)"
                solutionUnlocked={true}
              />
            </InstructorModeProvider>
          </LanguageProvider>
        );
      });

      // Faculty sees canonical code
      expect(container.textContent).toContain('canonical_teacher_code');

      // Faculty can toggle to pseudocode
      const pseudocodeBtn = Array.from(container.querySelectorAll('.btn-code-toggle')).find(
        (b) => b.textContent?.includes('Pseudocódigo')
      ) as HTMLButtonElement;
      expect(pseudocodeBtn).toBeDefined();

      await act(async () => {
        pseudocodeBtn.click();
      });

      expect(container.textContent).toContain('Algoritmo de la Cátedra');
    });
  });

  describe('6. Refined Visualizers UX, High-Contrast Badges & Pedagogical Gating', () => {
    it('renders high-contrast edge weight badge pills in TSP Branch & Bound', async () => {
      await act(async () => {
        root.render(
          <LanguageProvider>
            <StudentProgressProvider>
              <TspBranchAndBoundPlayground />
            </StudentProgressProvider>
          </LanguageProvider>
        );
      });

      // SVG edges contain rect badge pills for weights
      const badges = container.querySelectorAll('rect[width="26"][height="18"]');
      expect(badges.length).toBeGreaterThan(0);
    });

    it('supports solvable 5x5, 6x6, 8x8 boards (excluding impossible 4x4), gates Warnsdorff star, and renders vector knight', async () => {
      await act(async () => {
        root.render(
          <LanguageProvider>
            <StudentProgressProvider>
              <InstructorModeProvider>
                <KnightsTourPlayground />
              </InstructorModeProvider>
            </StudentProgressProvider>
          </LanguageProvider>
        );
      });

      // Check board size preset buttons (4x4 must be excluded because it is mathematically unsolvable)
      expect(container.textContent).not.toContain('4×4');
      expect(container.textContent).toContain('5×5');
      expect(container.textContent).toContain('6×6');
      expect(container.textContent).toContain('8×8');


      // Regular student should NOT see Warnsdorff gold star '★'
      expect(container.textContent).not.toContain('★');
      // Should render SVG vector knight without unicode emoji
      expect(container.textContent).not.toContain('♞');
      const vectorKnight = container.querySelector('svg[viewBox="0 0 45 45"]');
      expect(vectorKnight).not.toBeNull();
    });

    it('gates DP optimal solution in Coin Change while keeping Greedy heuristic visible', async () => {
      await act(async () => {
        root.render(
          <LanguageProvider>
            <StudentProgressProvider>
              <InstructorModeProvider>
                <CoinChangePlayground />
              </InstructorModeProvider>
            </StudentProgressProvider>
          </LanguageProvider>
        );
      });

      // Greedy card is visible
      expect(container.textContent).toContain('Heurística Greedy');

      // DP card is gated by default (shows ? monedas and [ ? ])
      expect(container.textContent).toContain('? monedas');
      expect(container.textContent).toContain('[ ? ]');

      // Click "Revelar Solución Óptima"
      const revealBtn = Array.from(container.querySelectorAll('button')).find(
        (b) => b.textContent?.includes('Revelar Solución Óptima')
      );
      expect(revealBtn).toBeDefined();

      await act(async () => {
        revealBtn?.click();
      });

      // Now reveals optimal DP
      expect(container.textContent).toContain('2 monedas');
      expect(container.textContent).toContain('[3, 3]');
    });

    it('gates MRV heuristic and showcase preset in SudokuPlayground until completed or instructor mode', async () => {
      // 1. Regular student view: MRV preset and best-cell recommendations are locked
      await act(async () => {
        root.render(
          <LanguageProvider>
            <StudentProgressProvider>
              <InstructorModeProvider>
                <SudokuPlayground />
              </InstructorModeProvider>
            </StudentProgressProvider>
          </LanguageProvider>
        );
      });

      // Does not show MRV showcase button to uncompleted student
      expect(container.textContent).not.toContain('Demostración MRV');
      // Shows lock indicator instead of active MRV toggle
      expect(container.textContent).toContain('🔒 MRV');
      // Board SVG does not render "MRV" badge text on any cell
      expect(container.querySelector('svg')?.textContent).not.toContain('MRV');
      // Status bar shows locked hint notice
      expect(container.textContent).toContain('bloqueadas');

      // 2. Instructor mode view: unlocks MRV
      act(() => {
        root.unmount();
      });
      container.remove();
      container = document.createElement('div');
      document.body.appendChild(container);
      root = createRoot(container);

      sessionStorage.setItem(INSTRUCTOR_AUTH_STORAGE_KEY, INSTRUCTOR_AUTH_TOKEN);
      await act(async () => {
        root.render(
          <LanguageProvider>
            <StudentProgressProvider>
              <InstructorModeProvider>
                <SudokuPlayground />
              </InstructorModeProvider>
            </StudentProgressProvider>
          </LanguageProvider>
        );
      });

      expect(container.textContent).toContain('Demostración MRV');
      expect(container.textContent).toContain('Mostrar Opciones (MRV)');
      expect(container.textContent).toContain('Variable más restringida (MRV)');
    });
  });
});
