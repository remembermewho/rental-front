<template>
  <div class="list-wrapper">
    <h2>Список недвижимости</h2>

    <form class="filter-form" @submit.prevent="loadProperties">
      <input v-model="filters.region" placeholder="Регион" />
      <input v-model="filters.city" placeholder="Город" />
      <input v-model.number="filters.numberOfRooms" type="number" placeholder="Количество комнат" />
      <button type="submit">Фильтр</button>
      <button type="button" @click="resetFilters">Сбросить</button>
    </form>

    <div v-if="properties.length">
      <div
        v-for="(prop, idx) in properties"
        :key="prop.id"
        class="listing"
        @click="goToDetail(prop.id)"
      >
        <div class="left-image" @click.stop>
          <div class="image-container">
            <img
              v-if="prop.photoUrls.length"
              :src="prop.photoUrls[prop.currentPhotoIndex]"
              alt="Фото"
            />
            <div v-else class="no-photo">Фото отсутствует</div>

            <button v-if="prop.photoUrls.length > 1" class="arrow left" @click.stop="prevPhoto(idx)">‹</button>
            <button v-if="prop.photoUrls.length > 1" class="arrow right" @click.stop="nextPhoto(idx)">›</button>
          </div>
        </div>

        <div class="right-info">
          <p class="title"><strong>{{ prop.propertyType }}</strong> — {{ prop.city }} - Район {{ prop.district }}</p>
          <p>{{ prop.numberOfRooms }} комн, {{ prop.area }} м² — {{ prop.price }} сом / месяц</p>
          <p class="description">{{ prop.announcementText || 'Описание отсутствует.' }}</p>
        </div>
      </div>
    </div>

    <p v-else>Объявлений не найдено</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import { useRouter } from 'vue-router'

const basePath = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const getPhotoUrl = (absolutePath) => {
  if (!absolutePath) return ''
  const normalized = absolutePath.replace(/\\\\/g, '/').replace(/\\/g, '/')
  const idx = normalized.indexOf('uploads/photos/')
  if (idx === -1) return ''
  const rel = normalized.slice(idx + 'uploads/photos/'.length)
  return `${basePath}/uploads/photos/${rel}`
}

const properties = ref([])
const filters = ref({ region: '', city: '', numberOfRooms: null })
const router = useRouter()

const loadProperties = async () => {
  try {
    const nonEmptyFilters = Object.fromEntries(
      Object.entries(filters.value).filter(([_, v]) => v !== null && v !== '')
    )

    const response = await api.get('/properties', { params: nonEmptyFilters })
    const propertiesData = response.data

    const photosRequests = propertiesData.map(async (p) => {
      const photos = await api.get(`/properties/${p.id}/photos`)
      return {
        ...p,
        photoUrls: photos.data.length
          ? photos.data.map(photo => getPhotoUrl(photo.photoPath))
          : [],
        currentPhotoIndex: 0
      }
    })

    properties.value = await Promise.all(photosRequests)
  } catch (e) {
    console.error('Ошибка при загрузке объектов:', e)
    properties.value = []
  }
}

const prevPhoto = (idx) => {
  const prop = properties.value[idx]
  if (!prop.photoUrls.length) return
  prop.currentPhotoIndex = (prop.currentPhotoIndex - 1 + prop.photoUrls.length) % prop.photoUrls.length
}

const nextPhoto = (idx) => {
  const prop = properties.value[idx]
  if (!prop.photoUrls.length) return
  prop.currentPhotoIndex = (prop.currentPhotoIndex + 1) % prop.photoUrls.length
}

const resetFilters = () => {
  filters.value = { region: '', city: '', numberOfRooms: null }
  loadProperties()
}

const goToDetail = (id) => {
  router.push(`/properties/${id}`)
}

onMounted(() => {
  loadProperties()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');

* {
  font-family: 'Lato', sans-serif;
  box-sizing: border-box;
}

.list-wrapper {
  padding: 24px;
  max-width: 1000px;
  margin: 0 auto;
}

h2 {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #424242;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.filter-form input {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}

.filter-form button {
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  background-color: #4f46e5;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.listing {
  display: flex;
  gap: 16px;
  border: 1px solid #efefef;
  border-top: none;
  padding: 15px;
  margin-bottom: 12px;
  cursor: pointer;
  align-items: center;
}

.left-image {
  flex: 0 0 180px;
  height: 140px;
  position: relative;
}

.image-container {
  width: 100%;
  height: 100%;
  background: #f8f8f8;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0,0,0,0.4);
  color: white;
  border: none;
  font-size: 18px;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow.left {
  left: 8px;
}

.arrow.right {
  right: 8px;
}

.arrow:hover {
  background: rgba(0,0,0,0.6);
}

.no-photo {
  color: #999;
  font-size: 14px;
  text-align: center;
}

.right-info {
  flex: 1;
}

.title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.description {
  font-size: 14px;
  color: #666;
  margin-top: 6px;
}
</style>
