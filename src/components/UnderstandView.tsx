import React, { useState } from 'react';
import { ExerciseMetadata } from '../types';

interface UnderstandViewProps {
  exercise: ExerciseMetadata;
  canonicalPython: string;
  pseudocode: string;
  correctnessExplanation: string;
  timeComplexity: string;
  spaceComplexity: string;
  visualizerSlot?: React.ReactNode;
}

export const UnderstandView: React.FC<UnderstandViewProps> = ({
  exercise,
  canonicalPython,
  pseudocode,
  correctnessExplanation,
  timeComplexity,
  spaceComplexity,
  visualizerSlot
}) => {
  const [codeMode, setCodeMode] = useState<'python' | 'pseudocode'>('python');

  return (
    <section className="phase-view understand-view" aria-labelledby="understand-heading">
      <div className="view-intro">
        <h3 id="understand-heading" className="view-title">
          3. Comprender: Solución Canónica, Correctness y Complejidad
        </h3>
        <p className="view-lead">
          Analiza en detalle cómo opera el algoritmo óptimo para <strong>{exercise.title.es}</strong>.
          Observa la traza paso a paso y comprende la demostración de corrección.
        </p>
      </div>

      <div className="understand-grid">
        {/* Visualizer and Timeline area */}
        <div className="understand-visualizer-container">
          <div className="card-panel">
            <h4>Ejecución Visual y Traza de Estados</h4>
            {visualizerSlot || (
              <div className="visualizer-slot-placeholder">
                <p>El visualizador interactivo se monta aquí.</p>
              </div>
            )}
          </div>
        </div>

        {/* Code & Pseudocode toggle card */}
        <div className="understand-code-container">
          <div className="card-panel">
            <div className="code-view-header">
              <h4>Implementación Canónica</h4>
              <div className="code-toggle-group" role="group" aria-label="Modo de código">
                <button
                  type="button"
                  className={`btn-code-toggle ${codeMode === 'python' ? 'active' : ''}`}
                  onClick={() => setCodeMode('python')}
                  aria-pressed={codeMode === 'python'}
                >
                  Python 3
                </button>
                <button
                  type="button"
                  className={`btn-code-toggle ${codeMode === 'pseudocode' ? 'active' : ''}`}
                  onClick={() => setCodeMode('pseudocode')}
                  aria-pressed={codeMode === 'pseudocode'}
                >
                  Pseudocódigo
                </button>
              </div>
            </div>

            <pre className="canonical-code-display">
              <code>{codeMode === 'python' ? canonicalPython : pseudocode}</code>
            </pre>
          </div>
        </div>

        {/* Correctness & Complexity Analysis Cards */}
        <div className="understand-theory-row">
          <div className="card-panel theory-card">
            <h4>¿Por qué funciona? (Invariante y Corrección)</h4>
            <div className="theory-body">
              <p>{correctnessExplanation}</p>
            </div>
          </div>

          <div className="card-panel complexity-card">
            <h4>Análisis de Complejidad</h4>
            <div className="complexity-grid">
              <div className="complexity-item">
                <span className="complexity-label">Complejidad Temporal:</span>
                <code className="complexity-value">{timeComplexity}</code>
              </div>
              <div className="complexity-item">
                <span className="complexity-label">Complejidad Espacial:</span>
                <code className="complexity-value">{spaceComplexity}</code>
              </div>
            </div>
            <p className="complexity-note">
              La poda en el árbol de búsqueda reduce drásticamente los estados explorados en la práctica,
              aunque en el peor caso la cota teórica se mantiene.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
