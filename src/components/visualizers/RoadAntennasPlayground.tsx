import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { solveRoadAntennas } from '../../engine/algorithms/roadAntennasValidator';
import './RoadAntennasPlayground.css';

interface Preset {
  id: string;
  name: { es: string; en: string };
  houses: number[];
  radius: number;
}

const PRESETS: Preset[] = [
  {
    id: 'ruta2',
    name: {
      es: 'Ruta 2 (Pueblos Guía Ej. 10: Lezama 156, Castelli 185, Sevigne 194, Guido 242, Maipú 270)',
      en: 'Highway 2 (Towns: Lezama 156, Castelli 185, Sevigne 194, Guido 242, Maipú 270)'
    },
    houses: [156, 185, 194, 242, 270],
    radius: 50
  },
  {
    id: 'dispersas',
    name: {
      es: 'Casas Dispersas (9 casas, R = 10 km)',
      en: 'Scattered Houses (9 houses, R = 10 km)'
    },
    houses: [4, 12, 18, 26, 32, 45, 60, 68, 75],
    radius: 10
  },
  {
    id: 'clusters',
    name: {
      es: 'Tres Clusters Aislados (R = 8 km)',
      en: 'Three Isolated Clusters (R = 8 km)'
    },
    houses: [10, 14, 22, 50, 56, 62, 90, 95, 102],
    radius: 8
  }
];

