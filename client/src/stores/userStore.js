import { defineStore } from 'pinia'
import axios from 'axios'
import Cookies from 'js-cookie'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    token: null,
    rememberMe: false,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    isSuperuser: (state) => state.user?.is_superuser || false,
    username: (state) => state.user?.username || 'Пользователь',
  },
  
  actions: {
    setToken(token, remember = false) {
      this.token = token
      this.rememberMe = remember
      
      if (token) {
        if (remember) {
          localStorage.setItem('authToken', token)
        } else {
          sessionStorage.setItem('authToken', token)
        }
        axios.defaults.headers.common['Authorization'] = `Token ${token}`
      } else {
        localStorage.removeItem('authToken')
        sessionStorage.removeItem('authToken')
        delete axios.defaults.headers.common['Authorization']
      }
    },
    
    setUser(user) {
      this.user = user
      if (user) {
        localStorage.setItem('userData', JSON.stringify(user))
      } else {
        localStorage.removeItem('userData')
      }
    },
    
    async login(username, password, remember = false) {
      try {
        const response = await axios.post('/api/login/', { username, password })
        
        const token = response.data.token
        const userData = response.data.user || { username }
        
        this.setToken(token, remember)
        this.setUser(userData)
        
        return { success: true, user: userData }
      } catch (error) {
        const message = error.response?.data?.error || 'Ошибка входа'
        return { success: false, error: message }
      }
    },
    
    async register(userData) {
      try {
        const response = await axios.post('/api/register/', userData)
        
        const token = response.data.token
        const user = response.data.user
        
        this.setToken(token, false)
        this.setUser(user)
        
        return { success: true, user }
      } catch (error) {
        const errors = error.response?.data || { non_field_errors: ['Ошибка регистрации'] }
        return { success: false, errors }
      }
    },
    
    logout() {
      this.setToken(null)
      this.setUser(null)
      this.rememberMe = false
    },
    
    restoreUser() {
      let token = localStorage.getItem('authToken')
      let remember = true
      
      if (!token) {
        token = sessionStorage.getItem('authToken')
        remember = false
      }
      
      if (token) {
        this.token = token
        axios.defaults.headers.common['Authorization'] = `Token ${token}`
        
        const userData = localStorage.getItem('userData')
        if (userData) {
          try {
            this.user = JSON.parse(userData)
          } catch (e) {
            this.user = null
          }
        }
        return true
      }
      return false
    },
  },
})