<template>
  <div class="page-layout">
    <SideBar />
    <div class="page-content">
      <NavBar />
      <div class="page-inner">
        <div class="page-header">
          <div>
            <h2>Transaksi Baru</h2>
            <p class="text-muted">Pilih menu, atur keranjang, proses pembayaran</p>
          </div>
        </div>

        <div class="card">
          <TransactionForm @transaction-done="onTransactionDone" />
        </div>

        <!-- Receipt Modal -->
        <ReceiptModal v-model="showReceipt" :transaction="lastTransaction" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SideBar from '@/components/common/SideBar.vue'
import NavBar from '@/components/common/NavBar.vue'
import TransactionForm from '@/components/features/TransactionForm.vue'
import ReceiptModal from '@/components/features/ReceiptModal.vue'

const showReceipt = ref(false)
const lastTransaction = ref(null)

function onTransactionDone(transaksi) {
  lastTransaction.value = transaksi
  showReceipt.value = true
}
</script>

<style scoped>
.page-header { margin-bottom: 20px; }
.page-header h2 { font-size: 20px; font-weight: 700; }
</style>
