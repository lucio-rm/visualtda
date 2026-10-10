import React, { useState, useRef, useCallback } from 'react';
import {
  DEFAULT_SLS_POINTS,
  fitLineSegment,
  Point2D
} from '../../engine/algorithms/segmentedLeastSquaresTrace';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';

export const SegmentedLeastSquaresPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [costC, setCostC] = useState<number>(3.5);
  const [points, setPoints] = useState<Point2D[]>(DEFAULT_SLS_POINTS);
  const [draggedPointId, setDraggedPointId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const n = points.length;

  // Run dynamic programming client-side for costC
  const e: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      e[i][j] = fitLineSegment(points, i, j).error;
    }
  }

  const opt = Array(n + 1).fill(0);
  const origin = Array(n + 1).fill(0);

  for (let j = 1; j <= n; j++) {
    let minCost = Infinity;
    let bestI = 1;
    for (let i = 1; i <= j; i++) {
      const cand = e[i - 1][j - 1] + costC + opt[i - 1];
      if (cand < minCost) {
        minCost = cand;
        bestI = i;
      }
    }
    opt[j] = Math.round(minCost * 100) / 100;
    origin[j] = bestI;
  }

  // Reconstruct partition
  const partitionRanges: Array<[number, number]> = [];
  let curr = n;
  while (curr > 0) {
    const startIdx = origin[curr] - 1;
    const endIdx = curr - 1;
    partitionRanges.unshift([startIdx, endIdx]);
    curr = origin[curr] - 1;
  }

  let totalError = 0;
  for (const [st, en] of partitionRanges) {
    totalError += e[st][en];
  }
  totalError = Math.round(totalError * 100) / 100;
  const totalPenalty = Math.round(partitionRanges.length * costC * 100) / 100;

  // SVG coordinate system
  const svgWidth = 560;
  const svgHeight = 240;
  const padLeft = 45;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 35;

  const minX = 0;
  const maxX = 11;
  const minY = 0;
  const maxY = 13;

  const scaleX = (x: number) => padLeft + ((x - minX) / (maxX - minX)) * (svgWidth - padLeft - padRight);
  const scaleY = (y: number) => svgHeight - padBottom - ((y - minY) / (maxY - minY)) * (svgHeight - padTop - padBottom);

  const invertY = (svgY: number) => {
    const clampedY = Math.max(padTop, Math.min(svgHeight - padBottom, svgY));
    const normalized = (svgHeight - padBottom - clampedY) / (svgHeight - padTop - padBottom);
    return Math.round((minY + normalized * (maxY - minY)) * 10) / 10;
  };

  const segmentColors = ['var(--accent)', 'var(--success)', 'var(--warning)', '#ec4899', '#a855f7', '#06b6d4'];

  const handlePresetC = (cVal: number) => {
    setCostC(cVal);
    markAttempted('segmented-least-squares-dp');
  };

  const handleResetPoints = () => {
    setPoints(DEFAULT_SLS_POINTS);
    markAttempted('segmented-least-squares-dp');
  };

  const handleSvgMouseDown = (pointId: string, e: React.MouseEvent) => {
    e.preventDefault();
    setDraggedPointId(pointId);
  };

  const handleSvgMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!draggedPointId || !svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const relativeY = ((e.clientY - rect.top) / rect.height) * svgHeight;
      const newY = Math.max(0.5, Math.min(12.5, invertY(relativeY)));

      setPoints((prev) =>
        prev.map((p) => (p.id === draggedPointId ? { ...p, y: newY } : p))
      );
      markAttempted('segmented-least-squares-dp');
    },
    [draggedPointId, svgHeight]
  );

  const handleSvgMouseUp = () => {
    setDraggedPointId(null);
  };

  // Compute fitted segments for visualization
  const fittedVisualSegments = partitionRanges.map(([st, en], idx) => {
    const fit = fitLineSegment(points, st, en);
    const color = segmentColors[idx % segmentColors.length];
    return {
      startIdx: st,
      endIdx: en,
      a: fit.a,
      b: fit.b,
      error: fit.error,
      color
    };
  });

  return (
    <div
      className="algorithm-playground sls-playground"
      role="region"
      aria-label={language === 'es' ? 'Laboratorio de Mínimos Cuadrados Segmentados' : 'Segmented Least Squares Laboratory'}
      onMouseUp={handleSvgMouseUp}
    >
      <div className="sdk-pg-controls">
        <div className="sdk-pg-presets">
          <button
            type="button"
            className={`btn-preset ${costC <= 1.0 ? 'active' : ''}`}
            onClick={() => handlePresetC(0.8)}
          >
            {language === 'es' ? 'C Bajo (0.8) - Muchos Segmentos' : 'Low C (0.8) - Many Segments'}
          </button>
          <button
            type="button"
            className={`btn-preset ${costC === 3.5 ? 'active' : ''}`}
            onClick={() => handlePresetC(3.5)}
          >
            {language === 'es' ? 'C Óptimo (3.5) - Balance Ideal' : 'Optimal C (3.5) - Ideal Balance'}
          </button>
          <button
            type="button"
            className={`btn-preset ${costC >= 15 ? 'active' : ''}`}
            onClick={() => handlePresetC(18.0)}
          >
            {language === 'es' ? 'C Alto (18.0) - Un Solo Segmento' : 'High C (18.0) - Single Line'}
          </button>
          <button
            type="button"
            className="btn-preset"
            onClick={handleResetPoints}
            title={language === 'es' ? 'Restablecer puntos por defecto' : 'Reset default points'}
          >
            ↺ {language === 'es' ? 'Restablecer Puntos' : 'Reset Points'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.9rem' }}>
          <span>
            {language === 'es' ? 'Segmentos resultantes:' : 'Resulting segments:'}{' '}
            <strong style={{ color: 'var(--accent)' }}>{partitionRanges.length}</strong>
          </span>
          <span>
            {language === 'es' ? 'Costo total OPT(n):' : 'Total OPT(n) cost:'}{' '}
            <strong style={{ color: 'var(--success)' }}>{opt[n]}</strong>
          </span>
        </div>
      </div>

      {/* Slider for C */}
      <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
          <span>
            {language === 'es' ? 'Ajustar penalización por segmento (C):' : 'Adjust segment penalty (C):'}{' '}
            <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{costC}</strong>
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            {costC < 2
              ? language === 'es' ? 'Prioriza ajuste fino (bajo error)' : 'Prioritizes fine fit'
              : costC > 10
              ? language === 'es' ? 'Prioriza simplicidad (pocos segmentos)' : 'Prioritizes simplicity'
              : language === 'es' ? 'Compromiso balanceado' : 'Balanced compromise'}
          </span>
        </div>
        <input
          type="range"
          min={0.5}
          max={20.0}
          step={0.5}
          value={costC}
          onChange={(e) => {
            setCostC(Number(e.target.value));
            markAttempted('segmented-least-squares-dp');
          }}
          style={{ width: '100%' }}
        />
      </div>

      {/* Interactive 2D Coordinate Plane */}
      <div style={{ backgroundColor: 'var(--canvas-bg)', borderRadius: '6px', border: '1px solid var(--border)', padding: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 0.5rem 0.5rem 0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>
            {language === 'es'
              ? 'Lienzo interactivo: Arrastrá los puntos verticalmente para explorar el ajuste'
              : 'Interactive canvas: Drag points vertically to explore live fitting'}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>
            n = {n} {language === 'es' ? 'puntos' : 'points'}
          </span>
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{
            width: '100%',
            maxWidth: 'min(100%, 640px)',
            maxHeight: 'min(360px, calc(100vh - 340px))',
            height: 'auto',
            display: 'block',
            margin: '0 auto',
            userSelect: 'none'
          }}
          role="img"
          aria-label={language === 'es' ? 'Gráfico interactivo de Mínimos Cuadrados Segmentados' : 'Interactive Segmented Least Squares chart'}
          onMouseMove={handleSvgMouseMove}
          onMouseUp={handleSvgMouseUp}
          onMouseLeave={handleSvgMouseUp}
        >
          {/* Grid lines */}
          {[2, 4, 6, 8, 10].map((gx) => (
            <line
              key={`grid-x-${gx}`}
              x1={scaleX(gx)}
              y1={padTop}
              x2={scaleX(gx)}
              y2={svgHeight - padBottom}
              stroke="var(--border)"
              strokeDasharray="3 3"
              strokeWidth={0.8}
              opacity={0.5}
            />
          ))}
          {[2, 4, 6, 8, 10, 12].map((gy) => (
            <line
              key={`grid-y-${gy}`}
              x1={padLeft}
              y1={scaleY(gy)}
              x2={svgWidth - padRight}
              y2={scaleY(gy)}
              stroke="var(--border)"
              strokeDasharray="3 3"
              strokeWidth={0.8}
              opacity={0.5}
            />
          ))}

          {/* Coordinate Axes */}
          <line
            x1={padLeft}
            y1={scaleY(minY)}
            x2={svgWidth - padRight}
            y2={scaleY(minY)}
            stroke="var(--text-muted)"
            strokeWidth={1.5}
          />
          <line
            x1={scaleX(minX)}
            y1={padTop}
            x2={scaleX(minX)}
            y2={svgHeight - padBottom}
            stroke="var(--text-muted)"
            strokeWidth={1.5}
          />

          {/* Axis labels */}
          {[0, 2, 4, 6, 8, 10].map((val) => (
            <text
              key={`lbl-x-${val}`}
              x={scaleX(val)}
              y={svgHeight - padBottom + 18}
              textAnchor="middle"
              fill="var(--text-muted)"
              fontSize="13px"
              fontFamily="var(--font-mono)"
            >
              {val}
            </text>
          ))}
          {[0, 4, 8, 12].map((val) => (
            <text
              key={`lbl-y-${val}`}
              x={padLeft - 8}
              y={scaleY(val) + 4}
              textAnchor="end"
              fill="var(--text-muted)"
              fontSize="13px"
              fontFamily="var(--font-mono)"
            >
              {val}
            </text>
          ))}

          {/* Fitted Line Segments */}
          {fittedVisualSegments.map((seg, idx) => {
            const startPt = points[seg.startIdx];
            const endPt = points[seg.endIdx];
            const x1 = startPt.x;
            const x2 = endPt.x;
            const y1 = seg.a * x1 + seg.b;
            const y2 = seg.a * x2 + seg.b;

            return (
              <g key={`seg-line-${idx}`}>
                <line
                  x1={scaleX(x1)}
                  y1={scaleY(y1)}
                  x2={scaleX(x2)}
                  y2={scaleY(y2)}
                  stroke={seg.color}
                  strokeWidth={3.5}
                  strokeLinecap="round"
                />
                {/* Partition Boundary Marker */}
                <line
                  x1={scaleX(x2)}
                  y1={padTop}
                  x2={scaleX(x2)}
                  y2={svgHeight - padBottom}
                  stroke={seg.color}
                  strokeDasharray="4 4"
                  strokeWidth={1}
                  opacity={0.3}
                />
              </g>
            );
          })}

          {/* Residual Drop Lines */}
          {fittedVisualSegments.map((seg) => {
            const segPts = points.slice(seg.startIdx, seg.endIdx + 1);
            return segPts.map((p) => {
              const fittedY = seg.a * p.x + seg.b;
              return (
                <line
                  key={`res-${p.id}`}
                  x1={scaleX(p.x)}
                  y1={scaleY(p.y)}
                  x2={scaleX(p.x)}
                  y2={scaleY(fittedY)}
                  stroke={seg.color}
                  strokeDasharray="2 2"
                  strokeWidth={1.2}
                  opacity={0.7}
                />
              );
            });
          })}

          {/* Draggable Points */}
          {points.map((p, idx) => {
            const isDragging = draggedPointId === p.id;
            return (
              <g
                key={`dot-${p.id}`}
                onMouseDown={(e) => handleSvgMouseDown(p.id, e)}
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
              >
                {/* Hit target area */}
                <circle cx={scaleX(p.x)} cy={scaleY(p.y)} r={14} fill="transparent" />
                {/* Point glow when dragging */}
                {isDragging && (
                  <circle
                    cx={scaleX(p.x)}
                    cy={scaleY(p.y)}
                    r={12}
                    fill="var(--accent)"
                    opacity={0.25}
                  />
                )}
                {/* Point circle */}
                <circle
                  cx={scaleX(p.x)}
                  cy={scaleY(p.y)}
                  r={isDragging ? 6.5 : 5}
                  fill={isDragging ? 'var(--accent)' : 'var(--surface)'}
                  stroke={isDragging ? '#ffffff' : 'var(--text)'}
                  strokeWidth={2}
                />
                {/* Point index label */}
                <text
                  x={scaleX(p.x)}
                  y={scaleY(p.y) - 11}
                  textAnchor="middle"
                  fill="var(--text)"
                  fontSize="13px"
                  fontFamily="var(--font-mono)"
                  fontWeight="600"
                >
                  p{idx + 1}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Trade-off summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
        <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {language === 'es' ? 'ERROR RESIDUAL TOTAL' : 'TOTAL RESIDUAL ERROR'}
          </div>
          <div style={{ marginTop: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: '700' }}>
            ∑ e_i,j = {totalError}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {language === 'es' ? 'PENALIZACIÓN TOTAL (C × k)' : 'TOTAL PENALTY (C × k)'}
          </div>
          <div style={{ marginTop: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: '700' }}>
            {costC} × {partitionRanges.length} = {totalPenalty}
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
            {language === 'es' ? 'COSTO TOTAL OPT(n)' : 'TOTAL OPT(n) COST'}
          </div>
          <div style={{ marginTop: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '1.1rem', fontWeight: '700', color: 'var(--success)' }}>
            {opt[n]}
          </div>
        </div>
      </div>

      {/* Segments breakdown */}
      <div style={{ overflowX: 'auto', backgroundColor: 'var(--surface)', borderRadius: '6px', border: '1px solid var(--border)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', backgroundColor: 'var(--canvas-bg)' }}>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Segmento' : 'Segment'}</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Puntos Abarcados' : 'Points Covered'}</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Ecuación Recta' : 'Line Equation'}</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Error Cuadrático e_i,j' : 'Squared Error e_i,j'}</th>
              <th style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>{language === 'es' ? 'Costo (e_i,j + C)' : 'Cost (e_i,j + C)'}</th>
            </tr>
          </thead>
          <tbody>
            {fittedVisualSegments.map((seg, idx) => {
              const segCost = Math.round((seg.error + costC) * 100) / 100;
              const sign = seg.b >= 0 ? '+' : '-';
              const bAbs = Math.abs(seg.b).toFixed(1);
              return (
                <tr key={`seg-part-${idx}`} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: seg.color, marginRight: '6px' }} />
                    {idx + 1}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    p{seg.startIdx + 1} ({points[seg.startIdx].x}, {points[seg.startIdx].y.toFixed(1)}) → p{seg.endIdx + 1} ({points[seg.endIdx].x}, {points[seg.endIdx].y.toFixed(1)})
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>
                    y = {seg.a.toFixed(2)}x {sign} {bAbs}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)' }}>
                    {seg.error}
                  </td>
                  <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontFamily: 'var(--font-mono)', fontWeight: '700' }}>
                    {segCost}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

