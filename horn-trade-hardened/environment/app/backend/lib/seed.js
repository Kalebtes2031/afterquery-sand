const seed = [
  { id: 'HT-104', origin: 'Ethiopia', destination: 'Kenya', commodity: 'Washed coffee', weightKg: 840, status: 'pending', priority: 'High', notes: 'Export documents received; customs review is due today.' },
  { id: 'HT-107', origin: 'Kenya', destination: 'Uganda', commodity: 'Tea leaves', weightKg: 1260, status: 'approved', priority: 'Normal', notes: 'Transit permit matched to carrier.' },
  { id: 'HT-112', origin: 'Rwanda', destination: 'Tanzania', commodity: 'Arabica coffee', weightKg: 640, status: 'pending', priority: 'Normal', notes: 'Origin certificate is attached.' },
  { id: 'HT-118', origin: 'Uganda', destination: 'Rwanda', commodity: 'Sesame', weightKg: 910, status: 'rejected', priority: 'Low', notes: 'Packing list did not match declared bags.' },
  { id: 'HT-121', origin: 'Ethiopia', destination: 'Tanzania', commodity: 'Cut flowers', weightKg: 420, status: 'pending', priority: 'High', notes: 'Cold-chain handoff needs confirmation.' },
  { id: 'HT-125', origin: 'Tanzania', destination: 'Kenya', commodity: 'Cashew nuts', weightKg: 1520, status: 'approved', priority: 'Normal', notes: 'Inspection completed at origin.' }
];

module.exports = { seed };
