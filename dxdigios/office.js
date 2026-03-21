// ============================================
// DxDigiOS Office Suite - Word Processor & Presentation
// ============================================

// ======= DxDocs - Word Processor =======
function buildDxDocs() {
  return `<div class="dx-docs">
    <div class="dx-docs-toolbar">
      <div class="dx-docs-toolbar-row">
        <select class="dx-ss-select" id="docFontFamily" onchange="docExec('fontName',this.value)">
          <option value="Inter">Inter</option>
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Georgia">Georgia</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
        </select>
        <select class="dx-ss-select" id="docFontSize" onchange="docExec('fontSize',this.value)">
          ${[1,2,3,4,5,6,7].map(s=>`<option value="${s}" ${s===3?'selected':''}>${[8,10,12,14,18,24,36][s-1]}pt</option>`).join('')}
        </select>
        <span class="dx-ss-sep"></span>
        <button class="dx-ss-btn" onclick="docExec('bold')" title="Kalın"><b>B</b></button>
        <button class="dx-ss-btn" onclick="docExec('italic')" title="İtalik"><i>I</i></button>
        <button class="dx-ss-btn" onclick="docExec('underline')" title="Altçizgi"><u>U</u></button>
        <button class="dx-ss-btn" onclick="docExec('strikeThrough')" title="Üstü Çizili"><s>S</s></button>
        <span class="dx-ss-sep"></span>
        <input type="color" class="dx-ss-color" value="#ffffff" onchange="docExec('foreColor',this.value)" title="Yazı Rengi">
        <input type="color" class="dx-ss-color" value="#0a0a1a" onchange="docExec('hiliteColor',this.value)" title="Vurgu Rengi">
        <span class="dx-ss-sep"></span>
        <button class="dx-ss-btn" onclick="docExec('justifyLeft')" title="Sola">⫷</button>
        <button class="dx-ss-btn" onclick="docExec('justifyCenter')" title="Ortala">☰</button>
        <button class="dx-ss-btn" onclick="docExec('justifyRight')" title="Sağa">⫸</button>
        <button class="dx-ss-btn" onclick="docExec('justifyFull')" title="İki Yana">☰</button>
        <span class="dx-ss-sep"></span>
        <button class="dx-ss-btn" onclick="docExec('insertUnorderedList')" title="Madde İşareti">•</button>
        <button class="dx-ss-btn" onclick="docExec('insertOrderedList')" title="Numaralı Liste">1.</button>
        <button class="dx-ss-btn" onclick="docExec('indent')" title="Girinti Artır">→</button>
        <button class="dx-ss-btn" onclick="docExec('outdent')" title="Girinti Azalt">←</button>
        <span class="dx-ss-sep"></span>
        <button class="dx-ss-btn" onclick="docInsertTable()" title="Tablo Ekle">⊞</button>
        <button class="dx-ss-btn" onclick="docInsertHR()" title="Çizgi Ekle">—</button>
        <button class="dx-ss-btn" onclick="docInsertLink()" title="Bağlantı">🔗</button>
        <span class="dx-ss-sep"></span>
        <button class="dx-ss-btn" onclick="docPrint()" title="Yazdır">🖨️</button>
        <button class="dx-ss-btn" onclick="docExport()" title="Dışa Aktar">💾</button>
      </div>
    </div>
    <div class="dx-docs-ruler">
      <div class="ruler-marks">${Array.from({length:20},(_,i)=>`<span>${i+1}</span>`).join('')}</div>
    </div>
    <div class="dx-docs-page-wrap">
      <div class="dx-docs-page" id="docEditor" contenteditable="true" spellcheck="true">
        <h1 style="text-align:center;color:#6c5ce7">DxDigiOS Belge Editörü</h1>
        <p style="text-align:center;color:#888">DxDocs — Modern Kelime İşlemci</p>
        <hr>
        <h2>Hoş Geldiniz</h2>
        <p>Bu tam özellikli bir kelime işlemci uygulamasıdır. Aşağıdaki özellikleri kullanabilirsiniz:</p>
        <ul>
          <li><strong>Metin Biçimlendirme:</strong> Kalın, italik, altçizgi, üstü çizili</li>
          <li><strong>Paragraf Hizalama:</strong> Sol, orta, sağ, iki yana yasla</li>
          <li><strong>Listeler:</strong> Madde işaretli ve numaralı listeler</li>
          <li><strong>Tablo Ekleme:</strong> Özelleştirilebilir tablolar</li>
          <li><strong>Yazı Tipleri:</strong> Farklı font aileleri ve boyutları</li>
          <li><strong>Renkler:</strong> Yazı rengi ve vurgu rengi</li>
        </ul>
        <h2>Örnek Tablo</h2>
        <table border="1" cellpadding="8" cellspacing="0" style="border-collapse:collapse;width:100%;border-color:#333">
          <tr style="background:#1a1a3e"><th>Departman</th><th>Çalışan Sayısı</th><th>Bütçe</th></tr>
          <tr><td>Yazılım</td><td>25</td><td>₺500.000</td></tr>
          <tr><td>Pazarlama</td><td>12</td><td>₺250.000</td></tr>
          <tr><td>İnsan Kaynakları</td><td>8</td><td>₺150.000</td></tr>
          <tr><td><strong>Toplam</strong></td><td><strong>45</strong></td><td><strong>₺900.000</strong></td></tr>
        </table>
        <br>
        <p>Düzenlemeye başlamak için bu belgenin herhangi bir yerine tıklayın ve yazmaya başlayın.</p>
      </div>
    </div>
    <div class="dx-docs-statusbar">
      <span id="docWordCount">Kelime: 0 | Karakter: 0</span>
      <span id="docPageInfo">Sayfa 1/1</span>
    </div>
  </div>`;
}

