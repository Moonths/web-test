<script setup lang="ts">
const emit = defineEmits<{ interest: []; book: [] }>()
</script>

<template>
  <div class="cta-card">
    <p class="cta-card__text">感兴趣？留下信息，我会尽快联系你 👋</p>
    <div class="cta-card__actions">
      <button class="cta-btn cta-btn--primary" @click="emit('interest')">留下公司信息</button>
      <button class="cta-btn cta-btn--secondary" @click="emit('book')">预约面试时间</button>
    </div>
  </div>
</template>

<style scoped>
.cta-card {
  margin: 8px 0;
  padding: 14px 16px;
  background: linear-gradient(135deg, #f0f4ff 0%, #faf0ff 100%);
  border: 1px solid #d0d8ff;
  border-radius: 12px;
  font-size: 14px;
}
.cta-card__text { margin: 0 0 10px; color: #444; }
.cta-card__actions { display: flex; gap: 8px; flex-wrap: wrap; }
.cta-btn {
  padding: 7px 16px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  transition: opacity 0.15s;
}
.cta-btn:hover { opacity: 0.85; }
.cta-btn--primary { background: #5b6ef5; color: #fff; }
.cta-btn--secondary { background: #fff; color: #5b6ef5; border: 1px solid #5b6ef5; }
</style>
