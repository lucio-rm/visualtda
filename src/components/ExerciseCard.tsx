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
  const { isCompleted, getExerciseState } = useStudentProgress();
  const title = t(exercise.title);
  const subtitle = t(exercise.subtitle);
  const state = getExerciseState(exercise.id);
  const completed = isCompleted(exercise.id);

  const renderStateBadge = () => {
    switch (state) {
      case 'completed':
        return (
          <span
            className="badge badge-completed"
            title={language === 'es' ? 'Has completado el análisis y la solución' : 'You have mastered the analysis and solution'}
          >
            {language === 'es' ? 'Completado' : 'Completed'}
          </span>
        );
      case 'passed':
        return (
          <span
            className="badge badge-passed badge-completed"
            title={language === 'es' ? 'Solución algorítmica verificada con éxito' : 'Algorithmic solution successfully verified'}
          >
            {language === 'es' ? 'Resuelto' : 'Solved'}
          </span>
        );
      case 'testing':
        return (
          <span
            className="badge badge-testing"
            title={language === 'es' ? 'Pruebas en curso' : 'Tests in progress'}
          >
            {language === 'es' ? 'En Pruebas' : 'Testing'}
          </span>
        );
      case 'attempted':
        return (
          <span
            className="badge badge-attempted"
            title={language === 'es' ? 'Código en desarrollo' : 'Code in development'}
          >
            {language === 'es' ? 'En Desarrollo' : 'In Progress'}
          </span>
        );
      case 'exploring':
        return (
          <span
            className="badge badge-exploring"
            title={language === 'es' ? 'Explorando visualmente' : 'Exploring visually'}
          >
            {language === 'es' ? 'Explorando' : 'Exploring'}
          </span>
        );
      default:
        return null;
    }
  };

  const getButtonLabel = () => {
    if (state === 'completed') return language === 'es' ? 'Revisar Ejercicio →' : 'Review Exercise →';
    if (state === 'passed') return language === 'es' ? 'Ver Análisis Formal →' : 'View Formal Analysis →';
    if (state === 'testing' || state === 'attempted') return language === 'es' ? 'Continuar Resolución →' : 'Continue Solving →';
    if (state === 'exploring') return language === 'es' ? 'Continuar Exploración →' : 'Continue Exploring →';
    return t(dict.exploreExercise);
  };

  return (
    <article className={`exercise-card state-${state} ${completed ? 'is-completed' : ''}`}>
      <div className="card-header">
        <div className="card-badges">
          {indexNumber !== undefined && (
            <span className="badge badge-order" title="Secuencia pedagógica recomendada">
              #{indexNumber}
            </span>
          )}
          <span className="badge badge-technique">{exercise.techniqueId}</span>
          <span className="badge badge-difficulty" aria-label={`Dificultad nivel ${exercise.difficulty} de 5`}>
            {language === 'es' ? `Nivel ${exercise.difficulty}/5` : `Level ${exercise.difficulty}/5`}
          </span>
          {renderStateBadge()}
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
          {getButtonLabel()}
        </button>
      </div>
    </article>
  );
};
