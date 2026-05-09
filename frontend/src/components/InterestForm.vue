<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ close: []; submitted: [] }>()

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const form = ref({ name: '', company: '', position: '', email: '', phone: '', jd_url: '', message: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  if (!form.value.name || !form.value.company || !form.value.position || !form.value.email) {
    error.value = '请填写必填项'
    return
  }
  loading.value = true
  error.value = ''
  try {
    const res = await fetch(`${API_BASE}/interest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value),
    })
    if (!res.ok) throw new Error('提交失败')
    emit('submitted')
  } catch (e: any) {
    error.value = e.message || '提交失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="emit('close')">
      <div class="modal-box">
        <div class="modal-header">
          <span>留下公司信息</span>
          <button class="modal-close" @click="emit('close')">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-row">
            <label>姓名 <span class="req">*</span></label>
            <input v-model="form.name" placeholder="你的姓名" />
          </div>
          <div class="form-row">
            <label>公司 <span class="req">*</span></label>
            <input v-model="form.company" placeholder="公司名称" />
          </div>
          <div class="form-row">
            <label>职位 <span class="req">*</span></label>
            <input v-model="form.position" placeholder="招聘职位" />
          </div>
          <div class="form-row">
            <label>邮箱 <span class="req">*</span></label>
            <input v-model="form.email" type="email" placeholder="联系邮箱" />
          </div>
          <div class="form-row">
            <label>电话</label>
            <input v-model="form.phone" placeholder="联系电话（选填）" />
          </div>
          <div class="form-row">
            <label>JD 链接</label>
            <input v-model="form.jd_url" placeholder="职位描述链接（选填）" />
          </div>
          <div class="form-row">
            <label>留言</label>
            <textarea v-model="form.message" rows="3" placeholder="其他想说的（选填）" />
          </div>
          <p v-if="error" class="form-error">{{ error }}</p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="emit('close')">取消</button>
          <button class="btn-submit" :disabled="loading" @click="submit">
            {{ loading ? '提交中…' : '提交' }}
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
.form-row { display: flex; flex-direction: column; gap: 4px; }
.form-row label { font-size: 13px; color: #555; font-weight: 500; }
.req { color: #e53e3e; }
.form-row input, .form-row textarea {
  padding: 8px 10px; border: 1px solid #ddd; border-radius: 8px;
  font-size: 14px; outline: none; transition: border-color 0.15s;
  font-family: inherit; resize: vertical;
}
.form-row input:focus, .form-row textarea:focus { border-color: #5b6ef5; }
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
