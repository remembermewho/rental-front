import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
  const user = ref(null)

  function initialize() {
    const token = localStorage.getItem('token')
    if (token) {
      const payload = JSON.parse(atob(token.split('.')[1]))
      user.value = { id: payload.id, role: payload.role, ...payload }
    } else {
      user.value = null
    }
  }

  function login(token) {
    localStorage.setItem('token', token)
    initialize()
  }

  function logout() {
    localStorage.removeItem('token')
    user.value = null
  }

  return { user, initialize, login, logout }
})
