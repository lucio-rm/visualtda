# Guía de Contribución a Visual TDA

Visual TDA es una plataforma educativa interactiva orientada a la enseñanza y visualización de algoritmos complejos para estudiantes universitarios (especialmente alineada con Teoría de Algoritmos en FIUBA).

Toda contribución debe alinearse con la arquitectura y principios de ingeniería documentados en [`docs/arquitectura.md`](./docs/arquitectura.md) y [`docs/principios-diseno.md`](./docs/principios-diseno.md).

---

## 1. Principios Fundamentales (P1 – P12)

- **Desacoplamiento Estricto**: $\text{Algoritmo} \to \text{Eventos de Traza} \to \text{Visualizador} \to \text{UI}$.
- **Zero Backend**: Todo se ejecuta de forma estática en el navegador del estudiante (React 19 + TypeScript + Pyodide WebAssembly en Web Worker).
- **KISS & No Abstracción Prematura**: Se prefiere la solución más simple que resuelva el problema de forma robusta.
- **Accesibilidad por Defecto (WCAG 2.1 AA)**: Navegación completa por teclado, indicadores no basados únicamente en color, y etiquetas ARIA descriptivas.

---

## 2. Flujo Pedagógico de 3 Fases

Cada ejercicio implementa exactamente tres fases secuenciales:
1. **Descubrir (`discover`)**: Planteo intuitivo y laboratorio interactivo antes de escribir código.
2. **Resolver (`solve`)**: Enunciado formal, pistas graduales, editor de código Python y ejecución en Pyodide.
3. **Comprender (`understand`)**: Solución canónica, reproducción paso a paso de la traza, demostración formal de invariantes y complejidad asintótica.

---

## 3. Guía Paso a Paso para Agregar un Ejercicio

> Para consultar el manual completo con ejemplos de código, esquemas JSON y validadores, ver: **[`docs/guia-agregar-ejercicio.md`](./docs/guia-agregar-ejercicio.md)**.

Gracias a la arquitectura modular basada en el patrón Strategy/Registry, agregar un nuevo ejercicio requiere pasos aislados y predecibles:

### Paso 1: Documentación Canónica (`exercises/<id>/`)
Crear el directorio `exercises/<id>/` con sus 4 archivos requeridos:
- `exercise.json`: Metadatos del problema (título, descripción, dificultad, paradigma).
- `solution.py`: Implementación de referencia en Python con tipado estricto.
- `pseudocode.md`: Pseudocódigo de alto nivel para comprensión conceptual.
- `theory.md`: Demostración matemática formal, invariantes de ciclo o corte y análisis $O$.

### Paso 2: Motor de Traza y Validador (`src/engine/algorithms/`)
- `<id>Trace.ts`: Función pura que genera un `TraceTimeline<T>` con eventos determinísticos paso a paso.
- `<id>Validator.ts`: Validador puro en TypeScript que verifica si una salida arbitraria satisface las restricciones del problema.

### Paso 3: Registro de Metadatos (`src/engine/registry.ts`)
Agregar la entrada en `EXERCISES_REGISTRY` asignando ID, categoría, orden y dificultad.

### Paso 4: Contenido Didáctico (`src/engine/content/`)
Agregar el código de inicio (starter code), pistas graduales y runner heurístico en el archivo del paradigma correspondiente (`backtrackingContent.ts`, `greedyContent.ts`, `dpContent.ts`, `divideAndConquerContent.ts`, o `advancedContent.ts`).

### Paso 5: Estrategia de Evaluación Python (`src/runtime/runners/`)
Implementar la estrategia de prueba en el módulo de paradigma respectivo (`backtrackingRunners.ts`, `greedyRunners.ts`, etc.) invocando `service.executePython()` y validando con el validador TypeScript.

### Paso 6: Visualizador Interactivo (`src/components/visualizers/`)
- Crear `<Id>Visualizer.tsx` (consumiendo trazas de la fase Comprender).
- Opcionalmente crear `<Id>Playground.tsx` (para la fase Descubrir).
- Registrar ambas vistas en `src/engine/exerciseViewRegistry.tsx`.

### Paso 7: Pruebas Automatizadas (`tests/<id>.test.ts`)
Implementar tests unitarios en Vitest verificando casos típicos, bordes extremos (edge cases), e invariantes.

---

## 4. Quality Gates y Verificación Obligatoria

Antes de enviar cualquier cambio, la suite completa debe pasar con 0 errores:

```bash
# 1. Verificación de tipos TypeScript estricto
npm run typecheck

# 2. Análisis estático ESLint (sin warnings ni errores)
npm run lint

# 3. Suite de pruebas unitarias Vitest
npm test

# 4. Compilación estática de producción
npm run build

# 5. Suite de aseguramiento en navegador real Chromium (CDP)
npm run test:browser
```

---

## 5. Convenciones de Git

- Usar Conventional Commits: `feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`.
- Nunca ejecutar comandos destructivos (`push --force`, `reset --hard`).
- Trabajar siempre en ramas de trabajo aisladas.
