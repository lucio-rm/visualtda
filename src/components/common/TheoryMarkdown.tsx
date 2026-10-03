import React, { useContext } from 'react';
import { LanguageContext } from '../../i18n/LanguageContext';
import { formatTitleSpacing } from '../../utils/textFormatting';
import {
  ENGLISH_THEORY_OVERRIDES,
  translateSpanishTheoryToEnglish
} from '../../engine/content/englishTheoryContent';

interface TheoryMarkdownProps {
  content: string;
  language?: 'es' | 'en';
  exerciseId?: string;
}

const SUPERSCRIPT_MAP: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
  'a': 'ᵃ', 'b': 'ᵇ', 'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'g': 'ᵍ', 'h': 'ʰ', 'i': 'ⁱ', 'j': 'ʲ',
  'k': 'ᵏ', 'l': 'ˡ', 'm': 'ᵐ', 'n': 'ⁿ', 'o': 'ᵒ', 'p': 'ᵖ', 'r': 'ʳ', 's': 'ˢ', 't': 'ᵗ', 'u': 'ᵘ',
  'v': 'ᵛ', 'w': 'ʷ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ',
  'T': 'ᵀ', 'N': 'ᴺ', 'K': 'ᴷ', 'M': 'ᴹ', 'P': 'ᴾ'
};

const SUBSCRIPT_MAP: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
  'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ', 'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ',
  'o': 'ₒ', 'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ', 'v': 'ᵥ', 'x': 'ₓ'
};

export function toSuperscript(str: string): string {
  return str.split('').map((char) => SUPERSCRIPT_MAP[char] || char).join('');
}

export function toSubscript(str: string): string {
  return str.split('').map((char) => SUBSCRIPT_MAP[char] || char).join('');
}


