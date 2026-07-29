# AGENTS.md — resume-website

## 架构说明（v2.0）

### 整体架构
```
portal (port 5100) ← 单页面入口，无路由、无 qiankun
├── 3D 展览厅 = 首页（Three.js 沉浸场景）
├── 简历覆盖层（点击主屏幕触发 / Esc 关闭）
└── 数据大屏覆盖层（点击右侧白板触发 / Esc 关闭）
```

- **portal**: 唯一的 Vue 3 应用入口，包含全部的 3D 场景（从 `@resume/digital-city` 合并）
- **resume**: 独立包，保持独立的开发能力，但生产环境通过 portal 覆盖层展示
- **dashboard**: 独立包，生产环境通过 portal 覆盖层展示
- **admin**: 管理后台，独立运行
- **shared**: 共享设计 Token 与类型定义

### 交互流程
1. 首页全屏 3D 展览厅（封闭黑墙房间 + 中央大屏 + 两侧落地魔镜）
2. WASD 移动角色，鼠标拖拽旋转视角，滚轮缩放
3. **点击中央大屏** → 全屏简历覆盖层（Indigo 暗色调，可滚动）
4. **点击右侧白板** → 全屏数据大屏覆盖层（指挥中心风格）
5. **Esc 键** → 关闭当前覆盖层，回到 3D 场景
6. 移动端支持触控摇杆

### 文件结构
```
portal/                         ← 主入口（3D 展厅）
├── src/
│   ├── App.vue                 ← 3D 场景 + 简历/大屏覆盖层
│   ├── main.ts                 ← 挂载点，无路由
│   ├── composables/            ← Three.js 场景 composables
│   │   ├── useExhibitionHall.ts    ← 展厅场景（房间、灯光、粒子）
│   │   ├── useExhibitionScreens.ts ← 屏幕系统（Canvas 纹理）
│   │   ├── useMagicMirrors.ts      ← 落地魔镜（GLB 模型）
│   │   ├── useCharacter.ts         ← WASD 角色控制
│   │   ├── useOrbitCamera.ts       ← 轨道相机
│   │   └── useCodeFlow.ts          ← 墙面代码雨 + 天花板灯光
│   ├── styles/
│   │   └── exhibition.css      ← 展厅全局样式
│   ├── utils/
│   │   └── assetPath.ts        ← 资源路径解析
│   └── data/
│       └── city-data.ts        ← 城市建筑数据（备用）
└── public/
    ├── models/                 ← GLB 3D 模型
    └── screens/                ← 屏幕图片素材

packages/
├── resume/         ← 简历包（独立开发，含所有 section 组件）
├── dashboard/      ← 数据大屏包
├── admin/          ← 管理后台包
└── shared/         ← 共享 Token 与类型
```

### 开发启动
```bash
# 启动 portal（唯一需要的开发命令）
pnpm dev               # = pnpm --filter portal dev
pnpm dev:portal        # 同上

# 独立开发子包（需要时）
pnpm dev:resume        # 端口 5173
pnpm dev:dashboard     # 端口 5176
pnpm dev:admin         # 端口 5174
```

### 构建部署
```bash
pnpm build             # 构建所有包
pnpm build:portal      # 只构建 portal
```

构建产物位于 `portal/dist/`，使用 Nginx 托管。`nginx.conf` 中配置 SPA 回退。

---

## Design Context

### Users
招聘方、技术负责人、潜在合作者，评估毛际可作为高级前端工程师的技术深度与职业素养。
访问场景：工作时间桌面端浏览为主，移动端碎片化浏览为辅。
核心任务：3 秒内判断「这个人靠不靠谱」，然后深入了解项目经历与技术栈。

### Brand Personality
专业 · 沉稳 · 精致（Professional · Confident · Refined）

界面应传递信任感与能力感——一个能交付生产级代码的工程师。语气冷静自信，不浮夸，不自我推销。技术感通过细节体现（精准的间距、一致的 token、克制的动效），而非通过视觉噪音堆砌。

### Aesthetic Direction
3D 展览厅沉浸风格 + 技术精准感。Indigo 主色配 Slate 中性色，Amber 作为次要强调。
深色背景 3D 场景，覆盖层采用黑暗透明毛玻璃效果，内容区保持干净的可读性。
覆盖层全部关闭后回到全屏 3D 场景——交互本身即为设计语言。

布局左对齐为主，非对称构图，大量留白。避免：Bootstrap 风格的通用作品集、
过度动画的"创意"风格、深色背景+霓虹光晕的 AI 美学、千篇一律的卡片网格。

参考气质：Linear.app 的精准克制、Vercel 的工程师美学、Stripe 的专业信任感。

### Design Principles
1. **3D 沉浸但不干扰** — 展厅场景吸引注意力，但覆盖层的可读性优先
2. **克制即自信** — Indigo 色在覆盖层每屏不超过 3 次出现，留白是设计语言的一部分
3. **技术精准** — 严格遵循 8pt 间距系统与 Type Scale，无随意数值
4. **渐进披露** — 首屏 3D 场景展示技术人格，点击后展现深度内容
5. **双模式一等公民** — Light 与 Dark 模式均为精心设计，非简单色值反转

### Technical Context
- 框架：Vue 3 + TypeScript + Vite，无 UI 框架，纯自定义 CSS
- 3D 引擎：Three.js，通过 Composables 组织场景逻辑
- 设计 Token：`packages/shared/src/tokens/index.css`，基于 CSS 自定义属性
- 3D 模型：GLB 格式（蝙蝠怪物角色、电脑桌、白板），放置在 `portal/public/models/`
- 主色：Indigo 600 (`#4F46E5`)，暗色下提亮至 Indigo 400 (`#818CF8`)
- 字体：Inter（西文）+ PingFang SC / Microsoft YaHei（中文）+ JetBrains Mono（代码）
- 断点：640 / 768 / 1024 / 1280 / 1536px，Mobile First
- 详细规范见 `design/DESIGN_SPEC.md`
