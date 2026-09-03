const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const CHROME_PATH = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const TASK_APP = path.resolve(__dirname, 'afrigrid-solar-logistics/environment/app');
const ASSETS_DIR = path.resolve(__dirname, 'afrigrid-solar-logistics/environment/problem_assets');
const PATCH_FILE = path.resolve(__dirname, 'afrigrid-solar-logistics/solution/patches/source_patch.diff');

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
  // Edit backend/server.js
  let serverCode = fs.readFileSync(path.join(TASK_APP, 'backend/server.js'), 'utf8');
  // D2 Fix
  serverCode = serverCode.replace(
    /grid\.status = 'OPTIMAL';\s*grid\.alertLevel = 'NORMAL';\s*res\.json\(\{\s*success: true,\s*overrideStatus: 'SHIELDED',\s*message: `Circuit \$\{circuitName\} designated as Priority-1 Critical Backup`\s*\}\);/,
    `grid.status = 'OPTIMAL';
  grid.alertLevel = 'NORMAL';
  if (!grid.priorityCircuits.includes(circuitName)) {
    grid.priorityCircuits.unshift(circuitName);
  }

  res.json({
    success: true,
    overrideStatus: 'SHIELDED',
    grid,
    message: \`Circuit \${circuitName} designated as Priority-1 Critical Backup\`
  });`
  );
  // D3 Fix
  serverCode = serverCode.replace(
    /unit\.status = isDischarging \? 'OFFLINE_TRIPPED' : 'DISCHARGING';\s*\/\/ Broken rack sort: sorts ascending by temperature \(coldest first, hiding critical overheating cells\)\s*const sortedRacks = \[\.\.\.unit\.thermalRacks\]\.sort\(\(a, b\) => a\.tempC - b\.tempC\);/,
    `unit.status = isDischarging ? 'DISCHARGING' : 'STANDBY';
  const sortedRacks = [...unit.thermalRacks].sort((a, b) => b.tempC - a.tempC);`
  );
  // D4 Fix
  serverCode = serverCode.replace(
    /if \(selected\.length > 2\) \{\s*assignedEngineers\[gridId\] = selected\.map\(e => e\.id\);\s*\} else \{\s*assignedEngineers\[gridId\] = selected;\s*\}/,
    `assignedEngineers[gridId] = selected;`
  );
  // D1 Fix
  serverCode = serverCode.replace(
    /const netKwh = totalKwh - feedInKwh;\s*const rawSubtotal = netKwh \* baseRate;\s*const subsidyDiscount = rawSubtotal \* subsidyPct;[\s\S]*?res\.json\(\{[\s\S]*?\}\);/,
    `const lifelineTierKwh = Math.min(totalKwh, 50);
  const remainingKwh = Math.max(0, totalKwh - 50);
  const lifelineRate = baseRate * (1 - (subsidyPct / 100));
  const lifelineCost = lifelineTierKwh * lifelineRate;
  const regularCost = remainingKwh * baseRate;
  const grossEnergyCharge = totalKwh * baseRate;
  const actualEnergyCost = lifelineCost + regularCost;
  const lifelineSubsidyDiscount = grossEnergyCharge - actualEnergyCost;
  const solarFeedInCredit = feedInKwh * feedInRate;
  const totalMonthlyBill = actualEnergyCost - solarFeedInCredit + accessFee;

  res.json({
    totalKwh,
    grossEnergyCharge: Number(grossEnergyCharge.toFixed(2)),
    lifelineSubsidyDiscount: Number(lifelineSubsidyDiscount.toFixed(2)),
    solarFeedInCredit: Number(solarFeedInCredit.toFixed(2)),
    gridAccessFee: accessFee,
    totalMonthlyBill: Number(totalMonthlyBill.toFixed(2))
  });`
  );
  fs.writeFileSync(path.join(TASK_APP, 'backend/server.js'), serverCode, 'utf8');

  // Edit frontend/public/styles.css
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
    /\.microgrid-grid \{\s*display: flex;\s*flex-wrap: nowrap;\s*width: 100%;\s*margin-right: -200px;\s*gap: -40px;\s*overflow-x: auto;\s*padding-bottom: 1rem;\s*\}/,
    `.microgrid-grid {
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
    /\.microgrid-card \{\s*min-width: 360px;\s*max-width: 380px;\s*margin-right: -55px;[\s\S]*?z-index: 10;\s*\}/,
    `.microgrid-card {
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

.microgrid-card:hover {
  transform: translateY(-2px);
  z-index: 2;
}`
  );
  stylesCode = stylesCode.replace(
    /\.badge-warning \{\s*background-color: #ffeb3b;\s*color: #ffffff;\s*\}/,
    `.badge-warning {
  background-color: #fef3c7;
  color: #92400e;
}`
  );
  stylesCode = stylesCode.replace(
    /\.detail-drawer \{\s*position: absolute;\s*top: 0;\s*left: 0;\s*width: 100%;\s*height: 100%;\s*background: #0b0f17;\s*z-index: 9999;\s*padding: 2rem;\s*overflow-y: auto;\s*\}/,
    `.detail-drawer {
  position: fixed;
  top: 0;
  right: 0;
  left: auto;
  width: 520px;
  max-width: 90vw;
  height: 100vh;
  background: #0b0f17;
  border-left: 1px solid var(--border-color);
  box-shadow: -8px 0 25px rgba(0, 0, 0, 0.6);
  z-index: 1000;
  padding: 2rem;
  overflow-y: auto;
}`
  );
  fs.writeFileSync(path.join(TASK_APP, 'frontend/public/styles.css'), stylesCode, 'utf8');

  // Edit frontend/public/app.js
  let appJsCode = fs.readFileSync(path.join(TASK_APP, 'frontend/public/app.js'), 'utf8');
  appJsCode = appJsCode.replace(
    /function formatCurrency\(amountInUSD\) \{\s*const c = state\.currencyRates\[state\.currency\] \|\| state\.currencyRates\.USD;\s*const converted = amountInUSD \* c\.rate;\s*if \(converted >= 1000000\) \{\s*return `\$\{c\.symbol\}\$\{converted\.toExponential\(2\)\}`;\s*\}\s*return `\$\{c\.symbol\}\$\{converted\.toFixed\(c\.decimals\)\}`;\s*\}/,
    `function formatCurrency(amountInUSD) {
  const c = state.currencyRates[state.currency] || state.currencyRates.USD;
  const converted = amountInUSD * c.rate;
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: c.decimals,
    maximumFractionDigits: c.decimals
  }).format(converted);
  return \`\${c.symbol}\${formatted}\`;
}`
  );
  appJsCode = appJsCode.replace(
    /if \(res\.success && res\.overrideStatus\) \{\s*msg\.textContent = '✓ Critical Clinic Backup Circuit Engaged & Shielded!';\s*msg\.style\.color = '#34d399';\s*state\.selectedGrid\.status = 'OPTIMAL';\s*renderMicrogrids\(\);\s*\}/,
    `if (res.success) {
          msg.textContent = '✓ Critical Clinic Backup Circuit Engaged & Shielded!';
          msg.style.color = '#34d399';
          if (res.grid) {
            state.selectedGrid = res.grid;
            const idx = state.microgrids.findIndex(g => g.id === res.grid.id);
            if (idx !== -1) state.microgrids[idx] = res.grid;
          } else {
            state.selectedGrid.status = 'OPTIMAL';
          }
          const modalBadge = document.getElementById('modal-grid-status');
          if (modalBadge) {
            modalBadge.textContent = 'OPTIMAL';
            modalBadge.className = 'badge badge-optimal';
          }
          renderMicrogrids();
        }`
  );
  fs.writeFileSync(path.join(TASK_APP, 'frontend/public/app.js'), appJsCode, 'utf8');

  // Generate patch file
  fs.mkdirSync(path.dirname(PATCH_FILE), { recursive: true });
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
    execSync('git reset --hard HEAD', { cwd: TASK_APP, stdio: 'inherit' });
  }

  console.log('=== COMPLETE: SCREENSHOTS AND PATCH READY ===');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
