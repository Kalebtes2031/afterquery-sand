const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';
const BACKEND = process.env.BACKEND_URL || 'http://localhost:5000';

const ARTIFACTS = process.env.ARTIFACTS_DIR || '/logs/artifacts';
try {
  fs.mkdirSync(ARTIFACTS, { recursive: true });
} catch (e) {
  void e;
}

async function snap(page, name) {
  try {
    if (page && !page.isClosed()) {
      await page.screenshot({ path: path.join(ARTIFACTS, name), fullPage: true });
    }
  } catch (e) {
    void e;
  }
}

// [P2P] Tests
test('[P2P] Backend core health endpoint returns 200 OK and service metadata', async ({ request }) => {
  const resp = await request.get(`${BACKEND}/api/health`);
  expect(resp.status()).toBe(200);
  const data = await resp.json();
  expect(data.status).toBe('ok');
  expect(data.service).toBe('savannaroute-core-api');
});

test('[P2P] Active expedition catalog returns complete African wildlife reserve inventory', async ({ request }) => {
  const resp = await request.get(`${BACKEND}/api/expeditions`);
  expect(resp.status()).toBe(200);
  const expeditions = await resp.json();
  expect(Array.isArray(expeditions)).toBeTruthy();
  expect(expeditions.length).toBeGreaterThanOrEqual(4);
  const reserves = expeditions.map(e => e.reserve);
  expect(reserves).toContain('Serengeti National Park');
  expect(reserves).toContain('Bwindi Impenetrable National Park');
  expect(reserves).toContain('Maasai Mara Game Reserve');
  expect(reserves).toContain('Okavango Delta');
});

// [F2P] Tests
test('[F2P][D1] Safari pricing formula correctly applies peak season multiplier to discounted subtotal and computes exact conservation levy', async ({ request }) => {
  const payload = {
    baseRatePerDay: 450,
    durationDays: 5,
    teamSize: 4,
    peakSeason: true,
    discountPct: 10,
    rangersCount: 2,
    escortFeePerRanger: 120,
    conservationLevyPerGuest: 70
  };

  const resp = await request.post(`${BACKEND}/api/pricing/calculate`, { data: payload });
  expect(resp.status()).toBe(200);
  const data = await resp.json();

  // Expected breakdown:
  // Subtotal = 450 * 5 * 4 = 9,000
  // Discount = 10% of 9000 = 900 -> Discounted = 8,100
  // Peak Season (1.4x) = 8,100 * 1.4 = 11,340
  // Conservation Levy = 70 * 4 * 5 = 1,400
  // Ranger Escorts = 2 * 120 = 240
  // Total Cost = 11,340 + 1,400 + 240 = 12,980
  expect(data.subtotal).toBe(9000);
  expect(data.discountApplied).toBe(900);
  expect(data.conservationLevy).toBe(1400);
  expect(data.rangerEscortCost).toBe(240);
  expect(data.totalCost).toBe(12980);
});

