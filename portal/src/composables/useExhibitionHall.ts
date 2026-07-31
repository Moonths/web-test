/**
 * useExhibitionHall — 3D 展厅场景
 * 封闭黑墙房间 + 地板 + 天花板 + 氛围灯光
 */

import { ref, type Ref } from 'vue'
import * as THREE from 'three'

export interface HallSceneState {
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  renderer: THREE.WebGLRenderer
  clock: THREE.Clock
  paused: Ref<boolean>
  container: HTMLElement | null
  isFocused: Ref<boolean>
}

let animationId = 0
const callbacks: Array<(delta: number, elapsed: number) => void> = []

// 展厅尺寸常量
export const HALL = {
  width: 28,
  depth: 23,
  height: 13,
}


// 弧形墙壁参数

// 主屏幕位置（弧形顶点）（后墙中央）
export const MAIN_SCREEN = {
  x: 0,
  y: 6.0,
  z: -10.5,
  width: 12.1,
  height: 6.65,
}

// 项目模块位置 — 左墙1个 + 右墙1个
// 靠近主屏幕的两个原位置已改为落地魔镜（见 useMagicMirrors）
export const PROJECT_SLOTS = [
  { x: -12, y: 7.0, z: 3, width: 6.5, height: 5, label: '项目二', projectIndex: 1 },
  { x: 12,  y: 7.0, z: 3, width: 6.5, height: 5, label: '项目四', projectIndex: 3 },
]

// 落地魔镜位置 — 主屏幕两侧（原「项目一」「项目三」位置）
export const MIRROR_SLOTS = {
  left:  { x: -8, z: -6 },
  right: { x: 12,  z: -8 },
}

export function useExhibitionHall(canvasContainer: Ref<HTMLElement | null>) {
  const paused = ref(false)
  const isFocused = ref(false)
  let state: HallSceneState | null = null

  function init() {
    if (!canvasContainer.value) return null

    const container = canvasContainer.value
    const { width, height } = container.getBoundingClientRect()

    const scene = new THREE.Scene()

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 50)
    camera.position.set(0, 2.5, 5)
    camera.lookAt(0, 1.5, -4)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.0
    renderer.setClearColor('#000000')
    container.appendChild(renderer.domElement)

    const clock = new THREE.Clock()

    state = {
      scene, camera, renderer, clock,
      paused, isFocused,
      container,
    }

    buildHall(scene)
    setupLighting(scene)
    createAtmosphereParticles(scene)

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
        const mat = obj.material
        if (mat instanceof THREE.Material) {
          if (mat instanceof THREE.MeshStandardMaterial && mat.map) mat.map.dispose()
          mat.dispose()
        } else if (Array.isArray(mat)) {
          mat.forEach((m: THREE.Material) => {
            if (m instanceof THREE.MeshStandardMaterial && m.map) m.map.dispose()
            m.dispose()
          })
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
    init, startRenderLoop, destroy,
    getState: () => state,
    addFrameCallback: (cb: (delta: number, elapsed: number) => void) => {
      callbacks.push(cb)
    },
  }
}

// ====== 展厅结构 ======

