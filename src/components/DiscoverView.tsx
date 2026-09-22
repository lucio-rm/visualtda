import React from 'react';
import { ExerciseMetadata } from '../types';
import { useLanguage } from '../i18n/LanguageContext';
import { ExerciseHeaderIllustration } from './illustrations/ExerciseHeaderIllustration';

interface DiscoverViewProps {
  exercise: ExerciseMetadata;
  onProceedToSolve: () => void;
  children?: React.ReactNode;
}

export const DiscoverView: React.FC<DiscoverViewProps> = ({
  exercise,
  onProceedToSolve,
  children
}) => {
  const { t, dict } = useLanguage();

  return (
    <section className="phase-view discover-view" aria-labelledby="discover-heading">
      <div className="view-intro discover-header-card">
        <div className="discover-intro-content">
          <h3 id="discover-heading" className="view-title">
            {t(dict.discoverTitle)}
          </h3>
          <p className="view-lead">
            {t(dict.discoverLead)}
          </p>
        </div>
        <div className="discover-header-illustration-wrapper" aria-hidden="false">
          <ExerciseHeaderIllustration exerciseId={exercise.id} />
        </div>
      </div>

      <div className="discover-grid">
        <div className="problem-narrative-card">
          <h4>{t(dict.discoverProblemStatement)}</h4>
          <p className="problem-statement">{t(exercise.subtitle)}</p>

          <div className="problem-rules">
            <h5>{t(dict.discoverRulesHeading)}</h5>
            <ul>
              <li>{t(dict.discoverRule1)}</li>
              <li>{t(dict.discoverRule2)}</li>
              <li>{t(dict.discoverRule3)}</li>
            </ul>
          </div>
        </div>

        <div className="interactive-playground-card">
          <h4>{t(dict.discoverPlaygroundHeading)}</h4>
          {children || (
            <div className="playground-placeholder">
              <p>{t(dict.discoverPlaygroundPlaceholder)}</p>
            </div>
          )}
        </div>
      </div>

      <div className="phase-footer-action">
        <button
          type="button"
          className="btn-primary"
          onClick={onProceedToSolve}
        >
          {t(dict.discoverProceedBtn)}
        </button>
      </div>
    </section>
  );
};

