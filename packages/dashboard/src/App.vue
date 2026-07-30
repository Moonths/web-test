<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'

const kpis = ref([
  { label: '项目数', raw: 20, suffix: '+', display: '0' },
  { label: '代码行数', raw: 150, suffix: 'K+', display: '0' },
  { label: '技术栈', raw: 16, suffix: '', display: '0' },
  { label: '从业年限', raw: 10, suffix: '', display: '0' },
  { label: '贡献仓库', raw: 58, suffix: '', display: '0' },
  { label: 'NPM 下载', raw: 126, suffix: 'K', display: '0' },
])

function animateKpis() {
  const duration = 1500
  const start = performance.now()
  function step(now: number) {
    const p = Math.min((now - start) / duration, 1)
    const t = 1 - Math.pow(1 - p, 3)
    for (const k of kpis.value) {
      k.display = Math.round(t * k.raw).toLocaleString()
    }
    if (p < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

const timeStr = ref('')
const dateStr = ref('')

function updateClock() {
  const now = new Date()
  timeStr.value = now.toLocaleTimeString('zh-CN', { hour12: false })
  dateStr.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    weekday: 'short',
  })
}

const months = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']

function randomData(base: number, variance: number, len: number): number[] {
  return Array.from({ length: len }, () => base + Math.round((Math.random() - 0.5) * variance))
}

const lineData = ref(randomData(75, 40, 12))

const pieData = ref([
  { name: 'Vue 生态', value: 35 },
  { name: 'Node.js', value: 25 },
  { name: 'Python', value: 15 },
  { name: 'DevOps', value: 12 },
  { name: '其他', value: 13 },
])

const barData = ref([
  { name: 'Vue 3', value: 95 },
  { name: 'TS', value: 90 },
  { name: 'NestJS', value: 85 },
  { name: 'React', value: 72 },
  { name: 'Python', value: 70 },
  { name: 'Docker', value: 75 },
  { name: 'ECharts', value: 82 },
])

// === 桑基图 — 技能流向数据 ===
const sankeyNodes = [
  // 领域层
  { name: '前端工程', itemStyle: { color: '#4F46E5' } },
  { name: '后端开发', itemStyle: { color: '#14B8A6' } },
  { name: 'DevOps',   itemStyle: { color: '#F59E0B' } },
  { name: '数据工程', itemStyle: { color: '#06B6D4' } },
  { name: '架构设计', itemStyle: { color: '#F43F5E' } },
  // 项目层
  { name: '企业级应用' },
  { name: '组件/工具库' },
  { name: '数据平台' },
  { name: '基础运维' },
  { name: '开源贡献' },
  // 技术栈层
  { name: 'Vue3',      itemStyle: { color: '#4F46E5' } },
  { name: 'TypeScript', itemStyle: { color: '#3178C6' } },
  { name: 'NestJS',    itemStyle: { color: '#E0234E' } },
  { name: 'Python',    itemStyle: { color: '#F59E0B' } },
  { name: 'Docker',    itemStyle: { color: '#2496ED' } },
  { name: 'ECharts',   itemStyle: { color: '#AA344D' } },
  { name: 'Three.js',  itemStyle: { color: '#049EF4' } },
]

const sankeyLinks = [
  // 领域 → 项目
  { source: '前端工程', target: '企业级应用', value: 12 },
  { source: '前端工程', target: '组件/工具库', value: 10 },
  { source: '前端工程', target: '开源贡献', value: 5 },
  { source: '后端开发', target: '企业级应用', value: 8 },
  { source: '后端开发', target: '数据平台', value: 6 },
  { source: '后端开发', target: '基础运维', value: 3 },
  { source: 'DevOps',   target: '基础运维', value: 8 },
  { source: 'DevOps',   target: '企业级应用', value: 4 },
  { source: 'DevOps',   target: '开源贡献', value: 3 },
  { source: '数据工程', target: '数据平台', value: 7 },
  { source: '数据工程', target: '企业级应用', value: 3 },
  { source: '架构设计', target: '企业级应用', value: 6 },
  { source: '架构设计', target: '数据平台', value: 4 },
  { source: '架构设计', target: '基础运维', value: 2 },
  // 项目 → 技术栈
  { source: '企业级应用', target: 'Vue3', value: 10 },
  { source: '企业级应用', target: 'TypeScript', value: 8 },
  { source: '企业级应用', target: 'NestJS', value: 7 },
  { source: '企业级应用', target: 'Docker', value: 5 },
  { source: '组件/工具库', target: 'Vue3', value: 8 },
  { source: '组件/工具库', target: 'TypeScript', value: 6 },
  { source: '组件/工具库', target: 'ECharts', value: 4 },
  { source: '数据平台', target: 'Python', value: 6 },
  { source: '数据平台', target: 'TypeScript', value: 4 },
  { source: '数据平台', target: 'ECharts', value: 5 },
  { source: '基础运维', target: 'Docker', value: 6 },
  { source: '基础运维', target: 'Python', value: 3 },
  { source: '开源贡献', target: 'Vue3', value: 4 },
  { source: '开源贡献', target: 'TypeScript', value: 3 },
  { source: '开源贡献', target: 'Three.js', value: 3 },
]

// === 拓补图 — 技术关联网络 ===
const graphCategories = [
  { name: '核心',  itemStyle: { color: '#F43F5E' } },
  { name: '技术栈', itemStyle: { color: '#4F46E5' } },
  { name: '工具链', itemStyle: { color: '#14B8A6' } },
  { name: '基础设施', itemStyle: { color: '#F59E0B' } },
  { name: '项目成果', itemStyle: { color: '#06B6D4' } },
]

const graphNodes = [
  { name: '毛际可',   category: 0, symbolSize: 64 },
  { name: 'Vue 3',     category: 1, symbolSize: 42 },
  { name: 'TypeScript', category: 1, symbolSize: 40 },
  { name: 'Node.js',   category: 1, symbolSize: 36 },
  { name: 'Python',    category: 1, symbolSize: 30 },
  { name: 'Three.js',  category: 2, symbolSize: 30 },
  { name: 'ECharts',   category: 2, symbolSize: 32 },
  { name: 'NestJS',    category: 2, symbolSize: 30 },
  { name: 'React',     category: 2, symbolSize: 26 },
  { name: 'Docker',    category: 3, symbolSize: 28 },
  { name: 'PostgreSQL', category: 3, symbolSize: 22 },
  { name: 'Redis',     category: 3, symbolSize: 20 },
  { name: 'Nginx',     category: 3, symbolSize: 18 },
  { name: '数字展馆',   category: 4, symbolSize: 34 },
  { name: '数据大屏',   category: 4, symbolSize: 30 },
  { name: '管理后台',   category: 4, symbolSize: 26 },
]

const graphLinks = [
  // 核心 → 技能
  { source: '毛际可', target: 'Vue 3' },
  { source: '毛际可', target: 'TypeScript' },
  { source: '毛际可', target: 'Node.js' },
  { source: '毛际可', target: 'Python' },
  // 技能间关联
  { source: 'Vue 3',     target: 'TypeScript' },
  { source: 'Vue 3',     target: 'ECharts' },
  { source: 'Vue 3',     target: 'Three.js' },
  { source: 'Node.js',   target: 'NestJS' },
  { source: 'Node.js',   target: 'TypeScript' },
  { source: 'Python',    target: 'Docker' },
  { source: 'Docker',    target: 'Nginx' },
  { source: 'PostgreSQL', target: 'Redis' },
  { source: 'TypeScript', target: 'NestJS' },
  { source: 'TypeScript', target: 'React' },
  // 技能 → 项目
  { source: '毛际可',     target: '数字展馆' },
  { source: '毛际可',     target: '数据大屏' },
  { source: '毛际可',     target: '管理后台' },
  { source: 'Vue 3',      target: '数字展馆' },
  { source: 'Vue 3',      target: '数据大屏' },
  { source: 'Vue 3',      target: '管理后台' },
  { source: 'Three.js',   target: '数字展馆' },
  { source: 'ECharts',    target: '数据大屏' },
  { source: 'NestJS',     target: '管理后台' },
]

let radarChart: echarts.ECharts | null = null
let lineChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null
let sankeyChart: echarts.ECharts | null = null
let graphChart: echarts.ECharts | null = null
let resizeObserver: ResizeObserver | null = null
let dataTimer: ReturnType<typeof setInterval> | null = null

const INDIGO = '#4F46E5'
const TEAL = '#14B8A6'
const AMBER = '#F59E0B'
const ROSE = '#F43F5E'
const CYAN = '#06B6D4'

function initRadar(el: HTMLElement) {
  const c = echarts.init(el)
  c.setOption({
    radar: {
      indicator: [
        { name: '前端', max: 100 },
        { name: '后端', max: 100 },
        { name: 'DevOps', max: 100 },
        { name: '数据库', max: 100 },
        { name: '架构', max: 100 },
        { name: '产品', max: 100 },
      ],
      center: ['50%', '50%'], radius: '65%', splitNumber: 3,
      axisName: { color: '#94a3b8', fontSize: 10 },
      splitArea: { areaStyle: { color: ['rgba(79,70,229,0.02)', 'rgba(79,70,229,0.04)'] } },
      axisLine: { lineStyle: { color: 'rgba(148,163,184,0.12)' } },
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.1)' } },
    },
    series: [{
      type: 'radar',
      data: [{ value: [95, 82, 75, 70, 80, 65] }],
      symbol: 'circle', symbolSize: 5,
      itemStyle: { color: INDIGO },
      lineStyle: { color: INDIGO, width: 2 },
      areaStyle: { color: 'rgba(79,70,229,0.15)' },
      animationDuration: 1200,
    }],
  })
  return c
}

