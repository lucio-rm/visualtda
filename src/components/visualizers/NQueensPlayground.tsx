import React, { useState } from 'react';
import { NQueensBoard } from './NQueensBoard';
import { nQueensValidator } from '../../engine/algorithms/nQueensValidator';

export const NQueensPlayground: React.FC = () => {
  const [n, setN] = useState<number>(4);
  const [board, setBoard] = useState<number[]>(() => new Array(4).fill(-1));

  const handleCellClick = (row: number, col: number) => {
    setBoard((prev) => {
      const next = [...prev];
      if (next[row] === col) {
        next[row] = -1; // Remove queen if clicked again
      } else {
        next[row] = col; // Place queen in this row at clicked column
      }
      return next;
    });
  };

  const handleClear = () => {
    setBoard(new Array(n).fill(-1));
  };

  const handleResize = (newN: number) => {
    setN(newN);
    setBoard(new Array(newN).fill(-1));
  };

  // Live partial validation of current manual board
  const placedQueensCount = board.filter((c) => c !== -1).length;
  const partialValidation = nQueensValidator.validatePartial({ n }, board);
  const isCompleteSolution = placedQueensCount === n && partialValidation.valid;
  const activeConflict = partialValidation.conflict;

  return (
    <div className="nqueens-playground-box">
      <div className="playground-toolbar">
        <div className="playground-size-controls">
          <label htmlFor="playground-n" className="selector-label">
            Tablero:
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
        <button type="button" className="btn-secondary" onClick={handleClear}>
          Limpiar Tablero
        </button>
      </div>

      <div className="playground-instructions">
        <p>
          Haz clic en cualquier casilla para colocar o quitar una reina. Intenta colocar{' '}
          <strong>{n} reinas</strong> sin que ninguna comparta fila, columna ni diagonal.
        </p>
      </div>

      <div className="playground-board-container">
        <NQueensBoard
          n={n}
          board={board}
          interactive={true}
          onCellClick={handleCellClick}
          isSolution={isCompleteSolution}
          conflictWith={
            activeConflict
              ? {
                  row: activeConflict.row1,
                  col: activeConflict.col1,
                  type: activeConflict.type
                }
              : undefined
          }
          currentRow={activeConflict ? activeConflict.row2 : -1}
          currentCol={activeConflict ? activeConflict.col2 : -1}
        />
      </div>

      <div className="playground-status-panel">
        <div className="queens-placed-counter">
          Reinas colocadas: <strong>{placedQueensCount} / {n}</strong>
        </div>
        {isCompleteSolution ? (
          <div className="playground-success-banner">
            🎉 ¡Felicitaciones! Has descubierto una solución válida sin conflictos.
          </div>
        ) : !partialValidation.valid && partialValidation.errors.length > 0 ? (
          <div className="playground-warning-banner">
            ⚠️ Conflicto detectado: {partialValidation.errors[0]}
          </div>
        ) : (
          <div className="playground-hint-text">
            {placedQueensCount === 0
              ? 'Comienza colocando tu primera reina.'
              : 'Sigue colocando reinas evitando diagonales y columnas repetidas.'}
          </div>
        )}
      </div>
    </div>
  );
};
