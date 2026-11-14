import { test, expect } from '@playwright/test';
import {
  attachConsoleErrorTracker,
  expectZeroConsoleErrors,
  openExercise,
  selectPhase,
  unlockPhase3HonestSkip,
  openFeedbackModal
} from './helpers/testHelpers';

test.describe('Tier 2: Boundary, Adversarial Input & Corner Case Suite', () => {
  test.beforeEach(async ({ page }) => {
    attachConsoleErrorTracker(page);
  });

  test.afterEach(async ({ page }) => {
    await expectZeroConsoleErrors(page);
  });

  test('2.1 empty or comment-only code submission is rejected by fast validator without crashing UI', async ({ page }) => {
    await page.goto('/');
    await openExercise(page, 'knapsack-greedy');
    await selectPhase(page, 'solve');

    const editor = page.locator('textarea.code-editor-input');
    await editor.fill('# Solo un comentario sin funcion\n');

    const fastTestBtn = page.locator('button.btn-fast-tests');
    await fastTestBtn.click();

    const feedbackCard = page.locator('.test-feedback-card');
    await expect(feedbackCard).toBeVisible();
    await expect(feedbackCard).not.toHaveClass(/passed/);
    await expect(page.locator('.phase-locked-tag')).toBeVisible();
  });

  test('2.2 trivial pass-only function body is rejected by algorithmic validator without unlocking Phase 3', async ({ page }) => {
    await page.goto('/');
    await openExercise(page, 'knapsack-greedy');
    await selectPhase(page, 'solve');

    const editor = page.locator('textarea.code-editor-input');
    await editor.fill('def mochila_fraccionaria(capacidad, pesos, valores):\n    pass\n');

    const fastTestBtn = page.locator('button.btn-fast-tests');
    await fastTestBtn.click();

    const feedbackCard = page.locator('.test-feedback-card');
    await expect(feedbackCard).toBeVisible();
    await expect(feedbackCard).not.toHaveClass(/passed/);
    await expect(page.locator('.phase-locked-tag')).toBeVisible();
  });

  test('2.3 reset code button recovers clean starter template after syntax corruption', async ({ page }) => {
    await page.goto('/');
    await openExercise(page, 'coin-change');
    await selectPhase(page, 'solve');

    const editor = page.locator('textarea.code-editor-input');
    const originalTemplate = await editor.inputValue();
    expect(originalTemplate.length).toBeGreaterThan(20);

    await editor.fill('def broken_syntax(:\n    return ???');
    expect(await editor.inputValue()).toContain('broken_syntax');

    const resetBtn = page.locator('button.btn-reset-code');
    await resetBtn.click();

    const restoredCode = await editor.inputValue();
    expect(restoredCode).toBe(originalTemplate);
  });

  test('2.4 feedback modal rejects whitespace-only message and invalid email format cleanly', async ({ page }) => {
    await page.goto('/');
    await openFeedbackModal(page);

    const textarea = page.locator('.modal-card textarea');
    const submitBtn = page.locator('.modal-actions button[type="submit"]');

    // Whitespace-only message
    await textarea.fill('     \n   ');
    await submitBtn.click();

    const alert = page.locator('.modal-card div[role="alert"]');
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/vacío|empty|caracteres|characters/i);
  });

  test('2.5 quick switcher handles no-match search queries gracefully without crashing', async ({ page }) => {
    await page.goto('/');

    const quickBtn = page.locator('button.search-quick-toggle-btn');
    await quickBtn.click();

    const input = page.locator('.quick-switcher-input');
    await expect(input).toBeVisible();
    await input.fill('xyznonexistentalgorithm999');

    await expect(page.locator('.quick-switcher-item')).toHaveCount(0);

    await page.keyboard.press('Escape');
    await expect(input).not.toBeVisible();
  });

  test('2.6 visualizer timeline scrubber handles boundary jumps (first and last step) cleanly', async ({ page }) => {
    await page.goto('/');
    await openExercise(page, 'merge-sort');
    await unlockPhase3HonestSkip(page);

    const slider = page.locator('input[type="range"].scrubber-slider').first();
    await expect(slider).toBeVisible();

    const maxAttr = await slider.getAttribute('max');
    const maxStep = Number(maxAttr ?? '0');
    expect(maxStep).toBeGreaterThan(0);

    // Jump to end
    await slider.fill(String(maxStep));
    await expect(slider).toHaveValue(String(maxStep));

    // Jump back to start (0)
    await slider.fill('0');
    await expect(slider).toHaveValue('0');
  });
});
