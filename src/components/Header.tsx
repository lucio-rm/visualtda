import React from 'react';
import { ThemeMode } from '../app/App';
import { useLanguage } from '../i18n/LanguageContext';
import { useInstructorMode } from '../context/InstructorModeContext';

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
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}
          >
            <line x1="12" y1="6" x2="6" y2="18" stroke="var(--accent)" strokeWidth="1.75" />
            <line x1="12" y1="6" x2="18" y2="18" stroke="var(--accent)" strokeWidth="1.75" />
            <line x1="6" y1="18" x2="18" y2="18" stroke="var(--accent)" strokeWidth="1.75" />
            <circle cx="12" cy="6" r="3" fill="var(--accent)" />
            <circle cx="6" cy="18" r="3" fill="var(--text)" />
            <circle cx="18" cy="18" r="3" fill="var(--text)" />
          </svg>
          <div className="brand-text">
            <span className="brand-title">Visual TDA</span>
            <span className="brand-subtitle">{t(dict.brandSubtitle)}</span>
          </div>
        </button>

        {currentExerciseTitle && (
          <div className="header-breadcrumb" aria-label="Breadcrumb">
            <span className="breadcrumb-separator" aria-hidden="true">/</span>
            <span className="breadcrumb-current">{currentExerciseTitle}</span>
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

        <label className="lang-toggle-label">
          <span className="sr-only">Idioma / Language</span>
          <select
            className="theme-select lang-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value as 'es' | 'en')}
            aria-label="Seleccionar idioma / Select language"
          >
            <option value="es">ES</option>
            <option value="en">EN</option>
          </select>
        </label>

        <label className="theme-toggle-label">
          <span className="sr-only">Tema visual</span>
          <select
            className="theme-select"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value as ThemeMode)}
            aria-label="Seleccionar tema visual"
          >
            <option value="system">{language === 'es' ? 'Sistema' : 'System'}</option>
            <option value="light">{language === 'es' ? 'Claro' : 'Light'}</option>
            <option value="dark">{language === 'es' ? 'Oscuro' : 'Dark'}</option>
          </select>
        </label>
      </div>
    </header>
  );
};
