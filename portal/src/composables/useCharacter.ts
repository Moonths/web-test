/**
 * useCharacter — GLB 蝙蝠怪物模型角色
 * WASD 移动时播放动画，停止时冻结
 */

import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { HALL } from './useExhibitionHall'
import { assetUrl } from '../utils/assetPath'

export interface CharacterController {
  group: THREE.Group
  floorRing: THREE.Mesh
  update: (delta: number, elapsed: number, cameraAzimuth: number) => void
  dispose: () => void
  getPosition: () => THREE.Vector3
  loadPromise: Promise<void>
}

const MOVE_SPEED = 5.0
const ROTATE_SPEED = 4.0
const TARGET_HEIGHT = 2.2

const MODEL_PATH = 'models/bat_dark_bad_cartoon_monster.glb'

export function useCharacter(scene: THREE.Scene): CharacterController {
  const group = new THREE.Group()
  let mixer: THREE.AnimationMixer | null = null
  let allActions: THREE.AnimationAction[] = []
  let walkAction: THREE.AnimationAction | null = null

  group.position.set(0, 0, -2)
  scene.add(group)

  // 角色跟随光源
  const charLight = new THREE.PointLight('#fff8f0', 6, 10, 1.5)
  charLight.position.set(0, 1.5, 1)
  group.add(charLight)


  // 地面光圈
  const floorRing = createFloorRing()
  floorRing.position.set(0, 0.02, 0)
  group.add(floorRing)

  const loader = new GLTFLoader()
  loader.load(
    assetUrl(MODEL_PATH),
    (gltf) => {
      console.log('[Character] Model loaded:', gltf.animations.map(a => a.name))
      const model = gltf.scene

      // 只用 Mesh 算包围盒
      const box = new THREE.Box3()
      model.traverse((child) => {
        if (child instanceof THREE.Mesh && child.isMesh) box.expandByObject(child)
      })
      const size = box.getSize(new THREE.Vector3())
      const min = box.min
      console.log('[Character] Mesh bounds:', { size: size.toArray(), min: min.toArray() })

      const baseScale = size.y > 0.01 ? TARGET_HEIGHT / size.y : 2.5
      const scale = baseScale * 0.63
      model.scale.setScalar(scale)
      const modelHeight = size.y * scale
      model.position.set(0, -min.y * scale + modelHeight * 0.4, 0)

      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true
          child.receiveShadow = true
          const mat = child.material as THREE.MeshStandardMaterial
          if (mat) {
            mat.depthWrite = true
            mat.needsUpdate = true

            // lighten bat color - texture is too dark against floor
            mat.color.setHex(0xb0b8d0)
            if (mat.emissive) {
              mat.emissive.setHex(0x6068a0)
              mat.emissiveIntensity = 0.5
            }
          }
        }
      })

      // 旋转隔离容器 — 避免 AnimationMixer 干扰朝向
      const rotator = new THREE.Group()
      rotator.add(model)
      group.add(rotator)
      ;(group as any).__rotator = rotator

      // 动画：有 walk 则用 walk，否则用第一个
      if (gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model)

        for (const clip of gltf.animations) {
          const action = mixer.clipAction(clip)
          action.setLoop(THREE.LoopRepeat, Infinity)
          action.clampWhenFinished = true
          allActions.push(action)

          if (clip.name.toLowerCase().includes('walk') || clip.name.toLowerCase().includes('run')) {
            walkAction = action
          }
        }

        // 没找到 walk 就用第一个动画
        if (!walkAction) walkAction = allActions[0]

        // 初始不播放任何动画
      }
      resolveLoad()
    },
    (p) => { if (p.total > 0) console.log('[Character]', Math.round(p.loaded/p.total*100), '%') },
    (err) => {
      console.error('[Character] Load failed:', err)
      group.add(createFallbackMesh())
      resolveLoad()
    }
  )

  // ===== 输入 =====
  const keys: Record<string, boolean> = {}
  let yawAngle = 0
  let isMoving = false
  let wasMoving = false

  function onKeyDown(e: KeyboardEvent) {
    const k = e.key.toLowerCase()
    keys[k] = true
    if (['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright'].includes(k)) e.preventDefault()
  }
  function onKeyUp(e: KeyboardEvent) { keys[e.key.toLowerCase()] = false }

  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)

  function update(delta: number, elapsed: number, cameraAzimuth: number) {
    // ===== 动画：只在移动时播放 =====
    let forward = 0, strafe = 0
    if (keys['w'] || keys['arrowup']) forward += 1
    if (keys['s'] || keys['arrowdown']) forward -= 1
    if (keys['a'] || keys['arrowleft']) strafe -= 1
    if (keys['d'] || keys['arrowright']) strafe += 1

    const inputLen = Math.sqrt(forward * forward + strafe * strafe)
    isMoving = inputLen > 0.01

    // 移动状态切换 → 控制动画播放/停止
    if (isMoving !== wasMoving && mixer && walkAction) {
      wasMoving = isMoving
      if (isMoving) {
        // 开始移动 → 播放动画
        walkAction.reset().fadeIn(0.15).play()
        walkAction.setEffectiveTimeScale(1.5)
        walkAction.paused = false
      } else {
        // 停止移动 → 冻结动画
        walkAction.paused = true
      }
    }

    // 只更新 mixer（如果动画在播放）
    if (mixer) {
      // 只有正在播放时才更新
      if (walkAction && !walkAction.paused) {
        mixer.update(delta)
      }
    }

    // ===== WASD 移动 =====
    if (isMoving) {
      forward /= inputLen; strafe /= inputLen
      const sin = Math.sin(cameraAzimuth), cos = Math.cos(cameraAzimuth)
      const dx = (-forward * sin + strafe * cos) * MOVE_SPEED * delta
      const dz = (-forward * cos - strafe * sin) * MOVE_SPEED * delta
      group.position.x += dx; group.position.z += dz
      yawAngle = Math.atan2(-dx, -dz)
      const m = 1.2
      group.position.x = Math.max(-HALL.width/2+m, Math.min(HALL.width/2-m, group.position.x))
      group.position.z = Math.max(-HALL.depth/2+m, Math.min(HALL.depth/2-m, group.position.z))
    } else {
      // 静止时保持最后移动方向
    }


    const rot = (group as any).__rotator as THREE.Group
    if (rot) rot.rotation.y = yawAngle
    else group.rotation.y = yawAngle
  }

  function dispose() {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    mixer?.stopAllAction()
    scene.remove(group)
  }

  return { group, floorRing, update, dispose, getPosition: () => group.position.clone(), loadPromise }
}

function createFloorRing(): THREE.Mesh {
  const g = new THREE.RingGeometry(0.35, 0.45, 32)
  const m = new THREE.MeshBasicMaterial({ color:'#818CF8', side:THREE.DoubleSide, transparent:true, opacity:0.5, depthWrite:false })
  const r = new THREE.Mesh(g, m); r.rotation.x = -Math.PI/2; return r
}

function createFallbackMesh(): THREE.Group {
  const g = new THREE.Group()
  const geo = new THREE.CylinderGeometry(0.3, 0.35, 1.2, 20)
  const mat = new THREE.MeshStandardMaterial({ color:'#4F46E5', roughness:0.25, metalness:0.6, emissive:'#2a2a5a', emissiveIntensity:0.5 })
  const m = new THREE.Mesh(geo, mat); m.position.y = 0.6; m.castShadow = true; g.add(m); return g
}
