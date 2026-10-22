# Guía de Contribución: Cómo Agregar un Nuevo Ejercicio en Visual TDA

Esta guía documenta el procedimiento formal paso a paso para que cualquier desarrollador, docente o colaborador integre un nuevo problema algorítmico al catálogo de Visual TDA.

---

## 1. Criterios de Admisión Pedagógica

Antes de implementar código, el ejercicio propuesto debe satisfacer:
- **Alineación Académica**: Basado en un problema canónico de nivel universitario (referenciado en Kleinberg & Tardos *Algorithm Design*, Cormen et al. *CLRS*, o cátedras de Algoritmos de FIUBA/UBA).
- **Idoneidad Visual**: El problema debe admitir una representación visual interactiva en 2D (diagrama de estados, árbol, grafo, tablero o matriz) que ilustre la causalidad del algoritmo y sus invariantes de corrección.
- **Rigor Matemático**: Debe contar con una demostración formal de correctitud (argumento de intercambio, invariante de ciclo/corte, hipótesis inductiva) y un análisis asintótico explícito de tiempo y espacio ($O$).
- **Bilingüismo (ES / EN)**: Todo el contenido teórico, metadatos, pistas y mensajes de traza deben redactarse con igual calidad en español e inglés.

---

## 2. Estructura de Archivos del Ejercicio

Cada ejercicio se define mediante su identificador en formato `kebab-case` (por ejemplo: `mi-nuevo-ejercicio`) y requiere la creación de los siguientes artefactos:

```text
visual-tda/
├── exercises/mi-nuevo-ejercicio/
│   ├── exercise.json          # Metadatos del problema (título, categoría, dificultad, tags)
│   ├── solution.py            # Solución canónica de referencia en Python con tipado estricto
│   ├── pseudocode.md          # Pseudocódigo de alto nivel para comprensión conceptual
│   └── theory.md              # Demostración matemática formal y análisis asintótico
├── src/
│   ├── engine/algorithms/
│   │   ├── miNuevoEjercicioTrace.ts      # Generador determinístico de traza paso a paso
│   │   └── miNuevoEjercicioValidator.ts  # Validador de restricciones del problema
│   ├── engine/content/
│   │   ├── <paradigma>Content.ts         # Pistas pedagógicas y código base en español
│   │   └── englishStarterCodes.ts        # Código base inicial en inglés
│   ├── components/visualizers/
│   │   ├── MiNuevoEjercicioVisualizer.tsx # Visualizador SVG de la traza (Fase Comprender)
│   │   └── MiNuevoEjercicioPlayground.tsx # Laboratorio interactivo (Fase Descubrir)
│   └── engine/
│       ├── registry.ts                   # Registro del ejercicio en el catálogo
│       └── exerciseViewRegistry.tsx       # Registro de los componentes visuales
└── tests/
    └── miNuevoEjercicio.test.ts          # Suite de pruebas unitarias en Vitest
```

---

## 3. Paso a Paso Detallado

### Paso 1: Definir los Metadatos (`exercises/<id>/exercise.json`)
Crear el archivo `exercises/<id>/exercise.json` con el siguiente esquema JSON estricto:

```json
{
  "id": "mi-nuevo-ejercicio",
  "title": {
    "es": "Nombre del Ejercicio en Español",
    "en": "Exercise Name in English"
  },
  "shortDescription": {
    "es": "Resumen conciso del objetivo en una o dos oraciones.",
    "en": "Concise summary of the objective in one or two sentences."
  },
  "categoryId": "greedy",
  "difficulty": "medium",
  "order": 9,
  "timeComplexity": "O(N \\log N)",
  "spaceComplexity": "O(N)",
  "tags": ["greedy", "intervals", "sorting"],
  "author": "Cátedra TDA / FIUBA"
}
```

*Valores de `categoryId` permitidos*: `divide-and-conquer`, `greedy`, `dp`, `backtracking`, `network-flow`, `linear-programming`, `reductions`, `approximation`, `randomized`.  
*Valores de `difficulty` permitidos*: `easy`, `medium`, `hard`.

---

