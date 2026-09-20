import { pythonService, PythonExecutionService } from './pythonExecutionService';
import { TestCaseResult } from '../engine/exerciseContent';
import { PYTHON_TEST_STRATEGIES } from './runners';

export interface PythonEvaluationResult {
  passed: boolean;
  results: TestCaseResult[];
  totalPassed: number;
  totalTests: number;
  stdout?: string;
  runtimeError?: string;
  executionTimeMs: number;
}

export async function runPythonTests(
  exerciseId: string,
  code: string,
  service: PythonExecutionService = pythonService
): Promise<PythonEvaluationResult> {
  const startTime = performance.now();

  if (!service.isSupported) {
    return {
      passed: false,
      results: [],
      totalPassed: 0,
      totalTests: 0,
      runtimeError: 'El entorno actual no soporta Web Workers para ejecución de Python en navegador.',
      executionTimeMs: 0
    };
  }

  const isReady = await service.initWorker();
  if (!isReady) {
    return {
      passed: false,
      results: [],
      totalPassed: 0,
      totalTests: 0,
      runtimeError: 'No se pudo inicializar el entorno Pyodide (requiere conexión inicial a CDN para descargar WebAssembly).',
      executionTimeMs: performance.now() - startTime
    };
  }

  const strategy = PYTHON_TEST_STRATEGIES[exerciseId];
  if (!strategy) {
    return {
      passed: false,
      results: [],
      totalPassed: 0,
      totalTests: 0,
      runtimeError: `No hay estrategia de pruebas definida para el ejercicio: ${exerciseId}`,
      executionTimeMs: performance.now() - startTime
    };
  }

  try {
    const outcome = await strategy(code, service);
    const totalPassed = outcome.totalPassed !== undefined
      ? outcome.totalPassed
      : outcome.results.filter((r) => r.passed).length;
    const totalTests = outcome.totalTests !== undefined
      ? outcome.totalTests
      : outcome.results.length;

    return {
      passed: outcome.passed && totalPassed === totalTests && totalTests > 0,
      results: outcome.results,
      totalPassed,
      totalTests,
      stdout: outcome.stdout,
      runtimeError: outcome.runtimeError,
      executionTimeMs: outcome.executionTimeMs !== undefined ? outcome.executionTimeMs : performance.now() - startTime
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      passed: false,
      results: [],
      totalPassed: 0,
      totalTests: 0,
      runtimeError: msg,
      executionTimeMs: performance.now() - startTime
    };
  }
}
