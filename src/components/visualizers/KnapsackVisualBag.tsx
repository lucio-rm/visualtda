import React from 'react';
import { KnapsackItem } from '../../engine/algorithms/knapsackDpValidator';
import './KnapsackVisualBag.css';

export interface KnapsackVisualItem extends KnapsackItem {
  fractionTaken?: number;
  weightTaken?: number;
  valueTaken?: number;
}

interface KnapsackVisualBagProps {
  capacity: number;
  items: (KnapsackItem | KnapsackVisualItem)[];
  selectedItemIds: string[];
  totalWeight: number;
  totalValue: number;
  language: 'es' | 'en';
  onUnpackItem?: (id: string) => void;
  onPackItem?: (id: string) => void;
  interactive?: boolean;
}

// Consistent color palette for knapsack items
const ITEM_PALETTE = [
  { bg: 'var(--state-solution-bg)', border: 'var(--success)', text: 'var(--text)', badge: 'var(--success)' }, // Emerald
  { bg: 'var(--state-candidate-bg)', border: 'var(--warning)', text: 'var(--text)', badge: 'var(--warning)' }, // Amber
  { bg: 'rgba(2, 132, 199, 0.12)', border: '#0284c7', text: 'var(--text)', badge: '#0284c7' }, // Sky
  { bg: 'rgba(13, 148, 136, 0.12)', border: '#0d9488', text: 'var(--text)', badge: '#0d9488' }, // Teal
  { bg: 'rgba(244, 63, 94, 0.12)', border: '#f43f5e', text: 'var(--text)', badge: '#f43f5e' }, // Rose
  { bg: 'rgba(6, 182, 212, 0.12)', border: '#06b6d4', text: 'var(--text)', badge: '#06b6d4' }, // Cyan
  { bg: 'rgba(234, 88, 12, 0.12)', border: '#ea580c', text: 'var(--text)', badge: '#ea580c' }, // Orange
];

function localizeItemName(name: string, lang: 'es' | 'en'): string {
  if (lang === 'es') return name;
  return name
    .replace(/Oro en polvo/g, 'Gold dust')
    .replace(/Plata en polvo/g, 'Silver dust')
    .replace(/Cobre en polvo/g, 'Copper dust')
    .replace(/Oro/g, 'Gold')
    .replace(/Plata/g, 'Silver')
    .replace(/Cobre/g, 'Copper')
    .replace(/Guitarra/g, 'Guitar')
    .replace(/Celular/g, 'Phone')
    .replace(/Cámara/g, 'Camera')
    .replace(/Libro/g, 'Book')
    .replace(/Linterna/g, 'Flashlight')
    .replace(/Notebook/g, 'Laptop')
    .replace(/Tablet/g, 'Tablet')
    .replace(/Ítem/g, 'Item')
    .replace(/Objeto/g, 'Item')
    .replace(/Alta Densidad/g, 'High Density')
    .replace(/Gran Rendimiento/g, 'High Yield');
}

