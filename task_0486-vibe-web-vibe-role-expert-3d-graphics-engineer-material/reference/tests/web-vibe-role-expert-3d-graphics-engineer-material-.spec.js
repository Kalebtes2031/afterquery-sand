const { test, expect } = require('@playwright/test');
const S = require('./lib/scenario');

const APP_URL = process.env.APP_URL;

async function boot(page) {
  await page.goto(APP_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.locator('.material-node').first().waitFor({ timeout: 15000 });
  await page.waitForTimeout(400);
}

// Reads every rendered tick label on one axis and returns
// { value, box } sorted by DOM order (matches on-screen bottom-to-top / left-to-right order).
async function readTicks(page, axis) {
  return page.evaluate((axis) => {
    const els = Array.from(document.querySelectorAll(`#scatterGrid > .tick-label[data-axis="${axis}"]`));
    const container = document.querySelector('#scatterContainer').getBoundingClientRect();
    return els.map(el => {
      const r = el.getBoundingClientRect();
      return {
        value: Number(el.textContent),
        left: r.left - container.left,
        top: r.top - container.top,
        right: r.right - container.left,
        bottom: r.bottom - container.top,
        width: r.width,
        height: r.height,
        cx: r.left - container.left + r.width / 2,
        cy: r.top - container.top + r.height / 2,
        inContainer: r.left >= container.left - 1 && r.right <= container.right + 1 &&
                     r.top >= container.top - 1 && r.bottom <= container.bottom + 1 &&
                     r.width > 0 && r.height > 0,
      };
    });
  }, axis);
}

async function readNodes(page) {
  return page.evaluate(() => {
    const container = document.querySelector('#scatterContainer').getBoundingClientRect();
    return Array.from(document.querySelectorAll('.material-node')).map(el => {
      const r = el.getBoundingClientRect();
      return {
        id: el.dataset.matId,
        cx: r.left - container.left + r.width / 2,
        cy: r.top - container.top + r.height / 2,
      };
    });
  });
}

test('[P2P] app boots and renders content', async ({ page }) => {
  await boot(page);
  const has = await page.evaluate(() => !!document.body && document.body.children.length > 0);
  expect(has).toBe(true);
});

test('[P2P] no layout overflow (UI fits the viewport)', async ({ page }) => {
  await boot(page);
  const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(o).toBeLessThanOrEqual(2);
});

test('[P2P] the bottom-edge scale reads left to right in ascending order', async ({ page }) => {
  await boot(page);
  const ticks = await readTicks(page, 'x');
  expect(ticks.length).toBeGreaterThan(1);
  const byX = [...ticks].sort((a, b) => a.cx - b.cx).map(t => t.value);
  for (let i = 1; i < byX.length; i++) expect(byX[i]).toBeGreaterThan(byX[i - 1]);
});

test('[F2P] The matrix plot has grid lines but no numbers along the bottom edge — the 1-10 scale labels are cut off outside the white card', async ({ page }) => {
  await boot(page);
  const v = await S.assertVisibleUnclipped(page, '#scatterGrid > .tick-label[data-axis="x"]', { container: '#scatterContainer' });
  expect(v.visible && v.inViewport && v.inContainer).toBe(true);
});

test('[F2P] No numbers appear down the left side of the matrix; the vertical scale is missing/clipped off the plot card', async ({ page }) => {
  await boot(page);
  const v = await S.assertVisibleUnclipped(page, '#scatterGrid > .tick-label[data-axis="y"]', { container: '#scatterContainer' });
  expect(v.visible && v.inViewport && v.inContainer).toBe(true);
});

test('[F2P] Every bottom-edge scale number is fully inside the plot card, not just the first one', async ({ page }) => {
  await boot(page);
  const ticks = await readTicks(page, 'x');
  expect(ticks.length).toBeGreaterThanOrEqual(10);
  expect(ticks.every(t => t.inContainer)).toBe(true);
});

test('[F2P] Every left-edge scale number is fully inside the plot card, not just one sample', async ({ page }) => {
  await boot(page);
  const ticks = await readTicks(page, 'y');
  expect(ticks.length).toBeGreaterThanOrEqual(10);
  expect(ticks.every(t => t.inContainer)).toBe(true);
});

test('[F2P] The left-edge scale reads bottom to top in ascending order, so a higher number means a higher position', async ({ page }) => {
  await boot(page);
  const ticks = await readTicks(page, 'y');
  expect(ticks.length).toBeGreaterThan(1);
  // Sort by on-screen vertical position, bottom (largest cy) first.
  const byScreenY = [...ticks].sort((a, b) => b.cy - a.cy).map(t => t.value);
  for (let i = 1; i < byScreenY.length; i++) expect(byScreenY[i]).toBeGreaterThan(byScreenY[i - 1]);
});

test('[F2P] Reading a swatch off the left-edge scale gives that swatch\'s real value, for every swatch on the board', async ({ page }) => {
  await boot(page);
  const AXIS_SHORT = { 'Tactile Roughness': 'Roughness', 'Durability Index': 'Durability', 'Thermal Warmth': 'Warmth', 'Maintenance Effort': 'Maintenance' };
  const ticks = await readTicks(page, 'y');
  const nodes = await readNodes(page);
  const yAxisLabel = await page.evaluate(() => document.querySelector('#yAxisSelect').selectedOptions[0].textContent.trim());
  const shortLabel = AXIS_SHORT[yAxisLabel];
  expect(nodes.length).toBe(10);
  for (const node of nodes) {
    // Nearest tick, by on-screen vertical distance, must be within one grid step of the node's own row.
    const nearest = ticks.reduce((best, t) => (Math.abs(t.cy - node.cy) < Math.abs(best.cy - node.cy) ? t : best));
    await page.locator(`.material-node[data-mat-id="${node.id}"]`).click();
    const shown = await page.evaluate((label) => {
      const rows = Array.from(document.querySelectorAll('#propBars .prop-bar'));
      const row = rows.find(r => r.querySelector('.prop-label').textContent.trim() === label);
      return row ? Number(row.querySelector('.prop-value').textContent) : null;
    }, shortLabel);
    expect(shown).not.toBeNull();
    expect(Math.abs(nearest.value - shown)).toBeLessThanOrEqual(1);
  }
});
