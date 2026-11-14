import { test, expect } from '@playwright/test';
import {
  attachConsoleErrorTracker,
  expectZeroConsoleErrors,
  openExercise,
  selectPhase,
  unlockPhase3HonestSkip,
  switchLanguage,
  switchTheme
} from './helpers/testHelpers';

test.describe('Visual TDA Smoke Suite', () => {
  test.beforeEach(async ({ page }) => {
    attachConsoleErrorTracker(page);
  });

  test('application root loads with status 200 and renders main layout', async ({ page }) => {
    const response = await page.goto('/');
    expect(response).not.toBeNull();
    expect(response?.status()).toBe(200);

    // Verify title and landmarks
    await expect(page).toHaveTitle(/Visual TDA/);
    await expect(page.locator('header.app-header')).toBeVisible();
    await expect(page.locator('main#main-content')).toBeVisible();
    await expect(page.locator('footer.app-footer')).toBeVisible();

    // Verify brand button
    const brandButton = page.locator('button.brand-button');
    await expect(brandButton).toBeVisible();
    await expect(brandButton.locator('.brand-title')).toHaveText('Visual TDA');

    await expectZeroConsoleErrors(page);
  });

  test('defaults strictly to Spanish (es) on first visit', async ({ page }) => {
    await page.goto('/');

    // Check root html attribute
    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('es');

    // Check language toggle active state
    const activeLangBtn = page.locator('.lang-segmented-control .segmented-btn.active');
    await expect(activeLangBtn).toHaveText('ES');

    // Check default category tab in Spanish
    const activeTab = page.locator('.category-tab.active');
    await expect(activeTab).toContainText(/Todos/i);

    await expectZeroConsoleErrors(page);
  });

  test('renders catalog tracks and exercise cards', async ({ page }) => {
    await page.goto('/');

    // Exercise cards rendered
    const cards = page.locator('.exercise-card');
    await expect(cards.first()).toBeVisible();
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(20);

    // Buttons to explore exercises
    const openButtons = page.locator('.btn-open-exercise');
    const buttonCount = await openButtons.count();
    expect(buttonCount).toBeGreaterThanOrEqual(20);

    await expectZeroConsoleErrors(page);
  });

  test('navigates into an exercise and back to catalog cleanly', async ({ page }) => {
    await page.goto('/');

    // Open an exercise
    await openExercise(page, 'knapsack-greedy');

    // Verify exercise view mounted
    await expect(page.locator('.exercise-title')).toBeVisible();
    await expect(page.locator('.phase-switcher-container')).toBeVisible();

    // Return to catalog
    const backBtn = page.locator('button.btn-back');
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    // Verify catalog returned
    await expect(page.locator('.exercise-grid').first()).toBeVisible();

    await expectZeroConsoleErrors(page);
  });

  test('renders cleanly without horizontal viewport overflow in catalog and exercise views', async ({ page }) => {
    await page.goto('/');

    // Verify no horizontal overflow at document root
    let hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    // Verify interactive elements remain visible
    await expect(page.locator('button.brand-button')).toBeVisible();
    await expect(page.locator('.category-nav')).toBeVisible();

    // Verify absence of horizontal overflow within an exercise view
    await openExercise(page, 'knapsack-dp');
    hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);

    await expectZeroConsoleErrors(page);
  });

  test('transitions cleanly through pedagogical phases: Discover -> Solve -> Honest Skip -> Understand', async ({ page }) => {
    await page.goto('/');
    await openExercise(page, 'knapsack-greedy');

    // Discover phase active by default
    await expect(page.locator('.exercise-view-wrapper')).toBeVisible();

    // Transition to Solve phase
    await selectPhase(page, 'solve');
    await expect(page.locator('.code-editor-input, .code-editor-workspace').first()).toBeVisible();

    // Verify no horizontal overflow in Solve phase
    let hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBe(false);

    // Unlock Phase 3 via Honest Skip modal
    await unlockPhase3HonestSkip(page);

    // Understand phase active with canonical solution
    await expect(page.locator('.canonical-code-display, .understand-view').first()).toBeVisible();

    // Verify no horizontal overflow in Understand phase
    hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBe(false);

    await expectZeroConsoleErrors(page);
  });

  test('supports theme and language switching without error', async ({ page }) => {
    await page.goto('/');

    // Switch to English
    await switchLanguage(page, 'en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    // Switch to Dark theme
    await switchTheme(page, 'dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    // Switch back to Spanish and Light theme
    await switchLanguage(page, 'es');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');

    await switchTheme(page, 'light');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await expectZeroConsoleErrors(page);
  });
});
