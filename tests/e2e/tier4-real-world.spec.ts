import { test, expect } from '@playwright/test';
import {
  attachConsoleErrorTracker,
  expectZeroConsoleErrors,
  openExercise,
  goToHome,
  selectPhase,
  unlockPhase3HonestSkip,
  openFeedbackModal
} from './helpers/testHelpers';

test.describe('Tier 4: Real-World Student Journeys & Network Resilience Suite', () => {
  test.beforeEach(async ({ page }) => {
    attachConsoleErrorTracker(page);
  });

  test.afterEach(async ({ page }) => {
    await expectZeroConsoleErrors(page);
  });

  test('4.1 complete student journey: Catalog -> Discover -> Solve (valid solution passes) -> Understand unlocked', async ({ page }) => {
    await page.goto('/');

    // 1. Open Fractional Knapsack from catalog
    await openExercise(page, 'knapsack-greedy');
    await expect(page.locator('.exercise-title')).toBeVisible();

    // 2. Explore Discover phase playground
    await expect(page.locator('.discover-view, .knapsack-playground-card').first()).toBeVisible();

    // 3. Move to Solve phase and write a mathematically valid O(n log n) greedy solution
    await selectPhase(page, 'solve');
    const editor = page.locator('textarea.code-editor-input');
    const validSolution = [
      'def mochila_fraccionaria(capacidad, pesos, valores):',
      '    pares = sorted(zip(pesos, valores), key=lambda x: x[1] / x[0], reverse=True)',
      '    total = 0.0',
      '    restante = capacidad',
      '    for p, v in pares:',
      '        if restante <= 0:',
      '            break',
      '        tomar = min(restante, p)',
      '        total += tomar * (v / p)',
      '        restante -= tomar',
      '    return total'
    ].join('\n');

    await editor.fill(validSolution);

    const fastTestBtn = page.locator('button.btn-fast-tests');
    await fastTestBtn.click();

    // 4. Verify fast validator passes and unlocks Phase 3 automatically
    const feedbackCard = page.locator('.test-feedback-card.passed');
    await expect(feedbackCard).toBeVisible();
    await expect(page.locator('.phase-unlocked-tag')).toBeVisible();

    // 5. Enter Understand phase and inspect timeline scrubber, canonical code & theory
    await selectPhase(page, 'understand');
    const slider = page.locator('input[type="range"].scrubber-slider').first();
    await expect(slider).toBeVisible();
    await slider.fill('1');
    await expect(slider).toHaveValue('1');
    await expect(page.locator('.canonical-code-display, .understand-view').first()).toBeVisible();
  });

  test('4.2 mobile viewport (390x844) full student journey renders cleanly with zero horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    // Check catalog overflow at 390px
    let hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBe(false);

    // Check road-antennas (previously wide visualizer) at 390px
    await openExercise(page, 'road-antennas');
    hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBe(false);

    // Check Solve phase at 390px
    await selectPhase(page, 'solve');
    hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBe(false);

    // Check Understand phase at 390px
    await unlockPhase3HonestSkip(page);
    hasOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasOverflow).toBe(false);

    await goToHome(page);
  });

  test('4.3 feedback submission flow handles HTTP 500 failure gracefully and succeeds on HTTP 200 retry', async ({ page }) => {
    let attemptCount = 0;

    await page.route('https://formsubmit.co/ajax/**', async (route) => {
      attemptCount += 1;
      // FeedbackModal dispatches to primary + secondary endpoints per click (2 requests per submission)
      if (attemptCount <= 2) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: 'false', message: 'Internal Server Error' })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: 'true', message: 'Feedback received' })
        });
      }
    });

    await page.goto('/');
    await openFeedbackModal(page);

    const textarea = page.locator('.modal-card textarea');
    const emailInput = page.locator('.modal-card input[type="email"]');
    const submitBtn = page.locator('.modal-actions button[type="submit"]');

    await textarea.fill('Excelente visualizacion del algoritmo de Dijkstra en el paso de relajacion.');
    await emailInput.fill('estudiante@fi.uba.ar');

    // First attempt -> mocked HTTP 500 -> should show error alert and NOT false-positive success
    await submitBtn.click();
    const errorAlert = page.locator('.modal-card div[role="alert"]');
    await expect(errorAlert).toBeVisible();

    // Second attempt -> mocked HTTP 200 -> should display confirmation state
    await submitBtn.click();
    await expect(page.locator('.modal-card')).toContainText(/gracias|enviado|thank|sent|recibido/i);
  });
});
