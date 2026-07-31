<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const bannerRef = ref<HTMLElement | null>(null)
const typedCmd = ref('')
const typedName = ref('')
const typedTags = ref('')
const showDesc = ref(false)
const showFooter = ref(false)
const pressedKey = ref<string | null>(null)
let pressTimer: number | null = null

const fullCmd = 'Who Am I ?'
const fullName = '毛际可'
const fullTags = '微信小程序 · H5 · NodeJs · Vue3 · AI · uni-app · Echarts'

// Typewriter effect
let timers: number[] = []

function typeText(target: ReturnType<typeof ref<string>>, text: string, delay: number, onDone?: () => void) {
  let i = 0
  const interval = window.setInterval(() => {
    target.value = text.slice(0, i + 1)
    i++
    if (i >= text.length) {
      clearInterval(interval)
      onDone?.()
    }
  }, delay)
  timers.push(interval)
}

onMounted(() => {
  // Stagger the typewriter sequence
  setTimeout(() => {
    typeText(typedCmd, fullCmd, 40, () => {
      setTimeout(() => typeText(typedName, fullName, 50, () => {
        setTimeout(() => typeText(typedTags, fullTags, 15, () => {
          setTimeout(() => { showDesc.value = true; setTimeout(() => { showFooter.value = true }, 800) }, 150)
        }), 100)
      }), 200)
    })
  }, 300)

  // Banner scaling
  scaleBanner()
  window.addEventListener('resize', scaleBanner)
})

onUnmounted(() => {
  timers.forEach(clearInterval)
  window.removeEventListener('resize', scaleBanner)
  if (pressTimer) clearTimeout(pressTimer)
})

function onKeyClick(label: string) {
  pressedKey.value = label
  if (pressTimer) clearTimeout(pressTimer)
  pressTimer = window.setTimeout(() => { pressedKey.value = null }, 300)
}

function scaleBanner() {
  if (!bannerRef.value) return
  const vw = window.innerWidth
  const vh = window.innerHeight
  const el = bannerRef.value
  const naturalW = 1440
  const naturalH = 900
  const scale = Math.min(vw / naturalW, (vh - 80) / naturalH, 1)
  // 手机端保证最小缩放，避免内容过小无法阅读
  const minScale = vw < 768 ? 0.42 : 0
  const finalScale = Math.max(scale, minScale)
  const offsetX = (vw - naturalW * finalScale) / 2
  el.style.transform = `scale(${finalScale})`
  el.style.transformOrigin = 'top left'
  el.style.left = offsetX + 'px'
}

