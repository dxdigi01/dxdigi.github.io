// ============================================
// DxDigiOS - Web İşletim Sistemi
// ============================================

// --- Global State ---
let windowZIndex = 10;
let openWindows = {};
let activeWindowId = null;
let calendarMonth = new Date().getMonth();
let calendarYear = new Date().getFullYear();

// --- App Definitions ---
const apps = [
  { id: 'files', name: 'Dosyalar', icon: '📁', color: '#4ECDC4' },
  { id: 'terminal', name: 'Terminal', icon: '⌨️', color: '#2d3436' },
  { id: 'editor', name: 'Metin Editörü', icon: '📝', color: '#6c5ce7' },
  { id: 'spreadsheet', name: 'DxCalc', icon: '📊', color: '#2ecc71' },
  { id: 'docs', name: 'DxDocs', icon: '📄', color: '#3498db' },
  { id: 'slides', name: 'DxSlides', icon: '📽️', color: '#e67e22' },
  { id: 'paint', name: 'DxPaint', icon: '🎨', color: '#e84393' },
  { id: 'calculator', name: 'Hesap Makinesi', icon: '🧮', color: '#fdcb6e' },
  { id: 'browser', name: 'Tarayıcı', icon: '🌐', color: '#0984e3' },
  { id: 'taskmgr', name: 'Görev Yöneticisi', icon: '📈', color: '#00b894' },
  { id: 'minesweeper', name: 'Mayın Tarlası', icon: '💣', color: '#636e72' },
  { id: 'calendarapp', name: 'Takvim', icon: '📅', color: '#fd79a8' },
  { id: 'videoplayer', name: 'Video Oynatıcı', icon: '🎬', color: '#a29bfe' },
  { id: 'settings', name: 'Ayarlar', icon: '⚙️', color: '#636e72' },
  { id: 'music', name: 'Müzik', icon: '🎵', color: '#e17055' },
  { id: 'weather', name: 'Hava Durumu', icon: '🌤️', color: '#74b9ff' },
  { id: 'photos', name: 'Fotoğraflar', icon: '🖼️', color: '#a29bfe' },
  { id: 'info', name: 'Sistem Bilgisi', icon: 'ℹ️', color: '#00cec9' },
  { id: 'notes', name: 'Notlar', icon: '📋', color: '#ffeaa7' },
  { id: 'camera', name: 'Kamera', icon: '📷', color: '#fab1a0' },
];

const desktopApps = ['files','terminal','editor','spreadsheet','docs','slides','paint','browser','taskmgr','minesweeper','settings','info'];

// --- File System ---
const fileSystem = {
  '/': { type: 'dir', children: ['Belgeler', 'Resimler', 'Müzik', 'İndirilenler', 'Masaüstü', 'Videolar'] },
  '/Belgeler': { type: 'dir', children: ['rapor.txt', 'notlar.md', 'proje.doc'] },
  '/Resimler': { type: 'dir', children: ['foto1.png', 'arkaplan.jpg', 'ekran.png'] },
  '/Müzik': { type: 'dir', children: ['şarkı1.mp3', 'şarkı2.mp3'] },
  '/İndirilenler': { type: 'dir', children: ['setup.exe', 'belge.pdf'] },
  '/Masaüstü': { type: 'dir', children: ['kısayol.lnk'] },
  '/Videolar': { type: 'dir', children: ['video1.mp4'] },
};

// ============ LOCK SCREEN ============
function initLockScreen() {
  const lockScreen = document.getElementById('lockScreen');
  const lockPassword = document.getElementById('lockPassword');
  const lockBtn = document.getElementById('lockBtn');

  function unlock() {
    lockScreen.style.animation = 'fadeOut 0.5s ease forwards';
    setTimeout(() => {
      lockScreen.classList.add('hidden');
      document.getElementById('desktop').classList.remove('hidden');
      lockScreen.style.animation = '';
    }, 500);
  }

  lockPassword.addEventListener('keydown', e => { if (e.key === 'Enter') unlock(); });
  lockBtn.addEventListener('click', unlock);
  updateLockClock();
  setInterval(updateLockClock, 1000);
}

function updateLockClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const lockTime = document.getElementById('lockTime');
  if (lockTime) lockTime.textContent = `${h}:${m}`;
  
  const days = ['Pazar','Pazartesi','Salı','Çarşamba','Perşembe','Cuma','Cumartesi'];
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  const lockDate = document.getElementById('lockDate');
  if (lockDate) lockDate.textContent = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}, ${days[now.getDay()]}`;
}

function lockScreen() {
  document.getElementById('desktop').classList.add('hidden');
  const ls = document.getElementById('lockScreen');
  ls.classList.remove('hidden');
  ls.style.animation = '';
  closeStartMenu();
}

// ============ CLOCK UPDATES ============
function updateClocks() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${h}:${m}`;
  
  const el = (id) => document.getElementById(id);
  if (el('taskbarTime')) el('taskbarTime').textContent = timeStr;
  if (el('taskbarDate')) el('taskbarDate').textContent = `${String(now.getDate()).padStart(2,'0')}.${String(now.getMonth()+1).padStart(2,'0')}.${now.getFullYear()}`;
  if (el('widgetTime')) el('widgetTime').textContent = timeStr;
  
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  if (el('widgetDate')) el('widgetDate').textContent = `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
}

// ============ DESKTOP ICONS ============
function renderDesktopIcons() {
  const container = document.getElementById('desktopIcons');
  container.innerHTML = '';
  desktopApps.forEach(appId => {
    const app = apps.find(a => a.id === appId);
    if (!app) return;
    const icon = document.createElement('div');
    icon.className = 'desktop-icon';
    icon.ondblclick = () => openApp(app.id);
    icon.onclick = (e) => {
      document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
      icon.classList.add('selected');
      e.stopPropagation();
    };
    icon.innerHTML = `
      <div class="icon-wrap">${app.icon}</div>
      <div class="icon-label">${app.name}</div>
    `;
    container.appendChild(icon);
  });
}

// ============ START MENU ============
function renderStartMenu() {
  const grid = document.getElementById('startMenuGrid');
  grid.innerHTML = '';
  apps.forEach(app => {
    const el = document.createElement('div');
    el.className = 'start-app';
    el.setAttribute('data-name', app.name.toLowerCase());
    el.onclick = () => { openApp(app.id); closeStartMenu(); };
    el.innerHTML = `
      <div class="app-icon">${app.icon}</div>
      <div class="app-name">${app.name}</div>
    `;
    grid.appendChild(el);
  });
}

function toggleStartMenu() {
  const m = document.getElementById('startMenu');
  if (m.classList.contains('active')) { closeStartMenu(); }
  else {
    m.classList.add('active');
    closeNotifications(); closeCalendar();
    document.getElementById('startSearch').focus();
  }
}

function closeStartMenu() {
  document.getElementById('startMenu').classList.remove('active');
}

function filterApps(query) {
  const items = document.querySelectorAll('.start-app');
  items.forEach(item => {
    const name = item.getAttribute('data-name');
    item.style.display = name.includes(query.toLowerCase()) ? '' : 'none';
  });
}

// ============ WINDOW MANAGEMENT ============
function createWindow(id, title, icon, width, height, content) {
  if (openWindows[id]) { focusWindow(id); return; }

  const container = document.getElementById('windowsContainer');
  const win = document.createElement('div');
  win.className = 'window focused';
  win.id = `win-${id}`;
  
  const offsetCount = Object.keys(openWindows).length;
  const top = 60 + (offsetCount % 6) * 30;
  const left = 120 + (offsetCount % 6) * 30;
  
  win.style.cssText = `top:${top}px;left:${left}px;width:${width}px;height:${height}px;z-index:${++windowZIndex}`;
  
  win.innerHTML = `
    <div class="window-titlebar" onmousedown="startDrag(event,'${id}')">
      <div class="window-titlebar-left">
        <span class="win-icon">${icon}</span>
        <span>${title}</span>
      </div>
      <div class="window-controls">
        <button class="win-ctrl minimize" onclick="minimizeWindow('${id}')"><svg viewBox="0 0 8 8"><line x1="1" y1="7" x2="7" y2="7" stroke="#333" stroke-width="1.5"/></svg></button>
        <button class="win-ctrl maximize" onclick="maximizeWindow('${id}')"><svg viewBox="0 0 8 8"><rect x="1" y="1" width="6" height="6" stroke="#333" stroke-width="1.2" fill="none"/></svg></button>
        <button class="win-ctrl close" onclick="closeWindow('${id}')"><svg viewBox="0 0 8 8"><line x1="1" y1="1" x2="7" y2="7" stroke="#333" stroke-width="1.5"/><line x1="7" y1="1" x2="1" y2="7" stroke="#333" stroke-width="1.5"/></svg></button>
      </div>
    </div>
    <div class="window-body">${content}</div>
    <div class="window-resize" onmousedown="startResize(event,'${id}')"></div>
  `;
  
  win.onmousedown = () => focusWindow(id);
  container.appendChild(win);
  
  openWindows[id] = { title, icon, minimized: false, maximized: false };
  focusWindow(id);
  updateTaskbarApps();
}

function focusWindow(id) {
  document.querySelectorAll('.window').forEach(w => w.classList.remove('focused'));
  const win = document.getElementById(`win-${id}`);
  if (win) {
    win.classList.add('focused');
    win.style.zIndex = ++windowZIndex;
  }
  activeWindowId = id;
  updateTaskbarApps();
}

function closeWindow(id) {
  const win = document.getElementById(`win-${id}`);
  if (win) {
    win.style.animation = 'windowOut 0.2s ease forwards';
    setTimeout(() => win.remove(), 200);
  }
  delete openWindows[id];
  activeWindowId = null;
  updateTaskbarApps();
}

function minimizeWindow(id) {
  const win = document.getElementById(`win-${id}`);
  if (win) win.classList.add('minimized');
  if (openWindows[id]) openWindows[id].minimized = true;
  updateTaskbarApps();
}

function maximizeWindow(id) {
  const win = document.getElementById(`win-${id}`);
  if (!win || !openWindows[id]) return;
  openWindows[id].maximized = !openWindows[id].maximized;
  win.classList.toggle('maximized');
}

function restoreWindow(id) {
  const win = document.getElementById(`win-${id}`);
  if (win) win.classList.remove('minimized');
  if (openWindows[id]) openWindows[id].minimized = false;
  focusWindow(id);
}

// --- Drag ---
let dragState = null;
function startDrag(e, id) {
  if (e.target.closest('.window-controls')) return;
  const win = document.getElementById(`win-${id}`);
  if (!win || openWindows[id]?.maximized) return;
  e.preventDefault();
  dragState = { id, startX: e.clientX, startY: e.clientY, origLeft: win.offsetLeft, origTop: win.offsetTop };
  focusWindow(id);
}

document.addEventListener('mousemove', e => {
  if (dragState) {
    const win = document.getElementById(`win-${dragState.id}`);
    if (win) {
      win.style.left = (dragState.origLeft + e.clientX - dragState.startX) + 'px';
      win.style.top = (dragState.origTop + e.clientY - dragState.startY) + 'px';
    }
  }
  if (resizeState) {
    const win = document.getElementById(`win-${resizeState.id}`);
    if (win) {
      win.style.width = Math.max(300, resizeState.origW + e.clientX - resizeState.startX) + 'px';
      win.style.height = Math.max(200, resizeState.origH + e.clientY - resizeState.startY) + 'px';
    }
  }
});

document.addEventListener('mouseup', () => { dragState = null; resizeState = null; });

// --- Resize ---
let resizeState = null;
function startResize(e, id) {
  const win = document.getElementById(`win-${id}`);
  if (!win) return;
  e.preventDefault(); e.stopPropagation();
  resizeState = { id, startX: e.clientX, startY: e.clientY, origW: win.offsetWidth, origH: win.offsetHeight };
}

// ============ TASKBAR APPS ============
function updateTaskbarApps() {
  const container = document.getElementById('taskbarApps');
  container.innerHTML = '';
  Object.keys(openWindows).forEach(id => {
    const w = openWindows[id];
    const btn = document.createElement('button');
    btn.className = 'taskbar-app-btn' + (id === activeWindowId && !w.minimized ? ' active' : '');
    btn.innerHTML = `<span class="app-icon-small">${w.icon}</span><span>${w.title}</span>`;
    btn.onclick = () => {
      if (w.minimized) restoreWindow(id);
      else if (id === activeWindowId) minimizeWindow(id);
      else focusWindow(id);
    };
    container.appendChild(btn);
  });
}

// ============ APP LAUNCHERS ============
function openApp(id) {
  const appDef = apps.find(a => a.id === id);
  if (!appDef) return;
  
  const builders = {
    files: buildFileManager,
    terminal: buildTerminal,
    editor: buildTextEditor,
    spreadsheet: () => '<div id="ssContainer" style="height:100%"></div>',
    docs: buildDxDocs,
    slides: buildDxSlides,
    paint: buildPaint,
    calculator: buildCalculator,
    browser: buildBrowser,
    taskmgr: buildTaskManager,
    minesweeper: buildMinesweeper,
    calendarapp: buildCalendarApp,
    videoplayer: buildVideoPlayer,
    settings: buildSettings,
    music: buildMusicPlayer,
    weather: buildWeather,
    info: buildSystemInfo,
    notes: buildNotes,
    photos: buildPhotos,
    camera: buildCamera,
  };
  
  const sizes = {
    files: [750, 500], terminal: [650, 420], editor: [700, 480],
    spreadsheet: [1000, 600], docs: [850, 650], slides: [950, 600],
    paint: [850, 550], calculator: [320, 480], browser: [900, 600],
    taskmgr: [700, 500], minesweeper: [420, 520], calendarapp: [600, 550],
    videoplayer: [700, 500],
    settings: [750, 500], music: [380, 520], weather: [400, 480],
    info: [500, 440], notes: [500, 400], photos: [600, 450], camera: [500, 400],
  };
  
  const [w, h] = sizes[id] || [600, 400];
  const builder = builders[id];
  const content = builder ? builder() : `<div style="padding:40px;text-align:center;"><p>${appDef.name} uygulaması</p></div>`;
  createWindow(id, appDef.name, appDef.icon, w, h, content);
  
  if (id === 'terminal') setTimeout(initTerminal, 100);
  if (id === 'editor') setTimeout(initEditor, 100);
  if (id === 'calculator') setTimeout(initCalc, 100);
  if (id === 'spreadsheet') setTimeout(() => initSpreadsheet('ssContainer'), 100);
  if (id === 'docs') setTimeout(updateDocStats, 100);
  if (id === 'slides') setTimeout(initSlides, 100);
  if (id === 'paint') setTimeout(initPaint, 100);
  if (id === 'minesweeper') setTimeout(initMinesweeper, 100);
  if (id === 'calendarapp') setTimeout(initCalendarApp, 100);
  if (id === 'files') setTimeout(() => navigateFM('/'), 100);
}

// --- File Manager ---
function buildFileManager() {
  const sidebar = ['⭐ Sık Kullanılan','🏠 Ev','📄 Belgeler','🖼️ Resimler','🎵 Müzik','📥 İndirilenler','🖥️ Masaüstü'].map((name, i) => {
    const paths = ['/','/','Belgeler','Resimler','Müzik','İndirilenler','Masaüstü'];
    return `<div class="fm-sidebar-item${i===0?' active':''}" onclick="navigateFM('/${paths[i]===''?'':paths[i]}')">${name}</div>`;
  }).join('');

  return `<div class="file-manager">
    <div class="fm-toolbar">
      <button class="fm-nav-btn" onclick="navigateFM('/')">⬅</button>
      <input class="fm-path" id="fmPath" value="/" readonly>
    </div>
    <div class="fm-content">
      <div class="fm-sidebar">${sidebar}</div>
      <div class="fm-files" id="fmFiles"></div>
    </div>
  </div>`;
}

function navigateFM(path) {
  if (path === '//') path = '/';
  const pathInput = document.getElementById('fmPath');
  const filesContainer = document.getElementById('fmFiles');
  if (!pathInput || !filesContainer) return;
  pathInput.value = path;

  const dir = fileSystem[path];
  if (!dir) { filesContainer.innerHTML = '<div style="padding:20px;color:var(--text-secondary)">Klasör boş</div>'; return; }

  filesContainer.innerHTML = dir.children.map(name => {
    const childPath = path === '/' ? `/${name}` : `${path}/${name}`;
    const isDir = fileSystem[childPath]?.type === 'dir';
    const icon = isDir ? '📁' : (name.endsWith('.txt') || name.endsWith('.md') ? '📄' : name.endsWith('.png') || name.endsWith('.jpg') ? '🖼️' : name.endsWith('.mp3') ? '🎵' : name.endsWith('.mp4') ? '🎬' : name.endsWith('.pdf') ? '📕' : '📎');
    return `<div class="fm-file" ondblclick="${isDir ? `navigateFM('${childPath}')` : `alert('${name} açılıyor...')`}">
      <div class="file-icon">${icon}</div>
      <div class="file-name">${name}</div>
    </div>`;
  }).join('');
}

// --- Terminal ---
function buildTerminal() {
  return `<div class="terminal-app">
    <div class="terminal-output" id="termOutput">
      <div class="cmd-output">DxDigiOS Terminal v2.0</div>
      <div class="cmd-output">Komut satırına hoş geldiniz. 'help' yazarak yardım alabilirsiniz.</div>
    </div>
    <div class="terminal-input-wrap">
      <span class="terminal-prompt">dxdigi@os:~$</span>
      <input class="terminal-input" id="termInput" autofocus>
    </div>
  </div>`;
}

function initTerminal() {
  const input = document.getElementById('termInput');
  if (!input) return;
  input.focus();
  input.addEventListener('keydown', e => {
    if (e.key !== 'Enter') return;
    const cmd = input.value.trim();
    input.value = '';
    const output = document.getElementById('termOutput');
    output.innerHTML += `<div class="cmd-line"><span class="prompt">dxdigi@os:~$ </span>${cmd}</div>`;
    
    const responses = {
      help: 'Kullanılabilir komutlar: help, ls, pwd, date, whoami, clear, uname, echo, neofetch, history',
      ls: 'Belgeler  Resimler  Müzik  İndirilenler  Masaüstü  Videolar',
      pwd: '/home/dxdigi',
      date: new Date().toLocaleString('tr-TR'),
      whoami: 'dxdigi',
      clear: '__CLEAR__',
      uname: 'DxDigiOS 2.0.0 WebKernel x86_64',
      hostname: 'dxdigi-desktop',
      uptime: `up ${Math.floor(Math.random()*24)} hours, ${Math.floor(Math.random()*60)} minutes`,
      neofetch: `<pre style="color:#6c5ce7">
  ██████╗ ██╗  ██╗
  ██╔══██╗╚██╗██╔╝   OS: DxDigiOS 2.0
  ██║  ██║ ╚███╔╝    Kernel: WebKernel 2.0
  ██║  ██║ ██╔██╗    Shell: dxsh 1.0
  ██████╔╝██╔╝ ██╗   Resolution: ${window.innerWidth}x${window.innerHeight}
  ╚═════╝ ╚═╝  ╚═╝   Theme: Dark Glass