// Cleanly replaces LaTeX symbols and formatting into standard mathematical Unicode typography
export function formatMathText(text: string): string {
  let formatted = text;

  // 1. Unnest \text{...}, \mathrm{...}, \mathbf{...}, \mathit{...}, \mathcal{...}
  for (let round = 0; round < 3; round++) {
    formatted = formatted.replace(/\\(?:text|mathrm|mathbf|mathit|mathcal)\{([^{}]+)\}/g, '$1');
  }

  // 2. Format cases piecewise environment with opening bracket
  formatted = formatted.replace(/\\begin\{cases\}/g, '{\n ');
  formatted = formatted.replace(/\\end\{cases\}/g, '\n}');

  // 3. Remove other LaTeX environments (e.g. \begin{aligned}, \end{aligned})
  formatted = formatted.replace(/\\(?:begin|end)\{[a-zA-Z*]+\}/g, '');

  // 4. Mathematical symbol transformations
  const mathSymbols: [RegExp, string | ((...args: string[]) => string)][] = [
    // Sets & Number systems
    [/\\mathbb\{R\}\^([nm0-9])/g, 'ℝ^$1'],
    [/\\mathbb\{R\}/g, 'ℝ'],
    [/\\mathbb\{N\}/g, 'ℕ'],
    [/\\mathbb\{Z\}/g, 'ℤ'],
    [/\\mathbb\{E\}/g, '𝔼'],
    [/\\mathcal\{F\}/g, 'F'],

    // Greek letters
    [/\\Delta(?=[^a-zA-Z]|$)/g, 'Δ'],
    [/\\delta(?=[^a-zA-Z]|$)/g, 'δ'],
    [/\\theta(?=[^a-zA-Z]|$)/g, 'θ'],
    [/\\Theta(?=[^a-zA-Z]|$)/g, 'Θ'],
    [/\\Omega(?=[^a-zA-Z]|$)/g, 'Ω'],
    [/\\rho(?=[^a-zA-Z]|$)/g, 'ρ'],
    [/\\chi(?=[^a-zA-Z]|$)/g, 'χ'],
    [/\\epsilon(?=[^a-zA-Z]|$)/g, 'ε'],
    [/\\alpha(?=[^a-zA-Z]|$)/g, 'α'],
    [/\\beta(?=[^a-zA-Z]|$)/g, 'β'],
    [/\\gamma(?=[^a-zA-Z]|$)/g, 'γ'],
    [/\\lambda(?=[^a-zA-Z]|$)/g, 'λ'],
    [/\\pi(?=[^a-zA-Z]|$)/g, 'π'],
    [/\\sigma(?=[^a-zA-Z]|$)/g, 'σ'],
    [/\\Sigma(?=[^a-zA-Z]|$)/g, 'Σ'],
    [/\\mu(?=[^a-zA-Z]|$)/g, 'μ'],

    // Logic & Implication
    [/\\implies(?=[^a-zA-Z]|$)/g, ' ⟹ '],
    [/\\iff(?=[^a-zA-Z]|$)/g, ' ⟺ '],
    [/\\Longrightarrow(?=[^a-zA-Z]|$)/g, ' ⟹ '],
    [/\\Longleftarrow(?=[^a-zA-Z]|$)/g, ' ⟸ '],
    [/\\longrightarrow(?=[^a-zA-Z]|$)/g, ' ⟶ '],
    // LaTeX environments
    [/\\begin\{aligned\}/g, ''],
    [/\\end\{aligned\}/g, ''],
    [/\\begin\{cases\}/g, '{\n '],
    [/\\end\{cases\}/g, '\n}'],

    // Text & Math formatting unnesting
    [/\\text(?:bf)?\{([^{}]+)\}/g, '$1'],
    [/\\mathbf\{([^{}]+)\}/g, '$1'],
    [/\\mathbb\{R\}/g, 'ℝ'],
    [/\\mathbb\{N\}/g, 'ℕ'],
    [/\\mathbb\{Z\}/g, 'ℤ'],
    [/\\mathcal\{([^{}]+)\}/g, '$1'],
    [/\\Big\(/g, '('],
    [/\\Big\)/g, ')'],
    [/\\;/g, ' '],

    [/\\leftarrow(?=[^a-zA-Z]|$)/g, ' ← '],
    [/\\to(?=[^a-zA-Z]|$)/g, ' → '],
    [/\\lor(?=[^a-zA-Z]|$)/g, ' ∨ '],
    [/\\land(?=[^a-zA-Z]|$)/g, ' ∧ '],
    [/\\(?:neg|lnot)(?=[^a-zA-Z]|$)/g, '¬'],

    // Relations & Inequalities
    [/\\le_P(?=[^a-zA-Z]|$)/g, ' ≤ₚ '],
    [/\\leq?(?=[^a-zA-Z]|$)/g, ' ≤ '],
    [/\\geq?(?=[^a-zA-Z]|$)/g, ' ≥ '],
    [/\\neq?(?=[^a-zA-Z]|$)/g, ' ≠ '],
    [/\\approx(?=[^a-zA-Z]|$)/g, ' ≈ '],
    [/\\equiv(?=[^a-zA-Z]|$)/g, ' ≡ '],
    [/\\circ(?=[^a-zA-Z]|$)/g, ' ∘ '],
    [/\\in(?=[^a-zA-Z]|$)/g, ' ∈ '],
    [/\\notin(?=[^a-zA-Z]|$)/g, ' ∉ '],
    [/\\subset(?=[^a-zA-Z]|$)/g, ' ⊂ '],
    [/\\subseteq(?=[^a-zA-Z]|$)/g, ' ⊆ '],
    [/\\cap(?=[^a-zA-Z]|$)/g, ' ∩ '],
    [/\\cup(?=[^a-zA-Z]|$)/g, ' ∪ '],
    [/\\emptyset(?=[^a-zA-Z]|$)/g, ' ∅ '],
    [/\\setminus(?=[^a-zA-Z]|$)/g, ' \\ '],

    // Quantifiers & Calculus
    [/\\forall(?=[^a-zA-Z]|$)/g, ' ∀ '],
    [/\\exists(?=[^a-zA-Z]|$)/g, ' ∃ '],
    [/\\blacksquare(?=[^a-zA-Z]|$)/g, ' ■ '],
    [/\\times(?=[^a-zA-Z]|$)/g, ' × '],
    [/\\cdot(?=[^a-zA-Z]|$)/g, ' · '],
    [/\\(?:dots|cdots|ldots)(?=[^a-zA-Z]|$)/g, ' … '],

    // Summations with lower and upper bounds
    [/\\sum_\{([^{}]+)\}\^\{([^{}]+)\}/g, (_: string, l: string, u: string) => `∑${toSubscript(l)}${toSuperscript(u)}`],
    [/\\sum_\{([^{}]+)\}\^([0-9a-zA-Z+-])/g, (_: string, l: string, u: string) => `∑${toSubscript(l)}${toSuperscript(u)}`],
    [/\\sum_\{([^{}]+)\}/g, (_: string, l: string) => (toSubscript(l).includes('\\') ? `∑ (${l})` : `∑${toSubscript(l)}`)],
    [/\\sum\^\{([^{}]+)\}/g, (_: string, u: string) => `∑${toSuperscript(u)}`],
    [/\\sum\^([0-9a-zA-Z+-])/g, (_: string, u: string) => `∑${toSuperscript(u)}`],
    [/\\sum(?=[^a-zA-Z]|$)/g, '∑'],

    [/\\int(?=[^a-zA-Z]|$)/g, '∫'],
    [/\\infty(?=[^a-zA-Z]|$)/g, '∞'],

    // Delimiters
    [/\\lfloor(?=[^a-zA-Z]|$)/g, '⌊'],
    [/\\rfloor(?=[^a-zA-Z]|$)/g, '⌋'],
    [/\\lceil(?=[^a-zA-Z]|$)/g, '⌈'],
    [/\\rceil(?=[^a-zA-Z]|$)/g, '⌉'],
    [/\\langle(?=[^a-zA-Z]|$)/g, '⟨'],
    [/\\rangle(?=[^a-zA-Z]|$)/g, '⟩'],
    [/\\mid(?=[^a-zA-Z]|$)/g, ' | '],
    [/\\quad(?=[^a-zA-Z]|$)/g, '   '],
    [/\\qquad(?=[^a-zA-Z]|$)/g, '      '],
    [/\\(?:left|right|Big)(?=[^a-zA-Z]|$)/g, ''],

    // Functions
    [/\\(?:max|min|log|ln|arg)(?=[^a-zA-Z]|$)/g, (match: string) => match.slice(1)],
    [/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1 / $2)'],
    [/\\binom\{([^{}]+)\}\{([^{}]+)\}/g, 'C($1, $2)'],
    [/\\sqrt\{([^{}]+)\}/g, '√($1)'],

    // Superscripts (supports 2^j, 2^{j+1}, 2^n, 2^k, etc.)
    [/\^T\b/g, 'ᵀ'],
    [/\^\{([0-9a-zA-Z+-]+)\}/g, (_: string, p: string) => toSuperscript(p)],
    [/\^([0-9a-zA-Z+-])/g, (_: string, p: string) => toSuperscript(p)],

    // Subscripts: convert single letters, digits, and mathematical index expressions (e.g. j=1, i=0, n-1, i+1)
    [/_\{([0-9]|j=1|i=0|n-1|i\+1|j\+1)\}/g, (_: string, p: string) => toSubscript(p)],
    [/_\{([^{}]+)\}/g, (_: string, p: string) => (p.length === 1 && SUBSCRIPT_MAP[p] ? SUBSCRIPT_MAP[p] : `_${p}`)],
    [/_([0-9a-zA-Z])(?=[^a-zA-Z0-9]|$)/g, (_: string, p: string) => (SUBSCRIPT_MAP[p] ? SUBSCRIPT_MAP[p] : `_${p}`)]
  ];

  for (const [pattern, replacement] of mathSymbols) {
    if (typeof replacement === 'function') {
      formatted = formatted.replace(pattern, replacement);
    } else {
      formatted = formatted.replace(pattern, replacement);
    }
  }

  // Handle alignment tokens and line breaks
  formatted = formatted.replace(/\\\\/g, '\n');
  formatted = formatted.replace(/&/g, '   ');

  const cleanedLines = formatted
    .split('\n')
    .map((l) => l.replace(/ +/g, ' ').trim())
    .filter((l) => l.length > 0);

  return cleanedLines.join('\n');
}

