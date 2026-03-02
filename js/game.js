/**
 * 연기피해! - 심부름 대작전
 * Core Game Engine
 * 횡스크롤 2D 아케이드 - 담배연기를 피해 목적지까지!
 */

const SmokeRunner = (() => {
    // ── Stage Definitions ──
    const STAGES = [
        { name: '우리 동네', distance: 100, smokerCount: 4, smokerSpeed: 0, smokeSpeed: 1.2, smokeInterval: [2000, 3500], bgColor1: '#87CEEB', bgColor2: '#98D8C8', groundColor: '#8B7355', buildingColors: ['#D4A574','#C4956A','#E8C49A'] },
        { name: '학교 앞 거리', distance: 150, smokerCount: 6, smokerSpeed: 0.3, smokeSpeed: 1.5, smokeInterval: [1500, 3000], bgColor1: '#7EC8E3', bgColor2: '#A8D5BA', groundColor: '#7A6B50', buildingColors: ['#B8860B','#CD853F','#DEB887'] },
        { name: '번화가', distance: 200, smokerCount: 8, smokerSpeed: 0.5, smokeSpeed: 1.8, smokeInterval: [1200, 2500], bgColor1: '#6BB5D9', bgColor2: '#90C4A8', groundColor: '#6B5B45', buildingColors: ['#A0522D','#BC8F8F','#D2B48C'] },
        { name: '공사장 옆길', distance: 250, smokerCount: 10, smokerSpeed: 0.6, smokeSpeed: 2.0, smokeInterval: [1000, 2200], bgColor1: '#5EA3CF', bgColor2: '#80B498', groundColor: '#5C4C3A', buildingColors: ['#8B4513','#A0522D','#CD853F'] },
        { name: '마트 가는 길', distance: 300, smokerCount: 12, smokerSpeed: 0.7, smokeSpeed: 2.2, smokeInterval: [800, 2000], bgColor1: '#5090C0', bgColor2: '#70A488', groundColor: '#4D3D30', buildingColors: ['#6B4226','#8B6914','#A67B5B'] },
    ];

    // ── Game State ──
    let canvas, ctx;
    let gameWidth, gameHeight;
    let gameState = 'idle'; // idle, playing, paused, gameover, stageclear
    let currentStage = 0;
    let totalDistanceTraveled = 0;

    // Player
    let player = { x: 0, y: 0, width: 0, height: 0, vy: 0, targetLane: 1, lane: 1, breath: 100, isHit: false, hitTimer: 0, walkFrame: 0, walkTimer: 0 };
    const LANES = 4;
    let laneHeight = 0;
    let laneStartY = 0;

    // Scroll
    let scrollX = 0;
    let scrollSpeed = 2;
    let stageDistance = 0;
    let stageGoal = 100;

    // Entities
    let smokers = [];
    let smokeParticles = [];
    let buildings = [];
    let clouds = [];
    let decorations = [];
    let destination = null;

    // Input
    let keys = {};
    let moveUp = false;
    let moveDown = false;

    // Timing
    let lastTime = 0;
    let animFrame = 0;

    // Callbacks
    let onGameOver = null;
    let onStageClear = null;
    let onBreathChange = null;
    let onDistanceChange = null;

    // ── Initialize ──
    function init(canvasEl) {
        canvas = canvasEl;
        ctx = canvas.getContext('2d');
        resize();

        // Keyboard
        window.addEventListener('keydown', e => {
            keys[e.key] = true;
            if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === ' ') e.preventDefault();
            if (e.key === 'Escape' && gameState === 'playing') pause();
        });
        window.addEventListener('keyup', e => { keys[e.key] = false; });

        window.addEventListener('resize', resize);
    }

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        gameWidth = rect.width;
        gameHeight = rect.height;
        canvas.width = gameWidth * dpr;
        canvas.height = gameHeight * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        // Calculate lane positions
        const hudHeight = 50;
        const groundHeight = gameHeight * 0.18;
        const playAreaTop = hudHeight;
        const playAreaBottom = gameHeight - groundHeight;
        const playAreaHeight = playAreaBottom - playAreaTop;
        laneHeight = playAreaHeight / LANES;
        laneStartY = playAreaTop;

        if (player) {
            player.width = Math.min(36, gameWidth * 0.08);
            player.height = player.width * 1.6;
            player.x = gameWidth * 0.12;
        }
    }

    // ── Start Game ──
    function startGame(stage = 0) {
        currentStage = stage;
        totalDistanceTraveled = 0;
        startStage();
    }

    function startStage() {
        const stg = STAGES[Math.min(currentStage, STAGES.length - 1)];
        stageGoal = stg.distance;
        stageDistance = 0;
        scrollX = 0;
        scrollSpeed = 2 + currentStage * 0.3;

        // Player reset
        player.lane = 1;
        player.targetLane = 1;
        player.y = getLaneY(1);
        player.breath = 100;
        player.isHit = false;
        player.hitTimer = 0;
        player.walkFrame = 0;
        player.walkTimer = 0;
        player.vy = 0;

        // Clear entities
        smokers = [];
        smokeParticles = [];
        buildings = [];
        clouds = [];
        decorations = [];
        destination = null;

        // Generate buildings
        generateBuildings();
        generateClouds();
        generateDecorations();

        // Generate smokers along the route
        generateSmokers();

        gameState = 'playing';
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }

    function getLaneY(lane) {
        return laneStartY + lane * laneHeight + laneHeight / 2 - player.height / 2;
    }

    // ── Generate World ──
    function generateBuildings() {
        const stg = STAGES[Math.min(currentStage, STAGES.length - 1)];
        const totalWidth = (stageGoal / 100) * gameWidth * 8;
        let bx = -100;
        while (bx < totalWidth + gameWidth) {
            const w = 60 + Math.random() * 80;
            const h = 80 + Math.random() * 120;
            const color = stg.buildingColors[Math.floor(Math.random() * stg.buildingColors.length)];
            buildings.push({ x: bx, width: w, height: h, color, windows: Math.floor(Math.random() * 6) + 2 });
            bx += w + 30 + Math.random() * 80;
        }
    }

    function generateClouds() {
        const totalWidth = (stageGoal / 100) * gameWidth * 8;
        for (let i = 0; i < 15; i++) {
            clouds.push({
                x: Math.random() * totalWidth,
                y: 10 + Math.random() * 40,
                size: 20 + Math.random() * 40,
                speed: 0.1 + Math.random() * 0.3
            });
        }
    }

    function generateDecorations() {
        const totalWidth = (stageGoal / 100) * gameWidth * 8;
        for (let i = 0; i < 20; i++) {
            const type = Math.random() > 0.5 ? 'tree' : 'bush';
            decorations.push({
                x: Math.random() * totalWidth,
                type,
                size: type === 'tree' ? 20 + Math.random() * 15 : 10 + Math.random() * 10
            });
        }
    }

    function generateSmokers() {
        const stg = STAGES[Math.min(currentStage, STAGES.length - 1)];
        const totalScrollDist = (stageGoal / 100) * gameWidth * 6;
        const count = stg.smokerCount;

        for (let i = 0; i < count; i++) {
            const smokerX = gameWidth + (totalScrollDist / count) * i + Math.random() * (totalScrollDist / count * 0.5);
            const lane = Math.floor(Math.random() * LANES);
            const smokerW = player.width * 1.1;
            const smokerH = player.height * 1.1;

            smokers.push({
                x: smokerX,
                baseX: smokerX,
                y: laneStartY + lane * laneHeight + laneHeight / 2 - smokerH / 2,
                width: smokerW,
                height: smokerH,
                lane,
                moveDir: Math.random() > 0.5 ? 1 : -1,
                moveTimer: 0,
                moveSpeed: stg.smokerSpeed,
                smokeTimer: 0,
                smokeInterval: stg.smokeInterval[0] + Math.random() * (stg.smokeInterval[1] - stg.smokeInterval[0]),
                smokeSpeed: stg.smokeSpeed,
                facing: -1, // facing left (towards player)
                puffing: false,
                puffTimer: 0,
                armAngle: 0,
            });
        }

        // Destination marker
        destination = {
            x: totalScrollDist + gameWidth * 0.8,
            width: 60,
            height: 80
        };
    }

    // ── Game Loop ──
    function gameLoop(timestamp) {
        if (gameState !== 'playing') return;

        const dt = Math.min(timestamp - lastTime, 33.33) / 16.67; // normalize to ~60fps
        lastTime = timestamp;

        update(dt);
        render();

        animFrame = requestAnimationFrame(gameLoop);
    }

    // ── Update ──
    function update(dt) {
        // Input
        const wantUp = keys['ArrowUp'] || keys['w'] || keys['W'] || moveUp;
        const wantDown = keys['ArrowDown'] || keys['s'] || keys['S'] || moveDown;

        if (wantUp && player.targetLane > 0) {
            player.targetLane--;
            keys['ArrowUp'] = false;
            keys['w'] = false;
            keys['W'] = false;
        }
        if (wantDown && player.targetLane < LANES - 1) {
            player.targetLane++;
            keys['ArrowDown'] = false;
            keys['s'] = false;
            keys['S'] = false;
        }

        // Smooth lane movement
        const targetY = getLaneY(player.targetLane);
        const dy = targetY - player.y;
        if (Math.abs(dy) > 1) {
            player.y += dy * 0.15 * dt;
        } else {
            player.y = targetY;
            player.lane = player.targetLane;
        }

        // Walk animation
        player.walkTimer += dt;
        if (player.walkTimer > 6) {
            player.walkTimer = 0;
            player.walkFrame = (player.walkFrame + 1) % 4;
        }

        // Scroll
        scrollX += scrollSpeed * dt;
        stageDistance = (scrollX / (gameWidth * 6)) * stageGoal;

        if (onDistanceChange) {
            onDistanceChange(Math.floor(stageDistance), stageGoal);
        }

        // Hit recovery
        if (player.isHit) {
            player.hitTimer -= dt;
            if (player.hitTimer <= 0) {
                player.isHit = false;
            }
        }

        // Breath recovery when not in smoke
        let inSmoke = false;

        // Update smoke particles
        for (let i = smokeParticles.length - 1; i >= 0; i--) {
            const sp = smokeParticles[i];
            sp.x += sp.vx * dt;
            sp.y += sp.vy * dt;
            sp.life -= dt * 0.8;
            sp.radius += 0.3 * dt;
            sp.alpha = Math.max(0, sp.life / sp.maxLife) * 0.6;

            if (sp.life <= 0) {
                smokeParticles.splice(i, 1);
                continue;
            }

            // Collision with player
            const spScreenX = sp.x - scrollX;
            const px = player.x + player.width / 2;
            const py = player.y + player.height / 2;
            const dist = Math.hypot(spScreenX - px, sp.y - py);
            if (dist < sp.radius + player.width * 0.3) {
                inSmoke = true;
            }
        }

        // Damage/Recovery
        if (inSmoke) {
            player.breath -= 0.4 * dt;
            player.isHit = true;
            player.hitTimer = 10;
        } else {
            player.breath = Math.min(100, player.breath + 0.12 * dt);
        }

        if (onBreathChange) onBreathChange(player.breath);

        if (player.breath <= 0) {
            player.breath = 0;
            gameState = 'gameover';
            if (onGameOver) onGameOver(Math.floor(stageDistance), currentStage);
            return;
        }

        // Update smokers
        smokers.forEach(smoker => {
            const screenX = smoker.x - scrollX;

            // Only active when on screen or nearby
            if (screenX > -200 && screenX < gameWidth + 200) {
                // Smoker movement (pacing)
                if (smoker.moveSpeed > 0) {
                    smoker.moveTimer += dt;
                    if (smoker.moveTimer > 120) {
                        smoker.moveDir *= -1;
                        smoker.moveTimer = 0;
                    }
                    smoker.x += smoker.moveDir * smoker.moveSpeed * dt;
                }

                // Puff animation
                if (smoker.puffing) {
                    smoker.puffTimer -= dt;
                    smoker.armAngle = Math.min(1, smoker.armAngle + 0.05 * dt);
                    if (smoker.puffTimer <= 0) {
                        smoker.puffing = false;
                        smoker.armAngle = 0;
                        // Emit smoke
                        emitSmoke(smoker);
                    }
                } else {
                    smoker.smokeTimer += dt * 16.67;
                    if (smoker.smokeTimer >= smoker.smokeInterval) {
                        smoker.smokeTimer = 0;
                        smoker.puffing = true;
                        smoker.puffTimer = 30;
                    }
                }
            }
        });

        // Clouds
        clouds.forEach(c => { c.x -= c.speed * dt * 0.5; });

        // Check stage clear
        if (destination) {
            const destScreenX = destination.x - scrollX;
            if (player.x + player.width > destScreenX && player.x < destScreenX + destination.width) {
                gameState = 'stageclear';
                const stars = player.breath > 80 ? 3 : player.breath > 50 ? 2 : 1;
                if (onStageClear) onStageClear(currentStage, stars, player.breath);
                return;
            }
        }
    }

    function emitSmoke(smoker) {
        const stg = STAGES[Math.min(currentStage, STAGES.length - 1)];
        const count = 8 + Math.floor(Math.random() * 6);
        const smokeX = smoker.x + (smoker.facing < 0 ? -5 : smoker.width + 5);
        const smokeY = smoker.y + smoker.height * 0.25;

        for (let i = 0; i < count; i++) {
            smokeParticles.push({
                x: smokeX + Math.random() * 10 - 5,
                y: smokeY + Math.random() * 10 - 5,
                vx: smoker.facing * (stg.smokeSpeed + Math.random() * 1.5) * -0.8,
                vy: (Math.random() - 0.5) * 0.8 - 0.2,
                radius: 6 + Math.random() * 4,
                life: 60 + Math.random() * 40,
                maxLife: 100,
                alpha: 0.5,
            });
        }
    }

    // ── Render ──
    function render() {
        const stg = STAGES[Math.min(currentStage, STAGES.length - 1)];

        // Sky gradient
        const skyGrad = ctx.createLinearGradient(0, 0, 0, gameHeight * 0.5);
        skyGrad.addColorStop(0, stg.bgColor1);
        skyGrad.addColorStop(1, stg.bgColor2);
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, gameWidth, gameHeight);

        // Ground
        const groundY = laneStartY + LANES * laneHeight;
        ctx.fillStyle = stg.groundColor;
        ctx.fillRect(0, groundY, gameWidth, gameHeight - groundY);

        // Sidewalk
        ctx.fillStyle = '#C0C0C0';
        ctx.fillRect(0, groundY, gameWidth, 8);
        // Sidewalk pattern
        ctx.strokeStyle = '#A0A0A0';
        ctx.lineWidth = 1;
        for (let sx = -(scrollX * 0.5 % 40); sx < gameWidth; sx += 40) {
            ctx.beginPath();
            ctx.moveTo(sx, groundY);
            ctx.lineTo(sx, groundY + 8);
            ctx.stroke();
        }

        // Clouds
        ctx.fillStyle = 'rgba(255,255,255,0.7)';
        clouds.forEach(c => {
            const cx = c.x - scrollX * 0.2;
            const wrappedX = ((cx % (gameWidth + 200)) + gameWidth + 200) % (gameWidth + 200) - 100;
            drawCloud(wrappedX, c.y, c.size);
        });

        // Buildings (background, parallax)
        buildings.forEach(b => {
            const bx = b.x - scrollX * 0.3;
            if (bx > -b.width && bx < gameWidth + b.width) {
                drawBuilding(bx, laneStartY - b.height * 0.3, b);
            }
        });

        // Lane indicators (subtle)
        ctx.strokeStyle = 'rgba(0,0,0,0.08)';
        ctx.lineWidth = 1;
        ctx.setLineDash([8, 8]);
        for (let i = 1; i < LANES; i++) {
            const ly = laneStartY + i * laneHeight;
            ctx.beginPath();
            ctx.moveTo(0, ly);
            ctx.lineTo(gameWidth, ly);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Decorations
        decorations.forEach(d => {
            const dx = d.x - scrollX * 0.7;
            if (dx > -50 && dx < gameWidth + 50) {
                if (d.type === 'tree') {
                    drawTree(dx, groundY - d.size * 0.5, d.size);
                } else {
                    drawBush(dx, groundY - d.size * 0.3, d.size);
                }
            }
        });

        // Destination
        if (destination) {
            const dx = destination.x - scrollX;
            if (dx > -100 && dx < gameWidth + 100) {
                drawDestination(dx, laneStartY, destination);
            }
        }

        // Smokers
        smokers.forEach(s => {
            const sx = s.x - scrollX;
            if (sx > -100 && sx < gameWidth + 100) {
                drawSmoker(sx, s.y, s);
            }
        });

        // Smoke particles
        smokeParticles.forEach(sp => {
            const spx = sp.x - scrollX;
            if (spx > -50 && spx < gameWidth + 50) {
                ctx.beginPath();
                ctx.arc(spx, sp.y, sp.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(180, 180, 180, ${sp.alpha})`;
                ctx.fill();
            }
        });

        // Player
        drawPlayer(player.x, player.y);

        // Warning indicator when smoke nearby
        if (player.isHit) {
            ctx.save();
            ctx.globalAlpha = 0.15 + Math.sin(Date.now() * 0.01) * 0.1;
            ctx.fillStyle = '#ff0000';
            ctx.fillRect(0, 0, gameWidth, gameHeight);
            ctx.restore();
        }
    }

    // ── Drawing Helpers ──
    function drawPlayer(x, y) {
        ctx.save();

        // Flash when hit
        if (player.isHit && Math.floor(Date.now() / 100) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }

        const w = player.width;
        const h = player.height;
        const cx = x + w / 2;

        // Walk bob
        const bob = Math.sin(player.walkFrame * Math.PI / 2) * 2;

        // Body (backpack kid)
        // Head
        ctx.fillStyle = '#FFD4A8';
        ctx.beginPath();
        ctx.arc(cx, y + h * 0.18 + bob, w * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Hair
        ctx.fillStyle = '#2c1810';
        ctx.beginPath();
        ctx.arc(cx, y + h * 0.13 + bob, w * 0.32, Math.PI, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#222';
        ctx.beginPath();
        ctx.arc(cx + w * 0.1, y + h * 0.17 + bob, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Mouth (worried if hit)
        if (player.isHit) {
            ctx.beginPath();
            ctx.arc(cx + w * 0.08, y + h * 0.24 + bob, 3, 0, Math.PI, true);
            ctx.strokeStyle = '#222';
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        // Body / Shirt
        ctx.fillStyle = '#4A90D9';
        ctx.fillRect(cx - w * 0.22, y + h * 0.32 + bob, w * 0.44, h * 0.28);

        // Backpack
        ctx.fillStyle = '#E8453C';
        ctx.fillRect(cx - w * 0.35, y + h * 0.3 + bob, w * 0.18, h * 0.3);
        // Backpack strap
        ctx.strokeStyle = '#C0382B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - w * 0.2, y + h * 0.32 + bob);
        ctx.lineTo(cx - w * 0.1, y + h * 0.38 + bob);
        ctx.stroke();

        // Legs animation
        const legSwing = Math.sin(player.walkFrame * Math.PI / 2) * 4;
        ctx.fillStyle = '#3D5A80';
        // Left leg
        ctx.fillRect(cx - w * 0.15, y + h * 0.6 + bob, w * 0.12, h * 0.25);
        // Right leg
        ctx.fillRect(cx + w * 0.03, y + h * 0.6 + bob + legSwing, w * 0.12, h * 0.25);

        // Shoes
        ctx.fillStyle = '#F5F5F5';
        ctx.fillRect(cx - w * 0.18, y + h * 0.83 + bob, w * 0.18, h * 0.06);
        ctx.fillRect(cx + w * 0.01, y + h * 0.83 + bob + legSwing, w * 0.18, h * 0.06);

        // Arms
        ctx.fillStyle = '#FFD4A8';
        const armSwing = Math.sin(player.walkFrame * Math.PI / 2) * 6;
        // Left arm
        ctx.fillRect(cx - w * 0.3, y + h * 0.35 + bob - armSwing, w * 0.1, h * 0.2);
        // Right arm
        ctx.fillRect(cx + w * 0.22, y + h * 0.35 + bob + armSwing, w * 0.1, h * 0.2);

        ctx.restore();
    }

    function drawSmoker(x, y, smoker) {
        ctx.save();
        const w = smoker.width;
        const h = smoker.height;
        const cx = x + w / 2;

        // Head
        ctx.fillStyle = '#DDB892';
        ctx.beginPath();
        ctx.arc(cx, y + h * 0.15, w * 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Hair (messy)
        ctx.fillStyle = '#444';
        ctx.beginPath();
        ctx.arc(cx, y + h * 0.1, w * 0.32, Math.PI * 0.8, Math.PI * 2.2);
        ctx.fill();

        // Sunglasses
        ctx.fillStyle = '#111';
        ctx.fillRect(cx - w * 0.2, y + h * 0.12, w * 0.15, w * 0.1);
        ctx.fillRect(cx + w * 0.05, y + h * 0.12, w * 0.15, w * 0.1);
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - w * 0.05, y + h * 0.15);
        ctx.lineTo(cx + w * 0.05, y + h * 0.15);
        ctx.stroke();

        // Body (jacket)
        ctx.fillStyle = '#2C2C2C';
        ctx.fillRect(cx - w * 0.28, y + h * 0.3, w * 0.56, h * 0.32);

        // Pants
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(cx - w * 0.22, y + h * 0.62, w * 0.2, h * 0.26);
        ctx.fillRect(cx + w * 0.02, y + h * 0.62, w * 0.2, h * 0.26);

        // Shoes
        ctx.fillStyle = '#333';
        ctx.fillRect(cx - w * 0.25, y + h * 0.87, w * 0.22, h * 0.06);
        ctx.fillRect(cx + w * 0.03, y + h * 0.87, w * 0.22, h * 0.06);

        // Arm with cigarette
        const armY = y + h * 0.32;
        if (smoker.puffing) {
            // Arm raised to mouth
            ctx.fillStyle = '#DDB892';
            ctx.fillRect(cx + w * 0.25, y + h * 0.15, w * 0.18, w * 0.1);
            // Cigarette at mouth
            ctx.fillStyle = '#F5F5DC';
            ctx.fillRect(cx + w * 0.4, y + h * 0.16, w * 0.2, 3);
            // Cigarette ember
            ctx.fillStyle = '#FF4500';
            ctx.beginPath();
            ctx.arc(cx + w * 0.6, y + h * 0.17, 2, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Arm down with cigarette
            ctx.fillStyle = '#DDB892';
            ctx.fillRect(cx + w * 0.25, armY, w * 0.1, h * 0.18);
            // Cigarette in hand
            ctx.fillStyle = '#F5F5DC';
            ctx.fillRect(cx + w * 0.28, armY + h * 0.18, 3, w * 0.15);
            // Ember
            ctx.fillStyle = '#FF4500';
            ctx.beginPath();
            ctx.arc(cx + w * 0.295, armY + h * 0.18 + w * 0.15, 2, 0, Math.PI * 2);
            ctx.fill();
            // Idle smoke wisps from cigarette
            ctx.fillStyle = 'rgba(180,180,180,0.3)';
            const t = Date.now() * 0.003;
            ctx.beginPath();
            ctx.arc(cx + w * 0.3 + Math.sin(t) * 3, armY + h * 0.12, 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(cx + w * 0.32 + Math.sin(t + 1) * 4, armY + h * 0.06, 4, 0, Math.PI * 2);
            ctx.fill();
        }

        // Left arm (in pocket or hanging)
        ctx.fillStyle = '#2C2C2C';
        ctx.fillRect(cx - w * 0.35, y + h * 0.32, w * 0.1, h * 0.2);

        // Warning zone indicator (subtle red glow)
        ctx.beginPath();
        ctx.arc(cx, y + h * 0.4, w * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,0,0,0.03)';
        ctx.fill();

        ctx.restore();
    }

    function drawDestination(x, topY, dest) {
        const bottomY = laneStartY + LANES * laneHeight;

        // Store front
        ctx.fillStyle = '#FFE4B5';
        ctx.fillRect(x - 10, topY - 20, dest.width + 20, bottomY - topY + 28);

        // Roof
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(x - 15, topY - 30, dest.width + 30, 15);

        // Door
        ctx.fillStyle = '#654321';
        ctx.fillRect(x + dest.width / 2 - 12, bottomY - 40, 24, 40);
        // Door handle
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(x + dest.width / 2 + 7, bottomY - 20, 2, 0, Math.PI * 2);
        ctx.fill();

        // Windows
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(x + 5, topY, 18, 18);
        ctx.fillRect(x + dest.width - 23, topY, 18, 18);

        // Sign
        ctx.fillStyle = '#4CAF50';
        ctx.fillRect(x + 5, topY - 55, dest.width - 10, 22);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('마 트', x + dest.width / 2, topY - 39);

        // Flag/Arrow indicator
        const bounce = Math.sin(Date.now() * 0.005) * 5;
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.moveTo(x + dest.width / 2, topY - 70 + bounce);
        ctx.lineTo(x + dest.width / 2 - 10, topY - 55 + bounce);
        ctx.lineTo(x + dest.width / 2 + 10, topY - 55 + bounce);
        ctx.closePath();
        ctx.fill();
    }

    function drawBuilding(x, y, b) {
        ctx.fillStyle = b.color;
        const bottomY = laneStartY;
        ctx.fillRect(x, y, b.width, bottomY - y);

        // Windows
        ctx.fillStyle = 'rgba(255,255,200,0.6)';
        const winSize = 8;
        const winGap = 14;
        const cols = Math.floor((b.width - 10) / winGap);
        const rows = Math.floor((bottomY - y - 10) / winGap);
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (Math.random() > 0.3) {
                    ctx.fillRect(x + 8 + c * winGap, y + 8 + r * winGap, winSize, winSize);
                }
            }
        }

        // Roof line
        ctx.fillStyle = 'rgba(0,0,0,0.2)';
        ctx.fillRect(x, y, b.width, 3);
    }

    function drawCloud(x, y, size) {
        ctx.beginPath();
        ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        ctx.arc(x + size * 0.3, y - size * 0.15, size * 0.4, 0, Math.PI * 2);
        ctx.arc(x + size * 0.6, y, size * 0.45, 0, Math.PI * 2);
        ctx.arc(x + size * 0.3, y + size * 0.1, size * 0.35, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawTree(x, y, size) {
        // Trunk
        ctx.fillStyle = '#8B5E3C';
        ctx.fillRect(x - 3, y, 6, size * 0.6);
        // Leaves
        ctx.fillStyle = '#2E8B57';
        ctx.beginPath();
        ctx.arc(x, y - size * 0.1, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3CB371';
        ctx.beginPath();
        ctx.arc(x + 5, y - size * 0.05, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
    }

    function drawBush(x, y, size) {
        ctx.fillStyle = '#228B22';
        ctx.beginPath();
        ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#32CD32';
        ctx.beginPath();
        ctx.arc(x + size * 0.3, y - 2, size * 0.35, 0, Math.PI * 2);
        ctx.fill();
    }

    // ── Controls ──
    function setMoveUp(val) { moveUp = val; }
    function setMoveDown(val) { moveDown = val; }

    function pause() {
        if (gameState === 'playing') {
            gameState = 'paused';
        }
    }

    function resume() {
        if (gameState === 'paused') {
            gameState = 'playing';
            lastTime = performance.now();
            requestAnimationFrame(gameLoop);
        }
    }

    function nextStage() {
        currentStage++;
        totalDistanceTraveled += stageGoal;
        startStage();
    }

    function getStageInfo(stage) {
        const s = stage !== undefined ? stage : currentStage;
        const stg = STAGES[Math.min(s, STAGES.length - 1)];
        return { index: s, name: stg.name, distance: stg.distance };
    }

    function getTotalStages() { return STAGES.length; }
    function getGameState() { return gameState; }

    // ── Public API ──
    return {
        init,
        resize,
        startGame,
        startStage,
        nextStage,
        pause,
        resume,
        setMoveUp,
        setMoveDown,
        getStageInfo,
        getTotalStages,
        getGameState,
        set onGameOver(fn) { onGameOver = fn; },
        set onStageClear(fn) { onStageClear = fn; },
        set onBreathChange(fn) { onBreathChange = fn; },
        set onDistanceChange(fn) { onDistanceChange = fn; },
    };
})();
