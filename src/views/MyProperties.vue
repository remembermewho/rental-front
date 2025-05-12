<template>
    <div class="list-wrapper">
      <h2>Мои объекты</h2>
  
      <div v-if="properties.length">
        <div
          v-for="prop in properties"
          :key="prop.id"
          class="card"
          @click="goToDetail(prop.id)"
        >
          <p><strong>{{ prop.propertyType }}</strong> — {{ prop.city }}</p>
          <p>{{ prop.numberOfRooms }} комн, {{ prop.area }} м² — {{ prop.price }} сом</p>
          <div class="actions">
            <button @click.stop="editProperty(prop.id)">Редактировать</button>
            <button @click.stop="addOrRemovePhoto(prop.id)">Добавить/удалить фото</button>
          </div>
        </div>
      </div>
  
      <p v-else>У вас пока нет объектов</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import api from '@/services/api'
  import { useRouter } from 'vue-router'
  
  const properties = ref([])
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
  
    try {
      const { data } = await api.get(`/properties/user/${userId}`)
      properties.value = data
    } catch (e) {
      console.error('Ошибка загрузки объектов:', e)
    }
  })
  
  const editProperty = (id) => {
    router.push(`/properties/edit/${id}`)
  }
  
  const addOrRemovePhoto = (id) => {
    router.push(`/properties/${id}/photos`)
  }
  
  const goToDetail = (id) => {
    router.push(`/properties/${id}`)
  }
  </script>
  
  <style scoped>
  .list-wrapper {
    padding: 24px;
  }
  .card {
    border: 1px solid #ccc;
    padding: 12px;
    margin-bottom: 12px;
  }
  .card button {
    margin-right: 10px;
    padding: 6px 12px;
  }
  </style>
  