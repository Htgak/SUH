import { expect, test } from '@playwright/test';

test('renders home page with tool links', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Static Utility Hub' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Open Tool' }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: 'JSON' })).toBeVisible();
});

test('formats JSON through UI', async ({ page }) => {
  await page.goto('/json.html');

  await page.locator('#json-input').fill('{"name":"test","value":1}');
  await page.locator('#json-format').click();

  await expect(page.locator('#json-output')).toContainText('"name": "test"');
  await expect(page.locator('#json-status')).toContainText('formatted successfully');
});

test('converts units through UI', async ({ page }) => {
  await page.goto('/converter.html');

  await page.locator('#unit-category').selectOption('length');
  await page.locator('#unit-from').selectOption('kilometer');
  await page.locator('#unit-to').selectOption('meter');
  await page.locator('#unit-value').fill('3');
  await page.locator('#unit-convert').click();

  await expect(page.locator('#unit-output')).toContainText('3000.000000 meter');
});
