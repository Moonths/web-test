<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import * as THREE from 'three'
import { loadMicroApp } from 'qiankun'
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

const router = useRouter()
const route = useRoute()

const canvasContainer = ref<HTMLElement | null>(null)
const showHint = ref(true)
const activeOverlay = ref<'resume' | 'dashboard' | null>(null)
const overlayLoading = ref(false)
const overlayError = ref('')
let currentMicroApp: any = null
let mountTimeout: ReturnType<typeof setTimeout> | null = null
let is3DReady = false

// Joystick state
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
  if (dist < J_DEAD_ZONE) { for (const k of jKeys) jDispatch(k, false); jKeys.clear(); return }
  const newKeys = new Set<string>()
  if (dy < -J_DEAD_ZONE) newKeys.add('w')
  if (dy > J_DEAD_ZONE) newKeys.add('s')
  if (dx < -J_DEAD_ZONE) newKeys.add('a')
  if (dx > J_DEAD_ZONE) newKeys.add('d')
  for (const k of newKeys) { if (!jKeys.has(k)) jDispatch(k, true) }
  for (const k of jKeys) { if (!newKeys.has(k)) jDispatch(k, false) }
  jKeys.clear()
  for (const k of newKeys) jKeys.add(k)
}
function onJoystickStart(e: TouchEvent) { e.preventDefault(); const t = e.changedTouches[0]; jTouchId = t.identifier; jActive.value = true; jThumbX.value = 0; jThumbY.value = 0 }
function onJoystickMove(e: TouchEvent) {
  e.preventDefault()
  let t: Touch | null = null
  for (let i = 0; i < e.changedTouches.length; i++) { if (e.changedTouches[i].identifier === jTouchId) { t = e.changedTouches[i]; break } }
  if (!t) return
  const base = document.querySelector('.joystick-base')!
  const rect = base.getBoundingClientRect()
  let dx = t.clientX - (rect.left + rect.width / 2)
  let dy = t.clientY - (rect.top + rect.height / 2)
  const dist = Math.hypot(dx, dy)
  if (dist > J_RADIUS) { dx = dx / dist * J_RADIUS; dy = dy / dist * J_RADIUS }
  jThumbX.value = dx; jThumbY.value = dy; jUpdateDir(dx, dy)
}
function onJoystickEnd(e: TouchEvent) { e.preventDefault(); for (const k of jKeys) jDispatch(k, false); jKeys.clear(); jActive.value = false; jThumbX.value = 0; jThumbY.value = 0; jTouchId = null }

const { init, startRenderLoop, destroy, getState, addFrameCallback } = useExhibitionHall(canvasContainer)
let character: CharacterController | null = null
let lastCharPos = new THREE.Vector3()
let charMoveTimer = 0
let screens: ScreenObjects | null = null
let mirrors: MirrorObjects | null = null
let orbitCamera: OrbitCamera | null = null
let codeFlow: CodeFlowResult | null = null
let ceilingFlow: CeilingFlowResult | null = null

function unmountCurrentMicroApp() {
  if (mountTimeout) { clearTimeout(mountTimeout); mountTimeout = null }
  if (currentMicroApp) { currentMicroApp.unmount(); currentMicroApp = null }
}

// 环境感知的 qiankun entry URL
const RESUME_ENTRY = import.meta.env.DEV ? '//localhost:5173' : '/subapps/resume/index.html'
const DASHBOARD_ENTRY = import.meta.env.DEV ? '//localhost:5199' : '/subapps/dashboard/index.html'

