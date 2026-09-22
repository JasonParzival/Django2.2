<script setup>
import { ref, computed } from 'vue'
import axios from 'axios'
import { useUserStore } from '../stores/userStore'

const userStore = useUserStore()

const cart = ref(
  JSON.parse(
    localStorage.getItem(`cart_user_${userStore.user?.id}`) || '[]'
  )
)

const totalPrice = computed(() => {
  return cart.value.reduce(
    (sum, item) => sum + Number(item.price) * item.cartQuantity,
    0
  )
})

function saveCart() {
  localStorage.setItem(
    `cart_user_${userStore.user?.id}`,
    JSON.stringify(cart.value)
  )
}

function increaseQuantity(item) {
  if (item.cartQuantity < item.quantity) {
    item.cartQuantity++
    saveCart()
  } else {
    alert('Нельзя добавить больше товара, чем есть на складе')
  }
}

function decreaseQuantity(item) {
  if (item.cartQuantity > 1) {
    item.cartQuantity--
    saveCart()
  }
}

function removeFromCart(item) {
  cart.value = cart.value.filter(cartItem => cartItem.id !== item.id)
  saveCart()
}

async function checkout() {
  if (cart.value.length === 0) {
    alert('Корзина пуста')
    return
  }

  const items = cart.value.map(item => ({
    product_id: item.id,
    quantity: item.cartQuantity
  }))

  try {
    const response = await axios.post(
      '/api/orders/checkout/',
      { items }
    )

    alert(
      `Заказ №${response.data.order_number} успешно оформлен!`
    )

    cart.value = []
    localStorage.removeItem(`cart_user_${userStore.user?.id}`)

  } catch (error) {
    console.error('Ошибка оформления заказа:', error)

    const message =
      error.response?.data?.error ||
      'Не удалось оформить заказ'

    alert(message)
  }
}
</script>

<template>
  <div class="container my-5">
    <h1 class="mb-4">Корзина</h1>

    <div v-if="cart.length === 0" class="alert alert-info">
      Корзина пуста
    </div>

    <div v-else>
      <div
        v-for="item in cart"
        :key="item.id"
        class="card mb-3 shadow-sm"
      >
        <div class="card-body">
          <div class="row align-items-center">

            <div class="col-md-2" v-if="item.picture">
              <img
                :src="item.picture"
                class="img-fluid"
                style="max-height: 100px"
                alt=""
              >
            </div>

            <div class="col-md-4">
              <h5>{{ item.name }}</h5>
              <p class="text-muted mb-0">
                Цена: {{ item.price }} ₽
              </p>
            </div>

            <div class="col-md-3">
              <div class="d-flex align-items-center gap-2">
                <button
                  class="btn btn-outline-secondary"
                  @click="decreaseQuantity(item)"
                >
                  −
                </button>

                <span class="fw-bold">
                  {{ item.cartQuantity }}
                </span>

                <button
                  class="btn btn-outline-secondary"
                  @click="increaseQuantity(item)"
                >
                  +
                </button>
              </div>
            </div>

            <div class="col-md-2">
              <strong>
                {{ Number(item.price) * item.cartQuantity }} ₽
              </strong>
            </div>

            <div class="col-md-1">
              <button
                class="btn btn-outline-danger"
                @click="removeFromCart(item)"
              >
                ×
              </button>
            </div>

          </div>
        </div>
      </div>

      <div class="card mt-4">
        <div class="card-body d-flex justify-content-between align-items-center">
          <h4 class="mb-0">
            Итого: {{ totalPrice }} ₽
          </h4>

          <button class="btn btn-success btn-lg"
            @click="checkout">
            Оформить заказ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>