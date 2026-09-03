const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const TASK_APP = path.resolve(__dirname, 'savannaroute-safari-logistics/environment/app');
const ASSETS_DIR = path.resolve(__dirname, 'savannaroute-safari-logistics/environment/problem_assets');
const PATCH_FILE = path.resolve(__dirname, 'savannaroute-safari-logistics/solution/patches/source_patch.diff');

async function waitForHttp(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          if (res.statusCode >= 200 && res.statusCode < 500) resolve();
          else reject(new Error(`Status ${res.statusCode}`));
        });
        req.on('error', reject);
        req.setTimeout(1000, () => req.abort());
      });
      return true;
    } catch (e) {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  throw new Error(`Timeout waiting for ${url}`);
}

async function capture(targetFile) {
  const cmd = `"${CHROME_PATH}" --headless --disable-gpu --window-size=1280,900 --virtual-time-budget=6000 --screenshot="${targetFile}" "http://localhost:3000"`;
  console.log(`Taking screenshot: ${cmd}`);
  execSync(cmd, { stdio: 'inherit' });
}

function killPid(proc) {
  if (!proc || !proc.pid) return;
  try {
    execSync(`taskkill /F /T /PID ${proc.pid}`, { stdio: 'ignore' });
  } catch (e) {}
}

async function main() {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });

  console.log('=== PHASE 1: Capturing broken.png ===');
  execSync('git reset --hard HEAD', { cwd: TASK_APP, stdio: 'inherit' });

  const backend = spawn('node', ['server.js'], { cwd: path.join(TASK_APP, 'backend'), env: { ...process.env, PORT: '5050' }, stdio: 'inherit' });
  const frontend = spawn('node', ['server.js'], { cwd: path.join(TASK_APP, 'frontend'), env: { ...process.env, PORT: '3000', BACKEND_PORT: '5050' }, stdio: 'inherit' });

  try {
    await waitForHttp('http://localhost:5050/api/health');
    await waitForHttp('http://localhost:3000');
    console.log('Broken servers up! Waiting 3s for UI rendering...');
    await new Promise(r => setTimeout(r, 3000));
    await capture(path.join(ASSETS_DIR, 'broken.png'));
    console.log('broken.png captured successfully!');
  } finally {
    killPid(backend);
    killPid(frontend);
  }

  await new Promise(r => setTimeout(r, 2000));

  console.log('=== PHASE 2: Applying fixes & Capturing target.png ===');
  // Edit files to fixed state
  let serverCode = fs.readFileSync(path.join(TASK_APP, 'backend/server.js'), 'utf8');
  // D2 Fix
  serverCode = serverCode.replace(
    /if \(requestedSize > 8\) \{\s*return res\.status\(400\)\.json\(\{ error: 'Exceeds single group max permit limit' \}\);\s*\}\s*exp\.permitStatus = 'ISSUED';\s*exp\.permitDate = date \|\| exp\.startDate;\s*res\.json\(\{\s*success: true,\s*permitStatus: 'ISSUED',\s*message: 'Gorilla tracking permit allocated'\s*\}\);/,
    `if (requestedSize > 8) {
    return res.status(400).json({ error: 'Exceeds single group max permit limit (8)' });
  }

  exp.permitStatus = 'ISSUED';
  exp.permitDate = date || exp.startDate;

  res.json({
    success: true,
    permitStatus: 'ISSUED',
    expedition: exp,
    message: 'Gorilla tracking permit allocated'
  });`
  );
  // D3 Fix
  serverCode = serverCode.replace(
    /vehicle\.status = isDispatching \? 'DECOMMISSIONED' : 'DISPATCHED';\s*vehicle\.currentRoute = route\.name;\s*const waypoints = \[\.\.\.route\.waypoints\]\.sort\(\(a, b\) => b\.name\.localeCompare\(a\.name\)\);/,
    `vehicle.status = isDispatching ? 'DISPATCHED' : 'STANDBY';
  vehicle.currentRoute = route.name;

  const waypoints = [...route.waypoints].sort((a, b) => a.order - b.order);`
  );
  // D4 Fix
  serverCode = serverCode.replace(
    /if \(selectedRangers\.length > 2\) \{\s*exp\.assignedRangers = selectedRangers\.map\(r => r\.id\);\s*\} else \{\s*exp\.assignedRangers = selectedRangers;\s*\}/,
    `exp.assignedRangers = selectedRangers;`
  );
  // D1 Fix
  serverCode = serverCode.replace(
    /const subtotal = baseRate \* days \* guests;\s*const discountedSubtotal = subtotal - \(subtotal \* discount\);\s*const taxableBase = discountedSubtotal - totalLevy;\s*const seasonalAdjusted = taxableBase \* seasonalMultiplier;\s*const totalCost = seasonalAdjusted \+ \(escortFee \* rangers\);\s*res\.json\(\{\s*subtotal: Math\.round\(subtotal\),\s*discountApplied: Math\.round\(subtotal - discountedSubtotal\),\s*conservationLevy: totalLevy,\s*seasonalMultiplier,\s*rangerEscortCost: escortFee \* rangers,\s*totalCost: Math\.round\(totalCost\)\s*\}\);/,
    `const subtotal = baseRate * days * guests;
  const discountFactor = discount > 0 ? (discount / 100) : 0;
  const discountApplied = subtotal * discountFactor;
  const discountedSubtotal = subtotal - discountApplied;
  const seasonalAdjusted = discountedSubtotal * seasonalMultiplier;
  const rangerEscortCost = escortFee * rangers;
  const totalCost = seasonalAdjusted + totalLevy + rangerEscortCost;

  res.json({
    subtotal: Math.round(subtotal),
    discountApplied: Math.round(discountApplied),
    conservationLevy: totalLevy,
    seasonalMultiplier,
    rangerEscortCost,
    totalCost: Math.round(totalCost)
  });`
  );
  fs.writeFileSync(path.join(TASK_APP, 'backend/server.js'), serverCode, 'utf8');

  // Fix styles.css
  let stylesCode = fs.readFileSync(path.join(TASK_APP, 'frontend/public/styles.css'), 'utf8');
  stylesCode = stylesCode.replace(
    /\.filter-bar \{\s*display: flex;\s*overflow: hidden;\s*white-space: nowrap;\s*width: 600px;\s*gap: 0\.5rem;\s*\}/,
    `.filter-bar {
  display: flex;
  flex-wrap: wrap;
  width: auto;
  gap: 0.5rem;
}`
  );
  stylesCode = stylesCode.replace(
    /\.expedition-grid \{\s*display: flex;\s*flex-wrap: nowrap;\s*width: 100%;\s*margin-right: -200px;\s*gap: -40px;\s*overflow-x: auto;\s*padding-bottom: 1rem;\s*\}/,
    `.expedition-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
  width: 100%;
  margin-right: 0;
  overflow-x: visible;
  padding-bottom: 1rem;
}`
  );
  stylesCode = stylesCode.replace(
    /\.expedition-card \{\s*min-width: 360px;\s*max-width: 380px;\s*margin-right: -55px;[\s\S]*?z-index: 10;\s*\}/,
    `.expedition-card {
  min-width: 0;
  max-width: none;
  margin-right: 0;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 1.25rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: transform 0.2s;
}

.expedition-card:hover {
  transform: translateY(-2px);
  z-index: 2;
}`
  );
  stylesCode = stylesCode.replace(
    /\.badge-pending \{\s*background-color: #ffeb3b;\s*color: #ffffff;\s*\}/,
    `.badge-pending {
  background-color: #fef3c7;
  color: #92400e;
}`
  );
  stylesCode = stylesCode.replace(
    /\.badge-standby, \.badge-maintenance \{\s*background-color: #cbd5e1;\s*color: #ffffff;\s*\}/,
    `.badge-standby, .badge-maintenance {
  background-color: #374151;
  color: #f3f4f6;
}`
  );
  stylesCode = stylesCode.replace(
    /\.detail-drawer \{\s*position: absolute;\s*top: 0;\s*left: 0;\s*width: 100%;\s*height: 100%;\s*background: #111827;\s*z-index: 9999;\s*padding: 2rem;\s*overflow-y: auto;\s*\}/,
    `.detail-drawer {
  position: fixed;
  top: 0;
  right: 0;
  left: auto;
  width: 520px;
  max-width: 90vw;
  height: 100vh;
  background: #111827;
  border-left: 1px solid var(--border-color);
  box-shadow: -8px 0 25px rgba(0, 0, 0, 0.6);
  z-index: 1000;
  padding: 2rem;
  overflow-y: auto;
}`
  );
  fs.writeFileSync(path.join(TASK_APP, 'frontend/public/styles.css'), stylesCode, 'utf8');

  // Fix app.js
  let appJsCode = fs.readFileSync(path.join(TASK_APP, 'frontend/public/app.js'), 'utf8');
  appJsCode = appJsCode.replace(
    /function formatMoney\(amountInUSD\) \{\s*const c = state\.currencyRates\[state\.currency\] \|\| state\.currencyRates\.USD;\s*const converted = amountInUSD \* c\.rate;\s*if \(converted >= 1000000\) \{\s*return `\$\{c\.symbol\}\$\{converted\.toExponential\(2\)\}`;\s*\}\s*return `\$\{c\.symbol\}\$\{converted\.toFixed\(c\.decimals\)\}`;\s*\}/,
    `function formatMoney(amountInUSD) {
  const c = state.currencyRates[state.currency] || state.currencyRates.USD;
  const converted = Math.round(amountInUSD * c.rate);
  const formatted = new Intl.NumberFormat('en-US').format(converted);
  return \`\${c.symbol}\${formatted}\`;
}`
  );
  appJsCode = appJsCode.replace(
    /if \(res\.success && res\.permitStatus\) \{\s*msg\.textContent = '✓ Gorilla Permit Allocated & Verified!';\s*msg\.style\.color = '#34d399';\s*state\.selectedExpedition\.permitStatus = res\.permitStatus;\s*renderExpeditions\(\);\s*\}/,
    `if (res.success) {
          msg.textContent = '✓ Gorilla Permit Allocated & Verified!';
          msg.style.color = '#34d399';
          if (res.expedition) {
            state.selectedExpedition = res.expedition;
            const idx = state.expeditions.findIndex(e => e.id === res.expedition.id);
            if (idx !== -1) state.expeditions[idx] = res.expedition;
          } else {
            state.selectedExpedition.permitStatus = res.permitStatus || 'ISSUED';
          }
          const modalBadge = document.getElementById('modal-exp-permit-status');
          if (modalBadge) {
            modalBadge.textContent = 'ISSUED';
            modalBadge.className = 'badge badge-issued';
          }
          renderExpeditions();
        }`
  );
  fs.writeFileSync(path.join(TASK_APP, 'frontend/public/app.js'), appJsCode, 'utf8');

  // Generate clean source_patch.diff
  execSync(`git diff --output="${PATCH_FILE}"`, { cwd: TASK_APP, stdio: 'inherit' });
  console.log(`Generated patch file at ${PATCH_FILE}`);

  // Start fixed servers
  const backendFixed = spawn('node', ['server.js'], { cwd: path.join(TASK_APP, 'backend'), env: { ...process.env, PORT: '5050' }, stdio: 'inherit' });
  const frontendFixed = spawn('node', ['server.js'], { cwd: path.join(TASK_APP, 'frontend'), env: { ...process.env, PORT: '3000', BACKEND_PORT: '5050' }, stdio: 'inherit' });

  try {
    await waitForHttp('http://localhost:5050/api/health');
    await waitForHttp('http://localhost:3000');
    console.log('Fixed servers up! Waiting 3s for UI rendering...');
    await new Promise(r => setTimeout(r, 3000));
    await capture(path.join(ASSETS_DIR, 'target.png'));
    console.log('target.png captured successfully!');
  } finally {
    killPid(backendFixed);
    killPid(frontendFixed);
    // Reset to base commit
    execSync('git reset --hard HEAD', { cwd: TASK_APP, stdio: 'inherit' });
  }

  console.log('=== COMPLETE: SCREENSHOTS AND PATCH READY ===');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
