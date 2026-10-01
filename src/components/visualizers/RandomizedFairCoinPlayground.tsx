import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { simulateVonNeumann, FairCoinOutput } from '../../engine/algorithms/randomizedFairCoinValidator';
import './RandomizedFairCoinPlayground.css';

interface CoinPairState {
  flip1: number;
  flip2: number;
  extractedBit: number | null;
  tossCount: number;
  status: 'idle' | 'flipping' | 'extracted' | 'discarded';
  explanation: { es: string; en: string };
}

export const RandomizedFairCoinPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();
  const [bias, setBias] = useState<number>(0.35);
  const [simulation, setSimulation] = useState<FairCoinOutput | null>(() => simulateVonNeumann(0.35, 3000));
  const [singleBitLog, setSingleBitLog] = useState<{ roundFlips: number; bit: number }[]>([]);

  // Interactive coin animation state
  const [coinState, setCoinState] = useState<CoinPairState>({
    flip1: 0,
    flip2: 1,
    extractedBit: 0,
    tossCount: 2,
    status: 'idle',
    explanation: {
      es: 'Presiona "Lanzar Par de Monedas" para observar el proceso de extracción en vivo.',
      en: 'Click "Toss Pair of Coins" to observe the live extraction process.'
    }
  });

  const theoreticalExpected = useMemo(() => {
    return 1 / (bias * (1 - bias));
  }, [bias]);

  useEffect(() => {
    if (simulation && Math.abs(simulation.empiricalRatio0 - 50) < 5) {
      markAttempted('randomized-fair-coin');
    }
  }, [simulation, markAttempted]);

  const runAnimatedSingle = () => {
    setCoinState((prev) => ({ ...prev, status: 'flipping' }));

    let currentTosses = 0;
    const attemptToss = () => {
      currentTosses += 2;
      const t1 = Math.random() < bias ? 1 : 0;
      const t2 = Math.random() < bias ? 1 : 0;

      if (t1 === 0 && t2 === 1) {
        setCoinState({
          flip1: t1,
          flip2: t2,
          extractedBit: 0,
          tossCount: currentTosses,
          status: 'extracted',
          explanation: {
            es: `Resultado: (0, 1) obtenido en ${currentTosses} tiros. P(0,1) = (1-p)·p. ¡Bit extraído = 0!`,
            en: `Outcome: (0, 1) obtained in ${currentTosses} tosses. P(0,1) = (1-p)p. Extracted Bit = 0!`
          }
        });
        setSingleBitLog((prev) => [{ roundFlips: currentTosses, bit: 0 }, ...prev.slice(0, 7)]);
      } else if (t1 === 1 && t2 === 0) {
        setCoinState({
          flip1: t1,
          flip2: t2,
          extractedBit: 1,
          tossCount: currentTosses,
          status: 'extracted',
          explanation: {
            es: `Resultado: (1, 0) obtenido en ${currentTosses} tiros. P(1,0) = p·(1-p). ¡Bit extraído = 1!`,
            en: `Outcome: (1, 0) obtained in ${currentTosses} tosses. P(1,0) = p(1-p). Extracted Bit = 1!`
          }
        });
        setSingleBitLog((prev) => [{ roundFlips: currentTosses, bit: 1 }, ...prev.slice(0, 7)]);
      } else {
        // Discarded symmetric outcome (0,0) or (1,1)
        setCoinState({
          flip1: t1,
          flip2: t2,
          extractedBit: null,
          tossCount: currentTosses,
          status: 'discarded',
          explanation: {
            es: `Resultado simétrico (${t1}, ${t1}) descartado. Probabilidad P = ${t1 === 1 ? 'p²' : '(1-p)²'}. Reintentando automáticamente...`,
            en: `Symmetric outcome (${t1}, ${t1}) discarded. Probability P = ${t1 === 1 ? 'p²' : '(1-p)²'}. Retrying automatically...`
          }
        });
        // Continue flipping after a tiny delay
        setTimeout(attemptToss, 350);
      }
    };

    setTimeout(attemptToss, 200);
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
            ? 'Laboratorio Monte Carlo: Extracción de Aleatoriedad Pura (Algoritmo de von Neumann)'
            : 'Monte Carlo Laboratory: Pure Randomness Extraction (von Neumann Algorithm)'}
        </h3>
        <p>
          {language === 'es'
            ? 'Configura cualquier sesgo p en la moneda original (ej. 15%, 35%, 80%) y comprueba empíricamente cómo el algoritmo de von Neumann produce siempre una distribución 50/50 perfecta explotando la simetría multiplicativa (1-p)·p = p·(1-p).'
            : 'Configure any bias p in the original coin (e.g. 15%, 35%, 80%) and verify empirically how the von Neumann algorithm always yields a perfect 50/50 distribution by exploiting multiplicative symmetry (1-p)p = p(1-p).'}
        </p>
      </div>

      {/* Bias Control Slider */}
      <div className="bias-controls-card">
        <div className="bias-header">
          <label htmlFor="bias-range">
            {language === 'es' ? 'Sesgo de la Moneda Original P(Cara = 1):' : 'Original Coin Bias P(Heads = 1):'}
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
        <div className="bias-stats-row" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span>
            {language === 'es' ? 'Esperanza de tiros físicos por bit: ' : 'Expected physical tosses per bit: '}
            <code>E[T] = 1 / (p·(1-p)) = {theoreticalExpected.toFixed(2)} tiros</code>
          </span>
          <span>
            {language === 'es' ? 'Simetría teórica:' : 'Theoretical symmetry:'}{' '}
            <code>P(0,1) = P(1,0) = {(bias * (1 - bias) * 100).toFixed(2)}%</code>
          </span>
        </div>
      </div>

      {/* Interactive Physical Coin Toss Arena */}
      <div
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-sm)',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>
            {language === 'es' ? 'Simulador de Lanzamiento Físico' : 'Physical Coin Toss Simulator'}
          </span>
          <button
            type="button"
            className="btn-action single"
            onClick={runAnimatedSingle}
            disabled={coinState.status === 'flipping'}
            style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem', background: 'var(--accent)', color: '#fff', border: 'none' }}
          >
            🎲 {language === 'es' ? 'Lanzar Par de Monedas' : 'Toss Pair of Coins'}
          </button>
        </div>

        {/* Visual Coins Stage */}
        <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'center', justifyContent: 'center', margin: '0.5rem 0' }}>
          {/* Coin 1 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {language === 'es' ? 'Tiro 1' : 'Toss 1'}
            </span>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: coinState.flip1 === 1 ? 'linear-gradient(135deg, var(--warning), #d97706)' : 'linear-gradient(135deg, #64748b, #475569)',
                border: '3px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.4rem',
                fontWeight: '900',
                fontFamily: 'var(--font-mono)',
                transform: coinState.status === 'flipping' ? 'scale(0.9) rotateY(180deg)' : 'scale(1)',
                transition: 'all 0.2s ease'
              }}
            >
              {coinState.flip1}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {coinState.flip1 === 1 ? 'Cara (1)' : 'Cruz (0)'}
            </span>
          </div>

          <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-muted)' }}>+</span>

          {/* Coin 2 */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {language === 'es' ? 'Tiro 2' : 'Toss 2'}
            </span>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: coinState.flip2 === 1 ? 'linear-gradient(135deg, var(--warning), #d97706)' : 'linear-gradient(135deg, #64748b, #475569)',
                border: '3px solid rgba(255, 255, 255, 0.4)',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.4rem',
                fontWeight: '900',
                fontFamily: 'var(--font-mono)',
                transform: coinState.status === 'flipping' ? 'scale(0.9) rotateY(180deg)' : 'scale(1)',
                transition: 'all 0.2s ease'
              }}
            >
              {coinState.flip2}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {coinState.flip2 === 1 ? 'Cara (1)' : 'Cruz (0)'}
            </span>
          </div>

          <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-muted)' }}>➔</span>

          {/* Extracted Output Bit */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {language === 'es' ? 'Bit Extraído' : 'Extracted Bit'}
            </span>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '12px',
                background:
                  coinState.extractedBit === 0
                    ? 'var(--state-solution-bg)'
                    : coinState.extractedBit === 1
                    ? 'var(--state-active-bg)'
                    : 'var(--state-conflict-bg)',
                border: `2px solid ${
                  coinState.extractedBit === 0
                    ? 'var(--success)'
                    : coinState.extractedBit === 1
                    ? 'var(--accent)'
                    : 'var(--error)'
                }`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color:
                  coinState.extractedBit === 0
                    ? 'var(--success)'
                    : coinState.extractedBit === 1
                    ? 'var(--accent)'
                    : 'var(--error)',
                fontSize: '1.6rem',
                fontWeight: '900',
                fontFamily: 'var(--font-mono)'
              }}
            >
              {coinState.extractedBit !== null ? coinState.extractedBit : '✕'}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {coinState.extractedBit !== null
                ? `${coinState.tossCount} tiros`
                : language === 'es'
                ? 'Descartado'
                : 'Discarded'}
            </span>
          </div>
        </div>

        {/* Live explanation of last toss */}
        <div
          style={{
            width: '100%',
            padding: '0.6rem 0.85rem',
            backgroundColor: 'var(--surface)',
            borderRadius: '4px',
            border: '1px solid var(--border)',
            fontSize: '0.85rem',
            textAlign: 'center'
          }}
        >
          {coinState.explanation[language]}
        </div>
      </div>

      {/* Batch Simulation Action Buttons */}
      <div className="action-buttons">
        <button className="btn-action batch" onClick={() => runBatch(500)}>
          {language === 'es' ? 'Simular 500 Bits' : 'Simulate 500 Bits'}
        </button>
        <button className="btn-action batch" onClick={() => runBatch(3000)}>
          {language === 'es' ? 'Simular 3,000 Bits' : 'Simulate 3,000 Bits'}
        </button>
        <button className="btn-action massive" onClick={() => runBatch(20000)}>
          ⚡ {language === 'es' ? 'Monte Carlo Masivo (20,000 Bits)' : 'Massive Monte Carlo (20,000 Bits)'}
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
                Bit <strong>{item.bit}</strong> ({item.roundFlips} {language === 'es' ? 'tiros' : 'tosses'})
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
              {language === 'es' ? 'Fuente Sesgada (Moneda Original p)' : 'Biased Source (Original Coin p)'}
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
              {language === 'es' ? 'Asimétrica y fuertemente sesgada' : 'Asymmetric & heavily biased'}
            </div>
          </div>

          {/* Extracted Fair Distribution */}
          <div className="dist-box fair-box">
            <div className="box-title">
              {language === 'es'
                ? '⭐ Salida von Neumann (Aleatoriedad Pura Extraída)'
                : '⭐ Von Neumann Output (Extracted Pure Randomness)'}
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
                ? `Promedio de lanzamientos: ${simulation.avgFlips.toFixed(2)} (Esperado teórico: ${theoreticalExpected.toFixed(2)})`
                : `Average physical tosses: ${simulation.avgFlips.toFixed(2)} (Theoretical expected: ${theoreticalExpected.toFixed(2)})`}
            </div>
          </div>
        </div>
      )}

      {/* Pedagogy Callout */}
      <div className="educational-note">
        <h4>
          {language === 'es'
            ? 'Fundamento Matemático: Simetría Probabilística'
            : 'Mathematical Rationale: Probabilistic Symmetry'}
        </h4>
        <p>
          {language === 'es'
            ? 'Aunque no sepamos cuál es el sesgo p de la moneda, por independencia física P(0 seguido de 1) = (1-p)·p y P(1 seguido de 0) = p·(1-p). Debido a la conmutatividad del producto real, ambos valores son matemáticamente idénticos. Al descartar los resultados simétricos (0,0) y (1,1), cualquier asimetría desaparece por completo, logrando un extractor de aleatoriedad perfecto en tiempo esperado finito O(1).'
            : 'Even without knowing the bias p, physical independence implies P(0 then 1) = (1-p)p and P(1 then 0) = p(1-p). Because real multiplication commutes, both probabilities are mathematically identical. By discarding symmetric outcomes (0,0) and (1,1), all bias is eliminated, yielding an exact randomness extractor in finite O(1) expected time.'}
        </p>
      </div>
    </div>
  );
};
