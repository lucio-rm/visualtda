import React from 'react';
import { ExerciseMetadata } from '../types';
import { ExerciseCard } from './ExerciseCard';

interface ExerciseListProps {
  exercises: ExerciseMetadata[];
  onSelectExercise: (id: string) => void;
}

export const ExerciseList: React.FC<ExerciseListProps> = ({ exercises, onSelectExercise }) => {
  if (exercises.length === 0) {
    return (
      <div className="empty-state">
        <p>No se encontraron ejercicios para la categoría seleccionada.</p>
      </div>
    );
  }

  return (
    <div className="exercise-grid">
      {exercises.map((exercise) => (
        <ExerciseCard
          key={exercise.id}
          exercise={exercise}
          onSelect={onSelectExercise}
        />
      ))}
    </div>
  );
};
