import React, { useMemo } from 'react';
import { HuffmanTraceItem } from '../../engine/algorithms/huffmanTrace';

export interface HuffmanTreeSvgProps {
  forestRoots: string[];
  allNodes: Record<string, HuffmanTraceItem>;
  selectedIds?: [string, string] | null;
  mergedParentId?: string | null;
  codes?: Record<string, string>;
  language?: 'es' | 'en';
}

interface PositionedNode {
  id: string;
  char: string | null;
  freq: number;
  x: number;
  y: number;
  isLeaf: boolean;
  code?: string;
}

interface PositionedEdge {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  bit: '0' | '1';
}

export const HuffmanTreeSvg: React.FC<HuffmanTreeSvgProps> = ({
  forestRoots,
  allNodes,
  selectedIds = null,
  mergedParentId = null,
  codes = {},
  language = 'es'
}) => {
  const { nodes, edges, width, height } = useMemo(() => {
    if (!forestRoots || forestRoots.length === 0 || !allNodes) {
      return { nodes: [], edges: [], width: 600, height: 260 };
    }

    const posNodes: PositionedNode[] = [];
    const posEdges: PositionedEdge[] = [];

    // Helper to calculate leaf count for subtree width
    function getLeafCount(id: string): number {
      const node = allNodes[id];
      if (!node) return 1;
      if (!node.leftId && !node.rightId) return 1;
      const leftCount = node.leftId ? getLeafCount(node.leftId) : 0;
      const rightCount = node.rightId ? getLeafCount(node.rightId) : 0;
      return Math.max(1, leftCount + rightCount);
    }

    const leafSpacing = 68;
    const levelHeight = 60;
    const startY = 42;

    function layoutSubtree(
      id: string,
      leftSpan: number,
      rightSpan: number,
      level: number
    ): { x: number; y: number } {
      const node = allNodes[id];
      if (!node) {
        const fallbackX = (leftSpan + rightSpan) / 2;
        const fallbackY = startY + level * levelHeight;
        return { x: fallbackX, y: fallbackY };
      }

      const isLeaf = !node.leftId && !node.rightId;

      if (isLeaf) {
        const x = (leftSpan + rightSpan) / 2;
        const y = startY + level * levelHeight;
        posNodes.push({
          id: node.id,
          char: node.char,
          freq: node.freq,
          x,
          y,
          isLeaf: true,
          code: node.char ? codes[node.char] : undefined
        });
        return { x, y };
      }

      const totalLeaves = getLeafCount(id);
      const leftLeaves = node.leftId ? getLeafCount(node.leftId) : 1;
      const span = rightSpan - leftSpan;
      const leftFraction = leftLeaves / totalLeaves;
      const splitX = leftSpan + span * leftFraction;

      const leftPos = node.leftId
        ? layoutSubtree(node.leftId, leftSpan, splitX, level + 1)
        : { x: leftSpan + span * 0.25, y: startY + (level + 1) * levelHeight };

      const rightPos = node.rightId
        ? layoutSubtree(node.rightId, splitX, rightSpan, level + 1)
        : { x: splitX + span * 0.25, y: startY + (level + 1) * levelHeight };

      const currentX = (leftPos.x + rightPos.x) / 2;
      const currentY = startY + level * levelHeight;

      posNodes.push({
        id: node.id,
        char: null,
        freq: node.freq,
        x: currentX,
        y: currentY,
        isLeaf: false
      });

      if (node.leftId) {
        posEdges.push({
          id: `${node.id}->${node.leftId}`,
          fromX: currentX,
          fromY: currentY,
          toX: leftPos.x,
          toY: leftPos.y,
          bit: '0'
        });
      }

      if (node.rightId) {
        posEdges.push({
          id: `${node.id}->${node.rightId}`,
          fromX: currentX,
          fromY: currentY,
          toX: rightPos.x,
          toY: rightPos.y,
          bit: '1'
        });
      }

      return { x: currentX, y: currentY };
    }

    let currentX = 30;
    const treeGap = 28;

    for (const rootId of forestRoots) {
      const leaves = getLeafCount(rootId);
      const treeWidth = Math.max(leaves * leafSpacing, 64);
      layoutSubtree(rootId, currentX, currentX + treeWidth, 0);
      currentX += treeWidth + treeGap;
    }

    const calcWidth = Math.max(680, currentX + 20);
    const maxY = posNodes.reduce((max, n) => Math.max(max, n.y), startY);
    const calcHeight = Math.max(260, maxY + 55);

    return {
      nodes: posNodes,
      edges: posEdges,
      width: calcWidth,
      height: calcHeight
    };
  }, [forestRoots, allNodes, codes]);

  return (
    <div className="huff-tree-container">
      <div className="huff-tree-header">
        <span className="huff-tree-title">
          {language === 'es' ? '🌲 Estructura del Árbol de Huffman (Bosque en Construcción):' : '🌲 Huffman Tree Structure (Forest under Construction):'}
        </span>
        <span className="huff-tree-subtitle">
          {forestRoots.length === 1
            ? (language === 'es' ? 'Árbol unificado completo' : 'Full unified tree')
            : `${forestRoots.length} ${language === 'es' ? 'árboles disjuntos en el bosque' : 'disjoint trees in forest'}`}
        </span>
      </div>

      <div className="huff-svg-wrapper">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="huff-tree-svg"
          role="img"
          aria-label={
            language === 'es'
              ? 'Visualización gráfica SVG del árbol binario de Huffman con aristas 0 y 1'
              : 'SVG graphic visualization of Huffman binary tree with 0 and 1 branch edges'
          }
        >
          <defs>
            <filter id="huff-glow-selected" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.8" />
            </filter>
            <filter id="huff-glow-merged" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#3b82f6" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Edges */}
          {edges.map((edge) => {
            const midX = (edge.fromX + edge.toX) / 2;
            const midY = (edge.fromY + edge.toY) / 2;
            const isZero = edge.bit === '0';

            return (
              <g key={edge.id} className="huff-edge-group">
                <line
                  x1={edge.fromX}
                  y1={edge.fromY}
                  x2={edge.toX}
                  y2={edge.toY}
                  className="huff-edge-line"
                />
                {/* Branch bit label badge */}
                <rect
                  x={midX - 9}
                  y={midY - 9}
                  width={18}
                  height={18}
                  rx={4}
                  className={`huff-edge-bit-bg ${isZero ? 'bit-0' : 'bit-1'}`}
                />
                <text
                  x={midX}
                  y={midY + 4}
                  className="huff-edge-bit-text"
                  textAnchor="middle"
                >
                  {edge.bit}
                </text>
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isMin1 = selectedIds && selectedIds[0] === node.id;
            const isMin2 = selectedIds && selectedIds[1] === node.id;
            const isSelected = isMin1 || isMin2;
            const isMerged = mergedParentId === node.id;

            if (node.isLeaf) {
              return (
                <g
                  key={node.id}
                  className={`huff-leaf-group ${isSelected ? 'selected' : ''}`}
                  transform={`translate(${node.x}, ${node.y})`}
                  filter={isSelected ? 'url(#huff-glow-selected)' : undefined}
                >
                  {/* Leaf Card */}
                  <rect
                    x={-24}
                    y={-22}
                    width={48}
                    height={44}
                    rx={8}
                    className={`huff-leaf-rect ${isSelected ? 'highlight-min' : ''}`}
                  />
                  {/* Min selection tag */}
                  {isSelected && (
                    <text x={0} y={-26} className="huff-badge-text" textAnchor="middle">
                      {isMin1 ? 'Min 1' : 'Min 2'}
                    </text>
                  )}
                  {/* Character */}
                  <text x={0} y={-3} className="huff-leaf-char" textAnchor="middle">
                    {node.char}
                  </text>
                  {/* Frequency */}
                  <text x={0} y={13} className="huff-leaf-freq" textAnchor="middle">
                    w:{node.freq}
                  </text>
                  {/* Code pill if available */}
                  {node.code && (
                    <g transform="translate(0, 32)">
                      <rect
                        x={-Math.max(16, (node.code.length * 7 + 10) / 2)}
                        y={-9}
                        width={Math.max(32, node.code.length * 7 + 10)}
                        height={16}
                        rx={4}
                        className="huff-code-tag-bg"
                      />
                      <text x={0} y={3} className="huff-code-tag-text" textAnchor="middle">
                        {node.code}
                      </text>
                    </g>
                  )}
                </g>
              );
            }

            // Internal Node
            return (
              <g
                key={node.id}
                className={`huff-internal-group ${isSelected ? 'selected' : ''} ${isMerged ? 'merged' : ''}`}
                transform={`translate(${node.x}, ${node.y})`}
                filter={isSelected ? 'url(#huff-glow-selected)' : isMerged ? 'url(#huff-glow-merged)' : undefined}
              >
                <circle
                  cx={0}
                  cy={0}
                  r={18}
                  className={`huff-internal-circle ${isSelected ? 'highlight-min' : ''} ${isMerged ? 'highlight-merge' : ''}`}
                />
                {isMerged && (
                  <text x={0} y={-22} className="huff-badge-merge-text" textAnchor="middle">
                    + Nuevo Padre
                  </text>
                )}
                {isSelected && (
                  <text x={0} y={-22} className="huff-badge-text" textAnchor="middle">
                    {isMin1 ? 'Min 1' : 'Min 2'}
                  </text>
                )}
                <text x={0} y={5} className="huff-internal-freq" textAnchor="middle">
                  {node.freq}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};
