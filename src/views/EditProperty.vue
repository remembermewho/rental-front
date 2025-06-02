<template>
  <div class="edit-wrapper">
    <h2>Редактирование объекта</h2>
    <form @submit.prevent="submitForm">
      <!-- Основные поля -->
      <input v-model="form.propertyType" placeholder="Тип недвижимости" required />
      <input v-model.number="form.numberOfRooms" type="number" placeholder="Количество комнат" required />
      <input v-model="form.houseSeries" placeholder="Серия дома" required />
      <input v-model="form.buildingType" placeholder="Тип строения" required />
      <input v-model.number="form.floor" type="number" placeholder="Этаж" required />
      <input v-model.number="form.area" type="number" placeholder="Площадь (м²)" required />
      <input v-model="form.condition" placeholder="Состояние" required />
      <input v-model="form.region" placeholder="Регион" required />
      <input v-model="form.city" placeholder="Город" required />
      <input v-model="form.district" placeholder="Район" required />
      <input v-model="form.street" placeholder="Улица" required />
      <input v-model="form.houseNumber" placeholder="Номер дома" required />

      <!-- Карта -->
      <div ref="mapContainer" class="map"></div>
      <p class="note">Кликните на карту, чтобы обновить координаты</p>

      <input v-model.number="form.latitude" type="number" placeholder="Широта" readonly />
      <input v-model.number="form.longitude" type="number" placeholder="Долгота" readonly />

      <input v-model.number="form.price" type="number" placeholder="Цена (сом)" required />
      <textarea v-model="form.announcementText" placeholder="Описание"></textarea>

      <button type="submit">Сохранить</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const route = useRoute()
const router = useRouter()
const form = ref({})
const mapContainer = ref(null)
let mapInstance = null
let marker = null

onMounted(async () => {
  const { data } = await api.get(`/properties/${route.params.id}`)
  form.value = data

  await nextTick() // ждём отрисовки

  initMap()
})

const initMap = () => {
  const lat = form.value.latitude || 42.87
  const lng = form.value.longitude || 74.59

  mapInstance = L.map(mapContainer.value, { center: [lat, lng], zoom: 15 })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance)

  marker = L.marker([lat, lng]).addTo(mapInstance)

  mapInstance.on('click', e => {
    form.value.latitude = +e.latlng.lat.toFixed(6)
    form.value.longitude = +e.latlng.lng.toFixed(6)
    marker.setLatLng(e.latlng)
  })
}

const submitForm = async () => {
  await api.put(`/properties/${route.params.id}`, form.value)
  router.push('/my-properties')
}
</script>

<style scoped>
.edit-wrapper {
  max-width: 800px;
  margin: auto;
  padding: 24px;
  font-family: Lato, sans-serif;
}

input, textarea {
  width: 100%;
  padding: 8px;
  margin-bottom: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background: #4338ca;
}

.map {
  width: 100%;
  height: 300px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin: 12px 0;
}

.note {
  font-size: 14px;
  color: #555;
  margin-bottom: 12px;
}
</style>
