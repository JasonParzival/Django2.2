<script setup>
import axios from "axios";
import { ref, onMounted, computed } from 'vue';
import Cookies from 'js-cookie';
import UserFilter from '../components/UserFilter.vue'
import OTPModal from '../components/OTPModal.vue'
import { Modal } from 'bootstrap'
import FilterPanel from '../components/FilterPanel.vue'

const filterUserId = ref('')

const loading = ref(false);
const categories = ref([]);
const categoryToAdd = ref({ name: '', description: '' })
const categoryToEdit = ref({ id: null, name: '', description: '' })

const categoryStats = ref(null);

const otpModalRef = ref(null)
const editModalRef = ref(null)
const pendingEditItem = ref(null)
const pendingDeleteItem = ref(null)
const isOTPVerified = ref(false)

const fieldFilters = ref([
  { key: 'name', label: 'Название', type: 'text', placeholder: 'Фильтровать по названию...' },
  { key: 'description', label: 'Описание', type: 'text', placeholder: 'Фильтровать по описанию...' },
])

const activeFieldFilters = ref({})

/*onMounted(() => {
  axios.defaults.headers.common['X-CSRFToken'] = Cookies.get("csrftoken");
})*/

async function checkOTPBeforeEdit(item) {
  if (isOTPVerified.value) {
    onCategoryEditClick(item)
    return
  }
  
  pendingEditItem.value = item
  
  try {
    const response = await axios.get('/api/otp/status/')
    if (response.data.otp_verified) {
      isOTPVerified.value = true
      onCategoryEditClick(item)
      pendingEditItem.value = null
    } else {
      otpModalRef.value?.showModal()
    }
  } catch (err) {
    otpModalRef.value?.showModal()
  }
}

async function checkOTPBeforeDelete(item) {
  if (isOTPVerified.value) {
    onRemoveClick(item)
    return
  }
  
  pendingDeleteItem.value = item
  
  try {
    const response = await axios.get('/api/otp/status/')
    if (response.data.otp_verified) {
      isOTPVerified.value = true
      onRemoveClick(item)
      pendingDeleteItem.value = null
    } else {
      otpModalRef.value?.showModal()
    }
  } catch (err) {
    otpModalRef.value?.showModal()
  }
}

function onOTPVerified() {
  isOTPVerified.value = true
  
  if (pendingEditItem.value) {
    const itemToEdit = pendingEditItem.value
    pendingEditItem.value = null
    onCategoryEditClick(itemToEdit)
  }
}

function onOTPCancel() {
  pendingEditItem.value = null
  pendingDeleteItem.value = null
}

async function loadCategoryStats() {
  const response = await axios.get('/api/categories/stats/');
  categoryStats.value = response.data;
}

async function fetchCategories() {
  loading.value = true
  
  const params = new URLSearchParams()
  
  if (filterUserId.value) {
    params.append('user_id', filterUserId.value)
  }
  
  Object.keys(activeFieldFilters.value).forEach(key => {
    const val = activeFieldFilters.value[key]
    if (val !== '' && val !== null && val !== undefined) {
      params.append(key, val)
    }
  })
  
  const url = `/api/categories/?${params.toString()}`
  const r = await axios.get(url)
  categories.value = r.data
  loading.value = false
}

function onFilterChange(userId) {
  filterUserId.value = userId
  fetchCategories()      
  loadCategoryStats()    
}

function onFieldFilterChange(filters) {
  activeFieldFilters.value = filters
  fetchCategories()
  loadCategoryStats()
}

function onFieldFilterReset() {
  activeFieldFilters.value = {}
  fetchCategories()
  loadCategoryStats()
}

async function onCategoryAdd() {
  try {
    await axios.post("/api/categories/", {
      ...categoryToAdd.value,
    });
    await fetchCategories();
    categoryToAdd.value = { name: '', description: '' };
  } catch (error) {
    console.error('Error details:', error.response.data);
    alert('Ошибка при добавлении категории: ' + JSON.stringify(error.response.data));
  }
}

async function onUpdateCategory() {
  try {
    await axios.put(`/api/categories/${categoryToEdit.value.id}/`, {
      ...categoryToEdit.value,
    });
    await fetchCategories();
  } catch (error) {
    console.error('Error details:', error.response.data);
    alert('Ошибка при обновлении категории: ' + JSON.stringify(error.response.data));
  }
}

async function onRemoveClick(category) {
  if (confirm(`Удалить категорию "${category.name}"?`)) {
    try {
      await axios.delete(`/api/categories/${category.id}/`);
      await fetchCategories();
    } catch (error) {
      console.error('Error details:', error.response.data);
      alert('Ошибка при удалении категории: ' + JSON.stringify(error.response.data));
    }
  }
}

async function onCategoryEditClick(category) {
  categoryToEdit.value = { ...category }
  if (editModalRef.value) {
    const modal = new Modal(editModalRef.value)
    modal.show()
  }
}

async function onLoadClick() {
  await fetchCategories()
  loading.value = true;
  try {
    await Promise.all([fetchCategories(), loadCategoryStats()]);
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await onLoadClick()
})

