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
      es: 'Contraejemplo Clásico (Greedy Falla)',
      en: 'Classic Counterexample (Greedy Fails)'
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
  const { markAttempted } = useStudentProgress();
  const [coinsStr, setCoinsStr] = useState<string>('1, 3, 4');
  const [target, setTarget] = useState<number>(6);
  const [userCoinsCount, setUserCoinsCount] = useState<Record<number, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [isDragOverTray, setIsDragOverTray] = useState<boolean>(false);

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

  // Drag and drop event handlers
  const handleDragStart = (e: React.DragEvent, c: number) => {
    e.dataTransfer.setData('text/plain', String(c));
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (!isDragOverTray) setIsDragOverTray(true);
  };

  const handleDragLeave = () => {
    setIsDragOverTray(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverTray(false);
    const cStr = e.dataTransfer.getData('text/plain');
    const c = Number(cStr);
    if (!isNaN(c) && c > 0) {
      addCoin(c);
    }
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
      markAttempted('coin-change-dp');
    }
  }, [isOptimal, markAttempted]);

  const progressPercent = Math.min(100, Math.round((userTotal / target) * 100));

  return (
    <div className="coin-change-playground" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="playground-header">
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>
          {language === 'es'
            ? 'Caja Registradora: ¿Logras dar el cambio con la menor cantidad de monedas?'
            : 'Cash Register: Can you give change with the fewest coins?'}
        </h3>
        <p style={{ margin: 0, color: 'var(--text-muted)' }}>
          {language === 'es'
            ? 'Experimenta con distintos sistemas de monedas. Arrastrá las monedas directamente hacia la bandeja para observar por qué la heurística greedy falla en monedas arbitrarias mientras que la Programación Dinámica siempre alcanza la solución óptima.'
            : 'Experiment with various coin denominations. Drag coins directly into the register tray to discover where greedy heuristics fail and dynamic programming succeeds.'}
        </p>
      </div>

      {/* Presets */}
      <div className="presets-row" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="presets-label" style={{ fontWeight: '600', fontSize: '0.85rem' }}>
          {language === 'es' ? 'Casos Pedagógicos:' : 'Pedagogical Cases:'}
        </span>
        <div className="preset-buttons" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              className="chip-button"
              onClick={() => setPreset(p)}
              style={{
                cursor: 'pointer',
                padding: '0.35rem 0.75rem',
                borderRadius: '16px',
                border: '1px solid var(--border)',
                backgroundColor: 'var(--bg)',
                color: 'var(--text)',
                fontSize: '0.8rem'
              }}
            >
              {p.name[language]}
            </button>
          ))}
        </div>
      </div>

      {/* Configuration Controls */}
      <div className="config-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label htmlFor="coins-input" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
            {language === 'es'
              ? 'Denominaciones disponibles (separadas por coma):'
              : 'Available denominations (comma-separated):'}
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
            style={{
              padding: '0.45rem 0.75rem',
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)'
            }}
          />
        </div>

        <div className="input-group input-target-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <label htmlFor="target-input" style={{ fontSize: '0.85rem', fontWeight: '600' }}>
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
            style={{
              padding: '0.45rem 0.75rem',
              backgroundColor: 'var(--bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              fontFamily: 'var(--font-mono)',
              maxWidth: '120px'
            }}
          />
        </div>
      </div>
      {error && <div className="error-banner">{error}</div>}

      {/* Interactive Coin Dispenser with Drag Support */}
      <div className="dispenser-section" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div className="dispenser-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span className="dispenser-title" style={{ fontWeight: '700', fontSize: '0.95rem' }}>
            {language === 'es' ? '1. Dispensador de Monedas (Hacé clic o arrastrá hacia la bandeja)' : '1. Coin Dispenser (Click or drag to tray)'}
          </span>
          <div className="quick-actions" style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="btn-preset"
              onClick={clearSelection}
              disabled={userCoinsList.length === 0}
              style={{ fontSize: '0.8rem' }}
            >
              {language === 'es' ? 'Vaciar' : 'Clear'}
            </button>
          </div>
        </div>

        <div className="coins-dispenser-rack" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', padding: '0.5rem 0' }}>
          {parsedCoins.map((c) => {
            const count = userCoinsCount[c] || 0;
            return (
              <div
                key={c}
                className="coin-slot"
                draggable
                onDragStart={(e) => handleDragStart(e, c)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'grab'
                }}
              >
                <div
                  className="coin-disc"
                  onClick={() => addCoin(c)}
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 35% 35%, #fbbf24, #d97706)',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.25), inset 0 2px 2px rgba(255,255,255,0.4)',
                    border: '2px solid #b45309',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: '#78350f',
                    fontWeight: '800',
                    fontFamily: 'var(--font-mono)',
                    userSelect: 'none',
                    transition: 'transform 0.1s ease'
                  }}
                  title={language === 'es' ? `Hacé clic o arrastrá para agregar $${c}` : `Click or drag to add $${c}`}
                >
                  <span style={{ fontSize: '9px', lineHeight: 1 }}>$</span>
                  <span style={{ fontSize: '16px', lineHeight: 1 }}>{c}</span>
                </div>

                <div className="coin-slot-controls" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <button
                    type="button"
                    className="btn-slot-adjust"
                    onClick={() => removeCoin(c)}
                    disabled={count === 0}
                    style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer' }}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '18px', textAlign: 'center', fontSize: '0.85rem', fontWeight: '700' }}>
                    {count}
                  </span>
                  <button
                    type="button"
                    className="btn-slot-adjust"
                    onClick={() => addCoin(c)}
                    style={{ width: '22px', height: '22px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer' }}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Cash Register Tray Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${isDragOverTray ? 'var(--accent)' : 'var(--border)'}`,
          backgroundColor: isDragOverTray ? 'var(--state-active-bg)' : 'var(--surface)',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontWeight: '700', fontSize: '0.95rem' }}>
            {language === 'es' ? '2. Bandeja de Pago (Soltá monedas aquí o hacé clic para remover)' : '2. Payment Tray (Drop coins here or click to remove)'}
          </span>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.9rem' }}>
            <span>
              {language === 'es' ? 'Acumulado:' : 'Accumulated:'}{' '}
              <strong style={{ color: userTotal === target ? 'var(--success)' : userTotal > target ? 'var(--error)' : 'var(--accent)' }}>
                ${userTotal}
              </strong>{' '}
              / ${target}
            </span>
            <span>
              {language === 'es' ? 'Monedas:' : 'Coins:'} <strong>{userCoinsList.length}</strong>
            </span>
          </div>
        </div>

        {/* Progress bar towards target */}
        <div style={{ height: '8px', backgroundColor: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              backgroundColor: userTotal === target ? 'var(--success)' : userTotal > target ? 'var(--error)' : 'var(--accent)',
              transition: 'width 0.2s ease, background-color 0.2s ease'
            }}
          />
        </div>

        {/* Coin Tokens In Tray */}
        <div style={{ minHeight: '60px', display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {userCoinsList.length === 0 ? (
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic', margin: 'auto' }}>
              {language === 'es'
                ? 'Arrastrá monedas aquí desde el dispensador para armar el cambio'
                : 'Drag coins here from dispenser to make change'}
            </span>
          ) : (
            userCoinsList.map((c, i) => (
              <button
                key={`tray-coin-${c}-${i}`}
                type="button"
                onClick={() => removeCoin(c)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.3rem 0.6rem',
                  borderRadius: '20px',
                  background: 'radial-gradient(circle at 35% 35%, #fbbf24, #d97706)',
                  color: '#78350f',
                  border: '1px solid #b45309',
                  fontWeight: '800',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.15)'
                }}
                title={language === 'es' ? 'Hacé clic para remover' : 'Click to remove'}
              >
                <span>${c}</span>
                <span style={{ fontSize: '11px', opacity: 0.7 }}>×</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Comparison Board */}
      <div className="comparison-board" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
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
          style={{
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}
        >
          <div className="card-header-label" style={{ fontSize: '0.85rem', fontWeight: '700' }}>
            {language === 'es' ? 'Tu Selección Manual' : 'Your Selection'}
          </div>
          <div className="card-main-stat" style={{ fontSize: '1.2rem', fontWeight: '800' }}>
            <span style={{ color: isOptimal ? 'var(--success)' : 'var(--text)' }}>
              ${userTotal} / ${target}
            </span>{' '}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              ({userCoinsList.length} {language === 'es' ? 'monedas' : 'coins'})
            </span>
          </div>
          <div className="card-bag" style={{ fontSize: '0.85rem' }}>
            {userCoinsList.length > 0 ? (
              <code>[{userCoinsList.join(', ')}]</code>
            ) : (
              <em>{language === 'es' ? 'Ninguna moneda agregada' : 'No coins selected'}</em>
            )}
          </div>
          <div className="card-feedback" style={{ fontSize: '0.8rem', marginTop: 'auto' }}>
            {isOptimal && (
              <span style={{ color: 'var(--success)', fontWeight: '700' }}>
                ✓ {language === 'es' ? 'Mínimo global alcanzado con éxito.' : 'Global minimum reached.'}
              </span>
            )}
            {isSuboptimal && (
              <span style={{ color: 'var(--warning)', fontWeight: '700' }}>
                ! {language === 'es'
                  ? `Suma exacta alcanzada con ${userCoinsList.length} monedas. La cota óptima por PD requiere ${optimalSolution.length} monedas.`
                  : `Exact sum reached with ${userCoinsList.length} coins. Optimal DP bound requires ${optimalSolution.length} coins.`}
              </span>
            )}
            {userTotal < target && (
              <span style={{ color: 'var(--text-muted)' }}>
                {language === 'es'
                  ? `Faltan $${target - userTotal} para alcanzar el objetivo.`
                  : `Remaining $${target - userTotal} to reach target.`}
              </span>
            )}
            {userTotal > target && (
              <span style={{ color: 'var(--error)' }}>
                {language === 'es'
                  ? `Objetivo excedido por $${userTotal - target}.`
                  : `Target exceeded by $${userTotal - target}.`}
              </span>
            )}
          </div>
        </div>

        {/* DP Card */}
        <div
          className="score-card card-benchmark dp-benchmark"
          style={{
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid var(--success)',
            backgroundColor: 'var(--state-solution-bg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}
        >
          <div className="card-header-label" style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--success)' }}>
            {language === 'es' ? 'Programación Dinámica (Óptimo)' : 'Dynamic Programming (Optimal)'}
          </div>
          <div className="card-main-stat" style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--success)' }}>
            {optimalSolution.length > 0
              ? `${optimalSolution.length} ${language === 'es' ? 'monedas' : 'coins'}`
              : language === 'es'
              ? 'Imposible'
              : 'Impossible'}
          </div>
          <div className="card-bag" style={{ fontSize: '0.85rem' }}>
            <code>[{optimalSolution.join(', ')}]</code>
          </div>
          <div className="card-desc" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'auto' }}>
            {language === 'es'
              ? 'Garantizado por el principio de optimalidad de Bellman en O(V · |C|).'
              : 'Guaranteed by Bellman optimality principle in O(V · |C|).'}
          </div>
        </div>

        {/* Greedy Card */}
        <div
          className="score-card card-benchmark greedy-benchmark"
          style={{
            padding: '1rem',
            borderRadius: '8px',
            border: `1px solid ${greedySolution && greedySolution.length > optimalSolution.length ? 'var(--warning)' : 'var(--border)'}`,
            backgroundColor: 'var(--surface)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}
        >
          <div className="card-header-label" style={{ fontSize: '0.85rem', fontWeight: '700' }}>
            {language === 'es' ? 'Heurística Greedy' : 'Greedy Heuristic'}
          </div>
          <div className="card-main-stat" style={{ fontSize: '1.2rem', fontWeight: '800' }}>
            {greedySolution !== null
              ? `${greedySolution.length} ${language === 'es' ? 'monedas' : 'coins'}`
              : language === 'es'
              ? 'Bloqueado'
              : 'Blocked'}
          </div>
          <div className="card-bag" style={{ fontSize: '0.85rem' }}>
            {greedySolution !== null ? (
              <code>[{greedySolution.join(', ')}]</code>
            ) : (
              <em>{language === 'es' ? 'No puede completar cambio' : 'Cannot complete change'}</em>
            )}
          </div>
          <div className="card-desc" style={{ fontSize: '0.8rem', marginTop: 'auto' }}>
            {greedySolution && greedySolution.length > optimalSolution.length ? (
              <span style={{ color: 'var(--warning)', fontWeight: '600' }}>
                {language === 'es'
                  ? 'Falla: Greedy toma la mayor moneda pero requiere más monedas en total.'
                  : 'Fails: Greedy takes largest coin first but ends up with more coins.'}
              </span>
            ) : greedySolution ? (
              <span style={{ color: 'var(--success)' }}>
                {language === 'es'
                  ? 'Coincide con el óptimo en este caso.'
                  : 'Matches optimal in this instance.'}
              </span>
            ) : (
              <span style={{ color: 'var(--error)' }}>
                {language === 'es'
                  ? 'Greedy queda atrapado sin dar el cambio exacto.'
                  : 'Greedy gets stuck without exact change.'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Educational Explanation Box */}
      <div
        className="pedagogy-box"
        style={{
          padding: '1rem',
          backgroundColor: 'var(--state-active-bg)',
          border: '1px solid var(--accent)',
          borderRadius: '8px',
          fontSize: '0.85rem'
        }}
      >
        <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--accent)' }}>
          {language === 'es'
            ? 'Fundamento: Sistemas Canónicos vs Arbitrarios'
            : 'Theoretical Foundation: Canonical vs Arbitrary Systems'}
        </h4>
        <p style={{ margin: 0, lineHeight: 1.5 }}>
          {language === 'es'
            ? 'Los sistemas monetarios del mundo real (como el Peso o el Dólar) son "sistemas canónicos", especialmente diseñados para que la heurística greedy coincida con el óptimo global. Sin embargo, con denominaciones arbitrarias como [1, 3, 4] para V=6, Greedy elige 4 + 1 + 1 (3 monedas), mientras que la Programación Dinámica descubre 3 + 3 (2 monedas). Por eso PD es indispensable para encontrar soluciones óptimas globales cuando las decisiones locales no son seguras.'
            : 'Real currency systems are canonical coin systems designed so greedy choices align with global optimality. However, with arbitrary sets like [1, 3, 4] for V=6, greedy takes 4 + 1 + 1 (3 coins), whereas dynamic programming discovers 3 + 3 (2 coins).'}
        </p>
      </div>
    </div>
  );
};
