<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import * as echarts from 'echarts'

/* ========== Stats ========== */
const stats = [
  { label: '总项目数', value: '20+', sub: 'Production Ready' },
  { label: '代码行数', value: '150K+', sub: 'TypeScript 主力' },
  { label: '技术栈', value: '16', sub: '主流框架全覆盖' },
  { label: '从业年限', value: '10', sub: '高级前端工程师' },
  { label: '开源贡献', value: '8', sub: 'GitHub 100+ Stars' },
]

const time = ref('')
const date = ref('')
const chartInstances: echarts.ECharts[] = []

/* ========== Chart Refs ========== */
const radarRef = ref<HTMLElement>()
const sankeyRef = ref<HTMLElement>()
const graphRef = ref<HTMLElement>()
const lineRef = ref<HTMLElement>()
const barRef = ref<HTMLElement>()
const pieRef = ref<HTMLElement>()

/* ========== Clock ========== */
onMounted(() => {
  updateClock()
  setInterval(updateClock, 1000)
  nextTick(initCharts)
})

function updateClock() {
  const now = new Date()
  time.value = now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
  date.value = now.toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', weekday: 'short' })
}

/* ========== Resize ========== */
let resizeObserver: ResizeObserver | null = null

function initCharts() {
  if (!radarRef.value || !sankeyRef.value || !graphRef.value || !lineRef.value || !barRef.value || !pieRef.value) return

  /* ----- 1. 雷达图 — 技术栈评估 (已修复) ----- */
  const radar = echarts.init(radarRef.value)
  radar.setOption({
    backgroundColor: 'transparent',
    radar: {
      indicator: [
        { name: 'Vue.js', max: 100 },
        { name: 'TypeScript', max: 100 },
        { name: 'Node.js', max: 100 },
        { name: 'React', max: 100 },
        { name: 'Python', max: 100 },
        { name: 'Docker', max: 100 },
        { name: 'CSS/动画', max: 100 },
      ],
      shape: 'polygon',
      radius: '65%',
      axisName: {
        color: '#94a3b8',
        fontSize: 10,
        fontFamily: '"JetBrains Mono", monospace',
      },
      splitArea: {
        areaStyle: {
          color: ['rgba(79,70,229,0.02)', 'rgba(79,70,229,0.05)'],
        },
      },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    },
    series: [{
      type: 'radar',
      data: [
        {
          value: [95, 90, 85, 75, 70, 75, 88],
          name: '当前水平',
          areaStyle: { color: 'rgba(79,70,229,0.25)' },
          lineStyle: { color: '#4F46E5', width: 2 },
          itemStyle: { color: '#818CF8' },
        },
      ],
    }],
  })
  chartInstances.push(radar)

  /* ----- 2. 桑基图 — 技能流向 ----- */
  const sankey = echarts.init(sankeyRef.value)
  sankey.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', triggerOn: 'mousemove' },
    series: [{
      type: 'sankey',
      layout: 'none',
      emphasis: { focus: 'adjacency' },
      nodeAlign: 'left',
      lineStyle: { color: 'gradient', curveness: 0.5 },
      data: [
        { name: '前端', itemStyle: { color: '#4F46E5' } },
        { name: '后端', itemStyle: { color: '#059669' } },
        { name: '运维', itemStyle: { color: '#D97706' } },
        { name: 'Vue 3', itemStyle: { color: '#4ADE80' } },
        { name: 'React', itemStyle: { color: '#60A5FA' } },
        { name: 'TypeScript', itemStyle: { color: '#3178C6' } },
        { name: 'Node.js', itemStyle: { color: '#84CC16' } },
        { name: 'NestJS', itemStyle: { color: '#E0234E' } },
        { name: 'Three.js', itemStyle: { color: '#F59E0B' } },
        { name: 'PostgreSQL', itemStyle: { color: '#4169E1' } },
        { name: 'Docker', itemStyle: { color: '#2496ED' } },
        { name: 'CI/CD', itemStyle: { color: '#F472B6' } },
      ],
      links: [
        { source: '前端', target: 'Vue 3', value: 10 },
        { source: '前端', target: 'React', value: 6 },
        { source: '前端', target: 'TypeScript', value: 9 },
        { source: '前端', target: 'Three.js', value: 5 },
        { source: '后端', target: 'Node.js', value: 8 },
        { source: '后端', target: 'NestJS', value: 7 },
        { source: '后端', target: 'TypeScript', value: 4 },
        { source: '后端', target: 'PostgreSQL', value: 5 },
        { source: '运维', target: 'Docker', value: 7 },
        { source: '运维', target: 'CI/CD', value: 5 },
        { source: 'Node.js', target: 'NestJS', value: 4 },
        { source: 'TypeScript', target: 'Vue 3', value: 3 },
        { source: 'TypeScript', target: 'NestJS', value: 3 },
      ],
      label: { color: '#94a3b8', fontSize: 10, fontFamily: '"JetBrains Mono", monospace' },
      nodeWidth: 14,
      nodeGap: 10,
    }],
  })
  chartInstances.push(sankey)

  /* ----- 3. 拓补图 — 项目依赖拓扑 ----- */
  const graph = echarts.init(graphRef.value)
  graph.setOption({
    backgroundColor: 'transparent',
    tooltip: {},
    series: [{
      type: 'graph',
      layout: 'force',
      force: { repulsion: 350, edgeLength: 100, layoutAnimation: true },
      roam: true,
      draggable: true,
      data: [
        { name: 'ERP 2.0', symbolSize: 50, itemStyle: { color: '#4F46E5' }, category: 0 },
        { name: '仓储 BFF', symbolSize: 40, itemStyle: { color: '#818CF8' }, category: 1 },
        { name: 'B2B 电商', symbolSize: 44, itemStyle: { color: '#A78BFA' }, category: 2 },
        { name: '报名小程序', symbolSize: 36, itemStyle: { color: '#F59E0B' }, category: 3 },
        { name: '数据大屏', symbolSize: 32, itemStyle: { color: '#10B981' }, category: 4 },
        { name: 'Vue 3', symbolSize: 24, itemStyle: { color: '#4ADE80' }, category: 5 },
        { name: 'React', symbolSize: 24, itemStyle: { color: '#60A5FA' }, category: 5 },
        { name: 'NestJS', symbolSize: 24, itemStyle: { color: '#E0234E' }, category: 5 },
        { name: 'MySQL', symbolSize: 20, itemStyle: { color: '#00758F' }, category: 6 },
        { name: 'Redis', symbolSize: 20, itemStyle: { color: '#DC382D' }, category: 6 },
        { name: 'Docker', symbolSize: 22, itemStyle: { color: '#2496ED' }, category: 6 },
        { name: 'GitHub CI', symbolSize: 18, itemStyle: { color: '#F472B6' }, category: 6 },
      ],
      categories: [
        { name: '核心项目', itemStyle: { color: '#4F46E5' } },
        { name: 'BFF 层', itemStyle: { color: '#818CF8' } },
        { name: '电商平台', itemStyle: { color: '#A78BFA' } },
        { name: '小程序', itemStyle: { color: '#F59E0B' } },
        { name: '可视化', itemStyle: { color: '#10B981' } },
        { name: '框架', itemStyle: { color: '#CBD5E1' } },
        { name: '基础设施', itemStyle: { color: '#64748B' } },
      ],
      links: [
        { source: 'ERP 2.0', target: 'Vue 3' },
        { source: 'ERP 2.0', target: 'NestJS' },
        { source: 'ERP 2.0', target: 'MySQL' },
        { source: 'ERP 2.0', target: 'Redis' },
        { source: '仓储 BFF', target: 'NestJS' },
        { source: '仓储 BFF', target: 'Docker' },
        { source: 'B2B 电商', target: 'React' },
        { source: 'B2B 电商', target: 'NestJS' },
        { source: 'B2B 电商', target: 'Redis' },
        { source: '报名小程序', target: 'Vue 3' },
        { source: '报名小程序', target: 'Docker' },
        { source: '数据大屏', target: 'Vue 3' },
        { source: '数据大屏', target: 'Docker' },
        { source: 'MySQL', target: 'ERP 2.0' },
        { source: 'Docker', target: 'GitHub CI' },
      ],
      lineStyle: { color: 'source', curveness: 0.2, opacity: 0.4, width: 1.5 },
      label: { show: true, position: 'bottom', color: '#94a3b8', fontSize: 9, fontFamily: '"JetBrains Mono", monospace' },
      edgeSymbol: ['none', 'arrow'],
      edgeSymbolSize: [0, 6],
    }],
  })
  chartInstances.push(graph)

  /* ----- 4. 折线图 — 代码提交活跃度 ----- */
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
  const line = echarts.init(lineRef.value)
  line.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    legend: { data: ['提交次数', '代码行数(K)'], textStyle: { color: '#94a3b8', fontSize: 10 }, top: 0, right: 0 },
    grid: { left: 40, right: 16, top: 28, bottom: 20 },
    xAxis: {
      type: 'category',
      data: months,
      axisLabel: { color: '#64748b', fontSize: 9, fontFamily: '"JetBrains Mono", monospace' },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisTick: { show: false },
    },
    yAxis: [
      { type: 'value', splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } }, axisLabel: { color: '#64748b', fontSize: 9 } },
      { type: 'value', splitLine: { show: false }, axisLabel: { color: '#64748b', fontSize: 9 } },
    ],
    series: [
      {
        name: '提交次数',
        type: 'line',
        smooth: true,
        data: [28, 35, 42, 38, 45, 52, 48, 58, 62, 55, 50, 66],
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: { color: '#4F46E5', width: 2 },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(79,70,229,0.3)' }, { offset: 1, color: 'rgba(79,70,229,0.02)' }]) },
        itemStyle: { color: '#818CF8' },
      },
      {
        name: '代码行数(K)',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: [3.2, 4.8, 6.5, 5.2, 7.8, 9.2, 8.0, 10.5, 12.0, 9.8, 7.5, 14.2],
        symbol: 'diamond',
        symbolSize: 4,
        lineStyle: { color: '#10B981', width: 2 },
        areaStyle: { color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{ offset: 0, color: 'rgba(16,185,129,0.25)' }, { offset: 1, color: 'rgba(16,185,129,0.02)' }]) },
        itemStyle: { color: '#34D399' },
      },
    ],
  })
  chartInstances.push(line)

  /* ----- 5. 柱状图 — 项目成就对比 ----- */
  const bar = echarts.init(barRef.value)
  bar.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    legend: { data: ['代码行数(K)', '模块数', '性能提升(%)'], textStyle: { color: '#94a3b8', fontSize: 10 }, top: 0, right: 0 },
    grid: { left: 40, right: 16, top: 28, bottom: 28 },
    xAxis: {
      type: 'category',
      data: ['ERP 2.0', '仓储BFF', 'B2B电商', '报名小程序', '数据大屏'],
      axisLabel: { color: '#94a3b8', fontSize: 9, fontFamily: '"JetBrains Mono", monospace', rotate: 20 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.04)' } },
      axisLabel: { color: '#64748b', fontSize: 9 },
    },
    series: [
      {
        name: '代码行数(K)',
        type: 'bar',
        stack: 'total',
        barWidth: '40%',
        data: [42, 18, 35, 12, 8],
        itemStyle: { color: '#4F46E5' },
      },
      {
        name: '模块数',
        type: 'bar',
        stack: 'total',
        barWidth: '40%',
        data: [24, 12, 18, 8, 6],
        itemStyle: { color: '#818CF8' },
      },
      {
        name: '性能提升(%)',
        type: 'bar',
        stack: 'total',
        barWidth: '40%',
        data: [30, 22, 25, 15, 18],
        itemStyle: { color: '#A78BFA', borderRadius: [2, 2, 0, 0] },
      },
    ],
  })
  chartInstances.push(bar)

  /* ----- 6. 饼图 — 技术分布 ----- */
  const pie = echarts.init(pieRef.value)
  pie.setOption({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'item', formatter: '{b}: {c}% ({d}%)' },
    legend: {
      orient: 'vertical',
      right: 0,
      top: 'center',
      textStyle: { color: '#94a3b8', fontSize: 10 },
      itemGap: 8,
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '65%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: true,
        padAngle: 2,
        itemStyle: { borderRadius: 4 },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 12, fontWeight: 'bold', color: '#f1f5f9' },
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.5)' },
        },
        data: [
          { value: 30, name: 'Vue.js', itemStyle: { color: '#4ADE80' } },
          { value: 20, name: 'TypeScript', itemStyle: { color: '#3178C6' } },
          { value: 18, name: 'Node.js', itemStyle: { color: '#84CC16' } },
          { value: 14, name: 'React', itemStyle: { color: '#60A5FA' } },
          { value: 10, name: 'Python', itemStyle: { color: '#3776AB' } },
          { value: 8, name: 'Docker', itemStyle: { color: '#2496ED' } },
        ],
      },
    ],
  })
  chartInstances.push(pie)

  /* ----- Resize Observer ----- */
  const container = document.querySelector('.db-root')
  if (container) {
    resizeObserver = new ResizeObserver(() => {
      chartInstances.forEach(chart => chart.resize())
    })
    resizeObserver.observe(container)
  }
}

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  chartInstances.forEach(chart => chart.dispose())
})
</script>

