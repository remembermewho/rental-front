<template>
    <div class="edit-wrapper">
      <h2>Редактирование объекта</h2>
      <form @submit.prevent="submitForm" class="form-grid">
        <!-- Левая колонка — обязательные поля -->
        <div class="form-column">
          <label>Тип недвижимости
            <input v-model="form.propertyType" required />
          </label>
          <label>Количество комнат
            <input type="number" v-model="form.numberOfRooms" required min="1" />
          </label>
          <label>Серия дома
            <input v-model="form.houseSeries" required />
          </label>
          <label>Тип строения
            <input v-model="form.buildingType" required />
          </label>
          <label>Этаж
            <input type="number" v-model="form.floor" required min="0" />
          </label>
          <label>Площадь (м²)
            <input type="number" v-model="form.area" step="0.1" required />
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
            <input type="number" v-model="form.longitude" step="0.000001" required />
          </label>
          <label>Широта
            <input type="number" v-model="form.latitude" step="0.000001" required />
          </label>
          <label>Цена (сом)
            <input type="number" v-model="form.price" step="0.1" required />
          </label>
        </div>
  
        <!-- Правая колонка — дополнительные опции -->
        <div class="form-column">
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
            <textarea v-model="form.announcementText"></textarea>
          </label>
        </div>
  
        <div class="actions">
          <button type="submit">Сохранить</button>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue'
  import { useRoute, useRouter } from 'vue-router'
  import api from '@/services/api'
  
  const route = useRoute()
  const router = useRouter()
  const form = ref({})
  
  onMounted(async () => {
    const id = route.params.id
    try {
      const { data } = await api.get(`/properties/${id}`)
      form.value = data
    } catch (e) {
      console.error('Ошибка загрузки объекта:', e)
    }
  })
  
  const submitForm = async () => {
    try {
      await api.put(`/properties/${route.params.id}`, form.value)
      router.push('/my-properties')
    } catch (e) {
      console.error('Ошибка при обновлении:', e)
    }
  }
  </script>
  
  <style scoped>
  .edit-wrapper {
    max-width: 1000px;
    margin: auto;
    padding: 24px;
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
    font-weight: 500;
  }
  .actions {
    margin-top: 20px;
  }
  </style>
  