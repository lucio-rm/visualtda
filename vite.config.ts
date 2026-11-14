/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [
    react(),
    {
      name: 'spa-404-fallback',
      closeBundle() {
        const outDir = path.resolve(__dirname, 'dist');
        const indexHtml = path.join(outDir, 'index.html');
        const notFoundHtml = path.join(outDir, '404.html');
        if (fs.existsSync(indexHtml)) {
          fs.copyFileSync(indexHtml, notFoundHtml);
        }
      }
    }
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('src/components/illustrations/')) {
            return 'illustrations';
          }
          if (id.includes('src/context/') || id.includes('src/hooks/') || id.includes('src/i18n/')) {
            return 'app-core';
          }
          if (id.includes('src/components/visualizers/')) {
            if (id.includes('NQueens') || id.includes('SubsetSum') || id.includes('GraphColoring') || id.includes('Sudoku') || id.includes('Hamiltonian') || id.includes('Tsp') || id.includes('KnightsTour') || id.includes('KnapsackBranchAndBound')) {
              return 'visualizers-backtracking';
            }
            if (id.includes('IntervalScheduling') || id.includes('KnapsackGreedy') || id.includes('RoadAntennas') || id.includes('Huffman') || id.includes('IntervalPartitioning') || id.includes('MinimizeLateness') || id.includes('Dijkstra') || id.includes('Kruskal')) {
              return 'visualizers-greedy';
            }
            if (id.includes('Knapsack') || id.includes('JuanElVago') || id.includes('CoinChange') || id.includes('Lcs') || id.includes('WeightedInterval') || id.includes('SegmentedLeastSquares') || id.includes('Rna') || id.includes('BellmanFord')) {
              return 'visualizers-dp';
            }
            if (id.includes('MergeSort') || id.includes('MaxSubarray') || id.includes('PeakFinding') || id.includes('InversionCounting') || id.includes('ClosestPair') || id.includes('Karatsuba') || id.includes('MedianOfMedians') || id.includes('MajorityElement')) {
              return 'visualizers-dyc';
            }
            return 'visualizers-advanced';
          }
          if (id.includes('src/engine/content/') || id.includes('src/engine/exerciseContextInsights') || id.includes('src/engine/rawExerciseAssets')) {
            return 'exercise-content';
          }
          if (id.includes('src/engine/algorithms/')) {
            return 'algorithm-engines';
          }
        }
      }
    }
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules/**', 'dist/**', 'tests/e2e/**']
  }
});
