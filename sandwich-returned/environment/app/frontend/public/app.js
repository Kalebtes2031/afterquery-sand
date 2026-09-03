// AfriGrid Solar Frontend Application Logic

const BACKEND_URL = window.BACKEND_URL !== undefined ? window.BACKEND_URL : '';

const INITIAL_MICROGRIDS = [
  {
    id: 'GRID-101',
    name: 'Benban Solar Complex',
    location: 'Aswan Governorate, Egypt',
    region: 'North Africa',
    capacityMw: 1650,
    currentLoadMw: 1420,
    storageSocPct: 88,
    status: 'OPTIMAL',
    alertLevel: 'NORMAL',
    feedInRatePerKwh: 0.08,
    baseTariffPerKwh: 0.12,
    lifelineSubsidyPct: 40,
    priorityCircuits: ['Aswan Regional Hospital', 'Nile Irrigation Pumps', 'Wadi Municipal Water']
  },
  {
    id: 'GRID-102',
    name: 'Garissa Solar Station',
    location: 'Garissa County, Kenya',
    region: 'East Africa',
    capacityMw: 54.6,
    currentLoadMw: 49.2,
    storageSocPct: 42,
    status: 'BROWNOUT_ALERT',
    alertLevel: 'WARNING',
    feedInRatePerKwh: 0.06,
    baseTariffPerKwh: 0.15,
    lifelineSubsidyPct: 50,
    priorityCircuits: ['Garissa Referral Hospital', 'Sankuri Cold Chain Vaccine Storage']
  },
  {
    id: 'GRID-103',
    name: 'Noor Ouarzazate Solar Complex',
    location: 'Drâa-Tafilalet, Morocco',
    region: 'North Africa',
    capacityMw: 580,
    currentLoadMw: 510,
    storageSocPct: 94,
    status: 'OPTIMAL',
    alertLevel: 'NORMAL',
    feedInRatePerKwh: 0.09,
    baseTariffPerKwh: 0.14,
    lifelineSubsidyPct: 35,
    priorityCircuits: ['Atlas Water Desalination Facility', 'Ouarzazate District Clinic']
  },
  {
    id: 'GRID-104',
    name: 'Kariba Hydro-Solar Hybrid',
    location: 'Siavonga District, Zambia',
    region: 'Southern Africa',
    capacityMw: 120,
    currentLoadMw: 112,
    storageSocPct: 65,
    status: 'OPTIMAL',
    alertLevel: 'NORMAL',
    feedInRatePerKwh: 0.05,
    baseTariffPerKwh: 0.10,
    lifelineSubsidyPct: 45,
    priorityCircuits: ['Zambezi Valley Healthcare Center', 'Siavonga Fish Hatchery Aerators']
  },
  {
    id: 'GRID-105',
    name: 'Kainji Rural Solar Hub',
    location: 'Niger State, Nigeria',
    region: 'West Africa',
    capacityMw: 75,
    currentLoadMw: 68,
    storageSocPct: 78,
    status: 'OPTIMAL',
    alertLevel: 'NORMAL',
    feedInRatePerKwh: 0.07,
    baseTariffPerKwh: 0.13,
    lifelineSubsidyPct: 40,
    priorityCircuits: ['New Bussa Primary Health Center', 'Kainji Lake Agritech Silos']
  }
];

const INITIAL_BESS = [
  {
    id: 'BESS-01',
    name: 'Garissa MegaPack Inverter Bank A',
    gridId: 'GRID-102',
    capacityMwh: 40,
    currentChargeMwh: 16.8,
    status: 'STANDBY',
    inverterEfficiencyPct: 96.5,
    thermalRacks: [
      { rackId: 'RACK-1', tempC: 32.4, status: 'NOMINAL' },
      { rackId: 'RACK-2', tempC: 44.8, status: 'ELEVATED' },
      { rackId: 'RACK-3', tempC: 58.2, status: 'CRITICAL_HOT' },
      { rackId: 'RACK-4', tempC: 28.1, status: 'NOMINAL' }
    ]
  },
  {
    id: 'BESS-02',
    name: 'Aswan BESS High-Voltage Core 03',
    gridId: 'GRID-101',
    capacityMwh: 120,
    currentChargeMwh: 105.6,
    status: 'CHARGING',
    inverterEfficiencyPct: 98.2,
    thermalRacks: [
      { rackId: 'RACK-A', tempC: 29.0, status: 'NOMINAL' },
      { rackId: 'RACK-B', tempC: 31.5, status: 'NOMINAL' }
    ]
  }
];

