import React, { useState, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  exportPortfolioData,
  exportPortfolioMarkdown,
  triggerDownload
} from '../utils/portfolioExportImport';
import './PortfolioModal.css';

interface PortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'portfolio' | 'shortcuts';
}

export const PortfolioModal: React.FC<PortfolioModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'shortcuts'
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'shortcuts'>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [isOpen, initialTab]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const pkg = exportPortfolioData();

  const handleDownloadJson = () => {
    const jsonStr = JSON.stringify(pkg, null, 2);
    const dateStr = new Date().toISOString().split('T')[0];
    triggerDownload(jsonStr, `visual-tda-portfolio-${dateStr}.json`, 'application/json');
  };

  const handleDownloadMarkdown = () => {
    const mdStr = exportPortfolioMarkdown(language);
    const dateStr = new Date().toISOString().split('T')[0];
    triggerDownload(mdStr, `visual-tda-soluciones-${dateStr}.md`, 'text/markdown');
  };

  return (
    <div className="portfolio-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="portfolio-modal-card"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="portfolio-modal-title"
      >
        <div className="portfolio-modal-header">
          <div className="portfolio-modal-title-wrap">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--accent)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M6 6h10" />
              <path d="M6 10h10" />
            </svg>
            <h3 id="portfolio-modal-title" className="portfolio-modal-title">
              {language === 'es'
                ? 'Portafolio Académico y Productividad'
                : 'Academic Portfolio & Productivity'}
            </h3>
          </div>
          <button
            type="button"
            className="portfolio-close-btn"
            onClick={onClose}
            aria-label={language === 'es' ? 'Cerrar modal' : 'Close modal'}
          >
            ✕
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="portfolio-tabs-bar" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'shortcuts'}
            className={`portfolio-tab-btn ${activeTab === 'shortcuts' ? 'active' : ''}`}
            onClick={() => setActiveTab('shortcuts')}
          >
            {language === 'es' ? 'Atajos de Teclado' : 'Keyboard Shortcuts'}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'portfolio'}
            className={`portfolio-tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            {language === 'es' ? 'Exportar Trabajo' : 'Export Work'}
          </button>
        </div>

        <div className="portfolio-modal-body">
          {activeTab === 'shortcuts' ? (
            <div className="shortcuts-content-section">
              <p className="shortcuts-lead">
                {language === 'es'
                  ? 'Acelerá tu flujo de estudio e investigación con estos atajos globales disponibles en la plataforma:'
                  : 'Boost your algorithm study workflow with global platform shortcuts:'}
              </p>

              <div className="shortcuts-table-wrap">
                <table className="shortcuts-table">
                  <thead>
                    <tr>
                      <th>{language === 'es' ? 'Atajo' : 'Shortcut'}</th>
                      <th>{language === 'es' ? 'Acción' : 'Action'}</th>
                      <th>{language === 'es' ? 'Contexto' : 'Context'}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><kbd>Ctrl</kbd> + <kbd>K</kbd></td>
                      <td>{language === 'es' ? 'Búsqueda rápida de ejercicios' : 'Quick exercise search'}</td>
                      <td>{language === 'es' ? 'Global' : 'Global'}</td>
                    </tr>
                    <tr>
                      <td><kbd>Ctrl</kbd> + <kbd>Enter</kbd></td>
                      <td>{language === 'es' ? 'Ejecutar pruebas en Python (Pyodide / TS)' : 'Run Python tests (Pyodide / TS)'}</td>
                      <td>{language === 'es' ? 'Fase Resolver' : 'Solve Phase'}</td>
                    </tr>
                    <tr>
                      <td><kbd>{language === 'es' ? 'Espacio' : 'Space'}</kbd></td>
                      <td>{language === 'es' ? 'Reproducir / Pausar traza algorítmica' : 'Play / Pause algorithm trace'}</td>
                      <td>{language === 'es' ? 'Fase Comprender' : 'Understand Phase'}</td>
                    </tr>
                    <tr>
                      <td><kbd>→</kbd> / <kbd>←</kbd></td>
                      <td>{language === 'es' ? 'Paso siguiente / anterior en la línea de tiempo' : 'Step forward / backward in timeline'}</td>
                      <td>{language === 'es' ? 'Fase Comprender' : 'Understand Phase'}</td>
                    </tr>
                    <tr>
                      <td><kbd>R</kbd></td>
                      <td>{language === 'es' ? 'Reiniciar traza al paso inicial' : 'Reset trace to initial step'}</td>
                      <td>{language === 'es' ? 'Fase Comprender' : 'Understand Phase'}</td>
                    </tr>
                    <tr>
                      <td><kbd>Home</kbd> / <kbd>End</kbd></td>
                      <td>{language === 'es' ? 'Saltar al inicio / fin de la traza' : 'Jump to start / end of trace'}</td>
                      <td>{language === 'es' ? 'Fase Comprender' : 'Understand Phase'}</td>
                    </tr>
                    <tr>
                      <td><kbd>?</kbd></td>
                      <td>{language === 'es' ? 'Abrir este menú de atajos de teclado' : 'Open keyboard shortcuts menu'}</td>
                      <td>{language === 'es' ? 'Global' : 'Global'}</td>
                    </tr>
                    <tr>
                      <td><kbd>Esc</kbd></td>
                      <td>{language === 'es' ? 'Cerrar ventanas y modales' : 'Close modals and windows'}</td>
                      <td>{language === 'es' ? 'Global' : 'Global'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="portfolio-content-section">
              {/* Summary Stats */}
              <div className="portfolio-stats-grid">
                <div className="portfolio-stat-box">
                  <span className="p-stat-value">{pkg.summary.completedCount}</span>
                  <span className="p-stat-label">
                    {language === 'es' ? 'Ejercicios Completados' : 'Completed Exercises'}
                  </span>
                </div>
                <div className="portfolio-stat-box">
                  <span className="p-stat-value">{pkg.summary.attemptsCount}</span>
                  <span className="p-stat-label">
                    {language === 'es' ? 'Intentos Registrados' : 'Recorded Attempts'}
                  </span>
                </div>
                <div className="portfolio-stat-box">
                  <span className="p-stat-value">{pkg.summary.totalMeaningfulLines}</span>
                  <span className="p-stat-label">
                    {language === 'es' ? 'Líneas Significativas' : 'Meaningful Lines'}
                  </span>
                </div>
                <div className="portfolio-stat-box">
                  <span className="p-stat-value">
                    {Object.keys(pkg.approvedSolutions).length}
                  </span>
                  <span className="p-stat-label">
                    {language === 'es' ? 'Soluciones Aprobadas' : 'Approved Solutions'}
                  </span>
                </div>
              </div>

              {/* Export Actions */}
              <div className="portfolio-action-card">
                <h4>{language === 'es' ? 'Exportar Portafolio Personal' : 'Export Personal Portfolio'}</h4>
                <p>
                  {language === 'es'
                    ? 'Descargá un reporte consolidado en Markdown con tus soluciones en Python para respaldar tu código o presentarlo en clase.'
                    : 'Download a consolidated Markdown report with your Python solutions to archive your work or submit for coursework.'}
                </p>
                <div className="portfolio-btn-row">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleDownloadMarkdown}
                  >
                    {language === 'es' ? 'Exportar Reporte Markdown' : 'Export Markdown Report'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleDownloadJson}
                  >
                    {language === 'es' ? 'Descargar Copia JSON' : 'Download JSON Backup'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
