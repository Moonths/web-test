# 个人简历网站设计规范 DESIGN_SPEC

**版本**: 1.0.0
**更新日期**: 2026-05-06
**设计风格**: 现代简洁，专业克制，轻度 Glassmorphism 点缀
**目标平台**: Web（Mobile / Tablet / Desktop 响应式）

---

## 1. 设计理念

### 1.1 核心原则

- **内容优先**：排版服务于内容可读性，视觉不喧宾夺主
- **留白呼吸**：大量负空间营造高端、冷静的专业感
- **克制配色**：以中性色为基底，单一强调色点睛
- **层次清晰**：通过字号、字重、间距建立信息层级，少用边框和分割线

### 1.2 视觉关键词

- 极简 Minimal
- 现代 Modern
- 专业 Professional
- 沉稳 Confident
- 精致 Refined

---

## 2. 配色方案

### 2.1 主色板（Light Mode）

| 用途 | 名称 | HEX | RGB | 说明 |
|------|------|------|-----|------|
| 主色 Primary | Indigo 600 | `#4F46E5` | `79, 70, 229` | CTA、链接、强调元素 |
| 主色深 Primary Dark | Indigo 700 | `#4338CA` | `67, 56, 202` | Hover 状态 |
| 主色浅 Primary Light | Indigo 50 | `#EEF2FF` | `238, 242, 255` | 标签背景、高亮区域 |
| 辅助色 Accent | Amber 500 | `#F59E0B` | `245, 158, 11` | 次要强调、徽章 |
| 背景 Background | White | `#FFFFFF` | `255, 255, 255` | 主背景 |
| 次背景 Surface | Slate 50 | `#F8FAFC` | `248, 250, 252` | 卡片背景、区块交替 |
| 边框 Border | Slate 200 | `#E2E8F0` | `226, 232, 240` | 分割线、边框 |
| 主文字 Text Primary | Slate 900 | `#0F172A` | `15, 23, 42` | 标题、正文 |
| 次文字 Text Secondary | Slate 600 | `#475569` | `71, 85, 105` | 描述、辅助文字 |
| 弱文字 Text Tertiary | Slate 400 | `#94A3B8` | `148, 163, 184` | 占位、禁用、元信息 |

### 2.2 主色板（Dark Mode）

| 用途 | HEX | 说明 |
|------|------|------|
| Primary | `#818CF8` | Indigo 400，暗色下提亮 |
| Primary Dark | `#6366F1` | Hover |
| Background | `#0B1120` | 深邃蓝黑 |
| Surface | `#111827` | 卡片背景 |
| Border | `#1F2937` | 弱边框 |
| Text Primary | `#F1F5F9` | 主文字 |
| Text Secondary | `#CBD5E1` | 次文字 |
| Text Tertiary | `#64748B` | 弱文字 |

### 2.3 语义色

| 用途 | Light | Dark |
|------|-------|------|
| Success | `#10B981` | `#34D399` |
| Warning | `#F59E0B` | `#FBBF24` |
| Error | `#EF4444` | `#F87171` |
| Info | `#3B82F6` | `#60A5FA` |

### 2.4 色彩使用规则

- 主色 Primary 在一屏范围内出现不超过 3 次，保持克制
- 正文永远使用 Text Primary，不要用 Primary 色做大段文字
- 背景色之间差异小于 5% 亮度，避免割裂感
- 对比度：正文 vs 背景至少 `7:1`（WCAG AAA），次要文字至少 `4.5:1`（AA）

---

## 3. 排版规范

### 3.1 字体族

```css
/* 主字体 - 西文与中文 */
font-family:
  'Inter',                    /* 西文 */
  'PingFang SC',              /* macOS 中文 */
  'Microsoft YaHei',          /* Windows 中文 */
  'Noto Sans SC',             /* 跨平台中文 */
  system-ui,
  -apple-system,
  sans-serif;

/* 等宽字体 - 代码、数字 */
font-family:
  'JetBrains Mono',
  'SF Mono',
  'Consolas',
  monospace;
```

### 3.2 字号层级（Type Scale）

基于 `1.25` 比例（Major Third）缩放，根字号 `16px`。

