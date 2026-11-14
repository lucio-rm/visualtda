// @vitest-environment happy-dom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { LanguageProvider, useLanguage } from '../src/i18n/LanguageContext';

// @ts-expect-error React act environment declaration for happy-dom
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const TestConsumer: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  return (
    <div>
      <span data-testid="current-lang">{language}</span>
      <button onClick={() => setLanguage('en')} data-testid="switch-en">English</button>
    </div>
  );
};

describe('LanguageContext Default & Persistence', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    localStorage.clear();
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
  });

  it('strictly defaults to Spanish (es) on first visit even if navigator.language is English', async () => {
    Object.defineProperty(navigator, 'language', {
      value: 'en-US',
      configurable: true
    });

    expect(localStorage.getItem('visual_tda_lang')).toBeNull();

    await act(async () => {
      root.render(
        <LanguageProvider>
          <TestConsumer />
        </LanguageProvider>
      );
    });

    const langSpan = container.querySelector('[data-testid="current-lang"]');
    expect(langSpan?.textContent).toBe('es');
    expect(document.documentElement.lang).toBe('es');
  });

  it('preserves existing language preference when stored in localStorage', async () => {
    localStorage.setItem('visual_tda_lang', 'en');

    await act(async () => {
      root.render(
        <LanguageProvider>
          <TestConsumer />
        </LanguageProvider>
      );
    });

    const langSpan = container.querySelector('[data-testid="current-lang"]');
    expect(langSpan?.textContent).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('updates state and persists to localStorage on setLanguage', async () => {
    await act(async () => {
      root.render(
        <LanguageProvider>
          <TestConsumer />
        </LanguageProvider>
      );
    });

    const switchBtn = container.querySelector('[data-testid="switch-en"]') as HTMLButtonElement;
    await act(async () => {
      switchBtn.click();
    });

    const langSpan = container.querySelector('[data-testid="current-lang"]');
    expect(langSpan?.textContent).toBe('en');
    expect(localStorage.getItem('visual_tda_lang')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });
});
