import React, { useState, useEffect, useRef } from 'react';

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'es' | 'en';
  currentExerciseId?: string | null;
}

// Obfuscated delivery endpoints for maintainer inbox notification
const PRIMARY_ENDPOINT = atob('aHR0cHM6Ly9mb3Jtc3VibWl0LmNvL2FqYXgvbHVjaW9yb21lcm9tYXNjYXJvQGdtYWlsLmNvbQ==');
const SECONDARY_ENDPOINT = atob('aHR0cHM6Ly9mb3Jtc3VibWl0LmNvL2FqYXgvbHJvbWVyb21AZmkudWJhLmFy');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  language,
  currentExerciseId
}) => {
  const [email, setEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [category, setCategory] = useState<'bug' | 'ui' | 'algorithm' | 'suggestion'>('bug');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copyFeedbackNotice, setCopyFeedbackNotice] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
      setErrorMessage(null);
      setValidationError(null);
      setCopyFeedbackNotice(false);
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categoryLabels = {
    bug: { es: 'Reporte de Bug / Error', en: 'Bug / Error Report' },
    ui: { es: 'Mejora de Visualización / UI', en: 'Visualization / UI Improvement' },
    algorithm: { es: 'Sugerencia Teórica / Algorítmica', en: 'Theory / Algorithmic Suggestion' },
    suggestion: { es: 'Comentario General / Otro', en: 'General Feedback / Other' }
  };

  const validatePayload = (trimmedMsg: string, trimmedEmail: string): string | null => {
    if (!trimmedMsg || trimmedMsg.length < 3) {
      return language === 'es'
        ? 'El mensaje debe contener al menos 3 caracteres.'
        : 'The message must contain at least 3 characters.';
    }
    if (trimmedMsg.length > 2000) {
      return language === 'es'
        ? 'El mensaje no puede superar los 2000 caracteres.'
        : 'The message cannot exceed 2000 characters.';
    }
    if (!isAnonymous) {
      if (!trimmedEmail) {
        return language === 'es'
          ? 'Por favor, ingresá un correo de contacto o activá el envío anónimo.'
          : 'Please enter a contact email or enable anonymous submission.';
      }
      if (!EMAIL_REGEX.test(trimmedEmail)) {
        return language === 'es'
          ? 'Por favor, ingresá una dirección de correo electrónico válida.'
          : 'Please enter a valid email address.';
      }
    }
    return null;
  };

  const submitToEndpoint = async (url: string, payloadData: unknown) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payloadData)
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const json = await res.json().catch(() => ({ success: true }));
    if (json && (json.success === 'false' || json.success === false)) {
      throw new Error(json.message || 'Submission rejected by provider');
    }

    return json;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    setErrorMessage(null);

    const trimmedMsg = message.trim();
    const trimmedEmail = email.trim();

    const validation = validatePayload(trimmedMsg, trimmedEmail);
    if (validation) {
      setValidationError(validation);
      return;
    }

    setStatus('submitting');
    const catName = categoryLabels[category][language];
    const senderEmail = isAnonymous ? 'anonimo@visualtda.org' : trimmedEmail;
    const senderName = isAnonymous
      ? (language === 'es' ? 'Estudiante Anónimo' : 'Anonymous Student')
      : (trimmedEmail.split('@')[0] || 'Estudiante');

    const payload = {
      name: senderName,
      email: senderEmail,
      category: catName,
      exercise: currentExerciseId || 'Inicio',
      message: trimmedMsg,
      _subject: `[Visual TDA Feedback] ${catName}${currentExerciseId ? ` - ${currentExerciseId}` : ''}`,
      _template: 'table'
    };

    try {
      const results = await Promise.allSettled([
        submitToEndpoint(PRIMARY_ENDPOINT, payload),
        submitToEndpoint(SECONDARY_ENDPOINT, payload)
      ]);

      const anyFulfilled = results.some((r) => r.status === 'fulfilled');

      if (!anyFulfilled) {
        const rejected = results.find((r) => r.status === 'rejected') as PromiseRejectedResult | undefined;
        const detail = rejected?.reason instanceof Error ? rejected.reason.message : 'Error en la conexión';
        throw new Error(detail);
      }

      setStatus('sent');
      setErrorMessage(null);
    } catch (err: unknown) {
      setStatus('error');
      const detail = err instanceof Error ? err.message : String(err);
      setErrorMessage(
        language === 'es'
          ? `No se pudo enviar el feedback (${detail}). Podés reintentar o copiar el texto para conservarlo.`
          : `Failed to deliver feedback (${detail}). You can retry or copy your text to preserve it.`
      );
      try {
        navigator.clipboard?.writeText(`[Visual TDA - ${catName}]\n${trimmedMsg}`);
      } catch {
        // Clipboard access can be restricted; safe fallback
      }
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(`[Visual TDA - ${categoryLabels[category][language]}]\n${message.trim()}`);
      setCopyFeedbackNotice(true);
      setTimeout(() => setCopyFeedbackNotice(false), 3000);
    } catch {
      // Ignored
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
    >
      <div
        ref={dialogRef}
        className="modal-card"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', width: '100%' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
          <div>
            <h4 id="feedback-modal-title" style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text)' }}>
              {language === 'es' ? 'Consejos, Mejoras y Reporte de Bugs' : 'Feedback, Improvements & Bug Reports'}
            </h4>
            <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {language === 'es'
                ? 'Tu mensaje se enviará directamente al equipo de desarrollo para continuar perfeccionando Visual TDA.'
                : 'Your message will be sent directly to the development team to keep improving Visual TDA.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              lineHeight: 1,
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.2rem'
            }}
            aria-label={language === 'es' ? 'Cerrar' : 'Close'}
          >
            ×
          </button>
        </div>

        {status === 'sent' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '0.5rem 0' }}>
            <div
              style={{
                padding: '1.2rem',
                backgroundColor: 'var(--state-solution-bg)',
                border: '1px solid var(--success)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--success)',
                fontSize: '0.9rem'
              }}
            >
              <strong style={{ display: 'block', fontSize: '1rem', marginBottom: '0.35rem' }}>
                {language === 'es' ? '¡Mensaje recibido con éxito!' : 'Feedback received successfully!'}
              </strong>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text)' }}>
                {language === 'es'
                  ? (isAnonymous
                      ? 'Tu mensaje fue enviado de forma anónima. ¡Muchas gracias por colaborar con la mejora de la plataforma!'
                      : 'Tu mensaje fue enviado correctamente. Si ingresaste tu correo, te responderemos a la brevedad.')
                  : (isAnonymous
                      ? 'Your feedback was sent anonymously. Thank you for contributing to the improvement of Visual TDA!'
                      : 'Your message was sent successfully. We will reply shortly to your email.')}
              </p>
            </div>
            <div className="modal-actions" style={{ justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button type="button" className="btn-primary" onClick={onClose}>
                {language === 'es' ? 'Cerrar' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {validationError && (
              <div
                role="alert"
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--error, #ef4444)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--error, #ef4444)',
                  fontSize: '0.8125rem'
                }}
              >
                {validationError}
              </div>
            )}

            {status === 'error' && errorMessage && (
              <div
                role="alert"
                style={{
                  padding: '0.75rem 0.9rem',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid var(--error, #ef4444)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--error, #ef4444)',
                  fontSize: '0.8125rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.4rem'
                }}
              >
                <strong>
                  {language === 'es' ? 'Inconveniente en la entrega:' : 'Delivery problem:'}
                </strong>
                <span>{errorMessage}</span>
                <div style={{ marginTop: '0.2rem' }}>
                  <button
                    type="button"
                    onClick={handleCopyText}
                    style={{
                      background: 'none',
                      border: '1px solid var(--error, #ef4444)',
                      borderRadius: 'var(--radius-xs, 4px)',
                      color: 'var(--error, #ef4444)',
                      padding: '0.2rem 0.5rem',
                      fontSize: '0.75rem',
                      cursor: 'pointer'
                    }}
                  >
                    {copyFeedbackNotice
                      ? (language === 'es' ? 'Texto copiado al portapapeles' : 'Text copied to clipboard')
                      : (language === 'es' ? 'Copiar texto del reporte' : 'Copy report text')}
                  </button>
                </div>
              </div>
            )}

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                <label
                  htmlFor="fb-email"
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    color: isAnonymous ? 'var(--text-muted)' : 'var(--text)'
                  }}
                >
                  {language === 'es' ? 'Tu Correo Electrónico:' : 'Your Email:'}
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <input
                    id="fb-anon"
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => {
                      setIsAnonymous(e.target.checked);
                      if (e.target.checked) {
                        setEmail('');
                        setValidationError(null);
                      }
                    }}
                    style={{ accentColor: 'var(--accent)', cursor: 'pointer', width: '15px', height: '15px' }}
                  />
                  <label htmlFor="fb-anon" style={{ fontSize: '0.78125rem', color: 'var(--text-muted)', cursor: 'pointer' }}>
                    {language === 'es' ? 'Enviar de forma anónima' : 'Send anonymously'}
                  </label>
                </div>
              </div>

              <input
                id="fb-email"
                type="email"
                required={!isAnonymous}
                disabled={isAnonymous}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder={
                  isAnonymous
                    ? (language === 'es' ? '(Envío anónimo activado - no se solicita correo)' : '(Anonymous mode enabled - no email required)')
                    : (language === 'es' ? 'ejemplo@correo.com' : 'example@domain.com')
                }
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  backgroundColor: isAnonymous ? 'var(--surface)' : 'var(--surface-hover)',
                  color: isAnonymous ? 'var(--text-muted)' : 'var(--text)',
                  fontSize: '0.875rem',
                  opacity: isAnonymous ? 0.65 : 1
                }}
              />
            </div>

            <div>
              <label htmlFor="fb-cat" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>
                {language === 'es' ? 'Categoría:' : 'Category:'}
              </label>
              <select
                id="fb-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as 'bug' | 'ui' | 'algorithm' | 'suggestion')}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface-hover)',
                  color: 'var(--text)',
                  fontSize: '0.875rem'
                }}
              >
                <option value="bug">{categoryLabels.bug[language]}</option>
                <option value="ui">{categoryLabels.ui[language]}</option>
                <option value="algorithm">{categoryLabels.algorithm[language]}</option>
                <option value="suggestion">{categoryLabels.suggestion[language]}</option>
              </select>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.25rem' }}>
                <label htmlFor="fb-msg" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)' }}>
                  {language === 'es' ? 'Descripción del Bug o Sugerencia:' : 'Description of Bug or Suggestion:'}
                </label>
                <span style={{ fontSize: '0.75rem', color: message.length > 2000 ? 'var(--error, #ef4444)' : 'var(--text-muted)' }}>
                  {message.length}/2000
                </span>
              </div>
              <textarea
                id="fb-msg"
                required
                rows={4}
                maxLength={2000}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (validationError) setValidationError(null);
                }}
                placeholder={
                  language === 'es'
                    ? 'Describí qué anduvo mal, qué comportamiento esperabas o qué mejora proponés...'
                    : 'Describe what went wrong, what behavior you expected, or what improvement you suggest...'
                }
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface-hover)',
                  color: 'var(--text)',
                  fontSize: '0.875rem',
                  resize: 'vertical'
                }}
              />
            </div>

            {currentExerciseId && (
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {language === 'es' ? 'Ejercicio en curso:' : 'Current exercise:'} <code>{currentExerciseId}</code>
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: '0.5rem' }}>
              <button type="button" className="btn-secondary" onClick={onClose} disabled={status === 'submitting'}>
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button type="submit" className="btn-primary" disabled={status === 'submitting'}>
                {status === 'submitting'
                  ? (language === 'es' ? 'Enviando...' : 'Sending...')
                  : status === 'error'
                    ? (language === 'es' ? 'Reintentar Envío' : 'Retry Sending')
                    : (language === 'es' ? 'Enviar Mensaje' : 'Send Feedback')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
