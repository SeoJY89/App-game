/**
 * Block Blast - UI Renderer & Input Handler
 * Canvas-based rendering with touch/mouse drag support
 */

class GameRenderer {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.game = game;
        this.cellSize = 0;
        this.boardX = 0;
        this.boardY = 0;
        this.padding = 0;

        // Drag state
        this.dragging = false;
        this.dragSlot = -1;
        this.dragX = 0;
        this.dragY = 0;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.ghostRow = -1;
        this.ghostCol = -1;

        // Animation state
        this.clearAnimations = [];
        this.placeAnimations = [];
        this.scorePopups = [];
        this.shakeAmount = 0;
        this.particles = [];

        // Tray
        this.traySlotPositions = [];
        this.trayCellSize = 0;

        this.resize();
        this.setupInputHandlers();

        // Animation loop
        this.lastTime = 0;
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    resize() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;

        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.width * dpr; // Square canvas
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.width + 'px';

        this.padding = Math.floor(rect.width * 0.03);
        const boardSize = rect.width - this.padding * 2;
        this.cellSize = Math.floor(boardSize / GRID_SIZE);
        this.boardX = Math.floor((rect.width - this.cellSize * GRID_SIZE) / 2);
        this.boardY = Math.floor((rect.width - this.cellSize * GRID_SIZE) / 2);

        this.dpr = dpr;
        this.canvasLogicalWidth = rect.width;
        this.canvasLogicalHeight = rect.width;

