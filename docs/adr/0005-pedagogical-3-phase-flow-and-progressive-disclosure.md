# ADR-0005: Pedagogical Three-Phase Learning Flow (Discover → Solve → Understand)

## Status
Accepted

## Context
Many coding challenge websites present students immediately with an empty code editor and a problem description. For algorithmic curriculum (Kleinberg & Tardos, FIUBA 75.29 / 95.06), jumping straight into code before building spatial and structural intuition leads to trial-and-error guessing, poor mental models, and premature frustration. Conversely, passively reading theoretical proofs without hands-on experimentation leads to superficial comprehension.

## Decision
We organize every exercise in Visual TDA into a deliberate **Three-Phase Learning Flow**:

1. **Phase 1: Discover (*Descubrir*)**:
   - Hands-on visual playground with direct manipulation (dragging points, adding items, placing queens, coloring vertices).
   - "Caso propio" capability allowing students to experiment with custom inputs.
   - Observation of invariants, bottlenecks, and edge cases before seeing or writing any code.
2. **Phase 2: Solve (*Resolver*)**:
   - Formal problem statement, input/output contracts, and constraints.
   - In-browser Python IDE running via Pyodide in a dedicated Web Worker.
   - Progressive hints (up to 3 levels: restriction reminder, structural hint, pseudocode guidance).
   - Automated test execution comparing student output against formal validators and edge cases.
3. **Phase 3: Understand (*Comprender*)**:
   - Academic theory paper with invariants, inductive proofs, and asymptotic derivations.
   - Synchronized visualizer timeline replaying the canonical algorithm step-by-step.
   - Decrypted canonical Python solution and language-independent pseudocode.
   - Executive complexity dashboard and frequent algorithmic trap warnings.

## Consequences

### Positive
- **Deep Conceptual Grounding**: Students approach code only after forming a spatial mental model of the algorithm's invariants.
- **Support for Diverse Learning Styles**: Caters to exploratory learners in Discover, analytical coders in Solve, and formal theoretical learners in Understand.
- **Academic Seriousness**: Maintains university-level rigor without infantilizing gamification or deceptive shortcuts.

### Negative / Trade-offs
- Requires significant authoring effort per exercise (each exercise must deliver a dedicated playground, visualizer, validator, test suite, and enriched theoretical paper).