function initLine(el: HTMLElement) {
  const c = echarts.init(el)
  c.setOption({
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'rgba(79,70,229,0.3)' },
    grid: { left: 36, right: 16, top: 16, bottom: 20 },
    xAxis: {
      type: 'category', data: months,
      axisLine: { lineStyle: { color: 'rgba(148,163,184,0.1)' } },
      axisLabel: { color: '#64748b', fontSize: 10 }, axisTick: { show: false },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.06)', type: 'dashed' } },
      axisLabel: { color: '#64748b', fontSize: 10 },
      axisLine: { show: false }, axisTick: { show: false },
    },
    series: [{
      name: 'Commits', type: 'line', data: lineData.value,
      smooth: true, symbol: 'circle', symbolSize: 4,
      lineStyle: { color: INDIGO, width: 2 },
      itemStyle: { color: INDIGO },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: 'rgba(79,70,229,0.3)' },
          { offset: 1, color: 'rgba(79,70,229,0.02)' },
        ]),
      },
      animationDuration: 1500,
    }],
  })
  return c
}

function initPie(el: HTMLElement) {
  const c = echarts.init(el)
  c.setOption({
    tooltip: { trigger: 'item', backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'rgba(79,70,229,0.3)' },
    series: [{
      type: 'pie', radius: ['38%', '68%'], center: ['50%', '50%'],
      avoidLabelOverlap: true,
      itemStyle: { borderRadius: 3, borderColor: '#0a0e17', borderWidth: 2 },
      label: {
        color: '#94a3b8', fontSize: 10,
        formatter: '{b}\n{d}%', lineHeight: 14,
      },
      labelLine: { lineStyle: { color: 'rgba(148,163,184,0.15)' } },
      data: pieData.value.map((d, i) => ({
        ...d, itemStyle: { color: [INDIGO, TEAL, AMBER, ROSE, CYAN][i] },
      })),
      animationDuration: 1200,
    }],
  })
  return c
}

