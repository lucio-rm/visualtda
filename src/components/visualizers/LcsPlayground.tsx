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
    name: { es: 'Ejemplo Cátedra (CLRS / FIUBA)', en: 'Course Example (CLRS / FIUBA)' },
    s1: 'ABCBDAB',
    s2: 'BDCABA'
  },
  {
    name: { es: 'Secuencias de ADN (Bioinformática)', en: 'DNA Sequences (Bioinformatics)' },
    s1: 'ACCGGTC',
    s2: 'AGTGTC'
  },
  {
    name: { es: 'Español: CORAZON / RAZON', en: 'Spanish: CORAZON / RAZON' },
    s1: 'CORAZON',
    s2: 'RAZON'
  },
  {
    name: { es: 'Disjuntas (Sin Caracteres Comunes)', en: 'Disjoint (No Common Chars)' },
    s1: 'HOLA',
    s2: 'TREN'
  }
];

interface AlignmentLink {
  i: number;
  j: number;
}

export const LcsPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();
  const [activePresetIdx, setActivePresetIdx] = useState<number | 'custom'>(0);
  const [s1, setS1] = useState<string>('ABCBDAB');
  const [s2, setS2] = useState<string>('BDCABA');
  const [userGuess, setUserGuess] = useState<string>('');

  // Interactive ribbon matching state: links between index in s1 and index in s2
  const [selectedS1Index, setSelectedS1Index] = useState<number | null>(null);
  const [links, setLinks] = useState<AlignmentLink[]>([]);
  const [ribbonError, setRibbonError] = useState<string | null>(null);

  const optimalLcs = useMemo(() => {
    return solveLcs(s1, s2);
  }, [s1, s2]);

  // Compute optimal links via dynamic programming traceback
  const optimalLinks = useMemo(() => {
    const m = s1.length;
    const n = s2.length;
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
      }
    }

    // Traceback
    const res: AlignmentLink[] = [];
    let i = m;
    let j = n;
    while (i > 0 && j > 0) {
      if (s1[i - 1] === s2[j - 1]) {
        res.unshift({ i: i - 1, j: j - 1 });
        i--;
        j--;
      } else if (dp[i - 1][j] >= dp[i][j - 1]) {
        i--;
      } else {
        j--;
      }
    }
    return res;
  }, [s1, s2]);

  // Check if any links cross each other
  const crossingInfo = useMemo(() => {
    const sorted = [...links].sort((a, b) => a.i - b.i);
    let hasCrossing = false;
    const crossingPairs: [AlignmentLink, AlignmentLink][] = [];

    for (let a = 0; a < sorted.length; a++) {
      for (let b = a + 1; b < sorted.length; b++) {
        const linkA = sorted[a];
        const linkB = sorted[b];
        if (linkA.i < linkB.i && linkA.j > linkB.j) {
          hasCrossing = true;
          crossingPairs.push([linkA, linkB]);
        }
      }
    }

    // Candidate string formed by sorted non-crossing links
    let derivedString = '';
    if (!hasCrossing) {
      derivedString = sorted.map((l) => s1[l.i]).join('');
    }

    return { hasCrossing, crossingPairs, derivedString };
  }, [links, s1]);

  const userValidation = useMemo(() => {
    const candidate = userGuess || crossingInfo.derivedString;
    if (!candidate) return null;
    const isSub1 = isSubsequence(candidate, s1);
    const isSub2 = isSubsequence(candidate, s2);
    const val = lcsValidator.validate({ s1, s2 }, candidate);
    return {
      candidate,
      isSub1,
      isSub2,
      isOptimal: val.valid,
      errors: val.errors
    };
  }, [userGuess, crossingInfo.derivedString, s1, s2]);

  useEffect(() => {
    if (userValidation?.isOptimal) {
      markAttempted('lcs-dp');
    }
  }, [userValidation, markAttempted]);

  const handlePreset = (p: Preset, idx: number) => {
    setActivePresetIdx(idx);
    setS1(p.s1);
    setS2(p.s2);
    setUserGuess('');
    setLinks([]);
    setSelectedS1Index(null);
    setRibbonError(null);
  };

  const handleS1CharClick = (i: number) => {
    if (selectedS1Index === i) {
      setSelectedS1Index(null);
    } else {
      setSelectedS1Index(i);
      setRibbonError(null);
    }
  };

  const handleS2CharClick = (j: number) => {
    if (selectedS1Index === null) {
      // Find if already linked to remove
      const existing = links.find((l) => l.j === j);
      if (existing) {
        setLinks(links.filter((l) => l.j !== j));
        setRibbonError(null);
      } else {
        setRibbonError(
          language === 'es'
            ? 'Primero selecciona una letra en la Cadena 1 (s1) y luego su pareja idéntica en la Cadena 2 (s2).'
            : 'First select a character in String 1 (s1), then its matching character in String 2 (s2).'
        );
      }
      return;
    }

    const char1 = s1[selectedS1Index];
    const char2 = s2[j];

    if (char1 !== char2) {
      setRibbonError(
        language === 'es'
          ? `Caracteres distintos: no puedes alinear '${char1}' (s1) con '${char2}' (s2). Solo caracteres idénticos pueden pertenecer a una subsecuencia común.`
          : `Different characters: cannot align '${char1}' (s1) with '${char2}' (s2). Only identical characters can belong to a common subsequence.`
      );
      return;
    }

    // Add or replace link
    const newLinks = links.filter((l) => l.i !== selectedS1Index && l.j !== j);
    newLinks.push({ i: selectedS1Index, j });
    setLinks(newLinks);
    setSelectedS1Index(null);
    setRibbonError(null);
  };

  const handleAlignOptimal = () => {
    setLinks(optimalLinks);
    setSelectedS1Index(null);
    setRibbonError(null);
    setUserGuess(optimalLcs);
  };

  const handleClearRibbons = () => {
    setLinks([]);
    setSelectedS1Index(null);
    setRibbonError(null);
    setUserGuess('');
  };

  // Dimensions for ribbon canvas
  const charWidth = 40;
  const gapWidth = 14;
  const svgWidth = Math.max(s1.length, s2.length) * (charWidth + gapWidth) + 60;
  const svgHeight = 180;
  const s1Y = 35;
  const s2Y = 145;

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
            ? 'Haz clic en una letra de s1 y luego en su pareja idéntica en s2 para trazar una alineación. Comprueba que las líneas no se crucen (invariante de orden relativo) y compara con la solución óptima de Programación Dinámica.'
            : 'Click a letter in s1 then its matching letter in s2 to draw an alignment. Ensure lines do not cross (relative order invariant) and compare with the DP optimal solution.'}
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
              className={`chip-button ${activePresetIdx === idx ? 'active' : ''}`}
              onClick={() => handlePreset(p, idx)}
            >
              {p.name[language]}
            </button>
          ))}
          <button
            className={`chip-button ${activePresetIdx === 'custom' ? 'active' : ''}`}
            onClick={() => setActivePresetIdx('custom')}
          >
            {language === 'es' ? 'Caso propio' : 'Custom Case'}
          </button>
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
            maxLength={14}
            onChange={(e) => {
              setActivePresetIdx('custom');
              setS1(e.target.value.toUpperCase());
              setUserGuess('');
              setLinks([]);
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
            maxLength={14}
            onChange={(e) => {
              setActivePresetIdx('custom');
              setS2(e.target.value.toUpperCase());
              setUserGuess('');
              setLinks([]);
            }}
            className="input-field"
          />
        </div>
      </div>

      {/* Interactive Ribbon Matching Canvas */}
      <div
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>
            {language === 'es' ? 'Alineación Visual de Caracteres:' : 'Visual Character Alignment:'}{' '}
            <strong style={{ color: 'var(--accent)' }}>
              {links.length} {language === 'es' ? 'emparejamientos' : 'matches'}
            </strong>
          </span>

          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              type="button"
              className="chip-button"
              onClick={handleAlignOptimal}
              style={{ borderColor: '#10b981', color: '#10b981', fontWeight: 600 }}
            >
              ★ {language === 'es' ? 'Alinear Óptimo (DP)' : 'Align Optimal (DP)'}
            </button>
            <button
              type="button"
              className="chip-button"
              onClick={handleClearRibbons}
              disabled={links.length === 0}
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
            >
              ✕ {language === 'es' ? 'Limpiar líneas' : 'Clear lines'}
            </button>
          </div>
        </div>

        {ribbonError && (
          <div
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              borderLeft: '4px solid #ef4444',
              borderRadius: '4px',
              fontSize: '0.85rem',
              color: 'var(--text)'
            }}
          >
            {ribbonError}
          </div>
        )}

        {crossingInfo.hasCrossing && (
          <div
            style={{
              padding: '0.5rem 0.75rem',
              backgroundColor: 'rgba(245, 158, 11, 0.15)',
              borderLeft: '4px solid #f59e0b',
              borderRadius: '4px',
              fontSize: '0.85rem',
              color: 'var(--text)'
            }}
          >
            ⚠{' '}
            <strong>
              {language === 'es' ? 'Violación de Invariante de Orden:' : 'Order Invariant Violation:'}
            </strong>{' '}
            {language === 'es'
              ? 'Dos o más líneas de alineación se cruzan. En una subsecuencia común válida, el orden relativo de los caracteres debe preservarse estrictamente (si i₁ < i₂ entonces j₁ < j₂).'
              : 'Two or more alignment lines cross. In a valid common subsequence, relative character order must be strictly preserved (if i₁ < i₂ then j₁ < j₂).'}
          </div>
        )}

        {/* SVG Alignment Canvas */}
        <div style={{ overflowX: 'auto', display: 'flex', justifyContent: 'center' }}>
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            style={{ minWidth: `${svgWidth}px`, height: `${svgHeight}px` }}
          >
            {/* Draw Connecting Ribbon Lines */}
            {links.map((link, idx) => {
              const x1 = 30 + link.i * (charWidth + gapWidth) + charWidth / 2;
              const y1 = s1Y + charWidth / 2;
              const x2 = 30 + link.j * (charWidth + gapWidth) + charWidth / 2;
              const y2 = s2Y + charWidth / 2;

              // Check if this specific link crosses with any other
              const isCrossing = links.some(
                (other) =>
                  (link.i < other.i && link.j > other.j) ||
                  (link.i > other.i && link.j < other.j)
              );

              return (
                <line
                  key={`link-${idx}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isCrossing ? '#ef4444' : '#10b981'}
                  strokeWidth={isCrossing ? 2 : 2.5}
                  strokeDasharray={isCrossing ? '4 3' : undefined}
                  opacity={0.85}
                />
              );
            })}

            {/* String 1 (s1) Letter Boxes */}
            {s1.split('').map((char, i) => {
              const x = 30 + i * (charWidth + gapWidth);
              const y = s1Y;
              const isSelected = selectedS1Index === i;
              const isLinked = links.some((l) => l.i === i);

              return (
                <g
                  key={`s1-char-${i}`}
                  onClick={() => handleS1CharClick(i)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={x}
                    y={y}
                    width={charWidth}
                    height={charWidth}
                    rx={6}
                    fill={
                      isSelected
                        ? 'rgba(56, 189, 248, 0.35)'
                        : isLinked
                        ? 'rgba(16, 185, 129, 0.25)'
                        : 'var(--surface)'
                    }
                    stroke={
                      isSelected
                        ? '#38bdf8'
                        : isLinked
                        ? '#10b981'
                        : 'var(--border)'
                    }
                    strokeWidth={isSelected ? 2.5 : 1.5}
                  />
                  <text
                    x={x + charWidth / 2}
                    y={y + charWidth / 2 + 6}
                    textAnchor="middle"
                    fill={isSelected ? '#38bdf8' : isLinked ? '#10b981' : 'var(--text)'}
                    fontFamily="var(--font-mono)"
                    fontSize="18px"
                    fontWeight="800"
                  >
                    {char}
                  </text>
                  <text
                    x={x + charWidth / 2}
                    y={y - 8}
                    textAnchor="middle"
                    fill="var(--text-muted)"
                    fontSize="10px"
                    fontFamily="var(--font-mono)"
                  >
                    i={i}
                  </text>
                </g>
              );
            })}

            {/* String 2 (s2) Letter Boxes */}
            {s2.split('').map((char, j) => {
              const x = 30 + j * (charWidth + gapWidth);
              const y = s2Y;
              const isLinked = links.some((l) => l.j === j);

              return (
                <g
                  key={`s2-char-${j}`}
                  onClick={() => handleS2CharClick(j)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect
                    x={x}
                    y={y}
                    width={charWidth}
                    height={charWidth}
                    rx={6}
                    fill={isLinked ? 'rgba(16, 185, 129, 0.25)' : 'var(--surface)'}
                    stroke={isLinked ? '#10b981' : 'var(--border)'}
                    strokeWidth={isLinked ? 2 : 1.5}
                  />
                  <text
                    x={x + charWidth / 2}
                    y={y + charWidth / 2 + 6}
                    textAnchor="middle"
                    fill={isLinked ? '#10b981' : 'var(--text)'}
                    fontFamily="var(--font-mono)"
                    fontSize="18px"
                    fontWeight="800"
                  >
                    {char}
                  </text>
                  <text
                    x={x + charWidth / 2}
                    y={y + charWidth + 14}
                    textAnchor="middle"
                    fill="var(--text-muted)"
                    fontSize="10px"
                    fontFamily="var(--font-mono)"
                  >
                    j={j}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Comparison Board */}
      <div className="comparison-board">
        {/* User Card */}
        <div className="score-card user-card">
          <div className="card-label">
            {language === 'es' ? 'Tu Alineación / Propuesta' : 'Your Alignment / Proposal'}
          </div>
          <div className="card-val">
            "{crossingInfo.derivedString || userGuess || '—'}"
            <span className="card-len">
              ({(crossingInfo.derivedString || userGuess).length} chars)
            </span>
          </div>

          <div className="validation-checks">
            {crossingInfo.derivedString || userGuess ? (
              <>
                <div className={`check-line ${userValidation?.isSub1 ? 'valid' : 'invalid'}`}>
                  {userValidation?.isSub1 ? '✓' : '✕'} {' '}
                  {language === 'es' ? 'Es subsecuencia de s1' : 'Is subsequence of s1'}
                </div>
                <div className={`check-line ${userValidation?.isSub2 ? 'valid' : 'invalid'}`}>
                  {userValidation?.isSub2 ? '✓' : '✕'} {' '}
                  {language === 'es' ? 'Es subsecuencia de s2' : 'Is subsequence of s2'}
                </div>
                <div className="feedback-banner">
                  {userValidation?.isOptimal ? (
                    <span className="status-opt" style={{ color: '#10b981', fontWeight: 800 }}>
                      🎉 {language === 'es' ? '¡Subsecuencia Común Más Larga verificada!' : 'Longest Common Subsequence verified!'}
                    </span>
                  ) : userValidation?.isSub1 && userValidation?.isSub2 ? (
                    <span className="status-subopt" style={{ color: '#f59e0b', fontWeight: 600 }}>
                      {language === 'es'
                        ? `Es común pero subóptima (${userValidation.candidate.length} < ${optimalLcs.length}). ¿Puedes alinear más caracteres?`
                        : `Common but suboptimal (${userValidation.candidate.length} < ${optimalLcs.length}). Can you match more?`}
                    </span>
                  ) : (
                    <span className="status-error" style={{ color: '#ef4444' }}>
                      {language === 'es' ? 'Alineación inválida o con cruces.' : 'Invalid or crossing alignment.'}
                    </span>
                  )}
                </div>
              </>
            ) : (
              <em className="prompt-text">
                {language === 'es' ? 'Haz clic en letras arriba para alinear.' : 'Click letters above to align.'}
              </em>
            )}
          </div>
        </div>

        {/* DP Optimal Card */}
        <div className="score-card dp-card">
          <div className="card-label">
            {language === 'es' ? 'Óptimo (Programación Dinámica)' : 'Optimal (Dynamic Programming)'}
          </div>
          <div className="card-val" style={{ color: '#10b981' }}>
            "{optimalLcs || '∅'}"
            <span className="card-len">({optimalLcs.length} chars)</span>
          </div>
          <div className="card-explanation">
            {language === 'es'
              ? `Matriz DP de dimensión (${s1.length}+1) × (${s2.length}+1) calculada en tiempo O(m·n) = ${s1.length * s2.length} operaciones elementales.`
              : `DP matrix size (${s1.length}+1) × (${s2.length}+1) computed in O(m·n) = ${s1.length * s2.length} operations.`}
          </div>
        </div>
      </div>

      {/* Educational Diff Insight */}
      <div className="pedagogy-tip">
        <h4>
          {language === 'es'
            ? '¿Cómo se relaciona el LCS con el comando git diff?'
            : 'How does LCS relate to git diff?'}
        </h4>
        <p>
          {language === 'es'
            ? 'Cuando ejecutas git diff entre dos versiones de un archivo, Git modela cada línea de código como un "carácter" de una secuencia. Al encontrar el LCS entre las líneas de la versión vieja y la nueva, todas las líneas pertenecientes al LCS se conservan (sin cambios), las que solo están en la versión vieja se marcan como eliminadas (-) y las que solo están en la nueva se marcan como añadidas (+).'
            : 'When you run git diff between two file versions, Git models each line as a character of a sequence. Finding the LCS between old and new versions identifies unchanged lines, lines only in old are deleted (-), and lines only in new are added (+).'}
        </p>
      </div>
    </div>
  );
};
