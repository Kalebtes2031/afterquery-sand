// ═══════════════════════════════════════════════════
// SCATTER PLOT: GRID, TICKS, NODES & DETAILS PANEL
// ═══════════════════════════════════════════════════
import { flooringData, AXIS_META } from './materials.js';
import { state } from './state.js';

export const nodeEls = {};

const $grid = document.getElementById('scatterGrid');
const $container = document.getElementById('scatterContainer');
const $tooltip = document.getElementById('tooltip');
const $xLabel = document.getElementById('scatterXLabel');
const $yLabel = document.getElementById('scatterYLabel');
const $viewportOverlay = document.getElementById('viewportOverlay');
const $viewportBadge = document.getElementById('viewportBadge');
const $badgeSwatch = document.getElementById('badgeSwatch');
const $badgeName = document.getElementById('badgeName');
const $detailsEmpty = document.getElementById('detailsEmpty');
const $detailsContent = document.getElementById('detailsContent');
const $detailsName = document.getElementById('detailsName');
const $detailsId = document.getElementById('detailsId');
const $detailsDesc = document.getElementById('detailsDesc');
const $propBars = document.getElementById('propBars');

const AXIS_MIN = 1;
const AXIS_MAX = 10;
const PROP_KEYS = ['roughness', 'durability', 'warmth', 'maintenance'];
const PROP_COLORS = { roughness: '#b85c38', durability: '#5c7a8a', warmth: '#c4a860', maintenance: '#8b6b5a' };

function valueToPct(v) {
  return ((v - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * 100;
}

/* ═══════════════════════════════════════════════════
   GRID + TICK MARKS
   ═══════════════════════════════════════════════════ */
export function createGrid() {
  $grid.innerHTML = '';

  for (let i = AXIS_MIN; i <= AXIS_MAX; i++) {
    const pct = valueToPct(i);

    // Bottom edge (X axis) tick label
    const txL = document.createElement('span');
    txL.className = 'tick-label';
    txL.dataset.axis = 'x';
    txL.dataset.value = i;
    txL.textContent = i;
    txL.style.left = pct + '%';
    txL.style.bottom = '-16px';
    txL.style.transform = 'translateX(-50%)';
    $grid.appendChild(txL);

    // Left edge (Y axis) tick label
    const txR = document.createElement('span');
    txR.className = 'tick-label';
    txR.dataset.axis = 'y';
    txR.dataset.value = i;
    txR.textContent = i;
    txR.style.top = pct + '%';
    txR.style.left = '-18px';
    txR.style.transform = 'translateY(-50%)';
    $grid.appendChild(txR);
  }

  for (let i = AXIS_MIN; i <= AXIS_MAX; i++) {
    const pct = valueToPct(i);
    const vLine = document.createElement('div');
    vLine.className = 'grid-line grid-line-v';
    vLine.style.left = pct + '%';
    $grid.appendChild(vLine);

    const hLine = document.createElement('div');
    hLine.className = 'grid-line grid-line-h';
    hLine.style.top = (100 - pct) + '%';
    $grid.appendChild(hLine);
  }
}

export function updateAxisLabels() {
  $xLabel.textContent = AXIS_META[state.xAxis].label + ' →';
  $yLabel.textContent = AXIS_META[state.yAxis].label + ' →';
}

/* ═══════════════════════════════════════════════════
   MATERIAL NODES
   ═══════════════════════════════════════════════════ */
export function createNodes(onClick) {
  flooringData.forEach((mat, idx) => {
    const el = document.createElement('div');
    el.className = 'material-node entering';
    el.style.background = mat.color;
    el.textContent = mat.name.charAt(0);
    el.tabIndex = 0;
    el.dataset.matId = mat.id;
    el.setAttribute('role', 'option');
    el.setAttribute('aria-label', mat.name);

    const label = document.createElement('span');
    label.className = 'node-label';
    label.textContent = mat.name;
    el.appendChild(label);

    el.addEventListener('click', () => onClick(mat.id));
    el.addEventListener('mouseenter', (e) => showTooltip(mat, e));
    el.addEventListener('mousemove', positionTooltip);
    el.addEventListener('mouseleave', hideTooltip);
    el.addEventListener('focus', (e) => showTooltip(mat, e));
    el.addEventListener('blur', hideTooltip);

    $container.appendChild(el);
    nodeEls[mat.id] = el;

    setTimeout(() => { el.classList.remove('entering'); }, 50 * idx + 40);
  });
}

export function updatePositions(animate) {
  flooringData.forEach(mat => {
    const el = nodeEls[mat.id];
    if (!el) return;
    const xPct = valueToPct(mat[state.xAxis]);
    const yPct = valueToPct(mat[state.yAxis]);
    el.style.left = xPct + '%';
    el.style.top = (100 - yPct) + '%';
  });
}

/* ═══════════════════════════════════════════════════
   TOOLTIP
   ═══════════════════════════════════════════════════ */
function showTooltip(mat, e) {
  let html = '<div class="tooltip-name">' + mat.name + '</div>';
  PROP_KEYS.forEach(k => {
    html += '<div class="tooltip-row"><span class="tooltip-label">' + AXIS_META[k].shortLabel +
      '</span><span class="tooltip-value">' + mat[k] + '/10</span></div>';
  });
  $tooltip.innerHTML = html;
  $tooltip.classList.add('visible');
  positionTooltip(e);
}

function positionTooltip(e) {
  $tooltip.style.left = (e.clientX + 16) + 'px';
  $tooltip.style.top = (e.clientY + 16) + 'px';
}

function hideTooltip() {
  $tooltip.classList.remove('visible');
}

/* ═══════════════════════════════════════════════════
   DETAILS PANEL + VIEWPORT BADGE
   ═══════════════════════════════════════════════════ */
export function showMaterialDetails(mat) {
  $detailsEmpty.classList.add('hidden');
  $detailsContent.classList.remove('hidden');
  $detailsName.textContent = mat.name;
  $detailsId.textContent = mat.id;
  $detailsDesc.textContent = mat.description;

  let html = '';
  PROP_KEYS.forEach(k => {
    html += '<div class="prop-bar">' +
      '<span class="prop-label">' + AXIS_META[k].shortLabel + '</span>' +
      '<div class="prop-track"><div class="prop-fill" data-prop="' + k + '" style="width:0%;background:' + PROP_COLORS[k] + '"></div></div>' +
      '<span class="prop-value">' + mat[k] + '/10</span>' +
      '</div>';
  });
  $propBars.innerHTML = html;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      $propBars.querySelectorAll('.prop-fill').forEach(f => {
        const key = f.dataset.prop;
        f.style.width = (mat[key] * 10) + '%';
      });
    });
  });

  $badgeSwatch.style.background = mat.color;
  $badgeName.textContent = mat.name;
  $viewportBadge.classList.remove('hidden');
  $viewportOverlay.classList.add('hidden');
}

export function showEmptyState() {
  $detailsEmpty.classList.remove('hidden');
  $detailsContent.classList.add('hidden');
  $viewportBadge.classList.add('hidden');
  $viewportOverlay.classList.remove('hidden');
}