| Token | Size | Line Height | Weight | 使用场景 |
|-------|------|-------------|--------|----------|
| `display` | `72px / 4.5rem` | `1.1` | 700 | Hero 大标题（Desktop） |
| `h1` | `48px / 3rem` | `1.2` | 700 | 页面主标题 |
| `h2` | `36px / 2.25rem` | `1.25` | 600 | 区块标题（About、Skills...） |
| `h3` | `24px / 1.5rem` | `1.3` | 600 | 卡片标题、子标题 |
| `h4` | `20px / 1.25rem` | `1.4` | 600 | 次级标题 |
| `body-lg` | `18px / 1.125rem` | `1.6` | 400 | Hero 副文、引导段 |
| `body` | `16px / 1rem` | `1.6` | 400 | 正文默认 |
| `body-sm` | `14px / 0.875rem` | `1.5` | 400 | 辅助说明、表单 |
| `caption` | `12px / 0.75rem` | `1.4` | 500 | 标签、元信息、版权 |
| `overline` | `12px / 0.75rem` | `1.4` | 600 | 大写小标题，`letter-spacing: 0.1em` |

### 3.3 响应式字号

Hero Display 在不同断点下缩放：

| 断点 | Display | H1 | H2 |
|------|---------|----|----|
| Mobile (< 768px) | `40px` | `32px` | `24px` |
| Tablet (768-1024px) | `56px` | `40px` | `30px` |
| Desktop (> 1024px) | `72px` | `48px` | `36px` |

### 3.4 字重规则

- 仅使用三档：`400 Regular` / `600 SemiBold` / `700 Bold`
- 正文一律 `400`，标题用 `600` 或 `700`
- 避免 `300 Light`（在中文显示下易模糊）

---

## 4. 间距与栅格系统

### 4.1 间距 Token（8pt 基准）

| Token | Value | 使用场景 |
|-------|-------|----------|
| `space-1` | `4px` | 图标与文字间距 |
| `space-2` | `8px` | 紧凑元素间距 |
| `space-3` | `12px` | 标签内边距 |
| `space-4` | `16px` | 默认内外边距 |
| `space-6` | `24px` | 组件间距 |
| `space-8` | `32px` | 小模块间距 |
| `space-12` | `48px` | 卡片之间 |
| `space-16` | `64px` | 区块内上下 padding（Mobile） |
| `space-24` | `96px` | 区块之间垂直间距（Desktop） |
| `space-32` | `128px` | Hero 上下留白（Desktop） |

### 4.2 响应式区块间距

```
Mobile:   区块 padding-y = 64px
Tablet:   区块 padding-y = 80px
Desktop:  区块 padding-y = 96-128px
```

### 4.3 容器宽度

| 断点 | 容器最大宽度 | 左右内边距 |
|------|--------------|------------|
| Mobile | `100%` | `16px` |
| Tablet | `100%` | `32px` |
| Desktop | `1200px` | `48px` |
| Large Desktop | `1280px` | `48px` |

### 4.4 栅格系统

- Desktop: 12 列栅格，gutter `24px`
- Tablet: 8 列栅格，gutter `16px`
- Mobile: 4 列栅格，gutter `16px`

---

## 5. 响应式断点

```css
/* Mobile First */
--breakpoint-sm: 640px;   /* 大屏手机 */
--breakpoint-md: 768px;   /* Tablet 起点 */
--breakpoint-lg: 1024px;  /* Desktop 起点 */
--breakpoint-xl: 1280px;  /* 大屏桌面 */
--breakpoint-2xl: 1536px; /* 超宽屏 */
```

| 设备 | 范围 | 设计目标 |
|------|------|----------|
| Mobile | `< 768px` | 单列布局，触摸优先，最小点击 44x44px |
| Tablet | `768-1024px` | 双列布局，中等密度 |
| Desktop | `> 1024px` | 多列布局，鼠标悬停交互 |

---

## 6. 页面结构设计

### 6.1 整体布局骨架

