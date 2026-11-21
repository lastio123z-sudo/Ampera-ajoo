// Ampera Ajo - Auth Store
// API Design:
//   POST /api/v1/auth/login  -> { username, password } -> { token, user }
//   POST /api/v1/auth/logout

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import seedUsers from '@/seed/users.json'

export const useAuthStore = defineStore('auth', () => {
  const LS_KEY = 'ampera_auth'
  const LS_USERS_KEY = 'ampera_users'

  // State
  const currentUser = ref(null)
  const isLoading = ref(false)
  const error = ref(null)

  // Computed
  const isAuthenticated = computed(() => currentUser.value !== null)
  const isPemilik = computed(() => currentUser.value?.role === 'pemilik')
  const isKasir = computed(() => currentUser.value?.role === 'kasir')
  const userRole = computed(() => currentUser.value?.role || null)

  // Init - restore session from localStorage
  function init() {
    const saved = localStorage.getItem(LS_KEY)
    if (saved) {
      try {
        currentUser.value = JSON.parse(saved)
      } catch {
        localStorage.removeItem(LS_KEY)
      }
    }
  }

  // Helper: get users from localStorage or seed
  function getUsers() {
    const saved = localStorage.getItem(LS_USERS_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        return seedUsers
      }
    }
    localStorage.setItem(LS_USERS_KEY, JSON.stringify(seedUsers))
    return seedUsers
  }

  // Actions
  async function login(username, password) {
    isLoading.value = true
    error.value = null
    try {
      const users = getUsers()
      const user = users.find(u => u.username === username && u.password === password)
      if (!user) {
        throw new Error('Username atau password salah')
      }
      const { password: _, ...safeUser } = user
      currentUser.value = safeUser
      localStorage.setItem(LS_KEY, JSON.stringify(safeUser))
      return { success: true, user: safeUser }
    } catch (err) {
      error.value = err.message
      return { success: false, message: err.message }
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    currentUser.value = null
    localStorage.removeItem(LS_KEY)
    error.value = null
  }

  function clearError() {
    error.value = null
  }

  // Initialize on store creation
  init()

  return {
    currentUser,
    isLoading,
    error,
    isAuthenticated,
    isPemilik,
    isKasir,
    userRole,
    login,
    logout,
    clearError,
    getUsers
  }
})
