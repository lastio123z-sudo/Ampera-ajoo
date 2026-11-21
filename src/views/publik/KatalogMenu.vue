<template>
  <div class="public-layout">
    <PublicNavbar />

    <main class="pub-main">
      <section class="katalog-hero">
        <div class="katalog-hero__inner">
          <div class="katalog-hero__content">
            <span class="hero-eyebrow"><span></span> RASA ASLI MINANG</span>
            <h2>Hangatnya masakan rumah, <em>khas Minang.</em></h2>
            <p>Rempah pilihan, resep turun-temurun, dan selalu dibuat dengan sepenuh hati.</p>
            <div class="katalog-hero__actions">
              <a class="hero-button" href="#menu">Jelajahi Menu <span>↓</span></a>
              <span class="hero-note">Dipesan sekarang, dibayar saat diambil</span>
            </div>
          </div>
          <div class="katalog-hero__art" aria-hidden="true">
            <div class="hero-orbit hero-orbit--one"></div>
            <div class="hero-orbit hero-orbit--two"></div>
            <div class="hero-plate">🍛</div>
            <div class="hero-sticker hero-sticker--top">Racikan<br />autentik</div>
            <div class="hero-sticker hero-sticker--bottom"><span>✦</span> Rasa yang dirindukan</div>
          </div>
        </div>
      </section>

      <section id="menu" class="menu-section">
        <div class="menu-heading">
          <div>
            <span class="section-eyebrow">DARI DAPUR KAMI</span>
            <h2>Pilih yang kamu suka</h2>
            <p>Temukan teman terbaik untuk sepiring nasi hangat.</p>
          </div>
          <span class="menu-count">{{ filteredProducts.length }} menu tersedia</span>
        </div>

        <div class="katalog-controls">
          <label class="katalog-search">
            <span class="katalog-search__icon" aria-hidden="true">⌕</span>
            <input v-model="searchQuery" class="katalog-search__input" placeholder="Cari rendang, ayam pop..." />
            <span class="search-hint">Cari menu</span>
          </label>
          <div class="katalog-tabs" aria-label="Filter kategori menu">
            <button
              v-for="kat in ['Semua', ...productsStore.kategoris]"
              :key="kat"
              :class="['katalog-tab', { active: activeKategori === kat }]"
              @click="activeKategori = kat"
            >
              {{ kat }}
            </button>
          </div>
        </div>

        <div class="katalog-grid">
          <ProductCard v-for="product in filteredProducts" :key="product.id" :product="product">
            <template #action>
              <button class="katalog-add-button" type="button" @click="addToCart(product)">
                + Tambah
              </button>
            </template>
          </ProductCard>
          <div v-if="!filteredProducts.length" class="katalog-empty">
            <span>🍽️</span>
            <p>Menu tidak ditemukan</p>
            <small>Coba kata kunci atau kategori lainnya.</small>
          </div>
        </div>
      </section>

      <button v-if="cart.length" class="cart-float" type="button" @click="scrollToCart">
        <span class="cart-float__icon">🛒</span>
        <span class="cart-float__label">{{ cart.length }} menu di keranjang</span>
        <strong>{{ formatHarga(cartTotal) }}</strong>
        <span class="cart-float__arrow">Lihat <span>→</span></span>
      </button>

      <section v-if="cart.length || submittedOrder" id="cart" ref="cartPanel" class="order-panel">
        <div v-if="submittedOrder" class="order-success">
          <span class="order-success__icon">✓</span>
          <div>
            <span class="section-eyebrow">PESANAN DITERIMA</span>
            <h3>Terima kasih, pesananmu masuk!</h3>
            <p>Nomor pesanan <strong>{{ submittedOrder.nomorNota }}</strong>. Pembayaran dilakukan di kasir saat mengambil.</p>
            <router-link :to="{ path: '/status-pesanan', query: { nota: submittedOrder.nomorNota } }">
              Lacak pesanan <span>→</span>
            </router-link>
          </div>
        </div>

        <template v-else>
          <div class="order-panel__heading">
            <div>
              <span class="section-eyebrow">HAMPIR SIAP</span>
              <h3>Keranjang Pesanan</h3>
            </div>
            <span class="order-panel__count">{{ cart.length }} menu</span>
          </div>
          <div class="order-items">
            <div v-for="item in cart" :key="item.produkId" class="order-item">
              <div class="order-item__details">
                <strong>{{ item.nama }}</strong>
                <span>{{ formatHarga(item.harga) }} / porsi</span>
              </div>
              <div class="order-item__quantity">
                <button type="button" aria-label="Kurangi jumlah" @click="changeQuantity(item, -1)">−</button>
                <span>{{ item.jumlah }}</span>
                <button type="button" aria-label="Tambah jumlah" @click="changeQuantity(item, 1)">+</button>
              </div>
              <strong class="order-item__subtotal">{{ formatHarga(item.subtotal) }}</strong>
              <button class="order-item__remove" type="button" :aria-label="`Hapus ${item.nama}`" @click="removeFromCart(item.produkId)">×</button>
            </div>
          </div>
          <div class="order-checkout">
            <label class="order-name">
              Nama untuk pesanan
              <input v-model="customerName" maxlength="100" placeholder="Contoh: Bima" />
            </label>
            <div class="order-checkout__summary">
              <span>Total pembayaran</span>
              <strong>{{ formatHarga(cartTotal) }}</strong>
            </div>
            <p v-if="orderError" class="order-error">{{ orderError }}</p>
            <button class="order-submit" type="button" :disabled="isSubmitting" @click="submitOrder">
              {{ isSubmitting ? 'Mengirim pesanan...' : 'Kirim Pesanan' }} <span>→</span>
            </button>
            <p class="order-note">Bayar di kasir saat mengambil · Tidak ada pembayaran online</p>
          </div>
        </template>
      </section>
    </main>

    <footer class="pub-footer">
      <p><span>🍛</span> Ampera Ajo <i></i> Masakan Padang dengan rasa rumah.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useProductsStore } from '@/stores/products'
