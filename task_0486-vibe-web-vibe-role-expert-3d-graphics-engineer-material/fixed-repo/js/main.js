// ═══════════════════════════════════════════════════
// MAIN ENTRY POINT
// ═══════════════════════════════════════════════════
import { flooringData, AXIS_META } from './materials.js';
import { state, pushHistory, persistState, restoreState, clearPersistence, resetHistoryButtons, initHistoryButtons, registerHistoryCallbacks } from './state.js';
import { createGrid, createNodes, updatePositions, updateAxisLabels, showMaterialDetails, showEmptyState, nodeEls } from './scatter.js';
import { initThree, update3DMaterial, onResize, setLightIntensity, getLightIntensity } from './viewport.js';

/* ─── DOM refs ─── */
const $xSelect = document.getElementById('xAxisSelect');
const $ySelect = document.getElementById('yAxisSelect');
const $lightSlider = document.getElementById('lightSlider');
const $lightVal = document.getElementById('lightValue');
const $searchInput = document.getElementById('searchInput');
const $searchClear = document.getElementById('searchClear');
const $compareToggle = document.getElementById('compareToggle');
const $compareOverlay = document.getElementById('compareOverlay');
const $compareGrid = document.getElementById('compareGrid');
const $compareClose = document.getElementById('compareClose');
const $noResults = document.getElementById('noResultsOverlay');

let compareMode = false;
let compareSelection = [];

/* ═══════════════════════════════════════════════════
   MATERIAL SELECTION
   ═══════════════════════════════════════════════════ */
function selectMaterial(id) {
  if (state.selectedId === id) return;
  if (state.selectedId && nodeEls[state.selectedId]) {
    nodeEls[state.selectedId].classList.remove('selected');
  }
  state.selectedId = id;
  const mat = flooringData.find(m => m.id === id);
  if (!mat) return;
  nodeEls[id].classList.add('selected');
  const liveRegion = document.getElementById('liveRegion');
  if (liveRegion) liveRegion.textContent = 'Selected ' + mat.name;
  pushHistory(id);
  showMaterialDetails(mat);
  update3DMaterial(mat);
  persistState();
}

/* Register history callback for undo/redo */
registerHistoryCallbacks((id) => {
  if (state.selectedId && nodeEls[state.selectedId]) {
    nodeEls[state.selectedId].classList.remove('selected');
  }
  state.selectedId = id;
  if (id) {
    const mat = flooringData.find(m => m.id === id);
    nodeEls[id].classList.add('selected');
    showMaterialDetails(mat);
    update3DMaterial(mat);
  } else {
    showEmptyState();
  }
  persistState();
});

function handleNodeClick(matId) {
  if (compareMode) {
    handleCompareClick(matId);
  } else {
    selectMaterial(matId);
  }
}

function clearSelection() {
  if (state.selectedId && nodeEls[state.selectedId]) {
    nodeEls[state.selectedId].classList.remove('selected');
  }
  state.selectedId = null;
  showEmptyState();
  pushHistory(null);
  persistState();
}

/* ═══════════════════════════════════════════════════
   SEARCH / FILTER
   ═══════════════════════════════════════════════════ */
function onSearch() {
  const q = $searchInput.value.trim().toLowerCase();
  $searchClear.classList.toggle('visible', q.length > 0);
  const $searchEmpty = document.getElementById('searchEmpty');
  let matchCount = 0;
  flooringData.forEach(mat => {
    const el = nodeEls[mat.id];
    if (!q) {
      el.classList.remove('dimmed');
      matchCount++;
    } else {
      const match = mat.name.toLowerCase().indexOf(q) !== -1 ||
                    mat.id.indexOf(q) !== -1 ||
                    mat.description.toLowerCase().indexOf(q) !== -1;
      el.classList.toggle('dimmed', !match);
      if (match) matchCount++;
    }
  });
  const noResults = q && matchCount === 0;
  if ($searchEmpty) $searchEmpty.style.display = noResults ? 'block' : 'none';
  if ($noResults) $noResults.style.display = noResults ? 'flex' : 'none';
}

/* ═══════════════════════════════════════════════════
   COMPARE MODE
   ═══════════════════════════════════════════════════ */
