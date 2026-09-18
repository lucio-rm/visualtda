import { LocalizedString } from '../../types/category';
import { TraceEvent, TraceTimeline } from '../../types/trace';

export type RoadAntennasAction =
  | 'INIT'
  | 'SORT'
  | 'IDENTIFY_UNCOVERED'
  | 'PLACE_ANTENNA'
  | 'SWEEP_COVERED'
  | 'COMPLETE';

export interface RoadAntennasTraceStep {
  step: number;
  action: RoadAntennasAction;
  houses: number[];
  radius: number;
  antennas: number[];
  currentHouseIndex: number | null;
  newAntennaPos: number | null;
  coveredHouseIndices: number[];
  justCoveredIndices: number[];
  description: LocalizedString;
}

export function generateRoadAntennasTrace(
  rawHouses: number[],
  radius: number
): TraceTimeline<RoadAntennasTraceStep> {
  const steps: RoadAntennasTraceStep[] = [];
  let stepCount = 0;

  // Step 0: INIT with original order
  steps.push({
    step: stepCount++,
    action: 'INIT',
    houses: [...rawHouses],
    radius,
    antennas: [],
    currentHouseIndex: null,
    newAntennaPos: null,
    coveredHouseIndices: [],
    justCoveredIndices: [],
    description: {
      es: `Estado inicial: Se reciben ${rawHouses.length} casas dispersas a lo largo de la ruta con radio de antena R = ${radius} km.`,
      en: `Initial state: Received ${rawHouses.length} scattered houses along the highway with antenna radius R = ${radius} km.`
    }
  });

  // Step 1: SORT houses ascending
  const sorted = [...rawHouses].sort((a, b) => a - b);
  steps.push({
    step: stepCount++,
    action: 'SORT',
    houses: sorted,
    radius,
    antennas: [],
    currentHouseIndex: null,
    newAntennaPos: null,
    coveredHouseIndices: [],
    justCoveredIndices: [],
    description: {
      es: `Ordenamiento O(n log n): Se ordenan las casas de izquierda a derecha para procesar secuencialmente la frontera de cobertura.`,
      en: `Sorting O(n log n): Houses are sorted from left to right to sequentially process the coverage frontier.`
    }
  });

  const antennas: number[] = [];
  const coveredIndicesSet = new Set<number>();
  let i = 0;
  const n = sorted.length;

  while (i < n) {
    const firstUncoveredIdx = i;
    const firstUncoveredHouse = sorted[firstUncoveredIdx];

    // Step: IDENTIFY_UNCOVERED
    steps.push({
      step: stepCount++,
      action: 'IDENTIFY_UNCOVERED',
      houses: sorted,
      radius,
      antennas: [...antennas],
      currentHouseIndex: firstUncoveredIdx,
      newAntennaPos: null,
      coveredHouseIndices: Array.from(coveredIndicesSet),
      justCoveredIndices: [],
      description: {
        es: `Casa sin cobertura: La casa más a la izquierda descubierta está en el km ${firstUncoveredHouse}. Requiere una antena a lo sumo a ${firstUncoveredHouse + radius} km.`,
        en: `Uncovered house: Leftmost uncovered house is at km ${firstUncoveredHouse}. Requires an antenna at most at ${firstUncoveredHouse + radius} km.`
      }
    });

    // Step: PLACE_ANTENNA (Greedy Choice)
    const antennaPos = firstUncoveredHouse + radius;
    antennas.push(antennaPos);

    steps.push({
      step: stepCount++,
      action: 'PLACE_ANTENNA',
      houses: sorted,
      radius,
      antennas: [...antennas],
      currentHouseIndex: firstUncoveredIdx,
      newAntennaPos: antennaPos,
      coveredHouseIndices: Array.from(coveredIndicesSet),
      justCoveredIndices: [],
      description: {
        es: `Elección Greedy: Colocamos antena en km ${antennaPos} (${firstUncoveredHouse} + ${radius}). Maximiza el alcance hacia adelante [${firstUncoveredHouse}, ${antennaPos + radius}] sin dejar desprotegida la casa del km ${firstUncoveredHouse}.`,
        en: `Greedy choice: Place antenna at km ${antennaPos} (${firstUncoveredHouse} + ${radius}). Maximizes forward reach [${firstUncoveredHouse}, ${antennaPos + radius}] without leaving house at km ${firstUncoveredHouse} uncovered.`
      }
    });

    // Step: SWEEP_COVERED
    const maxReach = antennaPos + radius;
    const justCovered: number[] = [];

    while (i < n && sorted[i] <= maxReach) {
      coveredIndicesSet.add(i);
      justCovered.push(i);
      i++;
    }

    steps.push({
      step: stepCount++,
      action: 'SWEEP_COVERED',
      houses: sorted,
      radius,
      antennas: [...antennas],
      currentHouseIndex: null,
      newAntennaPos: antennaPos,
      coveredHouseIndices: Array.from(coveredIndicesSet),
      justCoveredIndices: justCovered,
      description: {
        es: `Cobertura activa: La antena en km ${antennaPos} cubre ${justCovered.length} casa(s) en el intervalo [${antennaPos - radius}, ${maxReach}]: km [${justCovered.map((idx) => sorted[idx]).join(', ')}].`,
        en: `Active coverage: Antenna at km ${antennaPos} covers ${justCovered.length} house(s) in span [${antennaPos - radius}, ${maxReach}]: km [${justCovered.map((idx) => sorted[idx]).join(', ')}].`
      }
    });
  }

  // Step: COMPLETE
  steps.push({
    step: stepCount++,
    action: 'COMPLETE',
    houses: sorted,
    radius,
    antennas: [...antennas],
    currentHouseIndex: null,
    newAntennaPos: null,
    coveredHouseIndices: Array.from(coveredIndicesSet),
    justCoveredIndices: [],
    description: {
      es: `¡Cobertura total óptima alcanzada! Todas las ${n} casas están cubiertas utilizando únicamente ${antennas.length} antena(s). Ninguna solución factible puede usar menos antenas.`,
      en: `Optimal full coverage achieved! All ${n} houses are covered using only ${antennas.length} antenna(s). No feasible solution can use fewer antennas.`
    }
  });

  const events: TraceEvent<RoadAntennasTraceStep>[] = steps.map((s) => ({
    step: s.step,
    type: s.action,
    message: s.description,
    data: s
  }));

  return {
    events,
    totalSteps: events.length
  };
}