function buildHall(scene: THREE.Scene) {
  const width = HALL.width, depth = HALL.depth, height = HALL.height
  const hw = width / 2, hd = depth / 2

  // 墙面：深灰黑，低反光
  const wallMaterial = new THREE.MeshStandardMaterial({
    color: '#0a0a0a', roughness: 0.6, metalness: 0.1,
  })
  // 地板：比墙面略亮，略带金属反光
  const floorMaterial = new THREE.MeshStandardMaterial({
    color: '#1a1a1a', roughness: 0.35, metalness: 0.25,
  })
  // 天花板：最暗
  const ceilingMaterial = new THREE.MeshStandardMaterial({
    color: '#0d0d0d', roughness: 0.7, metalness: 0.05,
  })

 // 地板
 const floorGeo = new THREE.PlaneGeometry(width, depth)
 const floor = new THREE.Mesh(floorGeo, floorMaterial)
 floor.rotation.x = -Math.PI / 2
 floor.position.y = 0
 floor.receiveShadow = true
 scene.add(floor)

  createFloorGrid(scene, width, depth)
  createFloorEdgeGlow(scene, width, depth)     // 地板边缘发光带
  createWallCornerStrips(scene, width, depth, height) // 墙角发光竖条
  createWallBaseStrips(scene, width, depth)    // 墙脚发光带
  createWallTopStrips(scene, width, depth, height) // 墙顶发光带
  createCeilingPanels(scene, width, depth, height)  // 天花板灯槽

  // 天花板
  const ceilingGeo = new THREE.PlaneGeometry(width, depth)
  const ceiling = new THREE.Mesh(ceilingGeo, ceilingMaterial)
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.y = height
  scene.add(ceiling)
  scene.userData.ceiling = ceiling

  // 后墙 welcome 文字
  createWelcomeSign(scene, width, height, hd)

 // 四面墙
 scene.userData.wallBack  = createWall(scene, 0, height / 2, -hd, width, height, wallMaterial)
 scene.userData.wallFront = createWall(scene, 0, height / 2, hd, width, height, wallMaterial)
  scene.userData.wallLeft  = createWall(scene, -hw, height / 2, 0, depth, height, wallMaterial, 1)
  scene.userData.wallRight = createWall(scene, hw, height / 2, 0, depth, height, wallMaterial, -1)
}

function createWall(
  scene: THREE.Scene, x: number, y: number, z: number,
  w: number, h: number, material: THREE.Material, sideDir = 0,
) {
  const geo = new THREE.PlaneGeometry(w, h)
  const mesh = new THREE.Mesh(geo, material)
  mesh.position.set(x, y, z)
  if (sideDir !== 0) mesh.rotation.y = sideDir * Math.PI / 2
  mesh.receiveShadow = true
  scene.add(mesh)
  return mesh
}

function createWelcomeSign(scene: THREE.Scene, width: number, height: number, hd: number) {
  const canvas = document.createElement('canvas')
  canvas.width = 2048
  canvas.height = 512
  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  ctx.font = 'bold 160px "JetBrains Mono","Courier New",monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // 最外层大面积光晕
  ctx.shadowColor = 'rgba(129,140,248,0.4)'
  ctx.shadowBlur = 80
  ctx.fillStyle = 'rgba(165,180,252,0.6)'
  ctx.fillText('WELCOME', canvas.width / 2, canvas.height / 2)

  // 中层辉光
  ctx.shadowColor = 'rgba(199,210,254,0.7)'
  ctx.shadowBlur = 40
  ctx.fillStyle = 'rgba(199,210,254,0.75)'
  ctx.fillText('WELCOME', canvas.width / 2, canvas.height / 2)

  // 文字主体亮色
  ctx.shadowColor = 'rgba(224,231,255,0.9)'
  ctx.shadowBlur = 15
  ctx.fillStyle = '#E0E7FF'
  ctx.fillText('WELCOME', canvas.width / 2, canvas.height / 2)

  // 文字核心高光
  ctx.shadowBlur = 0
  ctx.fillStyle = '#FFFFFF'
  ctx.fillText('WELCOME', canvas.width / 2, canvas.height / 2)

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  texture.premultiplyAlpha = true

  const signW = 12
  const signH = signW * (canvas.height / canvas.width)
  const signGeo = new THREE.PlaneGeometry(signW, signH)
  const signMat = new THREE.MeshBasicMaterial({
    map: texture, transparent: true, depthWrite: false, depthTest: true,
    side: THREE.DoubleSide,
  })
  const sign = new THREE.Mesh(signGeo, signMat)
  sign.position.set(0, height / 2 + 1, hd - 0.02)
  sign.rotation.y = Math.PI
  scene.add(sign)
  scene.userData.welcomeSign = sign
}


