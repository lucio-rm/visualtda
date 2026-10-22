# Visual TDA — Unified Visual Design Audit & Specification

**Date**: 2026-09-22  
**Standard**: WCAG 2.1 AA Compliance, 8px Spacing Grid, Strict CSS Variable Tokens  
**Authority**: Master Engineering Mission V3 (Section 3.3)

---

## 1. Design Token System

Visual TDA uses zero external CSS frameworks (no Tailwind, Bootstrap, or component libraries) to ensure minimal bundle size, instant load times, and static portability. All visual styles are governed by centralized CSS variables in `src/styles/variables.css` and `src/styles/base.css`.

### 1.1 Color Palette & Theme Modes

| Token | Light Mode Default | Dark Mode (`data-theme="dark"`) | WCAG AA Contrast | Usage |
|---|---|---|---|---|
| `--bg` | `#f8fafc` (Slate 50) | `#0b1120` (Slate 950) | $\ge 12:1$ vs text | Viewport background |
| `--surface` | `#ffffff` | `#1e293b` (Slate 800) | $\ge 8:1$ vs text | Cards, containers, modals |
| `--surface-hover` | `#f1f5f9` | `#334155` (Slate 700) | | Hover states |
| `--border` | `#cbd5e1` (Slate 300) | `#334155` (Slate 700) | $\ge 3:1$ vs surface | Borders, dividers, inputs |
| `--text` | `#0f172a` (Slate 900) | `#f8fafc` (Slate 50) | $\ge 12:1$ vs surface | Main headings and body text |
| `--text-muted` | `#64748b` (Slate 500) | `#94a3b8` (Slate 400) | $\ge 4.6:1$ vs surface | Secondary text, captions, timestamps |
| `--accent` | `#2563eb` (Blue 600) | `#3b82f6` (Blue 500) | $\ge 4.5:1$ vs white | Primary actions, links, focus rings |
| `--success` | `#16a34a` (Green 600) | `#22c55e` (Green 500) | $\ge 4.5:1$ vs bg | Test success, solved state |
| `--error` | `#dc2626` (Red 600) | `#ef4444` (Red 500) | $\ge 4.5:1$ vs bg | Test failure, syntax errors, conflicts |
| `--warning` | `#d97706` (Amber 600) | `#f59e0b` (Amber 500) | $\ge 4.5:1$ vs bg | Instructor mode, warnings, active merges |

---

## 2. Spacing Rhythm (8px Base Grid)

All layout paddings, margins, and gaps strictly align to multiples of 8px (with 4px half-steps for micro-components):

- **4px (`0.25rem`)**: Tight micro-spacing (badge padding, icon margins).
- **8px (`0.5rem`)**: Compact component spacing (button padding vertical, list item gap).
- **16px (`1rem`)**: Standard component padding (card headers, button padding horizontal, toolbar gaps).
- **24px (`1.5rem`)**: Section padding, grid card spacing, playground margins.
- **32px (`2rem`)**: Major layout gap (columns in Solve/Discover views, main content top padding).
- **48px (`3rem`)**: Page landmark separators (catalog grid to welcome banner).

---

## 3. Typography Hierarchy

| Level | Size | Weight | Line Height | Element / Class |
|---|---|---|---|---|
| **Display / H1** | `2.0rem` (32px) | 800 (Bold) | 1.25 | Brand Title (`.brand-title`, Welcome H2) |
| **Section / H2** | `1.5rem` (24px) | 700 (Bold) | 1.3 | Exercise Title (`.exercise-title`, Catalog H3) |
| **Card / H3** | `1.25rem` (20px) | 600 (Semi) | 1.4 | View Titles, Major Card Headers |
| **Subsection / H4** | `1.1rem` (17.6px) | 600 (Semi) | 1.4 | Narrative Headers, Modal Titles |
| **Body** | `1.0rem` (16px) | 400 (Regular) | 1.55 | Narrative text, explanation paragraphs |
| **UI Body / Inputs** | `0.875rem` (14px) | 500 (Medium) | 1.5 | Buttons, tabs, dropdowns, form inputs |
| **Caption / Badge** | `0.75rem` (12px) | 700 (Bold) | 1.2 | Technique badges, difficulty stars, step numbers |
| **Code / Monospace**| `0.875rem` (14px) | 400 / 600 | 1.5 | Python editor, traces, asymptotic formulas |

---

## 4. Button & Interactive Element Hierarchy

1. **Primary Button (`.btn-primary`)**:
   - Background: `var(--accent)`. Text: `#ffffff`.
   - Padding: `0.5rem 1.25rem`. Border radius: `var(--radius-md)` (8px).
   - Usage: "Continuar a Resolver", "Ejecutar Pruebas", "Confirmar".
2. **Secondary Button (`.btn-secondary`)**:
   - Background: `var(--surface)`. Border: `1px solid var(--border)`. Text: `var(--text)`.
   - Hover: Background `var(--surface-hover)`, border `var(--accent)`.
   - Usage: "Limpiar Tablero", "Ver Pista", "Reiniciar Código".
3. **Toggle / Utility Button (`.instructor-mode-toggle`, `.theme-select`)**:
   - Compact inline layout with semantic icons.
   - Active state: Amber/gold border and subtle tint.
4. **Accessible Focus Rings (`:focus-visible`)**:
   - Universal outline: `2px solid var(--accent)`.
   - Offset: `2px` to prevent clipping against button boundaries.

---

## 5. Before vs. After Audit Summary

| Area | Before Mission V3 | After Mission V3 |
|---|---|---|
| **N-Queens Playground** | Displayed confusing out-of-bounds error on unplaced rows when placing $\ge 2$ safe queens. | Partial validation cleanly distinguishes unplaced rows from attack collisions; conflicting queens glow red with ray line. |
| **Huffman Coding** | Only rendered array cards for min-heap; zero tree SVG rendered. | Fully responsive SVG prefix tree forest rendered dynamically at every step with labeled '0'/'1' branch edges. |
| **Demo Access** | No instructor mode; teachers had to either solve code live or hunt for skip buttons. | One-click global "Modo Docente" toggle in header + persistent in localStorage. |
| **Skip Modal** | Generic copy without clear pedagogical reasoning. | Honest friction copy explaining the cognitive value of attempting before revealing without penalties. |
| **Focus Visibility** | Inconsistent outlines across SVG custom buttons. | Consistent `:focus-visible` ring across all interactive SVG elements and HTML controls. |
