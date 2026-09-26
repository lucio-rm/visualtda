import React from 'react';
import { ExerciseMetadata } from '../types';
import { ExerciseCard } from './ExerciseCard';
import { useLanguage } from '../i18n/LanguageContext';
import { useStudentProgress } from '../context/StudentProgressContext';

interface ExerciseListProps {
  exercises: ExerciseMetadata[];
  activeCategoryId?: string | null;
  onSelectExercise: (id: string) => void;
}

interface ParadigmTrackDef {
  id: string;
  categoryIds: string[];
  trackNumber: number;
  title: { es: string; en: string };
  bookReference: { es: string; en: string };
  description: { es: string; en: string };
  code: string;
}

const PARADIGM_TRACKS: ParadigmTrackDef[] = [
  {
    id: 'divide-and-conquer',
    categoryIds: ['divide-and-conquer'],
    trackNumber: 1,
    title: { es: 'División y Conquista', en: 'Divide & Conquer' },
    bookReference: { es: 'Kleinberg & Tardos — Capítulo 5', en: 'Kleinberg & Tardos — Chapter 5' },
    description: {
      es: 'Descomposición en subproblemas disjuntos, resolución recursiva y recombinación en tiempo lineal u O(N log N).',
      en: 'Decompose into disjoint subproblems, recursive solve, and recombination in linear or O(N log N) time.'
    },
    code: 'DYC'
  },
  {
    id: 'greedy',
    categoryIds: ['greedy'],
    trackNumber: 2,
    title: { es: 'Algoritmos Greedy', en: 'Greedy Algorithms' },
    bookReference: { es: 'Kleinberg & Tardos — Capítulo 4', en: 'Kleinberg & Tardos — Chapter 4' },
    description: {
      es: 'Elección local óptima irrevocable demostrada formalmente mediante argumento de intercambio o Greedy Stays Ahead.',
      en: 'Irrevocable locally optimal choice proved optimal via exchange arguments or Greedy Stays Ahead.'
    },
    code: 'GREEDY'
  },
  {
    id: 'dynamic-programming',
    categoryIds: ['dynamic-programming'],
    trackNumber: 3,
    title: { es: 'Programación Dinámica', en: 'Dynamic Programming' },
    bookReference: { es: 'Kleinberg & Tardos — Capítulo 6', en: 'Kleinberg & Tardos — Chapter 6' },
    description: {
      es: 'Subestructura óptima y subproblemas superpuestos tabulados sistemáticamente evitando recomputación exponencial.',
      en: 'Optimal substructure and overlapping subproblems tabulated to eliminate exponential recomputation.'
    },
    code: 'DP'
  },
  {
    id: 'backtracking',
    categoryIds: ['backtracking'],
    trackNumber: 4,
    title: { es: 'Backtracking y Ramificación', en: 'Backtracking & Branching' },
    bookReference: { es: 'Kleinberg & Tardos — Capítulo 8', en: 'Kleinberg & Tardos — Chapter 8' },
    description: {
      es: 'Exploración sistemática del espacio de búsqueda en profundidad con poda inmediata de ramas que violan restricciones.',
      en: 'Systematic depth-first search space exploration with immediate pruning of violating candidate branches.'
    },
    code: 'BT'
  },
  {
    id: 'network-flow-lp',
    categoryIds: ['network-flow', 'linear-programming'],
    trackNumber: 5,
    title: { es: 'Flujo en Redes y Programación Lineal', en: 'Network Flow & Linear Programming' },
    bookReference: { es: 'Kleinberg & Tardos — Capítulos 7 y 11', en: 'Kleinberg & Tardos — Chapters 7 & 11' },
    description: {
      es: 'Flujo en redes (Ford-Fulkerson, corte mínimo) y formulación en programación lineal continua.',
      en: 'Network flow (Ford-Fulkerson, min-cut) and continuous linear programming formulations.'
    },
    code: 'FLOW-LP'
  },
  {
    id: 'reductions-approx-random',
    categoryIds: ['reductions', 'approximation', 'randomized'],
    trackNumber: 6,
    title: { es: 'Reducciones, Aproximación y Aleatorizados', en: 'Reductions, Approximation & Randomized' },
    bookReference: { es: 'Kleinberg & Tardos — Capítulos 8, 11 y 13', en: 'Kleinberg & Tardos — Chapters 8, 11 & 13' },
    description: {
      es: 'Transformaciones polinomiales para caracterizar NP-completitud, cotas de aproximación y algoritmos probabilísticos.',
      en: 'Polynomial-time reductions for NP-completeness, approximation bounds, and probabilistic algorithms.'
    },
    code: 'ADV'
  }
];

