const { test, expect } = require('@playwright/test');

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000';

async function json(request, url, options) {
  const response = await request.fetch(url, options);
  const body = await response.json();
  return { response, body };
}

test('[F2P][D1] status filtering shows only shipments in the chosen state', async ({ request }) => {
  const { response, body } = await json(request, `${BACKEND}/api/shipments?status=pending`);
  expect(response.ok()).toBeTruthy();
  expect(body.shipments.map(x => x.id).sort()).toEqual(['HT-104','HT-112','HT-121']);
  expect(body.shipments.every(x => x.status === 'pending')).toBeTruthy();
});

test('[F2P][D2] country filtering includes shipments arriving in the chosen country', async ({ request }) => {
  const { response, body } = await json(request, `${BACKEND}/api/shipments?region=Kenya`);
  expect(response.ok()).toBeTruthy();
  expect(body.shipments.map(x => x.id).sort()).toEqual(['HT-104','HT-107','HT-125']);
  expect(body.shipments.every(x => x.origin === 'Kenya' || x.destination === 'Kenya')).toBeTruthy();
});

test('[F2P][D3] corridor weight includes every shipment regardless of review state', async ({ request }) => {
  const { response, body } = await json(request, `${BACKEND}/api/summary`);
  expect(response.ok()).toBeTruthy();
  expect(body.pending).toBe(3);
  expect(body.approved).toBe(2);
  expect(body.rejected).toBe(1);
  expect(body.totalWeightKg).toBe(5590);
});

test('[F2P][D4] rejecting without a reason is refused and leaves the shipment pending', async ({ request }) => {
  const { response } = await json(request, `${BACKEND}/api/shipments/HT-104/reject`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, data: {}
  });
  expect(response.status()).toBe(400);
  const current = await request.get(`${BACKEND}/api/shipments/HT-104`);
  expect((await current.json()).status).toBe('pending');
});

test('[F2P][D5] the review list displays each shipment current status', async ({ page }) => {
  await page.goto(FRONTEND, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.row')).toHaveCount(6);
  const approvedRow = page.locator('.row', { hasText: 'HT-107' });
  await expect(approvedRow.locator('.badge')).toHaveText('approved');
  const rejectedRow = page.locator('.row', { hasText: 'HT-118' });
  await expect(rejectedRow.locator('.badge')).toHaveText('rejected');
});

test('[F2P][D6] the pending filter removes approved and rejected records from the queue', async ({ page }) => {
  await page.goto(FRONTEND, { waitUntil: 'domcontentloaded' });
  await page.selectOption('#status', 'pending');
  await expect(page.locator('.row')).toHaveCount(3);
  const ids = await page.locator('.row .id').allTextContents();
  expect(ids.sort()).toEqual(['HT-104','HT-112','HT-121']);
});

test('[F2P][D7] selecting a shipment keeps its detail status aligned with the queue', async ({ page }) => {
  await page.goto(FRONTEND, { waitUntil: 'domcontentloaded' });
  await page.locator('.row', { hasText: 'HT-118' }).click();
  await expect(page.locator('.detail .badge')).toHaveText('rejected');
  await expect(page.locator('#approve')).toBeDisabled();
  await expect(page.locator('#reject')).toBeDisabled();
});

test('[F2P][D8] approving a pending shipment refreshes the visible review state', async ({ page }) => {
  await page.goto(FRONTEND, { waitUntil: 'domcontentloaded' });
  await page.locator('.row', { hasText: 'HT-121' }).click();
  await page.locator('#approve').click();
  await expect(page.locator('.detail .badge')).toHaveText('approved');
  await expect(page.locator('#approve')).toBeDisabled();
  await expect(page.locator('#reject')).toBeDisabled();
  await expect(page.locator('.row', { hasText: 'HT-121' }).locator('.badge')).toHaveText('approved');
});

test('[F2P][D9] review notes and decision controls remain visible without overlap', async ({ page }) => {
  await page.goto(FRONTEND, { waitUntil: 'domcontentloaded' });
  await page.locator('.row', { hasText: 'HT-104' }).click();
  const notes = await page.locator('.notes').boundingBox();
  const actions = await page.locator('.actions').boundingBox();
  expect(notes).not.toBeNull();
  expect(actions).not.toBeNull();
  expect(notes.y + notes.height).toBeLessThanOrEqual(actions.y - 4);
});

test('[P2P] health endpoint remains available', async ({ request }) => {
  const response = await request.get(`${BACKEND}/api/health`);
  expect(response.ok()).toBeTruthy();
  expect((await response.json()).ok).toBe(true);
});

test('[P2P] changing an already approved shipment is rejected', async ({ request }) => {
  const response = await request.put(`${BACKEND}/api/shipments/HT-107/approve`);
  expect(response.status()).toBe(409);
});
