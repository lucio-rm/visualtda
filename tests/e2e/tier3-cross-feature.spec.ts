import { test, expect } from '@playwright/test';
import {
  attachConsoleErrorTracker,
  expectZeroConsoleErrors,
  openExercise,
  goToHome,
  selectPhase,
  unlockPhase3HonestSkip,
  unlockInstructorMode,
  switchLanguage,
  switchTheme
} from './helpers/testHelpers';

test.describe('Tier 3: Cross-Feature Interaction & State Persistence Suite', () => {
  test.beforeEach(async ({ page }) => {
    attachConsoleErrorTracker(page);
  });

  test.afterEach(async ({ page }) => {
    await expectZeroConsoleErrors(page);
  });

  test('3.1 switching UI language while editing code in Solve phase preserves student code buffer', async ({ page }) => {
    await page.goto('/');
    await openExercise(page, 'knapsack-greedy');
    await selectPhase(page, 'solve');

    const editor = page.locator('textarea.code-editor-input');
    const customSnippet = '# Mi solucion en progreso\ndef mochila_fraccionaria(capacidad, pesos, valores):\n    return 42.0\n';
    await editor.fill(customSnippet);

    // Switch language to English and verify code buffer is untouched
    await switchLanguage(page, 'en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    expect(await editor.inputValue()).toBe(customSnippet);

    // Switch back to Spanish
    await switchLanguage(page, 'es');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
    expect(await editor.inputValue()).toBe(customSnippet);
  });

  test('3.2 switching theme during visualizer step playback preserves current timeline step', async ({ page }) => {
    await page.goto('/');
    await openExercise(page, 'dijkstra');
    await unlockPhase3HonestSkip(page);

    const slider = page.locator('input[type="range"].scrubber-slider').first();
    await expect(slider).toBeVisible();
    await slider.fill('2');
    await expect(slider).toHaveValue('2');

    await switchTheme(page, 'dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(slider).toHaveValue('2');

    await switchTheme(page, 'light');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(slider).toHaveValue('2');
  });

  test('3.3 student code persists in localStorage across navigation to catalog and another exercise', async ({ page }) => {
    await page.goto('/');
    await openExercise(page, 'interval-scheduling');
    await selectPhase(page, 'solve');

    const editor = page.locator('textarea.code-editor-input');
    const savedMarker = '# Persistencia verificada entre ejercicios';
    const initialCode = await editor.inputValue();
    await editor.fill(`${initialCode}\n${savedMarker}`);

    // Navigate back to catalog and open a different exercise
    await goToHome(page);
    await openExercise(page, 'merge-sort');
    await expect(page.locator('.exercise-title')).toBeVisible();

    // Return to interval-scheduling and check Solve phase editor
    await goToHome(page);
    await openExercise(page, 'interval-scheduling');
    await selectPhase(page, 'solve');

    expect(await editor.inputValue()).toContain(savedMarker);
  });

  test('3.4 Honest Skip unlocks Understand phase and renders localized theory in both Spanish and English', async ({ page }) => {
    await page.goto('/');
    await openExercise(page, 'coin-change');

    await unlockPhase3HonestSkip(page);
    const understandView = page.locator('.understand-view, .canonical-code-display').first();
    await expect(understandView).toBeVisible();

    // Switch to English in Understand view and verify English theory renders
    await switchLanguage(page, 'en');
    await expect(page.locator('.theory-content, .understand-view').first()).toContainText(/Problem|Recurrence|Complexity/i);

    // Switch back to Spanish
    await switchLanguage(page, 'es');
    await expect(page.locator('.theory-content, .understand-view').first()).toBeVisible();
  });

  test('3.5 Instructor mode persists across multiple exercises in the session', async ({ page }) => {
    await page.goto('/');
    await unlockInstructorMode(page, 'MEL75.29');

    await openExercise(page, 'n-queens');
    await expect(page.locator('.phase-unlocked-tag')).toBeVisible();
    await selectPhase(page, 'understand');
    await expect(page.locator('.understand-view, .canonical-code-display').first()).toBeVisible();

    await goToHome(page);
    await openExercise(page, 'max-flow');
    await expect(page.locator('.phase-unlocked-tag')).toBeVisible();
    await selectPhase(page, 'understand');
    await expect(page.locator('.understand-view, .canonical-code-display').first()).toBeVisible();
  });
});
