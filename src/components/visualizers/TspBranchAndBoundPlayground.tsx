import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
  DEFAULT_TSP_CITIES,
  DEFAULT_TSP_MATRIX,
  TspCity
} from '../../engine/algorithms/tspBranchAndBoundTrace';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import './TspBranchAndBoundVisualizer.css';

/**
 * Solves Branch & Bound for any NxN distance matrix and returns both optimal cost and tour sequence.
 */
function getOptimalTspTour(dist: number[][]): { cost: number; tour: number[] } {
  const n = dist.length;
  if (n <= 1) return { cost: 0, tour: [0] };

  let bestCost = Infinity;
  let bestTour: number[] = [];

  function lowerBound(curr: number, visited: Set<number>, currentCost: number): number {
    const unvisited: number[] = [];
    for (let i = 0; i < n; i++) {
      if (!visited.has(i)) unvisited.push(i);
    }
    if (unvisited.length === 0) return currentCost + dist[curr][0];

    let minOut = Infinity;
    for (const r of unvisited) {
      if (dist[curr][r] < minOut) minOut = dist[curr][r];
    }
    let minReturn = Infinity;
    for (const r of unvisited) {
      if (dist[r][0] < minReturn) minReturn = dist[r][0];
    }
    return currentCost + minOut + minReturn;
  }

  function explore(u: number, visited: Set<number>, currentCost: number, currentTour: number[]) {
    if (visited.size === n) {
      const total = currentCost + dist[u][0];
      if (total < bestCost) {
        bestCost = total;
        bestTour = [...currentTour, 0];
      }
      return;
    }

    if (lowerBound(u, visited, currentCost) >= bestCost) return;

    const unvisited: number[] = [];
    for (let i = 0; i < n; i++) {
      if (!visited.has(i)) unvisited.push(i);
    }
    unvisited.sort((a, b) => dist[u][a] - dist[u][b]);

    for (const v of unvisited) {
      visited.add(v);
      explore(v, visited, currentCost + dist[u][v], [...currentTour, v]);
      visited.delete(v);
    }
  }

  explore(0, new Set([0]), 0, [0]);
  return { cost: bestCost, tour: bestTour };
}

