# Arquitectura de Visual TDA

Visual TDA está diseñado como una plataforma estática del lado del cliente, con un desacoplamiento estricto entre modelos de algoritmos, generadores de trazas, visualizadores gráficos e interfaz de usuario.

---

## 1. Diagrama de Capas del Sistema

```text
                  ┌───────────────────────────────┐
                  │          VISUAL TDA           │
                  │      (React 19 / Vite)        │
                  └──────────────┬────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌──────────────────┐
│ Exercise Engine │    │  Trace Timeline  │    │   UI / UX Layer  │
│  - Registry     │    │  - useTimeline   │    │  - PhaseSwitcher │
│  - Metadata     │    │  - Playback Ctrls│    │  - Theme Toggle  │
│  - Categories   │    │  - Step Scrubber │    │  - Catalog Nav   │
└────────┬────────┘    └─────────┬────────┘    └─────────┬────────┘
         │                       │                       │
         └───────────────┬───────┴───────────────────────┘
                         ▼
        ┌──────────────────────────────────┐
        │       Visualizer Component       │
        │    (NQueensVisualizer / SVG)     │
        └────────────────┬─────────────────┘
                         ▼
        ┌──────────────────────────────────┐
        │         Algorithm Engine         │
        │     - NQueensTrace (TS)          │
        │     - NQueensValidator (TS)      │
        │     - Canonical Python Solution  │
        └──────────────────────────────────┘
```

---

## 2. Protocolo de Eventos de Traza (`TraceEvent`)

Cada algoritmo produce un objeto `TraceTimeline<T>`, el cual contiene un arreglo determinístico de eventos:

```typescript
export interface TraceEvent<T = Record<string, unknown>> {
  step: number;
  type: string;
  message?: LocalizedString;
  data: T;
}
```

### Principios de la Traza:
1. **Determinismo**: La misma entrada y semilla produce exactamente la misma secuencia de eventos paso a paso.
2. **Autocontenido**: Cada evento contiene la información suficiente para que el visualizador renderice el estado correspondiente sin requerir memoria oculta o efectos colaterales.
3. **Didáctico**: Cada evento incluye un mensaje explicativo bilingüe describiendo qué decisión se tomó (ej. qué casilla se intentó, qué conflicto se detectó o por qué se retrocedió).

---

## 3. Protocolo de Validación (`Validator`)

Para problemas combinatorios con múltiples soluciones válidas (como N-Reinas o Flujo Máximo), la validación se desacopla de la igualdad estricta de cadenas o tableros:

```typescript
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export interface Validator<Input, Output> {
  validate(input: Input, output: Output): ValidationResult;
}
```

Esto permite:
- Evaluar soluciones de estudiantes sin imponer qué solución particular deben encontrar.
- Proveer mensajes de error pedagógicos específicos cuando se violan restricciones particulares (ej. "Conflicto en diagonal secundaria entre reinas en (0, 2) y (1, 1)").

---

## 4. Estructura de Módulos de Ejercicios

Cada ejercicio se describe mediante:
1. **Metadatos** (`exercise.json` / `registry.ts`): ID, técnica, problema, dificultad y etiquetas.
2. **Teoría** (`theory.md`): Planteo formal, invariantes, demostración de corrección y análisis $O$.
3. **Pseudocódigo** (`pseudocode.md`): Formulación abstracta de alto nivel.
4. **Implementación Canónica** (`solution.py`): Código Python legible y optimizado.
5. **Validador** (`tests.ts` / `validator.ts`): Comprobador formal de restricciones.
6. **Visualizador** (`visualizer.tsx` / `visualizer.ts`): Componente interactivo que consume trazas.

---

## 5. Patrón Strategy & Registry para Evaluadores Python (`src/runtime/runners/`)

Para evitar la aparición de archivos monolíticos ("God Files") con sentencias `switch` gigantescas, los evaluadores de Python implementan el patrón Strategy:

```typescript
export type PythonTestStrategy = (
  code: string,
  service: PythonExecutionService
) => Promise<PythonStrategyResult>;
```

Cada paradigma algorítmico agrupa sus estrategias en módulos dedicados:
- `backtrackingRunners.ts`
- `greedyRunners.ts`
- `dpRunners.ts`
- `divideAndConquerRunners.ts`
- `advancedRunners.ts`

El orquestador central `pythonTestRunner.ts` no contiene lógica ramificada (`switch/case`), sino que despacha la ejecución dinámicamente mediante el diccionario central `PYTHON_TEST_STRATEGIES[exerciseId]`, cumpliendo estrictamente con el principio Open/Closed (OCP).

---

## 6. Patrón Registro Modular de Contenidos Didácticos (`src/engine/content/`)

De forma análoga, el contenido didáctico de la fase Resolver (código inicial, pistas progresivas y tests heurísticos en el cliente) se organiza en módulos por paradigma bajo `src/engine/content/`, eliminando duplicaciones y reduciendo `src/engine/exerciseContent.ts` a un punto de reexportación limpio y fuertemente tipado.

---

## 7. Aislamiento y Seguridad de Pyodide (Web Worker)

El entorno de ejecución de Python proporcionado por Pyodide corre en un Web Worker dedicado (`src/runtime/pyodideWorker.ts`):
- **Cero acceso al DOM**: El worker no tiene acceso a `window`, `document`, `localStorage` ni cookies de sesión.
- **Watchdog de 5.000 ms**: Interrumpe bucles infinitos o cálculos no convergentes mediante terminación del worker.
- **Límite de salida (64 KB)**: El flujo `sys.stdout` está acotado para prevenir saturación de memoria en el navegador.
- **Captura de `BaseException`**: Captura llamadas a `sys.exit()` o excepciones críticas en Python sin romper el protocolo de mensajería.

