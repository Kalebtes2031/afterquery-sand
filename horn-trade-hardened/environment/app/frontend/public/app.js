const app = document.getElementById('app');
const { badgeForShipment, badgeForDetail } = window.DisplayHelpers;
const { refineClientQueue } = window.ClientFilters;

let state = { shipments: [], selected: null, filter: 'all', region: 'all', q: '', summary: null };

const api = (path, options) => fetch('http://localhost:5000' + path, options).then(async response => {
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(data.error || 'Request failed'), { status: response.status });
  return data;
});

function esc(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
}

async function load() {
  const params = new URLSearchParams();
  if (state.filter !== 'all') params.set('status', state.filter);
  if (state.region !== 'all') params.set('region', state.region);
  if (state.q) params.set('q', state.q);

  const [listPayload, summaryPayload] = await Promise.all([
    api('/api/shipments?' + params),
    api('/api/summary')
  ]);

  state.shipments = refineClientQueue(listPayload.shipments, state.filter);
  state.summary = summaryPayload;

  if (!state.selected || !state.shipments.some(item => item.id === state.selected)) {
    state.selected = state.shipments[0]?.id || null;
  }
  render();
}

function render() {
  const selected = state.shipments.find(item => item.id === state.selected);
  const rowMarkup = state.shipments.length
    ? state.shipments.map(item => {
        const badge = badgeForShipment(item);
        return `<div class="row ${item.id === state.selected ? 'selected' : ''}" data-id="${item.id}">
          <div class="id">${item.id}</div>
          <div class="route">${esc(item.origin)} → ${esc(item.destination)}<small>${esc(item.commodity)} · ${item.weightKg.toLocaleString()} kg</small></div>
          <div class="commodity">${esc(item.priority)} priority</div>
          <div><span class="badge ${badge.className}">${badge.label}</span></div>
        </div>`;
      }).join('')
    : '<div class="empty">No shipments match these filters.</div>';

  const detailBadge = selected ? badgeForDetail(selected) : null;
  const detailMarkup = selected
    ? `<div class="panel-head"><b>Review record</b><span class="badge ${detailBadge.className}">${detailBadge.label}</span></div>
       <div class="detail-body">
         <h2>${selected.id}</h2>
         <div class="route-big">${esc(selected.origin)} → ${esc(selected.destination)}</div>
         <div class="meta">
           <div><span>Commodity</span><b>${esc(selected.commodity)}</b></div>
           <div><span>Weight</span><b>${selected.weightKg.toLocaleString()} kg</b></div>
           <div><span>Priority</span><b>${esc(selected.priority)}</b></div>
           <div><span>Current state</span><b>${esc(selected.status)}</b></div>
         </div>
         <div class="notes"><b>Reviewer note</b><br>${esc(selected.notes)}</div>
       </div>
       <div class="actions">
         <button id="reject" ${selected.status !== 'pending' ? 'disabled' : ''}>Reject</button>
         <button class="approve" id="approve" ${selected.status !== 'pending' ? 'disabled' : ''}>Approve</button>
       </div>`
    : '<div class="empty">Choose a shipment.</div>';

  app.innerHTML = `<div class="shell">
    <aside class="side">
      <div class="brand">Horn Trade Review<small>East Africa corridor desk</small></div>
      <div class="nav"><div class="active">Shipment review</div><div>Exceptions</div><div>Carrier handoffs</div><div>Audit trail</div></div>
      <div class="side-foot">Reviewing cross-border produce movements across Ethiopia, Kenya, Rwanda, Tanzania and Uganda.</div>
    </aside>
    <main class="main">
      <div class="top">
        <div><div class="eyebrow">Operations / corridor desk</div><div class="title">Shipment review</div><div class="sub">Check declarations before they move to the next border handoff.</div></div>
        <div class="date">Thursday · 03 Sep 2026</div>
      </div>
      <div class="stats">
        <div class="stat"><span>Pending review</span><b>${state.summary?.pending ?? 0}</b></div>
        <div class="stat"><span>Approved</span><b>${state.summary?.approved ?? 0}</b></div>
        <div class="stat"><span>Rejected</span><b>${state.summary?.rejected ?? 0}</b></div>
        <div class="stat"><span>Corridor weight</span><b>${(state.summary?.totalWeightKg ?? 0).toLocaleString()} kg</b></div>
      </div>
      <div class="toolbar">
        <input id="search" placeholder="Search ID, origin, destination…" value="${esc(state.q)}">
        <select id="status">
          <option value="all">All statuses</option>
          <option value="pending" ${state.filter === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="approved" ${state.filter === 'approved' ? 'selected' : ''}>Approved</option>
          <option value="rejected" ${state.filter === 'rejected' ? 'selected' : ''}>Rejected</option>
        </select>
        <select id="region">
          <option value="all">All countries</option>
          ${['Ethiopia', 'Kenya', 'Rwanda', 'Tanzania', 'Uganda'].map(region =>
            `<option ${state.region === region ? 'selected' : ''}>${region}</option>`
          ).join('')}
        </select>
        <span class="muted">${state.shipments.length} shown</span>
      </div>
      <div class="content">
        <section class="panel">
          <div class="panel-head"><b>Corridor queue</b><span class="muted">Select a shipment to review</span></div>
          <div class="rows">${rowMarkup}</div>
        </section>
        <aside class="panel detail">${detailMarkup}</aside>
      </div>
    </main>
  </div>
  <div id="toast" class="toast hide"></div>`;

  document.querySelectorAll('.row').forEach(row => {
    row.onclick = () => { state.selected = row.dataset.id; render(); };
  });
  document.getElementById('status').onchange = event => { state.filter = event.target.value; load(); };
  document.getElementById('region').onchange = event => { state.region = event.target.value; load(); };
  const searchInput = document.getElementById('search');
  searchInput.onkeydown = event => {
    if (event.key === 'Enter') { state.q = searchInput.value.trim(); load(); }
  };

  if (selected) {
    document.getElementById('approve').onclick = () => act('approve');
    document.getElementById('reject').onclick = () => {
      const reason = prompt('Why should this shipment be rejected?');
      if (reason) act('reject', reason);
    };
  }
}

async function act(kind, reason) {
  try {
    await api('/api/shipments/' + state.selected + '/' + kind, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    await load();
    toast(kind === 'approve' ? 'Shipment approved' : 'Shipment rejected');
  } catch (error) {
    toast(error.message);
  }
}

function toast(message) {
  const toastEl = document.getElementById('toast');
  toastEl.textContent = message;
  toastEl.classList.remove('hide');
  setTimeout(() => toastEl.classList.add('hide'), 2200);
}

load();