export const KnapsackVisualBag: React.FC<KnapsackVisualBagProps> = ({
  capacity,
  items,
  selectedItemIds,
  totalWeight,
  totalValue,
  language,
  onUnpackItem,
  onPackItem,
  interactive = false
}) => {
  const [isDragOver, setIsDragOver] = React.useState(false);
  const isOverweight = totalWeight > capacity;
  const slackCapacity = Math.max(0, capacity - totalWeight);
  const overflowWeight = Math.max(0, totalWeight - capacity);

  const packedItems = items.filter((it) => selectedItemIds.includes(it.id));

  const handleDragOver = (e: React.DragEvent) => {
    if (!interactive || !onPackItem) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!interactive || !onPackItem) return;
    e.preventDefault();
    setIsDragOver(false);
    const itemId = e.dataTransfer.getData('text/plain');
    if (itemId) {
      onPackItem(itemId);
    }
  };

  return (
    <div
      className={`knapsack-bag-container ${isOverweight ? 'overweight' : ''} ${isDragOver ? 'bag-drag-over' : ''}`}
      role="region"
      aria-label={language === 'es' ? 'Representación visual de la mochila' : 'Visual knapsack model'}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Backpack Top Flap & Handle */}
      <div className="bag-top-handle" aria-hidden="true">
        <div className="bag-handle-loop" />
      </div>

      <div className="bag-main-shell">
        {/* Backpack Header with Capacity Ticks */}
        <div className="bag-shell-header">
          <div className="bag-title-col">
            <span className="bag-title-label">
              {language === 'es' ? 'Mochila de Carga' : 'Knapsack Cargo Bag'}
            </span>
            <span className="bag-capacity-badge">
              {language === 'es' ? `Capacidad Límite W = ${capacity} kg` : `Max Bound W = ${capacity} kg`}
            </span>
          </div>

          <div className="bag-value-col">
            <span className="bag-value-label">
              {language === 'es' ? 'Valor Total Acumulado:' : 'Total Accumulated Value:'}
            </span>
            <span className="bag-total-value">
              ${Number.isInteger(totalValue) ? totalValue : totalValue.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Overflow Alert Header if items exceed capacity */}
        {isOverweight && (
          <div className="bag-overflow-banner" role="alert">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: 'var(--error)' }}>
              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>
              {language === 'es'
                ? `¡Desborde! Excedido por +${overflowWeight.toFixed(1).replace(/\.0$/, '')} kg (No Factible)`
                : `Overflow! Exceeded by +${overflowWeight.toFixed(1).replace(/\.0$/, '')} kg (Infeasible)`}
            </span>
          </div>
        )}

        {isDragOver && (
          <div className="bag-drop-indicator" aria-live="polite">
            <span>
              {language === 'es' ? 'Soltá aquí para empacar en la mochila' : 'Drop here to pack into knapsack'}
            </span>
          </div>
        )}

        {/* Internal Cargo Compartment with Physical Blocks */}
        <div className="bag-cargo-compartment">
          {packedItems.length === 0 ? (
            <div className="bag-empty-state">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: 'var(--text-muted)' }}>
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
              <p>
                {language === 'es'
                  ? 'Mochila vacía (0 kg empacados). Arrastrá o hacé clic en los objetos para empacarlos.'
                  : 'Knapsack is empty (0 kg packed). Drag or click items to pack them.'}
              </p>
            </div>
          ) : (
            <div className="bag-packed-stack">
              {packedItems.map((item, idx) => {
                const colorDef = ITEM_PALETTE[idx % ITEM_PALETTE.length];
                const density = (item.value / item.weight).toFixed(1);
                const visualItem = item as KnapsackVisualItem;
                const isFractional = visualItem.fractionTaken !== undefined && visualItem.fractionTaken < 0.999;
                const effectiveWeight = visualItem.weightTaken ?? (visualItem.fractionTaken !== undefined ? visualItem.weight * visualItem.fractionTaken : item.weight);
                const effectiveValue = visualItem.valueTaken ?? (visualItem.fractionTaken !== undefined ? visualItem.value * visualItem.fractionTaken : item.value);

                return (
                  <div
                    key={item.id}
                    className="bag-item-block"
                    draggable={interactive}
                    onDragStart={(e) => {
                      if (!interactive) return;
                      e.dataTransfer.setData('text/plain', item.id);
                      e.dataTransfer.setData('source', 'bag');
                    }}
                    style={{
                      backgroundColor: colorDef.bg,
                      borderColor: colorDef.border,
                      flexGrow: Math.max(0.6, effectiveWeight),
                      minHeight: `${Math.max(52, effectiveWeight * 22)}px`
                    }}
                    role="group"
                    aria-label={`${localizeItemName(item.name, language)}, ${effectiveWeight.toFixed(1)} kg, $${effectiveValue.toFixed(1)}`}
                  >
                    <div className="item-block-main">
                      <div className="item-block-title-row">
                        <span className="item-block-color-dot" style={{ backgroundColor: colorDef.badge }} />
                        <span className="item-block-name" style={{ color: 'var(--text)', fontWeight: 600 }}>
                          {localizeItemName(item.name, language)}
                        </span>
                        {isFractional && (
                          <span style={{ fontSize: '0.8125rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'var(--accent)', color: '#fff', fontWeight: 600 }}>
                            {Math.round((visualItem.fractionTaken ?? 0) * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="item-block-metrics">
                        <span className="metric-chip" style={{ whiteSpace: 'nowrap' }}>
                          <span className="metric-label">{language === 'es' ? 'Peso:' : 'Weight:'}</span>{' '}
                          <strong style={{ whiteSpace: 'nowrap' }}>
                            {isFractional
                              ? `${effectiveWeight.toFixed(1)} / ${item.weight} kg`
                              : `${item.weight} kg`}
                          </strong>
                        </span>
                        <span className="metric-chip" style={{ whiteSpace: 'nowrap' }}>
                          <span className="metric-label">{language === 'es' ? 'Valor:' : 'Value:'}</span>{' '}
                          <strong style={{ whiteSpace: 'nowrap' }}>
                            {isFractional
                              ? `$${effectiveValue.toFixed(1)} / $${item.value}`
                              : `$${item.value}`}
                          </strong>
                        </span>
                        <span className="metric-density">
                          {density}&nbsp;$/kg
                        </span>
                      </div>
                    </div>

                    {interactive && onUnpackItem && (
                      <button
                        type="button"
                        className="btn-unpack-item"
                        onClick={() => onUnpackItem(item.id)}
                        aria-label={language === 'es' ? `Desempacar ${item.name}` : `Unpack ${item.name}`}
                        title={language === 'es' ? 'Quitar de la mochila (o arrastrá afuera)' : 'Remove from knapsack (or drag outside)'}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Slack Capacity Compartment (Remaining Free Space) */}
              {!isOverweight && slackCapacity > 0 && (
                <div
                  className="bag-slack-block"
                  style={{ flexGrow: Math.max(0.6, slackCapacity), minHeight: `${Math.max(40, slackCapacity * 18)}px` }}
                >
                  <span className="slack-text">
                    {language === 'es'
                      ? `Espacio libre disponible: ${slackCapacity.toFixed(1).replace(/\.0$/, '')} kg de ${capacity} kg`
                      : `Available slack capacity: ${slackCapacity.toFixed(1).replace(/\.0$/, '')} kg of ${capacity} kg`}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Backpack Footer Gauge */}
        <div className="bag-footer-gauge">
          <div className="gauge-text-row">
            <span style={{ whiteSpace: 'nowrap' }}>
              {language === 'es' ? 'Ocupación de peso:' : 'Weight occupancy:'}{' '}
              <strong style={{ whiteSpace: 'nowrap', marginLeft: '4px' }}>
                {Number.isInteger(totalWeight) ? totalWeight : totalWeight.toFixed(1)}&nbsp;kg / {capacity}&nbsp;kg
              </strong>
            </span>
            <span className={`gauge-status ${isOverweight ? 'status-invalid' : 'status-valid'}`}>
              {isOverweight
                ? (language === 'es' ? 'VIOLACIÓN DE CAPACIDAD' : 'CAPACITY VIOLATION')
                : (language === 'es' ? 'ESTADO FACTIBLE' : 'FEASIBLE STATE')}
            </span>
          </div>

          <div className="bag-weight-rail">
            <div
              className={`bag-weight-fill ${isOverweight ? 'fill-overweight' : ''}`}
              style={{ width: `${Math.min(100, Math.round((totalWeight / capacity) * 100))}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
