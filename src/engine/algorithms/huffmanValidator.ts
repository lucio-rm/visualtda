import { ValidationResult, Validator } from '../../types/validation';

export interface HuffmanInput {
  frequencies: Record<string, number>;
}

export interface HuffmanNode {
  char: string | null;
  freq: number;
  left: HuffmanNode | null;
  right: HuffmanNode | null;
  id: string;
}

export function buildHuffmanTree(frequencies: Record<string, number>): HuffmanNode | null {
  const chars = Object.keys(frequencies);
  if (chars.length === 0) return null;

  if (chars.length === 1) {
    const c = chars[0];
    return {
      char: c,
      freq: frequencies[c],
      left: null,
      right: null,
      id: `leaf-${c}`
    };
  }

  let counter = 0;
  // Priority queue of nodes sorted by frequency
  const queue: HuffmanNode[] = chars.map((c) => ({
    char: c,
    freq: frequencies[c],
    left: null,
    right: null,
    id: `leaf-${c}`
  }));

  queue.sort((a, b) => a.freq - b.freq);

  while (queue.length > 1) {
    const left = queue.shift()!;
    const right = queue.shift()!;
    counter++;

    const parent: HuffmanNode = {
      char: null,
      freq: left.freq + right.freq,
      left,
      right,
      id: `node-${counter}`
    };

    // Insert maintaining sorted order
    let insertIdx = 0;
    while (insertIdx < queue.length && queue[insertIdx].freq <= parent.freq) {
      insertIdx++;
    }
    queue.splice(insertIdx, 0, parent);
  }

  return queue[0];
}

export function generateHuffmanCodes(frequencies: Record<string, number>): Record<string, string> {
  const root = buildHuffmanTree(frequencies);
  if (!root) return {};

  if (root.char !== null) {
    return { [root.char]: '0' };
  }

  const codes: Record<string, string> = {};

  function traverse(node: HuffmanNode | null, prefix: string) {
    if (!node) return;
    if (node.char !== null) {
      codes[node.char] = prefix;
      return;
    }
    traverse(node.left, prefix + '0');
    traverse(node.right, prefix + '1');
  }

  traverse(root, '');
  return codes;
}

export function computeHuffmanCost(
  frequencies: Record<string, number>,
  codes: Record<string, string>
): number {
  let cost = 0;
  for (const [char, freq] of Object.entries(frequencies)) {
    const code = codes[char] || '';
    cost += freq * code.length;
  }
  return cost;
}

export function isPrefixFree(codes: Record<string, string>): {
  valid: boolean;
  conflict?: [string, string];
} {
  const entries = Object.entries(codes);
  for (let i = 0; i < entries.length; i++) {
    for (let j = 0; j < entries.length; j++) {
      if (i === j) continue;
      const [c1, code1] = entries[i];
      const [c2, code2] = entries[j];
      if (code2.startsWith(code1)) {
        return { valid: false, conflict: [c1, c2] };
      }
    }
  }
  return { valid: true };
}

export class HuffmanValidator implements Validator<HuffmanInput, Record<string, string>> {
  validate(input: HuffmanInput, result: Record<string, string>): ValidationResult {
    const { frequencies } = input;
    const errors: string[] = [];

    if (!result || typeof result !== 'object') {
      return {
        valid: false,
        errors: ['El resultado debe ser un objeto diccionario { caracter: codigo_binario }.']
      };
    }

    const inputChars = Object.keys(frequencies);
    const resultChars = Object.keys(result);

    if (inputChars.length === 0) {
      if (resultChars.length !== 0) {
        errors.push('Para un alfabeto vacío, el diccionario de códigos debe ser {}.');
      }
      return { valid: errors.length === 0, errors };
    }

    // 1. Check all characters are present and no extraneous chars
    for (const c of inputChars) {
      if (!(c in result)) {
        errors.push(`Falta asignar código binario al carácter "${c}".`);
      }
    }

    for (const c of resultChars) {
      if (!(c in frequencies)) {
        errors.push(`El carácter "${c}" en la solución no existía en el alfabeto de entrada.`);
      }
    }

    // 2. Check each code consists only of '0' and '1'
    for (const [c, code] of Object.entries(result)) {
      if (typeof code !== 'string' || !/^[01]+$/.test(code)) {
        errors.push(`El código asignado a "${c}" ('${code}') debe ser una cadena binaria no vacía de '0' y '1'.`);
      }
    }

    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // 3. Check Prefix-Free Property
    const prefixCheck = isPrefixFree(result);
    if (!prefixCheck.valid && prefixCheck.conflict) {
      const [c1, c2] = prefixCheck.conflict;
      errors.push(
        `Violación de código libre de prefijo: El código de "${c1}" ('${result[c1]}') es un prefijo del código de "${c2}" ('${result[c2]}').`
      );
    }

    // 4. Check Optimality against Canonical Huffman Cost
    const optimalCodes = generateHuffmanCodes(frequencies);
    const optimalCost = computeHuffmanCost(frequencies, optimalCodes);
    const candidateCost = computeHuffmanCost(frequencies, result);

    if (candidateCost > optimalCost) {
      errors.push(
        `El costo ponderado total de compresión (${candidateCost} bits) es subóptimo. La codificación de Huffman alcanza un costo óptimo de ${optimalCost} bits.`
      );
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

export const huffmanValidator = new HuffmanValidator();
