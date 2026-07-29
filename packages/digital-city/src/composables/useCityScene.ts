/**
 * useCityScene — Three.js 城市场景核心
 * 管理场景、相机、光照、渲染循环、昼夜循环
 */

import { ref, onUnmounted, type Ref } from 'vue'
import * as THREE from 'three'

export interface CitySceneState {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  clock: THREE.Clock
  /** 0-1: 0=正午, 1=午夜 */
  timeOfDay: Ref<number>
  /** 是否暂停渲染 */
  paused: Ref<boolean>
  /** 当前活动子应用的挂载容器 */
  container: HTMLElement | null
}

let animationId = 0
const callbacks: Array<(delta: number, elapsed: number) => void> = []

export function useCityScene(canvasContainer: Ref<HTMLElement | null>) {
  const timeOfDay = ref(0.3) // 默认下午
  const paused = ref(false)
  let state: CitySceneState | null = null

  function init() {
    if (!canvasContainer.value) return

    const container = canvasContainer.value
    const { width, height } = container.getBoundingClientRect()

    // --- Scene ---
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(getFogColor(0.3), 0.00015)

    // --- Camera: 俯视 60° 等距视角 ---
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.5, 200)
    camera.position.set(18, 16, 18)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    const clock = new THREE.Clock()

    state = {
      scene, camera, renderer, clock,
      timeOfDay, paused,
      container,
    }

    // --- Ambient Light ---
    const ambient = new THREE.AmbientLight('#8899bb', 1.0)
    scene.add(ambient)

    // --- Directional Light (sun) ---
    const sun = new THREE.DirectionalLight('#ffffff', 2.5)
    sun.position.set(20, 25, 10)
    sun.castShadow = true
    sun.shadow.mapSize.set(2048, 2048)
    sun.shadow.camera.near = 0.5
    sun.shadow.camera.far = 80
    sun.shadow.camera.left = -20
    sun.shadow.camera.right = 20
    sun.shadow.camera.top = 20
    sun.shadow.camera.bottom = -20
    sun.shadow.bias = -0.0005
    scene.add(sun)

    // --- Hemisphere Light (sky/ground) ---
    const hemi = new THREE.HemisphereLight('#8899cc', '#445566', 0.6)
    scene.add(hemi)

    // Store light refs for day/night cycle
    scene.userData.sunLight = sun
    scene.userData.ambientLight = ambient
    scene.userData.hemiLight = hemi

    // --- Ground Plane ---
    createGround(scene)

    // --- Resize handler ---
    const onResize = () => {
      if (!state) return
      const rect = container.getBoundingClientRect()
      state.camera.aspect = rect.width / rect.height
      state.camera.updateProjectionMatrix()
      state.renderer.setSize(rect.width, rect.height)
    }
    window.addEventListener('resize', onResize)
    scene.userData.resizeHandler = onResize

    return state
  }

  function startRenderLoop() {
    if (!state) return

    const render = () => {
      animationId = requestAnimationFrame(render)

      if (paused.value) return

      const delta = Math.min(state.clock.getDelta(), 0.1)
      const elapsed = state.clock.getElapsedTime()

      // 执行注册的回调
      for (const cb of callbacks) {
        cb(delta, elapsed)
      }

      state.renderer.render(state.scene, state.camera)
    }

    render()
  }

  function destroy() {
    if (!state) return

    cancelAnimationFrame(animationId)
    callbacks.length = 0

    const onResize = state.scene.userData.resizeHandler as (() => void) | undefined
    if (onResize) window.removeEventListener('resize', onResize)

    state.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose()
        if (obj.material instanceof THREE.Material) {
          obj.material.dispose()
        } else if (Array.isArray(obj.material)) {
          obj.material.forEach(m => m.dispose())
        }
      }
    })

    state.renderer.dispose()
    if (state.renderer.domElement.parentElement) {
      state.renderer.domElement.parentElement.removeChild(state.renderer.domElement)
    }

    state = null
  }

  return {
    init,
    startRenderLoop,
    destroy,
    /** 获取当前状态（建筑系统需要添加到 scene） */
    getState: () => state,
    /** 注册 per-frame 回调 */
    addFrameCallback: (cb: (delta: number, elapsed: number) => void) => {
      callbacks.push(cb)
    },
  }
}

