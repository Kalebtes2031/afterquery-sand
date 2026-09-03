const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-Memory Database of Pan-African Renewable Microgrid Installations
let microgrids = [
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

let bessUnits = [
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

let engineersPool = [
  { id: 'ENG-1', name: 'Abeba Haile', certification: 'High-Voltage BESS Specialist', region: 'East Africa' },
  { id: 'ENG-2', name: 'Tariq Al-Mansoor', certification: 'CSP Thermal Inverter Engineer', region: 'North Africa' },
  { id: 'ENG-3', name: 'Chukwudi Okafor', certification: 'Grid Automation & SCADA Lead', region: 'West Africa' },
  { id: 'ENG-4', name: 'Sipho Ndlovu', certification: 'Substation Protection Tech', region: 'Southern Africa' },
  { id: 'ENG-5', name: 'Fatoumata Diallo', certification: 'Solar Photovoltaic Systems Master', region: 'West Africa' }
];

let assignedEngineers = {
  'GRID-102': [
    { id: 'ENG-1', name: 'Abeba Haile', certification: 'High-Voltage BESS Specialist' }
  ]
};

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'afrigrid-core-api',
    timestamp: new Date().toISOString()
  });
});

// Stats Endpoint
app.get('/api/stats', (req, res) => {
  const activeGrids = microgrids.length;
  const totalCapacityMw = microgrids.reduce((acc, g) => acc + g.capacityMw, 0);
  const currentLoadMw = microgrids.reduce((acc, g) => acc + g.currentLoadMw, 0);
  const brownoutAlerts = microgrids.filter(g => g.status === 'BROWNOUT_ALERT').length;

  res.json({
    activeGrids,
    totalCapacityMw: Math.round(totalCapacityMw),
    currentLoadMw: Math.round(currentLoadMw),
    brownoutAlerts
  });
});

// Microgrids List & Detail
app.get('/api/microgrids', (req, res) => {
  res.json(microgrids);
});

app.get('/api/microgrids/:id', (req, res) => {
  const grid = microgrids.find(g => g.id === req.params.id);
  if (!grid) return res.status(404).json({ error: 'Microgrid installation not found' });
  res.json(grid);
});

// D2 Base Bug: Critical circuit override fails to sync grid object and returns unwrapped status
app.post('/api/microgrids/:id/critical-override', (req, res) => {
  const grid = microgrids.find(g => g.id === req.params.id);
  if (!grid) return res.status(404).json({ error: 'Microgrid not found' });

  const { circuitName, priorityLevel } = req.body;
  if (!circuitName) return res.status(400).json({ error: 'Circuit name required' });

  // BROKEN LOGIC for D2:
  // Sets internal status but fails to include updated circuit list in grid and returns unwrapped status
  grid.status = 'OPTIMAL';
  grid.alertLevel = 'NORMAL';

  res.json({
    success: true,
    overrideStatus: 'SHIELDED',
    message: `Circuit ${circuitName} designated as Priority-1 Critical Backup`
  });
});

// BESS Dispatch Endpoints
app.get('/api/dispatch/bess', (req, res) => {
  res.json(bessUnits);
});

// D3 Base Bug: Inverted dispatch status and ascending thermal rack sort (coldest first)
app.post('/api/dispatch/bess', (req, res) => {
  const { bessId, command } = req.body;
  const unit = bessUnits.find(b => b.id === bessId);
  if (!unit) return res.status(404).json({ error: 'BESS unit not found' });

  const isDischarging = command === 'DISCHARGE';

  // BROKEN LOGIC for D3:
  // Inverted status: when commanding DISCHARGE, sets OFFLINE_TRIPPED instead of DISCHARGING!
  unit.status = isDischarging ? 'OFFLINE_TRIPPED' : 'DISCHARGING';

  // Broken rack sort: sorts ascending by temperature (coldest first, hiding critical overheating cells)
  const sortedRacks = [...unit.thermalRacks].sort((a, b) => a.tempC - b.tempC);

  res.json({
    success: true,
    unit: {
      ...unit,
      thermalRacks: sortedRacks
    }
  });
});

// Field Engineers Endpoints
app.get('/api/dispatch/engineers', (req, res) => {
  res.json(engineersPool);
});

// D4 Base Bug: Ranger/Engineer allocation serialization type mismatch when count > 2
app.post('/api/dispatch/engineers', (req, res) => {
  const { gridId, engineerIds } = req.body;
  const grid = microgrids.find(g => g.id === gridId);
  if (!grid) return res.status(404).json({ error: 'Grid not found' });

  if (!Array.isArray(engineerIds) || engineerIds.length === 0) {
    return res.status(400).json({ error: 'engineerIds array required' });
  }

  const selected = engineersPool.filter(e => engineerIds.includes(e.id));

  // BROKEN LOGIC for D4:
  // When assigning > 2 engineers, returns array of plain strings instead of engineer objects
  if (selected.length > 2) {
    assignedEngineers[gridId] = selected.map(e => e.id);
  } else {
    assignedEngineers[gridId] = selected;
  }

  res.json({
    success: true,
    gridId,
    assignedEngineers: assignedEngineers[gridId]
  });
});

// D1 Base Bug: Community Tariff & Solar Feed-In Calculation
app.post('/api/tariffs/calculate', (req, res) => {
  const {
    monthlyKwh = 350,
    baseRatePerKwh = 0.15,
    lifelineSubsidyPct = 50,
    solarFeedInKwh = 60,
    feedInRatePerKwh = 0.06,
    ruralGridAccessFee = 4.50
  } = req.body;

  const totalKwh = Number(monthlyKwh) || 0;
  const baseRate = Number(baseRatePerKwh) || 0;
  const subsidyPct = Number(lifelineSubsidyPct) || 0;
  const feedInKwh = Number(solarFeedInKwh) || 0;
  const feedInRate = Number(feedInRatePerKwh) || 0;
  const accessFee = Number(ruralGridAccessFee) || 0;

  // BROKEN LOGIC for D1:
  // Subtracts feed-in kWh BEFORE evaluating tiered brackets, and applies double discount factor
  const netKwh = totalKwh - feedInKwh;
  const rawSubtotal = netKwh * baseRate;
  const subsidyDiscount = rawSubtotal * subsidyPct; // double counts if e.g. 50 instead of 0.50
  const feedInCredit = feedInKwh * feedInRate;
  const totalCost = (rawSubtotal - subsidyDiscount) - feedInCredit + accessFee;

  res.json({
    totalKwh,
    grossEnergyCharge: Number(rawSubtotal.toFixed(2)),
    lifelineSubsidyDiscount: Number(subsidyDiscount.toFixed(2)),
    solarFeedInCredit: Number(feedInCredit.toFixed(2)),
    gridAccessFee: accessFee,
    totalMonthlyBill: Number(totalCost.toFixed(2))
  });
});

app.listen(PORT, () => {
  console.log(`[AfriGrid Core API] Microgrid server listening on port ${PORT}`);
});
