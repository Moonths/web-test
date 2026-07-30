<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as THREE from 'three'
import { useExhibitionHall } from '@/composables/useExhibitionHall'
import { useCharacter } from '@/composables/useCharacter'
import { useExhibitionScreens } from '@/composables/useExhibitionScreens'
import { useMagicMirrors } from '@/composables/useMagicMirrors'
import { useOrbitCamera } from '@/composables/useOrbitCamera'
import type { CharacterController } from '@/composables/useCharacter'
import type { ScreenObjects } from '@/composables/useExhibitionScreens'
import type { MirrorObjects } from '@/composables/useMagicMirrors'
import type { OrbitCamera } from '@/composables/useOrbitCamera'
import { useCodeFlow } from '@/composables/useCodeFlow'
import { useCeilingFlow } from '@/composables/useCodeFlow'
import type { CodeFlowResult } from '@/composables/useCodeFlow'
import type { CeilingFlowResult } from '@/composables/useCodeFlow'
import DashboardApp from '@resume/dashboard/src/App.vue'

const canvasContainer = ref<HTMLElement | null>(null)
const activeOverlay = ref<'none' | 'resume' | 'dashboard'>('none')
const showHint = ref(true)

// 摇杆状态
const jActive = ref(false)
const jThumbX = ref(0)
const jThumbY = ref(0)
const J_RADIUS = 52
const J_DEAD_ZONE = 10
let jTouchId: number | null = null
const jKeys = new Set<string>()

function jDispatch(key: string, down: boolean) {
  window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { key, bubbles: true }))
}

function jUpdateDir(dx: number, dy: number) {
  const dist = Math.hypot(dx, dy)
  if (dist < J_DEAD_ZONE) {
    // 松开所有方向
    for (const k of jKeys) jDispatch(k, false)
    jKeys.clear()
    return
  }

  const newKeys = new Set<string>()
  if (dy < -J_DEAD_ZONE) newKeys.add('w')
  if (dy > J_DEAD_ZONE) newKeys.add('s')
  if (dx < -J_DEAD_ZONE) newKeys.add('a')
  if (dx > J_DEAD_ZONE) newKeys.add('d')

  // 按下的新键
  for (const k of newKeys) { if (!jKeys.has(k)) jDispatch(k, true) }
  // 松开移除的键
  for (const k of jKeys) { if (!newKeys.has(k)) jDispatch(k, false) }
  jKeys.clear()
  for (const k of newKeys) jKeys.add(k)
}

function onJoystickStart(e: TouchEvent) {
  e.preventDefault()
  const t = e.changedTouches[0]
  jTouchId = t.identifier
  jActive.value = true
  jThumbX.value = 0
  jThumbY.value = 0
}

function onJoystickMove(e: TouchEvent) {
  e.preventDefault()
  let t: Touch | null = null
  for (let i = 0; i < e.changedTouches.length; i++) {
    if (e.changedTouches[i].identifier === jTouchId) { t = e.changedTouches[i]; break }
  }
  if (!t) return

  // joystick base element center in page coords
  const base = document.querySelector('.joystick-base')!
  const rect = base.getBoundingClientRect()
  const cx = rect.left + rect.width / 2
  const cy = rect.top + rect.height / 2

  let dx = t.clientX - cx
  let dy = t.clientY - cy
  const dist = Math.hypot(dx, dy)
  if (dist > J_RADIUS) { dx = dx / dist * J_RADIUS; dy = dy / dist * J_RADIUS }

  jThumbX.value = dx
  jThumbY.value = dy
  jUpdateDir(dx, dy)
}

function onJoystickEnd(e: TouchEvent) {
  e.preventDefault()
  for (const k of jKeys) jDispatch(k, false)
  jKeys.clear()
  jActive.value = false
  jThumbX.value = 0
  jThumbY.value = 0
  jTouchId = null
}

const { init, startRenderLoop, destroy, getState, addFrameCallback } = useExhibitionHall(canvasContainer)

let character: CharacterController | null = null
let lastCharPos = new THREE.Vector3()
let charMoveTimer = 0
let screens: ScreenObjects | null = null
let mirrors: MirrorObjects | null = null
let orbitCamera: OrbitCamera | null = null
let codeFlow: CodeFlowResult | null = null
let ceilingFlow: CeilingFlowResult | null = null

