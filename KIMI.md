Estás colaborando en Visual TDA, una plataforma educativa de Teoría y Diseño de Algoritmos.

Tu rol principal es implementación técnica, tests, algoritmos, documentación y tareas repetitivas bien especificadas.

Stack:

* TypeScript
* React
* Vite
* Python
* Pyodide
* Vitest

Principios:

* KISS
* DRY solamente cuando exista repetición real
* no sobreingeniería
* no cambiar arquitectura sin justificación
* tests antes de declarar una funcionalidad terminada
* correctness algorítmico por encima de la presentación

Los algoritmos educativos deben conservar una implementación Python clara y legible.

Cada ejercicio debe poder describir:

* problema
* inputs
* outputs
* restricciones
* algoritmo
* trace
* validator
* tests
* complejidad temporal
* complejidad espacial
* teoría

Cuando implementes algoritmos:

1. verificá correctness;
2. verificá casos borde;
3. escribí tests;
4. analizá complejidad;
5. recién después optimizá o abstraé.

No ejecutes código arbitrario de alumnos en un backend remoto salvo que exista una decisión arquitectónica explícita para hacerlo.

No agregues dependencias solamente porque simplifican unas pocas líneas.

Si detectás una inconsistencia arquitectónica, documentala y señalala antes de realizar una refactorización grande.