function initBar(el: HTMLElement) {
  const c = echarts.init(el)
  c.setOption({
    tooltip: { trigger: 'axis', backgroundColor: 'rgba(15,23,42,0.9)', borderColor: 'rgba(79,70,229,0.3)' },
    grid: { left: 44, right: 16, top: 12, bottom: 20 },
    xAxis: {
      type: 'category', data: barData.value.map(d => d.name),
      axisLine: { lineStyle: { color: 'rgba(148,163,184,0.1)' } },
      axisLabel: { color: '#64748b', fontSize: 9 }, axisTick: { show: false },
    },
    yAxis: {
      type: 'value', max: 100,
      splitLine: { lineStyle: { color: 'rgba(148,163,184,0.06)', type: 'dashed' } },
      axisLabel: { color: '#64748b', fontSize: 10 },
      axisLine: { show: false }, axisTick: { show: false },
    },
    series: [{
      type: 'bar', barWidth: '55%',
      data: barData.value.map(() => ({
        value: 0,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: INDIGO }, { offset: 1, color: 'rgba(79,70,229,0.2)' },
          ]),
          borderRadius: [2, 2, 0, 0],
        },
      })),
      animationDuration: 1200,
    }],
  })
  setTimeout(() => {
    c.setOption({
      series: [{
        data: barData.value.map(d => ({
          value: d.value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: INDIGO }, { offset: 1, color: 'rgba(79,70,229,0.2)' },
            ]),
            borderRadius: [2, 2, 0, 0],
          },
        })),
      }],
    })
  }, 300)
  return c
}

