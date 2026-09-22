import React from 'react';

interface ExerciseHeaderIllustrationProps {
  exerciseId: string;
  className?: string;
}

export const ExerciseHeaderIllustration: React.FC<ExerciseHeaderIllustrationProps> = ({
  exerciseId,
  className = ''
}) => {
  const commonProps = {
    viewBox: '0 0 240 120',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    className: `exercise-header-svg ${className}`,
    role: 'img'
  };

  switch (exerciseId) {
    case 'n-queens':
      return (
        <svg {...commonProps} aria-label="Tablero de ajedrez N-Reinas con reinas no atacantes">
          {/* Mini 5x5 board */}
          <rect x="55" y="10" width="100" height="100" rx="6" fill="var(--surface-raised, #1e293b)" stroke="var(--border, #334155)" strokeWidth="1.5" />
          {[0, 1, 2, 3, 4].map((r) =>
            [0, 1, 2, 3, 4].map((c) => {
              const isDark = (r + c) % 2 === 1;
              return (
                <rect
                  key={`${r}-${c}`}
                  x={55 + c * 20}
                  y={10 + r * 20}
                  width="20"
                  height="20"
                  fill={isDark ? 'var(--surface-active, #334155)' : 'var(--surface, #0f172a)'}
                />
              );
            })
          )}
          {/* Queen 1 at (0, 1) */}
          <circle cx="85" cy="20" r="7" fill="var(--accent, #6366f1)" />
          <path d="M81 22 L89 22 L87 17 L85 19 L83 17 Z" fill="#ffffff" />
          {/* Queen 2 at (1, 3) */}
          <circle cx="125" cy="40" r="7" fill="var(--accent, #6366f1)" />
          <path d="M121 42 L129 42 L127 37 L125 39 L123 37 Z" fill="#ffffff" />
          {/* Queen 3 at (2, 0) */}
          <circle cx="65" cy="60" r="7" fill="var(--accent, #6366f1)" />
          <path d="M61 62 L69 62 L67 57 L65 59 L63 57 Z" fill="#ffffff" />
          {/* Queen 4 at (3, 2) */}
          <circle cx="105" cy="80" r="7" fill="var(--accent, #6366f1)" />
          <path d="M101 82 L109 82 L107 77 L105 79 L103 77 Z" fill="#ffffff" />
          {/* Queen 5 at (4, 4) */}
          <circle cx="145" cy="100" r="7" fill="var(--accent, #6366f1)" />
          <path d="M141 102 L149 102 L147 97 L145 99 L143 97 Z" fill="#ffffff" />
          {/* Safe status indicator badge */}
          <rect x="170" y="42" width="60" height="24" rx="4" fill="var(--success-bg, rgba(16,185,129,0.15))" stroke="var(--success, #10b981)" strokeWidth="1" />
          <text x="200" y="58" textAnchor="middle" fill="var(--success, #10b981)" fontSize="10" fontWeight="600">N=5 Válido</text>
        </svg>
      );

    case 'knapsack-dp':
    case 'knapsack-greedy':
      return (
        <svg {...commonProps} aria-label="Mochila con capacidad máxima e ítems con peso y valor">
          {/* Backpack body */}
          <rect x="30" y="25" width="80" height="75" rx="10" fill="var(--surface-raised, #1e293b)" stroke="var(--border, #334155)" strokeWidth="2" />
          <path d="M50 25 C50 15, 90 15, 90 25" stroke="var(--accent, #6366f1)" strokeWidth="3" fill="none" />
          {/* Pocket */}
          <rect x="42" y="48" width="56" height="42" rx="6" fill="var(--surface-active, #334155)" stroke="var(--border, #475569)" strokeWidth="1" />
          {/* Capacity gauge */}
          <rect x="48" y="76" width="44" height="6" rx="3" fill="var(--border, #334155)" />
          <rect x="48" y="76" width="32" height="6" rx="3" fill="var(--accent, #6366f1)" />
          <text x="70" y="42" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="9">Capacidad W</text>
          {/* Items flying in */}
          <g transform="translate(130, 20)">
            <rect x="0" y="0" width="45" height="24" rx="4" fill="var(--surface-raised, #1e293b)" stroke="var(--success, #10b981)" strokeWidth="1.5" />
            <text x="22" y="15" textAnchor="middle" fill="var(--text, #f8fafc)" fontSize="9">w:10 v:60</text>
            <rect x="50" y="15" width="45" height="24" rx="4" fill="var(--surface-raised, #1e293b)" stroke="var(--accent, #6366f1)" strokeWidth="1.5" />
            <text x="72" y="30" textAnchor="middle" fill="var(--text, #f8fafc)" fontSize="9">w:20 v:100</text>
            <rect x="15" y="45" width="50" height="24" rx="4" fill="var(--surface-raised, #1e293b)" stroke="var(--warning, #f59e0b)" strokeWidth="1.5" />
            <text x="40" y="60" textAnchor="middle" fill="var(--text, #f8fafc)" fontSize="9">w:30 v:120</text>
            {/* Arrow pointing to backpack */}
            <path d="M-5 45 L-20 45" stroke="var(--accent, #6366f1)" strokeWidth="2" strokeDasharray="3 3" />
            <polygon points="-20,41 -28,45 -20,49" fill="var(--accent, #6366f1)" />
          </g>
        </svg>
      );

    case 'subset-sum':
      return (
        <svg {...commonProps} aria-label="Balanza de pesos con subconjunto y objetivo de suma">
          {/* Balance fulcrum */}
          <polygon points="120,75 110,105 130,105" fill="var(--border, #334155)" />
          <line x1="120" y1="105" x2="120" y2="75" stroke="var(--text-muted, #94a3b8)" strokeWidth="2" />
          {/* Beam */}
          <line x1="50" y1="65" x2="190" y2="65" stroke="var(--accent, #6366f1)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="120" cy="65" r="4" fill="var(--text, #f8fafc)" />
          {/* Left Pan (Subset weights) */}
          <line x1="55" y1="65" x2="40" y2="85" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <line x1="55" y1="65" x2="70" y2="85" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <path d="M35 85 Q55 92 75 85" stroke="var(--text-muted, #94a3b8)" strokeWidth="2" fill="none" />
          <rect x="42" y="70" width="12" height="12" rx="2" fill="var(--accent, #6366f1)" />
          <rect x="56" y="68" width="14" height="14" rx="2" fill="var(--accent, #6366f1)" />
          <text x="55" y="103" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="9">Σ s_i = T</text>
          {/* Right Pan (Target T) */}
          <line x1="185" y1="65" x2="170" y2="85" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <line x1="185" y1="65" x2="200" y2="85" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <path d="M165 85 Q185 92 205 85" stroke="var(--text-muted, #94a3b8)" strokeWidth="2" fill="none" />
          <polygon points="185,68 174,84 196,84" fill="var(--warning, #f59e0b)" />
          <text x="185" y="80" textAnchor="middle" fill="#000" fontSize="8" fontWeight="bold">T</text>
          <text x="185" y="103" textAnchor="middle" fill="var(--warning, #f59e0b)" fontSize="9">Objetivo T</text>
        </svg>
      );

    case 'coin-change':
      return (
        <svg {...commonProps} aria-label="Monedas de diversas denominaciones sumando al monto objetivo">
          {/* Target display badge */}
          <rect x="25" y="20" width="70" height="32" rx="6" fill="var(--surface-raised, #1e293b)" stroke="var(--accent, #6366f1)" strokeWidth="1.5" />
          <text x="60" y="34" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="8">Monto Objetivo</text>
          <text x="60" y="47" textAnchor="middle" fill="var(--accent, #6366f1)" fontSize="12" fontWeight="bold">$ 11</text>
          {/* Arrow */}
          <path d="M102 36 L120 36" stroke="var(--text-muted, #94a3b8)" strokeWidth="1.5" strokeDasharray="2 2" />
          <polygon points="120,33 126,36 120,39" fill="var(--text-muted, #94a3b8)" />
          {/* Minimal coin combination: 5 + 5 + 1 */}
          <g transform="translate(135, 15)">
            <ellipse cx="20" cy="30" rx="16" ry="7" fill="var(--surface-raised, #1e293b)" stroke="var(--warning, #f59e0b)" strokeWidth="1.5" />
            <ellipse cx="20" cy="25" rx="16" ry="7" fill="var(--surface-active, #334155)" stroke="var(--warning, #f59e0b)" strokeWidth="1.5" />
            <text x="20" y="28" textAnchor="middle" fill="var(--warning, #f59e0b)" fontSize="8" fontWeight="bold">$5</text>
            <ellipse cx="45" cy="40" rx="16" ry="7" fill="var(--surface-raised, #1e293b)" stroke="var(--warning, #f59e0b)" strokeWidth="1.5" />
            <ellipse cx="45" cy="35" rx="16" ry="7" fill="var(--surface-active, #334155)" stroke="var(--warning, #f59e0b)" strokeWidth="1.5" />
            <text x="45" y="38" textAnchor="middle" fill="var(--warning, #f59e0b)" fontSize="8" fontWeight="bold">$5</text>
            <ellipse cx="70" cy="50" rx="13" ry="6" fill="var(--surface-raised, #1e293b)" stroke="var(--success, #10b981)" strokeWidth="1.5" />
            <ellipse cx="70" cy="46" rx="13" ry="6" fill="var(--surface-active, #334155)" stroke="var(--success, #10b981)" strokeWidth="1.5" />
            <text x="70" y="49" textAnchor="middle" fill="var(--success, #10b981)" fontSize="7" fontWeight="bold">$1</text>
          </g>
          <text x="175" y="90" textAnchor="middle" fill="var(--success, #10b981)" fontSize="9">3 Monedas (Óptimo)</text>
        </svg>
      );

    case 'interval-scheduling':
    case 'weighted-interval':
      return (
        <svg {...commonProps} aria-label="Línea de tiempo con intervalos compatibles y solapados">
          {/* Time axis */}
          <line x1="20" y1="95" x2="220" y2="95" stroke="var(--border, #334155)" strokeWidth="2" />
          {[20, 60, 100, 140, 180, 220].map((x, i) => (
            <g key={i}>
              <line x1={x} y1="92" x2={x} y2="98" stroke="var(--text-muted, #94a3b8)" strokeWidth="1" />
              <text x={x} y="108" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="8">{i * 2}h</text>
            </g>
          ))}
          {/* Interval 1 (Selected - Green) */}
          <rect x="25" y="20" width="50" height="16" rx="4" fill="var(--success, #10b981)" fillOpacity="0.25" stroke="var(--success, #10b981)" strokeWidth="1.5" />
          <text x="50" y="32" textAnchor="middle" fill="var(--success, #10b981)" fontSize="8" fontWeight="bold">I1: [1, 4]</text>
          {/* Interval 2 (Rejected Overlapping - Red dashed) */}
          <rect x="55" y="42" width="60" height="16" rx="4" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="85" y="54" textAnchor="middle" fill="#ef4444" fontSize="8">Solapado</text>
          {/* Interval 3 (Selected - Green) */}
          <rect x="85" y="20" width="65" height="16" rx="4" fill="var(--success, #10b981)" fillOpacity="0.25" stroke="var(--success, #10b981)" strokeWidth="1.5" />
          <text x="117" y="32" textAnchor="middle" fill="var(--success, #10b981)" fontSize="8" fontWeight="bold">I2: [4, 7]</text>
          {/* Interval 4 (Selected - Green) */}
          <rect x="160" y="20" width="55" height="16" rx="4" fill="var(--success, #10b981)" fillOpacity="0.25" stroke="var(--success, #10b981)" strokeWidth="1.5" />
          <text x="187" y="32" textAnchor="middle" fill="var(--success, #10b981)" fontSize="8" fontWeight="bold">I3: [8, 11]</text>
          {/* Greedy Early-Finish rule indicator */}
          <path d="M75 16 L75 38" stroke="var(--accent, #6366f1)" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      );

    case 'inversion-counting':
      return (
        <svg {...commonProps} aria-label="Permutación de elementos con cruces de inversión fuera de orden">
          {/* Input array row */}
          {[
            { val: 3, x: 40 },
            { val: 1, x: 85 },
            { val: 4, x: 130 },
            { val: 2, x: 175 }
          ].map((item, idx) => (
            <g key={idx}>
              <rect x={item.x} y="20" width="30" height="24" rx="4" fill="var(--surface-raised, #1e293b)" stroke="var(--accent, #6366f1)" strokeWidth="1.5" />
              <text x={item.x + 15} y="36" textAnchor="middle" fill="var(--text, #f8fafc)" fontSize="11" fontWeight="bold">{item.val}</text>
            </g>
          ))}
          {/* Target sorted array row */}
          {[
            { val: 1, x: 40 },
            { val: 2, x: 85 },
            { val: 3, x: 130 },
            { val: 4, x: 175 }
          ].map((item, idx) => (
            <g key={idx}>
              <rect x={item.x} y="75" width="30" height="24" rx="4" fill="var(--surface-active, #334155)" stroke="var(--border, #475569)" strokeWidth="1.5" />
              <text x={item.x + 15} y="91" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="11">{item.val}</text>
            </g>
          ))}
          {/* Inversion Crossing Beziers */}
          {/* 3 -> pos 2 */}
          <path d="M55 44 C55 60, 145 60, 145 75" stroke="#ef4444" strokeWidth="2" fill="none" />
          {/* 1 -> pos 0 (Crosses 3) */}
          <path d="M100 44 C100 60, 55 60, 55 75" stroke="#ef4444" strokeWidth="2" fill="none" />
          {/* 4 -> pos 3 */}
          <path d="M145 44 C145 60, 190 60, 190 75" stroke="var(--warning, #f59e0b)" strokeWidth="2" fill="none" />
          {/* 2 -> pos 1 (Crosses 4 and 3) */}
          <path d="M190 44 C190 60, 100 60, 100 75" stroke="var(--warning, #f59e0b)" strokeWidth="2" fill="none" />
          <text x="215" y="60" textAnchor="middle" fill="#ef4444" fontSize="9" fontWeight="bold">3 Inversiones</text>
        </svg>
      );

    case 'huffman-coding':
      return (
        <svg {...commonProps} aria-label="Árbol binario de Huffman con frecuencias y ramas 0 y 1">
          {/* Tree Root */}
          <circle cx="120" cy="22" r="13" fill="var(--surface-raised, #1e293b)" stroke="var(--accent, #6366f1)" strokeWidth="2" />
          <text x="120" y="26" textAnchor="middle" fill="var(--accent, #6366f1)" fontSize="9" fontWeight="bold">100</text>
          {/* Left Branch */}
          <line x1="110" y1="32" x2="70" y2="60" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <text x="85" y="44" fill="var(--success, #10b981)" fontSize="8" fontWeight="bold">0</text>
          {/* Right Branch */}
          <line x1="130" y1="32" x2="170" y2="60" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <text x="155" y="44" fill="var(--warning, #f59e0b)" fontSize="8" fontWeight="bold">1</text>
          {/* Left Child (Leaf: 'A', freq 45) */}
          <circle cx="65" cy="72" r="12" fill="var(--surface-active, #334155)" stroke="var(--success, #10b981)" strokeWidth="2" />
          <text x="65" y="75" textAnchor="middle" fill="var(--text, #f8fafc)" fontSize="9" fontWeight="bold">'A'</text>
          <text x="65" y="94" textAnchor="middle" fill="var(--success, #10b981)" fontSize="8">cód: "0"</text>
          {/* Right Subtree Node */}
          <circle cx="170" cy="62" r="11" fill="var(--surface-raised, #1e293b)" stroke="var(--accent, #6366f1)" strokeWidth="1.5" />
          <text x="170" y="65" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="8">55</text>
          {/* Leaves of right subtree */}
          <line x1="162" y1="71" x2="140" y2="88" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <text x="146" y="80" fill="var(--success, #10b981)" fontSize="7">0</text>
          <line x1="178" y1="71" x2="200" y2="88" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <text x="194" y="80" fill="var(--warning, #f59e0b)" fontSize="7">1</text>
          <circle cx="138" cy="98" r="9" fill="var(--surface-active, #334155)" stroke="var(--accent, #6366f1)" strokeWidth="1.5" />
          <text x="138" y="101" textAnchor="middle" fill="var(--text, #f8fafc)" fontSize="8">'B'</text>
          <circle cx="202" cy="98" r="9" fill="var(--surface-active, #334155)" stroke="var(--accent, #6366f1)" strokeWidth="1.5" />
          <text x="202" y="101" textAnchor="middle" fill="var(--text, #f8fafc)" fontSize="8">'C'</text>
        </svg>
      );

    case 'vertex-cover-approx':
      return (
        <svg {...commonProps} aria-label="Grafo con nodos seleccionados en la cobertura de vértices">
          {/* Edges */}
          <line x1="50" y1="40" x2="110" y2="25" stroke="var(--success, #10b981)" strokeWidth="2.5" />
          <line x1="110" y1="25" x2="180" y2="35" stroke="var(--success, #10b981)" strokeWidth="2.5" />
          <line x1="50" y1="40" x2="80" y2="90" stroke="var(--success, #10b981)" strokeWidth="2.5" />
          <line x1="110" y1="25" x2="140" y2="90" stroke="var(--success, #10b981)" strokeWidth="2.5" />
          <line x1="80" y1="90" x2="140" y2="90" stroke="var(--success, #10b981)" strokeWidth="2.5" />
          <line x1="140" y1="90" x2="180" y2="35" stroke="var(--success, #10b981)" strokeWidth="2.5" />
          {/* Nodes */}
          {/* Node 1 (in VC) */}
          <circle cx="50" cy="40" r="12" fill="var(--accent, #6366f1)" stroke="#ffffff" strokeWidth="2" />
          <text x="50" y="44" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">u</text>
          {/* Node 2 (in VC) */}
          <circle cx="110" cy="25" r="12" fill="var(--accent, #6366f1)" stroke="#ffffff" strokeWidth="2" />
          <text x="110" y="29" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">v</text>
          {/* Node 3 (in VC) */}
          <circle cx="140" cy="90" r="12" fill="var(--accent, #6366f1)" stroke="#ffffff" strokeWidth="2" />
          <text x="140" y="94" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">w</text>
          {/* Unselected covered nodes */}
          <circle cx="80" cy="90" r="10" fill="var(--surface-raised, #1e293b)" stroke="var(--border, #475569)" strokeWidth="2" />
          <circle cx="180" cy="35" r="10" fill="var(--surface-raised, #1e293b)" stroke="var(--border, #475569)" strokeWidth="2" />
          {/* Legend */}
          <text x="205" y="70" textAnchor="middle" fill="var(--accent, #6366f1)" fontSize="9" fontWeight="bold">Vértice en VC</text>
          <text x="205" y="85" textAnchor="middle" fill="var(--success, #10b981)" fontSize="8">Arista Cubierta</text>
        </svg>
      );

    case 'max-subarray':
      return (
        <svg {...commonProps} aria-label="Histograma de números positivos y negativos con subarreglo contiguo óptimo">
          {/* Zero baseline */}
          <line x1="20" y1="65" x2="220" y2="65" stroke="var(--border, #475569)" strokeWidth="1.5" />
          {/* Bars */}
          {[
            { x: 30, h: -20, col: '#ef4444' },
            { x: 50, h: 25, col: 'var(--success, #10b981)' },
            { x: 70, h: -10, col: '#ef4444' },
            { x: 90, h: 35, col: 'var(--success, #10b981)' },
            { x: 110, h: 40, col: 'var(--success, #10b981)' },
            { x: 130, h: -15, col: '#ef4444' },
            { x: 150, h: 30, col: 'var(--success, #10b981)' },
            { x: 170, h: -30, col: '#ef4444' }
          ].map((bar, i) => (
            <rect
              key={i}
              x={bar.x}
              y={bar.h > 0 ? 65 - bar.h : 65}
              width="14"
              height={Math.abs(bar.h)}
              rx="2"
              fill={bar.col}
            />
          ))}
          {/* Optimal Subarray Window Bracket (Indices 1 to 6) */}
          <path d="M48 18 L48 10 L166 10 L166 18" stroke="var(--accent, #6366f1)" strokeWidth="2" fill="none" />
          <text x="107" y="7" textAnchor="middle" fill="var(--accent, #6366f1)" fontSize="9" fontWeight="bold">Suma Máxima Contigua</text>
          <text x="107" y="105" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="8">Algoritmo de Kadane: O(N)</text>
        </svg>
      );

    case 'juan-el-vago':
      return (
        <svg {...commonProps} aria-label="Días de la semana con restricción de no trabajar dos días consecutivos">
          {/* Day cards */}
          {[
            { day: 'Lun', val: 50, work: true },
            { day: 'Mar', val: 10, work: false },
            { day: 'Mié', val: 80, work: true },
            { day: 'Jue', val: 70, work: false },
            { day: 'Vie', val: 40, work: false },
            { day: 'Sáb', val: 90, work: true }
          ].map((d, i) => {
            const x = 25 + i * 33;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={d.work ? 20 : 30}
                  width="28"
                  height="45"
                  rx="4"
                  fill={d.work ? 'var(--surface-raised, #1e293b)' : 'var(--surface, #0f172a)'}
                  stroke={d.work ? 'var(--accent, #6366f1)' : 'var(--border, #334155)'}
                  strokeWidth={d.work ? 2 : 1}
                />
                <text x={x + 14} y={d.work ? 34 : 44} textAnchor="middle" fill={d.work ? 'var(--accent, #6366f1)' : 'var(--text-muted, #94a3b8)'} fontSize="8" fontWeight="bold">{d.day}</text>
                <text x={x + 14} y={d.work ? 52 : 62} textAnchor="middle" fill={d.work ? 'var(--success, #10b981)' : 'var(--text-muted, #64748b)'} fontSize="9">${d.val}</text>
                {d.work ? (
                  <circle cx={x + 14} cy="75" r="4" fill="var(--success, #10b981)" />
                ) : (
                  <line x1={x + 10} y1="75" x2={x + 18} y2="75" stroke="#ef4444" strokeWidth="2" />
                )}
              </g>
            );
          })}
          <text x="120" y="100" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="8">Sin días consecutivos: dp[i] = max(dp[i-1], dp[i-2] + p[i])</text>
        </svg>
      );

    case 'road-antennas':
      return (
        <svg {...commonProps} aria-label="Ruta con casas y antenas con radio de cobertura R">
          {/* Road */}
          <line x1="15" y1="75" x2="225" y2="75" stroke="var(--border, #475569)" strokeWidth="6" strokeLinecap="round" />
          <line x1="15" y1="75" x2="225" y2="75" stroke="var(--text-muted, #94a3b8)" strokeWidth="1" strokeDasharray="6 6" />
          {/* Coverage Circles (radius R=35) */}
          <circle cx="70" cy="75" r="35" fill="var(--accent, #6366f1)" fillOpacity="0.12" stroke="var(--accent, #6366f1)" strokeWidth="1.5" strokeDasharray="3 3" />
          <circle cx="160" cy="75" r="35" fill="var(--accent, #6366f1)" fillOpacity="0.12" stroke="var(--accent, #6366f1)" strokeWidth="1.5" strokeDasharray="3 3" />
          {/* Antenna Towers */}
          {[70, 160].map((ax, idx) => (
            <g key={idx}>
              <line x1={ax} y1="75" x2={ax} y2="35" stroke="var(--accent, #6366f1)" strokeWidth="2" />
              <polygon points={`${ax - 8},75 ${ax + 8},75 ${ax},45`} fill="none" stroke="var(--accent, #6366f1)" strokeWidth="1" />
              <circle cx={ax} cy="33" r="3" fill="var(--accent, #6366f1)" />
              {/* Radio waves */}
              <path d={`M${ax - 6} 27 A8 8 0 0 1 ${ax + 6} 27`} fill="none" stroke="var(--accent, #6366f1)" strokeWidth="1.5" />
            </g>
          ))}
          {/* Houses */}
          {[45, 65, 95, 135, 175].map((hx, idx) => (
            <g key={idx}>
              <polygon points={`${hx},64 ${hx - 6},72 ${hx + 6},72`} fill="var(--warning, #f59e0b)" />
              <rect x={hx - 5} y="72" width="10" height="7" fill="var(--surface-raised, #1e293b)" stroke="var(--warning, #f59e0b)" strokeWidth="1" />
            </g>
          ))}
          <text x="120" y="105" textAnchor="middle" fill="var(--success, #10b981)" fontSize="9">100% Cobertura de Casas con Antenas Mínimas</text>
        </svg>
      );

    case 'lcs':
      return (
        <svg {...commonProps} aria-label="Alineamiento de caracteres de subsecuencia común más larga">
          {/* Sequence A */}
          <text x="25" y="32" fill="var(--text-muted, #94a3b8)" fontSize="10" fontWeight="bold">S1:</text>
          {['A', 'B', 'C', 'B', 'D', 'A', 'B'].map((ch, i) => {
            const isMatch = [1, 2, 3, 5].includes(i); // B, C, B, A
            return (
              <g key={i}>
                <rect x={55 + i * 24} y="18" width="18" height="20" rx="3" fill={isMatch ? 'var(--accent, #6366f1)' : 'var(--surface-raised, #1e293b)'} stroke="var(--border, #334155)" />
                <text x={64 + i * 24} y="32" textAnchor="middle" fill={isMatch ? '#ffffff' : 'var(--text-muted, #94a3b8)'} fontSize="10" fontWeight={isMatch ? 'bold' : 'normal'}>{ch}</text>
              </g>
            );
          })}
          {/* Bridges */}
          <path d="M88 40 L88 70" stroke="var(--success, #10b981)" strokeWidth="2" />
          <path d="M112 40 L112 70" stroke="var(--success, #10b981)" strokeWidth="2" />
          <path d="M136 40 L160 70" stroke="var(--success, #10b981)" strokeWidth="2" />
          <path d="M184 40 L184 70" stroke="var(--success, #10b981)" strokeWidth="2" />
          {/* Sequence B */}
          <text x="25" y="84" fill="var(--text-muted, #94a3b8)" fontSize="10" fontWeight="bold">S2:</text>
          {['B', 'D', 'C', 'A', 'B', 'A'].map((ch, i) => {
            const isMatch = [0, 2, 4, 5].includes(i);
            return (
              <g key={i}>
                <rect x={64 + i * 24} y="70" width="18" height="20" rx="3" fill={isMatch ? 'var(--accent, #6366f1)' : 'var(--surface-raised, #1e293b)'} stroke="var(--border, #334155)" />
                <text x={73 + i * 24} y="84" textAnchor="middle" fill={isMatch ? '#ffffff' : 'var(--text-muted, #94a3b8)'} fontSize="10" fontWeight={isMatch ? 'bold' : 'normal'}>{ch}</text>
              </g>
            );
          })}
          <text x="120" y="108" textAnchor="middle" fill="var(--success, #10b981)" fontSize="9">LCS = "BCBA" (Longitud 4)</text>
        </svg>
      );

    case 'peak-finding':
      return (
        <svg {...commonProps} aria-label="Perfil montañoso 1D con pico local señalado">
          {/* Mountain Profile */}
          <path
            d="M20 90 L60 75 L100 82 L130 25 L160 65 L190 55 L220 90 Z"
            fill="var(--accent, #6366f1)"
            fillOpacity="0.15"
            stroke="var(--accent, #6366f1)"
            strokeWidth="2.5"
          />
          {/* Peak Point at (130, 25) */}
          <circle cx="130" cy="25" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
          {/* Peak Flag */}
          <line x1="130" y1="25" x2="130" y2="10" stroke="#ef4444" strokeWidth="1.5" />
          <polygon points="130,10 145,15 130,20" fill="#ef4444" />
          {/* Neighbor inequality indicators */}
          <text x="95" y="55" fill="var(--text-muted, #94a3b8)" fontSize="8">A[p-1] ≤</text>
          <text x="130" y="42" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">Pico A[p]</text>
          <text x="155" y="55" fill="var(--text-muted, #94a3b8)" fontSize="8">≥ A[p+1]</text>
          <text x="120" y="105" textAnchor="middle" fill="var(--success, #10b981)" fontSize="9">Búsqueda D&amp;C: O(log N)</text>
        </svg>
      );

    case 'graph-coloring':
      return (
        <svg {...commonProps} aria-label="Grafo coloreado con k colores sin aristas monocromáticas">
          {/* Edges */}
          <line x1="70" y1="35" x2="150" y2="35" stroke="var(--border, #475569)" strokeWidth="2" />
          <line x1="150" y1="35" x2="180" y2="85" stroke="var(--border, #475569)" strokeWidth="2" />
          <line x1="180" y1="85" x2="110" y2="100" stroke="var(--border, #475569)" strokeWidth="2" />
          <line x1="110" y1="100" x2="40" y2="85" stroke="var(--border, #475569)" strokeWidth="2" />
          <line x1="40" y1="85" x2="70" y2="35" stroke="var(--border, #475569)" strokeWidth="2" />
          <line x1="70" y1="35" x2="110" y2="100" stroke="var(--border, #475569)" strokeWidth="2" />
          {/* Nodes with k=3 distinct colors */}
          {/* Color 1: Indigo */}
          <circle cx="70" cy="35" r="13" fill="#6366f1" stroke="#ffffff" strokeWidth="2" />
          <text x="70" y="39" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">C1</text>
          {/* Color 2: Emerald */}
          <circle cx="150" cy="35" r="13" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <text x="150" y="39" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">C2</text>
          {/* Color 3: Amber */}
          <circle cx="180" cy="85" r="13" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
          <text x="180" y="89" textAnchor="middle" fill="#000000" fontSize="9" fontWeight="bold">C3</text>
          {/* Color 2: Emerald */}
          <circle cx="110" cy="100" r="13" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <text x="110" y="104" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">C2</text>
          {/* Color 3: Amber */}
          <circle cx="40" cy="85" r="13" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
          <text x="40" y="89" textAnchor="middle" fill="#000000" fontSize="9" fontWeight="bold">C3</text>
          <text x="195" y="45" textAnchor="middle" fill="var(--success, #10b981)" fontSize="9">k = 3 Válido</text>
        </svg>
      );

    case 'max-flow':
      return (
        <svg {...commonProps} aria-label="Red de flujo con fuente, sumidero y capacidades">
          {/* Edges with capacities and flows */}
          <line x1="50" y1="60" x2="105" y2="30" stroke="var(--accent, #6366f1)" strokeWidth="3" />
          <line x1="50" y1="60" x2="105" y2="90" stroke="var(--accent, #6366f1)" strokeWidth="3" />
          <line x1="105" y1="30" x2="105" y2="90" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <line x1="105" y1="30" x2="160" y2="60" stroke="var(--accent, #6366f1)" strokeWidth="3" />
          <line x1="105" y1="90" x2="160" y2="60" stroke="var(--accent, #6366f1)" strokeWidth="3" />
          {/* Source node 's' */}
          <circle cx="50" cy="60" r="14" fill="var(--success, #10b981)" stroke="#ffffff" strokeWidth="2" />
          <text x="50" y="64" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">s</text>
          {/* Intermediate nodes */}
          <circle cx="105" cy="30" r="11" fill="var(--surface-raised, #1e293b)" stroke="var(--border, #475569)" strokeWidth="2" />
          <text x="105" y="34" textAnchor="middle" fill="var(--text, #f8fafc)" fontSize="9">u</text>
          <circle cx="105" cy="90" r="11" fill="var(--surface-raised, #1e293b)" stroke="var(--border, #475569)" strokeWidth="2" />
          <text x="105" y="94" textAnchor="middle" fill="var(--text, #f8fafc)" fontSize="9">v</text>
          {/* Sink node 't' */}
          <circle cx="160" cy="60" r="14" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
          <text x="160" y="64" textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">t</text>
          {/* Min Cut Line */}
          <line x1="130" y1="10" x2="130" y2="110" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="195" y="55" textAnchor="middle" fill="#f59e0b" fontSize="8" fontWeight="bold">Corte Mín</text>
          <text x="195" y="70" textAnchor="middle" fill="var(--accent, #6366f1)" fontSize="9">MaxFlow=15</text>
        </svg>
      );

    case 'reduction-is-vc':
      return (
        <svg {...commonProps} aria-label="Reducción polinomial entre Conjunto Independiente y Cobertura de Vértices">
          {/* Vertex set V boundary */}
          <rect x="25" y="15" width="190" height="90" rx="10" fill="var(--surface, #0f172a)" stroke="var(--border, #334155)" strokeWidth="1.5" />
          <text x="35" y="30" fill="var(--text-muted, #94a3b8)" fontSize="8">Grafo G = (V, E)</text>
          {/* Partition split line */}
          <line x1="120" y1="15" x2="120" y2="105" stroke="var(--border, #475569)" strokeWidth="1.5" strokeDasharray="4 4" />
          {/* Left partition: Independent Set S */}
          <rect x="35" y="35" width="75" height="60" rx="6" fill="rgba(99, 102, 241, 0.15)" stroke="var(--accent, #6366f1)" strokeWidth="1.5" />
          <circle cx="55" cy="55" r="7" fill="var(--accent, #6366f1)" />
          <circle cx="85" cy="75" r="7" fill="var(--accent, #6366f1)" />
          <text x="72" y="47" textAnchor="middle" fill="var(--accent, #6366f1)" fontSize="8" fontWeight="bold">S (Indep. Set)</text>
          {/* Right partition: Vertex Cover V \ S */}
          <rect x="130" y="35" width="75" height="60" rx="6" fill="rgba(16, 185, 129, 0.15)" stroke="var(--success, #10b981)" strokeWidth="1.5" />
          <circle cx="150" cy="55" r="7" fill="var(--success, #10b981)" />
          <circle cx="180" cy="55" r="7" fill="var(--success, #10b981)" />
          <circle cx="165" cy="80" r="7" fill="var(--success, #10b981)" />
          <text x="167" y="47" textAnchor="middle" fill="var(--success, #10b981)" fontSize="8" fontWeight="bold">V \ S (Vertex Cover)</text>
          {/* Duality theorem */}
          <text x="120" y="116" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="8">Dualidad: |S| + |VC| = |V|</text>
        </svg>
      );

    case 'randomized-fair-coin':
      return (
        <svg {...commonProps} aria-label="Conversión de moneda sesgada a moneda justa según algoritmo de von Neumann">
          {/* Biased coin pairs */}
          <g transform="translate(30, 20)">
            <rect x="0" y="0" width="70" height="32" rx="4" fill="var(--surface-raised, #1e293b)" stroke="var(--border, #334155)" />
            <text x="35" y="14" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="8">Par (H, T)</text>
            <text x="35" y="26" textAnchor="middle" fill="var(--accent, #6366f1)" fontSize="10" fontWeight="bold">Retorna 1</text>
          </g>
          <g transform="translate(30, 60)">
            <rect x="0" y="0" width="70" height="32" rx="4" fill="var(--surface-raised, #1e293b)" stroke="var(--border, #334155)" />
            <text x="35" y="14" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="8">Par (T, H)</text>
            <text x="35" y="26" textAnchor="middle" fill="var(--accent, #6366f1)" fontSize="10" fontWeight="bold">Retorna 0</text>
          </g>
          {/* Transform Arrow */}
          <path d="M110 56 L135 56" stroke="var(--accent, #6366f1)" strokeWidth="2" />
          <polygon points="135,52 142,56 135,60" fill="var(--accent, #6366f1)" />
          {/* Balanced coin result */}
          <g transform="translate(155, 30)">
            <circle cx="26" cy="26" r="24" fill="var(--warning, #f59e0b)" stroke="#ffffff" strokeWidth="2" />
            <text x="26" y="24" textAnchor="middle" fill="#000000" fontSize="10" fontWeight="bold">P=0.5</text>
            <text x="26" y="36" textAnchor="middle" fill="#000000" fontSize="8">Justo</text>
          </g>
          <text x="120" y="108" textAnchor="middle" fill="var(--success, #10b981)" fontSize="8">p(1-p) = (1-p)p  ⇒ Simetría Imparcial</text>
        </svg>
      );

    case 'merge-sort':
      return (
        <svg {...commonProps} aria-label="Árbol divide y conquista de ordenamiento por mezcla">
          {/* Root array */}
          <rect x="80" y="10" width="80" height="18" rx="3" fill="var(--surface-raised, #1e293b)" stroke="var(--accent, #6366f1)" strokeWidth="1.5" />
          <text x="120" y="22" textAnchor="middle" fill="var(--text, #f8fafc)" fontSize="8">[38, 27, 43, 3]</text>
          {/* Divide arrows */}
          <path d="M100 28 L65 44" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <path d="M140 28 L175 44" stroke="var(--border, #475569)" strokeWidth="1.5" />
          {/* Level 1 subarrays */}
          <rect x="35" y="44" width="55" height="18" rx="3" fill="var(--surface-raised, #1e293b)" stroke="var(--border, #475569)" strokeWidth="1" />
          <text x="62" y="56" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="8">[38, 27]</text>
          <rect x="150" y="44" width="55" height="18" rx="3" fill="var(--surface-raised, #1e293b)" stroke="var(--border, #475569)" strokeWidth="1" />
          <text x="177" y="56" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="8">[43, 3]</text>
          {/* Merge Up arrows */}
          <path d="M62 62 L95 82" stroke="var(--success, #10b981)" strokeWidth="1.5" />
          <path d="M177 62 L145 82" stroke="var(--success, #10b981)" strokeWidth="1.5" />
          {/* Merged Sorted Output */}
          <rect x="80" y="82" width="80" height="20" rx="3" fill="var(--surface-active, #334155)" stroke="var(--success, #10b981)" strokeWidth="2" />
          <text x="120" y="95" textAnchor="middle" fill="var(--success, #10b981)" fontSize="9" fontWeight="bold">[3, 27, 38, 43]</text>
          <text x="120" y="114" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="8">T(N) = 2T(N/2) + O(N) = O(N log N)</text>
        </svg>
      );

    case 'linear-programming':
      return (
        <svg {...commonProps} aria-label="Región factible convexa y punto óptimo en programación lineal 2D">
          {/* Axes */}
          <line x1="30" y1="95" x2="190" y2="95" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <line x1="30" y1="95" x2="30" y2="15" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <text x="195" y="98" fill="var(--text-muted, #94a3b8)" fontSize="8">x₁</text>
          <text x="25" y="14" fill="var(--text-muted, #94a3b8)" fontSize="8">x₂</text>
          {/* Feasible polygon */}
          <polygon
            points="30,95 30,55 80,35 130,55 110,95"
            fill="var(--accent, #6366f1)"
            fillOpacity="0.2"
            stroke="var(--accent, #6366f1)"
            strokeWidth="1.5"
          />
          {/* Optimal Vertex */}
          <circle cx="80" cy="35" r="5" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
          <text x="80" y="24" textAnchor="middle" fill="#ef4444" fontSize="8" fontWeight="bold">Punto Óptimo (x*)</text>
          {/* Objective Gradient vector ∇c */}
          <line x1="80" y1="35" x2="115" y2="18" stroke="var(--warning, #f59e0b)" strokeWidth="2" />
          <polygon points="115,14 122,17 117,23" fill="var(--warning, #f59e0b)" />
          <text x="135" y="18" fill="var(--warning, #f59e0b)" fontSize="8">∇c</text>
          <text x="120" y="112" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="8">Polítopo convexo y Teorema Fundamental</text>
        </svg>
      );

    default:
      return (
        <svg {...commonProps} aria-label="Ilustración esquemática del algoritmo">
          <rect x="40" y="20" width="160" height="80" rx="8" fill="var(--surface-raised, #1e293b)" stroke="var(--border, #334155)" strokeWidth="1.5" />
          <circle cx="75" cy="50" r="14" fill="var(--accent, #6366f1)" />
          <circle cx="120" cy="70" r="14" fill="var(--success, #10b981)" />
          <circle cx="165" cy="45" r="14" fill="var(--warning, #f59e0b)" />
          <path d="M75 50 L120 70 L165 45" stroke="var(--text-muted, #94a3b8)" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      );
  }
};