/* Keyboard layout data */
const row1 = ['Esc', null, 'F1', 'F2', 'F3', 'F4', null, 'F5', 'F6', 'F7', 'F8', null, 'F9', 'F10', 'F11', 'F12']
const row2 = ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', { label: 'Bksp', w: 'w100' }]
const row3 = [{ label: 'Tab', w: 'w76' }, 'Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', { label: '\\', w: 'w76' }]
const row4 = [{ label: 'Caps', w: 'w88' }, 'A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'", { label: 'Enter', w: 'w112' }]
const row5 = [{ label: 'Shift', w: 'w112' }, 'Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/', { label: 'Shift', w: 'w136' }]
const row6 = [{ label: 'Ctrl', w: 'w52' }, 'Alt', '⌘', { label: '', w: 'w300' }, '⌘', 'Alt', '←', '↑', '↓', '→']

interface KeyDef { label: string; w?: string }
function isKeyDef(v: string | KeyDef | null): v is KeyDef { return v !== null && typeof v === 'object' }
</script>

<template>
  <section id="hero" class="banner-hero">
    <div ref="bannerRef" class="banner" aria-label="终端风格个人介绍">

      <!-- Monitor Section -->
      <div class="banner__monitor-section">
        <div class="banner__monitor">
          <div class="banner__terminal">
            <!-- Top Bar -->
            <div class="banner__topbar">
              <div class="banner__traffic-lights">
                <span class="banner__dot banner__dot--red" />
                <span class="banner__dot banner__dot--yellow" />
                <span class="banner__dot banner__dot--green" />
              </div>
              <div class="banner__terminal-title">毛际可 — zsh — 120×40</div>
            </div>
            <!-- Terminal Body -->
            <div class="banner__body">
              <div class="banner__cmd-line">
                <span class="banner__prompt">➜</span>
                <span class="banner__path">~</span>
                <span class="banner__cmd">{{ typedCmd }}<span v-if="typedCmd.length < fullCmd.length" class="banner__cursor">█</span></span>
              </div>
              <div v-if="typedCmd.length >= fullCmd.length" class="banner__output-name">{{ typedName }}<span v-if="typedName.length < fullName.length" class="banner__cursor">█</span></div>
              <div v-if="typedName.length >= fullName.length" class="banner__output-tags">{{ typedTags }}<span v-if="typedTags.length < fullTags.length" class="banner__cursor">█</span></div>
              <div v-if="typedTags.length >= fullTags.length" class="banner__spacer" />
              <Transition name="fade-up">
                <p v-if="showDesc" class="banner__desc">
                  10年+企业级与 AI 原生应用开发经验，擅长 Vue3 全家桶及 TypeScript 工程化体系建设。具备跨端开发能力（uni-app / 小程序），主导过集团级 ERP 与仓储管理等复杂后台系统，同时具备 NestJS BFF 层开发能力。
                </p>
              </Transition>
              <div v-if="showFooter" class="banner__terminal-footer">
                <div class="banner__cmd-line banner__cmd-line--sm">
                  <span class="banner__prompt">➜</span>
                  <span class="banner__path">~/tech-stack</span>
                  <span class="banner__cmd">cat skills.json</span>
                </div>
                <div class="banner__output-json">❯ frontend: Vue3 · React · TypeScript · Three.js</div>
                <div class="banner__output-json">❯ backend: Node.js · NestJS · Python · PostgreSQL</div>
                <div class="banner__output-json">❯ mobile: uni-app · 微信小程序</div>
                <div class="banner__output-json">❯ devops: Docker · CI/CD · Nginx · Alibaba Cloud</div>
              </div>
            </div>
          </div>
        </div>
        <div class="banner__stand-neck" />
        <div class="banner__stand-base" />
      </div>

      <!-- Keyboard Section -->
      <div class="banner__keyboard-section">
        <div class="banner__keyboard" aria-hidden="true">
          <div v-for="(row, ri) in [row1, row2, row3, row4, row5, row6]" :key="ri" class="banner__key-row">
            <template v-for="(key, _ki) in row" :key="_ki">
              <div v-if="key === null" class="banner__key banner__key--gap" />
              <div
                v-else
                class="banner__key"
                :class="[
                  isKeyDef(key) && key.w ? `banner__key--${key.w}` : '',
                  { 'banner__key--pressed': pressedKey === (isKeyDef(key) ? key.label : key) }
                ]"
                @click="onKeyClick(isKeyDef(key) ? key.label : key)"
              >{{ isKeyDef(key) ? key.label : key }}</div>
            </template>
          </div>
        </div>
      </div>


    </div>

    <!-- Scroll hint -->
    <div class="banner__scroll-hint">
      <span class="banner__scroll-line" />
      <span class="banner__scroll-text">向下滚动探索</span>
    </div>
  </section>
</template>

