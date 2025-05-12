<template>
  <div class="detail-wrapper" v-if="property">
    <h2 class="mb-4">{{ property.propertyType }} — {{ property.city }}</h2>

    <div class="two-columns">
      <!-- Левая колонка: обязательные поля -->
      <div class="left-col">
        <p><strong>Адрес:</strong> {{ property.street }} {{ property.houseNumber }}, {{ property.district }}</p>
        <p><strong>Площадь:</strong> {{ property.area }} м²</p>
        <p><strong>Комнат:</strong> {{ property.numberOfRooms }}</p>
        <p><strong>Этаж:</strong> {{ property.floor }}</p>
        <p><strong>Цена:</strong> {{ property.price }} сом</p>
        <p><strong>Состояние:</strong> {{ property.condition }}</p>
        <p><strong>Серия дома:</strong> {{ property.houseSeries }}</p>
        <p><strong>Тип строения:</strong> {{ property.buildingType }}</p>
        <p><strong>Регион:</strong> {{ property.region }}</p>
        <p><strong>Геолокация:</strong> {{ property.latitude }}, {{ property.longitude }}</p>

        <!-- Контейнер для карты -->
        <div
          v-if="property.latitude && property.longitude"
          ref="mapContainer"
          class="map-container"
        ></div>
      </div>

      <!-- Правая колонка: дополнительные поля -->
      <div class="right-col">
        <p><strong>Год сдачи:</strong> {{ property.yearOfCommissioning || '—' }}</p>
        <p><strong>Отопление:</strong> {{ property.heating || '—' }}</p>
        <p><strong>Тип ванной:</strong> {{ property.bathroomType || '—' }}</p>
        <p><strong>Телефон:</strong> {{ property.telephone ? 'Да' : 'Нет' }}</p>
        <p><strong>Интернет:</strong> {{ property.internet ? 'Да' : 'Нет' }}</p>
        <p><strong>Газ:</strong> {{ property.gas ? 'Да' : 'Нет' }}</p>
        <p><strong>Балкон:</strong> {{ property.balcony ? 'Да' : 'Нет' }}</p>
        <p><strong>Мебель:</strong> {{ property.furniture ? 'Да' : 'Нет' }}</p>
        <p><strong>Кондиционер:</strong> {{ property.airConditioner ? 'Да' : 'Нет' }}</p>
        <p><strong>Описание:</strong> {{ property.announcementText || '—' }}</p>
        <p><strong>Создано:</strong> {{ formatDate(property.createdAt) }}</p>
        <p><strong>Обновлено:</strong> {{ formatDate(property.updatedAt) }}</p>
      </div>
    </div>

    <!-- Кнопка "Арендовать" -->
    <div v-if="isTenant" class="rent-btn-wrapper">
      <button class="rent-btn" @click="showBookingModal = true">Арендовать</button>
    </div>

    <!-- Модалка бронирования -->
    <div v-if="showBookingModal" class="modal-overlay">
      <div class="modal">
        <h3>Арендовать объект</h3>
        <label>Дата начала:</label>
        <input type="date" v-model="startDate" />

        <label>Дата окончания:</label>
        <input type="date" v-model="endDate" />

        <p><strong>Итоговая стоимость:</strong> {{ totalPrice }} сом</p>

        <div class="modal-actions">
          <button @click="confirmBooking">Подтвердить</button>
          <button @click="showBookingModal = false">Отмена</button>
        </div>
      </div>
    </div>

    <!-- Фотографии -->
    <div v-if="photoUrls.length" class="photos">
      <h3>Фотографии:</h3>
      <div class="photo-grid">
        <img
          v-for="(url, index) in photoUrls"
          :key="index"
          :src="url"
          alt="Фото объекта"
        />
      </div>
    </div>
    <p v-else>Фотографии не загружены.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import api from '@/services/api'
import dayjs from 'dayjs'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const route = useRoute()
const property = ref(null)
const photoUrls = ref([])
const userRole = ref(null)
const userId = ref(null)
const mapContainer = ref(null)
let mapInstance = null

const basePath = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

const getPhotoUrl = (absolutePath) => {
  if (!absolutePath) return ''
  const normalized = absolutePath.replace(/\\\\/g, '/').replace(/\\/g, '/')
  const idx = normalized.indexOf('uploads/photos/')
  if (idx === -1) return ''
  const rel = normalized.slice(idx + 'uploads/photos/'.length)
  return `${basePath}/uploads/photos/${rel}`
}

const formatDate = (date) => date ? dayjs(date).format('DD.MM.YYYY HH:mm') : '—'
const isTenant = computed(() => userRole.value === 'tenant')
const showBookingModal = ref(false)
const startDate = ref('')
const endDate = ref('')
const totalPrice = computed(() => {
  if (!startDate.value || !endDate.value || !property.value) return 0
  const days = dayjs(endDate.value).diff(dayjs(startDate.value), 'day') + 1
  const daily = property.value.price / 30
  return days > 0 ? Math.round(days * daily) : 0
})

const confirmBooking = async () => {
  if (!userId.value) return alert('Авторизуйтесь')
  const payload = {
    propertyId: property.value.id,
    tenantId: userId.value,
    startDate: startDate.value,
    endDate: endDate.value,
    totalPrice: totalPrice.value,
    status: 'PENDING'
  }
  try {
    await api.post('/bookings', payload)
    showBookingModal.value = false
    alert('Заявка отправлена!')
  } catch {
    alert('Ошибка при бронировании')
  }
}

function initMap(lat, lng) {
  if (mapInstance) {
    mapInstance.setView([lat, lng], 15)
    L.marker([lat, lng]).addTo(mapInstance)
    return
  }
  mapInstance = L.map(mapContainer.value, {
    center: [lat, lng],
    zoom: 15,
    scrollWheelZoom: false,
    zoomControl: true
  })
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(mapInstance)
  L.marker([lat, lng]).addTo(mapInstance)
}

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (token) {
    const p = JSON.parse(atob(token.split('.')[1]))
    userRole.value = p.role
    userId.value = p.id
  }
  const { data } = await api.get(`/properties/${route.params.id}`)
  property.value = data
  const photos = await api.get(`/properties/${route.params.id}/photos`)
  photoUrls.value = photos.data
    .map(p => getPhotoUrl(p.photoPath))
    .filter(u => !!u)

  if (property.value.latitude && property.value.longitude) {
    initMap(property.value.latitude, property.value.longitude)
  }
})
</script>

<style scoped>
.detail-wrapper {
  max-width: 1000px;
  margin: auto;
  padding: 24px;
}
.mb-4 {
  margin-bottom: 1rem;
}
.two-columns {
  display: flex;
  gap: 24px;
}
.left-col,
.right-col {
  flex: 1;
}
.map-container {
  width: 100%;
  height: 300px;
  margin-top: 16px;
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}
.rent-btn-wrapper {
  margin-top: 24px;
  text-align: center;
}
.rent-btn {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.rent-btn:hover {
  background-color: #0056b3;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
}
.modal-actions {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
.modal input {
  width: 100%;
  margin-bottom: 10px;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}
.photos {
  margin-top: 32px;
}
.photo-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.photo-grid img {
  width: 200px;
  height: 140px;
  object-fit: cover;
  border: 1px solid #ccc;
  border-radius: 4px;
}
</style>
