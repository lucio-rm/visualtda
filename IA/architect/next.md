# Visual TDA — Master Engineering Mission V6 Roadmap & Next Steps

Este documento define la hoja de ruta y estado operativo tras la finalización del sprint de corrección prioritaria **Misión V6**.

---

## 1. Hitos Completados en Misión V6 (Priority Correction Sprint)

1. ✅ **1.1 — Eliminación Definitiva de Autocompletado del Navegador**:
   - `SolveView.tsx`: flags `autoComplete="off"`, `autoCorrect="off"`, `autoCapitalize="off"`, `spellCheck={false}`, `data-lpignore="true"` e identificadores aislados por ejercicio (`vtda_code_${exercise.id}`).
   - Verificación manual permanente documentada en `docs/known-issues.md`.
2. ✅ **1.2 — Barrido Integral de Precisión Numérica (37/37 Ejercicios)**:
   - Corrección de 5 discrepancias reales: etiquetas de presets en Inversiones (`(5 inv)`) y Mochila DP (`C = 6`), indicador teórico constante en Karatsuba (`1 de 4 (25%)`), cota de poda retenida en Median of Medians, y alerta de fallo voraz con cota real ($18) en Intervalos Ponderados.
   - Suite de regresión en `tests/uiNumberAccuracy.test.ts`.
3. ✅ **1.3 — Balance y Densidad del Layout en Fase Comprender**:
   - Grid ejecutivo de dos columnas con colapso responsivo (`.understand-theory-layout`, `.single-column-collapse`).
   - Enriquecimiento de 16 documentos teóricos con demostraciones formales completas y formato LaTeX.
4. ✅ **1.4 — Calibración de Contraste y Diferenciación en Modo Claro**:
   - Calibración de `variables.css` bajo `[data-theme='light']` superando umbrales WCAG AA (texto $\ge 4.5:1$, UI $\ge 3:1$).
   - Sustitución de colores ad-hoc por tokens semánticos en 106 componentes.
   - Quality gate automatizado en `tests/contrastAndDesignSystem.test.ts`.
5. ✅ **1.5 — Refactorización de Identificadores en Código a Inglés**:
   - Refactorización de 23 archivos `solution.py` a identificadores estándar en inglés, preservando alias en español para retrocompatibilidad con scripts existentes.
6. ✅ **1.6 — Normalización de Títulos y Encabezados**:
   - Utilidad centralizada `src/utils/textFormatting.ts` con sanitización de espaciado y guiones largos (` – `).
   - Test de regresión en `tests/titleSpacing.test.ts`.
7. ✅ **1.7 — UX del Editor y Umbral de Movimiento en Arrastre 2D**:
   - Verificación de identación y retención de tabulaciones en el editor.
   - Umbral $\ge 5\text{px}$ implementado en 9 playgrounds con arrastre para suprimir conflictos entre click simple y drag.
   - Test de regresión en `tests/dragInteractionThreshold.test.tsx`.
8. ✅ **1.8 — Expansión de Lienzos SVG en Visualizadores**:
   - Lienzos SVG ampliados a 680–780px con escalabilidad responsiva y balance above-the-fold.
9. ✅ **Sección 2 — Encriptación de Payloads Canónicos (Protección a Nivel de Datos)**:
   - Erradicación total de imports `solution.py?raw` en el bundle estático.
   - Encriptación pre-build AES-256-GCM con PBKDF2 (100,000 iteraciones) en `scripts/encryptSolutions.mjs`.
   - Módulo criptográfico `src/utils/solutionCrypto.ts` con encapsulación dual (Slot 1 Docente: `MEL75.29`, Slot 2 Estudiante: token de aprobación de pruebas).
   - Desencriptación en memoria en `UnderstandView.tsx`. Cero código Python en texto plano en `dist/`.
   - Test de regresión en `tests/solutionCrypto.test.ts` y especificación en `docs/security.md`.
11. ✅ **Sección 4 — Restricción Docente, Historial de Intentos y Pistas Gated por Esfuerzo**:
    - Código Python canónico y pseudocódigo restringidos en memoria exclusivamente a docentes autenticados.
    - Historial de intentos del estudiante con persistencia de ejecuciones, métricas de tests y restauración al editor en un click.
    - Desbloqueo dinámico de pistas escalado según el paradigma algorítmico (DP/Flujo: 16/22/28; Backtracking/D&C/LP/Reducciones: 10/15/20; Greedy/Aprox: 8/12/16; Aleatorizados: 6/10/14 líneas de lógica real).
    - Erradicación universal de emojis decorativos y candados en favor de SVGs vectoriales limpios y tipografía académica.
    - Rediseño de Fase 3 (Comprender) a un formato secuencial full-width eliminando desbalances de columnas.
    - Editores interactivos de grafos y pesos en Dijkstra, Kruskal, Bellman-Ford y Flujo Máximo.

---

## 2. Próximos Pasos Operativos

1. **Monitoreo de Calidad de Nuevos Ejercicios**:
   - Mantener las suites de oráculos independientes (`referenceSolvers.ts`) como requisito bloqueante ante la incorporación de futuros ejercicios.
2. **Auditoría Periódica de Contraste y Autocompletado**:
   - Ejecutar periódicamente la verificación manual de autofill en perfiles limpios de navegadores web según el protocolo de `docs/known-issues.md`.
3. **Mantenimiento de los Quality Gates**:
   - `npm run lint`: 0 errores, 0 advertencias.
   - `npm run typecheck`: 0 errores.
   - `npm test`: 46 test files, 355 tests (100% PASS).
   - `npm run build`: compilación estática a `dist/` con encriptación pre-build automática en ~1.8s.
