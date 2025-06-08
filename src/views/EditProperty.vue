<template>
  <div class="edit-wrapper">
    <h2>Редактирование объекта</h2>

    <form @submit.prevent="submitForm" class="form-grid">
      <div class="form-column">
        <!-- Левая колонка -->
        <label>Тип недвижимости
          <input v-model="form.propertyType" required />
        </label>
        <label>Количество комнат
          <input type="number" v-model="form.numberOfRooms" required />
        </label>
        <label>Серия дома
          <input v-model="form.houseSeries" required />
        </label>
        <label>Тип строения
          <input v-model="form.buildingType" required />
        </label>
        <label>Этаж
          <input type="number" v-model="form.floor" required />
        </label>
        <label>Площадь (м²)
          <input type="number" v-model="form.area" required />
        </label>
        <label>Состояние
          <input v-model="form.condition" required />
        </label>
        <label>Регион
          <input v-model="form.region" required />
        </label>
        <label>Город
          <input v-model="form.city" required />
        </label>
        <label>Район
          <input v-model="form.district" required />
        </label>
        <label>Улица
          <input v-model="form.street" required />
        </label>
        <label>Номер дома
          <input v-model="form.houseNumber" required />
        </label>
        <label>Долгота
          <input type="number" v-model="form.longitude" readonly required />
        </label>
        <label>Широта
          <input type="number" v-model="form.latitude" readonly required />
        </label>
        <label>Цена (сом)
          <input type="number" v-model="form.price" required />
        </label>
      </div>

      <div class="form-column">
        <!-- Правая колонка -->
        <label>Год сдачи
          <input type="number" v-model="form.yearOfCommissioning" />
        </label>
        <label>Тип отопления
          <input v-model="form.heating" />
        </label>
        <label><input type="checkbox" v-model="form.telephone" /> Телефон</label>
        <label><input type="checkbox" v-model="form.internet" /> Интернет</label>
        <label>Тип ванной
          <input v-model="form.bathroomType" />
        </label>
        <label><input type="checkbox" v-model="form.gas" /> Газ</label>
        <label><input type="checkbox" v-model="form.balcony" /> Балкон</label>
        <label><input type="checkbox" v-model="form.furniture" /> Мебель</label>
        <label><input type="checkbox" v-model="form.airConditioner" /> Кондиционер</label>
        <label>Описание
          <textarea v-model="form.announcementText" rows="4"></textarea>
        </label>
      </div>

      <!-- Кнопка ВНУТРИ формы -->
      <div class="form-actions">
        <button type="submit">Сохранить</button>
      </div>
    </form>

    <div ref="mapContainer" class="map"></div>
    <p class="note">Кликните на карту, чтобы изменить координаты</p>
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

  await nextTick()
  initMap()
})

const initMap = () => {
  if (!form.value.latitude || !form.value.longitude) {
    form.value.latitude = 42.87
    form.value.longitude = 74.59
  }

  mapInstance = L.map(mapContainer.value, {
    center: [form.value.latitude, form.value.longitude],
    zoom: 15,
    scrollWheelZoom: true
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapInstance)

  marker = L.marker([form.value.latitude, form.value.longitude]).addTo(mapInstance)

  mapInstance.on('click', (e) => {
    const { lat, lng } = e.latlng
    form.value.latitude = +lat.toFixed(6)
    form.value.longitude = +lng.toFixed(6)
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
  max-width: 1000px;
  margin: auto;
  padding: 24px;
  font-family: Lato, sans-serif;
}

h2 {
  margin-bottom: 20px;
}

.form-grid {
  display: flex;
  gap: 24px;
}

.form-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

label {
  display: flex;
  flex-direction: column;
  font-size: 14px;
}

input, textarea {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

textarea {
  resize: vertical;
}

.map {
  width: 100%;
  height: 300px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-top: 24px;
}

.note {
  font-size: 14px;
  color: #555;
  margin-top: 8px;
}

.form-actions {
  margin-top: 20px;
}

button {
  background: #4f46e5;
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background: #4338ca;
}
</style>
