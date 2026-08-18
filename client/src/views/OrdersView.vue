<script setup>
import axios from "axios";
import { ref, onMounted, computed } from 'vue';
import Cookies from 'js-cookie';
import UserFilter from '../components/UserFilter.vue'
import OTPModal from '../components/OTPModal.vue'
import { Modal } from 'bootstrap'
import FilterPanel from '../components/FilterPanel.vue'

const filterUserId = ref('')

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

const orderStats = ref(null);

const otpModalRef = ref(null)
const editModalRef = ref(null)
const pendingEditItem = ref(null)
const pendingDeleteItem = ref(null)
const isOTPVerified = ref(false)

const filterCustomers = ref([])
const fieldFilters = ref([
  { key: 'order_number', label: 'Номер заказа', type: 'text', placeholder: 'Фильтровать по номеру...' },
  { key: 'date_from', label: 'Дата от', type: 'date' },
  { key: 'date_to', label: 'Дата до', type: 'date' },
  { 
    key: 'status', 
    label: 'Статус', 
    type: 'select', 
    placeholder: 'Все статусы',
    options: statusOptions.value.map(s => ({ value: s.value, label: s.value }))
  },
])
const activeFieldFilters = ref({})

const groupsById = computed(() => {
  const map = {};
  customers.value.forEach(cat => {
    map[cat.id] = cat;
  });
  return map;
});

/*onMounted(() => {
  axios.defaults.headers.common['X-CSRFToken'] = Cookies.get("csrftoken");
})*/

async function fetchFilterCustomers() {
  try {
    const r = await axios.get('/api/customers/')
    filterCustomers.value = r.data.map(c => ({
      id: c.id,
      name: c.name
    }))
    if (!fieldFilters.value.find(f => f.key === 'customer')) {
      fieldFilters.value.push({
        key: 'customer',
        label: 'Клиент',
        type: 'select',
        placeholder: 'Все клиенты',
        options: filterCustomers.value
      })
    }
  } catch (err) {
    console.error('Ошибка загрузки клиентов для фильтра:', err)
  }
}

async function checkOTPBeforeEdit(item) {
  if (isOTPVerified.value) {
    onOrderEditClick(item)
    return
  }
  
  pendingEditItem.value = item
  
  try {
    const response = await axios.get('/api/otp/status/')
    if (response.data.otp_verified) {
      isOTPVerified.value = true
      onOrderEditClick(item)
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
    onOrderEditClick(itemToEdit)
  }
}

function onOTPCancel() {
  pendingEditItem.value = null
  pendingDeleteItem.value = null
}

async function loadOrderStats() {
  const response = await axios.get('/api/orders/stats/');
  orderStats.value = response.data;
}

async function fetchOrders() {
  loading.value = true;
  
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
  
  const url = `/api/orders/?${params.toString()}`
  const r = await axios.get(url);
  console.log(r.data)
  orders.value = r.data;
  loading.value = false;
}

function onFilterChange(userId) {
  filterUserId.value = userId;
  fetchOrders();        
  loadOrderStats();     
}

function onFieldFilterChange(filters) {
  activeFieldFilters.value = filters
  fetchOrders()
  loadOrderStats()
}

function onFieldFilterReset() {
  activeFieldFilters.value = {}
  fetchOrders()
  loadOrderStats()
}

async function fetchCustomers() {
  loading.value = true;
  const r = await axios.get("/api/customers/");
  console.log(r.data)
  customers.value = r.data;
  loading.value = false;
}

async function onOrderAdd() {
  try {
    await axios.post("/api/orders/", {
      ...orderToAdd.value,
    });
    await fetchOrders();
    await fetchCustomers();
    orderToAdd.value = { order_number: null, date: null, status: '', customer: null };
  } catch (error) {
    console.error('Error details:', error.response.data);
    alert('Ошибка при добавлении заказа: ' + JSON.stringify(error.response.data));
  }
}

async function onUpdateOrder() {
  try {
    await axios.put(`/api/orders/${orderToEdit.value.id}/`, {
      ...orderToEdit.value,
    });
    await fetchOrders();
  } catch (error) {
    console.error('Error details:', error.response.data);
    alert('Ошибка при обновлении заказа: ' + JSON.stringify(error.response.data));
  }
}

async function onRemoveClick(order) {
  if (confirm(`Удалить заказ №${order.order_number}?`)) {
    try {
      await axios.delete(`/api/orders/${order.id}/`);
      await fetchOrders();
    } catch (error) {
      console.error('Error details:', error.response.data);
      alert('Ошибка при удалении заказа: ' + JSON.stringify(error.response.data));
    }
  }
}

async function onOrderEditClick(order) {
  orderToEdit.value = { ...order }
  if (editModalRef.value) {
    const modal = new Modal(editModalRef.value)
    modal.show()
  }
}

async function onLoadClick() {
  loading.value = true;
  try {
    await Promise.all([fetchOrders(), fetchCustomers(), loadOrderStats(), fetchFilterCustomers()]);
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
    <UserFilter @filter-change="onFilterChange" />

    <FilterPanel 
      :filters="fieldFilters" 
      @filter-change="onFieldFilterChange"
      @filter-reset="onFieldFilterReset"
    />

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
    
  <OTPModal ref="otpModalRef" @verified="onOTPVerified" @cancel="onOTPCancel" />

    <div class="modal fade" id="editOrderModal" tabindex="-1" ref="editModalRef">
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

    

    <div class="container" style="display: flex; gap: 20px">
      <div class="container">
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
            
            <div v-if="item.status" class="mt-3">
              <p class="card-text text-muted small">{{ item.status }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="stats">
        <h3>📊 Статистика по заказам</h3>
        <div class="stats-card">
          <p><strong>Всего заказов:</strong> <span id="total-orders-count">{{ orderStats?.total_count ?? 'Загрузка...' }}</span></p>
          <p><strong>Заказов сегодня:</strong> <span id="orders-today">{{ orderStats?.orders_today ?? 'Загрузка...' }}</span></p>
          <p><strong>Заказов в этом месяце:</strong> 
            <span id="orders-this-month">{{ orderStats?.orders_this_month ?? 'Загрузка...' }}</span>
          </p>
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