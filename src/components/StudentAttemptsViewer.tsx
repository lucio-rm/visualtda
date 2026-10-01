import React, { useState } from 'react';
import { StudentAttemptRecord } from '../utils/studentAttempts';

interface StudentAttemptsViewerProps {
  attempts: StudentAttemptRecord[];
  language: 'es' | 'en';
  onRestoreCode?: (code: string) => void;
  approvedSolution?: StudentAttemptRecord | null;
}

export const StudentAttemptsViewer: React.FC<StudentAttemptsViewerProps> = ({
  attempts,
  language,
  onRestoreCode,
  approvedSolution
}) => {
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(() => {
    if (approvedSolution) return approvedSolution.id;
    return attempts.length > 0 ? attempts[0].id : null;
  });

  const selectedAttempt = attempts.find((a) => a.id === selectedAttemptId) || approvedSolution || attempts[0] || null;

  if (attempts.length === 0 && !approvedSolution) {
    return (
      <div
        className="empty-attempts-state"
        style={{
          padding: '2rem',
          textAlign: 'center',
          background: 'var(--surface, #ffffff)',
          border: '1px dashed var(--border, #cbd5e1)',
          borderRadius: 'var(--radius-md, 6px)',
          color: 'var(--text-muted, #64748b)'
        }}
      >
        <div style={{ display: 'inline-flex', marginBottom: '0.6rem', color: 'var(--text-muted)' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
          </svg>
        </div>
        <h5 style={{ margin: '0 0 0.35rem 0', color: 'var(--text, #1e293b)' }}>
          {language === 'es' ? 'Aún no registraste intentos' : 'No recorded attempts yet'}
        </h5>
        <p style={{ margin: 0, fontSize: '0.82rem' }}>
          {language === 'es'
            ? 'Escribe tu solución en el editor de la fase Resolver y presiona "Ejecutar pruebas" para registrar tus intentos.'
            : 'Write your solution in the Solve editor and click "Run Tests" to record attempts.'}
        </p>
      </div>
    );
  }

  return (
    <div
      className="student-attempts-container"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        marginTop: '0.5rem'
      }}
    >
      {/* Approved Solution Highlight Banner if present */}
      {approvedSolution && (
        <div
          className="approved-solution-banner"
          style={{
            padding: '0.75rem 1rem',
            background: 'rgba(22, 163, 74, 0.08)',
            border: '1px solid rgba(22, 163, 74, 0.3)',
            borderRadius: 'var(--radius-md, 6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem', color: 'var(--success, #16a34a)' }}>✓</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--success, #16a34a)' }}>
                {language === 'es' ? 'Solución Aprobada por Tests' : 'Solution Passed by Tests'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #64748b)' }}>
                {approvedSolution.passedTestsCount} / {approvedSolution.totalTestsCount}{' '}
                {language === 'es' ? 'casos superados' : 'cases passed'} ·{' '}
                {new Date(approvedSolution.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
            onClick={() => setSelectedAttemptId(approvedSolution.id)}
          >
            {language === 'es' ? 'Ver esta solución' : 'View this solution'}
          </button>
        </div>
      )}

      {/* Attempts List & Code Split View */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: attempts.length > 1 ? 'minmax(200px, 1fr) minmax(300px, 2fr)' : '1fr',
          gap: '1rem'
        }}
      >
        {/* Attempts Sidebar (if multiple) */}
        {attempts.length > 1 && (
          <div
            className="attempts-sidebar"
            style={{
              maxHeight: '340px',
              overflowY: 'auto',
              border: '1px solid var(--border, #cbd5e1)',
              borderRadius: 'var(--radius-md, 6px)',
              background: 'var(--surface, #ffffff)',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div
              style={{
                padding: '0.5rem 0.75rem',
                borderBottom: '1px solid var(--border, #cbd5e1)',
                fontWeight: 600,
                fontSize: '0.75rem',
                color: 'var(--text-muted, #64748b)',
                textTransform: 'uppercase',
                letterSpacing: '0.04em'
              }}
            >
              {language === 'es' ? 'Historial de Ejecuciones' : 'Execution History'} ({attempts.length})
            </div>
            {attempts.map((att, idx) => {
              const attemptNumber = attempts.length - idx;
              const isSelected = selectedAttempt?.id === att.id;
              return (
                <button
                  key={att.id}
                  type="button"
                  onClick={() => setSelectedAttemptId(att.id)}
                  style={{
                    padding: '0.6rem 0.75rem',
                    textAlign: 'left',
                    background: isSelected ? 'var(--surface-hover, #f1f5f9)' : 'transparent',
                    border: 'none',
                    borderBottom: '1px solid var(--border, #e2e8f0)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem',
                    borderLeft: isSelected ? '3px solid var(--accent, #3b82f6)' : '3px solid transparent'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text, #1e293b)' }}>
                      {language === 'es' ? `Intento #${attemptNumber}` : `Attempt #${attemptNumber}`}
                    </span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        padding: '0.1rem 0.35rem',
                        borderRadius: '3px',
                        background: att.passed ? 'rgba(22, 163, 74, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: att.passed ? 'var(--success, #16a34a)' : 'var(--error, #ef4444)'
                      }}
                    >
                      {att.passed
                        ? (language === 'es' ? 'Aprobado' : 'Passed')
                        : `${att.passedTestsCount}/${att.totalTestsCount}`}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted, #64748b)' }}>
                    {new Date(att.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · {att.meaningfulLinesCount} {language === 'es' ? 'línas' : 'lines'}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Selected Attempt Code Display */}
        <div
          className="selected-attempt-panel"
          style={{
            border: '1px solid var(--border, #cbd5e1)',
            borderRadius: 'var(--radius-md, 6px)',
            background: 'var(--surface, #ffffff)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          {selectedAttempt ? (
            <>
              <div
                style={{
                  padding: '0.6rem 0.85rem',
                  borderBottom: '1px solid var(--border, #cbd5e1)',
                  background: 'var(--surface-hover, #f8fafc)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}
              >
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.8rem', color: 'var(--text, #1e293b)' }}>
                    {language === 'es' ? 'Código Ejecutado' : 'Executed Code'}
                  </span>
                  <span style={{ fontSize: '0.73rem', color: 'var(--text-muted, #64748b)', marginLeft: '0.5rem' }}>
                    ({selectedAttempt.passedTestsCount} / {selectedAttempt.totalTestsCount} {language === 'es' ? 'tests' : 'tests'} · {new Date(selectedAttempt.timestamp).toLocaleString()})
                  </span>
                </div>
                {onRestoreCode && (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.6rem' }}
                    onClick={() => onRestoreCode(selectedAttempt.code)}
                  >
                    {language === 'es' ? 'Restaurar en Editor' : 'Restore in Editor'}
                  </button>
                )}
              </div>
              <pre
                style={{
                  margin: 0,
                  padding: '0.85rem 1rem',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: '0.82rem',
                  lineHeight: 1.5,
                  overflowX: 'auto',
                  maxHeight: '380px',
                  background: 'var(--bg, #f8fafc)',
                  color: 'var(--text, #1e293b)'
                }}
              >
                <code>{selectedAttempt.code}</code>
              </pre>
            </>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
              {language === 'es' ? 'Selecciona un intento' : 'Select an attempt'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
