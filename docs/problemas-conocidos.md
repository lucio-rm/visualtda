# Visual TDA — Registro de Incidencias Técnicas y Soluciones de Ingeniería

Este documento registra los principales defectos técnicos, matemáticos y de interfaz detectados durante el desarrollo y aseguramiento de calidad de Visual TDA, junto con su análisis de causa raíz y la solución de ingeniería adoptada.

---

## 1. Motor Algorítmico, Validadores y Ejecución Python

### 1.1 Validación de tableros parciales en el laboratorio de N-Reinas
- **Comportamiento observado**: En la fase *Descubrir* de N-Reinas, colocar dos reinas en casillas que no se atacan mutuamente (por ejemplo, $(0, 1)$ y $(1, 3)$) disparaba un mensaje de conflicto indicando columna `-1` fuera de rango en las filas aún vacías.
- **Causa raíz**: El playground reutilizaba el validador de solución completa (`validate`), que exigía las $N$ reinas colocadas, interpretando las filas vacías (`-1`) como errores de rango.
- **Solución implementada**: Se incorporó `validatePartial({ n }, board)` en `src/engine/algorithms/nQueensValidator.ts`, evaluando ataques exclusivamente entre pares de reinas efectivamente posicionadas en el tablero, con cobertura exhaustiva en `tests/nQueensValidator.test.ts`.

### 1.2 Normalización de formatos de entrada y alias en Mochila Fraccionaria y Mochila 0/1
- **Comportamiento observado**: Las soluciones canónicas de `knapsack-greedy` y `knapsack-dp` recibían objetos estructurados (`list[dict]`) o listas paralelas de pesos y valores según el runner invocado, y en inglés utilizaban firmas localizadas (`fractional_knapsack_greedy`, `knapsack_01`).
- **Causa raíz**: Inconsistencia entre la firma de 2 argumentos (`items, capacidad`) y la firma de 3 argumentos (`capacidad, pesos, valores`).
- **Solución implementada**: Se normalizaron `exercises/knapsack-greedy/solution.py`, `exercises/knapsack-dp/solution.py`, `src/runtime/greedyRunner.ts` y `src/runtime/dpRunner.ts` para soportar de forma transparente tanto diccionarios como listas paralelas y exponer alias bilingües.

### 1.3 Cobertura completa de validadores formales y prevención de filtración de respuestas
- **Comportamiento observado**: Once ejercicios delegaban únicamente en casos de prueba estáticos sin un módulo `*Validator.ts` dedicado en `src/engine/algorithms/`, y los validadores de Cambio de Monedas y Programación Lineal incluían la combinación óptima explícita en el mensaje de error cuando fallaba el test del estudiante.
- **Causa raíz**: Mensajes de diagnóstico excesivamente detallados que revelaban el testigo óptimo antes de superar la fase *Resolver*.
- **Solución implementada**:
  1. Se redactaron los mensajes de fallo en `coinChangeValidator.ts` y `linearProgrammingValidator.ts` para reportar únicamente el desajuste funcional sin revelar el vector solución ni el subconjunto óptimo de monedas.
  2. Se implementaron los 11 módulos validadores faltantes (`peakFindingValidator.ts`, `karatsubaValidator.ts`, `medianOfMediansValidator.ts`, `majorityElementValidator.ts`, `juanElVagoValidator.ts`, `lcsValidator.ts`, `weightedIntervalValidator.ts`, `segmentedLeastSquaresValidator.ts`, `rnaSecondaryStructureValidator.ts`, `bellmanFordValidator.ts`, `fairCoinValidator.ts`) verificando optimalidad y factibilidad matemática desde primeros principios.

---

## 2. Visualizadores, Línea de Tiempo y Diseño Responsivo

