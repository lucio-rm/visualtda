import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface DpRecurrenceSelfCheckProps {
  exerciseId: string;
}

export const DpRecurrenceSelfCheck: React.FC<DpRecurrenceSelfCheckProps> = ({ exerciseId }) => {
  const { language } = useLanguage();
  const storageKey = `vtda_dp_recurrence_${exerciseId}`;

  const [equation, setEquation] = useState<string>(() => {
    try {
      return sessionStorage.getItem(storageKey) || '';
    } catch {
      return '';
    }
  });

  useEffect(() => {
    try {
      if (equation) {
        sessionStorage.setItem(storageKey, equation);
      } else {
        sessionStorage.removeItem(storageKey);
      }
    } catch {
      // Storage access gracefully handled
    }
  }, [equation, storageKey]);

  // Loose, safe sanity check — never throws regardless of malformed characters
  const getValidationFeedback = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return {
        type: 'idle',
        message:
          language === 'es'
            ? 'Ingresá tu relación de recurrencia para verificar la coherencia de tu planteo inductivo.'
            : 'Type your recurrence relation to self-check your inductive subproblem formulation.'
      };
    }

    // Check bracket/parenthesis balance safely
    let parens = 0;
    let brackets = 0;
    for (const char of trimmed) {
      if (char === '(') parens++;
      else if (char === ')') parens--;
      else if (char === '[') brackets++;
      else if (char === ']') brackets--;

      if (parens < 0 || brackets < 0) {
        return {
          type: 'warning',
          message:
            language === 'es'
              ? 'Verificá los delimitadores: hay paréntesis o corchetes cerrados antes de abrir.'
              : 'Check delimiters: closed parentheses or brackets without matching opening.'
        };
      }
    }

    if (parens !== 0 || brackets !== 0) {
      return {
        type: 'warning',
        message:
          language === 'es'
            ? 'Delimitadores desbalanceados: asegurate de cerrar todos los paréntesis () y corchetes [].'
            : 'Unbalanced delimiters: make sure to close all parentheses () and brackets [].'
      };
    }

    if (!trimmed.includes('=')) {
      return {
        type: 'info',
        message:
          language === 'es'
            ? 'Formato sugerido: incluye el signo "=" (ej: OPT(i) = ... o dp[i] = ...).'
            : 'Suggested format: include "=" (e.g. OPT(i) = ... or dp[i] = ...).'
      };
    }

    const lower = trimmed.toLowerCase();
    const hasOptOrDp = lower.includes('opt') || lower.includes('dp');
    const hasOperator =
      lower.includes('max') ||
      lower.includes('min') ||
      lower.includes('+') ||
      lower.includes('-') ||
      lower.includes('*');

    if (hasOptOrDp && hasOperator) {
      return {
        type: 'success',
        message:
          language === 'es'
            ? '✓ Estructura de recurrencia válida (lado izquierdo, operador y subproblemas balanceados).'
            : '✓ Valid recurrence structure (left-hand side, operator, and balanced subproblems).'
      };
    }

    return {
      type: 'info',
      message:
        language === 'es'
          ? 'Estructura reconocida. Recordá contrastar tu caso inductivo con los casos base en la implementación.'
          : 'Structure recognized. Remember to pair your inductive case with base cases in code.'
    };
  };

  const feedback = getValidationFeedback(equation);

  return (
    <div
      className="card-panel dp-recurrence-card"
      style={{
        marginBottom: '1rem',
        padding: '0.85rem 1rem',
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--radius-md)',
        border: '1.5px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--accent-subtle)',
              color: 'var(--accent)',
              border: '1px solid var(--accent)'
            }}
          >
            {language === 'es' ? 'Auto-comprobación PD' : 'DP Self-Check'}
          </span>
          <h4 style={{ margin: 0, fontSize: '0.925rem' }}>
            {language === 'es' ? 'Borrador de Ecuación de Recurrencia' : 'Recurrence Relation Draft'}
          </h4>
        </div>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {language === 'es' ? 'Opcional (no calificado)' : 'Optional (not graded)'}
        </span>
      </div>

      {/* Clearly-formatted generic example ABOVE the input */}
      <div
        style={{
          margin: '0.4rem 0 0.6rem',
          padding: '0.45rem 0.75rem',
          backgroundColor: 'var(--surface-hover)',
          borderRadius: 'var(--radius-sm)',
          border: '1px dashed var(--border)',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)'
        }}
      >
        <span style={{ fontWeight: 600, color: 'var(--text)' }}>
          {language === 'es' ? 'Ejemplo de formato genérico: ' : 'Generic format example: '}
        </span>
        <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '0.85rem' }}>
          OPT(i) = max(OPT(i-1), valor_i + OPT(i-2))
        </code>
        <span style={{ marginLeft: '0.5rem' }}>
          {language === 'es' ? 'o' : 'or'}{' '}
          <code style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)', fontSize: '0.85rem' }}>
            dp[i][w] = min(dp[i-1][w], 1 + dp[i][w - c])
          </code>
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input
          type="text"
          value={equation}
          onChange={(e) => setEquation(e.target.value)}
          placeholder={
            language === 'es'
              ? 'Ej: OPT(i) = max(OPT(i-1), valor + OPT(i-2))'
              : 'E.g.: OPT(i) = max(OPT(i-1), value + OPT(i-2))'
          }
          style={{
            flex: 1,
            padding: '0.55rem 0.75rem',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.9rem',
            borderRadius: 'var(--radius-sm)',
            border: '1.5px solid var(--border)',
            backgroundColor: 'var(--canvas-bg)',
            color: 'var(--text)'
          }}
          aria-label={
            language === 'es'
              ? 'Borrador de ecuación de recurrencia'
              : 'Recurrence equation draft'
          }
          data-lpignore="true"
        />
        {equation && (
          <button
            type="button"
            onClick={() => setEquation('')}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface-hover)',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            {language === 'es' ? 'Limpiar' : 'Clear'}
          </button>
        )}
      </div>

      {/* Real-time safe feedback */}
      <div
        style={{
          marginTop: '0.45rem',
          fontSize: '0.8125rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          color:
            feedback.type === 'success'
              ? 'var(--success)'
              : feedback.type === 'warning'
              ? 'var(--warning)'
              : 'var(--text-muted)'
        }}
      >
        <span>{feedback.message}</span>
      </div>
    </div>
  );
};
