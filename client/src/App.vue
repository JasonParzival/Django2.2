<script setup>
import { useRouter } from 'vue-router'
import { useUserStore } from './stores/userStore'

const router = useRouter()
const userStore = useUserStore()

function logout() {
  userStore.logout()
  router.push('/login')
}
</script>

<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand" href="#">Интернет-магазин</a>

        <div class="navbar-nav">
          <router-link to="/products" class="nav-link">Товары</router-link>
          <router-link to="/categories" class="nav-link">Категории</router-link>
          <router-link to="/customers" class="nav-link">Клиент</router-link>
          <router-link to="/orders" class="nav-link">Заказы</router-link>
          <router-link to="/orderDetails" class="nav-link">Детали заказа</router-link>
          <router-link to="/otp" class="nav-link">🔐 2FA</router-link>
        </div>

        <ul class="navbar-nav">
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              {{ userStore.username }}
            </a>
            <ul class="dropdown-menu dropdown-menu-end">
              <li><span class="dropdown-item disabled">{{ userStore.isSuperuser ? '👑 Админ' : '👤 Пользователь' }}</span></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item" href="/admin">Админка</a></li>
              <li><hr class="dropdown-divider"></li>
              <li><a class="dropdown-item text-danger" href="#" @click="logout">Выйти</a></li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
    
    <router-view></router-view>
  </div>
</template>