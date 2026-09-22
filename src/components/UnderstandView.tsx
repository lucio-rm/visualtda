import React, { useState } from 'react';
import { ExerciseMetadata } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useInstructorMode } from '../context/InstructorModeContext';
import { TheoryMarkdown } from './common/TheoryMarkdown';

interface UnderstandViewProps {
  exercise: ExerciseMetadata;
  canonicalPython: string;
  pseudocode: string;
  correctnessExplanation: string;
  timeComplexity: string;
  spaceComplexity: string;
  visualizerSlot?: React.ReactNode;
  solutionUnlocked?: boolean;
  onGoToSolve?: () => void;
}

export const UnderstandView: React.FC<UnderstandViewProps> = ({
  exercise,
  canonicalPython,
  pseudocode,
  correctnessExplanation,
  timeComplexity,
  spaceComplexity,
  visualizerSlot,
  solutionUnlocked = false,
  onGoToSolve
}) => {
  const { t, dict } = useLanguage();
  const { isInstructorMode } = useInstructorMode();
  const [codeMode, setCodeMode] = useState<'python' | 'pseudocode'>('python');

  const canViewCanonicalPython = solutionUnlocked || isInstructorMode;

  return (
    <section className="phase-view understand-view" aria-labelledby="understand-heading">
      <div className="view-intro">
        <h3 id="understand-heading" className="view-title">
          {t(dict.understandTitle)}
        </h3>
        <p className="view-lead">
          {t(dict.understandLead)}
          {' '}<strong>{t(exercise.title)}</strong>.
        </p>
      </div>

      <div className="understand-grid">
        {/* Visualizer and Timeline area */}
        <div className="understand-visualizer-container">
          <div className="card-panel">
            <h4>{t(dict.understandVisualizerHeading)}</h4>
            {visualizerSlot || (
              <div className="visualizer-slot-placeholder">
                <p>{t(dict.understandVisualizerPlaceholder)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Code & Pseudocode toggle card */}
        <div className="understand-code-container">
          <div className="card-panel">
            <div className="code-view-header">
              <h4>{t(dict.understandCanonicalHeading)}</h4>
              <div className="code-toggle-group" role="group" aria-label={t(dict.codeToggleLabel)}>
                <button
                  type="button"
                  className={`btn-code-toggle ${codeMode === 'python' ? 'active' : ''}`}
                  onClick={() => setCodeMode('python')}
                  aria-pressed={codeMode === 'python'}
                >
                  {t(dict.understandPython3)}
                </button>
                <button
                  type="button"
                  className={`btn-code-toggle ${codeMode === 'pseudocode' ? 'active' : ''}`}
                  onClick={() => setCodeMode('pseudocode')}
                  aria-pressed={codeMode === 'pseudocode'}
                >
                  {t(dict.understandPseudocode)}
                </button>
              </div>
            </div>

            {codeMode === 'python' && !canViewCanonicalPython ? (
              <div className="solution-locked-card" style={{ padding: '2rem', textAlign: 'center', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🔒</div>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--text)' }}>Solución Canónica en Python Bloqueada</h4>
                <p style={{ maxWidth: '520px', margin: '0 auto 1.25rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Para acceder a la implementación de referencia oficial en Python, primero debés superar los casos de prueba automatizados en la fase <strong>Resolver</strong> (o activar el <strong>Modo Docente 🎓</strong> en la barra superior).
                </p>
                {onGoToSolve && (
                  <button type="button" className="btn-primary" onClick={onGoToSolve}>
                    Ir a Resolver el Ejercicio →
                  </button>
                )}
              </div>
            ) : (
              <pre className="canonical-code-display">
                <code>{codeMode === 'python' ? canonicalPython : pseudocode}</code>
              </pre>
            )}
          </div>
        </div>

        {/* Correctness & Complexity Analysis Cards */}
        <div className="understand-theory-row">
          <div className="card-panel theory-card">
            <h4>{t(dict.understandCorrectnessHeading)}</h4>
            <div className="theory-body">
              <TheoryMarkdown content={correctnessExplanation} />
            </div>
          </div>

          <div className="card-panel complexity-card">
            <h4>{t({ es: 'Análisis de Complejidad y Cotas', en: 'Complexity Analysis & Bounds' })}</h4>
            <div className="complexity-grid">
              <div className="complexity-item">
                <span className="complexity-label">{t(dict.understandTimeComplexity)}</span>
                <code className="complexity-value">{timeComplexity}</code>
              </div>
              <div className="complexity-item">
                <span className="complexity-label">{t(dict.understandSpaceComplexity)}</span>
                <code className="complexity-value">{spaceComplexity}</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
