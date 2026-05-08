<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { api, chatStream } from '@/api'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const auth = useAuthStore()

const saving = ref(false)
const sessionId = ref('')
const messages = ref<{ role: 'user' | 'assistant'; content: string }[]>([])
const chatInput = ref('')
const chatLoading = ref(false)
const streamingContent = ref('')
const chatContainer = ref<HTMLElement>()
let vditor: Vditor | null = null

onMounted(async () => {
  let initialContent = ''
  try {
    const data = await api.getKnowledge()
    initialContent = data.content
  } catch {
    ElMessage.error('加载知识库失败，请检查后端连接')
  }

  vditor = new Vditor('vditor-container', {
    height: 'calc(100vh - 64px)',
    mode: 'sv',
    value: initialContent,
    cache: { enable: false },
    toolbar: [
      'headings', 'bold', 'italic', 'strike', '|',
      'line', 'quote', 'list', 'ordered-list', '|',
      'code', 'inline-code', 'table', '|',
      'undo', 'redo', '|', 'fullscreen',
    ],
  })

  try {
    const { session_id } = await api.createSession()
    sessionId.value = session_id
    messages.value.push({
      role: 'assistant',
      content: '你好！我是基于你知识库的AI助手，可以在这里测试对话效果。',
    })
  } catch {
    ElMessage.warning('AI测试面板初始化失败，请检查后端连接')
  }
})

onBeforeUnmount(() => {
  vditor?.destroy()
})

async function handleSave() {
  if (!vditor) return
  saving.value = true
  try {
    await api.updateKnowledge(vditor.getValue())
    ElMessage.success('知识库已保存')
  } catch (e: any) {
    ElMessage.error(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

async function handleSend() {
  const msg = chatInput.value.trim()
  if (!msg || chatLoading.value || !sessionId.value) return
  chatInput.value = ''
  messages.value.push({ role: 'user', content: msg })
  chatLoading.value = true
  streamingContent.value = ''

  try {
    for await (const token of chatStream(sessionId.value, msg)) {
      streamingContent.value += token
      await nextTick()
      if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight
      }
    }
    messages.value.push({ role: 'assistant', content: streamingContent.value })
  } catch (e: any) {
    messages.value.push({ role: 'assistant', content: `[错误] ${e.message}` })
  } finally {
    streamingContent.value = ''
    chatLoading.value = false
  }
}

function handleLogout() {
  ElMessageBox.confirm('确认退出登录？', '提示', { type: 'warning' })
    .then(() => { auth.logout(); router.push('/login') })
    .catch(() => {})
}
</script>

<template>
  <div class="admin-layout">
    <header class="admin-header">
      <span class="admin-title">简历管理后台</span>
      <div class="admin-actions">
        <el-button type="primary" :loading="saving" @click="handleSave">保存知识库</el-button>
        <el-button @click="handleLogout">退出登录</el-button>
      </div>
    </header>

    <div class="admin-body">
      <div class="editor-panel">
        <div id="vditor-container" />
      </div>

      <div class="chat-panel">
        <div class="chat-title">AI 对话测试</div>
        <div ref="chatContainer" class="chat-messages">
          <div v-for="(msg, i) in messages" :key="i" :class="['chat-msg', msg.role]">
            <div class="chat-bubble">{{ msg.content }}</div>
          </div>
          <div v-if="streamingContent || chatLoading" class="chat-msg assistant">
            <div class="chat-bubble">{{ streamingContent || '...' }}</div>
          </div>
        </div>
        <div class="chat-input-row">
          <el-input
            v-model="chatInput"
            placeholder="输入问题测试AI效果..."
            :disabled="!sessionId || chatLoading"
            @keyup.enter="handleSend"
          />
          <el-button type="primary" :loading="chatLoading" :disabled="!sessionId" @click="handleSend">
            发送
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}
.admin-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}
.admin-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}
.admin-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}
.editor-panel {
  flex: 3;
  overflow: hidden;
}
.chat-panel {
  flex: 2;
  display: flex;
  flex-direction: column;
  border-left: 1px solid #e4e7ed;
  background: #fafafa;
  min-width: 320px;
}
.chat-title {
  padding: 12px 16px;
  font-weight: 600;
  color: #303133;
  border-bottom: 1px solid #e4e7ed;
  background: #fff;
  flex-shrink: 0;
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.chat-msg { display: flex; }
.chat-msg.user { justify-content: flex-end; }
.chat-bubble {
  max-width: 80%;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}
.chat-msg.user .chat-bubble { background: #409eff; color: #fff; }
.chat-msg.assistant .chat-bubble { background: #fff; border: 1px solid #e4e7ed; color: #303133; }
.chat-input-row {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid #e4e7ed;
  background: #fff;
  flex-shrink: 0;
}
</style>