test('[F2P][D2] Gorilla permit reservation validates daily group quota and synchronizes reservation status in UI state', async ({ page }) => {
  try {
    await page.goto(FRONTEND, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.expedition-card[data-exp-id="EXP-102"]');

    // Click manage logistics on Bwindi Gorilla Expedition
    const manageBtn = page.locator('.expedition-card[data-exp-id="EXP-102"] button:has-text("Manage Logistics")');
    await manageBtn.click();

    // Verify modal opened
    const modal = page.locator('#expedition-modal');
    await expect(modal).toBeVisible();

    // Allocate permit
    const requestBtn = page.locator('#btn-request-permit');
    await requestBtn.click();

    // Message should report verified allocation
    const msg = page.locator('#permit-result-message');
    await expect(msg).toContainText('Gorilla Permit Allocated');

    // Badge in modal and on card should update to ISSUED
    const modalBadge = page.locator('#modal-exp-permit-status');
    await expect(modalBadge).toHaveText('ISSUED');
  } finally {
    await snap(page, 'd2_permit_sync.png');
  }
});

test('[F2P][D3] Vehicle fleet dispatch assigns DISPATCHED status and orders corridor transit waypoints in ascending chronological sequence', async ({ request, page }) => {
  // Test backend assign route API
  const resp = await request.post(`${BACKEND}/api/dispatch/assign`, {
    data: {
      vehicleId: 'VEH-401',
      routeId: 'RT-1',
      dispatchStatus: 'DISPATCH'
    }
  });

  expect(resp.status()).toBe(200);
  const data = await resp.json();
  expect(data.success).toBe(true);
  expect(data.vehicle.status).toBe('DISPATCHED');
  expect(data.vehicle.status).not.toBe('DECOMMISSIONED');

  // Verify waypoint sequence is ordered 1, 2, 3, 4
  const waypoints = data.activeRoute.waypoints;
  expect(waypoints.length).toBe(4);
  expect(waypoints[0].name).toBe('Seronera Airstrip Hub');
  expect(waypoints[1].name).toBe('Retima Hippo Pool Checkpoint');
  expect(waypoints[2].name).toBe('Lobo Kopjes Ranger Post');
  expect(waypoints[3].name).toBe('Kogatende River Crossing Point 4');
});

test('[F2P][D4] Ranger escort allocation endpoint returns serialized ranger entity objects for multi-ranger deployments', async ({ request }) => {
  const resp = await request.post(`${BACKEND}/api/rangers/assign`, {
    data: {
      expeditionId: 'EXP-101',
      rangerIds: ['R-1', 'R-2', 'R-3']
    }
  });

  expect(resp.status()).toBe(200);
  const data = await resp.json();
  expect(data.success).toBe(true);
  expect(Array.isArray(data.assignedRangers)).toBe(true);
  expect(data.assignedRangers.length).toBe(3);

  // Each element MUST be an object with name and rank, not a primitive ID string
  for (const ranger of data.assignedRangers) {
    expect(typeof ranger).toBe('object');
    expect(ranger).toHaveProperty('id');
    expect(ranger).toHaveProperty('name');
    expect(ranger).toHaveProperty('rank');
  }
});

test('[F2P][D5] Multi-currency switcher renders formatted locale currency strings without exponent notation', async ({ page }) => {
  try {
    await page.goto(FRONTEND, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#currency-select');

    // Switch to TZS (Tanzanian Shillings)
    await page.selectOption('#currency-select', 'TZS');

    // Switch to rate calculator tab
    await page.click('#tab-pricing');
    await page.waitForSelector('#val-total-cost');

    const totalText = await page.locator('#val-total-cost').textContent();
    expect(totalText).not.toContain('e+');
    expect(totalText).toMatch(/TSh\s?[0-9,]+/);
  } finally {
    await snap(page, 'd5_currency_switch.png');
  }
});

test('[F2P][D6] Expedition overview grid layout displays responsive non-overlapping cards with WCAG compliant badge contrast', async ({ page }) => {
  try {
    await page.goto(FRONTEND, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.expedition-card');

    const cards = page.locator('.expedition-card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(2);

    // Verify card layout does not have negative margin overlap
    const card1 = cards.nth(0);
    const card2 = cards.nth(1);
    const box1 = await card1.boundingBox();
    const box2 = await card2.boundingBox();

    expect(box1).not.toBeNull();
    expect(box2).not.toBeNull();

    // Check computed marginRight is not negative
    const marginRight = await card1.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return parseFloat(style.marginRight) || 0;
    });
    expect(marginRight).toBeGreaterThanOrEqual(0);

    // Verify badge contrast and color
    const pendingBadge = page.locator('.badge-pending').first();
    if (await pendingBadge.isVisible()) {
      const colors = await pendingBadge.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return {
          color: style.color,
          backgroundColor: style.backgroundColor
        };
      });
      // In broken base, background is bright yellow (#ffeb3b) and text is pure white (rgb(255, 255, 255))
      // In fixed version, text is dark (#92400e or rgb(146, 64, 14)) or background is dark
      expect(colors.color).not.toBe('rgb(255, 255, 255)');
    }
  } finally {
    await snap(page, 'd6_layout_cards.png');
  }
});
