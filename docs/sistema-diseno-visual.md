# Visual TDA — Sistema de Diseño Visual y Jerarquía de Información

> **Especificación Formal de Diseño Visual, Tokens y Semántica de Estados**  
> **Versión**: 2.0 (Escala Sistemática de 12 Pasos y Tokens Semánticos)  
> **Destinatarios**: Desarrolladores, Diseñadores de Información, Cátedra Universitaria  

---

## 1. Principios Fundamentales del Sistema Visual

1. **Claridad Intelectual sobre Espectáculo**: Los gráficos y transiciones explican la causalidad e invariantes del algoritmo. Jamás se distorsiona la semántica matemática por adorno visual, filtros de brillo ni gradientes decorativos.
2. **Escala Sistemática de 12 Pasos con Contraste Garantizado**: Se erradicó la selección manual de códigos hexadecimales arbitrarios. El sistema utiliza una escala calibrada de 12 pasos en `src/styles/variables.css` con garantías matemáticas de contraste WCAG AA/AAA sin dependencias externas en tiempo de ejecución.
3. **Refuerzo No Basado Exclusivamente en Color**: Cada estado semántico (candidato, seleccionado, óptimo, conflicto, podado) combina al menos dos canales perceptuales independientes: color + grosor de borde, icono/símbolo, estilo de trazo (sólido/discontinuo) o etiqueta textual explícita.
4. **Ergonomía de Lectura y Alto Contraste**: Soporte completo de temas Claro (*Light*) y Oscuro (*Dark*) con pisos de contraste WCAG 2.1 AA ($\ge 4.5:1$ para texto y $\ge 3.0:1$ para elementos no textuales e interactivos).
5. **Composición Adaptable**: Diseño responsivo y modular con disposición de dos columnas en escritorio ($\ge 900\text{px}$) y altura visual contenida para experimentación interactiva ágil.

---

## 2. Arquitectura de Color: Radix Colors 12-Step Scale

### 2.1 Mapeo Funcional de los 12 Pasos

| Paso | Rol en el Sistema | Uso Concreto en Visual TDA |
| :---: | :--- | :--- |
| **1** | Fondo base de la aplicación / pantalla | `--bg` en Modo Oscuro (`#111113`) |
| **2** | Fondo sutil / contenedor empotrado | `--canvas-bg` en Modo Oscuro (`#18191b`), `--surface-hover` en Claro (`#f9f9fb`) |
| **3** | Superficie de componentes / tarjetas | `--bg` en Modo Claro (`#f0f0f3`), `--surface` en Oscuro (`#212225`), fondos de estado tintados (`-bg`) |
| **4** | Hover de componentes interactivos | `--surface-hover` en Modo Oscuro (`#272a2d`), `--canvas-bg` en Claro (`#e8e8ec`) |
| **5** | Estado presionado / seleccionado activo | `--surface-active` en ambos modos |
| **6** | Bordes sutiles y divisores internos | `--border-subtle` (separadores de tarjetas y tablas) |
| **7** | Bordes estándar de componentes | `--border` (bordes estructurales de tarjetas, botones y cajas) |
| **8** | Bordes de énfasis e interactivos | `--border-strong` (casillas de tablero, focus visible) |
| **9** | Relleno sólido vívido principal | `--accent-solid`, botones de acción primaria (`#3e63dd`) |
| **10** | Hover de rellenos sólidos | `--accent-hover` |
| **11** | Texto de bajo contraste / indicadores de color | `--text-muted`, estados activos sobre superficies claras |
| **12** | Texto principal de alto contraste | `--text` ($\ge 14:1$ de contraste contra fondos y superficies) |

---

### 2.2 Escalas Semánticas Adoptadas

1. **Neutro (Slate)**:
   - Fondo general, superficies de tarjetas, lienzos de trabajo, bordes, tipografía primaria y secundaria.
   - Light: `slate-1` a `slate-12` (`#fcfcfd` a `#1c2024`).
   - Dark: `slate-1` a `slate-12` (`#111113` a `#edeef0`).
2. **Acción Primaria / Foco (Indigo)**:
   - Botones principales, enlaces, bordes de elementos bajo evaluación, acento de marca.
   - Light: `indigo-9` (`#3e63dd`), `indigo-11` (`#3a5bc7`).
   - Dark: `indigo-9` (`#3e63dd`), `indigo-11` (`#9eb1ff`).