```
+----------------------------------------------------------+
|  NavBar (sticky, 64px, 滚动后磨砂玻璃)                    |
+----------------------------------------------------------+
|                                                          |
|  [1] Hero Section        ~100vh                         |
|      - 大字姓名 + 职位                                    |
|      - 一句话简介                                         |
|      - CTA 按钮 x2                                       |
|                                                          |
+----------------------------------------------------------+
|  [2] About Section       section padding-y               |
|      - 左：头像/插图                                      |
|      - 右：个人简介 3-4 段                                |
+----------------------------------------------------------+
|  [3] Skills Section      Surface 底色                    |
|      - 技能分类卡片网格                                   |
|      - 每类展示技能标签                                   |
+----------------------------------------------------------+
|  [4] Experience Section  时间轴布局                      |
|      - 时间轴 + 经历卡片                                  |
+----------------------------------------------------------+
|  [5] Projects Section    Surface 底色                    |
|      - 项目卡片网格 3x2                                   |
|      - 每个卡片：封面 + 标题 + 描述 + 标签 + 链接         |
+----------------------------------------------------------+
|  [6] Contact Section                                     |
|      - 左：联系方式列表                                   |
|      - 右：联系表单（可选）                               |
+----------------------------------------------------------+
|  Footer (80px)                                           |
|  Copyright + 社交链接                                     |
+----------------------------------------------------------+
```

### 6.2 六大模块详细规范

#### 6.2.1 Hero Section

**目标**：3 秒内让访客了解「你是谁 + 做什么 + 可以找你做什么」

```
Desktop (> 1024px)                   Mobile (< 768px)
+--------------------------------+   +------------------+
|                                |   |                  |
|   Hi, I'm [Name]               |   |  Hi, I'm         |
|   [Role / Title]               |   |  [Name]          |
|                                |   |  [Role]          |
|   [一句话介绍，约 30-50 字]     |   |                  |
|                                |   |  [简介]          |
|   [View Work]  [Contact Me]    |   |                  |
|                                |   |  [View Work]     |
|                                |   |  [Contact]       |
+--------------------------------+   +------------------+
```

- 高度：Desktop `100vh`（最低 `640px`），Mobile `自适应内容 + 顶部空白`
- 左对齐布局（优于居中，更专业）
- 姓名使用 `display` 字号，职位使用 `h2`
- CTA 主按钮 Primary + 次按钮 Ghost，间距 `space-4`
- 可选：右侧装饰性几何图形或抽象渐变

#### 6.2.2 About Section

**目标**：建立信任感，讲述背景故事

```
Desktop:                             Mobile:
+---------+------------------+       +------------------+
| 头像     |  About Me        |       | 头像（居中）      |
| (圆形)   |  [简介 P1]        |       +------------------+
| 240x240 |  [简介 P2]        |       | About Me         |
|          |  [关键数据：       |       | [简介]           |
|          |   10+ 年经验      |       |                  |
|          |   30+ 项目]        |       | [数据]           |
+---------+------------------+       +------------------+
```

- 头像圆形裁切，尺寸 Desktop `240px`、Mobile `160px`
- 可加入 3 个关键数据统计（经验年数、项目数、合作客户数）

#### 6.2.3 Skills Section

**目标**：结构化展示能力矩阵

```
分类卡片 Grid：
Desktop: 3 列    Tablet: 2 列    Mobile: 1 列

+--------------+  +--------------+  +--------------+
| Frontend     |  | Backend      |  | Tools        |
| ------------ |  | ------------ |  | ------------ |
| [React]      |  | [Node.js]    |  | [Git]        |
| [Vue]        |  | [Python]     |  | [Docker]     |
| [TypeScript] |  | [PostgreSQL] |  | [Figma]      |
+--------------+  +--------------+  +--------------+
```

- 分类标题使用图标 + `h3`
- 技能以 Tag 形式展示，避免进度条（除非确实能量化）
- 悬停时 Tag 轻微上浮 + 阴影

#### 6.2.4 Experience Section

**目标**：展示职业履历

```
Desktop (时间轴居左):
+----+------------------------------------+
| ●  | 2023 - Present                     |
| |  | Senior Engineer @ Company          |
| |  | [3-4 条成果要点]                    |
| |  | [技术栈标签]                        |
| ●  | 2020 - 2023                        |
| |  | Engineer @ Another Co.             |
| |  | ...                                |
+----+------------------------------------+

Mobile (时间轴隐藏或简化):
+--------------------------------+
| 2023 - Present                 |
| Senior Engineer @ Company      |
| ...                            |
+--------------------------------+
```

- Desktop 使用时间轴（左侧圆点 + 竖线），Mobile 使用纵向卡片
- 每条经历间距 `space-12`
- 公司名可链接到公司官网（可选）

#### 6.2.5 Projects Section

**目标**：用作品说话，展示实际产出

