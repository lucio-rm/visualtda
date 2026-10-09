/**
 * Python Code Sanitizer & Formatter Utility
 * 
 * Defensively cleans and standardizes student code:
 * 1. Sanitizes smart/curly quotes and non-ASCII punctuation introduced by copying from PDF slides or Word.
 * 2. Normalizes tabs to 4 spaces, removes trailing whitespace, and cleans excess blank lines.
 */

export interface CodeSanitizationResult {
  sanitized: string;
  hasReplacements: boolean;
  replacementsCount: number;
  replacementTypes: string[];
}

/**
 * Sanitizes non-ASCII typographic characters copied from lecture PDFs, slides, or word processors.
 */
export function sanitizePythonUnicode(code: string): CodeSanitizationResult {
  if (!code) {
    return {
      sanitized: '',
      hasReplacements: false,
      replacementsCount: 0,
      replacementTypes: []
    };
  }

  let count = 0;
  const typesSet = new Set<string>();

  let sanitized = code;

  // 1. Smart double quotes: “ ” « »
  if (/[“”«»]/.test(sanitized)) {
    const matches = sanitized.match(/[“”«»]/g);
    count += matches ? matches.length : 0;
    sanitized = sanitized.replace(/[“”«»]/g, '"');
    typesSet.add('comillas dobles');
  }

  // 2. Smart single quotes: ‘ ’ `
  if (/[‘’`]/.test(sanitized)) {
    const matches = sanitized.match(/[‘’`]/g);
    count += matches ? matches.length : 0;
    sanitized = sanitized.replace(/[‘’`]/g, "'");
    typesSet.add('comillas simples');
  }

  // 3. Non-breaking spaces (\u00A0) and zero-width spaces (\u200B)
  if (/[\u00A0\u200B\u202F\uFEFF]/.test(sanitized)) {
    const matches = sanitized.match(/[\u00A0\u200B\u202F\uFEFF]/g);
    count += matches ? matches.length : 0;
    sanitized = sanitized.replace(/[\u00A0\u202F]/g, ' ');
    sanitized = sanitized.replace(/[\u200B\uFEFF]/g, '');
    typesSet.add('espacios especiales');
  }

  // 4. Full-width colons or mathematical dashes
  if (/[\uFF1A]/.test(sanitized)) {
    count += (sanitized.match(/[\uFF1A]/g) || []).length;
    sanitized = sanitized.replace(/[\uFF1A]/g, ':');
    typesSet.add('dos puntos');
  }

  // 5. Typographic dashes (en-dash, em-dash) when used as minus operators
  if (/[–—]/.test(sanitized)) {
    count += (sanitized.match(/[–—]/g) || []).length;
    sanitized = sanitized.replace(/[–—]/g, '-');
    typesSet.add('guiones de resta');
  }

  return {
    sanitized,
    hasReplacements: count > 0,
    replacementsCount: count,
    replacementTypes: Array.from(typesSet)
  };
}

/**
 * Normalizes Python source code formatting:
 * - Converts tabs to 4 spaces
 * - Strips trailing whitespace per line
 * - Collapses 3+ consecutive blank lines into 2
 * - Ensures a clean trailing newline
 */
export function beautifyPythonCode(code: string): string {
  if (!code || !code.trim()) return code;

  // First sanitize non-ASCII punctuation
  const { sanitized } = sanitizePythonUnicode(code);

  const lines = sanitized.split(/\r?\n/);
  const formattedLines: string[] = [];
  let consecutiveEmptyCount = 0;

  for (const rawLine of lines) {
    // Convert tabs to 4 spaces
    let line = rawLine.replace(/\t/g, '    ');
    // Strip trailing whitespace
    line = line.trimEnd();

    if (line.trim().length === 0) {
      consecutiveEmptyCount++;
      if (consecutiveEmptyCount <= 2) {
        formattedLines.push('');
      }
    } else {
      consecutiveEmptyCount = 0;
      formattedLines.push(line);
    }
  }

  // Ensure file ends with a single newline
  while (formattedLines.length > 0 && formattedLines[formattedLines.length - 1] === '') {
    formattedLines.pop();
  }

  return formattedLines.join('\n') + '\n';
}
