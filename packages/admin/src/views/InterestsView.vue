<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { api, type Interest } from '@/api'

const interests = ref<Interest[]>([])
const loading = ref(true)

onMounted(async () => {
  try { interests.value = await api.getInterests() }
  finally { loading.value = false }
})
</script>

<template>
  <div class="view-container">
    <div class="view-header">
      <h2>留资记录</h2>
      <el-button @click="interests = []; loading = true; api.getInterests().then(d => interests = d).finally(() => loading = false)">刷新</el-button>
    </div>
    <el-table :data="interests" v-loading="loading" stripe style="width:100%">
      <el-table-column prop="created_at" label="时间" width="180" />
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="company" label="公司" width="150" />
      <el-table-column prop="position" label="职位" width="150" />
      <el-table-column prop="email" label="邮箱" width="180" />
      <el-table-column prop="phone" label="电话" width="130" />
      <el-table-column prop="jd_url" label="JD链接" show-overflow-tooltip />
      <el-table-column prop="message" label="留言" show-overflow-tooltip />
    </el-table>
  </div>
</template>

<style scoped>
.view-container { padding: 24px; }
.view-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.view-header h2 { margin: 0; font-size: 18px; font-weight: 600; color: #303133; }
</style>