function docExec(cmd, val) {
  document.execCommand(cmd, false, val || null);
  updateDocStats();
}

function docInsertTable() {
  const rows = prompt('Satır sayısı:', '3');
  const cols = prompt('Sütun sayısı:', '3');
  if (!rows || !cols) return;
  let html = '<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;border-color:#333;margin:8px 0"><tbody>';
  for (let r = 0; r < parseInt(rows); r++) {
    html += '<tr>';
    for (let c = 0; c < parseInt(cols); c++) {
      html += r === 0 ? '<th style="background:#1a1a3e;padding:8px">Başlık</th>' : '<td style="padding:8px">Veri</td>';
    }
    html += '</tr>';
  }
  html += '</tbody></table>';
  document.execCommand('insertHTML', false, html);
}

function docInsertHR() { document.execCommand('insertHTML', false, '<hr style="border-color:#333">'); }

function docInsertLink() {
  const url = prompt('URL:', 'https://');
  if (url) document.execCommand('createLink', false, url);
}

function docPrint() {
  const content = document.getElementById('docEditor');
  if (!content) return;
  const win = window.open('', '_blank');
  win.document.write(`<html><head><title>DxDocs Yazdır</title><style>body{font-family:Inter,sans-serif;padding:40px;color:#333}table{border-collapse:collapse}td,th{border:1px solid #ccc;padding:8px}</style></head><body>${content.innerHTML}</body></html>`);
  win.document.close();
  win.print();
}