onMounted(() => {
  const state = init()
  if (!state) return

  // TEMP-DEBUG: 暴露场景状态用于浏览器调试
  ;(window as any).__hallState = state

  // 轨道相机 — 拖拽旋转，滚轮缩放
  orbitCamera = useOrbitCamera(state.camera, state.renderer.domElement)

  // 角色 — 纯移动，不接管相机
  character = useCharacter(state.scene)

  // 屏幕系统
  screens = useExhibitionScreens(state)

// 主屏幕两侧的落地魔镜
  mirrors = useMagicMirrors(state)

  // 墙面代码流动效
  codeFlow = useCodeFlow(
    state.scene.userData.wallBack  ?? null,
    state.scene.userData.wallFront ?? null,
    state.scene.userData.wallLeft  ?? null,
    state.scene.userData.wallRight ?? null,
  )

  // 天花板随机折线光影
  ceilingFlow = useCeilingFlow(state.scene.userData.ceiling ?? null)

  // 屏幕动画 + 引导线脉冲
  addFrameCallback((delta, elapsed) => {
    screens?.update(delta, elapsed)
    mirrors?.update(delta, elapsed)

    // 引导线光点脉冲动画
    const guidePulses = state.scene.userData.guidePulses as THREE.Mesh[] | undefined
    if (guidePulses) {
      for (const pulse of guidePulses) {
        const gp = (pulse as any).userData.guidePulse
        if (gp) {
          const s = 0.6 + Math.sin(elapsed * 4 + gp.offset) * 0.4
          pulse.scale.setScalar(s)
          ;(pulse.material as THREE.MeshBasicMaterial).opacity = 0.2 + Math.sin(elapsed * 4 + gp.offset) * 0.3
        }
      }
    }
  })

  // 代码流动效更新
  addFrameCallback((_delta, elapsed) => {
    codeFlow?.update(elapsed)
    ceilingFlow?.update(elapsed)
  })

  // 角色更新 + 相机更新 + 远近景切换
  addFrameCallback((delta, elapsed) => {
    if (character && orbitCamera) {
      const pos = character.getPosition()
      const moved = pos.distanceToSquared(lastCharPos) > 0.0001
      lastCharPos.copy(pos)

      if (moved) {
        charMoveTimer = 0.3  // 移动时保持近景
      } else {
        charMoveTimer = Math.max(0, charMoveTimer - delta)
      }

      // 移动中 → 近景 10m，静止 → 远景 22m
      const targetDist = charMoveTimer > 0 ? 14 : 30
      orbitCamera.setTargetDistance(targetDist)

      const azimuth = orbitCamera.getAzimuth()
      character.update(delta, elapsed, azimuth)
    }
    orbitCamera?.update(delta)
  })

  // 调试：暴露对象引用用于浏览器控制台调试
    ;(window as any).__debugScreens = screens
  ;(window as any).__debugState = state
  

  // 点击检测 — 主屏幕 & 提示环
  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  function onCanvasClick(e: MouseEvent) {
    if (!state || !screens || activeOverlay.value !== 'none') {
      return
    }

    const rect = canvasContainer.value!.getBoundingClientRect()
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1

    raycaster.setFromCamera(mouse, state.camera)
    const intersects = raycaster.intersectObjects(
      [
        screens.mainScreen,
        screens.mainScreenGlow,
        ...screens.hintRing.children,
        // 右侧魔镜（含提示环）与主屏幕行为一致；左镜为纯反射镜，不可点击
        // 过滤掉可能的 null 值
        ...(mirrors ? [mirrors.rightSurface, ...mirrors.rightHintRing.children].filter(Boolean) : []),
      ].filter(Boolean) as THREE.Object3D[],
      true,
    )

    if (intersects.length > 0) {
      const hit = intersects[0].object
      const isMainScreen = hit === (screens.mainScreen as any) ||
        hit === (screens.mainScreenGlow as any) ||
        screens.hintRing.children.includes(hit)
      const isWhiteboard = mirrors && (
        hit === (mirrors.rightSurface as any) ||
        (mirrors.rightHintRing && mirrors.rightHintRing.children.includes(hit))
      )
      if (isMainScreen) {
        activeOverlay.value = 'resume'
      } else if (isWhiteboard) {
        activeOverlay.value = 'dashboard'
      } else {
        activeOverlay.value = 'resume'
      }
      showHint.value = false
    }
  }

  // Enter 聚焦，Esc 退出
  function onKeyDown(e: KeyboardEvent) {
    if ((e.key === 'Enter' || e.key === 'e' || e.key === 'E') && activeOverlay.value === 'none') {
      activeOverlay.value = 'resume'
      showHint.value = false
      return
    }
    if (e.key === 'Escape' && activeOverlay.value !== 'none') {
      activeOverlay.value = 'none'
      showHint.value = false
    }
  }

  state.renderer.domElement.addEventListener('click', onCanvasClick)
  // 阻止 canvas 上的 click 在拖拽结束后误触发
  // 只在鼠标按下期间记录拖拽状态，避免普通 mousemove 吞掉点击
  let _mouseDown = false
  let _mouseStartX = 0
  let _mouseStartY = 0
  state.renderer.domElement.addEventListener('mousedown', (e: MouseEvent) => {
    _mouseDown = true
    _mouseStartX = e.clientX
    _mouseStartY = e.clientY
    ;(window as any).__dragMoved = false
  })
  state.renderer.domElement.addEventListener('mousemove', (e: MouseEvent) => {
    if (_mouseDown) {
      // 死区：移动超过 5px 才算拖拽，防止微小点击误触
      const dx = (e as MouseEvent).clientX - _mouseStartX
      const dy = (e as MouseEvent).clientY - _mouseStartY
      if (Math.hypot(dx, dy) > 5) {
        ;(window as any).__dragMoved = true
      }
    }
  })
  window.addEventListener('mouseup', () => {
    _mouseDown = false
  })
  // 用委托的方式修复：如果拖拽过，忽略 click
  state.renderer.domElement.addEventListener('click', (e: MouseEvent) => {
    if ((window as any).__dragMoved) {
      e.stopImmediatePropagation()
    }
  }, true)

  window.addEventListener('keydown', onKeyDown)

  state.scene.userData.cleanup = () => {
    state.renderer.domElement.removeEventListener('click', onCanvasClick)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('mouseup', () => { _mouseDown = false })
    ;(window as any).__dragMoved = false
    _mouseDown = false
  }

  startRenderLoop()

  // 8 秒后淡化提示
  setTimeout(() => {
    if (activeOverlay.value === 'none') showHint.value = false
  }, 8000)
})

