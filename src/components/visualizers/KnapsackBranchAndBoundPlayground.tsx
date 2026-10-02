import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { solveKnapsackBranchAndBound } from '../../engine/algorithms/knapsackBranchAndBoundValidator';

interface Item {
  id: string;
  name: string;
  w: number;
  v: number;
}

interface BBNode {
  id: string;
  depth: number;
  itemIndex: number;
  decision: 'include' | 'exclude' | null;
  weight: number;
  value: number;
  upperBound: number;
  status: 'explored' | 'infeasible' | 'pruned' | 'optimal';
  x: number;
  y: number;
  parentId: string | null;
}

export const KnapsackBranchAndBoundPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();

  const [capacity, setCapacity] = useState<number>(7);
  const [items, setItems] = useState<Item[]>([
    { id: '1', name: 'Ítem 1', w: 2, v: 40 },
    { id: '2', name: 'Ítem 2', w: 3, v: 50 },
    { id: '3', name: 'Ítem 3', w: 4, v: 60 },
    { id: '4', name: 'Ítem 4', w: 5, v: 50 }
  ]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Sort items by density v/w descending (canonical B&B preprocessing)
  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => b.v / b.w - a.v / a.w);
  }, [items]);

  const weights = sortedItems.map((i) => i.w);
  const values = sortedItems.map((i) => i.v);
  const optimalVal = useMemo(
    () => solveKnapsackBranchAndBound(capacity, weights, values),
    [capacity, weights, values]
  );

  // Fractional knapsack relaxation for upper bound computation
  const computeUpperBound = (
    startIdx: number,
    currentW: number,
    currentV: number,
    W: number,
    its: Item[]
  ): number => {
    if (currentW > W) return 0;
    let bound = currentV;
    let remainingCap = W - currentW;

    for (let i = startIdx; i < its.length; i++) {
      if (its[i].w <= remainingCap) {
        remainingCap -= its[i].w;
        bound += its[i].v;
      } else {
        bound += its[i].v * (remainingCap / its[i].w);
        break;
      }
    }
    return Math.round(bound * 10) / 10;
  };

  // Generate full interactive B&B search tree up to depth 3/4
  const { treeNodes, edges, stats } = useMemo(() => {
    const nodes: BBNode[] = [];
    const edgeList: Array<{ from: BBNode; to: BBNode; decision: 'include' | 'exclude' }> = [];
    let exploredCount = 0;
    let prunedBoundCount = 0;
    let infeasibleCount = 0;

    const rootBound = computeUpperBound(0, 0, 0, capacity, sortedItems);
    const rootNode: BBNode = {
      id: 'root',
      depth: 0,
      itemIndex: -1,
      decision: null,
      weight: 0,
      value: 0,
      upperBound: rootBound,
      status: 'explored',
      x: 360,
      y: 40,
      parentId: null
    };
    nodes.push(rootNode);
    exploredCount++;

    const maxDepth = Math.min(sortedItems.length, 3); // 3 levels visible cleanly
    let queue: BBNode[] = [rootNode];

    for (let d = 0; d < maxDepth; d++) {
      const nextQueue: BBNode[] = [];
      const item = sortedItems[d];
      const count = queue.length;
      const xSpacing = 680 / (count * 2);

      queue.forEach((parent, pIdx) => {
        if (parent.status === 'infeasible' || parent.status === 'pruned') {
          return;
        }

        // Left Child: Include item (x_i = 1)
        const leftW = parent.weight + item.w;
        const leftV = parent.value + item.v;
        const leftBound = computeUpperBound(d + 1, leftW, leftV, capacity, sortedItems);

        let leftStatus: BBNode['status'] = 'explored';
        if (leftW > capacity) {
          leftStatus = 'infeasible';
          infeasibleCount++;
        } else if (leftBound < optimalVal) {
          leftStatus = 'pruned';
          prunedBoundCount++;
        } else if (leftV === optimalVal && d === maxDepth - 1) {
          leftStatus = 'optimal';
          exploredCount++;
        } else {
          exploredCount++;
        }

        const leftX = (pIdx * 2) * xSpacing + xSpacing / 2 + 20;
        const leftNode: BBNode = {
          id: `${parent.id}-1`,
          depth: d + 1,
          itemIndex: d,
          decision: 'include',
          weight: leftW,
          value: leftV,
          upperBound: leftBound,
          status: leftStatus,
          x: leftX,
          y: (d + 1) * 85 + 40,
          parentId: parent.id
        };
        nodes.push(leftNode);
        edgeList.push({ from: parent, to: leftNode, decision: 'include' });
        nextQueue.push(leftNode);

        // Right Child: Exclude item (x_i = 0)
        const rightW = parent.weight;
        const rightV = parent.value;
        const rightBound = computeUpperBound(d + 1, rightW, rightV, capacity, sortedItems);

        let rightStatus: BBNode['status'] = 'explored';
        if (rightBound < optimalVal) {
          rightStatus = 'pruned';
          prunedBoundCount++;
        } else if (rightV === optimalVal && d === maxDepth - 1) {
          rightStatus = 'optimal';
          exploredCount++;
        } else {
          exploredCount++;
        }

        const rightX = (pIdx * 2 + 1) * xSpacing + xSpacing / 2 + 20;
        const rightNode: BBNode = {
          id: `${parent.id}-0`,
          depth: d + 1,
          itemIndex: d,
          decision: 'exclude',
          weight: rightW,
          value: rightV,
          upperBound: rightBound,
          status: rightStatus,
          x: rightX,
          y: (d + 1) * 85 + 40,
          parentId: parent.id
        };
        nodes.push(rightNode);
        edgeList.push({ from: parent, to: rightNode, decision: 'exclude' });
        nextQueue.push(rightNode);
      });

      queue = nextQueue;
    }

    return {
      treeNodes: nodes,
      edges: edgeList,
      stats: {
        totalNaive: Math.pow(2, maxDepth),
        explored: exploredCount,
        prunedBound: prunedBoundCount,
        infeasible: infeasibleCount
      }
    };
  }, [capacity, sortedItems, optimalVal]);

  const selectedNode = useMemo(() => {
    return treeNodes.find((n) => n.id === selectedNodeId) || treeNodes[0];
  }, [treeNodes, selectedNodeId]);

  const handleUpdateWeight = (idx: number, newW: number) => {
    if (newW < 1) return;
    const copy = [...items];
    copy[idx].w = newW;
    setItems(copy);
    markAttempted('knapsack-branch-and-bound');
  };

  const handleUpdateValue = (idx: number, newV: number) => {
    if (newV < 1) return;
    const copy = [...items];
    copy[idx].v = newV;
    setItems(copy);
    markAttempted('knapsack-branch-and-bound');
  };

  return (
    <div
      className="algorithm-playground knapsack-bb-playground"
      role="region"
      aria-label="Laboratorio de Branch & Bound y Árbol de Búsqueda"
    >
      {/* Top Controls Bar */}
      <div className="sdk-pg-controls">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {language === 'es' ? 'Capacidad W:' : 'Capacity W:'}
          </label>
          <input
            type="number"
            min={1}
            max={30}
            value={capacity}
            onChange={(e) => setCapacity(Math.max(1, Number(e.target.value)))}
            style={{
              width: '65px',
              backgroundColor: 'var(--canvas-bg)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.25rem 0.5rem',
              fontFamily: 'var(--font-mono)'
            }}
          />

          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>|</span>

          <span style={{ fontSize: '0.9rem', color: 'var(--text)' }}>
            {language === 'es' ? 'Solución Óptima V*:' : 'Optimal Value V*:'}{' '}
            <strong style={{ color: 'var(--success)', fontSize: '1.05rem' }}>${optimalVal}</strong>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn-preset active"
            onClick={() => {
              setCapacity(7);
              setItems([
                { id: '1', name: 'Ítem 1', w: 2, v: 40 },
                { id: '2', name: 'Ítem 2', w: 3, v: 50 },
                { id: '3', name: 'Ítem 3', w: 4, v: 60 },
                { id: '4', name: 'Ítem 4', w: 5, v: 50 }
              ]);
              setSelectedNodeId(null);
            }}
          >
            {language === 'es' ? 'Restablecer Instancia' : 'Reset Instance'}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '0.75rem' }}>
        <div style={{ padding: '0.6rem 0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{language === 'es' ? 'Nodos Naive (2^k)' : 'Naive Nodes (2^k)'}</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--danger, var(--error))' }}>{stats.totalNaive}</div>
        </div>

        <div style={{ padding: '0.6rem 0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{language === 'es' ? 'Nodos B&B Explorados' : 'B&B Explored'}</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--accent)' }}>{stats.explored}</div>
        </div>

        <div style={{ padding: '0.6rem 0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{language === 'es' ? 'Podas por Cota (U < V*)' : 'Pruned by Bound'}</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--warning)' }}>{stats.prunedBound}</div>
        </div>

        <div style={{ padding: '0.6rem 0.8rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{language === 'es' ? 'Podas por Capacidad (w > W)' : 'Pruned by Capacity'}</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--danger, var(--error))' }}>{stats.infeasible}</div>
        </div>
      </div>

      {/* SVG Interactive Branch and Bound Tree */}
      <div style={{ background: 'var(--canvas-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.5rem', overflowX: 'auto' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', display: 'flex', justifyContent: 'space-between' }}>
          <span>
            {language === 'es' ? 'Árbol de Decisiones (Hacé clic en cualquier nodo para inspeccionar su cota):' : 'Decision Tree (Click any node to inspect bound):'}
          </span>
          <span style={{ fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--success)' }}>● Factible</span> · <span style={{ color: 'var(--warning)' }}>● Poda Cota</span> · <span style={{ color: 'var(--error)' }}>● Excede W</span>
          </span>
        </div>

        <svg
          viewBox="0 0 720 340"
          style={{ width: '100%', minWidth: '600px', height: 'auto', display: 'block' }}
          role="img"
          aria-label="Árbol de búsqueda de Branch and Bound"
        >
          {/* Edges */}
          {edges.map((e, idx) => {
            const isSelected = selectedNode && (selectedNode.id === e.to.id || selectedNode.id.startsWith(e.to.id));
            const isPrunedEdge = e.to.status === 'infeasible' || e.to.status === 'pruned';

            return (
              <g key={`bb-e-${idx}`}>
                <line
                  x1={e.from.x}
                  y1={e.from.y}
                  x2={e.to.x}
                  y2={e.to.y}
                  stroke={isSelected ? 'var(--accent)' : isPrunedEdge ? 'var(--danger, var(--error))' : 'var(--border, #475569)'}
                  strokeWidth={isSelected ? 3 : 1.5}
                  strokeDasharray={isPrunedEdge ? '4 3' : undefined}
                  opacity={isPrunedEdge ? 0.6 : 0.9}
                />
                <text
                  x={(e.from.x + e.to.x) / 2 + (e.decision === 'include' ? -12 : 12)}
                  y={(e.from.y + e.to.y) / 2}
                  fill={e.decision === 'include' ? 'var(--success)' : 'var(--text-muted)'}
                  fontSize="13"
                  fontFamily="var(--font-mono)"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {e.decision === 'include' ? 'x=1' : 'x=0'}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {treeNodes.map((n) => {
            const isSelected = selectedNode && selectedNode.id === n.id;
            let nodeColor = 'var(--accent)';
            let strokeColor = '#0284c7';

            if (n.status === 'optimal') {
              nodeColor = 'var(--success)';
              strokeColor = '#059669';
            } else if (n.status === 'infeasible') {
              nodeColor = 'var(--error)';
              strokeColor = '#b91c1c';
            } else if (n.status === 'pruned') {
              nodeColor = 'var(--warning)';
              strokeColor = '#d97706';
            }

            return (
              <g
                key={`bb-n-${n.id}`}
                onClick={() => setSelectedNodeId(n.id)}
                style={{ cursor: 'pointer' }}
                role="button"
                tabIndex={0}
                aria-label={`Nodo ${n.id}, peso ${n.weight}, valor ${n.value}, cota ${n.upperBound}`}
              >
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={isSelected ? 22 : 17}
                  fill={isSelected ? nodeColor : 'var(--surface)'}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 3 : 2}
                />
                <text
                  x={n.x}
                  y={n.y + 4}
                  textAnchor="middle"
                  fill={isSelected ? '#ffffff' : 'var(--text)'}
                  fontFamily="var(--font-mono)"
                  fontSize="13px"
                  fontWeight="700"
                >
                  ${n.value}
                </text>
                <text
                  x={n.x}
                  y={n.y + (n.depth % 2 === 0 ? -18 : 26)}
                  textAnchor="middle"
                  fill={n.status === 'infeasible' ? 'var(--error)' : n.status === 'pruned' ? 'var(--warning)' : 'var(--text-muted)'}
                  fontFamily="var(--font-mono)"
                  fontSize="13px"
                  fontWeight="600"
                >
                  {n.status === 'infeasible'
                    ? 'x excede'
                    : n.status === 'pruned'
                    ? `U=${n.upperBound} < ${optimalVal}`
                    : `U=${n.upperBound}`}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Node Inspector */}
      {selectedNode && (
        <div style={{ padding: '0.85rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <h5 style={{ margin: 0, color: 'var(--text)' }}>
              {language === 'es' ? 'Inspección de Estado de Rama' : 'Branch State Inspection'}:{' '}
              <code>{selectedNode.id === 'root' ? 'Nodo Raíz (Sin ítems)' : selectedNode.id}</code>
            </h5>
            <span
              style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                padding: '0.2rem 0.5rem',
                borderRadius: 'var(--radius-sm)',
                background:
                  selectedNode.status === 'optimal'
                    ? 'var(--state-solution-bg)'
                    : selectedNode.status === 'infeasible'
                    ? 'var(--state-conflict-bg)'
                    : selectedNode.status === 'pruned'
                    ? 'var(--state-candidate-bg)'
                    : 'var(--state-active-bg)',
                color:
                  selectedNode.status === 'optimal'
                    ? 'var(--success)'
                    : selectedNode.status === 'infeasible'
                    ? 'var(--error)'
                    : selectedNode.status === 'pruned'
                    ? 'var(--warning)'
                    : 'var(--accent)'
              }}
            >
              {selectedNode.status === 'optimal'
                ? (language === 'es' ? 'Solución Óptima' : 'Optimal Solution')
                : selectedNode.status === 'infeasible'
                ? (language === 'es' ? 'Poda: Capacidad Excedida' : 'Pruned: Infeasible')
                : selectedNode.status === 'pruned'
                ? (language === 'es' ? 'Poda: Cota Superior Insuficiente' : 'Pruned: Bound Too Low')
                : (language === 'es' ? 'Rama Activa / Prometedora' : 'Active Branch')}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>{language === 'es' ? 'Peso actual (w):' : 'Current weight (w):'}</span>{' '}
              <strong style={{ color: selectedNode.weight > capacity ? 'var(--error)' : 'var(--text)' }}>
                {selectedNode.weight} / {capacity}
              </strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>{language === 'es' ? 'Valor acumulado (v):' : 'Current value (v):'}</span>{' '}
              <strong style={{ color: 'var(--success)' }}>${selectedNode.value}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>{language === 'es' ? 'Cota Superior (U):' : 'Upper Bound (U):'}</span>{' '}
              <strong style={{ color: 'var(--accent)' }}>${selectedNode.upperBound}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>{language === 'es' ? 'Incumbent (V*):' : 'Incumbent (V*):'}</span>{' '}
              <strong>${optimalVal}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Item Config Table */}
      <table className="djk-pq-table" aria-label="Configuración de Ítems">
        <thead>
          <tr>
            <th>{language === 'es' ? 'Ítem (Orden v/w)' : 'Item (Order v/w)'}</th>
            <th>{language === 'es' ? 'Peso (w)' : 'Weight (w)'}</th>
            <th>{language === 'es' ? 'Valor (v)' : 'Value (v)'}</th>
            <th>{language === 'es' ? 'Densidad (v/w)' : 'Ratio (v/w)'}</th>
          </tr>
        </thead>
        <tbody>
          {sortedItems.map((it, idx) => (
            <tr key={`it-row-${it.id}`}>
              <td><strong>{it.name}</strong></td>
              <td>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={it.w}
                  onChange={(e) => handleUpdateWeight(idx, Number(e.target.value))}
                  style={{ width: '50px', backgroundColor: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', padding: '0.2rem' }}
                />
              </td>
              <td>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={it.v}
                  onChange={(e) => handleUpdateValue(idx, Number(e.target.value))}
                  style={{ width: '60px', backgroundColor: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', padding: '0.2rem' }}
                />
              </td>
              <td>
                <code style={{ color: 'var(--accent)' }}>{(it.v / it.w).toFixed(2)}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