```
Desktop: 3 列 Grid    Tablet: 2 列    Mobile: 1 列

+------------------+
| [封面图 16:9]     |
|                   |
| Project Name      |
| [简短描述]         |
| [React][Node]     |
| [Demo] [Code]     |
+------------------+
```

- 卡片宽高比：封面 `16:9`，整卡 `3:4`
- 悬停：封面图轻微放大 `scale(1.05)`，卡片阴影加深
- 每卡片展示 2-4 个技术标签，最多 2 个操作链接

#### 6.2.6 Contact Section

**目标**：降低联系门槛

```
Desktop:                             Mobile:
+---------+--------------------+     +------------------+
| Email   |                    |     | Email            |
| GitHub  |  [联系表单]         |     | GitHub           |
| LinkedIn|  Name, Email,      |     | LinkedIn         |
| Twitter |  Message, Submit   |     +------------------+
|         |                    |     | [联系表单]        |
+---------+--------------------+     +------------------+
```

- 联系方式列表：图标 + 标签 + 链接
- 表单为可选方案，若无后端可直接使用 `mailto:` 链接替代

---

## 7. 组件规范

### 7.1 导航栏 NavBar

**结构**：

```
+----------------------------------------------------------+
|  [Logo/Name]      [About Skills Experience ...]   [CTA] |
+----------------------------------------------------------+
```

**规范**：

| 属性 | Desktop | Mobile |
|------|---------|--------|
| 高度 | `64px` | `56px` |
| 背景（顶部） | 透明 | 透明 |
| 背景（滚动后） | `rgba(255,255,255,0.8)` + `backdrop-blur(12px)` | 同 |
| 边框（滚动后） | 底部 `1px solid border` | 同 |
| 导航项字号 | `14px / SemiBold` | 隐藏 |
| 菜单按钮 | 无 | 汉堡图标 `24x24` |
| 内边距 | `0 48px` | `0 16px` |

**状态**：

- 默认：透明背景
- 滚动后（scrollY > 16）：毛玻璃背景 + 底部细线
- 导航项 Hover：文字变 Primary 色 + 下划线动画
- 当前区块激活：文字为 Primary 色

**Mobile 菜单**：

- 点击汉堡图标展开全屏抽屉（从右滑入）
- 关闭按钮在右上角
- 菜单项纵向排列，字号 `24px`

### 7.2 按钮 Button

**变体**：

| 变体 | 背景 | 文字 | 边框 | 使用场景 |
|------|------|------|------|----------|
| `primary` | Primary | White | 无 | 主操作 |
| `secondary` | Surface | Text Primary | Border | 次要操作 |
| `ghost` | Transparent | Primary | Primary `1px` | 轮廓按钮 |
| `link` | Transparent | Primary | 无 | 纯链接样式 |

**尺寸**：

| 尺寸 | Height | Padding-X | Font-Size | Border-Radius |
|------|--------|-----------|-----------|---------------|
| `sm` | `32px` | `12px` | `14px` | `6px` |
| `md` | `40px` | `16px` | `14px` | `8px` |
| `lg` | `48px` | `24px` | `16px` | `10px` |

**状态**：

- Default → Hover：背景色加深 10%，`transition: 200ms ease`
- Hover 轻微上浮：`translateY(-1px)` + 阴影 `shadow-md`
- Active：`translateY(0)` + 阴影减弱
- Disabled：透明度 `0.5`，`cursor: not-allowed`
- Focus：`ring-2 ring-primary/30` 聚焦环

**图标按钮**：

- 正方形，尺寸等于 Height
- 图标居中，大小 `20x20`

### 7.3 卡片 Card

**结构**：

```
+------------------------------+
|  [可选：封面图/图标]          |
|                              |
|  [标题 h3]                   |
|  [描述 body]                 |
|                              |
|  [标签 Tag][标签 Tag]         |
|  [底部操作 / 链接]            |
+------------------------------+
```

**规范**：

| 属性 | 值 |
|------|-----|
| 背景 | `Background` (Light) / `Surface` (Dark) |
| 边框 | `1px solid Border`（或无边框 + 阴影） |
| 圆角 | `12px` |
| 内边距 | `24px`（Desktop）/ `20px`（Mobile） |
| 阴影（默认） | `0 1px 3px rgba(0,0,0,0.05)` |
| 阴影（Hover） | `0 10px 25px rgba(0,0,0,0.1)` |
| Transition | `all 250ms ease` |

**悬停效果**：

