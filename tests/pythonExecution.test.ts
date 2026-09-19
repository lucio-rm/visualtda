import { describe, it, expect } from 'vitest';
import { PythonExecutionService } from '../src/runtime/pythonExecutionService';
import { WorkerRunRequest, WorkerRunResponse } from '../src/runtime/workerProtocol';

describe('PythonExecutionService & Worker Protocol', () => {
  it('instantiates service and handles non-browser environment gracefully', async () => {
    const service = new PythonExecutionService();
    expect(service.isReady()).toBe(false);

    if (!service.isSupported) {
      const ready = await service.initWorker();
      expect(ready).toBe(false);
    }
  });

  it('validates WorkerRunRequest and WorkerRunResponse contract schema', () => {
    const request: WorkerRunRequest = {
      id: 'req-1',
      type: 'run',
      code: 'def resolver(): return 42',
      functionName: 'resolver',
      args: [],
      timeoutMs: 3000
    };

    expect(request.id).toBe('req-1');
    expect(request.type).toBe('run');
    expect(request.functionName).toBe('resolver');

    const response: WorkerRunResponse = {
      id: 'req-1',
      type: 'run_result',
      success: true,
      result: 42,
      executionTimeMs: 12
    };

    expect(response.success).toBe(true);
    expect(response.result).toBe(42);
    expect(response.executionTimeMs).toBe(12);
  });

  it('runs n-queens test suite with simulated mock Python execution', async () => {
    const { runPythonTests } = await import('../src/runtime/pythonTestRunner');

    const mockService = {
      isSupported: true,
      isReady: () => true,
      initWorker: async () => true,
      executePython: async (_code: string, fnName: string, args: unknown[]) => {
        if (fnName === 'resolver_n_reinas') {
          const n = args[0] as number;
          if (n === 4) {
            return {
              id: 'mock-1',
              type: 'run_result' as const,
              success: true,
              result: [
                [1, 3, 0, 2],
                [2, 0, 3, 1]
              ],
              stdout: 'Probando N=4\n',
              executionTimeMs: 15
            };
          }
          if (n === 1) {
            return {
              id: 'mock-2',
              type: 'run_result' as const,
              success: true,
              result: [[0]],
              executionTimeMs: 2
            };
          }
        }
        return {
          id: 'mock-err',
          type: 'run_result' as const,
          success: false,
          error: 'Function not found',
          executionTimeMs: 0
        };
      }
    } as unknown as PythonExecutionService;

    const evalResult = await runPythonTests('n-queens', 'def resolver_n_reinas(n): pass', mockService);
    expect(evalResult.passed).toBe(true);
    expect(evalResult.totalPassed).toBe(2);
    expect(evalResult.totalTests).toBe(2);
    expect(evalResult.stdout).toContain('Probando N=4');
  });

  it('captures Python runtime syntax errors or exceptions cleanly', async () => {
    const { runPythonTests } = await import('../src/runtime/pythonTestRunner');

    const errorService = {
      isSupported: true,
      isReady: () => true,
      initWorker: async () => true,
      executePython: async () => {
        return {
          id: 'mock-err',
          type: 'run_result' as const,
          success: false,
          error: 'SyntaxError: invalid syntax (solucion.py, line 3)',
          executionTimeMs: 5
        };
      }
    } as unknown as PythonExecutionService;

    const evalResult = await runPythonTests('n-queens', 'def broken_code', errorService);
    expect(evalResult.passed).toBe(false);
    expect(evalResult.runtimeError).toContain('SyntaxError');
  });

  it('handles worker timeout cancellation and returns pedagogical error message', async () => {
    const { runPythonTests } = await import('../src/runtime/pythonTestRunner');

    const timeoutService = {
      isSupported: true,
      isReady: () => true,
      initWorker: async () => true,
      executePython: async () => {
        return {
          id: 'timeout-err',
          type: 'run_result' as const,
          success: false,
          error: 'Tiempo de ejecución excedido (5000 ms). Se canceló la ejecución para prevenir un bucle infinito.',
          executionTimeMs: 5000
        };
      }
    } as unknown as PythonExecutionService;

    const evalResult = await runPythonTests('n-queens', 'while True: pass', timeoutService);
    expect(evalResult.passed).toBe(false);
    expect(evalResult.runtimeError).toContain('Tiempo de ejecución excedido');
  });

  it('handles BaseException and sys.exit cleanly without crashing', async () => {
    const { runPythonTests } = await import('../src/runtime/pythonTestRunner');

    const sysExitService = {
      isSupported: true,
      isReady: () => true,
      initWorker: async () => true,
      executePython: async () => {
        return {
          id: 'sysexit-err',
          type: 'run_result' as const,
          success: false,
          error: 'SystemExit: 1\nTraceback (most recent call last):\n  File "<string>", line 2, in <module>\nSystemExit: 1',
          executionTimeMs: 4
        };
      }
    } as unknown as PythonExecutionService;

    const evalResult = await runPythonTests('n-queens', 'import sys; sys.exit(1)', sysExitService);
    expect(evalResult.passed).toBe(false);
    expect(evalResult.runtimeError).toContain('SystemExit');
  });

  it('handles pedagogical stdout quota truncation gracefully', async () => {
    const { runPythonTests } = await import('../src/runtime/pythonTestRunner');

    const largeStdoutService = {
      isSupported: true,
      isReady: () => true,
      initWorker: async () => true,
      executePython: async () => {
        return {
          id: 'stdout-trunc',
          type: 'run_result' as const,
          success: true,
          result: [[0]],
          stdout: 'A'.repeat(65536) + '\n... [Salida truncada: límite pedagógico de 64 KB alcanzado] ...',
          executionTimeMs: 18
        };
      }
    } as unknown as PythonExecutionService;

    const evalResult = await runPythonTests('n-queens', 'print("A" * 100000); def resolver_n_reinas(n): return [[0]]', largeStdoutService);
    expect(evalResult.stdout).toContain('Salida truncada: límite pedagógico de 64 KB alcanzado');
  });
});

