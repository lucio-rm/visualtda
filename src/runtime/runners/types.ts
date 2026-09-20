import { PythonExecutionService } from '../pythonExecutionService';
import { TestCaseResult } from '../../engine/exerciseContent';

export interface PythonStrategyResult {
  passed: boolean;
  results: TestCaseResult[];
  totalPassed?: number;
  totalTests?: number;
  stdout?: string;
  runtimeError?: string;
  executionTimeMs?: number;
}

export type PythonTestStrategy = (
  code: string,
  service: PythonExecutionService
) => Promise<PythonStrategyResult>;
