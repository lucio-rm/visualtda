# ADR-0004: Dual-Recipient AES-256-GCM Payload Encryption for Solution Gating

## Status
Accepted

## Context
In client-side educational platforms, preserving pedagogical progression requires that students do not prematurely view or copy canonical solutions before attempting the problem. Previously, solution gating was enforced via application UI state (`solutionUnlocked: boolean`, `isInstructorMode: boolean`).

However, static analysis of the built production bundle revealed that `solution.py?raw` strings were bundled as plaintext JavaScript string constants in `dist/assets/exercise-content-*.js`. Any student opening the browser DevTools Network tab or unzipping `dist/` could instantly extract all canonical solutions, bypassing the instructor password and test runner gates without writing a single line of code.

## Decision
We implement a **Dual-Recipient Key Encapsulation Mechanism (KEM)** using **AES-256-GCM** and **PBKDF2**:
1. **Pre-build Encryption (`scripts/encryptSolutions.mjs`)**:
   - Each `exercises/*/solution.py` file is encrypted during build time into an AES-256-GCM ciphertext using a cryptographically random Content Encryption Key (CEK).
   - The CEK is wrapped into two independent recipient slots:
     - **Slot 1 (Instructor)**: CEK encrypted with Key Derived via PBKDF2 (SHA-256, 100,000 iterations) from the faculty credential (`MEL75.29`).
     - **Slot 2 (Student Pass Token)**: CEK encrypted with Key Derived via PBKDF2 from a test-suite pass authorization.
   - The resulting encrypted data module `src/engine/encryptedSolutions.ts` contains only base64 ciphertext and initialization vectors.
   - Zero lines of plaintext Python code (`def resolver`, `while`, `return`) exist in the production bundle.
2. **In-Memory Decryption (`src/utils/solutionCrypto.ts`)**:
   - Decryption occurs entirely in memory via the browser's native `window.crypto.subtle` API when authorized.
   - Decrypted solutions are cached in session memory and cleared upon page unload.

## Consequences

### Positive
- **Elimination of Static Inspection Attacks**: Grepping the built static output in `dist/` reveals zero canonical solutions.
- **Academic Integrity**: Students cannot inspect network payloads to copy answers during university laboratory sessions.
- **Standards-Based Cryptography**: Relies exclusively on standard W3C Web Cryptography APIs with no third-party cryptographic dependencies.

### Negative / Trade-offs
- Client-side cryptography cannot withstand targeted memory dumping in a debugger with breakpoints set on `crypto.subtle.decrypt`. As documented in `docs/security.md`, this is an honest client-side defense-in-depth measure that raises the difficulty bar from trivial text inspection to memory reverse engineering.
