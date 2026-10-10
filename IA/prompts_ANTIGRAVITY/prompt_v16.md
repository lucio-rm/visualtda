# VISUAL TDA — MASTER ENGINEERING MISSION V16 (Deployment Readiness)

**Continuity note.** `state.md` shows `MISSION_V15_UNIVERSAL_VIEWPORT_SCALING_AND_PLAYGROUND_CONTAINMENT` complete. This is a short, narrow mission — just the technical prep needed before the human connects the repo to Vercel and the custom domain `visualtda.ar`. It is **not** a feature mission. The human is handling the git branch merge (`agent/antigravity` → `main`), domain registration, and the Vercel account setup himself, outside this mission — don't touch git branches, remotes, or any deployment-platform account/dashboard.

---

## 1. Vite build config for a root-domain deploy

Confirm `vite.config.ts`'s `base` is `/` (the default) — not a subpath like `/visual_tda/` that might have been set at some point for a GitHub-Pages-style project-page deployment. The site will be served at the domain root (`visualtda.ar`), so any non-root base will break every asset path silently (blank page, 404s on JS/CSS in the console). Fix if wrong; state clearly in `state.md` what you found either way.

## 2. SPA routing fallback for Vercel

Determine whether the app uses path-based client-side routing (React Router or similar, with real URL paths beyond `/`) or is single-route (all navigation is in-page state; only `/` is ever a real browser URL).
- If single-route: no action needed — say so explicitly in `state.md` so this isn't re-investigated later.
- If path-based: add a `vercel.json` at the repo root with a catch-all rewrite:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
  so refreshing or deep-linking any in-app URL doesn't 404. Verify locally by building (`npm run build`), serving `dist/` with a static file server, hitting a non-root path directly (not via in-app navigation — type it into the address bar or reload on it), and confirming it loads instead of 404ing.

## 3. FormSubmit endpoint sanity check

`FeedbackModal`'s obfuscated endpoint (`atob('aHR0cHM6Ly9mb3Jtc3VibWl0LmNvL2FqYXgvbHJvbWVyb21AZmkudWJhLmFy')`) — decode it and confirm it resolves to the correct, intended FormSubmit URL. Confirm there's no hardcoded `localhost` or dev-only origin assumption anywhere in the feedback-submission path. The human's own testing shows the form already works when triggered server-side/by-agent and only fails from his local dev server — consistent with FormSubmit doing origin-based filtering, which should resolve once the real domain is live. Don't just assume that, though — it gets re-verified by hand for real in step 5, after deploy.

## 4. Grep for any other localhost/dev-only assumptions

Search the codebase for `localhost`, `127.0.0.1`, hardcoded non-https `http://` URLs, or any other dev-server-only assumption that could silently misbehave in production. Fix anything found. If something needs a value only the human can supply (an API key, say — though this project shouldn't have any, being backend-free), document it clearly in `docs/known-issues.md` instead of guessing.

## 5. Do not mark this "done" from code inspection alone

Once `visualtda.ar` is actually live (the human will tell you, or you'll see it when asked to continue), the real completion criterion is: open the live production domain in a clean/private browser window, in both themes, and confirm —
  (a) the site loads correctly at the root with no broken asset paths,
  (b) at least one full exercise works end-to-end (Discover → Solve → Comprender),
  (c) the feedback form actually **delivers an email** when submitted from the real domain — check that an email arrives, don't just check that the `fetch` call resolved without throwing.

This is the same "verify the outside effect, not just that the client call didn't throw" principle from Mission V12 §2.4, now applied to the deploy itself.

---

## Order of work

1 → 2 → 3 → 4, then **wait** for the human to confirm the domain is live, then 5. Autonomous operation per V4 §63 still applies for steps 1–4. Escalate only genuinely irreversible/ambiguous calls to `IA/architect/questions.md`.

Begin now. Only the literal word `STOP` ends the mission; follow the established STOP protocol when it arrives.

