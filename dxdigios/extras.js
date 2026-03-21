// ============================================
// DxDigiOS Extended Apps Module
// Paint, Task Manager, Minesweeper, Calendar App, Video Player
// ============================================

// ======= DxPaint - Drawing App =======
let paintCtx = null, painting = false, paintColor = '#6c5ce7', paintSize = 3, paintTool = 'brush';
let paintHistory = [], paintHistoryIdx = -1;

function buildPaint() {
  return `<div class="dx-paint">
    <div class="dx-paint-toolbar">
      <div class="dx-paint-tools">
        <button class="dx-ss-btn paint-tool active" data-tool="brush" onclick="setPaintTool('brush',this)" title="Fırça">🖌️</button>
        <button class="dx-ss-btn paint-tool" data-tool="eraser" onclick="setPaintTool('eraser',this)" title="Silgi">🧹</button>
        <button class="dx-ss-btn paint-tool" data-tool="line" onclick="setPaintTool('line',this)" title="Çizgi">╱</button>
        <button class="dx-ss-btn paint-tool" data-tool="rect" onclick="setPaintTool('rect',this)" title="Dikdörtgen">▭</button>
        <button class="dx-ss-btn paint-tool" data-tool="circle" onclick="setPaintTool('circle',this)" title="Daire">◯</button>
        <button class="dx-ss-btn paint-tool" data-tool="fill" onclick="setPaintTool('fill',this)" title="Doldur">🪣</button>
        <button class="dx-ss-btn paint-tool" data-tool="text" onclick="setPaintTool('text',this)" title="Metin">T</button>
        <span class="dx-ss-sep"></span>
        <input type="color" class="dx-ss-color" value="#6c5ce7" onchange="paintColor=this.value" title="Renk">
        <input type="color" class="dx-ss-color" value="#0a0a1a" id="paintBgColor" title="Arka Plan Rengi">
        <span class="dx-ss-sep"></span>
        <input type="range" min="1" max="30" value="3" class="paint-size" onchange="paintSize=parseInt(this.value)" title="Boyut">
        <span class="dx-ss-sep"></span>
        <button class="dx-ss-btn" onclick="paintUndo()" title="Geri Al">↩️</button>
        <button class="dx-ss-btn" onclick="paintClear()" title="Temizle">🗑️</button>
        <button class="dx-ss-btn" onclick="paintSave()" title="Kaydet">💾</button>
      </div>
    </div>
    <div class="dx-paint-canvas-wrap">
      <canvas id="paintCanvas" class="dx-paint-canvas"></canvas>
    </div>
    <div class="dx-paint-status">
      <span id="paintCoords">0, 0</span>
      <span id="paintDimensions">800 × 500</span>
    </div>
  </div>`;
}