function toggleCompareMode() {
  compareMode = !compareMode;
  compareSelection = [];
  $compareToggle.classList.toggle('active', compareMode);
  $compareToggle.textContent = compareMode ? 'Comparing…' : 'Compare';
  flooringData.forEach(m => { nodeEls[m.id].style.outline = ''; });
  if (!compareMode) closeCompare();
}

function handleCompareClick(matId) {
  const idx = compareSelection.indexOf(matId);
  if (idx !== -1) {
    compareSelection.splice(idx, 1);
    nodeEls[matId].style.outline = '';
    nodeEls[matId].style.outlineOffset = '';
  } else {
    if (compareSelection.length >= 2) {
      const old = compareSelection.shift();
      nodeEls[old].style.outline = '';
      nodeEls[old].style.outlineOffset = '';
    }
    compareSelection.push(matId);
    nodeEls[matId].style.outline = '3px solid #5c7a8a';
    nodeEls[matId].style.outlineOffset = '3px';
  }
  if (compareSelection.length === 2) showCompare(compareSelection[0], compareSelection[1]);
}

function showCompare(id1, id2) {
  const m1 = flooringData.find(m => m.id === id1);
  const m2 = flooringData.find(m => m.id === id2);
  if (!m1 || !m2) return;
  const propColors = { roughness: '#b85c38', durability: '#5c7a8a', warmth: '#c4a860', maintenance: '#8b6b5a' };
  let html = '';
  html += '<div class="compare-mat-name" style="grid-column:1;color:' + m1.color + '">' + m1.name + '</div>';
  html += '<div></div>';
  html += '<div class="compare-mat-name" style="grid-column:3;color:' + m2.color + '">' + m2.name + '</div>';
  ['roughness','durability','warmth','maintenance'].forEach(key => {
    const v1 = m1[key], v2 = m2[key], color = propColors[key];
    html += '<div class="compare-val right">' + v1 + '/10</div>';
    html += '<div class="compare-label">' + AXIS_META[key].shortLabel + '</div>';
    html += '<div class="compare-val">' + v2 + '/10</div>';
    html += '<div class="compare-bar-track"><div class="compare-bar-fill" style="width:' + (v1*10) + '%;background:' + color + '"></div></div>';
    html += '<div></div>';
    html += '<div class="compare-bar-track"><div class="compare-bar-fill" style="width:' + (v2*10) + '%;background:' + color + '"></div></div>';
  });
  $compareGrid.innerHTML = html;
  $compareOverlay.classList.add('visible');
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      $compareGrid.querySelectorAll('.compare-bar-fill').forEach(f => {
        const w = f.style.width;
        f.style.width = '0%';
        requestAnimationFrame(() => { f.style.width = w; });
      });
    });
  });
}

function closeCompare() {
  $compareOverlay.classList.remove('visible');
  if (compareMode) {
    compareSelection.forEach(id => { nodeEls[id].style.outline = ''; nodeEls[id].style.outlineOffset = ''; });
    compareSelection = [];
  }
}

/* ═══════════════════════════════════════════════════
   EXPORT
   ═══════════════════════════════════════════════════ */
function exportData() {
  const data = flooringData.map(m => ({
    id: m.id, name: m.name,
    roughness: m.roughness, durability: m.durability,
    warmth: m.warmth, maintenance: m.maintenance,
    description: m.description,
  }));
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'flooring-materials.json'; a.click();
  URL.revokeObjectURL(url);
}

/* ═══════════════════════════════════════════════════
   RESET
   ═══════════════════════════════════════════════════ */
function resetAll() {
  $searchInput.value = '';
  onSearch();
  state.xAxis = 'roughness';
  state.yAxis = 'warmth';
  $xSelect.value = 'roughness';
  $ySelect.value = 'warmth';
  updateAxisLabels();
  updatePositions(true);
  clearSelection();
  if (compareMode) toggleCompareMode();
  setLightIntensity(1.8);
  $lightSlider.value = 1.8;
  $lightVal.textContent = '1.8';
  clearPersistence();
  resetHistoryButtons();
  pushHistory(null);
}

