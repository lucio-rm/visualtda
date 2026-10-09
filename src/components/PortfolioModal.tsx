import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import {
  exportPortfolioData,
  exportPortfolioMarkdown,
  importPortfolioData,
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
  initialTab = 'portfolio'
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'portfolio' | 'shortcuts'>(initialTab);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
    setImportStatus({ type: null, message: '' });
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

  const handleFileProcess = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const res = importPortfolioData(content);
      if (res.success) {
        setImportStatus({
          type: 'success',
          message:
            language === 'es'
              ? `¡Portafolio restaurado exitosamente! Se sincronizaron los registros y soluciones.`
              : `Portfolio restored successfully! Synchronized records and student solutions.`
        });
      } else {
        setImportStatus({
          type: 'error',
          message:
            language === 'es'
              ? `Error al importar: ${res.error || 'Archivo inválido o corrupto.'}`
              : `Import error: ${res.error || 'Invalid or corrupted file.'}`
        });
      }
    };
    reader.onerror = () => {
      setImportStatus({
        type: 'error',
        message: language === 'es' ? 'Error al leer el archivo.' : 'Failed to read file.'
      });
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
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
            aria-selected={activeTab === 'portfolio'}
            className={`portfolio-tab-btn ${activeTab === 'portfolio' ? 'active' : ''}`}
            onClick={() => setActiveTab('portfolio')}
          >
            {language === 'es' ? 'Portafolio y Respaldo Offline' : 'Portfolio & Offline Backup'}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'shortcuts'}
            className={`portfolio-tab-btn ${activeTab === 'shortcuts' ? 'active' : ''}`}
            onClick={() => setActiveTab('shortcuts')}
          >
            {language === 'es' ? 'Atajos de Teclado' : 'Keyboard Shortcuts'}
          </button>
        </div>

        <div className="portfolio-modal-body">
          {activeTab === 'portfolio' ? (
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
                <h4>{language === 'es' ? 'Exportar Portafolio' : 'Export Portfolio'}</h4>
                <p>
                  {language === 'es'
                    ? 'Descargá una copia de seguridad en JSON para restaurar en otra máquina o un digest en Markdown con todas tus soluciones en Python listas para adjuntar.'
                    : 'Download a JSON backup to restore on another device or a Markdown digest containing your Python solutions ready for submission.'}
                </p>
                <div className="portfolio-btn-row">
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleDownloadJson}
                  >
                    💾 {language === 'es' ? 'Descargar Respaldo JSON' : 'Download JSON Backup'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleDownloadMarkdown}
                  >
                    📄 {language === 'es' ? 'Exportar Reporte Markdown' : 'Export Markdown Digest'}
                  </button>
                </div>
              </div>

              {/* Import Action */}
              <div className="portfolio-action-card">
                <h4>{language === 'es' ? 'Restaurar / Importar Respaldo' : 'Restore / Import Backup'}</h4>
                <p>
                  {language === 'es'
                    ? 'Arrastrá tu archivo JSON de portafolio o seleccionalo para sincronizar tu progreso en este navegador con total privacidad.'
                    : 'Drop your JSON portfolio backup or browse to restore progress on this browser with 100% privacy.'}
                </p>

                <div
                  className={`portfolio-drop-zone ${isDragOver ? 'drag-over' : ''}`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleFileProcess(e.target.files[0]);
                      }
                    }}
                  />
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <span>
                    {language === 'es'
                      ? 'Arrastrá aquí tu archivo .json o hacé clic para seleccionar'
                      : 'Drop .json file here or click to browse'}
                  </span>
                </div>

                {importStatus.type && (
                  <div className={`portfolio-alert ${importStatus.type}`}>
                    {importStatus.message}
                  </div>
                )}
              </div>
            </div>
          ) : (
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
                      <td><kbd>Ctrl</kbd> + <kbd>Enter</kbd></td>
                      <td>{language === 'es' ? 'Ejecutar pruebas en Python (Pyodide / TS)' : 'Run Python tests (Pyodide / TS)'}</td>
                      <td>{language === 'es' ? 'Fase Resolver' : 'Solve Phase'}</td>
                    </tr>
                    <tr>
                      <td><kbd>Espacio</kbd></td>
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
                      <td><kbd>1</kbd> / <kbd>2</kbd> / <kbd>3</kbd></td>
                      <td>{language === 'es' ? 'Cambiar fase (Descubrir, Resolver, Comprender)' : 'Switch phase (Discover, Solve, Understand)'}</td>
                      <td>{language === 'es' ? 'Vista de Ejercicio' : 'Exercise View'}</td>
                    </tr>
                    <tr>
                      <td><kbd>?</kbd></td>
                      <td>{language === 'es' ? 'Abrir este menú de atajos y portafolio' : 'Open shortcuts & portfolio modal'}</td>
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
          )}
        </div>
      </div>
    </div>
  );
};
