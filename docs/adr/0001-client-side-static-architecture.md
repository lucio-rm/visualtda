# ADR-0001: Client-Side Static Web Architecture & In-Browser Python Runtime

## Status
Accepted

## Context
Visual TDA is an interactive educational platform designed for computer science university students (FIUBA Cátedra 75.29 / 95.06, Kleinberg & Tardos curriculum). Traditional online judge platforms and interactive coding websites depend on backend execution sandboxes (Docker containers, remote execution microservices, server databases, and stateful session backends).

This traditional architecture introduces severe operational drawbacks:
1. High infrastructure costs for maintaining isolated remote execution containers.
2. Denial-of-Service and code execution vulnerabilities from running untrusted student Python code on institutional servers.
3. Vulnerability to server outages during peak assignment submission deadlines.
4. Friction in deploying, maintaining, and distributing the educational resource.

## Decision
We adopt a **pure client-side static web application** architecture:
- Static single-page application built via React 19, TypeScript, and Vite.
- Static output deployable directly to edge static content delivery networks (Cloudflare Pages, GitHub Pages) without any server-side computing layer.
- Python code execution runs entirely inside the user's browser using **Pyodide** (CPython compiled to WebAssembly) encapsulated inside a dedicated **Web Worker**.
- Worker execution is guarded by timeout watchdogs and isolation boundaries to prevent main-thread UI freezing.
- State persistence is managed locally via `localStorage` with JSON schema validation.

## Consequences

### Positive
- **Zero backend infrastructure costs**: Hosting requires only static storage and global CDN bandwidth.
- **Indefinite availability**: The platform cannot suffer from server crashes, database connection pool exhaustion, or backend downtime.
- **Air-gapped and portable deployment**: The static build in `dist/` can be distributed, hosted anywhere, or even run locally off a static file server.
- **Zero server-side security liability**: Untrusted student code runs exclusively inside the student's own browser sandbox.

### Negative / Trade-offs
- **Initial asset weight**: Pyodide's WebAssembly binaries and standard library packages require an initial download (~10-15MB cached by the browser).
- **Execution variance**: Benchmarks and execution speeds depend on the student's local CPU rather than a standardized server environment.
- **Client-side security boundaries**: All application code and verification logic reside on the client; security gates must be designed with cryptography and realistic client threat models rather than relying on server-side secrets.
