// ============================================
// DxDigiOS Spreadsheet Engine - DxCalc
// Full formula support, cell formatting, multi-sheet
// ============================================

class DxSpreadsheet {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.sheets = [{ name: 'Sayfa 1', data: {}, colWidths: {}, rowHeights: {} }];
    this.activeSheet = 0;
    this.selectedCell = 'A1';
    this.selectedRange = null;
    this.isEditing = false;
    this.clipboard = null;
    this.history = [];
    this.historyIndex = -1;
    this.ROWS = 50;
    this.COLS = 26;
    this.colWidth = 100;
    this.rowHeight = 28;
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="dx-spreadsheet">
        <div class="dx-ss-toolbar">
          <div class="dx-ss-toolbar-group">
            <button class="dx-ss-btn" onclick="ssAction('undo')" title="Geri Al">↩️</button>
            <button class="dx-ss-btn" onclick="ssAction('redo')" title="Yinele">↪️</button>
            <span class="dx-ss-sep"></span>
            <button class="dx-ss-btn" onclick="ssAction('bold')" title="Kalın"><b>B</b></button>
            <button class="dx-ss-btn" onclick="ssAction('italic')" title="İtalik"><i>I</i></button>
            <button class="dx-ss-btn" onclick="ssAction('underline')" title="Altçizgi"><u>U</u></button>
            <span class="dx-ss-sep"></span>
            <button class="dx-ss-btn" onclick="ssAction('alignLeft')" title="Sola Hizala">⫷</button>
            <button class="dx-ss-btn" onclick="ssAction('alignCenter')" title="Ortala">☰</button>
            <button class="dx-ss-btn" onclick="ssAction('alignRight')" title="Sağa Hizala">⫸</button>
            <span class="dx-ss-sep"></span>
            <select class="dx-ss-select" onchange="ssAction('fontSize',this.value)" title="Yazı Boyutu">
              ${[8,9,10,11,12,14,16,18,20,24,28,32].map(s=>`<option value="${s}" ${s===12?'selected':''}>${s}</option>`).join('')}
            </select>
            <input type="color" class="dx-ss-color" value="#ffffff" onchange="ssAction('color',this.value)" title="Yazı Rengi">
            <input type="color" class="dx-ss-color" value="#0a0a1a" onchange="ssAction('bgColor',this.value)" title="Arka Plan Rengi">
            <span class="dx-ss-sep"></span>
            <select class="dx-ss-select" onchange="ssAction('format',this.value)" title="Biçim">
              <option value="general">Genel</option>
              <option value="number">Sayı</option>
              <option value="currency">Para Birimi (₺)</option>
              <option value="percent">Yüzde (%)</option>
              <option value="date">Tarih</option>
            </select>
            <span class="dx-ss-sep"></span>
            <button class="dx-ss-btn" onclick="ssAction('addRow')" title="Satır Ekle">+☰</button>
            <button class="dx-ss-btn" onclick="ssAction('addCol')" title="Sütun Ekle">+▮</button>
            <button class="dx-ss-btn" onclick="ssAction('delRow')" title="Satır Sil">-☰</button>
            <button class="dx-ss-btn" onclick="ssAction('delCol')" title="Sütun Sil">-▮</button>
          </div>
        </div>
        <div class="dx-ss-formula-bar">
          <div class="dx-ss-cell-ref" id="ssCellRef">A1</div>
          <div class="dx-ss-fx">fx</div>
          <input class="dx-ss-formula-input" id="ssFormulaInput" placeholder="Değer veya formül girin..." 
            onkeydown="ssFormulaKey(event)" oninput="ssFormulaChange(event)">
        </div>
        <div class="dx-ss-grid-wrap" id="ssGridWrap">
          <div class="dx-ss-grid" id="ssGrid"></div>
        </div>
        <div class="dx-ss-sheet-bar">
          <button class="dx-ss-sheet-add" onclick="ssAction('addSheet')">+</button>
          <div class="dx-ss-sheet-tabs" id="ssSheetTabs"></div>
          <div class="dx-ss-status" id="ssStatus">Hazır</div>
        </div>
      </div>`;
    this.renderGrid();
    this.renderSheetTabs();
    this.selectCell('A1');
  }

  renderGrid() {
    const grid = document.getElementById('ssGrid');
    if (!grid) return;
    let html = '<table class="dx-ss-table"><thead><tr><th class="dx-ss-corner"></th>';
    for (let c = 0; c < this.COLS; c++) {
      const col = String.fromCharCode(65 + c);
      html += `<th class="dx-ss-col-header" data-col="${c}" style="width:${this.sheets[this.activeSheet].colWidths[c]||this.colWidth}px">${col}</th>`;
    }
    html += '</tr></thead><tbody>';
    for (let r = 1; r <= this.ROWS; r++) {
      html += `<tr><td class="dx-ss-row-header">${r}</td>`;
      for (let c = 0; c < this.COLS; c++) {
        const col = String.fromCharCode(65 + c);
        const ref = `${col}${r}`;
        const cell = this.getCell(ref);
        const val = cell.formula ? this.evaluate(cell.formula) : (cell.value || '');
        const displayVal = this.formatValue(val, cell.format);
        const style = this.getCellStyle(cell);
        html += `<td class="dx-ss-cell ${ref===this.selectedCell?'selected':''}" data-ref="${ref}" style="${style}" 
          onclick="ssSelectCell('${ref}')" ondblclick="ssEditCell('${ref}')">${displayVal}</td>`;
      }
      html += '</tr>';
    }
    html += '</tbody></table>';
    grid.innerHTML = html;
  }

  renderSheetTabs() {
    const tabs = document.getElementById('ssSheetTabs');
    if (!tabs) return;
    tabs.innerHTML = this.sheets.map((s, i) => 
      `<div class="dx-ss-sheet-tab ${i===this.activeSheet?'active':''}" onclick="ssSelectSheet(${i})" ondblclick="ssRenameSheet(${i})">${s.name}</div>`
    ).join('');
  }

  getCell(ref) {
    return this.sheets[this.activeSheet].data[ref] || {};
  }

  setCell(ref, props) {
    if (!this.sheets[this.activeSheet].data[ref]) {
      this.sheets[this.activeSheet].data[ref] = {};
    }
    Object.assign(this.sheets[this.activeSheet].data[ref], props);
    this.saveHistory();
    this.refreshCells();
  }

  getCellStyle(cell) {
    let s = '';
    if (cell.bold) s += 'font-weight:700;';
    if (cell.italic) s += 'font-style:italic;';
    if (cell.underline) s += 'text-decoration:underline;';
    if (cell.color) s += `color:${cell.color};`;
    if (cell.bgColor && cell.bgColor !== '#0a0a1a') s += `background:${cell.bgColor};`;
    if (cell.fontSize) s += `font-size:${cell.fontSize}px;`;
    if (cell.align) s += `text-align:${cell.align};`;
    return s;
  }

  formatValue(val, format) {
    if (val === '' || val === undefined || val === null) return '';
    const num = parseFloat(val);
    if (format === 'number' && !isNaN(num)) return num.toLocaleString('tr-TR', {minimumFractionDigits:2, maximumFractionDigits:2});
    if (format === 'currency' && !isNaN(num)) return '₺' + num.toLocaleString('tr-TR', {minimumFractionDigits:2, maximumFractionDigits:2});
    if (format === 'percent' && !isNaN(num)) return (num * 100).toFixed(1) + '%';
    if (format === 'date' && !isNaN(num)) { const d = new Date(num); return isNaN(d.getTime()) ? val : d.toLocaleDateString('tr-TR'); }
    return val;
  }

  selectCell(ref) {
    this.selectedCell = ref;
    const cell = this.getCell(ref);
    const cellRefEl = document.getElementById('ssCellRef');
    const formulaInput = document.getElementById('ssFormulaInput');
    if (cellRefEl) cellRefEl.textContent = ref;
    if (formulaInput) formulaInput.value = cell.formula || cell.value || '';
    
    document.querySelectorAll('.dx-ss-cell.selected').forEach(el => el.classList.remove('selected'));
    const td = document.querySelector(`.dx-ss-cell[data-ref="${ref}"]`);
    if (td) td.classList.add('selected');
    this.updateStatus();
  }

  editCell(ref) {
    this.selectCell(ref);
    this.isEditing = true;
    const input = document.getElementById('ssFormulaInput');
    if (input) input.focus();
  }

  commitEdit(value) {
    if (!value && value !== 0) { this.setCell(this.selectedCell, { value: '', formula: '' }); }
    else if (String(value).startsWith('=')) {
      this.setCell(this.selectedCell, { formula: value, value: '' });
    } else {
      const num = parseFloat(value);
      this.setCell(this.selectedCell, { value: isNaN(num) ? value : num, formula: '' });
    }
    this.isEditing = false;
    this.refreshCells();
  }

  refreshCells() {
    document.querySelectorAll('.dx-ss-cell').forEach(td => {
      const ref = td.getAttribute('data-ref');
      const cell = this.getCell(ref);
      const val = cell.formula ? this.evaluate(cell.formula) : (cell.value !== undefined ? cell.value : '');
      td.textContent = this.formatValue(val, cell.format);
      td.setAttribute('style', this.getCellStyle(cell));
      if (ref === this.selectedCell) td.classList.add('selected');
    });
    this.updateStatus();
  }

  // ======= FORMULA ENGINE =======
  evaluate(formula) {
    if (!formula || !formula.startsWith('=')) return formula;
    try {
      let expr = formula.substring(1).toUpperCase();
      
      // Handle functions
      expr = this.replaceFunctions(expr);
      
      // Replace cell references with values
      expr = expr.replace(/\b([A-Z])(\d+)\b/g, (match, col, row) => {
        const ref = `${col}${row}`;
        const cell = this.getCell(ref);
        const val = cell.formula ? this.evaluate(cell.formula) : (cell.value !== undefined ? cell.value : 0);
        return isNaN(parseFloat(val)) ? `"${val}"` : parseFloat(val);
      });
      
      // Safe eval
      const result = Function('"use strict"; return (' + expr + ')')();
      return isNaN(result) ? result : (Math.round(result * 1e10) / 1e10);
    } catch (e) {
      return '#HATA!';
    }
  }

  replaceFunctions(expr) {
    // TOPLA / SUM
    expr = expr.replace(/(?:TOPLA|SUM)\(([^)]+)\)/g, (_, args) => this.rangeFunc(args, 'sum'));
    // ORTALAMA / AVERAGE
    expr = expr.replace(/(?:ORTALAMA|AVERAGE)\(([^)]+)\)/g, (_, args) => this.rangeFunc(args, 'avg'));
    // MAK / MAX
    expr = expr.replace(/(?:MAK|MAX)\(([^)]+)\)/g, (_, args) => this.rangeFunc(args, 'max'));
    // MİN / MIN
    expr = expr.replace(/(?:MİN|MIN)\(([^)]+)\)/g, (_, args) => this.rangeFunc(args, 'min'));
    // SAYI / COUNT
    expr = expr.replace(/(?:SAYI|COUNT)\(([^)]+)\)/g, (_, args) => this.rangeFunc(args, 'count'));
    // EĞER / IF
    expr = expr.replace(/(?:EĞER|IF)\(([^,]+),([^,]+),([^)]+)\)/g, (_, cond, t, f) => {
      const c = this.evalSimple(cond);
      return c ? t.trim() : f.trim();
    });
    // YUVARLA / ROUND
    expr = expr.replace(/(?:YUVARLA|ROUND)\(([^,]+),(\d+)\)/g, (_, val, dec) => {
      const v = this.evalSimple(val);
      return parseFloat(v).toFixed(parseInt(dec));
    });
    // MUTLAK / ABS
    expr = expr.replace(/(?:MUTLAK|ABS)\(([^)]+)\)/g, (_, val) => Math.abs(this.evalSimple(val)));
    // KAREKÖK / SQRT
    expr = expr.replace(/(?:KAREKÖK|SQRT)\(([^)]+)\)/g, (_, val) => Math.sqrt(this.evalSimple(val)));
    // ÜSSÜ / POWER
    expr = expr.replace(/(?:ÜSSÜ|POWER)\(([^,]+),([^)]+)\)/g, (_, b, e) => Math.pow(this.evalSimple(b), this.evalSimple(e)));
    // BİRLEŞTİR / CONCAT
    expr = expr.replace(/(?:BİRLEŞTİR|CONCAT)\(([^)]+)\)/g, (_, args) => {
      const vals = this.getRangeValues(args);
      return `"${vals.join('')}"`;
    });
    // BUGÜN / TODAY
    expr = expr.replace(/(?:BUGÜN|TODAY)\(\)/g, () => `"${new Date().toLocaleDateString('tr-TR')}"`);
    // ŞİMDİ / NOW
    expr = expr.replace(/(?:ŞİMDİ|NOW)\(\)/g, () => `"${new Date().toLocaleString('tr-TR')}"`);
    
    return expr;
  }

  evalSimple(expr) {
    expr = expr.trim().replace(/\b([A-Z])(\d+)\b/g, (m, col, row) => {
      const cell = this.getCell(`${col}${row}`);
      const val = cell.formula ? this.evaluate(cell.formula) : (cell.value !== undefined ? cell.value : 0);
      return parseFloat(val) || 0;
    });
    try { return Function('"use strict"; return (' + expr + ')')(); }
    catch { return 0; }
  }

  expandRange(rangeStr) {
    const refs = [];
    const parts = rangeStr.split(',');
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes(':')) {
        const [start, end] = trimmed.split(':');
        const sc = start.charCodeAt(0), sr = parseInt(start.substring(1));
        const ec = end.charCodeAt(0), er = parseInt(end.substring(1));
        for (let c = sc; c <= ec; c++) {
          for (let r = sr; r <= er; r++) {
            refs.push(`${String.fromCharCode(c)}${r}`);
          }
        }
      } else {
        refs.push(trimmed);
      }
    }
    return refs;
  }

  getRangeValues(args) {
    const refs = this.expandRange(args);
    return refs.map(ref => {
      const cell = this.getCell(ref);
      const val = cell.formula ? this.evaluate(cell.formula) : cell.value;
      return val !== undefined ? val : 0;
    });
  }

  rangeFunc(args, type) {
    const vals = this.getRangeValues(args).map(v => parseFloat(v)).filter(v => !isNaN(v));
    if (vals.length === 0) return 0;
    switch (type) {
      case 'sum': return vals.reduce((a, b) => a + b, 0);
      case 'avg': return vals.reduce((a, b) => a + b, 0) / vals.length;
      case 'max': return Math.max(...vals);
      case 'min': return Math.min(...vals);
      case 'count': return vals.length;
      default: return 0;
    }
  }

  // ======= ACTIONS =======
  applyFormat(prop, value) {
    const cell = this.getCell(this.selectedCell);
    this.setCell(this.selectedCell, { [prop]: value !== undefined ? value : !cell[prop] });
    this.refreshCells();
  }

  addSheet() {
    this.sheets.push({ name: `Sayfa ${this.sheets.length + 1}`, data: {}, colWidths: {}, rowHeights: {} });
    this.activeSheet = this.sheets.length - 1;
    this.renderGrid();
    this.renderSheetTabs();
    this.selectCell('A1');
  }

  selectSheet(index) {
    this.activeSheet = index;
    this.renderGrid();
    this.renderSheetTabs();
    this.selectCell('A1');
  }

  renameSheet(index) {
    const name = prompt('Sayfa adı:', this.sheets[index].name);
    if (name) {
      this.sheets[index].name = name;
      this.renderSheetTabs();
    }
  }

  moveCell(dir) {
    const col = this.selectedCell.charCodeAt(0);
    const row = parseInt(this.selectedCell.substring(1));
    let nc = col, nr = row;
    if (dir === 'up' && row > 1) nr--;
    if (dir === 'down' && row < this.ROWS) nr++;
    if (dir === 'left' && col > 65) nc--;
    if (dir === 'right' && col < 65 + this.COLS - 1) nc++;
    this.selectCell(`${String.fromCharCode(nc)}${nr}`);
  }

  updateStatus() {
    const status = document.getElementById('ssStatus');
    if (!status) return;
    // Calculate quick stats for selected range or column
    const data = this.sheets[this.activeSheet].data;
    const vals = Object.values(data).map(c => {
      const v = c.formula ? this.evaluate(c.formula) : c.value;
      return parseFloat(v);
    }).filter(v => !isNaN(v));
    
    if (vals.length > 0) {
      const sum = vals.reduce((a, b) => a + b, 0);
      const avg = sum / vals.length;
      status.textContent = `Toplam: ${sum.toLocaleString('tr-TR')} | Ortalama: ${avg.toLocaleString('tr-TR',{maximumFractionDigits:2})} | Sayı: ${vals.length}`;
    } else {
      status.textContent = 'Hazır';
    }
  }

  saveHistory() {
    const state = JSON.stringify(this.sheets[this.activeSheet].data);
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(state);
    this.historyIndex = this.history.length - 1;
  }

  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.sheets[this.activeSheet].data = JSON.parse(this.history[this.historyIndex]);
      this.refreshCells();
    }
  }

  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.sheets[this.activeSheet].data = JSON.parse(this.history[this.historyIndex]);
      this.refreshCells();
    }
  }

  // Export to CSV
  exportCSV() {
    let csv = '';
    for (let r = 1; r <= this.ROWS; r++) {
      const row = [];
      for (let c = 0; c < this.COLS; c++) {
        const ref = `${String.fromCharCode(65+c)}${r}`;
        const cell = this.getCell(ref);
        const val = cell.formula ? this.evaluate(cell.formula) : (cell.value || '');
        row.push(`"${val}"`);
      }
      if (row.some(v => v !== '""')) csv += row.join(',') + '\n';
    }
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'dxcalc_export.csv';
    link.click();
  }

  // Load sample data
  loadSampleData() {
    const data = {
      'A1': { value: 'Ürün', bold: true, bgColor: '#1a1a3e' },
      'B1': { value: 'Adet', bold: true, bgColor: '#1a1a3e' },
      'C1': { value: 'Birim Fiyat', bold: true, bgColor: '#1a1a3e' },
      'D1': { value: 'Toplam', bold: true, bgColor: '#1a1a3e' },
      'E1': { value: 'KDV (%20)', bold: true, bgColor: '#1a1a3e' },
      'F1': { value: 'Genel Toplam', bold: true, bgColor: '#1a1a3e' },
      'A2': { value: 'Laptop' }, 'B2': { value: 5 }, 'C2': { value: 15000 },
      'D2': { formula: '=B2*C2' }, 'E2': { formula: '=D2*0.2' }, 'F2': { formula: '=D2+E2' },
      'A3': { value: 'Monitor' }, 'B3': { value: 10 }, 'C3': { value: 4500 },
      'D3': { formula: '=B3*C3' }, 'E3': { formula: '=D3*0.2' }, 'F3': { formula: '=D3+E3' },
      'A4': { value: 'Klavye' }, 'B4': { value: 25 }, 'C4': { value: 350 },
      'D4': { formula: '=B4*C4' }, 'E4': { formula: '=D4*0.2' }, 'F4': { formula: '=D4+E4' },
      'A5': { value: 'Mouse' }, 'B5': { value: 25 }, 'C5': { value: 200 },
      'D5': { formula: '=B5*C5' }, 'E5': { formula: '=D5*0.2' }, 'F5': { formula: '=D5+E5' },
      'A6': { value: 'Kulaklık' }, 'B6': { value: 15 }, 'C6': { value: 750 },
      'D6': { formula: '=B6*C6' }, 'E6': { formula: '=D6*0.2' }, 'F6': { formula: '=D6+E6' },
      'A8': { value: 'TOPLAM', bold: true }, 'D8': { formula: '=TOPLA(D2:D6)', bold: true, format: 'currency' },
      'E8': { formula: '=TOPLA(E2:E6)', bold: true, format: 'currency' },
      'F8': { formula: '=TOPLA(F2:F6)', bold: true, format: 'currency' },
      'A9': { value: 'Ortalama', bold: true }, 'D9': { formula: '=ORTALAMA(D2:D6)', format: 'currency' },
      'A10': { value: 'Maksimum', bold: true }, 'D10': { formula: '=MAK(D2:D6)', format: 'currency' },
      'A11': { value: 'Minimum', bold: true }, 'D11': { formula: '=MİN(D2:D6)', format: 'currency' },
    };
    this.sheets[this.activeSheet].data = data;
    this.renderGrid();
    this.selectCell('A1');
  }
}

// ======= Global SS Instance & Handlers =======
let ssInstance = null;

function initSpreadsheet(containerId) {
  ssInstance = new DxSpreadsheet(containerId);
  ssInstance.loadSampleData();
}

function ssSelectCell(ref) { if (ssInstance) ssInstance.selectCell(ref); }
function ssEditCell(ref) { if (ssInstance) ssInstance.editCell(ref); }
function ssSelectSheet(i) { if (ssInstance) ssInstance.selectSheet(i); }
function ssRenameSheet(i) { if (ssInstance) ssInstance.renameSheet(i); }

function ssFormulaKey(e) {
  if (!ssInstance) return;
  if (e.key === 'Enter') {
    ssInstance.commitEdit(e.target.value);
    ssInstance.moveCell('down');
    e.preventDefault();
  } else if (e.key === 'Tab') {
    ssInstance.commitEdit(e.target.value);
    ssInstance.moveCell('right');
    e.preventDefault();
  } else if (e.key === 'Escape') {
    ssInstance.isEditing = false;
    ssInstance.selectCell(ssInstance.selectedCell);
  }
}

function ssFormulaChange(e) { /* live preview could go here */ }

function ssAction(action, value) {
  if (!ssInstance) return;
  switch (action) {
    case 'bold': ssInstance.applyFormat('bold'); break;
    case 'italic': ssInstance.applyFormat('italic'); break;
    case 'underline': ssInstance.applyFormat('underline'); break;
    case 'alignLeft': ssInstance.applyFormat('align', 'left'); break;
    case 'alignCenter': ssInstance.applyFormat('align', 'center'); break;
    case 'alignRight': ssInstance.applyFormat('align', 'right'); break;
    case 'fontSize': ssInstance.applyFormat('fontSize', value); break;
    case 'color': ssInstance.applyFormat('color', value); break;
    case 'bgColor': ssInstance.applyFormat('bgColor', value); break;
    case 'format': ssInstance.applyFormat('format', value); break;
    case 'addSheet': ssInstance.addSheet(); break;
    case 'undo': ssInstance.undo(); break;
    case 'redo': ssInstance.redo(); break;
    case 'export': ssInstance.exportCSV(); break;
  }
}
