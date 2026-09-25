import React, { useState, useMemo } from 'react';
import {
  DEFAULT_TSP_CITIES,
  DEFAULT_TSP_MATRIX,
  TspCity
} from '../../engine/algorithms/tspBranchAndBoundTrace';
import { solveTspBranchAndBound } from '../../engine/algorithms/tspBranchAndBoundValidator';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import './TspBranchAndBoundVisualizer.css';

export const TspBranchAndBoundPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const cities: TspCity[] = DEFAULT_TSP_CITIES;
  const dist: number[][] = DEFAULT_TSP_MATRIX;
  const optimalCost = useMemo(() => solveTspBranchAndBound(dist), [dist]);

  const [tour, setTour] = useState<number[]>([0]);
  const [hoveredCity, setHoveredCity] = useState<number | null>(null);

  // Compute cumulative cost along the tour path
  const currentCost = useMemo(() => {
    let cost = 0;
    for (let i = 0; i < tour.length - 1; i++) {
      cost += dist[tour[i]][tour[i + 1]];
    }
    return cost;
  }, [tour, dist]);

  const isComplete = tour.length === cities.length + 1 && tour[tour.length - 1] === 0;
  const isOptimal = isComplete && currentCost === optimalCost;

  const currentCity = tour[tour.length - 1];
  const visitedSet = useMemo(() => {
    return new Set(tour.slice(0, tour.length === cities.length + 1 ? cities.length : tour.length));
  }, [tour, cities.length]);

  const availableCities = useMemo(() => {
    if (isComplete) return [];
    if (tour.length === cities.length) return [0];
    return cities.map((c) => c.id).filter((cId) => !visitedSet.has(cId));
  }, [isComplete, tour.length, cities, visitedSet]);

  // Compute Lower Bound (LB) for the partial tour
  const { lowerBound, projectedTotalCost, isPruned } = useMemo(() => {
    if (isComplete) {
      return { lowerBound: 0, projectedTotalCost: currentCost, isPruned: false };
    }

    const unvisited: number[] = [];
    for (let i = 0; i < cities.length; i++) {
      if (!visitedSet.has(i)) {
        unvisited.push(i);
      }
    }

    let lb = 0;
    if (unvisited.length === 0) {
      // Must return to origin city 0
      lb = dist[currentCity][0];
    } else {
      // 1. Min out-edge from current city to an unvisited city
      let minOut = Infinity;
      for (const u of unvisited) {
        if (dist[currentCity][u] < minOut) {
          minOut = dist[currentCity][u];
        }
      }
      lb += minOut;

      // 2. For each unvisited city, minimum outgoing edge to another unvisited city or return to origin 0
      for (const u of unvisited) {
        let minEdge = Infinity;
        // Check edges to other unvisited cities
        for (const v of unvisited) {
          if (u !== v && dist[u][v] < minEdge) {
            minEdge = dist[u][v];
          }
        }
        // Check edge returning to origin
        if (dist[u][0] < minEdge) {
          minEdge = dist[u][0];
        }
        lb += minEdge;
      }
    }

    const projected = currentCost + lb;
    const pruned = projected >= optimalCost;
    return { lowerBound: lb, projectedTotalCost: projected, isPruned: pruned };
  }, [isComplete, cities.length, visitedSet, currentCity, dist, currentCost, optimalCost]);

  const handleAddCity = (cId: number) => {
    if (!availableCities.includes(cId)) return;
    const nextTour = [...tour, cId];
    setTour(nextTour);

    if (nextTour.length === cities.length + 1 && nextTour[nextTour.length - 1] === 0) {
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
    setTour([0, 2, 1, 4, 3, 0]);
    markAttempted('tsp-branch-and-bound');
  };

  // Helper to check if edge (u, v) is in currentTour
  const isTourEdge = (u: number, v: number): boolean => {
    for (let i = 0; i < tour.length - 1; i++) {
      if ((tour[i] === u && tour[i + 1] === v) || (tour[i] === v && tour[i + 1] === u)) {
        return true;
      }
    }
    return false;
  };

  return (
    <div
      className="algorithm-playground tsp-bb-playground"
      role="region"
      aria-label={language === 'es' ? 'Laboratorio de TSP Branch and Bound' : 'TSP Branch and Bound Playground'}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      {/* Playground Toolbar */}
      <div className="sdk-pg-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div className="sdk-pg-presets" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-preset"
            onClick={handleUndo}
            disabled={tour.length <= 1}
            title={language === 'es' ? 'Deshacer último paso' : 'Undo last step'}
          >
            {language === 'es' ? 'Deshacer Paso' : 'Undo Step'}
          </button>
          <button
            type="button"
            className="btn-preset"
            onClick={handleReset}
            title={language === 'es' ? 'Reiniciar recorrido' : 'Reset tour'}
          >
            {language === 'es' ? 'Reiniciar' : 'Reset'}
          </button>
          <button
            type="button"
            className="btn-preset active"
            onClick={handleAutoOptimal}
            title={language === 'es' ? 'Cargar el recorrido óptimo resuelto por Branch & Bound' : 'Load optimal B&B tour'}
          >
            {language === 'es' ? 'Ver Tour Óptimo B&B' : 'Show Optimal B&B Tour'}
          </button>
        </div>

        {/* Live Metrics Grid */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="tsp-metric-badge">
            <span>{language === 'es' ? 'Costo Parcial (C):' : 'Current Cost (C):'}</span>
            <strong style={{ color: isOptimal ? 'var(--color-success)' : 'var(--accent)' }}>{currentCost}</strong>
          </div>
          {!isComplete && (
            <div className="tsp-metric-badge">
              <span>{language === 'es' ? 'Cota Inferior (LB):' : 'Lower Bound (LB):'}</span>
              <strong style={{ color: '#f59e0b' }}>+{lowerBound}</strong>
            </div>
          )}
          {!isComplete && (
            <div className="tsp-metric-badge">
              <span>{language === 'es' ? 'Proyectado (C + LB):' : 'Projected (C + LB):'}</span>
              <strong style={{ color: isPruned ? 'var(--color-error)' : 'var(--text)' }}>{projectedTotalCost}</strong>
            </div>
          )}
          <div className="tsp-metric-badge">
            <span>{language === 'es' ? 'Incumbent Óptimo (UB):' : 'Incumbent Best (UB):'}</span>
            <strong style={{ color: 'var(--color-success)' }}>{optimalCost}</strong>
          </div>
        </div>
      </div>

      {/* Interactive Map Canvas */}
      <div className="tsp-canvas-container" style={{ position: 'relative' }}>
        <svg
          viewBox="0 0 460 260"
          style={{ width: '100%', maxWidth: '460px', height: 'auto', display: 'block' }}
          role="img"
          aria-label={language === 'es' ? 'Mapa interactivo de ciudades y recorrido TSP' : 'Interactive TSP city map'}
        >
          {/* Background network edges with distance labels */}
          {cities.map((c1, i) =>
            cities.slice(i + 1).map((c2) => {
              const inTour = isTourEdge(c1.id, c2.id);
              const midX = (c1.x + c2.x) / 2;
              const midY = (c1.y + c2.y) / 2;
              const weight = dist[c1.id][c2.id];

              return (
                <g key={`tsp-pg-edge-${c1.id}-${c2.id}`}>
                  <line
                    x1={c1.x}
                    y1={c1.y}
                    x2={c2.x}
                    y2={c2.y}
                    stroke={inTour ? 'var(--color-success)' : 'var(--border)'}
                    strokeWidth={inTour ? 3.5 : 1}
                    strokeDasharray={inTour ? undefined : '2,3'}
                    opacity={inTour ? 1 : 0.45}
                  />
                  {!inTour && (
                    <text
                      x={midX}
                      y={midY}
                      textAnchor="middle"
                      fill="var(--text-muted)"
                      fontSize="9px"
                      fontFamily="var(--font-mono)"
                    >
                      {weight}
                    </text>
                  )}
                </g>
              );
            })
          )}

          {/* City Nodes */}
          {cities.map((city) => {
            const inTour = tour.includes(city.id);
            const isStart = city.id === 0;
            const isCurrent = city.id === currentCity;
            const isAvailable = availableCities.includes(city.id);
            const isHovered = hoveredCity === city.id;

            return (
              <g
                key={`city-pg-${city.id}`}
                onClick={() => isAvailable && handleAddCity(city.id)}
                onMouseEnter={() => setHoveredCity(city.id)}
                onMouseLeave={() => setHoveredCity(null)}
                style={{ cursor: isAvailable ? 'pointer' : 'default' }}
              >
                {/* Glow ring on current or available node */}
                {(isCurrent || isAvailable) && (
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r={isCurrent ? 20 : 18}
                    fill="none"
                    stroke={isCurrent ? 'var(--accent)' : 'var(--color-success)'}
                    strokeWidth={isCurrent ? 2.5 : 1.5}
                    strokeDasharray={isAvailable && !isCurrent ? '3,3' : undefined}
                    opacity={isHovered ? 0.9 : 0.5}
                  />
                )}

                <circle
                  cx={city.x}
                  cy={city.y}
                  r={isStart ? 16 : 14}
                  fill={isCurrent ? 'var(--accent)' : inTour ? 'var(--color-success)' : isAvailable ? 'var(--surface-hover)' : 'var(--surface)'}
                  stroke={isCurrent ? 'var(--accent)' : inTour ? 'var(--color-success)' : isAvailable ? 'var(--color-success)' : 'var(--border)'}
                  strokeWidth={2}
                />
                <text
                  x={city.x}
                  y={city.y + 4}
                  textAnchor="middle"
                  fill={isCurrent || inTour ? '#ffffff' : 'var(--text)'}
                  fontSize="11px"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  {city.id}
                </text>
                <text
                  x={city.x}
                  y={city.y - 18}
                  textAnchor="middle"
                  fill="var(--text)"
                  fontSize="11px"
                  fontWeight={isCurrent ? '700' : '600'}
                >
                  {city.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Status & Pedagogical Insight Banners */}
      {isOptimal ? (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--success-bg)',
            border: '1px solid var(--color-success)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            color: 'var(--color-success)',
            lineHeight: 1.5
          }}
          role="status"
        >
          <strong>{language === 'es' ? 'Tour Óptimo Confirmado' : 'Optimal Tour Confirmed'}</strong>:{' '}
          {language === 'es'
            ? `Costo total mínimo = ${currentCost}. Branch & Bound demuestra formalmente que ninguna de las restantes (n-1)!/2 = 12 permutaciones tiene costo menor.`
            : `Minimal cost = ${currentCost}. Branch & Bound formally guarantees none of the other (n-1)!/2 = 12 tours is cheaper.`}
        </div>
      ) : isComplete ? (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid #f59e0b',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            color: '#f59e0b',
            lineHeight: 1.5
          }}
          role="status"
        >
          <strong>{language === 'es' ? 'Tour Válido pero Subóptimo' : 'Valid but Suboptimal Tour'}</strong>:{' '}
          {language === 'es'
            ? `Tu tour cuesta ${currentCost}, mientras que el óptimo garantizado por Branch & Bound es ${optimalCost}. En el árbol de búsqueda, esta solución no mejora la cota superior (UB).`
            : `Your tour costs ${currentCost}, optimal B&B is ${optimalCost}. This tour does not improve the incumbent upper bound.`}
        </div>
      ) : isPruned ? (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--danger-bg)',
            border: '1px solid var(--color-error)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.875rem',
            color: 'var(--color-error)',
            lineHeight: 1.5
          }}
          role="alert"
        >
          <strong>{language === 'es' ? 'Poda por Cota Activa (Branch & Bound)' : 'Pruned by Bound (Branch & Bound)'}</strong>:{' '}
          {language === 'es'
            ? `Costo actual (${currentCost}) + Cota optimista mínima restante (${lowerBound}) = ${projectedTotalCost} ≥ Incumbent óptimo (${optimalCost}). Ninguna combinación futura a partir de este punto puede superar la mejor solución ya conocida. El algoritmo de Branch & Bound descarta este subárbol sin evaluar sus descendientes.`
            : `Current cost (${currentCost}) + Remaining lower bound (${lowerBound}) = ${projectedTotalCost} ≥ Incumbent best (${optimalCost}). No future continuation can beat the known optimum. Branch & Bound prunes this search branch immediately.`}
        </div>
      ) : (
        <div
          style={{
            padding: '0.65rem 0.85rem',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.85rem',
            lineHeight: 1.5
          }}
        >
          {language === 'es'
            ? `Haz clic en una ciudad conectada o en los botones inferiores para avanzar desde ${cities[currentCity].name}. Cota estimada viable: ${projectedTotalCost} < ${optimalCost}.`
            : `Click a connected city or the buttons below to extend the path from ${cities[currentCity].name}. Feasible projected cost: ${projectedTotalCost} < ${optimalCost}.`}
        </div>
      )}

      {/* Available Next Cities Buttons */}
      {!isComplete && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            {language === 'es' ? 'Próxima ciudad:' : 'Next city:'}
          </span>
          {availableCities.map((cId) => (
            <button
              key={`next-city-${cId}`}
              type="button"
              className="btn-control"
              onClick={() => handleAddCity(cId)}
              style={{
                padding: '0.4rem 0.85rem',
                fontSize: '0.85rem',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer'
              }}
            >
              + {cities[cId].name} (+{dist[currentCity][cId]})
            </button>
          ))}
        </div>
      )}

      {/* Tour Path Breadcrumb */}
      <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '700', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
          {language === 'es' ? 'RECORRIDO ACTUAL' : 'CURRENT TOUR PATH'}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: '700', color: isOptimal ? 'var(--color-success)' : 'var(--text)' }}>
          {tour.map((cId) => cities[cId].name).join(' → ')}
        </div>
      </div>
    </div>
  );
};
