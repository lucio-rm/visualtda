import {
  WorkerInboundMessage,
  WorkerOutboundMessage,
  WorkerRunResponse,
  WorkerInitResponse
} from './workerProtocol';

export class PythonExecutionService {
  private worker: Worker | null = null;
  private isInitializing = false;
  private isReadyState = false;
  private pendingCallbacks = new Map<string, (res: WorkerOutboundMessage) => void>();
  private reqCounter = 0;

  get isSupported(): boolean {
    return typeof window !== 'undefined' && typeof Worker !== 'undefined';
  }

  isReady(): boolean {
    return this.isReadyState;
  }

  private getNextId(): string {
    return `req-${++this.reqCounter}-${Date.now()}`;
  }

  private ensureWorker(): Worker {
    if (this.worker) return this.worker;

    if (!this.isSupported) {
      throw new Error('Web Workers no están soportados en este entorno.');
    }

    // Standard Vite module worker creation
    this.worker = new Worker(new URL('./pyodideWorker.ts', import.meta.url), {
      type: 'module'
    });

    this.worker.onmessage = (event: MessageEvent<WorkerOutboundMessage>) => {
      const msg = event.data;
      if (!msg || !msg.id) return;

      const cb = this.pendingCallbacks.get(msg.id);
      if (cb) {
        this.pendingCallbacks.delete(msg.id);
        cb(msg);
      }
    };

    this.worker.onerror = (err) => {
      console.error('Error crítico en Pyodide Web Worker:', err);
      // Cleanly terminate worker and notify all pending callbacks
      const errorMsg = 'El entorno de ejecución Python (Web Worker) falló inesperadamente debido a un error crítico o límite de memoria.';
      const pending = Array.from(this.pendingCallbacks.values());
      this.pendingCallbacks.clear();
      if (this.worker) {
        this.worker.terminate();
        this.worker = null;
      }
      this.isReadyState = false;
      this.isInitializing = false;
      for (const cb of pending) {
        cb({
          id: 'error',
          type: 'run_result',
          success: false,
          error: errorMsg,
          executionTimeMs: 0
        });
      }
    };

    return this.worker;
  }

  async initWorker(): Promise<boolean> {
    if (this.isReadyState) return true;
    if (this.isInitializing) {
      while (this.isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
      return this.isReadyState;
    }

    if (!this.isSupported) return false;

    this.isInitializing = true;
    const worker = this.ensureWorker();
    const id = this.getNextId();

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.pendingCallbacks.delete(id);
        this.isInitializing = false;
        resolve(false);
      }, 15000);

      this.pendingCallbacks.set(id, (msg) => {
        clearTimeout(timer);
        this.isInitializing = false;
        const res = msg as WorkerInitResponse;
        this.isReadyState = res.success && res.ready;
        resolve(this.isReadyState);
      });

      const initReq: WorkerInboundMessage = { id, type: 'init' };
      worker.postMessage(initReq);
    });
  }

  async executePython(
    code: string,
    functionName: string,
    args: unknown[] = [],
    timeoutMs: number = 5000
  ): Promise<WorkerRunResponse> {
    const worker = this.ensureWorker();
    const id = this.getNextId();

    return new Promise((resolve) => {
      // Timeout watchdog
      const timer = setTimeout(() => {
        this.pendingCallbacks.delete(id);
        // Force terminate stuck worker (infinite loop mitigation)
        if (this.worker) {
          this.worker.terminate();
          this.worker = null;
          this.isReadyState = false;
        }

        // Notify any other pending callbacks that worker was terminated
        if (this.pendingCallbacks.size > 0) {
          const remaining = Array.from(this.pendingCallbacks.values());
          this.pendingCallbacks.clear();
          for (const cb of remaining) {
            cb({
              id: 'cancelled',
              type: 'run_result',
              success: false,
              error: 'Ejecución cancelada debido a reinicio del entorno Web Worker por tiempo excedido.',
              executionTimeMs: timeoutMs
            });
          }
        }

        resolve({
          id,
          type: 'run_result',
          success: false,
          error: `Tiempo de ejecución excedido (${timeoutMs} ms). Se canceló la ejecución para prevenir un bucle infinito.`,
          executionTimeMs: timeoutMs
        });
      }, timeoutMs);

      this.pendingCallbacks.set(id, (msg) => {
        clearTimeout(timer);
        resolve(msg as WorkerRunResponse);
      });

      const req: WorkerInboundMessage = {
        id,
        type: 'run',
        code,
        functionName,
        args,
        timeoutMs
      };
      worker.postMessage(req);
    });
  }
}

export const pythonService = new PythonExecutionService();
