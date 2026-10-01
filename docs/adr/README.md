# Architecture Decision Records (ADRs)

This directory documents the foundational architectural and design decisions governing **Visual TDA**.
Each ADR captures the context, considered alternatives, chosen decision, and resulting consequences.

---

## Index of Architectural Decisions

| ADR | Title | Status | Date |
|:---|:---|:---|:---|
| [ADR-0001](0001-client-side-static-architecture.md) | Client-Side Static Web Architecture & In-Browser Python Runtime | Accepted | 2026-09-18 |
| [ADR-0002](0002-decoupling-boundary-algorithm-trace-visualizer-react.md) | Strict Decoupling Boundary: Algorithm → Trace → Visualizer → React UI | Accepted | 2026-09-19 |
| [ADR-0003](0003-2d-first-svg-visualizations.md) | 2D-First SVG Vector Visualization Standard Over 3D Frameworks | Accepted | 2026-09-20 |
| [ADR-0004](0004-canonical-solution-encryption-aes-gcm.md) | Dual-Recipient AES-256-GCM Payload Encryption for Solution Gating | Accepted | 2026-10-01 |
| [ADR-0005](0005-pedagogical-3-phase-flow-and-progressive-disclosure.md) | Pedagogical Three-Phase Learning Flow (Discover → Solve → Understand) | Accepted | 2026-09-22 |

---

## ADR Template Reference

All new records in this directory adhere to the standard structure:
1. **Title**: Number and brief summary of the decision.
2. **Status**: `Proposed`, `Accepted`, `Superseded`, or `Deprecated`.
3. **Context**: Technological, pedagogical, or operational problem being solved.
4. **Decision**: Concrete architectural path selected.
5. **Consequences**: Positive benefits, trade-offs, and operational boundaries.
