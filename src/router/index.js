import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  // Public routes
  {
    path: '/',
    redirect: '/katalog'
  },
  {
    path: '/katalog',
    name: 'KatalogMenu',
    component: () => import('@/views/publik/KatalogMenu.vue'),
    meta: { requiresAuth: false, title: 'Katalog Menu' }
  },
  {
    path: '/status-pesanan',
    name: 'StatusPesanan',
    component: () => import('@/views/publik/StatusPesanan.vue'),
    meta: { requiresAuth: false, title: 'Status Pesanan' }
  },

  // Auth routes
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/auth/LoginView.vue'),
    meta: { requiresAuth: false, guestOnly: true, title: 'Login' }
  },

  // Pemilik routes
  {
    path: '/pemilik',
    meta: { requiresAuth: true, role: 'pemilik' },
    children: [
      {
        path: '',
        redirect: '/pemilik/dashboard'
      },
      {
        path: 'dashboard',
        name: 'DashboardPemilik',
        component: () => import('@/views/pemilik/DashboardPemilik.vue'),
        meta: { requiresAuth: true, role: 'pemilik', title: 'Dashboard Pemilik' }
      },
      {
        path: 'produk',
        name: 'ManajemenProduk',
        component: () => import('@/views/pemilik/ManajemenProduk.vue'),
        meta: { requiresAuth: true, role: 'pemilik', title: 'Manajemen Produk' }
      },
      {
        path: 'laporan',
        name: 'LaporanPenjualan',
        component: () => import('@/views/pemilik/LaporanPenjualan.vue'),
        meta: { requiresAuth: true, role: 'pemilik', title: 'Laporan Penjualan' }
      },
      {
        path: 'kasir',
        name: 'ManajemenKasir',
        component: () => import('@/views/pemilik/ManajemenKasir.vue'),
        meta: { requiresAuth: true, role: 'pemilik', title: 'Manajemen Kasir' }
      }
    ]
  },

  // Kasir routes
  {
    path: '/kasir',
    meta: { requiresAuth: true, role: 'kasir' },
    children: [
      {
        path: '',
        redirect: '/kasir/dashboard'
      },
      {
        path: 'dashboard',
        name: 'DashboardKasir',
        component: () => import('@/views/kasir/DashboardKasir.vue'),
        meta: { requiresAuth: true, role: 'kasir', title: 'Dashboard Kasir' }
      },
      {
        path: 'transaksi-baru',
        name: 'TransaksiBaru',
        component: () => import('@/views/kasir/TransaksiBaru.vue'),
        meta: { requiresAuth: true, role: 'kasir', title: 'Transaksi Baru' }
      },
      {
        path: 'pesanan-online',
        name: 'PesananOnline',
        component: () => import('@/views/kasir/PesananOnline.vue'),
        meta: { requiresAuth: true, role: 'kasir', title: 'Pesanan Online' }
      },
      {
        path: 'riwayat',
        name: 'RiwayatTransaksi',
        component: () => import('@/views/kasir/RiwayatTransaksi.vue'),
        meta: { requiresAuth: true, role: 'kasir', title: 'Riwayat Transaksi' }
      }
    ]
  },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
    meta: { title: 'Halaman Tidak Ditemukan' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Update document title
  document.title = to.meta.title ? `${to.meta.title} - Ampera Ajo` : 'Ampera Ajo'

  // Guest-only routes (like /login) - redirect if already logged in
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    const role = authStore.userRole
    if (role === 'pemilik') return next('/pemilik/dashboard')
    if (role === 'kasir') return next('/kasir/dashboard')
    return next('/')
  }

  // Requires authentication
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      return next({ name: 'Login', query: { redirect: to.fullPath } })
    }

    // Role-based access control
    if (to.meta.role && authStore.userRole !== to.meta.role) {
      // Redirect to appropriate dashboard
      if (authStore.userRole === 'pemilik') return next('/pemilik/dashboard')
      if (authStore.userRole === 'kasir') return next('/kasir/dashboard')
      return next('/')
    }
  }

  next()
})

export default router
