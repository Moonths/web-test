<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const emit = defineEmits<{ close: []; submitted: [] }>()

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const SLOT_INTERVAL = 30
const DAY_START = '09:30'
const DAY_END = '18:00'

interface TimeSlot {
  start: string
  end: string
  booked: boolean
  past: boolean
}

interface DaySchedule {
  date: string
  label: string
  slots: TimeSlot[]
}

const step = ref(1)
const takenSet = ref<Set<string>>(new Set())
const loading = ref(true)
const selectedDate = ref('')
const selectedSlot = ref<{ start: string; end: string } | null>(null)
const form = ref({ name: '', company: '', email: '', phone: '' })
const submitting = ref(false)
const error = ref('')

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}

function minutesToTime(m: number) {
  const h = Math.floor(m / 60).toString().padStart(2, '0')
  const min = (m % 60).toString().padStart(2, '0')
  return `${h}:${min}`
}

function getWeekWorkdays(): { date: string; label: string }[] {
  const result: { date: string; label: string }[] = []
  const now = new Date()
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
  let d = new Date(now)
  while (result.length < 7) {
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) {
      const yyyy = d.getFullYear()
      const mm = String(d.getMonth() + 1).padStart(2, '0')
      const dd = String(d.getDate()).padStart(2, '0')
      const dateStr = `${yyyy}-${mm}-${dd}`
      const month = d.getMonth() + 1
      const day = d.getDate()
      result.push({ date: dateStr, label: `${month}/${day} ${weekDays[dow]}` })
    }
    d.setDate(d.getDate() + 1)
  }
  return result
}

function generateSlots(dateStr: string): TimeSlot[] {
  const now = new Date()
  const todayStr = now.toISOString().slice(0, 10)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const startMin = timeToMinutes(DAY_START)
  const endMin = timeToMinutes(DAY_END)
  const slots: TimeSlot[] = []

  for (let m = startMin; m < endMin; m += SLOT_INTERVAL) {
    const start = minutesToTime(m)
    const end = minutesToTime(m + SLOT_INTERVAL)
    const past = dateStr === todayStr && m <= nowMinutes
    const booked = takenSet.value.has(`${dateStr}|${start}`)
    slots.push({ start, end, booked, past })
  }
  return slots
}

const workdays = computed<DaySchedule[]>(() => {
  return getWeekWorkdays().map(({ date, label }) => ({
    date,
    label,
    slots: generateSlots(date),
  }))
})

const activeDaySchedule = computed<DaySchedule | null>(() => {
  return workdays.value.find(d => d.date === selectedDate.value) ?? workdays.value[0] ?? null
})

onMounted(async () => {
  try {
    const res = await fetch(`${API_BASE}/bookings/taken`)
    if (res.ok) {
      const data: { date: string; start_time: string }[] = await res.json()
      takenSet.value = new Set(data.map(r => `${r.date}|${r.start_time}`))
    }
  } catch {
    // 接口失败时不影响选择，只是无法显示已占用
  } finally {
    loading.value = false
    selectedDate.value = workdays.value[0]?.date ?? ''
  }
})

function pickSlot(slot: TimeSlot) {
  if (slot.booked || slot.past) return
  selectedSlot.value = { start: slot.start, end: slot.end }
  step.value = 2
  error.value = ''
}