onBeforeUnmount(() => {
  const state = getState()
  if (state?.scene.userData.cleanup) {
    (state.scene.userData.cleanup as () => void)()
  }
  orbitCamera?.dispose()
  character?.dispose()
  screens?.dispose()
  mirrors?.dispose()
  codeFlow?.dispose()
  ceilingFlow?.dispose()
  destroy()
})


</script>

<template>
  <div class="exhibition-root">
    <div ref="canvasContainer" class="exhibition-canvas" />

    <!-- 操作提示 -->
    <Transition name="hint-fade">
      <div v-if="showHint && activeOverlay === 'none'" class="exhibition-hint">
        <div class="hint-text">拖拽鼠标旋转视角 · 滚轮缩放 · 点击屏幕查看简历</div>
        <div class="hint-keys">
          <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
          <span class="hint-sep">移动</span>
          <kbd>Enter</kbd>
          <span class="hint-sep">聚焦</span>
          <kbd>Esc</kbd>
          <span class="hint-sep">退出</span>
        </div>
      </div>
    </Transition>

    <!-- 摇杆（移动端触控） -->
    <div class="joystick-container" v-show="activeOverlay === 'none'"
         @touchstart="onJoystickStart"
         @touchmove="onJoystickMove"
         @touchend="onJoystickEnd"
         @touchcancel="onJoystickEnd">
      <div class="joystick-base">
        <div class="joystick-thumb" :style="{
          transform: 'translate(' + jThumbX + 'px, ' + jThumbY + 'px)'
        }" />
      </div>
    </div>

    <!-- 全屏简历覆盖层 -->
    <Transition name="fs-overlay">
      <div v-if="activeOverlay === 'resume'" class="exhibition-overlay">
        <div class="overlay-content">
          <button class="overlay-close" @click="activeOverlay = 'none'" title="关闭 (Esc)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <div class="resume-full">
            <header class="resume-header">
              <div class="resume-accent" />
              <h1>毛际可</h1>
              <p class="resume-title">资深前端工程师 | 10 年+企业级 & AI 原生应用开发</p>
              <p class="resume-subtitle">北京 | moonths@yeah.net | 15810503259 | www.maojike.me</p>
            </header>

            <section class="resume-section">
              <h2>技能</h2>
              <div class="skills-grid">
                <div class="skill-group" v-for="cat in [
                  { title: '前端框架', items: ['Vue3 / Vue2', 'TypeScript', 'JavaScript', 'uni-app', '微信小程序原生'] },
                  { title: '工程化 & UI', items: ['Vite / Webpack', 'ESLint / Prettier', 'Tailwind CSS', 'Element Plus', 'Ant Design'] },
                  { title: '后端 & BFF', items: ['NestJS', 'Python / FastAPI', 'Node.js', 'RESTful API', 'SSE 流式渲染'] },
                  { title: 'AI & 工具', items: ['DashScope / 百炼', 'RAG', '大模型对接', 'Git', 'Docker / Linux'] },
                ]" :key="cat.title">
                  <h3>{{ cat.title }}</h3>
                  <ul>
                    <li v-for="item in cat.items" :key="item">{{ item }}</li>
                  </ul>
                </div>
              </div>
            </section>

            <section class="resume-section">
              <h2>工作经历</h2>
              <div class="timeline">
                <div class="timeline-item" v-for="exp in [
                  { period: '2018.11 — 2026.6', company: '挖酒网', role: '前端工程师 / 大前端负责人', bullets: ['管理大前端部门，一线开发网页、小程序、管理系统，协调各部门资源，制定客户端重构计划，推广新技术。', '前端工程化：TypeScript + ESLint/Prettier/Stylelint + Husky/commitlint + Vite 打包优化。', '主导集团 ERP2.0（Vue3 + Element Plus + Pinia）开发，覆盖客户、订单、采购、仓储、财务等核心模块，集成 AI 代理对话入口。', '开发仓储管理 BFF（NestJS），统一鉴权透传、全局异常过滤，通过 RxJS 封装多下游服务调用。', '实现 SSE 流式渲染与大模型交互（DashScope/百炼），完成前后端事件协议适配。', '熟练使用 Claude Code、Cursor 等 AI Agent 工具提升开发效率。'] },
                  { period: '2016.01 — 2018.10', company: '逻辑适点', role: '前端工程师', bullets: ['配合后端完成 Web 前端开发（官网、后台管理、小程序、H5），积累扎实的 HTML/CSS/JS 基础。', '纯 CSS 实现 PADI 教学动画项目，深入掌握 CSS3 动画与交互技巧。', '参与崔健个人 App 开发。'] },
                ]" :key="exp.company">
                  <div class="timeline-dot" />
                  <div class="timeline-content">
                    <div class="timeline-meta">
                      <span class="timeline-company">{{ exp.company }}</span>
                      <span class="timeline-role">{{ exp.role }}</span>
                      <span class="timeline-period">{{ exp.period }}</span>
                    </div>
                    <ul>
                      <li v-for="b in exp.bullets" :key="b">{{ b }}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <section class="resume-section">
              <h2>核心项目</h2>
              <div class="projects-grid">
                <div class="project-card" v-for="proj in [
                  { title: '集团 ERP2.0 管理平台', desc: '集团化ERP管理后台，覆盖客户、产品、订单、采购、仓储、财务等核心业务模块。主导前端架构设计，集成 AI 代理对话能力。封装 ProTable 通用组件，支撑日均数百用户的业务操作。', tags: ['Vue3', 'TypeScript', 'Element Plus', 'Vite', 'Pinia'] },
                  { title: '骑手 + 仓储管理 + BFF + 聚合配送', desc: '仓储全流程管理，qiankun 微前端接入聚合配送与骑手管理子应用。Monorepo 统一管理依赖与类型。NestJS BFF 统一鉴权透传与下游封装，高德地图 + WebSocket 实时配送追踪。', tags: ['Vue2', 'ElementUI', 'NestJS', 'qiankun', 'RxJS'] },
                  { title: '万能报名小程序', desc: '活动报名与团购接龙微信小程序，动态表单构建、OCR 身份证识别、微信支付集成、Canvas 分享海报、分账提现全流程。uni-app 多端编译 + 分包加载优化。', tags: ['uni-app', 'ECharts', 'Canvas', 'OCR', 'Webpack'] },
                  { title: 'AI 对话后端服务', desc: '为 ERP 场景提供流式对话能力。SSE 流式接口自定义 type 协议，根据 fileContent/fileType 分流工作流，调用百炼流式接口逐块 yield 实现打字机效果。', tags: ['Python', 'Flask', 'DashScope', '百炼', 'SSE'] },
                ]" :key="proj.title">
                  <div class="project-accent" />
                  <h3>{{ proj.title }}</h3>
                  <p>{{ proj.desc }}</p>
                  <div class="project-tags">
                    <span v-for="t in proj.tags" :key="t" class="project-tag">{{ t }}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 全屏数据大屏覆盖层 -->
    <Transition name="fs-overlay">
      <div v-if="activeOverlay === 'dashboard'" class="exhibition-overlay db-overlay">
        <button class="overlay-close" @click="activeOverlay = 'none'" title="关闭 (Esc)">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
        <DashboardApp />
      </div>
    </Transition>
  </div>
