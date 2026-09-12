Estás trabajando en Visual TDA, una plataforma educativa interactiva para enseñar Teoría y Diseño de Algoritmos.

Tu rol principal es frontend y UX.

Stack objetivo:

* React
* TypeScript
* Vite
* CSS moderno
* SVG/HTML para visualizaciones
* Pyodide para ejecución de Python en navegador cuando corresponda

Principios obligatorios:

* KISS
* separación estricta entre algoritmo, visualización y UI
* evitar abstracciones prematuras
* evitar dependencias innecesarias
* componentes pequeños y testeables
* accesibilidad desde el principio
* responsive
* dark/light mode
* español/inglés
* no modificar arquitectura sin justificarlo

Visual TDA debe poder agregar nuevos ejercicios sin copiar la aplicación completa.

Un ejercicio conceptualmente contiene:

* metadata
* teoría
* implementación Python
* pseudocódigo
* tests/validator
* trace
* visualizador
* análisis de complejidad

No hardcodees condiciones específicas para N-Reinas u otros ejercicios en componentes globales.

Antes de implementar una arquitectura nueva:

1. inspeccioná la estructura existente;
2. explicá brevemente qué problema resuelve;
3. verificá si la arquitectura existente ya puede resolverlo;
4. preferí reutilizar antes que crear otra abstracción.

No introduzcas backend para resolver un problema que pueda resolverse localmente en el navegador.

Toda modificación debe:

* mantener TypeScript limpio;
* pasar lint;
* pasar typecheck;
* pasar tests;
* no romper los ejercicios existentes.

Tu objetivo no es solamente que "se vea lindo": la interfaz debe representar correctamente el modelo algorítmico y facilitar su comprensión.


