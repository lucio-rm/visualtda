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

      // Pass user inputs as Pyodide globals to avoid string interpolation injection.
      pyodide.globals.set('__user_code', msg.code);
      pyodide.globals.set('__user_fn_name', msg.functionName);
      pyodide.globals.set('__user_args_json', JSON.stringify(msg.args));

      // Fixed wrapper script — no string interpolation of user inputs
      const wrapperScript = `
import sys, io, json

__stdout_buffer = io.StringIO()
__old_stdout = sys.stdout
sys.stdout = __stdout_buffer

__execution_error = None
__raw_result = None
__MAX_STDOUT_BYTES = 65536  # 64 KB pedagogical quota to prevent memory DoS

try:
    # 1. Execute student code in an isolated namespace
    __ns = {}
    exec(__user_code, __ns)

    # 2. Invoke the target function with provided arguments
    if __user_fn_name in __ns:
        __target_fn = __ns[__user_fn_name]
        __args_parsed = json.loads(__user_args_json)
        __raw_result = __target_fn(*__args_parsed)
    else:
        raise NameError(f"La función '{__user_fn_name}' no fue definida en el código.")
except BaseException as e:
    import traceback
    __execution_error = traceback.format_exc()
finally:
    sys.stdout = __old_stdout
    __captured_stdout = __stdout_buffer.getvalue()
    if len(__captured_stdout) > __MAX_STDOUT_BYTES:
        __captured_stdout = __captured_stdout[:__MAX_STDOUT_BYTES] + "\\n... [Salida truncada: límite pedagógico de 64 KB alcanzado] ..."

try:
    __serialized_output = json.dumps({
        "success": __execution_error is None,
        "result": __raw_result,
        "stdout": __captured_stdout,
        "error": __execution_error
    })
except (TypeError, OverflowError) as __ser_err:
    __serialized_output = json.dumps({
        "success": False,
        "result": None,
        "stdout": __captured_stdout,
        "error": f"Error de serialización: el valor retornado ({type(__raw_result).__name__}) no puede convertirse a JSON. Asegúrate de retornar estructuras estándar (listas, diccionarios, enteros, flotantes, cadenas o booleanos)."
    })
`;

      try {
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
      } finally {
        // Clean up globals to prevent cross-execution leakage
        pyodide.globals.delete('__user_code');
        pyodide.globals.delete('__user_fn_name');
        pyodide.globals.delete('__user_args_json');
        pyodide.globals.delete('__serialized_output');
      }
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
