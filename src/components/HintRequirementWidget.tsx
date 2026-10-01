import React from 'react';
import { HintUnlockStatus } from '../utils/hintGating';

interface HintRequirementWidgetProps {
  status: HintUnlockStatus;
  language: 'es' | 'en';
}

export const HintRequirementWidget: React.FC<HintRequirementWidgetProps> = ({
  status,
  language
}) => {
  if (status.isUnlocked) {
    return (
      <span
        className="badge-hint-unlocked"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'var(--success)',
          background: 'var(--success-bg)',
          padding: '0.25rem 0.65rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)'
        }}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span>
          {status.isInstructorBypassed
            ? (language === 'es' ? 'Modo Docente' : 'Instructor Mode')
            : (language === 'es' ? 'Desbloqueada por esfuerzo' : 'Unlocked by effort')}
        </span>
      </span>
    );
  }

  return (
    <div
      className="hint-requirement-card"
      style={{
        marginTop: '0.6rem',
        padding: '1rem 1.15rem',
        background: 'var(--surface-hover)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.875rem',
        lineHeight: 1.55
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600,
          color: 'var(--text)',
          marginBottom: '0.45rem',
          fontSize: '0.875rem'
        }}
      >
        <span
          style={{
            padding: '0.15rem 0.45rem',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--text-muted)'
          }}
        >
          {language === 'es' ? 'Condición de Esfuerzo' : 'Effort Requirement'}
        </span>
        <span>
          {language === 'es'
            ? `Pista ${status.hintIndex + 1}`
            : `Hint ${status.hintIndex + 1}`}
        </span>
      </div>

      <p
        style={{
          margin: '0 0 0.75rem 0',
          color: 'var(--text-muted)',
          fontSize: '0.8125rem'
        }}
      >
        {language === 'es'
          ? 'Para acceder a esta pista debes programar e intentar resolver el problema en el editor:'
          : 'To access this hint, you must write code and attempt solving the problem in the editor:'}
      </p>

      {/* Progress Bars Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
        {/* Metric 1: Attempts */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.25rem',
              fontSize: '0.8125rem'
            }}
          >
            <span>
              {language === 'es' ? 'Intentos de prueba ejecutados' : 'Test runs executed'}:
            </span>
            <span
              style={{
                fontWeight: 600,
                color: status.attemptsFulfilled ? 'var(--success)' : 'var(--text)'
              }}
            >
              {status.currentAttempts} / {status.requiredAttempts}{' '}
              {status.attemptsFulfilled ? '✓' : ''}
            </span>
          </div>
          <div
            style={{
              height: '7px',
              background: 'var(--border)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${status.attemptsProgress}%`,
                background: status.attemptsFulfilled ? 'var(--success)' : 'var(--accent)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Metric 2: Meaningful Code Lines */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.25rem',
              fontSize: '0.8125rem'
            }}
          >
            <span>
              {language === 'es' ? 'Líneas de lógica algorítmica agregadas' : 'Algorithmic logic lines added'}:
            </span>
            <span
              style={{
                fontWeight: 600,
                color: status.linesFulfilled ? 'var(--success)' : 'var(--text)'
              }}
            >
              {status.currentLines} / {status.requiredLines}{' '}
              {status.linesFulfilled ? '✓' : ''}
            </span>
          </div>
          <div
            style={{
              height: '7px',
              background: 'var(--border)',
              borderRadius: '4px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${status.linesProgress}%`,
                background: status.linesFulfilled ? 'var(--success)' : 'var(--accent)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: '0.65rem',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
          lineHeight: 1.4
        }}
      >
        {language === 'es'
          ? 'Nota: Se excluyen comentarios (#), líneas vacías, prints y repeticiones de código.'
          : 'Note: Comments (#), blank lines, prints, and duplicate code are excluded.'}
      </div>
    </div>
  );
};
