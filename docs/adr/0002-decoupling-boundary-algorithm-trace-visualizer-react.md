# ADR-0002: Strict Decoupling Boundary: Algorithm → Trace → Visualizer → React UI

## Status
Accepted

## Context
A recurring anti-pattern in algorithm visualization tools is tight coupling between algorithm execution, DOM rendering, and framework state. When algorithms directly invoke `setState`, manipulate HTML elements, or introduce artificial `setTimeout` delays in the middle of recursive functions:
1. Algorithmic semantics become corrupted to fit animation timings.
2. Code cannot be independently verified or tested in headless test runners (Vitest / Node.js).
3. Stepping backward or jumping to arbitrary steps requires re-running or complex time-travel workarounds.
4. Clean separation of concerns is lost.

## Decision
We enforce a strict unidirectional decoupling boundary across all 37 exercises:
$$\text{Algorithm} \longrightarrow \text{Trace Events} \longrightarrow \text{Visualizer} \longrightarrow \text{React UI}$$

1. **Algorithm Engine (Pure TypeScript / Pure Python)**:
   - Algorithms accept input data and produce deterministic results along with an immutable array of structured trace events.
   - Algorithms have zero awareness of React, DOM, SVG, or animation frames.
2. **Trace Events Contract**:
   - Each trace event is a plain serializable TypeScript object with a semantic `type`, step metadata, variables snapshot, and localized pedagogical narrative.
   - Traces are fully deterministic: identical inputs and seeds yield byte-identical event sequences.
3. **Visualizer Component**:
   - Accepts a specific step index or current event from the trace and deterministically renders the corresponding visual state.
   - Contains no state mutation logic or side effects.
4. **React UI**:
   - Manages user controls (play, pause, step forward/backward, speed slider, scrub bar), phase routing, theme toggles, and layout.

## Consequences

### Positive
- **100% Deterministic Step Replay**: Scrubbing to any step $k$ instantly projects the data structure state at step $k$ with zero re-computation.
- **Headless Automated Testing**: Trace generators are tested via automated Vitest suites (`extendedTraces.test.ts`, `adversarialAndOracles.test.ts`) independently of any browser renderer.
- **Academic Purity**: Canonical algorithmic logic remains faithful to the textbook and lecture specifications.

### Negative / Trade-offs
- Trace arrays for large instances must be carefully bounded to avoid memory exhaustion (addressed by restricting visualizer input presets to educational scales).
