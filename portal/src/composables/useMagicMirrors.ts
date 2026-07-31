/**
 * useMagicMirrors — 主屏幕两侧的落地魔镜
 * 左镜：电脑桌 GLB 模型（computer__desk.glb）
 * 右镜：白板 GLB 模型（whiteboard.glb）
 *      带点击提示光环 + 流程图绘画动画
 *      带不可见点击区域（rightClickZone）
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
  rightSurface: THREE.Mesh | null
  /** 不可见的点击区域网格（白板前的大平面），始终可用 */
  rightClickZone: THREE.Mesh
  rightHintRing: THREE.Group
  update: (delta: number, elapsed: number) => void
  dispose: () => void
  loadPromise: Promise<void>
}

const HINT_BASE_Y = 4.9

// ====== 流程图动画配置 ======
const FC_CANVAS_W = 800
const FC_CANVAS_H = 510
const FC_TOTAL = 18 // 秒，完整一轮

interface FCStep {
  tStart: number   // 开始时间 (归一化 0-1)
  tDur: number     // 持续时间 (归一化 0-1)
  draw: (ctx: CanvasRenderingContext2D, progress: number) => void
}

function buildMindMapSteps(W: number, H: number): FCStep[] {
  const cx = W / 2, cy = H / 2
  const steps: FCStep[] = []
  let t = 0
  const next = (dur: number) => { const s = t; t += dur; return s }

  function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + w - r, y)
    ctx.quadraticCurveTo(x + w, y, x + w, y + r)
    ctx.lineTo(x + w, y + h - r)
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
    ctx.lineTo(x + r, y + h)
    ctx.quadraticCurveTo(x, y + h, x, y + h - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
  }

  // 中心节点：圆角矩形
  const cw = 190, ch = 54
  steps.push({
    tStart: next(0.02), tDur: 0.07,
    draw(ctx, p) {
      const per = Math.min(p, 1)
      ctx.save()
      ctx.translate(cx, cy)
      const s = 0.5 + per * 0.5
      ctx.scale(s, s)
      ctx.translate(-cx, -cy)

      ctx.strokeStyle = '#4F46E5'
      ctx.lineWidth = 3
      roundRectPath(ctx, cx - cw/2, cy - ch/2, cw, ch, 12)
      ctx.stroke()

      ctx.fillStyle = 'rgba(79, 70, 229, 0.08)'
      roundRectPath(ctx, cx - cw/2, cy - ch/2, cw, ch, 12)
      ctx.fill()
      ctx.restore()
    }
  })

  steps.push({
    tStart: next(0.01), tDur: 0.01,
    draw(ctx, _p) {
      ctx.fillStyle = '#1e293b'
      ctx.font = '600 20px "Inter", "PingFang SC", sans-serif'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText('毛际可 · 前端工程', cx, cy - 6)
      ctx.font = '400 11px "Inter", sans-serif'
      ctx.fillStyle = '#64748b'
      ctx.fillText('Frontend Engineering Lead', cx, cy + 16)
    }
  })

  // 分支数据
  const branches = [
    { x: 630, y: 80,  label: '技术栈',   subs: ['Vue/React', 'TypeScript', 'Three.js'],  color: '#4F46E5' },
    { x: 720, y: 250, label: '工程化',   subs: ['Monorepo', 'CI/CD', 'Vite'],            color: '#7C3AED' },
    { x: 630, y: 430, label: '架构设计', subs: ['组件库', '微前端', '状态管理'],          color: '#0891B2' },
    { x: 170, y: 430, label: '质量保障', subs: ['单元测试', 'E2E', 'Code Review'],        color: '#D97706' },
    { x: 80,  y: 250, label: '可视化',   subs: ['WebGL', 'Canvas', 'D3.js'],             color: '#059669' },
    { x: 170, y: 80,  label: '全栈能力', subs: ['Node.js', 'Python', '数据库'],          color: '#DC2626' },
  ]

  const bw = 140, bh = 110

  for (const b of branches) {
    const dx = b.x - cx, dy = b.y - cy
    const dist = Math.hypot(dx, dy)
    const nx = dx / dist, ny = dy / dist
    const lineEnd = dist - bh * 0.4

    // 连线：从中心到节点
    steps.push({
      tStart: next(0.015), tDur: 0.045,
      draw(ctx, p) {
        const ep = Math.min(p, 1) * lineEnd
        ctx.strokeStyle = b.color
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.globalAlpha = 0.6
        ctx.beginPath()
        ctx.moveTo(cx + nx * 0, cy + ny * 0)
        ctx.lineTo(cx + nx * ep, cy + ny * ep)
        ctx.stroke()
        ctx.globalAlpha = 1
      }
    })

    // 节点：缩放出现
    steps.push({
      tStart: next(0.02), tDur: 0.05,
      draw(ctx, p) {
        const per = Math.min(p, 1)
        ctx.save()
        ctx.translate(b.x, b.y)
        const s = 0.3 + per * 0.7
        ctx.scale(s, s)
        ctx.translate(-b.x, -b.y)

        ctx.strokeStyle = b.color
        ctx.lineWidth = 2
        roundRectPath(ctx, b.x - bw/2, b.y - bh/2, bw, bh, 8)
        ctx.stroke()

        ctx.fillStyle = b.color + '18'
        roundRectPath(ctx, b.x - bw/2, b.y - bh/2, bw, bh, 8)
        ctx.fill()
        ctx.restore()
      }
    })

    // 标签
    steps.push({
      tStart: next(0.01), tDur: 0.01,
      draw(ctx, _p) {
        ctx.fillStyle = b.color
        ctx.font = '500 16px "Inter", "PingFang SC", sans-serif'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(b.label, b.x, b.y - 24)
      }
    })

    // 子项：逐行出现
    for (let si = 0; si < b.subs.length; si++) {
      steps.push({
        tStart: next(0.012), tDur: 0.02,
        draw(ctx, _p) {
          ctx.fillStyle = '#475569'
          ctx.font = '400 12px "Inter", "PingFang SC", sans-serif'
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillText(b.subs[si], b.x, b.y + 2 + si * 18)
        }
      })
    }
  }

  const total = t
  for (const s of steps) { s.tStart /= total; s.tDur /= total }
  return steps
}

