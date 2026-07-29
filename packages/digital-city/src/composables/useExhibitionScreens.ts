/**
 * useExhibitionScreens — 展厅屏幕系统
 * 中央大屏：简历核心信息（Canvas 纹理）
 * 侧墙模块：4个项目展示
 * 动画提示：可点击的脉冲光圈
 */

import * as THREE from 'three'
import { MAIN_SCREEN, PROJECT_SLOTS } from './useExhibitionHall'
import type { HallSceneState } from './useExhibitionHall'
import { assetUrl } from '../utils/assetPath'

// 简历数据（简化版，与 resume 包共享结构）
interface SkillCategory { title: string; items: string[] }
interface TimelineItem { period: string; company: string; role: string; bullets: string[] }
interface Project { title: string; desc: string; tags: string[] }

const skills: SkillCategory[] = [
  {
    title: '前端框架',
    items: ['Vue3 / Vue2', 'TypeScript', 'JavaScript', 'uni-app', '微信小程序原生'],
  },
  {
    title: '工程化',
    items: ['Vite', 'Webpack', 'ESLint / Prettier', 'Husky / commitlint'],
  },
  {
    title: '后端 & BFF',
    items: ['NestJS', 'Python / FastAPI', 'Node.js', 'SSE 流式', 'RESTful API'],
  },
  {
    title: 'AI & 工具',
    items: ['DashScope / 百炼', 'RAG', '大模型对接', 'Git / Docker / Linux'],
  },
]

const experience: TimelineItem[] = [
  {
    period: '2018.11 — 2026.6',
    company: '挖酒网',
    role: '前端工程师 / 大前端负责人',
    bullets: [
      '管理大前端部门，主导网页、小程序、管理系统的研发与迭代',
      '搭建前端工程化体系：TypeScript + ESLint + Vite 打包优化',
      '主导集团 ERP2.0（Vue3 + Element Plus）核心模块开发',
      '开发仓储管理 BFF（NestJS），统一鉴权透传与流式处理',
      '实现 SSE 流式渲染与大模型交互，接入 AI 代理对话能力',
    ],
  },
  {
    period: '2016.01 — 2018.10',
    company: '逻辑适点',
    role: '前端工程师',
    bullets: [
      '完成 Web 前端、小程序、H5 等多端项目开发',
      '纯 CSS 实现教学动画项目，崔健个人 App 开发',
    ],
  },
]

const projects: Project[] = [
  {
    title: '集团 ERP2.0 管理平台',
    desc: '集团化ERP管理后台，覆盖客户、产品、订单、采购、仓储、财务等核心模块，集成AI代理对话。',
    tags: ['Vue3', 'TypeScript', 'Element Plus', 'Vite', 'Pinia'],
  },
  {
    title: '骑手 + 仓储管理 + BFF',
    desc: '仓储全流程管理，qiankun微前端接入配送/骑手子应用，NestJS BFF统一封装下游服务。',
    tags: ['Vue2', 'ElementUI', 'NestJS', 'qiankun', 'RxJS'],
  },
  {
    title: '万能报名小程序',
    desc: '活动报名与团购接龙，动态表单、OCR识别、微信支付、Canvas分享海报全链路闭环。',
    tags: ['uni-app', 'ECharts', 'Canvas', 'OCR'],
  },
  {
    title: 'AI 对话后端服务',
    desc: 'SSE流式接口对接百炼工作流，支持纯文本与文件驱动的流式生成，打字机效果。',
    tags: ['Python', 'Flask', 'DashScope', 'SSE'],
  },
]

export interface ScreenObjects {
  mainScreen: THREE.Mesh
  mainScreenGlow: THREE.Mesh
  projectScreens: THREE.Mesh[]
  hintRing: THREE.Group
  update: (delta: number, elapsed: number) => void
  dispose: () => void
}

