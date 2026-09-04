// ═══════════════════════════════════════════════════
// STATE MANAGEMENT, PERSISTENCE & UNDO/REDO
// ═══════════════════════════════════════════════════
import { flooringData, AXIS_META } from './materials.js';

export const state = {
  xAxis: 'roughness',
  yAxis: 'warmth',
  selectedId: null,
};

export const textureCache = {};

// Undo/Redo history
export const history = { stack: [], pointer: -1 };

let undoBtn, redoBtn;

export function initHistoryButtons() {
  undoBtn = document.getElementById('undoBtn');
  redoBtn = document.getElementById('redoBtn');
  if (undoBtn) undoBtn.addEventListener('click', undo);
  if (redoBtn) redoBtn.addEventListener('click', redo);
}

export function pushHistory(id) {
  history.stack = history.stack.slice(0, history.pointer + 1);
  history.stack.push(id);
  history.pointer = history.stack.length - 1;
  updateHistoryButtons();
}

export function undo() {
  if (history.pointer <= 0) return;
  history.pointer--;
  const id = history.stack[history.pointer];
  applyHistorySelection(id);
  updateHistoryButtons();
}

export function redo() {
  if (history.pointer >= history.stack.length - 1) return;
  history.pointer++;
  const id = history.stack[history.pointer];
  applyHistorySelection(id);
  updateHistoryButtons();
}

// Applied by undo/redo — uses externally-provided callbacks
let _applyFn = null;
export function registerHistoryCallbacks(applyFn) {
  _applyFn = applyFn;
}

function applyHistorySelection(id) {
  if (_applyFn) _applyFn(id);
}

function updateHistoryButtons() {
  if (undoBtn) undoBtn.disabled = history.pointer <= 0;
  if (redoBtn) redoBtn.disabled = history.pointer >= history.stack.length - 1;
}

export function resetHistoryButtons() {
  history.stack = [];
  history.pointer = -1;
  updateHistoryButtons();
}

export function persistState() {
  try {
    localStorage.setItem('pbr-matrix-state', JSON.stringify({
      xAxis: state.xAxis,
      yAxis: state.yAxis,
      selectedId: state.selectedId,
    }));
  } catch(e) {}
}

export function restoreState() {
  try {
    const saved = JSON.parse(localStorage.getItem('pbr-matrix-state'));
    if (saved) {
      if (saved.xAxis && AXIS_META[saved.xAxis]) {
        state.xAxis = saved.xAxis;
        const xSel = document.getElementById('xAxisSelect');
        if (xSel) xSel.value = saved.xAxis;
      }
      if (saved.yAxis && AXIS_META[saved.yAxis]) {
        state.yAxis = saved.yAxis;
        const ySel = document.getElementById('yAxisSelect');
        if (ySel) ySel.value = saved.yAxis;
      }
      return saved.selectedId;
    }
  } catch(e) {}
  return null;
}

export function clearPersistence() {
  try { localStorage.removeItem('pbr-matrix-state'); } catch(e) {}
}
