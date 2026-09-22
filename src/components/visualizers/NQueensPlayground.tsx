import React, { useState, useMemo } from 'react';
import { NQueensBoard, QueenConflictPair } from './NQueensBoard';

interface QueenPos {
  row: number;
  col: number;
}

interface DetailedConflict extends QueenConflictPair {
  description: string;
}

export const NQueensPlayground: React.FC = () => {
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

  // Presets for quick pedagogical experimentation
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

  const handlePresetSolution = () => {
    if (n === 4) {
      setQueens([
        { row: 0, col: 1 },
        { row: 1, col: 3 },
        { row: 2, col: 0 },
        { row: 3, col: 2 }
      ]);
    } else if (n === 5) {
      setQueens([
        { row: 0, col: 0 },
        { row: 1, col: 2 },
        { row: 2, col: 4 },
        { row: 3, col: 1 },
        { row: 4, col: 3 }
      ]);
    } else if (n === 8) {
      setQueens([
        { row: 0, col: 0 },
        { row: 1, col: 4 },
        { row: 2, col: 7 },
        { row: 3, col: 5 },
        { row: 4, col: 2 },
        { row: 5, col: 6 },
        { row: 6, col: 1 },
        { row: 7, col: 3 }
      ]);
    } else {
      setQueens([
        { row: 0, col: 1 },
        { row: 1, col: 3 },
        { row: 2, col: 5 },
        { row: 3, col: 0 },
        { row: 4, col: 2 },
        { row: 5, col: 4 }
      ]);
    }
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
        } else if (Math.abs(q1.row - q2.row) === Math.abs(q1.col - q2.col)) {
          list.push({
            row1: q1.row,
            col1: q1.col,
            row2: q2.row,
            col2: q2.col,
            type: 'diag',
            description: `Ataque diagonal entre reina (${q1.row}, ${q1.col}) y reina (${q2.row}, ${q2.col}) (|Δr| = |Δc| = ${Math.abs(q1.row - q2.row)}).`
          });
        }
      }
    }
    return list;
  }, [queens]);

  const placedCount = queens.length;
  const isCompleteSolution = placedCount === n && conflicts.length === 0;

  return (
    <div className="nqueens-playground-box">
      <div className="playground-toolbar">
        <div className="playground-size-controls">
          <label htmlFor="playground-n" className="selector-label">
            Dimensión N:
          </label>
          <select
            id="playground-n"
            value={n}
            onChange={(e) => handleResize(Number(e.target.value))}
            className="n-select-input"
          >
            <option value={4}>4 × 4</option>
            <option value={5}>5 × 5</option>
            <option value={6}>6 × 6</option>
            <option value={8}>8 × 8</option>
          </select>
        </div>
        <div className="playground-quick-actions" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={handlePresetHorizontal}
            title="Colocar dos reinas en la fila 0 para observar el ataque horizontal"
          >
            Probar Ataque Fila 0
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handlePresetDiagonal}
            title="Colocar dos reinas sobre una diagonal para observar el vector diagonal"
          >
            Probar Diagonal
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={handlePresetSolution}
            title="Ver una configuración que satisface todas las restricciones"
          >
            Solución Válida
          </button>
          <button type="button" className="btn-secondary" onClick={handleClear}>
            Limpiar Tablero
          </button>
        </div>
      </div>

      <div className="playground-instructions">
        <p>
          Hacé clic en cualquier casilla del tablero para colocar o remover reinas libremente.
          Podés colocar múltiples reinas en la misma fila, columna o diagonal para verificar
          cómo se detectan y señalan visualmente los conflictos de ataque.
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
            Reinas en tablero: <strong>{placedCount} / {n}</strong>
          </span>
          <span style={{ color: conflicts.length > 0 ? 'var(--color-error)' : 'var(--color-success)', fontWeight: 600 }}>
            {conflicts.length === 0 ? 'Sin conflictos' : `${conflicts.length} conflicto(s) de ataque`}
          </span>
        </div>

        {isCompleteSolution ? (
          <div className="playground-success-banner" role="status">
            ✓ Configuración válida encontrada: {n} reinas en tablero de {n}×{n} sin ataques mutuos en filas, columnas ni diagonales.
          </div>
        ) : conflicts.length > 0 ? (
          <div className="playground-warning-banner" role="alert">
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
          <div className="playground-hint-text">
            {placedCount === 0
              ? 'Hacé clic en casillas del tablero para ubicar reinas y explorar el espacio de estados.'
              : `Colocá ${n - placedCount} reina(s) más procurando que ninguna comparta fila, columna ni diagonal.`}
          </div>
        )}
      </div>
    </div>
  );
};
