<template>
  <div class="public-layout">
    <PublicNavbar />

    <main class="pub-main">
      <div class="status-hero">
        <div class="status-hero__inner">
          <div>
            <span class="status-eyebrow"><span></span> PESANANMU, TERPANTAU</span>
            <h2>Selangkah lebih dekat <em>ke meja makan.</em></h2>
            <p>Masukkan nomor pesanan untuk mengetahui perkembangannya.</p>
          </div>
          <div class="status-hero__art" aria-hidden="true">
            <span class="status-hero__ring"></span>
            <span class="status-hero__plate">🧾</span>
            <span class="status-hero__spark">✦</span>
          </div>
        </div>
      </div>

      <div class="status-container">
        <div class="status-card">
          <div class="status-search__icon" aria-hidden="true">⌕</div>
          <div class="status-search">
            <label class="status-search__label" for="order-number">Nomor pesanan</label>
            <div class="status-search__row">
              <input
                id="order-number"
                v-model="nomorNota"
                class="status-search__input"
                placeholder="Contoh: AA-20261121-001"
                @keyup.enter="cariPesanan"
              />
              <button class="status-search__btn" :disabled="isSearching" @click="cariPesanan">
                {{ isSearching ? 'Mencari...' : 'Lacak Pesanan' }} <span v-if="!isSearching">→</span>
              </button>
            </div>
            <p class="status-search__help">Nomor pesanan tersedia setelah pesanan berhasil dikirim.</p>
          </div>
        </div>

        <p v-if="searchError" class="status-error">{{ searchError }}</p>
        <div v-if="searched && !result && !isSearching && !searchError" class="status-not-found">
          <div class="status-not-found__icon">⌕</div>
          <div>
            <h3>Pesanan belum ditemukan</h3>
            <p>Nomor <strong>{{ nomorNota }}</strong> belum terdaftar.</p>
            <p class="text-muted">Periksa kembali nomor pesanan yang kamu masukkan.</p>
          </div>
        </div>

        <div v-if="result" class="status-result">
          <div class="status-result__header">
            <div class="status-result__icon">{{ result.status === 'selesai' ? '✓' : '…' }}</div>
            <div>
              <span class="status-result__eyebrow">PESANAN DITEMUKAN</span>
              <h3>{{ result.status === 'selesai' ? 'Pesanan selesai' : 'Pesanan menunggu diambil' }}</h3>
              <p class="status-result__nota">{{ result.nomorNota }}</p>
            </div>
            <span :class="['badge', result.status === 'selesai' ? 'badge-success' : 'badge-warning', 'status-badge']">
              {{ result.status === 'selesai' ? 'Selesai' : 'Menunggu Pembayaran' }}
            </span>
          </div>

          <div v-if="result.customerName" class="status-progress">
            <div class="status-progress__step is-done">
              <span class="status-progress__dot">✓</span>
              <span>Pesanan diterima</span>
            </div>
            <span class="status-progress__line" :class="{ 'is-done': result.status === 'selesai' }"></span>
            <div class="status-progress__step" :class="{ 'is-done': result.status === 'selesai' }">
              <span class="status-progress__dot">{{ result.status === 'selesai' ? '✓' : '2' }}</span>
              <span>{{ result.status === 'selesai' ? 'Sudah dibayar' : 'Bayar di kasir' }}</span>
            </div>
          </div>

          <div class="status-info">
            <div class="status-info-row">
              <span>{{ result.customerName ? 'Pelanggan' : 'Kasir' }}</span>
              <span>{{ result.customerName || result.kasir.nama }}</span>
            </div>
            <div class="status-info-row"><span>Tanggal</span><span>{{ formatTanggal(result.tanggal) }}</span></div>
          </div>

          <div class="status-items">
            <h4>Rincian Pesanan</h4>
            <div v-for="item in result.items" :key="item.produkId" class="status-item">
              <span class="status-item__name">{{ item.nama }}</span>
              <span class="status-item__qty">{{ item.jumlah }}x</span>
              <span class="status-item__subtotal">{{ formatHarga(item.subtotal) }}</span>
            </div>
          </div>

          <div class="status-totals">
            <div class="status-total-row"><span>Total</span><strong>{{ formatHarga(result.total) }}</strong></div>
            <template v-if="result.bayar !== null && result.bayar !== undefined">
              <div class="status-total-row"><span>Dibayar</span><span>{{ formatHarga(result.bayar) }}</span></div>
              <div class="status-total-row text-success"><span>Kembalian</span><strong>{{ formatHarga(result.kembalian) }}</strong></div>
            </template>
            <p v-else class="status-payment-note"><span>ⓘ</span> Bayar di kasir saat mengambil pesanan.</p>
          </div>
        </div>

        <div v-if="sampleNota.length" class="status-hint">
          <div>
            <p class="status-hint__title">Ingin mencoba?</p>
            <p class="status-hint__desc">Pilih contoh pesanan untuk melihat detailnya.</p>
          </div>
          <div class="status-hint__list">
            <button v-for="tx in sampleNota" :key="tx" class="status-hint__item" @click="nomorNota = tx; cariPesanan()">
              {{ tx }} <span>→</span>
            </button>
          </div>
        </div>

        <router-link to="/katalog" class="status-back-link"><span>←</span> Kembali ke menu</router-link>
      </div>
    </main>

    <footer class="pub-footer">
      <p><span>🍛</span> Ampera Ajo <i></i> Masakan Padang dengan rasa rumah.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTransactionsStore } from '@/stores/transactions'
