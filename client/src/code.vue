<script setup>
import axios from "axios";
import { ref, onBeforeMount } from 'vue';
import Cookies from 'js-cookie';

import { computed } from 'vue';

const groupsById = computed(() => {
  const map = {};
  categories.value.forEach(cat => {
    map[cat.id] = cat;
  });
  return map;
});

const loading = ref(false);

const products = ref([]);

const categories = ref([]);

// Исправляем значения по умолчанию - для числовых полей используем null или 0
const productToAdd = ref({ name: '', price: null, description: '', quantity: null, category: null });
const productToEdit = ref({ id: null, name: '', price: null, description: '', quantity: null, category: null });


onBeforeMount(() => {
  axios.defaults.headers.common['X-CSRFToken'] = Cookies.get("csrftoken");
})

async function fetchProducts() {
  loading.value = true;
  const r = await axios.get("/api/products/");
  console.log(r.data)
  products.value = r.data;
  loading.value = false;
}

async function fetchCategories() {
  loading.value = true;
  const r = await axios.get("/api/categories/");
  console.log(r.data)
  categories.value = r.data;
  loading.value = false;
}

async function onProductAdd() {
  await axios.post("/api/products/", {
    ...productToAdd.value,
  });
  await fetchProducts();
  await fetchCategories();
}

async function onUpdateProduct() {
  await axios.put(`/api/products/${productToEdit.value.id}/`, {
    ...productToEdit.value,
  });
  await fetchProducts();
}

async function onRemoveClick(product) {
  await axios.delete(`/api/products/${product.id}/`);
  await fetchProducts(); 
}

async function onProductEditClick(product) {
  productToEdit.value = { ...product };
}

async function onLoadClick() {
  await fetchProducts()
  await fetchCategories()
}

onBeforeMount(async () => {
  await fetchProducts()
  await fetchCategories()
})
</script>

<template>
<div class="container my-5">
  <div class="container my-5">
    <button @click="onLoadClick">Обновить!</button>
  </div>

  <div class="container mb-5">
    <form @submit.prevent.stop="onProductAdd">
      <div class="row">
        <div class="col">
          <div class="form-floating">
            <input
              type="text"
              class="form-control"
              v-model="productToAdd.name"
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
            v-model="productToAdd.price"
            required
          />
          <label for="floatingInput">Цена</label>
        </div>
      </div>
      <div class="col">
        <div class="form-floating">
          <input
            type="text"
            class="form-control"
            v-model="productToAdd.description"
            required
          />
          <label for="floatingInput">Описание</label>
        </div>
      </div>
      <div class="col">
        <div class="form-floating">
          <input
            type="text"
            class="form-control"
            v-model="productToAdd.quantity"
            required
          />
          <label for="floatingInput">Количество</label>
        </div>
      </div>
      <div class="col-auto">
          <div class="form-floating">
            <select class="form-select" v-model="productToAdd.category" required>
              <option :value="g.id" v-for="g in categories">{{ g.name }}</option>
            </select>
            <label for="floatingInput">Категория</label>
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
  

  <div class="modal fade" id="editProductModal" tabindex="-1">
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
            <div class="col-3">
              <div class="form-floating">
                <input
                  type="text"
                  class="form-control"
                  v-model="productToEdit.name"
                />
                <label for="floatingInput">Название</label>
              </div>
            </div>
            <div class="col-2">
              <div class="form-floating">
                <input
                  type="text"
                  class="form-control"
                  v-model="productToEdit.price"
                />
                <label for="floatingInput">Цена</label>
              </div>
            </div>
            <div class="col-3">
              <div class="form-floating">
                <input
                  type="text"
                  class="form-control"
                  v-model="productToEdit.description"
                />
                <label for="floatingInput">Описание</label>
              </div>
            </div>
            <div class="col-2">
              <div class="form-floating">
                <input
                  type="text"
                  class="form-control"
                  v-model="productToEdit.quantity"
                />
                <label for="floatingInput">Количество</label>
              </div>
            </div>
            <div class="col-2">
              <div class="form-floating">
                <select class="form-select" v-model="productToEdit.category">
                  <option :value="g.id" v-for="g in categories">
                    {{ g.name }}
                  </option>
                </select>
                <label for="floatingInput">Группа</label>
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
            Close
          </button>
          <button
            data-bs-dismiss="modal"
            type="button"
            class="btn btn-primary"
            @click="onUpdateProduct"
          >
            Сохранить
          </button>
        </div>
      </div>
    </div>
  </div>

  <div v-for="item in products" class="product-item card mb-3 shadow-sm">
    <div class="card-body">
      <div class="row align-items-center">
        <!-- Информация о товаре -->
        <div class="col-md-6">
          <h5 class="card-title text-primary mb-2">{{ item.name }}</h5>
          <div class="d-flex align-items-center">
            <span class="badge bg-success me-2">Категория:</span>
            <span class="text-muted">{{ groupsById[item.category]?.name }}</span>
          </div>
        </div>
        
        <!-- Дополнительная информация -->
        <div class="col-md-3">
          <div class="product-meta">
            <small class="text-muted d-block">Цена: {{ item.price }} ₽</small>
            <small class="text-muted d-block">В наличии: {{ item.quantity }} шт.</small>
          </div>
        </div>
        
        <!-- Кнопки действий -->
        <div class="col-md-3">
          <div class="d-flex gap-2 justify-content-end">
            <button
              class="btn btn-outline-primary btn-lg"
              @click="onProductEditClick(item)"
              data-bs-toggle="modal"
              data-bs-target="#editProductModal"
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
</template>

<style scoped>

</style>
