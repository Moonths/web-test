export interface SkillCategory {
  title: string
  items: string[]
}

export interface TimelineItem {
  period: string
  company: string
  role: string
  bullets: string[]
}

export interface Project {
  title: string
  desc: string
  tags: string[]
}

export const skills: SkillCategory[] = [
  {
    title: '前端框架与技术',
    items: ['Vue 3 / Vue 2', 'Nuxt.js', 'TypeScript', 'Vite / Webpack', 'Pinia / Vuex'],
  },
  {
    title: '移动端 & 小程序',
    items: ['uni-app', '微信原生小程序', 'H5 / Vant', 'Tailwind CSS', 'CSS3 动画'],
  },
  {
    title: '后端 & BFF',
    items: ['NestJS / Node.js', 'Python / FastAPI', 'SSE 流式接口', 'RESTful API', 'DashScope / 百炼'],
  },
  {
    title: '工程化 & 工具',
    items: ['Git / Docker / Linux', 'ESLint / Prettier / Stylelint', 'Husky / commitlint', 'Element Plus / Ant Design', 'Axios', 'npm / pnpm', 'nvm'],
  },
]

export const experience: TimelineItem[] = [
  {
    period: '2018.11 — 2026.1',
    company: '挖酒网',
    role: '前端负责人',
    bullets: [
      '管理大前端部门，主导网页、小程序、管理系统、APP的研发与迭代，协调跨部门资源，制定客户端重构计划与新技术推广。',
      '搭建前端工程化体系：TypeScript + ESLint/Prettier/Stylelint + Husky/commitlint + Vite 打包优化，提升代码规范与可维护性。',
      '主导集团 ERP2.0（Vue3 + Element Plus）开发，覆盖客户、订单、采购、仓储、财务等核心模块，集成 AI 代理对话入口。',
      '独立开发仓储管理 BFF（NestJS），统一鉴权透传、全局异常过滤、XML 中间件，通过 RxJS 封装多下游服务调用。',
      '实现 SSE 流式渲染与大模型交互，完成前端与后端事件协议适配。',
    ],
  },
  {
    period: '2016.01 — 2018.10',
    company: '逻辑适点',
    role: '前端工程师',
    bullets: [
      '配合后端完成多个 PC 端与移动端项目开发，积累扎实的 HTML/CSS/JS 基础。',
      '独立完成纯 CSS 教学动画项目，深入掌握 CSS3 动画与交互技巧。',
    ],
  },
]

export const projects: Project[] = [
  {
    title: '集团 ERP2.0 管理平台',
    desc: '集团化 ERP 管理后台，覆盖客户、产品、订单、采购、仓储、财务等核心模块，集成 AI 代理对话入口。搭建工程架构（动态路由权限、动态表格、流式下载、链式层级、pdf单据生成、批量导入优化），集成阿里云 OSS。',
    tags: ['Vue 3', 'TypeScript', 'Element Plus', 'Vite', 'Pinia'],
  },
  {
    title: '智能文档问答系统',
    desc: '支持文档解析建库、知识检索、带引用的流式问答。前端实现 SSE 流式渲染（Fetch ReadableStream），后端混合检索 + rerank + 大模型流式生成，Docker Compose 多服务编排。',
    tags: ['Vue 3', 'FastAPI', 'PostgreSQL', 'Elasticsearch', 'DashScope'],
  },
  {
    title: '仓储管理系统 + BFF',
    desc: '仓储全流程管理后台，覆盖入出库、盘点、销售、采购、售后等模块。独立开发 NestJS BFF 层，统一鉴权透传、全局异常过滤、XML 中间件，通过 RxJS 封装下游调用。',
    tags: ['Vue 3', 'Element UI', 'NestJS', 'TypeScript', 'RxJS'],
  },
  {
    title: '微信小程序 B2B 电商平台',
    desc: '面向酒类经销商的 B2B 采购平台，含资质认证、商品多维筛选、购物车、微信支付、优惠券、推荐分销等完整链路。OSS STS 临时凭证上传，前端集成多种加密工具。',
    tags: ['微信小程序', 'WXML/WXSS', '阿里云 OSS', '微信支付', 'RESTful API'],
  },
]
