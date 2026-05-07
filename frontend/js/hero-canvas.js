/**
 * Hero Canvas — Matrix rain + typewriter using pretext for precise text measurement.
 * pretext is loaded as a local ESM build; falls back gracefully if unavailable.
 */

// ── Matrix rain ──────────────────────────────────────────────────────────────

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>{}[]|/\\#@$%^&*+=~';
const CJK   = '的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心力理';

function randomChar() {
  return Math.random() < 0.3
    ? CJK[Math.random() * CJK.length | 0]
    : CHARS[Math.random() * CHARS.length | 0];
}

class MatrixRain {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx    = canvas.getContext('2d');
    this.cols   = [];
    this.fontSize = 13;
    this.raf    = null;
    this._resize = this._resize.bind(this);
    this._tick   = this._tick.bind(this);
  }

  start() {
    window.addEventListener('resize', this._resize, { passive: true });
    this._resize();
    this._loop();
  }

  stop() {
    window.removeEventListener('resize', this._resize);
    cancelAnimationFrame(this.raf);
  }

  _resize() {
    const hero = this.canvas.parentElement;
    this.canvas.width  = hero.offsetWidth;
    this.canvas.height = hero.offsetHeight;
    const count = Math.floor(this.canvas.width / this.fontSize);
    // preserve existing columns, add/trim as needed
    while (this.cols.length < count) this.cols.push({ y: Math.random() * -100 | 0, speed: 0.3 + Math.random() * 0.7 });
    this.cols.length = count;
  }

  _loop() {
    let last = 0;
    const fps = 20;
    const step = (ts) => {
      this.raf = requestAnimationFrame(step);
      if (ts - last < 1000 / fps) return;
      last = ts;
      this._tick();
    };
    this.raf = requestAnimationFrame(step);
  }

  _tick() {
    const { ctx, canvas, cols, fontSize } = this;
    // fade trail
    ctx.fillStyle = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-bg').trim() || '#ffffff';
    ctx.globalAlpha = 0.18;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalAlpha = 1;

    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;

    for (let i = 0; i < cols.length; i++) {
      const col = cols[i];
      const x   = i * fontSize;
      const y   = col.y * fontSize;

      // head glyph — bright
      ctx.fillStyle = isDark ? '#a5f3fc' : '#4f46e5';
      ctx.globalAlpha = 0.9;
      ctx.fillText(randomChar(), x, y);

      // body glyph — dim
      ctx.fillStyle = isDark ? '#22d3ee' : '#818cf8';
      ctx.globalAlpha = 0.35;
      ctx.fillText(randomChar(), x, y - fontSize);

      ctx.globalAlpha = 1;

      col.y += col.speed;
      if (y > canvas.height + fontSize * 10) {
        col.y     = -(Math.random() * 20 | 0);
        col.speed = 0.3 + Math.random() * 0.7;
      }
    }
  }
}

// ── Typewriter (pretext-powered) ──────────────────────────────────────────────

/**
 * Measures how many characters of `text` fit within `maxPx` using pretext
 * if available, otherwise falls back to canvas measureText directly.
 */
async function measureFit(text, font, maxPx, pretextMod) {
  if (pretextMod) {
    const { prepareWithSegments, layoutWithLines } = pretextMod;
    const prepared = prepareWithSegments(text, font);
    const { lines } = layoutWithLines(prepared, maxPx, 1);
    // return char count of first line
    return lines.length > 0 ? lines[0].text.length : text.length;
  }
  // fallback
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  ctx.font = font;
  let w = 0, i = 0;
  for (; i < text.length; i++) {
    w += ctx.measureText(text[i]).width;
    if (w > maxPx) break;
  }
  return i;
}

class Typewriter {
  constructor(el, lines, pretextMod) {
    this.el        = el;
    this.lines     = lines;   // array of strings to cycle through
    this.pretext   = pretextMod;
    this.lineIdx   = 0;
    this.charIdx   = 0;
    this.deleting  = false;
    this.timer     = null;
    this.cursor    = document.createElement('span');
    this.cursor.className = 'tw-cursor';
    this.cursor.textContent = '█';
    el.appendChild(this.cursor);
  }

  start() { this._tick(); }

  _tick() {
    const line    = this.lines[this.lineIdx];
    const speed   = this.deleting ? 40 : 90;
    const pause   = this.deleting ? 0  : 1800;

    if (!this.deleting) {
      this.charIdx++;
      this.el.firstChild
        ? (this.el.firstChild.textContent = line.slice(0, this.charIdx))
        : this.el.insertBefore(Object.assign(document.createTextNode(''), { data: line.slice(0, this.charIdx) }), this.cursor);

      if (this.charIdx >= line.length) {
        this.timer = setTimeout(() => { this.deleting = true; this._tick(); }, pause);
        return;
      }
    } else {
      this.charIdx--;
      if (this.el.firstChild && this.el.firstChild !== this.cursor)
        this.el.firstChild.data = line.slice(0, this.charIdx);

      if (this.charIdx <= 0) {
        this.deleting = false;
        this.lineIdx  = (this.lineIdx + 1) % this.lines.length;
        this.timer    = setTimeout(() => this._tick(), 400);
        return;
      }
    }

    this.timer = setTimeout(() => this._tick(), speed + (Math.random() * 40 | 0));
  }

  destroy() { clearTimeout(this.timer); }
}

// ── Boot ──────────────────────────────────────────────────────────────────────

async function boot() {
  const hero = document.getElementById('hero');
  if (!hero) return;

  // inject canvas behind content
  const canvas = document.createElement('canvas');
  canvas.id = 'hero-matrix';
  canvas.setAttribute('aria-hidden', 'true');
  hero.insertBefore(canvas, hero.firstChild);

  // try loading pretext from CDN (ESM)
  let pretextMod = null;
  try {
    pretextMod = await import('https://esm.sh/@chenglou/pretext@latest');
  } catch (_) { /* use fallback */ }

  // start matrix rain
  const rain = new MatrixRain(canvas);
  rain.start();

  // typewriter on subtitle
  const subtitle = hero.querySelector('.hero__subtitle');
  if (subtitle) {
    const original = subtitle.textContent.trim();
    subtitle.textContent = '';
    const tw = new Typewriter(subtitle, [
      original,
      'Vue 3 · TypeScript · NestJS',
      '微信小程序 · uni-app · mpvue',
      '企业级 ERP · 仓储系统 · 电商 H5',
    ], pretextMod);
    tw.start();
  }

  // glitch scan-line overlay
  const scan = document.createElement('div');
  scan.id = 'hero-scanline';
  scan.setAttribute('aria-hidden', 'true');
  hero.appendChild(scan);

  // stop rain when hero leaves viewport (perf)
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => {
      e.isIntersecting ? rain.start() : rain.stop();
    }, { threshold: 0 });
    io.observe(hero);
  }
}

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', boot)
  : boot();