</pre>`,
    };

    if (cmd === 'clear') { output.innerHTML = ''; return; }
    if (cmd.startsWith('echo ')) {
      output.innerHTML += `<div class="cmd-output">${cmd.slice(5)}</div>`;
    } else if (responses[cmd]) {
      output.innerHTML += `<div class="cmd-output">${responses[cmd]}</div>`;
    } else if (cmd) {
      output.innerHTML += `<div class="cmd-output" style="color:#ff6b6b">${cmd}: komut bulunamadı</div>`;
    }
    output.scrollTop = output.scrollHeight;
  });
}

// --- Text Editor ---
function buildTextEditor() {
  return `<div class="text-editor">
    <div class="te-toolbar">
      <button class="te-toolbar-btn" title="Yeni">📄</button>
      <button class="te-toolbar-btn" title="Kaydet">💾</button>
      <button class="te-toolbar-btn" title="Geri Al">↩️</button>
      <button class="te-toolbar-btn" title="Yinele">↪️</button>
    </div>
    <div class="te-content">
      <div class="te-line-numbers" id="teLineNums">1</div>
      <textarea class="te-textarea" id="teTextarea" placeholder="Yazmaya başlayın..." spellcheck="false">// DxDigiOS'a Hoş Geldiniz!
// Bu bir metin editörüdür.