function initPaint() {
  const canvas = document.getElementById('paintCanvas');
  if (!canvas) return;
  const wrap = canvas.parentElement;
  canvas.width = wrap.clientWidth || 800;
  canvas.height = wrap.clientHeight || 500;
  paintCtx = canvas.getContext('2d');
  paintCtx.fillStyle = '#0a0a1a';
  paintCtx.fillRect(0, 0, canvas.width, canvas.height);
  paintCtx.lineCap = 'round'; paintCtx.lineJoin = 'round';
  savePaintState();

  const dim = document.getElementById('paintDimensions');
  if (dim) dim.textContent = `${canvas.width} × ${canvas.height}`;

  let startX, startY, snapshot;
  canvas.addEventListener('mousedown', e => {
    painting = true;
    startX = e.offsetX; startY = e.offsetY;
    if (paintTool === 'brush' || paintTool === 'eraser') {
      paintCtx.beginPath();
      paintCtx.moveTo(startX, startY);
    }
    if (['line','rect','circle'].includes(paintTool)) {
      snapshot = paintCtx.getImageData(0, 0, canvas.width, canvas.height);
    }
    if (paintTool === 'fill') { floodFill(startX, startY, paintColor); savePaintState(); }
    if (paintTool === 'text') {
      const txt = prompt('Metin girin:');
      if (txt) {
        paintCtx.fillStyle = paintColor;
        paintCtx.font = `${paintSize * 4 + 12}px Inter`;
        paintCtx.fillText(txt, startX, startY);
        savePaintState();
      }
      painting = false;
    }
  });

  canvas.addEventListener('mousemove', e => {
    const coords = document.getElementById('paintCoords');
    if (coords) coords.textContent = `${e.offsetX}, ${e.offsetY}`;
    if (!painting) return;
    if (paintTool === 'brush') {
      paintCtx.strokeStyle = paintColor; paintCtx.lineWidth = paintSize;
      paintCtx.lineTo(e.offsetX, e.offsetY); paintCtx.stroke();
    } else if (paintTool === 'eraser') {
      paintCtx.strokeStyle = '#0a0a1a'; paintCtx.lineWidth = paintSize * 3;
      paintCtx.lineTo(e.offsetX, e.offsetY); paintCtx.stroke();
    } else if (paintTool === 'line') {
      paintCtx.putImageData(snapshot, 0, 0);
      paintCtx.beginPath(); paintCtx.strokeStyle = paintColor; paintCtx.lineWidth = paintSize;
      paintCtx.moveTo(startX, startY); paintCtx.lineTo(e.offsetX, e.offsetY); paintCtx.stroke();
    } else if (paintTool === 'rect') {
      paintCtx.putImageData(snapshot, 0, 0);
      paintCtx.strokeStyle = paintColor; paintCtx.lineWidth = paintSize;
      paintCtx.strokeRect(startX, startY, e.offsetX - startX, e.offsetY - startY);
    } else if (paintTool === 'circle') {
      paintCtx.putImageData(snapshot, 0, 0);
      paintCtx.beginPath(); paintCtx.strokeStyle = paintColor; paintCtx.lineWidth = paintSize;
      const rx = Math.abs(e.offsetX - startX) / 2, ry = Math.abs(e.offsetY - startY) / 2;
      paintCtx.ellipse(startX + (e.offsetX - startX) / 2, startY + (e.offsetY - startY) / 2, rx, ry, 0, 0, Math.PI * 2);
      paintCtx.stroke();
    }
  });

  canvas.addEventListener('mouseup', () => { if (painting) { painting = false; savePaintState(); } });
  canvas.addEventListener('mouseleave', () => { if (painting) { painting = false; savePaintState(); } });
}

function setPaintTool(tool, btn) {
  paintTool = tool;
  document.querySelectorAll('.paint-tool').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
}

function savePaintState() {
  const canvas = document.getElementById('paintCanvas');
  if (!canvas || !paintCtx) return;
  paintHistory = paintHistory.slice(0, paintHistoryIdx + 1);
  paintHistory.push(paintCtx.getImageData(0, 0, canvas.width, canvas.height));
  paintHistoryIdx = paintHistory.length - 1;
}

function paintUndo() {
  if (paintHistoryIdx > 0) { paintHistoryIdx--; paintCtx.putImageData(paintHistory[paintHistoryIdx], 0, 0); }
}

function paintClear() {
  const canvas = document.getElementById('paintCanvas');
  if (!canvas || !paintCtx) return;
  paintCtx.fillStyle = '#0a0a1a'; paintCtx.fillRect(0, 0, canvas.width, canvas.height);
  savePaintState();
}

function paintSave() {
  const canvas = document.getElementById('paintCanvas');
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = 'dxpaint_cizim.png';
  link.href = canvas.toDataURL(); link.click();
}

function floodFill(x, y, fillColor) {
  const canvas = document.getElementById('paintCanvas');
  if (!canvas || !paintCtx) return;
  const imgData = paintCtx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;
  const w = canvas.width, h = canvas.height;
  const target = getPixel(data, x, y, w);
  const fill = hexToRgb(fillColor);
  if (target[0] === fill[0] && target[1] === fill[1] && target[2] === fill[2]) return;
  const stack = [[x, y]];
  const visited = new Set();
  while (stack.length > 0 && stack.length < 100000) {
    const [cx, cy] = stack.pop();
    const key = cy * w + cx;
    if (cx < 0 || cx >= w || cy < 0 || cy >= h || visited.has(key)) continue;
    const px = getPixel(data, cx, cy, w);
    if (Math.abs(px[0] - target[0]) > 30 || Math.abs(px[1] - target[1]) > 30 || Math.abs(px[2] - target[2]) > 30) continue;
    visited.add(key);
    const idx = key * 4;
    data[idx] = fill[0]; data[idx + 1] = fill[1]; data[idx + 2] = fill[2]; data[idx + 3] = 255;
    stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
  }
  paintCtx.putImageData(imgData, 0, 0);
}

