<template>
    <div class="list-wrapper">
      <h2>Список недвижимости</h2>
  
      <form class="filter-form" @submit.prevent="loadProperties">
        <input v-model="filters.region" placeholder="Регион" />
        <input v-model="filters.city" placeholder="Город" />
        <input v-model.number="filters.numberOfRooms" type="number" placeholder="Количество комнат" />
        <button type="submit">Фильтр</button>
        <button type="button" @click="resetFilters">Сбросить</button>
      </form>
  
      <p v-if="properties.length" class="total-count">Всего найдено: {{ properties.length }}</p>
  
      <div v-if="properties.length">
        <div
          v-for="prop in properties"
          :key="prop.id"
          class="card"
          @click="goToDetail(prop.id)"
        >
          <p><strong>{{ prop.propertyType }}</strong> — {{ prop.city }}</p>
          <p>{{ prop.numberOfRooms }} комн, {{ prop.area }} м² — {{ prop.price }} сом</p>
        </div>
      </div>
  
      <p v-else>Объявлений не найдено</p>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import api from '@/services/api'
  import { useRouter } from 'vue-router'
  
  const properties = ref([])
  const filters = ref({ region: '', city: '', numberOfRooms: null })
  const router = useRouter()
  
  const loadProperties = async () => {
    try {
      const nonEmptyFilters = Object.fromEntries(
        Object.entries(filters.value).filter(([_, v]) => v !== null && v !== '')
      )
  
      const response = await api.get('/properties', {
        params: nonEmptyFilters
      })
  
      properties.value = response.data
    } catch (e) {
      console.error('Ошибка при загрузке объектов:', e)
      properties.value = []
    }
  }
  
  const resetFilters = () => {
    filters.value = { region: '', city: '', numberOfRooms: null }
    loadProperties()
  }
  
  const goToDetail = (id) => {
    router.push(`/properties/${id}`)
  }
  
  onMounted(() => {
    loadProperties()
  })
  </script>
  
  <style scoped>
  .list-wrapper {
    padding: 24px;
  }
  .filter-form {
    margin-bottom: 16px;
  }
  .filter-form input {
    margin-right: 10px;
    padding: 6px;
  }
  .filter-form button {
    margin-right: 10px;
    padding: 6px 12px;
  }
  .total-count {
    font-weight: bold;
    margin-bottom: 10px;
  }
  .card {
    border: 1px solid #ccc;
    padding: 14px;
    margin-bottom: 10px;
    cursor: pointer;
  }
  .card:hover {
    background-color: #f0f0f0;
  }
  </style>
  