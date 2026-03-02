/**
 * Block Blast - App Controller
 * Connects game logic with UI and manages screens
 */

(function() {
    'use strict';

    const game = new BlockBlastGame();
    let renderer = null;

    // DOM Elements
    const screens = {
        start: document.getElementById('start-screen'),
        tutorial: document.getElementById('tutorial-screen'),
        game: document.getElementById('game-screen'),
        gameover: document.getElementById('gameover-screen')
    };

    const elements = {
        playBtn: document.getElementById('play-btn'),
        howToPlayBtn: document.getElementById('how-to-play-btn'),
        tutorialBackBtn: document.getElementById('tutorial-back-btn'),
        restartBtn: document.getElementById('restart-btn'),
        homeBtn: document.getElementById('home-btn'),
        currentScore: document.getElementById('current-score'),
        bestScore: document.getElementById('best-score'),
        startBestScore: document.getElementById('start-best-score'),
        finalScoreValue: document.getElementById('final-score-value'),
        newRecord: document.getElementById('new-record'),
        maxCombo: document.getElementById('max-combo'),
        linesCleared: document.getElementById('lines-cleared'),
        comboDisplay: document.getElementById('combo-display'),
        comboText: document.getElementById('combo-text'),
        canvas: document.getElementById('game-canvas')
    };

    // Screen Management
    function showScreen(name) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[name].classList.add('active');
    }

    // Score display animation
    function animateScore(element, targetValue) {
        const currentValue = parseInt(element.textContent) || 0;
        if (currentValue === targetValue) {
            element.textContent = targetValue.toLocaleString();
            return;
        }

        const diff = targetValue - currentValue;
        const steps = Math.min(20, Math.abs(diff));
        const stepValue = diff / steps;
        let step = 0;

        const interval = setInterval(() => {
            step++;
            if (step >= steps) {
                element.textContent = targetValue.toLocaleString();
                clearInterval(interval);
            } else {
                element.textContent = Math.floor(currentValue + stepValue * step).toLocaleString();
            }
        }, 30);
    }

    // Combo display
    let comboTimeout = null;
    function showCombo(combo) {
        if (combo < 2) {
            elements.comboDisplay.classList.add('hidden');
            return;
        }

        const messages = ['', '', 'COMBO x2!', 'COMBO x3!', 'AMAZING x4!', 'INCREDIBLE x5!', 'LEGENDARY!'];
        const msg = combo < messages.length ? messages[combo] : `GODLIKE x${combo}!`;

        elements.comboText.textContent = msg;
        elements.comboDisplay.classList.remove('hidden');
        elements.comboDisplay.classList.add('pop');
        setTimeout(() => elements.comboDisplay.classList.remove('pop'), 300);

        if (comboTimeout) clearTimeout(comboTimeout);
        comboTimeout = setTimeout(() => {
            elements.comboDisplay.classList.add('hidden');
        }, 2000);
    }

    // Game Callbacks
    game.onScoreChange = function(score, best) {
        animateScore(elements.currentScore, score);
        animateScore(elements.bestScore, best);
    };

    game.onCombo = function(combo, lines) {
        showCombo(combo);
    };

    game.onLineClear = function(cleared) {
        if (renderer) {
            renderer.triggerLineClear(cleared);
        }
    };

    game.onBlockPlace = function(block, row, col) {
        // Score popup at placed position
    };

    game.onTrayUpdate = function(trayBlocks) {
        if (renderer) {
            renderer.renderTray();
        }
    };

    game.onGameOver = function(stats) {
        setTimeout(() => {
            elements.finalScoreValue.textContent = stats.score.toLocaleString();
            elements.maxCombo.textContent = stats.maxCombo.toString();
            elements.linesCleared.textContent = stats.linesCleared.toString();

            if (stats.isNewRecord) {
                elements.newRecord.classList.remove('hidden');
            } else {
                elements.newRecord.classList.add('hidden');
            }

            showScreen('gameover');
        }, 500);
    };

    // Start Game
    function startGame() {
        game.restart();
        showScreen('game');

        if (!renderer) {
            renderer = new GameRenderer(elements.canvas, game);
        }

        renderer.resize();
        renderer.renderTray();

        elements.currentScore.textContent = '0';
        elements.bestScore.textContent = game.bestScore.toLocaleString();
    }

    // Button Events
    elements.playBtn.addEventListener('click', () => {
        startGame();
    });

    elements.howToPlayBtn.addEventListener('click', () => {
        showScreen('tutorial');
    });

    elements.tutorialBackBtn.addEventListener('click', () => {
        showScreen('start');
    });

    elements.restartBtn.addEventListener('click', () => {
        startGame();
    });

    elements.homeBtn.addEventListener('click', () => {
        elements.startBestScore.textContent = game.bestScore.toLocaleString();
        showScreen('start');
    });

    // Init
    elements.startBestScore.textContent = game.bestScore.toLocaleString();

    // Prevent zoom on double tap
    document.addEventListener('dblclick', e => e.preventDefault());

    // Prevent context menu
    document.addEventListener('contextmenu', e => e.preventDefault());

    // Register service worker
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js').catch(() => {});
    }
})();