<style scoped>
/* ===== Banner Hero ===== */
.banner-hero {
  position: relative;
  width: 100%;
  height: 100vh;
  min-height: 700px;
  overflow: hidden;
  background: radial-gradient(ellipse at 15% 25%, rgba(79, 70, 229, 0.08) 0%, var(--color-bg) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
@media (max-width: 767px) {
  .banner-hero {
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
  }
}

.banner {
  position: absolute;
  top: 20px;
  width: 1440px;
  height: 900px;
  transform-origin: top left;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
}

/* ===== Monitor ===== */
.banner__monitor-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.banner__monitor {
  width: 920px;
  height: 440px;
  background: var(--color-bg-alt);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    0 0 100px rgba(99, 102, 241, 0.06);
  overflow: hidden;
  display: flex;
  padding: 12px;
}

.banner__stand-neck {
  width: 160px;
  height: 24px;
  background: var(--color-bg-alt);
  border-radius: 4px;
}

.banner__stand-base {
  width: 300px;
  height: 6px;
  background: var(--color-bg-alt);
  border-radius: 3px;
}

/* ===== Terminal ===== */
.banner__terminal {
  width: 100%;
  height: 100%;
  background: var(--color-bg);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.banner__topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 0 16px;
  background: #131316;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
}

.banner__traffic-lights {
  display: flex;
  align-items: center;
  gap: 8px;
}

.banner__dot {
  width: 12px;
  height: 12px;
  border-radius: 6px;
}
.banner__dot--red    { background: #FF5F56; }
.banner__dot--yellow { background: #FFBD2E; }
.banner__dot--green  { background: #27C93F; }

.banner__terminal-title {
  font-size: 12px;
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  line-height: 1;
}

.banner__body {
  flex: 1;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
  background: var(--color-bg);
  font-family: var(--font-mono);
}

.banner__cmd-line {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 15px;
  line-height: 1.4;
}

.banner__prompt { color: var(--color-accent2); font-weight: 700; }
.banner__path   { color: var(--color-accent); }
.banner__cmd    { color: var(--color-text); }

.banner__cursor {
  color: var(--color-accent);
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0; }
}

.banner__output-name {
  font-size: 22px;
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
}

.banner__output-tags {
  font-size: 14px;
  font-family: var(--font-mono);
  color: var(--color-accent2);
  line-height: 1.3;
}

.banner__spacer { height: 8px; flex-shrink: 0; }

.banner__desc {
  font-size: 15px;
  color: var(--color-text-soft);
  line-height: 26px;
  font-family: var(--font-sans);
  max-width: 100%;
  margin: 0;
}

/* ===== Terminal Footer ===== */
.banner__terminal-footer {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 812px;
  max-width: 100%;
  padding: 60px 8px;
}

.banner__cmd-line--sm {
  font-size: 12px !important;
  gap: 4px !important;
}

.banner__output-json {
  font-family: var(--font-mono);
  font-size: 11px;
  color: rgba(148, 163, 184, 0.55);
  line-height: 1.6;
  padding-left: 8px;
  letter-spacing: 0.02em;
}

/* ===== Keyboard ===== */
.banner__keyboard-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.banner__keyboard {
  width: 812px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.banner__key-row {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: flex-start;
}

.banner__key {
  width: 48px;
  height: 48px;
  background: #2A2A30;
  border: 1px solid #3D3D44;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--color-text-muted);
  cursor: pointer;
  user-select: none;
  transition: all 0.12s ease;
  flex-shrink: 0;
}

.banner__key:hover {
  background: #1A1A1E;
  border-color: var(--color-accent);
  color: var(--color-accent);
  box-shadow:
    inset 0 3px 4px rgba(0, 0, 0, 0.5),
    inset 0 0 6px rgba(99, 102, 241, 0.35),
    0 0 12px rgba(99, 102, 241, 0.15);
  transform: translateY(1px);
}

/* 按键弹起动效 */
.banner__key--pressed {
  animation: key-pop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: center center;
}
@keyframes key-pop {
  0%   { transform: scale(1); }
  35%  { transform: scale(1.7); color: var(--color-accent); border-color: var(--color-accent); box-shadow: 0 0 14px rgba(99,102,241,0.5); }
  100% { transform: scale(1); }
}

.banner__key--w52  { width: 52px; }
.banner__key--w56  { width: 56px; }
.banner__key--w76  { width: 76px; }
.banner__key--w88  { width: 88px; }
.banner__key--w100 { width: 100px; }
.banner__key--w112 { width: 112px; }
.banner__key--w136 { width: 136px; }
.banner__key--w300 { width: 300px; }

.banner__key--gap {
  width: 12px;
  background: transparent;
  border: none;
  box-shadow: none;
  cursor: default;
}
.banner__key--gap:hover {
  background: transparent;
  transform: none;
}

/* ===== Scroll Hint ===== */
.banner__scroll-hint {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 2;
  animation: float-hint 3s ease-in-out infinite;
}

.banner__scroll-line {
  width: 1px;
  height: 32px;
  background: linear-gradient(to bottom, var(--color-accent), transparent);
}

.banner__scroll-text {
  font-family: var(--font-mono);
  font-size: var(--fs-xs);
  color: var(--color-text-muted);
  letter-spacing: 0.08em;
}

@keyframes float-hint {
  0%, 100% { transform: translateX(-50%) translateY(0); }
  50%      { transform: translateX(-50%) translateY(6px); }
}

/* ===== Transition ===== */
.fade-up-enter-active {
  transition: all 0.6s var(--ease) 0.2s;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .banner-hero {
    min-height: 500px;
  }
  .banner__monitor {
    width: calc(100vw - 32px);
    height: auto;
    aspect-ratio: 920 / 440;
  }
  .banner__keyboard {
    width: calc(100vw - 32px);
  }
  .banner__key {
    width: 28px;
    height: 28px;
    font-size: 7px;
    border-radius: 4px;
  }
  .banner__key--w52  { width: 30px; }
  .banner__key--w76  { width: 44px; }
  .banner__key--w88  { width: 52px; }
  .banner__key--w100 { width: 58px; }
  .banner__key--w112 { width: 66px; }
  .banner__key--w136 { width: 80px; }
  .banner__key--w300 { width: 180px; }
  .banner__key--gap  { width: 8px; }
}
</style>