const INITIAL_ENGINEERS = [
  { id: 'ENG-1', name: 'Abeba Haile', certification: 'High-Voltage BESS Specialist', region: 'East Africa' },
  { id: 'ENG-2', name: 'Tariq Al-Mansoor', certification: 'CSP Thermal Inverter Engineer', region: 'North Africa' },
  { id: 'ENG-3', name: 'Chukwudi Okafor', certification: 'Grid Automation & SCADA Lead', region: 'West Africa' },
  { id: 'ENG-4', name: 'Sipho Ndlovu', certification: 'Substation Protection Tech', region: 'Southern Africa' },
  { id: 'ENG-5', name: 'Fatoumata Diallo', certification: 'Solar Photovoltaic Systems Master', region: 'West Africa' }
];

// State
let state = {
  microgrids: [...INITIAL_MICROGRIDS],
  bessUnits: [...INITIAL_BESS],
  engineers: [...INITIAL_ENGINEERS],
  selectedGrid: null,
  activeFilter: 'ALL',
  currency: 'USD',
  currencyRates: {
    USD: { symbol: '$', rate: 1.0, decimals: 2 },
    KES: { symbol: 'KSh ', rate: 130.0, decimals: 0 },
    EGP: { symbol: 'E£ ', rate: 48.0, decimals: 2 },
    ZAR: { symbol: 'R ', rate: 18.0, decimals: 2 },
    NGN: { symbol: '₦ ', rate: 1600.0, decimals: 0 }
  }
};

// D5 Base Bug: Currency formatting without locale separation
function formatCurrency(amountInUSD) {
  const c = state.currencyRates[state.currency] || state.currencyRates.USD;
  const converted = amountInUSD * c.rate;
  if (converted >= 1000000) {
    return `${c.symbol}${converted.toExponential(2)}`;
  }
  return `${c.symbol}${converted.toFixed(c.decimals)}`;
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setupNavigation();
  setupCurrencySelector();
  setupFilterBar();
  setupTariffCalculator();
  setupDispatch();
  setupModalEvents();

  renderMicrogrids();
  renderBessList();
  renderThermalRacks(state.bessUnits[0]);
  populateEngineerChecklist();
  calculateAndRenderBill();

  fetchInitialData();
});

// Navigation Tabs
function setupNavigation() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const targetTab = tab.getAttribute('data-tab');
      document.querySelectorAll('.tab-section').forEach(sec => sec.classList.remove('active'));
      const activeSection = document.getElementById(`section-${targetTab}`);
      if (activeSection) activeSection.classList.add('active');
    });
  });
}

// Currency Selector
function setupCurrencySelector() {
  const select = document.getElementById('currency-select');
  if (!select) return;
  select.addEventListener('change', (e) => {
    state.currency = e.target.value;
    renderMicrogrids();
    calculateAndRenderBill();
  });
}

// Regional Filters
function setupFilterBar() {
  const pills = document.querySelectorAll('.filter-pill');
  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.activeFilter = pill.getAttribute('data-filter');
      renderMicrogrids();
    });
  });
}

