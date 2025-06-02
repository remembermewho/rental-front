<template>
  <div class="detail-wrapper" v-if="property">
    <div class="header">
      <div class="header-left">
        <h1>{{ property.propertyType }} — {{ property.city }}</h1>
        <div class="address">{{ property.street }} {{ property.houseNumber }}, {{ property.district }}</div>
      </div>
      <div class="header-right">
        <div class="price-block">
          <div class="price-main">{{ property.price }} сом / месяц</div>
          <div class="price-sub">{{ Math.round(property.price / property.area) }} сом/м²</div>
        </div>
      </div>
    </div>

    <div class="main-content">
      <div class="left-col">
        <div v-for="(value, label) in details" :key="label" class="info-row">
          <div class="label">{{ label }}</div>
          <div class="info">{{ value }}</div>
        </div>

        <div class="description">
          <h3>Описание</h3>
          <p>{{ property.announcementText || 'Описание отсутствует.' }}</p>
          <button v-if="isTenant" class="rent-btn" @click="showBookingModal = true">Арендовать</button>
        </div>
      </div>

      <div class="right-col">
        <div class="image-carousel">
          <img :src="photoUrls[currentPhotoIndex]" alt="Фото" />
          <button v-if="photoUrls.length > 1" class="arrow left" @click="prevPhoto">‹</button>
          <button v-if="photoUrls.length > 1" class="arrow right" @click="nextPhoto">›</button>
        </div>
      </div>
    </div>

    <div class="map-section" v-if="property.latitude && property.longitude" ref="mapContainer"></div>

    <div v-if="showBookingModal" class="modal-overlay">
      <div class="modal">
        <h3>Арендовать объект</h3>
        <input type="date" v-model="startDate" />
        <input type="date" v-model="endDate" />
        <p><strong>Итоговая стоимость:</strong> {{ totalPrice }} сом</p>
        <div class="modal-actions">
          <button @click="confirmBooking">Подтвердить</button>
          <button @click="showBookingModal = false">Отмена</button>
        </div>
      </div>
    </div>
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
const currentPhotoIndex = ref(0)
const userRole = ref(null)
const userId = ref(null)
const mapContainer = ref(null)
let mapInstance = null
const showBookingModal = ref(false)
const startDate = ref('')
const endDate = ref('')

const basePath = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const getPhotoUrl = (path) => {
  const norm = path.replace(/\\\\/g, '/').replace(/\\/g, '/')
  const idx = norm.indexOf('uploads/photos/')
  return idx === -1 ? '' : `${basePath}/uploads/photos/${norm.slice(idx + 15)}`
}

const details = computed(() => property.value ? ({
  'Площадь': `${property.value.area} м²`,
  'Комнат': property.value.numberOfRooms,
  'Этаж': property.value.floor,
  'Состояние': property.value.condition || '—',
  'Серия': property.value.houseSeries || '—',
  'Тип строения': property.value.buildingType || '—',
  'Отопление': property.value.heating || '—',
  'Телефон': property.value.telephone ? 'Да' : 'Нет',
  'Интернет': property.value.internet ? 'Да' : 'Нет',
  'Газ': property.value.gas ? 'Да' : 'Нет',
  'Балкон': property.value.balcony ? 'Да' : 'Нет',
  'Мебель': property.value.furniture ? 'Да' : 'Нет',
  'Кондиционер': property.value.airConditioner ? 'Да' : 'Нет'
}) : {})

const isTenant = computed(() => userRole.value === 'tenant')
const totalPrice = computed(() => {
  if (!startDate.value || !endDate.value || !property.value) return 0
  const days = dayjs(endDate.value).diff(dayjs(startDate.value), 'day') + 1
  return days > 0 ? Math.round(days * (property.value.price / 30)) : 0
})

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
  photoUrls.value = photos.data.map(p => getPhotoUrl(p.photoPath)).filter(Boolean)

  if (property.value.latitude && property.value.longitude) {
    mapInstance = L.map(mapContainer.value).setView([property.value.latitude, property.value.longitude], 15)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance)
    L.marker([property.value.latitude, property.value.longitude]).addTo(mapInstance)
  }
})

const prevPhoto = () => currentPhotoIndex.value = (currentPhotoIndex.value - 1 + photoUrls.value.length) % photoUrls.value.length
const nextPhoto = () => currentPhotoIndex.value = (currentPhotoIndex.value + 1) % photoUrls.value.length
const confirmBooking = async () => {
  if (!userId.value) return alert('Авторизуйтесь')
  const payload = { propertyId: property.value.id, tenantId: userId.value, startDate: startDate.value, endDate: endDate.value, totalPrice: totalPrice.value, status: 'PENDING' }
  await api.post('/bookings', payload)
  showBookingModal.value = false
  alert('Заявка отправлена!')
}
</script>

<style scoped>
.detail-wrapper {
  font-family: Lato, sans-serif;
  color: #424242;
  font-size: 15px;
  line-height: 1.4;
}
.header {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}
.header-left h1 {
  margin: 0;
  font-size: 22px;
}
.address {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}
.price-block {
  text-align: right;
}
.price-main {
  font-size: 20px;
  font-weight: bold;
}
.price-sub {
  font-size: 14px;
  color: #666;
}
.main-content {
  display: flex;
  gap: 24px;
  margin-top: 20px;
}
.left-col {
  flex: 1;
}
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #eee;
}
.label {
  font-weight: bold;
}
.right-col {
  flex: 1;
  position: relative;
}
.image-carousel {
  position: relative;
  background: #f8f8f8;
  border-radius: 6px;
  overflow: hidden;
  text-align: center;
}
.image-carousel img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
}
.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.5);
  color: #fff;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
}
.arrow.left {
  left: 8px;
}
.arrow.right {
  right: 8px;
}
.description {
  margin-top: 20px;
}
.description h3 {
  font-size: 18px;
  margin-bottom: 8px;
}
.rent-btn {
  margin-top: 16px;
  padding: 10px 20px;
  background: #4f46e5;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}
.map-section {
  margin-top: 32px;
  height: 300px;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 16px;
}
</style>
