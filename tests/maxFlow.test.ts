import { describe, it, expect } from 'vitest';
import {
  maxFlowValidator,
  FlowNetworkInput,
  FlowOutput
} from '../src/engine/algorithms/maxFlowValidator';
import {
  generateMaxFlowTrace,
  DEFAULT_FLOW_NETWORK
} from '../src/engine/algorithms/maxFlowTrace';

describe('MaxFlowValidator', () => {
  const network: FlowNetworkInput = DEFAULT_FLOW_NETWORK;

  it('validates a correct maximum flow with min-cut duality', () => {
    const validOutput: FlowOutput = {
      maxFlow: 20,
      edgeFlows: {
        's->u': 10,
        's->v': 10,
        'u->v': 0,
        'u->t': 10,
        'v->t': 10
      },
      minCutS: ['s'],
      minCutT: ['u', 'v', 't']
    };

    const result = maxFlowValidator.validate(network, validOutput);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects flow exceeding edge capacity', () => {
    const overweight: FlowOutput = {
      maxFlow: 22,
      edgeFlows: {
        's->u': 12, // capacity is 10!
        's->v': 10,
        'u->v': 0,
        'u->t': 12,
        'v->t': 10
      }
    };

    const result = maxFlowValidator.validate(network, overweight);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Capacidad excedida'))).toBe(true);
  });

  it('rejects flow violating conservation of flow at node u', () => {
    const brokenConservation: FlowOutput = {
      maxFlow: 20,
      edgeFlows: {
        's->u': 10, // in to u: 10
        's->v': 10,
        'u->v': 0,
        'u->t': 8,  // out from u: 8 != 10!
        'v->t': 10
      }
    };

    const result = maxFlowValidator.validate(network, brokenConservation);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Infracción de conservación'))).toBe(true);
  });

  it('rejects suboptimal flow value', () => {
    const suboptimal: FlowOutput = {
      maxFlow: 10,
      edgeFlows: {
        's->u': 10,
        's->v': 0,
        'u->v': 0,
        'u->t': 10,
        'v->t': 0
      }
    };

    const result = maxFlowValidator.validate(network, suboptimal);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Subóptimo'))).toBe(true);
  });
});

describe('MaxFlowTrace', () => {
  it('generates a complete trace with augmenting paths and min-cut', () => {
    const timeline = generateMaxFlowTrace(DEFAULT_FLOW_NETWORK);

    expect(timeline.totalSteps).toBeGreaterThan(6);
    expect(timeline.events[0].type).toBe('init');

    const pathEvents = timeline.events.filter((e) => e.type === 'path_found');
    expect(pathEvents.length).toBeGreaterThanOrEqual(2);

    const minCutEvent = timeline.events.find((e) => e.type === 'min_cut');
    expect(minCutEvent).toBeDefined();
    expect(minCutEvent?.data.minCutCapacity).toBe(20);
    expect(minCutEvent?.data.currentFlow).toBe(20);

    const lastEvent = timeline.events[timeline.events.length - 1];
    expect(lastEvent.type).toBe('complete');
    expect(lastEvent.data.currentFlow).toBe(20);
  });
});
