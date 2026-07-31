<template>
  <section id="hero" class="terminal-hero">
    <div class="terminal-hero__bg"></div>

    <!-- Scale wrapper: uniform scaling for the whole banner -->
    <div class="terminal-hero__banner" ref="bannerRef">

      <!-- Monitor -->
      <div class="monitor-section">
        <div class="monitor">
          <div class="terminal-screen">
            <div class="terminal-topbar">
              <div class="traffic-lights">
                <span class="red"></span>
                <span class="yellow"></span>
                <span class="green"></span>
              </div>
              <div class="terminal-title">毛际可 — zsh — 120×40</div>
            </div>
            <div class="terminal-body">
              <div class="command-line">
                <span class="prompt">➜</span>
                <span class="path">~</span>
                <span class="command">whoami</span>
              </div>
              <div class="cursor-line"><span class="cursor blink">█</span></div>
              <div class="name-output">毛际可</div>
              <div class="tech-tags">高级前端工程师 · 10年经验<span class="cursor blink">█</span></div>
              <div class="spacer"></div>
              <div class="description">
                10年+企业级与 AI 原生应用开发经验，擅长 Vue3 全家桶及 TypeScript 工程化体系建设。
                具备跨端开发能力（uni-app / 小程序），主导过集团级 ERP 与仓储管理等复杂后台系统。
              </div>
              <div class="terminal-actions">
                <a class="terminal-btn" href="#about">探索更多</a>
                <a class="terminal-btn terminal-btn--outline"
                   :href="resumeUrl"
                   download="毛际可_前端工程师简历.docx"
                   target="_blank"
                   rel="noopener noreferrer">下载简历</a>
              </div>
            </div>
          </div>
        </div>
        <div class="stand-neck"></div>
        <div class="stand-base"></div>
      </div>

      <!-- Keyboard -->
      <div class="keyboard-section">
        <div class="keyboard">
          <div class="key-row">
            <div class="key">Esc</div>
            <div class="key key--gap"></div>
            <div class="key">F1</div><div class="key">F2</div><div class="key">F3</div><div class="key">F4</div>
            <div class="key key--gap"></div>
            <div class="key">F5</div><div class="key">F6</div><div class="key">F7</div><div class="key">F8</div>
            <div class="key key--gap"></div>
            <div class="key">F9</div><div class="key">F10</div><div class="key">F11</div><div class="key">F12</div>
          </div>
          <div class="key-row">
            <div class="key">`</div>
            <div class="key">1</div><div class="key">2</div><div class="key">3</div><div class="key">4</div>
            <div class="key">5</div><div class="key">6</div><div class="key">7</div><div class="key">8</div><div class="key">9</div><div class="key">0</div>
            <div class="key">-</div><div class="key">=</div>
            <div class="key key--w100">Bksp</div>
          </div>
          <div class="key-row">
            <div class="key key--w76">Tab</div>
            <div class="key">Q</div><div class="key">W</div><div class="key">E</div><div class="key">R</div>
            <div class="key">T</div><div class="key">Y</div><div class="key">U</div><div class="key">I</div><div class="key">O</div>
            <div class="key">P</div><div class="key">[</div><div class="key">]</div>
            <div class="key key--w76">\</div>
          </div>
          <div class="key-row">
            <div class="key key--w88">Caps</div>
            <div class="key">A</div><div class="key">S</div><div class="key">D</div>
            <div class="key">F</div><div class="key">G</div><div class="key">H</div><div class="key">J</div>
            <div class="key">K</div><div class="key">L</div>
            <div class="key">;</div><div class="key">'</div>
            <div class="key key--w112">Enter</div>
          </div>
          <div class="key-row">
            <div class="key key--w112">Shift</div>
            <div class="key">Z</div><div class="key">X</div><div class="key">C</div>
            <div class="key">V</div><div class="key">B</div><div class="key">N</div><div class="key">M</div>
            <div class="key">,</div><div class="key">.</div><div class="key">/</div>
            <div class="key key--w136">Shift</div>
          </div>
          <div class="key-row">
            <div class="key key--w52">Ctrl</div>
            <div class="key">Alt</div>
            <div class="key">⌘</div>
            <div class="key key--w340"></div>
            <div class="key">⌘</div>
            <div class="key">Alt</div>
            <div class="key">←</div><div class="key">↑</div><div class="key">↓</div><div class="key">→</div>
          </div>
        </div>
      </div>

    </div>
    <!-- end banner wrapper -->

    <!-- Scroll indicator -->
    <div class="terminal-hero__scroll">
      <span class="scroll-text">scroll</span>
      <span class="scroll-line"></span>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const resumeUrl = ref(
  'https://maojike.oss-cn-beijing.aliyuncs.com/%E6%AF%9B%E9%99%85%E5%8F%AF_%E5%89%8D%E7%AB%AF%E5%B7%A5%E7%A8%8B%E5%B8%88%E7%AE%80%E5%8E%86.docx'
)

const BANNER_WIDTH = 1040
const BANNER_HEIGHT = 700

const bannerRef = ref<HTMLElement | null>(null)

function scaleBanner() {
  const banner = bannerRef.value
  if (!banner) return
  const vw = window.innerWidth
  const vh = window.innerHeight
  // Account for padding on .terminal-hero: 40px each side
  const availableW = vw - 80
  const availableH = vh - 120
  const scaleX = availableW / BANNER_WIDTH
  const scaleY = availableH / BANNER_HEIGHT
  const scale = Math.min(1, scaleX, scaleY)
  banner.style.transform = `scale(${scale})`
}

onMounted(() => {
  scaleBanner()
  window.addEventListener('resize', scaleBanner)
})

onUnmounted(() => {
  window.removeEventListener('resize', scaleBanner)
})
</script>

<style scoped>
.terminal-hero {
  position: relative;
  width: 100%;
  min-height: 100dvh;
  background: #000000;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 40px 80px;
}

.terminal-hero__bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 50% 40% at 50% 35%, rgba(79,70,229,0.08) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.terminal-hero__banner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  z-index: 2;
  transform-origin: center center;
  width: 1040px;
  flex-shrink: 0;
}

/* ── Monitor ── */
.monitor-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}

.monitor {
  width: 1040px;
  height: 480px;
  background: #0D0D0D;
  border: 1px solid #1E1E24;
  border-radius: 16px;
  box-shadow:
    0 20px 60px rgba(0,0,0,0.5),
    0 0 120px rgba(79,70,229,0.04);
  overflow: hidden;
  display: flex;
  padding: 14px;
}

.stand-neck {
  width: 160px;
  height: 22px;
  background: #0D0D0D;
  border-left: 1px solid #1E1E24;
  border-right: 1px solid #1E1E24;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.stand-base {
  width: 280px;
  height: 8px;
  background: #0D0D0D;
  border: 1px solid #1E1E24;
  border-radius: 3px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

/* ── Terminal ── */
.terminal-screen {
  width: 100%;
  height: 100%;
  background: #080808;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.terminal-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 38px;
  padding: 0 18px;
  background: #131316;
  border-bottom: 1px solid #1A1A20;
  flex-shrink: 0;
}

.traffic-lights {
  display: flex;
  align-items: center;
  gap: 8px;
}

.traffic-lights span {
  width: 12px;
  height: 12px;
  border-radius: 6px;
}
.traffic-lights .red   { background: #FF5F56; }
.traffic-lights .yellow { background: #FFBD2E; }
.traffic-lights .green  { background: #27C93F; }

.terminal-title {
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  color: #686870;
  line-height: 1;
  letter-spacing: 0.02em;
}

.terminal-body {
  flex: 1;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: hidden;
  font-family: 'JetBrains Mono', 'PingFang SC', 'Microsoft YaHei', monospace;
}

.command-line {
  display: flex;
  align-items: baseline;
  gap: 6px;
  font-size: 15px;
  line-height: 1.4;
}

.prompt { color: #818CF8; font-weight: 700; }
.path   { color: #5B9EFF; }
.command { color: #DDDDDD; }

.cursor-line {
  font-size: 16px;
  font-family: 'JetBrains Mono', monospace;
  line-height: 1.3;
}

.cursor { color: #818CF8; }

.cursor.blink {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.name-output {
  font-size: 26px;
  font-family: 'Syne', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-weight: 800;
  color: #FFFFFF;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

.tech-tags {
  font-size: 14px;
  font-family: 'JetBrains Mono', monospace;
  color: #22C55E;
  line-height: 1.3;
}

.spacer { height: 10px; flex-shrink: 0; }

.description {
  font-size: 13px;
  color: #B0B0B8;
  line-height: 22px;
  font-family: 'PingFang SC', 'Microsoft YaHei', sans-serif;
  max-width: 640px;
}

.terminal-actions {
  display: flex;
  gap: 14px;
  margin-top: 18px;
}

.terminal-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 11px 28px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: 0.04em;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.25s ease;
  border: 1.5px solid #818CF8;
  background: #818CF8;
  color: #080808;
}

.terminal-btn:hover {
  background: #6366F1;
  border-color: #6366F1;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(129,140,248,0.25);
}

.terminal-btn--outline {
  background: transparent;
  color: #818CF8;
  border-color: #2A2A35;
}

.terminal-btn--outline:hover {
  background: rgba(129,140,248,0.08);
  border-color: #818CF8;
  color: #818CF8;
  box-shadow: none;
}

/* ── Keyboard ── */
.keyboard-section {
  flex-shrink: 0;
  margin-top: -2px;
  position: relative;
  z-index: 1;
}

.keyboard {
  width: 900px;
  background: #121216;
  border: 1px solid #1E1E24;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.4);
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.key-row {
  display: flex;
  gap: 4px;
  align-items: center;
  justify-content: flex-start;
}

.key {
  width: 48px;
  height: 48px;
  background: #1E1E24;
  border: 1px solid #2A2A32;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: #78787E;
  cursor: pointer;
  user-select: none;
  transition: all 0.12s ease;
  flex-shrink: 0;
}

.key:hover {
  background: #15151A;
  border-color: #818CF8;
  color: #818CF8;
  box-shadow: inset 0 3px 4px rgba(0,0,0,0.5), 0 0 12px rgba(129,140,248,0.08);
  transform: translateY(1px);
}

.key--w52  { width: 52px; }
.key--w56  { width: 56px; }
.key--w76  { width: 76px; }
.key--w88  { width: 88px; }
.key--w100 { width: 100px; }
.key--w112 { width: 112px; }
.key--w136 { width: 136px; }
.key--w340 { width: 340px; }
.key--gap  { width: 12px; background: transparent; border: none; box-shadow: none; cursor: default; }
.key--gap:hover { background: transparent; border: none; box-shadow: none; transform: none; }

/* ── Scroll indicator ── */
.terminal-hero__scroll {
  position: absolute;
  bottom: 32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 1;
  opacity: 0.4;
  animation: scroll-bounce 2.5s ease-in-out infinite;
}

.scroll-text {
  font-family: 'JetBrains Mono', monospace;
  font-size: 10px;
  color: #686870;
  text-transform: uppercase;
  letter-spacing: 0.15em;
}

.scroll-line {
  width: 1px;
  height: 32px;
  background: linear-gradient(to bottom, #818CF8, transparent);
}

@keyframes scroll-bounce {
  0%, 100% { transform: translateX(-50%) translateY(0); opacity: 0.4; }
  50% { transform: translateX(-50%) translateY(6px); opacity: 0.7; }
}

/* ── Responsive ── */
@media (max-width: 1024px) {
  .terminal-hero { padding: 32px 32px 60px; }
}

@media (max-width: 768px) {
  .terminal-hero { padding: 24px 24px 0; }
  .monitor { width: 92vw; height: 340px; padding: 10px; }
  .terminal-body { padding: 18px 20px; }
  .name-output { font-size: 22px; }
  .description { font-size: 12px; }
  .terminal-actions { flex-direction: column; }
  .terminal-hero__scroll { display: none; }
  .terminal-hero__banner { width: 100%; }
}

@media (max-width: 640px) {
  .keyboard-section { display: none; }
  .terminal-hero { padding: 16px 12px 0; }
  .monitor { width: 96vw; height: 300px; padding: 8px; }
  .terminal-body { padding: 14px 16px; }
  .name-output { font-size: 18px; }
  .tech-tags { font-size: 12px; }
}
</style>
