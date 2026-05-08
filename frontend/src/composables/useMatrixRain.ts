import { type Ref, onMounted, onUnmounted } from 'vue'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<>{}[]|/\\#@$%^&*+=~'
const CJK = '的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心力理'

function randomChar() {
  return Math.random() < 0.3
    ? CJK[(Math.random() * CJK.length) | 0]
    : CHARS[(Math.random() * CHARS.length) | 0]
}

interface Col { y: number; speed: number }

class MatrixRain {
  private cols: Col[] = []
  private raf = 0
  private readonly fontSize = 13
  private readonly ctx: CanvasRenderingContext2D
  private readonly onResize: () => void

  constructor(private readonly canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext('2d')!
    this.onResize = this._resize.bind(this)
  }

  start() {
    window.addEventListener('resize', this.onResize, { passive: true })
    this._resize()
    this._loop()
  }

  stop() {
    window.removeEventListener('resize', this.onResize)
    cancelAnimationFrame(this.raf)
  }

  private _resize() {
    const hero = this.canvas.parentElement!
    this.canvas.width = hero.offsetWidth
    this.canvas.height = hero.offsetHeight
    const count = Math.floor(this.canvas.width / this.fontSize)
    while (this.cols.length < count)
      this.cols.push({ y: ((Math.random() * -100) | 0), speed: 0.3 + Math.random() * 0.7 })
    this.cols.length = count
  }

  private _loop() {
    let last = 0
    const step = (ts: number) => {
      this.raf = requestAnimationFrame(step)
      if (ts - last < 1000 / 20) return
      last = ts
      this._tick()
    }
    this.raf = requestAnimationFrame(step)
  }

  private _tick() {
    const { ctx, canvas, cols, fontSize } = this
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--color-bg').trim() || '#fff'
    ctx.fillStyle = bg
    ctx.globalAlpha = 0.18
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.globalAlpha = 1
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
    ctx.font = `${fontSize}px "JetBrains Mono", monospace`
    for (let i = 0; i < cols.length; i++) {
      const col = cols[i]
      const x = i * fontSize
      const y = col.y * fontSize
      ctx.fillStyle = dark ? '#a5f3fc' : '#4f46e5'; ctx.globalAlpha = 0.9
      ctx.fillText(randomChar(), x, y)
      ctx.fillStyle = dark ? '#22d3ee' : '#818cf8'; ctx.globalAlpha = 0.35
      ctx.fillText(randomChar(), x, y - fontSize)
      ctx.globalAlpha = 1
      col.y += col.speed
      if (y > canvas.height + fontSize * 10) {
        col.y = -((Math.random() * 20) | 0)
        col.speed = 0.3 + Math.random() * 0.7
      }
    }
  }
}

const SUBTITLES = [
  '高级前端工程师 · 10年经验',
  'Vue 3 · TypeScript · NestJS',
  '微信小程序 · uni-app · mpvue',
  '企业级 ERP · 仓储系统 · 电商 H5',
]

class Typewriter {
  private lineIdx = 0
  private charIdx = 0
  private deleting = false
  private timer = 0
  private readonly cursor: HTMLSpanElement
  private readonly textNode: Text

  constructor(_el: HTMLElement, private readonly lines: string[]) {
    const el = _el
    this.cursor = Object.assign(document.createElement('span'), { className: 'tw-cursor', textContent: '█' })
    this.textNode = document.createTextNode('')
    el.textContent = ''
    el.appendChild(this.textNode)
    el.appendChild(this.cursor)
  }

  start() { this._tick() }
  destroy() { clearTimeout(this.timer) }

  private _tick() {
    const line = this.lines[this.lineIdx]
    if (!this.deleting) {
      this.textNode.data = line.slice(0, ++this.charIdx)
      if (this.charIdx >= line.length) {
        this.timer = window.setTimeout(() => { this.deleting = true; this._tick() }, 1800)
        return
      }
    } else {
      this.textNode.data = line.slice(0, --this.charIdx)
      if (this.charIdx <= 0) {
        this.deleting = false
        this.lineIdx = (this.lineIdx + 1) % this.lines.length
        this.timer = window.setTimeout(() => this._tick(), 400)
        return
      }
    }
    this.timer = window.setTimeout(() => this._tick(), (this.deleting ? 40 : 90) + ((Math.random() * 40) | 0))
  }
}

export function useMatrixRain(heroRef: Ref<HTMLElement | null>, subtitleRef: Ref<HTMLElement | null>) {
  let rain: MatrixRain | null = null
  let tw: Typewriter | null = null
  let io: IntersectionObserver | null = null

  onMounted(() => {
    const hero = heroRef.value
    if (!hero) return

    const canvas = Object.assign(document.createElement('canvas'), { id: 'hero-matrix' })
    canvas.setAttribute('aria-hidden', 'true')
    hero.insertBefore(canvas, hero.firstChild)

    const scanline = Object.assign(document.createElement('div'), { id: 'hero-scanline' })
    scanline.setAttribute('aria-hidden', 'true')
    hero.appendChild(scanline)

    rain = new MatrixRain(canvas)
    rain.start()

    if (subtitleRef.value) {
      tw = new Typewriter(subtitleRef.value, SUBTITLES)
      tw.start()
    }

    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(([e]) => { e.isIntersecting ? rain!.start() : rain!.stop() }, { threshold: 0 })
      io.observe(hero)
    }
  })

  onUnmounted(() => { rain?.stop(); tw?.destroy(); io?.disconnect() })
}
