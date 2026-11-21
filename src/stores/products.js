// Ampera Ajo - Products Store
// API Design:
//   GET    /api/v1/products         -> List semua produk
//   POST   /api/v1/products         -> Tambah produk baru
//   PUT    /api/v1/products/:id     -> Update produk
//   DELETE /api/v1/products/:id     -> Hapus produk

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import seedProducts from '@/seed/products.json'

export const useProductsStore = defineStore('products', () => {
  const LS_KEY = 'ampera_products'

  // State
  const products = ref([])
  const isLoading = ref(false)
  const error = ref(null)

  // Computed
  const availableProducts = computed(() => products.value.filter(p => p.tersedia))
  const totalProducts = computed(() => products.value.length)
  const kategoris = computed(() => [...new Set(products.value.map(p => p.kategori))])

  // Init - load from localStorage or seed
  function init() {
    const saved = localStorage.getItem(LS_KEY)
    if (saved) {
      try {
        const savedProducts = JSON.parse(saved)
        products.value = savedProducts.map(savedProduct => {
          const seedProduct = seedProducts.find(seed => seed.id === savedProduct.id)
          return {
            ...savedProduct,
            gambar: savedProduct.gambar || seedProduct?.gambar || ''
          }
        })
        persist()
      } catch {
        products.value = [...seedProducts]
        persist()
      }
    } else {
      products.value = [...seedProducts]
      persist()
    }
  }

  function persist() {
    localStorage.setItem(LS_KEY, JSON.stringify(products.value))
  }

  function generateId() {
    return 'p' + Date.now() + Math.random().toString(36).substr(2, 5)
  }

  // Actions
  async function fetchProducts() {
    isLoading.value = true
    try {
      // Simulasi GET /api/v1/products
      return products.value
    } finally {
      isLoading.value = false
    }
  }

  async function addProduct(data) {
    // Simulasi POST /api/v1/products
    const newProduct = {
      id: generateId(),
      nama: data.nama,
      kategori: data.kategori,
      harga: Number(data.harga),
      stok: Number(data.stok),
      deskripsi: data.deskripsi || '',
      gambar: data.gambar || '',
      tersedia: data.tersedia !== undefined ? data.tersedia : true
    }
    products.value.push(newProduct)
    persist()
    return newProduct
  }

  async function updateProduct(id, data) {
    // Simulasi PUT /api/v1/products/:id
    const idx = products.value.findIndex(p => p.id === id)
    if (idx === -1) throw new Error('Produk tidak ditemukan')
    products.value[idx] = {
      ...products.value[idx],
      ...data,
      harga: Number(data.harga),
      stok: Number(data.stok),
      id
    }
    persist()
    return products.value[idx]
  }

  async function deleteProduct(id) {
    // Simulasi DELETE /api/v1/products/:id
    const idx = products.value.findIndex(p => p.id === id)
    if (idx === -1) throw new Error('Produk tidak ditemukan')
    products.value.splice(idx, 1)
    persist()
  }

  async function toggleKetersediaan(id) {
    const idx = products.value.findIndex(p => p.id === id)
    if (idx === -1) return
    products.value[idx].tersedia = !products.value[idx].tersedia
    persist()
  }

  function getProductById(id) {
    return products.value.find(p => p.id === id)
  }

  function resetToSeed() {
    products.value = [...seedProducts]
    persist()
  }

  // Initialize
  init()

  return {
    products,
    isLoading,
    error,
    availableProducts,
    totalProducts,
    kategoris,
    fetchProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleKetersediaan,
    getProductById,
    resetToSeed
  }
})
