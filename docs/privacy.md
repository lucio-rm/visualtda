# Privacy and Local Data Policy — Visual TDA

Visual TDA is an educational platform designed strictly under a **pure client-side static architecture**. It requires no user accounts, no login credentials, no email addresses, and contains zero tracking, analytics, or behavioral telemetry scripts.

---

## 1. Data Inventory

| Data Item | Stored? | Storage Medium / Location | Purpose | Retention Period |
| :--- | :--- | :--- | :--- | :--- |
| **Student Python Code** | Yes | `sessionStorage` (`visual_tda_code_<id>`) | Preserves student's algorithm implementation across phase navigation tabs (`Discover` ↔ `Solve` ↔ `Understand`) without accidental loss. | Ephemeral: Automatically discarded when browser tab/session closes. |
| **Learning Progress & Completion** | Yes | `localStorage` (`visual_tda_progress`) | Records exercises attempted, test case pass counts, and completed status so the catalog reflects progress. | Persistent until user explicitly clears site data or clicks reset in instructor tools. |
| **UI Language Preference** | Yes | `localStorage` (`visual_tda_language`) | Remembers the selected interface language (`es` / `en`). | Persistent across browser sessions until site data is cleared. |
| **UI Theme Preference** | Yes | `localStorage` (`visual_tda_theme`) | Remembers dark or light mode preference (`system` / `dark` / `light`). | Persistent across browser sessions until site data is cleared. |
| **Instructor Mode State** | Yes | `localStorage` (`visual_tda_instructor_mode`) | Remembers whether instructor inspection mode is enabled for curriculum audits. | Persistent across browser sessions until site data is cleared. |
| **User Identity / Accounts** | No | None | N/A — No registration or identity is collected. | Never stored. |
| **Behavioral Analytics / Telemetry** | No | None | N/A — Zero third-party trackers, pixels, or telemetry beacons exist in the codebase. | Never collected. |
| **Server-Side Logs / IP Addresses** | No | None (Static Hosting Only) | The application possesses no backend servers, databases, or API microservices. | Application collects zero logs. |

---

## 2. In-Browser Execution Isolation

- **Local Python Execution**: When executing student Python code via Pyodide, the code is evaluated strictly within a sandboxed Web Worker running in the user's browser via WebAssembly.
- **Zero Transmission**: At no point is student code, input data, or execution outputs sent over the network to any backend server.
- **Static Assets Only**: The application loads exclusively static assets (HTML, CSS, JavaScript, and Pyodide WebAssembly binaries from CDN).

---

## 3. User Control & Data Deletion

Users can wipe 100% of stored platform state at any time by:
1. Clearing browser cookies and site data for the domain.
2. Or running `localStorage.clear(); sessionStorage.clear(); location.reload();` from the browser developer tools console.
