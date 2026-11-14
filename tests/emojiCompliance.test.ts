import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Zero Emojis Compliance in Remediated Files', () => {
  const targetFiles = [
    'src/components/ExerciseList.tsx',
    'src/components/InvariantInspectorCallout.tsx',
    'src/components/visualizers/PeakFindingPlayground.tsx',
    'scripts/browserQA.mjs'
  ];

  const prohibitedEmojis = ['📐', '🔀', '⏭', '⚠️'];

  for (const relativePath of targetFiles) {
    it(`ensures ${relativePath} contains zero prohibited emojis`, () => {
      const fullPath = path.resolve(__dirname, '..', relativePath);
      const content = fs.readFileSync(fullPath, 'utf8');

      for (const emoji of prohibitedEmojis) {
        expect(content.includes(emoji)).toBe(false);
      }
    });
  }
});
