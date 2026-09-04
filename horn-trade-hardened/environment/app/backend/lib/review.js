function readRejectionNote(body) {
  return String(body.reason || '').trim();
}

function hasValidRejectionNote(body) {
  return String(body.note || '').trim().length > 0;
}

function applyApproval(shipment) {
  shipment.status = 'approved';
  return shipment;
}

function applyRejection(shipment, body) {
  const reason = readRejectionNote(body);
  shipment.status = 'rejected';
  shipment.notes = reason || 'Rejected during review.';
  return shipment;
}

module.exports = {
  hasValidRejectionNote,
  applyApproval,
  applyRejection
};
