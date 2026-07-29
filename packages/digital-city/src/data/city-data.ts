/**
 * 数字城市 — 数据定义
 * 建筑 = 技术栈/项目, 高度 = 熟练度, 占地面积 = 项目规模, 光强 = 活跃度
 */

export interface BuildingData {
  id: string
  name: string
  /** 区域分类 */
  district: 'frontend' | 'mobile' | 'backend' | 'engineering'
  /** 网格坐标 (x, z) */
  gridX: number
  gridZ: number
  /** 占地面积 1-3 */
  footprint: number
  /** 高度 (熟练度/规模) 1-10 */
  height: number
  /** 光强 (活跃度) 0.3-1.0 */
  glowIntensity: number
  /** 颜色主题 */
  color: string
  /** 子标签 */
  tags: string[]
  /** 项目链接 */
  url?: string
}

export interface DistrictData {
  id: string
  name: string
  color: string
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number }
}

/**
 * 区域定义
 * 按从左到右排列: 前端 → 移动端 → 后端 → 工程化
 */
export const districts: DistrictData[] = [
  { id: 'frontend',     name: '前端框架',    color: '#4F46E5', bounds: { minX: -8, maxX: -1,  minZ: -4, maxZ: 4 } },
  { id: 'mobile',       name: '移动端',      color: '#7C3AED', bounds: { minX: -1, maxX: 3,   minZ: -4, maxZ: 4 } },
  { id: 'backend',      name: '后端 & BFF',   color: '#0891B2', bounds: { minX: 3,  maxX: 7,   minZ: -4, maxZ: 4 } },
  { id: 'engineering',  name: '工程化',      color: '#D97706', bounds: { minX: 7,  maxX: 11,  minZ: -4, maxZ: 4 } },
]

/**
 * 建筑数据 — 每个技术栈/项目 一栋建筑
 */
export const buildings: BuildingData[] = [
  // ===== 前端框架区 =====
  {
    id: 'vue3',
    name: 'Vue 3',
    district: 'frontend',
    gridX: -6, gridZ: -2,
    footprint: 3,
    height: 10,
    glowIntensity: 1.0,
    color: '#4F46E5',
    tags: ['Composition API', 'SFC', 'Reactivity', 'SSR'],
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    district: 'frontend',
    gridX: -4, gridZ: -2,
    footprint: 2,
    height: 9,
    glowIntensity: 0.9,
    color: '#3178C6',
    tags: ['类型体操', '泛型', 'tsc', 'd.ts'],
  },
  {
    id: 'vite',
    name: 'Vite',
    district: 'frontend',
    gridX: -6, gridZ: 2,
    footprint: 2,
    height: 7,
    glowIntensity: 0.8,
    color: '#BD34FE',
    tags: ['ESBuild', 'HMR', 'SSR'],
  },
  {
    id: 'pinia',
    name: 'Pinia',
    district: 'frontend',
    gridX: -4, gridZ: 2,
    footprint: 1,
    height: 7,
    glowIntensity: 0.8,
    color: '#FFD859',
    tags: ['状态管理', 'DevTools'],
  },
  {
    id: 'nuxt',
    name: 'Nuxt.js',
    district: 'frontend',
    gridX: -2, gridZ: 0,
    footprint: 2,
    height: 6,
    glowIntensity: 0.6,
    color: '#00DC82',
    tags: ['SSR', 'SSG', 'Full-Stack'],
  },
  // ===== 移动端区 =====
  {
    id: 'uniapp',
    name: 'uni-app',
    district: 'mobile',
    gridX: 0, gridZ: -2,
    footprint: 2,
    height: 8,
    glowIntensity: 0.85,
    color: '#2B9939',
    tags: ['小程序', 'H5', 'App'],
  },
  {
    id: 'echarts',
    name: 'ECharts',
    district: 'mobile',
    gridX: 2, gridZ: -2,
    footprint: 1,
    height: 7,
    glowIntensity: 0.8,
    color: '#E91E63',
    tags: ['数据可视化', 'Canvas'],
  },
  {
    id: 'css3',
    name: 'CSS3',
    district: 'mobile',
    gridX: 0, gridZ: 2,
    footprint: 1,
    height: 8,
    glowIntensity: 0.75,
    color: '#1572B6',
    tags: ['动画', 'Grid/Flex', '响应式'],
  },
  {
    id: 'miniprogram',
    name: '微信小程序',
    district: 'mobile',
    gridX: 2, gridZ: 2,
    footprint: 2,
    height: 7,
    glowIntensity: 0.7,
    color: '#07C160',
    tags: ['原生开发', '支付', 'OCR'],
  },
  // ===== 后端区 =====
  {
    id: 'nestjs',
    name: 'NestJS',
    district: 'backend',
    gridX: 4, gridZ: -2,
    footprint: 3,
    height: 9,
    glowIntensity: 0.95,
    color: '#E0234E',
    tags: ['BFF', 'RxJS', '中间件', '鉴权'],
  },
  {
    id: 'python',
    name: 'Python/FastAPI',
    district: 'backend',
    gridX: 6, gridZ: -2,
    footprint: 2,
    height: 7,
    glowIntensity: 0.7,
    color: '#3776AB',
    tags: ['SSE', 'AI 集成', 'RESTful'],
  },
  {
    id: 'nodejs',
    name: 'Node.js',
    district: 'backend',
    gridX: 4, gridZ: 2,
    footprint: 2,
    height: 8,
    glowIntensity: 0.85,
    color: '#339933',
    tags: ['Express', '中间件', '流处理'],
  },
  {
    id: 'llm',
    name: 'AI/LLM',
    district: 'backend',
    gridX: 6, gridZ: 2,
    footprint: 2,
    height: 7,
    glowIntensity: 0.9,
    color: '#F59E0B',
    tags: ['DashScope', 'RAG', '流式对话'],
  },
  // ===== 工程化区 =====
  {
    id: 'docker',
    name: 'Docker',
    district: 'engineering',
    gridX: 8, gridZ: -2,
    footprint: 2,
    height: 7,
    glowIntensity: 0.8,
    color: '#2496ED',
    tags: ['容器化', 'Docker Compose'],
  },
  {
    id: 'git',
    name: 'Git',
    district: 'engineering',
    gridX: 10, gridZ: -2,
    footprint: 2,
    height: 8,
    glowIntensity: 0.9,
    color: '#F05032',
    tags: ['分支管理', 'CI/CD', 'Code Review'],
  },
  {
    id: 'eslint',
    name: 'ESLint',
    district: 'engineering',
    gridX: 8, gridZ: 2,
    footprint: 1,
    height: 6,
    glowIntensity: 0.6,
    color: '#4B32C3',
    tags: ['Prettier', 'Stylelint', '规范'],
  },
  {
    id: 'linux',
    name: 'Linux',
    district: 'engineering',
    gridX: 10, gridZ: 2,
    footprint: 1,
    height: 7,
    glowIntensity: 0.7,
    color: '#FCC624',
    tags: ['运维', '部署', 'Nginx'],
  },
]

