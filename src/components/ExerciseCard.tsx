import React from 'react';
import { ExerciseMetadata } from '../types';
import { useLanguage } from '../i18n/LanguageContext';

interface ExerciseCardProps {
  exercise: ExerciseMetadata;
  onSelect: (id: string) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onSelect }) => {
  const { t, dict } = useLanguage();
  const title = t(exercise.title);
  const subtitle = t(exercise.subtitle);

  return (
    <article className="exercise-card">
      <div className="card-header">
        <div className="card-badges">
          <span className="badge badge-technique">{exercise.techniqueId}</span>
          <span className="badge badge-difficulty" aria-label={`Dificultad nivel ${exercise.difficulty} de 5`}>
            {'★'.repeat(exercise.difficulty)}{'☆'.repeat(5 - exercise.difficulty)}
          </span>
        </div>
        <h3 className="card-title">{title}</h3>
      </div>
      <p className="card-subtitle">{subtitle}</p>
      <div className="card-footer">
        <button
          type="button"
          className="btn-open-exercise"
          onClick={() => onSelect(exercise.id)}
          aria-label={`${t(dict.exploreExercise)} ${title}`}
        >
          {t(dict.exploreExercise)}
        </button>
      </div>
    </article>
  );
};
