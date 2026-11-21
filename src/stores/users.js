// Ampera Ajo - Users Store (Manajemen Kasir)
// API Design:
//   GET    /api/v1/users        -> List semua user (kasir)
//   POST   /api/v1/users        -> Tambah kasir baru
//   PUT    /api/v1/users/:id    -> Update data kasir
//   DELETE /api/v1/users/:id    -> Hapus kasir

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import seedUsers from '@/seed/users.json'

export const useUsersStore = defineStore('users', () => {
  const LS_KEY = 'ampera_users'

  // State
  const users = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Computed
  const kasirList = computed(() => users.value.filter(u => u.role === 'kasir'))
  const pemilikList = computed(() => users.value.filter(u => u.role === 'pemilik'))

  // Init - load from localStorage or seed
  function init() {
    const saved = localStorage.getItem(LS_KEY)
    if (saved) {
      try {
        users.value = JSON.parse(saved)
      } catch {
        users.value = [...seedUsers]
        persist()
      }
    } else {
      users.value = [...seedUsers]
      persist()
    }
  }

  function persist() {
    localStorage.setItem(LS_KEY, JSON.stringify(users.value))
  }

  function generateId() {
    return 'u' + Date.now() + Math.random().toString(36).substr(2, 5)
  }

  // Actions
  async function fetchUsers() {
    isLoading.value = true
    try {
      return users.value
    } finally {
      isLoading.value = false
    }
  }

  async function addKasir(data) {
    // Cek duplikat username
    if (users.value.some(u => u.username === data.username)) {
      throw new Error('Username sudah digunakan')
    }
    const newUser = {
      id: generateId(),
      username: data.username,
      password: data.password,
      nama: data.nama,
      role: 'kasir'
    }
    users.value.push(newUser)
    persist()
    return newUser
  }

  async function updateKasir(id, data) {
    const idx = users.value.findIndex(u => u.id === id)
    if (idx === -1) throw new Error('Pengguna tidak ditemukan')
    // Cek duplikat username (kecuali dirinya sendiri)
    if (users.value.some(u => u.username === data.username && u.id !== id)) {
      throw new Error('Username sudah digunakan')
    }
    users.value[idx] = {
      ...users.value[idx],
      nama: data.nama,
      username: data.username,
      ...(data.password ? { password: data.password } : {})
    }
    persist()
    return users.value[idx]
  }

  async function deleteKasir(id) {
    const idx = users.value.findIndex(u => u.id === id)
    if (idx === -1) throw new Error('Pengguna tidak ditemukan')
    if (users.value[idx].role === 'pemilik') throw new Error('Tidak dapat menghapus pemilik')
    users.value.splice(idx, 1)
    persist()
  }

  function getUserById(id) {
    return users.value.find(u => u.id === id)
  }

  // Initialize
  init()

  return {
    users,
    isLoading,
    error,
    kasirList,
    pemilikList,
    fetchUsers,
    addKasir,
    updateKasir,
    deleteKasir,
    getUserById
  }
})
