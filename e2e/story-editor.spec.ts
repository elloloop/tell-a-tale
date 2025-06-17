import { test, expect } from '@playwright/test';

test.describe('Story Editor', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => window.localStorage.clear());
  });

  test('should show image of the day', async ({ page }) => {
    // Mock the image service response - using a data URL instead of external URL
    const mockImageUrl =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z/C/HgAGgwJ/lK3Q6wAAAABJRU5ErkJggg==';

    // Mock the image service URL
    await page.route('**/imageServiceUrl', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ url: mockImageUrl }),
      });
    });

    // No need to mock the actual image request as data URLs are embedded

    await page.goto('/');

    // Wait for the image to load - using a data-testid for reliable testing
    const image = page.locator('[data-testid="story-image"]');
    await expect(image).toBeVisible({ timeout: 10000 });

    // Verify image has a valid src
    const src = await image.getAttribute('src');
    expect(src).toBeTruthy();
    expect(src).toContain('data:image/png;base64');
  });

  test('should allow writing and saving a story', async ({ page }) => {
    await page.goto('/');

    // Wait for the textarea to be visible
    const textarea = page.getByPlaceholder(/write your story/i);
    await expect(textarea).toBeVisible({ timeout: 10000 });

    // Type a story
    const testStory = 'This is my test story for today';
    await textarea.fill(testStory);

    // Save the story
    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();

    // Verify the story is displayed
    await expect(page.getByText(testStory)).toBeVisible({ timeout: 10000 });

    // Verify localStorage was updated
    const savedStory = await page.evaluate(() => window.localStorage.getItem('todayStory'));
    expect(savedStory).toBe(testStory);
  });

  test('should load saved story on page reload', async ({ page }) => {
    const testStory = 'This is a saved story';

    // Set localStorage before loading the page
    await page.goto('/');
    await page.evaluate(story => {
      window.localStorage.setItem('todayStory', story);
    }, testStory);

    // Reload the page
    await page.reload();

    // Verify the story is displayed
    await expect(page.getByText(testStory)).toBeVisible({ timeout: 10000 });
  });

  test('should show loading state initially', async ({ page }) => {
    await page.goto('/');

    // Verify loading state is shown
    const loadingText = page.getByText('Loading...');
    await expect(loadingText).toBeVisible({ timeout: 10000 });

    // Wait for loading to complete
    await expect(loadingText).not.toBeVisible({ timeout: 10000 });
  });

  test('should handle image loading error gracefully', async ({ page }) => {
    // Mock a failed image load
    await page.route('**/*.jpg', route => route.abort());

    await page.goto('/');

    // Verify the component still renders
    const textarea = page.getByPlaceholder(/write your story/i);
    await expect(textarea).toBeVisible({ timeout: 10000 });
  });

  // New test cases
  test('should handle empty story submission', async ({ page }) => {
    await page.goto('/');
    const textarea = page.getByPlaceholder(/write your story/i);
    await expect(textarea).toBeVisible({ timeout: 10000 });

    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();

    // Should still show the textarea after empty submission
    await expect(textarea).toBeVisible({ timeout: 10000 });
  });

  test('should handle very long story text', async ({ page }) => {
    await page.goto('/');
    const textarea = page.getByPlaceholder(/write your story/i);
    await expect(textarea).toBeVisible({ timeout: 10000 });

    // Generate a very long story
    const longStory = 'A'.repeat(10000);
    await textarea.fill(longStory);

    const saveButton = page.getByRole('button', { name: /save/i });
    await saveButton.click();

    await expect(page.getByText(longStory)).toBeVisible({ timeout: 10000 });
  });

  test('should maintain story state across browser tabs', async ({ context }) => {
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // Write story in first tab
    await page1.goto('/');
    const textarea = page1.getByPlaceholder(/write your story/i);
    await expect(textarea).toBeVisible({ timeout: 10000 });
    await textarea.fill('Cross-tab story');
    await page1.getByRole('button', { name: /save/i }).click();

    // Check story in second tab
    await page2.goto('/');
    await expect(page2.getByText('Cross-tab story')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should handle rapid story updates', async ({ page }) => {
    await page.goto('/');
    const textarea = page.getByPlaceholder(/write your story/i);
    await expect(textarea).toBeVisible({ timeout: 10000 });

    // Rapidly update the story multiple times
    for (let i = 0; i < 5; i++) {
      await textarea.fill(`Story update ${i}`);
      await page.getByRole('button', { name: /save/i }).click();
      await expect(page.getByText(`Story update ${i}`)).toBeVisible({
        timeout: 10000,
      });
    }
  });

  test('should handle network throttling', async ({ page }) => {
    // Simulate slow network using proper Playwright API
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.continue();
    });

    await page.goto('/');
    const loadingText = page.getByText('Loading...');
    await expect(loadingText).toBeVisible({ timeout: 10000 });
    await expect(loadingText).not.toBeVisible({ timeout: 10000 });

    const textarea = page.getByPlaceholder(/write your story/i);
    await expect(textarea).toBeVisible({ timeout: 10000 });
  });
});