- `translateY(-4px)` 上浮
- 阴影加深
- 可选：封面图 `scale(1.05)` 放大
- 移动端不应用 hover（改用 `:active` 轻反馈）

### 7.4 标签 Tag / Chip

**用途**：技能展示、项目技术栈标注

**规范**：

| 属性 | 值 |
|------|-----|
| 高度 | `28px` |
| 内边距 | `0 12px` |
| 字号 | `12px` |
| 字重 | `500 Medium` |
| 圆角 | `14px`（胶囊形） |
| 背景 | `Primary Light` |
| 文字 | `Primary Dark` |
| 边框 | 无 |

**变体**：

- `default`: 中性灰 Slate 100 / Slate 700
- `primary`: Primary Light / Primary Dark
- `accent`: Amber Light / Amber Dark
- `outline`: 透明 + `1px` 边框

**间距**：

- 同行多个 Tag 之间间距 `8px`
- Tag 不包含图标时左右 padding 相等；含图标时图标左侧 `4px`

### 7.5 其他基础组件

#### 图标 Icon

- 使用 Heroicons 或 Lucide Icons
- 默认尺寸 `20x20`，导航栏 `24x24`，装饰 `16x16`
- 颜色继承父级文字色

#### 链接 Link

- 默认：Primary 色，无下划线
- Hover：Primary Dark + 下划线
- Visited：保持 Primary 色（不区分）
- 外链后加 `↗` 图标

#### 分割线 Divider

- 颜色：Border
- 粗细：`1px`
- 大区块之间使用，不在同一卡片内堆叠使用

---

## 8. 动效规范

### 8.1 基础 Transition

```css
--transition-fast: 150ms ease;
--transition-base: 250ms ease;
--transition-slow: 400ms ease;
--ease-out: cubic-bezier(0.22, 1, 0.36, 1);
```

### 8.2 常用动效

| 场景 | 动效 | 时长 |
|------|------|------|
| 按钮 Hover | 背景色过渡 + 上浮 1px | `150ms` |
| 卡片 Hover | 上浮 4px + 阴影加深 | `250ms` |
| 区块入场 | Fade in + Slide up 24px | `600ms ease-out` |
| 图片加载 | Blur-up 过渡 | `400ms` |
| 菜单展开 | Slide in from right | `300ms ease-out` |
| 滚动回顶 | Smooth scroll | Native |

### 8.3 滚动触发动画

- 使用 `IntersectionObserver` 或 Framer Motion
- 元素进入视口 20% 时触发
- 单次触发（不反复），避免干扰
- `prefers-reduced-motion: reduce` 时全部禁用

---

## 9. 阴影系统

```css
--shadow-xs:  0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-sm:  0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
--shadow-md:  0 4px 6px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.03);
--shadow-lg:  0 10px 15px rgba(0, 0, 0, 0.06), 0 4px 6px rgba(0, 0, 0, 0.04);
--shadow-xl:  0 20px 25px rgba(0, 0, 0, 0.08), 0 10px 10px rgba(0, 0, 0, 0.03);
--shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.12);

/* 着色阴影（用于强调） */
--shadow-primary: 0 10px 25px rgba(79, 70, 229, 0.15);
```

使用规则：

- 默认卡片 `shadow-sm`
- Hover 卡片 `shadow-lg`
- 弹窗、抽屉 `shadow-2xl`
- 导航栏滚动后 `shadow-sm`

---

## 10. 圆角系统

```css
--radius-sm:   4px;   /* 小元素：Tag 内部 icon 框 */
--radius-md:   8px;   /* 按钮、输入框 */
--radius-lg:   12px;  /* 卡片 */
--radius-xl:   16px;  /* 大卡片、模态框 */
--radius-2xl:  24px;  /* 特殊装饰 */
--radius-full: 9999px; /* 头像、胶囊标签 */
```

---

## 11. 无障碍访问（A11y）

### 11.1 必须遵守

- 所有图片含 `alt` 属性
- 所有按钮和链接可通过键盘 Tab 访问
- Focus 状态清晰可见（`ring-2`）
- 颜色对比度正文 ≥ `7:1`，UI 元素 ≥ `3:1`
- 使用语义化 HTML：`<nav> <main> <section> <article> <footer>`
- 表单使用 `<label for>` 关联
- 动态内容使用 `aria-live`
- Skip to Content 链接（可选）

