<template>
    <div class="my-rentals-wrapper">
      <h2>Мои аренды</h2>
  
      <div v-if="bookings.length">
        <div v-for="booking in bookings" :key="booking.id" class="rental-card">
          <p><strong>Объект:</strong> {{ getPropertyInfo(booking.propertyId).propertyType }} — {{ getPropertyInfo(booking.propertyId).city }}</p>
          <p><strong>Адрес:</strong> {{ getPropertyInfo(booking.propertyId).street }} {{ getPropertyInfo(booking.propertyId).houseNumber }}, {{ getPropertyInfo(booking.propertyId).district }}</p>
          <p><strong>Период:</strong> {{ formatDate(booking.startDate) }} — {{ formatDate(booking.endDate) }}</p>
          <p><strong>Стоимость:</strong> {{ booking.totalPrice }} сом</p>
  
          <button @click="showDetails(booking.propertyId)">Подробнее</button>
        </div>
      </div>
  
      <p v-else>У вас пока нет арендованных объектов.</p>
  
      <!-- Модалка с подробностями -->
      <div v-if="propertyDetails" class="modal-overlay">
        <div class="modal">
          <h3>{{ propertyDetails.propertyType }} — {{ propertyDetails.city }}</h3>
          <p><strong>Адрес:</strong> {{ propertyDetails.street }} {{ propertyDetails.houseNumber }}, {{ propertyDetails.district }}</p>
          <p><strong>Площадь:</strong> {{ propertyDetails.area }} м²</p>
          <p><strong>Этаж:</strong> {{ propertyDetails.floor }}</p>
          <p><strong>Комнат:</strong> {{ propertyDetails.numberOfRooms }}</p>
          <p><strong>Состояние:</strong> {{ propertyDetails.condition }}</p>
          <p><strong>Серия дома:</strong> {{ propertyDetails.houseSeries }}</p>
          <p><strong>Тип строения:</strong> {{ propertyDetails.buildingType }}</p>
          <p><strong>Год сдачи:</strong> {{ propertyDetails.yearOfCommissioning || '—' }}</p>
          <p><strong>Отопление:</strong> {{ propertyDetails.heating || '—' }}</p>
          <p><strong>Мебель:</strong> {{ propertyDetails.furniture ? 'Да' : 'Нет' }}</p>
          <p><strong>Кондиционер:</strong> {{ propertyDetails.airConditioner ? 'Да' : 'Нет' }}</p>
          <p><strong>Описание:</strong> {{ propertyDetails.announcementText || '—' }}</p>
  
          <div class="modal-actions">
            <button @click="propertyDetails = null">Закрыть</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  
  <script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import dayjs from 'dayjs'

const bookings = ref([])
const propertyDetails = ref(null)
const propertyDetailsMap = ref({})

const formatDate = (d) => dayjs(d).format('DD.MM.YYYY')

const getPropertyInfo = (propertyId) => {
  return propertyDetailsMap.value[propertyId] || {}
}

const showDetails = (propertyId) => {
  propertyDetails.value = propertyDetailsMap.value[propertyId]
}

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) return

  const payload = JSON.parse(atob(token.split('.')[1]))
  const userId = payload.id

  const { data: bookingsData } = await api.get(`/bookings?tenantId=${userId}&status=APPROVED`)
  bookings.value = bookingsData

  // Загружаем все связанные объекты недвижимости
  for (const booking of bookingsData) {
    const propertyId = booking.propertyId
    if (!propertyDetailsMap.value[propertyId]) {
      const { data: propertyData } = await api.get(`/properties/${propertyId}`)
      propertyDetailsMap.value[propertyId] = propertyData
    }
  }
})
</script>

  
<style scoped>
.my-rentals-wrapper {
  padding: 24px;
}
.rental-card {
  border: 1px solid #ccc;
  padding: 12px;
  margin-bottom: 12px;
  border-radius: 6px;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}
.modal {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 80%;
  overflow-y: auto;
}
.modal-actions {
  margin-top: 16px;
  text-align: right;
}
</style>
