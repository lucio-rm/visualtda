import React from 'react';
import { ExerciseMetadata, formatTechniqueLabel } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useStudentProgress } from '../context/StudentProgressContext';
import { formatTitleSpacing } from '../utils/textFormatting';

interface ExerciseCardProps {
  exercise: ExerciseMetadata;
  onSelect: (id: string) => void;
  indexNumber?: number;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onSelect, indexNumber }) => {
  const { t, dict, language } = useLanguage();
  const { isCompleted, getExerciseState } = useStudentProgress();
  const title = formatTitleSpacing(t(exercise.title));
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
            {language === 'es' ? '✓ Completado' : '✓ Completed'}
          </span>
        );
      case 'passed':
        return (
          <span
            className="badge badge-passed badge-completed"
            title={language === 'es' ? 'Solución algorítmica verificada con éxito' : 'Algorithmic solution successfully verified'}
          >
            {language === 'es' ? '✓ Resuelto' : '✓ Solved'}
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
        <div className="card-top-row">
          <div className="card-badges-left">
            {indexNumber !== undefined && (
              <span
                className="badge badge-order"
                title={language === 'es' ? 'Secuencia pedagógica recomendada' : 'Recommended pedagogical sequence'}
              >
                #{indexNumber}
              </span>
            )}
            <span className="badge badge-technique">
              {formatTechniqueLabel(exercise.techniqueId, language)}
            </span>
          </div>
        </div>
        <h3 className="card-title">{title}</h3>
      </div>
      <p className="card-subtitle">{subtitle}</p>
      <div className="card-footer">
        <div
          className="card-difficulty-bar"
          title={language === 'es' ? `Dificultad: nivel ${exercise.difficulty} de 5` : `Difficulty: level ${exercise.difficulty} of 5`}
        >
          <div
            className="card-difficulty-group"
            aria-label={language === 'es' ? `Dificultad nivel ${exercise.difficulty} de 5` : `Difficulty level ${exercise.difficulty} of 5`}
          >
            <span className="difficulty-label">
              {language === 'es' ? 'Dificultad' : 'Difficulty'}
            </span>
            <div className="card-stars" aria-hidden="true">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  className={`star-icon ${star <= exercise.difficulty ? 'star-filled' : 'star-empty'}`}
                  viewBox="0 0 20 20"
                  width="13"
                  height="13"
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
            </div>
          </div>
          <div className="card-status-slot">
            {renderStateBadge()}
          </div>
        </div>
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

