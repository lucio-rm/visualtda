import React, { useContext } from 'react';
import { LanguageContext } from '../../i18n/LanguageContext';
import { formatTitleSpacing } from '../../utils/textFormatting';

interface TheoryMarkdownProps {
  content: string;
  language?: 'es' | 'en';
}

function translateTheoryLine(text: string, lang: 'es' | 'en'): string {
  if (lang === 'es') return text;
  return text
    .replace(/# (.+): Análisis Teórico, Correctness y Complejidad/g, '# $1: Theoretical Analysis, Correctness, and Complexity')
    .replace(/# (.+) [—–] Teoría y Fundamentos/g, '# $1 — Theory and Foundations')
    .replace(/# (.+): Fundamento Teórico y Demostración/g, '# $1: Theoretical Foundations and Proof')
    .replace(/## 1\. Planteo del Problema/g, '## 1. Problem Statement')
    .replace(/## 2\. Estrategia Algorítmica/g, '## 2. Algorithmic Strategy')
    .replace(/## 3\. Demostración de Corrección \(Correctness\)/g, '## 3. Correctness Proof')
    .replace(/## 3\. Demostración de Corrección/g, '## 3. Correctness Proof')
    .replace(/## 4\. Análisis de Complejidad/g, '## 4. Complexity Analysis')
    .replace(/### ¿Por qué no Fuerza Bruta\?/g, '### Why Not Brute Force?')
    .replace(/### Invariante de Bucle \/ Recursión/g, '### Loop / Recursion Invariant')
    .replace(/### Invariante de Bucle/g, '### Loop Invariant')
    .replace(/### Pasos de Inducción:/g, '### Induction Steps:')
    .replace(/### Pasos de Inducción/g, '### Induction Steps')
    .replace(/### Complejidad Temporal:/g, '### Time Complexity:')
    .replace(/### Complejidad Espacial:/g, '### Space Complexity:')
    .replace(/### Complejidad Temporal/g, '### Time Complexity')
    .replace(/### Complejidad Espacial/g, '### Space Complexity')
    .replace(/### Argumento de Intercambio/g, '### Exchange Argument')
    .replace(/### Propiedad de Elección Voraz/g, '### Greedy-Choice Property')
    .replace(/### Subestructura Óptima/g, '### Optimal Substructure')
    .replace(/### Recurrencia y Casos Base/g, '### Recurrence and Base Cases')
    .replace(/### Garantía de 2-Aproximación/g, '### 2-Approximation Guarantee')
    .replace(/### Teorema de Reducción Polinomial/g, '### Polynomial Reduction Theorem')
    .replace(/\*\*Invariante\*\*:/g, '**Invariant**:')
    .replace(/\*\*Base\*\*:/g, '**Base Case**:')
    .replace(/\*\*Paso Inductivo\*\*:/g, '**Inductive Step**:')
    .replace(/\*\*Terminación\*\*:/g, '**Termination**:')
    .replace(/\*\*Teorema\*\*:/g, '**Theorem**:')
    .replace(/\*\*Demostración\*\*:/g, '**Proof**:')
    .replace(/\*\*Lema\*\*:/g, '**Lemma**:')
    .replace(/\*\*Corolario\*\*:/g, '**Corollary**:')
    .replace(/Teorema:/g, 'Theorem:')
    .replace(/Demostración:/g, 'Proof:')
    .replace(/En el peor caso,/g, 'In the worst case,')
    .replace(/En el mejor caso,/g, 'In the best case,')
    .replace(/por inducción sobre/g, 'by induction on')
    .replace(/Hipótesis inductiva/g, 'Inductive hypothesis')
    .replace(/Caso base/g, 'Base case')
    .replace(/Caso inductivo/g, 'Inductive case')
    .replace(/Paso inductivo/g, 'Inductive step')
    .replace(/Cota superior/g, 'Upper bound')
    .replace(/Cota inferior/g, 'Lower bound')
    .replace(/Teorema Maestro/g, 'Master Theorem')
    .replace(/Árbol de recursión/g, 'Recursion tree')
    .replace(/Entrada:/g, 'Input:')
    .replace(/Salida:/g, 'Output:')
    .replace(/Definición:/g, 'Definition:')
    .replace(/Propiedad:/g, 'Property:')
    .replace(/Observación:/g, 'Remark:');
}


// Cleanly replaces LaTeX symbols and formatting into standard mathematical Unicode typography
export function formatMathText(text: string): string {
  let formatted = text;

  // 1. Unnest \text{...}, \mathrm{...}, \mathbf{...}, \mathit{...}, \mathcal{...}
  for (let round = 0; round < 3; round++) {
    formatted = formatted.replace(/\\(?:text|mathrm|mathbf|mathit|mathcal)\{([^{}]+)\}/g, '$1');
  }

  // 2. Remove LaTeX environments (e.g. \begin{aligned}, \end{aligned})
  formatted = formatted.replace(/\\(?:begin|end)\{[a-zA-Z*]+\}/g, '');

  // 3. Mathematical symbol transformations
  const mathSymbols: [RegExp, string | ((match: string) => string)][] = [
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

    // Superscripts
    [/\^T\b/g, 'ᵀ'],
    [/\^2\b/g, '²'],
    [/\^3\b/g, '³'],
    [/\^k\b/g, 'ᵏ'],
    [/\^n\b/g, 'ⁿ'],
    [/\^m\b/g, 'ᵐ'],
    [/_\{([^{}]+)\}/g, '_$1']
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
  formatted = formatted.replace(/&/g, '');

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

export const TheoryMarkdown: React.FC<TheoryMarkdownProps> = ({ content, language: propLanguage }) => {
  const langContext = useContext(LanguageContext);
  const language = propLanguage || langContext?.language || 'es';
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const translatedLine = translateTheoryLine(rawLine, language);
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
      elements.push(
        <h4 key={`h2-${i}`} className="theory-h2">
          {renderInlineFormatting(formatTitleSpacing(line.slice(3)))}
        </h4>
      );
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h5 key={`h3-${i}`} className="theory-h3">
          {renderInlineFormatting(formatTitleSpacing(line.slice(4)))}
        </h5>
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