function getPixel(data, x, y, w) { const i = (y * w + x) * 4; return [data[i], data[i + 1], data[i + 2]]; }
function hexToRgb(hex) { const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16); return [r, g, b]; }

// ======= Task Manager =======
function buildTaskManager() {
  const processes = [
    { name: 'DxDigiOS Kernel', pid: 1, cpu: '0.2', mem: '12.4', status: 'Çalışıyor', user: 'system' },
    { name: 'Window Manager', pid: 42, cpu: '1.5', mem: '28.6', status: 'Çalışıyor', user: 'system' },
    { name: 'Desktop Service', pid: 87, cpu: '0.8', mem: '15.2', status: 'Çalışıyor', user: 'system' },
    { name: 'Audio Server', pid: 113, cpu: '0.3', mem: '8.1', status: 'Çalışıyor', user: 'system' },
    { name: 'Network Manager', pid: 156, cpu: '0.1', mem: '6.7', status: 'Çalışıyor', user: 'system' },
    { name: 'Notification Daemon', pid: 201, cpu: '0.0', mem: '4.2', status: 'Uyuyor', user: 'system' },
    { name: 'File Indexer', pid: 234, cpu: '2.1', mem: '32.8', status: 'Çalışıyor', user: 'dxdigi' },
    { name: 'Clipboard Manager', pid: 278, cpu: '0.0', mem: '3.1', status: 'Uyuyor', user: 'dxdigi' },
    { name: 'Theme Engine', pid: 312, cpu: '0.4', mem: '11.5', status: 'Çalışıyor', user: 'dxdigi' },
    { name: 'Input Method', pid: 345, cpu: '0.1', mem: '5.3', status: 'Çalışıyor', user: 'system' },
    { name: 'GPU Compositor', pid: 389, cpu: '3.2', mem: '45.7', status: 'Çalışıyor', user: 'system' },
    { name: 'Security Agent', pid: 412, cpu: '0.5', mem: '9.8', status: 'Çalışıyor', user: 'system' },
  ];

  // Add open windows as processes
  Object.keys(openWindows).forEach((id, i) => {
    processes.push({ name: openWindows[id].title, pid: 500 + i, cpu: (Math.random() * 5).toFixed(1), mem: (Math.random() * 50 + 10).toFixed(1), status: 'Çalışıyor', user: 'dxdigi' });
  });

  const totalCPU = processes.reduce((s, p) => s + parseFloat(p.cpu), 0).toFixed(1);
  const totalMem = processes.reduce((s, p) => s + parseFloat(p.mem), 0).toFixed(1);

  const rows = processes.map(p => `
    <tr class="tm-row" onclick="this.classList.toggle('selected')">
      <td>${p.name}</td><td>${p.pid}</td><td>${p.cpu}%</td><td>${p.mem} MB</td>
      <td><span class="tm-status ${p.status === 'Çalışıyor' ? 'running' : 'sleeping'}">${p.status}</span></td>
      <td>${p.user}</td>
    </tr>`).join('');

  return `<div class="dx-taskmgr">
    <div class="tm-tabs">
      <button class="tm-tab active">İşlemler</button>
      <button class="tm-tab">Performans</button>
      <button class="tm-tab">Ağ</button>
    </div>
    <div class="tm-content">
      <div class="tm-summary">
        <div class="tm-stat"><span class="tm-stat-label">CPU</span><div class="tm-bar"><div class="tm-bar-fill" style="width:${totalCPU}%;background:var(--accent)"></div></div><span class="tm-stat-val">${totalCPU}%</span></div>
        <div class="tm-stat"><span class="tm-stat-label">Bellek</span><div class="tm-bar"><div class="tm-bar-fill" style="width:${Math.min(parseFloat(totalMem)/5.12, 100)}%;background:var(--success)"></div></div><span class="tm-stat-val">${totalMem} MB / 512 MB</span></div>
        <div class="tm-stat"><span class="tm-stat-label">Disk</span><div class="tm-bar"><div class="tm-bar-fill" style="width:35%;background:var(--warning)"></div></div><span class="tm-stat-val">35%</span></div>
      </div>
      <div class="tm-table-wrap">
        <table class="tm-table">
          <thead><tr><th>İşlem Adı</th><th>PID</th><th>CPU</th><th>Bellek</th><th>Durum</th><th>Kullanıcı</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </div>
    <div class="tm-footer">
      <span>İşlem: ${processes.length}</span>
      <button class="dx-ss-btn" onclick="closeWindow('taskmgr');openApp('taskmgr')" style="font-size:11px;width:auto;padding:4px 12px">Yenile</button>
      <button class="dx-ss-btn" style="font-size:11px;width:auto;padding:4px 12px;background:rgba(231,76,60,0.2);color:var(--danger)">Görevi Sonlandır</button>
    </div>
  </div>`;
}

