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
test('[P2P] Microgrid core health API endpoint returns 200 OK and service telemetry', async ({ request }) => {
  const resp = await request.get(`${BACKEND}/api/health`);
  expect(resp.status()).toBe(200);
  const data = await resp.json();
  expect(data.status).toBe('ok');
  expect(data.service).toBe('afrigrid-core-api');
});

test('[P2P] Active microgrid network catalog loads complete Pan-African installation registry', async ({ request }) => {
  const resp = await request.get(`${BACKEND}/api/microgrids`);
  expect(resp.status()).toBe(200);
  const grids = await resp.json();
  expect(Array.isArray(grids)).toBeTruthy();
  expect(grids.length).toBeGreaterThanOrEqual(5);
  const names = grids.map(g => g.name);
  expect(names).toContain('Benban Solar Complex');
  expect(names).toContain('Garissa Solar Station');
  expect(names).toContain('Noor Ouarzazate Solar Complex');
  expect(names).toContain('Kariba Hydro-Solar Hybrid');
  expect(names).toContain('Kainji Rural Solar Hub');
});

// [F2P] Tests
test('[F2P][D1] Community tariff billing formula correctly evaluates tiered lifeline subsidy before deducting solar feed-in credit', async ({ request }) => {
  const payload = {
    monthlyKwh: 350,
    baseRatePerKwh: 0.15,
    lifelineSubsidyPct: 50,
    solarFeedInKwh: 60,
    feedInRatePerKwh: 0.06,
    ruralGridAccessFee: 4.50
  };

  const resp = await request.post(`${BACKEND}/api/tariffs/calculate`, { data: payload });
  expect(resp.status()).toBe(200);
  const data = await resp.json();

  // Expected calculations:
  // Gross Energy Charge: 350 kWh * $0.15/kWh = $52.50
  // Lifeline Discount: 50 kWh subsidized at 50% = 50 * 0.15 * 0.50 = $3.75
  // Solar Feed-In Credit: 60 kWh * $0.06/kWh = $3.60
  // Rural Grid Access Fee: $4.50
  // Net Bill: ($52.50 - $3.75) - $3.60 + $4.50 = $49.65
  expect(data.grossEnergyCharge).toBe(52.50);
  expect(data.lifelineSubsidyDiscount).toBe(3.75);
  expect(data.solarFeedInCredit).toBe(3.60);
  expect(data.gridAccessFee).toBe(4.50);
  expect(data.totalMonthlyBill).toBe(49.65);
});

test('[F2P][D2] Emergency clinic critical circuit override synchronizes operational status and shields healthcare backup line', async ({ page }) => {
  try {
    await page.goto(FRONTEND, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.microgrid-card[data-grid-id="GRID-102"]');

    // Click manage emergency circuits on Garissa Solar Station
    const manageBtn = page.locator('.microgrid-card[data-grid-id="GRID-102"] button:has-text("Manage Emergency Circuits")');
    await manageBtn.click();

    // Verify modal opened
    const modal = page.locator('#microgrid-modal');
    await expect(modal).toBeVisible();

    // Engage critical override
    const engageBtn = page.locator('#btn-engage-override');
    await engageBtn.click();

    // Confirmation message
    const msg = page.locator('#override-result-message');
    await expect(msg).toContainText('Critical Clinic Backup Circuit Engaged');

    // Badge in modal should update to OPTIMAL
    const modalBadge = page.locator('#modal-grid-status');
    await expect(modalBadge).toHaveText('OPTIMAL');
  } finally {
    await snap(page, 'd2_circuit_override.png');
  }
});

test('[F2P][D3] BESS battery bank inverter dispatch assigns DISCHARGING status and sorts thermal sensor racks by highest critical temperature', async ({ request }) => {
  const resp = await request.post(`${BACKEND}/api/dispatch/bess`, {
    data: {
      bessId: 'BESS-01',
      command: 'DISCHARGE'
    }
  });

  expect(resp.status()).toBe(200);
  const data = await resp.json();
  expect(data.success).toBe(true);
  expect(data.unit.status).toBe('DISCHARGING');
  expect(data.unit.status).not.toBe('OFFLINE_TRIPPED');

  // Verify thermal racks sorted descending by temperature (critical hot first)
  const racks = data.unit.thermalRacks;
  expect(racks.length).toBe(4);
  expect(racks[0].rackId).toBe('RACK-3'); // 58.2 deg C
  expect(racks[1].rackId).toBe('RACK-2'); // 44.8 deg C
  expect(racks[2].rackId).toBe('RACK-1'); // 32.4 deg C
  expect(racks[3].rackId).toBe('RACK-4'); // 28.1 deg C
});

test('[F2P][D4] High-voltage field engineer deployment endpoint returns serialized engineer entities for multi-specialist dispatch', async ({ request }) => {
  const resp = await request.post(`${BACKEND}/api/dispatch/engineers`, {
    data: {
      gridId: 'GRID-102',
      engineerIds: ['ENG-1', 'ENG-2', 'ENG-3']
    }
  });

  expect(resp.status()).toBe(200);
  const data = await resp.json();
  expect(data.success).toBe(true);
  expect(Array.isArray(data.assignedEngineers)).toBe(true);
  expect(data.assignedEngineers.length).toBe(3);

  for (const eng of data.assignedEngineers) {
    expect(typeof eng).toBe('object');
    expect(eng).toHaveProperty('id');
    expect(eng).toHaveProperty('name');
    expect(eng).toHaveProperty('certification');
  }
});

test('[F2P][D5] Regional currency switcher renders formatted African currency amounts without exponential notation', async ({ page }) => {
  try {
    await page.goto(FRONTEND, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#currency-select');

    // Switch to NGN (Nigerian Naira)
    await page.selectOption('#currency-select', 'NGN');

    // Switch to tariffs tab
    await page.click('#tab-tariffs');
    await page.waitForSelector('#val-net-bill');

    const totalBill = page.locator('#val-net-bill');
    await expect(totalBill).toHaveText(/₦\s?[0-9,]+/);
    await expect(totalBill).not.toContainText('e+');
  } finally {
    await snap(page, 'd5_currency_ngn.png');
  }
});

test('[F2P][D6] Microgrid control room grid displays responsive non-overlapping cards with WCAG compliant alert contrast', async ({ page }) => {
  try {
    await page.goto(FRONTEND, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.microgrid-card');

    const cards = page.locator('.microgrid-card');
    const count = await cards.count();
    expect(count).toBeGreaterThanOrEqual(2);

    const card1 = cards.nth(0);
    // Verify non-negative margin
    const marginRight = await card1.evaluate((el) => {
      const style = window.getComputedStyle(el);
      return parseFloat(style.marginRight) || 0;
    });
    expect(marginRight).toBeGreaterThanOrEqual(0);

    // Verify warning badge contrast
    const warningBadge = page.locator('.badge-warning').first();
    if (await warningBadge.isVisible()) {
      const colors = await warningBadge.evaluate((el) => {
        const style = window.getComputedStyle(el);
        return { color: style.color, backgroundColor: style.backgroundColor };
      });
      expect(colors.color).not.toBe('rgb(255, 255, 255)');
    }
  } finally {
    await snap(page, 'd6_control_room_cards.png');
  }
});