### 11.2 键盘导航顺序

```
NavBar → Hero CTA → About → Skills → Experience → Projects → Contact → Footer
```

### 11.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 12. Dark Mode

### 12.1 切换策略

- 默认跟随系统 `prefers-color-scheme`
- 提供手动切换按钮（NavBar 右侧）
- 用户选择存储至 `localStorage`

### 12.2 实现方式

```html
<html class="dark"> <!-- 或移除 class 为 light -->
```

```css
/* Tailwind 示例 */
<div class="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
```

### 12.3 Dark Mode 特别注意

- 图片需要提供深色版本或加蒙版
- 阴影在暗色下透明度需降低
- 主色 Primary 在暗色下需提亮一档（Indigo 400 而非 600）

---

## 13. 设计 Token 导出（供前端使用）

```ts
// design-tokens.ts
export const tokens = {
  color: {
    primary: {
      50: '#EEF2FF',
      500: '#6366F1',
      600: '#4F46E5',
      700: '#4338CA',
    },
    accent: { 500: '#F59E0B' },
    bg: { base: '#FFFFFF', surface: '#F8FAFC' },
    text: { primary: '#0F172A', secondary: '#475569', tertiary: '#94A3B8' },
    border: '#E2E8F0',
  },
  font: {
    sans: "'Inter', 'PingFang SC', system-ui, sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  size: {
    display: '72px', h1: '48px', h2: '36px', h3: '24px',
    body: '16px', bodySm: '14px', caption: '12px',
  },
  space: {
    1: '4px', 2: '8px', 3: '12px', 4: '16px', 6: '24px',
    8: '32px', 12: '48px', 16: '64px', 24: '96px', 32: '128px',
  },
  radius: { sm: '4px', md: '8px', lg: '12px', xl: '16px', full: '9999px' },
  breakpoint: {
    sm: '640px', md: '768px', lg: '1024px', xl: '1280px', '2xl': '1536px',
  },
  shadow: {
    sm: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
    md: '0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.03)',
    lg: '0 10px 15px rgba(0,0,0,0.06), 0 4px 6px rgba(0,0,0,0.04)',
  },
} as const;
```

---

## 14. 组件交付清单（供前端开发）

| 组件 | 优先级 | 复用度 | 备注 |
|------|--------|--------|------|
| `NavBar` | P0 | 高 | 含滚动磨砂、Mobile 抽屉 |
| `Hero` | P0 | 低 | 独立区块 |
| `SectionTitle` | P0 | 高 | 各模块统一标题样式 |
| `Button` | P0 | 高 | 4 种变体 × 3 种尺寸 |
| `Card` | P0 | 高 | Project、Skill 共用 |
| `Tag` | P0 | 高 | 4 种变体 |
| `Timeline` | P1 | 中 | Experience 专用 |
| `ProjectCard` | P0 | 中 | 基于 Card |
| `SkillCategoryCard` | P0 | 低 | |
| `ContactForm` | P1 | 低 | 可选，可替换为 mailto |
| `Footer` | P0 | 低 | |
| `ThemeToggle` | P1 | 高 | Dark Mode 切换 |
| `MobileDrawer` | P0 | 中 | NavBar 依赖 |

---

## 15. 页面性能建议

- 首屏关键 CSS 内联，非关键 CSS 异步加载
- 图片使用 `next/image` 或原生 `loading="lazy"`
- 字体使用 `font-display: swap` 避免 FOIT
- Hero 图片预加载 `<link rel="preload">`
- 总资源 < 500KB（gzip 后）
- Lighthouse 目标：Performance ≥ 95，Accessibility = 100

---

## 16. 设计检查清单

开发前确认：

- [ ] 所有颜色取自 Design Token，无硬编码
- [ ] 所有字号使用 Type Scale，无随意数值
- [ ] 所有间距为 `4` 的倍数
- [ ] Mobile / Tablet / Desktop 三断点均已设计
- [ ] Dark Mode 配色完整
- [ ] 所有交互元素有 `hover`、`focus`、`active`、`disabled` 状态
- [ ] 关键 CTA 对比度 ≥ AA
- [ ] 无障碍：语义标签、aria、键盘导航
- [ ] 动效可通过 `prefers-reduced-motion` 禁用

---

**设计规范到此结束。前端开发请基于此文档实现，如有歧义请与设计师确认。**
