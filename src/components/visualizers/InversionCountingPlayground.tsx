import React, { useState } from 'react';
import {
  countInversions,
  getInversionPairs
} from '../../engine/algorithms/inversionCountingValidator';
import { useLanguage } from '../../i18n/LanguageContext';
import './InversionCountingPlayground.css';

const DEFAULT_ARRAY = [2, 3, 8, 6, 1];

export const InversionCountingPlayground: React.FC = () => {
  const { language } = useLanguage();
  const [array, setArray] = useState<number[]>(DEFAULT_ARRAY);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [guess, setGuess] = useState<string>('');
  const [guessFeedback, setGuessFeedback] = useState<string | null>(null);

  const totalInversions = countInversions(array);
  const pairs = getInversionPairs(array);
  const n = array.length;
  const maxInversions = (n * (n - 1)) / 2;
  const disorderPercent = maxInversions > 0 ? Math.round((totalInversions / maxInversions) * 100) : 0;

  const handleSwapOrSelect = (idx: number) => {
    if (selectedIdx === null) {
      setSelectedIdx(idx);
    } else if (selectedIdx === idx) {
      setSelectedIdx(null);
    } else {
      // Swap elements
      const next = [...array];
      const tmp = next[selectedIdx];
      next[selectedIdx] = next[idx];
      next[idx] = tmp;
      setArray(next);
      setSelectedIdx(null);
      setGuessFeedback(null);
    }
  };

  const handleShift = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= array.length) return;
    const next = [...array];
    const tmp = next[idx];
    next[idx] = next[target];
    next[target] = tmp;
    setArray(next);
    setSelectedIdx(null);
    setGuessFeedback(null);
  };

  const handleRandomize = () => {
    const len = 6;
    const randoms: number[] = [];
    while (randoms.length < len) {
      const val = Math.floor(Math.random() * 20) + 1;
      if (!randoms.includes(val)) {
        randoms.push(val);
      }
    }
    setArray(randoms);
    setSelectedIdx(null);
    setGuessFeedback(null);
  };

  const handleCheckGuess = () => {
    const num = parseInt(guess, 10);
    if (isNaN(num)) return;
    if (num === totalInversions) {
      setGuessFeedback(
        language === 'es'
          ? `🎉 ¡Brillante! El arreglo tiene exactamente ${totalInversions} inversiones.`
          : `🎉 Brilliant! The array has exactly ${totalInversions} inversions.`
      );
    } else if (num < totalInversions) {
      const diff = totalInversions - num;
      setGuessFeedback(
        language === 'es'
          ? `🔍 Te faltaron contar ${diff} inversiones (el total real es ${totalInversions}).`
          : `🔍 You missed ${diff} inversions (actual total is ${totalInversions}).`
      );
    } else {
      const diff = num - totalInversions;
      setGuessFeedback(
        language === 'es'
          ? `⚠️ Contaste de más (+${diff}). El número real de inversiones es ${totalInversions}.`
          : `⚠️ You overcounted by ${diff}. The true number of inversions is ${totalInversions}.`
      );
    }
  };

  return (
    <div className="inversion-playground">
      {/* Playground Workspace */}
      <div className="inv-pg-card">
        <div className="inv-pg-header">
          <div>
            <div className="inv-pg-title">
              {language === 'es'
                ? 'Laboratorio Interactivo de Inversiones'
                : 'Interactive Inversion Sandbox'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>
              {language === 'es'
                ? 'Haz clic en dos números para intercambiarlos o usa las flechas para moverlos.'
                : 'Click two numbers to swap them or use the arrows to shift positions.'}
            </div>
          </div>

          <div className="inv-pg-actions">
            <button
              className="inv-pg-btn"
              onClick={() => {
                setArray([2, 3, 8, 6, 1]);
                setSelectedIdx(null);
                setGuessFeedback(null);
              }}
            >
              CLRS [2, 3, 8, 6, 1]
            </button>
            <button
              className="inv-pg-btn"
              onClick={() => {
                setArray([6, 5, 4, 3, 2, 1]);
                setSelectedIdx(null);
                setGuessFeedback(null);
              }}
            >
              {language === 'es' ? 'Invertido Total' : 'Fully Reversed'}
            </button>
            <button
              className="inv-pg-btn"
              onClick={() => {
                setArray([1, 2, 3, 4, 5, 6]);
                setSelectedIdx(null);
                setGuessFeedback(null);
              }}
            >
              {language === 'es' ? 'Ordenado' : 'Sorted'}
            </button>
            <button className="inv-pg-btn accent" onClick={handleRandomize}>
              🎲 {language === 'es' ? 'Aleatorio' : 'Randomize'}
            </button>
          </div>
        </div>

        {/* Array visualizer with click to swap */}
        <div className="inv-pg-array-display">
          {array.map((val, idx) => {
            const isSelected = selectedIdx === idx;
            return (
              <div key={idx} className="inv-pg-item">
                <button
                  className={`inv-pg-bar ${isSelected ? 'selected-left' : ''}`}
                  onClick={() => handleSwapOrSelect(idx)}
                  title={
                    language === 'es'
                      ? 'Haz clic para seleccionar o intercambiar'
                      : 'Click to select or swap'
                  }
                >
                  {val}
                </button>
                <span className="inv-pg-bar-idx">i={idx}</span>
                <div className="inv-pg-shift-btns">
                  <button
                    className="inv-pg-shift-btn"
                    disabled={idx === 0}
                    onClick={() => handleShift(idx, -1)}
                    title="Mover a la izquierda"
                  >
                    ◀
                  </button>
                  <button
                    className="inv-pg-shift-btn"
                    disabled={idx === array.length - 1}
                    onClick={() => handleShift(idx, 1)}
                    title="Mover a la derecha"
                  >
                    ▶
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Grid */}
        <div className="inv-pg-stats-grid">
          <div className="inv-stat-card">
            <span className="inv-stat-label">
              {language === 'es' ? 'Inversiones Totales' : 'Total Inversions'}
            </span>
            <span className={`inv-stat-value ${totalInversions > 0 ? 'warn' : ''}`}>
              {totalInversions}
            </span>
            <span className="inv-stat-desc">
              {language === 'es'
                ? `De un máximo de ${maxInversions} pares posibles`
                : `Out of ${maxInversions} max possible pairs`}
            </span>
          </div>

          <div className="inv-stat-card">
            <span className="inv-stat-label">
              {language === 'es' ? 'Índice de Desorden (Kendall)' : 'Disorder Index (Kendall)'}
            </span>
            <span className="inv-stat-value">{disorderPercent}%</span>
            <span className="inv-stat-desc">
              {language === 'es'
                ? totalInversions === 0
                  ? 'Arreglo perfectamente ordenado'
                  : totalInversions === maxInversions
                  ? 'Peor caso posible (orden decreciente)'
                  : 'Desorden intermedio'
                : totalInversions === 0
                ? 'Perfectly sorted array'
                : totalInversions === maxInversions
                ? 'Worst-case strictly reversed'
                : 'Intermediate disorder'}
            </span>
          </div>

          <div className="inv-stat-card">
            <span className="inv-stat-label">
              {language === 'es' ? 'Comparaciones Fuerza Bruta' : 'Brute Force Comparisons'}
            </span>
            <span className="inv-stat-value">{maxInversions}</span>
            <span className="inv-stat-desc">
              {language === 'es'
                ? 'Fórmula n(n-1)/2 en tiempo O(n²)'
                : 'Formula n(n-1)/2 in O(n²) time'}
            </span>
          </div>

          <div className="inv-stat-card">
            <span className="inv-stat-label">
              {language === 'es' ? 'Operaciones DyC' : 'D&C Operations'}
            </span>
            <span className="inv-stat-value" style={{ color: '#34d399' }}>
              ~{Math.round(n * Math.log2(Math.max(2, n)))}
            </span>
            <span className="inv-stat-desc">
              {language === 'es'
                ? 'Teorema Maestro O(n log n)'
                : 'Master Theorem O(n log n)'}
            </span>
          </div>
        </div>

        {/* Inverted Pairs List */}
        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
            {language === 'es'
              ? `Listado de Pares Invertidos (${pairs.length}):`
              : `List of Inverted Pairs (${pairs.length}):`}
          </div>
          {pairs.length === 0 ? (
            <div style={{ fontSize: '0.8rem', color: '#10b981', fontStyle: 'italic' }}>
              {language === 'es'
                ? '¡No hay inversiones! El arreglo ya está en orden no decreciente.'
                : 'No inversions! The array is already in non-decreasing order.'}
            </div>
          ) : (
            <div className="inv-pairs-list">
              {pairs.map(([i, j], pIdx) => (
                <span key={pIdx} className="inv-pair-pill">
                  ({i}, {j}) [{array[i]} &gt; {array[j]}]
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Interactive Challenge */}
        <div className="inv-challenge-box">
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-light, #60a5fa)' }}>
            🎯 {language === 'es' ? 'Desafío Mental de Estimación:' : 'Mental Estimation Challenge:'}
          </div>
          <div style={{ fontSize: '0.82rem', color: 'var(--text-muted, #94a3b8)' }}>
            {language === 'es'
              ? 'Antes de mirar la solución, inspecciona el arreglo visual y estima cuántas inversiones contiene.'
              : 'Before looking at the solution, inspect the array and estimate how many inversions it contains.'}
          </div>
          <div className="inv-challenge-input-row">
            <input
              type="number"
              className="inv-challenge-input"
              placeholder="0"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
            />
            <button className="inv-pg-btn accent" onClick={handleCheckGuess}>
              {language === 'es' ? 'Verificar Estimación' : 'Check Guess'}
            </button>
          </div>
          {guessFeedback && (
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fef08a' }}>
              {guessFeedback}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