function createFloorGrid(scene: THREE.Scene, width: number, depth: number) {
  const gridGroup = new THREE.Group()
  // 发光网格线 — 靛蓝色调
  const lineMat = new THREE.MeshBasicMaterial({
    color: '#c8b898', transparent: true, opacity: 0.35,
  })
  const step = 1.0
  for (let x = -width / 2; x <= width / 2; x += step) {
    const lineGeo = new THREE.PlaneGeometry(0.03, depth)
    const line = new THREE.Mesh(lineGeo, lineMat)
    line.rotation.x = -Math.PI / 2
    line.position.set(x, 0.006, 0)
    gridGroup.add(line)
  }
  for (let z = -depth / 2; z <= depth / 2; z += step) {
    const lineGeo = new THREE.PlaneGeometry(width, 0.03)
    const line = new THREE.Mesh(lineGeo, lineMat)
    line.rotation.x = -Math.PI / 2
    line.position.set(0, 0.006, z)
    gridGroup.add(line)
  }

  // 粗的参考线（中轴）
  const boldMat = new THREE.MeshBasicMaterial({
    color: '#b8a878', transparent: true, opacity: 0.7,
  })
  // 中心十字
  const cxGeo = new THREE.PlaneGeometry(0.06, depth)
  const cx = new THREE.Mesh(cxGeo, boldMat)
  cx.rotation.x = -Math.PI / 2
  cx.position.set(0, 0.007, 0)
  gridGroup.add(cx)
  const czGeo = new THREE.PlaneGeometry(width, 0.06)
  const cz = new THREE.Mesh(czGeo, boldMat)
  cz.rotation.x = -Math.PI / 2
  cz.position.set(0, 0.007, 0)
  gridGroup.add(cz)

  scene.add(gridGroup)
}

// 地板边缘发光带
function createFloorEdgeGlow(scene: THREE.Scene, width: number, depth: number) {
  const hw = width / 2, hd = depth / 2
  const edgeMat = new THREE.MeshBasicMaterial({
    color: '#b8a878', transparent: true, opacity: 0.35,
  })
  const thickness = 0.08
  const y = 0.005

  const edges = [
    { x: 0,  z: -hd, w: width, h: thickness },  // 后
    { x: 0,  z: hd,  w: width, h: thickness },  // 前
    { x: -hw, z: 0,  w: thickness, h: depth },  // 左
    { x: hw,  z: 0,  w: thickness, h: depth },  // 右
  ]
  for (const e of edges) {
    const geo = new THREE.PlaneGeometry(e.w, e.h)
    const line = new THREE.Mesh(geo, edgeMat)
    line.rotation.x = -Math.PI / 2
    line.position.set(e.x, y, e.z)
    scene.add(line)
  }
}

// 墙角发光竖条
function createWallCornerStrips(scene: THREE.Scene, width: number, depth: number, height: number) {
  const hw = width / 2, hd = depth / 2
  const stripMat = new THREE.MeshBasicMaterial({
    color: '#c8c0a8', transparent: true, opacity: 0.2,
  })
  const stripW = 0.06

  const corners = [
    { x: -hw, z: -hd, ry: 0 },
    { x: hw,  z: -hd, ry: 0 },
    { x: -hw, z: hd,  ry: 0 },
    { x: hw,  z: hd,  ry: 0 },
  ]
  for (const c of corners) {
    const geo = new THREE.PlaneGeometry(stripW, height)
    const strip = new THREE.Mesh(geo, stripMat)
    strip.position.set(c.x, height / 2, c.z)
    scene.add(strip)
  }
}

