# Visual TDA — 2D vs. 3D Algorithmic Visualization Analysis

**Document Version**: 1.0  
**Authority**: Visual TDA Engineering Rules (`AGENTS.md`) — Principles P1 (*KISS*), P8 (*Accessibility by Default*), P10 (*Portable Deployment*), P11 (*Educational Correctness > Visual Spectacle*), & P12 (*Explain the Why*)  
**Academic Alignment**: Kleinberg & Tardos (*Algorithm Design*), CLRS (*Introduction to Algorithms*), Cátedras de Algoritmos FIUBA.

---

## 1. Executive Summary & Core Question

A recurring question in interactive educational engineering is:  
**Should algorithm visualizers use 2D (SVG / Canvas) or 3D (WebGL / Three.js)?**

In Visual TDA, the answer is governed by **Pedagogical Correctness over Visual Spectacle (P11)** and **KISS (P1)**:

> **2D SVG is the canonical, primary visualization standard for Visual TDA.**  
> 3D is reserved strictly for algorithmic problems whose input or state space is intrinsically $\ge 3$ dimensions.

This document provides the formal pedagogical, technical, accessibility, and architectural justification for this decision.

---

## 2. Pedagogical Rationale: Cognitive Load & Algorithmic Invariants

### 2.1 Sweller's Cognitive Load Theory
In algorithm education (FIUBA / Kleinberg & Tardos), a student must focus their working memory on:
1. **The Invariant**: What property holds true before and after each iteration or recursive call?
2. **The State Transition**: Which variables changed from step $t$ to step $t+1$?
3. **The Pruning/Decision Criterion**: Why did the algorithm reject branch $B$ and pick branch $A$?

When an algorithm is rendered in **3D**, extraneous cognitive load multiplies:
- **Perspective Distortion**: A node in the foreground appears larger than an identical node in the background, distorting quantitative comparison (e.g. in Huffman trees or Knapsack bars).
- **Occlusion**: Nodes, edges, or grid cells hide behind one another. The student must orbit the camera, zoom, and rotate merely to verify if an edge exists or if a queen is attacking.
- **Orientation Disorientation**: Losing the spatial reference frame detracts from understanding the algorithmic step.

### 2.2 Alignment with Mathematical & Textbook Notation
In *Algorithm Design* (Kleinberg & Tardos) and *Introduction to Algorithms* (CLRS), all algorithm models are flat 2D conceptual diagrams:
- **Divide & Conquer**: Recursive tree branches bifurcating downward on a 2D plane.
- **Greedy Intervals**: Horizontal non-overlapping 1D segments arranged across a vertical resource axis.
- **Dynamic Programming**: 2D table $M[i, w]$ where recurrence arrows $M[i-1, w]$ and $M[i-1, w-w_i] + v_i$ are immediate orthogonal lookups.
- **Network Flow**: Directed acyclic and residual graphs with clear source-to-sink left-to-right layering.
- **Backtracking**: Search tree with color-coded pruned subtrees.

A 2D SVG diagram matches the mental model taught on university blackboards and lecture slides with zero translation penalty.

---

## 3. Technical & Scalability Comparison

| Dimension | 2D SVG (Visual TDA Standard) | 3D WebGL / Three.js |
|:---|:---|:---|
| **Bundle Size Overhead** | **0 KB** (Native browser SVG DOM) | **+600 KB to 1.5 MB** (Three.js / WebGPU runtime) |
| **GPU / Hardware Demands** | Runs smoothly on any CPU/iGPU, Raspberry Pi, Chromebook | Requires dedicated WebGL context; drains battery on laptops |
| **Resolution Independence** | Infinite vector sharpness at 4K, Retina, classroom projectors | Pixelated or GPU-memory intensive at high DPI |
| **Render Cycle** | **Discrete event-driven**: re-renders only on step change | **Continuous 60 FPS requestAnimationFrame loop**, heating CPUs |
| **Tab Inactivity Stability** | Preserves exact state indefinitely | Susceptible to `WebGLContextLost` errors when backgrounded |
| **100+ Concurrent Students** | Instant page load, zero CDN weight | Potential WebAssembly/WebGL shader compilation latency |

---

## 4. Accessibility (WCAG 2.1 AA) & Inclusive Design

Under **Principle P8 (Accessibility by Default)**:
1. **Screen-Reader Operability**: In SVG, every node is a semantic DOM `<circle>`, `<rect>`, or `<g>` element with `role="img"`, `aria-label`, `<title>`, and `<desc>`. Screen readers can announce: *"Reina colocada en fila 2, columna 3. Conflicto con reina en (0, 1)"*.
2. **Keyboard Focusability**: Individual cells or vertices receive `tabIndex=0` and handle `onKeyDown` (Enter, Space, Arrows), allowing full motor-impaired navigation.
3. **High Contrast & Dark Mode**: SVG fills and strokes leverage standard CSS variables (`var(--surface)`, `var(--accent)`, `var(--text)`), dynamically responding to dark mode and OS high-contrast settings.
4. **WebGL Inaccessibility**: A 3D WebGL `<canvas>` is a black box of opaque pixels to assistive technologies unless an entire secondary virtual DOM tree is built and synchronized.

---

## 5. What Makes a "Good 2D Visualizer" in Visual TDA?

To ensure maximum student comprehension in real time, every 2D visualizer in Visual TDA adheres to the following checklist:

1. **Immediate State Visibility**: All relevant state (arrays, pointers, queues, tables, trees) is visible on a single non-scrolling or cleanly sectioned canvas.
2. **Color Semantics with Meaning**:
   - 🔵 **Primary Blue (`var(--accent)`)**: Currently evaluated candidate / active pointer.
   - 🟢 **Emerald Green (`var(--success)`)**: Committed solution / satisfied constraint / valid state.
   - 🔴 **Crimson Red (`var(--error)`)**: Violated constraint / pruned branch / collision ray.
   - 🟡 **Amber Orange (`var(--warning)`)**: Pending comparison / min-heap extract candidate.
3. **Synchronized Dual-View**:
   - The graphic visualizer is strictly synchronized with the canonical code line highlighting and the explanatory natural-language step banner.
4. **Interactive Timeline Controls**:
   - Large touch/click buttons ($\ge 44 \times 44\text{ px}$) for play/pause, step forward, step backward, reset.
   - Keyboard shortcuts: `Space` (play/pause), `ArrowLeft`/`ArrowRight` (single frame step), `Home`/`End`.
   - Variable playback speed (`0.5x`, `1x`, `2x`, `4x`).
5. **Direct Manipulation in Discover Phase**:
   - Before viewing the solution, the student clicks or drags elements in an interactive 2D sandbox (e.g. placing queens, selecting intervals, clicking coins) to formulate an intuitive hypothesis.

---

## 6. Valid Exceptions: When IS 3D Pedagogically Superior?

In accordance with Visual TDA principles, 3D will only be introduced for exercises where the mathematical problem is intrinsically three-dimensional:
- **3D Convex Hull**: Visualizing the lower and upper convex hulls dividing and merging in 3D space.
- **3D Closest Pair of Points**: Demonstrating that the sparsity lemma still holds in 3D ($O(1)$ candidates per box).
- **3D Linear Programming**: Rendering the 3D feasible polytope bounded by planar half-spaces and visualizing the objective gradient vector finding the optimal vertex.

For all 20 foundational syllabus exercises, **2D SVG is unequivocally the superior pedagogical, accessible, and performant medium.**
