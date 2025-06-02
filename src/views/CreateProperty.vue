<template>
  <div class="form-wrapper">
    <h2>Добавить объект</h2>
    <form @submit.prevent="submit">
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

      <div ref="mapContainer" class="map"></div>
      <p class="note">Кликните на карте, чтобы выбрать координаты</p>

      <input v-model.number="form.latitude" type="number" placeholder="Широта" readonly />
      <input v-model.number="form.longitude" type="number" placeholder="Долгота" readonly />
      <input v-model.number="form.price" type="number" placeholder="Цена (сом)" required />
      <textarea v-model="form.announcementText" placeholder="Описание"></textarea>

      <button type="submit">Создать</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useRouter } from 'vue-router'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const router = useRouter()
const form = ref({
  propertyType: '', numberOfRooms: '', houseSeries: '', buildingType: '', floor: '', area: '', condition: '',
  region: '', city: '', district: '', street: '', houseNumber: '', latitude: null, longitude: null, price: '', announcementText: ''
})

const mapContainer = ref(null)
let mapInstance = null
let marker = null

onMounted(() => {
  mapInstance = L.map(mapContainer.value, { center: [42.87, 74.59], zoom: 12 })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance)
  mapInstance.on('click', e => {
    form.value.latitude = +e.latlng.lat.toFixed(6)
    form.value.longitude = +e.latlng.lng.toFixed(6)
    if (!marker) marker = L.marker(e.latlng).addTo(mapInstance)
    else marker.setLatLng(e.latlng)
  })
})

const submit = async () => {
  await api.post('/properties', form.value)
  router.push('/properties')
}
</script>

<style scoped>
.form-wrapper {
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
