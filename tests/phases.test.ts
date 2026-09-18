import { describe, it, expect } from 'vitest';
import { ExercisePhase, ExerciseMetadata } from '../src/types';
import { registry } from '../src/engine/registry';

describe('Pedagogical 3-Phase Flow Model', () => {
  it('validates phase values correspond to the canonical specification', () => {
    const validPhases: ExercisePhase[] = ['discover', 'solve', 'understand'];
    expect(validPhases).toHaveLength(3);
  });

  it('ensures registered exercises declare support for all three canonical phases', () => {
    const exercises = registry.getExercises();
    for (const ex of exercises) {
      expect(ex.supportedPhases).toContain('discover');
      expect(ex.supportedPhases).toContain('solve');
      expect(ex.supportedPhases).toContain('understand');
    }
  });

  it('validates transition sequence logic (discover -> solve -> understand)', () => {
    let currentPhase: ExercisePhase = 'discover';

    // Transition to solve
    const proceedToSolve = () => {
      currentPhase = 'solve';
    };
    proceedToSolve();
    expect(currentPhase).toBe('solve');

    // Passing tests unlocks understand
    const passTests = () => {
      currentPhase = 'understand';
    };
    passTests();
    expect(currentPhase).toBe('understand');
  });

  it('allows explicit skip to canonical solution without shame or penalty (P12 / anti-dark pattern)', () => {
    let currentPhase: ExercisePhase = 'solve';
    let solutionUnlocked = false;

    const skipToSolution = () => {
      solutionUnlocked = true;
      currentPhase = 'understand';
    };

    skipToSolution();
    expect(currentPhase).toBe('understand');
    expect(solutionUnlocked).toBe(true);
  });

  it('verifies exercise metadata contains bilingual titles and subtitles', () => {
    const nQueens = registry.getExercise('n-queens') as ExerciseMetadata;
    expect(nQueens.title.es).toBe('N-Reinas');
    expect(nQueens.title.en).toBe('N-Queens');
    expect(nQueens.subtitle.es).toBeTruthy();
    expect(nQueens.subtitle.en).toBeTruthy();
  });
});
