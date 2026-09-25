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
    if (initialPhase) {
      if (initialPhase === 'understand' && !isEffectiveUnlocked) {
        setShowFrictionModal(true);
      } else {
        setPhase(initialPhase);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
          <span className="badge badge-difficulty">
            {language === 'es' ? `Nivel ${exercise.difficulty}/5` : `Level ${exercise.difficulty}/5`}
          </span>
          {exerciseCompleted && (
            <span className="badge badge-completed">
              {language === 'es' ? 'Completado' : 'Completed'}
            </span>
          )}
        </div>
        <h2 className="exercise-title">{t(exercise.title)}</h2>
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
