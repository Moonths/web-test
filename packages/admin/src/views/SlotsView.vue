<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { api, type Slot, type Booking } from '@/api'

const slots = ref<Slot[]>([])
const bookings = ref<Booking[]>([])
const loading = ref(true)
const generating = ref(false)

async function loadData() {
  loading.value = true
  try {
    [slots.value, bookings.value] = await Promise.all([api.getSlots(), api.getBookings()])
  } finally {
    loading.value = false
  }
}

onMounted(loadData)

async function handleGenerate() {
  generating.value = true
  try {
    const res = await api.generateSlots()
    ElMessage.success(res.created > 0 ? `已生成 ${res.created} 个时段` : '时段已是最新，无需生成')
    await loadData()
  } catch (e: any) {
    ElMessage.error(e.message || '生成失败')
  } finally {
    generating.value = false
  }
}

async function handleDelete(slot: Slot) {
  try {
    await ElMessageBox.confirm(`确认删除 ${slot.date} ${slot.start_time}–${slot.end_time}？`, '提示', { type: 'warning' })
  } catch { return }
  try {
    await api.deleteSlot(slot.id)
    ElMessage.success('已删除')
    await loadData()
  } catch (e: any) {
    ElMessage.error(e.message || '删除失败')
  }
}

// 生成最近两周日期列表
const days = computed(() => {
  const list: string[] = []
  const today = new Date()
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    list.push(d.toISOString().slice(0, 10))
  }
  return list
})

const WEEK = ['日', '一', '二', '三', '四', '五', '六']

function weekday(dateStr: string) {
  return WEEK[new Date(dateStr + 'T00:00:00').getDay()]
}

function isToday(dateStr: string) {
  return dateStr === new Date().toISOString().slice(0, 10)
}

// 按日期+时段查找 slot
function getSlot(date: string, period: 'am' | 'pm'): Slot | undefined {
  const start = period === 'am' ? '09:00' : '14:00'
  return slots.value.find(s => s.date === date && s.start_time === start)
}

const PERIODS = [
  { key: 'am' as const, label: '上午', time: '09:00–11:00' },
  { key: 'pm' as const, label: '下午', time: '14:00–16:00' },
]
</script>

<template>
  <div class="view-container">
    <div class="toolbar">
      <div class="toolbar-title">
        <span>面试时间管理</span>
        <span class="toolbar-sub">最近两周 · 每天上午/下午各一个时段</span>
      </div>
      <el-button type="primary" :loading="generating" @click="handleGenerate">
        自动生成时段
      </el-button>
    </div>

    <div v-loading="loading" class="calendar">
      <div v-for="date in days" :key="date" class="day-card" :class="{ 'is-today': isToday(date) }">
        <div class="day-header">
          <span class="day-date">{{ date.slice(5) }}</span>
          <span class="day-week">周{{ weekday(date) }}</span>
          <el-tag v-if="isToday(date)" size="small" type="primary" effect="plain">今天</el-tag>
        </div>
        <div class="day-slots">
          <div
            v-for="p in PERIODS"
            :key="p.key"
            class="slot-cell"
            :class="{
              'slot-cell--booked': getSlot(date, p.key)?.is_booked,
              'slot-cell--available': getSlot(date, p.key) && !getSlot(date, p.key)?.is_booked,
              'slot-cell--empty': !getSlot(date, p.key),
            }"
          >
            <div class="slot-cell__label">{{ p.label }}</div>
            <div class="slot-cell__time">{{ p.time }}</div>
            <div class="slot-cell__status">
              <template v-if="!getSlot(date, p.key)">
                <span class="status-text status-text--empty">未生成</span>
              </template>
              <template v-else-if="getSlot(date, p.key)?.is_booked">
                <span class="status-text status-text--booked">已预约</span>
              </template>
              <template v-else>
                <span class="status-text status-text--free">可预约</span>
                <el-button
                  size="small"
                  type="danger"
                  text
                  @click="handleDelete(getSlot(date, p.key)!)"
                >删除</el-button>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>预约记录</h2>
      <el-table :data="bookings" stripe style="width:100%">
        <el-table-column prop="created_at" label="预约时间" width="180" />
        <el-table-column label="面试时段" width="200">
          <template #default="{ row }">{{ row.date }} {{ row.start_time }}–{{ row.end_time }}</template>
        </el-table-column>
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="company" label="公司" width="150" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="phone" label="电话" width="130" />
      </el-table>
    </div>
  </div>
</template>

<style scoped>
.view-container { padding: 24px; display: flex; flex-direction: column; gap: 32px; }

.toolbar {
  display: flex; align-items: center; justify-content: space-between;
}
.toolbar-title { display: flex; flex-direction: column; gap: 2px; }
.toolbar-title span:first-child { font-size: 16px; font-weight: 600; color: #303133; }
.toolbar-sub { font-size: 12px; color: #909399; }

.calendar {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.day-card {
  border: 1px solid #e4e7ed;
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
}
.day-card.is-today { border-color: #409eff; }

.day-header {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 12px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}
.day-card.is-today .day-header { background: #ecf5ff; }
.day-date { font-size: 14px; font-weight: 600; color: #303133; }
.day-week { font-size: 12px; color: #909399; }

.day-slots { display: flex; flex-direction: column; }

.slot-cell {
  padding: 10px 12px;
  display: flex; align-items: center; gap: 8px;
  border-bottom: 1px solid #f0f0f0;
}
.slot-cell:last-child { border-bottom: none; }
.slot-cell--booked { background: #fff5f5; }
.slot-cell--available { background: #f6ffed; }
.slot-cell--empty { background: #fafafa; }

.slot-cell__label { font-size: 12px; font-weight: 600; color: #606266; width: 28px; flex-shrink: 0; }
.slot-cell__time { font-size: 11px; color: #909399; flex: 1; }
.slot-cell__status { display: flex; align-items: center; gap: 4px; }

.status-text { font-size: 11px; }
.status-text--free { color: #67c23a; }
.status-text--booked { color: #f56c6c; }
.status-text--empty { color: #c0c4cc; }

.section h2 { margin: 0 0 12px; font-size: 16px; font-weight: 600; color: #303133; }
</style>
