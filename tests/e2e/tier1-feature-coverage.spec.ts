import { test, expect } from '@playwright/test';
import {
  attachConsoleErrorTracker,
  expectZeroConsoleErrors,
  openExercise,
  selectCategory,
  selectPhase,
  unlockPhase3HonestSkip,
  unlockInstructorMode,
  openFeedbackModal,
  switchLanguage,
  switchTheme
} from './helpers/testHelpers';

test.describe('Tier 1: Feature Coverage Suite', () => {
  test.beforeEach(async ({ page }) => {
    attachConsoleErrorTracker(page);
  });

  test.afterEach(async ({ page }) => {
    await expectZeroConsoleErrors(page);
  });

  // =========================================================================
  // 1. Catalog & Navigation
  // =========================================================================
  test.describe('Feature 1: Catalog & Navigation', () => {
    test('1.1 catalog root view renders track sections, header branding, and exercise cards', async ({ page }) => {
      await page.goto('/');

      await expect(page).toHaveTitle(/Visual TDA/);
      await expect(page.locator('header.app-header')).toBeVisible();
      await expect(page.locator('button.brand-button .brand-title')).toHaveText('Visual TDA');
      await expect(page.locator('.category-nav')).toBeVisible();

      const cards = page.locator('.exercise-card');
      await expect(cards.first()).toBeVisible();
      const count = await cards.count();
      expect(count).toBeGreaterThanOrEqual(20);
    });

    test('1.2 category filter equivalence class - Greedy filters cards correctly', async ({ page }) => {
      await page.goto('/');
      await selectCategory(page, 'Greedy');

      const activeTab = page.locator('.category-tab.active');
      await expect(activeTab).toContainText(/Greedy/i);

      const cards = page.locator('.exercise-card');
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
      expect(count).toBeLessThan(35);

      const firstTitle = page.locator('.exercise-card .card-title').first();
      await expect(firstTitle).toBeVisible();
    });

    test('1.3 category filter equivalence class - Divide and Conquer filters cards correctly', async ({ page }) => {
      await page.goto('/');
      await selectCategory(page, 'División y Conquista');

      const activeTab = page.locator('.category-tab.active');
      await expect(activeTab).toContainText(/División y Conquista|Divide/i);

      const cards = page.locator('.exercise-card');
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('1.4 category filter equivalence class - Dynamic Programming filters cards correctly', async ({ page }) => {
      await page.goto('/');
      await selectCategory(page, 'Programación Dinámica');

      const activeTab = page.locator('.category-tab.active');
      await expect(activeTab).toContainText(/Programación Dinámica|Dynamic/i);

      const cards = page.locator('.exercise-card');
      const count = await cards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('1.5 Quick Switcher search modal navigates directly to exercise', async ({ page }) => {
      await page.goto('/');

      const quickBtn = page.locator('button.search-quick-toggle-btn');
      await expect(quickBtn).toBeVisible();
      await quickBtn.click();

      const input = page.locator('.quick-switcher-input');
      await expect(input).toBeVisible();
      await input.fill('reinas');

      const item = page.locator('.quick-switcher-item').first();
      await expect(item).toBeVisible();
      await item.click();

      await expect(page.locator('.exercise-view-wrapper')).toBeVisible();
      await expect(page.locator('.exercise-title')).toContainText(/reinas|queens/i);
    });

    test('1.6 back-to-catalog button and brand navigation restore catalog cleanly', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');

      await expect(page.locator('.exercise-view-wrapper')).toBeVisible();

      // Return via back button
      const backBtn = page.locator('button.btn-back');
      await expect(backBtn).toBeVisible();
      await backBtn.click();

      await expect(page.locator('.exercise-grid').first()).toBeVisible();

      // Re-open and return via brand button
      await openExercise(page, 'knapsack-greedy');
      await page.locator('button.brand-button').click();
      await expect(page.locator('.exercise-grid').first()).toBeVisible();
    });
  });

  // =========================================================================
  // 2. Interactive Visualizations (Discover Phase)
  // =========================================================================
  test.describe('Feature 2: Interactive Visualizations (Discover & Understand Phases)', () => {
    test('2.1 Greedy paradigm mounts Knapsack Greedy visualizer with items and bag', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');
      await unlockPhase3HonestSkip(page);

      await expect(page.locator('.knapsack-greedy-visualizer, .greedy-bag-pane').first()).toBeVisible();
      await expect(page.locator('.step-tag')).toBeVisible();
      await expect(page.locator('.timeline-controls-bar')).toBeVisible();
    });

    test('2.2 Divide and Conquer paradigm mounts MergeSort visualizer with array chart', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'merge-sort');
      await unlockPhase3HonestSkip(page);

      await expect(page.locator('.mergesort-visualizer')).toBeVisible();
      await expect(page.locator('.bars-chart-container')).toBeVisible();
      await expect(page.locator('.step-tag')).toBeVisible();
    });

    test('2.3 Dynamic Programming paradigm mounts Knapsack DP visualizer with DP table', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-dp');
      await unlockPhase3HonestSkip(page);

      await expect(page.locator('.knapsack-dp-visualizer')).toBeVisible();
      await expect(page.locator('.dp-table-wrapper')).toBeVisible();
      await expect(page.locator('.dp-table')).toBeVisible();
    });

    test('2.4 Backtracking paradigm mounts N-Queens visualizer with chessboard stage', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'n-queens');
      await unlockPhase3HonestSkip(page);

      await expect(page.locator('.nqueens-visualizer-card')).toBeVisible();
      await expect(page.locator('.visualizer-stage')).toBeVisible();
      await expect(page.locator('.board-size-selector')).toBeVisible();
    });

    test('2.5 Interval Scheduling mounts interval chart visualizer', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'interval-scheduling');
      await unlockPhase3HonestSkip(page);

      await expect(page.locator('.interval-visualizer-card')).toBeVisible();
      await expect(page.locator('.interval-chart-container')).toBeVisible();
      await expect(page.locator('.interval-chart-svg')).toBeVisible();
    });
  });

  // =========================================================================
  // 3. Timeline Scrubber & Animation Controls
  // =========================================================================
  test.describe('Feature 3: Timeline Scrubber & Animation Controls', () => {
    test('3.1 scrubber step forward increments step index and updates step tag', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');
      await unlockPhase3HonestSkip(page);

      const stepTag = page.locator('.step-tag');
      await expect(stepTag).toContainText(/Paso 1|Step 1/i);

      const fwdBtn = page.locator('.timeline-buttons-group button').filter({
        hasText: '→'
      }).first();
      await expect(fwdBtn).toBeVisible();
      await fwdBtn.click();

      await expect(stepTag).toContainText(/Paso 2|Step 2/i);
    });

    test('3.2 scrubber step backward decrements step index', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');
      await unlockPhase3HonestSkip(page);

      const stepTag = page.locator('.step-tag');
      const fwdBtn = page.locator('.timeline-buttons-group button').filter({ hasText: '→' }).first();
      const backBtn = page.locator('.timeline-buttons-group button').filter({ hasText: '←' }).first();

      // Advance to step 2
      await fwdBtn.click();
      await expect(stepTag).toContainText(/Paso 2|Step 2/i);

      // Step back to step 1
      await backBtn.click();
      await expect(stepTag).toContainText(/Paso 1|Step 1/i);
      await expect(backBtn).toBeDisabled();
    });

    test('3.3 play and pause button toggles active animation state', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');
      await unlockPhase3HonestSkip(page);

      const playPauseBtn = page.locator('button.btn-play-pause');
      await expect(playPauseBtn).toBeVisible();

      // Initially paused, displays play symbol
      await expect(playPauseBtn).toHaveText('▶');

      // Click to play
      await playPauseBtn.click();
      await expect(playPauseBtn).toHaveText('❚❚');

      // Click to pause
      await playPauseBtn.click();
      await expect(playPauseBtn).toHaveText('▶');
    });

    test('3.4 reset button restores trace to initial step 1', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');
      await unlockPhase3HonestSkip(page);

      const stepTag = page.locator('.step-tag');
      const fwdBtn = page.locator('.timeline-buttons-group button').filter({ hasText: '→' }).first();
      const resetBtn = page.locator('.timeline-buttons-group button').filter({ hasText: '↺' }).first();

      await fwdBtn.click();
      await fwdBtn.click();
      await expect(stepTag).toContainText(/Paso 3|Step 3/i);

      await resetBtn.click();
      await expect(stepTag).toContainText(/Paso 1|Step 1/i);
    });

    test('3.5 playback speed control selector updates active speed setting', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');
      await unlockPhase3HonestSkip(page);

      const speed2xBtn = page.locator('button.btn-speed').filter({ hasText: '2x' });
      await expect(speed2xBtn).toBeVisible();
      await speed2xBtn.click();

      await expect(speed2xBtn).toHaveClass(/active/);

      const speed1xBtn = page.locator('button.btn-speed').filter({ hasText: '1x' });
      await speed1xBtn.click();
      await expect(speed1xBtn).toHaveClass(/active/);
    });
  });

  // =========================================================================
  // 4. Code Editor (Solve Phase)
  // =========================================================================
  test.describe('Feature 4: Code Editor (Solve Phase)', () => {
    test('4.1 Solve phase button transitions to code editor workspace', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');

      await selectPhase(page, 'solve');

      await expect(page.locator('textarea.code-editor-input')).toBeVisible();
      await expect(page.locator('button.btn-fast-tests')).toBeVisible();
    });

    test('4.2 starter python code is loaded with exercise function signature', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');
      await selectPhase(page, 'solve');

      const editor = page.locator('textarea.code-editor-input');
      const val = await editor.inputValue();
      expect(val).toMatch(/def\s+(mochila_fraccionaria|fractional_knapsack_greedy)/);
    });

    test('4.3 editor workspace renders line numbers gutter and code layout', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');
      await selectPhase(page, 'solve');

      const gutter = page.locator('.editor-gutter');
      await expect(gutter).toBeVisible();

      const lineNumbers = page.locator('.editor-line-number');
      const count = await lineNumbers.count();
      expect(count).toBeGreaterThanOrEqual(5);
    });

    test('4.4 typing in code editor updates code buffer', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');
      await selectPhase(page, 'solve');

      const editor = page.locator('textarea.code-editor-input');
      const initialVal = await editor.inputValue();

      await editor.focus();
      await editor.fill(`${initialVal}\n# Test comment`);

      const updatedVal = await editor.inputValue();
      expect(updatedVal).toContain('# Test comment');
    });

    test('4.5 reset code button restores template code', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');
      await selectPhase(page, 'solve');

      const editor = page.locator('textarea.code-editor-input');
      const initialVal = await editor.inputValue();

      await editor.fill(`${initialVal}\n# Modified by test`);
      expect(await editor.inputValue()).toContain('# Modified by test');

      const resetBtn = page.locator('button.btn-reset-code');
      await expect(resetBtn).toBeVisible();
      await resetBtn.click();

      const restoredVal = await editor.inputValue();
      expect(restoredVal).not.toContain('# Modified by test');
    });
  });

  // =========================================================================
  // 5. Fast Algorithmic Validation Engine
  // =========================================================================
  test.describe('Feature 5: Fast Algorithmic Validation Engine', () => {
    test('5.1 fast tests execution evaluates without freezing UI', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');
      await selectPhase(page, 'solve');

      const fastTestBtn = page.locator('button.btn-fast-tests');
      await expect(fastTestBtn).toBeVisible();
      await fastTestBtn.click();

      await expect(page.locator('.test-feedback-card')).toBeVisible();
      await expect(fastTestBtn).toBeEnabled();
    });

    test('5.2 running validator on untouched starter template reports failed status', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');
      await selectPhase(page, 'solve');

      await page.locator('button.btn-fast-tests').click();

      const feedbackCard = page.locator('.test-feedback-card');
      await expect(feedbackCard).toBeVisible();
      await expect(feedbackCard).toHaveClass(/failed/);

      const summary = page.locator('.test-summary-message');
      await expect(summary).toBeVisible();
      await expect(summary).toContainText(/incompleto|trivial|incomplete|trivial|pruebas|tests/i);
    });

    test('5.3 test feedback card displays structured evaluation result and engine badge', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');
      await selectPhase(page, 'solve');

      await page.locator('textarea.code-editor-input').fill('def mochila_fraccionaria(capacidad, pesos, valores):\n    return 0.0\n');
      await page.locator('button.btn-fast-tests').click();

      const metaBadge = page.locator('.test-meta-badge');
      await expect(metaBadge).toBeVisible();
      await expect(metaBadge).toContainText(/TypeScript Validator/i);
    });

    test('5.4 feedback card renders individual test case results list', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');
      await selectPhase(page, 'solve');

      await page.locator('textarea.code-editor-input').fill('def mochila_fraccionaria(capacidad, pesos, valores):\n    return 0.0\n');
      await page.locator('button.btn-fast-tests').click();

      const resultsList = page.locator('.test-case-results-list');
      await expect(resultsList).toBeVisible();

      const items = page.locator('.test-case-item');
      const count = await items.count();
      expect(count).toBeGreaterThanOrEqual(1);

      const firstBadge = items.first().locator('.test-case-badge');
      await expect(firstBadge).toBeVisible();
      await expect(firstBadge).toHaveText(/PASS|FAIL/);
    });

    test('5.5 fast test execution reports execution time in milliseconds', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');
      await selectPhase(page, 'solve');

      await page.locator('textarea.code-editor-input').fill('def mochila_fraccionaria(capacidad, pesos, valores):\n    return 0.0\n');
      await page.locator('button.btn-fast-tests').click();

      const metaBar = page.locator('.test-meta-bar');
      await expect(metaBar).toBeVisible();
      await expect(metaBar).toContainText(/ms/i);
    });
  });

  // =========================================================================
  // 6. Pedagogical Phase Gating & Solution Protection
  // =========================================================================
  test.describe('Feature 6: Pedagogical Phase Gating & Solution Protection', () => {
    test('6.1 Phase 3 Understand is locked initially with locked tag', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');

      const lockedTag = page.locator('.phase-locked-tag');
      await expect(lockedTag).toBeVisible();
      await expect(lockedTag).toHaveText(/BLOQUEADO|LOCKED/i);
    });

    test('6.2 clicking locked Phase 3 opens pedagogical friction modal', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');

      const understandBtn = page.locator('.phase-button').filter({
        hasText: /comprender|understand|03/i
      }).first();
      await understandBtn.click();

      const modalOverlay = page.locator('.modal-overlay[role="dialog"]');
      await expect(modalOverlay).toBeVisible();

      const frictionTitle = modalOverlay.locator('#phase-friction-title, #skip-dialog-title');
      await expect(frictionTitle).toBeVisible();
    });

    test('6.3 dismissing friction modal keeps Phase 3 locked', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');

      const understandBtn = page.locator('.phase-button').filter({
        hasText: /comprender|understand|03/i
      }).first();
      await understandBtn.click();

      const modalOverlay = page.locator('.modal-overlay[role="dialog"]');
      await expect(modalOverlay).toBeVisible();

      const cancelBtn = modalOverlay.locator('.modal-actions button.btn-secondary, button.modal-close-btn').first();
      await cancelBtn.click();

      await expect(modalOverlay).not.toBeVisible();
      await expect(page.locator('.phase-locked-tag')).toBeVisible();
    });

    test('6.4 confirming honest skip in modal unlocks Phase 3 and transitions to Understand view', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');

      await unlockPhase3HonestSkip(page);

      await expect(page.locator('.understand-view, .canonical-code-display').first()).toBeVisible();
    });

    test('6.5 Phase 3 tab displays unlocked status tag after honest skip', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');

      await unlockPhase3HonestSkip(page);
      await selectPhase(page, 'discover');

      const unlockedTag = page.locator('.phase-unlocked-tag');
      await expect(unlockedTag).toBeVisible();
      await expect(unlockedTag).toHaveText(/DISPONIBLE|UNLOCKED/i);
    });
  });

  // =========================================================================
  // 7. Theory, Invariants & Complexity (Understand Phase)
  // =========================================================================
  test.describe('Feature 7: Theory, Invariants & Complexity (Understand Phase)', () => {
    test('7.1 Understand view displays theory and invariants section', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');
      await unlockPhase3HonestSkip(page);

      await expect(page.locator('.theory-card')).toBeVisible();
      const body = page.locator('.theory-card .theory-body');
      await expect(body).toBeVisible();
      const bodyText = await body.innerText();
      expect(bodyText.length).toBeGreaterThan(30);
    });

    test('7.2 code toggles exist in Understand view', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');
      await unlockPhase3HonestSkip(page);

      const toggles = page.locator('button.btn-code-toggle');
      const count = await toggles.count();
      expect(count).toBeGreaterThanOrEqual(1);
    });

    test('7.3 theory body presents formal algorithm invariants', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');
      await unlockPhase3HonestSkip(page);

      const theoryBody = page.locator('.theory-body');
      await expect(theoryBody).toBeVisible();
      await expect(theoryBody).toContainText(/mochila|knapsack|greedy|optimal|óptimo/i);
    });

    test('7.4 asymptotic time complexity Big-O value is displayed', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');
      await unlockPhase3HonestSkip(page);

      const complexityValues = page.locator('.complexity-item .complexity-value');
      await expect(complexityValues.first()).toBeVisible();
      const timeVal = await complexityValues.first().innerText();
      expect(timeVal).toContain('O(');
    });

    test('7.5 asymptotic space complexity Big-O value is displayed', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');
      await unlockPhase3HonestSkip(page);

      const complexityValues = page.locator('.complexity-item .complexity-value');
      const count = await complexityValues.count();
      expect(count).toBeGreaterThanOrEqual(2);

      const spaceVal = await complexityValues.nth(1).innerText();
      expect(spaceVal).toContain('O(');
    });
  });

  // =========================================================================
  // 8. Bilingual Localization (ES/EN)
  // =========================================================================
  test.describe('Feature 8: Bilingual Localization (ES/EN)', () => {
    test('8.1 first visit defaults strictly to Spanish (es)', async ({ page }) => {
      await page.goto('/');

      const htmlLang = await page.locator('html').getAttribute('lang');
      expect(htmlLang).toBe('es');

      const activeLangBtn = page.locator('.lang-segmented-control .segmented-btn.active');
      await expect(activeLangBtn).toHaveText('ES');

      const activeCategory = page.locator('.category-tab.active');
      await expect(activeCategory).toContainText(/Todos/i);
    });

    test('8.2 switching to English updates html lang attribute and header toggle', async ({ page }) => {
      await page.goto('/');
      await switchLanguage(page, 'en');

      expect(await page.locator('html').getAttribute('lang')).toBe('en');

      const activeLangBtn = page.locator('.lang-segmented-control .segmented-btn.active');
      await expect(activeLangBtn).toHaveText('EN');
    });

    test('8.3 switching to English translates category tabs and phase buttons', async ({ page }) => {
      await page.goto('/');
      await switchLanguage(page, 'en');

      const activeCategory = page.locator('.category-tab.active');
      await expect(activeCategory).toContainText(/All/i);

      await openExercise(page, 'knapsack-greedy');

      const phaseButtons = page.locator('.phase-button');
      await expect(phaseButtons.nth(0)).toContainText(/Discover/i);
      await expect(phaseButtons.nth(1)).toContainText(/Solve/i);
      await expect(phaseButtons.nth(2)).toContainText(/Understand/i);
    });

    test('8.4 English exercise title translates properly', async ({ page }) => {
      await page.goto('/');
      await switchLanguage(page, 'en');
      await openExercise(page, 'knapsack-greedy');

      const title = page.locator('.exercise-title');
      await expect(title).toContainText(/Fractional Knapsack/i);
    });

    test('8.5 switching back to Spanish restores Spanish labels cleanly without reload', async ({ page }) => {
      await page.goto('/');
      await switchLanguage(page, 'en');
      await switchLanguage(page, 'es');

      expect(await page.locator('html').getAttribute('lang')).toBe('es');

      const activeCategory = page.locator('.category-tab.active');
      await expect(activeCategory).toContainText(/Todos/i);

      await openExercise(page, 'knapsack-greedy');
      const phaseButtons = page.locator('.phase-button');
      await expect(phaseButtons.nth(0)).toContainText(/Descubrir/i);
      await expect(phaseButtons.nth(1)).toContainText(/Resolver/i);
      await expect(phaseButtons.nth(2)).toContainText(/Comprender/i);
    });
  });

  // =========================================================================
  // 9. Sober Design System & Accessibility
  // =========================================================================
  test.describe('Feature 9: Sober Design System & Accessibility', () => {
    test('9.1 theme switch to Dark sets data-theme to dark', async ({ page }) => {
      await page.goto('/');
      await switchTheme(page, 'dark');

      const theme = await page.locator('html').getAttribute('data-theme');
      expect(theme).toBe('dark');
    });

    test('9.2 theme switch to Light sets data-theme to light', async ({ page }) => {
      await page.goto('/');
      await switchTheme(page, 'light');

      const theme = await page.locator('html').getAttribute('data-theme');
      expect(theme).toBe('light');
    });

    test('9.3 theme switch to System restores system mode', async ({ page }) => {
      await page.goto('/');
      await switchTheme(page, 'dark');
      await switchTheme(page, 'system');

      const theme = await page.locator('html').getAttribute('data-theme');
      expect(theme === null || theme === 'system').toBe(true);
    });

    test('9.4 zero emoji invariant across user-facing landmarks', async ({ page }) => {
      await page.goto('/');

      const text = await page.locator('header.app-header, main#main-content, footer.app-footer').allInnerTexts();
      const combined = text.join(' ');

      // Regex matching common decorative unicode emoji code blocks
      const emojiRegex = /[\u{1F300}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u;
      expect(emojiRegex.test(combined)).toBe(false);
    });

    test('9.5 accessibility skip-to-content landmark link is present in DOM', async ({ page }) => {
      await page.goto('/');

      const skipLink = page.locator('a.skip-to-content[href="#main-content"]');
      await expect(skipLink).toBeAttached();

      const mainContent = page.locator('main#main-content');
      await expect(mainContent).toBeVisible();
    });
  });

  // =========================================================================
  // 10. Feedback Submission Modal
  // =========================================================================
  test.describe('Feature 10: Feedback Submission Modal', () => {
    test('10.1 clicking footer feedback button opens modal dialog', async ({ page }) => {
      await page.goto('/');
      await openFeedbackModal(page);

      const modalOverlay = page.locator('.modal-overlay[role="dialog"]');
      await expect(modalOverlay).toBeVisible();
      await expect(modalOverlay.locator('#feedback-modal-title')).toBeVisible();
    });

    test('10.2 feedback modal contains required form fields and controls', async ({ page }) => {
      await page.goto('/');
      await openFeedbackModal(page);

      await expect(page.locator('textarea')).toBeVisible();
      await expect(page.locator('input[type="email"]')).toBeVisible();
      await expect(page.locator('.modal-actions button.btn-secondary')).toBeVisible();
      await expect(page.locator('.modal-actions button[type="submit"]')).toBeVisible();
    });

    test('10.3 submitting empty message displays validation error alert', async ({ page }) => {
      await page.goto('/');
      await openFeedbackModal(page);

      const submitBtn = page.locator('.modal-actions button[type="submit"]');
      await submitBtn.click();

      const alert = page.locator('.modal-card div[role="alert"]');
      await expect(alert).toBeVisible();
      await expect(alert).toContainText(/vacío|empty|caracteres|characters/i);
    });

    test('10.4 clicking cancel button closes feedback modal', async ({ page }) => {
      await page.goto('/');
      await openFeedbackModal(page);

      const cancelBtn = page.locator('.modal-actions button.btn-secondary');
      await cancelBtn.click();

      const modalOverlay = page.locator('.modal-overlay[role="dialog"]');
      await expect(modalOverlay).not.toBeVisible();
    });

    test('10.5 pressing Escape key closes feedback modal', async ({ page }) => {
      await page.goto('/');
      await openFeedbackModal(page);

      await page.keyboard.press('Escape');

      const modalOverlay = page.locator('.modal-overlay[role="dialog"]');
      await expect(modalOverlay).not.toBeVisible();
    });
  });

  // =========================================================================
  // 11. Responsive Viewports & Non-Overflowing Layouts
  // =========================================================================
  test.describe('Feature 11: Responsive Viewports & Non-Overflowing Layouts', () => {
    test('11.1 catalog layout has zero horizontal overflow across viewport width', async ({ page }) => {
      await page.goto('/');

      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalOverflow).toBe(false);
    });

    test('11.2 Discover playground view has zero horizontal overflow', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');

      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalOverflow).toBe(false);
    });

    test('11.3 Solve code editor workspace has zero horizontal overflow', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');
      await selectPhase(page, 'solve');

      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalOverflow).toBe(false);
    });

    test('11.4 Understand theory view has zero horizontal overflow', async ({ page }) => {
      await page.goto('/');
      await openExercise(page, 'knapsack-greedy');
      await unlockPhase3HonestSkip(page);

      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalOverflow).toBe(false);
    });

    test('11.5 UI shell header and footer adapt to viewport width without clipping', async ({ page }) => {
      await page.goto('/');

      await expect(page.locator('header.app-header')).toBeVisible();
      await expect(page.locator('footer.app-footer')).toBeVisible();

      const hasHorizontalOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      expect(hasHorizontalOverflow).toBe(false);
    });
  });

  // =========================================================================
  // 12. Instructor Mode & Security Invariants
  // =========================================================================
  test.describe('Feature 12: Instructor Mode & Security Invariants', () => {
    test('12.1 clicking instructor toggle opens authentication modal', async ({ page }) => {
      await page.goto('/');

      const toggleBtn = page.locator('button.instructor-mode-toggle');
      await expect(toggleBtn).toBeVisible();
      await toggleBtn.click();

      await expect(page.locator('#instructor-password-input')).toBeVisible();
      await expect(page.locator('#instructor-auth-title')).toBeVisible();
    });

    test('12.2 submitting invalid password displays error without activating instructor mode', async ({ page }) => {
      await page.goto('/');

      const toggleBtn = page.locator('button.instructor-mode-toggle');
      await toggleBtn.click();

      const input = page.locator('#instructor-password-input');
      await input.fill('WRONG123');

      const submitBtn = page.locator('.instructor-auth-card button[type="submit"]');
      await submitBtn.click();

      await expect(page.locator('#auth-error-msg')).toBeVisible();
      await expect(toggleBtn).not.toHaveClass(/active/);

      // Close modal
      await page.locator('.instructor-auth-card button.btn-secondary').click();
      await expect(page.locator('#instructor-password-input')).not.toBeVisible();
    });

    test('12.3 submitting correct master password unlocks instructor mode', async ({ page }) => {
      await page.goto('/');
      await unlockInstructorMode(page, 'MEL75.29');

      const toggleBtn = page.locator('button.instructor-mode-toggle.active');
      await expect(toggleBtn).toBeVisible();
    });

    test('12.4 instructor mode allows immediate Phase 3 access without friction modal', async ({ page }) => {
      await page.goto('/');
      await unlockInstructorMode(page, 'MEL75.29');

      await openExercise(page, 'knapsack-greedy');

      const unlockedTag = page.locator('.phase-unlocked-tag');
      await expect(unlockedTag).toBeVisible();

      await selectPhase(page, 'understand');

      await expect(page.locator('.understand-view, .canonical-code-display').first()).toBeVisible();
      // Verify friction modal was never opened
      await expect(page.locator('#phase-friction-title, #skip-dialog-title')).not.toBeVisible();
    });

    test('12.5 clicking active instructor toggle deactivates instructor mode and re-locks Phase 3', async ({ page }) => {
      await page.goto('/');
      await unlockInstructorMode(page, 'MEL75.29');

      const activeToggleBtn = page.locator('button.instructor-mode-toggle.active');
      await expect(activeToggleBtn).toBeVisible();

      // Click to toggle off
      await activeToggleBtn.click();
      await expect(page.locator('button.instructor-mode-toggle')).not.toHaveClass(/active/);

      // Verify exercise has Phase 3 locked again
      await openExercise(page, 'knapsack-greedy');
      await expect(page.locator('.phase-locked-tag')).toBeVisible();
    });
  });
});
