// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { createRoot } from 'react-dom/client';
import { act } from 'react';
import { TheoryMarkdown, formatMathText } from '../src/components/common/TheoryMarkdown';

// @ts-expect-error React act environment declaration for happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('TheoryMarkdown & Mathematical Typography Engine (Mission V4 Section 23 & 43)', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  describe('formatMathText LaTeX translation', () => {
    it('unnests \\text and removes raw LaTeX braces for total inversions formula', () => {
      const input = '\\text{Total Inversiones} = \\text{Inv}_{\\text{izq}} + \\text{Inv}_{\\text{der}} + \\text{Inv}_{\\text{cruzadas}}';
      const output = formatMathText(input);
      expect(output).toBe('Total Inversiones = Inv_izq + Inv_der + Inv_cruzadas');
      expect(output).not.toContain('\\text');
    });

    it('cleans multiline \\begin{aligned} equations and converts symbols', () => {
      const input = `\\begin{aligned}
\\text{Maximizar} \\quad & z = \\mathbf{c}^T \\mathbf{x} = \\sum_{j=1}^n c_j x_j \\\\
\\text{Sujeto a} \\quad & A \\mathbf{x} \\le \\mathbf{b} \\\\
& \\mathbf{x} \\ge \\mathbf{0}
\\end{aligned}`;
      const output = formatMathText(input);
      expect(output).not.toContain('\\begin');
      expect(output).not.toContain('\\end');
      expect(output).not.toContain('\\mathbf');
      expect(output).toContain('z = cᵀ x = ∑_j=1ⁿ c_j x_j');
      expect(output).toContain('A x ≤ b');
      expect(output).toContain('x ≥ 0');
    });

    it('correctly maps Greek letters, logic arrows and sets', () => {
      const input = '\\Delta \\ge 0 \\implies \\theta \\in \\mathbb{R} \\iff x \\notin \\emptyset';
      const output = formatMathText(input);
      expect(output).toContain('Δ ≥ 0');
      expect(output).toContain('⟹');
      expect(output).toContain('θ ∈ ℝ');
      expect(output).toContain('⟺');
      expect(output).toContain('x ∉ ∅');
    });

    it('formats fractions, combinations and roots', () => {
      const input = '\\frac{n(n-1)}{2} + \\binom{n}{k} + \\sqrt{x}';
      const output = formatMathText(input);
      expect(output).toContain('(n(n-1) / 2)');
      expect(output).toContain('C(n, k)');
      expect(output).toContain('√(x)');
    });
  });

  describe('TheoryMarkdown Component DOM Rendering', () => {
    it('renders markdown tables as semantic HTML tables', async () => {
      const markdown = `
### Complejidad del Algoritmo

| Etapa | Operación | Costo |
|---|---|---|
| 1 | Ordenar tareas | $O(n \\log n)$ |
| 2 | Búsqueda binaria $p(j)$ | $O(n \\log n)$ |
| 3 | Llenar tabla DP | $O(n)$ |
`;

      const root = createRoot(container);
      await act(async () => {
        root.render(<TheoryMarkdown content={markdown} />);
      });

      const table = container.querySelector('.theory-table');
      expect(table).not.toBeNull();

      const headers = container.querySelectorAll('.theory-table th');
      expect(headers.length).toBe(3);
      expect(headers[0].textContent).toBe('Etapa');
      expect(headers[1].textContent).toBe('Operación');
      expect(headers[2].textContent).toBe('Costo');

      const rows = container.querySelectorAll('.theory-table tbody tr');
      expect(rows.length).toBe(3);
      expect(rows[0].textContent).toContain('Ordenar tareas');
      expect(rows[2].textContent).toContain('Llenar tabla DP');
    });

    it('renders blockquote callouts for theorems and invariants', async () => {
      const markdown = `
> **Teorema de Aproximación**: El conjunto retornado satisface $|C| \\le 2 \\cdot |C^*|$.
> Ningún algoritmo polinomial puede mejorar la cota salvo que P = NP.
`;

      const root = createRoot(container);
      await act(async () => {
        root.render(<TheoryMarkdown content={markdown} />);
      });

      const callout = container.querySelector('.theory-callout');
      expect(callout).not.toBeNull();
      expect(callout?.textContent).toContain('Teorema de Aproximación');
      expect(callout?.textContent).toContain('≤');
      expect(callout?.textContent).not.toContain('\\le');
    });

    it('renders block math equations cleanly', async () => {
      const markdown = `
$$
\\text{OPT}(j) = \\max(\\text{OPT}(j-1), v_j + \\text{OPT}(p(j)))
$$
`;

      const root = createRoot(container);
      await act(async () => {
        root.render(<TheoryMarkdown content={markdown} />);
      });

      const blockEquation = container.querySelector('.theory-block-equation');
      expect(blockEquation).not.toBeNull();
      expect(blockEquation?.textContent).toContain('OPT(j) = max(OPT(j-1), v_j + OPT(p(j)))');
      expect(blockEquation?.textContent).not.toContain('\\text');
    });
  });
});
