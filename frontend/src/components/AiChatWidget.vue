<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { useChat } from '@/composables/useChat'

const isOpen = ref(false)
const inputText = ref('')
const inputEl = ref<HTMLTextAreaElement>()
const messagesEl = ref<HTMLElement>()
const initialized = ref(false)

const { messages, isStreaming, error, init, send } = useChat()

async function toggleOpen() {
  isOpen.value = !isOpen.value
  if (isOpen.value) {
    await nextTick()
    inputEl.value?.focus()
    if (!initialized.value) {
      initialized.value = true
      await init()
      scrollBottom()
    }
  }
}

async function handleSend() {
  const text = inputText.value.trim()
  if (!text || isStreaming.value) return
  inputText.value = ''
  autoResize()
  await send(text)
  await nextTick()
  scrollBottom()
}

function scrollBottom() {
  if (messagesEl.value) messagesEl.value.scrollTop = messagesEl.value.scrollHeight
}

function autoResize() {
  if (!inputEl.value) return
  inputEl.value.style.height = 'auto'
  inputEl.value.style.height = Math.min(inputEl.value.scrollHeight, 100) + 'px'
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
}

function renderMarkdown(text: string): string {
  if (!text) return ''
  return DOMPurify.sanitize(marked.parse(text) as string)
}
</script>

<template>
  <button class="ai-chat-btn" aria-label="打开 AI 助手" @click="toggleOpen">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  </button>

  <div class="ai-chat-panel" :class="{ 'is-open': isOpen }" role="dialog" aria-label="AI 助手">
    <div class="ai-chat__header">
      <div class="ai-chat__header-info">
        <div class="ai-chat__avatar">AI</div>
        <div>
          <div class="ai-chat__title">AI 助手</div>
          <div class="ai-chat__subtitle">了解毛际可的经历与技能</div>
        </div>
      </div>
      <button class="ai-chat__close" aria-label="关闭" @click="isOpen = false">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>

    <div class="ai-chat__messages" ref="messagesEl">
      <div
        v-for="(msg, i) in messages"
        :key="i"
        class="chat-msg"
        :class="msg.role === 'user' ? 'chat-msg--user' : 'chat-msg--bot'"
      >
        <div class="chat-msg__icon">{{ msg.role === 'bot' ? 'AI' : '我' }}</div>
          <div v-if="msg.role === 'bot'" class="chat-msg__bubble chat-msg__bubble--md" v-html="renderMarkdown(msg.content)"></div>
          <div v-else class="chat-msg__bubble">{{ msg.content }}</div>
      </div>
      <div v-if="isStreaming && messages[messages.length - 1]?.role === 'bot' && !messages[messages.length - 1]?.content" class="chat-msg chat-msg--bot chat-msg--typing">
        <div class="chat-msg__icon">AI</div>
        <div class="chat-msg__bubble">
          <span class="typing-dot" /><span class="typing-dot" /><span class="typing-dot" />
        </div>
      </div>
    </div>

    <div v-if="error" class="ai-chat__error">{{ error }}</div>

    <div class="ai-chat__footer">
      <textarea
        ref="inputEl"
        class="ai-chat__input"
        v-model="inputText"
        rows="1"
        placeholder="输入问题，按 Enter 发送…"
        aria-label="输入消息"
        :disabled="isStreaming"
        @keydown="onKeydown"
        @input="autoResize"
      />
      <button class="ai-chat__send" aria-label="发送" :disabled="isStreaming" @click="handleSend">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
        </svg>
      </button>
    </div>
  </div>
</template>