function merhaba() {
  console.log("Merhaba Dünya!");
}

merhaba();</textarea>
    </div>
    <div class="te-statusbar">
      <span id="teCursorPos">Satır 1, Sütun 1</span>
      <span>UTF-8 | JavaScript</span>
    </div>
  </div>`;
}

function initEditor() {
  const textarea = document.getElementById('teTextarea');
  const lineNums = document.getElementById('teLineNums');
  if (!textarea) return;
  
  function updateLines() {
    const lines = textarea.value.split('\n').length;
    lineNums.innerHTML = Array.from({length: lines}, (_, i) => i + 1).join('<br>');
  }
  
  textarea.addEventListener('input', updateLines);
  textarea.addEventListener('click', () => {
    const pos = textarea.selectionStart;
    const lines = textarea.value.substring(0, pos).split('\n');
    document.getElementById('teCursorPos').textContent = `Satır ${lines.length}, Sütun ${lines[lines.length-1].length + 1}`;
  });
  updateLines();
}

// --- Calculator ---
function buildCalculator() {
  const buttons = ['C','±','%','÷','7','8','9','×','4','5','6','−','1','2','3','+','0','.','⌫','='];
  const grid = buttons.map(b => {
    let cls = 'calc-btn';
    if (['÷','×','−','+'].includes(b)) cls += ' operator';
    if (b === '=') cls += ' equals';
    if (b === 'C') cls += ' clear';
    return `<button class="${cls}" onclick="calcPress('${b}')">${b}</button>`;
  }).join('');

  return `<div class="calculator">
    <div class="calc-display">
      <div class="calc-expression" id="calcExpr"></div>
      <div class="calc-result" id="calcResult">0</div>
    </div>
    <div class="calc-grid">${grid}</div>
  </div>`;
}

let calcCurrent = '0', calcPrev = '', calcOp = '';
function initCalc() { calcCurrent = '0'; calcPrev = ''; calcOp = ''; }

function calcPress(val) {
  const display = document.getElementById('calcResult');
  const expr = document.getElementById('calcExpr');
  if (!display) return;

  if (val === 'C') { calcCurrent = '0'; calcPrev = ''; calcOp = ''; expr.textContent = ''; }
  else if (val === '⌫') { calcCurrent = calcCurrent.length > 1 ? calcCurrent.slice(0, -1) : '0'; }
  else if (val === '±') { calcCurrent = String(-parseFloat(calcCurrent)); }
  else if (val === '%') { calcCurrent = String(parseFloat(calcCurrent) / 100); }
  else if (['+','−','×','÷'].includes(val)) {
    calcPrev = calcCurrent; calcOp = val; calcCurrent = '0';
    expr.textContent = `${calcPrev} ${val}`;
  }
  else if (val === '=') {
    if (!calcOp) return;
    const a = parseFloat(calcPrev), b = parseFloat(calcCurrent);
    const ops = { '+': a+b, '−': a-b, '×': a*b, '÷': b !== 0 ? a/b : 'Hata' };
    expr.textContent = `${calcPrev} ${calcOp} ${calcCurrent} =`;
    calcCurrent = String(ops[calcOp]); calcOp = ''; calcPrev = '';
  }
  else if (val === '.') { if (!calcCurrent.includes('.')) calcCurrent += '.'; }
  else { calcCurrent = calcCurrent === '0' ? val : calcCurrent + val; }

  display.textContent = calcCurrent;
}

// --- Browser ---
function buildBrowser() {
  return `<div class="browser-app">
    <div class="browser-toolbar">
      <button class="fm-nav-btn">⬅</button>
      <button class="fm-nav-btn">➡</button>
      <button class="fm-nav-btn">🔄</button>
      <input class="browser-url" id="browserUrl" value="https://www.example.com" onkeydown="if(event.key==='Enter')loadUrl()">
      <button class="fm-nav-btn" onclick="loadUrl()">▶</button>
    </div>
    <iframe class="browser-frame" id="browserFrame" src="https://www.example.com" sandbox="allow-same-origin allow-scripts"></iframe>
  </div>`;
}

function loadUrl() {
  const url = document.getElementById('browserUrl')?.value;
  const frame = document.getElementById('browserFrame');
  if (url && frame) frame.src = url.startsWith('http') ? url : 'https://' + url;
}

// --- Settings ---
function buildSettings() {
  return `<div class="settings-app">
    <div class="settings-sidebar">
      <div class="settings-item active">🖥️ Ekran</div>
      <div class="settings-item">🎨 Kişiselleştirme</div>
      <div class="settings-item">🔔 Bildirimler</div>
      <div class="settings-item">🔊 Ses</div>
      <div class="settings-item">📶 Ağ</div>
      <div class="settings-item">🔋 Pil</div>
      <div class="settings-item">🔒 Gizlilik</div>
      <div class="settings-item">ℹ️ Hakkında</div>
    </div>
    <div class="settings-content">
      <div class="settings-section">
        <h3>Ekran Ayarları</h3>
        <div class="setting-row"><div><div class="setting-label">Gece Modu</div><div class="setting-desc">Göz yorgunluğunu azaltır</div></div><div class="toggle active" onclick="this.classList.toggle('active')"></div></div>
        <div class="setting-row"><div><div class="setting-label">Otomatik Parlaklık</div><div class="setting-desc">Ortam ışığına göre ayarla</div></div><div class="toggle" onclick="this.classList.toggle('active')"></div></div>
        <div class="setting-row"><div><div class="setting-label">Animasyonlar</div><div class="setting-desc">Arayüz animasyonları</div></div><div class="toggle active" onclick="this.classList.toggle('active')"></div></div>
      </div>
      <div class="settings-section">
        <h3>Duvar Kağıdı</h3>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          ${[1,2,3,4,5].map(i => `<div style="width:80px;height:50px;border-radius:8px;cursor:pointer;border:2px solid transparent" class="wallpaper wp-${i}" onclick="document.getElementById('wallpaper').className='wallpaper wp-${i}';this.parentElement.querySelectorAll('div').forEach(d=>d.style.borderColor='transparent');this.style.borderColor='var(--accent)'"></div>`).join('')}
        </div>
      </div>
    </div>
  </div>`;
}

// --- Music Player ---
function buildMusicPlayer() {
  return `<div class="music-player">
    <div class="music-cover"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></div>
    <div class="music-info"><div class="music-title">Gece Yürüyüşü</div><div class="music-artist">DxDigi Records</div></div>
    <div class="music-progress"><div class="music-bar"><div class="music-bar-fill"></div></div><div class="music-times"><span>1:24</span><span>3:45</span></div></div>
    <div class="music-controls">
      <button class="music-ctrl"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/></svg></button>
      <button class="music-ctrl play-btn"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 3 20 12 6 21 6 3"/></svg></button>
      <button class="music-ctrl"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg></button>
    </div>
  </div>`;
}

// --- Weather ---
function buildWeather() {
  return `<div class="weather-app">
    <div class="weather-icon">🌤️</div>
    <div class="weather-temp">18°</div>
    <div class="weather-desc">Parçalı Bulutlu</div>
    <div class="weather-location">📍 İstanbul, Türkiye</div>
    <div class="weather-details">
      <div class="weather-detail"><div class="weather-detail-label">Nem</div><div class="weather-detail-value">65%</div></div>
      <div class="weather-detail"><div class="weather-detail-label">Rüzgar</div><div class="weather-detail-value">12 km/s</div></div>
      <div class="weather-detail"><div class="weather-detail-label">Basınç</div><div class="weather-detail-value">1013 hPa</div></div>
    </div>
  </div>`;
}

// --- System Info ---
function buildSystemInfo() {
  return `<div class="system-info">
    <div class="si-header">
      <div class="si-logo">🖥️</div>
      <div class="si-title">DxDigiOS</div>
      <div class="si-version">Sürüm 2.0.0 (Build 2026.03)</div>
    </div>
    <div class="si-grid">
      <div class="si-card"><div class="si-card-label">İşlemci</div><div class="si-card-value">WebCore v8.0</div></div>
      <div class="si-card"><div class="si-card-label">Bellek</div><div class="si-card-value">${(performance.memory?.usedJSHeapSize/1048576||128).toFixed(0)} MB / ${(performance.memory?.jsHeapSizeLimit/1048576||512).toFixed(0)} MB</div></div>
      <div class="si-card"><div class="si-card-label">Çözünürlük</div><div class="si-card-value">${window.innerWidth} × ${window.innerHeight}</div></div>
      <div class="si-card"><div class="si-card-label">Platform</div><div class="si-card-value">${navigator.platform}</div></div>
      <div class="si-card"><div class="si-card-label">Dil</div><div class="si-card-value">${navigator.language}</div></div>
      <div class="si-card"><div class="si-card-label">Çekirdek</div><div class="si-card-value">WebKernel 2.0</div></div>
    </div>
  </div>`;
}

// --- Notes ---
function buildNotes() {
  return `<div style="padding:16px;height:100%;display:flex;flex-direction:column">
    <h3 style="margin-bottom:12px;font-size:14px">📋 Hızlı Notlar</h3>
    <textarea style="flex:1;background:rgba(255,255,255,0.04);border:1px solid var(--border-glass);border-radius:8px;padding:12px;color:white;font-family:var(--font);font-size:13px;outline:none;resize:none" placeholder="Notlarınızı buraya yazın..."></textarea>
  </div>`;
}

// --- Photos ---
function buildPhotos() {
  const colors = ['#6c5ce7','#00cec9','#fdcb6e','#e17055','#0984e3','#00b894'];
  const photos = colors.map((c,i) => `<div style="background:${c};border-radius:8px;aspect-ratio:1;display:flex;align-items:center;justify-content:center;font-size:32px;cursor:pointer" onclick="alert('Fotoğraf ${i+1}')">🖼️</div>`).join('');
  return `<div style="padding:16px"><h3 style="margin-bottom:12px;font-size:14px">🖼️ Fotoğraflar</h3><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px">${photos}</div></div>`;
}

