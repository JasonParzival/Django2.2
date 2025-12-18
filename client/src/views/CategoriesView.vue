<script setup>
import axios from "axios";
import { ref, onMounted, computed } from 'vue';
import Cookies from 'js-cookie';

const loading = ref(false);
const categories = ref([]);
const categoryToAdd = ref({ name: '', description: '' })
const categoryToEdit = ref({ id: null, name: '', description: '' })

const categoryStats = ref(null);

onMounted(() => {
  axios.defaults.headers.common['X-CSRFToken'] = Cookies.get("csrftoken");
})

async function loadCategoryStats() {
  const response = await axios.get('/api/categories/stats/');
  categoryStats.value = response.data;
}

async function fetchCategories() {
  loading.value = true
  const r = await axios.get("/api/categories/")
  categories.value = r.data
  loading.value = false
}

async function onCategoryAdd() {
  await axios.post("/api/categories/", {
    ...categoryToAdd.value,
  });
  await fetchCategories();
  // Сброс формы
  categoryToAdd.value = { name: '', description: '' };
}

async function onUpdateCategory() {
  await axios.put(`/api/categories/${categoryToEdit.value.id}/`, {
    ...categoryToEdit.value,
  });
  await fetchCategories();
}

async function onRemoveClick(category) {
  await axios.delete(`/api/categories/${category.id}/`);
  await fetchCategories(); 
}

async function onCategoryEditClick(category) {
  categoryToEdit.value = { ...category };
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
</script>

<template>
  <div class="container my-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Категории</h1>
      <button @click="onLoadClick" class="btn btn-outline-primary">
        Обновить!
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
    

    <div class="modal fade" id="editCategoryModal" tabindex="-1">
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
                    @click="onCategoryEditClick(item)"
                    data-bs-toggle="modal"
                    data-bs-target="#editCategoryModal"
                    title="Редактировать"
                  >
                    <i class="bi bi-pen-fill"></i>
                  </button>
                  <button 
                    class="btn btn-outline-danger btn-lg"
                    @click="onRemoveClick(item)"
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