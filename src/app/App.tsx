import React, { useState, useEffect } from 'react';
import { registry } from '../engine/registry';
import { Header } from '../components/Header';
import { CategoryNav } from '../components/CategoryNav';
import { ExerciseList } from '../components/ExerciseList';
import './App.css';

export type ThemeMode = 'system' | 'light' | 'dark';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('visual_tda_theme');
    return (saved as ThemeMode) || 'system';
  });

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
    localStorage.setItem('visual_tda_theme', theme);
  }, [theme]);

  const categories = registry.getCategories();
  const exercises = registry.getExercises(activeCategoryId || undefined);
  const selectedExercise = selectedExerciseId ? registry.getExercise(selectedExerciseId) : undefined;

  const handleHomeClick = () => {
    setSelectedExerciseId(null);
  };

  return (
    <div className="app-layout">
      <Header
        theme={theme}
        onThemeChange={setTheme}
        onHomeClick={handleHomeClick}
        currentExerciseTitle={selectedExercise?.title.es}
      />

      <main className="app-main" id="main-content">
        {!selectedExercise ? (
          <>
            <section className="welcome-banner">
              <h2>Diseño y Análisis de Algoritmos</h2>
              <p>
                Aprende algoritmos fundamentales de forma interactiva y rigurosa. Observa su ejecución,
                comprende los invariantes de corrección y analiza su complejidad computacional.
              </p>
            </section>

            <section className="catalog-section">
              <div className="section-header">
                <h3>Categorías y Técnicas</h3>
              </div>
              <CategoryNav
                categories={categories}
                activeCategoryId={activeCategoryId}
                onSelectCategory={setActiveCategoryId}
              />
              <ExerciseList
                exercises={exercises}
                onSelectExercise={(id) => setSelectedExerciseId(id)}
              />
            </section>
          </>
        ) : (
          <div className="exercise-container">
            <div className="exercise-header">
              <button
                type="button"
                className="btn-back"
                onClick={handleHomeClick}
                aria-label="Volver al catálogo de ejercicios"
              >
                &larr; Volver al catálogo
              </button>
              <h2>{selectedExercise.title.es}</h2>
              <p className="exercise-desc">{selectedExercise.subtitle.es}</p>
            </div>
            <div className="exercise-placeholder-card">
              <p>
                Ejercicio <strong>{selectedExercise.id}</strong> seleccionado.
                El flujo de 3 fases (Descubrir, Resolver, Comprender) y el motor de visualización se cargan a continuación.
              </p>
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>Visual TDA — Principios: KISS · Separación Algoritmo/UI · Correctness Pedagógica</p>
      </footer>
    </div>
  );
};