async function submit() {
  if (!form.value.name || !form.value.company || !form.value.email) {
    error.value = '请填写必填项'
    return
  }
  if (!selectedSlot.value) return
  submitting.value = true
  error.value = ''
  try {
    const res = await fetch(`${API_BASE}/book-direct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: selectedDate.value,
        start_time: selectedSlot.value.start,
        end_time: selectedSlot.value.end,
        ...form.value,
      }),
    })
    if (res.status === 409) throw new Error('该时段已被预约，请返回选择其他时段')
    if (!res.ok) throw new Error('提交失败')
    emit('submitted')
  } catch (e: any) {
    error.value = e.message || '提交失败，请重试'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal-box">
        <div class="modal-header">
          <span>{{ step === 1 ? '选择面试时间' : '填写联系信息' }}</span>
          <button class="modal-close" @click="emit('close')">✕</button>
        </div>

        <!-- Step 1: 时间选择 -->
        <div v-if="step === 1" class="modal-body">
          <div v-if="loading" class="slots-loading">加载中…</div>
          <template v-else>
            <!-- 日期 Tab -->
            <div class="day-tabs">
              <button
                v-for="day in workdays"
                :key="day.date"
                class="day-tab"
                :class="{ active: selectedDate === day.date }"
                @click="selectedDate = day.date"
              >
                {{ day.label }}
              </button>
            </div>

            <!-- 时间格子 -->
            <div v-if="activeDaySchedule" class="slot-grid">
              <button
                v-for="slot in activeDaySchedule.slots"
                :key="slot.start"
                class="slot-chip"
                :class="{ booked: slot.booked, past: slot.past }"
                :disabled="slot.booked || slot.past"
                @click="pickSlot(slot)"
              >
                {{ slot.start }}
              </button>
            </div>

            <div class="legend">
              <span class="legend-dot avail"></span>可预约
              <span class="legend-dot taken"></span>已占用
            </div>
          </template>
          <p v-if="error" class="form-error">{{ error }}</p>
        </div>

        <!-- Step 2: 填写信息 -->
        <div v-else class="modal-body">
          <div class="selected-slot">
            <span>已选：{{ selectedDate }} {{ selectedSlot!.start }}–{{ selectedSlot!.end }}</span>
            <button class="btn-back" @click="step = 1">重选</button>
          </div>
          <div class="form-row">
            <label>姓名 <span class="req">*</span></label>
            <input v-model="form.name" placeholder="你的姓名" />
          </div>
          <div class="form-row">
            <label>公司 <span class="req">*</span></label>
            <input v-model="form.company" placeholder="公司名称" />
          </div>
          <div class="form-row">
            <label>邮箱 <span class="req">*</span></label>
            <input v-model="form.email" type="email" placeholder="联系邮箱" />
          </div>
          <div class="form-row">
            <label>电话</label>
            <input v-model="form.phone" placeholder="联系电话（选填）" />
          </div>
          <p v-if="error" class="form-error">{{ error }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn-cancel" @click="emit('close')">取消</button>
          <button v-if="step === 2" class="btn-submit" :disabled="submitting" @click="submit">
            {{ submitting ? '提交中…' : '确认预约' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.45);
  display: flex; align-items: center; justify-content: center; z-index: 9999;
}
.modal-box {
  background: #fff; border-radius: 14px; width: 480px; max-width: 94vw;
  max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid #eee; font-weight: 600; font-size: 15px;
}
.modal-close { background: none; border: none; cursor: pointer; font-size: 16px; color: #888; }
.modal-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; }
.slots-loading { color: #888; font-size: 14px; text-align: center; padding: 20px 0; }

/* 日期 Tab */
.day-tabs {
  display: flex; gap: 6px; flex-wrap: wrap;
}
.day-tab {
  padding: 5px 12px; border-radius: 20px; border: 1px solid #ddd;
  background: #fff; color: #555; cursor: pointer; font-size: 12px;
  transition: all 0.15s;
}
.day-tab.active {
  border-color: #5b6ef5; background: #5b6ef5; color: #fff;
}
.day-tab:hover:not(.active) { border-color: #5b6ef5; color: #5b6ef5; }

/* 时间格子 */
.slot-grid {
  display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px;
}
.slot-chip {
  padding: 8px 4px; border-radius: 8px; border: 1px solid #5b6ef5;
  background: #fff; color: #5b6ef5; cursor: pointer; font-size: 13px;
  text-align: center; transition: all 0.15s;
}
.slot-chip:hover:not(:disabled) { background: #5b6ef5; color: #fff; }
.slot-chip.booked, .slot-chip.past {
  border-color: #ddd; background: #f5f5f5; color: #bbb; cursor: not-allowed;
}
.slot-chip.booked { background: #f0f0f0; }

/* 图例 */
.legend {
  display: flex; align-items: center; gap: 12px; font-size: 12px; color: #888;
}
.legend-dot {
  display: inline-block; width: 10px; height: 10px; border-radius: 3px; margin-right: 4px;
}
.legend-dot.avail { background: #fff; border: 1px solid #5b6ef5; }
.legend-dot.taken { background: #f0f0f0; border: 1px solid #ddd; }

/* Step 2 */
.selected-slot {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 12px; background: #f0f4ff; border-radius: 8px;
  font-size: 13px; color: #444;
}
.btn-back { background: none; border: none; color: #5b6ef5; cursor: pointer; font-size: 13px; }
.form-row { display: flex; flex-direction: column; gap: 4px; }
.form-row label { font-size: 13px; color: #555; font-weight: 500; }
.req { color: #e53e3e; }
.form-row input {
  padding: 8px 10px; border: 1px solid #ddd; border-radius: 8px;
  font-size: 14px; outline: none; transition: border-color 0.15s;
}
.form-row input:focus { border-color: #5b6ef5; }
.form-error { color: #e53e3e; font-size: 13px; margin: 0; }
.modal-footer {
  display: flex; justify-content: flex-end; gap: 8px;
  padding: 12px 20px; border-top: 1px solid #eee;
}
.btn-cancel {
  padding: 8px 18px; border-radius: 8px; border: 1px solid #ddd;
  background: #fff; cursor: pointer; font-size: 14px;
}
.btn-submit {
  padding: 8px 18px; border-radius: 8px; border: none;
  background: #5b6ef5; color: #fff; cursor: pointer; font-size: 14px; font-weight: 500;
}
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
</style>
