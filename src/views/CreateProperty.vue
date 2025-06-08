<template>
  <div class="form-wrapper">
    <h2>Добавить объект</h2>
    <form @submit.prevent="submit">

      <!-- Тип объекта -->
      <fieldset>
        <legend>Тип объекта</legend>
        <div class="field-row">
          <label>Тип недвижимости:</label>
          <select v-model="form.propertyType" required>
            <option disabled value="">Выберите</option>
            <option>Жилая</option>
            <option>Коммерческая</option>
          </select>
        </div>
      </fieldset>

      <!-- Характеристики -->
      <fieldset>
        <legend>Характеристики</legend>
        <div class="field-row" v-for="field in commonFields" :key="field.model">
          <label>{{ field.label }}:</label>
          <input
            v-if="field.type !== 'number'"
            v-model="form[field.model]"
            :placeholder="field.label"
          />
          <input
            v-else
            type="number"
            v-model.number="form[field.model]"
            :placeholder="field.label"
          />
        </div>

        <template v-if="form.propertyType === 'Коммерческая'">
          <div class="field-row" v-for="field in commercialFields" :key="field.model">
            <label>{{ field.label }}:</label>
            <input
              :type="field.type || 'text'"
              v-model="form[field.model]"
              :placeholder="field.label"
              :step="field.step"
            />
          </div>
        </template>
      </fieldset>

      <!-- Описание -->
      <fieldset>
        <legend>Описание объекта</legend>
        <div class="field-row">
          <label>Описание:</label>
          <textarea v-model="form.announcementText" placeholder="Описание объекта"></textarea>
        </div>
      </fieldset>

      <!-- Расположение -->
      <fieldset>
        <legend>Расположение</legend>
        <div class="field-row">
          <label>Широта:</label>
          <input v-model.number="form.latitude" type="number" readonly />
        </div>
        <div class="field-row">
          <label>Долгота:</label>
          <input v-model.number="form.longitude" type="number" readonly />
        </div>
        <div class="map" ref="mapContainer"></div>
        <p class="note">Кликните на карте, чтобы выбрать координаты</p>
      </fieldset>

      <button type="submit">Создать</button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useRouter } from 'vue-router'
import * as L from 'leaflet'

const router = useRouter()
const form = ref({
  propertyType: '', numberOfRooms: '', houseSeries: '', buildingType: '', floor: '', area: '',
  condition: '', region: '', city: '', district: '', street: '', houseNumber: '',
  latitude: null, longitude: null, price: '', announcementText: '',
  
  purpose: '', totalFloors: '', ceilingHeight: '', separateEntrance: false,
  hasParking: false, electricityPower: '', advertisingAllowed: false
})

const commonFields = [
  { model: 'numberOfRooms', label: 'Количество комнат', type: 'number' },
  { model: 'houseSeries', label: 'Серия дома' },
  { model: 'buildingType', label: 'Тип строения' },
  { model: 'floor', label: 'Этаж', type: 'number' },
  { model: 'area', label: 'Площадь (м²)', type: 'number' },
  { model: 'condition', label: 'Состояние' },
  { model: 'region', label: 'Регион' },
  { model: 'city', label: 'Город' },
  { model: 'district', label: 'Район' },
  { model: 'street', label: 'Улица' },
  { model: 'houseNumber', label: 'Номер дома' },
  { model: 'price', label: 'Цена (в месяц)', type: 'number' }
]

const commercialFields = [
  { model: 'purpose', label: 'Назначение' },
  { model: 'totalFloors', label: 'Этажей в здании', type: 'number' },
  { model: 'ceilingHeight', label: 'Высота потолков (м)', type: 'number', step: '0.01' },
  { model: 'electricityPower', label: 'Мощность (кВт)', type: 'number', step: '0.1' },
  { model: 'separateEntrance', label: 'Отдельный вход', type: 'checkbox' },
  { model: 'hasParking', label: 'Парковка', type: 'checkbox' },
  { model: 'advertisingAllowed', label: 'Реклама разрешена', type: 'checkbox' }
]

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
fieldset {
  border: 1px solid #ccc;
  padding: 16px;
  margin-bottom: 20px;
  border-radius: 8px;
}
legend {
  font-weight: bold;
  margin-left: 8px;
  padding: 0 6px;
}
.field-row {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}
.field-row label {
  width: 220px;
  font-weight: 500;
}
input, select, textarea {
  flex: 1;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ccc;
}
textarea {
  min-height: 80px;
}
button {
  margin-top: 16px;
  padding: 10px 20px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
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
  margin-top: 12px;
}
.note {
  font-size: 14px;
  color: #555;
  margin-top: 8px;
}
</style>