        this.updateTrayPositions();
    }

    updateTrayPositions() {
        const trayEl = document.getElementById('block-tray');
        if (!trayEl) return;

        this.trayCellSize = Math.floor(this.cellSize * 0.55);
        const slots = trayEl.querySelectorAll('.tray-slot');
        this.traySlotPositions = [];

        slots.forEach((slot, i) => {
            const rect = slot.getBoundingClientRect();
            this.traySlotPositions.push({
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
                width: rect.width,
                height: rect.height,
                element: slot
            });
        });
    }

    setupInputHandlers() {
        // Touch events
        this.canvas.addEventListener('touchstart', e => this.onPointerDown(e.touches[0], e), { passive: false });
        this.canvas.addEventListener('touchmove', e => this.onPointerMove(e.touches[0], e), { passive: false });
        this.canvas.addEventListener('touchend', e => this.onPointerUp(e), { passive: false });
        this.canvas.addEventListener('touchcancel', e => this.onPointerUp(e), { passive: false });

        // Mouse events
        this.canvas.addEventListener('mousedown', e => this.onPointerDown(e, e));
        this.canvas.addEventListener('mousemove', e => this.onPointerMove(e, e));
        this.canvas.addEventListener('mouseup', e => this.onPointerUp(e));
        this.canvas.addEventListener('mouseleave', e => this.onPointerUp(e));

        // Touch on tray
        document.addEventListener('touchstart', e => this.onTrayPointerDown(e.touches[0], e), { passive: false });
        document.addEventListener('touchmove', e => {
            if (this.dragging) {
                e.preventDefault();
                this.onPointerMove(e.touches[0], e);
            }
        }, { passive: false });
        document.addEventListener('touchend', e => {
            if (this.dragging) this.onPointerUp(e);
        }, { passive: false });

        // Mouse on tray
        document.addEventListener('mousedown', e => this.onTrayPointerDown(e, e));
        document.addEventListener('mousemove', e => {
            if (this.dragging) this.onPointerMove(e, e);
        });
        document.addEventListener('mouseup', e => {
            if (this.dragging) this.onPointerUp(e);
        });

        window.addEventListener('resize', () => {
            this.resize();
        });
    }

    onTrayPointerDown(pointer, event) {
        if (this.game.gameOver || this.game.animating) return;

        const px = pointer.clientX;
        const py = pointer.clientY;

        this.updateTrayPositions();

        for (let i = 0; i < this.traySlotPositions.length; i++) {
            const slot = this.traySlotPositions[i];
            const block = this.game.trayBlocks[i];
            if (!block) continue;

            const halfW = slot.width / 2;
            const halfH = slot.height / 2;

            if (px >= slot.x - halfW && px <= slot.x + halfW &&
                py >= slot.y - halfH && py <= slot.y + halfH) {
                event.preventDefault();
                this.startDrag(i, px, py);
                return;
            }
        }
    }

    onPointerDown(pointer, event) {
        // Handled by tray pointer down
    }

    startDrag(slotIndex, px, py) {
        const block = this.game.trayBlocks[slotIndex];
        if (!block) return;

        this.dragging = true;
        this.dragSlot = slotIndex;
        this.dragX = px;
        this.dragY = py - 60; // Offset above finger
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;

        // Hide tray slot
        const slot = this.traySlotPositions[slotIndex];
        if (slot && slot.element) {
            slot.element.classList.add('dragging');
        }

        // Haptic feedback
        if (navigator.vibrate) navigator.vibrate(10);
    }

    onPointerMove(pointer, event) {
        if (!this.dragging) return;

        this.dragX = pointer.clientX;
        this.dragY = pointer.clientY - 60; // Keep offset above finger

        // Calculate ghost position on board
        const canvasRect = this.canvas.getBoundingClientRect();
        const block = this.game.trayBlocks[this.dragSlot];
        if (!block) return;

        // Find center of block shape
        let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
        for (const [dr, dc] of block.cells) {
            minR = Math.min(minR, dr);
            maxR = Math.max(maxR, dr);
            minC = Math.min(minC, dc);
            maxC = Math.max(maxC, dc);
        }
        const blockCenterR = (minR + maxR) / 2;
        const blockCenterC = (minC + maxC) / 2;

        const localX = this.dragX - canvasRect.left;
        const localY = this.dragY - canvasRect.top;

        const gridCol = Math.round((localX - this.boardX) / this.cellSize - blockCenterC - 0.5);
        const gridRow = Math.round((localY - this.boardY) / this.cellSize - blockCenterR - 0.5);

        if (this.game.canPlaceBlock(block, gridRow, gridCol)) {
            this.ghostRow = gridRow;
            this.ghostCol = gridCol;
        } else {
            this.ghostRow = -1;
            this.ghostCol = -1;
        }
    }

    onPointerUp(event) {
        if (!this.dragging) return;

        // Try to place block
        if (this.ghostRow >= 0 && this.ghostCol >= 0) {
            const block = this.game.trayBlocks[this.dragSlot];
            const placed = this.game.placeBlock(this.dragSlot, this.ghostRow, this.ghostCol);
            if (placed) {
                // Add place animation
                for (const [dr, dc] of block.cells) {
                    this.placeAnimations.push({
                        row: this.ghostRow + dr,
                        col: this.ghostCol + dc,
                        time: 0,
                        duration: 300
                    });
                }
                // Haptic
                if (navigator.vibrate) navigator.vibrate(20);

                // Render tray
                this.renderTray();
            }
        }

        // Reset drag state
        this.dragging = false;
        this.ghostRow = -1;
        this.ghostCol = -1;

        // Show tray slot
        const slot = this.traySlotPositions[this.dragSlot];
        if (slot && slot.element) {
            slot.element.classList.remove('dragging');
        }

        this.dragSlot = -1;
    }

    animate(time) {
        const dt = time - this.lastTime;
        this.lastTime = time;

        this.update(dt);
        this.render();

        requestAnimationFrame(this.animate);
    }

    update(dt) {
        // Update clear animations
        this.clearAnimations = this.clearAnimations.filter(a => {
            a.time += dt;
            return a.time < a.duration;
        });

        // Update place animations
        this.placeAnimations = this.placeAnimations.filter(a => {
            a.time += dt;
            return a.time < a.duration;
        });

        // Update particles
        this.particles = this.particles.filter(p => {
            p.time += dt;
            p.x += p.vx * dt * 0.001;
            p.y += p.vy * dt * 0.001;
            p.vy += 200 * dt * 0.001; // gravity
            return p.time < p.duration;
        });

        // Update shake
        if (this.shakeAmount > 0) {
            this.shakeAmount *= 0.9;
            if (this.shakeAmount < 0.5) this.shakeAmount = 0;
        }

        // Update score popups
        this.scorePopups = this.scorePopups.filter(p => {
            p.time += dt;
            return p.time < p.duration;
        });
    }

    render() {
        const ctx = this.ctx;
        const dpr = this.dpr;

        ctx.save();
        ctx.scale(dpr, dpr);

        // Clear
        ctx.clearRect(0, 0, this.canvasLogicalWidth, this.canvasLogicalHeight);

        // Apply shake
        if (this.shakeAmount > 0) {
            const sx = (Math.random() - 0.5) * this.shakeAmount;
            const sy = (Math.random() - 0.5) * this.shakeAmount;
            ctx.translate(sx, sy);
        }

        this.drawBoard(ctx);
        this.drawGridCells(ctx);
        this.drawGhost(ctx);
        this.drawDragBlock(ctx);
        this.drawParticles(ctx);

        ctx.restore();
    }

    drawBoard(ctx) {
        const x = this.boardX;
        const y = this.boardY;
        const size = this.cellSize * GRID_SIZE;

        // Board background
        ctx.fillStyle = '#16213e';
        this.roundRect(ctx, x - 2, y - 2, size + 4, size + 4, 8);
        ctx.fill();

        // Grid lines
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.lineWidth = 1;

        for (let r = 0; r <= GRID_SIZE; r++) {
            ctx.beginPath();
            ctx.moveTo(x, y + r * this.cellSize);
            ctx.lineTo(x + size, y + r * this.cellSize);
            ctx.stroke();
        }
        for (let c = 0; c <= GRID_SIZE; c++) {
            ctx.beginPath();
            ctx.moveTo(x + c * this.cellSize, y);
            ctx.lineTo(x + c * this.cellSize, y + size);
            ctx.stroke();
        }
    }

    drawGridCells(ctx) {
        const grid = this.game.getGridState();
        const gap = 2;

        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (grid[r][c] === 0) continue;

                const colorIdx = grid[r][c] - 1;
                const cx = this.boardX + c * this.cellSize + gap;
                const cy = this.boardY + r * this.cellSize + gap;
                const cs = this.cellSize - gap * 2;

                // Check if being cleared
                const clearing = this.clearAnimations.find(a => a.row === r && a.col === c);
                if (clearing) {
                    const progress = clearing.time / clearing.duration;
                    const scale = 1 - progress;
                    const alpha = 1 - progress;

                    ctx.globalAlpha = alpha;
                    const centerX = cx + cs / 2;
                    const centerY = cy + cs / 2;
                    const scaledSize = cs * scale;

                    this.drawCell(ctx, centerX - scaledSize / 2, centerY - scaledSize / 2, scaledSize, colorIdx);
                    ctx.globalAlpha = 1;
                    continue;
                }

                // Check if recently placed
                const placing = this.placeAnimations.find(a => a.row === r && a.col === c);
                if (placing) {
                    const progress = placing.time / placing.duration;
                    const bounce = 1 + Math.sin(progress * Math.PI) * 0.15;

                    const centerX = cx + cs / 2;
                    const centerY = cy + cs / 2;
                    const scaledSize = cs * bounce;

                    this.drawCell(ctx, centerX - scaledSize / 2, centerY - scaledSize / 2, scaledSize, colorIdx);
                    continue;
                }

                this.drawCell(ctx, cx, cy, cs, colorIdx);
            }
        }
    }

    drawCell(ctx, x, y, size, colorIdx) {
        const radius = Math.max(3, size * 0.15);

        // Main color
        ctx.fillStyle = COLORS[colorIdx];
        this.roundRect(ctx, x, y, size, size, radius);
        ctx.fill();

        // Highlight (top)
        ctx.fillStyle = COLORS_LIGHT[colorIdx];
        this.roundRect(ctx, x, y, size, size * 0.35, radius);
        ctx.fill();

        // Inner shadow
        ctx.fillStyle = COLORS_DARK[colorIdx];
        this.roundRect(ctx, x + size * 0.1, y + size * 0.65, size * 0.8, size * 0.25, radius * 0.5);
        ctx.fill();

        // Shine
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        this.roundRect(ctx, x + size * 0.15, y + size * 0.1, size * 0.3, size * 0.15, 2);
        ctx.fill();
    }

    drawGhost(ctx) {
        if (!this.dragging || this.ghostRow < 0 || this.ghostCol < 0) return;

        const block = this.game.trayBlocks[this.dragSlot];
        if (!block) return;

        const gap = 2;
        ctx.globalAlpha = 0.35;

        for (const [dr, dc] of block.cells) {
            const r = this.ghostRow + dr;
            const c = this.ghostCol + dc;
            const cx = this.boardX + c * this.cellSize + gap;
            const cy = this.boardY + r * this.cellSize + gap;
            const cs = this.cellSize - gap * 2;

            this.drawCell(ctx, cx, cy, cs, block.color);
        }

        ctx.globalAlpha = 1;
    }

    drawDragBlock(ctx) {
        if (!this.dragging) return;

        const block = this.game.trayBlocks[this.dragSlot];
        if (!block) return;

        const canvasRect = this.canvas.getBoundingClientRect();
        const localX = this.dragX - canvasRect.left;
        const localY = this.dragY - canvasRect.top;

        // Find center of block
        let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
        for (const [dr, dc] of block.cells) {
            minR = Math.min(minR, dr);
            maxR = Math.max(maxR, dr);
            minC = Math.min(minC, dc);
            maxC = Math.max(maxC, dc);
        }

        const dragCellSize = this.cellSize * 0.9;
        const gap = 2;
        const blockW = (maxC - minC + 1) * dragCellSize;
        const blockH = (maxR - minR + 1) * dragCellSize;

        const offsetX = localX - blockW / 2;
        const offsetY = localY - blockH / 2;

        ctx.globalAlpha = 0.85;

        // Shadow
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        for (const [dr, dc] of block.cells) {
            const cx = offsetX + (dc - minC) * dragCellSize + gap;
            const cy = offsetY + (dr - minR) * dragCellSize + gap;
            const cs = dragCellSize - gap * 2;
            this.drawCell(ctx, cx, cy, cs, block.color);
        }

        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.globalAlpha = 1;
    }

    drawParticles(ctx) {
        for (const p of this.particles) {
            const progress = p.time / p.duration;
            const alpha = 1 - progress;
            const size = p.size * (1 - progress * 0.5);

            ctx.globalAlpha = alpha;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    spawnClearParticles(row, col, colorIdx) {
        const cx = this.boardX + col * this.cellSize + this.cellSize / 2;
        const cy = this.boardY + row * this.cellSize + this.cellSize / 2;

        for (let i = 0; i < 6; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 40 + Math.random() * 80;
            this.particles.push({
                x: cx,
                y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 30,
                size: 2 + Math.random() * 3,
                color: COLORS[colorIdx],
                time: 0,
                duration: 600 + Math.random() * 400
            });
        }
    }

    triggerLineClear(cleared) {
        const grid = this.game.getGridState();

        for (const r of cleared.rows) {
            for (let c = 0; c < GRID_SIZE; c++) {
                this.clearAnimations.push({
                    row: r, col: c, time: 0, duration: 400
                });
                this.spawnClearParticles(r, c, Math.floor(Math.random() * COLORS.length));
            }
        }
        for (const c of cleared.cols) {
            for (let r = 0; r < GRID_SIZE; r++) {
                // Avoid duplicate if row already cleared
                if (!cleared.rows.includes(r)) {
                    this.clearAnimations.push({
                        row: r, col: c, time: 0, duration: 400
                    });
                    this.spawnClearParticles(r, c, Math.floor(Math.random() * COLORS.length));
                }
            }
        }

        this.shakeAmount = 6;
        if (navigator.vibrate) navigator.vibrate([30, 20, 30]);
    }

    renderTray() {
        const trayEl = document.getElementById('block-tray');
        const slots = trayEl.querySelectorAll('.tray-slot');

        slots.forEach((slot, i) => {
            slot.innerHTML = '';
            const block = this.game.trayBlocks[i];
            if (!block) {
                slot.classList.add('empty');
                return;
            }
            slot.classList.remove('empty');

            // Find bounds
            let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
            for (const [dr, dc] of block.cells) {
                minR = Math.min(minR, dr);
                maxR = Math.max(maxR, dr);
                minC = Math.min(minC, dc);
                maxC = Math.max(maxC, dc);
            }

            const rows = maxR - minR + 1;
            const cols = maxC - minC + 1;

            const miniBlock = document.createElement('div');
            miniBlock.className = 'mini-block';
            miniBlock.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            miniBlock.style.gridTemplateRows = `repeat(${rows}, 1fr)`;

            // Create a grid map
            const gridMap = Array.from({ length: rows }, () => Array(cols).fill(false));
            for (const [dr, dc] of block.cells) {
                gridMap[dr - minR][dc - minC] = true;
            }

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const cell = document.createElement('div');
                    cell.className = 'mini-cell';
                    if (gridMap[r][c]) {
                        cell.classList.add('filled');
                        cell.style.backgroundColor = COLORS[block.color];
                        cell.style.boxShadow = `inset 0 -2px 0 ${COLORS_DARK[block.color]}, inset 0 2px 0 ${COLORS_LIGHT[block.color]}`;
                    }
                    miniBlock.appendChild(cell);
                }
            }

            slot.appendChild(miniBlock);
        });

        this.updateTrayPositions();
    }

    roundRect(ctx, x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }

    addScorePopup(text, x, y) {
        const container = document.getElementById('score-popup-container');
        const popup = document.createElement('div');
        popup.className = 'score-popup';
        popup.textContent = text;
        popup.style.left = x + 'px';
        popup.style.top = y + 'px';
        container.appendChild(popup);

        setTimeout(() => popup.remove(), 1000);
    }
}
