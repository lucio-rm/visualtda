import { Page, expect } from '@playwright/test';

const pageConsoleErrorsMap = new WeakMap<Page, string[]>();

/**
 * Console error tracking helper.
 * Attaches a listener to page console and unhandled page errors.
 */
export function attachConsoleErrorTracker(page: Page): string[] {
  const errors: string[] = [];
  pageConsoleErrorsMap.set(page, errors);

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      const locUrl = msg.location()?.url || '';
      // Ignore known external CDN resource errors or mocked FormSubmit error tests
      if (
        text.includes('cdn.jsdelivr.net') ||
        text.includes('formsubmit.co') ||
        locUrl.includes('cdn.jsdelivr.net') ||
        locUrl.includes('formsubmit.co')
      ) {
        return;
      }
      errors.push(text);
    }
  });

  page.on('pageerror', (err) => {
    errors.push(err.message);
  });

  return errors;
}

/**
 * Asserts that zero unhandled console errors or page errors occurred.
 */
export async function expectZeroConsoleErrors(page: Page): Promise<void> {
  const recorded = pageConsoleErrorsMap.get(page);
  expect(
    recorded,
    'Console error tracker was not attached to this page. Ensure attachConsoleErrorTracker(page) is called in test setup.'
  ).toBeDefined();
  expect(recorded).toEqual([]);
}

/**
 * Navigates to the application root home catalog.
 */
export async function goToHome(page: Page): Promise<void> {
  const brandBtn = page.locator('button.brand-button');
  if (await brandBtn.isVisible()) {
    await brandBtn.click();
  } else {
    await page.goto('/');
  }
  await page.locator('.catalog-tracks-container, .exercise-grid, .welcome-banner').first().waitFor({ state: 'visible' });
}

/**
 * Opens an exercise by its unique ID using the Quick Switcher or catalog cards.
 */
export async function openExercise(page: Page, exerciseId: string): Promise<void> {
  const quickSwitcherBtn = page.locator('button.search-quick-toggle-btn');
  if (await quickSwitcherBtn.isVisible()) {
    await quickSwitcherBtn.click();
    const input = page.locator('.quick-switcher-input');
    await input.waitFor({ state: 'visible' });
    await input.fill(exerciseId);
    const item = page.locator('.quick-switcher-item').first();
    await item.waitFor({ state: 'visible' });
    await item.click();
  } else {
    await page.keyboard.press('Control+K');
    const input = page.locator('.quick-switcher-input');
    if (await input.isVisible()) {
      await input.fill(exerciseId);
      const item = page.locator('.quick-switcher-item').first();
      await item.waitFor({ state: 'visible' });
      await item.click();
    } else {
      const cardBtn = page.locator('.btn-open-exercise').first();
      await cardBtn.click();
    }
  }

  await page.locator('.exercise-view-wrapper').waitFor({ state: 'visible' });
}

/**
 * Selects a category filter tab by its visible title (e.g. 'Greedy', 'División y Conquista', 'Todos').
 */
export async function selectCategory(page: Page, categoryName: string): Promise<void> {
  const tab = page.locator('.category-tab').filter({ hasText: new RegExp(categoryName, 'i') }).first();
  await tab.waitFor({ state: 'visible' });
  await tab.click();
}

/**
 * Switches the active UI language to 'es' or 'en'.
 */
export async function switchLanguage(page: Page, targetLang: 'es' | 'en'): Promise<void> {
  const langText = targetLang.toUpperCase();
  const btn = page.locator('.lang-segmented-control .segmented-btn').filter({ hasText: langText }).first();
  if (await btn.isVisible()) {
    await btn.click();
  } else {
    await page.locator('select.lang-select').selectOption(targetLang);
  }

  await page.waitForFunction(
    (expected) => document.documentElement.getAttribute('lang') === expected,
    targetLang
  );
}

