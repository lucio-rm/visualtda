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

  describe('Footer component', () => {
    it('renders author attribution and square github button without username text', async () => {
      await act(async () => {
        root.render(
          <LanguageProvider>
            <Footer />
          </LanguageProvider>
        );
      });

      const authorText = container.querySelector('.footer-author-text');
      expect(authorText).not.toBeNull();
      expect(authorText?.textContent).toContain('Author — Lucio Romero Mascaró');

      const ghLink = container.querySelector('.footer-gh-link') as HTMLAnchorElement;
      expect(ghLink).not.toBeNull();
      expect(ghLink.href).toBe('https://github.com/lucio-rm');
      expect(ghLink.getAttribute('aria-label')).toContain('GitHub');
      // Must not display username as visible text inside link
      expect(ghLink.textContent?.trim()).toBe('');
      // Must have the SVG icon inside
      expect(ghLink.querySelector('svg')).not.toBeNull();
    });
  });

  describe('FeedbackModal component & Email Privacy', () => {
    it('does not leak or display the author personal email address anywhere in the DOM', async () => {
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

    it('submits silently via fetch without reloading page and shows success state', async () => {
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

      // Type message using prototype setter for React controlled component
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

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [calledUrl, calledInit] = mockFetch.mock.calls[0];
      expect(calledUrl).toContain('formsubmit.co/ajax');
      const body = JSON.parse(calledInit.body);
      expect(body.message).toBe('Excelente plataforma!');
      expect(body.exercise).toBe('road-antennas-greedy');

      // Verify in-modal success message appears
      expect(container.textContent).toContain('¡Mensaje recibido con éxito!');
      expect(document.body.innerHTML.includes('lromerom@fi.uba.ar')).toBe(false);
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
