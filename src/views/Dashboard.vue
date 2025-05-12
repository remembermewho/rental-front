<template>
  <div class="dashboard">
    <h2>Личный кабинет</h2>

    <div v-if="user">
      <p><strong>ФИО:</strong> {{ user.firstName }} {{ user.lastName }}</p>
      <p><strong>Email:</strong> {{ user.email }}</p>
      <p><strong>Роль:</strong> {{ translateRole(user.role) }}</p>
      <p><strong>Баланс:</strong> {{ user.balance }} сом</p>

      <button @click="logout">Выйти</button>

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
.dashboard {
  padding: 24px;
}
.actions {
  margin-top: 16px;
}
.actions button {
  margin-right: 12px;
  padding: 8px 16px;
}
</style>
