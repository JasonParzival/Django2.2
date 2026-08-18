<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h3 class="mb-0">Двухфакторная аутентификация</h3>
          </div>
          <div class="card-body">
            <div v-if="otpVerified" class="alert alert-success">
              OTP подтвержден! Вы можете редактировать данные.
              <br>
              <small>Подтверждение действительно 60 секунд</small>
            </div>
            
            <div v-else>
              <p class="text-muted">
                Для защиты ваших данных, перед редактированием необходимо подтверждение через Google Authenticator.
              </p>
              
              <div class="mb-3">
                <label class="form-label">Введите 6-значный код</label>
                <input
                  type="text"
                  class="form-control form-control-lg text-center"
                  v-model="code"
                  maxlength="6"
                  placeholder="000000"
                  @input="onCodeInput"
                  autofocus
                />
              </div>
              
              <div v-if="error" class="alert alert-danger">
                {{ error }}
              </div>
              
              <div v-if="success" class="alert alert-success">
                {{ success }}
              </div>
              
              <button
                class="btn btn-primary w-100"
                @click="verifyOTP"
                :disabled="loading || code.length !== 6"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                {{ loading ? 'Проверка...' : 'Подтвердить OTP' }}
              </button>
            </div>
            
            <hr>
            
            <div class="mt-3">
              <h6>Информация:</h6>
              <ul class="text-muted small">
                <li>Код обновляется каждые 30 секунд</li>
                <li>После подтверждения у вас есть 60 секунд на редактирование</li>
                <li>Если время истекло, нужно подтвердить снова</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const code = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')
const otpVerified = ref(false)

function onCodeInput() {
  code.value = code.value.replace(/\D/g, '')
}

async function verifyOTP() {
  if (code.value.length !== 6) return
  
  error.value = ''
  success.value = ''
  loading.value = true
  
  try {
    const response = await axios.post('/api/otp/verify/', {
      code: code.value
    })
    
    if (response.data.success) {
      success.value = 'OTP подтвержден! Теперь вы можете редактировать данные.'
      otpVerified.value = true
      code.value = ''
    }
  } catch (err) {
    if (err.response && err.response.data) {
      error.value = err.response.data.error || 'Неверный код'
    } else {
      error.value = 'Ошибка при проверке кода'
    }
  } finally {
    loading.value = false
  }
}

async function checkStatus() {
  try {
    const response = await axios.get('/api/otp/status/')
    otpVerified.value = response.data.otp_verified
  } catch (err) {
    console.error('Ошибка проверки статуса:', err)
  }
}

onMounted(() => {
  checkStatus()
  setInterval(checkStatus, 5000)
})
</script>