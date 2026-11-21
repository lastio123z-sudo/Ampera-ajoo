<template>
  <div class="login-page">
    <div class="login-bg"></div>
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="login-logo">🍛</div>
          <h1 class="login-title">Ampera Ajo</h1>
          <p class="login-sub">Sistem Informasi Warung Padang</p>
        </div>

        <form class="login-form" @submit.prevent="handleLogin">
          <div v-if="errorMsg" class="login-alert">{{ errorMsg }}</div>

          <BaseInput
            v-model="form.username"
            label="Username"
            placeholder="Masukkan username"
            required
            :error="formErrors.username"
          />
          <BaseInput
            v-model="form.password"
            type="password"
            label="Password"
            placeholder="Masukkan password"
            required
            :error="formErrors.password"
          />

          <BaseButton
            type="submit"
            variant="primary"
            block
            :loading="authStore.isLoading"
            size="lg"
          >
            Masuk
          </BaseButton>
        </form>

        <div class="login-hint">
          <p class="login-hint__title">Akun Demo:</p>
          <div class="login-hint__accounts">
            <div class="hint-account" @click="fillDemo('admin', 'admin123')">
              <strong>Pemilik</strong>
              <span>admin / admin123</span>
            </div>
            <div class="hint-account" @click="fillDemo('kasir1', 'kasir123')">
              <strong>Kasir</strong>
              <span>kasir1 / kasir123</span>
            </div>
          </div>
        </div>
      </div>

      <div class="login-public">
        <router-link to="/katalog" class="login-public__link">
          🍽️ Lihat Menu Publik
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseInput from '@/components/common/BaseInput.vue'
import BaseButton from '@/components/common/BaseButton.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const form = reactive({ username: '', password: '' })
const formErrors = reactive({ username: '', password: '' })
const errorMsg = ref('')

function validate() {
  formErrors.username = form.username ? '' : 'Username wajib diisi'
  formErrors.password = form.password ? '' : 'Password wajib diisi'
  return !formErrors.username && !formErrors.password
}

async function handleLogin() {
  errorMsg.value = ''
  if (!validate()) return
  const result = await authStore.login(form.username, form.password)
  if (result.success) {
    const redirect = route.query.redirect
    if (redirect) return router.push(redirect)
    if (result.user.role === 'pemilik') return router.push('/pemilik/dashboard')
    if (result.user.role === 'kasir') return router.push('/kasir/dashboard')
  } else {
    errorMsg.value = result.message
  }
}

function fillDemo(username, password) {
  form.username = username
  form.password = password
}
</script>

<style scoped>
.login-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
  background:
    radial-gradient(ellipse at 18% 18%, rgba(233, 178, 112, 0.19), transparent 32%),
    radial-gradient(ellipse at 87% 78%, rgba(93, 147, 101, 0.23), transparent 36%),
    linear-gradient(135deg, #173728 0%, #28583f 56%, #356c4a 100%);
}
.login-bg {
  position: absolute; inset: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.6;
}
.login-container { position: relative; z-index: 1; width: 100%; max-width: 430px; padding: 20px; }
.login-card {
  overflow: hidden; position: relative;
  background: rgba(255,255,255,0.98); border: 1px solid rgba(255,255,255,0.72);
  border-radius: 25px; padding: 34px; box-shadow: 0 30px 80px rgba(11, 33, 20, 0.28);
}
.login-header { text-align: center; margin-bottom: 26px; }
.login-logo {
  display: grid; width: 65px; height: 65px; margin: 0 auto 13px; place-items: center;
  border: 1px solid #f1dfbf; border-radius: 21px;
  background: linear-gradient(145deg, #fff5e3, #f8ead2); box-shadow: 0 9px 18px rgba(177, 127, 65, 0.11);
  font-size: 35px;
}
.login-title { font-family: Georgia, 'Times New Roman', serif; font-size: 28px; font-weight: 600; color: #254632; margin: 8px 0 4px; letter-spacing: -0.5px; }
.login-sub { color: var(--color-text-muted); font-size: 11px; }
.login-form { display: flex; flex-direction: column; gap: 15px; }
.login-alert {
  background: #fff0ef; color: var(--color-danger); padding: 11px 13px;
  border-radius: 10px; font-size: 11px; border: 1px solid #f4d8d5;
}
.login-hint { margin-top: 22px; padding-top: 17px; border-top: 1px solid #edf0e9; }
.login-hint__title { font-size: 10px; color: var(--color-text-muted); margin-bottom: 9px; font-weight: 600; }
.login-hint__accounts { display: flex; gap: 9px; }
.hint-account {
  flex: 1; background: #f7f9f4; border: 1px solid #e6ebe2;
  border-radius: 11px; padding: 10px; cursor: pointer; transition: all 0.2s;
  display: flex; flex-direction: column; gap: 2px;
}
.hint-account:hover { border-color: #aac3aa; background: #edf4e9; transform: translateY(-2px); }
.hint-account strong { font-size: 10px; color: var(--color-primary); }
.hint-account span { font-size: 9px; color: var(--color-text-muted); }
.login-public { text-align: center; margin-top: 16px; }
.login-public__link {
  display: inline-flex; align-items: center; gap: 7px;
  color: rgba(255,255,255,0.84); font-size: 11px; text-decoration: none;
  padding: 9px 15px; border: 1px solid rgba(255,255,255,0.28);
  border-radius: 999px; transition: all 0.2s;
}
.login-public__link:hover { background: rgba(255,255,255,0.12); color: #fff; transform: translateY(-1px); }
@media (max-width: 420px) { .login-card { padding: 26px 21px; } }
</style>