### Paso 2: Implementar la Solución Canónica (`exercises/<id>/solution.py`)
Implementar la solución oficial en Python estándar con anotaciones de tipo completas y comentarios explicativos claros:

```python
from typing import List, Tuple

def mi_algoritmo(datos: List[int]) -> List[int]:
    """
    Resuelve el problema utilizando la técnica X.
    
    Complejidad Temporal: O(N log N)
    Complejidad Espacial: O(N)
    """
    if not datos:
        return []
    
    # Lógica algorítmica canónica
    resultado = sorted(datos)
    return resultado
```

---

### Paso 3: Redactar la Demostración Teórica (`exercises/<id>/theory.md`)
El archivo teórico debe estructurarse con secciones numeradas formales (evaluadas automáticamente por la suite de pruebas):

```markdown
# Teoría y Demostración: Nombre del Ejercicio

## 1. Definición Formal del Problema
Definición de la instancia formal: conjunto de entrada, restricciones y función objetivo a optimizar o satisfacer.

## 2. Invariante y Principio de Elección
Enunciado del invariante de ciclo, corte, o principio de subestructura óptima / argumento de intercambio (*exchange argument*).

## 3. Demostración de Correctitud
Demostración rigurosa (por inducción, contradicción o argumento de intercambio) demostrando que la solución generada es óptima y satisface todas las restricciones.

## 4. Análisis de Complejidad Asintótica
- **Tiempo**: Deducción paso a paso de la cota $O(N \log N)$ (e.g. ordenamiento + barrido lineal).
- **Espacio**: Memoria auxiliar requerida $O(N)$ descartando la entrada.

## 5. Contraejemplo y Trampa Ingenua
Explicación de por qué una aproximación voraz alternativa o heurística intuitiva falla, acompañada de un contraejemplo mínimo concreto.
```

---

### Paso 4: Redactar el Pseudocódigo (`exercises/<id>/pseudocode.md`)
Redactar el pseudocódigo conceptual en alto nivel:

```markdown
```text
Algoritmo MiAlgoritmo(A[1..n]):
    1. Ordenar A de menor a mayor
    2. Inicializar S ← ∅
    3. Para cada elemento x ∈ A:
           Si x es compatible con S:
               S ← S ∪ {x}
    4. Retornar S
```
```

---

### Paso 5: Implementar el Generador de Traza (`src/engine/algorithms/<id>Trace.ts`)
La función generadora de traza debe ser **pura y determinística**. Construye un `TraceTimeline<T>` compuesto por una secuencia ordenada de eventos de tipo `TraceEvent<T>`:

```typescript
import { TraceTimeline, TraceEvent } from '../../types';

export interface MiEventoData {
  indiceActual: number;
  seleccionados: number[];
  estado: 'evaluando' | 'aceptado' | 'descartado' | 'fin';
}

export function generateMiEjercicioTrace(entrada: number[]): TraceTimeline<MiEventoData> {
  const events: TraceEvent<MiEventoData>[] = [];
  let step = 0;

  // Paso inicial
  events.push({
    step: step++,
    type: 'init',
    message: {
      es: 'Estado inicial: inicializando estructura de datos.',
      en: 'Initial state: initializing data structure.'
    },
    data: { indiceActual: -1, seleccionados: [], estado: 'evaluando' }
  });

  const seleccionados: number[] = [];
  for (let i = 0; i < entrada.length; i++) {
    // Evento de evaluación
    events.push({
      step: step++,
      type: 'evaluate',
      message: {
        es: `Evaluando elemento en índice ${i} con valor ${entrada[i]}.`,
        en: `Evaluating element at index ${i} with value ${entrada[i]}.`
      },
      data: { indiceActual: i, seleccionados: [...seleccionados], estado: 'evaluando' }
    });

    if (entrada[i] > 0) {
      seleccionados.push(entrada[i]);
      events.push({
        step: step++,
        type: 'accept',
        message: {
          es: `Elemento ${entrada[i]} aceptado en la solución.`,
          en: `Element ${entrada[i]} accepted into solution.`
        },
        data: { indiceActual: i, seleccionados: [...seleccionados], estado: 'aceptado' }
      });
    }
  }

  return { events, totalSteps: events.length };
}
```

