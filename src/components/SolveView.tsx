import React, { useState } from 'react';
import { ExerciseMetadata } from '../types';

interface SolveViewProps {
  exercise: ExerciseMetadata;
  onSuccess: () => void;
  onSkipToUnderstand: () => void;
  starterCode?: string;
}

export const SolveView: React.FC<SolveViewProps> = ({
  exercise,
  onSuccess,
  onSkipToUnderstand,
  starterCode = '# Escribe tu solución aquí en Python\ndef resolver(n):\n    pass\n'
}) => {
  const [code, setCode] = useState(starterCode);
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [testStatus, setTestStatus] = useState<'idle' | 'running' | 'passed' | 'failed'>('idle');
  const [testSummary, setTestSummary] = useState<string>('');

  const hints = [
    'Pista 1: Identifica qué información mínima necesitas recordar al avanzar de una etapa o fila a la siguiente.',
    'Pista 2: Cada decisión restringe fuertemente las opciones futuras. Intenta podar tan pronto como se detecte una incompatibilidad.',
    'Pista 3: Construye la solución de forma incremental. Si una rama no tiene salida válida, retrocede (backtrack) y prueba la siguiente alternativa.'
  ];

  const toggleHint = (index: number) => {
    if (revealedHints.includes(index)) {
      setRevealedHints(revealedHints.filter((h) => h !== index));
    } else {
      setRevealedHints([...revealedHints, index]);
    }
  };

  const handleRunTests = () => {
    setTestStatus('running');
    setTimeout(() => {
      // Mock validation execution (in P5/P6 we integrate real validator & Pyodide)
      if (code.trim().length > 40 && !code.includes('pass')) {
        setTestStatus('passed');
        setTestSummary('¡Excelente! 10 / 10 casos de prueba superados con éxito.');
        onSuccess();
      } else {
        setTestStatus('failed');
        setTestSummary('2 / 10 pruebas superadas. Faltan casos bordes o la función devuelve None.');
      }
    }, 400);
  };

  return (
    <section className="phase-view solve-view" aria-labelledby="solve-heading">
      <div className="view-intro">
        <h3 id="solve-heading" className="view-title">
          2. Resolver: Plantea tu Solución Algorítmica
        </h3>
        <p className="view-lead">
          Implementa el algoritmo para <strong>{exercise.title.es}</strong>. Si te trabas, puedes consultar pistas progresivas
          o solicitar ver la solución canónica en cualquier momento.
        </p>
      </div>

      <div className="solve-layout">
        <div className="solve-editor-column">
          <div className="editor-card">
            <div className="editor-header">
              <span className="editor-lang-badge">Python 3</span>
              <span className="editor-filename">solucion.py</span>
            </div>
            <textarea
              className="code-editor-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              rows={12}
              aria-label="Editor de código Python para tu solución"
              spellCheck={false}
            />
            <div className="editor-actions">
              <button
                type="button"
                className="btn-run-tests"
                onClick={handleRunTests}
                disabled={testStatus === 'running'}
              >
                {testStatus === 'running' ? 'Ejecutando pruebas...' : '▶ Ejecutar pruebas locales'}
              </button>
            </div>
          </div>

          {testStatus !== 'idle' && (
            <div className={`test-feedback-card ${testStatus}`}>
              <h4>Resultado de la Evaluación</h4>
              <p>{testSummary}</p>
              {testStatus === 'passed' && (
                <button
                  type="button"
                  className="btn-primary mt-2"
                  onClick={onSuccess}
                >
                  Continuar a Comprender la Solución &rarr;
                </button>
              )}
            </div>
          )}
        </div>

        <aside className="solve-sidebar">
          <div className="hints-card">
            <h4>Pistas Progresivas (Máximo 3)</h4>
            <p className="hints-desc">Descubre pistas sólo si las necesitas para desbloquear tu razonamiento:</p>
            <div className="hints-list">
              {hints.map((hintText, idx) => {
                const isRevealed = revealedHints.includes(idx);
                return (
                  <div key={idx} className="hint-item">
                    <button
                      type="button"
                      className={`btn-toggle-hint ${isRevealed ? 'revealed' : ''}`}
                      onClick={() => toggleHint(idx)}
                      aria-expanded={isRevealed}
                    >
                      {isRevealed ? `▼ Pista ${idx + 1}` : `▶ Ver Pista ${idx + 1}`}
                    </button>
                    {isRevealed && <div className="hint-content">{hintText}</div>}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="skip-solution-card">
            <h4>¿Prefieres ver la solución directa?</h4>
            <p>
              El objetivo es pedagógico. Puedes consultar la solución canónica comentada y el análisis
              formal de complejidad sin ser bloqueado.
            </p>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setShowSkipModal(true)}
            >
              Consultar solución canónica
            </button>
          </div>
        </aside>
      </div>

      {showSkipModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="skip-dialog-title">
          <div className="modal-card">
            <h4 id="skip-dialog-title">¿Deseas pasar directamente a la Solución?</h4>
            <p>
              Te recomendamos intentar resolver el problema unos minutos más o usar las pistas.
              Sin embargo, puedes desbloquear la explicación canónica completa de inmediato.
            </p>
            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowSkipModal(false)}
              >
                Seguir intentando
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  setShowSkipModal(false);
                  onSkipToUnderstand();
                }}
              >
                Ver solución canónica &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