// === 桑基图初始化 ===
function initSankey(el: HTMLElement) {
  const c = echarts.init(el)
  c.setOption({
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      backgroundColor: 'rgba(15,23,42,0.9)',
      borderColor: 'rgba(79,70,229,0.3)',
    },
    series: [{
      type: 'sankey',
      layout: 'none',
      layoutIterations: 32,
      emphasis: { focus: 'adjacency' },
      nodeAlign: 'justify',
      nodeGap: 12,
      nodeWidth: 10,
      lineStyle: {
        color: 'gradient',
        curveness: 0.5,
        opacity: 0.35,
      },
      label: {
        color: '#94a3b8',
        fontSize: 9,
        fontFamily: '"Inter","PingFang SC",sans-serif',
      },
      data: sankeyNodes,
      links: sankeyLinks,
      animationDuration: 1200,
    }],
  })
  return c
}

// === 拓补图初始化 ===
function initGraph(el: HTMLElement) {
  const c = echarts.init(el)
  c.setOption({
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15,23,42,0.9)',
      borderColor: 'rgba(79,70,229,0.3)',
    },
    series: [{
      type: 'graph',
      layout: 'force',
      force: {
        repulsion: 400,
        edgeLength: [80, 160],
        layoutAnimation: true,
        friction: 0.1,
      },
      roam: 'scale',
      draggable: true,
      edgeSymbol: ['none', 'none'],
      edgeLabel: { show: false },
      lineStyle: {
        color: 'source',
        curveness: 0.2,
        opacity: 0.25,
        width: 1.5,
      },
      label: {
        show: true,
        position: 'bottom',
        color: '#cbd5e1',
        fontSize: 8,
        fontFamily: '"Inter","PingFang SC",sans-serif',
        offset: [0, 4],
      },
      emphasis: {
        focus: 'adjacency',
        lineStyle: { width: 3, opacity: 0.6 },
      },
      categories: graphCategories,
      data: graphNodes,
      links: graphLinks,
      itemStyle: {
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
      },
      animationDuration: 1000,
      animationEasing: 'elasticOut',
    }],
  })
  return c
}

function updateCharts() {
  lineData.value = randomData(75, 40, 12)
  lineChart?.setOption({ series: [{ data: lineData.value }] })

  const shift = Math.round((Math.random() - 0.5) * 8)
  pieData.value = pieData.value.map((d, i) => ({
    ...d,
    value: Math.max(5, d.value + (i === 0 ? shift : i === 1 ? -shift : Math.round((Math.random() - 0.5) * 4))),
  }))
  pieChart?.setOption({
    series: [{
      data: pieData.value.map((d, i) => ({
        ...d, itemStyle: { color: [INDIGO, TEAL, AMBER, ROSE, CYAN][i] },
      })),
    }],
  })

  barData.value = barData.value.map(d => ({
    ...d,
    value: Math.min(100, Math.max(50, d.value + Math.round((Math.random() - 0.5) * 6))),
  }))
  barChart?.setOption({
    series: [{
      data: barData.value.map(d => ({
        value: d.value,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: INDIGO }, { offset: 1, color: 'rgba(79,70,229,0.2)' },
          ]),
          borderRadius: [2, 2, 0, 0],
        },
      })),
    }],
  })
}

const radarRef = ref<HTMLElement | null>(null)
const lineRef = ref<HTMLElement | null>(null)
const pieRef = ref<HTMLElement | null>(null)
const barRef = ref<HTMLElement | null>(null)
const sankeyRef = ref<HTMLElement | null>(null)
const graphRef = ref<HTMLElement | null>(null)
const rootRef = ref<HTMLElement | null>(null)

