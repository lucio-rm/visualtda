import React, { useState } from 'react';
import { useInstructorMode } from '../context/InstructorModeContext';
import { useLanguage } from '../i18n/LanguageContext';
import './InstructorAuthModal.css';

export const InstructorAuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, verifyAndActivate } = useInstructorMode();
  const { t, dict } = useLanguage();

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length !== 8) {
      setErrorMessage(t(dict.instructorAuthErrorLength));
      return;
    }

    setIsVerifying(true);
    try {
      const result = await verifyAndActivate(password);
      if (!result.success) {
        setErrorMessage(
          result.error === 'length'
            ? t(dict.instructorAuthErrorLength)
            : t(dict.instructorAuthErrorInvalid)
        );
      } else {
        setPassword('');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setErrorMessage(null);
    closeAuthModal();
  };

  return (
    <div
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="instructor-auth-title"
      onClick={handleClose}
    >
      <div className="modal-card instructor-auth-card" onClick={(e) => e.stopPropagation()}>
        <div className="instructor-auth-header">
          <div className="instructor-auth-icon-wrap" aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <div>
            <h4 id="instructor-auth-title">{t(dict.instructorAuthTitle)}</h4>
            <p className="instructor-auth-subtitle">{t(dict.instructorAuthSubtitle)}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="instructor-auth-form">
          <div className="form-group">
            <div className="label-row">
              <label htmlFor="instructor-password-input">
                {t(dict.instructorAuthInputLabel)}
              </label>
              <span className={`char-counter ${password.length === 8 ? 'valid' : ''}`}>
                {password.length} / 8
              </span>
            </div>

            <div className="password-input-wrapper">
              <input
                id="instructor-password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value.slice(0, 8));
                  setErrorMessage(null);
                }}
                maxLength={8}
                autoFocus
                autoComplete="off"
                placeholder="••••••••"
                className="instructor-password-input"
                aria-invalid={errorMessage !== null}
                aria-describedby={errorMessage ? 'auth-error-msg' : undefined}
              />
              <button
                type="button"
                className="toggle-password-visibility"
                onClick={() => setShowPassword((prev) => !prev)}
                title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
              >
                {showPassword ? 'Ocultar' : 'Ver'}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div id="auth-error-msg" className="auth-error-banner" role="alert">
              {errorMessage}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={isVerifying}
            >
              {t(dict.instructorAuthCancel)}
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={password.length !== 8 || isVerifying}
            >
              {isVerifying ? 'Verificando...' : t(dict.instructorAuthSubmit)}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
