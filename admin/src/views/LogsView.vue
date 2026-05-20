<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { api, type ChatLog } from '@/api'

const logs = ref<ChatLog[]>([])
const loading = ref(true)

async function refresh() {
  loading.value = true
  try { logs.value = await api.getLogs() }
  finally { loading.value = false }
}

onMounted(refresh)

// 按 session_id 分组，每组取第一条时间作为排序依据（DESC）
interface SessionGroup {
  session_id: string
  short_id: string
  first_at: string
  messages: ChatLog[]
}

const groups = computed<SessionGroup[]>(() => {
  const map = new Map<string, ChatLog[]>()
  for (const log of logs.value) {
    if (!map.has(log.session_id)) map.set(log.session_id, [])
    map.get(log.session_id)!.push(log)
  }
  return Array.from(map.entries())
    .map(([sid, msgs]) => ({
      session_id: sid,
      short_id: sid.slice(0, 8),
      first_at: msgs[msgs.length - 1]?.created_at ?? '',
      messages: msgs,
    }))
    .sort((a, b) => b.first_at.localeCompare(a.first_at))
})
</script>

<template>
  <div class="view-container">
    <div class="view-header">
      <h2>聊天留痕</h2>
      <span class="view-count">{{ groups.length }} 个会话 / {{ logs.length }} 条记录</span>
      <el-button @click="refresh">刷新</el-button>
    </div>

    <div v-if="loading" class="loading-tip">加载中…</div>

    <div v-else-if="!groups.length" class="empty-tip">暂无记录</div>

    <div v-else class="session-list">
      <div v-for="group in groups" :key="group.session_id" class="session-card">
        <div class="session-header">
          <span class="session-tag">会话 #{{ group.short_id }}</span>
          <span class="session-time">{{ group.first_at }}</span>
          <span class="session-count">{{ group.messages.length }} 条</span>
        </div>
        <div class="message-list">
          <div v-for="msg in group.messages" :key="msg.id" class="message-row">
            <span class="msg-time">{{ msg.created_at.slice(11, 19) }}</span>
            <span class="msg-text">{{ msg.question }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.view-container { padding: 24px; }
.view-header { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.view-header h2 { margin: 0; font-size: 18px; font-weight: 600; color: #303133; flex: 1; }
.view-count { font-size: 13px; color: #909399; }

.loading-tip, .empty-tip { color: #909399; font-size: 14px; text-align: center; padding: 40px 0; }

.session-list { display: flex; flex-direction: column; gap: 12px; }

.session-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;
}

.session-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
}

.session-tag {
  font-family: monospace;
  font-size: 12px;
  font-weight: 600;
  color: #409eff;
  background: #ecf5ff;
  padding: 2px 8px;
  border-radius: 4px;
}

.session-time {
  font-size: 12px;
  color: #909399;
  flex: 1;
}

.session-count {
  font-size: 12px;
  color: #c0c4cc;
}

.message-list { padding: 8px 0; }

.message-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 6px 16px;
}

.message-row:hover { background: #fafafa; }

.msg-time {
  font-family: monospace;
  font-size: 12px;
  color: #c0c4cc;
  white-space: nowrap;
  flex-shrink: 0;
  padding-top: 1px;
}

.msg-text {
  font-size: 14px;
  color: #303133;
  line-height: 1.6;
  word-break: break-all;
}
</style>
