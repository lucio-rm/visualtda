import React from 'react';
import { ExerciseMetadata } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { ExerciseHeaderIllustration } from './illustrations/ExerciseHeaderIllustration';
import { getExerciseInsight } from '../engine/exerciseContextInsights';

interface DiscoverViewProps {
  exercise: ExerciseMetadata;
  onProceedToSolve: () => void;
  children?: React.ReactNode;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  exercise,
  onProceedToSolve,
  children
}) => {
  const { language, t } = useLanguage();
  const [isNarrativeCollapsed, setIsNarrativeCollapsed] = React.useState<boolean>(false);
  const insight = getExerciseInsight(exercise.id, exercise.categoryId);

  return (
    <section className="phase-view discover-view" aria-labelledby="discover-heading">
      <div className="view-intro discover-header-card">
        <div className="discover-intro-content">
          <h3 id="discover-heading" className="view-title">
            {language === 'es' ? '1. Definición Formal y Espacio de Búsqueda' : '1. Formal Definition & State Space'}
          </h3>
          <p className="view-lead">
            {language === 'es'
              ? 'Analizá la estructura formal del problema, su contexto teórico y experimentá con instancias interactivas para caracterizar las restricciones del dominio antes de diseñar el algoritmo.'
              : 'Analyze the formal structure of the problem, its theoretical context, and experiment with interactive instances to characterize domain constraints before designing the algorithm.'}
          </p>
        </div>
        <div className="discover-header-illustration-wrapper" aria-hidden="false">
          <ExerciseHeaderIllustration exerciseId={exercise.id} problemId={exercise.problemId} />
        </div>
      </div>

      <div className={`discover-grid ${isNarrativeCollapsed ? 'fullwidth-playground' : ''}`}>
        {!isNarrativeCollapsed && (
          <div className="problem-narrative-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ margin: 0 }}>{language === 'es' ? 'Especificación del Problema' : 'Problem Specification'}</h4>
              <button
                type="button"
                className="btn-toggle-narrative"
                onClick={() => setIsNarrativeCollapsed(true)}
                title={language === 'es' ? 'Ocultar enunciado y maximizar visualizador a ancho completo' : 'Hide problem narrative and expand visualizer to full width'}
                style={{
                  background: 'var(--surface-hover)',
                  border: '1px solid var(--border)',
                  borderRadius: '4px',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.8rem',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
              >
                ⇥ {language === 'es' ? 'Ocultar Problema' : 'Hide Problem'}
              </button>
            </div>
            <p className="problem-statement">{t(exercise.subtitle)}</p>

            <div className="formal-spec-box" style={{ margin: '1rem 0', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>
                  {language === 'es' ? 'Entrada Formal (Input):' : 'Formal Input:'}
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                  {t(insight.formalInput)}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block' }}>
                  {language === 'es' ? 'Salida Esperada (Output):' : 'Expected Output:'}
                </span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
                  {t(insight.formalOutput)}
                </span>
              </div>
            </div>

            <div className="academic-context-box" style={{ marginTop: '1rem' }}>
              <h5 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.5rem' }}>
                {language === 'es' ? 'Contexto y Perspectiva Algorítmica:' : 'Context & Algorithmic Perspective:'}
              </h5>
              <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                {t(insight.historicalContext)}
              </div>
              <div style={{ fontSize: '0.875rem', lineHeight: 1.6, color: 'var(--text)', background: 'var(--surface)', borderLeft: '3px solid var(--accent)', padding: '0.5rem 0.75rem', borderRadius: '0 var(--radius-sm) var(--radius-sm) 0', marginBottom: '0.75rem' }}>
                <strong>{language === 'es' ? 'Principio central: ' : 'Core principle: '}</strong>
                {t(insight.algorithmicPerspective)}
              </div>
              <div style={{ fontSize: '0.85rem', lineHeight: 1.5, color: 'var(--error)', background: 'var(--error-bg)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <strong>{language === 'es' ? 'Trampa de la intuición ingenua: ' : 'Naive heuristic trap: '}</strong>
                {t(insight.naiveTrapWarning)}
              </div>
            </div>
          </div>
        )}

        <div className={`interactive-playground-card ${isNarrativeCollapsed ? 'expanded-fullwidth' : ''}`}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h4 style={{ margin: 0 }}>{language === 'es' ? 'Espacio de Experimentación Interactiva' : 'Interactive Experimentation Playground'}</h4>
            <button
              type="button"
              className="btn-toggle-narrative"
              onClick={() => setIsNarrativeCollapsed(!isNarrativeCollapsed)}
              title={isNarrativeCollapsed
                ? (language === 'es' ? 'Mostrar enunciado del problema' : 'Show problem statement')
                : (language === 'es' ? 'Ocultar enunciado y expandir visualizador a ancho completo' : 'Hide problem and expand playground')}
              style={{
                background: isNarrativeCollapsed ? 'var(--accent)' : 'var(--surface-hover)',
                color: isNarrativeCollapsed ? 'var(--accent-contrast)' : 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                padding: '0.25rem 0.65rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              {isNarrativeCollapsed ? (
                <>⇤ {language === 'es' ? 'Mostrar Problema' : 'Show Problem'}</>
              ) : (
                <>⇥ {language === 'es' ? 'Ocultar Problema' : 'Hide Problem'}</>
              )}
            </button>
          </div>
          {children || (
            <div className="playground-placeholder">
              <p>
                {language === 'es'
                  ? 'Simulador interactivo del estado del problema.'
                  : 'Interactive problem state simulator.'}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="phase-footer-action">
        <button
          type="button"
          className="btn-primary"
          onClick={onProceedToSolve}
        >
          {language === 'es' ? 'Comenzar Implementación en Resolver →' : 'Begin Implementation in Solve →'}
        </button>
      </div>
    </section>
  );
};