function loadSubApp(name: 'resume' | 'dashboard') {
  overlayError.value = ''
  overlayLoading.value = true
  unmountCurrentMicroApp()
  activeOverlay.value = name
  showHint.value = false

  const entry = name === 'resume' ? RESUME_ENTRY : DASHBOARD_ENTRY

  nextTick(() => {
    // 检查挂载点是否存在
    const mountPoint = document.querySelector('#subapp-viewport')
    if (!mountPoint) {
      overlayLoading.value = false
      overlayError.value = '挂载点未就绪，请重试'
      return
    }

    try {
      currentMicroApp = loadMicroApp({ name, entry, container: '#subapp-viewport' })

      // 添加超时：10 秒后仍未完成认定为加载失败
      mountTimeout = setTimeout(() => {
        if (overlayLoading.value) {
          overlayLoading.value = false
          overlayError.value = `${name === 'resume' ? '简历' : '大屏'}加载超时，请确保子应用已启动（pnpm dev）`
          unmountCurrentMicroApp()
        }
      }, 10000)

      currentMicroApp.mountPromise!
        .then(() => {
          overlayLoading.value = false
          if (mountTimeout) { clearTimeout(mountTimeout); mountTimeout = null }
        })
        .catch((err: any) => {
          overlayLoading.value = false
          if (mountTimeout) { clearTimeout(mountTimeout); mountTimeout = null }
          overlayError.value = `${name === 'resume' ? '简历' : '大屏'}加载失败，请确保子应用已启动（pnpm dev:${name}）`
          console.error(`[qiankun] ${name} mount error:`, err)
        })
    } catch (err) {
      overlayLoading.value = false
      if (mountTimeout) { clearTimeout(mountTimeout); mountTimeout = null }
      overlayError.value = `${name === 'resume' ? '简历' : '大屏'}加载异常`
      console.error(`[qiankun] ${name} load error:`, err)
    }
  })
}

function closeOverlay() {
  unmountCurrentMicroApp()
  overlayLoading.value = false
  overlayError.value = ''
  activeOverlay.value = null
  // 路由回退到首页
  if (route.name !== 'home') {
    router.push('/')
  }
}

// ====== 路由同步 ======
watch(
  () => route.name,
  (name) => {
    if (!is3DReady) return
    if (name === 'resume' && !activeOverlay.value) {
      loadSubApp('resume')
    } else if (name === 'dashboard' && !activeOverlay.value) {
      loadSubApp('dashboard')
    } else if ((name === 'home' || !name) && activeOverlay.value) {
      closeOverlay()
    }
  },
)

