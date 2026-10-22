# Visual TDA — Security Specification & Threat Model

**Document Version**: 2.0  
**Authority**: Mandate from Orchestrator; subordinate to `AGENTS.md`  
**Target Architecture**: Client-Side Static Application (SPA) with In-Browser Pyodide Execution  

---

## 1. Threat Model & Assets

### 1.1 Protected Assets
1. **User Browser Environment & Host Stability**: Preventing CPU lockup, memory exhaustion, browser tab crashes, and runaway WebAssembly loops.
2. **User Data & Integrity**: Preventing Cross-Site Scripting (XSS), localStorage/sessionStorage tampering, or credential theft.
3. **Application Integrity**: Ensuring deterministic, reproducible algorithm visualization and validator results without unauthorized client-side state pollution.

### 1.2 Attacker Capabilities & Assumptions
- **The Student / End-User is Untrusted**: Code entered in the code editor must be treated as hostile input. A user may attempt:
  - Infinite loops (`while True: pass`)
  - Exponential recursion stack overflows
  - Memory exhaustion (`"A" * 10**9` or huge allocations)
  - Stdout flooding (`while True: print("X")`)
  - Web Worker escape attempts (`import js`, tampering with global worker scope)
  - Malformed worker message payloads or non-JSON serializable returns
  - HTML / JS script injection via code comments, variable names, or exception tracebacks

### 1.3 Non-Threats & Out-of-Scope Risks
- **Server Takeover & SQL Injection**: Impossible by design — there is **no backend server, no database, and no server-side API**.
- **Multi-Tenant Cross-Contamination**: Each user executes strictly in their own local browser process. There are no shared sessions or server-side state.

---

## 2. In-Browser Python Execution Security (Pyodide)

### 2.1 Web Worker Isolation Boundary
All Python execution is strictly isolated inside a dedicated Web Worker (`src/runtime/pyodideWorker.ts`):
- **Zero Direct DOM Access**: Web Workers do not have access to `window`, `document`, DOM nodes, or UI thread event listeners. Python code cannot alter the UI or read page elements.
- **Thread Isolation**: Heavy computations run entirely off the main thread, keeping 60fps UI animations and user interactions responsive.
- **Worker Message Protocol**: All inputs and outputs crossing the Web Worker boundary are serialized via structured JSON messages (`PythonExecutionRequest` and `PythonExecutionResponse`).

### 2.2 Watchdog Timer & Process Termination
- **Active Watchdog**: Every execution request is bounded by a 5,000 millisecond (5 second) watchdog timer (`src/runtime/pythonExecutionService.ts`).
- **Hard Kill Mechanism**: If computation exceeds 5 seconds, the main thread immediately invokes `worker.terminate()`. This halts the WebAssembly runtime at the OS thread level, instantly aborting infinite loops and freeing memory.
- **Lifecycle Recovery**: After termination, any pending callbacks are cleaned up, and a fresh replacement worker is lazily instantiated for subsequent requests.

### 2.3 Injection Prevention
- **No String Interpolation**: Student code is never concatenated or formatted into Python string templates.
- **Variable Injection**: Arguments and code are loaded into Pyodide via `pyodide.globals.set()`, preventing code injection via argument parameters.
- **Scoped Namespace**: Execution occurs in an isolated Python dictionary namespace (`exec(code, namespace)`) that is destroyed after each test run.

### 2.4 Resource Limits & Quotas
- **Stdout Cap**: Standard output is captured via a custom `StringIO` buffer and capped at **64 KB**. Output exceeding 64 KB is truncated with a warning to prevent browser memory exhaustion.
- **Exception Containment**: The execution wrapper catches `BaseException` (including `SystemExit`, `KeyboardInterrupt`, and `GeneratorExit`), preventing student code from silently aborting the worker script without reporting an error.
- **Serialization Guard**: Return values are serialized using a guarded `json.dumps()` wrapper. Non-serializable objects (custom classes, functions, circular references) produce clean pedagogical errors rather than uncaught worker exceptions.

---

