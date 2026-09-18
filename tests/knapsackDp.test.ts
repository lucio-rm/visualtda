import { describe, it, expect } from 'vitest';
import {
  knapsackDpValidator,
  KnapsackItem,
  KnapsackInput
} from '../src/engine/algorithms/knapsackDpValidator';
import {
  generateKnapsackDpTrace,
  DEFAULT_DP_ITEMS,
  DEFAULT_DP_CAPACITY
} from '../src/engine/algorithms/knapsackDpTrace';

describe('KnapsackDpValidator', () => {
  const sampleItems: KnapsackItem[] = [
    { id: 'it-1', name: 'Guitarra', weight: 1, value: 15 },
    { id: 'it-2', name: 'Celular', weight: 1, value: 20 },
    { id: 'it-3', name: 'Laptop', weight: 3, value: 20 },
    { id: 'it-4', name: 'Stereo', weight: 4, value: 30 }
  ];
  const capacity = 6;
  const input: KnapsackInput = { items: sampleItems, capacity };

  it('validates optimal selection (Guitarra + Celular + Stereo = weight 6, value 65)', () => {
    const optimalSelection: KnapsackItem[] = [
      sampleItems[0], // weight 1, value 15
      sampleItems[1], // weight 1, value 20
      sampleItems[3]  // weight 4, value 30
    ];
    const result = knapsackDpValidator.validate(input, optimalSelection);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects selection that exceeds backpack capacity', () => {
    const overweightSelection: KnapsackItem[] = [
      sampleItems[1], // 1
      sampleItems[2], // 3
      sampleItems[3]  // 4 => total weight 8 > 6
    ];
    const result = knapsackDpValidator.validate(input, overweightSelection);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Capacidad excedida'))).toBe(true);
  });

  it('rejects feasible but suboptimal selection', () => {
    const subopt: KnapsackItem[] = [
      sampleItems[0], // Guitarra: 1, 15
      sampleItems[2]  // Laptop: 3, 20 => total weight 4, value 35 < 65
    ];
    const result = knapsackDpValidator.validate(input, subopt);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Subóptimo'))).toBe(true);
  });

  it('rejects duplicated or foreign items', () => {
    const duplicatedSelection: KnapsackItem[] = [
      sampleItems[0],
      sampleItems[0] // duplicated
    ];
    const result = knapsackDpValidator.validate(input, duplicatedSelection);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('duplicado'))).toBe(true);
  });

  it('handles edge case: empty items or 0 capacity', () => {
    const emptyResult = knapsackDpValidator.validate({ items: [], capacity: 10 }, []);
    expect(emptyResult.valid).toBe(true);

    const zeroCapResult = knapsackDpValidator.validate({ items: sampleItems, capacity: 0 }, []);
    expect(zeroCapResult.valid).toBe(true);
  });
});

describe('KnapsackDpTrace', () => {
  it('generates a deterministic trace timeline with DP table and reconstruction', () => {
    const timeline = generateKnapsackDpTrace(DEFAULT_DP_ITEMS, DEFAULT_DP_CAPACITY);

    expect(timeline.totalSteps).toBeGreaterThan(20);
    expect(timeline.events[0].type).toBe('init');
    expect(timeline.events[1].type).toBe('base_case');

    const lastEvent = timeline.events[timeline.events.length - 1];
    expect(lastEvent.type).toBe('complete');
    expect(lastEvent.data.totalWeight).toBeLessThanOrEqual(DEFAULT_DP_CAPACITY);
    expect(lastEvent.data.totalValue).toBe(65);

    // Verify reconstruction events exist
    const reconstructionEvents = timeline.events.filter((e) => e.type === 'reconstruct');
    expect(reconstructionEvents.length).toBe(DEFAULT_DP_ITEMS.length);
  });

  it('correctly tracks cell comparisons and values in DP matrix', () => {
    const timeline = generateKnapsackDpTrace(DEFAULT_DP_ITEMS, DEFAULT_DP_CAPACITY);
    const compareEvents = timeline.events.filter((e) => e.type === 'compare');

    expect(compareEvents.length).toBeGreaterThan(0);
    for (const ev of compareEvents) {
      expect(ev.data.highlightTarget).toBeDefined();
      expect(ev.data.comparison).toBeDefined();
      expect(['exclude', 'include']).toContain(ev.data.comparison?.chosen);
    }
  });
});
