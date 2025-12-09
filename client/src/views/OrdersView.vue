<!--<template>
  <ProductList />
</template>

<script setup>
import ProductList from '../components/products/ProductList.vue'
</script>-->

<!-- ProductsComponent.vue -->
<script setup>
import axios from "axios";
import { ref, onBeforeMount, computed } from 'vue';
import Cookies from 'js-cookie';

const statusOptions = ref([
  { value: 'В обработке'},
  { value: 'В сборке' },
  { value: 'Собран' },
  { value: 'Отправлен' },
  { value: 'Доставлен' },
  { value: 'Отменен' }
])

const loading = ref(false);
const orders = ref([]);
const customers = ref([]);
const orderToAdd = ref({ order_number: null, date: null, status: '', customer: null });
const orderToEdit = ref({ id: null, order_number: null, date: null, status: '', customer: null });

const groupsById = computed(() => {
  const map = {};
  customers.value.forEach(cat => {
    map[cat.id] = cat;
  });
  return map;
});

onBeforeMount(() => {
  axios.defaults.headers.common['X-CSRFToken'] = Cookies.get("csrftoken");
})

async function fetchOrders() {
  loading.value = true;
  const r = await axios.get("/api/orders/");
  console.log(r.data)
  orders.value = r.data;
  loading.value = false;
}

async function fetchCustomers() {
  loading.value = true;
  const r = await axios.get("/api/customers/");
  console.log(r.data)
  customers.value = r.data;
  loading.value = false;
}

async function onOrderAdd() {
  await axios.post("/api/orders/", {
    ...orderToAdd.value,
  });
  await fetchOrders();
  await fetchCustomers();
  // Сброс формы
  orderToAdd.value = { order_number: null, date: null, status: '', customer: null };
}

async function onUpdateOrder() {
  await axios.put(`/api/orders/${orderToEdit.value.id}/`, {
    ...orderToEdit.value,
  });
  await fetchOrders();
}

async function onRemoveClick(order) {
  await axios.delete(`/api/orders/${order.id}/`);
  await fetchOrders(); 
}

async function onOrderEditClick(order) {
  orderToEdit.value = { ...order };
}

async function onLoadClick() {
  await fetchOrders();
  await fetchCustomers();
}

onBeforeMount(async () => {
  await fetchOrders();
  await fetchCustomers();
})
</script>

<template>
  <div class="container my-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Заказы</h1>
      <button @click="onLoadClick" class="btn btn-outline-primary">
        Обновить!
      </button>
    </div>

    <div class="container mb-5">
      <form @submit.prevent.stop="onOrderAdd">
        <div class="row">
          <div class="col">
            <div class="form-floating">
              <input
                type="text"
                class="form-control"
                v-model="orderToAdd.order_number"
                required
              />
              <label for="floatingInput">Номер заказа</label>
            </div>
          </div>
          <div class="col">
            <div class="form-floating">
              <input
                type="text"
                class="form-control"
                v-model="orderToAdd.date"
                required
              />
              <label for="floatingInput">Дата</label>
            </div>
          </div>
          <div class="col">
            <div class="form-floating">
              <select class="form-select" v-model="orderToAdd.status" required>
                <option :value="g.value" v-for="g in statusOptions">{{ g.value }}</option>
              </select>
              <label for="floatingInput">Статус</label>
            </div>
          </div>
          <div class="col-auto">
            <div class="form-floating">
              <select class="form-select" v-model="orderToAdd.customer" required>
                <option :value="g.id" v-for="g in customers">{{ g.name }}</option>
              </select>
              <label for="floatingInput">Клиенты</label>
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
    

    <div class="modal fade" id="editOrderModal" tabindex="-1">
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
                    v-model="orderToEdit.order_number"
                  />
                  <label for="floatingInput">Номер заказа</label>
                </div>
              </div>
              <div class="col-3">
                <div class="form-floating">
                  <input
                    type="text"
                    class="form-control"
                    v-model="orderToEdit.date"
                  />
                  <label for="floatingInput">Дата</label>
                </div>
              </div>
              <div class="col-3">
                <div class="form-floating">
                  <select class="form-select" v-model="orderToEdit.status">
                    <option :value="g.value" v-for="g in statusOptions">
                      {{ g.value }}
                    </option>
                  </select>
                  <label for="floatingInput">Статус</label>
                </div>
              </div>
              <div class="col-3">
                <div class="form-floating">
                  <select class="form-select" v-model="orderToEdit.customer">
                    <option :value="g.id" v-for="g in customers">
                      {{ g.name }}
                    </option>
                  </select>
                  <label for="floatingInput">Клиенты</label>
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
              @click="onUpdateOrder"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-for="item in orders" class="order-item card mb-3 shadow-sm">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h5 class="card-title text-primary mb-2">Номер заказа: {{ item.order_number }}</h5>
            <h5 class="card-title text-primary mb-2">{{ item.date }}</h5>
            <div class="d-flex align-items-center">
              <span class="badge bg-success me-2">Клиент:</span>
              <span class="text-muted">{{ groupsById[item.customer]?.name }}</span>
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="d-flex gap-2 justify-content-end">
              <button
                class="btn btn-outline-primary btn-lg"
                @click="onOrderEditClick(item)"
                data-bs-toggle="modal"
                data-bs-target="#editOrderModal"
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
        
        <div v-if="item.status" class="mt-3">
          <p class="card-text text-muted small">{{ item.status }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-item {
  transition: transform 0.2s;
}

.order-item:hover {
  transform: translateY(-2px);
}

.btn-lg {
  padding: 0.5rem 1rem;
  font-size: 1.1rem;
}
</style>