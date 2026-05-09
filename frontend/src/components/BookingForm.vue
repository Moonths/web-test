<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

const emit = defineEmits<{ close: []; submitted: [] }>()

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

interface Slot { id: number; date: string; start_time: string; end_time: string; note: string }

const step = ref(1)
const slots = ref<Slot[]>([])
const selectedSlot = ref<Slot | null>(null)
const loadingSlots = ref(true)
const form = ref({ name: '', company: '', email: '', phone: '' })
const submitting = ref(false)
const error = ref('')

const groupedSlots = computed(() => {
  const map: Record<string, Slot[]> = {}
  for (const s of slots.value) {
    if (!map[s.date]) map[s.date] = []
    map[s.date].push(s)
  }
  return map
})

onMounted(async () => {
  try {
    const res = await fetch(`${API_BASE}/slots`)
    slots.value = await res.json()
  } catch {
    error.value = '加载时段失败'
  } finally {
    loadingSlots.value = false
  }
})

function selectSlot(slot: Slot) {
  selectedSlot.value = slot
  step.value = 2
  error.value = ''
}

async function submit() {
  if (!form.value.name || !form.value.company || !form.value.email) {
    error.value = '请填写必填项'
    return
  }
  submitting.value = true
  error.value = ''
  try {
    const res = await fetch(`${API_BASE}/book`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slot_id: selectedSlot.value!.id, ...form.value }),
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

        <div v-if="step === 1" class="modal-body">
          <div v-if="loadingSlots" class="slots-loading">加载中…</div>
          <div v-else-if="!slots.length" class="slots-empty">暂无可用时段，请稍后再试</div>
          <template v-else>
            <div v-for="(daySlots, date) in groupedSlots" :key="date" class="slot-group">
              <div class="slot-date">{{ date }}</div>
              <div class="slot-list">
                <button
                  v-for="slot in daySlots"
                  :key="slot.id"
                  class="slot-chip"
                  @click="selectSlot(slot)"
                >
                  {{ slot.start_time }}–{{ slot.end_time }}
                  <span v-if="slot.note" class="slot-note">{{ slot.note }}</span>
                </button>
              </div>
            </div>
          </template>
          <p v-if="error" class="form-error">{{ error }}</p>
        </div>

        <div v-else class="modal-body">
          <div class="selected-slot">
            已选：{{ selectedSlot!.date }} {{ selectedSlot!.start_time }}–{{ selectedSlot!.end_time }}
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
  background: #fff; border-radius: 14px; width: 420px; max-width: 92vw;
  max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; border-bottom: 1px solid #eee; font-weight: 600; font-size: 15px;
}
.modal-close { background: none; border: none; cursor: pointer; font-size: 16px; color: #888; }
.modal-body { padding: 16px 20px; display: flex; flex-direction: column; gap: 12px; }
.slots-loading, .slots-empty { color: #888; font-size: 14px; text-align: center; padding: 20px 0; }
.slot-group { display: flex; flex-direction: column; gap: 8px; }
.slot-date { font-size: 13px; font-weight: 600; color: #555; }
.slot-list { display: flex; flex-wrap: wrap; gap: 8px; }
.slot-chip {
  padding: 6px 14px; border-radius: 20px; border: 1px solid #5b6ef5;
  background: #fff; color: #5b6ef5; cursor: pointer; font-size: 13px;
  transition: all 0.15s;
}
.slot-chip:hover { background: #5b6ef5; color: #fff; }
.slot-note { font-size: 11px; opacity: 0.7; margin-left: 4px; }
.selected-slot {
  display: flex; align-items: center; justify-content: space-between;
  padding: 8px 12px; background: #f0f4ff; border-radius: 8px;
  font-size: 13px; color: #444;
}
.btn-back {
  background: none; border: none; color: #5b6ef5; cursor: pointer; font-size: 13px;
}
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
