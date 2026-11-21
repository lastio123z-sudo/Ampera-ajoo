<template>
  <div class="page-layout">
    <SideBar />
    <div class="page-content">
      <NavBar />
      <div class="page-inner">
        <div class="page-header">
          <div>
            <h2>Laporan Penjualan</h2>
            <p class="text-muted">Riwayat transaksi dan rekap pendapatan</p>
          </div>
        </div>

        <!-- Summary Cards -->
        <div class="summary-row mb-4">
          <div class="summary-card">
            <span class="summary-card__label">Total Semua Pendapatan</span>
            <span class="summary-card__value">{{ formatHarga(transactionsStore.totalPendapatan) }}</span>
          </div>
          <div class="summary-card">
            <span class="summary-card__label">Pendapatan Bulan Ini</span>
            <span class="summary-card__value">{{ formatHarga(transactionsStore.pendapatanBulanIni) }}</span>
          </div>
          <div class="summary-card">
            <span class="summary-card__label">Transaksi Bulan Ini</span>
            <span class="summary-card__value">{{ transactionsStore.transaksiBulanIni.length }}</span>
          </div>
          <div class="summary-card">
            <span class="summary-card__label">Total Transaksi</span>
            <span class="summary-card__value">{{ transactionsStore.transactions.length }}</span>
          </div>
        </div>

        <!-- Filter -->
        <div class="filter-bar card mb-3">
          <BaseInput v-model="searchNota" placeholder="Cari no. nota..." />
          <BaseInput v-model="filterKasir" type="select"
            :options="[{ value: '', label: 'Semua Kasir' }, ...kasirOptions]"
            placeholder="Semua Kasir"
          />
          <BaseInput v-model="filterTanggalDari" type="date" label="" placeholder="Dari tanggal" />
          <BaseInput v-model="filterTanggalSampai" type="date" label="" placeholder="Sampai tanggal" />
        </div>

        <div class="card">
          <BaseTable :columns="columns" :rows="filteredTransactions" empty-text="Tidak ada transaksi">
            <template #total="{ value }">{{ formatHarga(value) }}</template>
            <template #kasir="{ row }">{{ row.kasir.nama }}</template>
            <template #tanggal="{ value }">{{ formatTanggal(value) }}</template>
            <template #items="{ value }">{{ value.length }} item</template>
            <template #status="{ value }">
              <span class="badge badge-success">{{ value }}</span>
            </template>
            <template #aksi="{ row }">
              <BaseButton size="sm" variant="outline" @click="showDetail(row)">Detail</BaseButton>
            </template>
          </BaseTable>
        </div>

        <!-- Detail Modal -->
        <BaseModal v-model="showDetailModal" title="Detail Transaksi" width="520px">
          <div v-if="selectedTransaction" class="detail-modal">
            <div class="detail-meta">
              <div class="detail-meta-row"><span>No. Nota</span><strong>{{ selectedTransaction.nomorNota }}</strong></div>
              <div class="detail-meta-row"><span>Kasir</span><span>{{ selectedTransaction.kasir.nama }}</span></div>
              <div class="detail-meta-row"><span>Tanggal</span><span>{{ formatTanggal(selectedTransaction.tanggal) }}</span></div>
              <div class="detail-meta-row"><span>Status</span><span class="badge badge-success">{{ selectedTransaction.status }}</span></div>
            </div>
            <table class="detail-items-table">
              <thead><tr><th>Item</th><th>Qty</th><th>Harga</th><th>Subtotal</th></tr></thead>
              <tbody>
                <tr v-for="item in selectedTransaction.items" :key="item.produkId">
                  <td>{{ item.nama }}</td>
                  <td>{{ item.jumlah }}</td>
                  <td>{{ formatHarga(item.harga) }}</td>
                  <td>{{ formatHarga(item.subtotal) }}</td>
                </tr>
              </tbody>
            </table>
            <div class="detail-totals">
              <div class="detail-totals-row"><span>Total</span><strong>{{ formatHarga(selectedTransaction.total) }}</strong></div>
              <div class="detail-totals-row"><span>Bayar</span><span>{{ formatHarga(selectedTransaction.bayar) }}</span></div>
              <div class="detail-totals-row"><span>Kembalian</span><span>{{ formatHarga(selectedTransaction.kembalian) }}</span></div>
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

const transactionsStore = useTransactionsStore()

const searchNota = ref('')
const filterKasir = ref('')
const filterTanggalDari = ref('')
const filterTanggalSampai = ref('')
const showDetailModal = ref(false)
const selectedTransaction = ref(null)

const columns = [
  { key: 'nomorNota', label: 'No. Nota' },
  { key: 'kasir', label: 'Kasir' },
  { key: 'items', label: 'Item' },
  { key: 'total', label: 'Total' },
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'status', label: 'Status' },
  { key: 'aksi', label: 'Aksi' }
]

const kasirOptions = computed(() => {
  const kasirMap = {}
  transactionsStore.transactions.forEach(t => {
    kasirMap[t.kasir.id] = t.kasir.nama
  })
  return Object.entries(kasirMap).map(([value, label]) => ({ value, label }))
})

const filteredTransactions = computed(() => {
  return transactionsStore.transactions.filter(t => {
    const matchNota = !searchNota.value || t.nomorNota.toLowerCase().includes(searchNota.value.toLowerCase())
    const matchKasir = !filterKasir.value || t.kasir.id === filterKasir.value
    const tDate = new Date(t.tanggal)
    const matchDari = !filterTanggalDari.value || tDate >= new Date(filterTanggalDari.value)
    const matchSampai = !filterTanggalSampai.value || tDate <= new Date(filterTanggalSampai.value + 'T23:59:59')
    return matchNota && matchKasir && matchDari && matchSampai
  })
})

function formatHarga(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
}

function formatTanggal(iso) {
  return new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function showDetail(tx) {
  selectedTransaction.value = tx
  showDetailModal.value = true
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; }
.page-header h2 { font-size: 20px; font-weight: 700; }
.summary-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; }
.summary-card {
  position: relative; overflow: hidden;
  background: var(--color-white); border: 1px solid rgba(220, 226, 216, 0.88); border-radius: 16px;
  box-shadow: var(--shadow-sm); padding: 17px;
  display: flex; flex-direction: column; gap: 4px;
  border-top: 3px solid #6f9b74;
}
.summary-card:nth-child(2) { border-top-color: #d7a367; }
.summary-card:nth-child(3) { border-top-color: #7194aa; }
.summary-card:nth-child(4) { border-top-color: #a38cb4; }
.summary-card__label { font-size: 9px; color: var(--color-text-muted); }
.summary-card__value { margin-top: 4px; font-size: 17px; font-weight: 700; color: #2e5038; letter-spacing: -0.3px; }
.filter-bar { display: flex; gap: 10px; flex-wrap: wrap; }
.detail-meta { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.detail-meta-row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; border-bottom: 1px solid var(--color-border); }
.detail-items-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 16px; }
.detail-items-table th { background: #f1f8f4; padding: 8px; text-align: left; font-weight: 500; }
.detail-items-table td { padding: 8px; border-bottom: 1px solid var(--color-border); }
.detail-totals { background: #f8f9fa; padding: 12px; border-radius: var(--radius-sm); display: flex; flex-direction: column; gap: 6px; }
.detail-totals-row { display: flex; justify-content: space-between; font-size: 14px; }
@media (max-width: 1024px) { .summary-row { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .summary-row { gap: 9px; } .summary-card { padding: 13px; } .summary-card__value { font-size: 14px; } }
</style>
