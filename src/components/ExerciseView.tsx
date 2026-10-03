import React, { useState } from 'react';
import { ExerciseMetadata, ExercisePhase, formatTechniqueLabel } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useInstructorMode } from '../context/InstructorModeContext';
import { useStudentProgress } from '../context/StudentProgressContext';
import { recordLegitimateExercisePass, recordHonestSkipPass } from '../utils/cryptoAuth';
import { PhaseSwitcher } from './PhaseSwitcher';
import { DiscoverView } from './DiscoverView';
import { SolveView } from './SolveView';
import { UnderstandView } from './UnderstandView';

import { formatTitleSpacing } from '../utils/textFormatting';

interface ExerciseViewProps {
  exercise: ExerciseMetadata;
  initialPhase?: ExercisePhase;
  onBackToCatalog: () => void;
  onSelectExercise?: (exerciseId: string) => void;
  // Optional slots/data for specific exercises
  visualizerSlot?: React.ReactNode;
  discoverPlaygroundSlot?: React.ReactNode;
  canonicalPython?: string;
  pseudocode?: string;
  correctnessExplanation?: string;
  timeComplexity?: string;
  spaceComplexity?: string;
}

export const ExerciseView: React.FC<ExerciseViewProps> = ({
  exercise,
  initialPhase,
  onBackToCatalog,
  onSelectExercise,
  visualizerSlot,
  discoverPlaygroundSlot,
  canonicalPython = '# Solución oficial\ndef resolver(n):\n    return []\n',
  pseudocode = 'ALGORITMO Resolver(n)\n  PARA cada fila de 1 a n:\n    SI posición es segura:\n      colocar elemento\n',
  correctnessExplanation = 'El algoritmo garantiza que ninguna decisión viole las restricciones impuestas por decisiones previas, podando de forma exhaustiva las ramas inviables.',
  timeComplexity = 'O(N!)',
  spaceComplexity = 'O(N)'
}) => {
  const { t, dict, language } = useLanguage();
  const { isInstructorMode } = useInstructorMode();
  const { isCompleted, markCompleted, markExploring, markAttempted, markPassed, getExerciseState } = useStudentProgress();
  const currentState = getExerciseState(exercise.id);
  const exerciseCompleted = isCompleted(exercise.id);
  const [phase, setPhase] = useState<ExercisePhase>(initialPhase || 'discover');
  const [solutionUnlocked, setSolutionUnlocked] = useState(false);
  const isEffectiveUnlocked = exerciseCompleted || solutionUnlocked || isInstructorMode;
  const [showFrictionModal, setShowFrictionModal] = useState(false);

  React.useEffect(() => {
    const nextPhase = initialPhase || 'discover';
    if (nextPhase === 'understand' && !isEffectiveUnlocked) {
      setShowFrictionModal(true);
      setPhase('discover');
    } else {
      setPhase(nextPhase);
    }
    setSolutionUnlocked(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [exercise.id, initialPhase]);

  React.useEffect(() => {
    if (currentState === 'unseen') {
      markExploring(exercise.id);
    }
  }, [exercise.id, currentState, markExploring]);

  const handlePhaseChange = (newPhase: ExercisePhase) => {
    if (newPhase === 'understand' && !isEffectiveUnlocked) {
      setShowFrictionModal(true);
      return;
    }
    if (newPhase === 'solve') {
      markAttempted(exercise.id);
    }
    setPhase(newPhase);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSolveSuccess = () => {
    recordLegitimateExercisePass(exercise.id);
    setSolutionUnlocked(true);
    markPassed(exercise.id);
    markCompleted(exercise.id);
  };

  const handleSkipToUnderstand = () => {
    recordHonestSkipPass(exercise.id);
    setSolutionUnlocked(true);
    setPhase('understand');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="exercise-view-wrapper">
      <div className="exercise-view-nav">
        <button
          type="button"
          className="btn-back"
          onClick={onBackToCatalog}
          aria-label={t(dict.backToCatalog)}
        >
          {t(dict.backToCatalog)}
        </button>
      </div>

      {isInstructorMode && (
        <div className="instructor-banner" role="status">
          {t(dict.instructorModeBanner)}
        </div>
      )}

      <div className="exercise-view-header">
        <div className="exercise-meta-row">
          <span className="badge badge-technique">
            {formatTechniqueLabel(exercise.techniqueId, language)}
          </span>
          <span
            className="badge badge-difficulty"
            title={language === 'es' ? `Dificultad: nivel ${exercise.difficulty} de 5` : `Difficulty: level ${exercise.difficulty} of 5`}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <span>{language === 'es' ? 'Dificultad' : 'Difficulty'}</span>
            <span className="card-stars" style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }} aria-hidden="true">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`star-icon ${star <= exercise.difficulty ? 'star-filled' : 'star-empty'}`}
                  viewBox="0 0 20 20"
                  width="12"
                  height="12"
                >
                  <path
                    fill={star <= exercise.difficulty ? 'currentColor' : 'none'}
                    stroke="currentColor"
                    strokeWidth={star <= exercise.difficulty ? '1' : '1.5'}
                    strokeLinejoin="round"
                    d="M10 1.5l2.47 5.01 5.53.8-4 3.9 0.94 5.51L10 14.12l-4.94 2.6 0.94-5.51-4-3.9 5.53-.8L10 1.5z"
                  />
                </svg>
              ))}
            </span>
          </span>
          {exerciseCompleted && (
            <span className="badge badge-completed">
              {language === 'es' ? 'Completado' : 'Completed'}
            </span>
          )}
        </div>
        <h2 className="exercise-title">{formatTitleSpacing(t(exercise.title))}</h2>
        <p className="exercise-subtitle">{t(exercise.subtitle)}</p>
      </div>


      <PhaseSwitcher
        currentPhase={phase}
        onPhaseChange={handlePhaseChange}
        solutionUnlocked={isEffectiveUnlocked}
      />

      <div className="phase-content-container">
        {phase === 'discover' && (
          <DiscoverView
            exercise={exercise}
            onProceedToSolve={() => setPhase('solve')}
          >
            {discoverPlaygroundSlot}
          </DiscoverView>
        )}

        {phase === 'solve' && (
          <SolveView
            exercise={exercise}
            onSuccess={handleSolveSuccess}
            onAdvanceToUnderstand={() => setPhase('understand')}
            onSkipToUnderstand={handleSkipToUnderstand}
          />
        )}

        {phase === 'understand' && (
          <UnderstandView
            exercise={exercise}
            canonicalPython={canonicalPython}
            pseudocode={pseudocode}
            correctnessExplanation={correctnessExplanation}
            timeComplexity={timeComplexity}
            spaceComplexity={spaceComplexity}
            visualizerSlot={visualizerSlot}
            solutionUnlocked={exerciseCompleted || solutionUnlocked}
            onGoToSolve={() => setPhase('solve')}
            onNavigateToExercise={onSelectExercise}
          />
        )}
      </div>

      {showFrictionModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="phase-friction-title">
          <div className="modal-card">
            <h4 id="phase-friction-title">{t(dict.skipModalTitle)}</h4>
            <p>{t(dict.skipModalBody)}</p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setShowFrictionModal(false);
                  setPhase('solve');
                }}
              >
                {t({ es: 'Ir a Resolver primero', en: 'Go to Solve first' })}
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setShowFrictionModal(false);
                  setPhase('understand');
                }}
              >
                {t({ es: 'Explorar Traza y Teoría (Solución Python protegida)', en: 'Explore Trace & Theory (Python Solution Protected)' })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
