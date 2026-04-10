// Detailed themed room background renderers
// Each function draws a full scene (wall, floor, decorations, lighting)
// onto a canvas context and returns nothing (mutates ctx).

const Backgrounds = {
  // Dispatch to the appropriate theme renderer
  render(ctx, w, h, theme) {
    const fn = Backgrounds[theme] || Backgrounds.study;
    fn(ctx, w, h);
  },

  // ============================================
  // STUDY - Professor's room with wallpaper, wainscoting, wood floor
  // ============================================
  study(ctx, w, h) {
    const floorY = h * 0.68;
    const wainscotY = h * 0.52;

    // Base wall gradient (deep burgundy)
    const wall = ctx.createLinearGradient(0, 0, 0, floorY);
    wall.addColorStop(0, '#3a1820');
    wall.addColorStop(0.5, '#2a1018');
    wall.addColorStop(1, '#1a0810');
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, w, floorY);

    // Damask wallpaper pattern (diamonds)
    ctx.save();
    ctx.globalAlpha = 0.15;
    ctx.strokeStyle = '#6a3040';
    ctx.lineWidth = 1;
    const dsize = 40;
    for (let y = 0; y < floorY; y += dsize) {
      for (let x = -dsize/2; x < w + dsize; x += dsize) {
        const offsetX = (Math.floor(y / dsize) % 2) * (dsize / 2);
        ctx.beginPath();
        ctx.moveTo(x + offsetX + dsize/2, y);
        ctx.lineTo(x + offsetX + dsize, y + dsize/2);
        ctx.lineTo(x + offsetX + dsize/2, y + dsize);
        ctx.lineTo(x + offsetX, y + dsize/2);
        ctx.closePath();
        ctx.stroke();
      }
    }
    // tiny flourishes
    ctx.fillStyle = '#6a3040';
    for (let y = dsize/2; y < floorY; y += dsize) {
      for (let x = 0; x < w; x += dsize) {
        const offsetX = (Math.floor(y / dsize) % 2) * (dsize / 2);
        ctx.beginPath();
        ctx.arc(x + offsetX, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Wood wainscoting (lower wall panel)
    ctx.save();
    const wainscot = ctx.createLinearGradient(0, wainscotY, 0, floorY);
    wainscot.addColorStop(0, '#3a2015');
    wainscot.addColorStop(1, '#2a1810');
    ctx.fillStyle = wainscot;
    ctx.fillRect(0, wainscotY, w, floorY - wainscotY);
    // Wainscoting panels
    ctx.strokeStyle = '#1a0a05';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, wainscotY);
    ctx.lineTo(w, wainscotY);
    ctx.stroke();
    // Panel divider lines
    const panelW = 80;
    ctx.strokeStyle = '#1a0a05';
    ctx.lineWidth = 1;
    for (let x = panelW; x < w; x += panelW) {
      ctx.beginPath();
      ctx.moveTo(x, wainscotY + 4);
      ctx.lineTo(x, floorY - 4);
      ctx.stroke();
      // inner panel highlight
      ctx.strokeStyle = 'rgba(90,50,25,0.4)';
      ctx.strokeRect(x - panelW + 6, wainscotY + 6, panelW - 12, floorY - wainscotY - 12);
      ctx.strokeStyle = '#1a0a05';
    }
    // Top molding
    ctx.fillStyle = '#4a2a18';
    ctx.fillRect(0, wainscotY - 4, w, 4);
    ctx.fillStyle = '#6a3a28';
    ctx.fillRect(0, wainscotY - 6, w, 2);
    ctx.restore();

    // Wood floor with perspective lines
    ctx.save();
    const floorGrad = ctx.createLinearGradient(0, floorY, 0, h);
    floorGrad.addColorStop(0, '#2a1a0e');
    floorGrad.addColorStop(1, '#0a0502');
    ctx.fillStyle = floorGrad;
    ctx.fillRect(0, floorY, w, h - floorY);

    // Floor plank lines (vanishing toward center)
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 1;
    const vanishX = w / 2;
    const vanishY = floorY - 200;
    for (let i = 0; i < 10; i++) {
      const xStart = (i / 10) * w;
      const xEnd = vanishX + (xStart - vanishX) * 0.3;
      ctx.beginPath();
      ctx.moveTo(xStart, h);
      ctx.lineTo(xEnd, floorY);
      ctx.stroke();
    }
    // Horizontal plank lines
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    for (let i = 1; i < 6; i++) {
      const y = floorY + (h - floorY) * (i / 6);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();

    // Window on left wall
    Backgrounds._drawWindow(ctx, w * 0.08, h * 0.22, w * 0.13, h * 0.22, '#4a5870');

    // Picture frame silhouette on wall (decoration, not interactive)
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = '#3a2015';
    ctx.fillRect(w * 0.52, h * 0.08, w * 0.25, h * 0.1);
    ctx.fillStyle = '#1a0a05';
    ctx.fillRect(w * 0.54, h * 0.09, w * 0.21, h * 0.08);
    ctx.restore();

    // Warm candle sconces on walls (glow)
    Backgrounds._drawCandleSconce(ctx, w * 0.1, h * 0.42);
    Backgrounds._drawCandleSconce(ctx, w * 0.9, h * 0.42);

    // Rug on floor
    ctx.save();
    ctx.globalAlpha = 0.5;
    const rug = ctx.createRadialGradient(w/2, floorY + 50, 20, w/2, floorY + 50, w * 0.4);
    rug.addColorStop(0, '#4a1020');
    rug.addColorStop(0.7, '#2a0510');
    rug.addColorStop(1, 'rgba(42,5,16,0)');
    ctx.fillStyle = rug;
    ctx.fillRect(0, floorY, w, h - floorY);
    ctx.restore();

    // Ambient warm lighting
    Backgrounds._applyAmbient(ctx, w, h, 'rgba(212,149,106,0.2)');
    Backgrounds._applyVignette(ctx, w, h);
  },

  // ============================================
  // BEDROOM - Old bedroom with floral wallpaper, moonlight
  // ============================================
  bedroom(ctx, w, h) {
    const floorY = h * 0.68;

    // Wall: deep purple faded
    const wall = ctx.createLinearGradient(0, 0, 0, floorY);
    wall.addColorStop(0, '#2a1a35');
    wall.addColorStop(0.6, '#1a0f25');
    wall.addColorStop(1, '#0f0515');
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, w, floorY);

    // Floral wallpaper - vertical stripes + flowers
    ctx.save();
    ctx.globalAlpha = 0.2;
    // vertical stripes
    for (let x = 0; x < w; x += 30) {
      ctx.fillStyle = x % 60 === 0 ? '#3a2045' : '#2a1535';
      ctx.fillRect(x, 0, 15, floorY);
    }
    // flower dots
    ctx.globalAlpha = 0.4;
    ctx.fillStyle = '#5a3060';
    for (let y = 30; y < floorY; y += 60) {
      for (let x = 15; x < w; x += 60) {
        // 4-petal flower
        ctx.beginPath();
        ctx.arc(x - 4, y, 2.5, 0, Math.PI * 2);
        ctx.arc(x + 4, y, 2.5, 0, Math.PI * 2);
        ctx.arc(x, y - 4, 2.5, 0, Math.PI * 2);
        ctx.arc(x, y + 4, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.fillStyle = '#7a5080';
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#5a3060';
      }
    }
    ctx.restore();

    // Baseboard
    ctx.fillStyle = '#1a0812';
    ctx.fillRect(0, floorY - 10, w, 10);
    ctx.fillStyle = '#2a1020';
    ctx.fillRect(0, floorY - 12, w, 2);

    // Wood floor
    ctx.save();
    const floor = ctx.createLinearGradient(0, floorY, 0, h);
    floor.addColorStop(0, '#1a0f18');
    floor.addColorStop(1, '#050205');
    ctx.fillStyle = floor;
    ctx.fillRect(0, floorY, w, h - floorY);
    // plank lines
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 7; i++) {
      const y = floorY + (h - floorY) * (i / 7);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();

    // Window with moonlight on right
    Backgrounds._drawWindow(ctx, w * 0.85, h * 0.15, w * 0.14, h * 0.25, '#5a7090', true);

    // Curtain silhouettes
    ctx.save();
    ctx.globalAlpha = 0.6;
    const curt = ctx.createLinearGradient(w * 0.75, 0, w * 0.85, 0);
    curt.addColorStop(0, 'rgba(30,10,25,0.9)');
    curt.addColorStop(1, 'rgba(30,10,25,0)');
    ctx.fillStyle = curt;
    ctx.fillRect(w * 0.72, 0, w * 0.15, h * 0.5);
    // wavy curtain edge
    ctx.fillStyle = 'rgba(40,15,35,0.8)';
    ctx.beginPath();
    ctx.moveTo(w * 0.72, 0);
    for (let y = 0; y < h * 0.5; y += 20) {
      ctx.lineTo(w * 0.78 + Math.sin(y * 0.1) * 4, y);
    }
    ctx.lineTo(w * 0.72, h * 0.5);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Moonlight beam on floor
    ctx.save();
    ctx.globalAlpha = 0.15;
    const beam = ctx.createLinearGradient(w * 0.5, h * 0.4, w * 0.3, h);
    beam.addColorStop(0, 'rgba(150,170,220,0.6)');
    beam.addColorStop(1, 'rgba(150,170,220,0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(w * 0.55, h * 0.4);
    ctx.lineTo(w * 0.72, h * 0.4);
    ctx.lineTo(w * 0.5, h);
    ctx.lineTo(w * 0.25, h);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Cool moonlight ambient
    Backgrounds._applyAmbient(ctx, w, h, 'rgba(100,130,180,0.15)', w * 0.85, h * 0.25);
    Backgrounds._applyVignette(ctx, w, h);
  },

  // ============================================
  // LAB - Dark metal walls with pipes, green lighting
  // ============================================
  lab(ctx, w, h) {
    const floorY = h * 0.68;

    // Dark metal wall
    const wall = ctx.createLinearGradient(0, 0, 0, floorY);
    wall.addColorStop(0, '#1a2530');
    wall.addColorStop(0.5, '#0a1520');
    wall.addColorStop(1, '#050a12');
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, w, floorY);

    // Metal panel grid
    ctx.save();
    ctx.strokeStyle = 'rgba(80,100,120,0.3)';
    ctx.lineWidth = 1;
    const panelSize = 60;
    for (let y = 0; y < floorY; y += panelSize) {
      for (let x = 0; x < w; x += panelSize) {
        ctx.strokeRect(x, y, panelSize, panelSize);
        // rivets at corners
        ctx.fillStyle = 'rgba(40,60,80,0.6)';
        ctx.beginPath();
        ctx.arc(x + 4, y + 4, 1.2, 0, Math.PI * 2);
        ctx.arc(x + panelSize - 4, y + 4, 1.2, 0, Math.PI * 2);
        ctx.arc(x + 4, y + panelSize - 4, 1.2, 0, Math.PI * 2);
        ctx.arc(x + panelSize - 4, y + panelSize - 4, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();

    // Pipes running down the walls
    Backgrounds._drawPipe(ctx, w * 0.02, 0, floorY, '#6a6a70');
    Backgrounds._drawPipe(ctx, w * 0.96, 0, floorY, '#6a6a70');
    Backgrounds._drawPipe(ctx, w * 0.42, 0, h * 0.3, '#4a5a6a');

    // Horizontal pipe
    ctx.save();
    ctx.fillStyle = '#4a5a6a';
    ctx.fillRect(0, h * 0.08, w, 6);
    ctx.fillStyle = '#6a7a8a';
    ctx.fillRect(0, h * 0.08, w, 2);
    // joints
    ctx.fillStyle = '#2a3a4a';
    for (let x = 30; x < w; x += 80) {
      ctx.fillRect(x - 2, h * 0.08 - 2, 4, 10);
    }
    ctx.restore();

    // Warning stripes at top
    ctx.save();
    ctx.globalAlpha = 0.25;
    for (let x = -20; x < w; x += 20) {
      ctx.fillStyle = (Math.floor(x / 20) % 2 === 0) ? '#e0c040' : '#1a1a1a';
      ctx.beginPath();
      ctx.moveTo(x, h * 0.03);
      ctx.lineTo(x + 20, h * 0.03);
      ctx.lineTo(x + 30, h * 0.06);
      ctx.lineTo(x + 10, h * 0.06);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // Tile floor
    ctx.save();
    const floor = ctx.createLinearGradient(0, floorY, 0, h);
    floor.addColorStop(0, '#152025');
    floor.addColorStop(1, '#050a10');
    ctx.fillStyle = floor;
    ctx.fillRect(0, floorY, w, h - floorY);
    // tile grid
    ctx.strokeStyle = 'rgba(80,120,140,0.25)';
    ctx.lineWidth = 1;
    const tile = 50;
    for (let y = floorY; y < h; y += tile) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let x = 0; x < w; x += tile) {
      ctx.beginPath();
      ctx.moveTo(x, floorY);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    ctx.restore();

    // Green fluorescent light strips (top)
    ctx.save();
    ctx.fillStyle = 'rgba(120,255,180,0.08)';
    ctx.fillRect(0, 0, w, 12);
    ctx.fillStyle = 'rgba(120,255,180,0.2)';
    ctx.fillRect(w * 0.15, 4, w * 0.7, 3);
    ctx.restore();

    // Cold greenish ambient
    Backgrounds._applyAmbient(ctx, w, h, 'rgba(80,200,140,0.12)', w/2, h * 0.08);
    Backgrounds._applyVignette(ctx, w, h, 0.7);
  },

  // ============================================
  // LIBRARY - Tall bookshelves, arches, candlelight
  // ============================================
  library(ctx, w, h) {
    const floorY = h * 0.68;

    // Base (dark wood)
    const wall = ctx.createLinearGradient(0, 0, 0, floorY);
    wall.addColorStop(0, '#2a1810');
    wall.addColorStop(0.5, '#1a1008');
    wall.addColorStop(1, '#0f0805');
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, w, floorY);

    // Tall bookshelves covering the walls
    ctx.save();
    ctx.globalAlpha = 0.75;
    // Shelf structure
    const shelfCol = 4;
    const colW = w / shelfCol;
    for (let c = 0; c < shelfCol; c++) {
      const cx = c * colW;
      // side panels (dark wood)
      ctx.fillStyle = '#3a2010';
      ctx.fillRect(cx, 0, 4, floorY);
      ctx.fillRect(cx + colW - 4, 0, 4, floorY);

      // horizontal shelves
      const shelfH = 45;
      for (let y = 15; y < floorY; y += shelfH) {
        ctx.fillStyle = '#2a1810';
        ctx.fillRect(cx + 4, y, colW - 8, 3);

        // books on this shelf
        const bookColors = ['#6a2030', '#2a4a6a', '#5a4a20', '#4a3a50', '#6a4a20', '#2a4a30'];
        let bx = cx + 5;
        while (bx < cx + colW - 8) {
          const bw = 4 + Math.random() * 5;
          const bh = shelfH - 8 - Math.random() * 6;
          ctx.fillStyle = bookColors[Math.floor(Math.random() * bookColors.length)];
          ctx.fillRect(bx, y - bh, bw, bh);
          // spine highlight
          ctx.fillStyle = 'rgba(255,255,255,0.1)';
          ctx.fillRect(bx, y - bh, 1, bh);
          bx += bw + 0.5;
        }
      }
    }
    ctx.restore();

    // Arched top detail
    ctx.save();
    ctx.fillStyle = '#1a0805';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, h * 0.08);
    ctx.quadraticCurveTo(w / 2, -h * 0.02, w, h * 0.08);
    ctx.lineTo(w, 0);
    ctx.closePath();
    ctx.fill();
    // arch highlight
    ctx.strokeStyle = 'rgba(212,149,106,0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.08);
    ctx.quadraticCurveTo(w / 2, -h * 0.02, w, h * 0.08);
    ctx.stroke();
    ctx.restore();

    // Stone floor
    ctx.save();
    const floor = ctx.createLinearGradient(0, floorY, 0, h);
    floor.addColorStop(0, '#252018');
    floor.addColorStop(1, '#0a0805');
    ctx.fillStyle = floor;
    ctx.fillRect(0, floorY, w, h - floorY);
    // stone tiles
    ctx.strokeStyle = 'rgba(255,220,180,0.1)';
    ctx.lineWidth = 1;
    const tile = 60;
    for (let y = floorY; y < h; y += tile * 0.7) {
      for (let x = -tile; x < w + tile; x += tile) {
        const offset = (Math.floor((y - floorY) / (tile * 0.7)) % 2) * (tile / 2);
        ctx.strokeRect(x + offset, y, tile, tile * 0.7);
      }
    }
    ctx.restore();

    // Floor decorative line
    ctx.fillStyle = '#1a0f08';
    ctx.fillRect(0, floorY, w, 4);

    // Candelabras on sides
    Backgrounds._drawCandelabra(ctx, w * 0.08, h * 0.4);
    Backgrounds._drawCandelabra(ctx, w * 0.92, h * 0.4);

    // Warm golden ambient
    Backgrounds._applyAmbient(ctx, w, h, 'rgba(212,149,60,0.18)', w / 2, h * 0.3);
    Backgrounds._applyVignette(ctx, w, h);
  },

  // ============================================
  // FINAL - Mystical obsidian room with runes, ritual circle
  // ============================================
  final(ctx, w, h) {
    const floorY = h * 0.68;

    // Obsidian wall
    const wall = ctx.createLinearGradient(0, 0, 0, floorY);
    wall.addColorStop(0, '#1a0820');
    wall.addColorStop(0.5, '#0f0418');
    wall.addColorStop(1, '#050208');
    ctx.fillStyle = wall;
    ctx.fillRect(0, 0, w, floorY);

    // Stone block pattern
    ctx.save();
    ctx.strokeStyle = 'rgba(80,40,100,0.25)';
    ctx.lineWidth = 1;
    const blockW = 70, blockH = 40;
    for (let y = 0; y < floorY; y += blockH) {
      const offset = (Math.floor(y / blockH) % 2) * (blockW / 2);
      for (let x = -blockW; x < w + blockW; x += blockW) {
        ctx.strokeRect(x + offset, y, blockW, blockH);
      }
    }
    ctx.restore();

    // Glowing runes on walls (mystical symbols)
    ctx.save();
    ctx.shadowColor = '#b845e8';
    ctx.shadowBlur = 10;
    ctx.strokeStyle = '#c565ff';
    ctx.fillStyle = '#c565ff';
    ctx.lineWidth = 2;

    // Rune 1 (left)
    Backgrounds._drawRune(ctx, w * 0.08, h * 0.3, 20);
    Backgrounds._drawRune(ctx, w * 0.92, h * 0.3, 20);
    Backgrounds._drawRune(ctx, w * 0.08, h * 0.5, 18);
    Backgrounds._drawRune(ctx, w * 0.92, h * 0.5, 18);
    ctx.restore();

    // Mystical columns
    ctx.save();
    ctx.fillStyle = '#1a0a20';
    ctx.fillRect(0, 0, w * 0.04, floorY);
    ctx.fillRect(w * 0.96, 0, w * 0.04, floorY);
    // column highlights
    ctx.fillStyle = 'rgba(180,100,220,0.2)';
    ctx.fillRect(w * 0.04 - 2, 0, 2, floorY);
    ctx.fillRect(w * 0.96, 0, 2, floorY);
    ctx.restore();

    // Floor with ritual circle
    ctx.save();
    const floor = ctx.createLinearGradient(0, floorY, 0, h);
    floor.addColorStop(0, '#150820');
    floor.addColorStop(1, '#050208');
    ctx.fillStyle = floor;
    ctx.fillRect(0, floorY, w, h - floorY);

    // Ritual circle
    const rcx = w / 2;
    const rcy = floorY + (h - floorY) * 0.55;
    ctx.strokeStyle = 'rgba(200,100,255,0.5)';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#b845e8';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.ellipse(rcx, rcy, w * 0.35, (h - floorY) * 0.4, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(rcx, rcy, w * 0.28, (h - floorY) * 0.32, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Pentagram inside
    ctx.lineWidth = 1.5;
    const pr = w * 0.25;
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2 / 5) - Math.PI / 2;
      const px = rcx + Math.cos(angle) * pr;
      const py = rcy + Math.sin(angle) * pr * 0.4;
      if (i === 0) ctx.moveTo(px, py);
      const nextIdx = (i + 2) % 5;
      const na = (nextIdx * Math.PI * 2 / 5) - Math.PI / 2;
      ctx.lineTo(rcx + Math.cos(na) * pr, rcy + Math.sin(na) * pr * 0.4);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();

    // Dark mist/fog at top
    ctx.save();
    const fog = ctx.createLinearGradient(0, 0, 0, h * 0.25);
    fog.addColorStop(0, 'rgba(0,0,0,0.6)');
    fog.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, 0, w, h * 0.25);
    ctx.restore();

    // Mystical purple ambient
    Backgrounds._applyAmbient(ctx, w, h, 'rgba(180,80,220,0.15)', w / 2, h * 0.4);
    Backgrounds._applyVignette(ctx, w, h, 0.85);
  },

  // ============================================
  // HELPERS
  // ============================================
  _drawWindow(ctx, x, y, w, h, lightColor, withMoon = false) {
    // frame
    ctx.save();
    ctx.fillStyle = '#1a0a08';
    ctx.fillRect(x - 4, y - 4, w + 8, h + 8);
    ctx.fillStyle = '#2a1810';
    ctx.fillRect(x - 2, y - 2, w + 4, h + 4);
    // glass (sky)
    const sky = ctx.createLinearGradient(x, y, x, y + h);
    sky.addColorStop(0, lightColor);
    sky.addColorStop(1, '#1a1a30');
    ctx.fillStyle = sky;
    ctx.fillRect(x, y, w, h);
    // moon
    if (withMoon) {
      ctx.fillStyle = 'rgba(255,255,230,0.85)';
      ctx.shadowColor = 'rgba(255,255,230,0.8)';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(x + w * 0.65, y + h * 0.25, Math.min(w, h) * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    // cross bars
    ctx.fillStyle = '#1a0a08';
    ctx.fillRect(x, y + h / 2 - 1, w, 2);
    ctx.fillRect(x + w / 2 - 1, y, 2, h);
    // glow around window
    ctx.globalCompositeOperation = 'lighter';
    const glow = ctx.createRadialGradient(x + w/2, y + h/2, 0, x + w/2, y + h/2, Math.max(w, h));
    glow.addColorStop(0, 'rgba(180,200,255,0.15)');
    glow.addColorStop(1, 'rgba(180,200,255,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(x - w, y - h, w * 3, h * 3);
    ctx.restore();
  },

  _drawCandleSconce(ctx, cx, cy) {
    ctx.save();
    // bracket
    ctx.fillStyle = '#3a2010';
    ctx.fillRect(cx - 8, cy, 16, 4);
    ctx.fillRect(cx - 2, cy - 12, 4, 12);
    // candle
    ctx.fillStyle = '#f0e0c0';
    ctx.fillRect(cx - 3, cy - 22, 6, 14);
    // flame glow
    ctx.globalCompositeOperation = 'lighter';
    const glow = ctx.createRadialGradient(cx, cy - 26, 0, cx, cy - 26, 40);
    glow.addColorStop(0, 'rgba(255,200,100,0.9)');
    glow.addColorStop(0.3, 'rgba(255,150,50,0.5)');
    glow.addColorStop(1, 'rgba(255,150,50,0)');
    ctx.fillStyle = glow;
    ctx.fillRect(cx - 40, cy - 66, 80, 80);
    // flame
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#ffd060';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 27, 2.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx, cy - 26, 1.2, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  _drawCandelabra(ctx, cx, cy) {
    ctx.save();
    // stand
    ctx.fillStyle = '#3a2010';
    ctx.fillRect(cx - 1, cy, 2, 40);
    ctx.fillRect(cx - 8, cy + 38, 16, 4);
    // arms
    ctx.strokeStyle = '#3a2010';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 5);
    ctx.quadraticCurveTo(cx - 10, cy, cx - 10, cy - 5);
    ctx.moveTo(cx, cy + 5);
    ctx.quadraticCurveTo(cx + 10, cy, cx + 10, cy - 5);
    ctx.stroke();
    // candles
    for (const off of [-10, 0, 10]) {
      ctx.fillStyle = '#f0e0c0';
      ctx.fillRect(cx + off - 1.5, cy - 16, 3, 12);
      // glow
      ctx.globalCompositeOperation = 'lighter';
      const glow = ctx.createRadialGradient(cx + off, cy - 20, 0, cx + off, cy - 20, 30);
      glow.addColorStop(0, 'rgba(255,200,100,0.7)');
      glow.addColorStop(1, 'rgba(255,150,50,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(cx + off - 30, cy - 50, 60, 60);
      ctx.globalCompositeOperation = 'source-over';
      // flame
      ctx.fillStyle = '#ffd060';
      ctx.beginPath();
      ctx.ellipse(cx + off, cy - 20, 1.5, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  _drawPipe(ctx, x, y1, y2, color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.fillRect(x - 3, y1, 6, y2 - y1);
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.fillRect(x - 3, y1, 1.5, y2 - y1);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(x + 1.5, y1, 1.5, y2 - y1);
    // joints
    ctx.fillStyle = '#2a3040';
    for (let y = y1 + 40; y < y2; y += 80) {
      ctx.fillRect(x - 5, y, 10, 4);
    }
    ctx.restore();
  },

  _drawRune(ctx, cx, cy, size) {
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - size/2, cy - size/2);
    ctx.lineTo(cx + size/2, cy - size/2);
    ctx.moveTo(cx, cy - size/2);
    ctx.lineTo(cx, cy + size/2);
    ctx.moveTo(cx - size/3, cy);
    ctx.lineTo(cx + size/3, cy + size/3);
    ctx.stroke();
    // inner dot
    ctx.beginPath();
    ctx.arc(cx, cy, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  },

  _applyAmbient(ctx, w, h, color, cx = w / 2, cy = h * 0.25) {
    ctx.save();
    const ambient = ctx.createRadialGradient(cx, cy, 20, cx, cy, w);
    ambient.addColorStop(0, color);
    ambient.addColorStop(0.5, color.replace(/[\d.]+\)$/, '0.05)'));
    ambient.addColorStop(1, color.replace(/[\d.]+\)$/, '0)'));
    ctx.fillStyle = ambient;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  },

  _applyVignette(ctx, w, h, strength = 0.6) {
    ctx.save();
    const vg = ctx.createRadialGradient(w/2, h/2, w/4, w/2, h/2, w);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, `rgba(0,0,0,${strength})`);
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
};
