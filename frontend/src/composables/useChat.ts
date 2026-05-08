import { ref } from 'vue'

const API = import.meta.env.VITE_API_URL || 'http://localhost:8000'
const CREDENTIALS = {
  username: import.meta.env.VITE_ADMIN_USERNAME || 'admin',
  password: import.meta.env.VITE_ADMIN_PASSWORD || 'admin123',
}

export interface ChatMessage {
  role: 'user' | 'bot'
  content: string
}

export function useChat() {
  const token = ref('')
  const sessionId = ref('')
  const messages = ref<ChatMessage[]>([])
  const isStreaming = ref(false)
  const error = ref('')

  async function init() {
    error.value = ''
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(CREDENTIALS),
      })
      if (!res.ok) throw new Error('登录失败')
      const data = await res.json()
      token.value = data.token

      const sRes = await fetch(`${API}/create_session`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token.value}` },
      })
      if (!sRes.ok) throw new Error('会话创建失败')
      sessionId.value = (await sRes.json()).session_id

      messages.value.push({
        role: 'bot',
        content: '你好！我是毛际可的 AI 助手，可以回答关于他的经历、技能和项目的问题，请问有什么可以帮你？',
      })
    } catch (e: any) {
      error.value = e.message || '连接失败，请稍后重试'
    }
  }

  async function send(text: string) {
    if (!text.trim() || isStreaming.value) return
    if (!token.value || !sessionId.value) { await init(); return }

    messages.value.push({ role: 'user', content: text })
    isStreaming.value = true
    error.value = ''

    const botMsg: ChatMessage = { role: 'bot', content: '' }
    messages.value.push(botMsg)

    try {
      const res = await fetch(`${API}/chat_on_docs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.value}`,
        },
        body: JSON.stringify({ session_id: sessionId.value, message: text }),
      })
      if (!res.ok || !res.body) throw new Error('请求失败')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const chunk = line.slice(6)
            if (chunk === '[DONE]') break
            if (chunk) botMsg.content += chunk
          }
        }
      }
      if (!botMsg.content) botMsg.content = '（无回复）'
    } catch (e: any) {
      botMsg.content = '出错了，请稍后重试。'
      error.value = e.message
    } finally {
      isStreaming.value = false
    }
  }

  return { messages, isStreaming, error, init, send }
}
