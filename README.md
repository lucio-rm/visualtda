# Visual TDA

**Plataforma Interactiva para la Enseñanza de Teoría y Diseño de Algoritmos**

Visual TDA es una aplicación web puramente del lado del cliente diseñada para aprender algoritmos universitarios avanzados de forma interactiva, rigurosa y visualmente intuitiva.

---

## 🏛️ Principios de Arquitectura

1. **Separación Estricta**:
   $$\text{Algoritmo (Python / TS)} \longrightarrow \text{Trace Events} \longrightarrow \text{Visualizador SVG} \longrightarrow \text{Interfaz React}$$
   - Los algoritmos no conocen React ni el DOM.
   - Las visualizaciones son funciones determinísticas de los eventos de traza.
   - La interfaz de usuario orquesta controles, línea de tiempo y flujo pedagógico.

2. **Flujo Pedagógico en 3 Fases**:
   - **1. Descubrir**: Construcción de intuición y exploración interactiva antes de ver código.
   - **2. Resolver**: Planteo algorítmico con pistas progresivas y evaluación de pruebas locales. Permite consultar la solución en cualquier momento sin penalizaciones.
   - **3. Comprender**: Solución canónica oficial comentada, traza paso a paso con controles de velocidad, demostración formal de invariantes y análisis de complejidad asintótica.

3. **Dominio Desacoplado**:
   $$\text{Problema} \neq \text{Técnica} \neq \text{Ejercicio}$$
   Un mismo problema (ej. *Mochila*) puede abordarse con distintas técnicas (*Greedy* o *Programación Dinámica*). Los ejercicios son módulos de datos con metadatos enriquecidos, evitando dependencias estructurales rígidas en el sistema de archivos.

---

## 🛠️ Stack Tecnológico

- **Frontend**: React 19 + TypeScript (strict mode) + Vite.
- **Estilos**: Variables CSS puras con soporte para temas Claro, Oscuro y Sistema (sin frameworks CSS pesados).
- **Pruebas**: Vitest.
- **Calidad**: ESLint con TypeScript-ESLint.
- **Despliegue**: Sitio estático listo para Cloudflare Pages o GitHub Pages (`dist/`).

---

## 🚀 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Ejecutar suite de pruebas unitarias
npm run test

# Verificar tipos TypeScript
npm run typecheck

# Ejecutar análisis estático (linter)
npm run lint

# Generar build de producción
npm run build
```

---

## ♟️ Ejercicio Ejemplar: N-Reinas

El repositorio incluye el vertical slice completo del problema de las **N-Reinas**:
- **Descubrir**: Tablero interactivo donde el alumno ubica reinas manualmente y detecta conflictos en tiempo real.
- **Resolver**: Espacio de código con pistas progresivas y validación automática.
- **Comprender**: Visualizador con reproducción de la traza de Backtracking (evaluación de casillas, poda temprana de diagonales/columnas y retrocesos), pseudocódigo, invariante formal de inducción y complejidad $O(N!)$.

---

## 📄 Licencia

Este proyecto está bajo la Licencia [GNU General Public License v3.0](LICENSE).
