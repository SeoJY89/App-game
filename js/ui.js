// UI Manager - renders HTML overlay for menu, header, inventory, popups
class UI {
  constructor(game, overlayEl) {
    this.game = game;
    this.overlayEl = overlayEl;
    this.currentPopup = null;
    this.keypadInput = '';
    this.keypadAnswer = '';
    this.keypadLength = 4;
    this.keypadCallback = null;
  }

  clear() {
    this.overlayEl.innerHTML = '';
    this.currentPopup = null;
  }

  // ============ MENU ============
  showMenu(maxUnlocked) {
    this.clear();
    const total = CONFIG.STAGES.length;
    const label = maxUnlocked > 1 ? `이어서 (ROOM ${maxUnlocked})` : '시작';

    this.overlayEl.innerHTML = `
      <div class="menu">
        <div class="menu-decoration">✦   ✦   ✦</div>
        <div class="menu-title">ESCAPE</div>
        <div class="menu-subtitle">방탈출</div>
        <div class="menu-divider"></div>
        <div class="menu-description">
          어둠 속에 갇힌 당신.<br>
          방의 물건들을 조사하고,<br>
          단서를 모아 탈출하라.
        </div>
        <button class="menu-play" id="menu-play-btn">${label}</button>
        ${maxUnlocked > 1 ? `<div class="menu-progress">진행: ${maxUnlocked - 1} / ${total} 탈출</div>` : ''}
      </div>
    `;

    document.getElementById('menu-play-btn').addEventListener('click', () => {
      this.game.audio.playButton();
      const idx = Math.min(maxUnlocked - 1, CONFIG.STAGES.length - 1);
      this.game.startStage(idx);
    });
  }

  // ============ HEADER + INVENTORY (always visible during play) ============
  showGameUI(stageData, stageNum, total) {
    this.clear();
    this.overlayEl.innerHTML = `
      <div class="header">
        <div>
          <div class="header-room">ROOM ${stageNum} / ${total}</div>
          <div class="header-name">${stageData.title}</div>
        </div>
        <button class="header-menu" id="header-menu-btn">메뉴</button>
      </div>
      <div class="inventory">
        <div class="inventory-label">인벤토리</div>
        <div class="inventory-slots" id="inventory-slots"></div>
        <div class="inventory-selected-label" id="inventory-selected-label"></div>
      </div>
    `;

    document.getElementById('header-menu-btn').addEventListener('click', () => {
      this.game.audio.playButton();
      this.game.backToMenu();
    });

    this.refreshInventory();
  }

