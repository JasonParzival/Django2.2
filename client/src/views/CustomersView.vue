<!--<template>
  <ProductList />
</template>

<script setup>
import ProductList from '../components/customers/CustomerList.vue'
</script>-->

<script setup>
import axios from "axios";
import { ref, onBeforeMount, computed } from 'vue';
import Cookies from 'js-cookie';

const loading = ref(false);
const customers = ref([]);
const customerToAdd = ref({ name: '', address: '', phone_number: '', email: '' });
const customerToEdit = ref({ id: null, name: '', address: '', phone_number: '', email: '' });

onBeforeMount(() => {
  axios.defaults.headers.common['X-CSRFToken'] = Cookies.get("csrftoken");
})

async function fetchCustomers() {
  loading.value = true;
  const r = await axios.get("/api/customers/");
  customers.value = r.data;
  loading.value = false;
}

async function onCustomerAdd() {
  await axios.post("/api/customers/", {
    ...customerToAdd.value,
  });
  await fetchCustomers();
  // Сброс формы
  customerToAdd.value = { name: '', address: '', phone_number: '', email: '' };
}

async function onUpdateCustomer() {
  await axios.put(`/api/customers/${customerToEdit.value.id}/`, {
    ...сustomerToEdit.value,
  });
  await fetchCustomers();
}

async function onRemoveClick(customer) {
  await axios.delete(`/api/customers/${customer.id}/`);
  await fetchCustomers(); 
}

async function onCustomerEditClick(customer) {
  сustomerToEdit.value = { ...customer };
}

async function onLoadClick() {
  await fetchCustomers()
}

onBeforeMount(async () => {
  await fetchCustomers()
})
</script>

<template>
  <div class="container my-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Клиенты</h1>
      <button @click="onLoadClick" class="btn btn-outline-primary">
        Обновить!
      </button>
    </div>

    <div class="container mb-5">
      <form @submit.prevent.stop="onCustomerAdd">
        <div class="row">
          <div class="col">
            <div class="form-floating">
              <input
                type="text"
                class="form-control"
                v-model="customerToAdd.name"
                required
              />
              <label for="floatingInput">ФИО</label>
            </div>
          </div>
          <div class="col">
            <div class="form-floating">
              <input
                type="text"
                class="form-control"
                v-model="customerToAdd.address"
                required
              />
              <label for="floatingInput">Адрес</label>
            </div>
          </div>
          <div class="col">
            <div class="form-floating">
              <input
                type="text"
                class="form-control"
                v-model="customerToAdd.phone_number"
                required
              />
              <label for="floatingInput">Номер телефона</label>
            </div>
          </div>
          <div class="col">
            <div class="form-floating">
              <input
                type="text"
                class="form-control"
                v-model="customerToAdd.email"
                required
              />
              <label for="floatingInput">Электронная почта</label>
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
    

    <div class="modal fade" id="editCustomerModal" tabindex="-1">
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
                    v-model="customerToEdit.name"
                  />
                  <label for="floatingInput">ФИО</label>
                </div>
              </div>
              <div class="col-3">
                <div class="form-floating">
                  <input
                    type="text"
                    class="form-control"
                    v-model="customerToEdit.address"
                  />
                  <label for="floatingInput">Адрес</label>
                </div>
              </div>
              <div class="col-3">
                <div class="form-floating">
                  <input
                    type="text"
                    class="form-control"
                    v-model="customerToEdit.phone_number"
                  />
                  <label for="floatingInput">Номер телефона</label>
                </div>
              </div>
              <div class="col-3">
                <div class="form-floating">
                  <input
                    type="text"
                    class="form-control"
                    v-model="customerToEdit.email"
                  />
                  <label for="floatingInput">Электронный адрес</label>
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
              @click="onUpdateCustomer"
            >
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-for="item in customers" class="customer-item card mb-3 shadow-sm">
      <div class="card-body">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h5 class="card-title text-primary mb-2">{{ item.name }}</h5>
          </div>
          
          <div class="col-md-3">
            <div class="product-meta">
              <small class="text-muted d-block">Адрес: {{ item.address }}</small>
              <small class="text-muted d-block">Номер телефона: {{ item.phone_number }}</small>
            </div>
          </div>
          
          <div class="col-md-3">
            <div class="d-flex gap-2 justify-content-end">
              <button
                class="btn btn-outline-primary btn-lg"
                @click="onCustomerEditClick(item)"
                data-bs-toggle="modal"
                data-bs-target="#editCustomerModal"
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
        
        <div v-if="item.email" class="mt-3">
          <p class="card-text text-muted small">{{ item.email }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.customer-item {
  transition: transform 0.2s;
}

.customer-item:hover {
  transform: translateY(-2px);
}

.btn-lg {
  padding: 0.5rem 1rem;
  font-size: 1.1rem;
}
</style>