<template>
  <div class="page-layout">
    <SideBar />
    <div class="page-content">
      <NavBar />
      <div class="page-inner">
        <div class="page-header">
          <div>
            <h2>Manajemen Produk</h2>
            <p class="text-muted">Kelola menu makanan Ampera Ajo</p>
          </div>
          <BaseButton variant="primary" @click="openAdd">+ Tambah Produk</BaseButton>
        </div>

        <!-- Filter Bar -->
        <div class="filter-bar card mb-3">
          <BaseInput v-model="searchQuery" placeholder="Cari produk..." />
          <BaseInput
            v-model="filterKategori"
            type="select"
            :options="[{ value: '', label: 'Semua Kategori' }, ...kategoriOptions]"
            placeholder="Semua Kategori"
          />
        </div>

        <div class="card">
          <BaseTable :columns="columns" :rows="filteredProducts" empty-text="Tidak ada produk">
            <template #nama="{ row }">
              <div class="product-name-cell">
                <span class="product-name-cell__icon">🍽️</span>
                <span class="product-name-cell__copy">
                  <strong>{{ row.nama }}</strong>
                  <small>{{ row.deskripsi || 'Menu Ampera Ajo' }}</small>
                </span>
              </div>
            </template>
            <template #harga="{ value }">{{ formatHarga(value) }}</template>
            <template #tersedia="{ row }">
              <span :class="['badge', row.tersedia ? 'badge-success' : 'badge-danger']">
                {{ row.tersedia ? 'Tersedia' : 'Habis' }}
              </span>
            </template>
            <template #aksi="{ row }">
              <div class="action-btns">
                <BaseButton size="sm" variant="outline" @click="openEdit(row)">Edit</BaseButton>
                <BaseButton size="sm" variant="warning" @click="productsStore.toggleKetersediaan(row.id)">
                  {{ row.tersedia ? 'Nonaktif' : 'Aktif' }}
                </BaseButton>
                <BaseButton size="sm" variant="danger" @click="confirmDelete(row)">Hapus</BaseButton>
              </div>
            </template>
          </BaseTable>
        </div>

        <!-- Form Modal -->
        <BaseModal v-model="showModal" :title="isEditing ? 'Edit Produk' : 'Tambah Produk'">
          <form class="product-form" @submit.prevent="handleSubmit">
            <BaseInput v-model="form.nama" label="Nama Produk" required :error="formErrors.nama" />
            <BaseInput v-model="form.kategori" label="Kategori" required :error="formErrors.kategori"
              type="select"
              :options="[
                { value: 'Nasi', label: 'Nasi' },
                { value: 'Lauk', label: 'Lauk' },
                { value: 'Sayur', label: 'Sayur' },
                { value: 'Sambal', label: 'Sambal' },
                { value: 'Minuman', label: 'Minuman' },
                { value: 'Lainnya', label: 'Lainnya' }
              ]"
              placeholder="Pilih Kategori"
            />
            <BaseInput v-model="form.harga" type="number" label="Harga" prefix="Rp" required :error="formErrors.harga" />
            <BaseInput v-model="form.stok" type="number" label="Stok" required :error="formErrors.stok" />
            <BaseInput v-model="form.deskripsi" type="textarea" label="Deskripsi" />
            <BaseInput
              v-model="form.gambar"
              type="url"
              label="URL Gambar Menu"
              placeholder="https://contoh.com/gambar-menu.jpg"
              hint="Gunakan tautan HTTPS langsung ke file gambar, bukan halaman hasil pencarian Google."
              :error="formErrors.gambar"
            />
            <div class="form-check">
              <input type="checkbox" id="tersedia" v-model="form.tersedia" />
              <label for="tersedia">Tersedia</label>
            </div>
            <div class="form-actions">
              <BaseButton type="button" variant="ghost" @click="showModal = false">Batal</BaseButton>
              <BaseButton type="submit" variant="primary" :loading="isSaving">
                {{ isEditing ? 'Simpan Perubahan' : 'Tambah Produk' }}
              </BaseButton>
            </div>
          </form>
        </BaseModal>

        <!-- Confirm Delete Modal -->
        <BaseModal v-model="showDeleteModal" title="Konfirmasi Hapus">
          <p>Yakin ingin menghapus produk <strong>{{ deleteTarget?.nama }}</strong>?</p>
          <template #footer>
            <BaseButton variant="ghost" @click="showDeleteModal = false">Batal</BaseButton>
            <BaseButton variant="danger" @click="handleDelete">Hapus</BaseButton>
          </template>
        </BaseModal>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import SideBar from '@/components/common/SideBar.vue'
