/**
 * Block Blast - Core Game Engine
 * 8x8 grid block puzzle game with combo system
 */

const GRID_SIZE = 8;
const BLOCK_SHAPES = [
    // Single
    { name: 'dot', cells: [[0,0]], color: 0 },
    // Lines
    { name: 'h2', cells: [[0,0],[0,1]], color: 1 },
    { name: 'h3', cells: [[0,0],[0,1],[0,2]], color: 1 },
    { name: 'h4', cells: [[0,0],[0,1],[0,2],[0,3]], color: 1 },
    { name: 'h5', cells: [[0,0],[0,1],[0,2],[0,3],[0,4]], color: 1 },
    { name: 'v2', cells: [[0,0],[1,0]], color: 2 },
    { name: 'v3', cells: [[0,0],[1,0],[2,0]], color: 2 },
    { name: 'v4', cells: [[0,0],[1,0],[2,0],[3,0]], color: 2 },
    { name: 'v5', cells: [[0,0],[1,0],[2,0],[3,0],[4,0]], color: 2 },
    // Squares
    { name: 'sq2', cells: [[0,0],[0,1],[1,0],[1,1]], color: 3 },
    { name: 'sq3', cells: [[0,0],[0,1],[0,2],[1,0],[1,1],[1,2],[2,0],[2,1],[2,2]], color: 3 },
    // L shapes
    { name: 'l1', cells: [[0,0],[1,0],[1,1]], color: 4 },
    { name: 'l2', cells: [[0,0],[0,1],[1,0]], color: 4 },
    { name: 'l3', cells: [[0,0],[0,1],[1,1]], color: 5 },
    { name: 'l4', cells: [[0,0],[1,0],[1,-1]], color: 5 },
    // Big L shapes
    { name: 'bl1', cells: [[0,0],[1,0],[2,0],[2,1],[2,2]], color: 4 },
    { name: 'bl2', cells: [[0,0],[0,1],[0,2],[1,0],[2,0]], color: 4 },
    { name: 'bl3', cells: [[0,0],[0,1],[0,2],[1,2],[2,2]], color: 5 },
    { name: 'bl4', cells: [[0,0],[1,0],[2,0],[2,-1],[2,-2]], color: 5 },
    // T shapes
    { name: 't1', cells: [[0,0],[0,1],[0,2],[1,1]], color: 6 },
    { name: 't2', cells: [[0,0],[1,0],[1,1],[2,0]], color: 6 },
    { name: 't3', cells: [[0,1],[1,0],[1,1],[1,2]], color: 6 },
    { name: 't4', cells: [[0,0],[0,-1],[1,0],[2,0]], color: 6 },
    // Z shapes
    { name: 'z1', cells: [[0,0],[0,1],[1,1],[1,2]], color: 7 },
    { name: 'z2', cells: [[0,0],[1,0],[1,-1],[2,-1]], color: 7 },
    { name: 'z3', cells: [[0,0],[0,1],[1,-1],[1,0]], color: 7 },
    { name: 'z4', cells: [[0,0],[1,0],[1,1],[2,1]], color: 7 },
];

const COLORS = [
    '#FF6B6B', // 0 - Red
    '#4ECDC4', // 1 - Teal
    '#45B7D1', // 2 - Blue
    '#96CEB4', // 3 - Green
    '#FFEAA7', // 4 - Yellow
    '#DDA0DD', // 5 - Plum
    '#FF8A5C', // 6 - Orange
    '#A29BFE', // 7 - Purple
];

const COLORS_DARK = [
    '#CC5555', '#3BA39B', '#3892A7', '#78A590',
    '#CCB886', '#B180B1', '#CC6E4A', '#817ECB',
];

const COLORS_LIGHT = [
    '#FF9E9E', '#7EDDD6', '#75CCDF', '#B5DEC9',
    '#FFF0C0', '#E8C0E8', '#FFAB85', '#BEB8FE',
];

class BlockBlastGame {
    constructor() {
        this.grid = [];
        this.score = 0;
        this.bestScore = parseInt(localStorage.getItem('blockblast_best') || '0');
        this.combo = 0;
        this.maxCombo = 0;
        this.linesCleared = 0;
        this.trayBlocks = [null, null, null];
        this.gameOver = false;
        this.animating = false;

        // Callbacks
        this.onScoreChange = null;
        this.onCombo = null;
        this.onGameOver = null;
        this.onLineClear = null;
        this.onBlockPlace = null;
        this.onTrayUpdate = null;

        this.init();
    }

    init() {
        this.grid = Array.from({ length: GRID_SIZE }, () =>
            Array.from({ length: GRID_SIZE }, () => 0)
        );
        this.score = 0;
        this.combo = 0;
        this.maxCombo = 0;
        this.linesCleared = 0;
        this.gameOver = false;
        this.animating = false;
        this.generateTrayBlocks();
    }

