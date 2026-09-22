import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import {
  solveCoinChange,
  solveCoinChangeGreedy
} from '../../engine/algorithms/coinChangeValidator';
import './CoinChangePlayground.css';

interface Preset {
  name: { es: string; en: string };
  coins: number[];
  target: number;
}

const PRESETS: Preset[] = [
  {
    name: {
      es: '★ Contraejemplo Clásico (Greedy Falla)',
      en: '★ Classic Counterexample (Greedy Fails)'
    },
    coins: [1, 3, 4],
    target: 6
  },
  {
    name: {
      es: 'Trampa Greedy II [1, 5, 6, 9] (V = 11)',
      en: 'Greedy Trap II [1, 5, 6, 9] (V = 11)'
    },
    coins: [1, 5, 6, 9],
    target: 11
  },
  {
    name: {
      es: 'Sellos Postales [2, 5, 7] (V = 11)',
      en: 'Postal Stamps [2, 5, 7] (V = 11)'
    },
    coins: [2, 5, 7],
    target: 11
  },
  {
    name: {
      es: 'Monedas Argentinas [1, 2, 5, 10, 20, 50] (Canónico)',
      en: 'Argentine Currency [1, 2, 5, 10, 20, 50] (Canonical)'
    },
    coins: [1, 2, 5, 10, 20, 50],
    target: 68
  }
];

