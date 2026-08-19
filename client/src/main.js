import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios' 
import "bootstrap/dist/css/bootstrap.css"
//import "bootstrap-icons/font/bootstrap-icons.min.css"
//import "bootstrap/dist/js/bootstrap"
import * as bootstrap from 'bootstrap'

window.bootstrap = bootstrap

import App from './App.vue'
import router from './router'
import { useUserStore } from './stores/userStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

const userStore = useUserStore()
userStore.restoreUser()

app.mount('#app')