// --- Camera ---
function buildCamera() {
  return `<div style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:16px">
    <div style="width:200px;height:200px;border-radius:50%;background:rgba(255,255,255,0.04);border:2px solid var(--border-glass);display:flex;align-items:center;justify-content:center;font-size:64px">📷</div>
    <button style="padding:12px 32px;background:var(--accent);border:none;color:white;border-radius:24px;cursor:pointer;font-family:var(--font);font-size:14px">Fotoğraf Çek</button>
  </div>`;
}

// ============ CONTEXT MENU ============
document.addEventListener('contextmenu', e => {
  e.preventDefault();
  const ctx = document.getElementById('contextMenu');
  if (!ctx) return;
  const startMenu = document.getElementById('startMenu');
  if (startMenu.contains(e.target) || document.querySelector('.taskbar').contains(e.target)) return;
  
  ctx.style.left = Math.min(e.clientX, window.innerWidth - 240) + 'px';
  ctx.style.top = Math.min(e.clientY, window.innerHeight - 300) + 'px';
  ctx.classList.add('show');
});

document.addEventListener('click', e => {
  const ctx = document.getElementById('contextMenu');
  if (ctx && !ctx.contains(e.target)) ctx.classList.remove('show');
  
  const startMenu = document.getElementById('startMenu');
  const startBtn = document.getElementById('startButton');
  if (startMenu && !startMenu.contains(e.target) && !startBtn?.contains(e.target)) closeStartMenu();
  
  document.querySelectorAll('.desktop-icon').forEach(i => {
    if (!i.contains(e.target)) i.classList.remove('selected');
  });
});