onMounted(() => {
  updateClock()
  const clockTimer = setInterval(updateClock, 1000)
  animateKpis()

  nextTick(() => {
    if (radarRef.value) radarChart = initRadar(radarRef.value)
    if (lineRef.value) lineChart = initLine(lineRef.value)
    if (pieRef.value) pieChart = initPie(pieRef.value)
    if (barRef.value) barChart = initBar(barRef.value)
    if (sankeyRef.value) sankeyChart = initSankey(sankeyRef.value)
    if (graphRef.value) graphChart = initGraph(graphRef.value)

    dataTimer = setInterval(updateCharts, 4000)

    const charts = [radarChart, lineChart, pieChart, barChart, sankeyChart, graphChart].filter(Boolean) as echarts.ECharts[]
    resizeObserver = new ResizeObserver(() => charts.forEach(c => c.resize()))
    if (rootRef.value) resizeObserver.observe(rootRef.value)
  })

  onUnmounted(() => {
    clearInterval(clockTimer)
    if (dataTimer) clearInterval(dataTimer)
    resizeObserver?.disconnect()
    ;[radarChart, lineChart, pieChart, barChart, sankeyChart, graphChart].forEach(c => c?.dispose())
  })
})
</script>

<template>
  <div ref="rootRef" class="db-root">
    <div class="db-scanline" />
    <div class="db-corners" />

    <header class="db-header">
      <div class="db-h-left">
        <span class="db-dot" /><span class="db-pulse" />
        <h1 class="db-title">毛际可 · 技术能力看板</h1>
        <span class="db-h-subtitle">/ 全栈工程师 · 实时数据监控</span>
      </div>
      <div class="db-h-right">
        <span class="db-clock">{{ dateStr }} {{ timeStr }}</span>
      </div>
    </header>

    <main class="db-main">
      <!-- ─── 左栏 ─── -->
      <div class="db-lcol">
        <div class="db-kpis">
          <div v-for="k in kpis" :key="k.label" class="db-kpi">
            <span class="db-kpi-val">{{ k.display }}<span class="db-kpi-sfx">{{ k.suffix }}</span></span>
            <span class="db-kpi-lbl">{{ k.label }}</span>
          </div>
        </div>
        <div class="db-card">
          <div class="db-card-hd"><span class="db-hl" />能力雷达</div>
          <div ref="radarRef" class="db-c" />
        </div>
      </div>

      <!-- ─── 中栏 ─── -->
      <div class="db-mcol">
        <div class="db-card">
          <div class="db-card-hd"><span class="db-hl" />项目活跃度趋势 <span class="db-tag">月均 75+ commits</span></div>
          <div ref="lineRef" class="db-c" />
        </div>
      </div>

      <!-- ─── 右栏 ─── -->
      <div class="db-rcol">
        <div class="db-card db-card-pie">
          <div class="db-card-hd"><span class="db-hl" />技术领域分布</div>
          <div ref="pieRef" class="db-c" />
        </div>
        <div class="db-card">
          <div class="db-card-hd"><span class="db-hl" />核心技术栈深度 <span class="db-tag">0-100</span></div>
          <div ref="barRef" class="db-c" />
        </div>
      </div>

      <!-- ─── 底栏：桑基图 + 拓补图 ─── -->
      <div class="db-bottom">
        <div class="db-card">
          <div class="db-card-hd">
            <span class="db-hl" />技能流向 <span class="db-tag">领域→项目→技术栈</span>
          </div>
          <div ref="sankeyRef" class="db-c" />
        </div>
        <div class="db-card">
          <div class="db-card-hd">
            <span class="db-hl" />技术拓扑 <span class="db-tag">能力关联网络</span>
          </div>
          <div ref="graphRef" class="db-c" />
        </div>
      </div>
    </main>

    <footer class="db-footer">
      <div class="db-ticker-wrap">
        <div class="db-ticker">
          <span>系统运行正常</span><span class="db-ts" />
          <span>数据更新: {{ timeStr }}</span><span class="db-ts" />
          <span>实时推送已连接</span><span class="db-ts" />
          <span>ECharts {{ echarts.version }}</span><span class="db-ts" />
          <span>全屏 3840×2160</span><span class="db-ts" />
          <span>延迟 12ms</span><span class="db-ts" />
          <span>帧率 60fps</span>
        </div>
      </div>
      <div class="db-status">
        <span class="db-st-dot" /> SYSTEM NORMAL
      </div>
    </footer>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&display=swap');

