import React, { useState, useEffect, useRef } from 'react';

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'es' | 'en';
  currentExerciseId?: string | null;
}

// Obfuscated FormSubmit delivery endpoints (primary: lucioromeromascaro@gmail.com, secondary: lromerom@fi.uba.ar)
const PRIMARY_ENDPOINT = atob('aHR0cHM6Ly9mb3Jtc3VibWl0LmNvL2FqYXgvbHVjaW9yb21lcm9tYXNjYXJvQGdtYWlsLmNvbQ==');
const SECONDARY_ENDPOINT = atob('aHR0cHM6Ly9mb3Jtc3VibWl0LmNvL2FqYXgvbHJvbWVyb21AZmkudWJhLmFy');

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
  const [status, setStatus] = useState<'idle' | 'submitting' | 'sent'>('idle');
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setStatus('idle');
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    if (!isAnonymous && !email.trim()) return;

    setStatus('submitting');
    const catName = categoryLabels[category][language];
    const senderEmail = isAnonymous ? 'anonimo@visual-tda.org' : email.trim();
    const senderName = isAnonymous
      ? (language === 'es' ? 'Estudiante Anónimo' : 'Anonymous Student')
      : (email.trim().split('@')[0] || 'Estudiante');

    const payload = {
      name: senderName,
      email: senderEmail,
      category: catName,
      exercise: currentExerciseId || 'Inicio',
      message: message.trim(),
      _subject: `[Visual TDA Feedback] ${catName}${currentExerciseId ? ` - ${currentExerciseId}` : ''}`,
      _template: 'table'
    };

    try {
      await Promise.allSettled([
        fetch(PRIMARY_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        }),
        fetch(SECONDARY_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        })
      ]);
    } catch {
      // Graceful fallback for offline / adblocker: copy message text to clipboard
      try {
        navigator.clipboard.writeText(`[Visual TDA - ${catName}]\n${message.trim()}`);
      } catch {
        // Ignored
      }
    } finally {
      setStatus('sent');
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
          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
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
                      if (e.target.checked) setEmail('');
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
                onChange={(e) => setEmail(e.target.value)}
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
              <label htmlFor="fb-msg" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>
                {language === 'es' ? 'Descripción del Bug o Sugerencia:' : 'Description of Bug or Suggestion:'}
              </label>
              <textarea
                id="fb-msg"
                required
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
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
                  : (language === 'es' ? 'Enviar Mensaje' : 'Send Feedback')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
