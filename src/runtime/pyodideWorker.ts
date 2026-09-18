import { WorkerInboundMessage, WorkerRunResponse, WorkerInitResponse } from './workerProtocol';

// Declaration for Pyodide in Worker global context
declare function importScripts(...urls: string[]): void;
declare const loadPyodide: (options?: { indexURL?: string }) => Promise<any>; // eslint-disable-line @typescript-eslint/no-explicit-any

let pyodideInstance: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any
let isInitializing = false;

const PYODIDE_CDN_URL = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/';

async function ensurePyodide(): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  if (pyodideInstance) return pyodideInstance;

  if (isInitializing) {
    while (isInitializing) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    if (pyodideInstance) return pyodideInstance;
  }

  isInitializing = true;
  try {
    importScripts(`${PYODIDE_CDN_URL}pyodide.js`);
    pyodideInstance = await loadPyodide({
      indexURL: PYODIDE_CDN_URL
    });
    isInitializing = false;
    return pyodideInstance;
  } catch (err: unknown) {
    isInitializing = false;
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Fallo al cargar el entorno Pyodide en Web Worker: ${msg}`);
  }
}

self.onmessage = async (event: MessageEvent<WorkerInboundMessage>) => {
  const msg = event.data;
  if (!msg || !msg.type) return;

  if (msg.type === 'init') {
    try {
      await ensurePyodide();
      const response: WorkerInitResponse = {
        id: msg.id,
        type: 'init_result',
        success: true,
        ready: true
      };
      self.postMessage(response);
    } catch (err: unknown) {
      const response: WorkerInitResponse = {
        id: msg.id,
        type: 'init_result',
        success: false,
        ready: false,
        error: err instanceof Error ? err.message : String(err)
      };
      self.postMessage(response);
    }
    return;
  }

  if (msg.type === 'run') {
    const startTime = performance.now();
    try {
      const pyodide = await ensurePyodide();

      // Setup execution wrapper capturing stdout and serializing output via JSON
      const wrapperScript = `
import sys, io, json

__stdout_buffer = io.StringIO()
__old_stdout = sys.stdout
sys.stdout = __stdout_buffer

__execution_error = None
__raw_result = None

try:
    # 1. Ejecutar código del alumno
    ${msg.code.split('\n').map((line) => '    ' + line).join('\n')}

    # 2. Invocar la función con los argumentos provistos
    if "${msg.functionName}" in locals():
        __target_fn = locals()["${msg.functionName}"]
        __args_parsed = json.loads('''${JSON.stringify(msg.args)}''')
        __raw_result = __target_fn(*__args_parsed)
    else:
        raise NameError("La función '${msg.functionName}' no fue definida en el código.")
except Exception as e:
    import traceback
    __execution_error = traceback.format_exc()
finally:
    sys.stdout = __old_stdout
    __captured_stdout = __stdout_buffer.getvalue()

__serialized_output = json.dumps({
    "success": __execution_error is None,
    "result": __raw_result,
    "stdout": __captured_stdout,
    "error": __execution_error
})
`;

      pyodide.runPython(wrapperScript);
      const serializedJson = pyodide.globals.get('__serialized_output');
      const parsed = JSON.parse(serializedJson);

      const endTime = performance.now();
      const response: WorkerRunResponse = {
        id: msg.id,
        type: 'run_result',
        success: parsed.success,
        result: parsed.result,
        stdout: parsed.stdout,
        error: parsed.error,
        executionTimeMs: Math.round(endTime - startTime)
      };

      self.postMessage(response);
    } catch (err: unknown) {
      const endTime = performance.now();
      const response: WorkerRunResponse = {
        id: msg.id,
        type: 'run_result',
        success: false,
        error: err instanceof Error ? err.message : String(err),
        executionTimeMs: Math.round(endTime - startTime)
      };
      self.postMessage(response);
    }
  }
};
