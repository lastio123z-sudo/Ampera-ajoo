<template>
  <div class="page-layout">
    <SideBar />
    <div class="page-content">
      <NavBar />
      <div class="page-inner">
        <div class="page-header">
          <div>
            <h2>Pesanan Online</h2>
            <p class="text-muted">Pesanan pelanggan yang menunggu pembayaran saat diambil</p>
          </div>
          <BaseButton variant="outline" :loading="isLoading" @click="loadOrders">Muat Ulang</BaseButton>
        </div>

        <p v-if="errorMessage" class="orders-error">{{ errorMessage }}</p>
        <p v-if="isLoading && !orders.length" class="orders-empty">Memuat pesanan...</p>
        <div v-else-if="!pendingOrders.length" class="card orders-empty">
          Belum ada pesanan yang menunggu pembayaran.
        </div>

        <div v-else class="orders-list">
          <article v-for="order in pendingOrders" :key="order.id" class="card order-card">
            <div class="order-card__header">
              <div>
                <h3>{{ order.customerName }}</h3>
                <p>{{ order.nomorNota }} · {{ formatTanggal(order.tanggal) }}</p>
              </div>
              <span class="badge badge-warning">Menunggu Pembayaran</span>
            </div>
            <div class="order-card__items">
              <div v-for="item in order.items" :key="item.produkId" class="order-card__item">
                <span>{{ item.nama }} × {{ item.jumlah }}</span>
                <span>{{ formatHarga(item.subtotal) }}</span>
              </div>
            </div>
            <div class="order-card__total">
              <strong>Total</strong>
              <strong>{{ formatHarga(order.total) }}</strong>
            </div>
            <div class="order-card__payment">
              <label :for="`payment-${order.id}`">Uang diterima (Rp)</label>
              <input
                :id="`payment-${order.id}`"
                v-model="paymentAmounts[order.id]"
                type="number"
                min="1"
                :placeholder="String(order.total)"
              />
              <BaseButton
                variant="success"
                :loading="processingId === order.id"
                :disabled="Number(paymentAmounts[order.id]) < order.total"
                @click="markAsPaid(order)"
              >
                Tandai Dibayar
              </BaseButton>
            </div>
          </article>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue'
import SideBar from '@/components/common/SideBar.vue'
import NavBar from '@/components/common/NavBar.vue'
import BaseButton from '@/components/common/BaseButton.vue'
import { useAuthStore } from '@/stores/auth'
import { useTransactionsStore } from '@/stores/transactions'
import { completeOrderPayment, fetchOrders } from '@/services/orders'

const authStore = useAuthStore()
const transactionsStore = useTransactionsStore()
const orders = ref([])
const isLoading = ref(false)
const processingId = ref('')
const errorMessage = ref('')
const paymentAmounts = reactive({})
const pendingOrders = computed(() => orders.value.filter(order => order.status === 'menunggu_pembayaran'))

let refreshTimer

onMounted(() => {
  loadOrders()
  refreshTimer = setInterval(loadOrders, 5000)
})

onUnmounted(() => clearInterval(refreshTimer))

async function loadOrders() {
  if (isLoading.value) return
  isLoading.value = true
  try {
    orders.value = await fetchOrders()
    orders.value.forEach(order => {
      if (paymentAmounts[order.id] === undefined) paymentAmounts[order.id] = String(order.total)
    })
    errorMessage.value = ''
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    isLoading.value = false
  }
}

async function markAsPaid(order) {
  const bayar = Number(paymentAmounts[order.id])
  if (!Number.isFinite(bayar) || bayar < order.total) {
    errorMessage.value = 'Jumlah uang diterima harus minimal sebesar total pesanan.'
    return
  }

  processingId.value = order.id
  errorMessage.value = ''
  try {
    const paidOrder = await completeOrderPayment(order.id, bayar)
    await transactionsStore.createTransaction({
      kasir: authStore.currentUser,
      items: paidOrder.items,
      total: paidOrder.total,
      bayar: paidOrder.bayar,
      nomorNota: paidOrder.nomorNota
    })
    await loadOrders()
  } catch (error) {
    errorMessage.value = error.message
  } finally {
    processingId.value = ''
  }
}

function formatHarga(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

function formatTanggal(value) {
  return new Date(value).toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 22px; }
.page-header h2 { font-size: 20px; font-weight: 700; }
.orders-list { display: grid; gap: 14px; }
.order-card { padding: 20px; transition: box-shadow 0.2s, transform 0.2s; }
.order-card:hover { box-shadow: var(--shadow-md); transform: translateY(-2px); }
.order-card__header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.order-card__header h3 { color: #2f4937; font-size: 14px; font-weight: 650; }
.order-card__header p { margin-top: 5px; color: var(--color-text-muted); font-size: 10px; }
.order-card__items { margin-top: 15px; display: grid; gap: 0; padding: 5px 13px; border-radius: 12px; background: #f8f9f5; }
.order-card__item, .order-card__total { display: flex; justify-content: space-between; gap: 12px; padding: 8px 0; color: #647065; font-size: 10px; }
.order-card__item + .order-card__item { border-top: 1px solid #e9ede5; }
.order-card__item span:last-child { color: #3c5742; font-weight: 600; }
.order-card__total { margin-top: 10px; padding: 0 0 12px; border-bottom: 1px solid #edf0e9; color: #3d5142; font-size: 12px; }
.order-card__payment { display: flex; align-items: end; gap: 10px; margin-top: 15px; }
.order-card__payment label { display: flex; flex-direction: column; gap: 5px; color: #5e6b60; font-size: 9px; font-weight: 600; }
.order-card__payment input { width: 190px; padding: 9px 11px; border: 1px solid #dfe5dc; border-radius: 10px; background: #fff; font-size: 11px; }
.order-card__payment input:focus { border-color: #83a18b; outline: 3px solid rgba(45, 106, 79, 0.11); }
.orders-empty { border: 1px dashed #dfe5dc; background: #fafbf8; text-align: center; padding: 34px; color: var(--color-text-muted); font-size: 11px; }
.orders-error { margin-bottom: 12px; padding: 11px 14px; border: 1px solid #f4cdcd; border-radius: 11px; background: #fff3f3; color: var(--color-danger); font-size: 10px; }
@media (max-width: 640px) {
  .order-card__header { flex-direction: column; }
  .order-card__payment { align-items: stretch; flex-direction: column; }
  .order-card__payment input { width: 100%; }
}
</style>
