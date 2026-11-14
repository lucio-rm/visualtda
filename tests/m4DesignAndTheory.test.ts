import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { EXERCISES } from '../src/engine/registry';
import { ENGLISH_THEORY_OVERRIDES } from '../src/engine/content/englishTheoryContent';

describe('Milestone 4: Design System Craft, TraceScrubber Standardization & Bilingual Theory Parity', () => {
  it('provides full English academic theory overrides for all 37 registered exercises', () => {
    expect(EXERCISES.length).toBe(37);
    for (const ex of EXERCISES) {
      const override = ENGLISH_THEORY_OVERRIDES[ex.id];
      expect(override, `Missing English theory override for ${ex.id}`).toBeDefined();
      expect(override.length).toBeGreaterThan(300);
      expect(override).toContain('## 1.');
      // Verify no untranslated Spanish headings leak
      expect(override).not.toContain('Planteo del Problema');
      expect(override).not.toContain('Demostración de Corrección');
      expect(override).not.toContain('Complejidad Temporal');
    }
  });

  it('standardizes all 37 Visualizer components to use the shared TraceScrubber component', () => {
    const visualizersDir = path.resolve(__dirname, '../src/components/visualizers');
    const files = fs.readdirSync(visualizersDir).filter((f) => f.endsWith('Visualizer.tsx'));
    expect(files.length).toBe(37);
    for (const file of files) {
      const content = fs.readFileSync(path.join(visualizersDir, file), 'utf-8');
      expect(content, `${file} should use TraceScrubber`).toContain('TraceScrubber');
    }
  });

  it('maintains zero AI aesthetic glow filters, radial gradients, or neon violet/pink hexes in src/', () => {
    const srcDir = path.resolve(__dirname, '../src');
    const forbiddenPattern = /feGaussianBlur|feDropShadow|radial-gradient|#8b5cf6|#ec4899|#a855f7|#d946ef/i;

    const walk = (dir: string): string[] => {
      let results: string[] = [];
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          results = results.concat(walk(fullPath));
        } else if (/\.(ts|tsx|css)$/.test(entry.name)) {
          results.push(fullPath);
        }
      }
      return results;
    };

    const allFiles = walk(srcDir);
    for (const filePath of allFiles) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const match = content.match(forbiddenPattern);
      expect(match, `Forbidden AI aesthetic artifact "${match?.[0]}" found in ${path.relative(srcDir, filePath)}`).toBeNull();
    }
  });
});
