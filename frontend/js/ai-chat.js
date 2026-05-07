(() => {
  const API = 'http://localhost:8000';
  const CREDENTIALS = { username: 'admin', password: 'admin123' };

  let token = null;
  let sessionId = null;
  let isStreaming = false;

  // ── DOM ──────────────────────────────────────────────────────────────────
  const btn   = document.getElementById('aiChatBtn');
  const panel = document.getElementById('aiChatPanel');
  const close = document.getElementById('aiChatClose');
  const msgs  = document.getElementById('aiChatMessages');
  const input = document.getElementById('aiChatInput');
  const send  = document.getElementById('aiChatSend');
  const err   = document.getElementById('aiChatError');

  // ── Toggle ───────────────────────────────────────────────────────────────
  btn.addEventListener('click', async () => {
    const opening = !panel.classList.contains('is-open');
    panel.classList.toggle('is-open');
    if (opening) {
      input.focus();
      if (!token) await init();
    }
  });
  close.addEventListener('click', () => panel.classList.remove('is-open'));

  // ── Init: login + create session ─────────────────────────────────────────
  async function init() {
    showError('');
    appendTyping();
    try {
      const res = await fetch(`${API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(CREDENTIALS),
      });
      if (!res.ok) throw new Error('登录失败');
      const data = await res.json();
      token = data.access_token;

      const sRes = await fetch(`${API}/create_session`, {
        method: 'POST',
        headers: authHeaders(),
      });
      if (!sRes.ok) throw new Error('会话创建失败');
      const sData = await sRes.json();
      sessionId = sData.session_id;

      removeTyping();
      appendBot('你好！我是毛际可的 AI 助手，可以回答关于他的经历、技能和项目的问题，请问有什么可以帮你？');
    } catch (e) {
      removeTyping();
      showError(e.message || '连接失败，请稍后重试');
    }
  }

  // ── Send ─────────────────────────────────────────────────────────────────
  async function sendMessage() {
    const text = input.value.trim();
    if (!text || isStreaming) return;
    if (!token || !sessionId) { await init(); return; }

    input.value = '';
    autoResize();
    appendUser(text);
    send.disabled = true;
    isStreaming = true;
    showError('');

    const botBubble = appendBot('');
    appendTyping(botBubble);

    try {
      const res = await fetch(`${API}/chat_on_docs?session_id=${sessionId}`, {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error('请求失败');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let answer = '';
      removeTypingFrom(botBubble);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        // SSE lines: "data: <token>\n"
        for (const line of chunk.split('\n')) {
          if (line.startsWith('data: ')) {
            const token = line.slice(6);
            if (token === '[DONE]') break;
            answer += token;
            botBubble.textContent = answer;
            scrollBottom();
          }
        }
      }
      if (!answer) botBubble.textContent = '（无回复）';
    } catch (e) {
      removeTypingFrom(botBubble);
      botBubble.textContent = '出错了，请稍后重试。';
      showError(e.message);
    } finally {
      isStreaming = false;
      send.disabled = false;
      input.focus();
    }
  }

  send.addEventListener('click', sendMessage);
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });
  input.addEventListener('input', autoResize);

  // ── Helpers ───────────────────────────────────────────────────────────────
  function authHeaders() {
    return { Authorization: `Bearer ${token}` };
  }

  function appendUser(text) {
    const el = createMsg('user');
    el.querySelector('.chat-msg__bubble').textContent = text;
    msgs.appendChild(el);
    scrollBottom();
  }

  function appendBot(text) {
    const el = createMsg('bot');
    const bubble = el.querySelector('.chat-msg__bubble');
    bubble.textContent = text;
    msgs.appendChild(el);
    scrollBottom();
    return bubble;
  }

  function appendTyping(container) {
    if (container) {
      container._typingEl = document.createElement('span');
      container._typingEl.className = 'typing-dots';
      container._typingEl.innerHTML =
        '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
      container.appendChild(container._typingEl);
      return;
    }
    const el = createMsg('bot');
    el.id = 'typingIndicator';
    el.classList.add('chat-msg--typing');
    el.querySelector('.chat-msg__bubble').innerHTML =
      '<span class="typing-dot"></span><span class="typing-dot"></span><span class="typing-dot"></span>';
    msgs.appendChild(el);
    scrollBottom();
  }

  function removeTyping() {
    const el = document.getElementById('typingIndicator');
    if (el) el.remove();
  }

  function removeTypingFrom(bubble) {
    if (bubble._typingEl) { bubble._typingEl.remove(); bubble._typingEl = null; }
  }

  function createMsg(role) {
    const wrap = document.createElement('div');
    wrap.className = `chat-msg chat-msg--${role}`;
    wrap.innerHTML = `
      <div class="chat-msg__icon">${role === 'bot' ? 'AI' : '我'}</div>
      <div class="chat-msg__bubble"></div>`;
    return wrap;
  }

  function scrollBottom() {
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showError(msg) {
    err.textContent = msg;
  }

  function autoResize() {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 100) + 'px';
  }
})();
