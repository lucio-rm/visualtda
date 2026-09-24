import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { simulateVonNeumann, FairCoinOutput } from '../../engine/algorithms/randomizedFairCoinValidator';
import './RandomizedFairCoinPlayground.css';

export const RandomizedFairCoinPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();
  const [bias, setBias] = useState<number>(0.4);
  const [simulation, setSimulation] = useState<FairCoinOutput | null>(() => simulateVonNeumann(0.4, 3000));
  const [singleBitLog, setSingleBitLog] = useState<{ roundFlips: number; bit: number }[]>([]);

  const theoreticalExpected = useMemo(() => {
    return 1 / (bias * (1 - bias));
  }, [bias]);

  useEffect(() => {
    if (simulation && Math.abs(simulation.empiricalRatio0 - 50) < 5) {
      markAttempted('randomized-fair-coin');
    }
  }, [simulation, markAttempted]);

  const runSingle = () => {
    let flips = 0;
    while (true) {
      const t1 = Math.random() < bias ? 1 : 0;
      const t2 = Math.random() < bias ? 1 : 0;
      flips += 2;
      if (t1 === 0 && t2 === 1) {
        setSingleBitLog((prev) => [{ roundFlips: flips, bit: 0 }, ...prev.slice(0, 9)]);
        break;
      } else if (t1 === 1 && t2 === 0) {
        setSingleBitLog((prev) => [{ roundFlips: flips, bit: 1 }, ...prev.slice(0, 9)]);
        break;
      }
    }
  };

  const runBatch = (trials: number) => {
    const res = simulateVonNeumann(bias, trials);
    setSimulation(res);
  };

  return (
    <div className="fair-coin-playground">
      <div className="playground-intro">
        <h3>
          {language === 'es'
            ? 'Laboratorio Monte Carlo: Extracción de Aleatoriedad Pura'
            : 'Monte Carlo Laboratory: Pure Randomness Extraction'}
        </h3>
        <p>
          {language === 'es'
            ? 'Configura cualquier sesgo p en la moneda original (ej. 10%, 40%, 85%) y comprueba empíricamente cómo el algoritmo de Von Neumann produce siempre una distribución 50/50 perfecta.'
            : 'Configure any bias p in the original coin (e.g. 10%, 40%, 85%) and verify empirically how Von Neumann algorithm always yields a perfect 50/50 distribution.'}
        </p>
      </div>

      {/* Bias Control */}
      <div className="bias-controls-card">
        <div className="bias-header">
          <label htmlFor="bias-range">
            {language === 'es' ? 'Sesgo de la Moneda Original P(1):' : 'Original Coin Bias P(1):'}
          </label>
          <span className="bias-badge">
            P(1) = <strong>{(bias * 100).toFixed(0)}%</strong> | P(0) ={' '}
            <strong>{((1 - bias) * 100).toFixed(0)}%</strong>
          </span>
        </div>
        <input
          id="bias-range"
          type="range"
          min={0.05}
          max={0.95}
          step={0.05}
          value={bias}
          onChange={(e) => {
            const newB = Number(e.target.value);
            setBias(newB);
            setSimulation(simulateVonNeumann(newB, 3000));
          }}
          className="bias-slider"
        />
        <div className="bias-stats-row">
          <span>
            {language === 'es' ? 'Esperanza de tiros por bit E[T] = 1/(p·(1-p)):' : 'Expected tosses per bit E[T] = 1/(p·(1-p)): '}
            <code>{theoreticalExpected.toFixed(2)}</code>
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn-action single" onClick={runSingle}>
          {language === 'es' ? '🎲 Generar 1 Bit' : '🎲 Generate 1 Bit'}
        </button>
        <button className="btn-action batch" onClick={() => runBatch(2000)}>
          {language === 'es' ? '⚡ Simular 2,000 Bits' : '⚡ Simulate 2,000 Bits'}
        </button>
        <button className="btn-action massive" onClick={() => runBatch(15000)}>
          {language === 'es' ? '🚀 Monte Carlo (15,000 Bits)' : '🚀 Monte Carlo (15,000 Bits)'}
        </button>
      </div>

      {/* Single bit recent feed */}
      {singleBitLog.length > 0 && (
        <div className="recent-feed">
          <span className="feed-title">
            {language === 'es' ? 'Últimos bits generados manualmente:' : 'Recent manual bits:'}
          </span>
          <div className="feed-chips">
            {singleBitLog.map((item, idx) => (
              <span key={idx} className={`feed-chip bit-${item.bit}`}>
                Bit <strong>{item.bit}</strong> ({item.roundFlips} tiros)
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Distribution Comparison */}
      {simulation && (
        <div className="comparison-container">
          {/* Source Distribution */}
          <div className="dist-box source-box">
            <div className="box-title">
              {language === 'es' ? 'Fuente Sesgada (Moneda Original)' : 'Biased Source (Original Coin)'}
            </div>
            <div className="bars-wrapper">
              <div className="bar-row">
                <span className="bar-label">0: {((1 - bias) * 100).toFixed(0)}%</span>
                <div className="bar-track">
                  <div
                    className="bar-fill fill-0"
                    style={{ width: `${(1 - bias) * 100}%` }}
                  />
                </div>
              </div>
              <div className="bar-row">
                <span className="bar-label">1: {(bias * 100).toFixed(0)}%</span>
                <div className="bar-track">
                  <div
                    className="bar-fill fill-1"
                    style={{ width: `${bias * 100}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="dist-sub">
              {language === 'es' ? 'Asimétrica y sesgada' : 'Asymmetric & biased'}
            </div>
          </div>

          {/* Extracted Fair Distribution */}
          <div className="dist-box fair-box">
            <div className="box-title">
              {language === 'es'
                ? '⭐ Salida von Neumann (Aleatoriedad Pura)'
                : '⭐ Von Neumann Output (Pure Randomness)'}
            </div>
            <div className="bars-wrapper">
              <div className="bar-row">
                <span className="bar-label">0: {simulation.empiricalRatio0.toFixed(2)}%</span>
                <div className="bar-track">
                  <div
                    className="bar-fill fill-fair-0"
                    style={{ width: `${simulation.empiricalRatio0}%` }}
                  />
                </div>
              </div>
              <div className="bar-row">
                <span className="bar-label">1: {simulation.empiricalRatio1.toFixed(2)}%</span>
                <div className="bar-track">
                  <div
                    className="bar-fill fill-fair-1"
                    style={{ width: `${simulation.empiricalRatio1}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="dist-sub highlight-fair">
              {language === 'es'
                ? `Promedio de lanzamientos: ${simulation.avgFlips.toFixed(2)} (Teórico: ${theoreticalExpected.toFixed(2)})`
                : `Average physical tosses: ${simulation.avgFlips.toFixed(2)} (Theoretical: ${theoreticalExpected.toFixed(2)})`}
            </div>
          </div>
        </div>
      )}

      {/* Pedagogy Callout */}
      <div className="educational-note">
        <h4>
          {language === 'es'
            ? '💡 La Belleza de la Simetría Probabilística'
            : '💡 The Beauty of Probabilistic Symmetry'}
        </h4>
        <p>
          {language === 'es'
            ? 'Aunque no sepamos cuál es el sesgo p de la moneda, por independencia física P(0 seguido de 1) = (1-p)·p y P(1 seguido de 0) = p·(1-p). Debido a la conmutatividad del producto real, ¡ambos números son idénticos! Al descartar los resultados idénticos (0,0) y (1,1), cualquier asimetría desaparece por completo, logrando un extractor de aleatoriedad perfecto en tiempo esperado finito O(1).'
            : 'Even without knowing the bias p, independence implies P(0 then 1) = (1-p)p and P(1 then 0) = p(1-p). Because multiplication commutes, both probabilities are identical! By discarding identical outcomes (0,0) and (1,1), all bias cancels out, yielding a perfect randomness extractor in O(1) expected time.'}
        </p>
      </div>
    </div>
  );
};
