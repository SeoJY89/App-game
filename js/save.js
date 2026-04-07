const SaveManager = {
  KEY: 'mochiMergeSave',

  save(board, orders) {
    try {
      const data = {
        board: board.serialize(),
        orders: orders.serialize(),
        timestamp: Date.now()
      };
      localStorage.setItem(this.KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Save failed:', e);
    }
  },

  load() {
    try {
      const raw = localStorage.getItem(this.KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      console.warn('Load failed:', e);
      return null;
    }
  },

  hasSave() {
    return localStorage.getItem(this.KEY) !== null;
  },

  clear() {
    localStorage.removeItem(this.KEY);
  }
};
