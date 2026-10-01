import fs from 'node:fs';
import path from 'node:path';

const visualizersDir = path.resolve('src/components/visualizers');
const files = fs.readdirSync(visualizersDir);

const replacements = [
  // SVG and inline styles token mappings
  { from: /'#38bdf8'/g, to: "'var(--accent)'" },
  { from: /"#38bdf8"/g, to: '"var(--accent)"' },
  { from: /#38bdf8/g, to: 'var(--accent)' },

  { from: /'#10b981'/g, to: "'var(--success)'" },
  { from: /"#10b981"/g, to: '"var(--success)"' },
  { from: /#10b981/g, to: 'var(--success)' },

  { from: /'#f59e0b'/g, to: "'var(--warning)'" },
  { from: /"#f59e0b"/g, to: '"var(--warning)"' },
  { from: /#f59e0b/g, to: 'var(--warning)' },

  { from: /'#ef4444'/g, to: "'var(--error)'" },
  { from: /"#ef4444"/g, to: '"var(--error)"' },
  { from: /#ef4444/g, to: 'var(--error)' },

  { from: /'#6366f1'/g, to: "'var(--accent)'" },
  { from: /"#6366f1"/g, to: '"var(--accent)"' },
  { from: /#6366f1/g, to: 'var(--accent)' },

  { from: /#888\b/g, to: 'var(--text-muted)' },
  { from: /#777\b/g, to: 'var(--text-muted)' },
  
  // Alpha backgrounds
  { from: /rgba\(56,\s*189,\s*248,\s*0\.[0-9]+\)/g, to: 'var(--state-active-bg)' },
  { from: /rgba\(16,\s*185,\s*129,\s*0\.[0-9]+\)/g, to: 'var(--state-solution-bg)' },
  { from: /rgba\(245,\s*158,\s*11,\s*0\.[0-9]+\)/g, to: 'var(--state-candidate-bg)' },
  { from: /rgba\(239,\s*68,\s*68,\s*0\.[0-9]+\)/g, to: 'var(--state-conflict-bg)' }
];

let modifiedCount = 0;

for (const file of files) {
  const fullPath = path.join(visualizersDir, file);
  if (!fs.statSync(fullPath).isFile()) continue;
  let content = fs.readFileSync(fullPath, 'utf-8');
  let original = content;

  for (const { from, to } of replacements) {
    content = content.replace(from, to);
  }

  // Also clean up any double var wrapping like var(--accent, var(--accent)) -> var(--accent)
  content = content.replace(/var\(--([a-zA-Z0-9_-]+),\s*var\(--\1\)\)/g, 'var(--$1)');

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    modifiedCount++;
    console.log(`Updated tokens in: ${file}`);
  }
}

console.log(`\nSuccessfully updated design tokens across ${modifiedCount} visualizer files.`);
