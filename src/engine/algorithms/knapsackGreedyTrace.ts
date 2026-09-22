import { TraceEvent, TraceTimeline } from '../../types/trace';
import { KnapsackItem } from './knapsackDpValidator';

export interface GreedyItemState extends KnapsackItem {
  ratio: number;
  fractionTaken: number; // 0.0 to 1.0
  weightTaken: number;
  valueTaken: number;
  status: 'pending' | 'evaluating' | 'taken_full' | 'taken_partial' | 'skipped';
}

export interface KnapsackGreedyStepData {
  items: GreedyItemState[];
  capacity: number;
  remainingCapacity: number;
  totalWeight: number;
  totalValue: number;
  currentIndex: number;
  currentPhase: 'init' | 'sorted' | 'evaluating' | 'allocated' | 'counterexample' | 'complete';
  counterexampleComparison?: {
    fractionalValue: number;
    greedy01Value: number;
    greedy01Items: string[];
    dp01Value: number;
    dp01Items: string[];
    gap: number;
  };
}

export const DEFAULT_GREEDY_ITEMS: KnapsackItem[] = [
  { id: 'item-gold', name: 'Oro en polvo (A)', weight: 10, value: 60 },     // ratio 6.0
  { id: 'item-silver', name: 'Plata en polvo (B)', weight: 20, value: 100 }, // ratio 5.0
  { id: 'item-copper', name: 'Cobre en polvo (C)', weight: 30, value: 120 }  // ratio 4.0
];

export const DEFAULT_GREEDY_CAPACITY = 50;