<template>
  <div class="db-root">
    <!-- ============ Header ============ -->
    <header class="db-header">
      <div class="db-header-left">
        <span class="db-logo-pulse" />
        <div class="db-header-brand">
          <h1 class="db-title">毛际可 · 技术能力看板</h1>
          <span class="db-subtitle">TECH CAPABILITY DASHBOARD</span>
        </div>
      </div>
      <div class="db-header-right">
        <div class="db-status-badge">
          <span class="db-status-dot" />
          <span>SYSTEM ONLINE</span>
        </div>
        <span class="db-clock">{{ date }} {{ time }}</span>
      </div>
    </header>

    <!-- ============ Stats Row ============ -->
    <section class="db-stats">
      <div v-for="s in stats" :key="s.label" class="db-stat-card">
        <div class="db-stat-inner">
          <span class="db-stat-value">{{ s.value }}</span>
          <span class="db-stat-label">{{ s.label }}</span>
        </div>
        <span class="db-stat-sub">{{ s.sub }}</span>
      </div>
    </section>

    <!-- ============ Charts Grid ============ -->
    <div class="db-charts">
      <!-- Row 1 -->
      <div class="db-panel">
        <h2 class="db-panel-title">
          <span class="db-panel-icon" style="background:#4F46E5" />
          技术栈雷达
        </h2>
        <div ref="radarRef" class="db-chart-box" />
      </div>
      <div class="db-panel">
        <h2 class="db-panel-title">
          <span class="db-panel-icon" style="background:#059669" />
          技能流向 · 桑基图
        </h2>
        <div ref="sankeyRef" class="db-chart-box" />
      </div>
      <div class="db-panel">
        <h2 class="db-panel-title">
          <span class="db-panel-icon" style="background:#D97706" />
          项目依赖 · 拓补图
        </h2>
        <div ref="graphRef" class="db-chart-box" />
      </div>

      <!-- Row 2 -->
      <div class="db-panel">
        <h2 class="db-panel-title">
          <span class="db-panel-icon" style="background:#818CF8" />
          代码活跃度
        </h2>
        <div ref="lineRef" class="db-chart-box" />
      </div>
      <div class="db-panel">
        <h2 class="db-panel-title">
          <span class="db-panel-icon" style="background:#A78BFA" />
          项目成就 · 柱状图
        </h2>
        <div ref="barRef" class="db-chart-box" />
      </div>
      <div class="db-panel">
        <h2 class="db-panel-title">
          <span class="db-panel-icon" style="background:#F59E0B" />
          技术分布 · 饼图
        </h2>
        <div ref="pieRef" class="db-chart-box" />
      </div>
    </div>

    <!-- ============ Footer ============ -->
    <footer class="db-footer">
      <div class="db-footer-left">
        <span class="db-footer-dot" />
        <span>SYSTEM NORMAL</span>
        <span class="db-footer-sep">|</span>
        <span>ECharts 5 · 全屏适配</span>
      </div>
      <div class="db-footer-right">
        <span>v2.0 · 指挥中心模式</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* =============================================
   数据大屏 — 指挥中心风格
   Full-width horizontal layout · 无最大宽度限制
   ============================================= */

