import { describe, it, expect } from 'vitest';
import { closestPairValidator, computeClosestPairDistance } from '../src/engine/algorithms/closestPairValidator';
import { karatsubaValidator, karatsubaMultiply } from '../src/engine/algorithms/karatsubaValidator';
import { medianOfMediansValidator, selectKthElement } from '../src/engine/algorithms/medianOfMediansValidator';
import { majorityElementValidator, findMajorityElement } from '../src/engine/algorithms/majorityElementValidator';
import { intervalPartitioningValidator, computeMinimumClassrooms } from '../src/engine/algorithms/intervalPartitioningValidator';
import { minimizeLatenessValidator, computeMinimalLateness } from '../src/engine/algorithms/minimizeLatenessValidator';
import { dijkstraValidator, solveDijkstra } from '../src/engine/algorithms/dijkstraValidator';
import { kruskalValidator, solveKruskalMst } from '../src/engine/algorithms/kruskalValidator';
import { segmentedLeastSquaresValidator, solveSegmentedLeastSquares } from '../src/engine/algorithms/segmentedLeastSquaresValidator';
import { rnaSecondaryStructureValidator, solveRnaSecondaryStructure } from '../src/engine/algorithms/rnaSecondaryStructureValidator';
import { bellmanFordValidator, solveBellmanFord } from '../src/engine/algorithms/bellmanFordValidator';