// 墙脚发光带
function createWallBaseStrips(scene: THREE.Scene, width: number, depth: number) {
  const hw = width / 2, hd = depth / 2
  const stripMat = new THREE.MeshBasicMaterial({
    color: '#c8b898', transparent: true, opacity: 0.3,
  })
  const stripH = 0.12
  const y = stripH / 2

  // 后墙底部
  const backGeo = new THREE.PlaneGeometry(width, stripH)
  const back = new THREE.Mesh(backGeo, stripMat)
  back.position.set(0, y, -hd + 0.001)
  scene.add(back)
  // 前墙底部
  const frontGeo = new THREE.PlaneGeometry(width, stripH)
  const front = new THREE.Mesh(frontGeo, stripMat)
  front.position.set(0, y, hd - 0.001)
  scene.add(front)
  // 左墙底部
  const leftGeo = new THREE.PlaneGeometry(depth, stripH)
  const left = new THREE.Mesh(leftGeo, stripMat)
  left.position.set(-hw + 0.001, y, 0)
  left.rotation.y = Math.PI / 2
  scene.add(left)
  // 右墙底部
  const rightGeo = new THREE.PlaneGeometry(depth, stripH)
  const right = new THREE.Mesh(rightGeo, stripMat)
  right.position.set(hw - 0.001, y, 0)
  right.rotation.y = Math.PI / 2
  scene.add(right)
}

// 墙顶发光带
function createWallTopStrips(scene: THREE.Scene, width: number, depth: number, height: number) {
  const hw = width / 2, hd = depth / 2
  const stripMat = new THREE.MeshBasicMaterial({
    color: '#1a2438', transparent: true, opacity: 0.35,
  })
  const stripH = 0.08
  const y = height - stripH / 2

  const backGeo = new THREE.PlaneGeometry(width, stripH)
  const back = new THREE.Mesh(backGeo, stripMat)
  back.position.set(0, y, -hd + 0.001)
  scene.add(back)
  const frontGeo = new THREE.PlaneGeometry(width, stripH)
  const front = new THREE.Mesh(frontGeo, stripMat)
  front.position.set(0, y, hd - 0.001)
  scene.add(front)
  const leftGeo = new THREE.PlaneGeometry(depth, stripH)
  const left = new THREE.Mesh(leftGeo, stripMat)
  left.position.set(-hw + 0.001, y, 0)
  left.rotation.y = Math.PI / 2
  scene.add(left)
  const rightGeo = new THREE.PlaneGeometry(depth, stripH)
  const right = new THREE.Mesh(rightGeo, stripMat)
  right.position.set(hw - 0.001, y, 0)
  right.rotation.y = Math.PI / 2
  scene.add(right)
}

// 天花板嵌入式灯槽
function createCeilingPanels(scene: THREE.Scene, width: number, depth: number, height: number) {
  const panelMat = new THREE.MeshBasicMaterial({
    color: '#141a28', transparent: true, opacity: 0.3,
  })
  // 中央矩形面板
  const pw = 9, pd = 14
  const pGeo = new THREE.PlaneGeometry(pw, pd)
  const panel = new THREE.Mesh(pGeo, panelMat)
  panel.rotation.x = -Math.PI / 2
  panel.position.set(0, height - 0.01, 0)
  scene.add(panel)

  // 面板边框
  const frameMat = new THREE.MeshBasicMaterial({
    color: '#c8b898', transparent: true, opacity: 0.35,
  })
  const fw = 0.05
  // 前后边
  const fzGeo = new THREE.PlaneGeometry(pw + fw * 2, fw)
  const fzFront = new THREE.Mesh(fzGeo, frameMat)
  fzFront.rotation.x = -Math.PI / 2
  fzFront.position.set(0, height - 0.005, pd / 2)
  scene.add(fzFront)
  const fzBack = new THREE.Mesh(fzGeo, frameMat)
  fzBack.rotation.x = -Math.PI / 2
  fzBack.position.set(0, height - 0.005, -pd / 2)
  scene.add(fzBack)
  // 左右边
  const fxGeo = new THREE.PlaneGeometry(fw, pd)
  const fxLeft = new THREE.Mesh(fxGeo, frameMat)
  fxLeft.rotation.x = -Math.PI / 2
  fxLeft.position.set(-pw / 2, height - 0.005, 0)
  scene.add(fxLeft)
  const fxRight = new THREE.Mesh(fxGeo, frameMat)
  fxRight.rotation.x = -Math.PI / 2
  fxRight.position.set(pw / 2, height - 0.005, 0)
  scene.add(fxRight)
}