export function generateKnapsackGreedyTrace(
  rawItems: KnapsackItem[] = DEFAULT_GREEDY_ITEMS,
  capacity: number = DEFAULT_GREEDY_CAPACITY
): TraceTimeline<KnapsackGreedyStepData> {
  const events: TraceEvent<KnapsackGreedyStepData>[] = [];

  const baseItems: GreedyItemState[] = rawItems.map((it) => ({
    ...it,
    ratio: it.weight > 0 ? it.value / it.weight : 0,
    fractionTaken: 0,
    weightTaken: 0,
    valueTaken: 0,
    status: 'pending'
  }));

  let stepIndex = 0;

  // 1. Initial event
  events.push({
    step: stepIndex++,
    type: 'init',
    message: {
      es: `Cargando ${baseItems.length} ítems para la Mochila Fraccionaria. Capacidad disponible: ${capacity} kg.`,
      en: `Loading ${baseItems.length} items for Fractional Knapsack. Total capacity: ${capacity} kg.`
    },
    data: {
      items: baseItems.map((it) => ({ ...it })),
      capacity,
      remainingCapacity: capacity,
      totalWeight: 0,
      totalValue: 0,
      currentIndex: -1,
      currentPhase: 'init'
    }
  });

  // 2. Sort by ratio descending
  const sortedItems = [...baseItems].sort((a, b) => b.ratio - a.ratio);

  events.push({
    step: stepIndex++,
    type: 'sort',
    message: {
      es: 'Regla Greedy: Calculando densidades (valor / peso) y ordenando de mayor a menor.',
      en: 'Greedy Choice: Calculating value/weight density and sorting descending.'
    },
    data: {
      items: sortedItems.map((it) => ({ ...it })),
      capacity,
      remainingCapacity: capacity,
      totalWeight: 0,
      totalValue: 0,
      currentIndex: -1,
      currentPhase: 'sorted'
    }
  });

  let remainingCapacity = capacity;
  let totalWeight = 0;
  let totalValue = 0;

  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i];

    // Evaluating event
    item.status = 'evaluating';
    events.push({
      step: stepIndex++,
      type: 'evaluating',
      message: {
        es: `Evaluando ítem "${item.name}" (densidad ${item.ratio.toFixed(2)} $/kg, peso ${item.weight} kg). Capacidad restante: ${remainingCapacity} kg.`,
        en: `Evaluating item "${item.name}" (density ${item.ratio.toFixed(2)} $/kg, weight ${item.weight} kg). Remaining capacity: ${remainingCapacity} kg.`
      },
      data: {
        items: sortedItems.map((it) => ({ ...it })),
        capacity,
        remainingCapacity,
        totalWeight,
        totalValue,
        currentIndex: i,
        currentPhase: 'evaluating'
      }
    });

    if (remainingCapacity <= 0) {
      item.status = 'skipped';
      events.push({
        step: stepIndex++,
        type: 'skipped',
        message: {
          es: `Mochila llena: Se omite "${item.name}" por falta de capacidad disponible.`,
          en: `Knapsack full: Skipping "${item.name}" due to no remaining capacity.`
        },
        data: {
          items: sortedItems.map((it) => ({ ...it })),
          capacity,
          remainingCapacity,
          totalWeight,
          totalValue,
          currentIndex: i,
          currentPhase: 'allocated'
        }
      });
      continue;
    }

    if (item.weight <= remainingCapacity) {
      // Full item taken
      item.fractionTaken = 1.0;
      item.weightTaken = item.weight;
      item.valueTaken = item.value;
      item.status = 'taken_full';

      remainingCapacity -= item.weight;
      totalWeight += item.weight;
      totalValue += item.value;

      events.push({
        step: stepIndex++,
        type: 'taken_full',
        message: {
          es: `✓ Tomado 100% de "${item.name}". Peso +${item.weight} kg, Valor +$${item.value}. Capacidad restante: ${remainingCapacity} kg.`,
          en: `✓ Took 100% of "${item.name}". Weight +${item.weight} kg, Value +$${item.value}. Remaining: ${remainingCapacity} kg.`
        },
        data: {
          items: sortedItems.map((it) => ({ ...it })),
          capacity,
          remainingCapacity,
          totalWeight,
          totalValue,
          currentIndex: i,
          currentPhase: 'allocated'
        }
      });
    } else {
      // Partial fraction taken
      const fraction = remainingCapacity / item.weight;
      const weightTaken = remainingCapacity;
      const valueTaken = item.value * fraction;

      item.fractionTaken = fraction;
      item.weightTaken = weightTaken;
      item.valueTaken = valueTaken;
      item.status = 'taken_partial';

      totalWeight += weightTaken;
      totalValue += valueTaken;
      remainingCapacity = 0;

      events.push({
        step: stepIndex++,
        type: 'taken_partial',
        message: {
          es: `✓ Tomada fracción ${(fraction * 100).toFixed(1)}% de "${item.name}". Peso +${weightTaken.toFixed(1)} kg, Valor +$${valueTaken.toFixed(1)}. Mochila completada.`,
          en: `✓ Took ${(fraction * 100).toFixed(1)}% fraction of "${item.name}". Weight +${weightTaken.toFixed(1)} kg, Value +$${valueTaken.toFixed(1)}. Knapsack full.`
        },
        data: {
          items: sortedItems.map((it) => ({ ...it })),
          capacity,
          remainingCapacity,
          totalWeight,
          totalValue,
          currentIndex: i,
          currentPhase: 'allocated'
        }
      });
    }
  }

  // Counterexample Callout Event
  events.push({
    step: stepIndex++,
    type: 'counterexample',
    message: {
      es: 'Comparación Clave: ¿Qué pasaría si estuviéramos en la Mochila 0/1 (donde NO se permiten fracciones)?',
      en: 'Key Comparison: What would happen in 0/1 Knapsack (where no fractions are allowed)?'
    },
    data: {
      items: sortedItems.map((it) => ({ ...it })),
      capacity,
      remainingCapacity,
      totalWeight,
      totalValue,
      currentIndex: -1,
      currentPhase: 'counterexample',
      counterexampleComparison: {
        fractionalValue: totalValue,
        greedy01Value: 160,
        greedy01Items: ['Oro en polvo (A)', 'Plata en polvo (B)'],
        dp01Value: 220,
        dp01Items: ['Plata en polvo (B)', 'Cobre en polvo (C)'],
        gap: 60
      }
    }
  });

  // Final completion event
  events.push({
    step: stepIndex,
    type: 'complete',
    message: {
      es: `Finalizado: Mochila Fraccionaria resuelta óptimamente con valor total de $${totalValue.toFixed(1)}.`,
      en: `Complete: Fractional Knapsack solved optimally with total value of $${totalValue.toFixed(1)}.`
    },
    data: {
      items: sortedItems.map((it) => ({ ...it })),
      capacity,
      remainingCapacity,
      totalWeight,
      totalValue,
      currentIndex: -1,
      currentPhase: 'complete'
    }
  });

  return {
    events,
    totalSteps: events.length
  };
}
