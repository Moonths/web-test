# 数字展厅 — 项目状态文档

> 最后更新：2026-07-29

## 项目概述

一个基于 Three.js + Vue 3 的 3D 数字展厅，用于展示个人简历和项目经历。用户在封闭的展厅空间中通过 WASD 控制角色移动，拖拽鼠标旋转视角，点击大屏进入全屏简历。

## 技术栈

- **框架**: Vue 3 + TypeScript + Vite
- **3D 引擎**: Three.js 0.168
- **微前端**: qiankun (vite-plugin-qiankun)
- **包管理**: pnpm workspace (monorepo)
- **端口**: 5200

## 文件结构

```
packages/digital-city/
├── public/models/
│   └── bat_dark_bad_cartoon_monster.glb    # 角色模型（蝙蝠怪物）
├── src/
│   ├── App.vue                              # 主组件：场景整合 + 全屏简历覆盖层
│   ├── main.ts                              # 入口，qiankun 生命周期
│   ├── styles/
│   │   └── exhibition.css                   # 全局样式
│   ├── composables/
│   │   ├── useExhibitionHall.ts             # 展厅场景：房间、墙壁、地板、灯光、粒子
│   │   ├── useOrbitCamera.ts                # 轨道相机：拖拽旋转、滚轮/触控板缩放
│   │   ├── useCharacter.ts                  # 可控角色：WASD移动、GLB模型加载、动画
│   │   └── useExhibitionScreens.ts          # 屏幕系统：主屏Canvas纹理 + 4项目屏
│   └── vite-env.d.ts
├── vite.config.ts                           # Vite配置（含three/GLTFLoader预优化）
└── package.json
```

## 核心架构

### 展厅 (`useExhibitionHall.ts`)

**房间尺寸**: 宽28m × 深23m × 高9m（`HALL` 常量）

**结构**:
- 四面平面墙壁 + 地板 + 天花板
- 地板有暗色网格参考线 + 中心十字粗线
- 地板边缘发光带、墙角发光竖条、墙脚/墙顶发光带
- 天花板嵌入式灯槽面板

**灯光**:
- 环境光: `#222233` 强度 2.5
- 3 盏射灯指向主屏幕
- 4 个项目模块各有独立光源
- 墙壁底部洗墙灯

**氛围**: 300 个悬浮粒子

### 屏幕系统 (`useExhibitionScreens.ts`)

**主屏幕** (MAIN_SCREEN):
- 位置: `(0, 4.2, -10.5)`，尺寸 10×5.5
- Canvas 纹理渲染简历内容（1024×586）
- 木质画框 + 内衬发光边

**项目屏幕** (PROJECT_SLOTS):
- 位置: `(±12, 4.8, z=-8/z=3)`，尺寸 5×3
- Canvas 纹理 (500×300)
- 木质画框 + 亚麻内衬
- 自动面向房间中心 `(0, 0, 0)`

**点击提示**: 三层光圈（外环+内环+中心点），脉冲动画

### 角色系统 (`useCharacter.ts`)

**模型**: `bat_dark_bad_cartoon_monster.glb`
- 缩放: `baseScale × 0.63`（目标高度 2.2m）
- 离地: 模型高度 × 40%
- 跟随光源: 暖白 PointLight 跟随角色
- 动画: 支持 idle/walk，移动时播放 walk(1.5×)，静止时 frozen
- 朝向: `rotator.rotation.y = atan2(-dx, -dz)`（移动时）/ `cameraAzimuth`（静止时）
- 旋转隔离容器避免 AnimationMixer 干扰

**控制**: WASD/方向键移动，`Enter` 聚焦大屏，`Esc` 退出

### 相机系统 (`useOrbitCamera.ts`)

**轨道中心**: `(0, 4.5, 0)`
**距离范围**: 8–20m，默认 30m（远景）/ 14m（近景）
**俯仰范围**: 0.1–0.9 rad
**控制**:
- 左键拖拽: 旋转视角
- 滚轮/触控板双指: 缩放
- Safari: gesturechange 事件支持

**远近景切换**: WASD 按下 → 14m 近景；松开 0.3s 后 → 30m 远景（`App.vue`）

### 全屏简历 (`App.vue`)

按 `Enter` 或点击主屏幕触发，`Esc` 退出。覆盖层展示完整简历：
- 头部信息（姓名、职位、联系方式）
- 技能四象限
- 工作经历时间线
- 核心项目卡片

内容来源: `毛际可_前端工程师简历.docx`

## 关键常量速查

| 常量 | 值 | 位置 |
|------|-----|------|
| HALL.width/depth/height | 28/23/9 | useExhibitionHall.ts |
| MAIN_SCREEN | (0, 4.2, -10.5) 10×5.5 | useExhibitionHall.ts |
| PROJECT_SLOTS | (±12, 4.8, z) 5×3 | useExhibitionHall.ts |
| ORBIT_CENTER | (0, 4.5, 0) | useOrbitCamera.ts |
| DEFAULT_DIST (远景) | 30 | useOrbitCamera.ts |
| 近景距离 | 14 | App.vue |
| MODEL_PATH | bat_dark_bad_cartoon_monster.glb | useCharacter.ts |
| MODEL_SCALE | baseScale × 0.63 | useCharacter.ts |
| 模型离地 | 高度 × 0.4 | useCharacter.ts |

## 启动方式

```bash
cd /Users/maojike/resume-website/packages/digital-city
npx vite --port 5200 --host 0.0.0.0
```

访问: http://localhost:5200

## 已知问题 / 待优化

1. 角色朝向偶尔与移动方向不一致（可能与 AnimationMixer 根骨骼 motion 有关）
2. 画廊风格改造未完成（墙面颜色切换有缓存问题）
3. 项目屏幕文字更新需手动修改 Canvas 渲染代码
4. macOS Safari 触控板缩放已支持 gesturechange，但灵敏度可调优