export const CoinChangePlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markCompleted } = useStudentProgress();
  const [coinsStr, setCoinsStr] = useState<string>('1, 3, 4');
  const [target, setTarget] = useState<number>(6);
  const [userCoinsCount, setUserCoinsCount] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);

  const parsedCoins = useMemo(() => {
    try {
      const parts = coinsStr
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (parts.length === 0) return [];
      const nums = parts.map((s) => {
        const n = Number(s);
        if (isNaN(n) || n <= 0 || !Number.isInteger(n)) {
          throw new Error(`"${s}" debe ser un entero positivo.`);
        }
        return n;
      });
      // Deduplicate and sort
      return Array.from(new Set(nums)).sort((a, b) => a - b);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al procesar monedas');
      return [];
    }
  }, [coinsStr]);

  const optimalSolution = useMemo(() => {
    if (parsedCoins.length === 0 || target <= 0) return [];
    return solveCoinChange(parsedCoins, target);
  }, [parsedCoins, target]);

  const greedySolution = useMemo(() => {
    if (parsedCoins.length === 0 || target <= 0) return null;
    return solveCoinChangeGreedy(parsedCoins, target);
  }, [parsedCoins, target]);

  // Current user selection total
  const userTotal = useMemo(() => {
    let sum = 0;
    for (const [coinStr, count] of Object.entries(userCoinsCount)) {
      sum += Number(coinStr) * count;
    }
    return sum;
  }, [userCoinsCount]);

  const userCoinsList = useMemo(() => {
    const list: number[] = [];
    for (const [coinStr, count] of Object.entries(userCoinsCount)) {
      const c = Number(coinStr);
      for (let i = 0; i < count; i++) {
        list.push(c);
      }
    }
    return list.sort((a, b) => b - a);
  }, [userCoinsCount]);

  const addCoin = (c: number) => {
    setUserCoinsCount((prev) => ({
      ...prev,
      [c]: (prev[c] || 0) + 1
    }));
  };

  const removeCoin = (c: number) => {
    setUserCoinsCount((prev) => {
      const current = prev[c] || 0;
      if (current <= 1) {
        const next = { ...prev };
        delete next[c];
        return next;
      }
      return { ...prev, [c]: current - 1 };
    });
  };

  const clearSelection = () => {
    setUserCoinsCount({});
  };

  const setPreset = (preset: Preset) => {
    setCoinsStr(preset.coins.join(', '));
    setTarget(preset.target);
    setUserCoinsCount({});
    setError(null);
  };

  const isExactSum = userTotal === target;
  const isOptimal =
    isExactSum &&
    optimalSolution.length > 0 &&
    userCoinsList.length === optimalSolution.length;
  const isSuboptimal =
    isExactSum &&
    optimalSolution.length > 0 &&
    userCoinsList.length > optimalSolution.length;

  useEffect(() => {
    if (isOptimal) {
      markCompleted('coin-change-dp');
    }
  }, [isOptimal, markCompleted]);

  return (
    <div className="coin-change-playground">
      <div className="playground-header">
        <h3>
          {language === 'es'
            ? 'Caja Registradora: ¿Logras dar el cambio con la menor cantidad de monedas?'
            : 'Cash Register: Can you give change with the fewest coins?'}
        </h3>
        <p>
          {language === 'es'
            ? 'Experimenta con distintos sistemas de monedas y objetivos. Descubre por qué la intuición codiciosa (tomar siempre la moneda más grande) puede ser una trampa engañosa.'
            : 'Experiment with different coin systems and targets. Learn why the greedy heuristic (taking the largest coin first) can fail.'}
        </p>
      </div>

      {/* Presets */}
      <div className="presets-row">
        <span className="presets-label">
          {language === 'es' ? 'Casos Pedagógicos:' : 'Pedagogical Cases:'}
        </span>
        <div className="preset-buttons">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              className="chip-button"
              onClick={() => setPreset(p)}
            >
              {p.name[language]}
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="config-grid">
        <div className="input-group">
          <label htmlFor="coins-input">
            {language === 'es'
              ? 'Denominaciones de monedas disponibles (separadas por coma):'
              : 'Available coin denominations (comma separated):'}
          </label>
          <input
            id="coins-input"
            type="text"
            value={coinsStr}
            onChange={(e) => {
              setCoinsStr(e.target.value);
              setUserCoinsCount({});
              setError(null);
            }}
            className="input-field"
          />
        </div>

        <div className="input-group input-target-group">
          <label htmlFor="target-input">
            {language === 'es' ? 'Monto a devolver ($):' : 'Target amount ($):'}
          </label>
          <input
            id="target-input"
            type="number"
            min={1}
            max={500}
            value={target}
            onChange={(e) => {
              setTarget(Math.max(1, Number(e.target.value)));
              setUserCoinsCount({});
            }}
            className="input-field input-number"
          />
        </div>
      </div>
      {error && <div className="error-banner">{error}</div>}

      {/* Interactive Coin Dispenser */}
      <div className="dispenser-section">
        <div className="dispenser-header">
          <span className="dispenser-title">
            {language === 'es' ? '🪙 Dispensador de Monedas' : '🪙 Coin Dispenser'}
          </span>
          <div className="quick-actions">
            <button
              className="btn-quick clear-btn"
              onClick={clearSelection}
              disabled={userCoinsList.length === 0}
            >
              {language === 'es' ? 'Vaciar' : 'Clear'}
            </button>
          </div>
        </div>

        <div className="coins-dispenser-rack">
          {parsedCoins.map((c) => {
            const count = userCoinsCount[c] || 0;
            return (
              <div key={c} className="coin-slot">
                <div className="coin-disc" onClick={() => addCoin(c)}>
                  <span className="coin-disc-symbol">$</span>
                  <span className="coin-disc-val">{c}</span>
                </div>
                <div className="coin-slot-controls">
                  <button
                    className="btn-slot-adjust"
                    onClick={() => removeCoin(c)}
                    disabled={count === 0}
                  >
                    -
                  </button>
                  <span className="coin-slot-count">{count}</span>
                  <button
                    className="btn-slot-adjust"
                    onClick={() => addCoin(c)}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* User Attempt Status & Comparison */}
      <div className="comparison-board">
        {/* User Card */}
        <div
          className={`score-card ${
            isOptimal
              ? 'card-optimal'
              : isSuboptimal
              ? 'card-suboptimal'
              : userTotal > target
              ? 'card-excess'
              : 'card-incomplete'
          }`}
        >
          <div className="card-header-label">
            {language === 'es' ? 'Tu Selección Manual' : 'Your Selection'}
          </div>
          <div className="card-main-stat">
            <span className="sum-val">
              ${userTotal} / ${target}
            </span>
            <span className="count-val">
              ({userCoinsList.length} {language === 'es' ? 'monedas' : 'coins'})
            </span>
          </div>
          <div className="card-bag">
            {userCoinsList.length > 0 ? (
              <code>[{userCoinsList.join(', ')}]</code>
            ) : (
              <em>{language === 'es' ? 'Ninguna moneda agregada' : 'No coins selected'}</em>
            )}
          </div>
          <div className="card-feedback">
            {isOptimal && (
              <span className="feedback-badge optimal">
                🎉 {language === 'es' ? '¡Excelente! Mínimo absoluto alcanzado.' : 'Awesome! True global minimum.'}
              </span>
            )}
            {isSuboptimal && (
              <span className="feedback-badge suboptimal">
                ⚠️ {language === 'es'
                  ? `Suma exacta alcanzada, pero con ${userCoinsList.length} monedas. ¡La PD lo logra con solo ${optimalSolution.length}!`
                  : `Exact sum reached, but using ${userCoinsList.length} coins. DP achieves it in ${optimalSolution.length}!`}
              </span>
            )}
            {userTotal < target && (
              <span className="feedback-badge pending">
                {language === 'es'
                  ? `Faltan $${target - userTotal} para alcanzar el objetivo.`
                  : `Remaining $${target - userTotal} to reach target.`}
              </span>
            )}
            {userTotal > target && (
              <span className="feedback-badge error">
                ❌ {language === 'es'
                  ? `Te excediste por $${userTotal - target}.`
                  : `Exceeded target by $${userTotal - target}.`}
              </span>
            )}
          </div>
        </div>

        {/* DP Card */}
        <div className="score-card card-benchmark dp-benchmark">
          <div className="card-header-label">
            {language === 'es' ? 'Programación Dinámica (Óptimo)' : 'Dynamic Programming (Optimal)'}
          </div>
          <div className="card-main-stat">
            <span className="benchmark-coins">
              {optimalSolution.length > 0
                ? `${optimalSolution.length} ${language === 'es' ? 'monedas' : 'coins'}`
                : language === 'es'
                ? 'Imposible'
                : 'Impossible'}
            </span>
          </div>
          <div className="card-bag">
            {isOptimal ? (
              <code>[{optimalSolution.join(', ')}]</code>
            ) : optimalSolution.length > 0 ? (
              <span style={{ fontStyle: 'italic', opacity: 0.8 }}>
                {language === 'es' ? '🔒 ??? (¡descúbrelo tú mismo!)' : '🔒 ??? (discover it yourself!)'}
              </span>
            ) : (
              <em>{language === 'es' ? 'No existe combinación' : 'No combination exists'}</em>
            )}
          </div>
          <div className="card-desc">
            {language === 'es'
              ? 'Garantizado por el principio de optimalidad de Bellman O(V · |C|).'
              : 'Guaranteed by Bellman optimality principle in O(V · |C|).'}
          </div>
        </div>

        {/* Greedy Card */}
        <div className="score-card card-benchmark greedy-benchmark">
          <div className="card-header-label">
            {language === 'es' ? 'Heurística Greedy (Greedy)' : 'Greedy Heuristic'}
          </div>
          <div className="card-main-stat">
            <span className="benchmark-coins">
              {greedySolution !== null
                ? `${greedySolution.length} ${language === 'es' ? 'monedas' : 'coins'}`
                : language === 'es'
                ? 'Bloqueado'
                : 'Blocked'}
            </span>
          </div>
          <div className="card-bag">
            {greedySolution !== null ? (
              <code>[{greedySolution.join(', ')}]</code>
            ) : (
              <em>{language === 'es' ? 'No puede completar cambio' : 'Cannot complete change'}</em>
            )}
          </div>
          <div className="card-desc">
            {greedySolution && greedySolution.length > optimalSolution.length ? (
              <span className="greedy-subopt-warning">
                {language === 'es'
                  ? 'Falla la propiedad de elección greedy: usa más monedas.'
                  : 'Fails greedy choice property: uses more coins.'}
              </span>
            ) : greedySolution ? (
              <span>
                {language === 'es'
                  ? 'Coincide con el óptimo para este caso particular.'
                  : 'Matches optimal for this specific instance.'}
              </span>
            ) : (
              <span className="greedy-subopt-warning">
                {language === 'es'
                  ? 'Greedy queda atrapado sin dar el cambio exacto.'
                  : 'Greedy gets stuck without making exact change.'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Educational Explanation Box */}
      <div className="pedagogy-box">
        <h4>
          {language === 'es'
            ? '💡 ¿Por qué las monedas comunes permiten Greedy pero otros sistemas no?'
            : '💡 Why do standard coin systems allow Greedy while others do not?'}
        </h4>
        <p>
          {language === 'es'
            ? 'Los sistemas monetarios del mundo real (como el Peso Argentino o el Dólar Estadounidense) están especialmente diseñados como "sistemas canónicos" donde la elección greedy siempre coincide con el óptimo global. Sin embargo, en cuanto introducimos monedas arbitrarias (como [1, 3, 4] o [1, 5, 6, 9]), el algoritmo greedy pierde su garantía matemática. Por eso la Programación Dinámica es el método general indispensable en Ciencias de la Computación.'
            : 'Real-world currency systems are specifically engineered as "canonical coin systems" where greedy choice always achieves global optimality. However, with arbitrary denominations (like [1, 3, 4] or [1, 5, 6, 9]), greedy breaks down. Dynamic programming remains the robust general-purpose algorithm.'}
        </p>
      </div>
    </div>
  );
};