import ProductCard from '@/components/features/ProductCard.vue'
import PublicNavbar from '@/components/common/PublicNavbar.vue'
import { createOrder } from '@/services/orders'

const productsStore = useProductsStore()

const searchQuery = ref('')
const activeKategori = ref('Semua')
const cartPanel = ref(null)
const cart = ref([])
const customerName = ref('')
const submittedOrder = ref(null)
const isSubmitting = ref(false)
const orderError = ref('')

const filteredProducts = computed(() => {
  return productsStore.availableProducts.filter(p => {
    const matchSearch = p.nama.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchKat = activeKategori.value === 'Semua' || p.kategori === activeKategori.value
    return matchSearch && matchKat
  })
})

const cartTotal = computed(() => cart.value.reduce((sum, item) => sum + item.subtotal, 0))

function addToCart(product) {
  submittedOrder.value = null
  orderError.value = ''
  const item = cart.value.find(entry => entry.produkId === product.id)
  if (item) {
    item.jumlah++
    item.subtotal = item.jumlah * item.harga
  } else {
    cart.value.push({
      produkId: product.id,
      nama: product.nama,
      harga: Number(product.harga),
      jumlah: 1,
      subtotal: Number(product.harga)
    })
  }
}

function changeQuantity(item, amount) {
  item.jumlah += amount
  if (item.jumlah < 1) {
    removeFromCart(item.produkId)
    return
  }
  item.subtotal = item.jumlah * item.harga
}

function removeFromCart(productId) {
  cart.value = cart.value.filter(item => item.produkId !== productId)
}

function scrollToCart() {
  if (cartPanel.value) cartPanel.value.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

async function submitOrder() {
  if (!customerName.value.trim()) {
    orderError.value = 'Nama pelanggan wajib diisi.'
    return
  }

  isSubmitting.value = true
  orderError.value = ''
  try {
    submittedOrder.value = await createOrder({
      customerName: customerName.value.trim(),
      items: cart.value
    })
    cart.value = []
    customerName.value = ''
  } catch (error) {
    orderError.value = error.message
  } finally {
    isSubmitting.value = false
  }
}

function formatHarga(value) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}
</script>