import { fetchOrderByNumber } from '@/services/orders'
import PublicNavbar from '@/components/common/PublicNavbar.vue'

const route = useRoute()
const transactionsStore = useTransactionsStore()

const nomorNota = ref('')
const searched = ref(false)
const result = ref(null)
const isSearching = ref(false)
const searchError = ref('')

const sampleNota = computed(() =>
  transactionsStore.transactions.slice(0, 3).map(t => t.nomorNota)
)

onMounted(() => {
  const nota = route.query.nota
  if (typeof nota === 'string') {
    nomorNota.value = nota
    cariPesanan()
  }
})

async function cariPesanan() {
  const nota = nomorNota.value.trim()
  if (!nota || isSearching.value) return
  searched.value = true
  result.value = null
  searchError.value = ''
  isSearching.value = true
  try {
    result.value = transactionsStore.getTransactionByNota(nota) || await fetchOrderByNumber(nota)
  } catch (error) {
    searchError.value = error.message
  } finally {
    isSearching.value = false
  }
}

function formatHarga(val) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val)
}

function formatTanggal(iso) {
  return new Date(iso).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.public-layout {
  --public-ink: #25372d;
  --public-muted: #788078;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #fbf9f4;
  color: var(--public-ink);
}
.pub-main { flex: 1; padding-bottom: 30px; }
.status-hero {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 82% 12%, rgba(244, 162, 97, 0.18), transparent 34%),
    linear-gradient(115deg, #173b2d, #2b674a);
  color: #fff;
}
.status-hero::before, .status-hero::after {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  content: '';
}
.status-hero::before { width: 460px; height: 460px; right: -40px; top: -290px; }
.status-hero::after { width: 320px; height: 320px; right: 30px; top: -220px; }
.status-hero__inner {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 28px;
  width: min(940px, calc(100% - 48px));
  min-height: 275px;
  margin: 0 auto;
  padding: 42px 0;
}
.status-eyebrow { color: #d7bc83; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; }
.status-eyebrow span { display: inline-block; width: 7px; height: 7px; margin-right: 7px; border-radius: 50%; background: #e9b875; }
.status-hero h2 { max-width: 600px; margin-top: 15px; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(36px, 5vw, 52px); font-weight: 500; letter-spacing: -1px; line-height: 1.08; }
.status-hero h2 em { color: #f0c687; font-weight: 500; }
.status-hero__inner > div:first-child > p { margin-top: 13px; color: rgba(255, 255, 255, 0.72); font-size: 13px; }
.status-hero__art { position: relative; display: grid; width: 170px; height: 170px; flex: 0 0 170px; place-items: center; }
.status-hero__ring { position: absolute; width: 155px; height: 155px; border: 1px dashed rgba(255, 255, 255, 0.38); border-radius: 50%; }
.status-hero__plate { display: grid; width: 104px; height: 104px; place-items: center; border: 8px solid rgba(255, 255, 255, 0.85); border-radius: 50%; background: #f7f1e5; box-shadow: 0 18px 34px rgba(8, 29, 18, 0.22); color: #315940; font-size: 43px; transform: rotate(-9deg); }
.status-hero__spark { position: absolute; right: 2px; top: 10px; color: #f0c687; font-size: 27px; }

.status-container { display: flex; width: min(820px, calc(100% - 32px)); flex-direction: column; gap: 17px; margin: -20px auto 44px; position: relative; z-index: 2; }
.status-card { display: flex; align-items: center; gap: 16px; padding: 21px; border: 1px solid #ece8de; border-radius: 19px; background: #fff; box-shadow: 0 14px 36px rgba(34, 49, 39, 0.09); }
.status-search__icon { display: grid; width: 48px; height: 48px; flex: 0 0 48px; place-items: center; border-radius: 15px; background: #edf3eb; color: #315940; font-size: 31px; }
.status-search { min-width: 0; flex: 1; }
.status-search__label { margin-bottom: 7px; display: block; font-size: 11px; font-weight: 700; }
.status-search__row { display: flex; gap: 8px; }
.status-search__input {
  min-width: 0; flex: 1; padding: 11px 13px; border: 1px solid #e4e6de;
  border-radius: 11px; background: #fcfcfa; color: var(--public-ink); font-family: inherit; font-size: 11px; outline: none;
}
.status-search__input::placeholder { color: #a1a69f; }
.status-search__input:focus { border-color: #83a18b; box-shadow: 0 0 0 3px rgba(45, 106, 79, 0.1); }
.status-search__btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 10px;
  border: 0; border-radius: 11px; padding: 10px 15px;
  background: #24553d; color: #fff; cursor: pointer; font-family: inherit; font-size: 10px; font-weight: 600;
  transition: background 0.2s, transform 0.2s;
}
.status-search__btn:hover { background: #173b2d; transform: translateY(-1px); }
.status-search__btn:disabled { opacity: 0.6; cursor: wait; }
.status-search__help { margin-top: 6px; color: #949b93; font-size: 9px; }
.status-error { padding: 12px 15px; border: 1px solid #f4cdcd; border-radius: 12px; background: #fff3f3; color: var(--color-danger); font-size: 11px; }
.status-not-found { display: flex; align-items: center; gap: 15px; padding: 22px; border: 1px solid #ece8de; border-radius: 17px; background: #fff; box-shadow: 0 8px 24px rgba(34, 49, 39, 0.05); }
.status-not-found__icon { display: grid; width: 48px; height: 48px; flex: 0 0 48px; place-items: center; border-radius: 15px; background: #f6f0e2; color: #a87945; font-size: 30px; }
.status-not-found h3 { font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 500; }
.status-not-found p { margin-top: 5px; color: #778078; font-size: 11px; }
.status-not-found .text-muted { font-size: 10px; }
.status-result { padding: 24px; border: 1px solid #eae7de; border-radius: 20px; background: #fff; box-shadow: 0 14px 34px rgba(34, 49, 39, 0.07); }
.status-result__header { display: flex; align-items: center; gap: 13px; padding-bottom: 19px; border-bottom: 1px solid #efede6; }
.status-result__icon { display: grid; width: 49px; height: 49px; flex: 0 0 49px; place-items: center; border-radius: 16px; background: #e8f2e7; color: #2e6946; font-size: 23px; font-weight: 700; }
.status-result__eyebrow { color: #9c8058; font-size: 8px; font-weight: 700; letter-spacing: 1px; }
.status-result__header h3 { margin-top: 3px; font-family: Georgia, 'Times New Roman', serif; font-size: 20px; font-weight: 500; }
.status-result__nota { margin-top: 4px; color: #728078; font-size: 10px; letter-spacing: 0.4px; }
.status-badge { margin-left: auto; padding: 6px 10px; font-size: 9px; }
.status-progress { display: flex; align-items: center; gap: 10px; padding: 20px 2px; }
.status-progress__step { display: flex; align-items: center; gap: 7px; color: #99a099; font-size: 9px; white-space: nowrap; }
.status-progress__step.is-done { color: #315940; font-weight: 600; }
.status-progress__dot { display: grid; width: 22px; height: 22px; flex: 0 0 22px; place-items: center; border: 1px solid #dfe4dc; border-radius: 50%; font-size: 9px; }
.status-progress__step.is-done .status-progress__dot { border-color: #d7e8d7; background: #eaf3e9; color: #315940; }
.status-progress__line { height: 1px; min-width: 20px; flex: 1; background: #e5e6df; }
.status-progress__line.is-done { background: #8db194; }
.status-info { display: flex; flex-direction: column; gap: 0; padding: 13px 15px; border-radius: 13px; background: #f8f8f3; }
.status-info-row { display: flex; justify-content: space-between; gap: 10px; padding: 7px 0; color: #788078; font-size: 10px; }
.status-info-row + .status-info-row { border-top: 1px solid #edeee7; }
.status-info-row span:last-child { color: #344a39; font-weight: 600; text-align: right; }
.status-items { margin: 19px 0; }
.status-items h4 { margin-bottom: 9px; font-size: 11px; font-weight: 700; }
.status-item { display: flex; align-items: center; gap: 10px; margin-bottom: 5px; padding: 10px 12px; border: 1px solid #f0eee8; border-radius: 11px; background: #fff; }
.status-item__name { flex: 1; color: #3e4c40; font-size: 10px; }
.status-item__qty { color: #8a9289; font-size: 10px; }
.status-item__subtotal { min-width: 75px; color: #315940; font-size: 10px; text-align: right; }
.status-totals { padding: 15px; border: 1px solid #e9eee5; border-radius: 13px; background: #f5f8f1; }
.status-total-row { display: flex; justify-content: space-between; gap: 10px; padding: 4px 0; color: #718074; font-size: 11px; }
.status-total-row:first-child { color: #344a39; font-size: 13px; }
.status-payment-note { display: flex; align-items: center; gap: 7px; margin-top: 10px; color: #718074; font-size: 10px; }
.status-payment-note span { color: #a87945; font-size: 15px; }
.status-hint { display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 16px 18px; border: 1px solid #eee6d4; border-radius: 15px; background: #f8f3e7; }
.status-hint__title { color: #6b593e; font-size: 10px; font-weight: 700; }
.status-hint__desc { margin-top: 4px; color: #93836b; font-size: 9px; }
.status-hint__list { display: flex; flex-wrap: wrap; gap: 7px; }
.status-hint__item {
  display: inline-flex; align-items: center; gap: 8px; padding: 8px 11px;
  border: 1px solid #ead8b8; border-radius: 999px; background: #fffdf8; color: #735a36;
  cursor: pointer; font: inherit; font-size: 9px; transition: all 0.2s;
}
.status-hint__item:hover { border-color: #b9905c; background: #fff4db; }
.status-hint__item span { color: #a87945; font-size: 13px; }
.status-back-link { align-self: center; color: #53745c; font-size: 10px; font-weight: 600; }
.status-back-link span { margin-right: 5px; font-size: 14px; }
.pub-footer { padding: 22px 16px; background: #173b2d; color: rgba(255,255,255,0.68); text-align: center; font-size: 10px; }
.pub-footer p { display: flex; align-items: center; justify-content: center; gap: 10px; }
.pub-footer i { width: 4px; height: 4px; border-radius: 50%; background: #d5ad76; }
@media (max-width: 650px) {
  .status-hero__inner { width: calc(100% - 36px); min-height: 225px; }
  .status-hero__art { width: 115px; height: 115px; flex-basis: 115px; }
  .status-hero__ring { width: 110px; height: 110px; }
  .status-hero__plate { width: 77px; height: 77px; border-width: 6px; font-size: 32px; }
  .status-hero__spark { right: -2px; top: 0; font-size: 19px; }
  .status-container { margin-top: -15px; }
  .status-card { align-items: flex-start; padding: 15px; }
  .status-search__icon { width: 38px; height: 38px; flex-basis: 38px; font-size: 25px; }
  .status-search__row { flex-direction: column; }
  .status-search__btn { min-height: 39px; }
  .status-hint { align-items: flex-start; flex-direction: column; }
}
@media (max-width: 420px) {
  .status-hero__inner { gap: 5px; }
  .status-hero h2 { font-size: 35px; }
  .status-hero__art { width: 75px; height: 90px; flex-basis: 75px; }
  .status-hero__ring { width: 75px; height: 75px; }
  .status-hero__plate { width: 58px; height: 58px; border-width: 4px; font-size: 24px; }
  .status-hero__spark { font-size: 14px; }
  .status-result { padding: 16px; }
  .status-result__header { flex-wrap: wrap; }
  .status-badge { margin-left: auto; }
  .status-progress { gap: 6px; }
  .status-progress__step { gap: 4px; font-size: 8px; }
  .status-progress__line { min-width: 8px; }
  .status-item { gap: 6px; padding: 9px; }
}
</style>
