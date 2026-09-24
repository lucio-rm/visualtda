import { TraceTimeline, TraceEvent } from '../../types';

export interface Point2D {
  id: string;
  x: number;
  y: number;
}

export interface ClosestPairStepData {
  points: Point2D[];
  splitX: number | null;
  delta: number;
  bestPair: [Point2D, Point2D] | null;
  stripPoints: Point2D[];
  activePair: [Point2D, Point2D] | null;
  action: 'INIT' | 'DIVIDE' | 'SOLVE_HALF' | 'MERGE_STRIP' | 'COMPARE_STRIP' | 'UPDATE_BEST' | 'COMPLETE';
  description: { es: string; en: string };
}

export const DEFAULT_CLOSEST_PAIR_POINTS: Point2D[] = [
  { id: 'p1', x: 50, y: 180 },
  { id: 'p2', x: 90, y: 70 },
  { id: 'p3', x: 130, y: 220 },
  { id: 'p4', x: 180, y: 120 },
  { id: 'p5', x: 230, y: 140 },
  { id: 'p6', x: 280, y: 80 },
  { id: 'p7', x: 340, y: 200 },
  { id: 'p8', x: 410, y: 110 }
];

function dist(p1: Point2D, p2: Point2D): number {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

export function generateClosestPairTrace(
  points = DEFAULT_CLOSEST_PAIR_POINTS
): TraceTimeline<ClosestPairStepData> {
  const events: TraceEvent<ClosestPairStepData>[] = [];
  const sortedByX = [...points].sort((a, b) => a.x - b.x);

  let eventCounter = 0;
  let globalDelta = Infinity;
  let globalBestPair: [Point2D, Point2D] | null = null;

  function pushEvent(
    action: ClosestPairStepData['action'],
    splitX: number | null,
    delta: number,
    bestPair: [Point2D, Point2D] | null,
    strip: Point2D[],
    activePair: [Point2D, Point2D] | null,
    descEs: string,
    descEn: string
  ) {
    events.push({
      step: eventCounter++,
      type: action,
      message: { es: descEs, en: descEn },
      data: {
        points: sortedByX,
        splitX,
        delta: Math.round(delta * 10) / 10,
        bestPair,
        stripPoints: strip,
        activePair,
        action,
        description: { es: descEs, en: descEn }
      }
    });
  }

  pushEvent(
    'INIT',
    null,
    Infinity,
    null,
    [],
    null,
    `Conjunto de ${sortedByX.length} puntos en el plano 2D ordenados por coordenada X.`,
    `Set of ${sortedByX.length} 2D points sorted by X coordinate.`
  );

  function recurse(sub: Point2D[]): { delta: number; pair: [Point2D, Point2D] | null } {
    if (sub.length <= 3) {
      let localMin = Infinity;
      let localPair: [Point2D, Point2D] | null = null;
      for (let i = 0; i < sub.length; i++) {
        for (let j = i + 1; j < sub.length; j++) {
          const d = dist(sub[i], sub[j]);
          if (d < localMin) {
            localMin = d;
            localPair = [sub[i], sub[j]];
          }
        }
      }
      if (localPair && localMin < globalDelta) {
        globalDelta = localMin;
        globalBestPair = localPair;
        pushEvent(
          'UPDATE_BEST',
          null,
          globalDelta,
          globalBestPair,
          [],
          localPair,
          `Caso base (n=${sub.length}): Mejor par local (${localPair[0].id}, ${localPair[1].id}) con distancia ${Math.round(localMin * 10) / 10}.`,
          `Base case (n=${sub.length}): Local best pair (${localPair[0].id}, ${localPair[1].id}) with distance ${Math.round(localMin * 10) / 10}.`
        );
      }
      return { delta: localMin, pair: localPair };
    }

    const midIdx = Math.floor(sub.length / 2);
    const midPoint = sub[midIdx];
    const leftSub = sub.slice(0, midIdx);
    const rightSub = sub.slice(midIdx);

    pushEvent(
      'DIVIDE',
      midPoint.x,
      globalDelta,
      globalBestPair,
      [],
      null,
      `División: Línea vertical x = ${midPoint.x}. Se particiona el subplano en Izquierda (${leftSub.length} puntos) y Derecha (${rightSub.length} puntos).`,
      `Divide: Vertical line x = ${midPoint.x}. Plane partitioned into Left (${leftSub.length} pts) and Right (${rightSub.length} pts).`
    );

    const leftRes = recurse(leftSub);
    const rightRes = recurse(rightSub);

    let dMin = Math.min(leftRes.delta, rightRes.delta);
    let best = leftRes.delta <= rightRes.delta ? leftRes.pair : rightRes.pair;

    if (dMin < globalDelta) {
      globalDelta = dMin;
      globalBestPair = best;
    }

    // Inspect strip around midPoint.x
    const strip = sub.filter((p) => Math.abs(p.x - midPoint.x) < globalDelta);
    strip.sort((a, b) => a.y - b.y);

    pushEvent(
      'MERGE_STRIP',
      midPoint.x,
      globalDelta,
      globalBestPair,
      strip,
      null,
      `Fusión en Banda δ: Se construye la franja [x_mid - δ, x_mid + δ] con ${strip.length} puntos ordenados por Y. δ = ${Math.round(globalDelta * 10) / 10}.`,
      `Strip Merge: Constructing band [x_mid - δ, x_mid + δ] with ${strip.length} points sorted by Y. δ = ${Math.round(globalDelta * 10) / 10}.`
    );

    for (let i = 0; i < strip.length; i++) {
      for (let j = i + 1; j < strip.length && strip[j].y - strip[i].y < globalDelta; j++) {
        const d = dist(strip[i], strip[j]);
        pushEvent(
          'COMPARE_STRIP',
          midPoint.x,
          globalDelta,
          globalBestPair,
          strip,
          [strip[i], strip[j]],
          `Comparando en banda (${strip[i].id} con ${strip[j].id}): distancia = ${Math.round(d * 10) / 10}.`,
          `Comparing strip pair (${strip[i].id} and ${strip[j].id}): distance = ${Math.round(d * 10) / 10}.`
        );

        if (d < globalDelta) {
          globalDelta = d;
          globalBestPair = [strip[i], strip[j]];
          dMin = d;
          best = [strip[i], strip[j]];

          pushEvent(
            'UPDATE_BEST',
            midPoint.x,
            globalDelta,
            globalBestPair,
            strip,
            [strip[i], strip[j]],
            `¡Nuevo par más cercano transversal hallado! (${strip[i].id}, ${strip[j].id}) con distancia δ = ${Math.round(globalDelta * 10) / 10}.`,
            `New cross closest pair found! (${strip[i].id}, ${strip[j].id}) with distance δ = ${Math.round(globalDelta * 10) / 10}.`
          );
        }
      }
    }

    return { delta: dMin, pair: best };
  }

  recurse(sortedByX);

  const pA = globalBestPair ? (globalBestPair[0] as Point2D).id : '?';
  const pB = globalBestPair ? (globalBestPair[1] as Point2D).id : '?';

  pushEvent(
    'COMPLETE',
    null,
    globalDelta,
    globalBestPair,
    [],
    null,
    `Par más cercano encontrado: (${pA}, ${pB}) con distancia mínima global d = ${Math.round(globalDelta * 10) / 10}.`,
    `Closest pair found: (${pA}, ${pB}) with global minimal distance d = ${Math.round(globalDelta * 10) / 10}.`
  );

  return {
    events,
    totalSteps: events.length
  };
}
