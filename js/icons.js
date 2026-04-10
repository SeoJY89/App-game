// Detailed PIXI.Graphics-based icon renderer
// Each icon draws a stylized vector illustration of the object.

const Icons = {
  // Draw a framed painting on wall
  painting(g, size) {
    const w = size, h = size * 0.85;
    const x = -w/2, y = -h/2;

    // outer frame - gold
    g.lineStyle(0);
    g.beginFill(0x8f5f3a);
    g.drawRoundedRect(x - 3, y - 3, w + 6, h + 6, 3);
    g.endFill();

    // inner frame
    g.beginFill(0xd4956a);
    g.drawRoundedRect(x, y, w, h, 2);
    g.endFill();

    // canvas inside
    g.beginFill(0x2a3648);
    g.drawRect(x + 5, y + 5, w - 10, h - 10);
    g.endFill();

    // abstract painting - moon/landscape
    g.beginFill(0x4a5868);
    g.drawRect(x + 5, y + 5, w - 10, (h - 10) * 0.55);
    g.endFill();

    g.beginFill(0xf5e6a8, 0.9);
    g.drawCircle(0, y + h * 0.25, size * 0.1);
    g.endFill();

    // mountains
    g.beginFill(0x1a2535);
    g.moveTo(x + 5, y + h * 0.55);
    g.lineTo(x + w * 0.35, y + h * 0.3);
    g.lineTo(x + w * 0.55, y + h * 0.45);
    g.lineTo(x + w * 0.75, y + h * 0.25);
    g.lineTo(x + w - 5, y + h * 0.5);
    g.lineTo(x + w - 5, y + h * 0.55);
    g.lineTo(x + 5, y + h * 0.55);
    g.closePath();
    g.endFill();

    // ground
    g.beginFill(0x1a0f15);
    g.drawRect(x + 5, y + h * 0.55, w - 10, h * 0.4 - 5);
    g.endFill();
  },

  // Wall clock
  clock(g, size) {
    const r = size / 2;

    // outer ring
    g.lineStyle(4, 0x8f5f3a);
    g.beginFill(0xd4956a);
    g.drawCircle(0, 0, r);
    g.endFill();

    // face
    g.lineStyle(0);
    g.beginFill(0xf5e6d5);
    g.drawCircle(0, 0, r - 5);
    g.endFill();

    // tick marks
    g.lineStyle(2, 0x2a2030);
    for (let i = 0; i < 12; i++) {
      const a = (Math.PI * 2 * i) / 12 - Math.PI / 2;
      const r1 = r - 8, r2 = r - 12;
      g.moveTo(Math.cos(a) * r1, Math.sin(a) * r1);
      g.lineTo(Math.cos(a) * r2, Math.sin(a) * r2);
    }

    // hour hand (pointing to 9)
    g.lineStyle(3, 0x2a2030);
    g.moveTo(0, 0);
    g.lineTo(-r * 0.45, 0);

    // minute hand (pointing to ~42 = 8:30 area)
    g.lineStyle(2, 0x2a2030);
    g.moveTo(0, 0);
    g.lineTo(r * 0.3, r * 0.55);

    // center dot
    g.lineStyle(0);
    g.beginFill(0x2a2030);
    g.drawCircle(0, 0, 3);
    g.endFill();
  },

  // Bookshelf
  bookshelf(g, size) {
    const w = size * 1.1, h = size;
    const x = -w/2, y = -h/2;

    // frame
    g.lineStyle(0);
    g.beginFill(0x4a2f1f);
    g.drawRect(x, y, w, h);
    g.endFill();

    // shelf lines
    g.beginFill(0x3a2418);
    g.drawRect(x, y + h * 0.33 - 2, w, 4);
    g.drawRect(x, y + h * 0.66 - 2, w, 4);
    g.endFill();

    // books - top shelf
    const bookColors = [0xc44040, 0x5a7fc4, 0xf1c40f, 0x5a9848, 0xa060c4];
    const bookH = h * 0.3;
    let bx = x + 3;
    for (let i = 0; i < 5; i++) {
      const bw = (w - 8) / 5 - 1;
      g.beginFill(bookColors[i]);
      g.drawRoundedRect(bx, y + h * 0.02, bw, bookH, 1);
      g.endFill();
      // stripe
      g.beginFill(0, 0.3);
      g.drawRect(bx, y + h * 0.15, bw, 1);
      g.endFill();
      bx += bw + 1;
    }

    // middle shelf
    bx = x + 3;
    for (let i = 0; i < 4; i++) {
      const bw = (w - 8) / 4 - 1;
      g.beginFill(bookColors[(i + 2) % 5]);
      g.drawRoundedRect(bx, y + h * 0.35, bw, bookH, 1);
      g.endFill();
      bx += bw + 1;
    }

    // bottom shelf
    bx = x + 3;
    for (let i = 0; i < 3; i++) {
      const bw = (w - 8) / 3 - 1;
      g.beginFill(bookColors[(i + 4) % 5]);
      g.drawRoundedRect(bx, y + h * 0.68, bw, bookH, 1);
      g.endFill();
      bx += bw + 1;
    }
  },

  // Drawer (wooden)
  drawer(g, size) {
    const w = size * 1.1, h = size * 0.75;
    const x = -w/2, y = -h/2;

    // body
    g.lineStyle(2, 0x3a2418);
    g.beginFill(0x6b4220);
    g.drawRoundedRect(x, y, w, h, 4);
    g.endFill();

    // wood grain
    g.lineStyle(1, 0x3a2418, 0.4);
    for (let i = 1; i < 4; i++) {
      g.moveTo(x + 4, y + (h / 4) * i);
      g.lineTo(x + w - 4, y + (h / 4) * i);
    }

    // handle
    g.lineStyle(0);
    g.beginFill(0xd4a850);
    g.drawRoundedRect(-8, -3, 16, 6, 2);
    g.endFill();

    // keyhole
    g.beginFill(0x1a0f10);
    g.drawCircle(0, h * 0.3, 3);
    g.drawRect(-1, h * 0.3, 2, 5);
    g.endFill();
  },

  // Door
  door(g, size) {
    const w = size * 0.7, h = size * 1.2;
    const x = -w/2, y = -h/2;

    // frame
    g.lineStyle(3, 0x3a2418);
    g.beginFill(0x6b4220);
    g.drawRoundedRect(x, y, w, h, 2);
    g.endFill();

    // panels
    g.lineStyle(2, 0x3a2418);
    g.beginFill(0x7a4f28);
    g.drawRoundedRect(x + 4, y + 4, w - 8, h * 0.4, 1);
    g.drawRoundedRect(x + 4, y + h * 0.5, w - 8, h * 0.45, 1);
    g.endFill();

    // handle
    g.lineStyle(0);
    g.beginFill(0xd4a850);
    g.drawCircle(w * 0.35, 0, 4);
    g.endFill();
    g.beginFill(0xf5e6a8);
    g.drawCircle(w * 0.35 - 1, -1, 1.5);
    g.endFill();
  },

  // Bed
  bed(g, size) {
    const w = size * 1.2, h = size * 0.8;
    const x = -w/2, y = -h/2;

    // headboard
    g.lineStyle(0);
    g.beginFill(0x4a3020);
    g.drawRoundedRect(x, y, w * 0.12, h, 3);
    g.endFill();

    // mattress
    g.beginFill(0xe8d8c0);
    g.drawRoundedRect(x + w * 0.12, y + h * 0.15, w * 0.88, h * 0.7, 4);
    g.endFill();

    // shadow
    g.beginFill(0xa08870, 0.5);
    g.drawRoundedRect(x + w * 0.12, y + h * 0.75, w * 0.88, h * 0.1, 2);
    g.endFill();

    // pillow
    g.beginFill(0xf5ebd5);
    g.drawRoundedRect(x + w * 0.18, y + h * 0.2, w * 0.22, h * 0.35, 4);
    g.endFill();

    // blanket pattern
    g.lineStyle(1, 0x6a5548, 0.3);
    for (let i = 0; i < 3; i++) {
      g.moveTo(x + w * 0.45, y + h * 0.25 + i * 15);
      g.lineTo(x + w - 4, y + h * 0.25 + i * 15);
    }
  },

  // Mirror
  mirror(g, size) {
    const w = size * 0.7, h = size * 1.1;

    // frame
    g.lineStyle(0);
    g.beginFill(0xd4a850);
    g.drawEllipse(0, 0, w/2 + 4, h/2 + 4);
    g.endFill();
    g.beginFill(0x8f6530);
    g.drawEllipse(0, 0, w/2 + 2, h/2 + 2);
    g.endFill();

    // glass
    g.beginFill(0x3a4858);
    g.drawEllipse(0, 0, w/2, h/2);
    g.endFill();

    // reflection highlights
    g.beginFill(0xe8e8f0, 0.35);
    g.drawEllipse(-w * 0.15, -h * 0.2, w * 0.15, h * 0.15);
    g.endFill();

    g.lineStyle(1, 0xffffff, 0.4);
    g.moveTo(-w * 0.2, -h * 0.35);
    g.lineTo(w * 0.25, h * 0.35);
    g.moveTo(-w * 0.05, -h * 0.35);
    g.lineTo(w * 0.35, h * 0.1);
  },

  // Book (single)
  book(g, size) {
    const w = size * 0.75, h = size * 1.05;
    const x = -w/2, y = -h/2;

    // spine shadow
    g.lineStyle(0);
    g.beginFill(0x1a0f15);
    g.drawRoundedRect(x - 2, y + 2, w + 4, h, 2);
    g.endFill();

    // cover
    g.beginFill(0x8f3040);
    g.drawRoundedRect(x, y, w, h, 2);
    g.endFill();

    // spine
    g.beginFill(0x6a2030);
    g.drawRect(x, y, 4, h);
    g.endFill();

    // decoration
    g.lineStyle(1, 0xd4a850);
    g.drawRect(x + 6, y + 6, w - 12, h - 12);

    g.lineStyle(0);
    g.beginFill(0xd4a850);
    g.drawCircle(0, -h * 0.1, 5);
    g.endFill();
    g.beginFill(0x8f3040);
    g.drawCircle(0, -h * 0.1, 2);
    g.endFill();
  },

  // Jewelry box
  box(g, size) {
    const w = size, h = size * 0.75;
    const x = -w/2, y = -h/2;

    // base
    g.lineStyle(2, 0x3a2418);
    g.beginFill(0x6b4220);
    g.drawRoundedRect(x, y + h * 0.25, w, h * 0.75, 3);
    g.endFill();

    // lid
    g.beginFill(0x7a4f28);
    g.drawRoundedRect(x, y, w, h * 0.35, 3);
    g.endFill();

    // gold trim
    g.lineStyle(0);
    g.beginFill(0xd4a850);
    g.drawRect(x, y + h * 0.32, w, 3);
    g.endFill();

    // lock - medal slot
    g.beginFill(0x1a0f10);
    g.drawCircle(0, h * 0.1, 5);
    g.endFill();
    g.beginFill(0xd4a850);
    g.drawCircle(0, h * 0.1, 3);
    g.endFill();

    // corner decorations
    g.beginFill(0xd4a850);
    g.drawCircle(x + 5, y + 5, 2);
    g.drawCircle(x + w - 5, y + 5, 2);
    g.drawCircle(x + 5, y + h - 5, 2);
    g.drawCircle(x + w - 5, y + h - 5, 2);
    g.endFill();
  },

  // Test tubes
  tubes(g, size) {
    const w = size, h = size;
    // rack
    g.lineStyle(0);
    g.beginFill(0x4a2f1f);
    g.drawRoundedRect(-w/2, h * 0.3, w, 6, 2);
    g.drawRoundedRect(-w/2, h * 0.45, w, 4, 1);
    g.endFill();

    const colors = [0xe94560, 0x7ec97f, 0x5a7fc4, 0xf1c40f];
    const tw = 10;
    for (let i = 0; i < 4; i++) {
      const tx = -w/2 + 8 + i * 14;
      // tube
      g.lineStyle(1.5, 0xe8e8e8, 0.7);
      g.beginFill(0xffffff, 0.1);
      g.moveTo(tx, -h * 0.4);
      g.lineTo(tx, h * 0.35);
      g.lineTo(tx + tw, h * 0.35);
      g.lineTo(tx + tw, -h * 0.4);
      g.endFill();
      // liquid
      g.lineStyle(0);
      g.beginFill(colors[i], 0.85);
      g.drawRect(tx + 1, h * 0.05, tw - 2, h * 0.28);
      g.endFill();
      // shine
      g.beginFill(0xffffff, 0.3);
      g.drawRect(tx + 2, h * 0.08, 1, h * 0.23);
      g.endFill();
    }
  },

  // Cabinet
  cabinet(g, size) {
    const w = size, h = size * 1.1;
    const x = -w/2, y = -h/2;

    // body
    g.lineStyle(2, 0x3a2418);
    g.beginFill(0x5a3820);
    g.drawRoundedRect(x, y, w, h, 3);
    g.endFill();

    // doors
    g.beginFill(0x6b4220);
    g.drawRoundedRect(x + 3, y + 3, w/2 - 5, h - 6, 2);
    g.drawRoundedRect(x + w/2 + 2, y + 3, w/2 - 5, h - 6, 2);
    g.endFill();

    // handles
    g.lineStyle(0);
    g.beginFill(0xd4a850);
    g.drawCircle(x + w * 0.35, 0, 2.5);
    g.drawCircle(x + w * 0.65, 0, 2.5);
    g.endFill();
  },

  // Desk
  desk(g, size) {
    const w = size * 1.2, h = size * 0.7;
    const x = -w/2, y = -h/2;

    // top
    g.lineStyle(0);
    g.beginFill(0x6b4220);
    g.drawRoundedRect(x, y, w, 8, 1);
    g.endFill();

    // drawer area
    g.beginFill(0x5a3820);
    g.drawRect(x, y + 8, w, h * 0.6);
    g.endFill();

    // drawer line
    g.lineStyle(1, 0x3a2418);
    g.moveTo(x, y + h * 0.5);
    g.lineTo(x + w, y + h * 0.5);

    // drawer handles
    g.lineStyle(0);
    g.beginFill(0xd4a850);
    g.drawRect(-6, y + h * 0.3, 12, 2);
    g.drawRect(-6, y + h * 0.7, 12, 2);
    g.endFill();

    // legs
    g.beginFill(0x3a2418);
    g.drawRect(x + 2, y + h * 0.85, 4, h * 0.15);
    g.drawRect(x + w - 6, y + h * 0.85, 4, h * 0.15);
    g.endFill();
  },

  // Dark wall / crumbling wall
  darkwall(g, size) {
    const w = size, h = size;
    const x = -w/2, y = -h/2;

    g.lineStyle(0);
    g.beginFill(0x0a0508);
    g.drawRoundedRect(x, y, w, h, 2);
    g.endFill();

    // crack lines
    g.lineStyle(1, 0x2a1f30, 0.6);
    g.moveTo(x + w * 0.2, y + 5);
    g.lineTo(x + w * 0.3, y + h * 0.5);
    g.lineTo(x + w * 0.15, y + h * 0.8);

    g.moveTo(x + w * 0.7, y + 5);
    g.lineTo(x + w * 0.6, y + h * 0.4);

    // "?" mystery mark
    const style = new PIXI.TextStyle({
      fontFamily: 'Cinzel',
      fontSize: size * 0.5,
      fill: 0x2a1f30,
      fontWeight: '700'
    });
    const txt = new PIXI.Text('?', style);
    txt.anchor.set(0.5);
    g.addChild(txt);
  },

  // Globe
  globe(g, size) {
    const r = size / 2.2;

    // stand
    g.lineStyle(0);
    g.beginFill(0x4a2f1f);
    g.drawRoundedRect(-12, r, 24, 4, 1);
    g.drawRect(-2, r * 0.7, 4, r * 0.3);
    g.endFill();

    // sphere
    g.lineStyle(2, 0xd4a850);
    g.beginFill(0x2a4858);
    g.drawCircle(0, 0, r);
    g.endFill();

    // continents (simplified)
    g.lineStyle(0);
    g.beginFill(0x7ec97f);
    // top-left
    g.drawEllipse(-r * 0.4, -r * 0.25, r * 0.35, r * 0.25);
    // right
    g.drawEllipse(r * 0.3, 0, r * 0.3, r * 0.35);
    // bottom
    g.drawEllipse(-r * 0.15, r * 0.4, r * 0.25, r * 0.15);
    g.endFill();

    // meridian lines
    g.lineStyle(1, 0xf5e6a8, 0.3);
    g.moveTo(0, -r);
    g.lineTo(0, r);
    g.drawEllipse(0, 0, r * 0.6, r);

    // highlight
    g.lineStyle(0);
    g.beginFill(0xffffff, 0.2);
    g.drawEllipse(-r * 0.35, -r * 0.45, r * 0.25, r * 0.15);
    g.endFill();
  },

  // Candle
  candle(g, size) {
    const w = size * 0.55, h = size;
    const x = -w/2, y = -h/2;

    // holder base
    g.lineStyle(0);
    g.beginFill(0x8f6530);
    g.drawRoundedRect(x - 4, y + h * 0.85, w + 8, 6, 2);
    g.endFill();
    g.beginFill(0xd4a850);
    g.drawRoundedRect(x - 2, y + h * 0.8, w + 4, 5, 1);
    g.endFill();

    // candle body
    g.beginFill(0xf5e6d5);
    g.drawRoundedRect(x, y + h * 0.15, w, h * 0.65, 2);
    g.endFill();
    g.beginFill(0xd4a890, 0.4);
    g.drawRect(x + w * 0.7, y + h * 0.15, w * 0.3, h * 0.65);
    g.endFill();

    // wick
    g.lineStyle(1.5, 0x2a1a10);
    g.moveTo(0, y + h * 0.15);
    g.lineTo(0, y + h * 0.08);

    // flame
    g.lineStyle(0);
    g.beginFill(0xff8040, 0.9);
    g.moveTo(0, y + h * 0.08);
    g.quadraticCurveTo(-5, y + h * 0.02, 0, y - h * 0.05);
    g.quadraticCurveTo(5, y + h * 0.02, 0, y + h * 0.08);
    g.endFill();
    g.beginFill(0xffd060, 0.8);
    g.moveTo(0, y + h * 0.08);
    g.quadraticCurveTo(-3, y + h * 0.04, 0, y - h * 0.02);
    g.quadraticCurveTo(3, y + h * 0.04, 0, y + h * 0.08);
    g.endFill();
  },

  // Chest
  chest(g, size) {
    const w = size * 1.1, h = size * 0.8;
    const x = -w/2, y = -h/2;

    // body
    g.lineStyle(2, 0x3a2418);
    g.beginFill(0x6b4220);
    g.drawRoundedRect(x, y + h * 0.3, w, h * 0.7, 3);
    g.endFill();

    // lid
    g.beginFill(0x7a4f28);
    g.moveTo(x, y + h * 0.3);
    g.quadraticCurveTo(x + w/2, y - 8, x + w, y + h * 0.3);
    g.lineTo(x + w, y + h * 0.35);
    g.lineTo(x, y + h * 0.35);
    g.closePath();
    g.endFill();

    // gold bands
    g.lineStyle(0);
    g.beginFill(0xd4a850);
    g.drawRect(x, y + h * 0.35, w, 3);
    g.drawRect(x + 5, y + h * 0.6, w - 10, 2);
    g.endFill();

    // lock
    g.beginFill(0xd4a850);
    g.drawRect(-6, y + h * 0.25, 12, 14);
    g.endFill();
    g.beginFill(0x1a0f10);
    g.drawCircle(0, y + h * 0.33, 2.5);
    g.drawRect(-1, y + h * 0.33, 2, 4);
    g.endFill();

    // rivets
    g.beginFill(0xd4a850);
    for (let i = 0; i < 4; i++) {
      g.drawCircle(x + 8 + i * (w - 16) / 3, y + h * 0.7, 2);
    }
    g.endFill();
  },

  // Altar / pedestal
  altar(g, size) {
    const w = size, h = size * 0.85;
    const x = -w/2, y = -h/2;

    // base (wide)
    g.lineStyle(0);
    g.beginFill(0x4a4050);
    g.drawRoundedRect(x, y + h * 0.75, w, h * 0.25, 2);
    g.endFill();

    // column
    g.beginFill(0x5a5060);
    g.drawRect(x + w * 0.2, y + h * 0.25, w * 0.6, h * 0.55);
    g.endFill();

    // top
    g.beginFill(0x6a6070);
    g.drawRoundedRect(x + w * 0.1, y + h * 0.1, w * 0.8, h * 0.2, 2);
    g.endFill();

    // mystical glow mark
    g.lineStyle(1.5, 0xd4956a, 0.7);
    g.drawCircle(0, y + h * 0.2, 4);
    g.moveTo(-3, y + h * 0.2);
    g.lineTo(3, y + h * 0.2);
    g.moveTo(0, y + h * 0.17);
    g.lineTo(0, y + h * 0.23);

    // cracks
    g.lineStyle(1, 0x2a2030, 0.5);
    g.moveTo(x + w * 0.3, y + h * 0.4);
    g.lineTo(x + w * 0.35, y + h * 0.7);
  },

  // Notebook
  notebook(g, size) {
    const w = size * 0.8, h = size * 0.95;
    const x = -w/2, y = -h/2;

    // back
    g.lineStyle(0);
    g.beginFill(0x2a1a30);
    g.drawRoundedRect(x + 2, y + 2, w, h, 2);
    g.endFill();

    // front
    g.beginFill(0x5a7fc4);
    g.drawRoundedRect(x, y, w, h, 2);
    g.endFill();

    // binder rings
    g.beginFill(0xd4a850);
    for (let i = 0; i < 3; i++) {
      g.drawCircle(x, y + h * (0.25 + i * 0.25), 2);
    }
    g.endFill();

    // lines
    g.lineStyle(1, 0xffffff, 0.3);
    for (let i = 1; i < 6; i++) {
      g.moveTo(x + 8, y + h * 0.2 + i * h * 0.1);
      g.lineTo(x + w - 5, y + h * 0.2 + i * h * 0.1);
    }

    // title label
    g.lineStyle(0);
    g.beginFill(0xf5e6a8);
    g.drawRoundedRect(x + 8, y + 8, w - 16, 14, 1);
    g.endFill();
  },

  // Diary (similar to notebook but ornate)
  diary(g, size) {
    const w = size * 0.8, h = size * 1;
    const x = -w/2, y = -h/2;

    // cover
    g.lineStyle(2, 0x3a1020);
    g.beginFill(0x6a2030);
    g.drawRoundedRect(x, y, w, h, 3);
    g.endFill();

    // ornate border
    g.lineStyle(1, 0xd4a850);
    g.drawRoundedRect(x + 4, y + 4, w - 8, h - 8, 2);

    // decoration
    g.lineStyle(0);
    g.beginFill(0xd4a850);
    g.drawCircle(0, -h * 0.2, 3);
    g.endFill();
    g.lineStyle(1, 0xd4a850);
    g.moveTo(-8, -h * 0.05);
    g.lineTo(8, -h * 0.05);
    g.moveTo(-5, h * 0.1);
    g.lineTo(5, h * 0.1);

    // strap
    g.lineStyle(0);
    g.beginFill(0xd4a850, 0.5);
    g.drawRect(w/2 - 3, -4, 6, 8);
    g.endFill();
  },

  // Skull
  skull(g, size) {
    const w = size * 0.85, h = size;

    // main cranium
    g.lineStyle(0);
    g.beginFill(0xe8dcc0);
    g.drawEllipse(0, -h * 0.1, w * 0.45, h * 0.4);
    g.endFill();

    // jaw
    g.beginFill(0xe8dcc0);
    g.moveTo(-w * 0.3, h * 0.1);
    g.quadraticCurveTo(0, h * 0.5, w * 0.3, h * 0.1);
    g.lineTo(w * 0.25, 0);
    g.lineTo(-w * 0.25, 0);
    g.closePath();
    g.endFill();

    // teeth
    g.beginFill(0xd8cca0);
    g.drawRect(-w * 0.2, h * 0.08, w * 0.4, h * 0.12);
    g.endFill();
    g.lineStyle(1, 0x6a5040);
    for (let i = 1; i < 5; i++) {
      g.moveTo(-w * 0.2 + i * w * 0.1, h * 0.08);
      g.lineTo(-w * 0.2 + i * w * 0.1, h * 0.2);
    }

    // eye sockets
    g.lineStyle(0);
    g.beginFill(0x1a0510);
    g.drawEllipse(-w * 0.2, -h * 0.15, w * 0.12, h * 0.1);
    g.drawEllipse(w * 0.2, -h * 0.15, w * 0.12, h * 0.1);
    g.endFill();

    // eye glow
    g.beginFill(0xe94560, 0.8);
    g.drawCircle(-w * 0.2, -h * 0.15, 2);
    g.drawCircle(w * 0.2, -h * 0.15, 2);
    g.endFill();

    // nose
    g.beginFill(0x1a0510);
    g.moveTo(0, -h * 0.05);
    g.lineTo(-3, h * 0.03);
    g.lineTo(3, h * 0.03);
    g.closePath();
    g.endFill();

    // cracks
    g.lineStyle(1, 0x8a7560);
    g.moveTo(-w * 0.15, -h * 0.35);
    g.lineTo(-w * 0.05, -h * 0.25);
    g.lineTo(-w * 0.1, -h * 0.18);
  },

  // Star (mystical)
  star(g, size) {
    const r = size / 2;
    // outer glow
    g.lineStyle(0);
    g.beginFill(0xf5e6a8, 0.2);
    g.drawCircle(0, 0, r);
    g.endFill();

    // star shape
    g.beginFill(0xf5e6a8);
    const points = 5;
    for (let i = 0; i < points * 2; i++) {
      const a = (Math.PI * i) / points - Math.PI / 2;
      const pr = i % 2 === 0 ? r * 0.85 : r * 0.35;
      const x = Math.cos(a) * pr;
      const y = Math.sin(a) * pr;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
    g.endFill();

    // inner highlight
    g.beginFill(0xffffff, 0.5);
    for (let i = 0; i < points * 2; i++) {
      const a = (Math.PI * i) / points - Math.PI / 2;
      const pr = i % 2 === 0 ? r * 0.5 : r * 0.2;
      const x = Math.cos(a) * pr;
      const y = Math.sin(a) * pr;
      if (i === 0) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.closePath();
    g.endFill();
  },

  // Moon
  moon(g, size) {
    const r = size / 2.2;

    // outer glow
    g.lineStyle(0);
    g.beginFill(0xe8e8f0, 0.15);
    g.drawCircle(0, 0, r * 1.3);
    g.endFill();

    // main moon
    g.beginFill(0xe8e8f0);
    g.drawCircle(0, 0, r);
    g.endFill();

    // shadow (crescent)
    g.beginFill(0x2a3858);
    g.drawCircle(r * 0.4, 0, r * 0.95);
    g.endFill();

    // craters on visible part
    g.beginFill(0xc8c8d0);
    g.drawCircle(-r * 0.3, -r * 0.2, r * 0.1);
    g.drawCircle(-r * 0.15, r * 0.3, r * 0.08);
    g.drawCircle(-r * 0.4, r * 0.15, r * 0.05);
    g.endFill();
  },

  // Sun
  sun(g, size) {
    const r = size / 2.5;

    // rays
    g.lineStyle(3, 0xf5c040);
    for (let i = 0; i < 12; i++) {
      const a = (Math.PI * 2 * i) / 12;
      g.moveTo(Math.cos(a) * r * 1.2, Math.sin(a) * r * 1.2);
      g.lineTo(Math.cos(a) * r * 1.6, Math.sin(a) * r * 1.6);
    }

    // outer glow
    g.lineStyle(0);
    g.beginFill(0xf5c040, 0.3);
    g.drawCircle(0, 0, r * 1.3);
    g.endFill();

    // main sun
    g.beginFill(0xf5e640);
    g.drawCircle(0, 0, r);
    g.endFill();

    // inner
    g.beginFill(0xfff080);
    g.drawCircle(0, 0, r * 0.7);
    g.endFill();

    // center
    g.beginFill(0xffffff, 0.8);
    g.drawCircle(0, 0, r * 0.4);
    g.endFill();
  },

  // Generic (fallback)
  generic(g, size) {
    g.lineStyle(2, 0xd4956a);
    g.beginFill(0x2a2030);
    g.drawRoundedRect(-size/2, -size/2, size, size, 8);
    g.endFill();
    g.lineStyle(0);
    g.beginFill(0xd4956a);
    g.drawCircle(0, 0, size * 0.15);
    g.endFill();
  }
};
