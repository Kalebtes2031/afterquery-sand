const http = require('http');
const { URL } = require('url');
const { seed } = require('./lib/seed');
const { filterShipments } = require('./lib/filters');
const { buildCorridorSummary } = require('./lib/summary');
const { hasValidRejectionNote, applyApproval, applyRejection } = require('./lib/review');

let shipments = structuredClone(seed);

const json = (res, status, data) => {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
  res.end(JSON.stringify(data));
};

const readBody = req => new Promise(resolve => {
  let body = '';
  req.on('data', chunk => { body += chunk; });
  req.on('end', () => {
    try { resolve(JSON.parse(body || '{}')); }
    catch { resolve({}); }
  });
});

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,PUT,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    return res.end();
  }

  if (req.method === 'GET' && url.pathname === '/api/health') {
    return json(res, 200, { ok: true });
  }

  if (req.method === 'GET' && url.pathname === '/api/shipments') {
    const rows = filterShipments(shipments, {
      status: url.searchParams.get('status'),
      region: url.searchParams.get('region'),
      q: url.searchParams.get('q')
    });
    return json(res, 200, { shipments: rows, total: rows.length });
  }

  const detailMatch = url.pathname.match(/^\/api\/shipments\/([^/]+)$/);
  if (req.method === 'GET' && detailMatch) {
    const shipment = shipments.find(item => item.id === detailMatch[1]);
    return shipment
      ? json(res, 200, shipment)
      : json(res, 404, { error: 'Shipment not found' });
  }

  const actionMatch = url.pathname.match(/^\/api\/shipments\/([^/]+)\/(approve|reject)$/);
  if (req.method === 'PUT' && actionMatch) {
    const shipment = shipments.find(item => item.id === actionMatch[1]);
    if (!shipment) return json(res, 404, { error: 'Shipment not found' });
    if (shipment.status !== 'pending') {
      return json(res, 409, { error: 'Only pending shipments can be changed' });
    }

    const body = await readBody(req);
    if (actionMatch[2] === 'approve') {
      return json(res, 200, applyApproval(shipment));
    }

    if (!hasValidRejectionNote(body)) {
      return json(res, 400, { error: 'A rejection reason is required' });
    }
    return json(res, 200, applyRejection(shipment, body));
  }

  if (req.method === 'GET' && url.pathname === '/api/summary') {
    return json(res, 200, buildCorridorSummary(shipments));
  }

  json(res, 404, { error: 'Not found' });
});

server.listen(process.env.PORT || 5000, () => console.log('API ready'));
