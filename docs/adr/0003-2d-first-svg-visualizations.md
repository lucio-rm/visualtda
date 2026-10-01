# ADR-0003: 2D-First SVG Vector Visualization Standard Over 3D Frameworks

## Status
Accepted

## Context
When designing visual interactive platforms, teams often contemplate 3D rendering frameworks (Three.js, WebGL, Babylon.js) under the belief that 3D looks more impressive. However, algorithms curriculum (Divide & Conquer, Greedy, DP, Backtracking, Graphs, Network Flow) is fundamentally conceptual and 2D-structural (arrays, recursion trees, bipartite graphs, DAGs, intervals, planar polytopes).

Introducing 3D libraries introduces substantial costs:
1. Massive bundle size impact (+500KB - 1MB minified).
2. Poor text readability and complex camera navigation controls that distract learners.
3. Lack of direct CSS variable styling, breaking high-contrast dark/light mode switches.
4. Serious accessibility barriers for keyboard navigation, screen readers, and low-end hardware.

## Decision
We mandate **2D-First Scalable Vector Graphics (SVG)** as the primary visualization technology across all exercises:
- Native SVG elements (`<svg>`, `<rect>`, `<circle>`, `<line>`, `<path>`, `<text>`) styled via CSS variables.
- Responsive scaling using `viewBox` and responsive aspect ratios.
- Semantic HTML and ARIA accessibility directly on SVG nodes (`role="button"`, `role="slider"`, `tabIndex={0}`, `onKeyDown` handlers).
- Zero external charting or 3D dependencies (no D3, no Three.js, no Chart.js).

## Consequences

### Positive
- **Visual Sharpness & Retina Fidelity**: SVGs render with mathematical vector precision across all device pixel ratios without pixelation.
- **Instant Light/Dark Theme Integration**: SVGs respond directly to CSS variables (`var(--surface)`, `var(--state-active)`, `var(--border)`).
- **Zero Heavy Dependencies**: Keeps the production static bundle ultra-lean.
- **Accessible & Inspectable**: SVG elements are standard DOM nodes that can be inspected, tested with `@testing-library/react`, and traversed via assistive technologies.

### Negative / Trade-offs
- Very large element counts ($>5,000$ simultaneous nodes) can strain DOM layout engines. This is naturally avoided in Visual TDA because educational instances are intentionally kept at digestible cognitive scales ($n \le 50$).