3. **Éxito / Solución Óptima / Factible (Grass)**:
   - Nodos de la solución, tests aprobados, árbol de expansión mínima aceptado, cobertura alcanzada.
   - Light: `grass-11` (`#2a7e3b`), `grass-3` (`#e9f6e9`).
   - Dark: `grass-11` (`#71d083`), `grass-3` (`#1b2a1e`).
4. **Error / Conflicto / Poda / Inviable (Tomato)**:
   - Conflictos en Sudoku, colisiones de reinas, aristas de corte descartadas, tests fallidos.
   - Light: `tomato-11` (`#d13415`), `tomato-3` (`#feebe7`).
   - Dark: `tomato-11` (`#ff977d`), `tomato-3` (`#391714`).
5. **Atención / Candidato / Heurística Activa (Amber)**:
   - Casillas candidatas en el recorrido del caballo (Knight's Tour), nodo actual en exploración, cotas de ramificación.
   - Light: `amber-11` (`#ab6400`), `amber-9` (`#ffc53d`), `amber-3` (`#fff7c2`).
   - Dark: `amber-11` (`#ffca16`), `amber-9` (`#ffc53d`), `amber-3` (`#302008`).

---

## 3. Mediciones Empíricas de Contraste (Antes vs. Después)

| Elemento / Par Evaluado | Contraste Previo (Manual Hex) | Contraste V11 (Radix Colors) | Estado Calidad WCAG |
| :--- | :---: | :---: | :--- |
| **Casillas de Tablero (Light)** | 2.36:1 *(Fallo < 3.0:1)* | **5.65:1** (`slate-11` vs `slate-2`) | Aprobado (WCAG Non-text UI) |
| **Casillas de Tablero (Dark)** | 1.72:1 *(Fallo < 3.0:1)* | **3.01:1** (`slate-8` vs `slate-1`) | Aprobado (WCAG Non-text UI) |
| **Piezas sobre Casilla Clara** | 3.8:1 | **15.58:1** (`slate-12` sobre `slate-2`) | Aprobado (WCAG AAA) |
| **Piezas sobre Casilla Oscura** | 2.4:1 | **5.94:1** (`#ffffff` sobre `slate-11`) | Aprobado (WCAG AA) |
| **Tarjetas del Catálogo vs. Fondo (Light)** | 1.096:1 *(Indistinguible)* | **1.23:1 + Borde 1.5px (`slate-7`)** | Aprobado (Diferenciación nítida) |
| **Tarjetas del Catálogo vs. Fondo (Dark)** | 1.095:1 *(Indistinguible)* | **1.21:1 + Borde 1.5px (`slate-7`)** | Aprobado (Diferenciación nítida) |
| **Texto Primario sobre Superficie (Light)** | 14.8:1 | **15.60:1** (`slate-12` sobre White) | Aprobado (WCAG AAA) |
| **Texto Primario sobre Superficie (Dark)** | 12.1:1 | **13.10:1** (`slate-12` sobre `slate-3`) | Aprobado (WCAG AAA) |
| **Botones Sólidos de Éxito / Run Tests** | 3.03:1 *(Fallo < 4.5:1)* | **5.07:1** (Blanco sobre `grass-11`) | Aprobado (WCAG AA) |
| **Aristas de Grafo sobre Canvas** | Faint / Discontinuas | **13.10:1** (Light), **15.90:1** (Dark) | Aprobado (WCAG AAA) |

---

## 4. Tipografía y Estructura Numérica

- **Tipografía de Interfaz (UI)**:
  `--font-sans: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;`
  - Optimizado para legibilidad en pantallas retina y estándar.
- **Tipografía de Código y Matrices (Code & Data)**:
  `--font-mono: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace;`
  - Utilizado universalmente en el editor de código, bloques de salida estándar, trazas y métricas.
- **Alineación Numérica Tabular**:
  - Toda tabla y bloque de métricas declara obligatoriamente: `font-variant-numeric: tabular-nums;`
  - Garantiza que los contadores, tiempos de ejecución (ms), índices y matrices DP no oscilen horizontalmente durante la reproducción animada.

---

## 5. Accesibilidad y Modo Movimiento Reducido

El sistema implementa de forma universal la directiva WCAG para usuarios con sensibilidad vestibular:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

Las transiciones y saltos de estado del visualizador se ejecutan de manera instantánea y accesible sin afectar la exactitud matemática del paso.