## 3. Input Sanitization & XSS Defense

### 3.1 Strict Prohibition of Unsafe DOM APIs
The codebase strictly adheres to Principles P8 and P9:
- `dangerouslySetInnerHTML`: **Strictly Forbidden** (verified 0 occurrences).
- `element.innerHTML` and `element.outerHTML`: **Strictly Forbidden** (verified 0 occurrences).
- `eval()` and `new Function()`: **Strictly Forbidden** in application code (verified 0 occurrences).
- `document.write()`: **Strictly Forbidden** (verified 0 occurrences).

### 3.2 Output Escaping
- All student code, error tracebacks, and validator messages are rendered as pure React text nodes (`{message}`), guaranteeing automatic HTML entity escaping by React 19's virtual DOM.
- Code displays use controlled `<textarea>` components and escaped `<pre><code>` blocks.

---

## 4. Content Security Policy (CSP)

Visual TDA defines an explicit, strict Content Security Policy meta tag in `index.html`:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'wasm-unsafe-eval' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; worker-src 'self' blob:; connect-src 'self' https://cdn.jsdelivr.net; img-src 'self' data:; font-src 'self' data:; object-src 'none'; base-uri 'self';"
/>
```

### Policy Tradeoffs & Rationale:
- `script-src 'self' 'wasm-unsafe-eval' 'unsafe-eval' https://cdn.jsdelivr.net;`: Required because Pyodide compiles Python into WebAssembly in the browser and loads its core runtime from the jsDelivr CDN.
- `worker-src 'self' blob:;`: Required because Vite bundles Web Workers as Blob URLs or modules.
- `connect-src 'self' https://cdn.jsdelivr.net;`: Required for Pyodide to download `.wasm` binaries and standard library packages on-demand.
- `object-src 'none';`: Blocks Flash, Java, and legacy browser plugins.
- `base-uri 'self';`: Prevents `<base>` tag injection attacks.

---

## 5. Dependency & Supply Chain Security

### 5.1 Minimal Runtime Footprint
- **Production Runtime Dependencies**: Only `react` and `react-dom` (React 19).
- **Zero Third-Party UI Frameworks**: No Tailwind, Bootstrap, Material-UI, Redux, Zustand, or utility libraries (`lodash`, etc.).
- **Dev Dependencies**: Scoped strictly to build and test toolchains (`vite`, `vitest`, `typescript`, `eslint`, `happy-dom`).

### 5.2 Dependency Auditing
- `npm audit` is integrated into the verification workflow.
- Dependencies are locked via `package-lock.json`.

---

## 6. Privacy & Data Handling

- **Zero Tracking**: Visual TDA does not contain any analytics, telemetry, tracking pixels, or third-party cookies.
- **No User Accounts or Passwords**: No personal identifying information (PII) is ever collected, stored, or transmitted.
- **Local-Only Storage**:
  - `localStorage`: Only non-sensitive display preferences (`visual_tda_theme: 'system' | 'light' | 'dark'`, `visual_tda_lang: 'es' | 'en'`).
  - `sessionStorage`: Temporary per-exercise student code draft (`v_tda_code_<exercise_id>`) to prevent work loss during navigation. Cleared when the browser tab closes.

---

## 7. What This System Does NOT Guarantee

To maintain honest, transparent engineering standards, the following limitations are explicitly stated:

1. **Browser-Side Execution is NOT an OS-Level Sandbox**:
   - Pyodide runs inside the student's own browser process. While Web Workers isolate execution from the DOM, a user can intentionally crash their own Web Worker or consume local CPU/memory within their own browser tab.
   - The security boundary protects the student's browser tab from freezing and prevents DOM-based attacks; it is not designed to protect a remote server (since no server exists).
2. **Third-Party CDN Trust**:
   - Pyodide assets are fetched at runtime from `https://cdn.jsdelivr.net`. If the CDN provider is compromised or unavailable, in-browser Python execution will fail.
   - *Mitigation for fully offline deployments*: Future enterprise versions can self-host the Pyodide WebAssembly binaries in `public/pyodide/`.