import NavBar from '@/components/common/NavBar.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { useProductsStore } from '@/stores/products'

const productsStore = useProductsStore()

const searchQuery = ref('')
const filterKategori = ref('')
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const editingId = ref(null)
const deleteTarget = ref(null)

const form = reactive({ nama: '', kategori: '', harga: '', stok: '', deskripsi: '', gambar: '', tersedia: true })
const formErrors = reactive({ nama: '', kategori: '', harga: '', stok: '', gambar: '' })

const columns = [
  { key: 'nama', label: 'Nama Produk' },
  { key: 'kategori', label: 'Kategori' },
  { key: 'harga', label: 'Harga' },
  { key: 'stok', label: 'Stok' },
  { key: 'tersedia', label: 'Status' },
  { key: 'aksi', label: 'Aksi' }
]

const kategoriOptions = computed(() =>
  productsStore.kategoris.map(k => ({ value: k, label: k }))
)

const filteredProducts = computed(() => {
  return productsStore.products.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchKat = !filterKategori.value || p.kategori === filterKategori.value
    return matchSearch && matchKat
  })
})

function formatHarga(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
}

function resetForm() {
  Object.assign(form, { nama: '', kategori: '', harga: '', stok: '', deskripsi: '', gambar: '', tersedia: true })
  Object.assign(formErrors, { nama: '', kategori: '', harga: '', stok: '', gambar: '' })
}

function openAdd() {
  isEditing.value = false
  editingId.value = null
  resetForm()
  showModal.value = true
}

function openEdit(product) {
  isEditing.value = true
  editingId.value = product.id
  Object.assign(form, { gambar: '', ...product })
  showModal.value = true
}

function validate() {
  formErrors.nama = form.nama ? '' : 'Nama produk wajib diisi'
  formErrors.kategori = form.kategori ? '' : 'Kategori wajib dipilih'
  formErrors.harga = form.harga > 0 ? '' : 'Harga harus lebih dari 0'
  formErrors.stok = form.stok >= 0 ? '' : 'Stok tidak valid'
  formErrors.gambar = !form.gambar || /^https:\/\/\S+$/i.test(form.gambar.trim())
    ? ''
    : 'URL gambar harus diawali https://'
  return !Object.values(formErrors).some(e => e)
}

async function handleSubmit() {
  if (!validate()) return
  isSaving.value = true
  try {
    if (isEditing.value) {
      await productsStore.updateProduct(editingId.value, { ...form })
    } else {
      await productsStore.addProduct({ ...form })
    }
    showModal.value = false
    resetForm()
  } finally {
    isSaving.value = false
  }
}

function confirmDelete(product) {
  deleteTarget.value = product
  showDeleteModal.value = true
}

async function handleDelete() {
  await productsStore.deleteProduct(deleteTarget.value.id)
  showDeleteModal.value = false
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.page-header h2 { font-size: 20px; font-weight: 700; }
.filter-bar { display: flex; gap: 10px; }
.action-btns { display: flex; gap: 6px; flex-wrap: wrap; }
.product-name-cell { display: flex; min-width: 175px; align-items: center; gap: 10px; }
.product-name-cell__icon { display: grid; width: 35px; height: 35px; flex: 0 0 35px; place-items: center; border-radius: 11px; background: #f5eddf; font-size: 17px; }
.product-name-cell__copy { display: flex; min-width: 0; flex-direction: column; gap: 2px; }
.product-name-cell__copy strong { color: #35493a; font-size: 10px; }
.product-name-cell__copy small { max-width: 280px; overflow: hidden; color: #8a9389; font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }
.product-form { display: flex; flex-direction: column; gap: 14px; }
.form-check { display: flex; align-items: center; gap: 8px; }
.form-check input { width: 16px; height: 16px; cursor: pointer; accent-color: var(--color-primary); }
.form-check label { font-size: 14px; cursor: pointer; }
.form-actions { display: flex; gap: 8px; justify-content: flex-end; padding-top: 8px; border-top: 1px solid var(--color-border); }
</style>
