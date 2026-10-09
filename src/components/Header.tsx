import React, { useState, useEffect } from 'react';
import { ThemeMode } from '../app/App';
import { useLanguage } from '../i18n/LanguageContext';
import { useInstructorMode } from '../context/InstructorModeContext';
import { InstructorAuthModal } from './InstructorAuthModal';
import { PortfolioModal } from './PortfolioModal';
import { QuickSwitcherModal } from './QuickSwitcherModal';
import { ComplexityComparatorModal } from './ComplexityComparatorModal';
import { formatTitleSpacing } from '../utils/textFormatting';
import { isAudioEnabled, setAudioEnabled } from '../utils/audioFeedback';
import type { ExerciseMetadata } from '../types';

interface HeaderProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onHomeClick: () => void;
  currentExerciseTitle?: string;
  exercises?: ExerciseMetadata[];
  onSelectExercise?: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onThemeChange,
  onHomeClick,
  currentExerciseTitle,
  exercises,
  onSelectExercise
}) => {
  const { language, setLanguage, dict, t } = useLanguage();
  const { isInstructorMode, toggleInstructorMode } = useInstructorMode();
  const [isPortfolioOpen, setIsPortfolioOpen] = useState(false);
  const [portfolioTab, setPortfolioTab] = useState<'portfolio' | 'shortcuts'>('portfolio');
  const [soundOn, setSoundOn] = useState(() => isAudioEnabled());
  const [isQuickSwitcherOpen, setIsQuickSwitcherOpen] = useState(false);
  const [isComplexityOpen, setIsComplexityOpen] = useState(false);

  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setAudioEnabled(next);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K opens quick switcher
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickSwitcherOpen((prev) => !prev);
        return;
      }

      // Ignore if user is typing in input or textarea
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }
      if (e.key === '?') {
        e.preventDefault();
        setPortfolioTab('shortcuts');
        setIsPortfolioOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className="app-header">
      <div className="header-brand">
        <button
          type="button"
          onClick={onHomeClick}
          className="brand-button"
          aria-label={language === 'es' ? 'Ir al inicio de Visual TDA' : 'Go to Visual TDA home'}
        >
          <svg
            className="brand-logo"
            width="38"
            height="38"
            viewBox="0 0 44 44"
            fill="none"
            aria-hidden="true"
            style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
          >
            <rect x="2" y="2" width="40" height="40" rx="10" fill="var(--surface-hover)" stroke="var(--accent-solid, var(--accent))" strokeWidth="2" />
            <ellipse cx="22" cy="22" rx="17" ry="14" stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 2" opacity="0.45" />
            <circle cx="12.5" cy="22" r="9" fill="var(--accent-surface, rgba(99, 102, 241, 0.12))" stroke="var(--accent)" strokeWidth="1" opacity="0.75" />
            <text x="12.5" y="26.5" textAnchor="middle" fill="var(--accent-solid, var(--accent))" fontSize="13.5" fontFamily="var(--font-mono)" fontWeight="900">P</text>
            <text x="22.5" y="17.5" textAnchor="middle" fill="var(--warning)" fontSize="10" fontFamily="var(--font-mono)" fontWeight="800">?</text>
            <line x1="19.5" y1="21.5" x2="25.5" y2="21.5" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" />
            <line x1="19.5" y1="24.5" x2="25.5" y2="24.5" stroke="var(--text-muted)" strokeWidth="1.6" strokeLinecap="round" />
            <text x="33.5" y="26.5" textAnchor="middle" fill="var(--text)" fontSize="11.5" fontFamily="var(--font-mono)" fontWeight="800">NP</text>
          </svg>
          <div className="brand-text">
            <span className="brand-title">Visual TDA</span>
            <span className="brand-subtitle">{t(dict.brandSubtitle)}</span>
          </div>
        </button>

        {currentExerciseTitle && (
          <div className="header-breadcrumb" aria-label="Breadcrumb">
            <span className="breadcrumb-separator" aria-hidden="true">/</span>
            <span className="breadcrumb-current">{formatTitleSpacing(currentExerciseTitle)}</span>
          </div>
        )}
      </div>


      <div className="header-controls">
        {exercises && onSelectExercise && (
          <button
            type="button"
            className="search-quick-toggle-btn"
            onClick={() => setIsQuickSwitcherOpen(true)}
            title={language === 'es' ? 'Búsqueda rápida de ejercicios (Ctrl+K)' : 'Quick exercise search (Ctrl+K)'}
            aria-label={language === 'es' ? 'Búsqueda rápida de ejercicios' : 'Quick exercise search'}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <span className="search-quick-text">{language === 'es' ? 'Buscar' : 'Search'}</span>
            <kbd className="search-quick-kbd">⌘K</kbd>
          </button>
        )}

        <button
          type="button"
          className="complexity-toggle-btn"
          onClick={() => setIsComplexityOpen(true)}
          title={language === 'es' ? 'Laboratorio Asintótico: Comparador de Complejidad f(n)' : 'Asymptotic Laboratory: Complexity Comparator f(n)'}
          aria-label={language === 'es' ? 'Laboratorio Asintótico f(n)' : 'Asymptotic Laboratory f(n)'}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.65rem',
            background: 'var(--surface)',
            border: '1.5px solid var(--border)',
            borderRadius: 'var(--radius-md, 8px)',
            color: 'var(--text)',
            fontSize: '0.8125rem',
            fontWeight: 700,
            fontFamily: 'var(--font-mono)',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span style={{ color: 'var(--accent)', fontWeight: 900 }}>f(n)</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 600 }}>{language === 'es' ? 'Asintótica' : 'Complexity'}</span>
        </button>

        <button
          type="button"
          className="portfolio-toggle-btn"
          onClick={() => {
            setPortfolioTab('portfolio');
            setIsPortfolioOpen(true);
          }}
          title={language === 'es' ? 'Portafolio Académico y Atajos (?)' : 'Academic Portfolio & Shortcuts (?)'}
          aria-label={language === 'es' ? 'Portafolio Académico y Atajos' : 'Academic Portfolio & Shortcuts'}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
            <path d="M6 6h10" />
            <path d="M6 10h10" />
          </svg>
          <span className="portfolio-text">{language === 'es' ? 'Portafolio' : 'Portfolio'}</span>
        </button>

        <button
          type="button"
          className={`instructor-mode-toggle ${isInstructorMode ? 'active' : ''}`}
          onClick={toggleInstructorMode}
          title={t(dict.instructorModeTooltip)}
          aria-pressed={isInstructorMode}
          aria-label={t(dict.instructorMode)}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
            <path d="M6 12v5c3 3 9 3 12 0v-5" />
          </svg>
          <span className="instructor-text">{t(dict.instructorMode)}</span>
        </button>

        <button
          type="button"
          className={`sound-toggle-btn ${soundOn ? 'active' : ''}`}
          onClick={handleToggleSound}
          title={
            soundOn
              ? (language === 'es' ? 'Silenciar Efectos de Audio' : 'Mute Sound Effects')
              : (language === 'es' ? 'Activar Efectos de Audio' : 'Enable Sound Effects')
          }
          aria-pressed={soundOn}
          aria-label={language === 'es' ? 'Control de sonido' : 'Sound control'}
        >
          {soundOn ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          )}
          <span className="sound-text">{soundOn ? 'Audio On' : (language === 'es' ? 'Silencio' : 'Muted')}</span>
        </button>

        {/* Language Segmented Toggle */}
        <div className="segmented-control lang-segmented-control" role="group" aria-label="Idioma / Language">
          <button
            type="button"
            className={`segmented-btn ${language === 'es' ? 'active' : ''}`}
            onClick={() => setLanguage('es')}
            aria-pressed={language === 'es'}
            title="Español"
          >
            ES
          </button>
          <button
            type="button"
            className={`segmented-btn ${language === 'en' ? 'active' : ''}`}
            onClick={() => setLanguage('en')}
            aria-pressed={language === 'en'}
            title="English"
          >
            EN
          </button>
        </div>

        {/* Theme Segmented Toggle */}
        <div className="segmented-control theme-segmented-control" role="group" aria-label="Tema visual / Visual theme">
          <button
            type="button"
            className={`segmented-btn ${theme === 'system' ? 'active' : ''}`}
            onClick={() => onThemeChange('system')}
            aria-pressed={theme === 'system'}
            title={language === 'es' ? 'Tema del Sistema' : 'System Theme'}
          >
            Auto
          </button>
          <button
            type="button"
            className={`segmented-btn ${theme === 'light' ? 'active' : ''}`}
            onClick={() => onThemeChange('light')}
            aria-pressed={theme === 'light'}
            title={language === 'es' ? 'Modo Claro' : 'Light Mode'}
          >
            {language === 'es' ? 'Claro' : 'Light'}
          </button>
          <button
            type="button"
            className={`segmented-btn ${theme === 'dark' ? 'active' : ''}`}
            onClick={() => onThemeChange('dark')}
            aria-pressed={theme === 'dark'}
            title={language === 'es' ? 'Modo Oscuro' : 'Dark Mode'}
          >
            {language === 'es' ? 'Oscuro' : 'Dark'}
          </button>
        </div>

        {/* Accessible screen-reader & test-compatible native inputs */}
        <label className="lang-toggle-label sr-only">
          <span>Idioma / Language</span>
          <select
            className="theme-select lang-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'es' | 'en')}
            aria-label="Seleccionar idioma / Select language"
            tabIndex={-1}
          >
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
        </label>

        <label className="theme-toggle-label sr-only">
          <span>{language === 'es' ? 'Tema visual' : 'Visual theme'}</span>
          <select
            className="theme-select"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value as ThemeMode)}
            aria-label={language === 'es' ? 'Seleccionar tema visual' : 'Select visual theme'}
            tabIndex={-1}
          >
            <option value="system">{language === 'es' ? 'Sistema' : 'System'}</option>
            <option value="light">{language === 'es' ? 'Claro' : 'Light'}</option>
            <option value="dark">{language === 'es' ? 'Oscuro' : 'Dark'}</option>
          </select>
        </label>
      </div>

      <InstructorAuthModal />
      <PortfolioModal
        isOpen={isPortfolioOpen}
        onClose={() => setIsPortfolioOpen(false)}
        initialTab={portfolioTab}
      />
      <ComplexityComparatorModal
        isOpen={isComplexityOpen}
        onClose={() => setIsComplexityOpen(false)}
        language={language}
      />
      {exercises && onSelectExercise && (
        <QuickSwitcherModal
          isOpen={isQuickSwitcherOpen}
          onClose={() => setIsQuickSwitcherOpen(false)}
          exercises={exercises}
          onSelectExercise={onSelectExercise}
        />
      )}
    </header>
  );
};
