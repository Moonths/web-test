<script setup lang="ts">
/**
 * 数据大屏 — 指挥中心风格看板
 * Phase 2 - 待填充: ECharts 图表 + 实时数据接口
 */

import { ref, onMounted } from 'vue'

const stats = ref([
  { label: '项目数', value: '20+', icon: 'folder' },
  { label: '代码行数', value: '150K+', icon: 'code' },
  { label: '技术栈', value: '16', icon: 'layers' },
  { label: '从业年限', value: '10', icon: 'clock' },
])

const techStack = [
  { name: 'Vue 3', level: 95, color: '#4F46E5' },
  { name: 'TypeScript', level: 90, color: '#3178C6' },
  { name: 'NestJS', level: 85, color: '#E0234E' },
  { name: 'Python', level: 70, color: '#3776AB' },
  { name: 'Docker', level: 75, color: '#2496ED' },
  { name: 'ECharts', level: 80, color: '#E91E63' },
]

const time = ref('')
const date = ref('')

onMounted(() => {
  updateClock()
  setInterval(updateClock, 1000)
})

function updateClock() {
  const now = new Date()
  time.value = now.toLocaleTimeString('zh-CN', { hour12: false })
  date.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    weekday: 'short',
  })
}
</script>

<template>
  <div class="db-root">
    <!-- 顶部 Header -->
    <header class="db-header">
      <div class="db-header-left">
        <span class="db-logo-dot" />
        <h1 class="db-title">毛际可 · 技术能力看板</h1>
      </div>
      <div class="db-header-right">
        <span class="db-clock">{{ date }} {{ time }}</span>
      </div>
    </header>

    <!-- 核心指标卡片 -->
    <section class="db-stats">
      <div v-for="s in stats" :key="s.label" class="db-stat-card">
        <span class="db-stat-value">{{ s.value }}</span>
        <span class="db-stat-label">{{ s.label }}</span>
      </div>
    </section>

    <!-- 内容区 -->
    <div class="db-grid">
      <!-- 左列: 技术栈雷达图占位 -->
      <div class="db-panel">
        <h2 class="db-panel-title">技术栈</h2>
        <div class="db-chart-placeholder">
          <div class="db-radar-ring">
            <div class="db-radar-inner">
              <span class="db-radar-label">ECharts 雷达图</span>
              <span class="db-radar-sub">Phase 3 接入</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 中列: 项目时间轴占位 -->
      <div class="db-panel db-panel--span2">
        <h2 class="db-panel-title">项目经历</h2>
        <div class="db-timeline-placeholder">
          <div class="db-timeline-bar">
            <span class="db-timeline-dot" style="left: 10%">ERP 2.0</span>
            <span class="db-timeline-dot" style="left: 35%">仓储BFF</span>
            <span class="db-timeline-dot" style="left: 60%">B2B电商</span>
            <span class="db-timeline-dot" style="left: 85%">报名小程序</span>
          </div>
        </div>
      </div>

      <!-- 右列: 技能评分 -->
      <div class="db-panel">
        <h2 class="db-panel-title">技能评分</h2>
        <div class="db-bars">
          <div v-for="t in techStack" :key="t.name" class="db-bar-row">
            <span class="db-bar-name">{{ t.name }}</span>
            <div class="db-bar-track">
              <div
                class="db-bar-fill"
                :style="{ width: t.level + '%', background: t.color }"
              />
            </div>
            <span class="db-bar-val">{{ t.level }}%</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="db-footer">
      <span class="db-footer-dot" />
      <span>SYSTEM NORMAL</span>
      <span class="db-footer-sep">|</span>
      <span>实时数据 · ECharts · 全屏适配</span>
    </footer>
  </div>
</template>

<style scoped>
/* Dashboard 子应用 — BEM 命名空间：db- */

.db-root {
  width: 100%;
  min-height: 100vh;
  background: #0a0e17;
  color: #e2e8f0;
  font-family: var(--shared-font-sans);
  padding: 0 32px 24px;
  box-sizing: border-box;
}

/* Header */
.db-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 24px;
}

.db-header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.db-logo-dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: #4F46E5;
  box-shadow: 0 0 12px rgba(79, 70, 229, 0.5);
}

.db-title {
  font-family: "Syne", var(--shared-font-sans);
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  margin: 0;
  color: #f1f5f9;
}

.db-clock {
  font-family: var(--shared-font-mono);
  font-size: 0.8rem;
  color: #64748b;
  letter-spacing: 0.06em;
}

/* Stats */
.db-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.db-stat-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: border-color 0.3s, background 0.3s;
}

.db-stat-card:hover {
  border-color: rgba(79, 70, 229, 0.3);
  background: rgba(79, 70, 229, 0.05);
}

.db-stat-value {
  display: block;
  font-family: "Syne", var(--shared-font-sans);
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #f1f5f9;
  margin-bottom: 4px;
}

.db-stat-label {
  font-size: 0.75rem;
  color: #64748b;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

/* Grid */
.db-grid {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  gap: 16px;
  margin-bottom: 24px;
}

.db-panel {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 24px;
}

.db-panel--span2 {
  grid-column: span 2;
}

/* 当只有两列时 */
@media (max-width: 1024px) {
  .db-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 640px) {
  .db-grid {
    grid-template-columns: 1fr;
  }
  .db-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

.db-panel-title {
  font-family: "Syne", var(--shared-font-sans);
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
  margin: 0 0 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

/* 雷达图占位 */
.db-chart-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
}

.db-radar-ring {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  border: 2px dashed rgba(79, 70, 229, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.db-radar-inner {
  text-align: center;
}

.db-radar-label {
  display: block;
  font-family: var(--shared-font-mono);
  font-size: 0.75rem;
  color: #4F46E5;
  margin-bottom: 4px;
}

.db-radar-sub {
  font-size: 0.65rem;
  color: #475569;
}

/* 时间轴占位 */
.db-timeline-placeholder {
  display: flex;
  align-items: center;
  min-height: 200px;
  padding: 0 20px;
}

.db-timeline-bar {
  position: relative;
  width: 100%;
  height: 2px;
  background: rgba(255, 255, 255, 0.08);
}

.db-timeline-dot {
  position: absolute;
  top: -16px;
  font-size: 0.7rem;
  color: #94a3b8;
  white-space: nowrap;
  transform: translateX(-50%);
}

.db-timeline-dot::before {
  content: '';
  display: block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #4F46E5;
  margin: 0 auto 6px;
  box-shadow: 0 0 8px rgba(79, 70, 229, 0.4);
}

/* 技能条 */
.db-bars {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.db-bar-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.db-bar-name {
  font-size: 0.75rem;
  color: #94a3b8;
  width: 80px;
  flex-shrink: 0;
  text-align: right;
  font-family: var(--shared-font-mono);
}

.db-bar-track {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  overflow: hidden;
}

.db-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 1s cubic-bezier(0.22, 1, 0.36, 1);
}

.db-bar-val {
  font-size: 0.7rem;
  color: #64748b;
  width: 32px;
  text-align: right;
  flex-shrink: 0;
  font-family: var(--shared-font-mono);
}

/* Footer */
.db-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.7rem;
  color: #334155;
  font-family: var(--shared-font-mono);
  letter-spacing: 0.06em;
  padding: 16px 0 0;
  border-top: 1px solid rgba(255, 255, 255, 0.04);
}

.db-footer-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10B981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
}

.db-footer-sep {
  color: #1e293b;
}
</style>