3. **No DRM or Student Cheating Prevention**:
   - Visual TDA is an open educational platform. Canonical solutions and validators are client-side. A tech-savvy student can inspect developer tools or network requests to read canonical algorithms. This is intentional: the pedagogy emphasizes voluntary discovery and understanding, not adversarial anti-cheat exams.

---

## 8. Cryptographic Defense: UI Anti-Tamper & Payload Encryption (Mission V6 Section 2)

### 8.1 The Core Challenge: Data Protection vs Client-Side Constraints
In a pure static client application (zero backend servers), any data shipped to the browser is physically on the client device. Previous iterations secured the application's UI state (detecting when an attacker flips `isInstructorMode` or `solutionUnlocked` to `true` in React DevTools), but left `solution.py?raw` strings bundled in plaintext within the static JavaScript chunks. A student could inspect the Network tab or unzip `dist/` and read every algorithm without solving or authenticating.

### 8.2 Dual-Recipient Key Encapsulation Mechanism (KEM)
To defend the data itself, Visual TDA implements pre-build AES-256-GCM payload encryption via `scripts/encryptSolutions.mjs` and native browser in-memory WebCrypto decryption via `src/utils/solutionCrypto.ts`:

1. **Zero Plaintext Code in Static Assets**:
   All 37+ canonical Python solutions are encrypted with distinct, cryptographically random 256-bit AES-GCM data keys ($K_e$). The built static bundle (`dist/assets/encryptedSolutions-*.js`) contains **only base64 ciphertext and IVs**. Searching the bundle for Python definitions (`def resolver`, `while`, `return`) yields zero matches.

2. **Instructor Credential Derivation (Slot 1)**:
   - Faculty access is unlocked via the 8-character course credential (`MEL75.29`).
   - The wrapping key $K_{\text{instructor}}$ is derived using **PBKDF2 with SHA-256, 100,000 iterations**, and a fixed cryptographic salt (`INSTRUCTOR_KDF_SALT`).
   - $K_{\text{instructor}}$ unwraps the payload key $K_e$ to decrypt canonical code in memory.

3. **Student Test-Pass Token Derivation (Slot 2)**:
   - When a student legitimately passes the automated test suite in the *Solve* phase or voluntarily reveals the solution via the pedagogical skip modal, the application grants an exercise pass token.
   - The student wrapping key $K_{\text{student}}(e)$ is derived via PBKDF2 with SHA-256 (10,000 iterations) from the exercise authorization token.
   - Decryption occurs in memory and is cached in a runtime `Map` for instant display during the session.

4. **Anti-Tamper Rejection**:
   Attempting to manipulate React state flags (`isInstructorMode`, `solutionUnlocked`) without legitimate cryptographic proof causes `isExerciseSolutionAuthorized()` to return `isTampered: true`. The application refuses to decrypt, keeping ciphertexts sealed and rendering the academic tamper warning banner.

### 8.3 Honest Security Boundaries & Threat Assessment
Maintaining rigorous intellectual honesty regarding client-side limits:
- **Offline Brute-Force Feasibility**: Any static web asset delivered to a client can be subjected to offline cryptanalysis. An attacker with both the ciphertext and source code can theoretically execute an offline dictionary attack against the 8-character credential.
- **The PBKDF2 Barrier**: Because the key is derived via 100,000 PBKDF2 SHA-256 iterations rather than a simple single-round hash or plaintext comparison, offline guessing requires astronomical compute compared to standard web scrapes.
- **Defeated Attack Vectors**:
  - Direct bundle searching / grepping: **Defeated** (zero plaintext code).
  - DevTools Network tab sniffing: **Defeated** (transferred as ciphertext).
  - React state manipulation / variable flipping: **Defeated** (no key available to decrypt).
- **Pedagogical Integrity**:
  The system prevents unintended cognitive spoilers and stops casual cheating, while honoring the course philosophy: students who voluntarily choose to inspect the canonical solution via the honest skip modal may do so freely without penalty.

