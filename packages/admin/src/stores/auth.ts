import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useAuthStore = defineStore('auth', () => {
  const token = useStorage<string>('admin_token', '')

  function setToken(t: string) {
    token.value = t
  }

  function logout() {
    token.value = ''
  }

  return { token, setToken, logout }
})
