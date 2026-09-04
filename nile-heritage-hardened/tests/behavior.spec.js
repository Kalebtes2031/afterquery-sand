const { test, expect } = require('@playwright/test');

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000';

test('[F2P][D1] Active count excludes expired heritage passes', async ({ page }) => {
  await page.goto(FRONTEND);
  await expect(page.locator('#active-count')).toHaveText('3');
});

test('[F2P][D2] Register preserves each pass local currency', async ({ page }) => {
  await page.goto(FRONTEND);
  const cells = page.locator('.money');
  await expect(cells.nth(0)).toContainText('ETB');
  await expect(cells.nth(1)).toContainText('KES');
  await expect(cells.nth(2)).toContainText('TZS');
  await expect(cells.nth(3)).toContainText('GHS');
});

test('[F2P][D3] Expiry times use the venue local timezone', async ({ page }) => {
  await page.goto(FRONTEND);
  const rows = page.locator('#rows tr');
  await expect(rows.nth(0).locator('td').nth(4)).toContainText('18:00 EAT');
  await expect(rows.nth(1).locator('td').nth(4)).toContainText('17:00 EAT');
  await expect(rows.nth(3).locator('td').nth(4)).toContainText('16:00 GMT');
});

test('[F2P][D4] Active visitor metric excludes expired passes', async ({ page }) => {
  await page.goto(FRONTEND);
  await expect(page.locator('#visitor-count')).toHaveText('7');
});

test('[F2P][D5] Register remains readable on a 390px viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(FRONTEND);
  await expect(page.locator('body')).toHaveJSProperty('scrollWidth', 390);
  await expect(page.locator('#active-count')).toBeVisible();
});

test('[F2P][D6] Mobile register keeps core columns visible', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(FRONTEND);
  await expect(page.locator('table')).toBeVisible();
  await expect(page.locator('#rows tr').first().locator('td').nth(0)).toBeVisible();
  await expect(page.locator('#rows tr').first().locator('td').nth(3)).toBeVisible();
  await expect(page.locator('#rows tr').first().locator('td').nth(5)).toBeVisible();
});

test('[F2P][D7] Register summary API excludes expired passes from active totals', async ({ request }) => {
  const response = await request.get(`${BACKEND}/api/register-summary`);
  expect(response.ok()).toBeTruthy();
  const summary = await response.json();
  expect(summary.activeCount).toBe(3);
  expect(summary.visitorCount).toBe(7);
});

test('[F2P][D8] Register summary API identifies the earliest active expiry', async ({ request }) => {
  const response = await request.get(`${BACKEND}/api/register-summary`);
  expect(response.ok()).toBeTruthy();
  const summary = await response.json();
  expect(summary.nextExpiry).toBe('2026-09-05T17:00:00+03:00');
  expect(summary.nextCountry).toBe('Kenya');
});

test('[P2P] Backend health endpoint remains available', async ({ request }) => {
  const response = await request.get(`${BACKEND}/api/health`);
  expect(response.status()).toBe(200);
});

test('[P2P] Register still returns four records', async ({ request }) => {
  const response = await request.get(`${BACKEND}/api/passes`);
  expect(response.status()).toBe(200);
  const payload = await response.json();
  expect(payload.passes).toHaveLength(4);
});