  refreshInventory() {
    const slotsEl = document.getElementById('inventory-slots');
    if (!slotsEl) return;

    const inv = this.game.inventory;
    const max = 6;
    let html = '';
    for (let i = 0; i < max; i++) {
      const item = inv[i];
      if (item) {
        const selected = this.game.selectedItem === item.id ? ' selected' : '';
        html += `<div class="inventory-slot filled${selected}" data-id="${item.id}">${item.icon}</div>`;
      } else {
        html += `<div class="inventory-slot"></div>`;
      }
    }
    slotsEl.innerHTML = html;

    // selected label
    const selLbl = document.getElementById('inventory-selected-label');
    const selItem = inv.find(i => i.id === this.game.selectedItem);
    if (selLbl) {
      if (selItem) {
        selLbl.textContent = selItem.label + ' 선택됨';
        selLbl.classList.add('visible');
      } else {
        selLbl.classList.remove('visible');
      }
    }

    // attach click handlers
    slotsEl.querySelectorAll('.inventory-slot.filled').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = el.dataset.id;
        this.game.audio.playTap();
        this.game.toggleItemSelection(id);
      });
    });
  }

  // ============ POPUPS ============
  showMessage(text, onClose = null) {
    this._showPopupHTML(`
      <div class="popup-overlay visible" id="popup-overlay">
        <div class="popup">
          <div class="popup-text">${this._escapeHtml(text)}</div>
          <button class="popup-button" id="popup-close">확인</button>
        </div>
      </div>
    `, () => {
      if (onClose) onClose();
    });
  }

  showInfo(title, text, onClose = null) {
    this._showPopupHTML(`
      <div class="popup-overlay visible" id="popup-overlay">
        <div class="popup">
          <div class="popup-title">${this._escapeHtml(title)}</div>
          <div class="popup-text">${this._escapeHtml(text)}</div>
          <button class="popup-button" id="popup-close">닫기</button>
        </div>
      </div>
    `, () => {
      if (onClose) onClose();
    });
  }

  showBooks(title, books, onClose = null) {
    const booksHtml = books.map(b => `
      <div>
        <div class="book" style="background: linear-gradient(180deg, ${b.color} 0%, ${this._darken(b.color)} 100%)">
          <div class="book-number">${b.number}</div>
        </div>
        <div class="book-label">${b.label}</div>
      </div>
    `).join('');

    this._showPopupHTML(`
      <div class="popup-overlay visible" id="popup-overlay">
        <div class="popup">
          <div class="popup-title">${this._escapeHtml(title)}</div>
          <div class="books-display">${booksHtml}</div>
          <button class="popup-button" id="popup-close">닫기</button>
        </div>
      </div>
    `, () => {
      if (onClose) onClose();
    });
  }

  showKeypad(title, length, answer, hint, onCorrect) {
    this.keypadInput = '';
    this.keypadAnswer = answer;
    this.keypadLength = length;
    this.keypadCallback = onCorrect;

    const hintHtml = hint ? `<div class="popup-hint-wrap"><div class="popup-hint">${this._escapeHtml(hint)}</div></div>` : '';

    this._showPopupHTML(`
      <div class="popup-overlay visible" id="popup-overlay">
        <div class="popup">
          <div class="popup-title">${this._escapeHtml(title)}</div>
          ${hintHtml}
          <div class="keypad-input" id="keypad-input"></div>
          <div class="keypad">
            <button data-key="1">1</button>
            <button data-key="2">2</button>
            <button data-key="3">3</button>
            <button data-key="4">4</button>
            <button data-key="5">5</button>
            <button data-key="6">6</button>
            <button data-key="7">7</button>
            <button data-key="8">8</button>
            <button data-key="9">9</button>
            <button data-key="del" class="delete">←</button>
            <button data-key="0">0</button>
            <button data-key="enter" class="enter">✓</button>
          </div>
          <button class="popup-button danger" id="popup-close">취소</button>
        </div>
      </div>
    `, null);

    // Render input
    this._renderKeypadInput();

    // Keypad click handlers
    this.overlayEl.querySelectorAll('.keypad button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.game.audio.playKey();
        this._handleKeypadKey(btn.dataset.key);
      });
    });
  }

  _handleKeypadKey(key) {
    if (key === 'del') {
      this.keypadInput = this.keypadInput.slice(0, -1);
      this._renderKeypadInput();
      return;
    }
    if (key === 'enter') {
      if (this.keypadInput === this.keypadAnswer) {
        this.game.audio.playCorrect();
        const cb = this.keypadCallback;
        this.closePopup();
        if (cb) {
          const result = cb(this.game);
          if (result) this.game.processResult(result);
        }
      } else {
        this.game.audio.playWrong();
        const inputEl = document.getElementById('keypad-input');
        if (inputEl) {
          inputEl.classList.add('keypad-shake');
          setTimeout(() => inputEl.classList.remove('keypad-shake'), 400);
        }
        this.keypadInput = '';
        setTimeout(() => this._renderKeypadInput(), 400);
      }
      return;
    }
    if (this.keypadInput.length < this.keypadLength) {
      this.keypadInput += key;
      this._renderKeypadInput();
    }
  }

  _renderKeypadInput() {
    const inputEl = document.getElementById('keypad-input');
    if (!inputEl) return;
    let html = '';
    for (let i = 0; i < this.keypadLength; i++) {
      const ch = this.keypadInput[i] || '';
      html += `<div class="keypad-input-slot${ch ? ' filled' : ''}">${ch}</div>`;
    }
    inputEl.innerHTML = html;
  }

  closePopup() {
    const p = document.getElementById('popup-overlay');
    if (p) p.remove();
    this.currentPopup = null;
  }

  _showPopupHTML(html, onClose) {
    this.closePopup();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;
    const el = wrapper.firstElementChild;
    this.overlayEl.appendChild(el);
    this.currentPopup = el;

    const closeBtn = document.getElementById('popup-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.game.audio.playButton();
        this.closePopup();
        if (onClose) onClose();
      });
    }
  }

  isPopupOpen() {
    return this.currentPopup !== null;
  }

  // ============ STAGE COMPLETE ============
  showStageComplete(stageNum, isLast, onNext) {
    this.clear();
    this.overlayEl.innerHTML = `
      <div class="complete">
        <div class="complete-title">ESCAPED</div>
        <div class="complete-subtitle">ROOM ${stageNum} 탈출</div>
        <button class="complete-button" id="complete-next-btn">
          ${isLast ? '메뉴로' : '다음 방 →'}
        </button>
      </div>
    `;

    document.getElementById('complete-next-btn').addEventListener('click', () => {
      this.game.audio.playButton();
      onNext();
    });
  }

  // ============ HELPERS ============
  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  }

  _darken(hex) {
    // Darken a hex color by 30%
    const h = hex.replace('#', '');
    const r = Math.max(0, parseInt(h.substr(0,2), 16) - 50);
    const g = Math.max(0, parseInt(h.substr(2,2), 16) - 50);
    const b = Math.max(0, parseInt(h.substr(4,2), 16) - 50);
    return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
  }
}