function exportData() {
  const params = new URLSearchParams()
  
  if (filterUserId.value) {
    params.append('user_id', filterUserId.value)
  }
  
  Object.keys(activeFieldFilters.value).forEach(key => {
    const val = activeFieldFilters.value[key]
    if (val !== '' && val !== null && val !== undefined) {
      params.append(key, val)
    }
  })
  
  const url = `/api/categories/export/?${params.toString()}`
  
  const token = localStorage.getItem('authToken')
  
  fetch(url, {
    headers: {
      'Authorization': `Token ${token}`
    }
  })
  .then(response => response.blob().then(blob => {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    
    const contentDisposition = response.headers.get('Content-Disposition')
    let filename = 'export.xlsx'
    if (contentDisposition) {
      const match = contentDisposition.match(/filename="(.+)"/)
      if (match) filename = match[1]
    }
    
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(link.href)
  }))
  .catch(error => {
    console.error('Ошибка экспорта:', error)
    alert('Ошибка при экспорте данных')
  })
}
</script>

<template>
  <div class="container my-5">
    <UserFilter @filter-change="onFilterChange" />

    <FilterPanel 
      :filters="fieldFilters" 
      @filter-change="onFieldFilterChange"
      @filter-reset="onFieldFilterReset"
    />
    
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Категории</h1>
      <button @click="onLoadClick" class="btn btn-outline-primary">
        Обновить!
      </button>
      <button @click="exportData" class="btn btn-success ms-2">
        Экспорт в Excel
      </button>
    </div>

    <div class="container mb-5">
      <form @submit.prevent.stop="onCategoryAdd">
        <div class="row">
          <div class="col">
            <div class="form-floating">
              <input
                type="text"
                class="form-control"
                v-model="categoryToAdd.name"
                required
              />
              <label for="floatingInput">Название</label>
            </div>
          </div>
          <div class="col">
            <div class="form-floating">
              <input
                type="text"
                class="form-control"
                v-model="categoryToAdd.description"
                required
              />
              <label for="floatingInput">Описание</label>
            </div>
          </div>
          <div class="col-auto">
            <button class="btn btn-primary">
              Добавить
            </button>
          </div>
        </div>
      </form>
    </div>
    
  <OTPModal ref="otpModalRef" @verified="onOTPVerified" @cancel="onOTPCancel" />

    <div class="modal fade" id="editCategoryModal" tabindex="-1" ref="editModalRef">
      <div class="modal-dialog modal-lg">
        <div class="modal-content pb-3">
          <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">
              Редактирование
            </h1>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-6">
                <div class="form-floating">
                  <input
                    type="text"
                    class="form-control"
                    v-model="categoryToEdit.name"
                  />
                  <label for="floatingInput">Название</label>
                </div>
              </div>
              <div class="col-6">
                <div class="form-floating">
                  <input
                    type="text"
                    class="form-control"
                    v-model="categoryToEdit.description"
                  />
                  <label for="floatingInput">Описание</label>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Закрыть
            </button>
            <button
              data-bs-dismiss="modal"
              type="button"
              class="btn btn-primary"
              @click="onUpdateCategory"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>

    

    <div class="container" style="display: flex; gap: 20px">
      <div class="container">
        <div v-for="item in categories" class="сategory-item card mb-3 shadow-sm">
          <div class="card-body">
            <div class="row align-items-center">

              <div class="col-md-6">
                <h5 class="card-title text-primary mb-2">{{ item.name }}</h5>
              </div>
              
              <div class="col-md-6">
                <div class="d-flex gap-2 justify-content-end">
                  <button
                    class="btn btn-outline-primary btn-lg"
                    @click="checkOTPBeforeEdit(item)"
                    title="Редактировать"
                  >
                    <i class="bi bi-pen-fill"></i>
                  </button>
                  <button 
                    class="btn btn-outline-danger btn-lg"
                    @click="checkOTPBeforeDelete(item)"
                    title="Удалить"
                  >
                    <i class="bi bi-x-lg"></i>
                  </button>
                </div>
              </div>
            </div>
          
            <div v-if="item.description" class="mt-3">
              <p class="card-text text-muted small">{{ item.description }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="stats">
        <h3>📊 Статистика по категориям</h3>
        <div class="stats-card">
          <p><strong>Всего категорий:</strong> <span id="total-categories">{{ categoryStats?.total_count ?? 'Загрузка...' }}</span></p>
          <p><strong>Всего товаров:</strong> <span id="total-products-all">{{ categoryStats?.total_products ?? 'Загрузка...'}}</span></p>
          <p><strong>Среднее в категории: </strong> 
            <span id="avg-per-category">{{ categoryStats?.avg_products_per_category ?? 'Загрузка...'}}</span>
          </p>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.сategory-item {
  transition: transform 0.2s;
}

.сategory-item:hover {
  transform: translateY(-2px);
}

.btn-lg {
  padding: 0.5rem 1rem;
  font-size: 1.1rem;
}
</style>