function docExport() {
  const content = document.getElementById('docEditor');
  if (!content) return;
  const blob = new Blob([content.innerHTML], { type: 'text/html' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'belge.html';
  link.click();
}

function updateDocStats() {
  const editor = document.getElementById('docEditor');
  if (!editor) return;
  const text = editor.innerText || '';
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
  const chars = text.length;
  const el = document.getElementById('docWordCount');
  if (el) el.textContent = `Kelime: ${words} | Karakter: ${chars}`;
}

// ======= DxSlides - Presentation App =======
function buildDxSlides() {
  return `<div class="dx-slides">
    <div class="dx-slides-toolbar">
      <button class="dx-ss-btn" onclick="slideAction('add')">+ Slayt</button>
      <button class="dx-ss-btn" onclick="slideAction('delete')">🗑️ Sil</button>
      <span class="dx-ss-sep"></span>
      <button class="dx-ss-btn" onclick="slideAction('prev')">◀</button>
      <span class="dx-slides-counter" id="slideCounter">1 / 3</span>
      <button class="dx-ss-btn" onclick="slideAction('next')">▶</button>
      <span class="dx-ss-sep"></span>
      <select class="dx-ss-select" onchange="slideAction('theme',this.value)">
        <option value="dark">Koyu Tema</option>
        <option value="light">Açık Tema</option>
        <option value="gradient">Gradyan</option>
        <option value="corporate">Kurumsal</option>
      </select>
      <span class="dx-ss-sep"></span>
      <button class="dx-ss-btn" onclick="slideAction('fullscreen')">⛶ Sunum</button>
    </div>
    <div class="dx-slides-content">
      <div class="dx-slides-panel" id="slidesPanel"></div>
      <div class="dx-slides-main">
        <div class="dx-slides-canvas" id="slidesCanvas"></div>
      </div>
    </div>
    <div class="dx-slides-notes">
      <textarea placeholder="Konuşmacı notları..." class="dx-slides-notes-input" id="slideNotes"></textarea>
    </div>
  </div>`;
}

let slidesData = [
  { title: 'DxDigiOS Sunum', subtitle: 'Web Tabanlı İşletim Sistemi', content: '', bg: 'linear-gradient(135deg, #0f0c29, #302b63)', layout: 'title' },
  { title: 'Özellikler', subtitle: '', content: '<ul><li>Modern Glassmorphism Tasarım</li><li>Tam Özellikli Pencere Yönetimi</li><li>Ofis Paket Programları</li><li>Terminal & Dosya Yöneticisi</li><li>Yerleşik Uygulamalar</li></ul>', bg: 'linear-gradient(135deg, #1a1a2e, #16213e)', layout: 'content' },
  { title: 'İletişim', subtitle: 'info@dxdigios.com', content: '<p style="font-size:24px">Teşekkürler!</p>', bg: 'linear-gradient(135deg, #0d1117, #161b22)', layout: 'title' },
];
let currentSlide = 0;

function initSlides() {
  renderSlidePanel();
  renderCurrentSlide();
}

function renderSlidePanel() {
  const panel = document.getElementById('slidesPanel');
  if (!panel) return;
  panel.innerHTML = slidesData.map((s, i) => `
    <div class="dx-slide-thumb ${i===currentSlide?'active':''}" onclick="goToSlide(${i})">
      <div class="slide-thumb-num">${i+1}</div>
      <div class="slide-thumb-preview" style="background:${s.bg}">
        <div style="font-size:6px;color:white;padding:4px;font-weight:600">${s.title}</div>
      </div>
    </div>
  `).join('');
}

function renderCurrentSlide() {
  const canvas = document.getElementById('slidesCanvas');
  const counter = document.getElementById('slideCounter');
  if (!canvas) return;
  const s = slidesData[currentSlide];
  if (counter) counter.textContent = `${currentSlide+1} / ${slidesData.length}`;
  
  if (s.layout === 'title') {
    canvas.innerHTML = `<div class="slide-display" style="background:${s.bg}" contenteditable="false">
      <div class="slide-title" contenteditable="true">${s.title}</div>
      <div class="slide-subtitle" contenteditable="true">${s.subtitle}</div>
      ${s.content ? `<div class="slide-body" contenteditable="true">${s.content}</div>` : ''}
    </div>`;
  } else {
    canvas.innerHTML = `<div class="slide-display" style="background:${s.bg}" contenteditable="false">
      <div class="slide-heading" contenteditable="true">${s.title}</div>
      <div class="slide-body" contenteditable="true">${s.content}</div>
    </div>`;
  }
}

function goToSlide(i) {
  saveCurrentSlide();
  currentSlide = i;
  renderSlidePanel();
  renderCurrentSlide();
}

function saveCurrentSlide() {
  const title = document.querySelector('.slide-title, .slide-heading');
  const subtitle = document.querySelector('.slide-subtitle');
  const body = document.querySelector('.slide-body');
  if (title) slidesData[currentSlide].title = title.innerHTML;
  if (subtitle) slidesData[currentSlide].subtitle = subtitle.innerHTML;
  if (body) slidesData[currentSlide].content = body.innerHTML;
}

function slideAction(action, value) {
  switch (action) {
    case 'add':
      slidesData.push({ title: 'Yeni Slayt', subtitle: '', content: '<p>İçerik ekleyin...</p>', bg: 'linear-gradient(135deg, #1a1a2e, #16213e)', layout: 'content' });
      goToSlide(slidesData.length - 1);
      break;
    case 'delete':
      if (slidesData.length <= 1) return;
      slidesData.splice(currentSlide, 1);
      if (currentSlide >= slidesData.length) currentSlide = slidesData.length - 1;
      renderSlidePanel(); renderCurrentSlide();
      break;
    case 'prev': if (currentSlide > 0) goToSlide(currentSlide - 1); break;
    case 'next': if (currentSlide < slidesData.length - 1) goToSlide(currentSlide + 1); break;
    case 'theme':
      const themes = { dark: '#1a1a2e,#16213e', light: '#e8e8e8,#f5f5f5', gradient: '#0f0c29,#302b63', corporate: '#1b2838,#2a475e' };
      const [c1,c2] = (themes[value]||themes.dark).split(',');
      slidesData[currentSlide].bg = `linear-gradient(135deg, ${c1}, ${c2})`;
      renderCurrentSlide();
      break;
    case 'fullscreen':
      saveCurrentSlide();
      const fs = document.createElement('div');
      fs.className = 'slide-fullscreen';
      fs.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#000;display:flex;align-items:center;justify-content:center;cursor:pointer';
      fs.innerHTML = document.getElementById('slidesCanvas').innerHTML;
      fs.querySelector('.slide-display').style.cssText += 'width:100vw;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center';
      fs.onclick = () => fs.remove();
      document.body.appendChild(fs);
      break;
  }
}