### 2.1 Visualización explícita del árbol prefijo en Codificación de Huffman
- **Comportamiento observado**: El visualizador de Huffman mostraba la cola de prioridad (Min-Heap) y la tabla de códigos resultante, pero omitía el dibujo estructural del árbol binario de prefijos durante las fusiones sucesivas.
- **Causa raíz**: `huffmanTrace.ts` sólo exponía la lista plana de nodos activos en la cola sin preservar las referencias padre/hijo de las fusiones históricas.
- **Solución implementada**: Se extendió `HuffmanStepData` con `allNodes` y `forestRoots` y se creó `src/components/visualizers/HuffmanTreeSvg.tsx` para representar el bosque en construcción y el árbol binario final con etiquetas `0`/`1` en cada rama.

### 2.2 Estandarización de controles de línea de tiempo (`TraceScrubber`)
- **Comportamiento observado**: Dos visualizadores utilizaban `TraceScrubber` mientras que los 35 restantes empleaban barras `<input type="range">` manuales sin marcas de hitos ni vista previa de paso.
- **Solución implementada**: Se unificaron los 37 visualizadores bajo el componente accesible `TraceScrubber`, manteniendo compatibilidad con navegación por teclado (`Espacio`, `←`, `→`, `R`, `Home`, `End`) y lectores de pantalla.

### 2.3 Contención responsiva en pantallas móviles (360px – 390px) y eliminación de ornamentos visuales
- **Comportamiento observado**: En viewports móviles de 390px, algunos contenedores flex/grid y lienzos SVG con `min-width: 600px` generaban desplazamiento horizontal a nivel de documento. Asimismo, ciertos visualizadores empleaban filtros SVG difusos (`feDropShadow`, `feGaussianBlur`) y colores hexadecimales fuera de la paleta semántica.
- **Solución implementada**:
  1. Se eliminaron las restricciones `min-width: 600px` en `RoadAntennasVisualizer.css` y `RoadAntennasPlayground.css`, y se añadió contención `min-width: 0; max-width: 100%` en `App.css` para grillas y paneles de la fase *Comprender*.
  2. Se removieron todos los filtros decorativos de brillo y se unificaron los colores de estado sobre las variables CSS semánticas (`--accent`, `--success`, `--warning`, `--error`).

---

## 3. Arquitectura, Internacionalización y Canal de Feedback

### 3.1 Ruptura de dependencia circular en definición de temas
- **Comportamiento observado**: `src/app/App.tsx` y `src/components/Header.tsx` se importaban mutuamente a raíz del tipo `ThemeMode`.
- **Solución implementada**: Se extrajo `ThemeMode` a `src/types/theme.ts`, logrando cero ciclos de importación en todo `src/`.

### 3.2 Idioma Español por defecto y paridad completa en Inglés
- **Comportamiento observado**: En navegadores configurados en inglés (`navigator.language = 'en-US'`), la primera visita abría la interfaz en inglés, y 29 ejercicios carecían de traducción al inglés para sus bloques de teoría extensa.
- **Solución implementada**: Se fijó `'es'` como idioma predeterminado estricto en la primera visita dentro de `LanguageContext.tsx` y se completaron las 37 traducciones académicas al inglés en `src/engine/content/englishTheoryContent.ts`.

### 3.3 Verificación de estado HTTP en envíos del modal de Feedback
- **Comportamiento observado**: `FeedbackModal.tsx` consideraba exitoso cualquier `fetch()` resuelto aun cuando el servicio externo devolviera un código HTTP de error (`500` o `429`) o un objeto JSON con `success: "false"`.
- **Solución implementada**: Se incorporó validación explícita de `res.ok` y del cuerpo JSON en `submitToEndpoint`, mostrando alerta de error con opción de reintento y copia al portapapeles cuando ambos endpoints fallan.

---

## 4. Criterios de Mantenimiento
- Todo defecto reportado o detectado en auditoría debe acompañarse de una prueba de regresión automatizada en `tests/` (Vitest) o `tests/e2e/` (Playwright).
- Antes de publicar cambios en la rama de trabajo, deben superarse sin errores las compuertas `npm run typecheck`, `npm run lint`, `npm test`, `npm run build` y `npm run test:e2e`.