:global(*), :global(*::before), :global(*::after) {
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
  overflow-x: hidden;
}

.db-root {
  width: 100%;
  min-height: 100vh;
  background: #080c18;
  color: #e2e8f0;
  font-family: "Inter", "PingFang SC", "Microsoft YaHei", system-ui, -apple-system, sans-serif;
  padding: 20px 24px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ============ Header ============ */
.db-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.db-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.db-logo-pulse {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background: #4F46E5;
  animation: dbPulse 2s ease-in-out infinite;
}

@keyframes dbPulse {
  0%, 100% { box-shadow: 0 0 8px rgba(79, 70, 229, 0.4); }
  50% { box-shadow: 0 0 20px rgba(79, 70, 229, 0.8), 0 0 40px rgba(79, 70, 229, 0.2); }
}

.db-header-brand {
  display: flex;
  flex-direction: column;
}

.db-title {
  font-family: "Syne", "Inter", system-ui, sans-serif;
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  margin: 0;
  color: #f1f5f9;
  line-height: 1.3;
}

.db-subtitle {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.6rem;
  color: #475569;
  letter-spacing: 0.12em;
}

.db-header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.db-status-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: "JetBrains Mono", monospace;
  font-size: 0.65rem;
  color: #10B981;
  letter-spacing: 0.06em;
}

