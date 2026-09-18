import React from 'react';
import { ExerciseMetadata } from '../types';

interface ExerciseCardProps {
  exercise: ExerciseMetadata;
  onSelect: (id: string) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onSelect }) => {
  return (
    <article className="exercise-card">
      <div className="card-header">
        <div className="card-badges">
          <span className="badge badge-technique">{exercise.techniqueId}</span>
          <span className="badge badge-difficulty" aria-label={`Dificultad nivel ${exercise.difficulty} de 5`}>
            {'★'.repeat(exercise.difficulty)}{'☆'.repeat(5 - exercise.difficulty)}
          </span>
        </div>
        <h3 className="card-title">{exercise.title.es}</h3>
      </div>
      <p className="card-subtitle">{exercise.subtitle.es}</p>
      <div className="card-footer">
        <button
          type="button"
          className="btn-open-exercise"
          onClick={() => onSelect(exercise.id)}
          aria-label={`Abrir ejercicio ${exercise.title.es}`}
        >
          Explorar ejercicio &rarr;
        </button>
      </div>
    </article>
  );
};
