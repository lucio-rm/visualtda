import React, { useState } from 'react';
import { formatMathFormula } from '../utils/mathTypography';
import './InvariantInspectorCallout.css';

interface InvariantInspectorCalloutProps {
  title?: { es: string; en: string };
  invariantFormula: string;
  explanation: { es: string; en: string };
  currentStep: number;
  totalSteps: number;
  language?: 'es' | 'en';
}

export const InvariantInspectorCallout: React.FC<InvariantInspectorCalloutProps> = ({
  title,
  invariantFormula,
  explanation,
  currentStep,
  totalSteps,
  language = 'es'
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const isEs = language === 'es';

  const defaultTitle = isEs ? 'Invariante de Bucle Formal' : 'Formal Loop Invariant';
  const displayTitle = title ? title[language] : defaultTitle;
  const formattedFormula = formatMathFormula(invariantFormula);

  return (
    <div className={`invariant-callout-box ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="invariant-callout-header">
        <div className="invariant-header-left">
          <span className="invariant-sparkle-icon" aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18L3 3v18z" />
              <path d="M9 21v-4" />
              <path d="M13 21v-2" />
              <path d="M17 21v-4" />
              <path d="M3 9h4" />
              <path d="M3 13h2" />
              <path d="M3 17h4" />
            </svg>
          </span>
          <span className="invariant-title">{displayTitle}</span>
          <span className="invariant-step-pill">
            {isEs ? `Paso ${currentStep + 1} de ${totalSteps}` : `Step ${currentStep + 1} of ${totalSteps}`}
          </span>
        </div>
        <button
          type="button"
          className="invariant-toggle-btn"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-expanded={!isCollapsed}
          aria-label={isCollapsed ? (isEs ? 'Expandir invariante' : 'Expand invariant') : (isEs ? 'Colapsar invariante' : 'Collapse invariant')}
        >
          {isCollapsed ? '+' : '−'}
        </button>
      </div>

      {!isCollapsed && (
        <div className="invariant-callout-body">
          <div className="invariant-formula-display">
            <code>{formattedFormula}</code>
          </div>
          <p className="invariant-explanation">{explanation[language]}</p>
        </div>
      )}
    </div>
  );
};