.db-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10B981;
  animation: dbPulse 2s ease-in-out infinite;
}

.db-clock {
  font-family: "JetBrains Mono", monospace;
  font-size: 0.8rem;
  color: #64748b;
  letter-spacing: 0.06em;
}

/* ============ Stats Row ============ */
.db-stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.db-stat-card {
  background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: border-color 0.3s, transform 0.2s;
}

.db-stat-card:hover {
  border-color: rgba(79, 70, 229, 0.3);
  transform: translateY(-1px);
}

.db-stat-inner {
  display: flex;
  flex-direction: column;
}

.db-stat-value {
  font-family: "Syne", "Inter", system-ui, sans-serif;
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #f1f5f9;
  line-height: 1.2;
}

.db-stat-label {
  font-size: 0.7rem;
  color: #64748b;
  letter-spacing: 0.06em;
}

.db-stat-sub {
  font-size: 0.6rem;
  color: #334155;
  font-family: "JetBrains Mono", monospace;
  white-space: nowrap;
}

/* ============ Charts Grid ============ */
.db-charts {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  flex: 1;
}

.db-panel {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
}

.db-panel-title {
  font-family: "Syne", "Inter", system-ui, sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #94a3b8;
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.db-panel-icon {
  width: 8px;
  height: 8px;
  border-radius: 2px;
  display: inline-block;
}

.db-chart-box {
  flex: 1;
  min-height: 240px;
  width: 100%;
}

/* ============ Footer ============ */
.db-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.65rem;
  color: #1e293b;
  font-family: "JetBrains Mono", monospace;
  letter-spacing: 0.06em;
  padding: 8px 4px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
}

.db-footer-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.db-footer-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #10B981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
}

.db-footer-sep {
  color: #1e293b;
}

.db-footer-right {
  color: #1e293b;
}

/* ============ Responsive ============ */
@media (max-width: 1280px) {
  .db-charts {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .db-root {
    padding: 12px;
  }
  .db-stats {
    grid-template-columns: repeat(3, 1fr);
  }
  .db-charts {
    grid-template-columns: 1fr;
  }
  .db-header-right {
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }
  .db-status-badge {
    display: none;
  }
}

@media (max-width: 480px) {
  .db-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
