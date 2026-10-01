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
          gap: '0.35rem',
          fontSize: '0.72rem',
          fontWeight: 600,
          color: 'var(--success, #16a34a)',
          background: 'rgba(22, 163, 74, 0.1)',
          padding: '0.15rem 0.5rem',
          borderRadius: 'var(--radius-sm, 4px)',
          border: '1px solid rgba(22, 163, 74, 0.25)'
        }}
      >
        <span>✓</span>
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
        marginTop: '0.5rem',
        padding: '0.85rem 1rem',
        background: 'var(--surface-hover, #f8fafc)',
        border: '1px solid var(--border, #cbd5e1)',
        borderRadius: 'var(--radius-md, 6px)',
        fontSize: '0.8rem',
        lineHeight: 1.5
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontWeight: 600,
          color: 'var(--text, #1e293b)',
          marginBottom: '0.4rem'
        }}
      >
        <span>🔒</span>
        <span>
          {language === 'es'
            ? `Pista ${status.hintIndex + 1} Bloqueada — Desbloqueo por Esfuerzo`
            : `Hint ${status.hintIndex + 1} Locked — Effort-Gated`}
        </span>
      </div>

      <p
        style={{
          margin: '0 0 0.6rem 0',
          color: 'var(--text-muted, #64748b)',
          fontSize: '0.75rem'
        }}
      >
        {language === 'es'
          ? 'Para acceder a esta pista debes programar e intentar resolver el problema en el editor:'
          : 'To access this hint, you must write code and attempt solving the problem in the editor:'}
      </p>

      {/* Progress Bars Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {/* Metric 1: Attempts */}
        <div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '0.2rem',
              fontSize: '0.73rem'
            }}
          >
            <span>
              🎯 {language === 'es' ? 'Intentos de prueba ejecutados' : 'Test runs executed'}:
            </span>
            <span
              style={{
                fontWeight: 600,
                color: status.attemptsFulfilled ? 'var(--success, #16a34a)' : 'var(--text, #1e293b)'
              }}
            >
              {status.currentAttempts} / {status.requiredAttempts}{' '}
              {status.attemptsFulfilled ? '✓' : ''}
            </span>
          </div>
          <div
            style={{
              height: '6px',
              background: 'var(--border, #e2e8f0)',
              borderRadius: '3px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${status.attemptsProgress}%`,
                background: status.attemptsFulfilled ? 'var(--success, #16a34a)' : 'var(--accent, #3b82f6)',
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
              marginBottom: '0.2rem',
              fontSize: '0.73rem'
            }}
          >
            <span>
              💻 {language === 'es' ? 'Líneas de lógica agregadas' : 'Logic lines added'}:
            </span>
            <span
              style={{
                fontWeight: 600,
                color: status.linesFulfilled ? 'var(--success, #16a34a)' : 'var(--text, #1e293b)'
              }}
            >
              {status.currentLines} / {status.requiredLines}{' '}
              {status.linesFulfilled ? '✓' : ''}
            </span>
          </div>
          <div
            style={{
              height: '6px',
              background: 'var(--border, #e2e8f0)',
              borderRadius: '3px',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${status.linesProgress}%`,
                background: status.linesFulfilled ? 'var(--success, #16a34a)' : 'var(--accent, #3b82f6)',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: '0.5rem',
          fontSize: '0.7rem',
          color: 'var(--text-muted, #64748b)',
          fontStyle: 'italic'
        }}
      >
        {language === 'es'
          ? '* Se excluyen comentarios (#), líneas vacías, prints y código repetido.'
          : '* Comments (#), empty lines, prints, and repeated lines are excluded.'}
      </div>
    </div>
  );
};
