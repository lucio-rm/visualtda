// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import {
  exportPortfolioData,
  exportPortfolioMarkdown,
  importPortfolioData
} from '../src/utils/portfolioExportImport';
import { recordStudentAttempt } from '../src/utils/studentAttempts';

describe('Offline Academic Portfolio Export & Import Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('exports empty portfolio package safely without throwing', () => {
    const pkg = exportPortfolioData();
    expect(pkg.schemaVersion).toBe('1.0');
    expect(pkg.app).toBe('Visual TDA');
    expect(pkg.summary.completedCount).toBe(0);
    expect(pkg.summary.attemptsCount).toBe(0);
    expect(pkg.completedExerciseIds).toEqual([]);
  });

  it('exports recorded progress and approved solutions accurately', () => {
    // Simulate user completing n-queens
    localStorage.setItem(
      'visual_tda_completed_exercises',
      JSON.stringify(['n-queens'])
    );
    localStorage.setItem(
      'visual_tda_student_progress_records',
      JSON.stringify({
        'n-queens': { state: 'completed', updatedAt: Date.now() }
      })
    );

    recordStudentAttempt('n-queens', {
      exerciseId: 'n-queens',
      code: 'def solve_n_queens(n): return [[1, 3, 0, 2]]',
      passed: true,
      passedTestsCount: 4,
      totalTestsCount: 4,
      meaningfulLinesCount: 5,
      engine: 'ts'
    });

    const pkg = exportPortfolioData();
    expect(pkg.summary.completedCount).toBe(1);
    expect(pkg.summary.passedCount).toBe(1);
    expect(pkg.summary.attemptsCount).toBe(1);
    expect(pkg.approvedSolutions['n-queens']).toBeDefined();
    expect(pkg.approvedSolutions['n-queens'].code).toContain('solve_n_queens');

    const md = exportPortfolioMarkdown('es');
    expect(md).toContain('# Visual TDA — Portafolio Académico de Soluciones');
    expect(md).toContain('solve_n_queens');
    expect(md).toContain('n-queens');
  });

  it('imports valid portfolio package and updates localStorage', () => {
    const mockPackage = {
      schemaVersion: '1.0',
      app: 'Visual TDA',
      exportedAt: new Date().toISOString(),
      summary: {
        totalExercises: 38,
        completedCount: 2,
        passedCount: 2,
        attemptsCount: 2,
        totalMeaningfulLines: 15
      },
      records: {
        'n-queens': { state: 'completed', updatedAt: 12345 },
        'knapsack-dp': { state: 'passed', updatedAt: 67890 }
      },
      completedExerciseIds: ['n-queens', 'knapsack-dp'],
      attempts: {},
      approvedSolutions: {
        'n-queens': {
          id: 'test-att-1',
          exerciseId: 'n-queens',
          timestamp: 12345,
          code: 'def solve_n_queens(n): pass',
          passed: true,
          passedTestsCount: 4,
          totalTestsCount: 4,
          meaningfulLinesCount: 8,
          engine: 'ts'
        }
      }
    };

    const res = importPortfolioData(JSON.stringify(mockPackage));
    expect(res.success).toBe(true);
    expect(res.importedCount).toBe(2);

    const storedCompleted = JSON.parse(
      localStorage.getItem('visual_tda_completed_exercises') || '[]'
    );
    expect(storedCompleted).toContain('n-queens');
    expect(storedCompleted).toContain('knapsack-dp');

    const storedApproved = JSON.parse(
      localStorage.getItem('visual_tda_approved_solution_n-queens') || '{}'
    );
    expect(storedApproved.code).toBe('def solve_n_queens(n): pass');
  });

  it('defensively rejects corrupted or alien JSON packages without crashing', () => {
    expect(importPortfolioData('').success).toBe(false);
    expect(importPortfolioData('invalid json {{{').success).toBe(false);
    expect(importPortfolioData(JSON.stringify({ app: 'NotVisualTDA' })).success).toBe(false);
  });
});