// Fetch Initial Data
async function fetchInitialData() {
  try {
    const [gridsRes, bessRes, engRes, statsRes] = await Promise.all([
      fetch(`${BACKEND_URL}/api/microgrids`).then(r => r.json()).catch(() => null),
      fetch(`${BACKEND_URL}/api/dispatch/bess`).then(r => r.json()).catch(() => null),
      fetch(`${BACKEND_URL}/api/dispatch/engineers`).then(r => r.json()).catch(() => null),
      fetch(`${BACKEND_URL}/api/stats`).then(r => r.json()).catch(() => null)
    ]);

    if (gridsRes && Array.isArray(gridsRes)) state.microgrids = gridsRes;
    if (bessRes && Array.isArray(bessRes)) state.bessUnits = bessRes;
    if (engRes && Array.isArray(engRes)) state.engineers = engRes;

    if (statsRes) updateStats(statsRes);
    renderMicrogrids();
    renderBessList();
    if (state.bessUnits.length > 0) renderThermalRacks(state.bessUnits[0]);
    populateEngineerChecklist();
  } catch (err) {
    console.error('Failed to sync data with backend:', err);
  }
}

function updateStats(stats) {
  if (!stats) return;
  const elGrids = document.getElementById('stat-active-grids');
  const elCap = document.getElementById('stat-total-capacity');
  const elLoad = document.getElementById('stat-current-load');
  const elBrownouts = document.getElementById('stat-brownout-alerts');

  if (elGrids && stats.activeGrids !== undefined) elGrids.textContent = `${stats.activeGrids} Hubs`;
  if (elCap && stats.totalCapacityMw !== undefined) elCap.textContent = `${stats.totalCapacityMw} MW`;
  if (elLoad && stats.currentLoadMw !== undefined) elLoad.textContent = `${stats.currentLoadMw} MW`;
  if (elBrownouts && stats.brownoutAlerts !== undefined) elBrownouts.textContent = `${stats.brownoutAlerts} Active`;
}

