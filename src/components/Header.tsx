import React from 'react';
import { ThemeMode } from '../app/App';
import { useLanguage } from '../i18n/LanguageContext';
import { useInstructorMode } from '../context/InstructorModeContext';
import { InstructorAuthModal } from './InstructorAuthModal';

import { formatTitleSpacing } from '../utils/textFormatting';

interface HeaderProps {
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onHomeClick: () => void;
  currentExerciseTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  theme,
  onThemeChange,
  onHomeClick,
  currentExerciseTitle
}) => {
  const { language, setLanguage, dict, t } = useLanguage();
  const { isInstructorMode, toggleInstructorMode } = useInstructorMode();

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
            width="30"
            height="30"
            viewBox="0 0 30 30"
            fill="none"
            aria-hidden="true"
            style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
          >
            <rect x="2" y="2" width="26" height="26" rx="7" fill="var(--surface-hover)" stroke="var(--accent)" strokeWidth="1.75" />
            <ellipse cx="15" cy="15" rx="10.5" ry="9" stroke="var(--border-strong)" strokeWidth="1" strokeDasharray="3 2" />
            <text x="5.5" y="18.5" fill="var(--accent)" fontSize="10.5" fontFamily="var(--font-mono)" fontWeight="900">P</text>
            <text x="14" y="13.5" textAnchor="middle" fill="var(--warning)" fontSize="8.5" fontFamily="var(--font-mono)" fontWeight="800">?</text>
            <line x1="12" y1="16" x2="16" y2="16" stroke="var(--text-muted)" strokeWidth="1.3" strokeLinecap="round" />
            <line x1="12" y1="18.5" x2="16" y2="18.5" stroke="var(--text-muted)" strokeWidth="1.3" strokeLinecap="round" />
            <text x="24.5" y="18.5" textAnchor="end" fill="var(--text)" fontSize="8.5" fontFamily="var(--font-mono)" fontWeight="800">NP</text>
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
    </header>
  );
};
