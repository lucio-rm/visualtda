import React, { useState, useMemo } from 'react';
import {
  generateHuffmanTrace,
  HuffmanStepData,
  DEFAULT_HUFFMAN_FREQS
} from '../../engine/algorithms/huffmanTrace';
import { useTraceTimeline } from '../../hooks/useTraceTimeline';
import { useLanguage } from '../../i18n/LanguageContext';
import { HuffmanTreeSvg } from './HuffmanTreeSvg';
import './HuffmanVisualizer.css';

interface HuffmanPreset {
  id: string;
  label: { es: string; en: string };
  frequencies: Record<string, number>;
}

const PRESETS: HuffmanPreset[] = [
  {
    id: 'clrs',
    label: { es: 'Clásico CLRS (A..F, 100 letras)', en: 'Classic CLRS (A..F, 100 chars)' },
    frequencies: DEFAULT_HUFFMAN_FREQS
  },
  {
    id: 'abracadabra',
    label: { es: 'ABRACADABRA (11 letras)', en: 'ABRACADABRA (11 chars)' },
    frequencies: { A: 5, B: 2, R: 2, C: 1, D: 1 }
  },
  {
    id: 'vowels',
    label: { es: 'Vocales (A, E, I, O, U)', en: 'Vowels (A, E, I, O, U)' },
    frequencies: { A: 35, E: 40, I: 25, O: 28, U: 12 }
  },
  {
    id: 'binary',
    label: { es: 'Canal Binario {0: 70, 1: 30}', en: 'Binary Channel {0: 70, 1: 30}' },
    frequencies: { '0': 70, '1': 30 }
  }
];

