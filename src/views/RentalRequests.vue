<template>
  <div class="requests-wrapper">
    <h2>Запросы на аренду</h2>

    <div v-if="requests.length">
      <div v-for="request in requests" :key="request.bookingId" class="request-card">
        <p><strong>Объект:</strong> {{ request.propertyType }} в {{ request.city }}</p>
        <p><strong>Адрес:</strong> {{ request.street }} {{ request.houseNumber }}, {{ request.district }}</p>
        <p><strong>Арендатор:</strong> {{ request.tenantName }} (Тел: {{ request.tenantPhone }})</p>
        <p><strong>Период:</strong> {{ formatDate(request.startDate) }} — {{ formatDate(request.endDate) }}</p>
        <p><strong>Сумма:</strong> {{ request.totalPrice }} сом</p>
        <p><strong>Статус:</strong> {{ translateStatus(request.status) }}</p>

        <div v-if="request.status === 'PENDING'" class="actions">
          <button @click="updateStatus(request.bookingId, 'APPROVED')">Принять</button>
          <button @click="updateStatus(request.bookingId, 'REJECTED')">Отклонить</button>
        </div>
      </div>
    </div>

    <p v-else>Нет активных заявок на аренду.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import dayjs from 'dayjs'
import { translateStatus } from '@/utils/translations.js'

const requests = ref([])

const formatDate = (d) => dayjs(d).format('DD.MM.YYYY')

onMounted(async () => {
  const token = localStorage.getItem('token')
  if (!token) return

  const payload = JSON.parse(atob(token.split('.')[1]))
  const ownerId = payload.id

  // Получаем объекты пользователя
  const { data: properties } = await api.get(`/properties/user/${ownerId}`)

  const allRequests = []
  for (const prop of properties) {
    const { data: bookings } = await api.get(`/bookings?propertyId=${prop.id}`)
    for (const b of bookings) {
      // Получаем данные арендатора
      let tenantName = '—'
      let tenantPhone = '—'
      try {
        const { data: tenant } = await api.get(`/users/${b.tenantId}`)
        tenantName = tenant.firstName || tenant.lastName || '—'
        tenantPhone = tenant.phoneNumber || '—'
      } catch {
        // если не удалось получить, оставляем дефолт
      }

      allRequests.push({
        bookingId:    b.id,
        propertyId:   b.propertyId,
        tenantId:     b.tenantId,
        tenantName,
        tenantPhone,
        startDate:    b.startDate,
        endDate:      b.endDate,
        status:       b.status,
        totalPrice:   b.totalPrice,
        propertyType: prop.propertyType,
        city:         prop.city,
        street:       prop.street,
        houseNumber:  prop.houseNumber,
        district:     prop.district
      })
    }
  }

  requests.value = allRequests
})

const updateStatus = async (bookingId, newStatus) => {
  try {
    const req = requests.value.find(r => r.bookingId === bookingId)
    await api.put(`/bookings/${bookingId}`, {
      propertyId: req.propertyId,
      tenantId:   req.tenantId,
      startDate:  req.startDate,
      endDate:    req.endDate,
      status:     newStatus,
      totalPrice: req.totalPrice
    })
    req.status = newStatus
  } catch (err) {
    console.error(err)
    alert('Ошибка обновления статуса')
  }
}
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
  margin-bottom: 16px;
  color: #424242;
}

.request-card {
  border: 1px solid #efefef;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 16px;
  background: #fafafa;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.request-card p {
  margin: 0;
  font-size: 14px;
  color: #424242;
}

.actions {
  margin-top: 12px;
}

.actions button {
  padding: 8px 14px;
  background-color: #4f46e5;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.actions button:hover {
  background-color: #4338ca;
}

.actions button + button {
  margin-left: 8px;
}
</style>
