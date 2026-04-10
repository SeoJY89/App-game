// Scene class - renders the escape room using PixiJS
class Scene extends PIXI.Container {
  constructor(stageData, gameWidth, gameHeight) {
    super();
    this.data = stageData;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;

    this.hotspotSprites = [];
    this.pulsePhase = 0;

    this._buildBackground();
    this._buildHotspots();
    this._setupFilters();
  }

  _buildBackground() {
    const w = this.gameWidth;
    const h = this.gameHeight;

    // Parse background colors
    const top = this._parseColor(this.data.bgTop || '#2a1a30');
    const bottom = this._parseColor(this.data.bgBottom || '#0a0510');

    // Use canvas-drawn gradient texture for quality
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, this.data.bgTop || '#2a1a30');
    grad.addColorStop(1, this.data.bgBottom || '#0a0510');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Add noise/texture
    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (Math.random() - 0.5) * 18;
      d[i] = Math.max(0, Math.min(255, d[i] + n));
      d[i+1] = Math.max(0, Math.min(255, d[i+1] + n));
      d[i+2] = Math.max(0, Math.min(255, d[i+2] + n));
    }
    ctx.putImageData(imgData, 0, 0);

    // Wall panel stripes (subtle horizontal lines for wood/wall texture)
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Vignette
    const vg = ctx.createRadialGradient(w/2, h/2, w/4, w/2, h/2, w);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, 'rgba(0,0,0,0.65)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, w, h);

    // Ambient lighting (warm glow from top)
    const lg = ctx.createRadialGradient(w * 0.5, h * 0.25, 20, w * 0.5, h * 0.25, w * 0.9);
    lg.addColorStop(0, 'rgba(212,149,106,0.25)');
    lg.addColorStop(0.4, 'rgba(212,149,106,0.08)');
    lg.addColorStop(1, 'rgba(212,149,106,0)');
    ctx.fillStyle = lg;
    ctx.fillRect(0, 0, w, h);

    // Floor suggestion - darker band at bottom
    const fg = ctx.createLinearGradient(0, h * 0.75, 0, h);
    fg.addColorStop(0, 'rgba(0,0,0,0)');
    fg.addColorStop(1, 'rgba(0,0,0,0.6)');
    ctx.fillStyle = fg;
    ctx.fillRect(0, h * 0.75, w, h * 0.25);

    // Horizon line (subtle)
    ctx.strokeStyle = 'rgba(212,149,106,0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.68);
    ctx.lineTo(w, h * 0.68);
    ctx.stroke();

    const texture = PIXI.Texture.from(canvas);
    const bg = new PIXI.Sprite(texture);
    bg.width = w;
    bg.height = h;
    this.addChild(bg);

    // Add floating dust particles using a container
    this.dustContainer = new PIXI.Container();
    this.addChild(this.dustContainer);
    this._dustParticles = [];
    for (let i = 0; i < 30; i++) {
      this._addDust();
    }
  }

  _addDust() {
    const p = new PIXI.Graphics();
    p.beginFill(0xffffff, 0.15 + Math.random() * 0.15);
    p.drawCircle(0, 0, 0.5 + Math.random() * 1.2);
    p.endFill();
    p.x = Math.random() * this.gameWidth;
    p.y = Math.random() * this.gameHeight;
    p.vx = (Math.random() - 0.5) * 3;
    p.vy = -3 - Math.random() * 5;
    p.life = Math.random() * 3 + 2;
    p.age = Math.random() * p.life;
    this.dustContainer.addChild(p);
    this._dustParticles.push(p);
  }

  _buildHotspots() {
    const w = this.gameWidth;
    const h = this.gameHeight;

    for (const hs of this.data.hotspots) {
      const container = new PIXI.Container();
      const cx = hs.x * w;
      const cy = hs.y * h * 0.85 + h * 0.08;
      container.x = cx;
      container.y = cy;

      // Glow background (circle)
      const glow = new PIXI.Graphics();
      glow.beginFill(0xd4956a, 0.12);
      glow.drawCircle(0, 0, 54);
      glow.endFill();
      glow.beginFill(0xd4956a, 0.2);
      glow.drawCircle(0, 0, 42);
      glow.endFill();
      container.addChild(glow);

      // Card background
      const card = new PIXI.Graphics();
      card.lineStyle(1.5, 0xd4956a, 0.5);
      card.beginFill(0x1a0f20, 0.7);
      const cs = 76;
      card.drawRoundedRect(-cs/2, -cs/2, cs, cs, 14);
      card.endFill();
      container.addChild(card);

      // Detailed icon drawing (from icons.js)
      const iconG = new PIXI.Graphics();
      const drawFn = Icons[hs.iconType] || Icons.generic;
      drawFn(iconG, 56);
      container.addChild(iconG);

      // Label
      const labelStyle = new PIXI.TextStyle({
        fontFamily: 'Cinzel',
        fontSize: 11,
        fill: 0xd4956a,
        letterSpacing: 1,
        fontWeight: '600',
        dropShadow: true,
        dropShadowColor: 0x000000,
        dropShadowBlur: 3,
        dropShadowDistance: 1
      });
      const label = new PIXI.Text(hs.label, labelStyle);
      label.anchor.set(0.5, 0);
      label.y = cs/2 + 8;
      container.addChild(label);

      // Make interactive
      container.eventMode = 'static';
      container.cursor = 'pointer';
      container.hotspotData = hs;
      container.glowSprite = glow;
      container.cardSprite = card;

      // Store base Y for hover animation
      container.baseY = cy;

      this.addChild(container);
      this.hotspotSprites.push(container);

      // Entrance animation
      container.alpha = 0;
      container.scale.set(0.7);
      if (typeof gsap !== 'undefined') {
        gsap.to(container, {
          alpha: 1,
          duration: 0.6,
          delay: 0.1 + this.hotspotSprites.length * 0.08,
          ease: 'power2.out'
        });
        gsap.to(container.scale, {
          x: 1, y: 1,
          duration: 0.7,
          delay: 0.1 + this.hotspotSprites.length * 0.08,
          ease: 'back.out(1.6)'
        });
      } else {
        container.alpha = 1;
        container.scale.set(1);
      }
    }
  }

  _setupFilters() {
    const filters = [];
    try {
      if (PIXI.filters && PIXI.filters.AdvancedBloomFilter) {
        filters.push(new PIXI.filters.AdvancedBloomFilter({
          threshold: 0.5,
          bloomScale: 0.6,
          brightness: 1,
          blur: 6,
          quality: 4
        }));
      }
    } catch (e) {
      console.warn('AdvancedBloomFilter not available:', e);
    }

    try {
      if (PIXI.filters && PIXI.filters.NoiseFilter) {
        filters.push(new PIXI.filters.NoiseFilter(0.08, Math.random()));
      }
    } catch (e) {}

    if (filters.length > 0) {
      this.filters = filters;
    }
  }

  update(dt) {
    this.pulsePhase += dt * 1.5;

    // Pulse hotspots gently
    for (const hs of this.hotspotSprites) {
      const p = 0.97 + Math.sin(this.pulsePhase + hs.x * 0.01) * 0.03;
      if (hs.glowSprite) {
        hs.glowSprite.alpha = 0.7 + Math.sin(this.pulsePhase + hs.x * 0.02) * 0.3;
      }
    }

    // Update dust
    for (const p of this._dustParticles) {
      p.age += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.age > p.life || p.y < -10 || p.x < -10 || p.x > this.gameWidth + 10) {
        p.x = Math.random() * this.gameWidth;
        p.y = this.gameHeight + Math.random() * 20;
        p.age = 0;
        p.vy = -3 - Math.random() * 5;
        p.vx = (Math.random() - 0.5) * 3;
      }
    }
  }

  hitTest(px, py) {
    // Use PIXI's built-in hit testing via events, or manual check
    for (let i = this.hotspotSprites.length - 1; i >= 0; i--) {
      const hs = this.hotspotSprites[i];
      const dx = px - hs.x;
      const dy = py - hs.y;
      if (Math.abs(dx) < 42 && Math.abs(dy) < 42) {
        return hs.hotspotData;
      }
    }
    return null;
  }

  pulseHotspot(hotspotId) {
    const hs = this.hotspotSprites.find(s => s.hotspotData.id === hotspotId);
    if (!hs) return;
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(hs.scale, { x: 1, y: 1 }, {
        x: 1.15, y: 1.15,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out'
      });
    }
  }

  _parseColor(hex) {
    const h = hex.replace('#', '');
    return parseInt(h, 16);
  }

  destroy() {
    super.destroy({ children: true });
  }
}
