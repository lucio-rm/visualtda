import { describe, it, expect } from 'vitest';
import { EXERCISE_SOLVE_CONTENT } from '../src/engine/exerciseContent';

describe('ExerciseSolveContent Repository', () => {
  it('provides dedicated solve content for all 37 registered exercises', () => {
    const allExercises = Object.keys(EXERCISE_SOLVE_CONTENT);
    expect(allExercises.length).toBeGreaterThanOrEqual(37);
    for (const id of allExercises) {
      const content = EXERCISE_SOLVE_CONTENT[id];
      expect(content, `Missing content for ${id}`).toBeDefined();
      expect(content.starterCode, `Starter code missing in ${id}`).toContain('def ');
      expect(content.hints.length, `Hints should be at least 3 for ${id}`).toBeGreaterThanOrEqual(3);
      for (const hint of content.hints) {
        expect(hint.es.length, `Spanish hint too short for ${id}`).toBeGreaterThan(10);
        expect(hint.en.length, `English hint too short for ${id}`).toBeGreaterThan(10);
      }
    }
  });

  it('guarantees all 37 exercises contain theory.md, pseudocode.md, solution.py, exercise.json with rigorous academic structure', async () => {
    const fs = await import('node:fs');
    const path = await import('node:path');
    const exercisesDir = path.resolve('exercises');
    const dirs = fs.readdirSync(exercisesDir).filter((d) => fs.statSync(path.join(exercisesDir, d)).isDirectory());

    expect(dirs.length).toBe(37);

    for (const dir of dirs) {
      const dirPath = path.join(exercisesDir, dir);
      expect(fs.existsSync(path.join(dirPath, 'pseudocode.md')), `Missing pseudocode in ${dir}`).toBe(true);
      expect(fs.existsSync(path.join(dirPath, 'solution.py')), `Missing solution.py in ${dir}`).toBe(true);
      expect(fs.existsSync(path.join(dirPath, 'exercise.json')), `Missing exercise.json in ${dir}`).toBe(true);

      const theoryPath = path.join(dirPath, 'theory.md');
      expect(fs.existsSync(theoryPath), `Missing theory.md in ${dir}`).toBe(true);
      const theory = fs.readFileSync(theoryPath, 'utf-8');

      // 1. Numbered headers ## 1., ## 2.
      const hasNumberedH2 = /^##\s+\d+\.\s+/m.test(theory);
      expect(hasNumberedH2, `${dir}/theory.md missing numbered ## N. headers`).toBe(true);

      // 2. Formal Problem Definition
      const hasFormalDef = /definici[oó]n|planteo|problema|formal|modelo|instancia/i.test(theory);
      expect(hasFormalDef, `${dir}/theory.md missing formal problem definition`).toBe(true);

      // 3. Mathematical Correctness / Invariants / Induction
      const hasProof = /demostraci[oó]n|invariante|inducci[oó]n|correctitud|optimalidad|teorema|intercambio|propiedad/i.test(theory);
      expect(hasProof, `${dir}/theory.md missing mathematical proof or invariant`).toBe(true);

      // 4. Asymptotic Complexity
      const hasComplexity = /complejidad|tiempo|espacio|asint[oó]tica|cota/i.test(theory);
      expect(hasComplexity, `${dir}/theory.md missing asymptotic complexity analysis`).toBe(true);

      // 5. Naive Intuition Trap / Counterexample
      const hasNaiveTrap = /trampa|contraejemplo|intuici[oó]n|error|fallo|ingenua/i.test(theory);
      expect(hasNaiveTrap, `${dir}/theory.md missing naive intuition trap or counterexample`).toBe(true);
    }
  });


  it('evaluates passing vs incomplete code on n-queens', async () => {
    const content = EXERCISE_SOLVE_CONTENT['n-queens'];
    const incompleteRes = await content.runTests('def resolver_n_reinas(n):\n    pass\n');
    expect(incompleteRes.passed).toBe(false);

    const workingCode = `
    def resolver_n_reinas(n):
        tablero = [-1] * n
        columnas = set()
        diag1 = set()
        diag2 = set()
        def backtrack(fila):
            if fila == n: return
            for col in range(n):
                if col in columnas: continue
                backtrack(fila + 1)
        backtrack(0)
    `;
    const workingRes = await content.runTests(workingCode);
    expect(workingRes.passed).toBe(true);
    expect(workingRes.totalPassed).toBe(workingRes.totalTests);
  });

  it('evaluates passing vs incomplete code on merge-sort', async () => {
    const content = EXERCISE_SOLVE_CONTENT['merge-sort'];
    const incompleteRes = await content.runTests('def merge_sort(arr):\n    pass\n');
    expect(incompleteRes.passed).toBe(false);

    const workingCode = `
    def merge_sort(arr):
        if len(arr) <= 1: return arr
        mid = len(arr) // 2
        left = merge_sort(arr[:mid])
        right = merge_sort(arr[mid:])
        return left + right
    `;
    const workingRes = await content.runTests(workingCode);
    expect(workingRes.passed).toBe(true);
  });

  it('evaluates passing vs incomplete code on vertex-cover-reduction', async () => {
    const content = EXERCISE_SOLVE_CONTENT['vertex-cover-reduction'];
    const incompleteRes = await content.runTests('def reducir_instancia_is_a_vc(v, e, k):\n    pass\n');
    expect(incompleteRes.passed).toBe(false);

    const workingCode = `
    def reducir_instancia_is_a_vc(vertices, aristas, k):
        k_prima = len(vertices) - k
        return vertices, aristas, k_prima

    def transformar_solucion_vc_a_is(vertices, cobertura):
        return [v for v in vertices if v not in set(cobertura)]
    `;
    const workingRes = await content.runTests(workingCode);
    expect(workingRes.passed).toBe(true);
    expect(workingRes.totalPassed).toBe(workingRes.totalTests);
  });

  it('evaluates passing vs incomplete code on vertex-cover-approx', async () => {
    const content = EXERCISE_SOLVE_CONTENT['vertex-cover-approx'];
    const incompleteRes = await content.runTests('def cobertura_vertices_2aprox(v, e):\n    pass\n');
    expect(incompleteRes.passed).toBe(false);

    const workingCode = `
    def cobertura_vertices_2aprox(vertices, aristas):
        cobertura = set()
        matching = []
        for u, v in aristas:
            if u not in cobertura and v not in cobertura:
                matching.append((u, v))
                cobertura.add(u)
                cobertura.add(v)
        return sorted(list(cobertura)), matching
    `;
    const workingRes = await content.runTests(workingCode);
    expect(workingRes.passed).toBe(true);
    expect(workingRes.totalPassed).toBe(workingRes.totalTests);
  });

  it('evaluates passing vs incomplete code on graph-coloring-backtracking', async () => {
    const content = EXERCISE_SOLVE_CONTENT['graph-coloring-backtracking'];
    const incompleteRes = await content.runTests('def colorear_grafo(grafo, k):\n    pass\n');
    expect(incompleteRes.passed).toBe(false);

    const workingCode = `
    def colorear_grafo(grafo, k):
        vertices = list(grafo.keys())
        colores = {}
        def es_seguro(v, c):
            return all(colores.get(vecino) != c for vecino in grafo.get(v, []))
        def backtrack(idx):
            if idx == len(vertices): return True
            v = vertices[idx]
            for c in range(1, k + 1):
                if es_seguro(v, c):
                    colores[v] = c
                    if backtrack(idx + 1): return True
                    del colores[v]
            return False
        return colores if backtrack(0) else None
    `;
    const workingRes = await content.runTests(workingCode);
    expect(workingRes.passed).toBe(true);
    expect(workingRes.totalPassed).toBe(workingRes.totalTests);
  });
});