<style scoped>
.public-layout {
  --public-ink: #25372d;
  --public-muted: #788078;
  --public-cream: #fbf9f4;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--public-cream);
  color: var(--public-ink);
}
.pub-main { flex: 1; padding-bottom: 30px; }
.katalog-hero {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(ellipse at 80% 16%, rgba(244, 162, 97, 0.19), transparent 34%),
    linear-gradient(115deg, #173b2d 0%, #24553d 56%, #2c684b 100%);
  color: #fff;
}
.katalog-hero::before, .katalog-hero::after {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.075);
  border-radius: 50%;
  content: '';
  pointer-events: none;
}
.katalog-hero::before { width: 520px; height: 520px; right: -80px; top: -290px; }
.katalog-hero::after { width: 360px; height: 360px; right: 45px; top: -210px; }
.katalog-hero__inner {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.85fr);
  align-items: center;
  gap: 40px;
  width: min(1160px, calc(100% - 48px));
  min-height: 380px;
  margin: 0 auto;
  padding: 54px 0;
}
.katalog-hero__content { max-width: 600px; }
.hero-eyebrow, .section-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #d7bc83;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1.6px;
}
.hero-eyebrow span { width: 7px; height: 7px; border-radius: 50%; background: #e9b875; box-shadow: 0 0 0 5px rgba(233, 184, 117, 0.12); }
.katalog-hero h2 {
  max-width: 570px;
  margin-top: 18px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(38px, 5vw, 62px);
  font-weight: 500;
  letter-spacing: -1.7px;
  line-height: 1.06;
}
.katalog-hero h2 em { color: #f0c687; font-weight: 500; }
.katalog-hero__content > p { max-width: 450px; margin-top: 18px; color: rgba(255, 255, 255, 0.73); font-size: 14px; line-height: 1.8; }
.katalog-hero__actions { display: flex; align-items: center; flex-wrap: wrap; gap: 18px; margin-top: 26px; }
.hero-button {
  display: inline-flex;
  align-items: center;
  gap: 18px;
  padding: 12px 17px;
  border-radius: 999px;
  background: #f2bf7b;
  color: #25372d;
  font-size: 12px;
  font-weight: 700;
  transition: transform 0.2s, background 0.2s;
}
.hero-button:hover { transform: translateY(-2px); background: #ffd18d; }
.hero-button span { font-size: 17px; line-height: 0; }
.hero-note { color: rgba(255, 255, 255, 0.68); font-size: 11px; }
.katalog-hero__art { position: relative; display: grid; min-height: 270px; place-items: center; }
.hero-orbit { position: absolute; border: 1px solid rgba(255, 255, 255, 0.17); border-radius: 50%; }
.hero-orbit--one { width: 260px; height: 260px; }
.hero-orbit--two { width: 320px; height: 320px; border-style: dashed; opacity: 0.55; }
.hero-plate {
  display: grid;
  width: 190px;
  height: 190px;
  place-items: center;
  border: 9px solid rgba(255, 255, 255, 0.84);
  border-radius: 50%;
  background: radial-gradient(circle, #f8f2e7 0 54%, #e8d6b8 55% 61%, #fff 62%);
  box-shadow: 0 25px 55px rgba(10, 28, 19, 0.28);
  font-size: 90px;
  transform: rotate(-8deg);
}
.hero-sticker {
  position: absolute;
  display: grid;
  place-items: center;
  border-radius: 14px;
  background: #fffaf0;
  box-shadow: 0 12px 28px rgba(12, 31, 21, 0.18);
  color: #354638;
  font-size: 10px;
  font-weight: 700;
  line-height: 1.45;
  text-align: center;
}
.hero-sticker--top { top: 16px; right: 22px; width: 80px; height: 70px; transform: rotate(7deg); }
.hero-sticker--bottom { bottom: 11px; left: 18px; display: flex; gap: 7px; padding: 11px 14px; border-radius: 999px; transform: rotate(-5deg); }
.hero-sticker--bottom span { color: #d88945; font-size: 16px; }

.menu-section { width: min(1160px, calc(100% - 48px)); margin: 0 auto; padding-top: 56px; }
.menu-heading { display: flex; align-items: end; justify-content: space-between; gap: 20px; }
.section-eyebrow { color: #a87945; font-size: 9px; letter-spacing: 1.4px; }
.menu-heading h2 { margin-top: 8px; font-family: Georgia, 'Times New Roman', serif; font-size: 31px; font-weight: 500; letter-spacing: -0.5px; }
.menu-heading p { margin-top: 6px; color: var(--public-muted); font-size: 12px; }
.menu-count { margin-bottom: 5px; color: #718074; font-size: 11px; }
.katalog-controls { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-top: 25px; }
.katalog-search {
  display: flex;
  min-width: 250px;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border: 1px solid #e8e5db;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 5px 16px rgba(34, 49, 39, 0.035);
}
.katalog-search__icon { color: #78917e; font-size: 25px; line-height: 0.7; }
.katalog-search__input { min-width: 0; flex: 1; border: none; outline: none; background: transparent; color: var(--public-ink); font-family: inherit; font-size: 11px; }
.katalog-search__input::placeholder { color: #a1a69f; }
.search-hint { color: #a1a69f; font-size: 9px; }
.katalog-tabs { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 7px; }
.katalog-tab {
  padding: 8px 13px;
  border: 1px solid #e7e5dd;
  border-radius: 999px;
  background: #fff;
  color: #6d776e;
  font-size: 10px;
  font-weight: 500;
  transition: all 0.2s;
}
.katalog-tab.active { border-color: #24553d; background: #24553d; color: #fff; box-shadow: 0 5px 12px rgba(36, 85, 61, 0.18); }
.katalog-tab:hover:not(.active) { border-color: #9eb4a3; color: #24553d; }
.katalog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(225px, 1fr));
  gap: 18px;
  padding: 22px 0 54px;
}
.katalog-empty { grid-column: 1/-1; padding: 56px 20px; border: 1px dashed #dedbd0; border-radius: 20px; color: var(--public-muted); text-align: center; }
.katalog-empty span { display: block; margin-bottom: 10px; font-size: 38px; }
.katalog-empty p { color: var(--public-ink); font-weight: 600; }
.katalog-empty small { display: block; margin-top: 5px; }
.katalog-add-button {
  padding: 8px 13px;
  border: 0;
  border-radius: 999px;
  background: #24553d;
  color: #fff;
  cursor: pointer;
  font: inherit;
  font-size: 10px;
  font-weight: 600;
  transition: background 0.2s, transform 0.2s;
}
.katalog-add-button:hover { background: #173b2d; transform: translateY(-1px); }
.cart-float {
  position: fixed;
  z-index: 90;
  right: clamp(16px, 4vw, 54px);
  bottom: 22px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px 10px 10px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 999px;
  background: #173b2d;
  box-shadow: 0 14px 36px rgba(20, 52, 37, 0.28);
  color: #fff;
  font: inherit;
  cursor: pointer;
  animation: cart-enter 0.25s ease-out;
}
.cart-float__icon { display: grid; width: 34px; height: 34px; place-items: center; border-radius: 50%; background: #f2bf7b; color: #263a2d; }
.cart-float__label { font-size: 10px; }
.cart-float strong { color: #f4cb92; font-size: 11px; }
.cart-float__arrow { padding-left: 10px; border-left: 1px solid rgba(255, 255, 255, 0.2); font-size: 10px; }
.cart-float__arrow span { margin-left: 4px; }
@keyframes cart-enter { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
.order-panel {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  max-width: 900px;
  margin: 0 auto 54px;
  padding: 25px;
  border: 1px solid #e9e5d9;
  border-radius: 22px;
  background: #fff;
  box-shadow: 0 15px 44px rgba(34, 49, 39, 0.08);
  scroll-margin-top: 100px;
}
.order-panel__heading { display: flex; align-items: center; justify-content: space-between; grid-column: 1 / -1; margin-bottom: 14px; }
.order-panel__heading h3 { margin-top: 5px; font-family: Georgia, 'Times New Roman', serif; font-size: 25px; font-weight: 500; }
.order-panel__count { padding: 6px 11px; border-radius: 999px; background: #edf3eb; color: #41694d; font-size: 10px; }
.order-items { padding-right: 22px; }
.order-item {
  display: flex; align-items: center; gap: 12px; padding: 14px 0;
  border-bottom: 1px solid #efede6; font-size: 11px;
}
.order-item__details { display: flex; min-width: 100px; flex: 1; flex-direction: column; gap: 4px; }
.order-item__details span { color: var(--public-muted); font-size: 9px; }
.order-item__quantity { display: flex; align-items: center; gap: 9px; }
.order-item__quantity button {
  width: 25px; height: 25px; border: 1px solid #e1e4dc;
  border-radius: 50%; background: #f9faf7; color: #315940; cursor: pointer;
}
.order-item__subtotal { min-width: 82px; color: #315940; text-align: right; }
.order-item__remove { border: 0; background: none; color: #9b9388; cursor: pointer; font-size: 20px; }
.order-item__remove:hover { color: var(--color-danger); }
.order-checkout {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 18px;
  border-radius: 16px;
  background: #f7f7f0;
}
.order-name { display: flex; flex-direction: column; gap: 7px; font-size: 10px; font-weight: 600; }
.order-name input {
  width: 100%; padding: 10px 12px; border: 1px solid #e3e3d9;
  border-radius: 10px; background: #fff; font: inherit; font-size: 11px;
}
.order-name input:focus { border-color: #8eaa91; outline: 3px solid rgba(64, 145, 108, 0.12); }
.order-checkout__summary { display: flex; justify-content: space-between; gap: 12px; margin: 17px 0; color: #667167; font-size: 10px; }
.order-checkout__summary strong { color: #243b2e; font-size: 17px; }
.order-submit {
  display: flex; width: 100%; align-items: center; justify-content: space-between;
  padding: 12px 14px; border: 0; border-radius: 11px;
  background: #24553d; color: #fff; font: inherit; font-size: 11px; font-weight: 600; cursor: pointer;
}
.order-submit:hover:not(:disabled) { background: #173b2d; }
.order-submit:disabled { opacity: 0.6; cursor: wait; }
.order-note, .order-error { margin-top: 9px; color: var(--public-muted); font-size: 9px; line-height: 1.5; }
.order-error { color: var(--color-danger); }
.order-success { display: flex; grid-column: 1 / -1; align-items: center; gap: 18px; padding: 8px; }
.order-success__icon { display: grid; width: 56px; height: 56px; flex: 0 0 56px; place-items: center; border-radius: 18px; background: #e7f2e6; color: #2a6946; font-size: 25px; font-weight: 700; }
.order-success h3 { margin-top: 6px; color: #254432; font-family: Georgia, 'Times New Roman', serif; font-size: 22px; font-weight: 500; }
.order-success p { margin-top: 7px; color: var(--public-muted); font-size: 11px; line-height: 1.6; }
.order-success a { display: inline-flex; gap: 10px; margin-top: 12px; color: #2b6746; font-size: 11px; font-weight: 700; }
.pub-footer { padding: 22px 16px; background: #173b2d; color: rgba(255,255,255,0.68); text-align: center; font-size: 10px; }
.pub-footer p { display: flex; align-items: center; justify-content: center; gap: 10px; }
.pub-footer i { width: 4px; height: 4px; border-radius: 50%; background: #d5ad76; }
@media (max-width: 760px) {
  .katalog-hero__inner { grid-template-columns: 1fr; min-height: auto; gap: 4px; padding: 44px 0 10px; }
  .katalog-hero__content { position: relative; z-index: 2; }
  .katalog-hero__art { min-height: 220px; margin-top: 4px; }
  .hero-orbit--one { width: 205px; height: 205px; }
  .hero-orbit--two { width: 255px; height: 255px; }
  .hero-plate { width: 150px; height: 150px; font-size: 72px; }
  .hero-sticker--top { right: calc(50% - 125px); }
  .hero-sticker--bottom { left: calc(50% - 130px); }
  .menu-section { width: min(100% - 32px, 560px); padding-top: 38px; }
  .katalog-controls { align-items: stretch; flex-direction: column; gap: 12px; }
  .katalog-tabs { justify-content: flex-start; }
  .katalog-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .order-panel { grid-template-columns: 1fr; width: calc(100% - 32px); padding: 18px; }
  .order-items { padding-right: 0; }
}
@media (max-width: 420px) {
  .katalog-hero__inner { width: calc(100% - 36px); }
  .katalog-hero h2 { font-size: 39px; }
  .hero-note { font-size: 9px; }
  .menu-heading h2 { font-size: 26px; }
  .menu-count { font-size: 9px; white-space: nowrap; }
  .katalog-grid { grid-template-columns: 1fr; }
  .cart-float { right: 12px; bottom: 12px; gap: 8px; padding: 8px; }
  .cart-float__label { font-size: 9px; }
  .cart-float__arrow { display: none; }
  .order-item { gap: 7px; }
  .order-item__subtotal { min-width: 68px; font-size: 10px; }
}
</style>
