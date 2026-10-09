import React, { useState, useEffect, useRef, useMemo } from 'react';
import type { ExerciseMetadata } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { useStudentProgress } from '../context/StudentProgressContext';
import './QuickSwitcherModal.css';

interface QuickSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  exercises: ExerciseMetadata[];
  onSelectExercise: (id: string) => void;
}

export function filterExercises(
  exercises: ExerciseMetadata[],
  query: string,
  _lang?: 'es' | 'en'
): ExerciseMetadata[] {
  const q = query.trim().toLowerCase();
  if (!q) return exercises.slice(0, 8);

  return exercises
    .filter((ex) => {
      const titleEs = ex.title.es.toLowerCase();
      const titleEn = ex.title.en.toLowerCase();
      const id = ex.id.toLowerCase();
      const cat = ex.categoryId.toLowerCase();
      const tech = ex.techniqueId.toLowerCase();
      const tags = ex.tags ? ex.tags.join(' ').toLowerCase() : '';

      return (
        titleEs.includes(q) ||
        titleEn.includes(q) ||
        id.includes(q) ||
        cat.includes(q) ||
        tech.includes(q) ||
        tags.includes(q)
      );
    })
    .slice(0, 10);
}

export const QuickSwitcherModal: React.FC<QuickSwitcherModalProps> = ({
  isOpen,
  onClose,
  exercises,
  onSelectExercise
}) => {
  const { language } = useLanguage();
  const { isCompleted } = useStudentProgress();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const isEs = language === 'es';

  const results = useMemo(() => {
    return filterExercises(exercises, query, language);
  }, [exercises, query, language]);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev + 1) % results.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        onSelectExercise(results[selectedIndex].id);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="quick-switcher-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={isEs ? 'Búsqueda rápida de ejercicios' : 'Quick exercise search'}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="quick-switcher-card">
        <div className="quick-switcher-search-bar">
          <span className="quick-switcher-search-icon" aria-hidden="true">🔍</span>
          <input
            ref={inputRef}
            type="text"
            className="quick-switcher-input"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              isEs
                ? 'Buscar por problema, técnica o palabra clave (ej. reinas, knapsack, flujo)...'
                : 'Search by problem, technique or keyword (e.g. queens, knapsack, flow)...'
            }
            aria-autocomplete="list"
          />
          <kbd className="quick-switcher-kbd">ESC</kbd>
        </div>

        <div className="quick-switcher-results-list" role="listbox">
          {results.length > 0 ? (
            results.map((ex, idx) => {
              const isSelected = idx === selectedIndex;
              const completed = isCompleted(ex.id);
              const title = ex.title[language] || ex.title.es;

              return (
                <div
                  key={ex.id}
                  role="option"
                  aria-selected={isSelected}
                  className={`quick-switcher-item ${isSelected ? 'active' : ''}`}
                  onClick={() => {
                    onSelectExercise(ex.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <div className="quick-switcher-item-main">
                    <span className="quick-switcher-item-title">{title}</span>
                    <span className="quick-switcher-item-tech">{ex.techniqueId}</span>
                  </div>
                  <div className="quick-switcher-item-meta">
                    <span className="quick-switcher-diff-badge">
                      {'★'.repeat(ex.difficulty)}
                    </span>
                    {completed && (
                      <span className="quick-switcher-done-badge" title={isEs ? 'Completado' : 'Completed'}>
                        ✓
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="quick-switcher-no-results">
              {isEs ? 'No se encontraron ejercicios con ese criterio.' : 'No exercises found matching your search.'}
            </div>
          )}
        </div>

        <footer className="quick-switcher-footer">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> {isEs ? 'navegar' : 'navigate'}
          </span>
          <span>
            <kbd>↵</kbd> {isEs ? 'seleccionar' : 'select'}
          </span>
          <span>
            <kbd>esc</kbd> {isEs ? 'cerrar' : 'close'}
          </span>
        </footer>
      </div>
    </div>
  );
};
