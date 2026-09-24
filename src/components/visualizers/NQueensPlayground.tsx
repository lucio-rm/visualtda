import React, { useState, useMemo, useEffect } from 'react';
import { NQueensBoard, QueenConflictPair } from './NQueensBoard';
import { useStudentProgress } from '../../context/StudentProgressContext';
import './NQueensVisualizer.css';

interface QueenPos {
  row: number;
  col: number;
}

interface DetailedConflict extends QueenConflictPair {
  description: string;
}

export const NQueensPlayground: React.FC = () => {
  const { markAttempted } = useStudentProgress();
  const [n, setN] = useState<number>(4);
  const [queens, setQueens] = useState<QueenPos[]>([]);

  const handleCellClick = (row: number, col: number) => {
    setQueens((prev) => {
      const exists = prev.some((q) => q.row === row && q.col === col);
      if (exists) {
        return prev.filter((q) => !(q.row === row && q.col === col));
      } else {
        return [...prev, { row, col }];
      }
    });
  };

  const handleClear = () => {
    setQueens([]);
  };

  const handleResize = (newN: number) => {
    setN(newN);
    setQueens([]);
  };

  // Presets for quick pedagogical experimentation of conflicts
  const handlePresetHorizontal = () => {
    setQueens([
      { row: 0, col: 0 },
      { row: 0, col: Math.min(3, n - 1) }
    ]);
  };

  const handlePresetDiagonal = () => {
    setQueens([
      { row: 0, col: 0 },
      { row: 2, col: 2 }
    ]);
  };

  // Calculate all pairwise collisions
  const conflicts: DetailedConflict[] = useMemo(() => {
    const list: DetailedConflict[] = [];
    for (let i = 0; i < queens.length; i++) {
      for (let j = i + 1; j < queens.length; j++) {
        const q1 = queens[i];
        const q2 = queens[j];
        if (q1.row === q2.row) {
          list.push({
            row1: q1.row,
            col1: q1.col,
            row2: q2.row,
            col2: q2.col,
            type: 'row',
            description: `Ataque horizontal en fila ${q1.row}: reinas en columna ${q1.col} y columna ${q2.col}.`
          });
        } else if (q1.col === q2.col) {
          list.push({
            row1: q1.row,
            col1: q1.col,
            row2: q2.row,
            col2: q2.col,
            type: 'col',
            description: `Ataque vertical en columna ${q1.col}: reinas en fila ${q1.row} y fila ${q2.row}.`
          });
        } else {
          const deltaRow = Math.abs(q1.row - q2.row);
          const deltaCol = Math.abs(q1.col - q2.col);
          if (deltaRow === deltaCol) {
            const isMainDiag = (q1.row - q1.col) === (q2.row - q2.col);
            list.push({
              row1: q1.row,
              col1: q1.col,
              row2: q2.row,
              col2: q2.col,
              type: 'diag',
              description: `Ataque diagonal (${isMainDiag ? 'principal ↘' : 'secundaria ↗'}): (|f₁ - f₂| = |c₁ - c₂| = ${deltaRow}) entre (${q1.row}, ${q1.col}) y (${q2.row}, ${q2.col}).`
            });
          }
        }
      }
    }
    return list;
  }, [queens]);

  const placedCount = queens.length;
  const isCompleteSolution = placedCount === n && conflicts.length === 0;

  // Mark exercise completed when student successfully finds a complete collision-free configuration
  useEffect(() => {
    if (isCompleteSolution) {
      markAttempted('n-queens');
    }
  }, [isCompleteSolution]);

  return (
    <div className="nqueens-playground nqueens-playground-box">
      <div className="playground-controls" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', marginBottom: '1rem' }}>
        <div className="control-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <label htmlFor="n-queens-size-select" style={{ fontWeight: 600 }}>Dimensión N:</label>
          <select
            id="n-queens-size-select"
            value={n}
            onChange={(e) => handleResize(Number(e.target.value))}
            className="playground-select"
          >
            <option value={4}>4 × 4 (N=4)</option>
            <option value={5}>5 × 5 (N=5)</option>
            <option value={6}>6 × 6 (N=6)</option>
            <option value={8}>8 × 8 (N=8)</option>
          </select>
        </div>
        <div className="playground-quick-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handlePresetHorizontal}
            title="Colocar dos reinas en la fila 0 para observar el ataque horizontal"
          >
            Probar Conflicto Fila 0
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handlePresetDiagonal}
            title="Colocar dos reinas sobre una diagonal para observar el vector diagonal"
          >
            Probar Conflicto Diagonal
          </button>
          <button type="button" className="btn-secondary" onClick={handleClear}>
            Limpiar Tablero
          </button>
        </div>
      </div>

      <div className="playground-instructions">
        <p>
          Hacé clic en cualquier casilla del tablero para ubicar o retirar reinas libremente.
          El objetivo es ubicar exactamente <strong>{n} reinas</strong> sin que ninguna comparta fila, columna ni diagonal.
          Observá cómo los haces láser rojos señalan de forma instantánea cualquier transgresión al invariante.
        </p>
      </div>

      <div className="playground-board-container">
        <NQueensBoard
          n={n}
          queens={queens}
          interactive={true}
          onCellClick={handleCellClick}
          isSolution={isCompleteSolution}
          conflicts={conflicts}
        />
      </div>

      <div className="playground-status-panel">
        <div className="queens-placed-counter" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>
            Reinas ubicadas en el tablero: <strong>{placedCount} / {n}</strong>
          </span>
          <span style={{ color: conflicts.length > 0 ? 'var(--color-error)' : 'var(--color-success)', fontWeight: 600 }}>
            {conflicts.length === 0 ? '✓ Sin colisiones' : `✗ ${conflicts.length} conflicto(s) activo(s)`}
          </span>
        </div>

        {isCompleteSolution ? (
          <div className="playground-success-banner" role="status" style={{ marginTop: '0.75rem' }}>
            🎉 <strong>¡Configuración válida encontrada!</strong> Colocaste con éxito las {n} reinas en el tablero de {n}×{n} sin ataques mutuos. Has superado el desafío interactivo y desbloqueado el ejercicio con maestría.
          </div>
        ) : conflicts.length > 0 ? (
          <div className="playground-warning-banner" role="alert" style={{ marginTop: '0.75rem' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
              Conflictos detectados ({conflicts.length}):
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
              {conflicts.slice(0, 4).map((c, idx) => (
                <li key={idx}>{c.description}</li>
              ))}
              {conflicts.length > 4 && (
                <li>... y {conflicts.length - 4} conflicto(s) más.</li>
              )}
            </ul>
          </div>
        ) : (
          <div className="playground-hint-text" style={{ marginTop: '0.75rem' }}>
            {placedCount === 0
              ? 'Hacé clic en casillas del tablero para ubicar reinas y explorar el espacio de estados.'
              : `Colocá ${n - placedCount} reina(s) más procurando que ninguna comparta fila, columna ni diagonal.`}
          </div>
        )}
      </div>
    </div>
  );
};