// ============ PANELS ============
function toggleNotifications() {
  document.getElementById('notificationPanel').classList.toggle('active');
  closeStartMenu(); closeCalendar();
}

function closeNotifications() {
  document.getElementById('notificationPanel')?.classList.remove('active');
}

function clearNotifications() {
  document.getElementById('notifList').innerHTML = '<div style="padding:20px;text-align:center;color:var(--text-secondary);font-size:13px">Bildirim yok</div>';
  document.getElementById('notifBadge').style.display = 'none';
}

function toggleCalendar() {
  document.getElementById('calendarPopup').classList.toggle('active');
  closeStartMenu(); closeNotifications();
  renderCalendar();
}

function closeCalendar() {
  document.getElementById('calendarPopup')?.classList.remove('active');
}

function toggleWifiPanel() { /* placeholder */ }
function toggleVolume() { /* placeholder */ }
function setBrightness(val) { document.body.style.filter = `brightness(${val/100})`; }

// ============ WALLPAPER ============
let currentWP = 1;
function changeWallpaper() {
  currentWP = (currentWP % 5) + 1;
  document.getElementById('wallpaper').className = `wallpaper wp-${currentWP}`;
}

function sortIcons() { /* placeholder */ }

// ============ CALENDAR ============
function renderCalendar() {
  const months = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];
  document.getElementById('calMonthYear').textContent = `${months[calendarMonth]} ${calendarYear}`;
  
  const grid = document.getElementById('calendarGrid');
  grid.innerHTML = '';
  
  const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
  const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
  const startDay = firstDay === 0 ? 6 : firstDay - 1;
  const prevDays = new Date(calendarYear, calendarMonth, 0).getDate();
  const today = new Date();
  
  for (let i = startDay - 1; i >= 0; i--) {
    grid.innerHTML += `<div class="cal-day other-month">${prevDays - i}</div>`;
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === today.getDate() && calendarMonth === today.getMonth() && calendarYear === today.getFullYear();
    grid.innerHTML += `<div class="cal-day${isToday ? ' today' : ''}">${d}</div>`;
  }
  const remaining = 42 - (startDay + daysInMonth);
  for (let d = 1; d <= remaining; d++) {
    grid.innerHTML += `<div class="cal-day other-month">${d}</div>`;
  }
}

function changeMonth(delta) {
  calendarMonth += delta;
  if (calendarMonth > 11) { calendarMonth = 0; calendarYear++; }
  if (calendarMonth < 0) { calendarMonth = 11; calendarYear--; }
  renderCalendar();
}

// ============ KEYBOARD SHORTCUTS ============
document.addEventListener('keydown', e => {
  if (e.ctrlKey && e.key === 'l') { e.preventDefault(); lockScreen(); }
});

// ============ CSS ANIMATION ============
const style = document.createElement('style');
style.textContent = `@keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
@keyframes windowOut { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.9); } }`;
document.head.appendChild(style);

// ============ QUICK SETTINGS ============
document.querySelectorAll('.quick-setting').forEach(btn => {
  btn.addEventListener('click', () => btn.classList.toggle('active'));
});

// ============ INIT ============
function init() {
  initLockScreen();
  renderDesktopIcons();
  renderStartMenu();
  updateClocks();
  setInterval(updateClocks, 1000);
  
  // Auto-open file manager on first load
  setTimeout(() => navigateFM('/'), 500);
}

document.addEventListener('DOMContentLoaded', init);
