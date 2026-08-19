<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import Cookies from 'js-cookie'
import { useUserStore } from '../stores/userStore'

const router = useRouter()
const userStore = useUserStore()

const username = ref('')
const password = ref('')
const rememberMe = ref(false)
const error = ref('')
const loading = ref(false)

async function login() {
  error.value = ''
  loading.value = true
  
  try {
    const csrftoken = Cookies.get('csrftoken')
    if (csrftoken) {
      axios.defaults.headers.common['X-CSRFToken'] = csrftoken
    }
    
    const result = await userStore.login(username.value, password.value, rememberMe.value) 
    
    if (result.success) {
      router.push('/products')
    } else {
      error.value = result.error
    }
  } catch (err) {
    error.value = 'Произошла ошибка при входе'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h3 class="mb-0">Вход в систему</h3>
          </div>
          <div class="card-body">
            <form @submit.prevent="login">
              <div class="mb-3">
                <label for="username" class="form-label">Имя пользователя</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="username"
                  v-model="username"
                  required
                  :disabled="loading"
                  autofocus
                >
              </div>
              
              <div class="mb-3">
                <label for="password" class="form-label">Пароль</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password"
                  v-model="password"
                  required
                  :disabled="loading"
                >
              </div>
              
              <div class="mb-3 form-check">
                <input 
                  type="checkbox" 
                  class="form-check-input" 
                  id="rememberMe"
                  v-model="rememberMe"
                >
                <label class="form-check-label" for="rememberMe">
                  Запомнить меня
                </label>
              </div>
              
              <div v-if="error" class="alert alert-danger">
                {{ error }}
              </div>
              
              <button 
                type="submit" 
                class="btn btn-primary w-100"
                :disabled="loading"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ loading ? 'Вход...' : 'Войти' }}
              </button>
            </form>
            
            <hr>
            
            <p class="text-center mb-0">
              Нет аккаунта? 
              <router-link to="/register">Зарегистрироваться</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>