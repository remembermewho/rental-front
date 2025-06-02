<template>
  <div class="requests-wrapper">
    <h2>Мои заявки</h2>

    <div v-if="requests.length">
      <div v-for="req in requests" :key="req.id" class="request-card">
        <p><strong>Период:</strong> {{ formatDate(req.startDate) }} — {{ formatDate(req.endDate) }}</p>
        <p><strong>Сумма:</strong> {{ req.totalPrice }} сом</p>
        <p><strong>Статус:</strong> {{ translateStatus(req.status) }}</p>

        <div class="card-actions">
          <button @click="showDetails(req.propertyId)">Инфа по дому</button>
          <button v-if="req.status === 'PENDING'" @click="cancelRequest(req)">Отменить</button>
          <button v-else @click="deleteRequest(req)">Удалить</button>
        </div>
      </div>
    </div>

    <p v-else>Вы пока не подавали заявки на аренду.</p>

    <!-- Модалка с подробностями объекта -->
    <div v-if="propertyDetails" class="modal-overlay">
      <div class="modal">
        <h3>{{ propertyDetails.propertyType }} — {{ propertyDetails.city }}</h3>
        <p><strong>Адрес:</strong> {{ propertyDetails.street }} {{ propertyDetails.houseNumber }}, {{ propertyDetails.district }}</p>
        <p><strong>Площадь:</strong> {{ propertyDetails.area }} м²</p>
        <p><strong>Комнат:</strong> {{ propertyDetails.numberOfRooms }}</p>
        <p><strong>Этаж:</strong> {{ propertyDetails.floor }}</p>
        <p><strong>Цена:</strong> {{ propertyDetails.price }} сом</p>
        <p><strong>Состояние:</strong> {{ propertyDetails.condition }}</p>
        <p><strong>Серия дома:</strong> {{ propertyDetails.houseSeries }}</p>
        <p><strong>Тип строения:</strong> {{ propertyDetails.buildingType }}</p>
        <p><strong>Год сдачи:</strong> {{ propertyDetails.yearOfCommissioning || '—' }}</p>
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
import { translateStatus } from '@/utils/translations.js'

const requests = ref([])
const propertyDetails = ref(null)
const propertyDetailsMap = ref({})

const formatDate = (d) => dayjs(d).format('DD.MM.YYYY')

// Показать информацию по объекту
const showDetails = async (propertyId) => {
  if (!propertyDetailsMap.value[propertyId]) {
    try {
      const { data } = await api.get(`/properties/${propertyId}`)
      propertyDetailsMap.value[propertyId] = data
    } catch (e) {
      console.error('Ошибка загрузки данных объекта', e)
      return
    }
  }
  propertyDetails.value = propertyDetailsMap.value[propertyId]
}

// Отмена заявки
const cancelRequest = async (booking) => {
  try {
    await api.put(`/bookings/${booking.id}`, {
      propertyId: booking.propertyId,
      tenantId:   booking.tenantId,
      startDate:  booking.startDate,
      endDate:    booking.endDate,
      totalPrice: booking.totalPrice,
      status:     'CANCELLED'
    })
    booking.status = 'CANCELLED'
  } catch (err) {
    console.error(err)
    alert('Ошибка отмены заявки')
  }
}

// Удаление заявки
const deleteRequest = async (booking) => {
  if (!confirm('Удалить заявку? Это действие необратимо.')) return
  try {
    await api.delete(`/bookings/${booking.id}`)
    requests.value = requests.value.filter(r => r.id !== booking.id)
  } catch (err) {
    console.error(err)
    alert('Ошибка удаления заявки')
  }
}

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) return
  const payload = JSON.parse(atob(token.split('.')[1]))
  const userId = payload.id

  try {
    const { data } = await api.get(`/bookings?tenantId=${userId}`)
    requests.value = data
  } catch (e) {
    console.error('Ошибка загрузки заявок', e)
  }
})
</script>

<style scoped>
.requests-wrapper {
  max-width: 1000px;
  margin: 24px auto;
  padding: 24px;
  font-family: Lato, Helvetica Neue, Helvetica, Arial, sans-serif;
}

h2 {
  font-size: 22px;
  font-weight: 600;
  color: #424242;
  margin-bottom: 20px;
}

.request-card {
  background: #fdfdfd;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.request-card p {
  margin: 6px 0;
  font-size: 14px;
  color: #424242;
}

.card-actions {
  margin-top: 12px;
}

.card-actions button {
  padding: 8px 14px;
  margin-right: 10px;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.card-actions button:hover {
  background-color: #4338ca;
}

.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 24px;
  border-radius: 10px;
  width: 90%;
  max-width: 500px;
  max-height: 80%;
  overflow-y: auto;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.modal h3 {
  font-size: 18px;
  margin-bottom: 16px;
}

.modal p {
  font-size: 14px;
  margin: 6px 0;
}

.modal-actions {
  margin-top: 16px;
  text-align: right;
}

.modal-actions button {
  padding: 8px 14px;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions button:hover {
  background-color: #4338ca;
}
</style>