/**
 * 特大项目建筑 — 放在区域之间的广场上
 */
export interface LandmarkData extends BuildingData {
  description: string
}

export const landmarks: LandmarkData[] = [
  {
    id: 'erp',
    name: 'ERP 2.0',
    district: 'frontend',
    gridX: -6, gridZ: -6,
    footprint: 4,
    height: 10,
    glowIntensity: 1.0,
    color: '#4F46E5',
    tags: ['Vue 3', 'Element Plus', 'AI 对话', '动态路由'],
    description: '集团级 ERP 管理平台，覆盖客户、订单、采购、仓储、财务等核心模块，集成 AI 代理对话入口。',
    url: '',
  },
  {
    id: 'warehouse',
    name: '仓储 BFF',
    district: 'backend',
    gridX: 4, gridZ: -6,
    footprint: 3,
    height: 9,
    glowIntensity: 0.95,
    color: '#E0234E',
    tags: ['NestJS', 'RxJS', 'XML 中间件', '鉴权透传'],
    description: '仓储管理 BFF 层，统一鉴权透传、全局异常过滤、XML 中间件，通过 RxJS 封装多下游服务调用。',
    url: '',
  },
  {
    id: 'miniapp-b2b',
    name: 'B2B 电商',
    district: 'mobile',
    gridX: 0, gridZ: -6,
    footprint: 3,
    height: 8,
    glowIntensity: 0.85,
    color: '#2B9939',
    tags: ['uni-app', '微信支付', '阿里云 OSS', 'B2B'],
    description: '面向酒类经销商的 B2B 采购平台，含资质认证、商品筛选、购物车、微信支付等完整链路。',
    url: '',
  },
  {
    id: 'registration',
    name: '报名小程序',
    district: 'mobile',
    gridX: 2, gridZ: -6,
    footprint: 2,
    height: 7,
    glowIntensity: 0.75,
    color: '#07C160',
    tags: ['mpvue', 'ECharts', 'Canvas', 'OCR'],
    description: '活动报名与团购接龙小程序，覆盖活动发布、收费管理、签到核销、长图分享全流程。',
    url: '',
  },
]
