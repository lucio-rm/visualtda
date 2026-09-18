import React, { useState, useEffect } from 'react';
import './App.css';

export type ThemeMode = 'system' | 'light' | 'dark';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('visual_tda_theme');
    return (saved as ThemeMode) || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
    localStorage.setItem('visual_tda_theme', theme);
  }, [theme]);

  return (
    <div className="app-layout">
      <header className="app-header">
        <div className="header-brand">
          <span className="brand-logo" aria-hidden="true">♟️</span>
          <div>
            <h1 className="brand-title">Visual TDA</h1>
            <p className="brand-subtitle">Teoría y Diseño de Algoritmos Interactiva</p>
          </div>
        </div>
        <div className="header-controls">
          <label className="theme-toggle-label">
            <span className="sr-only">Tema</span>
            <select
              className="theme-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value as ThemeMode)}
              aria-label="Seleccionar tema visual"
            >
              <option value="system">🌓 Sistema</option>
              <option value="light">☀️ Claro</option>
              <option value="dark">🌙 Oscuro</option>
            </select>
          </label>
        </div>
      </header>

      <main className="app-main" id="main-content">
        <section className="welcome-banner">
          <h2>Fundación del Proyecto</h2>
          <p>
            Plataforma educativa para la comprensión profunda de algoritmos. Basado en tres etapas pedagógicas:
            <strong> Descubrir</strong>, <strong>Resolver</strong> y <strong>Comprender</strong>.
          </p>
        </section>
      </main>

      <footer className="app-footer">
        <p>Visual TDA — Principios: KISS · Separación Algoritmo/UI · Correctness Pedagógica</p>
      </footer>
    </div>
  );
};
