import React from 'react';
import { ExerciseMetadata } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useStudentProgress } from '../context/StudentProgressContext';

interface ExerciseCardProps {
  exercise: ExerciseMetadata;
  onSelect: (id: string) => void;
  indexNumber?: number;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onSelect, indexNumber }) => {
  const { t, dict, language } = useLanguage();
  const { isCompleted } = useStudentProgress();
  const title = t(exercise.title);
  const subtitle = t(exercise.subtitle);
  const completed = isCompleted(exercise.id);

  return (
    <article className={`exercise-card ${completed ? 'is-completed' : ''}`}>
      <div className="card-header">
        <div className="card-badges">
          {indexNumber !== undefined && (
            <span className="badge badge-order" title="Secuencia pedagógica recomendada">
              #{indexNumber}
            </span>
          )}
          <span className="badge badge-technique">{exercise.techniqueId}</span>
          <span className="badge badge-difficulty" aria-label={`Dificultad nivel ${exercise.difficulty} de 5`}>
            {'★'.repeat(exercise.difficulty)}{'☆'.repeat(5 - exercise.difficulty)}
          </span>
          {completed && (
            <span className="badge badge-completed" title={language === 'es' ? 'Has completado este ejercicio' : 'You have completed this exercise'}>
              ✓ {language === 'es' ? 'Completado' : 'Completed'}
            </span>
          )}
        </div>
        <h3 className="card-title">{title}</h3>
      </div>
      <p className="card-subtitle">{subtitle}</p>
      <div className="card-footer">
        <button
          type="button"
          className={`btn-open-exercise ${completed ? 'btn-completed' : ''}`}
          onClick={() => onSelect(exercise.id)}
          aria-label={`${t(dict.exploreExercise)} ${title}`}
        >
          {completed
            ? (language === 'es' ? 'Revisar Ejercicio ✓' : 'Review Exercise ✓')
            : t(dict.exploreExercise)}
        </button>
      </div>
    </article>
  );
};
