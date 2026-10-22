# Visual TDA

**Plataforma Interactiva para la Enseñanza y Comprensión Rigurosa de Teoría y Diseño de Algoritmos**  
*Facultad de Ingeniería, Universidad de Buenos Aires (FIUBA)*

Visual TDA es una aplicación web educativa de código abierto, puramente del lado del cliente y sin dependencias de backend, diseñada para el aprendizaje profundo de algoritmos universitarios avanzados. Combina experimentación visual interactiva en el navegador, codificación práctica en Python mediante WebAssembly (Pyodide en Web Workers dedicados) y formalismo académico riguroso: invariantes de corrección, argumentos de intercambio, cotas de corte y análisis asintótico de tiempo y espacio.

---

## Principios y Filosofía Pedagógica

La plataforma estructura cada problema en tres fases formativas progresivas y desacopladas:

1. **Descubrir (Fase 1)**:  
   Laboratorio visual interactivo (tableros, grafos, autómatas, diagramas de arcos) para manipular el problema directamente antes de escribir código. Permite comprender restricciones, advertir contraejemplos e internalizar la intuición perceptual del desafío algorítmico.

2. **Resolver (Fase 2)**:  
   Enunciado formal del problema con firma de función tipada, pistas graduales desplegables y editor de código en Python. La solución se evalúa instantáneamente contra una suite de pruebas locales mediante Pyodide en un entorno aislado, ofreciendo retroalimentación descriptiva sobre casos borde, fallos de aserción y restricciones violadas, sin penalizaciones ni bloqueos arbitrarios.

3. **Comprender (Fase 3)**:  
   Solución canónica oficial comentada, alternable con pseudocódigo de alto nivel, sincronizada con un reproductor de traza determinístico paso a paso (con control de velocidad, saltos temporales y visualización de decisiones internas), demostración matemática formal de invariantes y deducción analítica de complejidad temporal y espacial $O$.

---

## Catálogo de 38 Ejercicios por Paradigma Algorítmico

Visual TDA abarca 38 ejercicios fundamentales distribuidos en 9 ejes temáticos de la currícula universitaria de ciencias de la computación e ingeniería informática:

| Paradigma | Cantidad | Ejercicios Cubiertos | Referencia Sugerida |
|---|:---:|---|---|
| **División y Conquista** | 8 | Merge Sort, Subarreglo de Suma Máxima, Búsqueda de Picos, Conteo de Inversiones, Par de Puntos Más Cercanos, Multiplicación de Karatsuba, Mediana de Medianas, Elemento Mayoritario | Kleinberg & Tardos Cap. 5 / CLRS Cap. 4 |
| **Algoritmos Greedy** | 8 | Planificación de Intervalos, Mochila Fraccionaria, Antenas en Autopista, Codificación de Huffman, Particionamiento de Intervalos, Minimización de Retardo, Camino Mínimo (Dijkstra), Árbol Generador Mínimo (Kruskal) | Kleinberg & Tardos Cap. 4 / CLRS Cap. 16 |
| **Programación Dinámica** | 8 | Mochila 0/1, Juan el Vago (MWIS en grafos camino), Cambio de Monedas, Subsecuencia Común Más Larga (LCS), Intervalos Ponderados, Mínimos Cuadrados Segmentados, Estructura Secundaria de ARN, Caminos Mínimos con Pesos Negativos (Bellman-Ford) | Kleinberg & Tardos Cap. 6 / CLRS Cap. 15 |
| **Backtracking y Ramificación** | 8 | N-Reinas, Suma de Subconjuntos, Coloreo de Grafos (k-Coloring), Sudoku (con heurística MRV), Ciclo Hamiltoniano, Paseo del Caballo, Mochila Branch & Bound, Problema del Viajante (TSP Branch & Bound) | Kleinberg & Tardos Cap. 8 / Russell & Norvig |
| **Redes de Flujo y Cortes** | 1 | Flujo Máximo y Corte Mínimo (Algoritmos de Edmonds-Karp y Ford-Fulkerson) | Kleinberg & Tardos Cap. 7 / CLRS Cap. 26 |
| **Programación Lineal** | 1 | Polítopo Convexo, Región Factible en 2D y Modelado Entero (ILP) | Cormen et al. Cap. 29 |
| **Reducciones de Problemas** | 1 | Conjunto Independiente $\le_P$ Cobertura de Vértices (NP-Completitud y Dualidad de Cook-Levin) | Kleinberg & Tardos Cap. 8 |
| **Algoritmos de Aproximación** | 1 | 2-Aproximación para Cobertura de Vértices (mediante Matching Maximal) | Kleinberg & Tardos Cap. 11 / Vazirani |
| **Algoritmos Randomizados** | 1 | Extractor de Aleatoriedad de Von Neumann (Moneda Justa a partir de Moneda Sesgada) | Mitzenmacher & Upfal |

---

## Arquitectura de Software

Visual TDA sigue un conjunto estricto de invariantes arquitectónicos:

- **Desacoplamiento Estricto**:
  $$\text{Algoritmo (Python / TS)} \longrightarrow \text{Eventos de Traza (JSON)} \longrightarrow \text{Visualizador (SVG)} \longrightarrow \text{Interfaz de Usuario (React)}$$
  Los algoritmos desconocen el DOM y React; generan trazas determinísticas puras que el visualizador renderiza de forma reproducible e idéntica ante la misma semilla o entrada.
- **Zero Backend & Privacidad Absoluta**:
  La aplicación no requiere servidores, bases de datos ni servicios en la nube para funcionar. Todo el código del alumno, los intentos y el progreso se almacenan exclusivamente en el navegador local (`localStorage` / `sessionStorage`).
