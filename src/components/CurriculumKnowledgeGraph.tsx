import React, { useState } from 'react';
import { ExerciseMetadata } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useStudentProgress } from '../context/StudentProgressContext';
import './CurriculumKnowledgeGraph.css';

interface KnowledgeNode {
  id: string;
  label: { es: string; en: string };
  category: string;
  technique: string;
  x: number;
  y: number;
  ktChapter: string;
}

interface KnowledgeEdge {
  from: string;
  to: string;
  type: 'reduction' | 'generalization' | 'divide-reuse';
  label: { es: string; en: string };
  insight: { es: string; en: string };
}

const KNOWLEDGE_NODES: KnowledgeNode[] = [
  // Divide and Conquer cluster (Left)
  {
    id: 'merge-sort',
    label: { es: 'Merge Sort', en: 'Merge Sort' },
    category: 'divide-and-conquer',
    technique: 'Divide & Conquer',
    x: 80,
    y: 110,
    ktChapter: 'KT Ch 5.1'
  },
  {
    id: 'inversion-counting',
    label: { es: 'Contar Inversiones', en: 'Inversion Counting' },
    category: 'divide-and-conquer',
    technique: 'Divide & Conquer',
    x: 80,
    y: 240,
    ktChapter: 'KT Ch 5.3'
  },
  {
    id: 'closest-pair',
    label: { es: 'Par Más Cercano', en: 'Closest Pair' },
    category: 'divide-and-conquer',
    technique: 'Divide & Conquer',
    x: 80,
    y: 370,
    ktChapter: 'KT Ch 5.4'
  },

  // Greedy cluster (Center-Left)
  {
    id: 'interval-scheduling',
    label: { es: 'Planif. Intervalos', en: 'Interval Scheduling' },
    category: 'greedy',
    technique: 'Greedy',
    x: 320,
    y: 90,
    ktChapter: 'KT Ch 4.1'
  },
  {
    id: 'fractional-knapsack',
    label: { es: 'Mochila Fraccionaria', en: 'Fractional Knapsack' },
    category: 'greedy',
    technique: 'Greedy',
    x: 320,
    y: 220,
    ktChapter: 'CLRS Ch 16'
  },
  {
    id: 'road-antennas',
    label: { es: 'Antenas en la Ruta', en: 'Road Antennas' },
    category: 'greedy',
    technique: 'Greedy',
    x: 320,
    y: 350,
    ktChapter: 'KT Ch 4.2'
  },

  // Dynamic Programming cluster (Center-Right)
  {
    id: 'weighted-interval',
    label: { es: 'Intervalos Ponderados', en: 'Weighted Intervals' },
    category: 'dynamic-programming',
    technique: 'Dynamic Programming',
    x: 580,
    y: 90,
    ktChapter: 'KT Ch 6.1'
  },
  {
    id: 'knapsack-dp',
    label: { es: 'Mochila 0/1 (DP)', en: '0/1 Knapsack (DP)' },
    category: 'dynamic-programming',
    technique: 'Dynamic Programming',
    x: 580,
    y: 220,
    ktChapter: 'KT Ch 6.4'
  },
  {
    id: 'lazy-juan',
    label: { es: 'Juan el Vago', en: 'Lazy Juan' },
    category: 'dynamic-programming',
    technique: 'Dynamic Programming',
    x: 580,
    y: 350,
    ktChapter: 'KT Ch 6.2'
  },

  // Network Flow & Reductions (Right)
  {
    id: 'max-flow',
    label: { es: 'Flujo Máximo (FF)', en: 'Max Flow (FF)' },
    category: 'network-flow',
    technique: 'Network Flow',
    x: 820,
    y: 110,
    ktChapter: 'KT Ch 7.1'
  },
  {
    id: 'bipartite-matching',
    label: { es: 'Matching Bipartito', en: 'Bipartite Matching' },
    category: 'network-flow',
    technique: 'Network Flow',
    x: 820,
    y: 240,
    ktChapter: 'KT Ch 7.5'
  },
  {
    id: 'reduction-is-to-vc',
    label: { es: 'Reducción IS → VC', en: 'Reduction IS → VC' },
    category: 'reductions',
    technique: 'NP Reductions',
    x: 820,
    y: 370,
    ktChapter: 'KT Ch 8.2'
  },
  {
    id: 'vertex-cover-approx',
    label: { es: '2-Aprox Vertex Cover', en: '2-Approx Vertex Cover' },
    category: 'approximation',
    technique: 'Approximation',
    x: 820,
    y: 490,
    ktChapter: 'KT Ch 11.1'
  }
];

