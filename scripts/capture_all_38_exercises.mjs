import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const PORT = 4300 + Math.floor(Math.random() * 200);
const CDP_PORT = 9600 + Math.floor(Math.random() * 200);
const DIST_DIR = path.resolve('dist');
const BASE_OUT_DIR = path.resolve('dist-qa-screenshots/v11');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.wasm': 'application/wasm'
};

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
    console.error('[QA Browser] Could not connect to WebSocket.');
    cleanup(1);
    return;
  }

  const ws = new WebSocket(wsUrl);
  let msgId = 1;
  const pendingRequests = new Map();

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.id && pendingRequests.has(data.id)) {
      const { resolve, reject } = pendingRequests.get(data.id);
      pendingRequests.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
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
      throw new Error(`Evaluation failed: ${res.exceptionDetails.text}`);
    }
    return res.result?.value;
  }

  async function setViewport(width, height) {
    await send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false
    });
  }

  async function captureScreenshot(outPath) {
    const dir = path.dirname(outPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    fs.writeFileSync(outPath, buffer);
    console.log(`[Captured] ${path.relative(process.cwd(), outPath)} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }

  function cleanup(code = 0) {
    try { ws.close(); } catch {}
    try { chromium.kill(); } catch {}
    try { server.close(); } catch {}
    process.exit(code);
  }

  ws.onopen = async () => {
    await send('Page.enable');
    await send('Runtime.enable');
    await send('DOM.enable');

    await setViewport(1440, 960);
    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` });

    for (let i = 0; i < 40; i++) {
      await new Promise((r) => setTimeout(r, 200));
      const hasApp = await evaluate('Boolean(document.querySelector(".app-layout"))');
      if (hasApp) break;
    }

    // Unlock all exercises and set language to Spanish
    await evaluate(`
      (() => {
        localStorage.setItem('visual_tda_lang', 'es');
        localStorage.setItem('visual_tda_completed_exercises', JSON.stringify([]));
        // Put in instructor mode so all solutions and phases are unlocked
        localStorage.setItem('visual_tda_instructor_auth', JSON.stringify({ authorized: true, timestamp: Date.now() }));
      })()
    `);

    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` });
    await new Promise((r) => setTimeout(r, 800));

    // Get all 38 exercise card info
    const exerciseList = await evaluate(`
      (() => {
        const allTab = Array.from(document.querySelectorAll('.category-tab')).find(t => t.textContent.includes('Todos') || t.textContent.includes('All'));
        if (allTab) allTab.click();
        const cards = Array.from(document.querySelectorAll('.exercise-card'));
        return cards.map((c, idx) => {
          const title = c.querySelector('.card-title')?.textContent?.trim() || 'Exercise ' + idx;
          return { index: idx, title };
        });
      })()
    `);

    console.log(`[QA Runner] Found ${exerciseList.length} exercises in catalog.`);

    const themes = ['light', 'dark'];

    for (const theme of themes) {
      console.log(`\n========================================`);
      console.log(`   RUNNING FULL QA SWEEP: THEME = ${theme.toUpperCase()}`);
      console.log(`========================================\n`);

      const themeDir = path.join(BASE_OUT_DIR, theme);
      if (!fs.existsSync(themeDir)) fs.mkdirSync(themeDir, { recursive: true });

      // Apply theme
      await evaluate(`
        (() => {
          const select = document.querySelector('.theme-select');
          if (select) {
            select.value = '${theme}';
            select.dispatchEvent(new Event('change', { bubbles: true }));
          }
          document.documentElement.setAttribute('data-theme', '${theme}');
          document.documentElement.classList.toggle('dark', '${theme}' === 'dark');
          document.documentElement.classList.toggle('dark-theme', '${theme}' === 'dark');
          document.documentElement.classList.toggle('light', '${theme}' === 'light');
          document.documentElement.classList.toggle('light-theme', '${theme}' === 'light');
        })()
      `);
      await new Promise((r) => setTimeout(r, 300));

      // 1. Capture Catalog Home
      await captureScreenshot(path.join(themeDir, '00-catalog-home.png'));

      // 2. Iterate each exercise
      for (let i = 0; i < exerciseList.length; i++) {
        const item = exerciseList[i];
        const safeTitle = item.title
          .toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
        const prefix = String(i + 1).padStart(2, '0');

        console.log(`[${i + 1}/${exerciseList.length}] Capturing ${item.title} (${theme})...`);

        // Click exercise card
        await evaluate(`
          (() => {
            const allTab = Array.from(document.querySelectorAll('.category-tab')).find(t => t.textContent.includes('Todos') || t.textContent.includes('All'));
            if (allTab) allTab.click();
            const cards = Array.from(document.querySelectorAll('.exercise-card'));
            const card = cards[${item.index}];
            if (card) {
              const btn = card.querySelector('.btn-open-exercise') || card;
              btn.click();
            }
          })()
        `);
        await new Promise((r) => setTimeout(r, 400));

        // Scroll to visualizer
        await evaluate(`
          (() => {
            const el = document.querySelector('.interactive-playground-card, .visualizer-container, .exercise-workspace');
            if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
            else window.scrollTo({ top: 250, behavior: 'instant' });
          })()
        `);
        await new Promise((r) => setTimeout(r, 200));

        // Screenshot Discover phase
        await captureScreenshot(path.join(themeDir, `${prefix}-${safeTitle}-discover.png`));

        // Switch to Understand phase
        await evaluate(`
          (() => {
            const btns = Array.from(document.querySelectorAll('.phase-button'));
            const understandBtn = btns[2];
            if (understandBtn) understandBtn.click();
          })()
        `);
        await new Promise((r) => setTimeout(r, 400));

        // Confirm modal if any
        await evaluate(`
          (() => {
            const confirmBtn = document.querySelector('.modal-actions .btn-primary');
            if (confirmBtn) confirmBtn.click();
          })()
        `);
        await new Promise((r) => setTimeout(r, 200));

        // Screenshot Understand phase
        await captureScreenshot(path.join(themeDir, `${prefix}-${safeTitle}-understand.png`));

        // Return to catalog
        await evaluate(`
          (() => {
            const btn = document.querySelector('.btn-back, .brand-button');
            if (btn) btn.click();
          })()
        `);
        await new Promise((r) => setTimeout(r, 300));
      }
    }

    console.log(`\n[QA Completed] Successfully captured all exercises in Light and Dark themes!`);
    cleanup(0);
  };
});
