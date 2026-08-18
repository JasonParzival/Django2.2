<template>
  <div class="modal fade" id="otpModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-sm">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title">🔐 Двухфакторная аутентификация</h5>
          <button 
            type="button" 
            class="btn-close btn-close-white" 
            data-bs-dismiss="modal"
            @click="onModalClose"
          ></button>
        </div>
        <div class="modal-body">
          <p class="text-muted">Введите 6-значный код из Google Authenticator</p>
          
          <div class="mb-3">
            <label class="form-label">Код подтверждения</label>
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
          
          <div v-if="error" class="alert alert-danger alert-sm">
            {{ error }}
          </div>
          
          <div v-if="success" class="alert alert-success alert-sm">
            {{ success }}
          </div>
          
          <div class="d-flex gap-2">
            <button
              class="btn btn-secondary w-50"
              @click="onCancel"
              :disabled="loading"
            >
              Отмена
            </button>
            <button
              class="btn btn-primary w-50"
              @click="verifyOTP"
              :disabled="loading || code.length !== 6"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              {{ loading ? 'Проверка...' : 'Подтвердить' }}
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <small class="text-muted">Код обновляется каждые 30 секунд</small>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { Modal } from 'bootstrap'

const emit = defineEmits(['verified', 'cancel'])

const code = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')
let modalInstance = null
let isVerified = false

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
      success.value = '✅ OTP подтвержден!'
      isVerified = true
      
      // Отправляем событие о подтверждении
      emit('verified')
      
      // Закрываем модалку через 500ms
      setTimeout(() => {
        hideModal()
        resetState()
      }, 500)
    }
  } catch (err) {
    if (err.response && err.response.data) {
      error.value = err.response.data.error || 'Неверный код'
    } else {
      error.value = 'Ошибка при проверке кода'
    }
    // При ошибке не закрываем модалку
  } finally {
    loading.value = false
  }
}

function onCancel() {
  hideModal()
  resetState()
  emit('cancel')
}

function onModalClose() {
  // Если пользователь закрыл крестиком и не было подтверждения
  if (!isVerified) {
    resetState()
    emit('cancel')
  }
}

function resetState() {
  code.value = ''
  error.value = ''
  success.value = ''
  loading.value = false
  isVerified = false
}

function showModal() {
  resetState()
  if (modalInstance) {
    modalInstance.show()
    // Фокус на поле ввода
    setTimeout(() => {
      const input = document.querySelector('#otpModal input')
      if (input) input.focus()
    }, 300)
  }
}

function hideModal() {
  if (modalInstance) {
    modalInstance.hide()
  }
}

onMounted(() => {
  const modalElement = document.getElementById('otpModal')
  if (modalElement) {
    modalInstance = new Modal(modalElement, {
      backdrop: 'static',
      keyboard: false
    })
    
    // Обработчик скрытия модалки
    modalElement.addEventListener('hidden.bs.modal', () => {
      // Если модалка скрыта без подтверждения
      if (!isVerified) {
        resetState()
        emit('cancel')
      }
    })
  }
})

onBeforeUnmount(() => {
  if (modalInstance) {
    modalInstance.dispose()
    modalInstance = null
  }
})

defineExpose({
  showModal,
  hideModal
})
</script>