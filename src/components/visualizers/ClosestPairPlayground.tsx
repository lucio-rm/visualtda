import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react';
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

  const [inspectedStripPointId, setInspectedStripPointId] = useState<string | null>(null);
  const [showGridBoxes, setShowGridBoxes] = useState<boolean>(true);
  const dragOffsetRef = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // Exact SVG coordinate translation accounting for responsive viewBox scaling
  const getSvgCoords = useCallback((e: { clientX: number; clientY: number }) => {
    const svg = svgRef.current;
    if (!svg) return { x: 250, y: 140 };
    if (typeof svg.createSVGPoint === 'function') {
      const pt = svg.createSVGPoint();
      const ctm = svg.getScreenCTM?.();
      if (pt && typeof pt.matrixTransform === 'function' && ctm && typeof ctm.inverse === 'function') {
        try {
          pt.x = e.clientX;
          pt.y = e.clientY;
          const transformed = pt.matrixTransform(ctm.inverse());
          return {
            x: Math.round(transformed.x),
            y: Math.round(transformed.y)
          };
        } catch {
          // Fall through to bounding client rect calculation
        }
      }
    }
    const rect = svg.getBoundingClientRect();
    return {
      x: Math.round((e.clientX - rect.left) * (500 / Math.max(1, rect.width))),
      y: Math.round((e.clientY - rect.top) * (280 / Math.max(1, rect.height)))
    };
  }, []);

  // Global window listener while dragging so points follow mouse smoothly even if moved rapidly
  useEffect(() => {
    if (!draggedPointId) return;

    const onWindowMouseMove = (e: MouseEvent) => {
      const mouseSvg = getSvgCoords(e);
      const clampedX = Math.max(15, Math.min(485, mouseSvg.x + dragOffsetRef.current.dx));
      const clampedY = Math.max(15, Math.min(265, mouseSvg.y + dragOffsetRef.current.dy));
      hasDraggedRef.current = true;
      setPoints((prev) =>
        prev.map((p) => (p.id === draggedPointId ? { ...p, x: clampedX, y: clampedY } : p))
      );
    };

    const onWindowMouseUp = () => {
      setDraggedPointId(null);
      markAttempted('closest-pair-dyc');
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 100);
    };

    window.addEventListener('mousemove', onWindowMouseMove);
    window.addEventListener('mouseup', onWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', onWindowMouseMove);
      window.removeEventListener('mouseup', onWindowMouseUp);
    };
  }, [draggedPointId, getSvgCoords, markAttempted]);

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // If we just finished dragging, do not create a new point
    if (draggedPointId || hasDraggedRef.current) {
      hasDraggedRef.current = false;
      return;
    }

    const { x, y } = getSvgCoords(e);

    // Ensure we don't spawn a point right on top of an existing point
    const nearExisting = points.some((p) => Math.hypot(p.x - x, p.y - y) < 18);
    if (nearExisting) return;

    if (x >= 15 && x <= 485 && y >= 15 && y <= 265) {
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
    e.preventDefault();
    const targetPt = points.find((p) => p.id === pId);
    const mouseSvg = getSvgCoords(e);
    if (targetPt) {
      dragOffsetRef.current = { dx: targetPt.x - mouseSvg.x, dy: targetPt.y - mouseSvg.y };
    }
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    hasDraggedRef.current = false;
    isMouseDownRef.current = true;
    setDraggedPointId(pId);
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isMouseDownRef.current || !draggedPointId) return;
    const dist = Math.hypot(e.clientX - dragStartPos.current.x, e.clientY - dragStartPos.current.y);
    if (dist > 3) {
      hasDraggedRef.current = true;
    }
    const mouseSvg = getSvgCoords(e);
    const clampedX = Math.max(15, Math.min(485, mouseSvg.x + dragOffsetRef.current.dx));
    const clampedY = Math.max(15, Math.min(265, mouseSvg.y + dragOffsetRef.current.dy));

    setPoints((prev) =>
      prev.map((p) => (p.id === draggedPointId ? { ...p, x: clampedX, y: clampedY } : p))
    );
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    if (draggedPointId) {
      setDraggedPointId(null);
      markAttempted('closest-pair-dyc');
      setTimeout(() => {
        hasDraggedRef.current = false;
      }, 100);
    }
  };

  const handleReset = () => {
    setPoints(DEFAULT_CLOSEST_PAIR_POINTS);
    setInspectedStripPointId(null);
  };

  const handleClear = () => {
    setPoints([]);
    setInspectedStripPointId(null);
  };

  // Determine active inspected point in strip (defaults to first strip point if available)
  const activeInspectedPoint = useMemo(() => {
    if (inspectedStripPointId) {
      const found = pointsInStrip.find((p) => p.id === inspectedStripPointId);
      if (found) return found;
    }
    return pointsInStrip[0] || null;
  }, [inspectedStripPointId, pointsInStrip]);

  return (
    <div
      className="algorithm-playground closest-pair-playground"
      role="region"
      aria-label="Laboratorio de Par Más Cercano 2D"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ display: 'flex', flexDirection: 'column', gap: '1rem', userSelect: 'none' }}
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
          {showStrip && points.length >= 2 && (
            <button
              type="button"
              className={`btn-tool ${showGridBoxes ? 'active' : ''}`}
              onClick={() => setShowGridBoxes(!showGridBoxes)}
              title={language === 'es' ? 'Mostrar celdas de tamaño δ/2 × δ/2 y caja de 16 celdas (Lema 15 Puntos)' : 'Toggle δ/2 × δ/2 cells and 16-cell box (15 Points Lemma)'}
              style={{
                padding: '0.35rem 0.75rem',
                fontSize: '0.8rem',
                backgroundColor: showGridBoxes ? 'var(--accent)' : 'var(--surface)',
                color: showGridBoxes ? 'var(--accent-contrast)' : 'var(--text)',
                border: '1px solid var(--border)',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {language === 'es' ? 'Celdas δ/2 (Lema 15)' : 'δ/2 Cells (Lemma 15)'}
            </button>
          )}
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
            maxWidth: '720px',
            width: '100%',
            height: 'auto',
            borderRadius: '8px',
            backgroundColor: 'var(--canvas-bg, var(--surface-light))',
            border: '1.5px solid var(--border)',
            boxShadow: 'var(--shadow-sm)',
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
              {/* Outer 2δ Strip Background */}
              <rect
                x={stripLeft}
                y={0}
                width={stripWidth}
                height={280}
                fill="rgba(37, 99, 235, 0.06)"
                stroke="rgba(37, 99, 235, 0.3)"
                strokeWidth={1}
                strokeDasharray="4 4"
              />

              {/* δ/2 Subdivisions inside the entire strip */}
              {showGridBoxes && minDistance > 12 && (
                <g opacity={0.6}>
                  {/* Vertical subdivision lines at L - δ/2 and L + δ/2 (making 4 columns of width δ/2) */}
                  <line
                    x1={dividerX - minDistance / 2}
                    y1={0}
                    x2={dividerX - minDistance / 2}
                    y2={280}
                    stroke="rgba(37, 99, 235, 0.35)"
                    strokeWidth={1}
                    strokeDasharray="2 3"
                  />
                  <line
                    x1={dividerX + minDistance / 2}
                    y1={0}
                    x2={dividerX + minDistance / 2}
                    y2={280}
                    stroke="rgba(37, 99, 235, 0.35)"
                    strokeWidth={1}
                    strokeDasharray="2 3"
                  />

                  {/* Horizontal strip grid lines every δ/2 */}
                  {Array.from({ length: Math.ceil(280 / (minDistance / 2)) }).map((_, rIdx) => {
                    const lineY = rIdx * (minDistance / 2);
                    return (
                      <line
                        key={`h-grid-${rIdx}`}
                        x1={stripLeft}
                        y1={lineY}
                        x2={stripLeft + stripWidth}
                        y2={lineY}
                        stroke="rgba(37, 99, 235, 0.2)"
                        strokeWidth={0.75}
                        strokeDasharray="2 2"
                      />
                    );
                  })}
                </g>
              )}

              {/* 16-Cell Inspection Box (2δ × 2δ) around the active point */}
              {showGridBoxes && activeInspectedPoint && minDistance > 10 && (
                <g>
                  {/* Bounding box of 2δ × 2δ */}
                  <rect
                    x={dividerX - minDistance}
                    y={Math.max(0, activeInspectedPoint.y - minDistance)}
                    width={minDistance * 2}
                    height={Math.min(280, minDistance * 2)}
                    fill="rgba(16, 185, 129, 0.07)"
                    stroke="var(--success)"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                  />

                  {/* 4x4 Grid of δ/2 × δ/2 cells inside the inspection window */}
                  {[0, 1, 2, 3].map((col) =>
                    [0, 1, 2, 3].map((row) => {
                      const cellX = dividerX - minDistance + col * (minDistance / 2);
                      const cellY = activeInspectedPoint.y - minDistance + row * (minDistance / 2);
                      if (cellY + minDistance / 2 < 0 || cellY > 280) return null;
                      return (
                        <rect
                          key={`cell-${col}-${row}`}
                          x={cellX}
                          y={cellY}
                          width={minDistance / 2}
                          height={minDistance / 2}
                          fill="transparent"
                          stroke="rgba(16, 185, 129, 0.35)"
                          strokeWidth={0.8}
                        />
                      );
                    })
                  )}

                  {/* Window explanation label pill */}
                  <g>
                    <rect
                      x={dividerX - 145}
                      y={Math.max(4, activeInspectedPoint.y - minDistance - 18)}
                      width={290}
                      height={20}
                      rx={4}
                      fill="var(--surface)"
                      stroke="rgba(16, 185, 129, 0.4)"
                      strokeWidth={1}
                    />
                    <text
                      x={dividerX}
                      y={Math.max(18, activeInspectedPoint.y - minDistance - 4)}
                      textAnchor="middle"
                      fill="var(--success)"
                      fontSize="11px"
                      fontWeight="700"
                      fontFamily="var(--font-mono)"
                    >
                      {language === 'es'
                        ? `Caja 2δ×2δ (16 celdas de δ/2): ≤15 candidatos`
                        : `2δ×2δ Box (16 δ/2 cells): ≤15 candidates`}
                    </text>
                  </g>
                </g>
              )}

              {/* Center dividing median line */}
              <line
                x1={dividerX}
                y1={0}
                x2={dividerX}
                y2={280}
                stroke="var(--accent)"
                strokeWidth={2}
                strokeDasharray="6 4"
              />
              <text
                x={dividerX + 6}
                y={18}
                fill="var(--accent)"
                fontSize="13px"
                fontWeight="700"
                fontFamily="var(--font-mono)"
              >
                x = {dividerX} (L)
              </text>
              <text
                x={stripLeft + 6}
                y={272}
                fill="var(--text-muted)"
                fontSize="12px"
                fontFamily="var(--font-mono)"
              >
                L - δ
              </text>
              <text
                x={stripLeft + stripWidth - 36}
                y={272}
                fill="var(--text-muted)"
                fontSize="12px"
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
                x={(bestPair[0].x + bestPair[1].x) / 2 - 32}
                y={(bestPair[0].y + bestPair[1].y) / 2 - 12}
                width={64}
                height={24}
                rx={4}
                fill="var(--surface)"
                stroke="var(--success)"
                strokeWidth={1}
              />
              <text
                x={(bestPair[0].x + bestPair[1].x) / 2}
                y={(bestPair[0].y + bestPair[1].y) / 2 + 5}
                textAnchor="middle"
                fill="var(--success)"
                fontFamily="var(--font-mono)"
                fontSize="13px"
                fontWeight="700"
              >
                δ={minDistance}
              </text>
            </g>
          )}

          {/* Interactive Points (draggable & selectable) */}
          {points.map((p) => {
            const isBest = bestPair && (bestPair[0].id === p.id || bestPair[1].id === p.id);
            const isDragged = draggedPointId === p.id;
            const inStrip = Math.abs(p.x - dividerX) <= minDistance;
            const isInspected = activeInspectedPoint?.id === p.id;

            return (
              <g
                key={`pg-pt-${p.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (inStrip) setInspectedStripPointId(p.id);
                }}
                onMouseDown={(e) => {
                  handlePointMouseDown(p.id, e);
                  if (inStrip) setInspectedStripPointId(p.id);
                }}
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
                    setPoints((prev) => prev.map((pt) => pt.id === p.id ? { ...pt, y: Math.max(15, pt.y - 10) } : pt));
                  } else if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setPoints((prev) => prev.map((pt) => pt.id === p.id ? { ...pt, y: Math.min(265, pt.y + 10) } : pt));
                  } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    setPoints((prev) => prev.map((pt) => pt.id === p.id ? { ...pt, x: Math.max(15, pt.x - 10) } : pt));
                  } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    setPoints((prev) => prev.map((pt) => pt.id === p.id ? { ...pt, x: Math.min(485, pt.x + 10) } : pt));
                  }
                }}
                style={{ cursor: isDragged ? 'grabbing' : 'grab' }}
              >
                {/* Drag target hitzone */}
                <circle cx={p.x} cy={p.y} r={16} fill="transparent" />

                {/* Outer halo if inspected strip point */}
                {isInspected && showGridBoxes && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={13}
                    fill="none"
                    stroke="var(--success)"
                    strokeWidth={2}
                    strokeDasharray="3 3"
                  />
                )}

                {/* Outer ring if in central strip */}
                {inStrip && showStrip && points.length >= 2 && !isBest && !isInspected && (
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
                  fill={isBest ? 'var(--success)' : isInspected ? 'var(--success)' : isDragged ? 'var(--accent)' : 'var(--accent)'}
                  stroke={isBest || isInspected ? '#059669' : '#0284c7'}
                  strokeWidth={2}
                />
                <text
                  x={p.x}
                  y={p.y - 12}
                  textAnchor="middle"
                  fill="var(--text)"
                  fontFamily="var(--font-mono)"
                  fontSize="13px"
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

      {/* Explanatory Callout with CLRS / Kleinberg-Tardos 15-Point Geometric Proof */}
      <div style={{ backgroundColor: 'var(--surface)', padding: '0.85rem 1rem', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.6 }}>
        <strong style={{ color: 'var(--accent)', display: 'block', marginBottom: '0.25rem' }}>
          {language === 'es' ? 'Fundamento Geométrico: Lema de las Celdas δ/2 y la Cota de 15 Puntos (Kleinberg-Tardos / CLRS):' : 'Geometric Foundation: δ/2 Cell Lemma & 15-Point Upper Bound (Kleinberg-Tardos / CLRS):'}
        </strong>
        {language === 'es' ? (
          <div>
            1. <strong>Celdas de tamaño δ/2 × δ/2:</strong> La franja central de ancho 2δ ([L - δ, L + δ]) se particiona en 4 columnas verticales de ancho δ/2 (2 a la izquierda de L y 2 a la derecha). La diagonal máxima interna de cada celda es √( (δ/2)² + (δ/2)² ) = δ/√2 ≈ 0.707δ &lt; δ.<br />
            2. <strong>Principio del palomar:</strong> Como todo par de puntos del mismo lado dista al menos δ por hipótesis inductiva, <em>ninguna celda de δ/2 × δ/2 puede contener más de 1 punto</em>.<br />
            3. <strong>Ventana de inspección 2δ × 2δ:</strong> Para cualquier punto p en la franja, cualquier candidato a distancia &lt; δ debe satisfacer |y_q - y_p| ≤ δ. Esta caja vertical de 2δ contiene exactamente 4 filas × 4 columnas = <strong>16 celdas</strong>.<br />
            4. <strong>A lo sumo 15 candidatos:</strong> Como una de las 16 celdas está ocupada por el propio punto p, existen <em>a lo sumo 15 otros puntos</em> en toda la ventana. El punto número 16 en adelante en orden de Y está garantizado a distancia vertical &gt; δ. Por tanto, combinar la franja requiere solo O(1) comprobaciones por punto, logrando T(n) = 2T(n/2) + O(n) = O(n log n).
          </div>
        ) : (
          <div>
            1. <strong>δ/2 × δ/2 Grid Boxes:</strong> The 2δ strip [L - δ, L + δ] splits into 4 vertical columns of width δ/2. The diagonal inside any cell is √( (δ/2)² + (δ/2)² ) = δ/√2 ≈ 0.707δ &lt; δ.<br />
            2. <strong>Pigeonhole Principle:</strong> Since all points on the same side are separated by at least δ, <em>no single δ/2 cell can contain more than 1 point</em>.<br />
            3. <strong>2δ × 2δ Inspection Window:</strong> For any point p, candidates within distance δ must lie in [y_p - δ, y_p + δ], spanning 4 rows × 4 columns = <strong>16 cells</strong>.<br />
            4. <strong>At most 15 candidate points:</strong> Point p occupies one cell, leaving <em>at most 15 other points</em> in the bounding box. The 16th point and beyond are guaranteed to have vertical distance &gt; δ. Strip merge is linear O(n), preserving T(n) = 2T(n/2) + O(n) ⇒ O(n log n).
          </div>
        )}
      </div>
    </div>
  );
};