export function useExhibitionScreens(state: HallSceneState): ScreenObjects {
  const { scene } = state

  // --- 主屏幕 ---
  const mainCanvas = createResumeCanvas()
  const mainTexture = new THREE.CanvasTexture(mainCanvas)
  mainTexture.minFilter = THREE.LinearFilter
  mainTexture.magFilter = THREE.LinearFilter

  const { width: sw, height: sh } = MAIN_SCREEN
  const screenGeo = new THREE.PlaneGeometry(sw, sh)
  const screenMat = new THREE.MeshStandardMaterial({
    map: mainTexture,
    roughness: 0.3,
    metalness: 0.05,
    emissive: '#ffffff',
    emissiveIntensity: 0.3,
  })
  const mainScreen = new THREE.Mesh(screenGeo, screenMat)
  mainScreen.position.set(MAIN_SCREEN.x, MAIN_SCREEN.y, MAIN_SCREEN.z)
  scene.add(mainScreen)

  // 屏幕边框发光
  // 主屏幕画框 — 深色木质边框
  const frameThickness = 0.25
  const frameGeo = new THREE.PlaneGeometry(sw + frameThickness * 2, sh + frameThickness * 2)
  const frameMat = new THREE.MeshStandardMaterial({
    color: '#3a2a1a', roughness: 0.4, metalness: 0.05,
  })
  const mainFrame = new THREE.Mesh(frameGeo, frameMat)
  mainFrame.position.copy(mainScreen.position)
  mainFrame.position.z -= 0.05
  scene.add(mainFrame)

  // 主屏幕内发光边
  const innerGeo = new THREE.PlaneGeometry(sw + 0.08, sh + 0.08)
  const innerMat = new THREE.MeshBasicMaterial({
    color: '#d4c4a8', transparent: true, opacity: 0.4, side: THREE.DoubleSide,
  })
  const mainScreenGlow = new THREE.Mesh(innerGeo, innerMat)
  mainScreenGlow.position.copy(mainScreen.position)
  mainScreenGlow.position.z -= 0.01
  scene.add(mainScreenGlow)

  // --- 项目模块 ----
  const projectScreens: THREE.Mesh[] = []

  // 项目画框图片路径（左 → 流程图，右 → 小程序截图）
  const projectImagePaths = [
    'screens/liucheng.jpeg',
    'screens/miniprogram.jpeg',
  ]

  for (let i = 0; i < PROJECT_SLOTS.length; i++) {
    const slot = PROJECT_SLOTS[i]

    // 创建深色占位 CanvasTexture，确保 material 从一开始就有 map
    // 避免后期动态添加 map 时 Three.js shader 重编译异常
    const placeholderCanvas = document.createElement('canvas')
    placeholderCanvas.width = 2
    placeholderCanvas.height = 2
    const ctx = placeholderCanvas.getContext('2d')!
    ctx.fillStyle = '#0d0d1a'
    ctx.fillRect(0, 0, 2, 2)
    const placeholderTex = new THREE.CanvasTexture(placeholderCanvas)
    placeholderTex.minFilter = THREE.LinearFilter
    placeholderTex.magFilter = THREE.LinearFilter

    const pGeo = new THREE.PlaneGeometry(slot.width, slot.height)
    const pMat = new THREE.MeshStandardMaterial({
      map: placeholderTex,
      roughness: 0.4,
      metalness: 0.02,
    })
    const pScreen = new THREE.Mesh(pGeo, pMat)
    pScreen.position.set(slot.x, slot.y, slot.z)
    if (slot.x < 0) {
      const dx = 0 - slot.x
      const dz = 0 - slot.z
      pScreen.rotation.y = Math.atan2(dx, dz)
    } else {
      const dx2 = 0 - slot.x
      const dz2 = 0 - slot.z
      pScreen.rotation.y = Math.atan2(dx2, dz2)
    }
    scene.add(pScreen)
    projectScreens.push(pScreen)

    // 木质画框
    const fw = 0.2
    const pFrameGeo = new THREE.PlaneGeometry(slot.width + fw * 2, slot.height + fw * 2)
    const frameColors = ['#5a4838', '#5a4030']
    const pFrameMat = new THREE.MeshStandardMaterial({
      color: frameColors[i], roughness: 0.45, metalness: 0.05,
    })
    const pFrame = new THREE.Mesh(pFrameGeo, pFrameMat)
    pFrame.position.copy(pScreen.position)
    pFrame.position.z += (pScreen.position.z > 0 ? -0.04 : 0.04)
    pFrame.rotation.y = pScreen.rotation.y
    scene.add(pFrame)

    // 画框内衬
    const linerGeo = new THREE.PlaneGeometry(slot.width + 0.06, slot.height + 0.06)
    const linerMat = new THREE.MeshBasicMaterial({
      color: '#2a2a3a', transparent: true, opacity: 0.3, side: THREE.DoubleSide,
    })
    const liner = new THREE.Mesh(linerGeo, linerMat)
    liner.position.copy(pScreen.position)
    liner.position.z += (pScreen.position.z > 0 ? -0.02 : 0.02)
    liner.rotation.y = pScreen.rotation.y
    scene.add(liner)

    // 异步加载图片纹理
    const loader = new THREE.TextureLoader()
    loader.load(
      assetUrl(projectImagePaths[i]),
      (tex) => {
        console.log('[Exhibition] Texture loaded:', projectImagePaths[i], tex.image.width + 'x' + tex.image.height)
        const imageAspect = tex.image.width / tex.image.height
        const planeAspect = slot.width / slot.height

        tex.minFilter = THREE.LinearFilter
        tex.magFilter = THREE.LinearFilter
        tex.colorSpace = THREE.SRGBColorSpace

        if (imageAspect > planeAspect) {
          tex.repeat.x = planeAspect / imageAspect
          tex.repeat.y = 1
          tex.offset.x = (1 - tex.repeat.x) / 2
          tex.offset.y = 0
        } else {
          tex.repeat.x = 1
          tex.repeat.y = imageAspect / planeAspect
          tex.offset.x = 0
          tex.offset.y = (1 - tex.repeat.y) / 2
        }
        tex.needsUpdate = true

        // 替换整个 mesh：新材质从创建时就带 map，避免 Three.js shader 重编译问题
        const newGeo = new THREE.PlaneGeometry(slot.width, slot.height)
        const newMat = new THREE.MeshStandardMaterial({
          map: tex,
          roughness: 0.3,
          metalness: 0.02,
        })
        const newScreen = new THREE.Mesh(newGeo, newMat)
        newScreen.position.copy(pScreen.position)
        newScreen.rotation.copy(pScreen.rotation)

        scene.remove(pScreen)
        scene.add(newScreen)
        projectScreens[i] = newScreen

        pGeo.dispose()
        pMat.dispose()
      },
      undefined,
      () => {
        console.warn('[Exhibition] Failed to load image: ' + projectImagePaths[i])
      }
    )
  }

  // --- 动画提示 ---
  const hintRing = createHintRing()
  hintRing.position.set(MAIN_SCREEN.x, MAIN_SCREEN.y - sh / 2 - 0.6, MAIN_SCREEN.z + 0.5)
  scene.add(hintRing)

  function update(delta: number, elapsed: number) {
    // 屏幕发光脉冲
    const pulse = 0.7 + Math.sin(elapsed * 1.5) * 0.3
    ;(mainScreenGlow.material as THREE.MeshBasicMaterial).opacity = 0.2 + pulse * 0.15

    // 提示环脉冲 + 旋转
    hintRing.position.y = MAIN_SCREEN.y - sh / 2 - 0.6 + Math.sin(elapsed * 2) * 0.15
    hintRing.rotation.z += delta * 0.5
    hintRing.scale.setScalar(0.85 + Math.sin(elapsed * 2.5) * 0.15)

    // 边框闪烁
    const alpha = 0.3 + Math.sin(elapsed * 2) * 0.15
    ;(mainScreenGlow.material as THREE.MeshBasicMaterial).opacity = alpha
  }

  function dispose() {
    mainTexture.dispose()
    mainScreenGeo: screenGeo.dispose()
    screenMat.dispose()
    frameMat.dispose()
    frameGeo.dispose()
    scene.remove(mainScreen)
    scene.remove(mainScreenGlow)
    scene.remove(hintRing)
    for (const ps of projectScreens) {
      scene.remove(ps)
    }
  }

  return { mainScreen, mainScreenGlow, projectScreens, hintRing, update, dispose }
}

