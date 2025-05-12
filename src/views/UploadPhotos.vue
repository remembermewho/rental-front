<template>
    <div class="photo-wrapper">
      <h2>Фотографии объекта</h2>
  
      <div v-if="photos.length">
        <div class="photo-grid">
          <div v-for="(photo, index) in photos" :key="photo.id" class="photo-card">
            <img :src="getPhotoUrl(photo.photoPath)" alt="Фото" />
            <button @click="deletePhoto(photo.id)">Удалить</button>
          </div>
        </div>
      </div>
      <p v-else>Фото отсутствуют.</p>
  
      <hr />
  
      <h3>Добавить фото</h3>
      <input type="file" @change="onFileChange" />
      <button @click="uploadPhoto" :disabled="!selectedFile">Загрузить</button>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router'
  import api from '@/services/api'
  
  const route = useRoute()
  const propertyId = route.params.id
  const photos = ref([])
  const selectedFile = ref(null)
  const basePath = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
  
  const fetchPhotos = async () => {
    try {
      const { data } = await api.get(`/properties/${propertyId}/photos`)
      photos.value = data
    } catch (e) {
      console.error('Ошибка при загрузке фото:', e)
    }
  }
  
  const getPhotoUrl = (absolutePath) => {
    if (!absolutePath) return ''
    const normalized = absolutePath.replaceAll('\\', '/')
    const index = normalized.indexOf('uploads/photos/')
    if (index === -1) return ''
    const relative = normalized.substring(index + 'uploads/photos/'.length)
    return `${basePath}/uploads/photos/${relative}`
  }
  
  const onFileChange = (e) => {
    selectedFile.value = e.target.files[0]
  }
  
  const uploadPhoto = async () => {
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    formData.append('metadata', new Blob([JSON.stringify({})], { type: 'application/json' }))
  
    try {
      await api.post(`/properties/${propertyId}/photos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      await fetchPhotos()
      selectedFile.value = null
    } catch (e) {
      console.error('Ошибка при загрузке файла:', e)
    }
  }
  
  const deletePhoto = async (photoId) => {
    try {
      await api.delete(`/properties/${propertyId}/photos/${photoId}`)
      await fetchPhotos()
    } catch (e) {
      console.error('Ошибка при удалении фото:', e)
    }
  }
  
  onMounted(fetchPhotos)
  </script>
  
  <style scoped>
  .photo-wrapper {
    padding: 24px;
    max-width: 800px;
    margin: auto;
  }
  .photo-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-bottom: 20px;
  }
  .photo-card {
    border: 1px solid #ccc;
    padding: 8px;
    text-align: center;
  }
  .photo-card img {
    width: 200px;
    height: 140px;
    object-fit: cover;
    border-radius: 4px;
  }
  </style>
  