import React from 'react';
import { useLanguage } from '../../i18n/LanguageContext';

interface ExerciseHeaderIllustrationProps {
  exerciseId: string;
  problemId?: string;
  className?: string;
}

export const ExerciseHeaderIllustration: React.FC<ExerciseHeaderIllustrationProps> = ({
  exerciseId,
  problemId,
  className = ''
}) => {
  const { language } = useLanguage();
  const commonProps = {
    viewBox: '0 0 240 120',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    className: `exercise-header-svg ${className}`,
    role: 'img'
  };

  const key = (problemId || exerciseId)
    .replace(/-backtracking|-dyc|-greedy|-dp|-reduction|-formulation|-approx$/, '');

  switch (key) {
    case 'n-queens':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Tablero de ajedrez N-Reinas con reinas no atacantes' : 'N-Queens chessboard with non-attacking queens'}>
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
          <text x="200" y="58" textAnchor="middle" fill="var(--success, #10b981)" fontSize="13" fontWeight="600">{language === 'es' ? 'N=5 Válido' : 'N=5 Valid'}</text>
        </svg>
      );

    case 'knapsack':
    case 'knapsack-bb':
    case 'knapsack-branch-and-bound':
    case 'knapsack-dp':
    case 'knapsack-greedy':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Mochila con capacidad máxima e ítems con peso y valor' : 'Knapsack with capacity and weighted items'}>
          {/* Backpack body */}
          <rect x="30" y="25" width="80" height="75" rx="10" fill="var(--surface-raised, #1e293b)" stroke="var(--border, #334155)" strokeWidth="2" />
          <path d="M50 25 C50 15, 90 15, 90 25" stroke="var(--accent, #6366f1)" strokeWidth="3" fill="none" />
          {/* Pocket */}
          <rect x="42" y="48" width="56" height="42" rx="6" fill="var(--surface-active, #334155)" stroke="var(--border, #475569)" strokeWidth="1" />
          {/* Capacity gauge */}
          <rect x="48" y="76" width="44" height="6" rx="3" fill="var(--border, #334155)" />
          <rect x="48" y="76" width="32" height="6" rx="3" fill="var(--accent, #6366f1)" />
          <text x="70" y="42" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="13">{language === 'es' ? 'Capacidad W' : 'Capacity W'}</text>
          {/* Items flying in */}
          <g transform="translate(130, 20)">
            <rect x="0" y="0" width="45" height="24" rx="4" fill="var(--surface-raised, #1e293b)" stroke="var(--success, #10b981)" strokeWidth="1.5" />
            <text x="22" y="15" textAnchor="middle" fill="var(--text)" fontSize="13">w:10 v:60</text>
            <rect x="50" y="15" width="45" height="24" rx="4" fill="var(--surface-raised, #1e293b)" stroke="var(--accent, #6366f1)" strokeWidth="1.5" />
            <text x="72" y="30" textAnchor="middle" fill="var(--text)" fontSize="13">w:20 v:100</text>
            <rect x="15" y="45" width="50" height="24" rx="4" fill="var(--surface-raised, #1e293b)" stroke="var(--warning, #f59e0b)" strokeWidth="1.5" />
            <text x="40" y="60" textAnchor="middle" fill="var(--text)" fontSize="13">w:30 v:120</text>
            {/* Arrow pointing to backpack */}
            <path d="M-5 45 L-20 45" stroke="var(--accent, #6366f1)" strokeWidth="2" strokeDasharray="3 3" />
            <polygon points="-20,41 -28,45 -20,49" fill="var(--accent, #6366f1)" />
          </g>
        </svg>
      );

    case 'subset-sum':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Balanza de pesos con subconjunto y objetivo de suma' : 'Balance scale with subset and target sum'}>
          {/* Balance fulcrum */}
          <polygon points="120,75 110,105 130,105" fill="var(--border, #334155)" />
          <line x1="120" y1="105" x2="120" y2="75" stroke="var(--text-muted, #94a3b8)" strokeWidth="2" />
          {/* Beam */}
          <line x1="50" y1="65" x2="190" y2="65" stroke="var(--accent, #6366f1)" strokeWidth="3" strokeLinecap="round" />
          <circle cx="120" cy="65" r="4" fill="var(--text)" />
          {/* Left Pan (Subset weights) */}
          <line x1="55" y1="65" x2="40" y2="85" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <line x1="55" y1="65" x2="70" y2="85" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <path d="M35 85 Q55 92 75 85" stroke="var(--text-muted, #94a3b8)" strokeWidth="2" fill="none" />
          <rect x="42" y="70" width="12" height="12" rx="2" fill="var(--accent, #6366f1)" />
          <rect x="56" y="68" width="14" height="14" rx="2" fill="var(--accent, #6366f1)" />
          <text x="55" y="103" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="13">Σ s_i = T</text>
          {/* Right Pan (Target T) */}
          <line x1="185" y1="65" x2="170" y2="85" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <line x1="185" y1="65" x2="200" y2="85" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <path d="M165 85 Q185 92 205 85" stroke="var(--text-muted, #94a3b8)" strokeWidth="2" fill="none" />
          <polygon points="185,68 174,84 196,84" fill="var(--warning, #f59e0b)" />
          <text x="185" y="80" textAnchor="middle" fill="#000" fontSize="13" fontWeight="bold">T</text>
          <text x="185" y="103" textAnchor="middle" fill="var(--warning, #f59e0b)" fontSize="13">{language === 'es' ? 'Objetivo T' : 'Target T'}</text>
        </svg>
      );

    case 'coin-change':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Monedas de diversas denominaciones sumando al monto objetivo' : 'Coins of various denominations summing to target amount'}>
          {/* Target display badge */}
          <rect x="25" y="20" width="70" height="32" rx="6" fill="var(--surface-raised, #1e293b)" stroke="var(--accent, #6366f1)" strokeWidth="1.5" />
          <text x="60" y="34" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="13">{language === 'es' ? 'Monto Objetivo' : 'Target Amount'}</text>
          <text x="60" y="47" textAnchor="middle" fill="var(--accent, #6366f1)" fontSize="13" fontWeight="bold">$ 11</text>
          {/* Arrow */}
          <path d="M102 36 L120 36" stroke="var(--text-muted, #94a3b8)" strokeWidth="1.5" strokeDasharray="2 2" />
          <polygon points="120,33 126,36 120,39" fill="var(--text-muted, #94a3b8)" />
          {/* Minimal coin combination: 5 + 5 + 1 */}
          <g transform="translate(135, 15)">
            <ellipse cx="20" cy="30" rx="16" ry="7" fill="var(--surface-raised, #1e293b)" stroke="var(--warning, #f59e0b)" strokeWidth="1.5" />
            <ellipse cx="20" cy="25" rx="16" ry="7" fill="var(--surface-active, #334155)" stroke="var(--warning, #f59e0b)" strokeWidth="1.5" />
            <text x="20" y="28" textAnchor="middle" fill="var(--warning, #f59e0b)" fontSize="13" fontWeight="bold">$5</text>
            <ellipse cx="45" cy="40" rx="16" ry="7" fill="var(--surface-raised, #1e293b)" stroke="var(--warning, #f59e0b)" strokeWidth="1.5" />
            <ellipse cx="45" cy="35" rx="16" ry="7" fill="var(--surface-active, #334155)" stroke="var(--warning, #f59e0b)" strokeWidth="1.5" />
            <text x="45" y="38" textAnchor="middle" fill="var(--warning, #f59e0b)" fontSize="13" fontWeight="bold">$5</text>
            <ellipse cx="70" cy="50" rx="13" ry="6" fill="var(--surface-raised, #1e293b)" stroke="var(--success, #10b981)" strokeWidth="1.5" />
            <ellipse cx="70" cy="46" rx="13" ry="6" fill="var(--surface-active, #334155)" stroke="var(--success, #10b981)" strokeWidth="1.5" />
            <text x="70" y="49" textAnchor="middle" fill="var(--success, #10b981)" fontSize="13" fontWeight="bold">$1</text>
          </g>
          <text x="175" y="90" textAnchor="middle" fill="var(--success, #10b981)" fontSize="13">{language === 'es' ? '3 Monedas (Óptimo)' : '3 Coins (Optimal)'}</text>
        </svg>
      );

    case 'interval-scheduling':
    case 'weighted-interval':
    case 'weighted-interval-scheduling':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Línea de tiempo con intervalos compatibles y solapados' : 'Timeline with compatible and overlapping intervals'}>
          {/* Time axis */}
          <line x1="20" y1="95" x2="220" y2="95" stroke="var(--border, #334155)" strokeWidth="2" />
          {[20, 60, 100, 140, 180, 220].map((x, i) => (
            <g key={i}>
              <line x1={x} y1="92" x2={x} y2="98" stroke="var(--text-muted, #94a3b8)" strokeWidth="1" />
              <text x={x} y="108" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="13">{i * 2}h</text>
            </g>
          ))}
          {/* Interval 1 (Selected - Green) */}
          <rect x="25" y="20" width="50" height="16" rx="4" fill="var(--success, #10b981)" fillOpacity="0.25" stroke="var(--success, #10b981)" strokeWidth="1.5" />
          <text x="50" y="32" textAnchor="middle" fill="var(--success, #10b981)" fontSize="13" fontWeight="bold">I1: [1, 4]</text>
          {/* Interval 2 (Rejected Overlapping - Red dashed) */}
          <rect x="55" y="42" width="60" height="16" rx="4" fill="rgba(239, 68, 68, 0.15)" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="85" y="54" textAnchor="middle" fill="#ef4444" fontSize="13">{language === 'es' ? 'Solapado' : 'Overlap'}</text>
          {/* Interval 3 (Selected - Green) */}
          <rect x="85" y="20" width="65" height="16" rx="4" fill="var(--success, #10b981)" fillOpacity="0.25" stroke="var(--success, #10b981)" strokeWidth="1.5" />
          <text x="117" y="32" textAnchor="middle" fill="var(--success, #10b981)" fontSize="13" fontWeight="bold">I2: [4, 7]</text>
          {/* Interval 4 (Selected - Green) */}
          <rect x="160" y="20" width="55" height="16" rx="4" fill="var(--success, #10b981)" fillOpacity="0.25" stroke="var(--success, #10b981)" strokeWidth="1.5" />
          <text x="187" y="32" textAnchor="middle" fill="var(--success, #10b981)" fontSize="13" fontWeight="bold">I3: [8, 11]</text>
          {/* Greedy Early-Finish rule indicator */}
          <path d="M75 16 L75 38" stroke="var(--accent, #6366f1)" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
      );

    case 'inversion-counting':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Permutación de elementos con cruces de inversión fuera de orden' : 'Permutation of elements with out-of-order inversion crossings'}>
          {/* Input array row */}
          {[
            { val: 3, x: 40 },
            { val: 1, x: 85 },
            { val: 4, x: 130 },
            { val: 2, x: 175 }
          ].map((item, idx) => (
            <g key={idx}>
              <rect x={item.x} y="20" width="30" height="24" rx="4" fill="var(--surface-raised, #1e293b)" stroke="var(--accent, #6366f1)" strokeWidth="1.5" />
              <text x={item.x + 15} y="36" textAnchor="middle" fill="var(--text)" fontSize="13" fontWeight="bold">{item.val}</text>
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
              <text x={item.x + 15} y="91" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="13">{item.val}</text>
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
          <text x="215" y="60" textAnchor="middle" fill="#ef4444" fontSize="13" fontWeight="bold">
            {language === 'es' ? '3 Inversiones' : '3 Inversions'}
          </text>
        </svg>
      );

    case 'huffman-coding':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Árbol binario de Huffman con frecuencias y ramas 0 y 1' : 'Huffman binary tree with frequencies and 0/1 branches'}>
          {/* Tree Root */}
          <circle cx="120" cy="22" r="13" fill="var(--surface-raised, #1e293b)" stroke="var(--accent, #6366f1)" strokeWidth="2" />
          <text x="120" y="26" textAnchor="middle" fill="var(--accent, #6366f1)" fontSize="13" fontWeight="bold">100</text>
          {/* Left Branch */}
          <line x1="110" y1="32" x2="70" y2="60" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <text x="85" y="44" fill="var(--success, #10b981)" fontSize="13" fontWeight="bold">0</text>
          {/* Right Branch */}
          <line x1="130" y1="32" x2="170" y2="60" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <text x="155" y="44" fill="var(--warning, #f59e0b)" fontSize="13" fontWeight="bold">1</text>
          {/* Left Child (Leaf: 'A', freq 45) */}
          <circle cx="65" cy="72" r="12" fill="var(--surface-active, #334155)" stroke="var(--success, #10b981)" strokeWidth="2" />
          <text x="65" y="75" textAnchor="middle" fill="var(--text)" fontSize="13" fontWeight="bold">'A'</text>
          <text x="65" y="94" textAnchor="middle" fill="var(--success, #10b981)" fontSize="13">
            {language === 'es' ? 'cód: "0"' : 'code: "0"'}
          </text>
          {/* Right Subtree Node */}
          <circle cx="170" cy="62" r="11" fill="var(--surface-raised, #1e293b)" stroke="var(--accent, #6366f1)" strokeWidth="1.5" />
          <text x="170" y="65" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="13">55</text>
          {/* Leaves of right subtree */}
          <line x1="162" y1="71" x2="140" y2="88" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <text x="146" y="80" fill="var(--success, #10b981)" fontSize="13">0</text>
          <line x1="178" y1="71" x2="200" y2="88" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <text x="194" y="80" fill="var(--warning, #f59e0b)" fontSize="13">1</text>
          <circle cx="138" cy="98" r="9" fill="var(--surface-active, #334155)" stroke="var(--accent, #6366f1)" strokeWidth="1.5" />
          <text x="138" y="101" textAnchor="middle" fill="var(--text)" fontSize="13">'B'</text>
          <circle cx="202" cy="98" r="9" fill="var(--surface-active, #334155)" stroke="var(--accent, #6366f1)" strokeWidth="1.5" />
          <text x="202" y="101" textAnchor="middle" fill="var(--text)" fontSize="13">'C'</text>
        </svg>
      );

    case 'vertex-cover-approx':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Grafo con nodos seleccionados en la cobertura de vértices' : 'Graph with nodes selected in vertex cover'}>
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
          <text x="50" y="44" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">u</text>
          {/* Node 2 (in VC) */}
          <circle cx="110" cy="25" r="12" fill="var(--accent, #6366f1)" stroke="#ffffff" strokeWidth="2" />
          <text x="110" y="29" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">v</text>
          {/* Node 3 (in VC) */}
          <circle cx="140" cy="90" r="12" fill="var(--accent, #6366f1)" stroke="#ffffff" strokeWidth="2" />
          <text x="140" y="94" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">w</text>
          {/* Unselected covered nodes */}
          <circle cx="80" cy="90" r="10" fill="var(--surface-raised, #1e293b)" stroke="var(--border, #475569)" strokeWidth="2" />
          <circle cx="180" cy="35" r="10" fill="var(--surface-raised, #1e293b)" stroke="var(--border, #475569)" strokeWidth="2" />
          {/* Legend */}
          <text x="205" y="70" textAnchor="middle" fill="var(--accent, #6366f1)" fontSize="13" fontWeight="bold">{language === 'es' ? 'Vértice en VC' : 'Vertex in VC'}</text>
          <text x="205" y="85" textAnchor="middle" fill="var(--success, #10b981)" fontSize="13">{language === 'es' ? 'Arista Cubierta' : 'Covered Edge'}</text>
        </svg>
      );

    case 'max-subarray':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Histograma de números positivos y negativos con subarreglo contiguo óptimo' : 'Histogram of positive and negative numbers with optimal contiguous subarray'}>
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
          <text x="107" y="7" textAnchor="middle" fill="var(--accent, #6366f1)" fontSize="13" fontWeight="bold">{language === 'es' ? 'Suma Máxima Contigua' : 'Max Contiguous Sum'}</text>
          <text x="107" y="105" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="13">{language === 'es' ? 'Algoritmo de Kadane: O(N)' : "Kadane's Algorithm: O(N)"}</text>
        </svg>
      );

    case 'juan-el-vago':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Días de la semana con restricción de no trabajar dos días consecutivos' : 'Days of week with non-consecutive working days constraint'}>
          {/* Day cards */}
          {[
            { day: language === 'es' ? 'Lun' : 'Mon', val: 50, work: true },
            { day: language === 'es' ? 'Mar' : 'Tue', val: 10, work: false },
            { day: language === 'es' ? 'Mié' : 'Wed', val: 80, work: true },
            { day: language === 'es' ? 'Jue' : 'Thu', val: 70, work: false },
            { day: language === 'es' ? 'Vie' : 'Fri', val: 40, work: false },
            { day: language === 'es' ? 'Sáb' : 'Sat', val: 90, work: true }
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
                <text x={x + 14} y={d.work ? 34 : 44} textAnchor="middle" fill={d.work ? 'var(--accent, #6366f1)' : 'var(--text-muted, #94a3b8)'} fontSize="13" fontWeight="bold">{d.day}</text>
                <text x={x + 14} y={d.work ? 52 : 62} textAnchor="middle" fill={d.work ? 'var(--success, #10b981)' : 'var(--text-muted, #64748b)'} fontSize="13">${d.val}</text>
                {d.work ? (
                  <circle cx={x + 14} cy="75" r="4" fill="var(--success, #10b981)" />
                ) : (
                  <line x1={x + 10} y1="75" x2={x + 18} y2="75" stroke="#ef4444" strokeWidth="2" />
                )}
              </g>
            );
          })}
          <text x="120" y="100" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="13">{language === 'es' ? 'Sin días consecutivos: dp[i] = max(dp[i-1], dp[i-2] + p[i])' : 'No consecutive days: dp[i] = max(dp[i-1], dp[i-2] + p[i])'}</text>
        </svg>
      );

    case 'road-antennas':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Ruta con casas y antenas con radio de cobertura R' : 'Road with houses and antennas with coverage radius R'}>
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
          <text x="120" y="105" textAnchor="middle" fill="var(--success, #10b981)" fontSize="13">{language === 'es' ? '100% Cobertura con Antenas Mínimas' : '100% Coverage with Minimal Antennas'}</text>
        </svg>
      );

    case 'lcs':
    case 'longest-common-subsequence':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Alineamiento de caracteres de subsecuencia común más larga' : 'Longest common subsequence character alignment'}>
          {/* Sequence A */}
          <text x="25" y="32" fill="var(--text-muted, #94a3b8)" fontSize="13" fontWeight="bold">S1:</text>
          {['A', 'B', 'C', 'B', 'D', 'A', 'B'].map((ch, i) => {
            const isMatch = [1, 2, 3, 5].includes(i); // B, C, B, A
            return (
              <g key={i}>
                <rect x={55 + i * 24} y="18" width="18" height="20" rx="3" fill={isMatch ? 'var(--accent, #6366f1)' : 'var(--surface-raised, #1e293b)'} stroke="var(--border, #334155)" />
                <text x={64 + i * 24} y="32" textAnchor="middle" fill={isMatch ? '#ffffff' : 'var(--text-muted, #94a3b8)'} fontSize="13" fontWeight={isMatch ? 'bold' : 'normal'}>{ch}</text>
              </g>
            );
          })}
          {/* Bridges */}
          <path d="M88 40 L88 70" stroke="var(--success, #10b981)" strokeWidth="2" />
          <path d="M112 40 L112 70" stroke="var(--success, #10b981)" strokeWidth="2" />
          <path d="M136 40 L160 70" stroke="var(--success, #10b981)" strokeWidth="2" />
          <path d="M184 40 L184 70" stroke="var(--success, #10b981)" strokeWidth="2" />
          {/* Sequence B */}
          <text x="25" y="84" fill="var(--text-muted, #94a3b8)" fontSize="13" fontWeight="bold">S2:</text>
          {['B', 'D', 'C', 'A', 'B', 'A'].map((ch, i) => {
            const isMatch = [0, 2, 4, 5].includes(i);
            return (
              <g key={i}>
                <rect x={64 + i * 24} y="70" width="18" height="20" rx="3" fill={isMatch ? 'var(--accent, #6366f1)' : 'var(--surface-raised, #1e293b)'} stroke="var(--border, #334155)" />
                <text x={73 + i * 24} y="84" textAnchor="middle" fill={isMatch ? '#ffffff' : 'var(--text-muted, #94a3b8)'} fontSize="13" fontWeight={isMatch ? 'bold' : 'normal'}>{ch}</text>
              </g>
            );
          })}
          <text x="120" y="108" textAnchor="middle" fill="var(--success, #10b981)" fontSize="13">{language === 'es' ? 'LCS = "BCBA" (Longitud 4)' : 'LCS = "BCBA" (Length 4)'}</text>
        </svg>
      );

    case 'peak-finding':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Perfil montañoso 1D con pico local señalado' : '1D mountain profile with highlighted local peak'}>
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
          <text x="95" y="55" fill="var(--text-muted, #94a3b8)" fontSize="13">A[p-1] ≤</text>
          <text x="130" y="42" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">{language === 'es' ? 'Pico A[p]' : 'Peak A[p]'}</text>
          <text x="155" y="55" fill="var(--text-muted, #94a3b8)" fontSize="13">≥ A[p+1]</text>
          <text x="120" y="105" textAnchor="middle" fill="var(--success, #10b981)" fontSize="13">{language === 'es' ? 'Búsqueda D&C: O(log N)' : 'D&C Search: O(log N)'}</text>
        </svg>
      );

    case 'graph-coloring':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Grafo coloreado con k colores sin aristas monocromáticas' : 'Colored graph with k colors without monochromatic edges'}>
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
          <text x="70" y="39" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">C1</text>
          {/* Color 2: Emerald */}
          <circle cx="150" cy="35" r="13" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <text x="150" y="39" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">C2</text>
          {/* Color 3: Amber */}
          <circle cx="180" cy="85" r="13" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
          <text x="180" y="89" textAnchor="middle" fill="#000000" fontSize="13" fontWeight="bold">C3</text>
          {/* Color 2: Emerald */}
          <circle cx="110" cy="100" r="13" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
          <text x="110" y="104" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">C2</text>
          {/* Color 3: Amber */}
          <circle cx="40" cy="85" r="13" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
          <text x="40" y="89" textAnchor="middle" fill="#000000" fontSize="13" fontWeight="bold">C3</text>
          <text x="195" y="45" textAnchor="middle" fill="var(--success, #10b981)" fontSize="13">{language === 'es' ? 'k = 3 Válido' : 'k = 3 Valid'}</text>
        </svg>
      );

    case 'max-flow':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Red de flujo con fuente, sumidero y capacidades' : 'Flow network with source, sink and capacities'}>
          {/* Edges with capacities and flows */}
          <line x1="50" y1="60" x2="105" y2="30" stroke="var(--accent, #6366f1)" strokeWidth="3" />
          <line x1="50" y1="60" x2="105" y2="90" stroke="var(--accent, #6366f1)" strokeWidth="3" />
          <line x1="105" y1="30" x2="105" y2="90" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <line x1="105" y1="30" x2="160" y2="60" stroke="var(--accent, #6366f1)" strokeWidth="3" />
          <line x1="105" y1="90" x2="160" y2="60" stroke="var(--accent, #6366f1)" strokeWidth="3" />
          {/* Source node 's' */}
          <circle cx="50" cy="60" r="14" fill="var(--success, #10b981)" stroke="#ffffff" strokeWidth="2" />
          <text x="50" y="64" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">s</text>
          {/* Intermediate nodes */}
          <circle cx="105" cy="30" r="11" fill="var(--surface-raised, #1e293b)" stroke="var(--border, #475569)" strokeWidth="2" />
          <text x="105" y="34" textAnchor="middle" fill="var(--text)" fontSize="13">u</text>
          <circle cx="105" cy="90" r="11" fill="var(--surface-raised, #1e293b)" stroke="var(--border, #475569)" strokeWidth="2" />
          <text x="105" y="94" textAnchor="middle" fill="var(--text)" fontSize="13">v</text>
          {/* Sink node 't' */}
          <circle cx="160" cy="60" r="14" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
          <text x="160" y="64" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">t</text>
          {/* Min Cut Line */}
          <line x1="130" y1="10" x2="130" y2="110" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="195" y="55" textAnchor="middle" fill="#f59e0b" fontSize="13" fontWeight="bold">{language === 'es' ? 'Corte Mín' : 'Min Cut'}</text>
          <text x="195" y="70" textAnchor="middle" fill="var(--accent, #6366f1)" fontSize="13">MaxFlow=15</text>
        </svg>
      );

    case 'reduction-is-vc':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Reducción polinomial entre Conjunto Independiente y Cobertura de Vértices' : 'Polynomial reduction between Independent Set and Vertex Cover'}>
          {/* Vertex set V boundary */}
          <rect x="25" y="15" width="190" height="90" rx="10" fill="var(--surface, #0f172a)" stroke="var(--border, #334155)" strokeWidth="1.5" />
          <text x="35" y="30" fill="var(--text-muted, #94a3b8)" fontSize="13">{language === 'es' ? 'Grafo G = (V, E)' : 'Graph G = (V, E)'}</text>
          {/* Partition split line */}
          <line x1="120" y1="15" x2="120" y2="105" stroke="var(--border, #475569)" strokeWidth="1.5" strokeDasharray="4 4" />
          {/* Left partition: Independent Set S */}
          <rect x="35" y="35" width="75" height="60" rx="6" fill="rgba(99, 102, 241, 0.15)" stroke="var(--accent, #6366f1)" strokeWidth="1.5" />
          <circle cx="55" cy="55" r="7" fill="var(--accent, #6366f1)" />
          <circle cx="85" cy="75" r="7" fill="var(--accent, #6366f1)" />
          <text x="72" y="47" textAnchor="middle" fill="var(--accent, #6366f1)" fontSize="13" fontWeight="bold">S (Indep. Set)</text>
          {/* Right partition: Vertex Cover V \ S */}
          <rect x="130" y="35" width="75" height="60" rx="6" fill="rgba(16, 185, 129, 0.15)" stroke="var(--success, #10b981)" strokeWidth="1.5" />
          <circle cx="150" cy="55" r="7" fill="var(--success, #10b981)" />
          <circle cx="180" cy="55" r="7" fill="var(--success, #10b981)" />
          <circle cx="165" cy="80" r="7" fill="var(--success, #10b981)" />
          <text x="167" y="47" textAnchor="middle" fill="var(--success, #10b981)" fontSize="13" fontWeight="bold">V \ S (Vertex Cover)</text>
          {/* Duality theorem */}
          <text x="120" y="116" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="13">{language === 'es' ? 'Dualidad: |S| + |VC| = |V|' : 'Duality: |S| + |VC| = |V|'}</text>
        </svg>
      );

    case 'randomized-fair-coin':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Conversión de moneda sesgada a moneda justa según algoritmo de von Neumann' : 'Biased coin to fair coin simulation via von Neumann algorithm'}>
          {/* Biased coin pairs */}
          <g transform="translate(30, 20)">
            <rect x="0" y="0" width="70" height="32" rx="4" fill="var(--surface-raised, #1e293b)" stroke="var(--border, #334155)" />
            <text x="35" y="14" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="13">{language === 'es' ? 'Par (H, T)' : 'Pair (H, T)'}</text>
            <text x="35" y="26" textAnchor="middle" fill="var(--accent, #6366f1)" fontSize="13" fontWeight="bold">{language === 'es' ? 'Retorna 1' : 'Returns 1'}</text>
          </g>
          <g transform="translate(30, 60)">
            <rect x="0" y="0" width="70" height="32" rx="4" fill="var(--surface-raised, #1e293b)" stroke="var(--border, #334155)" />
            <text x="35" y="14" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="13">{language === 'es' ? 'Par (T, H)' : 'Pair (T, H)'}</text>
            <text x="35" y="26" textAnchor="middle" fill="var(--accent, #6366f1)" fontSize="13" fontWeight="bold">{language === 'es' ? 'Retorna 0' : 'Returns 0'}</text>
          </g>
          {/* Transform Arrow */}
          <path d="M110 56 L135 56" stroke="var(--accent, #6366f1)" strokeWidth="2" />
          <polygon points="135,52 142,56 135,60" fill="var(--accent, #6366f1)" />
          {/* Balanced coin result */}
          <g transform="translate(155, 30)">
            <circle cx="26" cy="26" r="24" fill="var(--warning, #f59e0b)" stroke="#ffffff" strokeWidth="2" />
            <text x="26" y="24" textAnchor="middle" fill="#000000" fontSize="13" fontWeight="bold">P=0.5</text>
            <text x="26" y="36" textAnchor="middle" fill="#000000" fontSize="13">
              {language === 'es' ? 'Justo' : 'Fair'}
            </text>
          </g>
          <text x="120" y="108" textAnchor="middle" fill="var(--success, #10b981)" fontSize="13">
            {language === 'es' ? 'p(1-p) = (1-p)p  ⇒ Simetría Imparcial' : 'p(1-p) = (1-p)p  ⇒ Impartial Symmetry'}
          </text>
        </svg>
      );

    case 'merge-sort':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Árbol divide y conquista de ordenamiento por mezcla' : 'Merge sort divide and conquer tree'}>
          {/* Root array */}
          <rect x="80" y="10" width="80" height="18" rx="3" fill="var(--surface-raised, #1e293b)" stroke="var(--accent, #6366f1)" strokeWidth="1.5" />
          <text x="120" y="22" textAnchor="middle" fill="var(--text)" fontSize="13">[38, 27, 43, 3]</text>
          {/* Divide arrows */}
          <path d="M100 28 L65 44" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <path d="M140 28 L175 44" stroke="var(--border, #475569)" strokeWidth="1.5" />
          {/* Level 1 subarrays */}
          <rect x="35" y="44" width="55" height="18" rx="3" fill="var(--surface-raised, #1e293b)" stroke="var(--border, #475569)" strokeWidth="1" />
          <text x="62" y="56" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="13">[38, 27]</text>
          <rect x="150" y="44" width="55" height="18" rx="3" fill="var(--surface-raised, #1e293b)" stroke="var(--border, #475569)" strokeWidth="1" />
          <text x="177" y="56" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="13">[43, 3]</text>
          {/* Merge Up arrows */}
          <path d="M62 62 L95 82" stroke="var(--success, #10b981)" strokeWidth="1.5" />
          <path d="M177 62 L145 82" stroke="var(--success, #10b981)" strokeWidth="1.5" />
          {/* Merged Sorted Output */}
          <rect x="80" y="82" width="80" height="20" rx="3" fill="var(--surface-active, #334155)" stroke="var(--success, #10b981)" strokeWidth="2" />
          <text x="120" y="95" textAnchor="middle" fill="var(--success, #10b981)" fontSize="13" fontWeight="bold">[3, 27, 38, 43]</text>
          <text x="120" y="114" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="13">T(N) = 2T(N/2) + O(N) = O(N log N)</text>
        </svg>
      );

    case 'linear-programming':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Región factible convexa y punto óptimo en programación lineal 2D' : 'Convex feasible region and optimal point in 2D linear programming'}>
          {/* Axes */}
          <line x1="30" y1="95" x2="190" y2="95" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <line x1="30" y1="95" x2="30" y2="15" stroke="var(--border, #475569)" strokeWidth="1.5" />
          <text x="195" y="98" fill="var(--text-muted, #94a3b8)" fontSize="13">x₁</text>
          <text x="25" y="14" fill="var(--text-muted, #94a3b8)" fontSize="13">x₂</text>
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
          <text x="80" y="24" textAnchor="middle" fill="#ef4444" fontSize="13" fontWeight="bold">
            {language === 'es' ? 'Punto Óptimo (x*)' : 'Optimal Point (x*)'}
          </text>
          {/* Objective Gradient vector ∇c */}
          <line x1="80" y1="35" x2="115" y2="18" stroke="var(--warning, #f59e0b)" strokeWidth="2" />
          <polygon points="115,14 122,17 117,23" fill="var(--warning, #f59e0b)" />
          <text x="135" y="18" fill="var(--warning, #f59e0b)" fontSize="13">∇c</text>
          <text x="120" y="112" textAnchor="middle" fill="var(--text-muted, #94a3b8)" fontSize="13">
            {language === 'es' ? 'Polítopo convexo y Teorema Fundamental' : 'Convex Polytope & Fundamental Theorem'}
          </text>
        </svg>
      );

    case 'closest-pair':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Plano 2D con franja de corte delta y par de puntos más cercano' : '2D plane with delta strip and closest pair of points'}>
          <line x1="120" y1="15" x2="120" y2="105" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="120" y="12" textAnchor="middle" fill="var(--accent)" fontSize="13">x_mid</text>
          <rect x="95" y="15" width="50" height="90" fill="var(--accent)" fillOpacity="0.08" stroke="var(--border)" strokeWidth="1" />
          <text x="120" y="114" textAnchor="middle" fill="var(--text-muted)" fontSize="13">
            {language === 'es' ? 'Franja [x_mid - δ, x_mid + δ]' : 'Strip [x_mid - δ, x_mid + δ]'}
          </text>
          <circle cx="50" cy="35" r="4" fill="var(--text-muted)" />
          <circle cx="75" cy="70" r="4" fill="var(--text-muted)" />
          <circle cx="40" cy="85" r="4" fill="var(--text-muted)" />
          <circle cx="165" cy="30" r="4" fill="var(--text-muted)" />
          <circle cx="190" cy="65" r="4" fill="var(--text-muted)" />
          <circle cx="175" cy="90" r="4" fill="var(--text-muted)" />
          <circle cx="108" cy="50" r="4.5" fill="#10b981" />
          <circle cx="132" cy="55" r="4.5" fill="#10b981" />
          <line x1="108" y1="50" x2="132" y2="55" stroke="#10b981" strokeWidth="2" />
          <text x="120" y="44" textAnchor="middle" fill="#10b981" fontSize="13" fontWeight="bold">d(p, q) = δ*</text>
        </svg>
      );

    case 'karatsuba':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Descomposición algebraica de Karatsuba en 3 multiplicaciones' : 'Karatsuba algebraic decomposition into 3 multiplications'}>
          <rect x="30" y="15" width="180" height="30" rx="4" fill="var(--surface-raised)" stroke="var(--border)" />
          <text x="120" y="34" textAnchor="middle" fill="var(--text)" fontSize="13" fontFamily="var(--font-mono)">X · Y = (x₁·10ᵐ + x₀)(y₁·10ᵐ + y₀)</text>
          <g transform="translate(30, 55)">
            <rect x="0" y="0" width="54" height="28" rx="4" fill="var(--surface-hover)" stroke="var(--accent)" strokeWidth="1" />
            <text x="27" y="14" textAnchor="middle" fill="var(--accent)" fontSize="13" fontWeight="bold">z₂ = x₁y₁</text>
            <rect x="63" y="0" width="54" height="28" rx="4" fill="var(--surface-hover)" stroke="#10b981" strokeWidth="1" />
            <text x="90" y="14" textAnchor="middle" fill="#10b981" fontSize="13" fontWeight="bold">z₀ = x₀y₀</text>
            <rect x="126" y="0" width="54" height="28" rx="4" fill="var(--surface-hover)" stroke="#f59e0b" strokeWidth="1" />
            <text x="153" y="14" textAnchor="middle" fill="#f59e0b" fontSize="13" fontWeight="bold">z₁ = z_sum - z₂ - z₀</text>
          </g>
          <text x="120" y="105" textAnchor="middle" fill="var(--accent)" fontSize="13" fontWeight="600">T(n) = 3T(n/2) + O(n) = O(n^{1.585})</text>
        </svg>
      );

    case 'median-of-medians':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Grupos de 5 elementos y selección de la mediana de medianas' : 'Groups of 5 elements and median of medians selection'}>
          {[0, 1, 2, 3, 4].map((col) => (
            <g key={col} transform={`translate(${45 + col * 32}, 15)`}>
              {[0, 1, 2, 3, 4].map((row) => (
                <circle
                  key={row}
                  cx={12}
                  cy={row * 15 + 8}
                  r={row === 2 ? 5 : 3.5}
                  fill={col === 2 && row === 2 ? '#ef4444' : row === 2 ? 'var(--accent)' : 'var(--text-muted)'}
                />
              ))}
              <rect x="2" y="2" width="20" height="72" rx="3" fill="none" stroke="var(--border)" strokeWidth="1" />
            </g>
          ))}
          <line x1="40" y1="53" x2="200" y2="53" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="2 2" />
          <text x="215" y="56" fill="var(--accent)" fontSize="13">
            {language === 'es' ? 'Medianas' : 'Medians'}
          </text>
          <text x="120" y="110" textAnchor="middle" fill="var(--text-muted)" fontSize="13">
            {language === 'es' ? 'Pivote M garantiza ≥ 30% y ≤ 70% en partición lineal O(n)' : 'Pivot M guarantees ≥ 30% and ≤ 70% in linear O(n) partition'}
          </text>
        </svg>
      );

    case 'majority-element':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Cancelación de pares de candidatos para elemento mayoritario' : 'Candidate pair cancellation for majority element'}>
          <g transform="translate(35, 20)">
            <rect x="0" y="0" width="36" height="24" rx="4" fill="var(--accent)" />
            <text x="18" y="16" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">A</text>
            <rect x="42" y="0" width="36" height="24" rx="4" fill="var(--border-strong)" />
            <text x="60" y="16" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">B</text>
            <text x="39" y="38" textAnchor="middle" fill="var(--text-muted)" fontSize="13">
              {language === 'es' ? 'A ≠ B (Cancela)' : 'A ≠ B (Cancels)'}
            </text>
          </g>
          <g transform="translate(130, 20)">
            <rect x="0" y="0" width="36" height="24" rx="4" fill="var(--accent)" />
            <text x="18" y="16" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">A</text>
            <rect x="42" y="0" width="36" height="24" rx="4" fill="var(--accent)" />
            <text x="60" y="16" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">A</text>
            <text x="39" y="38" textAnchor="middle" fill="#10b981" fontSize="13" fontWeight="bold">
              {language === 'es' ? 'A = A (Sobrevive)' : 'A = A (Survives)'}
            </text>
          </g>
          <text x="120" y="90" textAnchor="middle" fill="var(--accent)" fontSize="13" fontWeight="bold">
            {language === 'es' ? 'Candidato dominante > n/2' : 'Dominant candidate > n/2'}
          </text>
          <text x="120" y="108" textAnchor="middle" fill="var(--text-muted)" fontSize="13">
            {'Boyer-Moore O(n) / Divide & Conquer T(n) = 2T(n/2) + O(n)'}
          </text>
        </svg>
      );

    case 'dijkstra':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Grafo ponderado con caminos mínimos desde origen S' : 'Weighted graph with shortest paths from source S'}>
          <line x1="50" y1="60" x2="110" y2="25" stroke="#10b981" strokeWidth="2" />
          <line x1="50" y1="60" x2="110" y2="95" stroke="var(--border-strong)" strokeWidth="1.5" />
          <line x1="110" y1="25" x2="180" y2="60" stroke="#10b981" strokeWidth="2" />
          <line x1="110" y1="95" x2="180" y2="60" stroke="var(--border-strong)" strokeWidth="1.5" />
          <text x="75" y="35" fill="var(--text-muted)" fontSize="13">4</text>
          <text x="75" y="85" fill="var(--text-muted)" fontSize="13">2</text>
          <text x="150" y="35" fill="var(--text-muted)" fontSize="13">3</text>
          <circle cx="50" cy="60" r="14" fill="var(--accent)" />
          <text x="50" y="63" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">S (0)</text>
          <circle cx="110" cy="25" r="14" fill="#10b981" />
          <text x="110" y="28" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">A (4)</text>
          <circle cx="110" cy="95" r="14" fill="var(--surface-hover)" stroke="var(--border)" />
          <text x="110" y="98" textAnchor="middle" fill="var(--text)" fontSize="13">B (2)</text>
          <circle cx="180" cy="60" r="14" fill="#10b981" />
          <text x="180" y="63" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">T (7)</text>
          <text x="120" y="114" textAnchor="middle" fill="var(--text-muted)" fontSize="13">Greedy Stays Ahead: d[u] + w(u, v) relax</text>
        </svg>
      );

    case 'kruskal-mst':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Árbol recubridor mínimo con aristas ordenadas y componentes disjuntos' : 'Minimum spanning tree with sorted edges and disjoint sets'}>
          <line x1="50" y1="40" x2="120" y2="25" stroke="#10b981" strokeWidth="2.5" />
          <line x1="120" y1="25" x2="190" y2="40" stroke="#10b981" strokeWidth="2.5" />
          <line x1="50" y1="40" x2="80" y2="85" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="120" y1="25" x2="150" y2="85" stroke="#10b981" strokeWidth="2.5" />
          <line x1="80" y1="85" x2="150" y2="85" stroke="#10b981" strokeWidth="2.5" />
          <circle cx="50" cy="40" r="10" fill="var(--surface-raised)" stroke="#10b981" strokeWidth="2" />
          <text x="50" y="43" textAnchor="middle" fill="var(--text)" fontSize="13">1</text>
          <circle cx="120" cy="25" r="10" fill="var(--surface-raised)" stroke="#10b981" strokeWidth="2" />
          <text x="120" y="28" textAnchor="middle" fill="var(--text)" fontSize="13">2</text>
          <circle cx="190" cy="40" r="10" fill="var(--surface-raised)" stroke="#10b981" strokeWidth="2" />
          <text x="190" y="43" textAnchor="middle" fill="var(--text)" fontSize="13">3</text>
          <circle cx="80" cy="85" r="10" fill="var(--surface-raised)" stroke="#10b981" strokeWidth="2" />
          <text x="80" y="88" textAnchor="middle" fill="var(--text)" fontSize="13">4</text>
          <circle cx="150" cy="85" r="10" fill="var(--surface-raised)" stroke="#10b981" strokeWidth="2" />
          <text x="150" y="88" textAnchor="middle" fill="var(--text)" fontSize="13">5</text>
          <text x="120" y="112" textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="bold">
            {language === 'es' ? 'Propiedad del Corte (Cut Property) + Union-Find' : 'Cut Property + Union-Find'}
          </text>
        </svg>
      );

    case 'interval-partitioning':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Partición de intervalos en aulas paralelas' : 'Interval partitioning into parallel classrooms'}>
          <rect x="25" y="15" width="40" height="20" rx="3" fill="var(--surface-hover)" />
          <text x="45" y="28" textAnchor="middle" fill="var(--text-muted)" fontSize="13">{language === 'es' ? 'Aula 1' : 'Room 1'}</text>
          <rect x="25" y="45" width="40" height="20" rx="3" fill="var(--surface-hover)" />
          <text x="45" y="58" textAnchor="middle" fill="var(--text-muted)" fontSize="13">{language === 'es' ? 'Aula 2' : 'Room 2'}</text>
          <rect x="25" y="75" width="40" height="20" rx="3" fill="var(--surface-hover)" />
          <text x="45" y="88" textAnchor="middle" fill="var(--text-muted)" fontSize="13">{language === 'es' ? 'Aula 3' : 'Room 3'}</text>
          <rect x="75" y="17" width="55" height="16" rx="3" fill="var(--accent)" />
          <rect x="140" y="17" width="65" height="16" rx="3" fill="var(--accent)" />
          <rect x="90" y="47" width="80" height="16" rx="3" fill="#10b981" />
          <rect x="110" y="77" width="45" height="16" rx="3" fill="#f59e0b" />
          <line x1="125" y1="10" x2="125" y2="100" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="125" y="112" textAnchor="middle" fill="#ef4444" fontSize="13" fontWeight="bold">
            {language === 'es' ? 'Profundidad d = 3 aulas óptimas' : 'Depth d = 3 optimal classrooms'}
          </text>
        </svg>
      );

    case 'minimize-lateness':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Planificación de tareas con minimización de retraso máximo' : 'Task scheduling with maximum lateness minimization'}>
          <line x1="30" y1="65" x2="210" y2="65" stroke="var(--border)" strokeWidth="2" />
          <rect x="30" y="45" width="45" height="18" rx="3" fill="var(--accent)" />
          <text x="52" y="57" textAnchor="middle" fill="#fff" fontSize="13">J₁ (t:3)</text>
          <rect x="78" y="45" width="60" height="18" rx="3" fill="#10b981" />
          <text x="108" y="57" textAnchor="middle" fill="#fff" fontSize="13">J₂ (t:4)</text>
          <rect x="141" y="45" width="50" height="18" rx="3" fill="#f59e0b" />
          <text x="166" y="57" textAnchor="middle" fill="#fff" fontSize="13">J₃ (t:3)</text>
          <line x1="70" y1="35" x2="70" y2="70" stroke="#ef4444" strokeWidth="1.5" />
          <text x="70" y="30" textAnchor="middle" fill="#ef4444" fontSize="13">d₁</text>
          <line x1="130" y1="35" x2="130" y2="70" stroke="#ef4444" strokeWidth="1.5" />
          <text x="130" y="30" textAnchor="middle" fill="#ef4444" fontSize="13">d₂</text>
          <line x1="175" y1="35" x2="175" y2="70" stroke="#ef4444" strokeWidth="1.5" />
          <text x="175" y="30" textAnchor="middle" fill="#ef4444" fontSize="13">d₃</text>
          <text x="120" y="95" textAnchor="middle" fill="var(--success)" fontSize="13" fontWeight="bold">
            {language === 'es' ? 'Earliest Deadline First (EDF) elimina inversiones' : 'Earliest Deadline First (EDF) eliminates inversions'}
          </text>
          <text x="120" y="110" textAnchor="middle" fill="var(--text-muted)" fontSize="13">
            {language === 'es' ? 'L_max = max(0, C_i - d_i) óptimo' : 'L_max = max(0, C_i - d_i) optimal'}
          </text>
        </svg>
      );

    case 'segmented-least-squares':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Mínimos cuadrados segmentados con dos rectas ajustadas' : 'Segmented least squares with fitted lines'}>
          <line x1="30" y1="95" x2="200" y2="95" stroke="var(--border)" strokeWidth="1.5" />
          <line x1="30" y1="95" x2="30" y2="15" stroke="var(--border)" strokeWidth="1.5" />
          <circle cx="45" cy="75" r="3" fill="var(--text-muted)" />
          <circle cx="65" cy="65" r="3" fill="var(--text-muted)" />
          <circle cx="85" cy="55" r="3" fill="var(--text-muted)" />
          <line x1="40" y1="78" x2="95" y2="50" stroke="#38bdf8" strokeWidth="2" />
          <circle cx="120" cy="45" r="3" fill="var(--text-muted)" />
          <circle cx="145" cy="35" r="3" fill="var(--text-muted)" />
          <circle cx="175" cy="20" r="3" fill="var(--text-muted)" />
          <line x1="115" y1="48" x2="185" y2="16" stroke="#10b981" strokeWidth="2" />
          <line x1="105" y1="20" x2="105" y2="95" stroke="var(--warning)" strokeWidth="1" strokeDasharray="3 3" />
          <text x="105" y="14" textAnchor="middle" fill="var(--warning)" fontSize="13">
            {language === 'es' ? 'Partición óptima i' : 'Optimal partition i'}
          </text>
          <text x="120" y="112" textAnchor="middle" fill="var(--text-muted)" fontSize="13">OPT(j) = min_{'{1≤i≤j}'} (e_{'{i,j}'} + C + OPT(i-1))</text>
        </svg>
      );

    case 'rna-secondary-structure':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Estructura secundaria de ARN con apareamientos Watson-Crick' : 'RNA secondary structure with Watson-Crick pairings'}>
          <line x1="30" y1="85" x2="210" y2="85" stroke="var(--border-strong)" strokeWidth="2" />
          {['A', 'U', 'C', 'G', 'A', 'U', 'G', 'C'].map((b, i) => (
            <g key={i} transform={`translate(${38 + i * 22}, 85)`}>
              <circle cx="0" cy="0" r="4" fill="var(--accent)" />
              <text x="0" y="16" textAnchor="middle" fill="var(--text-muted)" fontSize="13" fontWeight="bold">{b}</text>
            </g>
          ))}
          <path d="M 38 82 Q 71 35 104 82" stroke="#10b981" strokeWidth="2" fill="none" />
          <path d="M 126 82 Q 159 30 192 82" stroke="#10b981" strokeWidth="2" fill="none" />
          <text x="120" y="25" textAnchor="middle" fill="#10b981" fontSize="13" fontWeight="bold">
            {language === 'es' ? 'Apareamientos sin cruce (Non-crossing)' : 'Non-crossing base pairings'}
          </text>
          <text x="120" y="116" textAnchor="middle" fill="var(--text-muted)" fontSize="13">
            {language === 'es' ? 'Restricción de horquilla t < j - 4' : 'Hairpin constraint t < j - 4'}
          </text>
        </svg>
      );

    case 'bellman-ford':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Bellman-Ford con aristas negativas y detección de ciclos' : 'Bellman-Ford with negative edges and cycle detection'}>
          <line x1="50" y1="60" x2="110" y2="25" stroke="var(--border-strong)" strokeWidth="1.5" />
          <line x1="110" y1="25" x2="170" y2="60" stroke="#ef4444" strokeWidth="2" />
          <line x1="170" y1="60" x2="110" y2="95" stroke="var(--border-strong)" strokeWidth="1.5" />
          <line x1="110" y1="95" x2="50" y2="60" stroke="var(--border-strong)" strokeWidth="1.5" />
          <text x="145" y="38" fill="#ef4444" fontSize="13" fontWeight="bold">-3</text>
          <circle cx="50" cy="60" r="12" fill="var(--accent)" />
          <text x="50" y="63" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="bold">S</text>
          <circle cx="110" cy="25" r="12" fill="var(--surface-raised)" stroke="var(--border)" />
          <text x="110" y="28" textAnchor="middle" fill="var(--text)" fontSize="13">u</text>
          <circle cx="170" cy="60" r="12" fill="var(--surface-raised)" stroke="var(--border)" />
          <text x="170" y="63" textAnchor="middle" fill="var(--text)" fontSize="13">v</text>
          <circle cx="110" cy="95" r="12" fill="var(--surface-raised)" stroke="var(--border)" />
          <text x="110" y="98" textAnchor="middle" fill="var(--text)" fontSize="13">w</text>
          <text x="120" y="112" textAnchor="middle" fill="var(--text-muted)" fontSize="13">M[i, v] = min(M[i-1, v], min_u (M[i-1, u] + c_{'{uv}'}))</text>
        </svg>
      );

    case 'sudoku':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Cuadrícula 3x3 de Sudoku con dominios de restricción' : '3x3 Sudoku grid with constraint domains'}>
          <rect x="75" y="15" width="90" height="90" rx="4" fill="var(--surface-raised)" stroke="var(--accent)" strokeWidth="2" />
          {[1, 2].map((i) => (
            <React.Fragment key={i}>
              <line x1={75 + i * 30} y1="15" x2={75 + i * 30} y2="105" stroke="var(--border)" strokeWidth="1" />
              <line x1="75" y1={15 + i * 30} x2="165" y2={15 + i * 30} stroke="var(--border)" strokeWidth="1" />
            </React.Fragment>
          ))}
          <text x="90" y="35" textAnchor="middle" fill="var(--text)" fontSize="13" fontWeight="bold">5</text>
          <text x="120" y="35" textAnchor="middle" fill="var(--text)" fontSize="13" fontWeight="bold">3</text>
          <text x="150" y="65" textAnchor="middle" fill="var(--text)" fontSize="13" fontWeight="bold">7</text>
          <text x="90" y="95" textAnchor="middle" fill="var(--text)" fontSize="13" fontWeight="bold">6</text>
          <rect x="106" y="46" width="28" height="28" fill="rgba(99, 102, 241, 0.2)" stroke="var(--accent)" strokeWidth="1.5" />
          <text x="120" y="58" textAnchor="middle" fill="var(--accent)" fontSize="13" fontWeight="bold">{'{1, 4}'}</text>
          <text x="120" y="68" textAnchor="middle" fill="var(--text-muted)" fontSize="13">MRV: 2</text>
          <text x="120" y="115" textAnchor="middle" fill="var(--text-muted)" fontSize="13">
            {language === 'es' ? 'Restricción de filas, columnas y cajas 3×3' : 'Row, column and 3x3 box constraints'}
          </text>
        </svg>
      );

    case 'hamiltonian-cycle':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Grafo con ciclo hamiltoniano activo pasando por todos los vértices' : 'Graph with active Hamiltonian cycle visiting all vertices'}>
          <polygon points="120,20 180,50 160,100 80,100 60,50" fill="none" stroke="#10b981" strokeWidth="2.5" />
          <line x1="120" y1="20" x2="160" y2="100" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="120" y1="20" x2="80" y2="100" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
          {[{x: 120, y: 20}, {x: 180, y: 50}, {x: 160, y: 100}, {x: 80, y: 100}, {x: 60, y: 50}].map((n, i) => (
            <circle key={i} cx={n.x} cy={n.y} r="8" fill="#10b981" stroke="var(--surface)" strokeWidth="2" />
          ))}
          <text x="120" y="65" textAnchor="middle" fill="#10b981" fontSize="13" fontWeight="bold">
            {language === 'es' ? 'Ciclo Simple Válido' : 'Valid Simple Cycle'}
          </text>
          <text x="120" y="114" textAnchor="middle" fill="var(--text-muted)" fontSize="13">
            {language === 'es' ? 'Visita cada vértice exactamente una vez (NP-completo)' : 'Visits each vertex exactly once (NP-complete)'}
          </text>
        </svg>
      );

    case 'tsp':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Viajante de comercio con tour óptimo y poda Branch and Bound' : 'Traveling salesperson with optimal tour and Branch & Bound pruning'}>
          <polygon points="50,30 130,20 190,60 140,95 70,85" fill="none" stroke="var(--accent)" strokeWidth="2" />
          {[{x: 50, y: 30}, {x: 130, y: 20}, {x: 190, y: 60}, {x: 140, y: 95}, {x: 70, y: 85}].map((c, i) => (
            <circle key={i} cx={c.x} cy={c.y} r="6" fill="var(--accent)" stroke="#fff" strokeWidth="1.5" />
          ))}
          <rect x="85" y="45" width="70" height="24" rx="4" fill="var(--surface-raised)" stroke="var(--border)" />
          <text x="120" y="56" textAnchor="middle" fill="var(--text)" fontSize="13">Cost: 247 km</text>
          <text x="120" y="65" textAnchor="middle" fill="#10b981" fontSize="13" fontWeight="bold">LB ≤ Incumbent</text>
          <text x="120" y="114" textAnchor="middle" fill="var(--text-muted)" fontSize="13">
            {language === 'es' ? 'Branch & Bound con cotas Held-Karp 1-Tree' : 'Branch & Bound with Held-Karp 1-Tree bounds'}
          </text>
        </svg>
      );

    case 'knights-tour':
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Tablero de ajedrez con salto en L de caballo y heurística de Warnsdorff' : "Chessboard with knight's L-move and Warnsdorff's heuristic"}>
          <rect x="70" y="15" width="100" height="90" rx="4" fill="var(--surface-raised)" stroke="var(--border)" strokeWidth="1.5" />
          <rect x="110" y="55" width="20" height="20" fill="var(--accent)" rx="2" />
          <g transform="translate(112, 57)">
            <svg width="16" height="16" viewBox="0 0 45 45">
              <path
                d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18"
                fill="#ffffff"
              />
              <path
                d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,7.4 17.07,8.07 18,8.5 C 18.72,8.87 21.05,8.8 21,10 C 20.95,10.6 20.3,11.2 20,11.5 C 19.7,11.8 18.7,12 18,12 C 16.6,12 15.6,11.4 15.6,11.4 C 15.6,11.4 17.3,12.6 18,13 C 18.7,13.4 20.3,13.4 21,13.5 C 22,13.5 23,13.8 23.5,14.5 C 24,15.2 24.4,16.5 24,18 z"
                fill="#ffffff"
              />
            </svg>
          </g>
          <line x1="120" y1="65" x2="100" y2="25" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="100" cy="25" r="5" fill="#10b981" />
          <line x1="120" y1="65" x2="140" y2="25" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="140" cy="25" r="5" fill="#10b981" />
          <line x1="120" y1="65" x2="80" y2="55" stroke="#10b981" strokeWidth="1.5" strokeDasharray="2 2" />
          <circle cx="80" cy="55" r="5" fill="#10b981" />
          <text x="120" y="114" textAnchor="middle" fill="var(--text-muted)" fontSize="13">
            {language === 'es' ? 'Heurística de Warnsdorff: grado mínimo de salida' : "Warnsdorff's heuristic: minimum outgoing degree"}
          </text>
        </svg>
      );

    default:
      return (
        <svg {...commonProps} aria-label={language === 'es' ? 'Ilustración esquemática del algoritmo' : 'Schematic algorithm illustration'}>
          <rect x="40" y="20" width="160" height="80" rx="8" fill="var(--surface-raised, #1e293b)" stroke="var(--border, #334155)" strokeWidth="1.5" />
          <circle cx="75" cy="50" r="14" fill="var(--accent, #6366f1)" />
          <circle cx="120" cy="70" r="14" fill="var(--success, #10b981)" />
          <circle cx="165" cy="45" r="14" fill="var(--warning, #f59e0b)" />
          <path d="M75 50 L120 70 L165 45" stroke="var(--text-muted, #94a3b8)" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      );
  }
};