/**
 * Switches the visual theme to 'light', 'dark', or 'system'.
 */
export async function switchTheme(page: Page, targetTheme: 'light' | 'dark' | 'system'): Promise<void> {
  let labelPattern: RegExp;
  if (targetTheme === 'system') {
    labelPattern = /auto|sistema|system/i;
  } else if (targetTheme === 'light') {
    labelPattern = /claro|light/i;
  } else {
    labelPattern = /oscuro|dark/i;
  }

  const btn = page.locator('.theme-segmented-control .segmented-btn').filter({ hasText: labelPattern }).first();
  if (await btn.isVisible()) {
    await btn.click();
  } else {
    await page.locator('select.theme-select:not(.lang-select)').selectOption(targetTheme);
  }

  await page.waitForFunction((theme) => {
    const attr = document.documentElement.getAttribute('data-theme');
    if (theme === 'system') {
      return attr === null || attr === 'system';
    }
    return attr === theme;
  }, targetTheme);
}

/**
 * Switches pedagogical phase tab inside an exercise view.
 */
export async function selectPhase(page: Page, phase: 'discover' | 'solve' | 'understand'): Promise<void> {
  const pattern = phase === 'discover'
    ? /\b(descubrir|discover)\b|01/i
    : phase === 'solve'
    ? /\b(resolver|solve)\b|02/i
    : /\b(comprender|understand)\b|03/i;

  const tab = page.locator('.phase-button').filter({ hasText: pattern }).first();
  await tab.waitFor({ state: 'visible' });
  await tab.click();
}

/**
 * Unlocks Phase 3 (Understand) via the pedagogical Honest Skip modal confirmation.
 */
export async function unlockPhase3HonestSkip(page: Page): Promise<void> {
  // Ensure Solve phase is active
  await selectPhase(page, 'solve');

  // Trigger skip modal
  const skipBtn = page.locator('.skip-solution-card button').first();
  await skipBtn.waitFor({ state: 'visible' });
  await skipBtn.click();

  // Find modal and confirm using structural identifier
  const modalCard = page.locator('.modal-overlay[role="dialog"] .modal-card').filter({
    has: page.locator('#skip-dialog-title, #phase-friction-title')
  }).first();
  await modalCard.waitFor({ state: 'visible' });

  const confirmBtn = modalCard.locator('.modal-actions button.btn-primary').first();
  await confirmBtn.waitFor({ state: 'visible' });
  await confirmBtn.click();

  // Verify transition to Understand view
  await page.locator('.canonical-code-display, .understand-view').first().waitFor({ state: 'visible' });
}

/**
 * Unlocks Instructor Mode using password credentials (defaults to 'MEL75.29').
 */
export async function unlockInstructorMode(page: Page, password = 'MEL75.29'): Promise<void> {
  const toggleBtn = page.locator('button.instructor-mode-toggle');
  await toggleBtn.waitFor({ state: 'visible' });

  const isAlreadyActive = await toggleBtn.evaluate((el) => el.classList.contains('active'));
  if (isAlreadyActive) {
    return;
  }

  await toggleBtn.click();

  const modalInput = page.locator('#instructor-password-input');
  await modalInput.waitFor({ state: 'visible' });
  await modalInput.fill(password);

  const submitBtn = page.locator('.instructor-auth-card button[type="submit"]');
  await submitBtn.click();

  await page.locator('button.instructor-mode-toggle.active').waitFor({ state: 'visible' });
}

/**
 * Opens the feedback submission modal from the footer.
 */
export async function openFeedbackModal(page: Page): Promise<void> {
  const feedbackBtn = page.locator('button.footer-feedback-btn');
  await feedbackBtn.waitFor({ state: 'visible' });
  await feedbackBtn.click();

  const modal = page.locator('.modal-overlay[role="dialog"]').filter({
    has: page.locator('#feedback-modal-title')
  });
  await modal.waitFor({ state: 'visible' });
}
