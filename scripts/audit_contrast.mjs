import fs from 'node:fs';
import path from 'node:path';

// WCAG relative luminance calculation
function sRGBtoLin(colorChannel) {
  if (colorChannel <= 0.04045) {
    return colorChannel / 12.92;
  }
  return Math.pow((colorChannel + 0.055) / 1.055, 2.4);
}

function hexToRgb(hex) {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length >= 6) {
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    return [r, g, b];
  }
  return null;
}

function luminance(rgb) {
  return 0.2126 * sRGBtoLin(rgb[0]) + 0.7152 * sRGBtoLin(rgb[1]) + 0.0722 * sRGBtoLin(rgb[2]);
}

function contrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 1;
  const l1 = luminance(rgb1);
  const l2 = luminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// 1. Audit hardcoded hex colors in src/components/visualizers/
const visualizersDir = path.resolve('src/components/visualizers');
const files = fs.readdirSync(visualizersDir);

console.log('=== STEP 1: AUDITING HARDCODED HEX VALUES IN VISUALIZERS ===\n');

const problematicHexes = [
  '#38bdf8', // low contrast sky-400 on light bg
  '#10b981', // low contrast emerald-500 with white text (2.38:1) or on white (2.6:1)
  '#60a5fa', // low contrast blue-400
  '#f59e0b', // low contrast amber-500
  '#888',
  '#777',
  '#94a3b8'
];

let totalHardcoded = 0;
const hardcodedOccurrences = [];

for (const file of files) {
  const fullPath = path.join(visualizersDir, file);
  if (!fs.statSync(fullPath).isFile()) continue;
  const content = fs.readFileSync(fullPath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    const matches = line.match(/#[0-9a-fA-F]{3,8}\b/g);
    if (matches) {
      matches.forEach(hex => {
        totalHardcoded++;
        const lower = hex.toLowerCase();
        if (problematicHexes.includes(lower)) {
          hardcodedOccurrences.push({
            file,
            lineNum: idx + 1,
            hex: lower,
            lineText: line.trim()
          });
        }
      });
    }
  });
}

console.log(`Found ${totalHardcoded} total hardcoded hex instances.`);
console.log(`Found ${hardcodedOccurrences.length} problematic low-contrast hex instances (#38bdf8, #10b981, #f59e0b, #60a5fa, #888, #777).\n`);

// Group by file
const byFile = {};
hardcodedOccurrences.forEach(occ => {
  byFile[occ.file] = byFile[occ.file] || [];
  byFile[occ.file].push(occ);
});

for (const [file, items] of Object.entries(byFile)) {
  console.log(`- ${file} (${items.length} occurrences):`);
  items.slice(0, 3).forEach(it => {
    console.log(`    L${it.lineNum}: [${it.hex}] ${it.lineText.substring(0, 80)}`);
  });
  if (items.length > 3) {
    console.log(`    ... and ${items.length - 3} more`);
  }
}

// 2. Audit Theme Tokens in variables.css
console.log('\n=== STEP 2: AUDITING VARIABLES.CSS LIGHT MODE CONTRAST ===\n');
const variablesPath = path.resolve('src/styles/variables.css');
const variablesContent = fs.readFileSync(variablesPath, 'utf-8');

// Parse [data-theme='light'] block
const lightBlockMatch = variablesContent.match(/:root,\s*\[data-theme=['"]light['"]\]\s*\{([\s\S]*?)\}/);
const lightBlock = lightBlockMatch ? lightBlockMatch[1] : '';

const lightTokens = {};
const varMatches = lightBlock.matchAll(/--([a-zA-Z0-9_-]+):\s*([^;]+);/g);
for (const match of varMatches) {
  const name = `--${match[1].trim()}`;
  const val = match[2].trim();
  if (val.startsWith('#')) {
    lightTokens[name] = val;
  }
}

const checks = [
  { fg: '--text', bg: '--surface', type: 'text', label: 'Main text on surface' },
  { fg: '--text', bg: '--bg', type: 'text', label: 'Main text on page background' },
  { fg: '--text-muted', bg: '--surface', type: 'text', label: 'Muted text on surface' },
  { fg: '--text-muted', bg: '--bg', type: 'text', label: 'Muted text on page background' },
  { fg: '--accent', bg: '--surface', type: 'text', label: 'Accent link/heading on surface' },
  { fg: '--accent-contrast', bg: '--accent', type: 'text', label: 'Accent button text' },
  { fg: '--success', bg: '--surface', type: 'text', label: 'Success text on surface' },
  { fg: '--success', bg: '--success-bg', type: 'text', label: 'Success text on success bg' },
  { fg: '--error', bg: '--surface', type: 'text', label: 'Error text on surface' },
  { fg: '--error', bg: '--error-bg', type: 'text', label: 'Error text on error bg' },
  { fg: '--warning', bg: '--surface', type: 'text', label: 'Warning text on surface' },
  { fg: '--warning', bg: '--warning-bg', type: 'text', label: 'Warning text on warning bg' },
  { fg: '--border', bg: '--surface', type: 'ui', label: 'Border against surface' },
  { fg: '--border-strong', bg: '--surface', type: 'ui', label: 'Strong border against surface' },
  { fg: '--board-cell-dark', bg: '--board-cell-light', type: 'ui', label: 'Chessboard dark vs light cell differentiation' },
];

let failures = 0;
for (const check of checks) {
  const fgHex = lightTokens[check.fg];
  const bgHex = lightTokens[check.bg];
  const ratio = contrastRatio(fgHex, bgHex);
  const minRatio = check.type === 'text' ? 4.5 : 3.0;
  const pass = ratio >= minRatio;
  if (!pass) failures++;
  console.log(`[${pass ? 'PASS' : 'FAIL'}] ${check.label}: ${ratio.toFixed(2)}:1 (min ${minRatio}:1) [${check.fg}: ${fgHex} on ${check.bg}: ${bgHex}]`);
}

console.log(`\nContrast token failures: ${failures}`);
