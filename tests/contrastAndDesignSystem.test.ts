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

describe('Visual Design System & WCAG Contrast Quality Gate', () => {
  const variablesPath = path.resolve('src/styles/variables.css');
  const variablesContent = fs.readFileSync(variablesPath, 'utf-8');

  // Parse [data-theme='light'] block
  const lightBlockMatch = variablesContent.match(/:root,\s*\[data-theme=['"]light['"]\]\s*\{([\s\S]*?)\}/);
  const lightBlock = lightBlockMatch ? lightBlockMatch[1] : '';

  const lightTokens: Record<string, string> = {};
  const varMatches = lightBlock.matchAll(/--([a-zA-Z0-9_-]+):\s*([^;]+);/g);
  for (const match of varMatches) {
    const name = `--${match[1].trim()}`;
    const val = match[2].trim();
    if (val.startsWith('#')) {
      lightTokens[name] = val;
    }
  }

  it('provides WCAG AA text contrast (>= 4.5:1) for primary text on surfaces and backgrounds', () => {
    const textOnSurface = contrastRatio(lightTokens['--text'], lightTokens['--surface']);
    expect(textOnSurface).toBeGreaterThanOrEqual(4.5);

    const textOnBg = contrastRatio(lightTokens['--text'], lightTokens['--bg']);
    expect(textOnBg).toBeGreaterThanOrEqual(4.5);
  });

  it('provides WCAG AA text contrast (>= 4.5:1) for muted text on surfaces and backgrounds', () => {
    const mutedOnSurface = contrastRatio(lightTokens['--text-muted'], lightTokens['--surface']);
    expect(mutedOnSurface).toBeGreaterThanOrEqual(4.5);

    const mutedOnBg = contrastRatio(lightTokens['--text-muted'], lightTokens['--bg']);
    expect(mutedOnBg).toBeGreaterThanOrEqual(4.5);
  });

  it('provides WCAG AA contrast (>= 4.5:1) for brand accent and status indicators', () => {
    expect(contrastRatio(lightTokens['--accent'], lightTokens['--surface'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(lightTokens['--success'], lightTokens['--surface'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(lightTokens['--error'], lightTokens['--surface'])).toBeGreaterThanOrEqual(4.5);
    expect(contrastRatio(lightTokens['--warning'], lightTokens['--surface'])).toBeGreaterThanOrEqual(4.5);
  });

  it('provides graphical/UI contrast (>= 3.0:1) for interactive UI borders and WCAG AA contrast for board glyphs', () => {
    const borderRatio = contrastRatio(lightTokens['--border-strong'], lightTokens['--surface']);
    expect(borderRatio).toBeGreaterThanOrEqual(3.0);

    const pieceOnLightCell = contrastRatio(lightTokens['--board-text'], lightTokens['--board-cell-light']);
    expect(pieceOnLightCell).toBeGreaterThanOrEqual(4.5);

    const pieceOnDarkCell = contrastRatio(lightTokens['--board-text'], lightTokens['--board-cell-dark']);
    expect(pieceOnDarkCell).toBeGreaterThanOrEqual(4.5);

    const boardCellRatio = contrastRatio(lightTokens['--board-cell-dark'], lightTokens['--board-cell-light']);
    expect(boardCellRatio).toBeGreaterThanOrEqual(1.15);
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
