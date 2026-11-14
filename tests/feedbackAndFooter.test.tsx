// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Footer } from '../src/components/Footer';
import { FeedbackModal } from '../src/components/FeedbackModal';
import { RoadAntennasPlayground } from '../src/components/visualizers/RoadAntennasPlayground';
import { LanguageProvider } from '../src/i18n/LanguageContext';

// @ts-expect-error React act environment declaration for happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

describe('Footer, FeedbackModal Privacy & Road Antennas Baseline', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('Footer component & Sovereign Institutional Attribution', () => {
    it('renders sovereign institutional branding and repository link without personal author credit', async () => {
      await act(async () => {
        root.render(
          <LanguageProvider>
            <Footer />
          </LanguageProvider>
        );
      });

      const authorText = container.querySelector('.footer-institutional-text');
      expect(authorText).not.toBeNull();
      expect(authorText?.textContent).toBe(
        'Visual TDA — Plataforma Universitaria para la Enseñanza de Teoría de Algoritmos'
      );

      const ghLink = container.querySelector('.footer-gh-link') as HTMLAnchorElement;
      expect(ghLink).not.toBeNull();
      expect(ghLink.href).toBe('https://github.com/lucio-rm/visualtda');
      expect(ghLink.getAttribute('aria-label')).toBe('Repositorio del Proyecto — Visual TDA');
      expect(ghLink.getAttribute('title')).toBe('Repositorio del Proyecto');
      // Must not display personal username as visible text inside link
      expect(ghLink.textContent?.trim()).toBe('');
      // Must have SVG icon inside
      expect(ghLink.querySelector('svg')).not.toBeNull();

      // Assert absence of personal author name and professor dedications in footer
      const footerHtml = container.querySelector('footer')?.innerHTML || '';
      expect(footerHtml.includes('Lucio Romero Mascaró')).toBe(false);
      expect(footerHtml.includes('Buchwald')).toBe(false);
      expect(footerHtml.includes('Genender')).toBe(false);
      expect(footerHtml.includes('Kleinberg')).toBe(false);
      expect(footerHtml.includes('Tardos')).toBe(false);
    });

    it('renders sovereign institutional branding in English when language is en', async () => {
      localStorage.setItem('visual_tda_lang', 'en');
      await act(async () => {
        root.render(
          <LanguageProvider>
            <Footer />
          </LanguageProvider>
        );
      });

      const authorText = container.querySelector('.footer-institutional-text');
      expect(authorText).not.toBeNull();
      expect(authorText?.textContent).toBe(
        'Visual TDA — University Platform for Theory of Algorithms Education'
      );

      const ghLink = container.querySelector('.footer-gh-link') as HTMLAnchorElement;
      expect(ghLink.getAttribute('aria-label')).toBe('Project Repository — Visual TDA');
      expect(ghLink.getAttribute('title')).toBe('Project Repository');
    });
  });

  describe('FeedbackModal component & Reliability', () => {
    it('does not leak or display any personal email addresses in the DOM', async () => {
      await act(async () => {
        root.render(
          <FeedbackModal
            isOpen={true}
            onClose={() => {}}
            language="es"
          />
        );
      });

      const bodyHtml = document.body.innerHTML;
      expect(bodyHtml.includes('lromerom@fi.uba.ar')).toBe(false);
      expect(bodyHtml.includes('lromerom')).toBe(false);
      expect(bodyHtml.includes('lucioromeromascaro@gmail.com')).toBe(false);
    });

    it('toggles anonymous submission, disabling and clearing email input', async () => {
      await act(async () => {
        root.render(
          <FeedbackModal
            isOpen={true}
            onClose={() => {}}
            language="es"
          />
        );
      });

      const anonCheckbox = container.querySelector('#fb-anon') as HTMLInputElement;
      const emailInput = container.querySelector('#fb-email') as HTMLInputElement;

      expect(anonCheckbox).not.toBeNull();
      expect(emailInput).not.toBeNull();
      expect(anonCheckbox.checked).toBe(false);
      expect(emailInput.required).toBe(true);
      expect(emailInput.disabled).toBe(false);

      // Click anonymous checkbox
      await act(async () => {
        anonCheckbox.click();
      });

      expect(anonCheckbox.checked).toBe(true);
      expect(emailInput.disabled).toBe(true);
      expect(emailInput.required).toBe(false);
    });

    it('submits silently via fetch when res.ok === true and shows success state', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true })
      });
      globalThis.fetch = mockFetch;

      await act(async () => {
        root.render(
          <FeedbackModal
            isOpen={true}
            onClose={() => {}}
            language="es"
            currentExerciseId="road-antennas-greedy"
          />
        );
      });

      const anonCheckbox = container.querySelector('#fb-anon') as HTMLInputElement;
      const msgInput = container.querySelector('#fb-msg') as HTMLTextAreaElement;
      const form = container.querySelector('form') as HTMLFormElement;

      // Select anonymous
      await act(async () => {
        anonCheckbox.click();
      });

      // Type valid message
      await act(async () => {
        const protoSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
        protoSetter?.call(msgInput, 'Excelente plataforma!');
        msgInput.dispatchEvent(new Event('input', { bubbles: true }));
        msgInput.dispatchEvent(new Event('change', { bubbles: true }));
      });

      // Submit form
      await act(async () => {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

      expect(mockFetch).toHaveBeenCalledTimes(2);
      const [calledUrl, calledInit] = mockFetch.mock.calls[0];
      expect(calledUrl).toContain('formsubmit.co/ajax');
      const body = JSON.parse(calledInit.body);
      expect(body.message).toBe('Excelente plataforma!');
      expect(body.exercise).toBe('road-antennas-greedy');
      expect(body.email).toBe('anonimo@visualtda.org');

      // Verify in-modal success message appears
      expect(container.textContent).toContain('¡Mensaje recibido con éxito!');
      expect(document.body.innerHTML.includes('lromerom@fi.uba.ar')).toBe(false);
    });

    it('validates message length: rejects less than 3 characters without calling fetch', async () => {
      const mockFetch = vi.fn();
      globalThis.fetch = mockFetch;

      await act(async () => {
        root.render(
          <FeedbackModal
            isOpen={true}
            onClose={() => {}}
            language="es"
          />
        );
      });

      const anonCheckbox = container.querySelector('#fb-anon') as HTMLInputElement;
      const msgInput = container.querySelector('#fb-msg') as HTMLTextAreaElement;
      const form = container.querySelector('form') as HTMLFormElement;

      await act(async () => {
        anonCheckbox.click();
      });

      // Type too short message (2 chars)
      await act(async () => {
        const protoSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
        protoSetter?.call(msgInput, 'Ok');
        msgInput.dispatchEvent(new Event('input', { bubbles: true }));
        msgInput.dispatchEvent(new Event('change', { bubbles: true }));
      });

      await act(async () => {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(container.textContent).toContain('El mensaje debe contener al menos 3 caracteres.');
    });

    it('validates non-anonymous email format with regex check', async () => {
      const mockFetch = vi.fn();
      globalThis.fetch = mockFetch;

      await act(async () => {
        root.render(
          <FeedbackModal
            isOpen={true}
            onClose={() => {}}
            language="es"
          />
        );
      });

      const emailInput = container.querySelector('#fb-email') as HTMLInputElement;
      const msgInput = container.querySelector('#fb-msg') as HTMLTextAreaElement;
      const form = container.querySelector('form') as HTMLFormElement;

      // Type invalid email
      await act(async () => {
        const protoSetterEmail = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
        protoSetterEmail?.call(emailInput, 'correo-invalido-sin-arroba');
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        emailInput.dispatchEvent(new Event('change', { bubbles: true }));

        const protoSetterMsg = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
        protoSetterMsg?.call(msgInput, 'Reporte con email incorrecto');
        msgInput.dispatchEvent(new Event('input', { bubbles: true }));
        msgInput.dispatchEvent(new Event('change', { bubbles: true }));
      });

      await act(async () => {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

      expect(mockFetch).not.toHaveBeenCalled();
      expect(container.textContent).toContain('Por favor, ingresá una dirección de correo electrónico válida.');
    });

    it('handles HTTP error responses (res.ok === false / 500) and displays clear error state without false success', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal Server Error' })
      });
      globalThis.fetch = mockFetch;

      await act(async () => {
        root.render(
          <FeedbackModal
            isOpen={true}
            onClose={() => {}}
            language="es"
          />
        );
      });

      const anonCheckbox = container.querySelector('#fb-anon') as HTMLInputElement;
      const msgInput = container.querySelector('#fb-msg') as HTMLTextAreaElement;
      const form = container.querySelector('form') as HTMLFormElement;

      await act(async () => {
        anonCheckbox.click();
      });

      await act(async () => {
        const protoSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
        protoSetter?.call(msgInput, 'Mensaje que fallará en el servidor');
        msgInput.dispatchEvent(new Event('input', { bubbles: true }));
        msgInput.dispatchEvent(new Event('change', { bubbles: true }));
      });

      await act(async () => {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

      // Must NOT display success message
      expect(container.textContent).not.toContain('¡Mensaje recibido con éxito!');
      // Must display error state
      expect(container.textContent).toContain('Inconveniente en la entrega');
      expect(container.textContent).toContain('HTTP 500');
      // Submit button should offer retry
      expect(container.textContent).toContain('Reintentar Envío');
    });

    it('handles network failure (fetch throws) and sets error state gracefully', async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error('Network connection failed'));
      globalThis.fetch = mockFetch;

      await act(async () => {
        root.render(
          <FeedbackModal
            isOpen={true}
            onClose={() => {}}
            language="en"
          />
        );
      });

      const anonCheckbox = container.querySelector('#fb-anon') as HTMLInputElement;
      const msgInput = container.querySelector('#fb-msg') as HTMLTextAreaElement;
      const form = container.querySelector('form') as HTMLFormElement;

      await act(async () => {
        anonCheckbox.click();
      });

      await act(async () => {
        const protoSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
        protoSetter?.call(msgInput, 'Testing offline network behavior');
        msgInput.dispatchEvent(new Event('input', { bubbles: true }));
        msgInput.dispatchEvent(new Event('change', { bubbles: true }));
      });

      await act(async () => {
        form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
      });

      // Must NOT set status to sent
      expect(container.textContent).not.toContain('Feedback received successfully!');
      // Must show English error state
      expect(container.textContent).toContain('Delivery problem');
      expect(container.textContent).toContain('Network connection failed');
      expect(container.textContent).toContain('Retry Sending');
    });
  });

  describe('RoadAntennasPlayground subtle baseline', () => {
    it('renders subtle baseline and does NOT overlay full-block green rectangles', async () => {
      await act(async () => {
        root.render(
          <LanguageProvider>
            <RoadAntennasPlayground />
          </LanguageProvider>
        );
      });

      // Initially no antennas placed
      const baseline = container.querySelector('.canonical-optimal-baseline');
      expect(baseline).toBeNull();

      // No large intrusive rects
      const largeRects = Array.from(container.querySelectorAll('rect')).filter(
        (r) => r.getAttribute('height') === '60' && r.getAttribute('stroke') === 'var(--success)'
      );
      expect(largeRects.length).toBe(0);
    });
  });
});
