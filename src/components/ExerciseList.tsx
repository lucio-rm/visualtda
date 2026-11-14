import React, { useState } from 'react';
import { ExerciseMetadata } from '../types';
import { ExerciseCard } from './ExerciseCard';
import { CurriculumKnowledgeGraph } from './CurriculumKnowledgeGraph';
import { useLanguage } from '../i18n/LanguageContext';
import { useStudentProgress } from '../context/StudentProgressContext';
import { formatTitleSpacing } from '../utils/textFormatting';

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
    bookReference: { es: 'Capítulo 5', en: 'Chapter 5' },
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
    bookReference: { es: 'Capítulo 4', en: 'Chapter 4' },
    description: {
      es: 'Elección local óptima irrevocable demostrada formalmente mediante argumento de intercambio o Greedy Stays Ahead.',
      en: 'Irrevocable locally optimal choice proved optimal via exchange arguments or Greedy Stays Ahead.'
    },
    code: 'GREEDY'
  },
  {
    id: 'backtracking',
    categoryIds: ['backtracking'],
    trackNumber: 3,
    title: { es: 'Backtracking y Ramificación', en: 'Backtracking & Branching' },
    bookReference: { es: 'Capítulo 8', en: 'Chapter 8' },
    description: {
      es: 'Exploración sistemática del espacio de búsqueda en profundidad con poda inmediata de ramas que violan restricciones.',
      en: 'Systematic depth-first search space exploration with immediate pruning of violating candidate branches.'
    },
    code: 'BT'
  },
  {
    id: 'dynamic-programming',
    categoryIds: ['dynamic-programming'],
    trackNumber: 4,
    title: { es: 'Programación Dinámica', en: 'Dynamic Programming' },
    bookReference: { es: 'Capítulo 6', en: 'Chapter 6' },
    description: {
      es: 'Subestructura óptima y subproblemas superpuestos tabulados sistemáticamente evitando recomputación exponencial.',
      en: 'Optimal substructure and overlapping subproblems tabulated to eliminate exponential recomputation.'
    },
    code: 'DP'
  },
  {
    id: 'linear-programming',
    categoryIds: ['linear-programming'],
    trackNumber: 5,
    title: { es: 'Programación Lineal', en: 'Linear Programming' },
    bookReference: { es: 'Capítulo 11', en: 'Chapter 11' },
    description: {
      es: 'Optimización de una función objetivo continua sujeta a un poliedro convexo de restricciones lineales.',
      en: 'Continuous objective function optimization subject to a convex polyhedron of linear constraints.'
    },
    code: 'PL'
  },
  {
    id: 'network-flow',
    categoryIds: ['network-flow'],
    trackNumber: 6,
    title: { es: 'Redes de Flujo', en: 'Network Flow' },
    bookReference: { es: 'Capítulo 7', en: 'Chapter 7' },
    description: {
      es: 'Conservación de flujo, capacidades residuales, teorema de flujo máximo y corte mínimo (Max-Flow Min-Cut).',
      en: 'Flow conservation, residual capacities, and the Max-Flow Min-Cut theorem on directed networks.'
    },
    code: 'FLOW'
  },
  {
    id: 'reductions',
    categoryIds: ['reductions'],
    trackNumber: 7,
    title: { es: 'Reducciones de Problemas y NP-Completitud', en: 'Problem Reductions & NP-Completeness' },
    bookReference: { es: 'Capítulo 8', en: 'Chapter 8' },
    description: {
      es: 'Mapeos polinomiales (X ≤_p Y) entre problemas para caracterizar intratabilidad computacional y completitud.',
      en: 'Polynomial-time mappings (X ≤_p Y) to classify computational intractability and completeness.'
    },
    code: 'RED'
  },
  {
    id: 'approximation',
    categoryIds: ['approximation'],
    trackNumber: 8,
    title: { es: 'Algoritmos de Aproximación', en: 'Approximation Algorithms' },
    bookReference: { es: 'Capítulo 11', en: 'Chapter 11' },
    description: {
      es: 'Garantías matemáticas de rendimiento acotado (factor ρ-aproximación) en tiempo polinomial para problemas NP-hard.',
      en: 'Provable bounded performance guarantees (ρ-approximation factor) in polynomial time for NP-hard problems.'
    },
    code: 'APX'
  },
  {
    id: 'randomized',
    categoryIds: ['randomized'],
    trackNumber: 9,
    title: { es: 'Algoritmos Randomizados', en: 'Randomized Algorithms' },
    bookReference: { es: 'Capítulo 13', en: 'Chapter 13' },
    description: {
      es: 'Uso de variables aleatorias e independencia probabilística para simplificar algoritmos o acotar tiempos esperados.',
      en: 'Harnessing random variables and probabilistic independence for simplicity and bounded expected runtime.'
    },
    code: 'RAND'
  }
];

export const ExerciseList: React.FC<ExerciseListProps> = ({
  exercises,
  activeCategoryId,
  onSelectExercise
}) => {
  const { t, language } = useLanguage();
  const { isCompleted } = useStudentProgress();
  const [catalogViewMode, setCatalogViewMode] = useState<'grid' | 'graph'>('grid');

  if (exercises.length === 0) {
    return (
      <div className="empty-state">
        <p>
          {language === 'es'
            ? 'No se encontraron ejercicios para la categoría seleccionada.'
            : 'No exercises found for the selected category.'}
        </p>
      </div>
    );
  }

  const renderFilteredTrack = () => {
    const matchingTrack = PARADIGM_TRACKS.find((tr) => tr.categoryIds.includes(activeCategoryId!));
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
                <span>{formatTitleSpacing(t(matchingTrack.title))}</span>
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
  };

  const renderAllTracks = () => (
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
                  <span>{formatTitleSpacing(t(track.title))}</span>
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

  return (
    <div className="catalog-view-wrapper">
      <div className="catalog-view-mode-bar" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
        <div className="segmented-control" role="group" aria-label={language === 'es' ? 'Modo de visualización del catálogo' : 'Catalog view mode'}>
          <button
            type="button"
            className={`segmented-btn ${catalogViewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setCatalogViewMode('grid')}
            aria-pressed={catalogViewMode === 'grid'}
          >
            <span>⊞ {language === 'es' ? 'Rutas y Cuadrícula' : 'Tracks & Grid'}</span>
          </button>
          <button
            type="button"
            className={`segmented-btn ${catalogViewMode === 'graph' ? 'active' : ''}`}
            onClick={() => setCatalogViewMode('graph')}
            aria-pressed={catalogViewMode === 'graph'}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
              {language === 'es' ? 'Grafo de Reducciones' : 'Reduction Graph'}
            </span>
          </button>
        </div>
      </div>

      {catalogViewMode === 'graph' ? (
        <CurriculumKnowledgeGraph
          exercises={exercises}
          onSelectExercise={onSelectExercise}
        />
      ) : activeCategoryId ? (
        renderFilteredTrack()
      ) : (
        renderAllTracks()
      )}
    </div>
  );
};
