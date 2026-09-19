# Visual TDA — Security Specification & Repository Hardening

**Document Version**: 1.0  
**Authority**: Subordinate to `AGENTS.md`  
**Target Environment**: Client-Side Static Application (SPA) with In-Browser Pyodide Execution  

---

## 1. Overview & Threat Model

Visual TDA executes untrusted student-submitted Python code and renders complex algorithmic visualisations directly in the student's browser. Because there is **no backend server, no database, and no privileged API**, the security threat model differs fundamentally from traditional web services:

1. **Primary Threats**:
   - Client-side Denial of Service (DoS): Infinite loops, recursive stack exhaustion, massive memory allocations (`StringIO` or huge arrays) that freeze the student's browser tab.
   - Cross-Site Scripting (XSS): Malicious input injected via student code, stdout, markdown, or URL parameters rendered insecurely into the DOM.
   - Host Isolation Escapes: Untrusted Python code escaping the Web Worker to manipulate the DOM, steal cookies/localStorage, or issue unauthorized network requests.
   - Supply Chain Attacks: Compromised npm dependencies or CDN-hosted scripts (e.g. Pyodide CDN).
2. **Non-Threats**:
   - Server takeover, SQL injection, remote code execution on server infrastructure (no backend exists).
   - Cross-user data contamination (each user runs in complete browser isolation).

---

## 2. In-Browser Python Execution Security (Pyodide)

### 2.1 Web Worker Boundary
All Python code execution occurs inside a dedicated Web Worker (`src/runtime/pyodideWorker.ts`). This guarantees:
- **No Direct DOM Access**: Web Workers have no `window`, `document`, or DOM access. Python cannot tamper with the UI thread.
- **Thread Isolation**: Heavy computation runs off the main browser thread, keeping UI rendering responsive.

### 2.2 Execution Watchdog & Timeout
- Every code execution request is wrapped in an active watchdog timer (`pythonExecutionService.ts`).
- **Default Timeout**: 5,000 milliseconds (5 seconds).
- **Enforcement Mechanism**: If execution exceeds the timeout, the main thread invokes `worker.terminate()`, instantly halting WebAssembly execution, killing infinite loops, and freeing thread memory. A fresh replacement worker is lazily spawned for subsequent requests.

### 2.3 Injection Prevention
- Student code is **never** concatenated or interpolated into Python string templates.
- Inputs (`code`, `functionName`, `args`) are injected directly as Pyodide global variables (`pyodide.globals.set(...)`).
- A static execution wrapper uses `exec(code, isolated_namespace)` with clean namespace destruction upon completion.

### 2.4 Output & Resource Quotas
- **Standard Output (stdout) Cap**: Output buffer is capped at 64 KB. Any excess is truncated with an explanatory warning to prevent memory exhaustion DoS.
- **Exception Containment**: Execution catches `BaseException` (including `SystemExit` and `KeyboardInterrupt`) so student scripts cannot abruptly crash the worker without structured error reporting.
- **Serialization Guard**: Return values pass through guarded `json.dumps()` serialization. Un-serializable outputs (functions, lambdas, infinite generators) produce helpful pedagogical errors rather than uncaught worker exceptions.

---

## 3. Input Sanitization & XSS Defense

### 3.1 Strict Prohibition of Unsafe DOM APIs
Under Visual TDA engineering rules (Principle P8/P9):
- `dangerouslySetInnerHTML`: Strictly forbidden.
- `element.innerHTML`: Strictly forbidden.
- `eval()` and `new Function()`: Strictly forbidden.
- `document.write()`: Strictly forbidden.

### 3.2 Student Code & Output Rendering
- Student code is rendered exclusively via controlled React `<textarea>` components and escaped `<pre><code>` blocks.
- Execution errors, trace messages, and test outputs are rendered as pure React text nodes (`{text}`), ensuring automatic HTML entity escaping by React 19's virtual DOM.

---

## 4. Repository & CI Security

### 4.1 GitHub Repository Configuration Rules
The following repository settings are required for production readiness:
1. **Branch Protection (`main`)**:
   - Require pull request reviews before merging (minimum 1 approval).
   - Require status checks to pass before merging:
     - `Linting` (`npm run lint`)
     - `TypeScript Typecheck` (`npm run typecheck`)
     - `Run Vitest Unit Tests` (`npm run test`)
     - `Production Static Build` (`npm run build`)
   - Require branches to be up to date before merging.
   - Do not allow force pushes (`push --force`).
   - Do not allow branch deletion.
2. **Principle of Least Privilege for GitHub Actions**:
   - Set `permissions: contents: read` globally on all CI workflows.
   - Never grant write permissions unless specifically publishing a static release artifact.
   - Never expose repository secrets to pull requests from forks.

### 4.2 Secret & Credential Management
- No secrets, API keys, credentials, or `.env` files are permitted in the repository.
- Automated repository audits scan for patterns: `API_KEY`, `SECRET`, `TOKEN`, `PASSWORD`, `Bearer`, `sk-`, `pk_`.
- `.gitignore` strictly excludes `node_modules/`, `dist/`, `.env`, and temporary scratch directories.

---

## 5. Dependency & Supply Chain Security

### 5.1 Minimal Dependency Policy
Visual TDA maintains an extreme minimalism policy:
- **Production Runtime**: Only `react` and `react-dom`. Zero third-party UI libraries, state libraries, or utility bloat.
- **Dev Dependencies**: Scoped strictly to build and test toolchains (`vite`, `vitest`, `typescript`, `eslint`).

### 5.2 Dependency Auditing
- `npm audit` is run continuously.
- Automated dependency updates (Dependabot / Renovate) must be verified through the full CI test suite before merging.
- No `npm audit fix --force` without comprehensive regression testing.

---

## 6. Privacy & Data Handling

- **Zero Tracking**: Visual TDA does not include analytics, tracking pixels, third-party beacons, or telemetry.
- **No User Accounts**: No logins, passwords, emails, or personal identifying information (PII) are collected or stored.
- **Local Storage Isolation**: Only non-sensitive user preferences (`theme: 'system' | 'light' | 'dark'`) are persisted to browser `localStorage`.