</template>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app {
  width: 100%; height: 100%;
  overflow: hidden;
  background: #000;
  font-family: "Inter", "PingFang SC", "Microsoft YaHei", sans-serif;
}
</style>

<style scoped>
.exhibition-root {
  width: 100%;
  height: 100vh;
  position: relative;
  background: #000;
  overflow: hidden;
}

.exhibition-canvas {
  width: 100%;
  height: 100%;
}

/* 操作提示 */
.exhibition-hint {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  pointer-events: none;
  z-index: 10;
}

.hint-ring {
  width: 48px;
  height: 48px;
  border: 2px solid rgba(129, 140, 248, 0.6);
  border-radius: 50%;
  animation: hint-pulse 2s ease-in-out infinite;
}

.hint-text {
  font-size: 1.7rem;
  color: rgba(148, 163, 184, 0.9);
  letter-spacing: 0.05em;
}

.hint-keys {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
}

.hint-keys kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 48px;
  padding: 0 12px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 4px;
  color: #94a3b8;
  font-size: 1.4rem;
  font-family: "JetBrains Mono", monospace;
}

.hint-sep {
  color: #475569;
  font-size: 1.4rem;
  margin: 0 4px;
}

.hint-fade-enter-active { transition: opacity 0.5s ease; }
.hint-fade-leave-active { transition: opacity 0.3s ease; }
.hint-fade-enter-from,
.hint-fade-leave-to { opacity: 0; }

