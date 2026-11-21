<template>
  <div class="page-layout">
    <SideBar />
    <div class="page-content">
      <NavBar />
      <div class="page-inner">
        <div class="page-header">
          <div>
            <h2>Riwayat Transaksi</h2>
            <p class="text-muted">Daftar transaksi hari ini</p>
          </div>
          <div class="page-header__summary">
            <span>Total hari ini: <strong class="text-primary">{{ formatHarga(todayTotal) }}</strong></span>
          </div>
        </div>

        <div class="filter-bar card mb-3">
          <BaseInput v-model="searchNota" placeholder="Cari no. nota..." />
        </div>

        <div class="card">
          <BaseTable :columns="columns" :rows="filteredTransactions" empty-text="Belum ada transaksi hari ini">
            <template #total="{ value }">{{ formatHarga(value) }}</template>
            <template #tanggal="{ value }">{{ formatTanggal(value) }}</template>
            <template #items="{ value }">{{ value.length }} item</template>
            <template #status><span class="badge badge-success">Selesai</span></template>
            <template #aksi="{ row }">
              <BaseButton size="sm" variant="outline" @click="showDetail(row)">Detail</BaseButton>
            </template>
          </BaseTable>
        </div>

        <!-- Detail Modal -->
        <BaseModal v-model="showDetailModal" title="Detail Transaksi" width="520px">
          <div v-if="selectedTx" class="detail-modal">
            <div class="detail-meta">
              <div class="detail-row"><span>No. Nota</span><strong>{{ selectedTx.nomorNota }}</strong></div>
              <div class="detail-row"><span>Kasir</span><span>{{ selectedTx.kasir.nama }}</span></div>
              <div class="detail-row"><span>Tanggal</span><span>{{ formatTanggal(selectedTx.tanggal) }}</span></div>
            </div>
            <table class="detail-items">
              <thead><tr><th>Item</th><th>Qty</th><th>Harga</th><th>Subtotal</th></tr></thead>
              <tbody>
                <tr v-for="item in selectedTx.items" :key="item.produkId">
                  <td>{{ item.nama }}</td>
                  <td>{{ item.jumlah }}</td>
                  <td>{{ formatHarga(item.harga) }}</td>
                  <td>{{ formatHarga(item.subtotal) }}</td>
                </tr>
              </tbody>
            </table>
            <div class="detail-totals">
              <div class="detail-total-row"><span>Total</span><strong>{{ formatHarga(selectedTx.total) }}</strong></div>
              <div class="detail-total-row"><span>Bayar</span><span>{{ formatHarga(selectedTx.bayar) }}</span></div>
              <div class="detail-total-row text-success"><span>Kembalian</span><strong>{{ formatHarga(selectedTx.kembalian) }}</strong></div>
            </div>
          </div>
        </BaseModal>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import SideBar from '@/components/common/SideBar.vue'
import NavBar from '@/components/common/NavBar.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseModal from '@/components/common/BaseModal.vue'
import { useTransactionsStore } from '@/stores/transactions'
import { useAuthStore } from '@/stores/auth'

const transactionsStore = useTransactionsStore()
const authStore = useAuthStore()

const searchNota = ref('')
const showDetailModal = ref(false)
const selectedTx = ref(null)

const columns = [
  { key: 'nomorNota', label: 'No. Nota' },
  { key: 'items', label: 'Item' },
  { key: 'total', label: 'Total' },
  { key: 'tanggal', label: 'Waktu' },
  { key: 'status', label: 'Status' },
  { key: 'aksi', label: 'Aksi' }
]

const myTodayTransactions = computed(() => {
  const myId = authStore.currentUser?.id
  return transactionsStore.transaksiHariIni.filter(t => t.kasir.id === myId)
})

const filteredTransactions = computed(() =>
  myTodayTransactions.value.filter(t =>
    !searchNota.value || t.nomorNota.toLowerCase().includes(searchNota.value.toLowerCase())
  )
)

const todayTotal = computed(() =>
  myTodayTransactions.value.reduce((sum, t) => sum + t.total, 0)
)

function formatHarga(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
}

function formatTanggal(iso) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function showDetail(tx) {
  selectedTx.value = tx
  showDetailModal.value = true
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; margin-bottom: 22px; }
.page-header h2 { font-size: 20px; font-weight: 700; }
.page-header__summary { padding: 9px 13px; border: 1px solid #e1e9de; border-radius: 11px; background: #f7faf4; color: var(--color-text-muted); font-size: 10px; }
.filter-bar { display: flex; gap: 10px; }
.detail-meta { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.detail-row { display: flex; justify-content: space-between; padding: 7px 0; border-bottom: 1px solid #edf0e9; color: #637065; font-size: 11px; }
.detail-items { width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 16px; }
.detail-items th { background: #f1f4ed; padding: 9px; color: #607065; text-align: left; }
.detail-items td { padding: 8px; border-bottom: 1px solid var(--color-border); }
.detail-totals { background: #f5f8f1; padding: 13px; border: 1px solid #e9eee5; border-radius: 11px; }
.detail-total-row { display: flex; justify-content: space-between; padding: 5px 0; color: #657367; font-size: 11px; }
@media (max-width: 520px) { .page-header__summary { align-self: flex-start; } }
</style>
