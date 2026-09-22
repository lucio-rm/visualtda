## Sudoku y Satisfacción de Restricciones (CSP)
### Referencia: Russell & Norvig / Kleinberg & Tardos Capítulo 8

### 1. Heurística MRV (Minimum Remaining Values)
En lugar de recorrer las celdas en orden lexicográfico, seleccionar la celda con el menor número de valores legales en su dominio (la más restringida) reduce drásticamente el factor de ramificación del árbol de búsqueda.
