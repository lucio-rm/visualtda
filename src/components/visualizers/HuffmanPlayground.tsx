import React, { useState, useMemo } from 'react';
import {
  generateHuffmanCodes,
  computeHuffmanCost
} from '../../engine/algorithms/huffmanValidator';
import { useLanguage } from '../../i18n/LanguageContext';
import './HuffmanPlayground.css';

const DEFAULT_TEXT = 'ALGORITMOS Y ESTRUCTURAS DE DATOS';

export const HuffmanPlayground: React.FC = () => {
  const { language } = useLanguage();
  const [text, setText] = useState<string>(DEFAULT_TEXT);

  // Frequency analysis
  const frequencies = useMemo(() => {
    const freqs: Record<string, number> = {};
    for (const char of text) {
      freqs[char] = (freqs[char] || 0) + 1;
    }
    return freqs;
  }, [text]);

  const codes = useMemo(() => {
    return generateHuffmanCodes(frequencies);
  }, [frequencies]);

  const totalChars = text.length;
  const uniqueChars = Object.keys(frequencies).length;
  const fixedBits = totalChars * 8; // 8-bit ASCII
  const huffmanBits = computeHuffmanCost(frequencies, codes);
  const savings = fixedBits > 0 ? Math.round(((fixedBits - huffmanBits) / fixedBits) * 100) : 0;
  const avgBitsPerChar = totalChars > 0 ? (huffmanBits / totalChars).toFixed(2) : '0';

  return (
    <div className="huffman-playground">
      <div className="huff-pg-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div className="huff-pg-title">
              {language === 'es'
                ? 'Laboratorio Interactivo de Compresión Huffman'
                : 'Interactive Huffman Compression Sandbox'}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>
              {language === 'es'
                ? 'Escribe cualquier frase para calcular frecuencias y comprimirla en tiempo real.'
                : 'Type any phrase to compute frequencies and compress it in real time.'}
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
            <button className="huff-pg-btn" onClick={() => setText('ROMERO TARDOS KLEINBERG')}>
              ROMERO TARDOS KLEINBERG
            </button>
          </div>
        </div>

        {/* Text Area */}
        <textarea
          className="huff-pg-input"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={language === 'es' ? 'Ingresa texto aquí...' : 'Enter text here...'}
        />

        {/* Metrics Grid */}
        <div className="huff-pg-metrics-grid">
          <div className="huff-pg-metric">
            <span className="huff-pg-metric-label">
              {language === 'es' ? 'Caracteres Totales' : 'Total Characters'}
            </span>
            <span className="huff-pg-metric-val">{totalChars}</span>
            <span className="huff-pg-metric-desc">
              {uniqueChars} {language === 'es' ? 'símbolos distintos' : 'distinct symbols'}
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
              {language === 'es' ? 'Ahorro / Tasa' : 'Savings / Rate'}
            </span>
            <span className="huff-pg-metric-val green">
              {savings}%
            </span>
            <span className="huff-pg-metric-desc">
              {avgBitsPerChar} {language === 'es' ? 'bits/carácter' : 'bits/char'}
            </span>
          </div>
        </div>

        {/* Encoded Bitstream Tokens */}
        <div className="huff-stream-box">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-light, #60a5fa)' }}>
            {language === 'es' ? 'Flujo Binario Segmentado (Bitstream Decodificable):' : 'Segmented Bitstream (Uniquely Decodable):'}
          </div>
          <div className="huff-stream-tokens">
            {text.split('').map((c, idx) => (
              <span key={idx} className="huff-stream-token">
                <span className="token-char">{c === ' ' ? '␣' : c}</span>
                <span className="token-bits">{codes[c] ?? '?'}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