/** 暴露场景状态获取函数（供其他 composable 使用） */
export function getSceneState(): CitySceneState | null {
  // 通过外部注入的方式获取，这里先留空，由 App.vue 桥接
  return (window as any).__citySceneState || null
}

// ---- 工具函数 ----

function createGround(scene: THREE.Scene) {
  const gridSize = 28
  const tileSize = 1
  const colorRoad = '#2a3040'
  const colorBlock = '#1a1f2e'

  // 大地平面
  const groundGeo = new THREE.PlaneGeometry(gridSize, gridSize)
  const groundMat = new THREE.MeshStandardMaterial({
    color: colorBlock,
    roughness: 0.9,
    metalness: 0.1,
  })
  const ground = new THREE.Mesh(groundGeo, groundMat)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -0.05
  ground.receiveShadow = true
  scene.add(ground)

  // 道路网格线
  const gridHelper = new THREE.Group()

  const roadMaterial = new THREE.MeshStandardMaterial({
    color: colorRoad,
    roughness: 1,
    metalness: 0,
  })

  // 水平道路
  for (let z = -12; z <= 12; z += 1) {
    if (z >= -4 && z <= 4 && z !== 0) continue // 建筑区
    const roadGeo = new THREE.PlaneGeometry(gridSize, 0.15)
    const road = new THREE.Mesh(roadGeo, roadMaterial)
    road.rotation.x = -Math.PI / 2
    road.position.set(0, 0, z)
    road.receiveShadow = true
    gridHelper.add(road)
  }

  // 垂直道路
  for (let x = -12; x <= 12; x += 1) {
    if (x === -8 || x === -4 || x === 0 || x === 4 || x === 8) {
      // 主干道 — 更宽
      const roadGeo = new THREE.PlaneGeometry(0.3, gridSize)
      const road = new THREE.Mesh(roadGeo, roadMaterial)
      road.rotation.x = -Math.PI / 2
      road.position.set(x, 0, 0)
      road.receiveShadow = true
      gridHelper.add(road)
    }
  }

  scene.add(gridHelper)

  // 区域标识 — 四块有色地面
  const districtColors = {
    frontend: '#4F46E5',
    mobile: '#7C3AED',
    backend: '#0891B2',
    engineering: '#D97706',
  }

  const districtBounds = [
    { cx: -4.5, cz: 0, w: 7, h: 7, color: districtColors.frontend },
    { cx: 1, cz: 0, w: 3, h: 7, color: districtColors.mobile },
    { cx: 5, cz: 0, w: 3, h: 7, color: districtColors.backend },
    { cx: 9, cz: 0, w: 3, h: 7, color: districtColors.engineering },
  ]

  for (const d of districtBounds) {
    const dGeo = new THREE.PlaneGeometry(d.w, d.h)
    const dMat = new THREE.MeshStandardMaterial({
      color: d.color,
      roughness: 0.95,
      metalness: 0.05,
      transparent: true,
      opacity: 0.08,
    })
    const dMesh = new THREE.Mesh(dGeo, dMat)
    dMesh.rotation.x = -Math.PI / 2
    dMesh.position.set(d.cx, -0.02, d.cz)
    dMesh.receiveShadow = true
    scene.add(dMesh)
  }
}

function getFogColor(tod: number): string {
  // 白天偏白，夜晚偏深蓝黑
  const r = Math.floor(10 + (1 - tod) * 135)
  const g = Math.floor(18 + (1 - tod) * 150)
  const b = Math.floor(32 + (1 - tod) * 140)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}
