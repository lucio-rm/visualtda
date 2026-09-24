import { TraceTimeline, TraceEvent } from '../../types';

export interface Point2D {
  id: string;
  x: number;
  y: number;
}

export interface FittedSegment {
  startIndex: number;
  endIndex: number;
  a: number;
  b: number;
  error: number;
}

export interface SegmentedLeastSquaresStepData {
  points: Point2D[];
  costC: number;
  currentJ: number;
  currentI: number;
  currentCandidateCost: number | null;
  opt: number[];
  origin: number[];
  optimalSegments: FittedSegment[];
  action: 'INIT' | 'PRECOMPUTE_SEGMENT' | 'UPDATE_DP' | 'RECONSTRUCT' | 'COMPLETE';
  description: { es: string; en: string };
}

export const DEFAULT_SLS_POINTS: Point2D[] = [
  { id: 'p1', x: 1, y: 1.2 },
  { id: 'p2', x: 2, y: 1.9 },
  { id: 'p3', x: 3, y: 3.1 },
  { id: 'p4', x: 5, y: 7.2 },
  { id: 'p5', x: 6, y: 9.1 },
  { id: 'p6', x: 7, y: 11.0 },
  { id: 'p7', x: 9, y: 4.8 },
  { id: 'p8', x: 10, y: 2.9 }
];

export function fitLineSegment(points: Point2D[], i: number, j: number): { a: number; b: number; error: number } {
  const pts = points.slice(i, j + 1);
  const k = pts.length;
  if (k <= 2) {
    if (k === 1) return { a: 0, b: pts[0].y, error: 0 };
    const dx = pts[1].x - pts[0].x;
    const a = dx !== 0 ? (pts[1].y - pts[0].y) / dx : 0;
    const b = pts[0].y - a * pts[0].x;
    return { a, b, error: 0 };
  }

  const sumX = pts.reduce((acc, p) => acc + p.x, 0);
  const sumY = pts.reduce((acc, p) => acc + p.y, 0);
  const sumXY = pts.reduce((acc, p) => acc + p.x * p.y, 0);
  const sumX2 = pts.reduce((acc, p) => acc + p.x * p.x, 0);
  const den = k * sumX2 - sumX * sumX;

  let a = 0;
  let b = sumY / k;
  if (Math.abs(den) > 1e-9) {
    a = (k * sumXY - sumX * sumY) / den;
    b = (sumY - a * sumX) / k;
  }

  const error = pts.reduce((acc, p) => acc + Math.pow(p.y - (a * p.x + b), 2), 0);
  return { a, b, error: Math.round(error * 100) / 100 };
}

export function generateSegmentedLeastSquaresTrace(
  inputPoints: Point2D[] = DEFAULT_SLS_POINTS,
  costC: number = 3.5
): TraceTimeline<SegmentedLeastSquaresStepData> {
  const events: TraceEvent<SegmentedLeastSquaresStepData>[] = [];
  const points = [...inputPoints].sort((a, b) => a.x - b.x);
  const n = points.length;

  let eventCounter = 0;

  // Precompute errors e[i][j] (0-indexed)
  const e: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  const segmentFits: FittedSegment[][] = Array.from({ length: n }, () => []);

  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const fit = fitLineSegment(points, i, j);
      e[i][j] = fit.error;
      segmentFits[i][j] = {
        startIndex: i,
        endIndex: j,
        a: fit.a,
        b: fit.b,
        error: fit.error
      };
    }
  }

  const opt = Array(n + 1).fill(0);
  const origin = Array(n + 1).fill(0);

  function pushEvent(
    action: SegmentedLeastSquaresStepData['action'],
    curJ: number,
    curI: number,
    candidateCost: number | null,
    segs: FittedSegment[],
    descEs: string,
    descEn: string
  ) {
    events.push({
      step: eventCounter++,
      type: action,
      message: { es: descEs, en: descEn },
      data: {
        points: [...points],
        costC,
        currentJ: curJ,
        currentI: curI,
        currentCandidateCost: candidateCost,
        opt: [...opt],
        origin: [...origin],
        optimalSegments: [...segs],
        action,
        description: { es: descEs, en: descEn }
      }
    });
  }

  // 1. Initial State
  pushEvent(
    'INIT',
    0,
    0,
    null,
    [],
    `Instancia de Mínimos Cuadrados Segmentados: ${n} puntos en el plano. Penalización por nuevo segmento: C = ${costC}. Buscamos balancear error cuadrático total y cantidad de segmentos.`,
    `Segmented Least Squares instance: ${n} points. Segment penalty: C = ${costC}. Balancing total squared error vs number of segments.`
  );

  // 2. Compute DP
  for (let j = 1; j <= n; j++) {
    let minCost = Infinity;
    let bestI = 1;

    for (let i = 1; i <= j; i++) {
      const segErr = e[i - 1][j - 1];
      const cand = Math.round((segErr + costC + opt[i - 1]) * 100) / 100;

      pushEvent(
        'PRECOMPUTE_SEGMENT',
        j,
        i,
        cand,
        [],
        `Evaluando partición de puntos p_${i}..p_${j}: Error e_${i},${j} = ${segErr} + penalización C (${costC}) + OPT(${i-1}) = ${cand}.`,
        `Testing segment partition p_${i}..p_${j}: Error e_${i},${j} = ${segErr} + penalty C (${costC}) + OPT(${i-1}) = ${cand}.`
      );

      if (cand < minCost) {
        minCost = cand;
        bestI = i;
      }
    }

    opt[j] = minCost;
    origin[j] = bestI;

    pushEvent(
      'UPDATE_DP',
      j,
      bestI,
      minCost,
      [],
      `Óptimo calculado para los primeros ${j} puntos: OPT(${j}) = ${minCost} (segmento óptimo final comienza en p_${bestI}).`,
      `Optimal computed for first ${j} points: OPT(${j}) = ${minCost} (optimal segment starts at p_${bestI}).`
    );
  }

  // 3. Reconstruct
  const finalSegments: FittedSegment[] = [];
  let curr = n;
  while (curr > 0) {
    const startIdx = origin[curr] - 1;
    const endIdx = curr - 1;
    finalSegments.unshift(segmentFits[startIdx][endIdx]);
    curr = origin[curr] - 1;
  }

  pushEvent(
    'RECONSTRUCT',
    n,
    origin[n],
    opt[n],
    finalSegments,
    `Reconstrucción de segmentos óptimos completada: ${finalSegments.length} segmentos encontrados siguiendo el puntero de origen.`,
    `Optimal segments reconstructed: ${finalSegments.length} segments found by tracing back origins.`
  );

  // 4. Complete
  pushEvent(
    'COMPLETE',
    n,
    origin[n],
    opt[n],
    finalSegments,
    `Solución óptima hallada: Costo total = ${opt[n]} (${finalSegments.length} segmentos). Complejidad: O(n²) subproblemas con transiciones lineales ⇒ O(n²) tiempo y O(n) espacio para OPT.`,
    `Optimal solution found: Total cost = ${opt[n]} (${finalSegments.length} segments). Complexity: O(n²) time and O(n) space.`
  );

  return {
    events,
    totalSteps: events.length
  };
}
