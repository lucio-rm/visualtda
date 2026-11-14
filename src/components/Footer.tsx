import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { FeedbackModal } from './FeedbackModal';

interface FooterProps {
  currentExerciseId?: string | null;
}

export const Footer: React.FC<FooterProps> = ({ currentExerciseId }) => {
  const { language } = useLanguage();
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  return (
    <>
      <footer className="app-footer">
        <div className="footer-author-group footer-institutional-group">
          <span className="footer-author-text footer-institutional-text">
            {language === 'es'
              ? 'Visual TDA — Plataforma Universitaria para la Enseñanza de Teoría de Algoritmos'
              : 'Visual TDA — University Platform for Theory of Algorithms Education'}
          </span>
          <a
            href="https://github.com/lucio-rm/visualtda"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-gh-link"
            aria-label={language === 'es' ? 'Repositorio del Proyecto — Visual TDA' : 'Project Repository — Visual TDA'}
            title={language === 'es' ? 'Repositorio del Proyecto' : 'Project Repository'}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>

        <div>
          <button
            type="button"
            className="footer-feedback-btn"
            onClick={() => setIsFeedbackOpen(true)}
            title={language === 'es' ? 'Enviar sugerencias, mejoras o reportar un bug' : 'Send feedback, suggestions or report a bug'}
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
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {language === 'es' ? 'Consejos, Mejoras y Bugs' : 'Feedback & Bug Reports'}
          </button>
        </div>
      </footer>

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        language={language}
        currentExerciseId={currentExerciseId}
      />
    </>
  );
};
