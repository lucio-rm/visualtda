import { describe, it, expect } from 'vitest';
import {
  knapsackGreedyValidator,
  FractionalAssignment,
  FractionalKnapsackInput
} from '../src/engine/algorithms/knapsackGreedyValidator';
import {
  generateKnapsackGreedyTrace,
  DEFAULT_GREEDY_ITEMS,
  DEFAULT_GREEDY_CAPACITY
} from '../src/engine/algorithms/knapsackGreedyTrace';

describe('KnapsackGreedyValidator', () => {
  const input: FractionalKnapsackInput = {
    items: DEFAULT_GREEDY_ITEMS,
    capacity: DEFAULT_GREEDY_CAPACITY
  };

  it('validates optimal fractional allocation (100% item-gold, 100% item-silver, 66.7% item-copper)', () => {
    const optimalAssignments: FractionalAssignment[] = [
      { itemId: 'item-gold', fraction: 1.0 },   // 10kg, 60$
      { itemId: 'item-silver', fraction: 1.0 }, // 20kg, 100$
      { itemId: 'item-copper', fraction: 20 / 30 } // 20kg, 80$ => total weight 50, value 240
    ];

    const result = knapsackGreedyValidator.validate(input, optimalAssignments);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects allocation exceeding backpack capacity', () => {
    const overweight: FractionalAssignment[] = [
      { itemId: 'item-gold', fraction: 1.0 },
      { itemId: 'item-silver', fraction: 1.0 },
      { itemId: 'item-copper', fraction: 1.0 } // total weight 60 > 50
    ];

    const result = knapsackGreedyValidator.validate(input, overweight);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Capacidad excedida'))).toBe(true);
  });

  it('rejects suboptimal fractional allocation', () => {
    const suboptimal: FractionalAssignment[] = [
      { itemId: 'item-copper', fraction: 1.0 }, // 30kg, 120$ (lower density)
      { itemId: 'item-silver', fraction: 1.0 }  // 20kg, 100$ => total weight 50, value 220 < 240
    ];

    const result = knapsackGreedyValidator.validate(input, suboptimal);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Subóptimo'))).toBe(true);
  });

  it('rejects invalid fractions outside [0, 1]', () => {
    const invalidFraction: FractionalAssignment[] = [
      { itemId: 'item-gold', fraction: 1.5 }
    ];

    const result = knapsackGreedyValidator.validate(input, invalidFraction);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Fracción inválida'))).toBe(true);
  });
});

describe('KnapsackGreedyTrace', () => {
  it('generates a complete trace sorted by density with counterexample event', () => {
    const timeline = generateKnapsackGreedyTrace(DEFAULT_GREEDY_ITEMS, DEFAULT_GREEDY_CAPACITY);

    expect(timeline.totalSteps).toBeGreaterThan(5);
    expect(timeline.events[0].type).toBe('init');
    expect(timeline.events[1].type).toBe('sort');

    // Check sort event ordered by density (6.0, 5.0, 4.0)
    const sortedData = timeline.events[1].data;
    expect(sortedData.items[0].id).toBe('item-gold');
    expect(sortedData.items[1].id).toBe('item-silver');
    expect(sortedData.items[2].id).toBe('item-copper');

    // Check counterexample event
    const counterexampleEvent = timeline.events.find((e) => e.type === 'counterexample');
    expect(counterexampleEvent).toBeDefined();
    expect(counterexampleEvent?.data.counterexampleComparison).toBeDefined();
    expect(counterexampleEvent?.data.counterexampleComparison?.dp01Value).toBe(220);
    expect(counterexampleEvent?.data.counterexampleComparison?.greedy01Value).toBe(160);

    // Final event
    const finalEvent = timeline.events[timeline.events.length - 1];
    expect(finalEvent.type).toBe('complete');
    expect(finalEvent.data.totalValue).toBe(240);
    expect(finalEvent.data.totalWeight).toBe(50);
  });
});