/* ═══════════════════════════════════════════════════
   KEYBOARD NAVIGATION
   ═══════════════════════════════════════════════════ */
let focusIndex = -1;

function onScatterKeydown(e) {
  const keys = ['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Enter',' ','Tab','Escape'];
  if (keys.indexOf(e.key) === -1) return;
  e.preventDefault();
  if (e.key === 'Escape') { clearSelection(); return; }
  if (e.key === 'Enter' || e.key === ' ') {
    if (focusIndex >= 0 && focusIndex < flooringData.length) {
      handleNodeClick(flooringData[focusIndex].id);
    }
    return;
  }
  if (e.key === 'Tab') {
    focusIndex = e.shiftKey ? (focusIndex <= 0 ? flooringData.length - 1 : focusIndex - 1) : (focusIndex + 1) % flooringData.length;
  } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
    focusIndex = (focusIndex + 1) % flooringData.length;
  } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
    focusIndex = focusIndex <= 0 ? flooringData.length - 1 : focusIndex - 1;
  }
  const el = nodeEls[flooringData[focusIndex].id];
  if (el) el.focus();
}

function onGlobalKeydown(e) {
  if (e.key === 'Escape') {
    if ($compareOverlay.classList.contains('visible')) { closeCompare(); }
    else if (state.selectedId) clearSelection();
    return;
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
    e.preventDefault();
    $searchInput.focus();
    $searchInput.select();
  }
  if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
    e.preventDefault();
    document.getElementById('undoBtn').click();
  }
  if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
    e.preventDefault();
    document.getElementById('redoBtn').click();
  }
  if (!e.metaKey && !e.ctrlKey && !e.altKey) {
    const num = e.key === '0' ? 10 : parseInt(e.key);
    if (num >= 1 && num <= 10 && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'SELECT') {
      e.preventDefault();
      if (num - 1 < flooringData.length) handleNodeClick(flooringData[num - 1].id);
    }
  }
}

/* ═══════════════════════════════════════════════════
   SETUP & INIT
   ═══════════════════════════════════════════════════ */
function setupControls() {
  $xSelect.addEventListener('change', () => {
    state.xAxis = $xSelect.value;
    updateAxisLabels();
    updatePositions(true);
    persistState();
  });
  $ySelect.addEventListener('change', () => {
    state.yAxis = $ySelect.value;
    updateAxisLabels();
    updatePositions(true);
    persistState();
  });
  $lightSlider.addEventListener('input', () => {
    setLightIntensity(parseFloat($lightSlider.value));
    $lightVal.textContent = parseFloat($lightSlider.value).toFixed(1);
  });
  window.addEventListener('resize', onResize);

  $searchInput.addEventListener('input', onSearch);
  $searchClear.addEventListener('click', () => {
    $searchInput.value = '';
    onSearch();
    $searchInput.focus();
  });

  $compareToggle.addEventListener('click', toggleCompareMode);
  $compareClose.addEventListener('click', closeCompare);
  $compareOverlay.addEventListener('click', (e) => {
    if (e.target === $compareOverlay) closeCompare();
  });

  document.getElementById('resetBtn').addEventListener('click', resetAll);
  document.getElementById('exportBtn').addEventListener('click', exportData);
  document.getElementById('clearSelectionBtn').addEventListener('click', clearSelection);
  initHistoryButtons();

  const $scatter = document.getElementById('scatterContainer');
  $scatter.setAttribute('tabindex', '0');
  $scatter.setAttribute('role', 'listbox');
  $scatter.setAttribute('aria-label', 'Flooring materials scatter plot');
  $scatter.addEventListener('keydown', onScatterKeydown);
  document.addEventListener('keydown', onGlobalKeydown);
}

function init() {
  const restoreId = restoreState();
  createGrid();
  createNodes(handleNodeClick);
  updatePositions(false);
  updateAxisLabels();
  setupControls();
  initThree();
  document.getElementById('matCount').textContent = '· ' + flooringData.length + ' materials';

  if (restoreId) selectMaterial(restoreId);
  pushHistory(state.selectedId || null);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const overlay = document.getElementById('loadingOverlay');
      if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 600);
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
