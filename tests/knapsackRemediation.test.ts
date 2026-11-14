import { describe, it, expect } from 'vitest';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { knapsackGreedyValidator } from '../src/engine/algorithms/knapsackGreedyValidator';
import { knapsackDpValidator } from '../src/engine/algorithms/knapsackDpValidator';
import { greedyRunners } from '../src/runtime/runners/greedyRunners';
import { dpRunners } from '../src/runtime/runners/dpRunners';
import { PythonExecutionService } from '../src/runtime/pythonExecutionService';

describe('Knapsack Remediation & Regression Tests', () => {
  const repoRoot = path.resolve(__dirname, '..');

  it('verifies knapsack-greedy Python solution handles dicts and objects with mochila_fraccionaria alias', () => {
    const pythonCode = `
import sys
sys.path.insert(0, '${path.join(repoRoot, 'exercises/knapsack-greedy')}')
from solution import fractional_knapsack_greedy, mochila_fraccionaria, Item

# Test with dictionaries
dict_items = [
    {'id': 'item-gold', 'peso': 10, 'valor': 60},
    {'id': 'item-silver', 'peso': 20, 'valor': 100},
    {'id': 'item-copper', 'peso': 30, 'valor': 120}
]
val_dict, res_dict = mochila_fraccionaria(dict_items, 50)
assert abs(val_dict - 240.0) < 1e-4, f"Expected 240.0 but got {val_dict}"
assert len(res_dict) == 3

# Test with Item namedtuples
obj_items = [
    Item('gold', 10, 60),
    Item('silver', 20, 100),
    Item('copper', 30, 120)
]
val_obj, res_obj = fractional_knapsack_greedy(obj_items, 50)
assert abs(val_obj - 240.0) < 1e-4, f"Expected 240.0 but got {val_obj}"
assert len(res_obj) == 3

print("OK_GREEDY")
`;

    const stdout = execFileSync('python3', ['-c', pythonCode], { encoding: 'utf-8' });
    expect(stdout.trim()).toBe('OK_GREEDY');
  });

  it('verifies knapsack-dp Python solution correctly extracts dict attributes without evaluating to 0', () => {
    const pythonCode = `
import sys
sys.path.insert(0, '${path.join(repoRoot, 'exercises/knapsack-dp')}')
from solution import knapsack_dp, mochila_dp, Item

# Test with dictionaries: guitar, stereo, laptop (capacity 4)
dict_items = [
    {'id': 'item-guitar', 'peso': 1, 'valor': 15},
    {'id': 'item-stereo', 'peso': 4, 'valor': 30},
    {'id': 'item-laptop', 'peso': 3, 'valor': 35}
]
val_cap4, chosen_cap4 = mochila_dp(dict_items, 4)
assert val_cap4 == 50, f"Expected 50 but got {val_cap4}"
assert len(chosen_cap4) == 2

# Test with 4-item classic instance (capacity 6): guitar(15), phone(20), laptop(20), stereo(30) -> optimal 65
classic_items = [
    {'id': 'item-guitar', 'peso': 1, 'valor': 15},
    {'id': 'item-phone', 'peso': 1, 'valor': 20},
    {'id': 'item-laptop', 'peso': 3, 'valor': 20},
    {'id': 'item-stereo', 'peso': 4, 'valor': 30}
]
val_cap6, chosen_cap6 = mochila_dp(classic_items, 6)
assert val_cap6 == 65, f"Expected 65 but got {val_cap6}"
assert len(chosen_cap6) == 3

# Test with Item namedtuples
named_items = [
    Item('guitar', 1, 15),
    Item('phone', 1, 20),
    Item('laptop', 3, 20),
    Item('stereo', 4, 30)
]
val_named, chosen_named = knapsack_dp(named_items, 6)
assert val_named == 65, f"Expected 65 but got {val_named}"
assert len(chosen_named) == 3

print("OK_DP")
`;

    const stdout = execFileSync('python3', ['-c', pythonCode], { encoding: 'utf-8' });
    expect(stdout.trim()).toBe('OK_DP');
  });

  it('verifies knapsack-greedy runner handles tuple assignments and validates optimal result', async () => {
    const runner = greedyRunners['knapsack-greedy'];
    expect(runner).toBeDefined();

    const mockService = {
      isSupported: true,
      isReady: () => true,
      initWorker: async () => true,
      executePython: async (_code: string, fnName: string, _args: unknown[]) => {
        expect(fnName).toBe('mochila_fraccionaria');
        return {
          id: 'test-1',
          type: 'run_result' as const,
          success: true,
          result: [
            240,
            [
              [{ id: 'item-gold', peso: 10, valor: 60 }, 1.0, 10, 60],
              [{ id: 'item-silver', peso: 20, valor: 100 }, 1.0, 20, 100],
              [{ id: 'item-copper', peso: 30, valor: 120 }, 20 / 30, 20, 80]
            ]
          ],
          executionTimeMs: 10
        };
      }
    } as unknown as PythonExecutionService;

    const result = await runner('def mochila_fraccionaria(): pass', mockService);
    expect(result.passed).toBe(true);
    expect(result.totalPassed).toBe(1);
    expect(result.results[0].passed).toBe(true);
  });

  it('verifies knapsack-dp runner handles dict item selections and validates optimal result', async () => {
    const runner = dpRunners['knapsack-dp'];
    expect(runner).toBeDefined();

    const mockService = {
      isSupported: true,
      isReady: () => true,
      initWorker: async () => true,
      executePython: async (_code: string, fnName: string, _args: unknown[]) => {
        expect(fnName).toBe('mochila_dp');
        return {
          id: 'test-dp-1',
          type: 'run_result' as const,
          success: true,
          result: [
            65,
            [
              { id: 'item-guitar', peso: 1, valor: 15 },
              { id: 'item-phone', peso: 1, valor: 20 },
              { id: 'item-stereo', peso: 4, valor: 30 }
            ]
          ],
          executionTimeMs: 12
        };
      }
    } as unknown as PythonExecutionService;

    const result = await runner('def mochila_dp(): pass', mockService);
    expect(result.passed).toBe(true);
    expect(result.totalPassed).toBe(result.totalTests);
  });
});