// Render Microgrids
function renderMicrogrids() {
  const container = document.getElementById('microgrid-cards-container');
  if (!container) return;

  const filtered = state.activeFilter === 'ALL'
    ? state.microgrids
    : state.microgrids.filter(g => g.region === state.activeFilter);

  container.innerHTML = filtered.map(grid => {
    const isBrownout = grid.status === 'BROWNOUT_ALERT';
    const statusBadgeClass = isBrownout ? 'badge-warning' : 'badge-optimal';

    const circuitChips = (grid.priorityCircuits || []).map(c => `
      <span class="circuit-chip">⚡ ${c}</span>
    `).join('');

    return `
      <div class="microgrid-card" data-grid-id="${grid.id}">
        <div class="card-top">
          <div class="card-region-tag">${grid.region} &bull; ${grid.location}</div>
          <h3 class="card-title">${grid.name}</h3>
          <div class="card-meta">
            <span>⚡ Cap: ${grid.capacityMw} MW</span>
            <span>📈 Load: ${grid.currentLoadMw} MW</span>
            <span>🔋 Storage SoC: ${grid.storageSocPct}%</span>
            <span>🏷️ Base Rate: ${formatCurrency(grid.baseTariffPerKwh)}/kWh</span>
          </div>
          <div class="card-badges">
            <span class="badge ${statusBadgeClass}" id="grid-status-${grid.id}">${grid.status}</span>
            <span class="badge badge-soc">${grid.storageSocPct}% BESS SoC</span>
          </div>
          <div class="circuit-chips">
            ${circuitChips}
          </div>
        </div>
        <div class="card-bottom">
          <div class="card-actions">
            <button class="btn btn-outline btn-manage" onclick="openMicrogridModal('${grid.id}')">Manage Emergency Circuits</button>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// Render BESS Banks
function renderBessList() {
  const container = document.getElementById('bess-banks-list');
  if (!container) return;

  container.innerHTML = state.bessUnits.map(b => {
    const statusClass = b.status === 'DISCHARGING' ? 'badge-optimal' : (b.status === 'CHARGING' ? 'badge-soc' : 'badge-standby');
    return `
      <div class="bess-card">
        <div class="bess-info">
          <h4>${b.name}</h4>
          <p>Capacity: ${b.capacityMwh} MWh &bull; Current Charge: ${b.currentChargeMwh} MWh (${Math.round((b.currentChargeMwh/b.capacityMwh)*100)}%)</p>
        </div>
        <div>
          <span class="badge ${statusClass}" id="bess-status-${b.id}">${b.status}</span>
        </div>
      </div>
    `;
  }).join('');
}

// Render Thermal Racks
function renderThermalRacks(unit) {
  const container = document.getElementById('thermal-racks-list');
  const title = document.getElementById('active-bess-name');
  if (!container || !unit) return;

  if (title) title.textContent = unit.name;

  container.innerHTML = (unit.thermalRacks || []).map(r => {
    const tempClass = r.tempC >= 50 ? 'temp-hot' : (r.tempC >= 40 ? 'temp-elevated' : 'temp-nominal');
    return `
      <div class="thermal-item">
        <div class="thermal-rack-name">${r.rackId} (${r.status})</div>
        <div class="thermal-temp ${tempClass}">${r.tempC}&deg;C</div>
      </div>
    `;
  }).join('');
}

// Setup Dispatch
function setupDispatch() {
  const btn = document.getElementById('btn-dispatch-bess');
  const unitSelect = document.getElementById('bess-unit-select');
  const cmdSelect = document.getElementById('bess-command-select');

  if (unitSelect) {
    unitSelect.addEventListener('change', () => {
      const unit = state.bessUnits.find(u => u.id === unitSelect.value);
      if (unit) renderThermalRacks(unit);
    });
  }

  if (btn) {
    btn.addEventListener('click', async () => {
      const bessId = unitSelect.value;
      const command = cmdSelect.value;

      try {
        const res = await fetch(`${BACKEND_URL}/api/dispatch/bess`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ bessId, command })
        }).then(r => r.json());

        if (res.success && res.unit) {
          const idx = state.bessUnits.findIndex(u => u.id === res.unit.id);
          if (idx !== -1) {
            state.bessUnits[idx] = res.unit;
          }
          renderBessList();
          renderThermalRacks(res.unit);
        }
      } catch (err) {
        console.error('BESS dispatch failed:', err);
      }
    });
  }
}

// Setup Tariff Calculator
function setupTariffCalculator() {
  const btn = document.getElementById('btn-calculate-bill');
  if (btn) {
    btn.addEventListener('click', calculateAndRenderBill);
  }
}

async function calculateAndRenderBill() {
  const instSelect = document.getElementById('calc-installation');
  const kwhInput = document.getElementById('calc-monthly-kwh');
  const feedInput = document.getElementById('calc-feed-in-kwh');
  const feeInput = document.getElementById('calc-access-fee');
  const subsidyInput = document.getElementById('calc-lifeline-pct');

  if (!instSelect) return;

  const baseRatePerKwh = Number(instSelect.value);
  const lifelineSubsidyPct = Number(subsidyInput?.value || 50);
  const feedInRatePerKwh = Number(instSelect.selectedOptions[0]?.dataset.feed || 0.06);
  const monthlyKwh = Number(kwhInput?.value || 350);
  const solarFeedInKwh = Number(feedInput?.value || 60);
  const ruralGridAccessFee = Number(feeInput?.value || 4.50);

  try {
    const res = await fetch(`${BACKEND_URL}/api/tariffs/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        monthlyKwh,
        baseRatePerKwh,
        lifelineSubsidyPct,
        solarFeedInKwh,
        feedInRatePerKwh,
        ruralGridAccessFee
      })
    }).then(r => r.json());

    document.getElementById('val-gross-charge').textContent = formatCurrency(res.grossEnergyCharge);
    document.getElementById('val-subsidy-discount').textContent = `-${formatCurrency(res.lifelineSubsidyDiscount)}`;
    document.getElementById('val-feedin-credit').textContent = `-${formatCurrency(res.solarFeedInCredit)}`;
    document.getElementById('val-access-fee').textContent = formatCurrency(res.gridAccessFee);
    document.getElementById('val-net-bill').textContent = formatCurrency(res.totalMonthlyBill);
    document.getElementById('val-billing-currency-note').textContent = `Billed in ${state.currency}`;
  } catch (err) {
    console.error('Tariff calculation failed:', err);
  }
}

