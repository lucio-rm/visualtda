import React, { useState } from 'react';
import { ExerciseMetadata, ExercisePhase } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { PhaseSwitcher } from './PhaseSwitcher';
import { DiscoverView } from './DiscoverView';
import { SolveView } from './SolveView';
import { UnderstandView } from './UnderstandView';

interface ExerciseViewProps {
  exercise: ExerciseMetadata;
  onBackToCatalog: () => void;
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
  onBackToCatalog,
  visualizerSlot,
  discoverPlaygroundSlot,
  canonicalPython = '# Solución canónica oficial\ndef resolver(n):\n    return []\n',
  pseudocode = 'ALGORITMO Resolver(n)\n  PARA cada fila de 1 a n:\n    SI posición es segura:\n      colocar elemento\n',
  correctnessExplanation = 'El algoritmo garantiza que ninguna decisión viole las restricciones impuestas por decisiones previas, podando de forma exhaustiva las ramas inviables.',
  timeComplexity = 'O(N!)',
  spaceComplexity = 'O(N)'
}) => {
  const { t, dict } = useLanguage();
  const [phase, setPhase] = useState<ExercisePhase>('discover');
  const [solutionUnlocked, setSolutionUnlocked] = useState(false);

  const handleSolveSuccess = () => {
    setSolutionUnlocked(true);
    setPhase('understand');
  };

  const handleSkipToUnderstand = () => {
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

      <div className="exercise-view-header">
        <div className="exercise-meta-row">
          <span className="badge badge-technique">{exercise.techniqueId}</span>
          <span className="badge badge-difficulty">
            {'★'.repeat(exercise.difficulty)}{'☆'.repeat(5 - exercise.difficulty)}
          </span>
        </div>
        <h2 className="exercise-title">{t(exercise.title)}</h2>
        <p className="exercise-subtitle">{t(exercise.subtitle)}</p>
      </div>

      <PhaseSwitcher
        currentPhase={phase}
        onPhaseChange={setPhase}
        solutionUnlocked={solutionUnlocked}
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
          />
        )}
      </div>
    </div>
  );
};