// ======= Minesweeper Game =======
let mineBoard = [], mineRevealed = [], mineFlags = [], mineGameOver = false, mineRows = 9, mineCols = 9, mineCount = 10, mineTimer = 0, mineInterval = null;

function buildMinesweeper() {
  return `<div class="dx-minesweeper">
    <div class="mine-header">
      <div class="mine-counter" id="mineCounter">🚩 ${mineCount}</div>
      <button class="mine-reset" onclick="initMinesweeper()">😀</button>
      <div class="mine-timer" id="mineTimerDisplay">⏱️ 0</div>
    </div>
    <div class="mine-grid" id="mineGrid"></div>
    <div class="mine-difficulty">
      <button class="dx-ss-btn" style="width:auto;padding:4px 12px;font-size:11px" onclick="mineRows=9;mineCols=9;mineCount=10;initMinesweeper()">Kolay</button>
      <button class="dx-ss-btn" style="width:auto;padding:4px 12px;font-size:11px" onclick="mineRows=16;mineCols=16;mineCount=40;initMinesweeper()">Orta</button>
      <button class="dx-ss-btn" style="width:auto;padding:4px 12px;font-size:11px" onclick="mineRows=16;mineCols=30;mineCount=99;initMinesweeper()">Zor</button>
    </div>
  </div>`;
}

function initMinesweeper() {
  mineBoard = []; mineRevealed = []; mineFlags = []; mineGameOver = false; mineTimer = 0;
  if (mineInterval) clearInterval(mineInterval);

  for (let r = 0; r < mineRows; r++) {
    mineBoard[r] = []; mineRevealed[r] = []; mineFlags[r] = [];
    for (let c = 0; c < mineCols; c++) { mineBoard[r][c] = 0; mineRevealed[r][c] = false; mineFlags[r][c] = false; }
  }

  let placed = 0;
  while (placed < mineCount) {
    const r = Math.floor(Math.random() * mineRows), c = Math.floor(Math.random() * mineCols);
    if (mineBoard[r][c] !== -1) { mineBoard[r][c] = -1; placed++; }
  }

  for (let r = 0; r < mineRows; r++) {
    for (let c = 0; c < mineCols; c++) {
      if (mineBoard[r][c] === -1) continue;
      let cnt = 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < mineRows && nc >= 0 && nc < mineCols && mineBoard[nr][nc] === -1) cnt++;
      }
      mineBoard[r][c] = cnt;
    }
  }

  mineInterval = setInterval(() => {
    if (!mineGameOver) { mineTimer++; const t = document.getElementById('mineTimerDisplay'); if (t) t.textContent = `⏱️ ${mineTimer}`; }
  }, 1000);

  renderMineGrid();
}

