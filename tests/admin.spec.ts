import { test, expect } from '@playwright/test';

test.describe('Admin Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the admin page before each test
    await page.goto('/admin');
  });

  test('displays admin dashboard with calendar', async ({ page }) => {
    // Check for main title
    await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
    
    // Check for calendar section
    await expect(page.getByRole('heading', { name: 'Calendar View' })).toBeVisible();
    
    // Check for calendar navigation
    await expect(page.getByRole('button', { name: 'Previous month' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Next month' })).toBeVisible();
  });

  test('calendar navigation works', async ({ page }) => {
    // Get current month text
    const currentMonth = await page.locator('h3').textContent();
    
    // Click next month button
    await page.getByRole('button', { name: 'Next month' }).click();
    
    // Verify month has changed
    const nextMonth = await page.locator('h3').textContent();
    expect(nextMonth).not.toBe(currentMonth);
    
    // Click previous month button
    await page.getByRole('button', { name: 'Previous month' }).click();
    
    // Verify we're back to original month
    const originalMonth = await page.locator('h3').textContent();
    expect(originalMonth).toBe(currentMonth);
  });

  test('date selection shows popup', async ({ page }) => {
    // Click on today's date
    const today = new Date();
    const todayButton = page.getByRole('button', { name: today.getDate().toString() });
    await todayButton.click();
    
    // Verify popup appears
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Selected Date')).toBeVisible();
    
    // Verify date is displayed in popup
    const formattedDate = today.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    await expect(page.getByText(formattedDate)).toBeVisible();
  });

  test('can close date popup', async ({ page }) => {
    // Open popup by clicking a date
    const today = new Date();
    const todayButton = page.getByRole('button', { name: today.getDate().toString() });
    await todayButton.click();
    
    // Verify popup is visible
    await expect(page.getByRole('dialog')).toBeVisible();
    
    // Click close button
    await page.getByRole('button', { name: 'Close' }).click();
    
    // Verify popup is closed
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('calendar shows correct days of the week', async ({ page }) => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    for (const day of daysOfWeek) {
      await expect(page.getByText(day)).toBeVisible();
    }
  });

  test('calendar shows days from previous and next months', async ({ page }) => {
    // Get all day buttons
    const dayButtons = await page.getByRole('button').all();
    
    // Should have more than 28 buttons (at least 4 weeks)
    expect(dayButtons.length).toBeGreaterThan(28);
  });
}); 