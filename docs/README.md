# Documentación Técnica de Visual TDA

Índice central de arquitectura, especificaciones de diseño, registros de decisiones y criterios pedagógicos de la plataforma.

---

## Índice General de Documentos

### 1. Arquitectura y Decisiones de Software
- **[Arquitectura del Sistema](arquitectura.md)**: Diagrama de capas, protocolo de eventos de traza determinísticos (`TraceEvent`), frontera de desacoplamiento y modelo de ejecución cliente.
- **[Registros de Decisiones de Arquitectura (ADRs)](adr/README.md)**: Historial formal de decisiones clave:
  - `ADR-0001`: Arquitectura estática pura del lado del cliente.
  - `ADR-0002`: Frontera estricta de desacoplamiento Algoritmo $\to$ Traza $\to$ Visualizador $\to$ UI.
  - `ADR-0003`: Visualizaciones determinísticas 2D en SVG sobre 3D.
  - `ADR-0004`: Cifrado criptográfico de soluciones de referencia en reposo (AES-256-GCM + PBKDF2).
  - `ADR-0005`: Flujo pedagógico de 3 fases progresivas (Descubrir $\to$ Resolver $\to$ Comprender).

### 2. Seguridad y Escalabilidad
- **[Especificación de Seguridad y Modelo de Amenazas](seguridad.md)**: Modelo de amenazas en navegador, aislamiento de Pyodide en Web Workers sin acceso al DOM, contención de ciclos infinitos y CSP estricta.
- **[Análisis de Carga y Concurrencia](analisis-de-carga.md)**: Pruebas empíricas con simulación de 100+ estudiantes simultáneos (`scripts/loadTest100Users.mjs`), latencias p50/p95/p99 y justificación de escalabilidad estática en CDN.
- **[Privacidad de Datos y Almacenamiento Local](privacidad.md)**: Garantías de arquitectura Zero-Backend y persistencia en `localStorage`/`sessionStorage` en el dispositivo del alumno.

### 3. Principios y Diseño Visual
- **[Principios Fundamentales de Ingeniería (P1 – P12)](principios-diseno.md)**: KISS, no abstracción prematura, determinismo, accesibilidad por defecto y explicación del *por qué*.
- **[Sistema de Diseño Visual](sistema-diseno-visual.md)**: Escala sistemática de 12 pasos de contraste calibrado, semántica de estados por doble canal y soporte completo de temas Claro y Oscuro.
- **[Lista de Verificación de Accesibilidad (a11y)](lista-accesibilidad.md)**: Criterios de conformidad con WCAG 2.1 Nivel AA, operabilidad por teclado y foco visible.
- **[Análisis de Visualización 2D vs. 3D](visualizacion-2d-vs-3d.md)**: Justificación teórica y empírica de por qué 2D SVG supera a WebGL para la enseñanza algorítmica universitaria.

### 4. Pedagogía y Calidad Académica
- **[Guía de Lenguaje Pedagógico](guia-lenguaje-pedagogico.md)**: Convenciones de redacción académica, tono universitario, rigor matemático y tratamiento de la complejidad.
- **[Auditoría Curricular y Cobertura Académica](auditoria-curricular.md)**: Alineación temática con la materia Teoría de Algoritmos (FIUBA) y la bibliografía canónica (Kleinberg & Tardos, CLRS).
- **[Matriz de Calidad de los 37 Ejercicios](matriz-calidad-ejercicios.md)**: Mapeo completo de problemas, técnicas algorítmicas, invariantes de ciclo/corte y complejidades asintóticas.
- **[Criterios y Compuertas de Calidad](criterios-calidad.md)**: Definición formal de compuertas G1 a G15 (build estático, tipos estrictos, linteo, tests unitarios, browser QA, contraste y rendimiento).
- **[Historial de Problemas Resueltos](problemas-conocidos.md)**: Registro técnico forense de defectos identificados durante el desarrollo y su resolución definitiva.
- **[Hoja de Ruta (Roadmap)](roadmap.md)**: Estado de hitos del proyecto y evolución planificada.

### 5. Guías para Desarrolladores y Contribución
- **[Guía Paso a Paso para Agregar un Nuevo Ejercicio](guia-agregar-ejercicio.md)**: Manual exhaustivo de contribución: estructura de archivos, esquemas JSON, solución canónica en Python, demostración matemática de invariantes, generador de trazas, validadores y componentes visuales en SVG.
