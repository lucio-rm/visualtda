import React, { useState, useEffect } from 'react';
import { registry } from '../engine/registry';
import { Header } from '../components/Header';
import { CategoryNav } from '../components/CategoryNav';
import { ExerciseList } from '../components/ExerciseList';
import { ExerciseView } from '../components/ExerciseView';
import { getExerciseViewConfig } from '../engine/exerciseViewRegistry';
import { LanguageProvider, useLanguage } from '../i18n/LanguageContext';
import { InstructorModeProvider } from '../context/InstructorModeContext';
import { StudentProgressProvider, useStudentProgress } from '../context/StudentProgressContext';
import './App.css';

export type ThemeMode = 'system' | 'light' | 'dark';

const AppContent: React.FC = () => {
  const { t, dict, language } = useLanguage();
  const { completedCount, totalExercisesCount } = useStudentProgress();
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('visual_tda_theme');
    return (saved as ThemeMode) || 'dark';
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

  const exerciseConfig = selectedExercise ? getExerciseViewConfig(selectedExercise.id) : {};
  const progressPercent = totalExercisesCount > 0 ? Math.round((completedCount / totalExercisesCount) * 100) : 0;

  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-to-content">
        {t({ es: 'Saltar al contenido', en: 'Skip to content' })}
      </a>
      <Header
        theme={theme}
        onThemeChange={setTheme}
        onHomeClick={handleHomeClick}
        currentExerciseTitle={selectedExercise ? t(selectedExercise.title) : undefined}
      />

      <main className="app-main" id="main-content">
        {!selectedExercise ? (
          <>
            <section className="welcome-banner">
              <h2>{t(dict.welcomeTitle)}</h2>
              <p>{t(dict.welcomeLead)}</p>

              {/* Student Progress Bar */}
              <div className="student-overall-progress-card">
                <div className="progress-header-row">
                  <span className="progress-title">
                    🎓 {language === 'es' ? 'Progreso de Dominio Académico' : 'Academic Mastery Progress'}:
                  </span>
                  <span className="progress-stats">
                    <strong>{completedCount}</strong> / {totalExercisesCount} {language === 'es' ? 'ejercicios completados' : 'exercises completed'} ({progressPercent}%)
                  </span>
                </div>
                <div className="progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
                  <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              {completedCount === 0 && (
                <div className="recommended-start-card">
                  <div className="recommended-text">
                    <span className="recommended-tag">{language === 'es' ? 'PUNTO DE PARTIDA SUGERIDO' : 'RECOMMENDED START'}</span>
                    <h4>{language === 'es' ? 'Las N-Reinas (Backtracking con Poda)' : 'N-Queens (Backtracking with Pruning)'}</h4>
                    <p>
                      {language === 'es'
                        ? 'Explora la búsqueda exhaustiva sistemática, experimenta con colisiones diagonales y verifica el invariante antes de pasar a la programación formal.'
                        : 'Explore systematic exhaustive search, experiment with diagonal conflicts, and verify invariants before code.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-start-recommended"
                    onClick={() => setSelectedExerciseId('n-queens')}
                  >
                    {language === 'es' ? 'Comenzar con N-Reinas →' : 'Start with N-Queens →'}
                  </button>
                </div>
              )}
            </section>

            <section className="catalog-section">
              <div className="section-header">
                <h3>{t(dict.catalogTitle)}</h3>
              </div>
              <CategoryNav
                categories={categories}
                activeCategoryId={activeCategoryId}
                onSelectCategory={setActiveCategoryId}
              />
              <ExerciseList
                exercises={exercises}
                activeCategoryId={activeCategoryId}
                onSelectExercise={(id) => setSelectedExerciseId(id)}
              />
            </section>
          </>
        ) : (
          <ExerciseView
            exercise={selectedExercise}
            onBackToCatalog={handleHomeClick}
            onSelectExercise={(id) => setSelectedExerciseId(id)}
            {...exerciseConfig}
          />
        )}
      </main>

      <footer className="app-footer">
        <p>{t(dict.footerText)}</p>
      </footer>
    </div>
  );
};

export const App: React.FC = () => (
  <LanguageProvider>
    <InstructorModeProvider>
      <StudentProgressProvider>
        <AppContent />
      </StudentProgressProvider>
    </InstructorModeProvider>
  </LanguageProvider>
);