function renderMineGrid() {
  const grid = document.getElementById('mineGrid');
  if (!grid) return;
  grid.style.gridTemplateColumns = `repeat(${mineCols}, 1fr)`;
  grid.innerHTML = '';
  for (let r = 0; r < mineRows; r++) {
    for (let c = 0; c < mineCols; c++) {
      const cell = document.createElement('div');
      cell.className = 'mine-cell';
      if (mineRevealed[r][c]) {
        cell.classList.add('revealed');
        if (mineBoard[r][c] === -1) { cell.textContent = '💣'; cell.classList.add('bomb'); }
        else if (mineBoard[r][c] > 0) { cell.textContent = mineBoard[r][c]; cell.setAttribute('data-num', mineBoard[r][c]); }
      } else if (mineFlags[r][c]) { cell.textContent = '🚩'; }
      cell.onclick = () => mineClick(r, c);
      cell.oncontextmenu = (e) => { e.preventDefault(); mineFlag(r, c); };
      grid.appendChild(cell);
    }
  }
  document.getElementById('mineCounter').textContent = `🚩 ${mineCount - mineFlags.flat().filter(Boolean).length}`;
}

function mineClick(r, c) {
  if (mineGameOver || mineFlags[r][c] || mineRevealed[r][c]) return;
  if (mineBoard[r][c] === -1) {
    mineGameOver = true; clearInterval(mineInterval);
    for (let i = 0; i < mineRows; i++) for (let j = 0; j < mineCols; j++) mineRevealed[i][j] = true;
    renderMineGrid();
    document.querySelector('.mine-reset').textContent = '😵';
    return;
  }
  revealCell(r, c);
  renderMineGrid();
  checkMineWin();
}

function revealCell(r, c) {
  if (r < 0 || r >= mineRows || c < 0 || c >= mineCols || mineRevealed[r][c] || mineFlags[r][c]) return;
  mineRevealed[r][c] = true;
  if (mineBoard[r][c] === 0) {
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) revealCell(r + dr, c + dc);
  }
}

function mineFlag(r, c) {
  if (mineGameOver || mineRevealed[r][c]) return;
  mineFlags[r][c] = !mineFlags[r][c];
  renderMineGrid();
}

function checkMineWin() {
  let unrevealed = 0;
  for (let r = 0; r < mineRows; r++) for (let c = 0; c < mineCols; c++) if (!mineRevealed[r][c]) unrevealed++;
  if (unrevealed === mineCount) {
    mineGameOver = true; clearInterval(mineInterval);
    document.querySelector('.mine-reset').textContent = '😎';
    alert(`Tebrikler! Oyunu ${mineTimer} saniyede kazandınız! 🎉`);
  }
}

// ======= Calendar App =======
function buildCalendarApp() {
  const now = new Date();
  return `<div class="dx-calendar-app">
    <div class="cal-app-header">
      <h2 id="calAppTitle">${getMonthName(now.getMonth())} ${now.getFullYear()}</h2>
      <div class="cal-app-nav">
        <button class="dx-ss-btn" onclick="calAppNav(-1)">◀</button>
        <button class="dx-ss-btn" onclick="calAppGoToday()">Bugün</button>
        <button class="dx-ss-btn" onclick="calAppNav(1)">▶</button>
      </div>
    </div>
    <div class="cal-app-grid-header">
      <span>Pazartesi</span><span>Salı</span><span>Çarşamba</span><span>Perşembe</span><span>Cuma</span><span>Cumartesi</span><span>Pazar</span>
    </div>
    <div class="cal-app-grid" id="calAppGrid"></div>
    <div class="cal-app-events" id="calAppEvents">
      <h3>Bugünün Etkinlikleri</h3>
      <div class="cal-event"><div class="cal-event-dot" style="background:#6c5ce7"></div><div><div class="cal-event-title">Ekip Toplantısı</div><div class="cal-event-time">10:00 - 11:00</div></div></div>
      <div class="cal-event"><div class="cal-event-dot" style="background:#4ecdc4"></div><div><div class="cal-event-title">Öğle Arası</div><div class="cal-event-time">12:30 - 13:30</div></div></div>
      <div class="cal-event"><div class="cal-event-dot" style="background:#ff6b6b"></div><div><div class="cal-event-title">Proje Teslimi</div><div class="cal-event-time">17:00</div></div></div>
    </div>
  </div>`;
}