const KNOWLEDGE_EDGES: KnowledgeEdge[] = [
  {
    from: 'merge-sort',
    to: 'inversion-counting',
    type: 'divide-reuse',
    label: { es: 'Reutilización de Merge', en: 'Merge Reutilization' },
    insight: {
      es: 'La rutina de combinación (merge) permite contar inversiones cruzadas entre mitades en O(N log N) exacto.',
      en: 'The merge routine counts cross-inversions between halves in exact O(N log N).'
    }
  },
  {
    from: 'merge-sort',
    to: 'closest-pair',
    type: 'divide-reuse',
    label: { es: 'División Geométrica', en: 'Geometric Split' },
    insight: {
      es: 'Partición por coordenada X y filtrado de franja central de ancho 2δ en tiempo lineal.',
      en: 'Partition by X coordinate and linear scan of strip width 2δ.'
    }
  },
  {
    from: 'interval-scheduling',
    to: 'weighted-interval',
    type: 'generalization',
    label: { es: 'Greedy Falla → Requiere DP', en: 'Greedy Fails → Requires DP' },
    insight: {
      es: 'Al agregar pesos w_i, elegir el menor tiempo de fin ya no garantiza el óptimo; se requiere memorizar OPT(j) = max(v_j + OPT(p(j)), OPT(j-1)).',
      en: 'With arbitrary weights w_i, earliest finish fails; requires memoizing OPT(j) = max(v_j + OPT(p(j)), OPT(j-1)).'
    }
  },
  {
    from: 'fractional-knapsack',
    to: 'knapsack-dp',
    type: 'generalization',
    label: { es: 'Indivisibilidad → Tabla 2D', en: 'Indivisibility → 2D Table' },
    insight: {
      es: 'En la mochila fraccionaria greedy por densidad v_i / w_i es óptimo; en 0/1 la indivisibilidad exige tabla DP de capacidad W.',
      en: 'Fractional knapsack solves via density v_i / w_i; 0/1 indivisibility demands a 2D capacity table.'
    }
  },
  {
    from: 'lazy-juan',
    to: 'knapsack-dp',
    type: 'generalization',
    label: { es: 'Recurrencia 1D a 2D', en: '1D to 2D Recurrence' },
    insight: {
      es: 'De decisiones binarias sin días consecutivos (1D) a restricciones de capacidad acumulada (2D).',
      en: 'From binary decisions without consecutive days (1D) to cumulative capacity constraints (2D).'
    }
  },
  {
    from: 'bipartite-matching',
    to: 'max-flow',
    type: 'reduction',
    label: { es: 'Reducción a Red de Flujo', en: 'Reduction to Flow Network' },
    insight: {
      es: 'Se modela añadiendo fuente s conectada a nodos L y sumidero t desde R con capacidades 1.',
      en: 'Modeled by adding source s connected to L and sink t from R with unit capacities.'
    }
  },
  {
    from: 'reduction-is-to-vc',
    to: 'vertex-cover-approx',
    type: 'reduction',
    label: { es: 'Intratabilidad → Cota 2·OPT', en: 'Intractability → 2·OPT Bound' },
    insight: {
      es: 'Como Vertex Cover es NP-completo por reducción desde IS, se diseñan algoritmos de aproximación polinomiales.',
      en: 'Because Vertex Cover is NP-complete, polynomial-time 2-approximation algorithms are designed.'
    }
  }
];

interface CurriculumKnowledgeGraphProps {
  exercises: ExerciseMetadata[];
  onSelectExercise: (id: string) => void;
}

