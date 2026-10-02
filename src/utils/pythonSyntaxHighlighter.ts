/**
 * High-performance, zero-dependency Python syntax highlighter for Visual TDA.
 * Formats tokens with VS Code Dark+ / Light+ compatible classes.
 */

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const KEYWORDS = new Set([
  'def', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or',
  'is', 'pass', 'break', 'continue', 'yield', 'import', 'from', 'as', 'try', 'except',
  'finally', 'raise', 'with', 'lambda', 'class', 'global', 'nonlocal', 'del', 'assert'
]);

const BUILTINS = new Set([
  'range', 'len', 'min', 'max', 'sum', 'abs', 'enumerate', 'zip', 'print',
  'list', 'dict', 'set', 'tuple', 'int', 'float', 'str', 'bool', 'sorted',
  'reversed', 'map', 'filter', 'any', 'all', 'open', 'round', 'isinstance'
]);

const CONSTANTS = new Set(['True', 'False', 'None']);

/**
 * Tokenizes and highlights Python source code to sanitized HTML.
 */
export function highlightPythonCode(code: string): string {
  if (!code) return '';

  // Master regex pattern for Python lexical elements:
  // 1: Multi-line strings ("""...""" or '''...''')
  // 2: Single-line strings ("..." or '...' or f"..." or f'...')
  // 3: Comments (#...)
  // 4: Words / Identifiers
  // 5: Numbers (hex, binary, float, int)
  // 6: Operators & comparison
  // 7: Punctuation (colons, commas, dots)
  // 8: Parens / brackets
  const tokenRegex = /(f?"""[\s\S]*?"""|f?'''[\s\S]*?'''|f?"(?:\\.|[^"\\])*"|f?'(?:\\.|[^'\\])*')|(#[^\n]*)|(\b[a-zA-Z_]\w*\b)|(\b0[xX][0-9a-fA-F]+\b|\b0[bB][01]+\b|\b\d+(?:\.\d+)?\b)|(==|!=|<=|>=|->|\+=|-=|\*=|\/=|\/\/=|%=|\*\*=|(?:\/\/)|(?:\*\*)|[+\-*/%<>=&|^~])|([()[\]{}])|([:,;.])|([^\s\w#"'()[\]{}:,;.]+)/g;

  let lastIndex = 0;
  let html = '';
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(code)) !== null) {
    const textBetween = code.substring(lastIndex, match.index);
    if (textBetween) {
      html += escapeHtml(textBetween);
    }
    lastIndex = tokenRegex.lastIndex;

    const [
      fullMatch,
      strMatch,
      commentMatch,
      wordMatch,
      numMatch,
      opMatch,
      bracketMatch,
      punctMatch
    ] = match;

    if (strMatch) {
      html += `<span class="tok-str">${escapeHtml(strMatch)}</span>`;
    } else if (commentMatch) {
      html += `<span class="tok-comment">${escapeHtml(commentMatch)}</span>`;
    } else if (wordMatch) {
      if (KEYWORDS.has(wordMatch)) {
        html += `<span class="tok-kw">${escapeHtml(wordMatch)}</span>`;
      } else if (CONSTANTS.has(wordMatch)) {
        html += `<span class="tok-const">${escapeHtml(wordMatch)}</span>`;
      } else if (BUILTINS.has(wordMatch)) {
        html += `<span class="tok-builtin">${escapeHtml(wordMatch)}</span>`;
      } else if (wordMatch === 'self') {
        html += `<span class="tok-self">${escapeHtml(wordMatch)}</span>`;
      } else {
        // Look ahead to check if followed by `(` (function call or def)
        const restOfCode = code.substring(lastIndex);
        const isFollowedByParen = /^\s*\(/.test(restOfCode);
        // Look behind to check if preceded by `def `
        const codeBefore = code.substring(0, match.index);
        const isPrecededByDef = /\bdef\s+$/.test(codeBefore);

        if (isPrecededByDef) {
          html += `<span class="tok-fn-decl">${escapeHtml(wordMatch)}</span>`;
        } else if (isFollowedByParen) {
          html += `<span class="tok-fn-call">${escapeHtml(wordMatch)}</span>`;
        } else {
          html += `<span class="tok-var">${escapeHtml(wordMatch)}</span>`;
        }
      }
    } else if (numMatch) {
      html += `<span class="tok-num">${escapeHtml(numMatch)}</span>`;
    } else if (opMatch) {
      html += `<span class="tok-op">${escapeHtml(opMatch)}</span>`;
    } else if (bracketMatch) {
      html += `<span class="tok-bracket">${escapeHtml(bracketMatch)}</span>`;
    } else if (punctMatch) {
      html += `<span class="tok-punct">${escapeHtml(punctMatch)}</span>`;
    } else {
      html += escapeHtml(fullMatch);
    }
  }

  // Trailing text
  if (lastIndex < code.length) {
    html += escapeHtml(code.substring(lastIndex));
  }

  // Ensure trailing newline renders properly in pre tag
  if (code.endsWith('\n')) {
    html += '\n';
  }

  return html;
}