describe('Dedicated Validators Suite', () => {
  describe('1. closestPairValidator', () => {
    it('accepts correct minimum Euclidean distance', () => {
      const pts: [number, number][] = [[0, 0], [3, 4], [1, 1]];
      expect(computeClosestPairDistance(pts)).toBeCloseTo(Math.SQRT2);
      const res = closestPairValidator.validate(pts, Math.SQRT2);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    it('rejects incorrect or suboptimal distance', () => {
      const pts: [number, number][] = [[0, 0], [3, 4], [1, 1]];
      const res = closestPairValidator.validate(pts, 5.0);
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('Distancia incorrecta');
    });

    it('handles edge case: fewer than 2 points', () => {
      const res = closestPairValidator.validate([[0, 0]], 0);
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('al menos 2 puntos');
    });

    it('rejects malformed non-numeric coordinates', () => {
      const malformed = [[0, 0], [1, NaN]] as [number, number][];
      const res = closestPairValidator.validate(malformed, 1);
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('Punto inválido');
    });
  });

  describe('2. karatsubaValidator', () => {
    it('validates multi-digit multiplication product', () => {
      expect(karatsubaMultiply(1234n, 5678n)).toBe(7006652n);
      const res = karatsubaValidator.validate([1234, 5678], 7006652);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    it('rejects incorrect product', () => {
      const res = karatsubaValidator.validate([1234, 5678], 7000000);
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('Producto incorrecto');
    });

    it('handles edge cases: single digit and zero', () => {
      const resZero = karatsubaValidator.validate([0, 999], 0);
      expect(resZero.valid).toBe(true);
      const resSingle = karatsubaValidator.validate([7, 8], 56);
      expect(resSingle.valid).toBe(true);
    });

    it('rejects malformed inputs', () => {
      const res = karatsubaValidator.validate(['abc', 123] as unknown as [number, number], 123);
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('enteros válidos');
    });
  });

  describe('3. medianOfMediansValidator', () => {
    const arr = [12, 3, 5, 7, 4, 19, 26];

    it('accepts correct k-th smallest element for k=0, k=3 (median), and k=last', () => {
      expect(selectKthElement(arr, 3)).toBe(7);
      const resMin = medianOfMediansValidator.validate({ array: arr, k: 0 }, 3);
      expect(resMin.valid).toBe(true);
      const resMed = medianOfMediansValidator.validate({ array: arr, k: 3 }, 7);
      expect(resMed.valid).toBe(true);
      const resMax = medianOfMediansValidator.validate({ array: arr, k: 6 }, 26);
      expect(resMax.valid).toBe(true);
    });

    it('rejects incorrect selection element', () => {
      const res = medianOfMediansValidator.validate({ array: arr, k: 3 }, 12);
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('Selección incorrecta');
    });

    it('rejects k out of bounds and empty arrays', () => {
      const resOut = medianOfMediansValidator.validate({ array: arr, k: 10 }, 5);
      expect(resOut.valid).toBe(false);
      expect(resOut.errors[0]).toContain('fuera de rango');

      const resEmpty = medianOfMediansValidator.validate({ array: [], k: 0 }, 0);
      expect(resEmpty.valid).toBe(false);
      expect(resEmpty.errors[0]).toContain('vacío');
    });
  });

  describe('4. majorityElementValidator', () => {
    it('accepts strict majority element (> n/2 occurrences)', () => {
      const arr = [3, 3, 4, 2, 4, 4, 2, 4, 4]; // 4 appears 5 out of 9 times
      expect(findMajorityElement(arr)).toBe(4);
      const res = majorityElementValidator.validate(arr, 4);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    it('accepts null when no strict majority exists', () => {
      const arr = [1, 2, 3, 4, 5];
      const res = majorityElementValidator.validate(arr, null);
      expect(res.valid).toBe(true);
    });

    it('rejects false positive and false negative majority reports', () => {
      const noMaj = [1, 2, 3, 4];
      const resFP = majorityElementValidator.validate(noMaj, 2);
      expect(resFP.valid).toBe(false);
      expect(resFP.errors[0]).toContain('Falso positivo');

      const withMaj = [7, 7, 7, 1];
      const resFN = majorityElementValidator.validate(withMaj, null);
      expect(resFN.valid).toBe(false);
      expect(resFN.errors[0]).toContain('Falso negativo');
    });

    it('handles edge case: single element array', () => {
      const res = majorityElementValidator.validate([42], 42);
      expect(res.valid).toBe(true);
    });
  });

  describe('5. intervalPartitioningValidator', () => {
    it('validates minimal classroom count on overlapping tasks', () => {
      const intervals: [number, number][] = [[1, 4], [2, 5], [6, 8]]; // depth 2
      expect(computeMinimumClassrooms(intervals)).toBe(2);
      const res = intervalPartitioningValidator.validate(intervals, 2);
      expect(res.valid).toBe(true);
    });

    it('rejects insufficient classrooms', () => {
      const intervals: [number, number][] = [[1, 10], [2, 6], [3, 7]]; // depth 3
      const res = intervalPartitioningValidator.validate(intervals, 2);
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('Aulas insuficientes');
    });

    it('accepts abutting intervals without conflict ([1, 4] and [4, 6] share 1 room)', () => {
      const abutting: [number, number][] = [[1, 4], [4, 6]];
      const res = intervalPartitioningValidator.validate(abutting, 1);
      expect(res.valid).toBe(true);
    });

    it('validates partitioned classroom arrays', () => {
      const intervals: [number, number][] = [[1, 4], [2, 5], [6, 8]];
      const validPartition = [
        [[1, 4], [6, 8]],
        [[2, 5]]
      ] as [number, number][][];
      const res = intervalPartitioningValidator.validate(intervals, validPartition);
      expect(res.valid).toBe(true);
    });

    it('rejects inverted intervals start > end', () => {
      const inverted: [number, number][] = [[5, 2]];
      const res = intervalPartitioningValidator.validate(inverted, 1);
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('Intervalo invertido');
    });
  });

  describe('6. minimizeLatenessValidator', () => {
    it('validates zero lateness when jobs finish before deadline', () => {
      const jobs: [number, number][] = [[3, 6], [2, 8], [1, 9]];
      expect(computeMinimalLateness(jobs)).toBe(0);
      const res = minimizeLatenessValidator.validate(jobs, 0);
      expect(res.valid).toBe(true);
    });

    it('validates optimal inevitable lateness', () => {
      const jobs: [number, number][] = [[3, 2], [2, 4]]; // lateness 1
      const res = minimizeLatenessValidator.validate(jobs, 1);
      expect(res.valid).toBe(true);
    });

    it('rejects suboptimal lateness', () => {
      const jobs: [number, number][] = [[3, 2], [2, 4]];
      const res = minimizeLatenessValidator.validate(jobs, 3);
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('Solución subóptima');
    });

    it('rejects negative durations or deadlines', () => {
      const invalid: [number, number][] = [[-1, 10]];
      const res = minimizeLatenessValidator.validate(invalid, 0);
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('negativos no permitidos');
    });
  });

  describe('7. dijkstraValidator', () => {
    const graph: Record<string, [string, number][]> = {
      A: [['B', 1], ['C', 4]],
      B: [['C', 2], ['D', 5]],
      C: [['D', 1]],
      D: []
    };

    it('validates shortest path distances from source', () => {
      expect(solveDijkstra(graph, 'A')['D']).toBe(4);
      const correctDists = { A: 0, B: 1, C: 3, D: 4 };
      const res = dijkstraValidator.validate({ graph, source: 'A' }, correctDists);
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    it('rejects non-zero distance from source to itself', () => {
      const wrongSource = { A: 2, B: 1, C: 3, D: 4 };
      const res = dijkstraValidator.validate({ graph, source: 'A' }, wrongSource);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes('origen'))).toBe(true);
    });

    it('rejects negative edge weights as invalid for Dijkstra', () => {
      const negGraph: Record<string, [string, number][]> = {
        A: [['B', -2]],
        B: []
      };
      const res = dijkstraValidator.validate({ graph: negGraph, source: 'A' }, { A: 0, B: -2 });
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('negativo');
    });

    it('rejects missing source node in graph', () => {
      const res = dijkstraValidator.validate({ graph, source: 'Z' }, {});
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('no existe');
    });
  });

  describe('8. kruskalValidator', () => {
    const triangleEdges: [number, number, number][] = [
      [0, 1, 1],
      [1, 2, 2],
      [0, 2, 3]
    ];

    it('validates minimal spanning tree cost and edge count', () => {
      expect(solveKruskalMst(3, triangleEdges).totalCost).toBe(3);
      const res = kruskalValidator.validate(
        { numVertices: 3, edges: triangleEdges },
        [3, [[0, 1, 1], [1, 2, 2]]]
      );
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    it('rejects suboptimal MST total cost', () => {
      const res = kruskalValidator.validate(
        { numVertices: 3, edges: triangleEdges },
        5
      );
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('Costo subóptimo');
    });

    it('rejects edge selections forming cycles', () => {
      const cyclicEdges: [number, number, number][] = [
        [0, 1, 1],
        [1, 2, 2],
        [0, 2, 3]
      ];
      const res = kruskalValidator.validate(
        { numVertices: 3, edges: triangleEdges },
        [6, cyclicEdges]
      );
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes('Ciclo'))).toBe(true);
    });

    it('rejects vertex index out of bounds', () => {
      const outOfBounds: [number, number, number][] = [[0, 5, 2]];
      const res = kruskalValidator.validate({ numVertices: 3, edges: outOfBounds }, 2);
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('fuera de rango');
    });
  });

  describe('9. segmentedLeastSquaresValidator', () => {
    it('validates collinear points with zero regression error', () => {
      const pts: [number, number][] = [[1, 1], [2, 2], [3, 3]];
      expect(solveSegmentedLeastSquares(pts, 5.0).optimalCost).toBe(5.0);
      const res = segmentedLeastSquaresValidator.validate({ points: pts, penaltyC: 5.0 }, 5.0);
      expect(res.valid).toBe(true);
    });

    it('validates two-step segment fitting', () => {
      const pts: [number, number][] = [[0, 0], [1, 0], [2, 10], [3, 10]];
      const res = segmentedLeastSquaresValidator.validate({ points: pts, penaltyC: 1.0 }, 2.0);
      expect(res.valid).toBe(true);
    });

    it('rejects suboptimal cost', () => {
      const pts: [number, number][] = [[1, 1], [2, 2], [3, 3]];
      const res = segmentedLeastSquaresValidator.validate({ points: pts, penaltyC: 5.0 }, 10.0);
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('Costo subóptimo');
    });

    it('rejects negative penalty C', () => {
      const pts: [number, number][] = [[1, 1]];
      const res = segmentedLeastSquaresValidator.validate({ points: pts, penaltyC: -2.0 }, 0);
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('no negativo');
    });
  });

  describe('10. rnaSecondaryStructureValidator', () => {
    it('validates optimal hairpin structure with separation >= 5', () => {
      // "ACCCCU": pair (0, 5) with gap 5
      expect(solveRnaSecondaryStructure('ACCCCU')).toBe(1);
      const res = rnaSecondaryStructureValidator.validate('ACCCCU', 1);
      expect(res.valid).toBe(true);
    });

    it('validates short sequence (< 5 bases) yielding 0 pairs', () => {
      const res = rnaSecondaryStructureValidator.validate('ACGU', 0);
      expect(res.valid).toBe(true);
    });

    it('rejects insufficient base pairs reported', () => {
      const res = rnaSecondaryStructureValidator.validate('ACCCCU', 0);
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('Solución subóptima');
    });

    it('rejects biological gap violations (< 5 intervening separation)', () => {
      const res = rnaSecondaryStructureValidator.validate('ACGU', [[0, 3]]);
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes('separación biológica'))).toBe(true);
    });

    it('rejects non-RNA invalid bases', () => {
      const res = rnaSecondaryStructureValidator.validate('ACGT', 0); // 'T' is DNA, not RNA
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('inválida');
    });
  });

  describe('11. bellmanFordValidator', () => {
    const edgesWithoutCycle: [number, number, number][] = [
      [0, 1, -1],
      [1, 2, 3],
      [0, 2, 4]
    ];

    it('validates correct shortest path distances with negative weights and no negative cycle', () => {
      expect(solveBellmanFord(3, edgesWithoutCycle, 0).hasNegativeCycle).toBe(false);
      const dists = { 0: 0, 1: -1, 2: 2 };
      const res = bellmanFordValidator.validate(
        { numVertices: 3, edges: edgesWithoutCycle, source: 0 },
        [dists, false]
      );
      expect(res.valid).toBe(true);
      expect(res.errors).toHaveLength(0);
    });

    it('validates detection of negative cycle', () => {
      const edgesWithCycle: [number, number, number][] = [
        [0, 1, 1],
        [1, 2, -3],
        [2, 0, -1]
      ];
      const res = bellmanFordValidator.validate(
        { numVertices: 3, edges: edgesWithCycle, source: 0 },
        [{}, true]
      );
      expect(res.valid).toBe(true);
    });

    it('rejects false negative when negative cycle is missed', () => {
      const edgesWithCycle: [number, number, number][] = [
        [0, 1, 1],
        [1, 2, -3],
        [2, 0, -1]
      ];
      const res = bellmanFordValidator.validate(
        { numVertices: 3, edges: edgesWithCycle, source: 0 },
        [{ 0: 0, 1: 1, 2: -2 }, false]
      );
      expect(res.valid).toBe(false);
      expect(res.errors.some((e) => e.includes('Falso negativo'))).toBe(true);
    });

    it('rejects source index out of bounds', () => {
      const res = bellmanFordValidator.validate(
        { numVertices: 3, edges: edgesWithoutCycle, source: 5 },
        [{}, false]
      );
      expect(res.valid).toBe(false);
      expect(res.errors[0]).toContain('rango');
    });
  });
});
