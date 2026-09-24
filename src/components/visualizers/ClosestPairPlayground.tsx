import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { Point2D, DEFAULT_CLOSEST_PAIR_POINTS } from '../../engine/algorithms/closestPairTrace';

export const ClosestPairPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [points, setPoints] = useState<Point2D[]>(DEFAULT_CLOSEST_PAIR_POINTS);
  const [showAllPairs, setShowAllPairs] = useState(false);

  // Compute brute force closest pair
  const { minDistance, bestPair } = useMemo(() => {
    let minD = Infinity;
    let pair: [Point2D, Point2D] | null = null;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const d = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
        if (d < minD) {
          minD = d;
          pair = [points[i], points[j]];
        }
      }
    }
    return { minDistance: Math.round(minD * 10) / 10, bestPair: pair };
  }, [points]);

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(e.clientX - rect.left);
    const y = Math.round(e.clientY - rect.top);

    if (x >= 20 && x <= 480 && y >= 20 && y <= 260) {
      const newPt: Point2D = {
        id: `p${points.length + 1}`,
        x,
        y
      };
      const updated = [...points, newPt];
      setPoints(updated);
      if (updated.length >= 10) {
        markAttempted('closest-pair-dyc');
      }
    }
  };

  const handleReset = () => {
    setPoints(DEFAULT_CLOSEST_PAIR_POINTS);
  };

  const handleClear = () => {
    setPoints([]);
  };

  return (
    <div className="algorithm-playground closest-pair-playground" role="region" aria-label="Laboratorio de Par Más Cercano 2D">
      <div className="sdk-pg-controls">
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {language === 'es' ? 'Total de puntos:' : 'Total points:'} <strong>{points.length}</strong>
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {language === 'es' ? 'Distancia mínima (δ):' : 'Min distance (δ):'} <strong>{minDistance === Infinity ? '—' : minDistance}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn-tool"
            onClick={() => setShowAllPairs(!showAllPairs)}
          >
            {showAllPairs
              ? (language === 'es' ? 'Ocultar O(N²) Pares' : 'Hide O(N²) Pairs')
              : (language === 'es' ? 'Mostrar Fuerza Bruta O(N²)' : 'Show Brute Force O(N²)')}
          </button>
          <button type="button" className="btn-tool" onClick={handleReset}>
            {language === 'es' ? 'Restaurar Predeterminado' : 'Reset Default'}
          </button>
          <button type="button" className="btn-tool" onClick={handleClear}>
            {language === 'es' ? 'Limpiar Plano' : 'Clear Plane'}
          </button>
        </div>
      </div>

      {/* Interactive Coordinate Plane */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg
          viewBox="0 0 500 280"
          onClick={handleCanvasClick}
          style={{
            maxWidth: '500px',
            width: '100%',
            height: 'auto',
            borderRadius: '4px',
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            cursor: 'crosshair'
          }}
          role="img"
          aria-label="Plano 2D interactivo. Hacé clic para agregar puntos."
        >
          {/* Subtle Grid Lines */}
          {[50, 100, 150, 200, 250, 300, 350, 400, 450].map((gx) => (
            <line key={`gx-${gx}`} x1={gx} y1={0} x2={gx} y2={280} stroke="var(--border, #334155)" strokeWidth={0.5} strokeDasharray="2 4" />
          ))}
          {[50, 100, 150, 200, 250].map((gy) => (
            <line key={`gy-${gy}`} x1={0} y1={gy} x2={500} y2={gy} stroke="var(--border, #334155)" strokeWidth={0.5} strokeDasharray="2 4" />
          ))}

          {/* All pairs lines if enabled (demonstrating O(N^2) combinatorial explosion) */}
          {showAllPairs &&
            points.map((p1, i) =>
              points.slice(i + 1).map((p2) => (
                <line
                  key={`all-${p1.id}-${p2.id}`}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="rgba(148, 163, 184, 0.15)"
                  strokeWidth={1}
                />
              ))
            )}

          {/* Closest pair connecting line */}
          {bestPair && (
            <line
              x1={bestPair[0].x}
              y1={bestPair[0].y}
              x2={bestPair[1].x}
              y2={bestPair[1].y}
              stroke="#10b981"
              strokeWidth={3}
            />
          )}

          {/* Points */}
          {points.map((p) => {
            const isBest = bestPair && (bestPair[0].id === p.id || bestPair[1].id === p.id);

            return (
              <g key={`pg-pt-${p.id}`}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isBest ? 8 : 6}
                  fill={isBest ? '#10b981' : '#38bdf8'}
                  stroke={isBest ? '#059669' : '#0284c7'}
                  strokeWidth={2}
                />
                <text
                  x={p.x}
                  y={p.y - 10}
                  textAnchor="middle"
                  fill="var(--text, #f8fafc)"
                  fontFamily="var(--font-mono)"
                  fontSize="10px"
                  fontWeight="700"
                >
                  {p.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Caso Propio e Intuición Geométrica' : 'Custom Instance & Geometric Intuition'}:</strong>{' '}
        {language === 'es'
          ? 'Hacé clic sobre cualquier región del plano para agregar nuevos puntos en tiempo real. Observá cómo la fuerza bruta compara N(N-1)/2 pares, mientras que División y Conquista acota la búsqueda en la banda vertical comparando cada punto contra a lo sumo 7 u 8 vecinos.'
          : 'Click anywhere to add points in real-time. Notice how Divide and Conquer inspects at most 8 candidates in the delta-strip.'}
      </div>
    </div>
  );
};
