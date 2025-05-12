<template>
  <div class="form-wrapper">
    <h2>Добавить объявление</h2>
    <form @submit.prevent="submit">
      <!-- Поля формы -->
      <input v-model="form.propertyType" placeholder="Тип недвижимости" required />
      <input v-model.number="form.numberOfRooms" type="number" placeholder="Количество комнат" required />
      <input v-model="form.houseSeries" placeholder="Серия дома" required />
      <input v-model="form.buildingType" placeholder="Тип строения" required />
      <input v-model.number="form.floor" type="number" placeholder="Этаж" required />
      <input v-model.number="form.area" type="number" step="0.1" placeholder="Площадь (кв.м)" required />
      <input v-model="form.condition" placeholder="Состояние объекта" required />
      <input v-model="form.region" placeholder="Регион" required />
      <input v-model="form.city" placeholder="Город" required />
      <input v-model="form.district" placeholder="Район" required />
      <input v-model="form.street" placeholder="Улица" required />
      <input v-model="form.houseNumber" placeholder="Номер дома" required />

      <!-- Карта для выбора местоположения -->
      <div ref="mapContainer" class="map-container"></div>
      <p class="map-instructions">Кликните на карте, чтобы выбрать координаты</p>

      <!-- Поля широты и долготы (только для чтения) -->
      <input v-model.number="form.latitude" type="number" step="0.0001" placeholder="Широта" readonly required />
      <input v-model.number="form.longitude" type="number" step="0.0001" placeholder="Долгота" readonly required />

      <input v-model.number="form.price" type="number" step="0.1" placeholder="Цена (сом)" required />
      <textarea v-model="form.announcementText" placeholder="Текст объявления"></textarea>

      <button type="submit">Создать</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useRouter } from 'vue-router'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const router = useRouter()
const error = ref('')

const form = ref({
  propertyType: '',
  numberOfRooms: 1,
  houseSeries: '',
  buildingType: '',
  floor: 0,
  area: 0,
  condition: '',
  region: '',
  city: '',
  district: '',
  street: '',
  houseNumber: '',
  latitude: null,
  longitude: null,
  price: 0,
  announcementText: ''
})

// Реф для контейнера карты
const mapContainer = ref(null)
let mapInstance = null
let marker = null

onMounted(() => {
  // Инициализируем карту с центром на Бишкек
  mapInstance = L.map(mapContainer.value, {
    center: [42.87, 74.59],
    zoom: 12,
    scrollWheelZoom: true
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapInstance)

  // Обработчик клика: ставим маркер и обновляем form.latitude/longitude
  mapInstance.on('click', (e) => {
    const { lat, lng } = e.latlng
    form.value.latitude = parseFloat(lat.toFixed(6))
    form.value.longitude = parseFloat(lng.toFixed(6))

    if (marker) {
      marker.setLatLng(e.latlng)
    } else {
      marker = L.marker(e.latlng).addTo(mapInstance)
    }
  })
})

const submit = async () => {
  try {
    await api.post('/properties', form.value)
    router.push('/properties')
  } catch (e) {
    error.value = 'Ошибка при создании объявления'
  }
}
</script>

<style scoped>
.form-wrapper {
  max-width: 600px;
  margin: auto;
  padding: 24px;
}
form input,
form textarea {
  display: block;
  margin-bottom: 12px;
  padding: 8px;
  width: 100%;
}
.map-container {
  width: 100%;
  height: 300px;
  margin-bottom: 8px;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}
.map-instructions {
  font-size: 0.9rem;
  color: #555;
  margin-bottom: 12px;
}
button {
  padding: 10px 20px;
  background-color: #28a745;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover {
  background-color: #218838;
}
.error {
  color: red;
  margin-top: 10px;
}
</style>
