import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

function sRGBtoLin(colorChannel: number): number {
  if (colorChannel <= 0.04045) {
    return colorChannel / 12.92;
  }
  return Math.pow((colorChannel + 0.055) / 1.055, 2.4);
}

function hexToRgb(hex: string): [number, number, number] | null {
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  if (clean.length >= 6) {
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    return [r, g, b];
  }
  return null;
}

function luminance(rgb: [number, number, number]): number {
  return 0.2126 * sRGBtoLin(rgb[0]) + 0.7152 * sRGBtoLin(rgb[1]) + 0.0722 * sRGBtoLin(rgb[2]);
}

function contrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  if (!rgb1 || !rgb2) return 1;
  const l1 = luminance(rgb1);
  const l2 = luminance(rgb2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function parseTokens(cssBlock: string): Record<string, string> {
  const raw: Record<string, string> = {};
  const varMatches = cssBlock.matchAll(/--([a-zA-Z0-9_-]+):\s*([^;]+);/g);
  for (const match of varMatches) {
    raw[`--${match[1].trim()}`] = match[2].trim().split('/*')[0].trim();
  }

  function resolve(val: string, depth = 0): string {
    if (depth > 10) return val;
    const varMatch = val.match(/^var\((--[a-zA-Z0-9_-]+)(?:,\s*([^)]+))?\)$/);
    if (varMatch) {
      const target = varMatch[1];
      const fallback = varMatch[2];
      if (raw[target]) return resolve(raw[target], depth + 1);
      if (fallback) return resolve(fallback, depth + 1);
    }
    return val;
  }

  const resolved: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    const res = resolve(v);
    if (res.startsWith('#')) {
      resolved[k] = res;
    }
  }
  return resolved;
}

