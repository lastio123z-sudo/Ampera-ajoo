<template>
  <div class="not-found">
    <div class="not-found__content">
      <div class="not-found__icon">🍛</div>
      <h1 class="not-found__code">404</h1>
      <h2 class="not-found__title">Halaman Tidak Ditemukan</h2>
      <p class="not-found__desc">Maaf, halaman yang Anda cari tidak tersedia di Ampera Ajo.</p>
      <div class="not-found__actions">
        <router-link to="/katalog">
          <BaseButton variant="primary">🏠 Ke Halaman Utama</BaseButton>
        </router-link>
        <router-link to="/login">
          <BaseButton variant="outline">Login Staff</BaseButton>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import BaseButton from '@/components/common/BaseButton.vue'
</script>

<style scoped>
.not-found {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  padding: 20px;
  background:
    radial-gradient(ellipse at 18% 18%, rgba(233, 178, 112, 0.18), transparent 32%),
    linear-gradient(135deg, #173728 0%, #28583f 56%, #356c4a 100%);
}
.not-found__content {
  width: min(520px, 100%); padding: 42px 32px; border: 1px solid rgba(255,255,255,0.2);
  border-radius: 25px; background: rgba(255,255,255,0.08); box-shadow: 0 25px 65px rgba(8, 28, 17, 0.22);
  color: #fff; text-align: center; backdrop-filter: blur(12px);
}
.not-found__icon { display: grid; width: 70px; height: 70px; place-items: center; margin: 0 auto 15px; border: 1px solid rgba(233,178,112,0.38); border-radius: 22px; background: rgba(233,178,112,0.15); font-size: 38px; }
.not-found__code { color: #f0c687; font-family: Georgia, 'Times New Roman', serif; font-size: 79px; font-weight: 500; opacity: 0.62; line-height: 1; }
.not-found__title { font-family: Georgia, 'Times New Roman', serif; font-size: 23px; font-weight: 500; margin: 9px 0; }
.not-found__desc { font-size: 11px; opacity: 0.74; margin-bottom: 24px; }
.not-found__actions { display: flex; gap: 12px; justify-content: center; }
@media (max-width: 460px) { .not-found__content { padding: 30px 18px; } .not-found__actions { align-items: stretch; flex-direction: column; } }
</style>
