import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useStudentProgress } from '../../context/StudentProgressContext';
import { HuffmanTreeSvg } from './HuffmanTreeSvg';
import { HuffmanTraceItem } from '../../engine/algorithms/huffmanTrace';
import './HuffmanPlayground.css';

const DEFAULT_TEXT = 'ABRACADABRA';

export const HuffmanPlayground: React.FC = () => {
  const { language } = useLanguage();
  const { markAttempted } = useStudentProgress();
  const [text, setText] = useState<string>(DEFAULT_TEXT);

  // Active forest for step-by-step interactive tree construction
  const [forestRoots, setForestRoots] = useState<string[]>([]);
  const [allNodes, setAllNodes] = useState<Record<string, HuffmanTraceItem>>({});
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [greedyError, setGreedyError] = useState<string | null>(null);
  const [constructedCodes, setConstructedCodes] = useState<Record<string, string>>({});
  const [justMergedId, setJustMergedId] = useState<string | null>(null);

  // Character frequency analysis
  const frequencies = useMemo(() => {
    const freqs: Record<string, number> = {};
    for (const char of text) {
      freqs[char] = (freqs[char] || 0) + 1;
    }
    return freqs;
  }, [text]);

  const uniqueChars = Object.keys(frequencies);

  // Initialize or reset the interactive construction forest whenever text or reset is triggered
  const initializeForest = () => {
    const initialNodes: Record<string, HuffmanTraceItem> = {};
    const roots: string[] = [];

    // Sort characters by frequency ascending, then alphabetical
    const sortedChars = [...uniqueChars].sort((a, b) => {
      const diff = frequencies[a] - frequencies[b];
      return diff !== 0 ? diff : a.localeCompare(b);
    });

    sortedChars.forEach((char, idx) => {
      const id = `leaf_${char}_${idx}`;
      initialNodes[id] = {
        id,
        char,
        freq: frequencies[char],
        leftId: undefined,
        rightId: undefined
      };
      roots.push(id);
    });

    setAllNodes(initialNodes);
    setForestRoots(roots);
    setSelectedNodeIds([]);
    setGreedyError(null);
    setConstructedCodes({});
    setJustMergedId(null);
  };

  useEffect(() => {
    if (uniqueChars.length > 0) {
      initializeForest();
    }
  }, [text]);

  // Derive prefix codes from tree when construction finishes (only 1 root left)
  useEffect(() => {
    if (forestRoots.length === 1 && uniqueChars.length > 1) {
      const rootId = forestRoots[0];
      const codes: Record<string, string> = {};

      const traverse = (nodeId: string, currentPath: string) => {
        const node = allNodes[nodeId];
        if (!node) return;
        if (node.char !== null) {
          codes[node.char] = currentPath.length > 0 ? currentPath : '0';
          return;
        }
        if (node.leftId) traverse(node.leftId, currentPath + '0');
        if (node.rightId) traverse(node.rightId, currentPath + '1');
      };

      traverse(rootId, '');
      setConstructedCodes(codes);
      markAttempted('huffman-coding-greedy');
    }
  }, [forestRoots, allNodes]);

  // Find the two nodes with the lowest frequencies currently in forestRoots
  const currentLowestIds = useMemo(() => {
    if (forestRoots.length < 2) return [];
    const sorted = [...forestRoots].sort((a, b) => {
      const freqA = allNodes[a]?.freq ?? 0;
      const freqB = allNodes[b]?.freq ?? 0;
      return freqA - freqB;
    });
    return [sorted[0], sorted[1]];
  }, [forestRoots, allNodes]);

  // Handle clicking on an active root node to select/deselect
  const handleToggleSelect = (nodeId: string) => {
    setGreedyError(null);
    if (selectedNodeIds.includes(nodeId)) {
      setSelectedNodeIds(selectedNodeIds.filter((id) => id !== nodeId));
    } else {
      if (selectedNodeIds.length >= 2) {
        setSelectedNodeIds([selectedNodeIds[1], nodeId]);
      } else {
        setSelectedNodeIds([...selectedNodeIds, nodeId]);
      }
    }
  };

  // Perform greedy merge of selected nodes
  const handleMergeSelected = () => {
    if (selectedNodeIds.length !== 2) return;
    const [idA, idB] = selectedNodeIds;
    const nodeA = allNodes[idA];
    const nodeB = allNodes[idB];
    if (!nodeA || !nodeB) return;

    // Check if the selected pair matches the minimum frequency rule
    const minFreq1 = allNodes[currentLowestIds[0]]?.freq ?? 0;
    const minFreq2 = allNodes[currentLowestIds[1]]?.freq ?? 0;
    const chosenMin = Math.min(nodeA.freq, nodeB.freq);
    const chosenMax = Math.max(nodeA.freq, nodeB.freq);

    const isGreedyValid =
      (chosenMin === minFreq1 && chosenMax === minFreq2) ||
      (chosenMin === minFreq2 && chosenMax === minFreq1) ||
      nodeA.freq + nodeB.freq <= minFreq1 + minFreq2;

    if (!isGreedyValid) {
      setGreedyError(
        language === 'es'
          ? `Desvío de la Propiedad Greedy: Has seleccionado nodos con frecuencias (${nodeA.freq} y ${nodeB.freq}). En el algoritmo de Huffman, la regla irrevocable exige combinar siempre los DOS árboles con menor frecuencia acumulada (${minFreq1} y ${minFreq2}) para garantizar la minimalidad de la longitud media esperada.`
          : `Greedy Invariant Violation: You selected nodes with weights (${nodeA.freq} and ${nodeB.freq}). Huffman's algorithm requires merging the TWO nodes with lowest cumulative weight (${minFreq1} and ${minFreq2}) to ensure prefix-code optimality.`
      );
      return;
    }

    // Assign left = lower freq, right = higher freq
    const leftId = nodeA.freq <= nodeB.freq ? idA : idB;
    const rightId = nodeA.freq <= nodeB.freq ? idB : idA;
    const parentId = `parent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newFreq = nodeA.freq + nodeB.freq;

    const newParent: HuffmanTraceItem = {
      id: parentId,
      char: null,
      freq: newFreq,
      leftId,
      rightId
    };

    setAllNodes((prev) => ({
      ...prev,
      [parentId]: newParent
    }));

    setForestRoots((prev) => {
      const remaining = prev.filter((id) => id !== idA && id !== idB);
      return [...remaining, parentId];
    });

    setSelectedNodeIds([]);
    setGreedyError(null);
    setJustMergedId(parentId);
  };

  // Auto-execute one optimal greedy step (for learning assistance)
  const handleAutoStep = () => {
    if (forestRoots.length < 2) return;
    const [idA, idB] = currentLowestIds;
    setSelectedNodeIds([idA, idB]);
    setGreedyError(null);

    const nodeA = allNodes[idA];
    const nodeB = allNodes[idB];
    if (!nodeA || !nodeB) return;

    const leftId = nodeA.freq <= nodeB.freq ? idA : idB;
    const rightId = nodeA.freq <= nodeB.freq ? idB : idA;
    const parentId = `parent_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const newFreq = nodeA.freq + nodeB.freq;

    const newParent: HuffmanTraceItem = {
      id: parentId,
      char: null,
      freq: newFreq,
      leftId,
      rightId
    };

    setAllNodes((prev) => ({
      ...prev,
      [parentId]: newParent
    }));

    setForestRoots((prev) => {
      const remaining = prev.filter((id) => id !== idA && id !== idB);
      return [...remaining, parentId];
    });

    setSelectedNodeIds([]);
    setJustMergedId(parentId);
  };

  const isCompletedNow = forestRoots.length === 1 && uniqueChars.length > 1;
  const totalChars = text.length;
  const fixedBits = totalChars * 8; // 8-bit ASCII
  let huffmanBits = 0;
  if (isCompletedNow) {
    for (const char of text) {
      if (constructedCodes[char]) {
        huffmanBits += constructedCodes[char].length;
      }
    }
  }

  const savings = fixedBits > 0 && huffmanBits > 0 ? Math.round(((fixedBits - huffmanBits) / fixedBits) * 100) : 0;
  const avgBitsPerChar = totalChars > 0 && huffmanBits > 0 ? (huffmanBits / totalChars).toFixed(2) : '0';

  return (
    <div className="huffman-playground">
      <div className="huff-pg-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div className="huff-pg-title">
              {language === 'es'
                ? 'Laboratorio Interactivo: Construcción de Árbol de Huffman'
                : 'Interactive Huffman Tree Construction Sandbox'}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)' }}>
              {language === 'es'
                ? 'Ingresá cualquier texto y construí vos mismo el árbol binario seleccionando los dos nodos de menor frecuencia.'
                : 'Enter any text and construct the binary tree yourself by selecting the two lowest-frequency nodes.'}
            </div>
          </div>

          <div className="huff-pg-presets">
            <button className="huff-pg-btn" onClick={() => setText('ABRACADABRA')}>
              ABRACADABRA
            </button>
            <button className="huff-pg-btn" onClick={() => setText('ALGORITMOS')}>
              ALGORITMOS
            </button>
            <button className="huff-pg-btn" onClick={() => setText('ESTRUCTURAS DE DATOS')}>
              ESTRUCTURAS DE DATOS
            </button>
            <button className="huff-pg-btn" onClick={() => setText('FIUBA TDA')}>
              FIUBA TDA
            </button>
          </div>
        </div>

        {/* Custom Text Area */}
        <div className="huff-input-container">
          <label htmlFor="huff-custom-text-input" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            {language === 'es' ? 'Texto personalizado a comprimir:' : 'Custom text to compress:'}
          </label>
          <textarea
            id="huff-custom-text-input"
            className="huff-pg-input"
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value.toUpperCase())}
            placeholder={language === 'es' ? 'Ingresá cualquier texto...' : 'Enter any text...'}
          />
        </div>

        {/* Status & Instructions */}
        <div className="huff-instruction-banner">
          {isCompletedNow ? (
            <div className="huff-success-box">
              <span className="huff-success-icon">✓</span>
              <div>
                <strong>
                  {language === 'es' ? 'Árbol de Huffman construido correctamente' : 'Huffman tree constructed correctly'}
                </strong>
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>
                  {language === 'es'
                    ? 'Has fusionado sistemáticamente todos los nodos respetando la regla Greedy. El árbol resultante garantiza un código de prefijo óptimo y libre de ambigüedad.'
                    : 'You systematically merged all nodes following the Greedy rule. The resulting prefix-free code is provably optimal.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="huff-pending-box">
              <span>
                {language === 'es'
                  ? `Bosque activo: ${forestRoots.length} árboles restantes. Seleccioná los 2 árboles con menor frecuencia para fusionarlos.`
                  : `Active forest: ${forestRoots.length} trees remaining. Select the 2 trees with lowest frequency to merge.`}
              </span>
            </div>
          )}
        </div>

        {greedyError && (
          <div className="huff-greedy-error" role="alert">
            {greedyError}
          </div>
        )}

        {/* Interactive Forest Selection Bar */}
        <div className="huff-forest-selection-card">
          <div className="huff-forest-header">
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)' }}>
              {language === 'es' ? 'Nodos / Raíces del Bosque Activo:' : 'Active Forest Nodes / Roots:'}
            </span>
            <div className="huff-forest-actions">
              <button
                type="button"
                className="btn-huff-merge"
                disabled={selectedNodeIds.length !== 2 || isCompletedNow}
                onClick={handleMergeSelected}
              >
                {language === 'es' ? 'Fusionar 2 Nodos Seleccionados (Merge)' : 'Merge 2 Selected Nodes'}
              </button>
              <button
                type="button"
                className="btn-huff-step"
                disabled={forestRoots.length < 2}
                onClick={handleAutoStep}
                title="Avanzar automáticamente un paso Greedy óptimo"
              >
                {language === 'es' ? 'Paso Greedy Óptimo' : 'Optimal Greedy Step'}
              </button>
              <button
                type="button"
                className="btn-huff-reset"
                onClick={initializeForest}
              >
                {language === 'es' ? 'Reiniciar Árbol' : 'Reset Tree'}
              </button>
            </div>
          </div>

          <div className="huff-nodes-pill-row">
            {forestRoots.map((id) => {
              const node = allNodes[id];
              if (!node) return null;
              const isSelected = selectedNodeIds.includes(id);
              const isMinCandidate = currentLowestIds.includes(id);
              const label = node.char !== null ? `'${node.char === ' ' ? '␣' : node.char}'` : `[Subárbol]`;

              return (
                <button
                  key={id}
                  type="button"
                  className={`huff-node-pill ${isSelected ? 'selected' : ''} ${isMinCandidate ? 'is-min' : ''}`}
                  onClick={() => handleToggleSelect(id)}
                  title={`Frecuencia: ${node.freq}`}
                >
                  <span className="pill-label">{label}</span>
                  <span className="pill-freq">f={node.freq}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic SVG Tree Rendering */}
        <div className="huff-svg-wrapper">
          <HuffmanTreeSvg
            forestRoots={forestRoots}
            allNodes={allNodes}
            selectedIds={selectedNodeIds.length === 2 ? [selectedNodeIds[0], selectedNodeIds[1]] : null}
            mergedParentId={justMergedId}
            codes={constructedCodes}
            language={language}
          />
        </div>

        {/* Post-Completion Metrics & Codes */}
        {isCompletedNow && (
          <>
            <div className="huff-pg-metrics-grid">
              <div className="huff-pg-metric">
                <span className="huff-pg-metric-label">
                  {language === 'es' ? 'Caracteres Totales' : 'Total Characters'}
                </span>
                <span className="huff-pg-metric-val">{totalChars}</span>
                <span className="huff-pg-metric-desc">
                  {uniqueChars.length} {language === 'es' ? 'símbolos distintos' : 'distinct symbols'}
                </span>
              </div>

              <div className="huff-pg-metric">
                <span className="huff-pg-metric-label">
                  {language === 'es' ? 'Original ASCII (8 bits)' : 'Original ASCII (8 bits)'}
                </span>
                <span className="huff-pg-metric-val">{fixedBits} b</span>
                <span className="huff-pg-metric-desc">
                  {Math.ceil(fixedBits / 8)} {language === 'es' ? 'bytes' : 'bytes'}
                </span>
              </div>

              <div className="huff-pg-metric">
                <span className="huff-pg-metric-label">
                  {language === 'es' ? 'Comprimido Huffman' : 'Huffman Compressed'}
                </span>
                <span className="huff-pg-metric-val green">{huffmanBits} b</span>
                <span className="huff-pg-metric-desc">
                  {Math.ceil(huffmanBits / 8)} {language === 'es' ? 'bytes' : 'bytes'}
                </span>
              </div>

              <div className="huff-pg-metric">
                <span className="huff-pg-metric-label">
                  {language === 'es' ? 'Ahorro Obtenido' : 'Savings Achieved'}
                </span>
                <span className="huff-pg-metric-val green">{savings}%</span>
                <span className="huff-pg-metric-desc">
                  {avgBitsPerChar} {language === 'es' ? 'bits/carácter' : 'bits/char'}
                </span>
              </div>
            </div>

            {/* Generated Codes Table */}
            <div className="huff-codes-table-card">
              <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', color: 'var(--text)' }}>
                {language === 'es' ? 'Tabla de Códigos de Prefijo Generada:' : 'Generated Prefix Code Table:'}
              </h4>
              <div className="huff-codes-grid">
                {Object.entries(constructedCodes).map(([char, code]) => (
                  <div key={char} className="huff-code-badge">
                    <span className="huff-char-pill">{char === ' ' ? '␣ (Espacio)' : char}</span>
                    <span className="huff-bits-mono">{code}</span>
                    <span className="huff-len-tag">{code.length} {language === 'es' ? 'bits' : 'bits'}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Encoded Bitstream */}
            <div className="huff-stream-box">
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-light, #60a5fa)' }}>
                {language === 'es' ? 'Flujo Binario Codificado (Bitstream Resultante):' : 'Encoded Bitstream:'}
              </div>
              <div className="huff-stream-tokens">
                {text.split('').map((c, idx) => (
                  <span key={idx} className="huff-stream-token">
                    <span className="token-char">{c === ' ' ? '␣' : c}</span>
                    <span className="token-bits">{constructedCodes[c] ?? '?'}</span>
                  </span>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
