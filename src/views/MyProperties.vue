<template>
  <div class="list-wrapper">
    <h2>Мои объекты</h2>

    <div v-if="properties.length" class="properties-list">
      <div v-for="prop in properties" :key="prop.id" class="property-card">
        <div class="left">
          <p class="title">{{ prop.propertyType }} — {{ prop.city }}</p>
          <p class="details">{{ prop.numberOfRooms }} комн, {{ prop.area }} м² — {{ prop.price }} сом/мес</p>
        </div>
        <div class="right">
          <button @click.stop="editProperty(prop.id)">Редактировать</button>
          <button @click.stop="addOrRemovePhoto(prop.id)">Добавить фото</button>
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
  const { data } = await api.get(`/properties/user/${userId}`)
  properties.value = data
})

const editProperty = (id) => router.push(`/properties/edit/${id}`)
const addOrRemovePhoto = (id) => router.push(`/properties/${id}/photos`)
</script>

<style scoped>
.list-wrapper {
  max-width: 900px;
  margin: auto;
  padding: 24px;
  font-family: Lato, sans-serif;
}

.properties-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.property-card {
  display: flex;
  justify-content: space-between;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
  cursor: pointer;
  transition: box-shadow 0.2s;
}

.property-card:hover {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.title {
  font-weight: 600;
  font-size: 16px;
}

.details {
  color: #666;
  font-size: 14px;
}

button {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 8px;
  font-size: 14px;
}

button:hover {
  background: #4338ca;
}
</style>
