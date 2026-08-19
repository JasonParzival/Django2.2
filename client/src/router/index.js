import { createRouter, createWebHistory } from 'vue-router'
import ProductsView from '../views/ProductsView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import CustomersView from '../views/CustomersView.vue'
import OrdersView from '../views/OrdersView.vue'
import OrderDetailsView from '../views/OrderDetailsView.vue'
import LoginView from '../views/LoginView.vue' 
import RegisterView from '../views/RegisterView.vue' 
import OTPSetupView from '../views/OTPSetupView.vue'
import { useUserStore } from '../stores/userStore'

const isAuthenticated = () => {
  return !!localStorage.getItem('authToken')
}

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresGuest: true } 
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    redirect: '/products'
  },
  {
    path: '/products',
    name: 'products',
    component: ProductsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/categories',
    name: 'categories',
    component: CategoriesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/customers',
    name: 'customers',
    component: CustomersView,
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'orders',
    component: OrdersView,
    meta: { requiresAuth: true }
  },
  {
    path: '/orderDetails',
    name: 'orderDetails',
    component: OrderDetailsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/otp',
    name: 'otp',
    component: OTPSetupView,
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  if (to.meta.requiresAuth && !userStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && userStore.isAuthenticated) {
    next('/products')
  } else {
    next()
  }
})

export default router
