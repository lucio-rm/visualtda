import { describe, it, expect } from 'vitest';
import { highlightPythonCode } from '../src/utils/pythonSyntaxHighlighter';

describe('PythonSyntaxHighlighter', () => {
  it('highlights keywords correctly', () => {
    const code = 'def resolver(n):\n    if n <= 1:\n        return n\n    for i in range(n):\n        pass';
    const html = highlightPythonCode(code);
    expect(html).toContain('<span class="tok-kw">def</span>');
    expect(html).toContain('<span class="tok-fn-decl">resolver</span>');
    expect(html).toContain('<span class="tok-kw">if</span>');
    expect(html).toContain('<span class="tok-kw">return</span>');
    expect(html).toContain('<span class="tok-kw">for</span>');
    expect(html).toContain('<span class="tok-kw">in</span>');
    expect(html).toContain('<span class="tok-builtin">range</span>');
    expect(html).toContain('<span class="tok-kw">pass</span>');
  });

  it('highlights function calls and numbers', () => {
    const code = 'total = calculate_cost(10, 20.5)';
    const html = highlightPythonCode(code);
    expect(html).toContain('<span class="tok-fn-call">calculate_cost</span>');
    expect(html).toContain('<span class="tok-num">10</span>');
    expect(html).toContain('<span class="tok-num">20.5</span>');
  });

  it('highlights comments and strings with HTML escaping', () => {
    const code = '# Comentario con <tag> & "comillas"\nmsg = "Hola <mundo> & \'test\'"';
    const html = highlightPythonCode(code);
    expect(html).toContain('<span class="tok-comment"># Comentario con &lt;tag&gt; &amp; &quot;comillas&quot;</span>');
    expect(html).toContain('<span class="tok-str">&quot;Hola &lt;mundo&gt; &amp; &#039;test&#039;&quot;</span>');
  });

  it('highlights booleans, None and builtins', () => {
    const code = 'flag = True\nval = None\nm = min(items)';
    const html = highlightPythonCode(code);
    expect(html).toContain('<span class="tok-const">True</span>');
    expect(html).toContain('<span class="tok-const">None</span>');
    expect(html).toContain('<span class="tok-builtin">min</span>');
  });

  it('handles empty code and trailing newlines gracefully', () => {
    expect(highlightPythonCode('')).toBe('');
    const res = highlightPythonCode('x = 1\n');
    expect(res).toContain('tok-var');
    expect(res.endsWith('\n')).toBe(true);
  });
});