---

### Paso 6: Implementar el Validador Matemático (`src/engine/algorithms/<id>Validator.ts`)
El validador en TypeScript comprueba si una salida arbitraria dada por el código del estudiante cumple formalmente con todas las restricciones del problema:

```typescript
export interface ValidationResult {
  valid: boolean;
  message: { es: string; en: string };
}

export function validateMiEjercicio(entrada: number[], salida: number[]): ValidationResult {
  if (!Array.isArray(salida)) {
    return {
      valid: false,
      message: {
        es: 'La salida debe ser una lista de números.',
        en: 'Output must be a list of numbers.'
      }
    };
  }

  // Verificar restricciones del problema
  const esperados = entrada.filter((x) => x > 0);
  if (salida.length !== esperados.length) {
    return {
      valid: false,
      message: {
        es: `Longitud incorrecta: se esperaban ${esperados.length} elementos y se recibieron ${salida.length}.`,
        en: `Incorrect length: expected ${esperados.length} elements, got ${salida.length}.`
      }
    };
  }

  return {
    valid: true,
    message: { es: 'Solución correcta y óptima.', en: 'Correct and optimal solution.' }
  };
}
```

---

### Paso 7: Configurar Pistas y Código Inicial (`src/engine/content/`)
En el archivo de contenido del paradigma correspondiente (e.g. `greedyContent.ts`):
1. **Plantilla inicial de código**:
   ```python
   def mi_algoritmo(datos):
       # Tu implementación aquí
       pass
   ```
2. **Tres niveles de pistas graduales**:
   - **Pista 1 (Enfoque conceptual)**: Plantea la propiedad intuitiva que orienta la elección.
   - **Pista 2 (Estructura de datos o invariante)**: Especifica cómo mantener las restricciones de forma eficiente.
   - **Pista 3 (Detalle de implementación o caso borde)**: Aclara el manejo de listas vacías, empates o índices.
3. Registrar la versión en inglés del código inicial en `src/engine/content/englishStarterCodes.ts`.

---

### Paso 8: Crear Visualizador y Playground SVG (`src/components/visualizers/`)
1. **`<Id>Visualizer.tsx` (Fase Comprender)**:
   - Recibe la traza `TraceTimeline<T>` y el paso actual `currentStep`.
   - Utiliza exclusivamente elementos SVG vectoriales nativos (`<svg>`, `<g>`, `<rect>`, `<circle>`, `<path>`, `<text>`).
   - Aplica la regla universal de contención:
     `max-height: min(450px, calc(100vh - 320px))` y centrado con `margin: 0 auto; display: block;`.
   - Utiliza tokens de diseño de Radix Colors (`var(--accent)`, `var(--success)`, `var(--error)`, `var(--surface)`).
2. **`<Id>Playground.tsx` (Fase Descubrir)**:
   - Permite al estudiante manipular visualmente los datos antes de ver código.
   - Proporciona retroalimentación interactiva inmediata ante elecciones válidas o inválidas.
3. Registrar ambos en `src/engine/exerciseViewRegistry.tsx`.

---

### Paso 9: Pruebas Automatizadas (`tests/<id>.test.ts`)
Implementar pruebas exhaustivas en Vitest:
- Verificación del generador de traza con instancias típicas y bordes.
- Verificación del validador ante salidas óptimas, subóptimas y malformadas.
- Verificación de rechazo de plantillas vacías o `pass`.
- Verificación de consistencia bilingüe de todos los mensajes de evento.

---

### Paso 10: Validación de Compuertas de Calidad
Antes de enviar el pull request, ejecutar la suite completa de calidad:

```bash
# Cifrar soluciones canónicas con AES-256-GCM
npm run encrypt

# Verificar tipos TypeScript estricto
npm run typecheck

# Analizar con ESLint
npm run lint

# Ejecutar suite de pruebas unitarias
npm test

# Compilar para producción estática
npm run build

# Ejecutar suite de navegador real Chromium (22 escenarios)
npm run test:browser
```

Todas las verificaciones deben arrojar **0 errores** y **0 advertencias**.