- **Escalabilidad Concurrente Ilimitada**:
  Al ser un artefacto estático distribuido mediante CDN, el costo computacional de ejecutar algoritmos o pruebas recae 100% en el procesador del cliente. La plataforma soporta con idéntica latencia a 1, 100, 1.000 o 100.000 estudiantes simultáneos.
- **Ejecución Segura con Pyodide en Web Workers**:
  El código Python ingresado por el usuario se compila y ejecuta dentro de un Web Worker independiente sin acceso a `window`, `document` ni tokens de almacenamiento, protegido por un temporizador de interrupción (*watchdog*) de 5 segundos contra ciclos infinitos.
- **Sistema de Color Calibrado (Radix Colors)**:
  Diseño sobrio de alto contraste que cumple con las pautas de accesibilidad WCAG 2.1 AA en temas Claro y Oscuro, prescindiendo de frameworks CSS pesados.
- **Protección Criptográfica de Soluciones Canónicas**:
  Las 38 soluciones oficiales en Python se almacenan cifradas en reposo mediante AES-256-GCM y derivación de clave PBKDF2 (SHA-256 con 100.000 iteraciones). Los estudiantes acceden a la solución tras verificar su intento o de forma voluntaria, mientras que los docentes pueden desbloquear el catálogo completo mediante credencial de cátedra.

---

## Estructura del Repositorio

```text
visual-tda/
├── exercises/          # Metadatos, soluciones canónicas, teoría e invariantes de los 38 ejercicios
├── src/
│   ├── app/            # Componente raíz App, layout principal y estilos CSS
│   ├── components/     # Vistas de fases (Descubrir, Resolver, Comprender), navegación y 38 visualizadores
│   │   ├── illustrations/ # Diagramas SVG vectoriales para encabezados
│   │   └── visualizers/   # Tableros, grafos, árboles y lienzos SVG determinísticos
│   ├── context/        # Estado de React (progreso del alumno, modo docente)
│   ├── engine/         # Registro de ejercicios, modelos algorítmicos, validadores y trazas
│   │   ├── algorithms/ # Implementaciones puras de trazas y validadores TypeScript
│   │   └── content/    # Pistas pedagógicas y código base por paradigma
│   ├── i18n/           # Sistema de internacionalización estricto (Español / Inglés)
│   ├── runtime/        # Web Worker de Pyodide y runners de validación
│   ├── styles/         # Variables CSS, paleta Radix Colors y estilos base
│   └── utils/          # Criptografía Web Crypto, formateo de código y utilidades
├── tests/              # 62 suites de pruebas unitarias y de integración (436 tests en Vitest)
├── scripts/            # Suite de aseguramiento en navegador real Chromium, cifrado y pruebas de carga
├── docs/               # Documentación técnica, registros de decisiones de arquitectura (ADR) y guías
├── public/             # Favicons y activos estáticos
├── index.html          # Entrada HTML con política de seguridad de contenido (CSP) estricta
├── vite.config.ts      # Configuración de empaquetado Vite
└── package.json        # Dependencias y scripts del proyecto
```

---

## Comandos y Desarrollo Local

### Requisitos Previos
- **Node.js**: versión 18.0 o superior
- **npm**: versión 9.0 o superior

### Instalación y Ejecución

```bash
# 1. Clonar el repositorio
git clone https://github.com/lucio-rm/visual_tda.git
cd visual_tda

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo local
npm run dev

# 4. Abrir en el navegador: http://localhost:5173
```

### Verificación de Calidad y Pruebas

El proyecto implementa cuatro compuertas de calidad obligatorias antes de cualquier despliegue:

```bash
# 1. Verificación de tipos TypeScript en modo estricto
npm run typecheck

# 2. Análisis estático de código (ESLint)
npm run lint

# 3. Suite completa de pruebas unitarias e integración (436 pruebas en Vitest)
npm test

# 4. Generación del bundle estático de producción (dist/)
npm run build

# 5. Suite de pruebas funcionales en navegador real Chromium (CDP headless)
npm run test:browser
```

---

## Atajos de Teclado

| Atajo | Acción | Contexto |
|---|---|---|
| `Ctrl + K` / `Cmd + K` | Búsqueda rápida de ejercicios | Global |
| `?` | Abrir panel de ayuda y atajos de teclado | Global (fuera de campos de texto) |
| `Espacio` | Pausar / reanudar reproducción de traza | Fase Comprender |
| `Flecha Izquierda` | Retroceder un paso en la traza | Fase Comprender |
| `Flecha Derecha` | Avanzar un paso en la traza | Fase Comprender |
| `Inicio` (`Home`) | Saltar al paso inicial de la traza | Fase Comprender |
| `Fin` (`End`) | Saltar al paso final de la traza | Fase Comprender |
| `1`, `2`, `3` | Navegar entre fases (Descubrir, Resolver, Comprender) | Vista de ejercicio (fuera del editor) |
| `Ctrl + Enter` | Ejecutar pruebas sobre la solución en Python | Editor de código en Fase Resolver |
| `Escape` | Cerrar cualquier modal abierto | Global |

---

## Reconocimientos Académicos

Visual TDA ha sido desarrollado en consonancia con los contenidos y la rigurosidad pedagógica de la materia **Teoría de Algoritmos** del Departamento de Computación de la Facultad de Ingeniería de la Universidad de Buenos Aires (FIUBA).

Agradecimiento especial a los profesores y referentes académicos de la cátedra:
- **Prof. Martín Buchwald**
- **Prof. Federico Genender**
- **Prof. Jon Kleinberg** y **Prof. Éva Tardos** (autores de *Algorithm Design*)

---

## Licencia

Este proyecto se distribuye bajo los términos de la Licencia [GNU General Public License v3.0 (GPL-3.0)](LICENSE).