/* 全屏覆盖层 */
.exhibition-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  overflow-y: auto;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.overlay-content {
  width: 100%;
  min-height: 100%;
  padding: 60px 40px 80px;
}

.overlay-close {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 101;
}
.overlay-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #f1f5f9;
}

/* 简历全屏内容 */
.resume-full { max-width: 900px; margin: 0 auto; color: #e2e8f0; }
.resume-header { text-align: center; margin-bottom: 48px; }

.resume-accent {
  width: 48px;
  height: 3px;
  background: linear-gradient(90deg, #4F46E5, #818CF8);
  margin: 0 auto 24px;
}

.resume-header h1 {
  font-size: 2.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #f1f5f9;
  margin: 0 0 8px;
}

.resume-title { font-size: 1.1rem; color: #818CF8; margin: 0 0 6px; }
.resume-subtitle { font-size: 1.7rem; color: #64748b; margin: 0; }

.resume-section { margin-bottom: 48px; }
.resume-section h2 {
  font-size: 1.15rem; font-weight: 600; color: #c7d2fe;
  margin: 0 0 20px; letter-spacing: 0.02em;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.skill-group h3 { font-size: 0.8rem; font-weight: 500; color: #818CF8; margin: 0 0 8px; }
.skill-group ul { list-style: none; display: flex; flex-wrap: wrap; gap: 12px; }
.skill-group li {
  font-size: 0.78rem; color: #94a3b8; padding: 3px 10px;
  background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.06);
  border-radius: 4px; font-family: "JetBrains Mono", monospace;
}

.timeline { position: relative; padding-left: 24px; }
.timeline::before {
  content: ''; position: absolute; left: 6px; top: 8px; bottom: 8px;
  width: 1px; background: rgba(255,255,255,0.08);
}
.timeline-item { position: relative; margin-bottom: 32px; }
.timeline-dot {
  position: absolute; left: -20px; top: 6px; width: 8px; height: 8px;
  border-radius: 50%; background: #4F46E5; border: 2px solid #1e1b4b;
}
.timeline-meta { display: flex; align-items: baseline; gap: 12px; margin-bottom: 10px; flex-wrap: wrap; }
.timeline-company { font-size: 1rem; font-weight: 600; color: #f1f5f9; }
.timeline-role { font-size: 1.7rem; color: #818CF8; }
.timeline-period { font-size: 0.75rem; color: #64748b; font-family: "JetBrains Mono", monospace; margin-left: auto; }
.timeline-content ul { list-style: none; }
.timeline-content li { font-size: 0.82rem; color: #94a3b8; line-height: 1.7; padding-left: 12px; position: relative; }
.timeline-content li::before { content: '—'; position: absolute; left: 0; color: #475569; }

.projects-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
.project-card {
  padding: 20px; background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06); border-radius: 8px; position: relative;
}
.project-accent {
  position: absolute; top: 0; left: 0; right: 0; height: 2px;
  background: linear-gradient(90deg, #4F46E5, #818CF8); border-radius: 8px 8px 0 0;
}
.project-card h3 { font-size: 0.95rem; font-weight: 600; color: #f1f5f9; margin: 0 0 8px; }
.project-card p { font-size: 0.78rem; color: #94a3b8; line-height: 1.6; margin: 0 0 12px; }
.project-tags { display: flex; flex-wrap: wrap; gap: 5px; }
.project-tag {
  font-size: 0.68rem; color: #64748b; padding: 2px 7px;
  background: rgba(79,70,229,0.1); border: 1px solid rgba(79,70,229,0.15);
  border-radius: 3px; font-family: "JetBrains Mono", monospace;
}

.fs-overlay-enter-active { transition: opacity 0.5s ease; }
.fs-overlay-leave-active { transition: opacity 0.3s ease; }
.fs-overlay-enter-from,
.fs-overlay-leave-to { opacity: 0; }

/* ═══ 数据大屏覆盖层 ═══ */
.db-overlay {
  padding: 0 !important;
  width: 100%;
  height: 100%;
}

/* 摇杆 */
.joystick-container {
  position: fixed;
  bottom: 40px;
  left: 40px;
  width: 120px;
  height: 120px;
  z-index: 50;
  touch-action: none;
}

.joystick-base {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(15, 23, 42, 0.45);
  border: 2px solid rgba(129, 140, 248, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.joystick-thumb {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(129, 140, 248, 0.6), rgba(79, 70, 229, 0.4));
  border: 2px solid rgba(129, 140, 248, 0.5);
  position: absolute;
  transition: none;
}

@media (pointer: fine) {
  .joystick-container { display: none; }
}

@media (max-width: 768px) {
  .overlay-content { padding: 40px 20px 60px; }
  .skills-grid { grid-template-columns: 1fr; }
  .projects-grid { grid-template-columns: 1fr; }
  .timeline-meta { flex-direction: column; gap: 2px; }
  .timeline-period { margin-left: 0; }

  .exhibition-hint { bottom: 160px; }
  .hint-text { font-size: 1.3rem; }
  .hint-keys { gap: 8px; }
  .hint-keys kbd { min-width: 36px; height: 36px; font-size: 1.0rem; padding: 0 8px; }
  .hint-sep { font-size: 1.0rem; }
}
</style>
