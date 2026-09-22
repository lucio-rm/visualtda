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
          <span className="brand-logo" aria-hidden="true">♟️</span>
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
          <span className="instructor-icon" aria-hidden="true">🎓</span>
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
            <option value="es">🇪🇸 Español</option>
            <option value="en">🇬🇧 English</option>
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
            <option value="system">{language === 'es' ? '🌓 Sistema' : '🌓 System'}</option>
            <option value="light">{language === 'es' ? '☀️ Claro' : '☀️ Light'}</option>
            <option value="dark">{language === 'es' ? '🌙 Oscuro' : '🌙 Dark'}</option>
          </select>
        </label>
      </div>
    </header>
  );
};
