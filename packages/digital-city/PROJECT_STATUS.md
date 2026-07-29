# 数字展厅 — 项目状态文档

> 最后更新：2026-07-29

## 项目概述

一个基于 Three.js + Vue 3 的 3D 数字展厅，用于展示个人简历和项目经历。用户在封闭的展厅空间中通过 WASD / 摇杆控制角色移动，拖拽鼠标旋转视角，点击大屏进入全屏简历。

## 技术栈

- **框架**: Vue 3 + TypeScript + Vite
- **3D 引擎**: Three.js 0.168
- **微前端**: qiankun (vite-plugin-qiankun)
- **包管理**: pnpm workspace (monorepo)
- **端口**: 5200 / 5175

## 文件结构

```
packages/digital-city/
├── public/
│   ├── models/
│   │   ├── bat_dark_bad_cartoon_monster.glb  # 角色模型（蝙蝠怪物）
│   │   ├── whiteboard.glb                     # 白板模型（右侧魔镜替换）
│   │   ├── computer__desk.glb                 # 电脑桌模型（左侧魔镜）
│   │   ├── cartoon_chicken.glb                # 备用模型
│   │   └── bat_dark_bad_cartoon_monster.glb
│   └── screens/
│       ├── liucheng.jpeg                      # 左侧画框：流程图
│       └── miniprogram.jpeg                   # 右侧画框：小程序截图
├── src/
│   ├── App.vue                                # 主组件：场景整合 + 摇杆 + 全屏简历
│   ├── main.ts                                # 入口，qiankun 生命周期
│   ├── styles/
│   │   └── exhibition.css                     # 全局样式
│   ├── composables/
│   │   ├── useExhibitionHall.ts               # 展厅场景：房间、墙壁、地板、灯光、粒子
│   │   ├── useOrbitCamera.ts                  # 轨道相机：拖拽旋转、滚轮/触控板缩放
│   │   ├── useCharacter.ts                    # 可控角色：WASD/摇杆移动、GLB模型加载、动画
│   │   ├── useExhibitionScreens.ts            # 屏幕系统：主屏 + 2侧画框（图片展示）
│   │   ├── useMagicMirrors.ts                 # 主屏幕两侧装饰：左电脑桌 + 右白板（含思维导图动画）
│   │   ├── useCodeFlow.ts                     # 墙面代码流动效
│   │   └── useCityScene.ts                    # 城市场景核心
│   └── vite-env.d.ts
├── vite.config.ts                             # Vite配置（含three/GLTFLoader预优化）
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
- 位置: `(0, 6.0, -10.5)`，尺寸 12.1×6.65（已放大 21%）
- Canvas 纹理渲染简历内容（1024×586）
- 木质画框 + 内衬发光边
- 点击光圈提示位于屏幕底部内部

**侧边画框** (PROJECT_SLOTS):
- 位置: `(±12, 7.0, 3)`，尺寸 6.5×5
- 左：`liucheng.jpeg`（流程图）
- 右：`miniprogram.jpeg`（小程序截图）
- Image + CanvasTexture 异步加载，等比适配（cover 模式）
- 木质画框

### 魔镜系统 (`useMagicMirrors.ts`)

**左镜**: `computer__desk.glb` 电脑桌模型
**右镜**: `whiteboard.glb` 白板模型
- 白板表面叠加思维导图动画（18s 循环）
- 节点：毛际可·前端工程 → 技术栈/工程化/架构设计/质量保障/可视化/全栈能力
- Sprite/PlaneGeometry/Clone 三种方式迭代后确定为 Image+CanvasTexture 叠加层
- 点击提示环（脉冲动画）

### 角色系统 (`useCharacter.ts`)

**模型**: `bat_dark_bad_cartoon_monster.glb`
- 缩放: `baseScale × 0.63`（目标高度 2.2m）
- 离地: 模型高度 × 40%
- 跟随光源: 暖白 PointLight 跟随角色
- 动画: 支持 idle/walk，移动时播放 walk(1.5×)，静止时 frozen
- 朝向: `rotator.rotation.y = atan2(-dx, -dz)`（移动时）/ `cameraAzimuth`（静止时）
- 初始位置: `(0, 0, -2)`（展厅中部偏后）
- 材质已提亮（`color.setHex(0xb0b8d0)` + emissive 自发光）

**控制**: WASD/方向键 + 摇杆（移动端），`Enter` 聚焦大屏，`Esc` 退出

### 相机系统 (`useOrbitCamera.ts`)

**轨道中心**: `(0, 4.5, 0)`
**距离范围**: 8–20m，默认 30m（远景）/ 14m（近景）
**俯仰范围**: 0.1–0.9 rad
**控制**:
- 左键拖拽: 旋转视角
- 滚轮/触控板双指: 缩放
- Safari: gesturechange 事件支持

**远近景切换**: WASD 按下 → 14m 近景；松开 0.3s 后 → 30m 远景（`App.vue`）

### 移动端兼容
- 摇杆（屏幕左下角，触控驱动，`pointer:fine` 桌面端隐藏）
- WASD 键位提示在移动端缩小适配

### 全屏简历 (`App.vue`)

按 `Enter` 或点击主屏幕触发，`Esc` 退出。覆盖层展示完整简历：
- 头部信息（姓名、职位、联系方式）
- 技能四象限
- 工作经历时间线
- 核心项目卡片

## 关键常量速查

| 常量 | 值 | 位置 |
|------|-----|------|
| HALL.width/depth/height | 28/23/13 | useExhibitionHall.ts |
| MAIN_SCREEN | (0, 6.0, -10.5) 12.1×6.65 | useExhibitionHall.ts |
| PROJECT_SLOTS | (±12, 7.0, 3) 6.5×5 | useExhibitionHall.ts |
| MIRROR_SLOTS.left/right | (-12, -8) / (12, -8) | useExhibitionHall.ts |
| ORBIT_CENTER | (0, 4.5, 0) | useOrbitCamera.ts |
| DEFAULT_DIST (远景) | 30 | useOrbitCamera.ts |
| 近景距离 | 14 | App.vue |
| MODEL_PATH | bat_dark_bad_cartoon_monster.glb | useCharacter.ts |
| 角色初始位置 | (0, 0, -2) | useCharacter.ts |

## 启动方式

```bash
cd /Users/maojike/resume-website/packages/digital-city
npx vite --port 5175 --host 0.0.0.0
```

访问: http://localhost:5175

## 已知问题 / 待优化

1. 角色朝向偶尔与移动方向不一致（可能与 AnimationMixer 根骨骼 motion 有关）
2. 画廊风格改造未完成（墙面颜色切换有缓存问题）
3. 侧边画框图片加载后未做内存优化
4. macOS Safari 触控板缩放已支持 gesturechange，但灵敏度可调优
