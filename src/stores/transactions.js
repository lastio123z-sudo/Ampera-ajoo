// Ampera Ajo - Transactions Store
// API Design:
//   GET  /api/v1/transactions        -> List semua transaksi
//   POST /api/v1/transactions        -> Buat transaksi baru

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import seedTransactions from '@/seed/transactions.json'

export const useTransactionsStore = defineStore('transactions', () => {
  const LS_KEY = 'ampera_transactions'

  // State
  const transactions = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Computed
  const totalPendapatan = computed(() =>
    transactions.value.reduce((sum, t) => sum + t.total, 0)
  )

  const transaksiBulanIni = computed(() => {
    const now = new Date()
    return transactions.value.filter(t => {
      const d = new Date(t.tanggal)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
  })

  const transaksiHariIni = computed(() => {
    const today = new Date().toDateString()
    return transactions.value.filter(t => new Date(t.tanggal).toDateString() === today)
  })

  const pendapatanHariIni = computed(() =>
    transaksiHariIni.value.reduce((sum, t) => sum + t.total, 0)
  )

  const pendapatanBulanIni = computed(() =>
    transaksiBulanIni.value.reduce((sum, t) => sum + t.total, 0)
  )

  // Init - load from localStorage or seed
  function init() {
    const saved = localStorage.getItem(LS_KEY)
    if (saved) {
      try {
        transactions.value = JSON.parse(saved)
      } catch {
        transactions.value = [...seedTransactions]
        persist()
      }
    } else {
      transactions.value = [...seedTransactions]
      persist()
    }
  }

  function persist() {
    localStorage.setItem(LS_KEY, JSON.stringify(transactions.value))
  }

  function generateNomorNota() {
    const now = new Date()
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
    const existing = transactions.value.filter(t => t.nomorNota.includes(dateStr))
    const seq = String(existing.length + 1).padStart(3, '0')
    return `AA-${dateStr}-${seq}`
  }

  // Actions
  async function fetchTransactions() {
    isLoading.value = true
    try {
      return transactions.value
    } finally {
      isLoading.value = false
    }
  }

  async function createTransaction({ kasir, items, total, bayar, nomorNota }) {
    // Simulasi POST /api/v1/transactions
    const kembalian = bayar - total
    const transaksi = {
      id: 't' + Date.now(),
      nomorNota: nomorNota || generateNomorNota(),
      kasir: { id: kasir.id, nama: kasir.nama },
      items,
      total,
      bayar,
      kembalian,
      status: 'selesai',
      tanggal: new Date().toISOString()
    }
    transactions.value.unshift(transaksi)
    persist()
    return transaksi
  }

  function getTransactionByNota(nomorNota) {
    return transactions.value.find(t => t.nomorNota === nomorNota) || null
  }

  function getPendapatanPerBulan() {
    const data = {}
    transactions.value.forEach(t => {
      const d = new Date(t.tanggal)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      data[key] = (data[key] || 0) + t.total
    })
    return data
  }

  // Initialize
  init()

  return {
    transactions,
    isLoading,
    error,
    totalPendapatan,
    transaksiBulanIni,
    transaksiHariIni,
    pendapatanHariIni,
    pendapatanBulanIni,
    fetchTransactions,
    createTransaction,
    getTransactionByNota,
    getPendapatanPerBulan
  }
})
