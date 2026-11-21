<template>
  <div class="page-layout">
    <SideBar />
    <div class="page-content">
      <NavBar />
      <div class="page-inner">
        <div class="owner-welcome">
          <div>
            <span class="owner-welcome__eyebrow">RUANG PEMILIK</span>
            <h2>Ringkasan usaha hari ini</h2>
            <p>Pantau penjualan dan menu Ampera Ajo dalam satu tempat.</p>
          </div>
          <router-link to="/pemilik/produk" class="owner-welcome__link">
            Kelola menu <span>→</span>
          </router-link>
        </div>

        <!-- Stats Row -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--green">💰</div>
            <div class="stat-card__info">
              <p class="stat-card__label">Pendapatan Hari Ini</p>
              <p class="stat-card__value">{{ formatHarga(transactionsStore.pendapatanHariIni) }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--orange">📅</div>
            <div class="stat-card__info">
              <p class="stat-card__label">Pendapatan Bulan Ini</p>
              <p class="stat-card__value">{{ formatHarga(transactionsStore.pendapatanBulanIni) }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--blue">🧾</div>
            <div class="stat-card__info">
              <p class="stat-card__label">Total Transaksi</p>
              <p class="stat-card__value">{{ transactionsStore.transactions.length }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-card__icon stat-card__icon--purple">🍽️</div>
            <div class="stat-card__info">
              <p class="stat-card__label">Total Produk</p>
              <p class="stat-card__value">{{ productsStore.totalProducts }}</p>
            </div>
          </div>
        </div>

        <div class="dashboard-grid">
          <!-- Transaksi Terbaru -->
          <div class="card">
            <div class="card-header">
              <h3>Transaksi Terbaru</h3>
              <router-link to="/pemilik/laporan" class="card-link">Lihat Semua →</router-link>
            </div>
            <BaseTable :columns="colsTransaksi" :rows="recentTransactions">
              <template #total="{ value }">{{ formatHarga(value) }}</template>
              <template #tanggal="{ value }">{{ formatTanggal(value) }}</template>
              <template #status="{ value }">
                <span class="badge badge-success">{{ value }}</span>
              </template>
            </BaseTable>
          </div>

          <!-- Ringkasan Produk -->
          <div class="card">
            <div class="card-header">
              <h3>Produk Tersedia</h3>
              <router-link to="/pemilik/produk" class="card-link">Kelola →</router-link>
            </div>
            <div class="product-summary">
              <div
                v-for="p in availableProducts.slice(0, 6)"
                :key="p.id"
                class="product-summary-item"
              >
                <span class="product-summary-item__icon">🍽️</span>
                <div>
                  <p class="product-summary-item__name">{{ p.nama }}</p>
                  <p class="product-summary-item__harga">{{ formatHarga(p.harga) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import SideBar from '@/components/common/SideBar.vue'
import NavBar from '@/components/common/NavBar.vue'
import BaseTable from '@/components/common/BaseTable.vue'
import { useTransactionsStore } from '@/stores/transactions'
import { useProductsStore } from '@/stores/products'

const transactionsStore = useTransactionsStore()
const productsStore = useProductsStore()

const recentTransactions = computed(() => transactionsStore.transactions.slice(0, 5))
const availableProducts = computed(() => productsStore.availableProducts)

const colsTransaksi = [
  { key: 'nomorNota', label: 'No. Nota' },
  { key: 'total', label: 'Total' },
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'status', label: 'Status' }
]

function formatHarga(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
}

function formatTanggal(iso) {
  return new Date(iso).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.owner-welcome {
  display: flex; align-items: center; justify-content: space-between; gap: 18px;
  margin-bottom: 22px; padding: 22px 25px; border: 1px solid rgba(255,255,255,0.12);
  border-radius: 18px;
  background:
    radial-gradient(circle at 90% 15%, rgba(233, 178, 112, 0.18), transparent 28%),
    linear-gradient(110deg, #1d4431, #2e6948);
  box-shadow: 0 12px 28px rgba(34, 65, 44, 0.14);
  color: #fff;
}
.owner-welcome__eyebrow { color: #e8c38d; font-size: 8px; font-weight: 700; letter-spacing: 1.4px; }
.owner-welcome h2 { margin-top: 5px; font-family: Georgia, 'Times New Roman', serif; font-size: 24px; font-weight: 500; }
.owner-welcome p { margin-top: 4px; color: rgba(255,255,255,0.68); font-size: 10px; }
.owner-welcome__link { display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 999px; background: #e9b270; color: #27392e; font-size: 10px; font-weight: 700; }
.owner-welcome__link span { font-size: 15px; }
.stats-grid {
  display: grid; grid-template-columns: repeat(4, 1fr);
  gap: 16px; margin-bottom: 24px;
}
.stat-card {
  border: 1px solid rgba(220, 226, 216, 0.88); background: var(--color-white); border-radius: 17px;
  box-shadow: var(--shadow-sm); padding: 18px;
  display: flex; align-items: center; gap: 16px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.stat-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-md); }
.stat-card__icon {
  width: 47px; height: 47px; border-radius: 15px;
  display: flex; align-items: center; justify-content: center;
  font-size: 21px; flex-shrink: 0;
}
.stat-card__icon--green { background: #e3f0e2; }
.stat-card__icon--orange { background: #fbecdc; }
.stat-card__icon--blue { background: #e5eef5; }
.stat-card__icon--purple { background: #eee9f4; }
.stat-card__label { font-size: 10px; color: var(--color-text-muted); margin-bottom: 5px; }
.stat-card__value { font-size: 18px; font-weight: 700; color: #2b4635; letter-spacing: -0.4px; }
.dashboard-grid { display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(290px, 1fr); gap: 18px; }
.card-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 17px; }
.card-header h3 { font-size: 13px; font-weight: 650; color: #344a39; }
.card-link { font-size: 10px; font-weight: 600; color: var(--color-primary); text-decoration: none; }
.product-summary { display: flex; flex-direction: column; gap: 8px; }
.product-summary-item { display: flex; align-items: center; gap: 11px; padding: 10px; border: 1px solid #eef0e9; border-radius: 12px; background: #fafbf8; }
.product-summary-item__icon { display: grid; width: 34px; height: 34px; place-items: center; border-radius: 10px; background: #f5eddf; font-size: 17px; }
.product-summary-item__name { font-size: 10px; font-weight: 600; color: #394a3d; }
.product-summary-item__harga { margin-top: 2px; font-size: 9px; color: var(--color-secondary-dark); }
@media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 768px) { .dashboard-grid { grid-template-columns: 1fr; } }
@media (max-width: 480px) { .owner-welcome { align-items: flex-start; flex-direction: column; padding: 19px; } .owner-welcome h2 { font-size: 21px; } .stats-grid { gap: 10px; } .stat-card { gap: 10px; padding: 13px; } .stat-card__icon { width: 38px; height: 38px; font-size: 17px; } .stat-card__value { font-size: 15px; } }
</style>
