/**
 * 연기피해! - 심부름 대작전
 * App Controller
 */

(function () {
    'use strict';

    // ── Elements ──
    const $ = id => document.getElementById(id);
    const screens = {
        start: $('start-screen'),
        tutorial: $('tutorial-screen'),
        game: $('game-screen'),
    };

    const bestScoreEl = $('start-best-score');
    const breathFill = $('breath-fill');
    const distanceValue = $('distance-value');
    const distanceLabel = document.querySelector('.distance-label');
    const stageLabel = $('stage-label');
    const stageName = $('stage-name');

    // Overlays
    const stageClearOverlay = $('stage-clear-overlay');
    const gameOverOverlay = $('game-over-overlay');
    const pauseOverlay = $('pause-overlay');

    // Best score
    let bestDistance = parseInt(localStorage.getItem('smokerunner-best') || '0', 10);

    // ── Screen Management ──
    function showScreen(name) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[name].classList.add('active');
    }

    function hideAllOverlays() {
        stageClearOverlay.classList.add('hidden');
        gameOverOverlay.classList.add('hidden');
        pauseOverlay.classList.add('hidden');
    }

    // ── Init ──
    function init() {
        updateBestScore();

        // Init game engine
        SmokeRunner.init($('game-canvas'));

        // Draw logo canvas
        drawLogoIcon();

        // ── Game Callbacks ──
        SmokeRunner.onBreathChange = (breath) => {
            breathFill.style.width = breath + '%';
            breathFill.classList.remove('warning', 'danger');
            if (breath < 25) breathFill.classList.add('danger');
            else if (breath < 50) breathFill.classList.add('warning');
        };

        SmokeRunner.onDistanceChange = (dist, goal) => {
            distanceValue.textContent = dist + 'm';
            distanceLabel.textContent = '/ ' + goal + 'm';
        };

        SmokeRunner.onStageClear = (stage, stars, breath) => {
            const info = SmokeRunner.getStageInfo(stage);
            const totalDist = (stage + 1) * info.distance;

            // Stars
            const clearStars = $('clear-stars');
            clearStars.textContent = '';
            for (let i = 0; i < 3; i++) {
                clearStars.textContent += i < stars ? '\u2B50' : '\u2606';
            }

            $('clear-message').textContent = `${info.name} 통과! 남은 숨참기: ${Math.floor(breath)}%`;

            // Update best
            if (totalDist > bestDistance) {
                bestDistance = totalDist;
                localStorage.setItem('smokerunner-best', bestDistance.toString());
            }

            stageClearOverlay.classList.remove('hidden');
        };

        SmokeRunner.onGameOver = (dist, stage) => {
            const info = SmokeRunner.getStageInfo(stage);
            const totalDist = stage * info.distance + dist;

            $('gameover-distance').textContent = `${info.name}에서 쓰러졌어요...`;
            $('stat-distance').textContent = totalDist + 'm';
            $('stat-stages').textContent = stage.toString();

            if (totalDist > bestDistance) {
                bestDistance = totalDist;
                localStorage.setItem('smokerunner-best', bestDistance.toString());
            }
            updateBestScore();

            gameOverOverlay.classList.remove('hidden');
        };

        // ── Button Events ──
        $('play-btn').addEventListener('click', startGame);
        $('how-to-play-btn').addEventListener('click', () => showScreen('tutorial'));
        $('tutorial-back-btn').addEventListener('click', () => showScreen('start'));

        $('next-stage-btn').addEventListener('click', () => {
            hideAllOverlays();
            const nextInfo = SmokeRunner.getStageInfo(SmokeRunner.getStageInfo().index + 1);
            stageLabel.textContent = `Stage ${nextInfo.index + 1}`;
            stageName.textContent = nextInfo.name;
            SmokeRunner.nextStage();
        });

        $('retry-btn').addEventListener('click', () => {
            hideAllOverlays();
            startGame();
        });

        $('home-btn').addEventListener('click', () => {
            hideAllOverlays();
            showScreen('start');
            updateBestScore();
        });

        $('resume-btn').addEventListener('click', () => {
            pauseOverlay.classList.add('hidden');
            SmokeRunner.resume();
        });

        $('quit-btn').addEventListener('click', () => {
            hideAllOverlays();
            showScreen('start');
            updateBestScore();
        });

        // ── Mobile Controls ──
        const btnUp = $('btn-up');
        const btnDown = $('btn-down');

        // Touch events for mobile buttons
        btnUp.addEventListener('touchstart', e => { e.preventDefault(); SmokeRunner.setMoveUp(true); });
        btnUp.addEventListener('touchend', e => { e.preventDefault(); SmokeRunner.setMoveUp(false); });
        btnDown.addEventListener('touchstart', e => { e.preventDefault(); SmokeRunner.setMoveDown(true); });
        btnDown.addEventListener('touchend', e => { e.preventDefault(); SmokeRunner.setMoveDown(false); });

        // Mouse fallback for testing
        btnUp.addEventListener('mousedown', () => SmokeRunner.setMoveUp(true));
        btnUp.addEventListener('mouseup', () => SmokeRunner.setMoveUp(false));
        btnDown.addEventListener('mousedown', () => SmokeRunner.setMoveDown(true));
        btnDown.addEventListener('mouseup', () => SmokeRunner.setMoveDown(false));

        // Swipe controls on game canvas
        let touchStartY = 0;
        const gameCanvas = $('game-canvas');
        gameCanvas.addEventListener('touchstart', e => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        gameCanvas.addEventListener('touchend', e => {
            const touchEndY = e.changedTouches[0].clientY;
            const dy = touchEndY - touchStartY;
            if (Math.abs(dy) > 20) {
                if (dy < 0) {
                    // Swipe up
                    SmokeRunner.setMoveUp(true);
                    setTimeout(() => SmokeRunner.setMoveUp(false), 50);
                } else {
                    // Swipe down
                    SmokeRunner.setMoveDown(true);
                    setTimeout(() => SmokeRunner.setMoveDown(false), 50);
                }
            }
        }, { passive: true });

        // Pause on visibility change
        document.addEventListener('visibilitychange', () => {
            if (document.hidden && SmokeRunner.getGameState() === 'playing') {
                SmokeRunner.pause();
                pauseOverlay.classList.remove('hidden');
            }
        });

        // ESC for pause
        window.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                if (SmokeRunner.getGameState() === 'playing') {
                    SmokeRunner.pause();
                    pauseOverlay.classList.remove('hidden');
                } else if (SmokeRunner.getGameState() === 'paused') {
                    pauseOverlay.classList.add('hidden');
                    SmokeRunner.resume();
                }
            }
        });
    }

    function startGame() {
        hideAllOverlays();
        showScreen('game');

        SmokeRunner.resize();

        const info = SmokeRunner.getStageInfo(0);
        stageLabel.textContent = 'Stage 1';
        stageName.textContent = info.name;
        breathFill.style.width = '100%';
        breathFill.classList.remove('warning', 'danger');
        distanceValue.textContent = '0m';

        SmokeRunner.startGame(0);
    }

    function updateBestScore() {
        bestScoreEl.textContent = bestDistance + 'm';
    }

    function drawLogoIcon() {
        const c = $('logo-canvas');
        if (!c) return;
        const cx = c.getContext('2d');
        const size = 120;

        // Background circle
        cx.fillStyle = '#87CEEB';
        cx.beginPath();
        cx.arc(60, 60, 55, 0, Math.PI * 2);
        cx.fill();

        // Kid
        // Head
        cx.fillStyle = '#FFD4A8';
        cx.beginPath();
        cx.arc(45, 35, 12, 0, Math.PI * 2);
        cx.fill();
        // Hair
        cx.fillStyle = '#2c1810';
        cx.beginPath();
        cx.arc(45, 32, 13, Math.PI, Math.PI * 2);
        cx.fill();
        // Body
        cx.fillStyle = '#4A90D9';
        cx.fillRect(38, 47, 14, 18);
        // Backpack
        cx.fillStyle = '#E8453C';
        cx.fillRect(32, 46, 8, 16);
        // Legs
        cx.fillStyle = '#3D5A80';
        cx.fillRect(39, 65, 5, 14);
        cx.fillRect(47, 65, 5, 14);

        // Smoke clouds
        cx.fillStyle = 'rgba(150,150,150,0.5)';
        cx.beginPath();
        cx.arc(80, 40, 10, 0, Math.PI * 2);
        cx.arc(90, 35, 8, 0, Math.PI * 2);
        cx.arc(85, 50, 12, 0, Math.PI * 2);
        cx.arc(95, 45, 9, 0, Math.PI * 2);
        cx.fill();

        // Cigarette icon
        cx.fillStyle = '#F5F5DC';
        cx.fillRect(72, 55, 15, 3);
        cx.fillStyle = '#FF4500';
        cx.beginPath();
        cx.arc(72, 56.5, 2.5, 0, Math.PI * 2);
        cx.fill();

        // Ground
        cx.fillStyle = '#7DB87D';
        cx.fillRect(5, 82, 110, 30);
    }

    // Start
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