export const HuffmanVisualizer: React.FC = () => {
  const { language } = useLanguage();
  const [selectedPresetId, setSelectedPresetId] = useState<string>('clrs');
  const [customText, setCustomText] = useState<string>('ALGORITMOS');

  const activeFrequencies = useMemo(() => {
    if (selectedPresetId === 'custom') {
      const freqs: Record<string, number> = {};
      const clean = customText.trim().toUpperCase() || 'AB';
      for (const ch of clean) {
        if ((ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch === ' ') {
          freqs[ch] = (freqs[ch] || 0) + 1;
        }
      }
      if (Object.keys(freqs).length < 2) {
        freqs['A'] = (freqs['A'] || 0) + 2;
        freqs['B'] = (freqs['B'] || 0) + 1;
      }
      return freqs;
    }
    const preset = PRESETS.find((p) => p.id === selectedPresetId);
    return preset ? preset.frequencies : DEFAULT_HUFFMAN_FREQS;
  }, [selectedPresetId, customText]);

  const timeline = useMemo(
    () => generateHuffmanTrace(activeFrequencies),
    [activeFrequencies]
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
  } = useTraceTimeline<HuffmanStepData>(timeline, {
    baseIntervalMs: 750,
    enableKeyboardShortcuts: true
  });

  const data = currentEvent?.data;
  const action = data?.action || 'INIT';
  const queue = data?.queue || [];
  const selectedIds = data?.selectedIds || null;
  const mergedParent = data?.mergedParent || null;
  const codes = data?.codes || {};
  const totalCost = data?.totalCostBits ?? 0;
  const fixedCost = data?.fixedCostBits ?? 0;
  const desc = data?.description ? data.description[language] : '';
  const allNodes = data?.allNodes || {};
  const forestRoots = data?.forestRoots || queue.map((q) => q.id);

  const savings = fixedCost > 0 && totalCost > 0 ? Math.round(((fixedCost - totalCost) / fixedCost) * 100) : 0;

  return (
    <div className="huffman-visualizer">
      {/* Preset Selector */}
      <div className="huff-presets">
        <span className="huff-presets-label">
          {language === 'es' ? 'Frecuencias de Ejemplo:' : 'Sample Frequencies:'}
        </span>
        {PRESETS.map((p) => (
          <button
            key={p.id}
            className={`huff-preset-btn ${p.id === selectedPresetId ? 'active' : ''}`}
            onClick={() => {
              setSelectedPresetId(p.id);
              reset();
            }}
          >
            {p.label[language]}
          </button>
        ))}
        <button
          className={`huff-preset-btn ${selectedPresetId === 'custom' ? 'active' : ''}`}
          onClick={() => {
            setSelectedPresetId('custom');
            reset();
          }}
        >
          {language === 'es' ? 'Caso Personalizado' : 'Custom Input'}
        </button>
      </div>

      {selectedPresetId === 'custom' && (
        <div className="huff-custom-input-box" style={{ margin: '0.75rem 0', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <label htmlFor="huff-custom-text" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text)' }}>
            {language === 'es' ? 'Texto a codificar:' : 'Text to encode:'}
          </label>
          <input
            id="huff-custom-text"
            type="text"
            value={customText}
            onChange={(e) => {
              setCustomText(e.target.value);
              reset();
            }}
            maxLength={60}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--surface)',
              color: 'var(--text)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.9rem',
              flex: 1,
              minWidth: '220px',
              maxWidth: '350px'
            }}
          />
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {language === 'es' ? 'Frecuencias calculadas dinámicamente' : 'Frequencies computed dynamically'}
          </span>
        </div>
      )}

      {/* Banner Summary */}
      <div className="huff-banner-row">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className={`huff-phase-pill ${action.toLowerCase()}`}>
            {action.replace(/_/g, ' ')}
          </span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {language === 'es' ? 'Tamaño del Min-Heap:' : 'Min-Heap Size:'}{' '}
            <strong style={{ color: 'var(--text)' }}>
              {queue.length} {language === 'es' ? 'nodos' : 'nodes'}
            </strong>
          </span>
        </div>

        <div className="huff-metrics-summary">
          <div className="huff-metric-badge">
            <span className="label">
              {language === 'es' ? 'Bits Huffman' : 'Huffman Bits'}
            </span>
            <span className="value highlight">{totalCost > 0 ? `${totalCost} b` : '---'}</span>
          </div>
          <div className="huff-metric-badge">
            <span className="label">
              {language === 'es' ? 'Bits ASCII (8b)' : 'ASCII Bits (8b)'}
            </span>
            <span className="value">{fixedCost} b</span>
          </div>
          {savings > 0 && (
            <div className="huff-metric-badge">
              <span className="label">
                {language === 'es' ? 'Ahorro' : 'Savings'}
              </span>
              <span className="value highlight">{savings}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Priority Queue (Min-Heap) Section */}
      <div className="huff-heap-section">
        <div className="huff-heap-header">
          <span>
            {language === 'es'
              ? 'Cola de Prioridad (Min-Heap ordenado por frecuencia):'
              : 'Priority Queue (Min-Heap sorted by frequency):'}
          </span>
          <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
            {language === 'es' ? 'Extracción Greedy de la izquierda' : 'Greedy extract from the left'}
          </span>
        </div>

        <div className="huff-heap-nodes">
          {queue.length === 0 ? (
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
              {language === 'es' ? '(Cola vacía - árbol completado)' : '(Queue empty - tree complete)'}
            </span>
          ) : (
            queue.map((node, idx) => {
              const isSelectedMin1 = selectedIds && selectedIds[0] === node.id;
              const isSelectedMin2 = selectedIds && selectedIds[1] === node.id;
              const isMergedParent = mergedParent && mergedParent.id === node.id;

              return (
                <div
                  key={node.id}
                  className={`huff-node-card ${isSelectedMin1 || isSelectedMin2 ? 'selected-min' : ''} ${isMergedParent ? 'merged-new' : ''}`}
                >
                  {(isSelectedMin1 || isSelectedMin2) && (
                    <span className="min-badge">
                      {isSelectedMin1 ? 'Min 1' : 'Min 2'}
                    </span>
                  )}
                  {isMergedParent && (
                    <span className="min-badge" style={{ background: '#3b82f6', color: '#fff' }}>
                      +
                    </span>
                  )}
                  <span className="char">{node.char ?? `[${node.id}]`}</span>
                  <span className="freq">
                    freq: <strong>{node.freq}</strong>
                  </span>
                  <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>#{idx + 1}</span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Visual Binary Tree / Forest Section */}
      <HuffmanTreeSvg
        forestRoots={forestRoots}
        allNodes={allNodes}
        selectedIds={selectedIds}
        mergedParentId={mergedParent?.id}
        codes={codes}
        language={language}
      />

      {/* Codebook Table (shown when codes are available) */}
      {Object.keys(codes).length > 0 && (
        <div className="huff-codebook-card">
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent-light, #60a5fa)' }}>
            {language === 'es' ? 'Tabla de Códigos de Huffman (Prefijo Libre):' : 'Huffman Codebook (Prefix-Free):'}
          </div>
          <table className="huff-table">
            <thead>
              <tr>
                <th>{language === 'es' ? 'Símbolo' : 'Symbol'}</th>
                <th>{language === 'es' ? 'Frecuencia' : 'Frequency'}</th>
                <th>{language === 'es' ? 'Código Huffman' : 'Huffman Code'}</th>
                <th>{language === 'es' ? 'Longitud (bits)' : 'Length (bits)'}</th>
                <th>{language === 'es' ? 'Costo Ponderado' : 'Weighted Cost'}</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(codes).map(([c, code]) => {
                const freq = activeFrequencies[c] ?? 0;
                return (
                  <tr key={c}>
                    <td style={{ fontWeight: 800 }}>"{c}"</td>
                    <td>{freq}</td>
                    <td>
                      <span className="huff-code-tag">{code}</span>
                    </td>
                    <td>{code.length}</td>
                    <td>{freq * code.length} bits</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Step Explanation Card */}
      <div className="huff-explanation-card">{desc}</div>

      {/* Huffman Optimality & Exchange Argument Rationale */}
      <div style={{ marginTop: '0.75rem', marginBottom: '0.75rem', padding: '0.85rem 1rem', background: 'var(--surface-hover)', borderRadius: '6px', border: '1px solid var(--border)', fontSize: '0.85rem', lineHeight: 1.5 }}>
        <strong>{language === 'es' ? 'Fundamento Teórico: Invariante Greedy y Argumento de Intercambio:' : 'Theoretical Rationale: Greedy Invariant & Exchange Argument:'}</strong>{' '}
        {language === 'es'
          ? 'Existe un árbol de prefijo binario óptimo donde los dos caracteres de menor frecuencia x e y son nodos hermanos en el nivel más profundo. Al fusionarlos recursivamente en un nodo z con frecuencia f(z) = f(x) + f(y), el costo del árbol satisface B(T) = B(T\') + f(x) + f(y). Mediante un Min-Heap de n símbolos, cada extracción y reinserción cuesta O(log n), alcanzando un tiempo óptimo total de O(n log n).'
          : 'An optimal prefix tree exists wherein the two lowest-frequency symbols x and y are sibling leaves at maximum depth. Merging them into a composite node z with f(z) = f(x) + f(y) yields B(T) = B(T\') + f(x) + f(y). Implementing the priority queue via a Min-Heap yields O(log n) per step, guaranteeing an overall construction runtime of O(n log n).'}
      </div>

      {/* Timeline Controls */}
      <div className="timeline-controls" style={{ marginTop: '0.5rem' }}>
        <button
          onClick={stepBackward}
          disabled={currentStepIndex === 0}
          title={language === 'es' ? 'Paso Anterior (←)' : 'Previous Step (←)'}
          aria-label={language === 'es' ? 'Paso anterior' : 'Previous step'}
          className="timeline-btn"
        >
          ←
        </button>
        <button
          onClick={togglePlay}
          className="timeline-btn play-btn"
          title={isPlaying ? (language === 'es' ? 'Pausar (Espacio)' : 'Pause (Space)') : (language === 'es' ? 'Reproducir (Espacio)' : 'Play (Space)')}
          aria-label={isPlaying ? (language === 'es' ? 'Pausar' : 'Pause') : (language === 'es' ? 'Reproducir' : 'Play')}
        >
          {isPlaying ? '❚❚' : '▶'}
        </button>
        <button
          onClick={stepForward}
          disabled={currentStepIndex >= totalSteps - 1}
          title={language === 'es' ? 'Paso Siguiente (→)' : 'Next Step (→)'}
          aria-label={language === 'es' ? 'Paso siguiente' : 'Next step'}
          className="timeline-btn"
        >
          →
        </button>
        <button
          onClick={reset}
          title={language === 'es' ? 'Reiniciar (r)' : 'Reset (r)'}
          aria-label={language === 'es' ? 'Reiniciar' : 'Reset'}
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
            aria-label={language === 'es' ? 'Línea de tiempo de pasos' : 'Step timeline'}
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
              style={{ fontSize: '0.8125rem', padding: '0.2rem 0.4rem' }}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
