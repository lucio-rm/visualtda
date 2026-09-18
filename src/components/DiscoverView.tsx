import React from 'react';
import { ExerciseMetadata } from '../types';

interface DiscoverViewProps {
  exercise: ExerciseMetadata;
  onProceedToSolve: () => void;
  children?: React.ReactNode;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  exercise,
  onProceedToSolve,
  children
}) => {
  return (
    <section className="phase-view discover-view" aria-labelledby="discover-heading">
      <div className="view-intro">
        <h3 id="discover-heading" className="view-title">
          1. Descubrir: Intuición y Planteo del Problema
        </h3>
        <p className="view-lead">
          Antes de escribir código o pensar en algoritmos complejos, explora cómo se comporta el problema.
          Manipula las variables, observa qué situaciones generan conflictos o inviabilidades, y construye tu intuición.
        </p>
      </div>

      <div className="discover-grid">
        <div className="problem-narrative-card">
          <h4>Planteo del Problema</h4>
          <p className="problem-statement">{exercise.subtitle.es}</p>

          <div className="problem-rules">
            <h5>Restricciones Fundamentales:</h5>
            <ul>
              <li>Todas las decisiones deben cumplir con las reglas del dominio sin violar restricciones.</li>
              <li>Existen múltiples estados intermedios y configuraciones posibles.</li>
              <li>El objetivo es encontrar una configuración válida o la óptima según corresponda.</li>
            </ul>
          </div>
        </div>

        <div className="interactive-playground-card">
          <h4>Espacio de Exploración</h4>
          {children || (
            <div className="playground-placeholder">
              <p>Manipulador interactivo del estado del problema.</p>
            </div>
          )}
        </div>
      </div>

      <div className="phase-footer-action">
        <button
          type="button"
          className="btn-primary"
          onClick={onProceedToSolve}
        >
          Tengo una idea: Pasar a Resolver &rarr;
        </button>
      </div>
    </section>
  );
};
