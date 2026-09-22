import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { solveJuanElVago } from '../../engine/algorithms/juanElVagoValidator';
import './JuanElVagoPlayground.css';

interface Preset {
  name: { es: string; en: string };
  ganancias: number[];
}

const PRESETS: Preset[] = [
  {
    name: { es: 'Ejemplo Cátedra: Alternar extremos', en: 'Course Example: Alternating ends' },
    ganancias: [10, 40, 20, 30, 50]
  },
  {
    name: { es: 'Trampa Greedy (Evitar el máximo falso)', en: 'Greedy Trap (Avoid false max)' },
    ganancias: [100, 10, 10, 100]
  },
  {
    name: { es: 'Guía FIUBA: 5 días', en: 'FIUBA Guide: 5 days' },
    ganancias: [2, 7, 9, 3, 1]
  },
  {
    name: { es: 'Caso Simétrico', en: 'Symmetric Case' },
    ganancias: [5, 1, 1, 5]
  }
];

export const JuanElVagoPlayground: React.FC = () => {
  const { language } = useLanguage();
  const [gananciasStr, setGananciasStr] = useState<string>('10, 40, 20, 30, 50');
  const [manualSelection, setManualSelection] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  const ganancias = useMemo(() => {
    try {
      const parts = gananciasStr
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (parts.length === 0) return [];
      return parts.map((s) => {
        const n = Number(s);
        if (isNaN(n) || n < 0) throw new Error(`"${s}" debe ser un entero no negativo`);
        return n;
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al procesar ganancias');
      return [];
    }
  }, [gananciasStr]);

  const optimal = useMemo(() => {
    if (ganancias.length === 0) return null;
    return solveJuanElVago(ganancias);
  }, [ganancias]);

  // Check manual selection constraints
  const manualStatus = useMemo(() => {
    const sorted = [...manualSelection].sort((a, b) => a - b);
    let hasConsecutiveViolation = false;
    let violatingPair: [number, number] | null = null;

    for (let i = 0; i < sorted.length - 1; i++) {
      if (sorted[i + 1] === sorted[i] + 1) {
        hasConsecutiveViolation = true;
        violatingPair = [sorted[i], sorted[i + 1]];
        break;
      }
    }

    const totalEarned = manualSelection.reduce((sum, d) => sum + (ganancias[d] || 0), 0);

    return {
      isValid: !hasConsecutiveViolation,
      violatingPair,
      totalEarned,
      isOptimal: optimal ? totalEarned === optimal.monto && !hasConsecutiveViolation : false
    };
  }, [manualSelection, ganancias, optimal]);

  const toggleDay = (dayIndex: number) => {
    setManualSelection((prev) =>
      prev.includes(dayIndex) ? prev.filter((d) => d !== dayIndex) : [...prev, dayIndex]
    );
  };

  const handlePresetSelect = (preset: Preset) => {
    setGananciasStr(preset.ganancias.join(', '));
    setManualSelection([]);
    setError(null);
  };

  const selectOptimal = () => {
    if (optimal) {
      setManualSelection([...optimal.dias]);
    }
  };

  return (
    <div className="juan-vago-playground">
      <div className="playground-header">
        <h3>
          {language === 'es'
            ? 'Laboratorio: ¿Puedes superar la Programación Dinámica?'
            : 'Playground: Can you beat Dynamic Programming?'}
        </h3>
        <p>
          {language === 'es'
            ? 'Haz clic en los días para armar tu propuesta de trabajo para Juan. Recuerda su única condición: ¡no trabaja dos días seguidos!'
            : 'Click on days to choose your work schedule for Juan. Remember his condition: never work two consecutive days!'}
        </p>
      </div>

      {/* Preset Chips */}
      <div className="presets-row">
        <span className="presets-label">
          {language === 'es' ? 'Ejemplos de Cátedra:' : 'Course Examples:'}
        </span>
        <div className="preset-buttons">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              className="chip-button"
              onClick={() => handlePresetSelect(p)}
            >
              {p.name[language]}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="input-block">
        <label htmlFor="ganancias-input">
          {language === 'es' ? 'Ofertas diarias ($):' : 'Daily earnings ($):'}
        </label>
        <input
          id="ganancias-input"
          type="text"
          value={gananciasStr}
          onChange={(e) => {
            setGananciasStr(e.target.value);
            setManualSelection([]);
            setError(null);
          }}
          className="ganancias-field"
        />
        {error && <div className="error-text">{error}</div>}
      </div>

      {/* Interactive Days Calendar */}
      {ganancias.length > 0 && (
        <div className="interactive-schedule">
          <div className="schedule-header">
            <span>{language === 'es' ? 'Toca los días para contratar a Juan:' : 'Click days to hire Juan:'}</span>
            <button className="btn-auto-opt" onClick={selectOptimal}>
              {language === 'es' ? '⚡ Ver Solución Óptima' : '⚡ Show Optimal'}
            </button>
          </div>

          <div className="days-picker">
            {ganancias.map((gain, idx) => {
              const isSelected = manualSelection.includes(idx);
              const isOpt = optimal?.dias.includes(idx);

              let cardClass = 'picker-card';
              if (isSelected) cardClass += ' user-selected';
              if (isOpt && manualStatus.isOptimal) cardClass += ' optimal-match';

              return (
                <button
                  key={idx}
                  type="button"
                  className={cardClass}
                  onClick={() => toggleDay(idx)}
                >
                  <div className="picker-day">
                    {language === 'es' ? `Día ${idx}` : `Day ${idx}`}
                  </div>
                  <div className="picker-gain">${gain}</div>
                  <div className="picker-status">
                    {isSelected
                      ? language === 'es' ? '✓ TRABAJA' : '✓ WORKS'
                      : language === 'es' ? 'DESCANSAR' : 'REST'}
                  </div>
                </button>
              );
            })}
          </div>

          {/* User Score vs Optimal Score */}
          <div className="comparison-board">
            <div className={`score-card ${manualStatus.isValid ? 'valid' : 'invalid'}`}>
              <div className="score-title">
                {language === 'es' ? 'Tu Selección Manual' : 'Your Manual Selection'}
              </div>
              <div className="score-number">${manualStatus.totalEarned}</div>
              <div className="score-desc">
                {!manualStatus.isValid ? (
                  <span className="status-error">
                    ⚠️ {language === 'es'
                      ? `Infracción: Días ${manualStatus.violatingPair?.[0]} y ${manualStatus.violatingPair?.[1]} son consecutivos!`
                      : `Violation: Days ${manualStatus.violatingPair?.[0]} and ${manualStatus.violatingPair?.[1]} are consecutive!`}
                  </span>
                ) : manualStatus.isOptimal ? (
                  <span className="status-success">
                    🎉 {language === 'es' ? '¡Excelente! Encontraste el óptimo global.' : 'Awesome! You found global optimum.'}
                  </span>
                ) : (
                  <span className="status-subopt">
                    {language === 'es' ? 'Válido pero subóptimo.' : 'Valid but suboptimal.'}
                  </span>
                )}
              </div>
            </div>

            {optimal && (
              <div className="score-card optimal-card">
                <div className="score-title">
                  {language === 'es' ? 'Óptimo por Programación Dinámica' : 'Optimal by Dynamic Programming'}
                </div>
                <div className="score-number">${optimal.monto}</div>
                <div className="score-desc">
                  {language === 'es' ? 'Días recomendados:' : 'Recommended days:'}{' '}
                  <strong>[{optimal.dias.join(', ')}]</strong>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Educational takeaway */}
      <div className="pedagogy-tip">
        <h4>
          {language === 'es' ? '💡 ¿Por qué falla el enfoque greedy (Greedy)?' : '💡 Why does Greedy fail here?'}
        </h4>
        <p>
          {language === 'es'
            ? 'Una heurística greedy elegiría siempre el día de mayor ganancia inmediata. Por ejemplo, en [100, 10, 10, 100], si hubiera [10, 100, 10], tomar el 100 bloquea sus vecinos. O en [10, 40, 20, 30, 50], elegir mediante Greedy puede dejar a Juan sin acceso a sumas mayores. Programación Dinámica evalúa el impacto a futuro mediante memoización en tiempo lineal O(n).'
            : 'A greedy heuristic would always pick the highest paying day. But taking a high day blocks both its neighbors. Dynamic Programming considers future choices by memoizing optimal subproblem solutions in O(n) time.'}
        </p>
      </div>
    </div>
  );
};
