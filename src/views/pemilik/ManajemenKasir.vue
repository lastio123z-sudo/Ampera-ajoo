<template>
  <div class="page-layout">
    <SideBar />
    <div class="page-content">
      <NavBar />
      <div class="page-inner">
        <div class="page-header">
          <div>
            <h2>Manajemen Kasir</h2>
            <p class="text-muted">Kelola akun kasir Ampera Ajo</p>
          </div>
          <BaseButton variant="primary" @click="openAdd">+ Tambah Kasir</BaseButton>
        </div>

        <div class="card">
          <BaseTable :columns="columns" :rows="usersStore.kasirList" empty-text="Belum ada kasir">
            <template #nama="{ value }">
              <div class="cashier-name-cell">
                <span>{{ value.charAt(0).toUpperCase() }}</span>
                <strong>{{ value }}</strong>
              </div>
            </template>
            <template #aksi="{ row }">
              <div class="action-btns">
                <BaseButton size="sm" variant="outline" @click="openEdit(row)">Edit</BaseButton>
                <BaseButton size="sm" variant="danger" @click="confirmDelete(row)">Hapus</BaseButton>
              </div>
            </template>
          </BaseTable>
        </div>

        <!-- Form Modal -->
        <BaseModal v-model="showModal" :title="isEditing ? 'Edit Kasir' : 'Tambah Kasir'">
          <form class="kasir-form" @submit.prevent="handleSubmit">
            <div v-if="alertMsg" class="form-alert">{{ alertMsg }}</div>
            <BaseInput v-model="form.nama" label="Nama Lengkap" required :error="formErrors.nama" placeholder="Nama kasir" />
            <BaseInput v-model="form.username" label="Username" required :error="formErrors.username" placeholder="Username login" />
            <BaseInput
              v-model="form.password"
              type="password"
              :label="isEditing ? 'Password Baru (kosongkan jika tidak diubah)' : 'Password'"
              :required="!isEditing"
              :error="formErrors.password"
              placeholder="Minimal 6 karakter"
            />
            <div class="form-actions">
              <BaseButton type="button" variant="ghost" @click="showModal = false">Batal</BaseButton>
              <BaseButton type="submit" variant="primary" :loading="isSaving">
                {{ isEditing ? 'Simpan Perubahan' : 'Tambah Kasir' }}
              </BaseButton>
            </div>
          </form>
        </BaseModal>

        <!-- Confirm Delete Modal -->
        <BaseModal v-model="showDeleteModal" title="Konfirmasi Hapus">
          <p>Yakin ingin menghapus akun kasir <strong>{{ deleteTarget?.nama }}</strong>?</p>
          <p class="text-danger mt-2" style="font-size:12px">Tindakan ini tidak dapat dibatalkan.</p>
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
import { ref, reactive } from 'vue'
import SideBar from '@/components/common/SideBar.vue'
import NavBar from '@/components/common/NavBar.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { useUsersStore } from '@/stores/users'

const usersStore = useUsersStore()

const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const isSaving = ref(false)
const editingId = ref(null)
const deleteTarget = ref(null)
const alertMsg = ref('')

const form = reactive({ nama: '', username: '', password: '' })
const formErrors = reactive({ nama: '', username: '', password: '' })

const columns = [
  { key: 'nama', label: 'Nama Lengkap' },
  { key: 'username', label: 'Username' },
  { key: 'role', label: 'Peran' },
  { key: 'aksi', label: 'Aksi' }
]

function resetForm() {
  Object.assign(form, { nama: '', username: '', password: '' })
  Object.assign(formErrors, { nama: '', username: '', password: '' })
  alertMsg.value = ''
}

function openAdd() {
  isEditing.value = false
  editingId.value = null
  resetForm()
  showModal.value = true
}

function openEdit(user) {
  isEditing.value = true
  editingId.value = user.id
  Object.assign(form, { nama: user.nama, username: user.username, password: '' })
  Object.assign(formErrors, { nama: '', username: '', password: '' })
  alertMsg.value = ''
  showModal.value = true
}

function validate() {
  formErrors.nama = form.nama ? '' : 'Nama wajib diisi'
  formErrors.username = form.username ? '' : 'Username wajib diisi'
  formErrors.password = (!isEditing.value && !form.password)
    ? 'Password wajib diisi'
    : (form.password && form.password.length < 6 ? 'Password minimal 6 karakter' : '')
  return !Object.values(formErrors).some(e => e)
}

async function handleSubmit() {
  if (!validate()) return
  isSaving.value = true
  alertMsg.value = ''
  try {
    if (isEditing.value) {
      await usersStore.updateKasir(editingId.value, { ...form })
    } else {
      await usersStore.addKasir({ ...form })
    }
    showModal.value = false
    resetForm()
  } catch (err) {
    alertMsg.value = err.message
  } finally {
    isSaving.value = false
  }
}

function confirmDelete(user) {
  deleteTarget.value = user
  showDeleteModal.value = true
}

async function handleDelete() {
  try {
    await usersStore.deleteKasir(deleteTarget.value.id)
    showDeleteModal.value = false
  } catch (err) {
    alertMsg.value = err.message
  }
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
.page-header h2 { font-size: 20px; font-weight: 700; }
.action-btns { display: flex; gap: 6px; }
.cashier-name-cell { display: flex; align-items: center; gap: 10px; }
.cashier-name-cell > span { display: grid; width: 34px; height: 34px; place-items: center; border-radius: 11px; background: #eaf1e7; color: #315940; font-size: 11px; font-weight: 700; }
.cashier-name-cell strong { color: #35493a; font-size: 10px; }
.kasir-form { display: flex; flex-direction: column; gap: 14px; }
.form-actions { display: flex; gap: 8px; justify-content: flex-end; padding-top: 8px; border-top: 1px solid var(--color-border); }
.form-alert { background: #fce4e4; color: var(--color-danger); padding: 10px; border-radius: var(--radius-sm); font-size: 13px; }
</style>