export const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  activeCategoryId,
  onSelectExercise
}) => {
  const { t, language } = useLanguage();
  const { isCompleted } = useStudentProgress();

  if (exercises.length === 0) {
    return (
      <div className="empty-state">
        <p>No se encontraron ejercicios para la categoría seleccionada.</p>
      </div>
    );
  }

  // If filtered by a specific single category, determine which track or render filtered view
  if (activeCategoryId) {
    const matchingTrack = PARADIGM_TRACKS.find((tr) => tr.categoryIds.includes(activeCategoryId));
    const completedCount = exercises.filter((ex) => isCompleted(ex.id)).length;
    const progressPct = exercises.length > 0 ? Math.round((completedCount / exercises.length) * 100) : 0;

    return (
      <div className="catalog-tracks-container">
        <div className="paradigm-track-section">
          {matchingTrack && (
            <div className="track-header-card">
              <div className="track-header-top">
                <span className="track-badge">
                  {language === 'es' ? `Ruta de Estudio #${matchingTrack.trackNumber}` : `Study Track #${matchingTrack.trackNumber}`}
                </span>
                <span className="track-book-ref">{t(matchingTrack.bookReference)}</span>
              </div>
              <h3 className="track-title">
                <span className="badge badge-technique" style={{ fontSize: '0.8rem' }}>
                  {matchingTrack.code}
                </span>
                <span>{t(matchingTrack.title)}</span>
              </h3>
              <p className="track-desc">{t(matchingTrack.description)}</p>
              <div className="track-progress-bar-container">
                <div className="track-progress-info">
                  <span>{language === 'es' ? 'Progreso en este paradigma:' : 'Paradigm progress:'}</span>
                  <strong>{completedCount} / {exercises.length} {language === 'es' ? 'completados' : 'completed'} ({progressPct}%)</strong>
                </div>
                <div className="track-progress-rail">
                  <div className="track-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </div>
          )}

          <div className="exercise-grid">
            {exercises.map((exercise, idx) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                indexNumber={idx + 1}
                onSelect={onSelectExercise}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Render structured roadmap by pedagogical tracks
  return (
    <div className="catalog-tracks-container">
      {PARADIGM_TRACKS.map((track) => {
        const trackExercises = exercises.filter((ex) => track.categoryIds.includes(ex.categoryId));
        if (trackExercises.length === 0) return null;

        const completedCount = trackExercises.filter((ex) => isCompleted(ex.id)).length;
        const progressPct = Math.round((completedCount / trackExercises.length) * 100);

        return (
          <section key={track.id} className="paradigm-track-section" aria-labelledby={`track-${track.id}-title`}>
            <div className="track-header-card">
              <div className="track-header-top">
                <span className="track-badge">
                  {language === 'es' ? `Ruta de Estudio #${track.trackNumber}` : `Study Track #${track.trackNumber}`}
                </span>
                <span className="track-book-ref">{t(track.bookReference)}</span>
              </div>
              <div className="track-title-row">
                <h3 id={`track-${track.id}-title`} className="track-title">
                  <span className="badge badge-technique" style={{ fontSize: '0.8rem' }}>
                    {track.code}
                  </span>
                  <span>{t(track.title)}</span>
                </h3>
                <span className="track-count-badge">
                  {trackExercises.length} {language === 'es' ? 'ejercicios' : 'exercises'}
                </span>
              </div>
              <p className="track-desc">{t(track.description)}</p>

              <div className="track-progress-bar-container">
                <div className="track-progress-info">
                  <span>{language === 'es' ? 'Dominio del paradigma:' : 'Paradigm mastery:'}</span>
                  <strong>
                    {completedCount} / {trackExercises.length} {language === 'es' ? 'completados' : 'completed'} ({progressPct}%)
                  </strong>
                </div>
                <div className="track-progress-rail">
                  <div className="track-progress-fill" style={{ width: `${progressPct}%` }} />
                </div>
              </div>
            </div>

            <div className="exercise-grid">
              {trackExercises.map((exercise, idx) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  indexNumber={idx + 1}
                  onSelect={onSelectExercise}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};
