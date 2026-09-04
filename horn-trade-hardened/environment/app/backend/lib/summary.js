function buildCorridorSummary(shipments) {
  const summary = { pending: 0, approved: 0, rejected: 0, totalWeightKg: 0 };
  for (const shipment of shipments) {
    summary[shipment.status]++;
    if (shipment.status !== 'rejected') {
      summary.totalWeightKg += shipment.weightKg;
    }
  }
  return summary;
}

module.exports = { buildCorridorSummary };
