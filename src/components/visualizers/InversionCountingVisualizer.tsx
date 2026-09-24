import React, { useState, useMemo } from 'react';
import {
  generateInversionTrace,
  InversionStepData
} from '../../engine/algorithms/inversionCountingTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import './InversionCountingVisualizer.css';

interface InversionPreset {
  id: string;
  label: { es: string; en: string };
  array: number[];
}

const PRESETS: InversionPreset[] = [
  {
    id: 'clrs',
    label: { es: 'Clásico CLRS [2, 3, 8, 6, 1] (5 inv)', en: 'Classic CLRS [2, 3, 8, 6, 1] (5 inv)' },
    array: [2, 3, 8, 6, 1]
  },
  {
    id: 'reversed',
    label: { es: 'Invertido [5, 4, 3, 2, 1] (10 inv)', en: 'Reversed [5, 4, 3, 2, 1] (10 inv)' },
    array: [5, 4, 3, 2, 1]
  },
  {
    id: 'partial',
    label: { es: 'Parcial [1, 5, 2, 6, 3, 4] (4 inv)', en: 'Partial [1, 5, 2, 6, 3, 4] (4 inv)' },
    array: [1, 5, 2, 6, 3, 4]
  },
  {
    id: 'sorted',
    label: { es: 'Ordenado [1, 2, 3, 4, 5] (0 inv)', en: 'Sorted [1, 2, 3, 4, 5] (0 inv)' },
    array: [1, 2, 3, 4, 5]
  }
];