export const CurriculumKnowledgeGraph: React.FC<CurriculumKnowledgeGraphProps> = ({
  exercises,
  onSelectExercise
}) => {
  const { language } = useLanguage();
  const { isCompleted } = useStudentProgress();
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<KnowledgeEdge | null>(null);

  const isEs = language === 'es';

  // Map exercise metadata
  const getNodeExercise = (nodeId: string) => {
    return exercises.find((ex) => ex.id === nodeId);
  };

  const completedCount = KNOWLEDGE_NODES.filter((n) => isCompleted(n.id)).length;
  const progressPct = Math.round((completedCount / KNOWLEDGE_NODES.length) * 100);

  return (
    <div className="curriculum-knowledge-graph-card">
      <div className="ckg-header">
        <div>
          <div className="ckg-badge-row">
            <span className="ckg-paradigm-pill">
              {isEs ? 'Mapa de Reducciones y Técnicas' : 'Reductions & Techniques Skill Tree'}
            </span>
            <span className="ckg-book-reference">Kleinberg & Tardos Chapters 4 – 11</span>
          </div>
          <h3 className="ckg-title">
            {isEs
              ? 'Árbol Genealógico de Algoritmos y Reducciones'
              : 'Algorithmic Lineage & Reduction Graph'}
          </h3>
          <p className="ckg-lead">
            {isEs
              ? 'Explorá las conexiones teóricas entre paradigmas: cómo las limitaciones de Greedy impulsan la Programación Dinámica, y cómo los problemas intratables se reducen o aproximan.'
              : 'Explore theoretical connections: how greedy limitations motivate dynamic programming, and how intractable problems are reduced or approximated.'}
          </p>
        </div>

        <div className="ckg-stats-box">
          <div className="ckg-stats-text">
            <span>{isEs ? 'Hitos dominados:' : 'Mastered milestones:'}</span>
            <strong>{completedCount} / {KNOWLEDGE_NODES.length} ({progressPct}%)</strong>
          </div>
          <div className="ckg-stats-bar">
            <div className="ckg-stats-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      {/* Interactive Explanation Banner */}
      <div className="ckg-inspector-banner">
        {hoveredEdge ? (
          <div className="ckg-edge-detail animate-fade-in">
            <span className="ckg-edge-badge ckg-edge-badge-active">
              🔗 {isEs ? 'Transición Teórica:' : 'Theoretical Transition:'} {hoveredEdge.label[language]}
            </span>
            <p className="ckg-edge-insight">{hoveredEdge.insight[language]}</p>
          </div>
        ) : hoveredNodeId ? (
          <div className="ckg-node-detail animate-fade-in">
            {(() => {
              const node = KNOWLEDGE_NODES.find((n) => n.id === hoveredNodeId);
              const ex = getNodeExercise(hoveredNodeId);
              if (!node) return null;
              return (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <strong>{node.label[language]}</strong> — <span style={{ color: 'var(--text-muted)' }}>{node.ktChapter} ({node.technique})</span>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {ex ? (isEs ? 'Clic para abrir el laboratorio interactivo' : 'Click to launch interactive exercise') : ''}
                    </div>
                  </div>
                  <span className={`ckg-status-pill ${isCompleted(node.id) ? 'completed' : 'pending'}`}>
                    {isCompleted(node.id) ? (isEs ? '✓ Completado' : '✓ Completed') : (isEs ? 'Pendiente' : 'Pending')}
                  </span>
                </div>
              );
            })()}
          </div>
        ) : (
          <div className="ckg-idle-hint">
            💡 {isEs
              ? 'Pasá el cursor sobre cualquier nodo o flecha para inspeccionar su justificación pedagógica y clic para ingresar al ejercicio.'
              : 'Hover over any node or arrow to inspect its pedagogical argument, and click to enter the exercise.'}
          </div>
        )}
      </div>

      {/* SVG Interactive Canvas */}
      <div className="ckg-canvas-wrapper">
        <svg
          viewBox="0 0 960 560"
          className="ckg-svg-diagram"
          role="img"
          aria-label={isEs ? 'Grafo interactivo de reducciones y paradigmas' : 'Interactive reductions and paradigms graph'}
        >
          <defs>
            <marker
              id="ckg-arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="var(--accent)" />
            </marker>
            <marker
              id="ckg-arrowhead-active"
              markerWidth="9"
              markerHeight="7"
              refX="8"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 9 3.5, 0 7" fill="var(--accent-solid, #3b82f6)" />
            </marker>
          </defs>

          {/* Column Group Headers */}
          <g className="ckg-column-headers">
            <text x="80" y="35" textAnchor="middle" className="ckg-col-title">
              {isEs ? '1. DIVISIÓN Y CONQUISTA' : '1. DIVIDE & CONQUER'}
            </text>
            <text x="320" y="35" textAnchor="middle" className="ckg-col-title">
              {isEs ? '2. ALGORITMOS GREEDY' : '2. GREEDY ALGORITHMS'}
            </text>
            <text x="580" y="35" textAnchor="middle" className="ckg-col-title">
              {isEs ? '3. PROGRAMACIÓN DINÁMICA' : '3. DYNAMIC PROGRAMMING'}
            </text>
            <text x="820" y="35" textAnchor="middle" className="ckg-col-title">
              {isEs ? '4. FLUJO & REDUCCIONES' : '4. FLOW & REDUCTIONS'}
            </text>
          </g>

          {/* Edges */}
          {KNOWLEDGE_EDGES.map((edge, idx) => {
            const src = KNOWLEDGE_NODES.find((n) => n.id === edge.from);
            const dst = KNOWLEDGE_NODES.find((n) => n.id === edge.to);
            if (!src || !dst) return null;

            const isHovered = hoveredEdge === edge || hoveredNodeId === edge.from || hoveredNodeId === edge.to;
            const dx = dst.x - src.x;
            const cx1 = src.x + dx * 0.45;
            const cy1 = src.y;
            const cx2 = src.x + dx * 0.55;
            const cy2 = dst.y;
            const pathData = `M ${src.x} ${src.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${dst.x} ${dst.y}`;

            return (
              <g
                key={`edge-${idx}`}
                className={`ckg-edge-group ${isHovered ? 'active' : ''}`}
                onMouseEnter={() => setHoveredEdge(edge)}
                onMouseLeave={() => setHoveredEdge(null)}
              >
                <path
                  d={pathData}
                  className="ckg-edge-hitbox"
                  stroke="transparent"
                  strokeWidth="16"
                  fill="none"
                />
                <path
                  d={pathData}
                  className={`ckg-edge-line ${isHovered ? 'hovered' : ''}`}
                  markerEnd={isHovered ? 'url(#ckg-arrowhead-active)' : 'url(#ckg-arrowhead)'}
                />
              </g>
            );
          })}

          {/* Nodes */}
          {KNOWLEDGE_NODES.map((node) => {
            const completed = isCompleted(node.id);
            const isHovered = hoveredNodeId === node.id;
            const width = 160;
            const height = 48;
            const rx = node.x - width / 2;
            const ry = node.y - height / 2;

            return (
              <g
                key={node.id}
                className={`ckg-node-group ${completed ? 'completed' : ''} ${isHovered ? 'hovered' : ''}`}
                onClick={() => onSelectExercise(node.id)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                role="button"
                tabIndex={0}
                aria-label={`${node.label[language]} (${completed ? 'Completado' : 'Pendiente'})`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectExercise(node.id);
                  }
                }}
              >
                <rect
                  x={rx}
                  y={ry}
                  width={width}
                  height={height}
                  rx="8"
                  className="ckg-node-box"
                />
                <text
                  x={rx + 12}
                  y={ry + 20}
                  className="ckg-node-title"
                >
                  {node.label[language]}
                </text>
                <text
                  x={rx + 12}
                  y={ry + 36}
                  className="ckg-node-sub"
                >
                  {node.ktChapter}
                </text>
                {completed ? (
                  <circle cx={rx + width - 14} cy={ry + 14} r="6" className="ckg-node-check-dot" />
                ) : (
                  <circle cx={rx + width - 14} cy={ry + 14} r="4" className="ckg-node-pending-dot" />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend Footer */}
      <footer className="ckg-footer-legend">
        <div className="ckg-legend-item">
          <span className="ckg-legend-dot ckg-legend-dot-done" />
          <span>{isEs ? 'Hito Completado' : 'Mastered Milestone'}</span>
        </div>
        <div className="ckg-legend-item">
          <span className="ckg-legend-dot ckg-legend-dot-pending" />
          <span>{isEs ? 'Hito Pendiente' : 'Pending Milestone'}</span>
        </div>
        <div className="ckg-legend-item">
          <span className="ckg-legend-line" />
          <span>{isEs ? 'Transición / Reducción' : 'Transition / Reduction Edge'}</span>
        </div>
      </footer>
    </div>
  );
};
