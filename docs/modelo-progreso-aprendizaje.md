# Modelo Pedagógico de Progresión Académica (Visual TDA)

Este documento define la arquitectura y especificación formal del modelo de progreso del estudiante en **Visual TDA**, diseñado específicamente para cursos universitarios de algoritmos y estructuras de datos (nivel FIUBA / Tardos & Kleinberg).

---

## 1. Principio Fundamental: Pensar Antes de Resolver

El objetivo del modelo no es registrar "clics" ni "visitas", sino modelar y acompañar el proceso cognitivo riguroso del estudiante al enfrentarse a problemas algorítmicos complejos.

El modelo prohíbe revelar la solución oficial de forma prematura y recompensa el esfuerzo analítico genuino:
$$\text{Descubrir (Intuición)} \longrightarrow \text{Resolver (Formulación)} \longrightarrow \text{Comprender (Formalidad e Invariantes)}$$

---

## 2. Los 7 Estados de Dominio Algorítmico

| Estado | Nombre Visible (ES / EN) | Badge | Descripción Pedagógica | Criterio de Activación |
| :--- | :--- | :---: | :--- | :--- |
| `unseen` | *Por Descubrir* / *Unseen* | • | El estudiante nunca ha abierto este problema. | Estado inicial por defecto en el catálogo. |
| `exploring` | *Explorando* / *Exploring* | [Explorando] | El estudiante abrió el problema y está manipulando la instancia en la Fase 1 (*Descubrir*). | Se activa al montar la vista del ejercicio en fase `discover`. |
| `attempted` | *En Desarrollo* / *In Progress* | [En Desarrollo] | El estudiante pasó a la Fase 2 (*Resolver*) y está editando código Python. | Se activa al cambiar a fase `solve` o editar el textarea de código. |
| `testing` | *En Pruebas* / *Testing* | [En Pruebas] | El estudiante ejecutó pruebas (locales o en Pyodide) pero falló uno o más casos de prueba. | Se activa cuando `runTests` reporta fallos o excepciones. Registra casos aprobados y totales. |
| `passed` | *Resuelto* / *Solved* | [Resuelto] | La implementación algorítmica del estudiante superó el 100% de los casos de prueba y oráculos. | Se activa automáticamente al superar todas las pruebas. Desbloquea la Fase 3 (*Comprender*). |
| `completed` | *Dominado* / *Mastered* | [Dominado] | El estudiante analizó la solución canónica, la traza sincronizada y los argumentos formales de corrección y complejidad. | Se activa al confirmar el estudio formal en la Fase 3. Otorga maestría verde en el catálogo. |
| `instructor` | *Modo Docente* / *Instructor* | [Docente] | Vista desbloqueada para proyección en aula o demostración pedagógica por parte de profesores. | Activado mediante el toggle docente en el Header; no penaliza ni altera el almacenamiento de calificaciones. |

---

## 3. Invariante de Progresión Monótona

El modelo implementa una progresión estrictamente monótona: un logro de nivel superior **nunca** es degradado por una acción exploratoria posterior.

$$\text{Rank}: \text{unseen (0)} < \text{exploring (1)} < \text{attempted (2)} < \text{testing (3)} < \text{passed (4)} < \text{completed (5)}$$

- Si un ejercicio está en estado `passed` o `completed`, modificar el código en el editor o reejecutar pruebas con fallos temporales **no** degrada el estado del estudiante a `attempted` o `testing`.
- Únicamente una acción explícita de reinicio global (`resetProgress`) restablece los estados a `unseen`.

---

## 4. Persistencia y Almacenamiento Local

Toda la progresión del estudiante reside íntegramente en el cliente (`localStorage`), garantizando privacidad y portabilidad estática:

- `visual_tda_student_progress_records`: Almacena el diccionario completo con metadatos:
  ```json
  {
    "n-queens": {
      "state": "completed",
      "updatedAt": 1727189999000,
      "passedTestsCount": 3,
      "totalTestsCount": 3
    }
  }
  ```
- `visual_tda_completed_exercises`: Mantiene sincronizada la lista de IDs aprobados para compatibilidad total con consumidores heredados y suites de prueba automatizadas.

---

## 5. Integración con la Interfaz de Usuario

1. **Catálogo de Ejercicios (`ExerciseList`, `ExerciseCard`)**:
   - Cada tarjeta muestra el badge específico del estado actual (`[Completado]`, `[Resuelto]`, `[En Pruebas]`, `[En Desarrollo]`, `[Explorando]`).
   - El botón de acción adapta su etiqueta al estado cognitivo (`Explorar Ejercicio`, `Continuar Exploración →`, `Continuar Resolución →`, `Ver Análisis Formal →`, `Revisar Ejercicio`).
   - Las barras de progreso de cada una de las 5 Rutas de Paradigma reflejan el porcentaje real de maestría alcanzado en esa técnica.

2. **Selector de Fases (`PhaseSwitcher`)**:
   - Fase 3 (*Comprender*) permanece visualmente bloqueada hasta que el estudiante alcanza el estado `passed` o el profesor activa el `Modo Docente`.
   - Se incluye un modal de fricción pedagógica con advertencia reflexiva si el alumno intenta saltar prematuramente sin haber pensado la solución.

3. **Editor de Código Python (`SolveView`)**:
   - Al tipear código se promueve a `attempted`.
   - Al presionar *Pruebas Rápidas* o *Ejecutar en Python (Pyodide)*, el resultado se desglosa caso por caso y se actualizan los contadores diagnósticos en `testing` o `passed`.
