# Architectural Questions for ChatGPT (Project Architect)

This file tracks questions escalated to ChatGPT as the external project architect.
Each question follows the standard format. Implementation proceeds on non-blocking paths while waiting for guidance.

---

## Q-001: Relationship Model between Problem, Technique, and Exercise

- **Status**: OPEN
- **Context**: In traditional algorithm education, a single problem can be addressed with different techniques (e.g. Knapsack via Greedy vs. Knapsack via Dynamic Programming). Furthermore, exercises should be easily registered without cascading directory renames.
- **Question**: How should the domain model represent this relationship? Should each exercise have a compound ID (`knapsack-greedy`, `knapsack-dp`), with a flat folder in `exercises/<exercise-id>`, and metadata referencing `problemId` ("knapsack") and `techniqueId` ("greedy")?
- **Options**:
  1. Flat exercise directory (`exercises/<exercise-id>/`) with metadata `{ id, problemId, techniqueId, category, difficulty }`. (Recommended)
  2. Nested directories (`categories/<category>/<exercise>/`).
  3. Problem-centric directories with sub-technique files.
- **Recommendation**: Option 1 (Flat `exercises/<exercise-id>` with rich metadata).
- **Why**: Eliminates folder renaming headaches, supports multiple techniques for the same problem, simplifies routing, and complies with Principle P5 (Data over branching).

---

## Q-002: Student Submission Tracing vs. Output Validation

- **Status**: OPEN
- **Context**: In the "Resolver" (Solve) phase, students write Python code.
- **Question**: Is the student's code expected to emit step-by-step `TraceEvent` objects, or is it only expected to return the final computation/structure for evaluation by the `Validator`?
- **Options**:
  1. Student code only computes output. Only canonical solutions emit step-by-step trace events for visual replay. (Recommended)
  2. Student code must manually emit trace events via a custom Python library.
  3. AST-based automated code transformation instruments student code.
- **Recommendation**: Option 1.
- **Why**: Requiring students to learn an internal trace API increases cognitive load and distracts from core algorithmic principles. Automated instrumentation (Option 3) is overly complex (violates P1 KISS). Evaluating student output with deterministic Validators gives immediate, robust feedback.

---

## Q-003: Validator Implementation Language and Boundary

- **Status**: OPEN
- **Context**: Validators verify whether an output is correct (especially for problems with multiple valid solutions like N-Queens).
- **Question**: Should Validators be written in TypeScript, Python, or both?
- **Options**:
  1. Primary Validator in TypeScript. Python solutions in Pyodide pass their result across the worker boundary as JSON, and the TypeScript validator validates it. (Recommended)
  2. Duplicate Validators in both TypeScript and Python.
  3. Validator only in Python inside Pyodide.
- **Recommendation**: Option 1.
- **Why**: Keeps testing instantaneous for mock/TS execution, avoids duplicate logic (DRY), and prevents Pyodide dependency for non-Python test flows.

---

## Q-004: Pyodide Lazy Loading Strategy

- **Status**: OPEN
- **Context**: Pyodide + standard libraries can be a 15–25MB download.
- **Question**: When should Pyodide be initialized?
- **Options**:
  1. Strictly on-demand when entering the "Resolver" phase or pressing "Ejecutar / Test". (Recommended)
  2. Background preloading after initial page load completes.
  3. Eager loading on app mount.
- **Recommendation**: Option 1 with optional transition to Option 2 once the app is idle.
- **Why**: Ensures the "Descubrir" and "Comprender" phases load instantly with zero bandwidth penalty.
