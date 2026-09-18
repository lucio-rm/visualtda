import React from 'react';
import { ThemeMode } from '../app/App';

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
  return (
    <header className="app-header">
      <div className="header-brand">
        <button
          type="button"
          onClick={onHomeClick}
          className="brand-button"
          aria-label="Ir al inicio de Visual TDA"
        >
          <span className="brand-logo" aria-hidden="true">♟️</span>
          <div className="brand-text">
            <span className="brand-title">Visual TDA</span>
            <span className="brand-subtitle">Teoría y Diseño de Algoritmos</span>
          </div>
        </button>

        {currentExerciseTitle && (
          <div className="header-breadcrumb" aria-label="Ruta actual">
            <span className="breadcrumb-separator" aria-hidden="true">/</span>
            <span className="breadcrumb-current">{currentExerciseTitle}</span>
          </div>
        )}
      </div>

      <div className="header-controls">
        <label className="theme-toggle-label">
          <span className="sr-only">Tema visual</span>
          <select
            className="theme-select"
            value={theme}
            onChange={(e) => onThemeChange(e.target.value as ThemeMode)}
            aria-label="Seleccionar tema visual"
          >
            <option value="system">🌓 Sistema</option>
            <option value="light">☀️ Claro</option>
            <option value="dark">🌙 Oscuro</option>
          </select>
        </label>
      </div>
    </header>
  );
};