.db-root {
  position: relative;
  width: 100%; height: 100vh;
  background: radial-gradient(ellipse at 50% 0%, #0f172a 0%, #070b16 80%);
  color: #e2e8f0;
  font-family: "Inter","PingFang SC","Microsoft YaHei",system-ui,sans-serif;
  display: flex; flex-direction: column;
  overflow: hidden;
}

/* ── 扫描线 ── */
.db-scanline {
  position: absolute; inset: 0;
  background: repeating-linear-gradient(
    0deg, transparent, transparent 2px,
    rgba(255,255,255,0.01) 2px, rgba(255,255,255,0.01) 4px
  );
  pointer-events: none; z-index: 1;
}

/* ── 四角装饰 ── */
.db-corners {
  position: absolute; inset: 8px;
  pointer-events: none; z-index: 1;
}
.db-corners::before, .db-corners::after {
  content: ''; position: absolute;
  width: 30px; height: 30px;
  border-color: rgba(79,70,229,0.1);
  border-style: solid; border-width: 0;
}
.db-corners::before { top: 0; left: 0; border-top-width: 1px; border-left-width: 1px; }
.db-corners::after { bottom: 0; right: 0; border-bottom-width: 1px; border-right-width: 1px; }

/* ═══ Header ═══ */
.db-header {
  display: flex; align-items: center;
  justify-content: space-between;
  height: 44px; flex-shrink: 0;
  padding: 0 24px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
  position: relative; z-index: 2;
}
.db-h-left, .db-h-right {
  display: flex; align-items: center; gap: 8px;
}
.db-h-subtitle {
  font-size: 0.65rem; color: #334155;
  font-family: "JetBrains Mono", monospace;
  letter-spacing: 0.04em;
}
.db-dot {
  width: 7px; height: 7px; border-radius: 2px;
  background: #4F46E5;
  box-shadow: 0 0 10px rgba(79,70,229,0.5);
}
.db-pulse {
  width: 7px; height: 7px; border-radius: 2px;
  background: #4F46E5;
  animation: db-pulse 2s ease-in-out infinite;
  margin-left: -3px;
}
@keyframes db-pulse {
  0%,100%{opacity:0.5;transform:scale(0.7)}50%{opacity:1;transform:scale(1.3)}
}
.db-title {
  font-family: "Syne","Inter",system-ui,sans-serif;
  font-size: 0.9rem; font-weight: 700;
  letter-spacing: 0.04em; color: #f1f5f9; margin: 0;
}
.db-clock {
  font-family: "JetBrains Mono",monospace;
  font-size: 0.7rem; color: #64748b;
  letter-spacing: 0.06em;
  background: rgba(255,255,255,0.03);
  padding: 3px 10px; border-radius: 3px;
  border: 1px solid rgba(255,255,255,0.04);
}

/* ═══ 主体：Grid 两行三栏 ═══ */
.db-main {
  flex: 1; min-height: 0;
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 6px;
  padding: 6px 20px 6px;
  position: relative; z-index: 2;
}

/* 左栏 — 第一行第一列 */
.db-lcol {
  display: flex; flex-direction: column;
  gap: 6px; min-height: 0;
  grid-row: 1; grid-column: 1;
}
.db-kpis {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  flex-shrink: 0;
}
.db-kpi {
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(79,70,229,0.06);
  border-radius: 4px;
  padding: 6px 8px;
  text-align: center;
}
.db-kpi-val {
  font-family: "Syne","Inter",system-ui,sans-serif;
  font-size: 1.15rem; font-weight: 800;
  letter-spacing: -0.02em; color: #f1f5f9;
  display: block;
}
.db-kpi-sfx { font-size: 0.65rem; font-weight: 600; color: #64748b; }
.db-kpi-lbl {
  font-size: 0.55rem; color: #4F46E5;
  letter-spacing: 0.08em; text-transform: uppercase;
  display: block; margin-top: 1px;
}

/* 中栏 — 第一行第二列 */
.db-mcol {
  display: flex; flex-direction: column;
  min-height: 0;
  grid-row: 1; grid-column: 2;
}

/* 右栏 — 第一行第三列 */
.db-rcol {
  display: flex; flex-direction: column;
  gap: 6px; min-height: 0;
  grid-row: 1; grid-column: 3;
}

/* 底栏 — 通栏第二行 */
.db-bottom {
  grid-row: 2;
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  min-height: 0;
}

/* ── Card ── */
.db-card {
  background: rgba(11,17,34,0.5);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(79,70,229,0.06);
  border-radius: 6px;
  padding: 8px 10px 4px;
  display: flex; flex-direction: column;
  flex: 1; min-height: 0;
  position: relative;
}
.db-card::before {
  content: '';
  position: absolute;
  top: -1px; left: 30px; right: 30px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(79,70,229,0.15), transparent);
}
.db-card-hd {
  display: flex; align-items: center;
  gap: 5px; margin-bottom: 2px; flex-shrink: 0;
  font-family: "Syne","Inter",system-ui,sans-serif;
  font-size: 0.65rem; font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase;
  color: #94a3b8;
}
.db-hl {
  width: 4px; height: 4px; border-radius: 50%;
  background: #4F46E5;
  box-shadow: 0 0 5px rgba(79,70,229,0.4);
  flex-shrink: 0;
}
.db-tag {
  font-size: 0.5rem;
  font-family: "JetBrains Mono",monospace;
  color: #475569;
  background: rgba(255,255,255,0.03);
  padding: 1px 5px; border-radius: 2px;
  margin-left: auto;
}
.db-card-pie { flex: 1.2; }
.db-c { flex: 1; min-height: 0; width: 100%; }

/* ═══ Footer ═══ */
.db-footer {
  height: 32px; flex-shrink: 0;
  display: flex; align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-top: 1px solid rgba(255,255,255,0.04);
  position: relative; z-index: 2;
}
.db-ticker-wrap {
  flex: 1; overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, #000 3%, #000 97%, transparent);
}
.db-ticker {
  display: flex; align-items: center; gap: 12px;
  width: max-content; white-space: nowrap;
  animation: db-scroll 22s linear infinite;
  font-size: 0.55rem;
  font-family: "JetBrains Mono",monospace;
  color: #475569;
  letter-spacing: 0.06em;
}
@keyframes db-scroll {
  0%{transform:translateX(100vw)}100%{transform:translateX(-50%)}
}
.db-ts {
  display: inline-block; width: 3px; height: 3px;
  border-radius: 50%; background: #4F46E5; flex-shrink: 0;
}
.db-status {
  display: flex; align-items: center; gap: 6px;
  margin-left: 16px; flex-shrink: 0;
  font-size: 0.55rem;
  font-family: "JetBrains Mono",monospace;
  color: #1e293b; letter-spacing: 0.06em;
}
.db-st-dot {
  width: 5px; height: 5px; border-radius: 50%;
  background: #10B981;
  box-shadow: 0 0 5px rgba(16,185,129,0.5);
  animation: db-pulse 2s ease-in-out infinite;
}

@media (max-width: 1280px) {
  .db-main {
    grid-template-columns: 1fr 1.5fr 1fr;
    padding: 6px 12px;
  }
}

@media (max-width: 1024px) {
  .db-main {
    grid-template-columns: 1fr 2fr 1fr;
    padding: 6px 10px;
  }
}

@media (max-width: 768px) {
  .db-main {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto;
    overflow-y: auto;
    padding: 6px 12px;
  }
  .db-lcol { grid-row: 1; grid-column: 1; }
  .db-mcol { grid-row: 2; grid-column: 1; }
  .db-rcol { grid-row: 3; grid-column: 1; flex-direction: row; }
  .db-rcol .db-card { flex: 1; }
  .db-bottom { grid-row: 4; grid-column: 1; grid-template-columns: 1fr; }
  .db-kpis { grid-template-columns: repeat(6,1fr); }
  .db-h-subtitle { display: none; }
}

@media (max-width: 480px) {
  .db-kpis { grid-template-columns: repeat(3,1fr); }
  .db-rcol { flex-direction: column; }
  .db-header { padding: 0 12px; height: 38px; }
  .db-title { font-size: 0.75rem; }
}
</style>
