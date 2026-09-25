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
  interactive?: boolean;
}

// Consistent color palette for knapsack items
const ITEM_PALETTE = [
  { bg: 'rgba(16, 185, 129, 0.15)', border: '#10b981', text: '#059669', badge: '#10b981' }, // Emerald
  { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#d97706', badge: '#f59e0b' }, // Amber
  { bg: 'rgba(2, 132, 199, 0.15)', border: '#0284c7', text: '#0284c7', badge: '#0284c7' }, // Sky
  { bg: 'rgba(139, 92, 246, 0.15)', border: '#8b5cf6', text: '#7c3aed', badge: '#8b5cf6' }, // Violet
  { bg: 'rgba(244, 63, 94, 0.15)', border: '#f43f5e', text: '#e11d48', badge: '#f43f5e' }, // Rose
  { bg: 'rgba(6, 182, 212, 0.15)', border: '#06b6d4', text: '#0891b2', badge: '#06b6d4' }, // Cyan
  { bg: 'rgba(234, 88, 12, 0.15)', border: '#ea580c', text: '#c2410c', badge: '#ea580c' }, // Orange
  { bg: 'rgba(99, 102, 241, 0.15)', border: '#6366f1', text: '#4f46e5', badge: '#6366f1' }  // Indigo
];

export const KnapsackVisualBag: React.FC<KnapsackVisualBagProps> = ({
  capacity,
  items,
  selectedItemIds,
  totalWeight,
  totalValue,
  language,
  onUnpackItem,
  interactive = false
}) => {
  const isOverweight = totalWeight > capacity;
  const slackCapacity = Math.max(0, capacity - totalWeight);
  const overflowWeight = Math.max(0, totalWeight - capacity);

  const packedItems = items.filter((it) => selectedItemIds.includes(it.id));

  return (
    <div className={`knapsack-bag-container ${isOverweight ? 'overweight' : ''}`} role="region" aria-label={language === 'es' ? 'Representación visual de la mochila' : 'Visual knapsack model'}>
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
              {language === 'es' ? 'Valor Total:' : 'Total Value:'}
            </span>
            <span className="bag-total-value">
              ${Number.isInteger(totalValue) ? totalValue : totalValue.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Overflow Alert Header if items exceed capacity */}
        {isOverweight && (
          <div className="bag-overflow-banner" role="alert">
            <span className="overflow-warning-icon">⚠️</span>
            <span>
              {language === 'es'
                ? `¡Desborde! Excedido por +${overflowWeight.toFixed(1).replace(/\.0$/, '')} kg (No Factible)`
                : `Overflow! Exceeded by +${overflowWeight.toFixed(1).replace(/\.0$/, '')} kg (Infeasible)`}
            </span>
          </div>
        )}

        {/* Internal Cargo Compartment with Physical Blocks */}
        <div className="bag-cargo-compartment">
          {packedItems.length === 0 ? (
            <div className="bag-empty-state">
              <span className="bag-empty-icon" aria-hidden="true">🎒</span>
              <p>
                {language === 'es'
                  ? 'Mochila vacía (0 kg empacados). Seleccioná objetos para empacarlos.'
                  : 'Knapsack is empty (0 kg packed). Select items to pack them.'}
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
                    style={{
                      backgroundColor: colorDef.bg,
                      borderColor: colorDef.border,
                      flexGrow: Math.max(0.5, effectiveWeight),
                      minHeight: `${Math.max(48, effectiveWeight * 20)}px`
                    }}
                    role="group"
                    aria-label={`${item.name}, ${effectiveWeight.toFixed(1)} kg, $${effectiveValue.toFixed(1)}`}
                  >
                    <div className="item-block-main">
                      <div className="item-block-title-row">
                        <span className="item-block-color-dot" style={{ backgroundColor: colorDef.badge }} />
                        <span className="item-block-name" style={{ color: colorDef.text }}>
                          {item.name}
                        </span>
                        {isFractional && (
                          <span style={{ fontSize: '0.72rem', padding: '0.1rem 0.45rem', borderRadius: '4px', background: 'var(--accent, #0284c7)', color: '#fff', fontWeight: 700 }}>
                            {Math.round((visualItem.fractionTaken ?? 0) * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="item-block-metrics">
                        <span className="metric-chip">
                          <strong>
                            {isFractional
                              ? `${effectiveWeight.toFixed(1)} / ${item.weight} kg`
                              : `${item.weight} kg`}
                          </strong>
                        </span>
                        <span className="metric-chip">
                          <strong>
                            {isFractional
                              ? `$${effectiveValue.toFixed(1)} / $${item.value}`
                              : `$${item.value}`}
                          </strong>
                        </span>
                        <span className="metric-density">
                          {density} $/kg
                        </span>
                      </div>
                    </div>

                    {interactive && onUnpackItem && (
                      <button
                        type="button"
                        className="btn-unpack-item"
                        onClick={() => onUnpackItem(item.id)}
                        aria-label={language === 'es' ? `Desempacar ${item.name}` : `Unpack ${item.name}`}
                        title={language === 'es' ? 'Quitar de la mochila' : 'Remove from knapsack'}
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
                  style={{ flexGrow: Math.max(0.5, slackCapacity), minHeight: `${Math.max(36, slackCapacity * 16)}px` }}
                >
                  <span className="slack-text">
                    {language === 'es'
                      ? `Holgura libre disponible: ${slackCapacity.toFixed(1).replace(/\.0$/, '')} kg de ${capacity} kg`
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
            <span>
              {language === 'es' ? 'Ocupación de peso:' : 'Weight occupancy:'}{' '}
              <strong>{Number.isInteger(totalWeight) ? totalWeight : totalWeight.toFixed(1)} kg / {capacity} kg</strong>
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