// ====== Canvas 纹理生成 ======

function createResumeCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 586
  const ctx = canvas.getContext('2d')!

  // 背景
  ctx.fillStyle = '#0a0a14'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 顶部装饰线
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0)
  gradient.addColorStop(0, '#4F46E5')
  gradient.addColorStop(0.5, '#818CF8')
  gradient.addColorStop(1, '#4F46E5')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, 3)

  // 标题
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 36px "Inter", "PingFang SC", "Microsoft YaHei", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('毛际可', canvas.width / 2, 65)

  // 副标题
  ctx.fillStyle = '#818CF8'
  ctx.font = '18px "Inter", "PingFang SC", sans-serif'
  ctx.fillText('资深前端工程师 · 10 年+企业级 & AI 原生应用开发', canvas.width / 2, 100)

  // 分隔线
  ctx.strokeStyle = '#1e1e3a'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(80, 120)
  ctx.lineTo(canvas.width - 80, 120)
  ctx.stroke()

  // 技能区域
  ctx.fillStyle = '#818CF8'
  ctx.font = 'bold 16px "Inter", "PingFang SC", sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('技能', 80, 150)

  let y = 178
  for (const cat of skills) {
    ctx.fillStyle = '#c7d2fe'
    ctx.font = '13px "Inter", "PingFang SC", sans-serif'
    ctx.fillText(cat.title + '：', 80, y)

    ctx.fillStyle = '#94a3b8'
    ctx.font = '12px "JetBrains Mono", "Inter", monospace'
    const itemsStr = cat.items.join('  ·  ')
    ctx.fillText(itemsStr, 80 + ctx.measureText(cat.title + '：').width + 4, y)
    y += 24
  }

  // 分隔线
  y += 6
  ctx.strokeStyle = '#1e1e3a'
  ctx.beginPath()
  ctx.moveTo(80, y)
  ctx.lineTo(canvas.width - 80, y)
  ctx.stroke()
  y += 30

  // 经历
  ctx.fillStyle = '#818CF8'
  ctx.font = 'bold 16px "Inter", "PingFang SC", sans-serif'
  ctx.fillText('经历', 80, y)
  y += 30

  for (const exp of experience) {
    ctx.fillStyle = '#ffffff'
    ctx.font = '14px "Inter", "PingFang SC", sans-serif'
    ctx.fillText(exp.company + '  |  ' + exp.role, 80, y)
    y += 22

    ctx.fillStyle = '#64748b'
    ctx.font = '12px "Inter", "PingFang SC", sans-serif'
    ctx.fillText(exp.period, 80, y)
    y += 22

    ctx.fillStyle = '#94a3b8'
    ctx.font = '12px "Inter", "PingFang SC", sans-serif'
    for (const b of exp.bullets.slice(0, 2)) {
      ctx.fillText('· ' + b, 95, y)
      y += 20
    }
    y += 8
  }

  return canvas
}

