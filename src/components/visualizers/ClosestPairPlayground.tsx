import React, { useState, useMemo, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { Point2D, DEFAULT_CLOSEST_PAIR_POINTS } from '../../engine/algorithms/closestPairTrace';

export const ClosestPairPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [points, setPoints] = useState<Point2D[]>(DEFAULT_CLOSEST_PAIR_POINTS);
  const [showAllPairs, setShowAllPairs] = useState(false);
  const [showStrip, setShowStrip] = useState(true);
  const [draggedPointId, setDraggedPointId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const hasDraggedRef = useRef(false);
  const isMouseDownRef = useRef(false);

  // Compute brute force closest pair and distance
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

  // Compute Divide & Conquer median line and delta strip
  const { dividerX, stripLeft, stripWidth, pointsInStrip } = useMemo(() => {
    if (points.length < 2 || minDistance === Infinity) {
      return { dividerX: 250, stripLeft: 250, stripWidth: 0, pointsInStrip: [] };
    }
    const sorted = [...points].sort((a, b) => a.x - b.x);
    const midIdx = Math.floor(sorted.length / 2);
    const divX = sorted[midIdx].x;
    const sLeft = Math.max(0, divX - minDistance);
    const sRight = Math.min(500, divX + minDistance);
    const inStrip = points.filter((p) => Math.abs(p.x - divX) <= minDistance);
    return {
      dividerX: divX,
      stripLeft: sLeft,
      stripWidth: Math.max(0, sRight - sLeft),
      pointsInStrip: inStrip
    };
  }, [points, minDistance]);

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // If we just finished dragging, do not create a new point
    if (draggedPointId || hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }

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

  const handlePointMouseDown = (pId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    hasDraggedRef.current = false;
    isMouseDownRef.current = true;
    setDraggedPointId(pId);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isMouseDownRef.current) return;
    const dist = Math.hypot(e.clientX - dragStartPos.current.x, e.clientY - dragStartPos.current.y);
    if (dist > 5) {
      hasDraggedRef.current = true;
    }
    if (!draggedPointId || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = Math.max(20, Math.min(480, Math.round(e.clientX - rect.left)));
    const y = Math.max(20, Math.min(260, Math.round(e.clientY - rect.top)));

    setPoints((prev) =>
      prev.map((p) => (p.id === draggedPointId ? { ...p, x, y } : p))
    );
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    if (draggedPointId) {
      setDraggedPointId(null);
      markAttempted('closest-pair-dyc');
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 50);
    }
  };

  const handleReset = () => {
    setPoints(DEFAULT_CLOSEST_PAIR_POINTS);
  };

  const handleClear = () => {
    setPoints([]);
  };

  return (
    <div
      className="algorithm-playground closest-pair-playground"
      role="region"
      aria-label="Laboratorio de Par Más Cercano 2D"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
    >
      {/* Controls Bar */}
      <div className="sdk-pg-controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {language === 'es' ? 'Total de puntos:' : 'Total points:'}{' '}
            <strong style={{ color: 'var(--text)' }}>{points.length}</strong>
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {language === 'es' ? 'Distancia mínima (δ):' : 'Min distance (δ):'}{' '}
            <strong style={{ color: 'var(--success)', fontFamily: 'var(--font-mono)' }}>
              {minDistance === Infinity ? '—' : `${minDistance} px`}
            </strong>
          </span>
          {points.length >= 2 && showStrip && (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {language === 'es' ? 'En franja central (±δ):' : 'In central strip (±δ):'}{' '}
              <strong style={{ color: 'var(--accent)' }}>{pointsInStrip.length}</strong>
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={`btn-tool ${showStrip ? 'active' : ''}`}
            onClick={() => setShowStrip(!showStrip)}
            title={language === 'es' ? 'Mostrar franja central ±δ y línea divisora de D&C' : 'Toggle central ±δ strip and D&C divider'}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.8rem',
              backgroundColor: showStrip ? 'var(--accent)' : 'var(--surface)',
              color: showStrip ? 'var(--accent-contrast)' : 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {showStrip
              ? (language === 'es' ? 'Ocultar Franja (±δ)' : 'Hide Strip (±δ)')
              : (language === 'es' ? 'Mostrar Franja (±δ)' : 'Show Strip (±δ)')}
          </button>
          <button
            type="button"
            className="btn-tool"
            onClick={() => setShowAllPairs(!showAllPairs)}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.8rem',
              backgroundColor: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {showAllPairs
              ? (language === 'es' ? 'Ocultar O(N²) Pares' : 'Hide O(N²) Pairs')
              : (language === 'es' ? 'Mostrar O(N²) Pares' : 'Show O(N²) Pairs')}
          </button>
          <button
            type="button"
            className="btn-tool"
            onClick={handleReset}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.8rem',
              backgroundColor: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {language === 'es' ? 'Restaurar' : 'Reset'}
          </button>
          <button
            type="button"
            className="btn-tool"
            onClick={handleClear}
            style={{
              padding: '0.35rem 0.75rem',
              fontSize: '0.8rem',
              backgroundColor: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {language === 'es' ? 'Limpiar' : 'Clear'}
          </button>
        </div>
      </div>

      {/* Interactive Coordinate Plane */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg
          ref={svgRef}
          viewBox="0 0 500 280"
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          style={{
            maxWidth: '680px',
            width: '100%',
            height: 'auto',
            borderRadius: '6px',
            backgroundColor: 'var(--bg)',
            border: '1px solid var(--border)',
            cursor: draggedPointId ? 'grabbing' : 'crosshair',
            userSelect: 'none'
          }}
          role="img"
          aria-label="Plano 2D interactivo. Arrastrá puntos existentes o hacé clic para agregar nuevos."
        >
          {/* Subtle Grid Lines */}
          {[50, 100, 150, 200, 250, 300, 350, 400, 450].map((gx) => (
            <line key={`gx-${gx}`} x1={gx} y1={0} x2={gx} y2={280} stroke="var(--border)" strokeWidth={0.5} strokeDasharray="2 4" />
          ))}
          {[50, 100, 150, 200, 250].map((gy) => (
            <line key={`gy-${gy}`} x1={0} y1={gy} x2={500} y2={gy} stroke="var(--border)" strokeWidth={0.5} strokeDasharray="2 4" />
          ))}

          {/* D&C Median Strip (±δ) */}
          {points.length >= 2 && showStrip && stripWidth > 0 && (
            <g>
              <rect
                x={stripLeft}
                y={0}
                width={stripWidth}
                height={280}
                fill="rgba(37, 99, 235, 0.08)"
                stroke="rgba(37, 99, 235, 0.3)"
                strokeWidth={1}
                strokeDasharray="4 4"
              />
              <line
                x1={dividerX}
                y1={0}
                x2={dividerX}
                y2={280}
                stroke="var(--accent)"
                strokeWidth={1.5}
                strokeDasharray="6 4"
              />
              <text
                x={dividerX + 6}
                y={18}
                fill="var(--accent)"
                fontSize="10px"
                fontWeight="700"
                fontFamily="var(--font-mono)"
              >
                x = {dividerX} (L)
              </text>
              <text
                x={stripLeft + 6}
                y={272}
                fill="var(--text-muted)"
                fontSize="9px"
                fontFamily="var(--font-mono)"
              >
                L - δ
              </text>
              <text
                x={stripLeft + stripWidth - 28}
                y={272}
                fill="var(--text-muted)"
                fontSize="9px"
                fontFamily="var(--font-mono)"
              >
                L + δ
              </text>
            </g>
          )}

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
                  stroke="rgba(148, 163, 184, 0.2)"
                  strokeWidth={1}
                />
              ))
            )}

          {/* Closest pair connecting line */}
          {bestPair && (
            <g>
              <line
                x1={bestPair[0].x}
                y1={bestPair[0].y}
                x2={bestPair[1].x}
                y2={bestPair[1].y}
                stroke="var(--success)"
                strokeWidth={3}
                strokeLinecap="round"
              />
              {/* Distance midpoint label */}
              <rect
                x={(bestPair[0].x + bestPair[1].x) / 2 - 24}
                y={(bestPair[0].y + bestPair[1].y) / 2 - 10}
                width={48}
                height={20}
                rx={4}
                fill="var(--surface)"
                stroke="var(--success)"
                strokeWidth={1}
              />
              <text
                x={(bestPair[0].x + bestPair[1].x) / 2}
                y={(bestPair[0].y + bestPair[1].y) / 2 + 4}
                textAnchor="middle"
                fill="var(--success)"
                fontFamily="var(--font-mono)"
                fontSize="10px"
                fontWeight="700"
              >
                δ={minDistance}
              </text>
            </g>
          )}

          {/* Interactive Points (draggable) */}
          {points.map((p) => {
            const isBest = bestPair && (bestPair[0].id === p.id || bestPair[1].id === p.id);
            const isDragged = draggedPointId === p.id;
            const inStrip = Math.abs(p.x - dividerX) <= minDistance;

            return (
              <g
                key={`pg-pt-${p.id}`}
                onMouseDown={(e) => handlePointMouseDown(p.id, e)}
                tabIndex={0}
                role="button"
                aria-label={
                  language === 'es'
                    ? `Punto ${p.id} en (${Math.round(p.x)}, ${Math.round(p.y)})${isBest ? ' (par más cercano)' : inStrip ? ' (dentro de franja 2δ)' : ''}`
                    : `Point ${p.id} at (${Math.round(p.x)}, ${Math.round(p.y)})${isBest ? ' (closest pair)' : inStrip ? ' (in 2δ strip)' : ''}`
                }
                onKeyDown={(e) => {
                  if (e.key === 'Delete' || e.key === 'Backspace') {
                    e.preventDefault();
                    setPoints((prev) => prev.filter((pt) => pt.id !== p.id));
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setPoints((prev) => prev.map((pt) => pt.id === p.id ? { ...pt, y: Math.max(20, pt.y - 10) } : pt));
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setPoints((prev) => prev.map((pt) => pt.id === p.id ? { ...pt, y: Math.min(260, pt.y + 10) } : pt));
                  } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    setPoints((prev) => prev.map((pt) => pt.id === p.id ? { ...pt, x: Math.max(20, pt.x - 10) } : pt));
                  } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    setPoints((prev) => prev.map((pt) => pt.id === p.id ? { ...pt, x: Math.min(480, pt.x + 10) } : pt));
                  }
                }}
                style={{ cursor: isDragged ? 'grabbing' : 'grab' }}
              >
                {/* Drag target hitzone */}
                <circle cx={p.x} cy={p.y} r={16} fill="transparent" />

                {/* Outer ring if in central strip */}
                {inStrip && showStrip && points.length >= 2 && !isBest && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={9}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={1.5}
                    strokeDasharray="2 2"
                  />
                )}

                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isDragged ? 9 : isBest ? 8 : 6}
                  fill={isBest ? 'var(--success)' : isDragged ? 'var(--accent)' : 'var(--accent)'}
                  stroke={isBest ? '#059669' : '#0284c7'}
                  strokeWidth={2}
                />
                <text
                  x={p.x}
                  y={p.y - 10}
                  textAnchor="middle"
                  fill="var(--text)"
                  fontFamily="var(--font-mono)"
                  fontSize="10px"
                  fontWeight="700"
                  pointerEvents="none"
                >
                  {p.id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Explanatory Callout */}
      <div style={{ backgroundColor: 'var(--surface)', padding: '0.75rem 1rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Arrastre Interactivo e Intuición de División y Conquista:' : 'Interactive Drag & Divide and Conquer Intuition'}:</strong>{' '}
        {language === 'es'
          ? 'Arrastrá cualquier punto con el mouse para ver cómo la distancia mínima δ y la franja central (±δ) se recalculan en tiempo real. Hacé clic en áreas libres para agregar nuevos puntos. En la franja de combinación central, el lema de empaquetamiento geométrico garantiza que solo se requiere comparar cada punto contra a lo sumo 7 u 8 vecinos ordenados por coordenada Y, preservando la complejidad O(n log n).'
          : 'Drag any point with the mouse to see min distance δ and the central strip (±δ) update dynamically. Click empty space to add points. In the merge strip, the geometric packing lemma guarantees each point is tested against at most 7-8 neighbors sorted by Y coordinate, preserving O(n log n).'}
      </div>
    </div>
  );
};
