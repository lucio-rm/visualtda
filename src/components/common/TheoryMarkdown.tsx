import React from 'react';

interface TheoryMarkdownProps {
  content: string;
}

// Cleanly replaces LaTeX symbols into standard Unicode mathematical typography
function formatMathText(text: string): string {
  return text
    .replace(/\\le\b/g, '≤')
    .replace(/\\ge\b/g, '≥')
    .replace(/\\ne\b/g, '≠')
    .replace(/\\in\b/g, '∈')
    .replace(/\\notin\b/g, '∉')
    .replace(/\\times\b/g, '×')
    .replace(/\\cdot\b/g, '·')
    .replace(/\\dots\b/g, '…')
    .replace(/\\approx\b/g, '≈')
    .replace(/\\forall\b/g, '∀')
    .replace(/\\exists\b/g, '∃')
    .replace(/\\sum\b/g, '∑')
    .replace(/\\subset\b/g, '⊂')
    .replace(/\\subseteq\b/g, '⊆')
    .replace(/\\cup\b/g, '∪')
    .replace(/\\cap\b/g, '∩')
    .replace(/\\emptyset\b/g, '∅')
    .replace(/\\Theta\b/g, 'Θ')
    .replace(/\\Omega\b/g, 'Ω')
    .replace(/\\alpha\b/g, 'α')
    .replace(/\\beta\b/g, 'β')
    .replace(/\\gamma\b/g, 'γ')
    .replace(/\\delta\b/g, 'δ')
    .replace(/\\epsilon\b/g, 'ε')
    .replace(/\\lambda\b/g, 'λ')
    .replace(/\\binom\{([^}]+)\}\{([^}]+)\}/g, 'C($1, $2)')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)');
}

function renderInlineFormatting(line: string): React.ReactNode[] {
  // Regex to match math `$..$`, code `` `..` ``, bold `**..**`
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

export const TheoryMarkdown: React.FC<TheoryMarkdownProps> = ({ content }) => {
  if (!content) return null;

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const rawLine = lines[i];
    const line = rawLine.trim();

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
        mathContent += ' ' + lines[i].trim();
        i++;
      }
      if (i < lines.length) {
        mathContent += ' ' + lines[i].trim().replace(/\$\$/, '');
        i++;
      }
      elements.push(
        <div key={`mathblk-${i}`} className="theory-block-equation">
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
          {renderInlineFormatting(line.slice(2))}
        </h3>
      );
      i++;
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h4 key={`h2-${i}`} className="theory-h2">
          {renderInlineFormatting(line.slice(3))}
        </h4>
      );
      i++;
      continue;
    }
    if (line.startsWith('### ')) {
      elements.push(
        <h5 key={`h3-${i}`} className="theory-h3">
          {renderInlineFormatting(line.slice(4))}
        </h5>
      );
      i++;
      continue;
    }

    // 6. Unordered Lists
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

    // 7. Ordered Lists
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

    // 8. Regular paragraph
    elements.push(
      <p key={`p-${i}`} className="theory-paragraph">
        {renderInlineFormatting(line)}
      </p>
    );
    i++;
  }

  return <div className="theory-markdown-container">{elements}</div>;
};