describe('Visual Design System & WCAG Contrast Quality Gate (Mission V11 Radix Scale)', () => {
  const variablesPath = path.resolve('src/styles/variables.css');
  const variablesContent = fs.readFileSync(variablesPath, 'utf-8');

  // Parse Light theme block
  const lightBlockMatch = variablesContent.match(/:root[\s\S]*?\{([\s\S]*?)\n\}/);
  const lightTokens = parseTokens(lightBlockMatch ? lightBlockMatch[1] : '');

  // Parse Dark theme block
  const darkBlockMatch = variablesContent.match(/\[data-theme=['"]dark['"]\][\s\S]*?\{([\s\S]*?)\n\}/);
  const darkTokens = parseTokens(darkBlockMatch ? darkBlockMatch[1] : '');

  it('validates adoption of complete 12-step Radix Colors scales in variables.css', () => {
    const scales = ['slate', 'indigo', 'grass', 'tomato', 'amber'];
    for (const scale of scales) {
      for (let step = 1; step <= 12; step++) {
        expect(lightTokens[`--${scale}-${step}`], `Missing Light --${scale}-${step}`).toBeDefined();
        expect(darkTokens[`--${scale}-${step}`], `Missing Dark --${scale}-${step}`).toBeDefined();
      }
    }
  });

  it('provides WCAG AA text contrast (>= 4.5:1) for primary text on surfaces and backgrounds (Light & Dark)', () => {
    // Light mode
    expect(contrastRatio(lightTokens['--text'], lightTokens['--surface'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(lightTokens['--text'], lightTokens['--bg'])).toBeGreaterThanOrEqual(4.5);

    // Dark mode
    expect(contrastRatio(darkTokens['--text'], darkTokens['--surface'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(darkTokens['--text'], darkTokens['--bg'])).toBeGreaterThanOrEqual(4.5);
  });

  it('provides WCAG AA text contrast (>= 4.5:1) for muted text on surfaces and backgrounds (Light & Dark)', () => {
    // Light mode
    expect(contrastRatio(lightTokens['--text-muted'], lightTokens['--surface'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(lightTokens['--text-muted'], lightTokens['--bg'])).toBeGreaterThanOrEqual(4.5);

    // Dark mode
    expect(contrastRatio(darkTokens['--text-muted'], darkTokens['--surface'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(darkTokens['--text-muted'], darkTokens['--bg'])).toBeGreaterThanOrEqual(4.5);
  });

  it('provides WCAG AA contrast (>= 4.5:1) for brand accent and status indicators (Light & Dark)', () => {
    // Light theme indicators
    expect(contrastRatio(lightTokens['--accent'], lightTokens['--surface'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(lightTokens['--success'], lightTokens['--surface'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(lightTokens['--error'], lightTokens['--surface'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(lightTokens['--warning'], lightTokens['--surface'])).toBeGreaterThanOrEqual(4.5);

    // Light text on solid fills
    expect(contrastRatio(lightTokens['--accent-contrast'], lightTokens['--accent-solid'] || lightTokens['--accent'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(lightTokens['--success-contrast'], lightTokens['--success-solid'] || lightTokens['--success'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(lightTokens['--error-contrast'], lightTokens['--error-solid'] || lightTokens['--error'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(lightTokens['--warning-contrast'], lightTokens['--warning-solid'] || lightTokens['--warning'])).toBeGreaterThanOrEqual(4.5);

    // Dark theme indicators
    expect(contrastRatio(darkTokens['--accent'], darkTokens['--surface'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(darkTokens['--success'], darkTokens['--surface'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(darkTokens['--error'], darkTokens['--surface'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(darkTokens['--warning'], darkTokens['--surface'])).toBeGreaterThanOrEqual(4.5);

    // Dark text on solid fills
    expect(contrastRatio(darkTokens['--accent-contrast'], darkTokens['--accent-solid'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(darkTokens['--success-contrast'], darkTokens['--success-solid'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(darkTokens['--error-contrast'], darkTokens['--error-solid'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(darkTokens['--warning-contrast'], darkTokens['--warning-solid'])).toBeGreaterThanOrEqual(4.5);
  });

  it('strictly satisfies WCAG non-text UI contrast (>= 3.0:1) between chessboard and grid cells (Light & Dark)', () => {
    // Light Mode board cells: MUST meet or exceed 3:1 (previously failed at 2.36:1)
    const lightBoardCellRatio = contrastRatio(lightTokens['--board-cell-dark'], lightTokens['--board-cell-light']);
    expect(lightBoardCellRatio).toBeGreaterThanOrEqual(3.0);

    // Dark Mode board cells: MUST meet or exceed 3:1
    const darkBoardCellRatio = contrastRatio(darkTokens['--board-cell-dark'], darkTokens['--board-cell-light']);
    expect(darkBoardCellRatio).toBeGreaterThanOrEqual(3.0);

    // Board piece glyphs contrast (>= 4.5:1) on both squares
    const lightPieceOnLight = contrastRatio(lightTokens['--board-text'], lightTokens['--board-cell-light']);
    expect(lightPieceOnLight).toBeGreaterThanOrEqual(4.5);

    const lightPieceOnDark = contrastRatio(lightTokens['--board-text-light'] || '#ffffff', lightTokens['--board-cell-dark']);
    expect(lightPieceOnDark).toBeGreaterThanOrEqual(4.5);

    const darkPieceOnLight = contrastRatio(darkTokens['--board-text'], darkTokens['--board-cell-light']);
    expect(darkPieceOnLight).toBeGreaterThanOrEqual(4.5);

    const darkPieceOnDark = contrastRatio(darkTokens['--board-text'], darkTokens['--board-cell-dark']);
    expect(darkPieceOnDark).toBeGreaterThanOrEqual(4.5);
  });

  it('guarantees crisp differentiation between cards, workbench canvas, and background', () => {
    // In Light mode, card surface and workbench canvas are distinct from app background
    expect(lightTokens['--surface']).not.toBe(lightTokens['--bg']);
    expect(lightTokens['--canvas-bg']).not.toBe(lightTokens['--surface']);

    // In Dark mode, border strong provides >= 3.0:1 demarcation on app background
    const darkBorderOnBg = contrastRatio(darkTokens['--border-strong'], darkTokens['--bg']);
    expect(darkBorderOnBg).toBeGreaterThanOrEqual(3.0);

    // Graph edges satisfy >= 3.0:1 contrast against canvas background in both themes
    const lightEdgeOnCanvas = contrastRatio(lightTokens['--graph-edge'], lightTokens['--canvas-bg']);
    expect(lightEdgeOnCanvas).toBeGreaterThanOrEqual(3.0);

    const darkEdgeOnCanvas = contrastRatio(darkTokens['--graph-edge'], darkTokens['--canvas-bg']);
    expect(darkEdgeOnCanvas).toBeGreaterThanOrEqual(3.0);
  });

  it('defines all canonical semantic state tokens in variables.css', () => {
    const requiredStates = [
      '--state-normal',
      '--state-active',
      '--state-candidate',
      '--state-selected',
      '--state-rejected',
      '--state-conflict',
      '--state-solution',
      '--state-visited',
      '--state-pruned'
    ];

    for (const state of requiredStates) {
      expect(variablesContent).toContain(state);
    }
  });

  it('enforces universal prefers-reduced-motion reduction in base.css', () => {
    const baseCssPath = path.resolve('src/styles/base.css');
    const baseCss = fs.readFileSync(baseCssPath, 'utf-8');

    expect(baseCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(baseCss).toContain('animation-duration: 0.01ms !important');
    expect(baseCss).toContain('transition-duration: 0.01ms !important');
  });

  it('maintains active Architecture Decision Records (ADRs) with index in docs/adr/', () => {
    const adrDir = path.resolve('docs/adr');
    expect(fs.existsSync(adrDir)).toBe(true);

    const readmePath = path.join(adrDir, 'README.md');
    expect(fs.existsSync(readmePath)).toBe(true);

    const adrFiles = fs.readdirSync(adrDir).filter(f => f.endsWith('.md') && f !== 'README.md');
    expect(adrFiles.length).toBeGreaterThanOrEqual(5);

    const readmeContent = fs.readFileSync(readmePath, 'utf-8');
    for (const file of adrFiles) {
      expect(readmeContent).toContain(file);
    }
  });
});
