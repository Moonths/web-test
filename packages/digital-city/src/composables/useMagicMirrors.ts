/**
 * useMagicMirrors — 主屏幕两侧的落地魔镜
 * 左镜：电脑桌 GLB 模型（computer__desk.glb）
 * 右镜：哥特椭圆魔镜，暗色金属框 + 发光内缘，带点击提示光环
 *      （镜面内容后续填充，当前为占位纹理）
 */

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { MIRROR_SLOTS } from './useExhibitionHall'
import type { HallSceneState } from './useExhibitionHall'
import { createHintRing } from './useExhibitionScreens'
import { assetUrl } from '../utils/assetPath'

export interface MirrorObjects {
  leftMirror: THREE.Group
  rightMirror: THREE.Group
  rightSurface: THREE.Mesh
  rightHintRing: THREE.Group
  update: (delta: number, elapsed: number) => void
  dispose: () => void
}

// 右镜（椭圆）：镜面半径
const RIGHT_OVAL = { rx: 1.5, ry: 2.3, centerY: 3.1 }
// 右镜提示环浮动高度
const HINT_BASE_Y = 4.9

export function useMagicMirrors(state: HallSceneState): MirrorObjects {
  const { scene } = state

  // --- 左镜：电脑桌 GLB 模型 ---
  const leftMirror = new THREE.Group()
  placeOnFloor(leftMirror, MIRROR_SLOTS.left.x, MIRROR_SLOTS.left.z)
  scene.add(leftMirror)

  // 异步加载电脑桌模型
  let disposed = false
  const gltfLoader = new GLTFLoader()
  gltfLoader.load(
    assetUrl('models/computer__desk.glb'),
    (gltf) => {
      if (disposed) return
      const model = gltf.scene
      // 缩放至适合展厅的尺寸（原始模型约 1.2m，放大 3.5 倍）
      const s = 3.5
      model.scale.set(s, s, s)

      // 移除模型自带的灰色地面板（Plane 节点），直接使用展厅地板
      const grounds: THREE.Mesh[] = []
      model.traverse((child) => {
        if (
          child instanceof THREE.Mesh &&
          (/plane/i.test(child.name) || /plane/i.test(child.parent?.name ?? ''))
        ) {
          grounds.push(child)
        }
      })
      for (const g of grounds) g.parent?.remove(g)

      // 底部对齐展厅地面（去掉自带地面后重新计算包围盒）
      const box = new THREE.Box3().setFromObject(model)
      model.position.set(0, -box.min.y + 0.01, 0)

      // 开启阴影
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
          // 修复 GLB 纹理颜色空间（Three.js 默认 Linear → 改为 SRGB）
          const mats = Array.isArray(child.material) ? child.material : [child.material]
          for (const m of mats) {
            if (m.map) {
              m.map.colorSpace = THREE.SRGBColorSpace
              m.map.needsUpdate = true
            }
          }
        }
      })

      leftMirror.add(model)
    },
    undefined,
    (err) => {
      console.warn('[MagicMirrors] Failed to load computer desk GLB:', err)
    },
  )

  // --- 右镜：魔镜 ---
  const { group: rightMirror, surface: rightSurface, glowRing } = buildGothicMirror()
  placeOnFloor(rightMirror, MIRROR_SLOTS.right.x, MIRROR_SLOTS.right.z)
  scene.add(rightMirror)

  // 右镜提示光环 — 与主屏幕同款圆点特效
  const rightHintRing = createHintRing()
  const dir = facingDirection(MIRROR_SLOTS.right.x, MIRROR_SLOTS.right.z)
  rightHintRing.position.set(
    MIRROR_SLOTS.right.x + dir.x * 0.8,
    HINT_BASE_Y,
    MIRROR_SLOTS.right.z + dir.z * 0.8,
  )
  rightHintRing.lookAt(0, HINT_BASE_Y, 0)
  scene.add(rightHintRing)

  function update(delta: number, elapsed: number) {
    // 提示环脉冲 + 旋转（与主屏幕一致的节奏）
    rightHintRing.position.y = HINT_BASE_Y + Math.sin(elapsed * 2) * 0.15
    rightHintRing.rotation.z += delta * 0.5
    rightHintRing.scale.setScalar(0.85 + Math.sin(elapsed * 2.5) * 0.15)

    // 魔镜内缘发光呼吸
    glowRing.material.opacity = 0.35 + Math.sin(elapsed * 1.8) * 0.2
  }

  function dispose() {
    disposed = true
    scene.remove(leftMirror)
    scene.remove(rightMirror)
    scene.remove(rightHintRing)
    disposeGroup(leftMirror)
    disposeGroup(rightMirror)
    disposeGroup(rightHintRing)
  }

  return { leftMirror, rightMirror, rightSurface, rightHintRing, update, dispose }
}

// ====== 右镜：哥特椭圆魔镜 ======

