<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, type ChatLog } from '@/api'

const logs = ref<ChatLog[]>([])
const loading = ref(true)

onMounted(async () => {
  try { logs.value = await api.getLogs() }
  finally { loading.value = false }
})
</script>

<template>
  <div class="view-container">
    <div class="view-header">
      <h2>聊天留痕</h2>
      <el-button @click="logs = []; loading = true; api.getLogs().then(d => logs = d).finally(() => loading = false)">刷新</el-button>
    </div>
    <el-table :data="logs" v-loading="loading" stripe style="width:100%">
      <el-table-column prop="created_at" label="时间" width="180" />
      <el-table-column prop="ip" label="IP" width="140" />
      <el-table-column prop="question" label="问题内容" show-overflow-tooltip />
    </el-table>
  </div>
</template>

<style scoped>
.view-container { padding: 24px; }
.view-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.view-header h2 { margin: 0; font-size: 18px; font-weight: 600; color: #303133; }
</style>
