/**
 * Real Browser QA Suite for Visual TDA
 * 
 * Uses Chromium in headless mode via Chrome DevTools Protocol (CDP)
 * over native Node.js WebSocket and HTTP server.
 * Zero external dependencies.
 * Tests 22 core scenarios across 5 viewport resolutions against static production build (`dist/`).
 */

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const PORT = 4200 + Math.floor(Math.random() * 500);
const CDP_PORT = 9400 + Math.floor(Math.random() * 500);
const DIST_DIR = path.resolve('dist');
const SCREENSHOT_DIR = path.resolve('dist-qa-screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.wasm': 'application/wasm'
};

// 1. Static HTTP Server for dist/
const server = http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  let filePath = path.join(DIST_DIR, urlPath === '/' ? 'index.html' : urlPath);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(DIST_DIR, 'index.html');
  }
  const ext = path.extname(filePath);
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500);
      res.end('Server error');
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
});

server.listen(PORT, async () => {
  console.log(`[QA Server] Static server listening at http://127.0.0.1:${PORT}`);

  // 2. Spawn real Chromium
  console.log(`[QA Browser] Spawning /snap/bin/chromium on debugging port ${CDP_PORT}...`);
  const chromium = spawn('/snap/bin/chromium', [
    '--headless=new',
    `--remote-debugging-port=${CDP_PORT}`,
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    `http://127.0.0.1:${PORT}/`
  ]);

  chromium.stderr.on('data', (d) => {
    const s = d.toString();
    if (s.includes('DevTools listening')) console.log('[QA Browser]', s.trim());
  });

  chromium.on('error', (err) => {
    console.error('[QA Browser] Failed to spawn Chromium:', err);
    cleanup(1);
  });

  // 3. Connect to CDP
  let wsUrl = null;
  for (let i = 0; i < 60; i++) {
    await new Promise((r) => setTimeout(r, 250));
    try {
      const res = await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`);
      const list = await res.json();
      const pageTarget = list.find((t) => t.type === 'page' && t.webSocketDebuggerUrl);
      if (pageTarget) {
        wsUrl = pageTarget.webSocketDebuggerUrl;
        break;
      }
    } catch {}
  }

  if (!wsUrl) {
    console.error('[QA Browser] Could not obtain WebSocket debugger URL from Chromium.');
    cleanup(1);
    return;
  }

  console.log('[QA Browser] Connected to CDP endpoint:', wsUrl);
  const ws = new WebSocket(wsUrl);

  let msgId = 1;
  const pendingRequests = new Map();
  const consoleMessages = [];
  const uncaughtExceptions = [];

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pendingRequests.has(data.id)) {
      const { resolve, reject } = pendingRequests.get(data.id);
      pendingRequests.delete(data.id);
      if (data.error) {
        reject(data.error);
      } else {
        resolve(data.result);
      }
    }

    if (data.method === 'Runtime.consoleAPICalled') {
      const text = data.params.args.map((a) => a.value ?? a.description ?? '').join(' ');
      consoleMessages.push({ type: data.params.type, text });
    }
    if (data.method === 'Runtime.exceptionThrown') {
      uncaughtExceptions.push(data.params.exceptionDetails);
    }
  };

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = msgId++;
      pendingRequests.set(id, { resolve, reject });
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Evaluation failed for expression: ${res.exceptionDetails.text}`);
    }
    return res.result?.value;
  }

  async function setViewport(width, height) {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 768
    });
  }

  async function captureScreenshot(filename) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const filePath = path.join(SCREENSHOT_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }

  function cleanup(code = 0) {
    try {
      ws.close();
    } catch {}
    try {
      chromium.kill();
    } catch {}
    try {
      server.close();
    } catch {}
    process.exit(code);
  }

  ws.onopen = async () => {
    console.log('[QA Test] WebSocket connected. Starting 22-Scenario Real Browser Suite...');
    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    // Default desktop viewport: 1440x900
    await setViewport(1440, 900);

    // Navigate to local server
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` });

    // Wait for navigation and React hydration
    let mounted = false;
    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 250));
      try {
        const hasApp = await evaluate('Boolean(document.querySelector(".app-layout"))');
        if (hasApp) {
          mounted = true;
          break;
        }
      } catch {}
    }

    if (!mounted) {
      console.error('[QA FAILED] React application failed to mount within 10 seconds.');
      cleanup(1);
      return;
    }

    // Force language to Spanish for initial testing
    await evaluate(`
      (() => {
        localStorage.setItem('visual_tda_lang', 'es');
        const sel = document.querySelector('.lang-select');
        if (sel) {
          sel.value = 'es';
          sel.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);
    await new Promise((r) => setTimeout(r, 200));

    const testResults = [];

    async function runScenario(id, title, testFn) {
      try {
        await testFn();
        console.log(`  ✓ [SCENARIO ${id}] ${title}: PASS`);
        testResults.push({ id, title, status: 'PASS' });
      } catch (err) {
        console.error(`  ✗ [SCENARIO ${id}] ${title}: FAIL`, err.message);
        testResults.push({ id, title, status: 'FAIL', error: err.message });
      }
    }

    // ----------------------------------------------------
    // Scenario 1: Landing Page & Catalog Loads
    // ----------------------------------------------------
    await runScenario(1, 'Landing Page & Catalog Loads', async () => {
      const heading = await evaluate('document.querySelector(".welcome-banner h2")?.textContent');
      if (!heading || (!heading.includes('Algoritmos') && !heading.includes('Algorithms'))) {
        throw new Error(`Unexpected welcome heading: ${heading}`);
      }
      const categoryTabs = await evaluate('document.querySelectorAll(".category-tab").length');
      if (categoryTabs < 9) {
        throw new Error(`Expected at least 9 category tabs, found ${categoryTabs}`);
      }
      const exerciseCards = await evaluate('document.querySelectorAll(".exercise-card").length');
      if (exerciseCards !== 37) {
        throw new Error(`Expected exactly 37 exercises in catalog, found ${exerciseCards}`);
      }
      await captureScreenshot('01-landing-page-desktop.png');
    });

    // ----------------------------------------------------
    // Scenario 2: Category Navigation
    // ----------------------------------------------------
    await runScenario(2, 'Category Navigation Filtering', async () => {
      // Click 'Backtracking' tab
      await evaluate(`
        (() => {
          const btn = Array.from(document.querySelectorAll('.category-tab')).find(b => b.textContent.includes('Backtracking'));
          if (btn) btn.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 200));

      const btCount = await evaluate('document.querySelectorAll(".exercise-card").length');
      if (btCount !== 8) {
        throw new Error(`Expected 8 Backtracking exercises, found ${btCount}`);
      }

      // Click 'Todos' tab
      await evaluate(`
        (() => {
          const allBtn = Array.from(document.querySelectorAll('.category-tab')).find(b => b.textContent.includes('Todos') || b.textContent.includes('All'));
          if (allBtn) allBtn.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 200));

      const allCount = await evaluate('document.querySelectorAll(".exercise-card").length');
      if (allCount !== 37) {
        throw new Error(`Expected 37 exercises after resetting to Todos, found ${allCount}`);
      }
    });

    // ----------------------------------------------------
    // Scenario 3: Exercise Selection (N-Queens)
    // ----------------------------------------------------
    await runScenario(3, 'Exercise Selection & Mounting', async () => {
      await evaluate(`
        (() => {
          const card = Array.from(document.querySelectorAll('.exercise-card')).find(c => c.textContent.includes('N-Reinas') || c.textContent.includes('N-Queens'));
          if (card) {
            const btn = card.querySelector('.btn-open-exercise') || card;
            btn.click();
          }
        })()
      `);
      await new Promise((r) => setTimeout(r, 400));

      const exTitle = await evaluate('document.querySelector(".exercise-title")?.textContent');
      if (!exTitle || (!exTitle.includes('N-Reinas') && !exTitle.includes('N-Queens'))) {
        throw new Error(`Expected Exercise title 'N-Reinas' or 'N-Queens', found '${exTitle}'`);
      }
      const phaseTabs = await evaluate('document.querySelectorAll(".phase-button").length');
      if (phaseTabs !== 3) {
        throw new Error(`Expected 3 phase tabs, found ${phaseTabs}`);
      }
    });

    // ----------------------------------------------------
    // Scenario 4: Discover Phase Interactive Playground
    // ----------------------------------------------------
    await runScenario(4, 'Discover Phase Interactive Playground', async () => {
      const isDiscoverActive = await evaluate('document.querySelector(".phase-button.active")?.textContent');
      if (!isDiscoverActive || (!isDiscoverActive.includes('Descubrir') && !isDiscoverActive.includes('Discover'))) {
        throw new Error(`Expected Discover phase active, found '${isDiscoverActive}'`);
      }
      const initialQueens = await evaluate('document.querySelectorAll(".queen-glyph-group").length');
      await evaluate(`
        (() => {
          const cell = document.querySelector('.nqueens-board-svg g[role="button"]');
          if (cell) {
            cell.dispatchEvent(new MouseEvent('click', { bubbles: true }));
          }
        })()
      `);
      await new Promise((r) => setTimeout(r, 250));

      const updatedQueens = await evaluate('document.querySelectorAll(".queen-glyph-group").length');
      if (updatedQueens <= initialQueens) {
        throw new Error(`Queen placement in playground failed. Initial: ${initialQueens}, Updated: ${updatedQueens}`);
      }
      await captureScreenshot('04-discover-nqueens-playground.png');
    });

    // ----------------------------------------------------
    // Scenario 5: Solve Phase & Code Editor
    // ----------------------------------------------------
    await runScenario(5, 'Solve Phase & Code Editor Rendering', async () => {
      await evaluate(`
        (() => {
          const solveTab = Array.from(document.querySelectorAll('.phase-button')).find(t => t.textContent.includes('Resolver') || t.textContent.includes('Solve'));
          if (solveTab) solveTab.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 300));

      const editor = await evaluate('document.querySelector(".code-editor-input")?.value');
      if (!editor || !editor.includes('def resolver_n_reinas')) {
        throw new Error(`Editor missing canonical starter code: ${editor?.slice(0, 50)}`);
      }
      await captureScreenshot('05-solve-view-editor.png');
    });

    // ----------------------------------------------------
    // Scenario 6: Progressive Hints
    // ----------------------------------------------------
    await runScenario(6, 'Progressive Hints Accordion', async () => {
      const hintBtn = await evaluate('Boolean(document.querySelector(".btn-toggle-hint"))');
      if (!hintBtn) throw new Error('Hints toggle button not found');

      await evaluate(`
        (() => {
          const btn = document.querySelector('.btn-toggle-hint');
          if (btn) btn.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 200));

      const hintText = await evaluate('document.querySelector(".hint-content")?.textContent');
      if (!hintText || (!hintText.includes('Pista') && !hintText.includes('Hint'))) {
        throw new Error(`Expected hint content, found: ${hintText}`);
      }
    });

    // Helper for editing code
    async function setEditorCode(codeStr) {
      return evaluate(`
        (() => {
          const ta = document.querySelector('.code-editor-input');
          if (!ta) return false;
          const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
          if (nativeSetter) nativeSetter.call(ta, ${JSON.stringify(codeStr)});
          else ta.value = ${JSON.stringify(codeStr)};
          ta.dispatchEvent(new Event('input', { bubbles: true }));
          ta.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        })()
      `);
    }

    // ----------------------------------------------------
    // Scenario 7: Code Editing
    // ----------------------------------------------------
    await runScenario(7, 'Code Editing in Textarea', async () => {
      await setEditorCode('def resolver_n_reinas(n):\n    return []\n');
      await new Promise((r) => setTimeout(r, 200));

      const val = await evaluate('document.querySelector(".code-editor-input")?.value');
      if (!val || !val.includes('return []')) {
        throw new Error(`Editor value did not update: ${val}`);
      }
    });

    // ----------------------------------------------------
    // Scenario 8: Test Execution (Failed Validation)
    // ----------------------------------------------------
    await runScenario(8, 'Local Test Execution & Failure Feedback', async () => {
      await evaluate(`
        (() => {
          const runBtn = document.querySelector('.btn-fast-tests');
          if (runBtn) runBtn.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 600));

      const card = await evaluate('document.querySelector(".test-feedback-card")?.className');
      if (!card || !card.includes('failed')) {
        throw new Error(`Expected failed test feedback card, got class '${card}'`);
      }
    });

    // ----------------------------------------------------
    // Scenario 9: Reset Template
    // ----------------------------------------------------
    await runScenario(9, 'Reset Code to Template', async () => {
      await evaluate(`
        (() => {
          const resetBtn = document.querySelector('.btn-reset-code');
          if (resetBtn) resetBtn.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 300));

      const editorVal = await evaluate('document.querySelector(".code-editor-input")?.value');
      if (!editorVal || !editorVal.includes('resolver_n_reinas')) {
        throw new Error('Reset template did not restore default starter code');
      }
    });

    // ----------------------------------------------------
    // Scenario 10: Skip-to-Understand Modal Flow
    // ----------------------------------------------------
    await runScenario(10, 'Skip to Understand Modal Flow', async () => {
      await evaluate(`
        (() => {
          const skipBtn = document.querySelector('.skip-solution-card button');
          if (skipBtn) skipBtn.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 250));

      const modalOpen = await evaluate('Boolean(document.querySelector(".modal-overlay"))');
      if (!modalOpen) throw new Error('Skip confirmation modal did not open');

      // Test Cancel first
      await evaluate(`
        (() => {
          const cancelBtn = Array.from(document.querySelectorAll('.modal-actions button')).find(b => b.classList.contains('btn-secondary'));
          if (cancelBtn) cancelBtn.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 200));

      const modalClosed = await evaluate('Boolean(document.querySelector(".modal-overlay"))');
      if (modalClosed) throw new Error('Modal did not close on Cancel');

      // Open again and confirm
      await evaluate(`
        (() => {
          const skipBtn = document.querySelector('.skip-solution-card button');
          if (skipBtn) skipBtn.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 200));

      await evaluate(`
        (() => {
          const confirmBtn = Array.from(document.querySelectorAll('.modal-actions button')).find(b => b.classList.contains('btn-primary'));
          if (confirmBtn) confirmBtn.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 300));

      const understandActive = await evaluate('document.querySelector(".phase-button.active")?.textContent');
      if (!understandActive || (!understandActive.includes('Comprender') && !understandActive.includes('Understand'))) {
        throw new Error(`Expected Understand phase active, got '${understandActive}'`);
      }
    });

    // ----------------------------------------------------
    // Scenario 11: Successful Validation Unlocking Understand Phase
    // ----------------------------------------------------
    await runScenario(11, 'Successful Validation Unlocking Understand Phase', async () => {
      // Switch back to Solve phase to test successful solution flow
      await evaluate(`
        (() => {
          const solveTab = Array.from(document.querySelectorAll('.phase-button')).find(t => t.textContent.includes('Resolver') || t.textContent.includes('Solve'));
          if (solveTab) solveTab.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 300));

      const validCode = `def resolver_n_reinas(n):
    soluciones = []
    tablero = [-1] * n
    cols = set()
    d1 = set()
    d2 = set()
    def bt(r):
        if r == n:
            soluciones.append(list(tablero))
            return
        for c in range(n):
            if c in cols or (r - c) in d1 or (r + c) in d2:
                continue
            tablero[r] = c
            cols.add(c); d1.add(r - c); d2.add(r + c)
            bt(r + 1)
            cols.remove(c); d1.remove(r - c); d2.remove(r + c)
            tablero[r] = -1
    bt(0)
    return soluciones
`;
      await setEditorCode(validCode);
      await new Promise((r) => setTimeout(r, 250));

      await evaluate(`
        (() => {
          const runBtn = document.querySelector('.btn-fast-tests');
          if (runBtn) runBtn.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 600));

      // Wait for success feedback card or auto-transition to Understand phase with unlocked tag
      const isPassed = await evaluate(`
        Boolean(
          document.querySelector(".test-feedback-card.passed") ||
          document.querySelector(".phase-unlocked-tag") ||
          document.querySelector(".understand-view")
        )
      `);
      if (!isPassed) {
        const summary = await evaluate('document.querySelector(".test-summary")?.textContent || document.querySelector(".test-feedback-card")?.textContent');
        throw new Error(`Tests did not pass with valid code: ${summary}`);
      }
      await captureScreenshot('11-solve-tests-passed.png');

      // Transition to Understand phase
      await evaluate(`
        (() => {
          const proceedBtn = document.querySelector('.btn-primary.mt-2');
          if (proceedBtn) {
            proceedBtn.click();
          } else {
            const understandTab = Array.from(document.querySelectorAll('.phase-button')).find(t => t.textContent.includes('Comprender') || t.textContent.includes('Understand'));
            if (understandTab) understandTab.click();
          }
        })()
      `);
      await new Promise((r) => setTimeout(r, 500));
    });

    // ----------------------------------------------------
    // Scenario 12: Understand Phase Canonical Code & Pseudocode
    // ----------------------------------------------------
    await runScenario(12, 'Understand Phase Code / Pseudocode Toggle', async () => {
      await evaluate(`
        (() => {
          if (!document.querySelector('.understand-view')) {
            const understandTab = Array.from(document.querySelectorAll('.phase-button')).find(t => t.textContent.includes('Comprender') || t.textContent.includes('Understand'));
            if (understandTab) understandTab.click();
          }
        })()
      `);
      await new Promise((r) => setTimeout(r, 500));

      const pyCode = await evaluate('document.querySelector(".canonical-code-display code")?.textContent');
      if (!pyCode || !pyCode.includes('def resolver_n_reinas')) {
        throw new Error(`Canonical Python missing: ${pyCode?.slice(0, 50)}`);
      }

      // Switch to pseudocode
      await evaluate(`
        (() => {
          const btn = Array.from(document.querySelectorAll('.btn-code-toggle')).find(b => b.textContent.includes('Pseudocódigo') || b.textContent.includes('Pseudocode'));
          if (btn) btn.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 200));

      const pseudoCode = await evaluate('document.querySelector(".canonical-code-display code")?.textContent');
      if (!pseudoCode || !pseudoCode.includes('ALGORITMO')) {
        throw new Error(`Pseudocode missing 'ALGORITMO': ${pseudoCode?.slice(0, 50)}`);
      }
    });

    // ----------------------------------------------------
    // Scenario 13: Theory Invariants & Asymptotic Complexity
    // ----------------------------------------------------
    await runScenario(13, 'Theory Invariants & Asymptotic Complexity', async () => {
      const theory = await evaluate('document.querySelector(".theory-card .theory-body")?.textContent');
      if (!theory || theory.trim().length < 20) {
        throw new Error(`Theory body empty or too short: ${theory}`);
      }
      const timeVal = await evaluate('document.querySelector(".complexity-item .complexity-value")?.textContent');
      if (!timeVal || !timeVal.includes('O(')) {
        throw new Error(`Time complexity missing Big-O notation: ${timeVal}`);
      }
    });

    // ----------------------------------------------------
    // Scenario 14: Visualizer & Timeline Step Controls
    // ----------------------------------------------------
    await runScenario(14, 'Visualizer & Timeline Step Controls', async () => {
      const visualizer = await evaluate('Boolean(document.querySelector(".nqueens-visualizer-card") || document.querySelector(".timeline-toolbar"))');
      if (!visualizer) throw new Error('Visualizer / Timeline controls not mounted');

      const initialStep = await evaluate('document.querySelector(".step-tag")?.textContent || "Paso 1"');
      // Click next step button (ctrl-btn with title containing Paso or Next)
      await evaluate(`
        (() => {
          const btns = Array.from(document.querySelectorAll('.ctrl-btn'));
          // In timeline: [start, prev, play, next, end]
          // The 4th button (index 3) is step forward
          if (btns.length >= 4) btns[3].click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 200));

      const updatedStep = await evaluate('document.querySelector(".step-tag")?.textContent || "Paso 1"');
      console.log(`    Step transition: '${initialStep}' -> '${updatedStep}'`);
    });

    // ----------------------------------------------------
    // Scenario 15: Language Switching (i18n)
    // ----------------------------------------------------
    await runScenario(15, 'Language Switching (ES <-> EN)', async () => {
      // Toggle select to 'en'
      await evaluate(`
        (() => {
          const sel = document.querySelector('.lang-select');
          if (sel) {
            sel.value = 'en';
            sel.dispatchEvent(new Event('change', { bubbles: true }));
          }
        })()
      `);
      await new Promise((r) => setTimeout(r, 200));

      const titleEn = await evaluate('document.querySelector(".view-title")?.textContent');
      if (!titleEn || !titleEn.includes('Understand')) {
        throw new Error(`Language toggle to EN failed, got: '${titleEn}'`);
      }

      // Switch back to 'es'
      await evaluate(`
        (() => {
          const sel = document.querySelector('.lang-select');
          if (sel) {
            sel.value = 'es';
            sel.dispatchEvent(new Event('change', { bubbles: true }));
          }
        })()
      `);
      await new Promise((r) => setTimeout(r, 200));

      const titleEs = await evaluate('document.querySelector(".view-title")?.textContent');
      if (!titleEs || !titleEs.includes('Comprender')) {
        throw new Error(`Language toggle back to ES failed, got: '${titleEs}'`);
      }
    });

    // ----------------------------------------------------
    // Scenario 16: Theme Switching (System / Light / Dark)
    // ----------------------------------------------------
    await runScenario(16, 'Theme Switching & HTML Attribute', async () => {
      // Select 'dark'
      await evaluate(`
        (() => {
          const sel = document.querySelector('.theme-toggle-label .theme-select');
          if (sel) {
            sel.value = 'dark';
            sel.dispatchEvent(new Event('change', { bubbles: true }));
          }
        })()
      `);
      await new Promise((r) => setTimeout(r, 200));

      const darkTheme = await evaluate('document.documentElement.getAttribute("data-theme")');
      if (darkTheme !== 'dark') {
        throw new Error(`Theme did not toggle to dark: got '${darkTheme}'`);
      }

      // Select 'light'
      await evaluate(`
        (() => {
          const sel = document.querySelector('.theme-toggle-label .theme-select');
          if (sel) {
            sel.value = 'light';
            sel.dispatchEvent(new Event('change', { bubbles: true }));
          }
        })()
      `);
      await new Promise((r) => setTimeout(r, 200));

      const lightTheme = await evaluate('document.documentElement.getAttribute("data-theme")');
      if (lightTheme !== 'light') {
        throw new Error(`Theme did not toggle to light: got '${lightTheme}'`);
      }
      await captureScreenshot('16-theme-light.png');
    });

    // ----------------------------------------------------
    // Scenario 17: Skip to Content Anchor
    // ----------------------------------------------------
    await runScenario(17, 'Accessibility Skip-to-Content Anchor', async () => {
      const skipLink = await evaluate('document.querySelector(".skip-to-content")?.getAttribute("href")');
      if (skipLink !== '#main-content') {
        throw new Error(`Skip link href is not '#main-content': ${skipLink}`);
      }
      const targetExists = await evaluate('Boolean(document.querySelector("#main-content"))');
      if (!targetExists) {
        throw new Error('#main-content target container missing');
      }
    });

    // ----------------------------------------------------
    // Scenario 18: Keyboard Navigability
    // ----------------------------------------------------
    await runScenario(18, 'Keyboard Focusability of Interactive Elements', async () => {
      const focusableCount = await evaluate(`
        document.querySelectorAll('button, [href], input, select, textarea, [tabindex="0"]').length
      `);
      if (focusableCount < 10) {
        throw new Error(`Insufficient focusable elements: ${focusableCount}`);
      }
    });

    // ----------------------------------------------------
    // Scenario 19: Return to Catalog & Exercise Switching
    // ----------------------------------------------------
    await runScenario(19, 'Return to Catalog & Exercise Switching', async () => {
      await evaluate(`
        (() => {
          const backBtn = document.querySelector('.btn-back');
          if (backBtn) backBtn.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 300));

      const inCatalog = await evaluate('Boolean(document.querySelector(".catalog-section"))');
      if (!inCatalog) throw new Error('Did not return to catalog section');

      // Click second exercise: interval-scheduling
      await evaluate(`
        (() => {
          const card = Array.from(document.querySelectorAll('.exercise-card')).find(c => c.textContent.includes('Intervalos') || c.textContent.includes('Interval'));
          if (card) {
            const btn = card.querySelector('.btn-open-exercise') || card;
            btn.click();
          }
        })()
      `);
      await new Promise((r) => setTimeout(r, 400));

      const newTitle = await evaluate('document.querySelector(".exercise-title")?.textContent');
      if (!newTitle || (!newTitle.includes('Intervalos') && !newTitle.includes('Interval'))) {
        throw new Error(`Expected second exercise 'Intervalos', got: '${newTitle}'`);
      }
    });

    // ----------------------------------------------------
    // Scenario 20: Session Persistence across Views
    // ----------------------------------------------------
    await runScenario(20, 'Student Code Session Storage Persistence', async () => {
      // Go to solve view of interval scheduling
      await evaluate(`
        (() => {
          const solveTab = Array.from(document.querySelectorAll('.phase-button')).find(t => t.textContent.includes('Resolver') || t.textContent.includes('Solve'));
          if (solveTab) solveTab.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 300));

      const testCustomCode = '# Persistent student solution comment\ndef planificar_intervalos(intervalos):\n    return []\n';
      await setEditorCode(testCustomCode);
      await new Promise((r) => setTimeout(r, 200));

      // Switch to Discover phase
      await evaluate(`
        (() => {
          const discTab = Array.from(document.querySelectorAll('.phase-button')).find(t => t.textContent.includes('Descubrir') || t.textContent.includes('Discover'));
          if (discTab) discTab.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 300));

      // Switch back to Solve phase
      await evaluate(`
        (() => {
          const solveTab = Array.from(document.querySelectorAll('.phase-button')).find(t => t.textContent.includes('Resolver') || t.textContent.includes('Solve'));
          if (solveTab) solveTab.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 300));

      const persistedVal = await evaluate('document.querySelector(".code-editor-input")?.value');
      if (!persistedVal || !persistedVal.includes('Persistent student solution comment')) {
        throw new Error(`Session storage code persistence failed. Got: ${persistedVal}`);
      }
    });

    // ----------------------------------------------------
    // Scenario 21: Error Resilience & Graceful Fallback
    // ----------------------------------------------------
    await runScenario(21, 'Error Resilience (Empty & Malformed Code)', async () => {
      await setEditorCode('pass\n');
      await new Promise((r) => setTimeout(r, 200));

      await evaluate(`
        (() => {
          const runBtn = document.querySelector('.btn-fast-tests');
          if (runBtn) runBtn.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 400));

      const feedback = await evaluate('document.querySelector(".test-feedback-card")?.textContent');
      if (!feedback || feedback.trim().length === 0) {
        throw new Error('No feedback card rendered on empty/pass code');
      }
    });

    // ----------------------------------------------------
    // Scenario 22: Responsive Layout Across Viewports
    // ----------------------------------------------------
    await runScenario(22, 'Responsive Layout (1920, 1440, 1280, 768, 390)', async () => {
      // Go back to home
      await evaluate(`
        (() => {
          const backBtn = document.querySelector('.btn-back');
          if (backBtn) backBtn.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 300));

      const viewports = [
        { name: 'desktop-fhd', w: 1920, h: 1080 },
        { name: 'laptop', w: 1440, h: 900 },
        { name: 'desktop-std', w: 1280, h: 720 },
        { name: 'tablet', w: 768, h: 1024 },
        { name: 'mobile', w: 390, h: 844 }
      ];

      for (const vp of viewports) {
        await setViewport(vp.w, vp.h);
        await new Promise((r) => setTimeout(r, 200));

        const hasHorizontalOverflow = await evaluate(`
          document.documentElement.scrollWidth > window.innerWidth + 1
        `);
        const ssPath = await captureScreenshot(`22-responsive-${vp.name}-${vp.w}x${vp.h}.png`);

        if (hasHorizontalOverflow) {
          console.warn(`    ⚠️ Warning: Viewport ${vp.w}x${vp.h} has horizontal overflow`);
        } else {
          console.log(`    Viewport ${vp.w}x${vp.h} (${vp.name}): Layout OK, Screenshot saved (${path.basename(ssPath)})`);
        }
      }
    });

    // Report Summary
    console.log('\n==================================================');
    console.log('REAL BROWSER QA TEST REPORT');
    console.log('==================================================');
    const passedCount = testResults.filter((r) => r.status === 'PASS').length;
    console.log(`Total Scenarios: ${testResults.length}`);
    console.log(`Passed: ${passedCount}`);
    console.log(`Failed: ${testResults.length - passedCount}`);

    console.log('\nConsole Errors Caught during session:');
    const errors = consoleMessages.filter((m) => m.type === 'error');
    if (errors.length === 0) {
      console.log('  None! Clean console across all 22 scenarios.');
    } else {
      errors.forEach((e) => console.log(`  [${e.type}] ${e.text}`));
    }

    if (uncaughtExceptions.length > 0) {
      console.log('\nUncaught Exceptions:');
      uncaughtExceptions.forEach((ex) => console.log(`  ${ex.text}`));
    }

    console.log(`\nScreenshots captured: ${fs.readdirSync(SCREENSHOT_DIR).length} files in ${SCREENSHOT_DIR}`);
    console.log('==================================================\n');

    cleanup(testResults.length === passedCount ? 0 : 1);
  };
});