    restart() {
        this.init();
        if (this.onScoreChange) this.onScoreChange(this.score, this.bestScore);
        if (this.onTrayUpdate) this.onTrayUpdate(this.trayBlocks);
    }

    generateTrayBlocks() {
        for (let i = 0; i < 3; i++) {
            if (this.trayBlocks[i] === null) {
                const idx = Math.floor(Math.random() * BLOCK_SHAPES.length);
                this.trayBlocks[i] = { ...BLOCK_SHAPES[idx], id: Date.now() + i };
            }
        }
    }

    refillTrayIfNeeded() {
        const allEmpty = this.trayBlocks.every(b => b === null);
        if (allEmpty) {
            this.generateTrayBlocks();
            if (this.onTrayUpdate) this.onTrayUpdate(this.trayBlocks);
        }
    }

    canPlaceBlock(block, gridRow, gridCol) {
        if (!block) return false;
        for (const [dr, dc] of block.cells) {
            const r = gridRow + dr;
            const c = gridCol + dc;
            if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
            if (this.grid[r][c] !== 0) return false;
        }
        return true;
    }

    canPlaceBlockAnywhere(block) {
        if (!block) return false;
        for (let r = 0; r < GRID_SIZE; r++) {
            for (let c = 0; c < GRID_SIZE; c++) {
                if (this.canPlaceBlock(block, r, c)) return true;
            }
        }
        return false;
    }

    placeBlock(slotIndex, gridRow, gridCol) {
        const block = this.trayBlocks[slotIndex];
        if (!block || !this.canPlaceBlock(block, gridRow, gridCol)) return false;

        // Place block on grid
        for (const [dr, dc] of block.cells) {
            this.grid[gridRow + dr][gridCol + dc] = block.color + 1;
        }

        // Score for placing
        const placeScore = block.cells.length;
        this.score += placeScore;

        // Remove from tray
        this.trayBlocks[slotIndex] = null;

        if (this.onBlockPlace) {
            this.onBlockPlace(block, gridRow, gridCol);
        }

        // Check for line clears
        const cleared = this.checkAndClearLines();

        if (cleared.rows.length > 0 || cleared.cols.length > 0) {
            const totalLines = cleared.rows.length + cleared.cols.length;
            this.combo++;
            if (this.combo > this.maxCombo) this.maxCombo = this.combo;
            this.linesCleared += totalLines;

            // Score calculation: lines * cells * 10 * combo multiplier
            const lineScore = totalLines * GRID_SIZE * 10 * (1 + (this.combo - 1) * 0.5);
            this.score += Math.floor(lineScore);

            if (this.onCombo) this.onCombo(this.combo, totalLines);
            if (this.onLineClear) this.onLineClear(cleared);
        } else {
            this.combo = 0;
        }

        // Update best score
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('blockblast_best', this.bestScore.toString());
        }

        if (this.onScoreChange) this.onScoreChange(this.score, this.bestScore);

        // Refill tray
        this.refillTrayIfNeeded();

        // Check game over
        if (this.checkGameOver()) {
            this.gameOver = true;
            if (this.onGameOver) {
                this.onGameOver({
                    score: this.score,
                    bestScore: this.bestScore,
                    maxCombo: this.maxCombo,
                    linesCleared: this.linesCleared,
                    isNewRecord: this.score >= this.bestScore
                });
            }
        }

        return true;
    }

    checkAndClearLines() {
        const rows = [];
        const cols = [];

        // Check rows
        for (let r = 0; r < GRID_SIZE; r++) {
            if (this.grid[r].every(cell => cell !== 0)) {
                rows.push(r);
            }
        }

        // Check columns
        for (let c = 0; c < GRID_SIZE; c++) {
            let full = true;
            for (let r = 0; r < GRID_SIZE; r++) {
                if (this.grid[r][c] === 0) {
                    full = false;
                    break;
                }
            }
            if (full) cols.push(c);
        }

        // Clear the lines
        for (const r of rows) {
            for (let c = 0; c < GRID_SIZE; c++) {
                this.grid[r][c] = 0;
            }
        }
        for (const c of cols) {
            for (let r = 0; r < GRID_SIZE; r++) {
                this.grid[r][c] = 0;
            }
        }

        return { rows, cols };
    }

    checkGameOver() {
        for (const block of this.trayBlocks) {
            if (block && this.canPlaceBlockAnywhere(block)) {
                return false;
            }
        }
        return true;
    }

    getGridState() {
        return this.grid.map(row => [...row]);
    }

    getBlockColor(colorIndex) {
        return COLORS[colorIndex];
    }

    getBlockColorDark(colorIndex) {
        return COLORS_DARK[colorIndex];
    }

    getBlockColorLight(colorIndex) {
        return COLORS_LIGHT[colorIndex];
    }
}
