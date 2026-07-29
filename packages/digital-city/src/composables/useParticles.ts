/**
 * useParticles — 粒子效果
 * - 道路车流：沿 x 轴和 z 轴移动的发光点
 * - 数据流：建筑之间穿梭的光点
 */

import * as THREE from 'three'

export interface ParticleSystem {
  particles: THREE.Points
  update: (delta: number, elapsed: number) => void
}

/** 创建道路车流粒子 */
export function createTrafficParticles(scene: THREE.Scene): ParticleSystem {
  const count = 200
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)

  // 初始化随机位置 — 只在主干道上
  const mainRoads = [-8, -4, 0, 4, 8] // 垂直主干道

  for (let i = 0; i < count; i++) {
    const onVerticalRoad = Math.random() > 0.5
    const roadX = mainRoads[Math.floor(Math.random() * mainRoads.length)] * 1.2
    const roadZ = (Math.random() - 0.5) * 24

    positions[i * 3] = onVerticalRoad ? roadX : (Math.random() - 0.5) * 24
    positions[i * 3 + 1] = 0.08
    positions[i * 3 + 2] = onVerticalRoad ? roadZ : roadX

    // 暖色系（车灯）
    const hue = 0.12 + Math.random() * 0.15 // amber-ish
    const color = new THREE.Color().setHSL(hue, 0.8, 0.6 + Math.random() * 0.3)
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3))

  const mat = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.8,
  })

  const points = new THREE.Points(geo, mat)
  scene.add(points)

  const update = (delta: number, _elapsed: number) => {
    const pos = points.geometry.attributes.position.array as Float32Array
    const speed = 1.5 * delta

    for (let i = 0; i < count; i++) {
      const idx = i * 3
      const x = pos[idx]
      pos[idx + 2] -= speed // 向前移动

      // 循环
      if (pos[idx + 2] < -12) pos[idx + 2] = 12
    }

    points.geometry.attributes.position.needsUpdate = true
  }

  return { particles: points, update }
}

/** 创建数据流 — 建筑之间的光缆 */
export function createDataFlows(
  scene: THREE.Scene,
  fromPos: THREE.Vector3,
  toPos: THREE.Vector3,
  color: string,
): ParticleSystem {
  const count = 30
  const positions = new Float32Array(count * 3)

  for (let i = 0; i < count; i++) {
    const t = i / count
    const point = new THREE.Vector3().lerpVectors(fromPos, toPos, t)
    // 添加一点弧线感
    point.y += Math.sin(t * Math.PI) * 0.5
    positions[i * 3] = point.x
    positions[i * 3 + 1] = point.y
    positions[i * 3 + 2] = point.z
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const mat = new THREE.PointsMaterial({
    size: 0.08,
    color: new THREE.Color(color),
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.7,
  })

  const points = new THREE.Points(geo, mat)
  scene.add(points)

  let time = 0
  const update = (delta: number, _elapsed: number) => {
    time += delta * 2
    const pos = points.geometry.attributes.position.array as Float32Array

    for (let i = 0; i < count; i++) {
      const t = ((i / count) + time) % 1
      const point = new THREE.Vector3().lerpVectors(fromPos, toPos, t)
      point.y += Math.sin(t * Math.PI) * 0.5
      pos[i * 3] = point.x
      pos[i * 3 + 1] = point.y
      pos[i * 3 + 2] = point.z
    }

    points.geometry.attributes.position.needsUpdate = true
  }

  return { particles: points, update }
}
