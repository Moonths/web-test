const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function getToken(): string {
  return localStorage.getItem('admin_token') ?? ''
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json() as Promise<T>
}

export interface ChatLog {
  id: number; created_at: string; ip: string; session_id: string; question: string
}
export interface Interest {
  id: number; created_at: string; name: string; company: string; position: string
  email: string; phone: string; jd_url: string; message: string
}
export interface Slot {
  id: number; date: string; start_time: string; end_time: string; note: string; is_booked: number
}
export interface Booking {
  id: number; created_at: string; name: string; company: string; email: string; phone: string
  date: string; start_time: string; end_time: string
}
export interface SlotCreate {
  date: string; start_time: string; end_time: string; note?: string
}

export const api = {
  login: (username: string, password: string) =>
    request<{ token: string }>('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  createSession: () =>
    request<{ session_id: string }>('/create_session', { method: 'POST' }),

  getKnowledge: () =>
    request<{ content: string }>('/admin/knowledge'),

  updateKnowledge: (content: string) =>
    request<{ message: string }>('/admin/knowledge', {
      method: 'PUT',
      body: JSON.stringify({ content }),
    }),

  getLogs: () => request<ChatLog[]>('/admin/logs'),
  getInterests: () => request<Interest[]>('/admin/interests'),
  getSlots: () => request<Slot[]>('/admin/slots'),
  createSlot: (data: SlotCreate) => request<Slot>('/admin/slots', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  deleteSlot: (id: number) => request<void>(`/admin/slots/${id}`, { method: 'DELETE' }),
  generateSlots: () => request<{ created: number }>('/admin/slots/generate', { method: 'POST' }),
  getBookings: () => request<Booking[]>('/admin/bookings'),
}

export async function* chatStream(
  sessionId: string,
  message: string,
): AsyncGenerator<string> {
  const token = getToken()
  const res = await fetch(`${BASE_URL}/chat_on_docs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ session_id: sessionId, message }),
  })

  if (!res.ok || !res.body) throw new Error('Chat request failed')

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
        const data = line.slice(6)
        if (data === '[DONE]') return
        if (data.startsWith('[ERROR]')) throw new Error(data.slice(8))
        if (data) yield data
      }
    }
  }
}
