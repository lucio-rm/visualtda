# Visual TDA — Sistema de Diseño Visual y Jerarquía de Información

> **Especificación Formal de Diseño Visual, Tokens y Semántica de Estados**  
> **Versión**: 1.0 (Misión V5)  
> **Destinatarios**: Desarrolladores, Diseñadores de Información, Cátedra Universitaria  

---

## 1. Principios Fundamentales del Sistema Visual

1. **Claridad Intelectual sobre Espectáculo**: Los gráficos y transiciones deben explicar la lógica y causalidad del algoritmo; jamás distorsionar un paso para lucir llamativo.
2. **Color con Propósito Semántico**: Ningún color se aplica por mero adorno. Todo tono representa un estado del sistema (factible, violado, podado, visitado, memoizado).
3. **Ergonomía de Lectura**: Soporte de temas Claro (*Light*) y Oscuro (*Dark*) de alto contraste sin fatiga visual (contrastes mínimos WCAG 2.1 AA de 4.5:1 para texto normal y 3:1 para gráficos interactivos).
4. **Respeto del Espacio "Above-the-Fold"**: Los componentes interactivos (tableros, mochilas, árboles, matrices DP) deben ser visibles inmediatamente al ingresar a la pantalla en resoluciones desde 1366×768 hasta 1920×1080.

---

## 2. Paleta de Colores y Tokens CSS

### 2.1 Variables Base y Superficies

| Token | Modo Claro (*Light*) | Modo Oscuro (*Dark*) | Semántica |
| :--- | :--- | :--- | :--- |
| `--bg` | `#f1f5f9` (Slate 100) | `#0f172a` (Slate 900) | Fondo principal de la ventana |
| `--surface` | `#ffffff` (White) | `#1e293b` (Slate 800) | Tarjetas, contenedores principales |
| `--surface-hover` | `#f8fafc` (Slate 50) | `#334155` (Slate 700) | Estados hover de tarjetas y botones |
| `--surface-active` | `#e2e8f0` (Slate 200) | `#475569` (Slate 600) | Prensado o activo |
| `--border` | `#cbd5e1` (Slate 300) | `#334155` (Slate 700) | Bordes divisorios estándar |
| `--border-strong` | `#94a3b8` (Slate 400) | `#475569` (Slate 600) | Bordes de énfasis y marcos interactivos |
| `--text` | `#0f172a` (Slate 900) | `#f8fafc` (Slate 50) | Texto principal de alta legibilidad |
| `--text-muted` | `#475569` (Slate 600) | `#94a3b8` (Slate 400) | Metadatos, explicaciones secundarias |

### 2.2 Colores Semánticos Algorítmicos

| Token | Valor Hex | Significado Algorítmico |
| :--- | :--- | :--- |
| `--accent` | `#2563eb` (Blue 600) | Decisión activa, puntero actual, acción primaria |
| `--success` | `#15803d` (Green 700) | Estado factible, solución óptima encontrada, test aprobado |
| `--success-bg` | `#dcfce7` (Green 100) | Fondo de solución factible o tests exitosos |
| `--error` | `#b91c1c` (Red 700) | Conflicto de restricción, desborde de capacidad, poda por violación |
| `--error-bg` | `#fee2e2` (Red 100) | Fondo de advertencia de no factibilidad o error |
| `--warning` | `#b45309` (Amber 700) | Subóptimo detectado, heurística greedy atascada |
| `--warning-bg` | `#fef3c7` (Amber 100) | Fondo de llamada de atención analítica |

---

## 3. Escala Tipográfica y Ritmo Espacial

### 3.1 Tipografías
- **Texto General y UI**: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  - Alta legibilidad nativa en todos los sistemas operativos sin descarga de fuentes externas lentas.
- **Código y Pseudocódigo**: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
  - Espaciado monoespaciado exacto para preservar indentación en Python y matrices tabulares.

### 3.2 Escala de Espaciado (Ritmo de 8px)
- `--space-1`: `4px` (Alineación fina interna, etiquetas compactas)
- `--space-2`: `8px` (Gaps entre badges, botones y métricas)
- `--space-3`: `12px` (Paddings en tarjetas de ítems)
- `--space-4`: `16px` (Paddings estándar de contenedores)
- `--space-5`: `24px` (Separación entre secciones de contenido)
- `--space-6`: `32px` (Gaps principales de grid)
- `--space-8`: `48px` (Separación mayor de secciones)

---

## 4. Estructura de Zonas de Atención (Layout)

Para evitar la "columna infinita" de 650px centrada con excesivo scroll vertical, Visual TDA implementa una **composición de dos columnas en pantallas de escritorio** ($\ge 900\text{px}$):

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Encabezado Compacto: Título del Ejercicio, Nivel, Paradigma y Fases    │
├───────────────────────────────────┬────────────────────────────────────┤
│ ZONA IZQUIERDA:                   │ ZONA DERECHA:                      │
│ - Definición formal               │ - Canvas interactivo               │
│ - Entrada / Salida esperada       │ - Playground de experimentación    │
│ - Advertencia de trampa heurística│ - Visualizador / Mochila / Tablero │
├───────────────────────────────────┴────────────────────────────────────┤
│ PIE DE FASE:                                                           │
│ - Controles de reproducción [↺][←][▶][→] · Slider · Velocidad          │
│ - Botón de avance guiado a la siguiente fase pedagógica               │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 5. Componentes Clave y Guía de Interacción

### 5.1 Barra de Fases (`PhaseSwitcher`)
- Consta de 3 etapas secuenciales claramente identificadas:
  1. `01 Descubrir` (*¿Qué problema resolvemos?*)
  2. `02 Resolver` (*¿Cómo lo resolverías?*)
  3. `03 Comprender` (*¿Por qué funciona?*)
- Las fases no desbloqueadas cuentan con un modal de fricción pedagógica intencional que motiva al estudiante a intentar una solución antes de revelar el código canónico.

### 5.2 Controles de Línea de Tiempo (`TimelineControls`)
- Todos los visualizadores comparten la misma botonera universal accesible:
  - `↺` Reiniciar (Atajo: tecla `R`)
  - `←` Paso anterior (Atajo: tecla `←`)
  - `▶ / ❚❚` Reproducir/Pausar (Atajo: tecla `Espacio`)
  - `→` Paso siguiente (Atajo: tecla `→`)
- Incluye slider continuo de navegación rápida y selector de velocidad ($0.5\times$, $1\times$, $2\times$, $4\times$).

### 5.3 La Mochila Visual (`KnapsackVisualBag`)
- La mochila no es una tabla numérica: es un modelo espacial donde los objetos ocupan volumen proporcional a su peso $w_i$, exhiben su valor $v_i$, muestran la holgura ociosa libre, y alertan mediante un desborde visual rojo si se supera la capacidad máxima $W$.

### 5.4 Tablero de N-Reinas (`NQueensBoard`)
- Casillas alternadas blanco/gris con indicadores de coordenadas en bordes.
- Rayos láser rojos trazados mediante `<line class="conflict-ray-line" />` que conectan en tiempo real a las reinas en conflicto diagonal, horizontal o vertical.
