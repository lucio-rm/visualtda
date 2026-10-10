import React, { useMemo } from 'react';
import {
  generateRnaTrace,
  RnaStepData,
  DEFAULT_RNA_SEQUENCE
} from '../../engine/algorithms/rnaSecondaryStructureTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './RnaSecondaryStructureVisualizer.css';

export const RnaSecondaryStructureVisualizer: React.FC = () => {
  const { language } = useLanguage();

  const timeline = useMemo(() => generateRnaTrace(DEFAULT_RNA_SEQUENCE), []);

  const {
    currentStepIndex,
    totalSteps,
    currentEvent,
    isPlaying,
    playbackSpeed,
    togglePlay,
    stepForward,
    stepBackward,
    goToStep,
    reset,
    setSpeed
  } = useTraceTimeline<RnaStepData>(timeline, {
    baseIntervalMs: 650,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const sequence = data?.sequence || DEFAULT_RNA_SEQUENCE;
  const n = sequence.length;
  const currentI = data?.currentI ?? 0;
  const currentJ = data?.currentJ ?? 0;
  const testedT = data?.testedT;
  const pairs = data?.pairs || [];
  const dpMatrix = data?.dpMatrix || [];
  const action = data?.action || 'INIT';
  const description = data?.description;

  // Base colors
  const baseColorMap: Record<string, string> = {
    A: 'var(--accent)', // sky
    U: 'var(--warning)', // amber
    C: 'var(--success)', // emerald
    G: '#ec4899'  // pink
  };

  // SVG dimensions for arc diagram
  const svgWidth = 560;
  const svgHeight = 180;
  const padLeft = 40;
  const spacing = (svgWidth - 2 * padLeft) / (n - 1);
  const baselineY = 140;

  return (
    <div
      className="rna-visualizer"
      role="region"
      aria-label={language === 'es' ? 'Visualizador de Estructura Secundaria de ARN' : 'RNA Secondary Structure Visualizer'}
    >
      {/* Metrics Row */}
      <div className="rna-metrics-row">
        <div className="rna-metric-badge">
          <span>{language === 'es' ? 'Secuencia:' : 'Sequence:'}</span>
          <strong style={{ letterSpacing: '2px' }}>{sequence}</strong>
        </div>
        <div className="rna-metric-badge">
          <span>{language === 'es' ? 'Subcadena activa:' : 'Active Substring:'}</span>
          <strong>[{currentI} .. {currentJ}]</strong>
        </div>
        <div className="rna-metric-badge">
          <span>{language === 'es' ? 'Pares Emparejados:' : 'Paired Bases:'}</span>
          <strong style={{ color: 'var(--success)' }}>{pairs.length}</strong>
        </div>
        <div className="rna-metric-badge rna-action-badge">
          <span>{language === 'es' ? 'Fase:' : 'Phase:'}</span>
          <strong>{action}</strong>
        </div>
      </div>

      {/* Narrative Step Description */}
      <div className="trace-step-description" role="status" aria-live="polite">
        <p>{description ? (language === 'es' ? description.es : description.en) : ''}</p>
      </div>

      {/* SVG Arc Diagram Canvas */}
      <div className="rna-canvas-container">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{
            width: '100%',
            maxWidth: 'min(100%, 640px)',
            maxHeight: 'min(340px, calc(100vh - 340px))',
            height: 'auto',
            display: 'block',
            margin: '0 auto'
          }}
          role="img"
          aria-label={language === 'es' ? 'Diagrama de arcos de la estructura de ARN' : 'RNA structure arc diagram'}
        >
          {/* Active Substring Highlight Band */}
          <rect
            x={padLeft + currentI * spacing - 16}
            y={baselineY - 18}
            width={(currentJ - currentI) * spacing + 32}
            height={36}
            rx={18}
            fill="var(--state-active-bg)"
            stroke="var(--accent)"
            strokeWidth={1}
            strokeDasharray="3,3"
          />

          {/* Arcs for active pairings */}
          {pairs.map((p, idx) => {
            const x1 = padLeft + p.i * spacing;
            const x2 = padLeft + p.j * spacing;
            const radius = (x2 - x1) / 2;
            const arcH = Math.min(100, radius * 0.9);

            return (
              <path
                key={`pair-${idx}-${p.i}-${p.j}`}
                d={`M ${x1} ${baselineY - 14} Q ${(x1 + x2) / 2} ${baselineY - 14 - arcH * 1.6} ${x2} ${baselineY - 14}`}
                fill="none"
                stroke="var(--success)"
                strokeWidth={2.5}
                strokeLinecap="round"
              />
            );
          })}

          {/* Tested T candidate arc */}
          {testedT !== null && testedT !== undefined && (
            <path
              d={`M ${padLeft + testedT * spacing} ${baselineY - 14} Q ${(padLeft + (testedT + currentJ) * spacing / 2)} ${baselineY - 14 - (currentJ - testedT) * 12} ${padLeft + currentJ * spacing} ${baselineY - 14}`}
              fill="none"
              stroke="var(--warning)"
              strokeWidth={2}
              strokeDasharray="4,2"
            />
          )}

          {/* Nucleotide nodes */}
          {Array.from(sequence).map((base, idx) => {
            const x = padLeft + idx * spacing;
            const color = baseColorMap[base] || 'var(--accent)';
            const isJ = idx === currentJ;
            const isT = idx === testedT;

            return (
              <g key={`base-${idx}`}>
                <circle
                  cx={x}
                  cy={baselineY}
                  r={isJ || isT ? 14 : 12}
                  fill={isJ ? 'var(--warning)' : isT ? 'var(--accent)' : 'var(--surface)'}
                  stroke={color}
                  strokeWidth={2}
                />
                <text
                  x={x}
                  y={baselineY + 5}
                  textAnchor="middle"
                  fill={isJ ? 'var(--warning-contrast)' : isT ? 'var(--accent-contrast)' : 'var(--text)'}
                  fontSize="14px"
                  fontWeight="700"
                  fontFamily="var(--font-mono)"
                >
                  {base}
                </text>
                <text
                  x={x}
                  y={baselineY + 26}
                  textAnchor="middle"
                  fill="var(--text-muted)"
                  fontSize="13px"
                  fontFamily="var(--font-mono)"
                >
                  {idx}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* DP Matrix Table OPT[i, j] */}
      <div style={{ overflowX: 'auto' }}>
        <table className="rna-dp-matrix">
          <thead>
            <tr>
              <th>i \ j</th>
              {Array.from(sequence).map((b, colIdx) => (
                <th key={`hdr-${colIdx}`}>{b}_{colIdx}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dpMatrix.map((row, rIdx) => (
              <tr key={`row-${rIdx}`}>
                <th>{sequence[rIdx]}_{rIdx}</th>
                {row.map((val, cIdx) => {
                  const isCur = rIdx === currentI && cIdx === currentJ;
                  const isUpper = cIdx >= rIdx;

                  return (
                    <td
                      key={`cell-${rIdx}-${cIdx}`}
                      style={{
                        backgroundColor: isCur
                          ? 'var(--state-active-bg)'
                          : isUpper
                          ? undefined
                          : 'rgba(0,0,0,0.05)',
                        color: isCur ? 'var(--accent)' : !isUpper ? 'var(--text-muted)' : undefined,
                        fontWeight: isCur ? '700' : '400',
                        fontFamily: 'var(--font-mono)'
                      }}
                    >
                      {isUpper ? val : '·'}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Interval DP & Nussinov Recurrence Card */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Recurrencia DP sobre Intervalos (Algoritmo de Nussinov):' : 'Interval DP Recurrence (Nussinov’s Algorithm):'}</strong>{' '}
        {language === 'es'
          ? 'Para aparear bases Watson-Crick (A-U, C-G) sin pseudonudos y con separación mínima j - t > 4: OPT(i, j) = max(OPT(i, j-1), max_{t} (1 + OPT(i, t-1) + OPT(t+1, j-1))). Dicotomía: la base j o bien queda libre (heredando OPT(i, j-1)), o se aparea con alguna base complementaria t, dividiendo el problema en dos subintervalos disjuntos independientes. Llenado por diagonales (longitud creciente L=j-i): tiempo O(n³) y memoria O(n²).'
          : 'To pair Watson-Crick bases (A-U, C-G) without pseudoknots and with minimum hairpin loop separation j - t > 4: OPT(i, j) = max(OPT(i, j-1), max_{t} (1 + OPT(i, t-1) + OPT(t+1, j-1))). Dichotomy: base j either remains unpaired (OPT(i, j-1)) or binds to base t, splitting into two independent subproblems. Filled along diagonals of increasing length L=j-i: time O(n³), space O(n²).'}
      </div>

      {/* Playback Controls */}
      <div className="trace-controls" role="toolbar" aria-label={language === 'es' ? 'Controles de reproducción' : 'Playback controls'}>
        <div className="trace-buttons">
          <button
            type="button"
            className="btn-control"
            onClick={reset}
            aria-label={language === 'es' ? 'Reiniciar visualización' : 'Reset visualization'}
          >
            ↺
          </button>
          <button
            type="button"
            className="btn-control"
            onClick={stepBackward}
            disabled={currentStepIndex <= 0}
            aria-label={language === 'es' ? 'Paso anterior' : 'Previous step'}
          >
            ←
          </button>
          <button
            type="button"
            className="btn-control btn-play"
            onClick={togglePlay}
            aria-label={isPlaying ? (language === 'es' ? 'Pausar' : 'Pause') : (language === 'es' ? 'Reproducir' : 'Play')}
          >
            {isPlaying ? '❚❚' : '▶'}
          </button>
          <button
            type="button"
            className="btn-control"
            onClick={stepForward}
            disabled={currentStepIndex >= totalSteps - 1}
            aria-label={language === 'es' ? 'Siguiente paso' : 'Next step'}
          >
            →
          </button>
        </div>

        <div className="trace-scrubber">
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStepIndex}
            onChange={(e) => goToStep(Number(e.target.value))}
            aria-label={language === 'es' ? 'Línea de tiempo del paso' : 'Step timeline'}
          />
          <span className="step-counter">
            {language === 'es' ? 'Paso' : 'Step'} {currentStepIndex + 1} / {totalSteps}
          </span>
        </div>

        <div className="trace-speed">
          <span>{language === 'es' ? 'Velocidad:' : 'Speed:'}</span>
          {[1, 2, 4].map((spd) => (
            <button
              key={spd}
              type="button"
              className={`btn-speed ${playbackSpeed === spd ? 'active' : ''}`}
              onClick={() => setSpeed(spd)}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
