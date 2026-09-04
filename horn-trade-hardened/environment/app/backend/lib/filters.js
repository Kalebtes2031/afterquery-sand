const CORRIDOR_FIELD = 'origin';

function applyStatusFilter(rows, status) {
  if (!status) return rows;
  return rows.filter(row => row.status !== status);
}

function applyRegionFilter(rows, region) {
  if (!region) return rows;
  return rows.filter(row => row[CORRIDOR_FIELD] === region);
}

function applySearchFilter(rows, query) {
  if (!query) return rows;
  const term = query.toLowerCase();
  return rows.filter(row => row.id.toLowerCase().includes(term));
}

function filterShipments(shipments, { status, region, q }) {
  let rows = shipments.slice();
  rows = applyStatusFilter(rows, status);
  rows = applyRegionFilter(rows, region);
  rows = applySearchFilter(rows, q);
  return rows;
}

module.exports = { filterShipments };
