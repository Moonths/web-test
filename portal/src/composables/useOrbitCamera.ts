/**
 * useOrbitCamera — 拖拽轨道相机
 * 绕展厅中心旋转，360° 无死角，滚轮缩放
 */

import * as THREE from 'three'
import { HALL } from './useExhibitionHall'

export interface OrbitCamera {
  getAzimuth: () => number
  setTargetDistance: (d: number) => void
  update: (delta: number) => void
  dispose: () => void
}

// 轨道中心：展厅几何中心
const ORBIT_CENTER = new THREE.Vector3(0, 4.5, 0)
const MIN_DIST = 8
const MAX_DIST = 20
const DEFAULT_DIST = 30
const MIN_ELEVATION = -0.6
const MAX_ELEVATION = 1.3
// 默认从入口方向看：azimuth=0 时相机在 +z 方向（前入口），看向 -z（后墙主屏幕）
const DEFAULT_AZIMUTH = 0
const DEFAULT_ELEVATION = 0.1
const DRAG_SENSITIVITY = 0.005
const ZOOM_SENSITIVITY = 1.5
const LERP_SPEED = 6.0

export function useOrbitCamera(
  camera: THREE.PerspectiveCamera,
  canvas: HTMLCanvasElement,
) {
  let azimuth = DEFAULT_AZIMUTH
  let elevation = DEFAULT_ELEVATION
  let distance = DEFAULT_DIST
  let isDragging = false
  let targetAzimuth = azimuth
  let targetElevation = elevation
  let targetDistance = distance

  function sphericalToCartesian(az: number, el: number, dist: number): THREE.Vector3 {
    const x = Math.sin(az) * Math.cos(el) * dist
    const y = Math.sin(el) * dist
    const z = Math.cos(az) * Math.cos(el) * dist
    return new THREE.Vector3(x, y, z).add(ORBIT_CENTER)
  }

  function clampCamera(pos: THREE.Vector3): THREE.Vector3 {
    const margin = 1.2
    pos.x = Math.max(-HALL.width / 2 + margin, Math.min(HALL.width / 2 - margin, pos.x))
    pos.y = Math.max(1.5, Math.min(HALL.height - 0.8, pos.y))
    pos.z = Math.max(-HALL.depth / 2 + margin, Math.min(HALL.depth / 2 - margin, pos.z))
    return pos
  }

  function onMouseDown(e: MouseEvent) {
    if (e.button === 0) {
      isDragging = true
      canvas.style.cursor = 'grabbing'
      e.preventDefault()
    }
  }

  function onMouseMove(e: MouseEvent) {
    if (!isDragging) return
    targetAzimuth -= e.movementX * DRAG_SENSITIVITY
    targetElevation += e.movementY * DRAG_SENSITIVITY
    targetElevation = Math.max(MIN_ELEVATION, Math.min(MAX_ELEVATION, targetElevation))
  }

  function onMouseUp() {
    isDragging = false
    canvas.style.cursor = 'default'
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault()
    // macOS 触控板双指缩放 (Chrome/Edge: ctrlKey=true)
    const zoomDelta = e.ctrlKey ? e.deltaY * 0.03 : e.deltaY * 0.01
    targetDistance += zoomDelta * ZOOM_SENSITIVITY
    targetDistance = Math.max(MIN_DIST, Math.min(MAX_DIST, targetDistance))
  }

  // 触摸支持
  let touchStartX = 0
  let touchStartY = 0
  let touchDist0 = 0

  function onTouchStart(e: TouchEvent) {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
      isDragging = true
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      touchDist0 = Math.sqrt(dx * dx + dy * dy)
      isDragging = false
    }
  }

  function onTouchMove(e: TouchEvent) {
    e.preventDefault()
    if (e.touches.length === 1 && isDragging) {
      const dx = e.touches[0].clientX - touchStartX
      const dy = e.touches[0].clientY - touchStartY
      targetAzimuth -= dx * DRAG_SENSITIVITY
      targetElevation += dy * DRAG_SENSITIVITY
      targetElevation = Math.max(MIN_ELEVATION, Math.min(MAX_ELEVATION, targetElevation))
      touchStartX = e.touches[0].clientX
      touchStartY = e.touches[0].clientY
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const d = Math.sqrt(dx * dx + dy * dy)
      targetDistance -= (d - touchDist0) * 0.02
      targetDistance = Math.max(MIN_DIST, Math.min(MAX_DIST, targetDistance))
      touchDist0 = d
    }
  }

  function onTouchEnd() {
    isDragging = false
  }

  canvas.addEventListener('mousedown', onMouseDown)
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
  canvas.addEventListener('wheel', onWheel, { passive: false })
  canvas.addEventListener('touchstart', onTouchStart, { passive: false })
  canvas.addEventListener('touchmove', onTouchMove, { passive: false })
  canvas.addEventListener('touchend', onTouchEnd)

  // Safari 触控板捏合手势
  let gestureStartDist = targetDistance
  function onGestureStart(e: Event) {
    e.preventDefault()
    gestureStartDist = targetDistance
  }
  function onGestureChange(e: any) {
    e.preventDefault()
    targetDistance = gestureStartDist / Math.max(0.5, (e as any).scale)
    targetDistance = Math.max(MIN_DIST, Math.min(MAX_DIST, targetDistance))
  }
  canvas.addEventListener('gesturestart', onGestureStart)
  canvas.addEventListener('gesturechange', onGestureChange)
  canvas.addEventListener('gestureend', onGestureStart)

  // 初始化相机位置
  const initPos = sphericalToCartesian(azimuth, elevation, distance)
  camera.position.copy(initPos)
  camera.lookAt(ORBIT_CENTER)

  function update(delta: number) {
    const lerp = Math.min(LERP_SPEED * delta, 1)
    azimuth += (targetAzimuth - azimuth) * lerp
    elevation += (targetElevation - elevation) * lerp
    distance += (targetDistance - distance) * lerp

    const desiredPos = sphericalToCartesian(azimuth, elevation, distance)
    const clamped = clampCamera(desiredPos)
    camera.position.lerp(clamped, lerp)
    camera.lookAt(ORBIT_CENTER)
  }

  function dispose() {
    canvas.removeEventListener('mousedown', onMouseDown)
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
    canvas.removeEventListener('wheel', onWheel)
    canvas.removeEventListener('touchstart', onTouchStart)
    canvas.removeEventListener('touchmove', onTouchMove)
    canvas.removeEventListener('touchend', onTouchEnd)
    canvas.removeEventListener('gesturestart', onGestureStart)
    canvas.removeEventListener('gesturechange', onGestureChange)
    canvas.removeEventListener('gestureend', onGestureStart)
    canvas.style.cursor = 'default'
  }

  return {
    getAzimuth: () => azimuth,
    setTargetDistance: (d: number) => { targetDistance = Math.max(MIN_DIST, Math.min(MAX_DIST, d)) },
    update,
    dispose,
  }
}
