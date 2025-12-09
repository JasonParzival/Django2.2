<script setup>
</script>

<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container">
        <a class="navbar-brand" href="#">Интернет-магазин</a>

        <ul class="navbar-nav">
          <li class="nav-item dropdown">
            <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              Пользователь
            </a>
            <ul class="dropdown-menu">
              <li><a class="dropdown-item" href="/admin">Aдминка</a></li>
            </ul>
          </li>
        </ul>

        <div class="navbar-nav">
          <router-link to="/products" class="nav-link">Товары</router-link>
          <router-link to="/categories" class="nav-link">Категории</router-link>
          <router-link to="/customers" class="nav-link">Клиент</router-link>
          <router-link to="/orders" class="nav-link">Заказы</router-link>
          <router-link to="/orderDetails" class="nav-link">Детали заказа</router-link>
        </div>
      </div>
    </nav>
    
    <router-view></router-view>
  </div>
</template>