function createProjectCanvas(title: string, desc: string, tags: string[]): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = 500
  canvas.height = 300
  const ctx = canvas.getContext('2d')!

  // 背景
  ctx.fillStyle = '#0a0a14'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // 顶部色条
  const colors = ['#4F46E5', '#7C3AED', '#0891B2', '#D97706']
  const idx = projects.findIndex(p => p.title === title)
  const accentColor = colors[Math.max(0, idx)]
  ctx.fillStyle = accentColor
  ctx.fillRect(0, 0, canvas.width, 2)

  // 标题
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 20px "Inter", "PingFang SC", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText(title, canvas.width / 2, 60)

  // 描述
  ctx.fillStyle = '#94a3b8'
  ctx.font = '13px "Inter", "PingFang SC", sans-serif'
  ctx.textAlign = 'center'
  wrapText(ctx, desc, canvas.width / 2, 100, canvas.width - 60, 20)

  // 标签
  ctx.textAlign = 'center'
  ctx.font = '11px "JetBrains Mono", monospace'
  let tagY = 200
  for (const tag of tags) {
    const tw = ctx.measureText(tag).width
    const tx = canvas.width / 2 - tags.reduce((sum, t) => sum + ctx.measureText(t).width + 24, 0) / 2
    // 简化：居中排列
  }

  // 标签 — 简单居中
  const tagsText = tags.join('  ·  ')
  ctx.fillStyle = '#64748b'
  ctx.fillText(tagsText, canvas.width / 2, 200)

  // 底部指示器
  ctx.fillStyle = accentColor
  ctx.fillRect(canvas.width / 2 - 20, 270, 40, 2)

  return canvas
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
  const chars = text.split('')
  let line = ''
  let cy = y
  for (const ch of chars) {
    const testLine = line + ch
    if (ctx.measureText(testLine).width > maxWidth) {
      ctx.fillText(line, x, cy)
      line = ch
      cy += lineHeight
    } else {
      line = testLine
    }
  }
  ctx.fillText(line, x, cy)
}

export function createHintRing(): THREE.Group {
  const group = new THREE.Group()

  // 外圈 — 脉冲光环
  const outerGeo = new THREE.TorusGeometry(0.35, 0.03, 16, 48)
  const outerMat = new THREE.MeshStandardMaterial({
    color: '#818CF8', emissive: '#818CF8', emissiveIntensity: 2.5,
    roughness: 0.1, metalness: 0.9,
  })
  const outer = new THREE.Mesh(outerGeo, outerMat)
  group.add(outer)

  // 内圈 — 细光环
  const innerGeo = new THREE.TorusGeometry(0.25, 0.015, 12, 40)
  const innerMat = new THREE.MeshStandardMaterial({
    color: '#A5B4FC', emissive: '#A5B4FC', emissiveIntensity: 1.8,
    roughness: 0.1, metalness: 0.85,
  })
  const inner = new THREE.Mesh(innerGeo, innerMat)
  group.add(inner)

  // 中心光点
  const dotGeo = new THREE.SphereGeometry(0.06, 16, 16)
  const dotMat = new THREE.MeshStandardMaterial({
    color: '#ffffff', emissive: '#ffffff', emissiveIntensity: 3,
    roughness: 0.05, metalness: 0.5,
  })
  const dot = new THREE.Mesh(dotGeo, dotMat)
  group.add(dot)

  return group
}
