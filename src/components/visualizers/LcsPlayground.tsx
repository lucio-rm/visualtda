import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { solveLcs, lcsValidator, isSubsequence } from '../../engine/algorithms/lcsValidator';
import './LcsPlayground.css';

interface Preset {
  name: { es: string; en: string };
  s1: string;
  s2: string;
}

const PRESETS: Preset[] = [
  {
    name: { es: '★ Ejemplo Cátedra (CLRS / FIUBA)', en: '★ Course Example (CLRS / FIUBA)' },
    s1: 'ABCBDAB',
    s2: 'BDCABA'
  },
  {
    name: { es: '🧬 Secuencias de ADN (Bioinformática)', en: '🧬 DNA Sequences (Bioinformatics)' },
    s1: 'ACCGGTC',
    s2: 'AGTGTC'
  },
  {
    name: { es: '📖 Español: CORAZON / RAZON', en: '📖 Spanish: CORAZON / RAZON' },
    s1: 'CORAZON',
    s2: 'RAZON'
  },
  {
    name: { es: '🚫 Disjuntas (Sin Caracteres Comunes)', en: '🚫 Disjoint (No Common Chars)' },
    s1: 'HOLA',
    s2: 'TREN'
  }
];

export const LcsPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();
  const [s1, setS1] = useState<string>('ABCBDAB');
  const [s2, setS2] = useState<string>('BDCABA');
  const [userGuess, setUserGuess] = useState<string>('');

  const optimalLcs = useMemo(() => {
    return solveLcs(s1, s2);
  }, [s1, s2]);

  const userValidation = useMemo(() => {
    if (!userGuess) return null;
    const isSub1 = isSubsequence(userGuess, s1);
    const isSub2 = isSubsequence(userGuess, s2);
    const val = lcsValidator.validate({ s1, s2 }, userGuess);
    return {
      isSub1,
      isSub2,
      isOptimal: val.valid,
      errors: val.errors
    };
  }, [userGuess, s1, s2]);

  useEffect(() => {
    if (userValidation?.isOptimal) {
      markAttempted('lcs-dp');
    }
  }, [userValidation, markAttempted]);

  const handlePreset = (p: Preset) => {
    setS1(p.s1);
    setS2(p.s2);
    setUserGuess('');
  };

  return (
    <div className="lcs-playground">
      <div className="playground-header">
        <h3>
          {language === 'es'
            ? 'Laboratorio: ¿Puedes encontrar la Subsecuencia Común Más Larga?'
            : 'Playground: Can you find the Longest Common Subsequence?'}
        </h3>
        <p>
          {language === 'es'
            ? 'Ingresa dos cadenas de texto o selecciona un caso típico. Pon a prueba tu intuición proponiendo subsecuencias comunes y compáralas con el óptimo de la Programación Dinámica.'
            : 'Enter two strings or choose a preset. Test your intuition by proposing common subsequences and compare with Dynamic Programming.'}
        </p>
      </div>

      {/* Presets */}
      <div className="presets-row">
        <span className="presets-label">
          {language === 'es' ? 'Casos de Estudio:' : 'Case Studies:'}
        </span>
        <div className="preset-buttons">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              className="chip-button"
              onClick={() => handlePreset(p)}
            >
              {p.name[language]}
            </button>
          ))}
        </div>
      </div>

      {/* String Inputs */}
      <div className="strings-inputs-grid">
        <div className="input-group">
          <label htmlFor="s1-input">
            {language === 'es' ? 'Cadena 1 (s1):' : 'String 1 (s1):'}
          </label>
          <input
            id="s1-input"
            type="text"
            value={s1}
            maxLength={16}
            onChange={(e) => {
              setS1(e.target.value.toUpperCase());
              setUserGuess('');
            }}
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label htmlFor="s2-input">
            {language === 'es' ? 'Cadena 2 (s2):' : 'String 2 (s2):'}
          </label>
          <input
            id="s2-input"
            type="text"
            value={s2}
            maxLength={16}
            onChange={(e) => {
              setS2(e.target.value.toUpperCase());
              setUserGuess('');
            }}
            className="input-field"
          />
        </div>
      </div>

      {/* User Proposal Input */}
      <div className="user-guess-section">
        <label htmlFor="user-guess-input">
          {language === 'es'
            ? '✍️ Escribe tu propuesta de subsecuencia común:'
            : '✍️ Enter your proposed common subsequence:'}
        </label>
        <div className="guess-input-row">
          <input
            id="user-guess-input"
            type="text"
            placeholder={language === 'es' ? 'Ej: BCBA' : 'E.g.: BCBA'}
            value={userGuess}
            onChange={(e) => setUserGuess(e.target.value.toUpperCase())}
            className="input-field guess-field"
          />
        </div>
      </div>

      {/* Comparison Board */}
      <div className="comparison-board">
        {/* User Card */}
        <div className="score-card user-card">
          <div className="card-label">
            {language === 'es' ? 'Tu Propuesta' : 'Your Proposal'}
          </div>
          <div className="card-val">
            "{userGuess || '—'}"
            <span className="card-len">({userGuess.length} chars)</span>
          </div>

          <div className="validation-checks">
            {userGuess ? (
              <>
                <div className={`check-line ${userValidation?.isSub1 ? 'valid' : 'invalid'}`}>
                  {userValidation?.isSub1 ? '✓' : '✗'}{' '}
                  {language === 'es' ? 'Es subsecuencia de s1' : 'Is subsequence of s1'}
                </div>
                <div className={`check-line ${userValidation?.isSub2 ? 'valid' : 'invalid'}`}>
                  {userValidation?.isSub2 ? '✓' : '✗'}{' '}
                  {language === 'es' ? 'Es subsecuencia de s2' : 'Is subsequence of s2'}
                </div>
                <div className="feedback-banner">
                  {userValidation?.isOptimal ? (
                    <span className="status-opt">
                      {language === 'es' ? 'Subsecuencia común más larga identificada.' : 'Longest common subsequence identified.'}
                    </span>
                  ) : userValidation?.isSub1 && userValidation?.isSub2 ? (
                    <span className="status-subopt">
                      ⚠️ {language === 'es'
                        ? `Es común pero subóptima (${userGuess.length} < ${optimalLcs.length}).`
                        : `Common but suboptimal (${userGuess.length} < ${optimalLcs.length}).`}
                    </span>
                  ) : (
                    <span className="status-error">
                      ❌ {language === 'es' ? 'No es una subsecuencia común válida.' : 'Not a valid common subsequence.'}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <em className="prompt-text">
                {language === 'es' ? 'Escribe una propuesta para verificar.' : 'Enter a proposal to verify.'}
              </em>
            )}
          </div>
        </div>

        {/* DP Optimal Card */}
        <div className="score-card dp-card">
          <div className="card-label">
            {language === 'es' ? 'Óptimo (Programación Dinámica)' : 'Optimal (Dynamic Programming)'}
          </div>
          <div className="card-val">
            {userValidation?.isOptimal ? (
              <>
                "{optimalLcs || '∅'}"
                <span className="card-len">({optimalLcs.length} chars)</span>
              </>
            ) : (
              <span style={{ fontStyle: 'italic', opacity: 0.8 }}>
                {language === 'es' ? '🔒 Longitud óptima:' : '🔒 Optimal length:'} {optimalLcs.length} chars
              </span>
            )}
          </div>
          <div className="card-explanation">
            {language === 'es'
              ? `Calculado en tiempo O(m·n) = ${s1.length} × ${s2.length} = ${s1.length * s2.length} operaciones.`
              : `Computed in O(m·n) = ${s1.length} × ${s2.length} = ${s1.length * s2.length} operations.`}
          </div>
        </div>
      </div>

      {/* Educational Diff Insight */}
      <div className="pedagogy-tip">
        <h4>
          {language === 'es'
            ? '💡 ¿Cómo se relaciona el LCS con el comando git diff?'
            : '💡 How does LCS relate to git diff?'}
        </h4>
        <p>
          {language === 'es'
            ? 'Cuando ejecutas git diff entre dos versiones de un archivo, Git modela cada línea como un "carácter" de una secuencia. Al encontrar el LCS entre las líneas del archivo viejo y el nuevo, todas las líneas pertenecientes al LCS se conservan (sin cambios), las que solo están en el viejo se marcan como eliminadas (-) y las que solo están en el nuevo se marcan como añadidas (+).'
            : 'When you run git diff, Git treats each line as a character in a sequence. By computing the LCS between the old and new file versions, lines in the LCS remain unchanged, lines only in the old file are marked deleted (-), and lines only in the new file are marked added (+).'}
        </p>
      </div>
    </div>
  );
};