// ====== 灯光 ======

function setupLighting(scene: THREE.Scene) {
  const ambient = new THREE.AmbientLight('#fff8f0', 5.0)
  scene.add(ambient)

  // 四个项目模块各自光源
  const projectLightColor = '#ddeeff'
  const projectLightPositions = [
    { x: -11, y: 2.5, z: -8 },
    { x: -11, y: 2.5, z: 3 },
    { x: 11,  y: 2.5, z: -8 },
    { x: 11,  y: 2.5, z: 3 },
  ]
  for (const pp of projectLightPositions) {
    const pLight = new THREE.PointLight(projectLightColor, 10, 14, 1.5)
    pLight.position.set(pp.x, pp.y, pp.z)
    scene.add(pLight)
  }

  const spotTarget = new THREE.Object3D()
  spotTarget.position.set(MAIN_SCREEN.x, MAIN_SCREEN.y, MAIN_SCREEN.z)
  scene.add(spotTarget)

  const spots = [
    { x: -3, z: -4 }, { x: 3, z: -4 }, { x: 0, z: -2 },
  ]
  for (const s of spots) {
    const spot = new THREE.SpotLight('#ffe8d0', 5, 15, Math.PI / 6, 0.3, 0.5)
    spot.position.set(s.x, HALL.height - 0.3, s.z)
    spot.target = spotTarget
    spot.castShadow = true
    spot.shadow.mapSize.set(512, 512)
    spot.shadow.bias = -0.0001
    scene.add(spot)
  }

  // 侧墙射灯 — 画廊式照明
  const sideTargets = [
    { x: -10, y: 3, z: 0, targetX: -14, targetZ: 0 },
    { x: 10, y: 3, z: 0, targetX: 14, targetZ: 0 },
  ]
  for (const st of sideTargets) {
    const stTarget = new THREE.Object3D()
    stTarget.position.set(st.targetX, 1.5, st.targetZ)
    scene.add(stTarget)
    const sLight = new THREE.SpotLight('#fff5ee', 5, 10, Math.PI / 5, 0.5, 1)
    sLight.position.set(st.x, HALL.height - 0.3, st.z)
    sLight.target = stTarget
    scene.add(sLight)
  }

  // 墙壁底部洗墙灯
  const stripColor = '#c8b898'
  const stripPositions = [
    { x: -9, z: 0 }, { x: 9, z: 0 }, { x: 0, z: -7.8 },
  ]
  for (const sp of stripPositions) {
    const stripLight = new THREE.PointLight(stripColor, 2, 8)
    stripLight.position.set(sp.x, 0.15, sp.z)
    scene.add(stripLight)
  }

  scene.userData.ambientLight = ambient
}

// ====== 氛围粒子 ======

function createAtmosphereParticles(scene: THREE.Scene) {
  const count = 300
  const positions = new Float32Array(count * 3)
  const { width, depth, height } = HALL

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * width * 0.9
    positions[i * 3 + 1] = Math.random() * height * 0.9
    positions[i * 3 + 2] = (Math.random() - 0.5) * depth * 0.9
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const mat = new THREE.PointsMaterial({
    size: 0.02, color: '#c8b898',
    blending: THREE.AdditiveBlending, depthWrite: false,
    transparent: true, opacity: 0.3,
  })
  const particles = new THREE.Points(geo, mat)
  scene.add(particles)
  scene.userData.atmosphere = particles
  
  // 收集引导线脉冲点引用
  const guidePulses: THREE.Mesh[] = []
  scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh && (obj as any).userData?.guidePulse) {
      guidePulses.push(obj)
    }
  })
  scene.userData.guidePulses = guidePulses
}
