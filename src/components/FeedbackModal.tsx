import React, { useState, useEffect, useRef } from 'react';

export interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'es' | 'en';
  currentExerciseId?: string | null;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  language,
  currentExerciseId
}) => {
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<'bug' | 'ui' | 'algorithm' | 'suggestion'>('bug');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sent'>('idle');
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

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !email.trim()) return;

    const catName = categoryLabels[category][language];
    const subject = encodeURIComponent(`[Visual TDA Feedback] ${catName}${currentExerciseId ? ` - ${currentExerciseId}` : ''}`);
    const bodyContent = `De: ${email}\nCategoría: ${catName}\nEjercicio Activo: ${currentExerciseId || 'Inicio'}\nFecha: ${new Date().toISOString()}\n\nMensaje / Descripción del problema:\n${message}\n`;
    const mailtoUrl = `mailto:lromerom@fi.uba.ar?subject=${subject}&body=${encodeURIComponent(bodyContent)}`;

    try {
      navigator.clipboard.writeText(bodyContent);
    } catch {
      // Ignored
    }

    window.location.href = mailtoUrl;
    setStatus('sent');
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
                ? 'Tu mensaje se enviará directamente al autor (Lucio Romero Mascaró - lromerom@fi.uba.ar) para continuar mejorando Visual TDA.'
                : 'Your message will be sent directly to the author (Lucio Romero Mascaró - lromerom@fi.uba.ar) to keep improving Visual TDA.'}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0' }}>
            <div
              style={{
                padding: '1rem',
                backgroundColor: 'var(--state-solution-bg)',
                border: '1px solid var(--success)',
                borderRadius: 'var(--radius-sm)',
                color: 'var(--success)',
                fontSize: '0.9rem'
              }}
            >
              <strong>{language === 'es' ? '¡Gracias por tu mensaje!' : 'Thank you for your feedback!'}</strong>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>
                {language === 'es'
                  ? 'Se ha generado el correo para lromerom@fi.uba.ar y se copió el texto al portapapeles. Te responderemos a la brevedad.'
                  : 'An email has been drafted to lromerom@fi.uba.ar and the text was copied to your clipboard. We will reply shortly.'}
              </p>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-primary" onClick={onClose}>
                {language === 'es' ? 'Cerrar' : 'Close'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            <div>
              <label htmlFor="fb-email" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', marginBottom: '0.25rem' }}>
                {language === 'es' ? 'Tu Correo Electrónico (para responderte):' : 'Your Email (for response):'}
              </label>
              <input
                id="fb-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={language === 'es' ? 'ejemplo@fi.uba.ar' : 'your.email@example.com'}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--surface-hover)',
                  color: 'var(--text)',
                  fontSize: '0.875rem'
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
              <button type="button" className="btn-secondary" onClick={onClose}>
                {language === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button type="submit" className="btn-primary">
                {language === 'es' ? 'Enviar a lromerom@fi.uba.ar' : 'Send to lromerom@fi.uba.ar'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