export const RoadAntennasPlayground: React.FC = () => {
  const { language, t } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [houses, setHouses] = useState<number[]>([4, 12, 18, 26, 32, 45, 60, 68, 75]);
  const [radius, setRadius] = useState<number>(10);
  const [userAntennas, setUserAntennas] = useState<number[]>([]);
  const [activeTool, setActiveTool] = useState<'place_antenna' | 'place_house'>('place_antenna');
  const [cursorKm, setCursorKm] = useState<number>(30);
  const [inputKm, setInputKm] = useState<string>('30');
  const [draggingAntennaIdx, setDraggingAntennaIdx] = useState<number | null>(null);
  const [draggingHouseIdx, setDraggingHouseIdx] = useState<number | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragOffsetKm = useRef(0);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const activeMaxKmRef = useRef<number | null>(null);
  const lastInteractionTime = useRef<number>(0);

  // Compute canonical greedy solution
  const greedyAntennas = useMemo(() => {
    return solveRoadAntennas(houses, radius);
  }, [houses, radius]);

  // Compute which houses are covered by user antennas
  const userCoveredIndices = useMemo(() => {
    const covered = new Set<number>();
    houses.forEach((h, idx) => {
      const isCov = userAntennas.some((a) => Math.abs(h - a) <= radius + 1e-4);
      if (isCov) covered.add(idx);
    });
    return covered;
  }, [houses, userAntennas, radius]);

  const allCovered = userCoveredIndices.size === houses.length && houses.length > 0;
  const isMinimal = allCovered && userAntennas.length <= greedyAntennas.length;
  const isSuboptimal = allCovered && userAntennas.length > greedyAntennas.length;

  useEffect(() => {
    if (isMinimal) {
      markAttempted('road-antennas-greedy');
    }
  }, [isMinimal, markAttempted]);

  // SVG scaling
  const svgWidth = 840;
  const svgHeight = 220;
  const padX = 50;
  const roadY = 135;

  const maxKm = useMemo(() => {
    const all = [...houses, ...userAntennas, ...greedyAntennas];
    const m = all.length > 0 ? Math.max(...all) + radius + 10 : 100;
    return Math.ceil(m / 10) * 10;
  }, [houses, userAntennas, greedyAntennas, radius]);

  const kmToX = (km: number) => {
    const effMax = activeMaxKmRef.current || maxKm;
    return padX + (km / effMax) * (svgWidth - 2 * padX);
  };

  const xToKm = (xPx: number, customMaxKm?: number) => {
    const effMax = customMaxKm || activeMaxKmRef.current || maxKm;
    const clamped = Math.max(padX, Math.min(svgWidth - padX, xPx));
    const ratio = (clamped - padX) / (svgWidth - 2 * padX);
    return Math.round(ratio * effMax);
  };

  const getSvgX = (clientX: number): number => {
    const svg = svgRef.current;
    if (svg) {
      try {
        const ctm = svg.getScreenCTM();
        if (ctm) {
          const pt = svg.createSVGPoint();
          pt.x = clientX;
          pt.y = 0;
          return pt.matrixTransform(ctm.inverse()).x;
        }
      } catch {
        // fallback
      }
      const rect = svg.getBoundingClientRect();
      if (rect.width > 0) {
        return ((clientX - rect.left) / rect.width) * svgWidth;
      }
    }
    return 0;
  };

  const handleApplyActionAtKm = (targetKm: number) => {
    const clampedKm = Math.max(0, Math.min(maxKm, Math.round(targetKm)));
    if (activeTool === 'place_antenna') {
      const existingIdx = userAntennas.findIndex((a) => Math.abs(a - clampedKm) < Math.max(2, radius * 0.2));
      if (existingIdx !== -1) {
        setUserAntennas((prev) => prev.filter((_, idx) => idx !== existingIdx));
      } else {
        setUserAntennas((prev) => [...prev, clampedKm].sort((a, b) => a - b));
      }
    } else {
      const existingHouseIdx = houses.findIndex((h) => Math.abs(h - clampedKm) < Math.max(2, maxKm * 0.02));
      if (existingHouseIdx !== -1) {
        setHouses((prev) => prev.filter((_, idx) => idx !== existingHouseIdx));
      } else {
        setHouses((prev) => [...prev, clampedKm].sort((a, b) => a - b));
      }
    }
  };

  const handlePointerDownAntenna = (idx: number, e: React.PointerEvent) => {
    e.stopPropagation();
    activeMaxKmRef.current = maxKm;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;
    const initialSvgX = getSvgX(e.clientX);
    const mouseKm = xToKm(initialSvgX, activeMaxKmRef.current);
    dragOffsetKm.current = userAntennas[idx] - mouseKm;
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {
      // fallback
    }
    setDraggingAntennaIdx(idx);
  };

  const handlePointerDownHouse = (idx: number, e: React.PointerEvent) => {
    e.stopPropagation();
    activeMaxKmRef.current = maxKm;
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    isDraggingRef.current = false;
    const initialSvgX = getSvgX(e.clientX);
    const mouseKm = xToKm(initialSvgX, activeMaxKmRef.current);
    dragOffsetKm.current = houses[idx] - mouseKm;
    try {
      (e.currentTarget as Element).setPointerCapture(e.pointerId);
    } catch {
      // fallback
    }
    setDraggingHouseIdx(idx);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (draggingAntennaIdx === null && draggingHouseIdx === null) return;
    const dist = Math.hypot(e.clientX - dragStartPos.current.x, e.clientY - dragStartPos.current.y);
    if (dist > 5) {
      isDraggingRef.current = true;
    }
    const effMaxKm = activeMaxKmRef.current || maxKm;
    const currentSvgX = getSvgX(e.clientX);
    const currentMouseKm = xToKm(currentSvgX, effMaxKm);

    if (draggingAntennaIdx !== null) {
      const targetKm = Math.max(0, Math.min(effMaxKm, Math.round(currentMouseKm + dragOffsetKm.current)));
      setUserAntennas((prev) => {
        const copy = [...prev];
        copy[draggingAntennaIdx] = targetKm;
        return copy;
      });
      setCursorKm(targetKm);
      setInputKm(String(targetKm));
    } else if (draggingHouseIdx !== null) {
      const targetKm = Math.max(0, Math.min(effMaxKm, Math.round(currentMouseKm + dragOffsetKm.current)));
      setHouses((prev) => {
        const copy = [...prev];
        copy[draggingHouseIdx] = targetKm;
        return copy;
      });
      setCursorKm(targetKm);
      setInputKm(String(targetKm));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingAntennaIdx !== null || draggingHouseIdx !== null) {
      try {
        (e.currentTarget as Element || e.target as Element).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      if (draggingAntennaIdx !== null) {
        setUserAntennas((prev) => [...prev].sort((a, b) => a - b));
        setDraggingAntennaIdx(null);
      }
      if (draggingHouseIdx !== null) {
        setHouses((prev) => [...prev].sort((a, b) => a - b));
        setDraggingHouseIdx(null);
      }
      activeMaxKmRef.current = null;
      lastInteractionTime.current = Date.now();
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 80);
    }
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDraggingRef.current || (Date.now() - lastInteractionTime.current) < 250) return;
    const clickX = getSvgX(e.clientX);
    const clickedKm = xToKm(clickX);
    setCursorKm(clickedKm);
    setInputKm(String(clickedKm));
    handleApplyActionAtKm(clickedKm);
  };

  return (
    <div className="road-antennas-playground">
      {/* Control Configuration Grid */}
      <div className="playground-controls-grid">
        <div className="playground-control-group">
          <label>{language === 'es' ? 'Escenarios de prueba:' : 'Preset Scenarios:'}</label>
          <div className="preset-buttons-row">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                className="preset-btn"
                onClick={() => {
                  setHouses(p.houses);
                  setRadius(p.radius);
                  setUserAntennas([]);
                }}
              >
                {t(p.name)}
              </button>
            ))}
            <button
              type="button"
              className="preset-btn"
              onClick={() => {
                setHouses([15, 35, 55, 75]);
                setRadius(12);
                setUserAntennas([]);
              }}
            >
              {language === 'es' ? 'Caso propio' : 'Custom case'}
            </button>
          </div>
        </div>

        <div className="playground-control-group">
          <label htmlFor="radius-slider">
            {language === 'es' ? `Radio de cobertura R: ${radius} km` : `Coverage radius R: ${radius} km`}
          </label>
          <input
            id="radius-slider"
            type="range"
            min="5"
            max="60"
            step="1"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
          />
        </div>

        <div className="playground-control-group">
          <label>{language === 'es' ? 'Herramienta de clic en la ruta:' : 'Highway click tool:'}</label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className={`preset-btn ${activeTool === 'place_antenna' ? 'active' : ''}`}
              style={activeTool === 'place_antenna' ? { background: 'var(--accent)', color: '#fff' } : {}}
              onClick={() => setActiveTool('place_antenna')}
            >
              {language === 'es' ? 'Colocar / Quitar Antena' : 'Place / Remove Antenna'}
            </button>
            <button
              type="button"
              className={`preset-btn ${activeTool === 'place_house' ? 'active' : ''}`}
              style={activeTool === 'place_house' ? { background: 'var(--warning)', color: '#fff' } : {}}
              onClick={() => setActiveTool('place_house')}
            >
              {language === 'es' ? 'Agregar / Quitar Casa' : 'Add / Remove House'}
            </button>
          </div>
        </div>

        <div className="playground-control-group">
          <label htmlFor="km-direct-input">
            {language === 'es' ? 'Ingreso numérico directo (km):' : 'Direct numeric entry (km):'}
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              id="km-direct-input"
              type="number"
              min="0"
              max={maxKm}
              value={inputKm}
              onChange={(e) => setInputKm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = Number(inputKm);
                  if (!isNaN(val)) {
                    handleApplyActionAtKm(val);
                    setCursorKm(Math.max(0, Math.min(maxKm, Math.round(val))));
                  }
                }
              }}
              style={{ width: '80px', padding: '5px 8px', borderRadius: '4px', border: '1px solid var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-text)' }}
            />
            <button
              type="button"
              className="preset-btn"
              onClick={() => {
                const val = Number(inputKm);
                if (!isNaN(val)) {
                  handleApplyActionAtKm(val);
                  setCursorKm(Math.max(0, Math.min(maxKm, Math.round(val))));
                }
              }}
            >
              {activeTool === 'place_antenna'
                ? (language === 'es' ? 'Colocar / Quitar en km' : 'Place / Remove at km')
                : (language === 'es' ? 'Colocar / Quitar casa' : 'Place / Remove house')}
            </button>
          </div>
        </div>
      </div>

      {/* Challenge Status Bar */}
      <div className="playground-challenge-card">
        <div className="challenge-stats">
          <div className="challenge-stat-item">
            <span className="challenge-stat-label">{language === 'es' ? 'Casas Cubiertas' : 'Covered Houses'}</span>
            <span className="challenge-stat-val">
              {userCoveredIndices.size} / {houses.length}
            </span>
          </div>
          <div className="challenge-stat-item">
            <span className="challenge-stat-label">{language === 'es' ? 'Tus Antenas' : 'Your Antennas'}</span>
            <span className="challenge-stat-val" style={{ color: 'var(--accent)' }}>
              {userAntennas.length}
            </span>
          </div>
          <div className="challenge-stat-item">
            <span className="challenge-stat-label">{language === 'es' ? 'Mínimo Óptimo (Greedy)' : 'Greedy Optimal Min'}</span>
            <span className="challenge-stat-val" style={{ color: 'var(--success)' }}>
              {greedyAntennas.length}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: '0.85rem' }}
            onClick={() => setUserAntennas([])}
          >
            {language === 'es' ? 'Limpiar mis antenas' : 'Clear my antennas'}
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {isMinimal ? (
        <div className="challenge-feedback-banner success">
          {language === 'es'
            ? `Cobertura factible óptima: se cubrieron las ${houses.length} casas utilizando exactamente ${userAntennas.length} antena(s).`
            : `Optimal feasible coverage: all ${houses.length} houses covered using exactly ${userAntennas.length} antenna(s).`}
        </div>
      ) : isSuboptimal ? (
        <div className="challenge-feedback-banner suboptimal">
          {language === 'es'
            ? `[Aviso de Subóptimo] Cobertura completa lograda, pero usaste ${userAntennas.length} antenas cuando el óptimo teórico requiere solo ${greedyAntennas.length}. ¿Podés lograrlo moviendo las antenas más hacia la derecha?`
            : `[Suboptimal Notice] Full coverage achieved, but you used ${userAntennas.length} antennas when optimal only needs ${greedyAntennas.length}. Can you improve by shifting antennas further right?`}
        </div>
      ) : (
        <div className="challenge-feedback-banner incomplete">
          {language === 'es'
            ? `Hacé clic a lo largo de la ruta para colocar antenas y dar cobertura a las casas. Quedan ${houses.length - userCoveredIndices.size} casa(s) sin señal.`
            : `Click along the highway to place antennas and cover the houses. ${houses.length - userCoveredIndices.size} house(s) remain without signal.`}
        </div>
      )}

      {/* Interactive Road SVG */}
      <div className="interactive-road-canvas-wrap">
        <svg
          ref={svgRef}
          className="interactive-road-svg"
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          width="100%"
          height={svgHeight}
          onClick={handleSvgClick}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          tabIndex={0}
          role="region"
          aria-label={
            language === 'es'
              ? `Carretera interactiva. Cursor en ${cursorKm} km. Flechas izquierda y derecha para moverte, Enter o Espacio para ${activeTool === 'place_antenna' ? 'colocar o quitar antena' : 'colocar o quitar casa'}.`
              : `Interactive highway. Cursor at ${cursorKm} km. Left and right arrow keys to navigate, Enter or Space to ${activeTool === 'place_antenna' ? 'place or remove antenna' : 'place or remove house'}.`
          }
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault();
              const step = e.shiftKey ? 1 : 5;
              const nextKm = Math.max(0, cursorKm - step);
              setCursorKm(nextKm);
              setInputKm(String(nextKm));
            } else if (e.key === 'ArrowRight') {
              e.preventDefault();
              const step = e.shiftKey ? 1 : 5;
              const nextKm = Math.min(maxKm, cursorKm + step);
              setCursorKm(nextKm);
              setInputKm(String(nextKm));
            } else if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleApplyActionAtKm(cursorKm);
            }
          }}
          style={{ outline: 'none' }}
        >
          {/* Background */}
          <rect x="0" y="0" width={svgWidth} height={svgHeight} fill="transparent" />

          {/* Accessible Keyboard & Mouse Cursor Marker */}
          <g className="road-cursor-marker" aria-hidden="true">
            <line
              x1={kmToX(cursorKm)}
              y1={roadY - 20}
              x2={kmToX(cursorKm)}
              y2={roadY + 24}
              stroke="var(--warning)"
              strokeWidth="2"
              strokeDasharray="3 3"
            />
            <polygon
              points={`${kmToX(cursorKm)},${roadY - 2} ${kmToX(cursorKm) - 5},${roadY - 12} ${kmToX(cursorKm) + 5},${roadY - 12}`}
              fill="var(--warning)"
            />
            <text
              x={kmToX(cursorKm)}
              y={roadY - 18}
              textAnchor="middle"
              fill="var(--warning)"
              fontSize="13"
              fontWeight="700"
            >
              {cursorKm}k
            </text>
          </g>

          {/* Kilometer tick marks along road */}
          {Array.from({ length: Math.floor(maxKm / 10) + 1 }).map((_, idx) => {
            const km = idx * 10;
            const x = kmToX(km);
            return (
              <g key={`p-tick-${km}`}>
                <line x1={x} y1={roadY - 6} x2={x} y2={roadY + 20} stroke="var(--graph-edge-subtle)" strokeWidth="1.5" />
                <text
                  x={x}
                  y={roadY + 34}
                  textAnchor="middle"
                  fill="var(--color-text-muted)"
                  fontSize="13"
                  fontFamily="var(--font-sans)"
                >
                  {km}k
                </text>
              </g>
            );
          })}

          {/* The Road Surface */}
          <rect
            x={padX - 10}
            y={roadY}
            width={svgWidth - 2 * padX + 20}
            height="14"
            rx="3"
            fill="#334155"
          />
          <line
            x1={padX - 5}
            y1={roadY + 7}
            x2={svgWidth - padX + 5}
            y2={roadY + 7}
            stroke="#f8fafc"
            strokeWidth="2"
            strokeDasharray="8 6"
          />

          {/* User Antennas and Coverage Spans */}
          {userAntennas.map((antKm, aIdx) => {
            const antX = kmToX(antKm);
            const spanLeft = kmToX(Math.max(0, antKm - radius));
            const spanRight = kmToX(antKm + radius);
            const spanWidth = Math.max(0, spanRight - spanLeft);

            return (
              <g
                key={`user-ant-${aIdx}`}
                onPointerDown={(e) => handlePointerDownAntenna(aIdx, e)}
                tabIndex={0}
                role="slider"
                aria-label={
                  language === 'es'
                    ? `Antena ${aIdx + 1} en km ${antKm}`
                    : `Antenna ${aIdx + 1} at km ${antKm}`
                }
                aria-valuenow={antKm}
                aria-valuemin={0}
                aria-valuemax={maxKm}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    setUserAntennas((prev) => {
                      const next = [...prev];
                      next[aIdx] = Math.max(0, next[aIdx] - 1);
                      return next;
                    });
                  } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    setUserAntennas((prev) => {
                      const next = [...prev];
                      next[aIdx] = Math.min(maxKm, next[aIdx] + 1);
                      return next;
                    });
                  } else if (e.key === 'Delete' || e.key === 'Backspace') {
                    e.preventDefault();
                    setUserAntennas((prev) => prev.filter((_, i) => i !== aIdx));
                  }
                }}
                style={{
                  cursor: draggingAntennaIdx === aIdx ? 'grabbing' : 'grab',
                  outline: 'none',
                  touchAction: 'none'
                }}
              >
                <rect
                  x={spanLeft}
                  y={roadY - 45}
                  width={spanWidth}
                  height="55"
                  rx="10"
                  fill="rgba(99, 102, 241, 0.18)"
                  stroke="var(--accent)"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  pointerEvents="none"
                />
                <line x1={antX} y1={roadY} x2={antX} y2={roadY - 70} stroke="transparent" strokeWidth="28" style={{ cursor: draggingAntennaIdx === aIdx ? 'grabbing' : 'grab' }} />
                <circle cx={antX} cy={roadY - 65} r="16" fill="transparent" style={{ cursor: draggingAntennaIdx === aIdx ? 'grabbing' : 'grab' }} />
                <line x1={antX} y1={roadY} x2={antX} y2={roadY - 65} stroke="var(--accent)" strokeWidth="3" pointerEvents="none" />
                <circle cx={antX} cy={roadY - 65} r="6" fill="var(--accent)" stroke="var(--surface)" strokeWidth="2" pointerEvents="none" />
                <text
                  x={antX}
                  y={roadY - 72}
                  textAnchor="middle"
                  fill="var(--accent)"
                  fontSize="13"
                  fontWeight="bold"
                  pointerEvents="none"
                >
                  {antKm}k
                </text>
              </g>
            );
          })}

          {/* Optional Overlay: Canonical Greedy Antennas */}
          {isMinimal &&
            greedyAntennas.map((gKm, gIdx) => {
              const gX = kmToX(gKm);
              const spanLeft = kmToX(Math.max(0, gKm - radius));
              const spanRight = kmToX(gKm + radius);
              const spanWidth = Math.max(0, spanRight - spanLeft);

              return (
                <g key={`greedy-overlay-${gIdx}`}>
                  <rect
                    x={spanLeft}
                    y={roadY - 50}
                    width={spanWidth}
                    height="60"
                    rx="10"
                    fill="var(--state-solution-bg)"
                    stroke="var(--success)"
                    strokeWidth="2"
                  />
                  <line x1={gX} y1={roadY} x2={gX} y2={roadY - 80} stroke="var(--success)" strokeWidth="2" strokeDasharray="3 3" />
                  <circle cx={gX} cy={roadY - 80} r="5" fill="var(--success)" />
                  <text
                    x={gX}
                    y={roadY - 87}
                    textAnchor="middle"
                    fill="var(--success)"
                    fontSize="13"
                    fontWeight="bold"
                  >
                    Opt: {gKm}k
                  </text>
                </g>
              );
            })}

          {/* Houses */}
          {houses.map((hKm, hIdx) => {
            const hX = kmToX(hKm);
            const isCovered = userCoveredIndices.has(hIdx);
            const houseColor = isCovered ? 'var(--success)' : 'var(--warning)';

            return (
              <g
                key={`house-${hIdx}`}
                onPointerDown={(e) => handlePointerDownHouse(hIdx, e)}
                tabIndex={0}
                role="slider"
                aria-label={
                  language === 'es'
                    ? `Casa ${hIdx + 1} en km ${hKm}${isCovered ? ' (cubierta)' : ' (sin cobertura)'}`
                    : `House ${hIdx + 1} at km ${hKm}${isCovered ? ' (covered)' : ' (uncovered)'}`
                }
                aria-valuenow={hKm}
                aria-valuemin={0}
                aria-valuemax={maxKm}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    setHouses((prev) => {
                      const next = [...prev];
                      next[hIdx] = Math.max(0, next[hIdx] - 1);
                      return next;
                    });
                  } else if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    setHouses((prev) => {
                      const next = [...prev];
                      next[hIdx] = Math.min(maxKm, next[hIdx] + 1);
                      return next;
                    });
                  } else if (e.key === 'Delete' || e.key === 'Backspace') {
                    e.preventDefault();
                    setHouses((prev) => prev.filter((_, i) => i !== hIdx));
                  }
                }}
                style={{
                  cursor: draggingHouseIdx === hIdx ? 'grabbing' : 'grab',
                  outline: 'none',
                  touchAction: 'none'
                }}
              >
                <polygon
                  points={`${hX - 8},${roadY - 14} ${hX + 8},${roadY - 14} ${hX},${roadY - 23}`}
                  fill={houseColor}
                />
                <rect
                  x={hX - 6}
                  y={roadY - 14}
                  width="12"
                  height="11"
                  fill={houseColor}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
                <text
                  x={hX}
                  y={roadY - 26}
                  textAnchor="middle"
                  fill="var(--color-text)"
                  fontSize="13"
                  fontFamily="var(--font-sans)"
                >
                  {hKm}k
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Accessible List of User Placed Antennas */}
      {userAntennas.length > 0 && (
        <div className="placed-antennas-bar">
          <span className="placed-antennas-label">
            {language === 'es' ? 'Tus antenas instaladas:' : 'Your placed antennas:'}
          </span>
          <div className="placed-antennas-chips">
            {userAntennas.map((antKm, idx) => (
              <span key={`chip-${antKm}-${idx}`} className="antenna-chip">
                {antKm}k [{Math.max(0, antKm - radius)}–{Math.min(maxKm, antKm + radius)}k]
                <button
                  type="button"
                  className="antenna-chip-remove"
                  aria-label={language === 'es' ? `Eliminar antena en km ${antKm}` : `Remove antenna at km ${antKm}`}
                  onClick={() => setUserAntennas((prev) => prev.filter((_, i) => i !== idx))}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
