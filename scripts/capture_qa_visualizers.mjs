import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';

const PORT = 4260 + Math.floor(Math.random() * 200);
const CDP_PORT = 9560 + Math.floor(Math.random() * 200);
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
      throw new Error(`Evaluation failed for expression: ${res.exceptionDetails.text}`);
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

  async function captureScreenshot(filename) {
    const res = await send('Page.captureScreenshot', { format: 'png' });
    const buffer = Buffer.from(res.data, 'base64');
    const filePath = path.join(SCREENSHOT_DIR, filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`[Screenshot Saved] ${filename}`);
    return filePath;
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

    await evaluate(`
      (() => {
        const allExercises = [
          'closest-pair-dyc', 'karatsuba-dyc', 'majority-element-dyc',
          'interval-scheduling', 'interval-partitioning-greedy', 'inversion-counting-dyc', 'n-queens'
        ];
        localStorage.setItem('visual_tda_lang', 'es');
        localStorage.setItem('visual_tda_completed_exercises', JSON.stringify(allExercises));
        const records = {};
        allExercises.forEach(id => {
          records[id] = { state: 'completed', updatedAt: Date.now() };
        });
        localStorage.setItem('visual_tda_student_progress_records', JSON.stringify(records));
        localStorage.setItem('visual_tda_theme', 'dark');
      })()
    `);

    await send('Page.navigate', { url: `http://127.0.0.1:${PORT}/` });
    await new Promise((r) => setTimeout(r, 800));

    async function setTheme(theme) {
      await evaluate(`
        (() => {
          const select = document.querySelector('.theme-toggle-label select');
          if (select) {
            select.value = '${theme}';
            select.dispatchEvent(new Event('change', { bubbles: true }));
          }
          document.documentElement.setAttribute('data-theme', '${theme}');
        })()
      `);
      await new Promise((r) => setTimeout(r, 200));
    }

    async function backToCatalog() {
      await evaluate(`
        (() => {
          const btn = document.querySelector('.btn-back, .brand-button');
          if (btn) btn.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 300));
    }

    async function openExercise(keyword) {
      await backToCatalog();
      await evaluate(`
        (() => {
          const allTab = Array.from(document.querySelectorAll('.category-tab')).find(t => t.textContent.includes('Todos') || t.textContent.includes('All'));
          if (allTab) allTab.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 200));

      const clicked = await evaluate(`
        (() => {
          const cards = Array.from(document.querySelectorAll('.exercise-card'));
          const target = cards.find(c => c.textContent.toLowerCase().includes('${keyword.toLowerCase()}'));
          if (target) {
            const btn = target.querySelector('.btn-open-exercise') || target;
            btn.click();
            return true;
          }
          return false;
        })()
      `);

      if (!clicked) {
        console.warn('Could not find card matching:', keyword);
      }
      await new Promise((r) => setTimeout(r, 500));
    }

    async function switchPhase(phaseName) {
      await evaluate(`
        (() => {
          const btns = Array.from(document.querySelectorAll('.phase-button'));
          const target = btns.find(b => b.textContent.toLowerCase().includes('${phaseName.toLowerCase()}'));
          if (target) target.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 400));

      // If friction modal appears, click confirm
      await evaluate(`
        (() => {
          const confirmBtn = document.querySelector('.modal-actions .btn-primary');
          if (confirmBtn) confirmBtn.click();
        })()
      `);
      await new Promise((r) => setTimeout(r, 500));
    }

    async function scrollToVisualizer() {
      await evaluate(`
        (() => {
          const el = document.querySelector('.interactive-playground-card, .visualizer-container, .exercise-workspace');
          if (el) {
            el.scrollIntoView({ behavior: 'instant', block: 'start' });
            window.scrollBy(0, -60);
          } else {
            window.scrollTo({ top: 320, behavior: 'instant' });
          }
        })()
      `);
      await new Promise((r) => setTimeout(r, 250));
    }

    console.log('--- Starting Visualizer QA Captures ---');

    // 1. Closest Pair
    console.log('Testing Closest Pair...');
    await setTheme('dark');
    await openExercise('cercano');
    await switchPhase('Descubrir');
    await scrollToVisualizer();
    await captureScreenshot('qa-01-closest-pair-discover-dark.png');

    await evaluate(`
      (() => {
        const toggleBtn = Array.from(document.querySelectorAll('button')).find(b =>
          b.textContent.includes('Ocultar Problema')
        );
        if (toggleBtn) toggleBtn.click();
      })()
    `);
    await new Promise((r) => setTimeout(r, 300));
    await captureScreenshot('qa-02-closest-pair-discover-fullwidth-dark.png');

    await switchPhase('Comprender');
    await scrollToVisualizer();
    await captureScreenshot('qa-03-closest-pair-understand-dark.png');

    // 2. Karatsuba
    console.log('Testing Karatsuba...');
    await setTheme('dark');
    await openExercise('karatsuba');
    await switchPhase('Descubrir');
    await scrollToVisualizer();
    await captureScreenshot('qa-04-karatsuba-discover-dark.png');

    await switchPhase('Comprender');
    await evaluate(`
      (() => {
        const nextBtn = document.querySelector('button[aria-label="Paso siguiente"], button[title="Paso siguiente"]');
        if (nextBtn) {
          nextBtn.click();
          nextBtn.click();
        }
      })()
    `);
    await new Promise((r) => setTimeout(r, 300));
    await scrollToVisualizer();
    await captureScreenshot('qa-05-karatsuba-understand-dark.png');

    // 3. Majority Element
    console.log('Testing Majority Element...');
    await setTheme('dark');
    await openExercise('mayoritario');
    await switchPhase('Descubrir');
    await scrollToVisualizer();
    await captureScreenshot('qa-06-majority-element-discover-dark.png');

    await setTheme('light');
    await new Promise((r) => setTimeout(r, 200));
    await captureScreenshot('qa-07-majority-element-discover-light.png');

    // 4. Interval Scheduling
    console.log('Testing Interval Scheduling...');
    await setTheme('dark');
    await openExercise('compatibles');
    await switchPhase('Descubrir');
    await evaluate(`
      (() => {
        const tasks = document.querySelectorAll('.task-bar-interactive');
        if (tasks.length > 0) tasks[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        if (tasks.length > 2) tasks[2].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      })()
    `);
    await new Promise((r) => setTimeout(r, 200));
    await scrollToVisualizer();
    await captureScreenshot('qa-08-interval-scheduling-discover-dark.png');

    // 5. Interval Partitioning
    console.log('Testing Interval Partitioning...');
    await setTheme('dark');
    await openExercise('partición');
    await switchPhase('Descubrir');
    await scrollToVisualizer();
    await captureScreenshot('qa-09-interval-partitioning-discover-dark.png');

    // 6. Inversion Counting
    console.log('Testing Inversion Counting...');
    await setTheme('dark');
    await openExercise('inversiones');
    await switchPhase('Descubrir');
    await scrollToVisualizer();
    await captureScreenshot('qa-10-inversion-counting-discover-dark.png');

    console.log('All targeted QA visualizer captures completed successfully!');
    cleanup(0);
  };
});
