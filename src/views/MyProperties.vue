<template>
  <div class="list-wrapper">
    <h2>Мои объекты</h2>

    <div v-if="properties.length" class="properties-list">
      <div v-for="prop in properties" :key="prop.id" class="property-card">
        <div class="left">
          <p class="title">{{ prop.propertyType }} — {{ prop.city }}</p>
          <p class="details">{{ prop.numberOfRooms }} комн, {{ prop.area }} м² — {{ prop.price }} сом/мес</p>
          <p class="status" :class="{ active: prop.active, inactive: !prop.active }">
            {{ prop.active ? 'Объявление активно' : 'Объявление не активно' }}
          </p>
        </div>
        <div class="right">
          <button @click.stop="editProperty(prop.id)">Редактировать</button>
          <button @click.stop="addOrRemovePhoto(prop.id)">Фото</button>
          <button @click.stop="toggleActive(prop)">
            {{ prop.active ? 'Деактивировать' : 'Активировать' }}
          </button>
          <button @click.stop="deleteProperty(prop.id)">Удалить</button>
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

const fetchProperties = async () => {
  const userId = getUserIdFromToken()
  if (!userId) return router.push('/login')
  const { data } = await api.get(`/properties/user/${userId}`)
  properties.value = data
}

const editProperty = (id) => router.push(`/properties/edit/${id}`)
const addOrRemovePhoto = (id) => router.push(`/properties/${id}/photos`)

const toggleActive = async (property) => {
  const url = `/properties/${property.id}/${property.active ? 'deactivate' : 'activate'}`
  await api.put(url)
  await fetchProperties()
}


const deleteProperty = async (id) => {
  if (confirm('Удалить объект?')) {
    await api.delete(`/properties/${id}`)
    await fetchProperties()
  }
}

onMounted(fetchProperties)
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

.status {
  font-size: 13px;
  margin-top: 6px;
}
.status.active {
  color: green;
}
.status.inactive {
  color: red;
}

.right {
  display: flex;
  gap: 6px;
  align-items: center;
}

button {
  background: #e5e7eb;
  color: #111;
  border: 1px solid #ccc;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
}

button:hover {
  background: #d1d5db;
}
</style>
