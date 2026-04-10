class Puzzle {
  constructor(data) {
    this.data = data;
    this.path = [];
    this.drawing = false;
    this.completed = false;
    this.failTimer = 0;
    this.solveTimer = 0;
    this._computeLayout();
  }

  _computeLayout() {
    const pad = 40;
    const topY = CONFIG.LAYOUT.gridTop + 40;
    const bottomY = CONFIG.LAYOUT.gridBottom - 40;
    const maxW = CONFIG.CANVAS.WIDTH - pad * 2;
    const maxH = bottomY - topY;

    this.cellSize = Math.min(maxW / this.data.cols, maxH / this.data.rows);
    this.cellSize = Math.min(this.cellSize, 100);

    const gw = this.data.cols * this.cellSize;
    const gh = this.data.rows * this.cellSize;
    this.gridX = (CONFIG.CANVAS.WIDTH - gw) / 2;
    this.gridY = topY + (maxH - gh) / 2;
    this.gridW = gw;
    this.gridH = gh;

    this.lineWidth = Math.max(10, this.cellSize * 0.16);
    this.nodeRadius = this.lineWidth * 0.55;
    this.startRadius = this.lineWidth * 0.9;
  }

  nodeToScreen(col, row) {
    return {
      x: this.gridX + col * this.cellSize,
      y: this.gridY + row * this.cellSize
    };
  }

  cellCenter(col, row) {
    return {
      x: this.gridX + (col + 0.5) * this.cellSize,
      y: this.gridY + (row + 0.5) * this.cellSize
    };
  }

  hitStart(x, y) {
    const p = this.nodeToScreen(this.data.start.col, this.data.start.row);
    const r = this.startRadius + 18;
    return Math.hypot(x - p.x, y - p.y) < r;
  }

  startDraw() {
    this.path = [{ col: this.data.start.col, row: this.data.start.row }];
    this.drawing = true;
    this.completed = false;
    this.failTimer = 0;
  }

  tryMove(x, y) {
    if (!this.drawing) return;

    const head = this.path[this.path.length - 1];
    const headPos = this.nodeToScreen(head.col, head.row);
    const dx = x - headPos.x;
    const dy = y - headPos.y;
    const threshold = this.cellSize * 0.55;

    // Check retraction first
    if (this.path.length >= 2) {
      const prev = this.path[this.path.length - 2];
      const prevPos = this.nodeToScreen(prev.col, prev.row);
      const distToPrev = Math.hypot(x - prevPos.x, y - prevPos.y);
      if (distToPrev < threshold * 0.9) {
        this.path.pop();
        return;
      }
    }

    // Find best adjacent node to extend to
    const dirs = [
      { dc: 1, dr: 0, tx: this.cellSize, ty: 0 },
      { dc: -1, dr: 0, tx: -this.cellSize, ty: 0 },
      { dc: 0, dr: 1, tx: 0, ty: this.cellSize },
      { dc: 0, dr: -1, tx: 0, ty: -this.cellSize }
    ];

    let best = null;
    let bestDist = Infinity;
    for (const d of dirs) {
      const nc = head.col + d.dc;
      const nr = head.row + d.dr;
      if (nc < 0 || nc > this.data.cols || nr < 0 || nr > this.data.rows) continue;
      if (this.path.some(n => n.col === nc && n.row === nr)) continue;
      const dist = Math.hypot(dx - d.tx, dy - d.ty);
      if (dist < bestDist) {
        bestDist = dist;
        best = { col: nc, row: nr };
      }
    }

    if (best && bestDist < threshold) {
      this.path.push(best);
    }
  }

  endDraw() {
    if (!this.drawing) return null;
    this.drawing = false;

    const head = this.path[this.path.length - 1];
    const isEnd = head.col === this.data.end.col && head.row === this.data.end.row;

    if (isEnd && this._validate()) {
      this.completed = true;
      this.solveTimer = 0;
      return 'solved';
    } else {
      this.failTimer = 0.6;
      return 'failed';
    }
  }

  _validate() {
    // 1. Check hex dots
    for (const dot of this.data.hexDots || []) {
      if (!this._pathHasDotEdge(dot)) return false;
    }

    // 2. Check cells: separation + stars
    const regions = this._computeRegions();
    for (const region of regions) {
      const squareColors = new Set();
      const stars = {};
      for (const cell of region) {
        const sym = this.data.cells[cell.row] && this.data.cells[cell.row][cell.col];
        if (!sym) continue;
        if (sym.type === 'square') squareColors.add(sym.color);
        else if (sym.type === 'star') stars[sym.color] = (stars[sym.color] || 0) + 1;
      }
      if (squareColors.size > 1) return false;
      for (const c in stars) {
        if (stars[c] !== 2) return false;
      }
    }
    return true;
  }

  _pathHasDotEdge(dot) {
    // dot.dir === 'h': edge from (col,row) to (col+1,row)
    // dot.dir === 'v': edge from (col,row) to (col,row+1)
    for (let i = 0; i < this.path.length - 1; i++) {
      const a = this.path[i];
      const b = this.path[i + 1];
      if (dot.dir === 'h') {
        const match =
          (a.col === dot.col && a.row === dot.row && b.col === dot.col + 1 && b.row === dot.row) ||
          (b.col === dot.col && b.row === dot.row && a.col === dot.col + 1 && a.row === dot.row);
        if (match) return true;
      } else {
        const match =
          (a.col === dot.col && a.row === dot.row && b.col === dot.col && b.row === dot.row + 1) ||
          (b.col === dot.col && b.row === dot.row && a.col === dot.col && a.row === dot.row + 1);
        if (match) return true;
      }
    }
    return false;
  }

  _hasPathEdgeHorizontal(col, row) {
    for (let i = 0; i < this.path.length - 1; i++) {
      const a = this.path[i];
      const b = this.path[i + 1];
      if ((a.col === col && a.row === row && b.col === col + 1 && b.row === row) ||
          (b.col === col && b.row === row && a.col === col + 1 && a.row === row)) return true;
    }
    return false;
  }

  _hasPathEdgeVertical(col, row) {
    for (let i = 0; i < this.path.length - 1; i++) {
      const a = this.path[i];
      const b = this.path[i + 1];
      if ((a.col === col && a.row === row && b.col === col && b.row === row + 1) ||
          (b.col === col && b.row === row && a.col === col && a.row === row + 1)) return true;
    }
    return false;
  }

  _edgeBetweenCellsBlocked(c1, r1, c2, r2) {
    if (c1 + 1 === c2 && r1 === r2) return this._hasPathEdgeVertical(c2, r1);
    if (c1 - 1 === c2 && r1 === r2) return this._hasPathEdgeVertical(c1, r1);
    if (c1 === c2 && r1 + 1 === r2) return this._hasPathEdgeHorizontal(c1, r2);
    if (c1 === c2 && r1 - 1 === r2) return this._hasPathEdgeHorizontal(c1, r1);
    return false;
  }

  _computeRegions() {
    const cols = this.data.cols, rows = this.data.rows;
    const visited = Array.from({ length: rows }, () => new Array(cols).fill(false));
    const regions = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (visited[r][c]) continue;
        const region = [];
        const queue = [{ col: c, row: r }];
        visited[r][c] = true;
        while (queue.length) {
          const cell = queue.shift();
          region.push(cell);
          const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
          for (const [dc,dr] of dirs) {
            const nc = cell.col + dc, nr = cell.row + dr;
            if (nc<0||nc>=cols||nr<0||nr>=rows) continue;
            if (visited[nr][nc]) continue;
            if (this._edgeBetweenCellsBlocked(cell.col,cell.row,nc,nr)) continue;
            visited[nr][nc] = true;
            queue.push({col:nc,row:nr});
          }
        }
        regions.push(region);
      }
    }
    return regions;
  }

  update(dt) {
    if (this.failTimer > 0) {
      this.failTimer -= dt;
      if (this.failTimer <= 0) {
        this.path = [];
        this.failTimer = 0;
      }
    }
    if (this.completed) {
      this.solveTimer += dt;
    }
  }

  draw(ctx) {
    // panel bg
    const pad = 14;
    ctx.fillStyle = CONFIG.COLORS.panel;
    this._roundRect(ctx, this.gridX - pad, this.gridY - pad,
      this.gridW + pad * 2, this.gridH + pad * 2, 14);
    ctx.fill();

    // grid lines
    ctx.strokeStyle = CONFIG.COLORS.gridLineDim;
    ctx.lineWidth = this.lineWidth * 0.35;
    ctx.lineCap = 'round';

    for (let r = 0; r <= this.data.rows; r++) {
      const p1 = this.nodeToScreen(0, r);
      const p2 = this.nodeToScreen(this.data.cols, r);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    for (let c = 0; c <= this.data.cols; c++) {
      const p1 = this.nodeToScreen(c, 0);
      const p2 = this.nodeToScreen(c, this.data.rows);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // cell symbols
    for (let r = 0; r < this.data.rows; r++) {
      for (let c = 0; c < this.data.cols; c++) {
        const sym = this.data.cells[r] && this.data.cells[r][c];
        if (sym) this._drawSymbol(ctx, sym, c, r);
      }
    }

    // hex dots on edges
    for (const dot of this.data.hexDots || []) {
      this._drawHexDot(ctx, dot);
    }

    // end cap
    this._drawEndCap(ctx);

    // path
    this._drawPath(ctx);

    // start node
    this._drawStartNode(ctx);
  }

  _drawStartNode(ctx) {
    const p = this.nodeToScreen(this.data.start.col, this.data.start.row);
    let color = CONFIG.COLORS.lineStart;
    if (this.completed) color = CONFIG.COLORS.success;
    if (this.failTimer > 0) color = CONFIG.COLORS.fail;

    if (this.path.length > 0 || this.completed) {
      ctx.shadowColor = this.completed ? CONFIG.COLORS.successGlow : CONFIG.COLORS.lineGlow;
      ctx.shadowBlur = 15;
    }
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, this.startRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  _drawEndCap(ctx) {
    const p = this.nodeToScreen(this.data.end.col, this.data.end.row);
    // determine direction: end is on boundary, extend away
    let dx = 0, dy = 0;
    if (this.data.end.col === 0) dx = -1;
    else if (this.data.end.col === this.data.cols) dx = 1;
    else if (this.data.end.row === 0) dy = -1;
    else if (this.data.end.row === this.data.rows) dy = 1;

    const capLen = this.cellSize * 0.35;
    const endX = p.x + dx * capLen;
    const endY = p.y + dy * capLen;

    ctx.strokeStyle = CONFIG.COLORS.gridLine;
    ctx.lineWidth = this.lineWidth * 0.9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // rounded end dot
    ctx.fillStyle = CONFIG.COLORS.gridLine;
    ctx.beginPath();
    ctx.arc(endX, endY, this.lineWidth * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  _drawPath(ctx) {
    if (this.path.length === 0) return;

    let color = CONFIG.COLORS.line;
    if (this.completed) color = CONFIG.COLORS.success;
    if (this.failTimer > 0) color = CONFIG.COLORS.fail;

    ctx.shadowColor = this.completed ? CONFIG.COLORS.successGlow : CONFIG.COLORS.lineGlow;
    ctx.shadowBlur = this.completed ? 18 : 10;

    ctx.strokeStyle = color;
    ctx.lineWidth = this.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    for (let i = 0; i < this.path.length; i++) {
      const p = this.nodeToScreen(this.path[i].col, this.path[i].row);
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();

    // if path ended at end node with success, extend cap
    if (this.completed || (this.drawing === false && this.path.length > 0)) {
      const last = this.path[this.path.length - 1];
      if (last.col === this.data.end.col && last.row === this.data.end.row) {
        let dx = 0, dy = 0;
        if (last.col === 0) dx = -1;
        else if (last.col === this.data.cols) dx = 1;
        else if (last.row === 0) dy = -1;
        else if (last.row === this.data.rows) dy = 1;
        const p = this.nodeToScreen(last.col, last.row);
        const capLen = this.cellSize * 0.35;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + dx * capLen, p.y + dy * capLen);
        ctx.stroke();
      }
    }

    ctx.shadowBlur = 0;
  }

  _drawSymbol(ctx, sym, col, row) {
    const c = this.cellCenter(col, row);
    const s = this.cellSize * 0.4;

    if (sym.type === 'square') {
      const color = sym.color === 'black' ? CONFIG.COLORS.square_black : CONFIG.COLORS.square_white;
      ctx.fillStyle = color;
      const half = s / 2;
      const r = 4;
      this._roundRect(ctx, c.x - half, c.y - half, s, s, r);
      ctx.fill();
      if (sym.color === 'white') {
        ctx.strokeStyle = 'rgba(0,0,0,0.2)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    } else if (sym.type === 'star') {
      const color = CONFIG.COLORS['star_' + sym.color];
      ctx.fillStyle = color;
      this._drawStar(ctx, c.x, c.y, s * 0.55, s * 0.25, 4);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.3)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  _drawHexDot(ctx, dot) {
    let p1, p2;
    if (dot.dir === 'h') {
      p1 = this.nodeToScreen(dot.col, dot.row);
      p2 = this.nodeToScreen(dot.col + 1, dot.row);
    } else {
      p1 = this.nodeToScreen(dot.col, dot.row);
      p2 = this.nodeToScreen(dot.col, dot.row + 1);
    }
    const cx = (p1.x + p2.x) / 2;
    const cy = (p1.y + p2.y) / 2;
    const r = this.lineWidth * 0.55;

    ctx.fillStyle = '#8090a8';
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (Math.PI * 2 * i) / 6 + Math.PI / 6;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }

  _drawStar(ctx, cx, cy, outerR, innerR, points) {
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = (Math.PI * i) / points - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  _roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