export function renderInlineFormatting(line: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\$\$[\s\S]*?\$\$|\$[^$]+\$|`[^`]+`|\*\*[^*]+\*\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith('$$') && token.endsWith('$$')) {
      const math = formatMathText(token.slice(2, -2).trim());
      parts.push(
        <span key={match.index} className="theory-math-block">
          {math}
        </span>
      );
    } else if (token.startsWith('$') && token.endsWith('$')) {
      const math = formatMathText(token.slice(1, -1).trim());
      parts.push(
        <span key={match.index} className="theory-math-inline">
          {math}
        </span>
      );
    } else if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={match.index} className="theory-inline-code">
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith('**') && token.endsWith('**')) {
      parts.push(
        <strong key={match.index} className="theory-strong">
          {renderInlineFormatting(token.slice(2, -2))}
        </strong>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts;
}

export const TheoryMarkdown: React.FC<TheoryMarkdownProps> = ({ content, language: propLanguage, exerciseId }) => {
  const langContext = useContext(LanguageContext);
  const language = propLanguage || langContext?.language || 'es';
  if (!content) return null;

  const rawContent = (language === 'en' && exerciseId && ENGLISH_THEORY_OVERRIDES[exerciseId])
    ? ENGLISH_THEORY_OVERRIDES[exerciseId]
    : content;

  const lines = rawContent.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const translatedLine = (language === 'en' && (!exerciseId || !ENGLISH_THEORY_OVERRIDES[exerciseId]))
      ? translateSpanishTheoryToEnglish(rawLine)
      : rawLine;
    const line = translatedLine.trim();

    // 1. Skip empty lines
    if (line === '') {
      i++;
      continue;
    }

    // 2. Horizontal divider
    if (line === '---' || line === '***') {
      elements.push(<hr key={`hr-${i}`} className="theory-divider" />);
      i++;
      continue;
    }

    // 3. Block math: $$ ... $$
    if (line.startsWith('$$')) {
      let mathContent = line.slice(2);
      if (mathContent.endsWith('$$') && mathContent.length > 2) {
        mathContent = mathContent.slice(0, -2);
        elements.push(
          <div key={`mathblk-${i}`} className="theory-block-equation">
            {formatMathText(mathContent)}
          </div>
        );
        i++;
        continue;
      }
      i++;
      while (i < lines.length && !lines[i].trim().endsWith('$$')) {
        mathContent += '\n' + lines[i].trim();
        i++;
      }
      if (i < lines.length) {
        mathContent += '\n' + lines[i].trim().replace(/\$\$/, '');
        i++;
      }
      elements.push(
        <div key={`mathblk-${i}`} className="theory-block-equation" style={{ whiteSpace: 'pre-line' }}>
          {formatMathText(mathContent.trim())}
        </div>
      );
      continue;
    }

    // 4. Code Block
    if (line.startsWith('```')) {
      const lang = line.slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      elements.push(
        <pre key={`code-${i}`} className={`theory-code-block lang-${lang}`}>
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    // 5. Headings
    if (line.startsWith('# ')) {
      elements.push(
        <h3 key={`h1-${i}`} className="theory-h1">
          {renderInlineFormatting(formatTitleSpacing(line.slice(2)))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      const headingText = formatTitleSpacing(line.slice(3));
      const sectionMatch = headingText.match(/^(\d+)\.\s*(.*)/);
      if (sectionMatch) {
        const num = sectionMatch[1].padStart(2, '0');
        const title = sectionMatch[2];
        elements.push(
          <div key={`sec-${i}`} className="theory-section-header">
            <span className="theory-section-badge">{num}</span>
            <h4 className="theory-h2">{renderInlineFormatting(title)}</h4>
          </div>
        );
      } else {
        elements.push(
          <h4 key={`h2-${i}`} className="theory-h2">
            {renderInlineFormatting(headingText)}
          </h4>
        );
      }
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      const subHeading = formatTitleSpacing(line.slice(4));
      const isInvariant = /invariante/i.test(subHeading);
      const isTheorem = /teorema/i.test(subHeading);
      const isExchange = /intercambio|greedy-choice/i.test(subHeading);
      const isComplexity = /complejidad/i.test(subHeading);

      const hasSpecialTag = isInvariant || isTheorem || isExchange || isComplexity;
      const tagText = isInvariant
        ? (language === 'es' ? 'INVARIANTE' : 'INVARIANT')
        : isTheorem
        ? (language === 'es' ? 'TEOREMA' : 'THEOREM')
        : isExchange
        ? (language === 'es' ? 'INTERCAMBIO' : 'EXCHANGE')
        : isComplexity
        ? (language === 'es' ? 'COTAS' : 'BOUNDS')
        : null;

      elements.push(
        <div key={`h3-wrap-${i}`} className={`theory-h3-wrap ${hasSpecialTag ? (isInvariant ? 'is-invariant' : isTheorem ? 'is-theorem' : isExchange ? 'is-exchange' : 'is-complexity') : ''}`}>
          {tagText && <span className="theory-h3-tag">{tagText}</span>}
          <h5 className="theory-h3">{renderInlineFormatting(subHeading)}</h5>
        </div>
      );
      i++;
      continue;
    }

    // 6. Markdown Tables
    if (line.startsWith('|') && line.endsWith('|')) {
      if (i + 1 < lines.length && /^\|[\s\-:|]+\|$/.test(lines[i + 1].trim())) {
        const headerCells = line
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        i += 2; // skip header and separator row
        const dataRows: string[][] = [];
        while (i < lines.length && lines[i].trim().startsWith('|') && lines[i].trim().endsWith('|')) {
          const rowCells = lines[i]
            .trim()
            .split('|')
            .slice(1, -1)
            .map((c) => c.trim());
          dataRows.push(rowCells);
          i++;
        }
        elements.push(
          <div key={`tbl-${i}`} className="theory-table-container">
            <table className="theory-table">
              <thead>
                <tr>
                  {headerCells.map((h, hIdx) => (
                    <th key={hIdx}>{renderInlineFormatting(h)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((r, rIdx) => (
                  <tr key={rIdx}>
                    {r.map((c, cIdx) => (
                      <td key={cIdx}>{renderInlineFormatting(c)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 7. Callouts / Blockquotes (Theorems, Key Invariants)
    if (line.startsWith('>')) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''));
        i++;
      }
      elements.push(
        <blockquote key={`bq-${i}`} className="theory-callout">
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx} style={{ margin: qIdx > 0 ? '0.5rem 0 0 0' : 0 }}>
              {renderInlineFormatting(ql)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // 8. Unordered Lists
    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        const itemText = lines[i].trim().slice(2);
        items.push(<li key={`li-${i}`}>{renderInlineFormatting(itemText)}</li>);
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="theory-ul">
          {items}
        </ul>
      );
      continue;
    }

    // 9. Ordered Lists
    if (/^\d+\.\s/.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+\.\s/, '');
        items.push(<li key={`oli-${i}`}>{renderInlineFormatting(itemText)}</li>);
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="theory-ol">
          {items}
        </ol>
      );
      continue;
    }

    // 10. Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="theory-paragraph">
        {renderInlineFormatting(line)}
      </p>
    );
    i++;
  }

  return <div className="theory-markdown-container">{elements}</div>;
};
