<template>
  <div class="dashboard">
    <h2>Личный кабинет</h2>

    <div v-if="user" class="card">
      <p><strong>ФИО:</strong> {{ user.firstName }} {{ user.lastName }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Роль:</strong> {{ translateRole(user.role) }}</p>
      <p><strong>Баланс:</strong> {{ user.balance }} сом</p>
      <p><strong>Телефон номер:</strong> {{ user.phoneNumber }}</p>

      <div class="actions">
        <button v-if="user.role === 'landlord'" @click="router.push('/my-properties')">
          Мои объекты
        </button>
        <button v-if="user.role === 'landlord'" @click="router.push('/rental-requests')">
          Запросы на аренду
        </button>
        <button v-if="user.role === 'tenant'" @click="router.push('/my-rentals')">
          Мои аренды
        </button>
        <button v-if="user.role === 'tenant'" @click="router.push('/my-requests')">
          Мои заявки
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useRouter } from 'vue-router'
import { translateRole } from '@/utils/translations.js'

const user = ref(null)
const router = useRouter()

const getUserIdFromToken = () => {
  const token = localStorage.getItem('token')
  if (!token) return null
  const payload = JSON.parse(atob(token.split('.')[1]))
  return payload.id
}

onMounted(async () => {
  const userId = getUserIdFromToken()
  if (!userId) return router.push('/login')

  const response = await api.get(`/users/${userId}`)
  user.value = response.data
})

const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');

* {
  font-family: 'Lato', sans-serif;
  box-sizing: border-box;
}

.dashboard {
  max-width: 600px;
  margin: 40px auto;
  padding: 24px;
}

h2 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #424242;
  text-align: center;
}

.card {
  background-color: #f8f8f8;
  border: 1px solid #efefef;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.card p {
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
}

.actions {
  margin-top: 16px;
}

.actions button {
  margin-right: 12px;
  margin-bottom: 12px;
  padding: 8px 14px;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.2s, transform 0.2s;
}

.actions button:hover {
  background-color: #4338ca;
  transform: translateY(-1px);
}

.logout-btn {
  display: block;
  width: auto;
  margin: 24px auto 0;
  padding: 6px 12px;
  background-color: #e11d48;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: background-color 0.2s, transform 0.2s;
}

.logout-btn:hover {
  background-color: #be123c;
  transform: translateY(-1px);
}
</style>
