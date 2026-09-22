import { describe, it, expect } from 'vitest';
import {
  generateHuffmanCodes,
  computeHuffmanCost,
  isPrefixFree,
  huffmanValidator
} from '../src/engine/algorithms/huffmanValidator';
import {
  generateHuffmanTrace,
  DEFAULT_HUFFMAN_FREQS
} from '../src/engine/algorithms/huffmanTrace';

describe('Huffman Coding Solver', () => {
  it('computes optimal prefix-free codes for classic CLRS frequencies (224 bits)', () => {
    // CLRS 16.3: A:45, B:13, C:12, D:16, E:9, F:5 -> Total chars = 100
    const codes = generateHuffmanCodes(DEFAULT_HUFFMAN_FREQS);
    expect(Object.keys(codes)).toHaveLength(6);

    // Verify prefix-free property
    const check = isPrefixFree(codes);
    expect(check.valid).toBe(true);

    // Verify total weighted cost equals 224 bits
    const cost = computeHuffmanCost(DEFAULT_HUFFMAN_FREQS, codes);
    expect(cost).toBe(224);

    // Most frequent symbol ('A' with 45%) should have the shortest code (1 bit)
    expect(codes.A.length).toBe(1);
    // Least frequent symbols ('E' and 'F') should have the longest codes (4 bits)
    expect(codes.E.length).toBe(4);
    expect(codes.F.length).toBe(4);
  });

  it('handles single character edge case', () => {
    const freqs = { Z: 100 };
    const codes = generateHuffmanCodes(freqs);
    expect(codes).toEqual({ Z: '0' });
    expect(computeHuffmanCost(freqs, codes)).toBe(100);
  });

  it('handles empty input', () => {
    const codes = generateHuffmanCodes({});
    expect(codes).toEqual({});
  });
});

describe('Huffman Validator', () => {
  it('accepts optimal prefix-free codes', () => {
    const codes = generateHuffmanCodes(DEFAULT_HUFFMAN_FREQS);
    const res = huffmanValidator.validate({ frequencies: DEFAULT_HUFFMAN_FREQS }, codes);
    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
  });

  it('rejects codes that violate prefix-free property', () => {
    const badCodes = {
      A: '0',
      B: '01', // Starts with '0' -> prefix conflict with A!
      C: '10',
      D: '110',
      E: '1110',
      F: '1111'
    };
    const res = huffmanValidator.validate({ frequencies: DEFAULT_HUFFMAN_FREQS }, badCodes);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('libre de prefijo'))).toBe(true);
  });

  it('rejects suboptimal codes that exceed minimal Huffman bit cost', () => {
    // Inverted assignment: give 'A' a 4-bit code and 'F' a 1-bit code
    const suboptimalCodes = {
      A: '1111',
      B: '1110',
      C: '110',
      D: '10',
      E: '01',
      F: '00'
    };
    const res = huffmanValidator.validate({ frequencies: DEFAULT_HUFFMAN_FREQS }, suboptimalCodes);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('subóptimo'))).toBe(true);
  });

  it('rejects missing characters in result dictionary', () => {
    const incomplete = { A: '0', B: '10', C: '110' };
    const res = huffmanValidator.validate({ frequencies: DEFAULT_HUFFMAN_FREQS }, incomplete);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('Falta asignar'))).toBe(true);
  });

  it('rejects non-binary code strings', () => {
    const invalidChars = { ...generateHuffmanCodes(DEFAULT_HUFFMAN_FREQS), A: '012' };
    const res = huffmanValidator.validate({ frequencies: DEFAULT_HUFFMAN_FREQS }, invalidChars);
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes('cadena binaria'))).toBe(true);
  });
});

describe('Huffman Trace Generator', () => {
  it('generates a full trace timeline with heap reduction and complete codebook', () => {
    const timeline = generateHuffmanTrace(DEFAULT_HUFFMAN_FREQS);
    expect(timeline.events.length).toBeGreaterThan(0);
    expect(timeline.events[0].type).toBe('INIT');

    const selectSteps = timeline.events.filter((e) => e.type === 'SELECT_TWO_MIN');
    const mergeSteps = timeline.events.filter((e) => e.type === 'MERGE_NODES');
    // For 6 initial items, exactly 5 greedy merges take place
    expect(selectSteps).toHaveLength(5);
    expect(mergeSteps).toHaveLength(5);

    const lastEvent = timeline.events[timeline.events.length - 1];
    expect(lastEvent.type).toBe('COMPLETE');
    expect(lastEvent.data.totalCostBits).toBe(224);
    expect(lastEvent.data.fixedCostBits).toBe(800);
  });

  it('populates allNodes and forestRoots across all steps for visual tree rendering (Defect 3.2 Fix)', () => {
    const timeline = generateHuffmanTrace(DEFAULT_HUFFMAN_FREQS);

    for (const evt of timeline.events) {
      expect(evt.data.allNodes).toBeDefined();
      expect(Object.keys(evt.data.allNodes).length).toBeGreaterThanOrEqual(6);
      expect(evt.data.forestRoots).toBeDefined();
      expect(evt.data.forestRoots.length).toBeGreaterThan(0);
    }

    // At step 0: 6 disjoint single-leaf trees in the forest
    expect(timeline.events[0].data.forestRoots).toHaveLength(6);

    // At final step: exactly 1 unified root node in the forest
    const finalEvent = timeline.events[timeline.events.length - 1];
    expect(finalEvent.data.forestRoots).toHaveLength(1);

    const rootId = finalEvent.data.forestRoots[0];
    const rootNode = finalEvent.data.allNodes[rootId];
    expect(rootNode).toBeDefined();
    expect(rootNode.freq).toBe(100);
    expect(rootNode.leftId).toBeDefined();
    expect(rootNode.rightId).toBeDefined();

    // Verify all 6 original characters are reachable leaves
    const reachedChars: string[] = [];
    function collectLeaves(id: string) {
      const node = finalEvent.data.allNodes[id];
      if (!node) return;
      if (node.char !== null) {
        reachedChars.push(node.char);
        return;
      }
      if (node.leftId) collectLeaves(node.leftId);
      if (node.rightId) collectLeaves(node.rightId);
    }
    collectLeaves(rootId);
    expect(reachedChars.sort()).toEqual(['A', 'B', 'C', 'D', 'E', 'F']);
  });
});
