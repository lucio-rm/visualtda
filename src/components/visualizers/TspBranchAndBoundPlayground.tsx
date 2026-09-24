import React, { useState } from 'react';
import {
  DEFAULT_TSP_CITIES,
  DEFAULT_TSP_MATRIX
} from '../../engine/algorithms/tspBranchAndBoundTrace';
import { solveTspBranchAndBound } from '../../engine/algorithms/tspBranchAndBoundValidator';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';

export const TspBranchAndBoundPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const cities = DEFAULT_TSP_CITIES;
  const dist = DEFAULT_TSP_MATRIX;
  const optimalCost = solveTspBranchAndBound(dist);

  const [tour, setTour] = useState<number[]>([0]);

  // Compute current cost
  let currentCost = 0;
  for (let i = 0; i < tour.length - 1; i++) {
    currentCost += dist[tour[i]][tour[i + 1]];
  }

  const isComplete = tour.length === cities.length + 1 && tour[tour.length - 1] === 0;
  const isOptimal = isComplete && currentCost === optimalCost;

  const currentCity = tour[tour.length - 1];
  const visitedSet = new Set(tour.slice(0, tour.length === cities.length + 1 ? cities.length : tour.length));

  const availableCities = isComplete
    ? []
    : tour.length === cities.length
    ? [0]
    : cities.map((c) => c.id).filter((cId) => !visitedSet.has(cId));

  const handleAddCity = (cId: number) => {
    if (!availableCities.includes(cId)) return;
    const nextTour = [...tour, cId];
    setTour(nextTour);

    if (nextTour.length === cities.length + 1 && nextTour[nextTour.length - 1] === 0) {
      // Completed tour
      let cTotal = 0;
      for (let i = 0; i < nextTour.length - 1; i++) {
        cTotal += dist[nextTour[i]][nextTour[i + 1]];
      }
      if (cTotal === optimalCost) {
        markAttempted('tsp-branch-and-bound');
      }
    }
  };

  const handleUndo = () => {
    if (tour.length > 1) {
      setTour(tour.slice(0, tour.length - 1));
    }
  };

  const handleReset = () => {
    setTour([0]);
  };

  const handleAutoOptimal = () => {
    // Standard optimal tour for this matrix
    setTour([0, 2, 1, 4, 3, 0]);
    markAttempted('tsp-branch-and-bound');
  };

  return (
    <div className="sudoku-playground" role="region" aria-label="Laboratorio de TSP Branch and Bound">
      <div className="sdk-pg-controls">
        <div className="sdk-pg-presets">
          <button type="button" className="btn-preset" onClick={handleUndo} disabled={tour.length <= 1}>
            ↩ {language === 'es' ? 'Deshacer Paso' : 'Undo Step'}
          </button>
          <button type="button" className="btn-preset" onClick={handleReset}>
            ↺ {language === 'es' ? 'Reiniciar' : 'Reset'}
          </button>
          <button type="button" className="btn-preset active" onClick={handleAutoOptimal}>
            {language === 'es' ? 'Ver Tour Óptimo B&B' : 'Show Optimal B&B Tour'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.9rem' }}>
          <span>
            {language === 'es' ? 'Costo Acumulado:' : 'Cumulative Cost:'}{' '}
            <strong style={{ color: isOptimal ? '#10b981' : 'var(--accent)' }}>{currentCost}</strong>
          </span>
          <span>
            {language === 'es' ? 'Costo Óptimo B&B:' : 'Optimal B&B Cost:'}{' '}
            <strong style={{ color: '#10b981' }}>{optimalCost}</strong>
          </span>
        </div>
      </div>

      {/* Status banner */}
      {isOptimal ? (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid #10b981',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            color: '#10b981'
          }}
          role="status"
        >
          <strong>{language === 'es' ? 'Tour Óptimo Confirmado' : 'Optimal Tour Confirmed'}</strong>:{' '}
          {language === 'es'
            ? `Costo total mínimo = ${currentCost}. Branch & Bound garantiza que ninguna otra permutación tiene costo inferior.`
            : `Minimal cost = ${currentCost}. Branch & Bound guarantees no other permutation is cheaper.`}
        </div>
      ) : isComplete ? (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid #f59e0b',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            color: '#f59e0b'
          }}
          role="status"
        >
          <strong>{language === 'es' ? 'Tour Válido pero Subóptimo' : 'Valid but Suboptimal Tour'}</strong>:{' '}
          {language === 'es'
            ? `Tu tour cuesta ${currentCost}, pero el óptimo es ${optimalCost}. En un árbol Branch & Bound real, esta rama habría sido podada antes de completarse.`
            : `Your tour costs ${currentCost}, optimal is ${optimalCost}. In B&B this branch would be pruned.`}
        </div>
      ) : (
        <div
          style={{
            padding: '0.6rem 0.85rem',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem'
          }}
        >
          {language === 'es' ? 'Seleccioná la siguiente ciudad para visitar desde' : 'Select next city to visit from'}{' '}
          <strong>{cities[currentCity].name}</strong>:
        </div>
      )}

      {/* Available cities buttons */}
      {!isComplete && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {availableCities.map((cId) => (
            <button
              key={`next-city-${cId}`}
              type="button"
              className="btn-control"
              onClick={() => handleAddCity(cId)}
              style={{
                padding: '0.4rem 0.8rem',
                fontSize: '0.85rem',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)'
              }}
            >
              + {cities[cId].name} (+{dist[currentCity][cId]})
            </button>
          ))}
        </div>
      )}

      {/* Tour Breakdown */}
      <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600', marginBottom: '0.35rem' }}>
          {language === 'es' ? 'RECORRIDO ACTUAL' : 'CURRENT TOUR PATH'}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: '700' }}>
          {tour.map((cId) => cities[cId].name).join(' → ')}
        </div>
      </div>
    </div>
  );
};