export const TspBranchAndBoundPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [useEuclideanMode, setUseEuclideanMode] = useState<boolean>(true);

  // Dynamic city coordinates supporting 2D dragging
  const [cities, setCities] = useState<TspCity[]>(DEFAULT_TSP_CITIES);
  const [draggingCityId, setDraggingCityId] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);

  // Dynamic distance matrix
  const dist: number[][] = useMemo(() => {
    if (!useEuclideanMode) {
      return DEFAULT_TSP_MATRIX;
    }
    const n = cities.length;
    const matrix: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 0;
        } else {
          const dx = cities[i].x - cities[j].x;
          const dy = cities[i].y - cities[j].y;
          // Scale factor to keep weights pedagogical (10 - 70)
          const euclidean = Math.round(Math.hypot(dx, dy) / 6);
          matrix[i][j] = Math.max(5, euclidean);
        }
      }
    }
    return matrix;
  }, [cities, useEuclideanMode]);

  const optimalSolution = useMemo(() => getOptimalTspTour(dist), [dist]);
  const optimalCost = optimalSolution.cost;

  const [tour, setTour] = useState<number[]>([0]);
  const [hoveredCity, setHoveredCity] = useState<number | null>(null);

  // Compute cumulative cost along current partial tour
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

  // Compute Branch & Bound Lower Bound (LB) for the partial tour
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
      // Must return to origin 0
      lb = dist[currentCity][0];
    } else {
      // Min out-edge from current city to an unvisited city
      let minOut = Infinity;
      for (const u of unvisited) {
        if (dist[currentCity][u] < minOut) minOut = dist[currentCity][u];
      }
      lb += minOut;

      // Min return from unvisited to origin
      let minReturn = Infinity;
      for (const u of unvisited) {
        if (dist[u][0] < minReturn) minReturn = dist[u][0];
      }
      lb += minReturn;
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


  const handleResetCities = () => {
    setCities(DEFAULT_TSP_CITIES);
    setTour([0]);
  };

  // 2D Pointer Drag Handlers
  const handlePointerDown = (cityId: number, e: React.PointerEvent) => {
    if (!useEuclideanMode) return;
    e.stopPropagation();
    (e.target as Element).setPointerCapture(e.pointerId);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    hasDraggedRef.current = false;
    setDraggingCityId(cityId);
  };

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (draggingCityId === null || !svgRef.current) return;
      const dist = Math.hypot(e.clientX - dragStartPos.current.x, e.clientY - dragStartPos.current.y);
      if (dist > 5) {
        hasDraggedRef.current = true;
      }
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = ((e.clientX - rect.left) / rect.width) * 480;
      const rawY = ((e.clientY - rect.top) / rect.height) * 280;

      const clampedX = Math.max(30, Math.min(450, Math.round(rawX)));
      const clampedY = Math.max(30, Math.min(250, Math.round(rawY)));

      setCities((prev) =>
        prev.map((c) => (c.id === draggingCityId ? { ...c, x: clampedX, y: clampedY } : c))
      );
    },
    [draggingCityId]
  );

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingCityId !== null) {
      try {
        (e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        // Ignored
      }
      setDraggingCityId(null);
    }
  };

  // Helper to check if edge (u, v) is in tour
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
      {/* Playground Controls */}
      <div className="sdk-pg-controls" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div className="sdk-pg-presets" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className={`btn-preset ${useEuclideanMode ? 'active' : ''}`}
              onClick={() => {
                setUseEuclideanMode(true);
                setTour([0]);
              }}
            >
              {language === 'es' ? 'Geometría Euclidiana (Arrastre Libre)' : 'Euclidean Geometry (Free Drag)'}
            </button>
            <button
              type="button"
              className={`btn-preset ${!useEuclideanMode ? 'active' : ''}`}
              onClick={() => {
                setUseEuclideanMode(false);
                setCities(DEFAULT_TSP_CITIES);
                setTour([0]);
              }}
            >
              {language === 'es' ? 'Matriz Canónica Asimétrica' : 'Asymmetric Canonical Matrix'}
            </button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn-preset"
              onClick={handleUndo}
              disabled={tour.length <= 1}
            >
              ↩ {language === 'es' ? 'Deshacer Paso' : 'Undo Step'}
            </button>
            <button type="button" className="btn-preset" onClick={handleReset}>
              ↺ {language === 'es' ? 'Reiniciar Tour' : 'Reset Tour'}
            </button>
            {useEuclideanMode && (
              <button type="button" className="btn-preset" onClick={handleResetCities}>
                {language === 'es' ? 'Reset Mapa' : 'Reset Map'}
              </button>
            )}
          </div>
        </div>

        {/* Live Metrics Grid */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="tsp-metric-badge">
            <span>{language === 'es' ? 'Costo Parcial (C):' : 'Current Cost (C):'}</span>
            <strong style={{ color: isOptimal ? 'var(--color-success, var(--success))' : 'var(--accent)' }}>
              {currentCost}
            </strong>
          </div>
          {!isComplete && (
            <div className="tsp-metric-badge">
              <span>{language === 'es' ? 'Cota Inferior (LB):' : 'Lower Bound (LB):'}</span>
              <strong style={{ color: 'var(--warning)' }}>+{lowerBound}</strong>
            </div>
          )}
          {!isComplete && (
            <div className="tsp-metric-badge">
              <span>{language === 'es' ? 'Proyectado (C + LB):' : 'Projected (C + LB):'}</span>
              <strong style={{ color: isPruned ? 'var(--error)' : 'var(--text)' }}>
                {projectedTotalCost}
              </strong>
            </div>
          )}
          <div className="tsp-metric-badge">
            <span>{language === 'es' ? 'Incumbent Óptimo (UB):' : 'Incumbent Best (UB):'}</span>
            <strong style={{ color: 'var(--success)' }}>{optimalCost}</strong>
          </div>
        </div>
      </div>

      {/* Status banner */}
      {isOptimal ? (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--state-solution-bg)',
            border: '1px solid var(--success)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            color: 'var(--success)'
          }}
          role="status"
        >
          <strong>{language === 'es' ? '¡Tour Óptimo Encontrado!' : 'Optimal Tour Found!'}</strong>:{' '}
          {language === 'es'
            ? `Recorriste todas las ciudades y retornaste al origen con costo exacto ${currentCost}. Ninguna rama explorada por Branch & Bound puede superar esta solución.`
            : `All cities visited with cost ${currentCost}, verified optimal by Branch & Bound.`}
        </div>
      ) : isPruned ? (
        <div
          className="sdk-conflict-banner"
          role="alert"
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--state-conflict-bg)',
            border: '1px solid var(--error)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--error)'
          }}
        >
          <strong>{language === 'es' ? 'Poda por Cota (Branch & Bound Cutoff)' : 'Bound Cutoff (Pruned)'}:</strong>{' '}
          {language === 'es'
            ? `Costo Proyectado (${projectedTotalCost}) ≥ Incumbent Óptimo (${optimalCost}). Ningún completamiento de este camino puede ser mejor que la mejor solución ya descubierta. Este nodo se poda.`
            : `Projected cost (${projectedTotalCost}) ≥ Best known bound (${optimalCost}). This branch is pruned.`}
        </div>
      ) : isComplete ? (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--state-candidate-bg)',
            border: '1px solid var(--warning)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.9rem',
            color: 'var(--warning)'
          }}
        >
          <strong>{language === 'es' ? 'Tour Válido pero Subóptimo' : 'Valid but Suboptimal Tour'}:</strong>{' '}
          {language === 'es'
            ? `Costo obtenido: ${currentCost}. El óptimo global es ${optimalCost}. Hacé clic en "Deshacer Paso" para explorar ramas con menor cota.`
            : `Cost: ${currentCost}. Optimal is ${optimalCost}. Undo steps to explore alternative branches.`}
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
          {language === 'es'
            ? 'Hacé clic en una ciudad contigua para extender el recorrido, o arrastrala para alterar distancias en tiempo real:'
            : 'Click an available city to extend tour, or drag it to modify distances in real-time:'}{' '}
          <strong style={{ color: 'var(--accent)' }}>
            {availableCities.map((cId) => cities[cId].name).join(', ') || (language === 'es' ? 'Completado' : 'Complete')}
          </strong>
        </div>
      )}

      {/* Interactive Map Canvas with 2D Dragging */}
      <div
        style={{
          position: 'relative',
          backgroundColor: 'var(--canvas-bg)',
          borderRadius: '8px',
          border: '1px solid var(--border)',
          overflow: 'hidden',
          padding: '0.5rem'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            marginBottom: '0.25rem',
            padding: '0 0.5rem'
          }}
        >
          <span>
            {useEuclideanMode
              ? (language === 'es'
                  ? 'Arrastrá cualquier ciudad: las distancias euclidianas y cotas B&B se recalculan al instante.'
                  : 'Drag any city: Euclidean distances and B&B bounds recompute instantly.')
              : (language === 'es'
                  ? 'Matriz fija estándar: distancias asimétricas de libro de texto.'
                  : 'Fixed canonical matrix: textbook asymmetric distances.')}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)' }}>|V| = {cities.length}</span>
        </div>

        <svg
          ref={svgRef}
          viewBox="0 0 480 280"
          style={{
            width: '100%',
            maxWidth: '100%',
            height: 'auto',
            display: 'block',
            margin: '0 auto',
            touchAction: 'none'
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          role="img"
          aria-label={language === 'es' ? 'Mapa interactivo TSP con arrastre 2D' : 'Interactive TSP map with 2D dragging'}
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
                    stroke={inTour ? 'var(--success)' : 'var(--graph-edge)'}
                    strokeWidth={inTour ? 4 : 2}
                    opacity={1}
                  />
                  <rect
                    x={midX - 13}
                    y={midY - 9}
                    width={26}
                    height={18}
                    rx={4}
                    fill="var(--surface)"
                    stroke={inTour ? 'var(--success)' : 'var(--border-strong)'}
                    strokeWidth={1.5}
                    opacity={1}
                  />
                  <text
                    x={midX}
                    y={midY + 4}
                    textAnchor="middle"
                    fill={inTour ? 'var(--success)' : 'var(--text)'}
                    fontSize="11px"
                    fontWeight="700"
                    fontFamily="var(--font-mono)"
                    pointerEvents="none"
                  >
                    {weight}
                  </text>
                </g>
              );
            })
          )}

          {/* Interactive City Nodes */}
          {cities.map((city) => {
            const inTour = tour.includes(city.id);
            const isStart = city.id === 0;
            const isCurrent = city.id === currentCity;
            const isAvailable = availableCities.includes(city.id);
            const isHovered = hoveredCity === city.id;
            const tourOrder = tour.indexOf(city.id);

            return (
              <g
                key={`city-pg-${city.id}`}
                onPointerDown={(e) => handlePointerDown(city.id, e)}
                onClick={() => {
                  if (hasDraggedRef.current) {
                    hasDraggedRef.current = false;
                    return;
                  }
                  if (isAvailable) handleAddCity(city.id);
                }}
                onMouseEnter={() => setHoveredCity(city.id)}
                onMouseLeave={() => setHoveredCity(null)}
                tabIndex={0}
                role="button"
                aria-label={
                  language === 'es'
                    ? `Ciudad ${city.name} (${city.id})${isCurrent ? ' - actual' : isAvailable ? ' - disponible para visitar' : inTour ? ' - ya visitada' : ''}`
                    : `City ${city.name} (${city.id})${isCurrent ? ' - current' : isAvailable ? ' - available to visit' : inTour ? ' - already visited' : ''}`
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (isAvailable) handleAddCity(city.id);
                  } else if (useEuclideanMode) {
                    if (e.key === 'ArrowUp') {
                      e.preventDefault();
                      setCities((prev) => prev.map((c) => (c.id === city.id ? { ...c, y: Math.max(30, c.y - 10) } : c)));
                    } else if (e.key === 'ArrowDown') {
                      e.preventDefault();
                      setCities((prev) => prev.map((c) => (c.id === city.id ? { ...c, y: Math.min(320, c.y + 10) } : c)));
                    } else if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      setCities((prev) => prev.map((c) => (c.id === city.id ? { ...c, x: Math.max(30, c.x - 10) } : c)));
                    } else if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      setCities((prev) => prev.map((c) => (c.id === city.id ? { ...c, x: Math.min(470, c.x + 10) } : c)));
                    }
                  }
                }}
                style={{ cursor: isAvailable ? 'pointer' : useEuclideanMode ? 'grab' : 'default' }}
              >
                {/* Glow ring */}
                {(isCurrent || isAvailable) && (
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r={isCurrent ? 24 : 20}
                    fill="none"
                    stroke={isCurrent ? 'var(--warning)' : 'var(--success)'}
                    strokeWidth={2}
                    strokeDasharray={isAvailable && !isCurrent ? '3,3' : undefined}
                    opacity={isHovered ? 0.9 : 0.6}
                  />
                )}

                <circle
                  cx={city.x}
                  cy={city.y}
                  r={isStart ? 18 : 16}
                  fill={isCurrent ? 'var(--warning)' : inTour ? 'var(--success)' : isAvailable ? 'var(--surface-hover)' : 'var(--surface)'}
                  stroke={isCurrent ? 'var(--warning)' : inTour ? 'var(--success)' : isAvailable ? 'var(--success)' : 'var(--border)'}
                  strokeWidth={2}
                />

                <text
                  x={city.x}
                  y={city.y + 4}
                  textAnchor="middle"
                  fill={isCurrent || inTour ? '#ffffff' : 'var(--text)'}
                  fontSize="13px"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                  pointerEvents="none"
                >
                  {city.id}
                </text>

                <text
                  x={city.x}
                  y={city.y - 20}
                  textAnchor="middle"
                  fill="var(--text)"
                  fontSize="13px"
                  fontWeight={isCurrent ? '700' : '600'}
                  pointerEvents="none"
                >
                  {city.name}
                </text>

                {tourOrder >= 0 && (
                  <text
                    x={city.x + 16}
                    y={city.y + 18}
                    textAnchor="middle"
                    fill="var(--accent)"
                    fontSize="13px"
                    fontWeight="800"
                    fontFamily="var(--font-mono)"
                    pointerEvents="none"
                  >
                    #{tourOrder + 1}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Partial Tour Breakdown Sequence */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--surface)',
          padding: '0.6rem 0.85rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
          fontSize: '0.85rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: '600' }}>
            {language === 'es' ? 'Secuencia Actual del Tour:' : 'Current Tour Sequence:'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'var(--accent)' }}>
            [{tour.map((cId) => cities[cId].name).join(' → ')}]
          </span>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          {language === 'es' ? 'Ciudades visitadas:' : 'Cities visited:'} {visitedSet.size} / {cities.length}
        </span>
      </div>
    </div>
  );
};
