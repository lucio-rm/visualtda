export * from './types';
import { PythonTestStrategy } from './types';
import { backtrackingRunners } from './backtrackingRunners';
import { greedyRunners } from './greedyRunners';
import { dpRunners } from './dpRunners';
import { divideAndConquerRunners } from './divideAndConquerRunners';
import { advancedRunners } from './advancedRunners';

export const PYTHON_TEST_STRATEGIES: Record<string, PythonTestStrategy> = {
  ...backtrackingRunners,
  ...greedyRunners,
  ...dpRunners,
  ...divideAndConquerRunners,
  ...advancedRunners
};
