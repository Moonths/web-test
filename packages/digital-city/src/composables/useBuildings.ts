/**
 * useBuildings — 建筑生成系统
 * 每个建筑 = BoxGeometry + 顶部发光环 + 悬浮标签
 * 高度映射熟练度，平面足迹映射项目规模
 */

import * as THREE from 'three'
import { buildings, landmarks, districts, type BuildingData, type LandmarkData } from '@/data/city-data'

export interface BuildingMesh {
  data: BuildingData
  group: THREE.Group
  box: THREE.Mesh
  glowRing: THREE.Mesh
}

const GRID_SIZE = 1.2
const FLOOR_HEIGHT = 0.35

export function createBuildings(scene: THREE.Scene): BuildingMesh[] {
  const meshes: BuildingMesh[] = []

  // 创建普通建筑
  for (const b of buildings) {
    const mesh = createBuilding(b)
    scene.add(mesh.group)
    meshes.push(mesh)
  }

  // 创建地标建筑（项目）
  for (const l of landmarks) {
    const mesh = createLandmark(l)
    scene.add(mesh.group)
    meshes.push(mesh)
  }

  // 创建区域标识柱
  createDistrictPillars(scene)

  return meshes
}

function createBuilding(data: BuildingData): BuildingMesh {
  const group = new THREE.Group()

  const x = data.gridX * GRID_SIZE
  const z = data.gridZ * GRID_SIZE

  // 建筑主体
  const footprintW = data.footprint * 0.4
  const footprintD = data.footprint * 0.4
  const buildingH = data.height * FLOOR_HEIGHT

  const boxGeo = new THREE.BoxGeometry(footprintW, buildingH, footprintD)
  const boxMat = new THREE.MeshStandardMaterial({
    color: data.color,
    roughness: 0.25,
    metalness: 0.3,
  })
  const box = new THREE.Mesh(boxGeo, boxMat)
  box.position.set(x, buildingH / 2, z)
  box.castShadow = true
  box.receiveShadow = true
  box.userData = { buildingId: data.id }
  group.add(box)

  // 顶部发光环
  const ringGeo = new THREE.TorusGeometry(footprintW * 0.6, 0.06, 8, 32)
  const ringMat = new THREE.MeshStandardMaterial({
    color: data.color,
    emissive: data.color,
    emissiveIntensity: data.glowIntensity * 2,
    roughness: 0.2,
    metalness: 0.8,
  })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.position.set(x, buildingH + 0.1, z)
  ring.rotation.x = Math.PI / 2
  group.add(ring)

  // 底部基座
  const baseGeo = new THREE.BoxGeometry(footprintW * 1.2, 0.15, footprintD * 1.2)
  const baseMat = new THREE.MeshStandardMaterial({
    color: '#111827',
    roughness: 0.5,
    metalness: 0.6,
  })
  const base = new THREE.Mesh(baseGeo, baseMat)
  base.position.set(x, 0.075, z)
  base.receiveShadow = true
  group.add(base)

  return { data, group, box, glowRing: ring }
}

function createLandmark(data: LandmarkData): BuildingMesh {
  const group = new THREE.Group()

  const x = data.gridX * GRID_SIZE
  const z = data.gridZ * GRID_SIZE

  // 地标建筑更大，用圆角感（简单用两层 box）
  const footprintW = data.footprint * 0.35
  const footprintD = data.footprint * 0.35
  const buildingH = data.height * FLOOR_HEIGHT

  // 主体
  const boxGeo = new THREE.CylinderGeometry(footprintW * 0.9, footprintW, buildingH, 8, 1)
  const boxMat = new THREE.MeshStandardMaterial({
    color: data.color,
    roughness: 0.2,
    metalness: 0.4,
  })
  const box = new THREE.Mesh(boxGeo, boxMat)
  box.position.set(x, buildingH / 2, z)
  box.castShadow = true
  box.receiveShadow = true
  box.userData = { buildingId: data.id, isLandmark: true }
  group.add(box)

  // 顶部球体发光
  const sphereGeo = new THREE.SphereGeometry(footprintW * 0.5, 16, 16)
  const sphereMat = new THREE.MeshStandardMaterial({
    color: data.color,
    emissive: data.color,
    emissiveIntensity: data.glowIntensity * 3,
    roughness: 0.1,
    metalness: 0.9,
  })
  const sphere = new THREE.Mesh(sphereGeo, sphereMat)
  sphere.position.set(x, buildingH + 0.5, z)
  group.add(sphere)

  // 平台底座
  const baseGeo = new THREE.CylinderGeometry(footprintW * 1.3, footprintW * 1.3, 0.2, 16)
  const baseMat = new THREE.MeshStandardMaterial({
    color: '#111827',
    roughness: 0.4,
    metalness: 0.7,
  })
  const base = new THREE.Mesh(baseGeo, baseMat)
  base.position.set(x, 0.1, z)
  base.receiveShadow = true
  group.add(base)

  return {
    data,
    group,
    box,
    glowRing: sphere,
  }
}

function createDistrictPillars(scene: THREE.Scene) {
  for (const d of districts) {
    const cx = (d.bounds.minX + d.bounds.maxX) / 2 * GRID_SIZE
    const cz = (d.bounds.minZ + d.bounds.maxZ) / 2 * GRID_SIZE

    // 区域边界立柱
    const pillarGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.4, 8)
    const pillarMat = new THREE.MeshStandardMaterial({
      color: d.color,
      emissive: d.color,
      emissiveIntensity: 0.5,
      roughness: 0.3,
      metalness: 0.7,
    })

    const corners = [
      [d.bounds.minX, d.bounds.minZ],
      [d.bounds.maxX, d.bounds.minZ],
      [d.bounds.minX, d.bounds.maxZ],
      [d.bounds.maxX, d.bounds.maxZ],
    ]

    for (const [gx, gz] of corners) {
      const pillar = new THREE.Mesh(pillarGeo, pillarMat)
      pillar.position.set(gx * GRID_SIZE, 0.2, gz * GRID_SIZE)
      scene.add(pillar)
    }
  }
}