onMounted(() => {
  const state = init()
  if (!state) return
  ;(window as any).__hallState = state
  orbitCamera = useOrbitCamera(state.camera, state.renderer.domElement)
  character = useCharacter(state.scene)
  screens = useExhibitionScreens(state)
  mirrors = useMagicMirrors(state)
  codeFlow = useCodeFlow(
    state.scene.userData.wallBack ?? null, state.scene.userData.wallFront ?? null,
    state.scene.userData.wallLeft ?? null, state.scene.userData.wallRight ?? null,
  )
  ceilingFlow = useCeilingFlow(state.scene.userData.ceiling ?? null)

  addFrameCallback((delta, elapsed) => {
    screens?.update(delta, elapsed)
    mirrors?.update(delta, elapsed)
    const gp = state.scene.userData.guidePulses as THREE.Mesh[] | undefined
    if (gp) {
      for (const p of gp) {
        const d = (p as any).userData.guidePulse
        if (d) {
          const s = 0.6 + Math.sin(elapsed * 4 + d.offset) * 0.4
          p.scale.setScalar(s)
          ;(p.material as THREE.MeshBasicMaterial).opacity = 0.2 + Math.sin(elapsed * 4 + d.offset) * 0.3
        }
      }
    }
  })
  addFrameCallback((_delta, elapsed) => { codeFlow?.update(elapsed); ceilingFlow?.update(elapsed) })
  addFrameCallback((delta, elapsed) => {
    if (character && orbitCamera) {
      const pos = character.getPosition()
      const moved = pos.distanceToSquared(lastCharPos) > 0.0001
      lastCharPos.copy(pos)
      if (moved) charMoveTimer = 0.3
      else charMoveTimer = Math.max(0, charMoveTimer - delta)
      orbitCamera.setTargetDistance(charMoveTimer > 0 ? 14 : 30)
      character.update(delta, elapsed, orbitCamera.getAzimuth())
    }
    orbitCamera?.update(delta)
  })
  ;(window as any).__debugScreens = screens
  ;(window as any).__debugState = state

  // 3D 就绪后同步一次路由
  is3DReady = true
  const currentName = route.name
  if (currentName === 'resume') {
    loadSubApp('resume')
  } else if (currentName === 'dashboard') {
    loadSubApp('dashboard')
  }

  const raycaster = new THREE.Raycaster()
  const mouse = new THREE.Vector2()

  function onCanvasClick(e: MouseEvent) {
    if (!state || !screens || activeOverlay.value) return
    const rect = canvasContainer.value!.getBoundingClientRect()
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    raycaster.setFromCamera(mouse, state.camera)

    // 主屏幕 → 简历
    const mainHits = raycaster.intersectObjects(
      [screens.mainScreen, screens.mainScreenGlow, ...screens.hintRing.children], true)
    if (mainHits.length > 0) {
      router.push('/resume')
      return
    }

    // 右侧白板 → 大屏（使用 mirrors.rightClickZone）
    if (mirrors) {
      const wbTargets = [mirrors.rightClickZone, mirrors.rightHintRing].filter(Boolean) as THREE.Object3D[]
      const wbHits = raycaster.intersectObjects(wbTargets, true)
      if (wbHits.length > 0) {
        router.push('/dashboard')
        return
      }
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    if ((e.key === 'Enter' || e.key === 'e' || e.key === 'E') && !activeOverlay.value) {
      router.push('/resume')
      return
    }
    if (e.key === 'Escape' && activeOverlay.value) {
      closeOverlay()
    }
  }

  state.renderer.domElement.addEventListener('click', onCanvasClick)
  let _md = false, _msx = 0, _msy = 0
  state.renderer.domElement.addEventListener('mousedown', (e: MouseEvent) => {
    _md = true; _msx = e.clientX; _msy = e.clientY; (window as any).__dragMoved = false
  })
  state.renderer.domElement.addEventListener('mousemove', (e: MouseEvent) => {
    if (_md && Math.hypot(e.clientX - _msx, e.clientY - _msy) > 5) (window as any).__dragMoved = true
  })
  window.addEventListener('mouseup', () => { _md = false })
  state.renderer.domElement.addEventListener('click', (e: MouseEvent) => {
    if ((window as any).__dragMoved) e.stopImmediatePropagation()
  }, true)
  window.addEventListener('keydown', onKeyDown)

  state.scene.userData.cleanup = () => {
    state!.renderer.domElement.removeEventListener('click', onCanvasClick)
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('mouseup', () => { _md = false })
    ;(window as any).__dragMoved = false
    _md = false
  }

  startRenderLoop()
  setTimeout(() => { showHint.value = false }, 8000)
})

onBeforeUnmount(() => {
  unmountCurrentMicroApp()
  const state = getState()
  if (state?.scene.userData.cleanup) (state.scene.userData.cleanup as () => void)()
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

    <Transition name="hint-fade">
      <div v-if="showHint && !activeOverlay" class="exhibition-hint">
        <div class="hint-text">拖拽鼠标旋转视角 · 滚轮缩放 · 点击屏幕查看简历</div>
        <div class="hint-keys">
          <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd>
          <span class="hint-sep">移动</span>
          <kbd>Enter</kbd><span class="hint-sep">聚焦</span>
          <kbd>Esc</kbd><span class="hint-sep">退出</span>
        </div>
        <div class="hint-detail">主屏幕 &rarr; 简历 &middot; 右侧白板 &rarr; 大屏看板</div>
      </div>
    </Transition>

    <div class="joystick-container" v-show="!activeOverlay"
         @touchstart="onJoystickStart" @touchmove="onJoystickMove"
         @touchend="onJoystickEnd" @touchcancel="onJoystickEnd">
      <div class="joystick-base">
        <div class="joystick-thumb" :style="{ transform: 'translate(' + jThumbX + 'px, ' + jThumbY + 'px)' }" />
      </div>
    </div>

    <!-- ===== 微前端子应用覆盖层 ===== -->
    <Transition name="fs-overlay">
      <div v-if="activeOverlay" class="exhibition-overlay">
        <div class="overlay-content" :class="{ 'db-content': activeOverlay === 'dashboard' }">
          <button class="overlay-close" @click="closeOverlay" title="关闭 (Esc)">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <!-- 加载状态 -->
          <div v-if="overlayLoading" class="overlay-status">
            <div class="overlay-spinner" />
            <span>加载中...</span>
          </div>
          <!-- 错误状态 -->
          <div v-else-if="overlayError" class="overlay-status overlay-status--error">
            <span>{{ overlayError }}</span>
          </div>
          <!-- qiankun 子应用挂载点 -->
          <div id="subapp-viewport" :class="{ 'db-viewport': activeOverlay === 'dashboard' }" />
        </div>
      </div>
    </Transition>
  </div>
</template>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; background: #000; font-family: "Inter", "PingFang SC", "Microsoft YaHei", sans-serif; }
</style>

<style scoped>
.exhibition-root { width: 100%; height: 100vh; position: relative; background: #000; overflow: hidden; }
.exhibition-canvas { width: 100%; height: 100%; }
.exhibition-hint { position: absolute; bottom: 120px; left: 50%; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; gap: 10px; pointer-events: none; z-index: 10; }
.hint-text { font-size: 1.7rem; color: rgba(148,163,184,0.9); letter-spacing: 0.05em; }
.hint-keys { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; justify-content: center; }
.hint-keys kbd { display: inline-flex; align-items: center; justify-content: center; min-width: 48px; height: 48px; padding: 0 12px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12); border-radius: 4px; color: #94a3b8; font-size: 1.4rem; font-family: "JetBrains Mono", monospace; }
.hint-sep { color: #475569; font-size: 1.4rem; margin: 0 4px; }
.hint-detail { font-size: 1.2rem; color: rgba(129,140,248,0.7); letter-spacing: 0.03em; margin-top: 4px; }
.hint-fade-enter-active { transition: opacity 0.5s ease; }
.hint-fade-leave-active { transition: opacity 0.3s ease; }
.hint-fade-enter-from, .hint-fade-leave-to { opacity: 0; }
.exhibition-overlay { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.95); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); overflow-y: auto; display: flex; justify-content: center; }
.overlay-content { width: 100%; max-width: 900px; padding: 60px 40px 80px; position: relative; }
.overlay-content.db-content { max-width: none; padding: 60px 12px 40px; }
.overlay-close { position: fixed; top: 20px; right: 20px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #64748b; cursor: pointer; transition: all 0.2s; z-index: 101; }
.overlay-close:hover { background: rgba(255,255,255,0.1); color: #f1f5f9; }
.fs-overlay-enter-active { transition: opacity 0.5s ease; }
.fs-overlay-leave-active { transition: opacity 0.3s ease; }
.fs-overlay-enter-from, .fs-overlay-leave-to { opacity: 0; }
.joystick-container { position: fixed; bottom: 40px; left: 40px; width: 120px; height: 120px; z-index: 50; touch-action: none; }
.joystick-base { width: 100%; height: 100%; border-radius: 50%; background: rgba(15,23,42,0.45); border: 2px solid rgba(129,140,248,0.25); display: flex; align-items: center; justify-content: center; position: relative; }
.joystick-thumb { width: 48px; height: 48px; border-radius: 50%; background: radial-gradient(circle, rgba(129,140,248,0.6), rgba(79,70,229,0.4)); border: 2px solid rgba(129,140,248,0.5); position: absolute; transition: none; }
@media (pointer: fine) { .joystick-container { display: none; } }

/* subapp-viewport: 子应用容器 */
#subapp-viewport { width: 100%; min-height: 100%; }
#subapp-viewport.db-viewport { max-width: none; }

/* 加载 & 错误状态 */
.overlay-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 60vh;
  color: #64748b;
  font-size: 0.9rem;
}
.overlay-status--error { color: #f87171; text-align: center; max-width: 400px; line-height: 1.6; }
.overlay-spinner { width: 32px; height: 32px; border: 3px solid rgba(129,140,248,0.15); border-top-color: #818CF8; border-radius: 50%; animation: overlay-spin 0.8s linear infinite; }
@keyframes overlay-spin { to { transform: rotate(360deg); } }
</style>