function buildGothicMirror(): {
  group: THREE.Group
  surface: THREE.Mesh
  glowRing: THREE.Mesh<THREE.TorusGeometry, THREE.MeshBasicMaterial>
} {
  const group = new THREE.Group()
  const { rx, ry, centerY: cy } = RIGHT_OVAL

  // 暗色金属椭圆边框
  const frameShape = new THREE.Shape()
  frameShape.absellipse(0, 0, rx + 0.3, ry + 0.3, 0, Math.PI * 2, false, 0)
  const hole = new THREE.Path()
  hole.absellipse(0, 0, rx, ry, 0, Math.PI * 2, true, 0)
  frameShape.holes.push(hole)
  const frameGeo = new THREE.ExtrudeGeometry(frameShape, {
    depth: 0.16, bevelEnabled: false, curveSegments: 64,
  })
  const frameMat = new THREE.MeshStandardMaterial({
    color: '#1b1e2e', roughness: 0.35, metalness: 0.85,
  })
  const frame = new THREE.Mesh(frameGeo, frameMat)
  frame.position.set(0, cy, -0.12)
  frame.castShadow = true
  group.add(frame)

  // 镜面（占位内容，后续替换为实际展示内容）
  const surfaceGeo = new THREE.ShapeGeometry(ellipseShape(rx, ry), 64)
  normalizeUVs(surfaceGeo, -rx, -ry, rx * 2, ry * 2)
  const surfaceTexture = new THREE.CanvasTexture(createMagicPlaceholderCanvas())
  const surface = new THREE.Mesh(
    surfaceGeo,
    new THREE.MeshStandardMaterial({
      map: surfaceTexture,
      roughness: 0.25,
      metalness: 0.1,
      emissive: '#ffffff',
      emissiveMap: surfaceTexture,
      emissiveIntensity: 0.5,
    }),
  )
  surface.position.set(0, cy, 0)
  group.add(surface)

  // 内缘发光环
  const glowRing = new THREE.Mesh(
    new THREE.TorusGeometry(1, 0.035, 12, 96),
    new THREE.MeshBasicMaterial({ color: '#818CF8', transparent: true, opacity: 0.4 }),
  )
  glowRing.scale.set(rx + 0.06, ry + 0.06, 1)
  glowRing.position.set(0, cy, 0.05)
  group.add(glowRing)

  // 顶部哥特尖饰 + 光珠
  const finial = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 24), frameMat)
  finial.position.set(0, cy + ry + 0.55, -0.04)
  group.add(finial)
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 16, 16),
    new THREE.MeshStandardMaterial({
      color: '#A5B4FC', emissive: '#A5B4FC', emissiveIntensity: 2.5,
      roughness: 0.1, metalness: 0.5,
    }),
  )
  orb.position.set(0, cy + ry + 0.95, -0.04)
  group.add(orb)

  // 三叉底座
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 0.5, 20), frameMat)
  stem.position.set(0, cy - ry - 0.1, 0)
  group.add(stem)
  const footGeo = new THREE.BoxGeometry(0.34, 0.12, 1.3)
  for (const a of [-0.5, 0.5]) {
    const foot = new THREE.Mesh(footGeo, frameMat)
    foot.position.set(Math.sin(a) * 0.5, 0.06, Math.cos(a) * 0.3)
    foot.rotation.y = a
    group.add(foot)
  }
  const backFoot = new THREE.Mesh(footGeo, frameMat)
  backFoot.position.set(0, 0.06, -0.45)
  group.add(backFoot)

  return { group, surface, glowRing }
}

// ====== 形状与工具 ======

function ellipseShape(rx: number, ry: number): THREE.Shape {
  const shape = new THREE.Shape()
  shape.absellipse(0, 0, rx, ry, 0, Math.PI * 2, false, 0)
  return shape
}

// ShapeGeometry 的 UV 是原始坐标，归一化到 [0,1] 才能正确贴图
function normalizeUVs(geo: THREE.BufferGeometry, minX: number, minY: number, w: number, h: number) {
  const uv = geo.attributes.uv as THREE.BufferAttribute
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, (uv.getX(i) - minX) / w, (uv.getY(i) - minY) / h)
  }
  uv.needsUpdate = true
}

// 指向房间中心的水平单位向量
function facingDirection(x: number, z: number) {
  const len = Math.hypot(x, z)
  return { x: -x / len, z: -z / len }
}

// 放置到地面并面向房间中心
function placeOnFloor(group: THREE.Group, x: number, z: number) {
  group.position.set(x, 0, z)
  group.rotation.y = Math.atan2(-x, -z)
}

function disposeGroup(root: THREE.Object3D) {
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose()
      const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
      for (const m of mats) {
        if (m instanceof THREE.MeshStandardMaterial) {
          m.map?.dispose()
          m.emissiveMap?.dispose()
        }
        m.dispose()
      }
    }
  })
}

// ====== 魔镜占位纹理 ======

function createMagicPlaceholderCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 768
  const ctx = canvas.getContext('2d')!

  // 深邃底色
  const bg = ctx.createRadialGradient(256, 360, 40, 256, 384, 420)
  bg.addColorStop(0, '#141a38')
  bg.addColorStop(0.55, '#0a0d20')
  bg.addColorStop(1, '#05060f')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, 512, 768)

  // 星云光斑
  const blobs = [
    { x: 180, y: 260, r: 130, c: 'rgba(99,102,241,0.22)' },
    { x: 330, y: 420, r: 150, c: 'rgba(139,92,246,0.16)' },
    { x: 230, y: 540, r: 110, c: 'rgba(56,189,248,0.10)' },
  ]
  for (const b of blobs) {
    const g = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r)
    g.addColorStop(0, b.c)
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2)
    ctx.fill()
  }

  // 星点
  for (let i = 0; i < 90; i++) {
    const x = Math.random() * 512
    const y = Math.random() * 768
    const r = Math.random() * 1.4 + 0.3
    ctx.fillStyle = `rgba(199,210,254,${Math.random() * 0.5 + 0.15})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // 内圈描边
  ctx.strokeStyle = 'rgba(129,140,248,0.35)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.ellipse(256, 384, 226, 350, 0, 0, Math.PI * 2)
  ctx.stroke()

  return canvas
}
