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
});
