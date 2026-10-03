import React, { useState, useEffect } from 'react';
import { registry } from '../engine/registry';
import { ExercisePhase } from '../types';
import { Header } from '../components/Header';
import { CategoryNav } from '../components/CategoryNav';
import { ExerciseList } from '../components/ExerciseList';
import { ExerciseView } from '../components/ExerciseView';
import { getExerciseViewConfig } from '../engine/exerciseViewRegistry';
import { LanguageProvider, useLanguage } from '../i18n/LanguageContext';
import { InstructorModeProvider } from '../context/InstructorModeContext';
import { StudentProgressProvider, useStudentProgress } from '../context/StudentProgressContext';
import { formatTitleSpacing } from '../utils/textFormatting';
import { Footer } from '../components/Footer';
import './App.css';


export type ThemeMode = 'system' | 'light' | 'dark';

const AppContent: React.FC = () => {
  const { t, dict, language } = useLanguage();
  const { completedCount, totalExercisesCount, records, isCompleted } = useStudentProgress();
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('visual_tda_theme');
    return (saved as ThemeMode) || 'dark';
  });

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [targetPhase, setTargetPhase] = useState<ExercisePhase | undefined>(undefined);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (theme === 'system') {
      root.removeAttribute('data-theme');
    } else {
      root.setAttribute('data-theme', theme);
    }
    root.classList.toggle('dark', isDark);
    root.classList.toggle('dark-theme', isDark);
    root.classList.toggle('light', !isDark);
    root.classList.toggle('light-theme', !isDark);
    localStorage.setItem('visual_tda_theme', theme);
  }, [theme]);

  const categories = registry.getCategories();
  const exercises = registry.getExercises(activeCategoryId || undefined);
  const selectedExercise = selectedExerciseId ? registry.getExercise(selectedExerciseId) : undefined;

  const handleSelectExercise = (id: string, phase?: ExercisePhase) => {
    setSelectedExerciseId(id);
    setTargetPhase(phase || 'discover');
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleHomeClick = () => {
    setSelectedExerciseId(null);
    setTargetPhase(undefined);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const exerciseConfig = selectedExercise ? getExerciseViewConfig(selectedExercise.id) : {};
  const progressPercent = totalExercisesCount > 0 ? Math.round((completedCount / totalExercisesCount) * 100) : 0;

  // Active in-progress exercise (exploring, attempted, or testing)
  const inProgressExercise = React.useMemo(() => {
    const activeEntries = Object.entries(records)
      .filter(([_, rec]) => rec.state === 'exploring' || rec.state === 'attempted' || rec.state === 'testing')
      .sort((a, b) => b[1].updatedAt - a[1].updatedAt);
    if (activeEntries.length > 0) {
      return registry.getExercise(activeEntries[0][0]);
    }
    return undefined;
  }, [records]);

  // Next exercise in curriculum if none in progress but some completed
  const nextCurricularExercise = React.useMemo(() => {
    if (completedCount > 0 && completedCount < totalExercisesCount) {
      return registry.getExercises().find((ex) => !isCompleted(ex.id));
    }
    return undefined;
  }, [completedCount, totalExercisesCount, isCompleted]);

  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-to-content">
        {t({ es: 'Saltar al contenido', en: 'Skip to content' })}
      </a>
      <Header
        theme={theme}
        onThemeChange={setTheme}
        onHomeClick={handleHomeClick}
        currentExerciseTitle={selectedExercise ? formatTitleSpacing(t(selectedExercise.title)) : undefined}
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
                    {language === 'es' ? 'Progreso de Dominio Académico' : 'Academic Mastery Progress'}:
                  </span>
                  <span className="progress-stats">
                    <strong>{completedCount}</strong> / {totalExercisesCount} {language === 'es' ? 'ejercicios completados' : 'exercises completed'} ({progressPercent}%)
                  </span>
                </div>
                <div className="progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
                  <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>

              {inProgressExercise ? (
                <div className="recommended-start-card">
                  <div className="recommended-text">
                    <span className="recommended-tag">{language === 'es' ? 'CONTINUAR APRENDIENDO' : 'CONTINUE LEARNING'}</span>
                    <h4>{formatTitleSpacing(t(inProgressExercise.title))}</h4>
                    <p>
                      {language === 'es'
                        ? `Tu progreso actual en este problema está registrado. Retomá la exploración o implementación formal.`
                        : `Your progress on this problem is active. Resume your visual exploration or formal code solution.`}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-start-recommended"
                    onClick={() => {
                      const st = records[inProgressExercise.id]?.state;
                      const phase: ExercisePhase =
                        st === 'passed' || st === 'completed'
                          ? 'understand'
                          : st === 'attempted' || st === 'testing'
                            ? 'solve'
                            : 'discover';
                      handleSelectExercise(inProgressExercise.id, phase);
                    }}
                  >
                    {language === 'es' ? 'Continuar ejercicio →' : 'Continue exercise →'}
                  </button>
                </div>
              ) : completedCount === 0 ? (
                <div className="recommended-start-card">
                  <div className="recommended-text">
                    <span className="recommended-tag">{language === 'es' ? 'PUNTO DE PARTIDA SUGERIDO' : 'RECOMMENDED START'}</span>
                    <h4>{formatTitleSpacing(language === 'es' ? 'Selección de Intervalos (Algoritmos Greedy)' : 'Interval Scheduling (Greedy Algorithms)')}</h4>
                    <p>
                      {language === 'es'
                        ? 'Explorá por qué las heurísticas intuitivas (menor duración, inicio temprano) fallan con contraejemplos interactivos, y cómo Earliest Finish Time garantiza el óptimo global mediante argumento de intercambio.'
                        : 'Explore why intuitive greedy heuristics fail with interactive counterexamples, and how Earliest Finish Time guarantees the global optimum via exchange argument.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn-start-recommended"
                    onClick={() => handleSelectExercise('interval-scheduling', 'discover')}
                  >
                    {language === 'es' ? 'Comenzar con Intervalos (Descubrir) →' : 'Start with Intervals (Discover) →'}
                  </button>
                </div>
              ) : nextCurricularExercise ? (
                <div className="recommended-start-card">
                  <div className="recommended-text">
                    <span className="recommended-tag">{language === 'es' ? 'SIGUIENTE EN LA CURRÍCULA' : 'NEXT IN CURRICULUM'}</span>
                    <h4>{formatTitleSpacing(t(nextCurricularExercise.title))}</h4>
                    <p>{t(nextCurricularExercise.subtitle)}</p>
                  </div>
                  <button
                    type="button"
                    className="btn-start-recommended"
                    onClick={() => handleSelectExercise(nextCurricularExercise.id, 'discover')}
                  >
                    {language === 'es' ? 'Iniciar siguiente ejercicio →' : 'Start next exercise →'}
                  </button>
                </div>
              ) : null}
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
                onSelectExercise={(id) => handleSelectExercise(id, 'discover')}
              />
            </section>
          </>
        ) : (
          <ExerciseView
            exercise={selectedExercise}
            initialPhase={targetPhase}
            onBackToCatalog={handleHomeClick}
            onSelectExercise={(id) => handleSelectExercise(id, 'discover')}
            {...exerciseConfig}
          />
        )}
      </main>

      <Footer currentExerciseId={selectedExerciseId} />
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