export function useMagicMirrors(state: HallSceneState): MirrorObjects {
  const { scene } = state

  // --- 左镜：电脑桌 GLB 模型 ---
  const leftMirror = new THREE.Group()
  placeOnFloor(leftMirror, MIRROR_SLOTS.left.x, MIRROR_SLOTS.left.z)
  scene.add(leftMirror)

  let disposed = false
  let modelsLoaded = 0
  const totalModels = 2
  let resolveLoad: () => void
  const loadPromise = new Promise<void>((resolve) => { resolveLoad = resolve })

  function onModelLoaded() {
    modelsLoaded++
    if (modelsLoaded >= totalModels) resolveLoad()
  }

  const gltfLoader = new GLTFLoader()
  gltfLoader.load(
    assetUrl('models/computer__desk.glb'),
    (gltf) => {
      if (disposed) return
      const model = gltf.scene
      const s = 3.5
      model.scale.set(s, s, s)

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

      const box = new THREE.Box3().setFromObject(model)
      model.position.set(0, -box.min.y + 0.01, 0)

      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
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
      onModelLoaded()
    },
    undefined,
    (err) => {
      console.warn('[MagicMirrors] Failed to load computer desk GLB:', err)
      onModelLoaded()
    },
  )

  // --- 右镜：白板模型 + 流程图动画 + 不可见点击区域 ---
  const rightMirror = new THREE.Group()
  let rightSurface: THREE.Mesh | null = null
  placeOnFloor(rightMirror, MIRROR_SLOTS.right.x, MIRROR_SLOTS.right.z)
  scene.add(rightMirror)

  // ---- 创建不可见的点击区域（始终存在，不依赖 GLB 加载） ----
  const clickZoneGeo = new THREE.PlaneGeometry(8, 6)
  const clickZoneMat = new THREE.MeshBasicMaterial({
    visible: false,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  const rightClickZone = new THREE.Mesh(clickZoneGeo, clickZoneMat)
  // 定位到白板预期位置
  const dir = facingDirection(MIRROR_SLOTS.right.x, MIRROR_SLOTS.right.z)
  rightClickZone.position.set(
    MIRROR_SLOTS.right.x + dir.x * 3.5,
    5.5,
    MIRROR_SLOTS.right.z + dir.z * 3.5,
  )
  rightClickZone.lookAt(0, 5.5, 0)
  scene.add(rightClickZone)

  // 流程图动画状态
  let fcCanvas: HTMLCanvasElement | null = null
  let fcCtx: CanvasRenderingContext2D | null = null
  let fcTexture: THREE.CanvasTexture | null = null
  let fcSteps: FCStep[] = []

  gltfLoader.load(
    assetUrl('models/whiteboard.glb'),
    (gltf) => {
      if (disposed) return
      const model = gltf.scene
      const s = 1.0
      model.scale.set(s, s, s)

      const box = new THREE.Box3().setFromObject(model)
      model.position.set(0, -box.min.y + 0.01, 3.5)

      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
          const mats = Array.isArray(child.material) ? child.material : [child.material]
          for (const m of mats) {
            if (m.map) {
              m.map.colorSpace = THREE.SRGBColorSpace
              m.map.needsUpdate = true
            }
          }
        }
      })

      rightMirror.add(model)
      onModelLoaded()

      // ----- 流程图动画：Clone 表面几何作为叠加层 -----
      let boardSurface: THREE.Mesh | null = null
      model.traverse((child) => {
        if (child instanceof THREE.Mesh && child.name === 'Object_7') {
          boardSurface = child
        }
      })
      if (!boardSurface) {
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            const p = child.parent
            if (p && p.name === 'board_3') boardSurface = child
          }
        })
      }
      if (boardSurface) {
        const canvas = document.createElement('canvas')
        canvas.width = FC_CANVAS_W
        canvas.height = FC_CANVAS_H
        const ctx = canvas.getContext('2d')!
        ctx.clearRect(0, 0, FC_CANVAS_W, FC_CANVAS_H)

        const texture = new THREE.CanvasTexture(canvas)
        texture.offset.x = 0.01
        texture.needsUpdate = true

        const overlayGeo = new THREE.PlaneGeometry(7.08, 4.5)
        const overlayMat = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          depthWrite: false,
          depthTest: false,
          side: THREE.DoubleSide,
        })
        const overlay = new THREE.Mesh(overlayGeo, overlayMat)
        const board3 = model.getObjectByName('board_3')
        if (board3) {
          const wp = new THREE.Vector3()
          board3.getWorldPosition(wp)
          const wq = new THREE.Quaternion()
          board3.getWorldQuaternion(wq)
          overlay.position.copy(wp)
          const fwd = new THREE.Vector3(0.4, 0, 0).applyQuaternion(wq)
          overlay.position.add(fwd)
          overlay.quaternion.copy(wq)
          overlay.rotateY(-Math.PI / 2)
          overlay.renderOrder = 999
          scene.add(overlay)
        } else {
          overlay.renderOrder = 999
          scene.add(overlay)
        }

        fcCanvas = canvas
        fcCtx = ctx
        fcTexture = texture
        fcSteps = buildMindMapSteps(FC_CANVAS_W, FC_CANVAS_H)
      } else {
        console.warn('[MagicMirrors] Could not find whiteboard surface')
      }
    },
    undefined,
    (err) => {
      console.warn('[MagicMirrors] Failed to load white board GLB:', err)
      onModelLoaded()
    },
  )

  // 右镜提示光环
  const rightHintRing = createHintRing()
  const hintDir = facingDirection(MIRROR_SLOTS.right.x, MIRROR_SLOTS.right.z)
  rightHintRing.position.set(
    MIRROR_SLOTS.right.x + hintDir.x * 0.8,
    HINT_BASE_Y,
    MIRROR_SLOTS.right.z + hintDir.z * 0.8,
  )
  rightHintRing.lookAt(0, HINT_BASE_Y, 0)
  scene.add(rightHintRing)

  function update(delta: number, elapsed: number) {
    rightHintRing.position.y = HINT_BASE_Y + Math.sin(elapsed * 2) * 0.15
    rightHintRing.rotation.z += delta * 0.5
    rightHintRing.scale.setScalar(0.85 + Math.sin(elapsed * 2.5) * 0.15)

    // ----- 流程图动画 -----
    if (!fcCtx || !fcCanvas || !fcTexture || fcSteps.length === 0) return

    const W = FC_CANVAS_W, H = FC_CANVAS_H
    const ctx = fcCtx
    ctx.clearRect(0, 0, W, H)

    ctx.save()
    ctx.translate(0, 10)

    const t = (elapsed % FC_TOTAL) / FC_TOTAL

    for (const step of fcSteps) {
      const localT = t - step.tStart
      if (localT < 0) continue
      const progress = Math.min(localT / step.tDur, 1)
      step.draw(ctx, progress)
    }

    ctx.restore()
    fcTexture.needsUpdate = true
  }

  function dispose() {
    disposed = true
    scene.remove(leftMirror)
    scene.remove(rightMirror)
    scene.remove(rightHintRing)
    scene.remove(rightClickZone)
    disposeGroup(leftMirror)
    disposeGroup(rightMirror)
    disposeGroup(rightHintRing)
    clickZoneGeo.dispose()
    clickZoneMat.dispose()
    if (fcTexture) fcTexture.dispose()
  }

  return { leftMirror, rightMirror, rightSurface, rightClickZone, rightHintRing, update, dispose, loadPromise }
}

// ====== 工具函数 ======

function facingDirection(x: number, z: number) {
  const len = Math.hypot(x, z)
  return { x: -x / len, z: -z / len }
}

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