export const InversionCountingVisualizer: React.FC = () => {
  const { language } = useLanguage();
  const [selectedPresetId, setSelectedPresetId] = useState<string>('clrs');
  const activePreset = PRESETS.find((p) => p.id === selectedPresetId) || PRESETS[0];

  const timeline = useMemo(
    () => generateInversionTrace(activePreset.array),
    [activePreset.array]
  );

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
  } = useTraceTimeline<InversionStepData>(timeline, {
    baseIntervalMs: 700,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const action = data?.action || 'INIT';
  const range = data?.range || [0, activePreset.array.length - 1];
  const leftArray = data?.leftArray || [];
  const rightArray = data?.rightArray || [];
  const mergedArray = data?.mergedArray || [];
  const activeLeftIdx = data?.activeLeftIdx ?? null;
  const activeRightIdx = data?.activeRightIdx ?? null;
  const splitInversions = data?.splitInversions ?? 0;
  const totalInversions = data?.totalInversions ?? 0;
  const added = data?.inversionsAddedThisStep ?? 0;
  const desc = data?.description ? data.description[language] : '';

  return (
    <div className="inversion-visualizer">
      {/* Preset Selector */}
      <div className="inv-presets">
        <span className="inv-presets-label">
          {language === 'es' ? 'Arreglo de Ejemplo:' : 'Sample Array:'}
        </span>
        {PRESETS.map((preset) => (
          <button
            key={preset.id}
            className={`inv-preset-btn ${preset.id === selectedPresetId ? 'active' : ''}`}
            onClick={() => {
              setSelectedPresetId(preset.id);
              reset();
            }}
          >
            {preset.label[language]}
          </button>
        ))}
      </div>

      {/* Top Banner Row */}
      <div className="inv-banner-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className={`inv-phase-pill ${action.toLowerCase()}`}>
            {action.replace(/_/g, ' ')}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)' }}>
            {language === 'es' ? 'Rango Activo:' : 'Active Range:'}{' '}
            <strong style={{ color: 'var(--text, #f8fafc)' }}>
              [{range[0]}..{range[1]}]
            </strong>
          </span>
        </div>

        <div className="inv-metrics-summary">
          <div className="inv-metric-badge">
            <span className="label">
              {language === 'es' ? 'Cruzadas Subarreglo' : 'Subarray Split'}
            </span>
            <span className={`value ${added > 0 ? 'highlight' : ''}`}>
              +{splitInversions}
            </span>
          </div>
          <div className="inv-metric-badge">
            <span className="label">
              {language === 'es' ? 'Total Acumulado' : 'Total Inversions'}
            </span>
            <span className="value highlight">{totalInversions}</span>
          </div>
        </div>
      </div>

      {/* Cross Inversion Formula Callout */}
      {action === 'COUNT_SPLIT' && activeRightIdx !== null && activeLeftIdx !== null && (
        <div className="inv-split-alert">
          <div>
            <div className="inv-split-title">
              {language === 'es'
                ? 'Inversión Cruzada Identificada en Tiempo O(1)'
                : 'Cross Inversion Identified in O(1) Time'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#fef3c7', marginTop: '0.2rem' }}>
              {language === 'es'
                ? `der[${activeRightIdx}]=${rightArray[activeRightIdx]} es menor que izq[${activeLeftIdx}]=${leftArray[activeLeftIdx]}. Por estar ordenado, es menor que todos los ${added} elementos pendientes.`
                : `right[${activeRightIdx}]=${rightArray[activeRightIdx]} < left[${activeLeftIdx}]=${leftArray[activeLeftIdx]}. Being sorted, it is smaller than all ${added} remaining items.`}
            </div>
          </div>
          <div className="inv-split-math">
            +{added} = ({leftArray.length} - {activeLeftIdx})
          </div>
        </div>
      )}

      {/* Workspace Display */}
      <div className="inv-workspace-card">
        {/* Left and Right Halves */}
        <div className="inv-arrays-container">
          <div className="inv-half-box left">
            <div className="inv-half-header">
              <span>{language === 'es' ? 'Mitad Izquierda (Ordenada)' : 'Left Half (Sorted)'}</span>
              <span>{leftArray.length} {language === 'es' ? 'elems' : 'items'}</span>
            </div>
            <div className="inv-cells-row">
              {leftArray.length === 0 ? (
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>-</span>
              ) : (
                leftArray.map((val, idx) => {
                  const isActive = activeLeftIdx === idx;
                  const isVictim = action === 'COUNT_SPLIT' && activeLeftIdx !== null && idx >= activeLeftIdx;
                  return (
                    <div
                      key={idx}
                      className={`inv-cell ${isActive ? 'active-left' : ''} ${isVictim ? 'inversion-victim' : ''}`}
                    >
                      <span className="sub-idx">{idx}</span>
                      {val}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="inv-half-box right">
            <div className="inv-half-header">
              <span>{language === 'es' ? 'Mitad Derecha (Ordenada)' : 'Right Half (Sorted)'}</span>
              <span>{rightArray.length} {language === 'es' ? 'elems' : 'items'}</span>
            </div>
            <div className="inv-cells-row">
              {rightArray.length === 0 ? (
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>-</span>
              ) : (
                rightArray.map((val, idx) => {
                  const isActive = activeRightIdx === idx;
                  const isCause = action === 'COUNT_SPLIT' && activeRightIdx === idx;
                  return (
                    <div
                      key={idx}
                      className={`inv-cell ${isActive ? 'active-right' : ''} ${isCause ? 'inversion-cause' : ''}`}
                    >
                      <span className="sub-idx">{idx}</span>
                      {val}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Merged Array so far */}
        <div className="inv-merged-box">
          <div className="inv-merged-header">
            {language === 'es'
              ? 'Resultado de Mezcla Ordenada (Merge Output):'
              : 'Merged Sorted Output:'}
          </div>
          <div className="inv-cells-row">
            {mergedArray.length === 0 ? (
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                {language === 'es' ? '(Esperando intercalación)' : '(Awaiting merge)'}
              </span>
            ) : (
              mergedArray.map((val, idx) => (
                <div key={idx} className="inv-merged-cell">
                  {val}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Step Explanation Card */}
      <div className="inv-explanation-card">{desc}</div>

      {/* Timeline Controls */}
      <div className="timeline-controls" style={{ marginTop: '0.5rem' }}>
        <button
          onClick={stepBackward}
          disabled={currentStepIndex === 0}
          title={language === 'es' ? 'Paso Anterior' : 'Previous Step'}
          className="timeline-btn"
        >
          ⏮
        </button>
        <button
          onClick={togglePlay}
          className="timeline-btn play-btn"
          title={isPlaying ? (language === 'es' ? 'Pausar' : 'Pause') : (language === 'es' ? 'Reproducir' : 'Play')}
        >
          {isPlaying ? '⏸' : '▶'}
        </button>
        <button
          onClick={stepForward}
          disabled={currentStepIndex >= totalSteps - 1}
          title={language === 'es' ? 'Paso Siguiente' : 'Next Step'}
          className="timeline-btn"
        >
          ⏭
        </button>
        <button
          onClick={reset}
          title={language === 'es' ? 'Reiniciar' : 'Reset'}
          className="timeline-btn"
        >
          ↺
        </button>

        <div className="timeline-scrubber" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1 }}>
          <input
            type="range"
            min={0}
            max={Math.max(0, totalSteps - 1)}
            value={currentStepIndex}
            onChange={(e) => goToStep(Number(e.target.value))}
            style={{ width: '100%' }}
          />
          <span style={{ fontSize: '0.8rem', minWidth: '4rem', color: 'var(--text-muted, #94a3b8)' }}>
            {currentStepIndex + 1} / {totalSteps}
          </span>
        </div>

        <div className="speed-selector" style={{ display: 'flex', gap: '0.25rem' }}>
          {[0.5, 1, 2].map((s) => (
            <button
              key={s}
              className={`timeline-btn ${playbackSpeed === s ? 'active' : ''}`}
              onClick={() => setSpeed(s)}
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.4rem' }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