let calAppMonth, calAppYear;

function initCalendarApp() {
  const now = new Date();
  calAppMonth = now.getMonth(); calAppYear = now.getFullYear();
  renderCalAppGrid();
}

function calAppNav(dir) {
  calAppMonth += dir;
  if (calAppMonth > 11) { calAppMonth = 0; calAppYear++; }
  if (calAppMonth < 0) { calAppMonth = 11; calAppYear--; }
  document.getElementById('calAppTitle').textContent = `${getMonthName(calAppMonth)} ${calAppYear}`;
  renderCalAppGrid();
}

function calAppGoToday() {
  const now = new Date(); calAppMonth = now.getMonth(); calAppYear = now.getFullYear();
  document.getElementById('calAppTitle').textContent = `${getMonthName(calAppMonth)} ${calAppYear}`;
  renderCalAppGrid();
}

function getMonthName(m) { return ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'][m]; }

function renderCalAppGrid() {
  const grid = document.getElementById('calAppGrid');
  if (!grid) return;
  const firstDay = new Date(calAppYear, calAppMonth, 1).getDay();
  const daysInMonth = new Date(calAppYear, calAppMonth + 1, 0).getDate();
  const startDay = firstDay === 0 ? 6 : firstDay - 1;
  const prevDays = new Date(calAppYear, calAppMonth, 0).getDate();
  const today = new Date();
  let html = '';

  for (let i = startDay - 1; i >= 0; i--) html += `<div class="cal-app-day other">${prevDays - i}</div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && calAppMonth === today.getMonth() && calAppYear === today.getFullYear();
    const hasEvent = [5, 12, 19, 25].includes(d) || isToday;
    html += `<div class="cal-app-day${isToday ? ' today' : ''}${hasEvent ? ' has-event' : ''}" onclick="selectCalDay(${d})">${d}${hasEvent ? '<div class="cal-day-dot"></div>' : ''}</div>`;
  }
  const rem = 42 - startDay - daysInMonth;
  for (let d = 1; d <= rem; d++) html += `<div class="cal-app-day other">${d}</div>`;
  grid.innerHTML = html;
}

function selectCalDay(d) {
  document.querySelectorAll('.cal-app-day').forEach(el => el.classList.remove('selected'));
  event.target.closest('.cal-app-day')?.classList.add('selected');
}

// ======= Video Player =======
function buildVideoPlayer() {
  return `<div class="dx-video-player">
    <div class="vp-screen" id="vpScreen">
      <div class="vp-placeholder">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="1.5"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        <p>Video dosyası seçin veya URL girin</p>
      </div>
    </div>
    <div class="vp-controls">
      <div class="vp-progress"><div class="vp-progress-fill" style="width:0%"></div></div>
      <div class="vp-buttons">
        <button class="music-ctrl">⏮</button>
        <button class="music-ctrl play-btn" style="width:36px;height:36px" id="vpPlayBtn">▶</button>
        <button class="music-ctrl">⏭</button>
        <span class="vp-time">0:00 / 0:00</span>
        <div style="flex:1"></div>
        <button class="music-ctrl" title="Ses">🔊</button>
        <input type="range" min="0" max="100" value="80" class="paint-size" style="width:80px">
        <button class="music-ctrl" title="Tam Ekran">⛶</button>
      </div>
    </div>
    <div class="vp-url-bar">
      <input type="text" class="browser-url" placeholder="Video URL girin..." id="vpUrlInput" style="border-radius:8px">
      <button class="dx-ss-btn" style="width:auto;padding:4px 12px" onclick="loadVideo()">Oynat</button>
    </div>
  </div>`;
}

function loadVideo() {
  const url = document.getElementById('vpUrlInput')?.value;
  const screen = document.getElementById('vpScreen');
  if (url && screen) {
    screen.innerHTML = `<video controls autoplay style="width:100%;height:100%;border-radius:8px" src="${url}">Tarayıcınız video etiketini desteklemiyor.</video>`;
  }
}