// Modal & Emergency Handlers
function setupModalEvents() {
  const closeBtn = document.getElementById('btn-close-modal');
  const overrideBtn = document.getElementById('btn-engage-override');
  const saveEngBtn = document.getElementById('btn-save-engineers');

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      document.getElementById('microgrid-modal').style.display = 'none';
    });
  }

  // D2 Base Bug: reads unwrapped status and fails to update priority circuits list
  if (overrideBtn) {
    overrideBtn.addEventListener('click', async () => {
      if (!state.selectedGrid) return;
      const circuitName = document.getElementById('modal-circuit-input').value;
      const msg = document.getElementById('override-result-message');

      try {
        const res = await fetch(`${BACKEND_URL}/api/microgrids/${state.selectedGrid.id}/critical-override`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ circuitName, priorityLevel: 'CRITICAL_P1' })
        }).then(r => r.json());

        if (res.success && res.overrideStatus) {
          msg.textContent = '✓ Critical Clinic Backup Circuit Engaged & Shielded!';
          msg.style.color = '#34d399';
          state.selectedGrid.status = 'OPTIMAL';
          renderMicrogrids();
        } else {
          msg.textContent = `✗ ${res.error || 'Override failed'}`;
          msg.style.color = '#ef4444';
        }
      } catch (err) {
        msg.textContent = '✗ Network request failed';
        msg.style.color = '#ef4444';
      }
    });
  }

  // D4 Base Bug: assigning > 2 engineers
  if (saveEngBtn) {
    saveEngBtn.addEventListener('click', async () => {
      if (!state.selectedGrid) return;
      const checkboxes = document.querySelectorAll('input[name="engineer-choice"]:checked');
      const engineerIds = Array.from(checkboxes).map(cb => cb.value);
      const msg = document.getElementById('engineer-result-message');

      try {
        const res = await fetch(`${BACKEND_URL}/api/dispatch/engineers`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gridId: state.selectedGrid.id,
            engineerIds
          })
        }).then(r => r.json());

        if (res.success) {
          msg.textContent = `✓ Dispatched ${res.assignedEngineers.length} engineers!`;
          msg.style.color = '#34d399';
        }
      } catch (err) {
        msg.textContent = '✗ Failed to dispatch engineers';
        msg.style.color = '#ef4444';
      }
    });
  }
}

function openMicrogridModal(gridId) {
  const grid = state.microgrids.find(g => g.id === gridId);
  if (!grid) return;
  state.selectedGrid = grid;

  document.getElementById('modal-grid-id').textContent = grid.id;
  document.getElementById('modal-grid-title').textContent = `${grid.name} Emergency SCADA`;
  document.getElementById('modal-grid-location').textContent = `${grid.location} (${grid.region})`;
  
  const statusEl = document.getElementById('modal-grid-status');
  statusEl.textContent = grid.status;
  statusEl.className = `badge ${grid.status === 'OPTIMAL' ? 'badge-optimal' : 'badge-warning'}`;

  document.getElementById('override-result-message').textContent = '';
  document.getElementById('engineer-result-message').textContent = '';

  document.getElementById('microgrid-modal').style.display = 'block';
}
window.openMicrogridModal = openMicrogridModal;

function populateEngineerChecklist() {
  const list = document.getElementById('engineer-select-list');
  if (!list) return;

  list.innerHTML = state.engineers.map(e => `
    <label class="engineer-check-item">
      <input type="checkbox" name="engineer-choice" value="${e.id}" />
      <span>${e.name} (${e.certification})</span>
    </label>
  `).join('');
}
