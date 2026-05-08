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
    title: '前端框架',
    items: ['Vue 2 / Vue 3', 'TypeScript', 'Vite / Vue CLI', 'Pinia / Vuex', 'Vue Router'],
  },
  {
    title: '移动端 & 小程序',
    items: ['Vant / lib-flexible', '微信原生小程序', 'mpvue', 'uni-app', '微信 JS-SDK'],
  },
  {
    title: 'UI 组件库',
    items: ['Element UI / Element Plus', 'Vant', 'ECharts', 'html2canvas', 'vuedraggable'],
  },
  {
    title: '后端 & 工程化',
    items: ['NestJS / Node.js', 'Axios / RESTful API', 'Git / ESLint / Prettier', 'Webpack / Vite', 'Vercel / Nginx 部署'],
  },
]

export const experience: TimelineItem[] = [
  {
    period: '2022 — 至今',
    company: '某科技公司',
    role: '高级前端工程师',
    bullets: [
      '主导仓储管理系统（jss-storage-admin）前端架构，基于 Vue2 + Element UI 实现库存、销售、采购、售后等核心模块。',
      '独立开发 BFF 层（NestJS + Fastify），封装全局响应拦截、鉴权守卫、异常过滤器，解决大数字精度丢失问题。',
      '负责集团 ERP 系统（conglomerates-erp）前端开发，基于 Vue3 + TypeScript + Element Plus，覆盖财务、采购、供应商、仓储、订单等 15+ 业务模块。',
    ],
  },
  {
    period: '2019 — 2022',
    company: '某电商公司',
    role: '前端工程师',
    bullets: [
      '负责移动端商城（wj-mall-h5）开发，基于 Vue2 + Vant，实现商品浏览、购物车、订单支付、会员中心、推广海报等完整电商链路。',
      '集成微信 JS-SDK，实现微信支付、分享、定位等能力。',
      '独立开发微信小程序，覆盖商品展示、订单管理、用户中心等核心功能。',
    ],
  },
  {
    period: '2015 — 2019',
    company: '早期经历',
    role: '前端开发工程师',
    bullets: [
      '参与多个 PC 端管理后台与移动端 H5 项目开发，积累扎实的 HTML/CSS/JS 基础。',
      '逐步掌握 Vue 生态，从 Vue 2 迁移至 Vue 3，持续跟进前端技术演进。',
    ],
  },
]

export const projects: Project[] = [
  {
    title: '集团 ERP 系统',
    desc: '面向集团多业务线的企业资源管理平台，覆盖财务应收、采购保税仓、供应商管理、订单履约、仓储调拨等 15+ 模块，支持多角色权限体系。',
    tags: ['Vue 3', 'TypeScript', 'Element Plus', 'Vite', 'Pinia'],
  },
  {
    title: '仓储管理系统 + BFF',
    desc: '仓储全流程管理系统，含入库、出库、库存盘点、销售、采购、售后等模块。独立开发 NestJS BFF 层，统一鉴权、日志、异常处理与大数字精度问题。',
    tags: ['Vue 2', 'Element UI', 'NestJS', 'Fastify', 'TypeScript'],
  },
  {
    title: '移动端电商商城',
    desc: '完整移动端电商 H5，涵盖商品列表、购物车、多种支付方式、订单追踪、会员中心、推广海报生成、微信分享等功能，接入微信 JS-SDK。',
    tags: ['Vue 2', 'Vant', 'Vuex', '微信 JS-SDK', 'ECharts'],
  },
  {
    title: '微信小程序（独立开发）',
    desc: '独立完成多款微信小程序从立项到上线的全流程，涵盖商品展示、订单管理、用户中心等场景，熟练使用微信原生、mpvue、uni-app 三种方案。',
    tags: ['微信原生', 'mpvue', 'uni-app', '小程序云开发'],
  },
]
