import React from 'react';
import { ExercisePhase } from '../types';

interface PhaseSwitcherProps {
  currentPhase: ExercisePhase;
  onPhaseChange: (phase: ExercisePhase) => void;
  solutionUnlocked?: boolean;
}

interface PhaseConfig {
  id: ExercisePhase;
  stepNumber: number;
  label: { es: string; en: string };
  question: { es: string; en: string };
  icon: string;
}

const PHASES: PhaseConfig[] = [
  {
    id: 'discover',
    stepNumber: 1,
    label: { es: 'Descubrir', en: 'Discover' },
    question: { es: '¿Qué problema resolvemos?', en: 'What problem are we solving?' },
    icon: '🔍'
  },
  {
    id: 'solve',
    stepNumber: 2,
    label: { es: 'Resolver', en: 'Solve' },
    question: { es: '¿Cómo lo resolverías?', en: 'How would you solve it?' },
    icon: '⚡'
  },
  {
    id: 'understand',
    stepNumber: 3,
    label: { es: 'Comprender', en: 'Understand' },
    question: { es: '¿Por qué funciona?', en: 'Why does it work?' },
    icon: '💡'
  }
];

export const PhaseSwitcher: React.FC<PhaseSwitcherProps> = ({
  currentPhase,
  onPhaseChange,
  solutionUnlocked = false
}) => {
  return (
    <nav className="phase-switcher-container" aria-label="Fases pedagógicas del ejercicio">
      <ol className="phase-steps" role="tablist">
        {PHASES.map((p) => {
          const isActive = currentPhase === p.id;
          return (
            <li key={p.id} className="phase-step-item" role="presentation">
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`phase-button ${isActive ? 'active' : ''}`}
                onClick={() => onPhaseChange(p.id)}
              >
                <div className="phase-step-badge">
                  <span className="phase-step-icon" aria-hidden="true">{p.icon}</span>
                  <span className="phase-step-num">Fase {p.stepNumber}</span>
                </div>
                <div className="phase-step-content">
                  <span className="phase-step-title">{p.label.es}</span>
                  <span className="phase-step-question">{p.question.es}</span>
                </div>
                {p.id === 'understand' && solutionUnlocked && (
                  <span className="phase-unlocked-tag" title="Solución desbloqueada">✓</span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
