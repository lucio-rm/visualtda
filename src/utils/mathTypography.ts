// src/utils/mathTypography.ts
/**
 * Mathematical Typography Engine
 * Normalizes mathematical expressions across theoretical foundations,
 * converting raw LaTeX-style superscripts, subscripts, and summations
 * into clean, readable Unicode math symbols.
 */

const SUPERSCRIPT_MAP: Record<string, string> = {
  '0': '⁰',
  '1': '¹',
  '2': '²',
  '3': '³',
  '4': '⁴',
  '5': '⁵',
  '6': '⁶',
  '7': '⁷',
  '8': '⁸',
  '9': '⁹',
  '+': '⁺',
  '-': '⁻',
  '=': '⁼',
  '(': '⁽',
  ')': '⁾',
  'n': 'ⁿ',
  'i': 'ⁱ',
  'j': 'ʲ',
  'k': 'ᵏ',
  'm': 'ᵐ',
  'x': 'ˣ',
  'y': 'ʸ'
};

const SUBSCRIPT_MAP: Record<string, string> = {
  '0': '₀',
  '1': '₁',
  '2': '₂',
  '3': '₃',
  '4': '₄',
  '5': '₅',
  '6': '₆',
  '7': '₇',
  '8': '₈',
  '9': '₉',
  '+': '₊',
  '-': '₋',
  '=': '₌',
  '(': '₍',
  ')': '₎',
  'a': 'ₐ',
  'e': 'ₑ',
  'h': 'ₕ',
  'i': 'ᵢ',
  'j': 'ⱼ',
  'k': 'ₖ',
  'l': 'ₗ',
  'm': 'ₘ',
  'n': 'ₙ',
  'o': 'ₒ',
  'p': 'ₚ',
  'r': 'ᵣ',
  's': 'ₛ',
  't': 'ₜ',
  'u': 'ᵤ',
  'v': 'ᵥ',
  'x': 'ₓ'
};

export function toSuperscript(text: string): string {
  return text
    .split('')
    .map((char) => SUPERSCRIPT_MAP[char] || char)
    .join('');
}

export function toSubscript(text: string): string {
  return text
    .split('')
    .map((char) => SUBSCRIPT_MAP[char] || char)
    .join('');
}

export function formatMathFormula(raw: string): string {
  if (!raw) return '';

  let formatted = raw;

  // Replace \sum_{...}^{...} or \sum
  formatted = formatted.replace(/\\sum_\{([^}]+)\}\^\{([^}]+)\}/g, '∑($1..$2)');
  formatted = formatted.replace(/\\sum/g, '∑');

  // Replace \prod
  formatted = formatted.replace(/\\prod/g, '∏');

  // Replace \le, \ge, \ne, \in, \notin, \subset, \cup, \cap, \to
  formatted = formatted
    .replace(/\\le(?:q)?/g, '≤')
    .replace(/\\ge(?:q)?/g, '≥')
    .replace(/\\ne(?:q)?/g, '≠')
    .replace(/\\in/g, '∈')
    .replace(/\\notin/g, '∉')
    .replace(/\\subseteq/g, '⊆')
    .replace(/\\subset/g, '⊂')
    .replace(/\\cup/g, '∪')
    .replace(/\\cap/g, '∩')
    .replace(/\\times/g, '×')
    .replace(/\\cdot/g, '·')
    .replace(/\\to/g, '→')
    .replace(/\\implies/g, '⟹')
    .replace(/\\iff/g, '⟺')
    .replace(/\\log/g, 'log')
    .replace(/\\Theta/g, 'Θ')
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\delta/g, 'δ')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\epsilon/g, 'ε');

  // Replace LaTeX fractions: \frac{a}{b} -> (a / b)
  formatted = formatted.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)');

  // Replace braced superscripts: x^{...} -> x^...
  formatted = formatted.replace(/\^\{([a-zA-Z0-9+\-=()]+)\}/g, (_, exp) => toSuperscript(exp));

  // Replace single-character superscripts: x^2, 2^j, n^k, etc.
  formatted = formatted.replace(/\^([0-9a-zA-Z])/g, (_, char) => toSuperscript(char));

  // Replace braced subscripts: x_{...} -> x_...
  formatted = formatted.replace(/_\{([a-zA-Z0-9+\-=()]+)\}/g, (_, sub) => toSubscript(sub));

  // Replace single-character subscripts: c_1, x_i, d_j, v_k
  formatted = formatted.replace(/_([0-9a-zA-Z])/g, (_, char) => toSubscript(char));

  // Clean remaining LaTeX dollar delimiters
  formatted = formatted.replace(/\$/g, '');

  return formatted;
}
