<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-window">
      <div class="property-details" v-if="property">
        <h2>{{ property.propertyType }} — {{ property.city }}</h2>
        <p class="address">{{ property.street }} {{ property.houseNumber }}, {{ property.district }}</p>

        <div class="info">
          <div v-for="[label, value] in details" :key="label">
            <p><strong>{{ label }}:</strong> {{ value }}</p>
          </div>
          <p><strong>Цена:</strong> {{ property.price }} сом/мес</p>
        </div>

        <div class="description">
          <strong>Описание:</strong>
          <p>{{ property.announcementText || '—' }}</p>
        </div>

        <div class="photos" v-if="photoUrls.length">
          <img v-for="url in photoUrls" :key="url" :src="url" alt="Фото" />
        </div>

        <div class="booking" v-if="booking">
          <h4>Объект в аренде</h4>
          <p><strong>Арендатор:</strong> {{ booking.tenantFullName }}</p>
            <p><strong>Телефон арендатора:</strong> {{ booking.tenantPhone }}</p>

          <p><strong>Срок:</strong> {{ booking.startDate }} — {{ booking.endDate }}</p>
          <p><strong>Статус:</strong> {{ booking.status }}</p>
        </div>

        <button class="close-btn" @click="$emit('close')">Закрыть</button>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, computed } from 'vue'

import api from '@/services/api'

const props = defineProps({
  propertyId: {
    type: Number,
    required: true
  }
})
//const route = useRoute()
const property = ref(null)
const photoUrls = ref([])
const booking = ref(null)


const basePath = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const getPhotoUrl = (path) => {
  if (!path) return ''
  const normalized = path.replace(/\\\\/g, '/').replace(/\\/g, '/')
  const idx = normalized.indexOf('uploads/photos/')
  return idx === -1 ? '' : `${basePath}/uploads/photos/${normalized.slice(idx + 15)}`
}

const residentialFields = {
  'Площадь': p => `${p.area} м²`,
  'Комнат': p => p.numberOfRooms,
  'Этаж': p => p.floor,
  'Состояние': p => p.condition || '—',
  'Серия': p => p.houseSeries || '—',
  'Тип строения': p => p.buildingType || '—',
  'Отопление': p => p.heating || '—',
  'Телефон': p => p.telephone ? 'Да' : 'Нет',
  'Интернет': p => p.internet ? 'Да' : 'Нет',
  'Газ': p => p.gas ? 'Да' : 'Нет',
  'Балкон': p => p.balcony ? 'Да' : 'Нет',
  'Мебель': p => p.furniture ? 'Да' : 'Нет',
  'Кондиционер': p => p.airConditioner ? 'Да' : 'Нет'
}

const commercialFields = {
  'Площадь': p => `${p.area} м²`,
  'Назначение': p => p.purpose || '—',
  'Этаж': p => p.floor,
  'Всего этажей': p => p.totalFloors || '—',
  'Отдельный вход': p => p.separateEntrance ? 'Да' : 'Нет',
  'Парковка': p => p.hasParking ? 'Да' : 'Нет',
  'Мощность электросети': p => p.electricityPower ? `${p.electricityPower} кВт` : '—',
  'Реклама разрешена': p => p.advertisingAllowed ? 'Да' : 'Нет'
}

const details = computed(() => {
  if (!property.value) return []
  const fields = property.value.propertyType === 'Коммерческая'
    ? commercialFields
    : residentialFields
  return Object.entries(fields).map(([label, fn]) => [label, fn(property.value)])
})

onMounted(async () => {
  const propertyId = props.propertyId
  const { data } = await api.get(`/properties/${propertyId}`)
  property.value = data

  const { data: photos } = await api.get(`/properties/${propertyId}/photos`)
  photoUrls.value = photos.map(p => getPhotoUrl(p.photoPath)).filter(Boolean)

  const { data: bookings } = await api.get(`/bookings?propertyId=${propertyId}&status=APPROVED`)
  if (bookings.length > 0) {
    const b = bookings[0]
    const tenantInfo = await getTenantInfo(b.tenantId)
    booking.value = {
      ...b,
        tenantFullName: tenantInfo.fullName,
        tenantPhone: tenantInfo.phone
    }
  }
})

const getTenantInfo = async (tenantId) => {
  try {
    const { data } = await api.get(`/users/${tenantId}`)
    return {
      fullName: `${data.firstName || ''} ${data.lastName || ''}`.trim(),
      phone: data.phoneNumber || '—'
    }
  } catch {
    return {
      fullName: 'Неизвестно',
      phone: '—'
    }
  }
}
</script>

<style scoped>
.property-details {
  font-family: Lato, sans-serif;
  max-width: 700px;
  margin: auto;
  background: #fafafa;
  padding: 20px;
  border-radius: 8px;
  line-height: 1.4;
}
.address {
  color: #555;
  margin-bottom: 12px;
}
.info p {
  margin: 4px 0;
}
.description {
  margin-top: 12px;
}
.photos {
  margin-top: 12px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.photos img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 6px;
}
.booking {
  margin-top: 16px;
  background: #eef;
  padding: 12px;
  border-radius: 6px;
}
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal-window {
  background: white;
  padding: 24px;
  border-radius: 10px;
  max-width: 800px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
}

.close-btn {
  margin-top: 20px;
  background-color: #4f46e5;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}
</style>
