<template>
  <div class="page-layout">
    <SideBar />
    <div class="page-content">
      <NavBar />
      <div class="page-inner">
        <!-- Welcome -->
        <div class="welcome-banner">
          <div>
            <h2>Selamat Datang, {{ authStore.currentUser?.nama }} 👋</h2>
            <p>{{ today }} | {{ time }}</p>
          </div>
          <router-link to="/kasir/transaksi-baru">
            <BaseButton variant="secondary" size="lg">+ Transaksi Baru</BaseButton>
          </router-link>
        </div>

        <!-- Stats -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card__icon">🧾</div>
            <div>
              <p class="stat-label">Transaksi Hari Ini</p>
              <p class="stat-value">{{ myTodayTransactions.length }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon">💰</div>
            <div>
              <p class="stat-label">Total Penjualan Hari Ini</p>
              <p class="stat-value">{{ formatHarga(myTodayTotal) }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon">🍽️</div>
            <div>
              <p class="stat-label">Menu Tersedia</p>
              <p class="stat-value">{{ productsStore.availableProducts.length }}</p>
            </div>
          </div>
        </div>

        <!-- Recent Transactions -->
        <div class="card">
          <div class="card-header">
            <h3>Transaksi Terbaru Saya</h3>
            <router-link to="/kasir/riwayat" class="card-link">Lihat Semua →</router-link>
          </div>
          <BaseTable :columns="cols" :rows="myTodayTransactions.slice(0, 5)" empty-text="Belum ada transaksi hari ini">
            <template #total="{ value }">{{ formatHarga(value) }}</template>
            <template #tanggal="{ value }">{{ formatTanggal(value) }}</template>
            <template #status><span class="badge badge-success">Selesai</span></template>
          </BaseTable>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import SideBar from '@/components/common/SideBar.vue'
import NavBar from '@/components/common/NavBar.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useTransactionsStore } from '@/stores/transactions'
import { useProductsStore } from '@/stores/products'

const authStore = useAuthStore()
const transactionsStore = useTransactionsStore()
const productsStore = useProductsStore()

const time = ref('')
const today = computed(() =>
  new Date().toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
)

let timer
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})
onUnmounted(() => clearInterval(timer))

function updateTime() {
  time.value = new Date().toLocaleTimeString('id-ID')
}

const myTodayTransactions = computed(() => {
  const myId = authStore.currentUser?.id
  return transactionsStore.transaksiHariIni.filter(t => t.kasir.id === myId)
})

const myTodayTotal = computed(() =>
  myTodayTransactions.value.reduce((sum, t) => sum + t.total, 0)
)

const cols = [
  { key: 'nomorNota', label: 'No. Nota' },
  { key: 'total', label: 'Total' },
  { key: 'tanggal', label: 'Waktu' },
  { key: 'status', label: 'Status' }
]

function formatHarga(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
}

function formatTanggal(iso) {
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.welcome-banner {
  position: relative; overflow: hidden;
  background:
    radial-gradient(circle at 90% 15%, rgba(233, 178, 112, 0.2), transparent 28%),
    linear-gradient(110deg, #1d4431, #2e6948);
  color: #fff; padding: 24px 26px; border-radius: 18px;
  display: flex; justify-content: space-between; align-items: center;
  gap: 18px; margin-bottom: 23px;
  box-shadow: 0 12px 28px rgba(34, 65, 44, 0.14);
}
.welcome-banner h2 { font-family: Georgia, 'Times New Roman', serif; font-size: 23px; font-weight: 500; letter-spacing: -0.4px; }
.welcome-banner p { font-size: 10px; color: rgba(255,255,255,0.68); margin-top: 6px; }
.stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 22px; }
.stat-card {
  background: var(--color-white); border: 1px solid rgba(220, 226, 216, 0.88); border-radius: 17px;
  box-shadow: var(--shadow-sm); padding: 18px;
  display: flex; align-items: center; gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.stat-card__icon { display: grid; width: 44px; height: 44px; place-items: center; border-radius: 14px; background: #edf3eb; font-size: 21px; }
.stat-label { font-size: 9px; color: var(--color-text-muted); }
.stat-value { margin-top: 3px; font-size: 18px; font-weight: 700; color: #2b4635; letter-spacing: -0.4px; }
.card-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 16px; }
.card-header h3 { font-size: 13px; font-weight: 650; color: #344a39; }
.card-link { font-size: 10px; font-weight: 600; color: var(--color-primary); text-decoration: none; }
@media (max-width: 860px) { .stats-grid { grid-template-columns: 1fr; } }
@media (max-width: 520px) { .welcome-banner { align-items: flex-start; flex-direction: column; padding: 20px; } .welcome-banner h2 { font-size: 20px; } }
</style>
