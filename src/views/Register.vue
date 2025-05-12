<template>
  <div class="auth-form">
    <h2>Регистрация</h2>
    <form @submit.prevent="register">
      <input v-model="form.firstName" placeholder="Имя" required />
      <input v-model="form.lastName" placeholder="Фамилия" required />
      <input v-model="form.email" type="email" placeholder="Email" required />
      <input v-model="form.username" placeholder="Имя пользователя" required />
      <input v-model="form.password" type="password" placeholder="Пароль (мин. 6 символов)" required />
      
      <select v-model="form.role" required>
        <option disabled value="">Выберите роль</option>
        <option value="landlord">Арендодатель</option>
        <option value="tenant">Арендатор</option>
      </select>

      <button type="submit">Зарегистрироваться</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import api from '@/services/api'
import { useRouter } from 'vue-router'

const router = useRouter()
const error = ref('')
const form = ref({
  firstName: '',
  lastName: '',
  email: '',
  username: '',
  password: '',
  role: ''
})

const register = async () => {
  try {
    const { data } = await api.post('/users/register', form.value)

    if (data.token) {
      localStorage.setItem('token', data.token)
      window.dispatchEvent(new Event('storage')) // ✅ чтобы DefaultLayout обновился
      router.push('/dashboard')
    } else {
      router.push('/login')
    }

  } catch (err) {
    error.value = err?.response?.data?.message || 'Ошибка регистрации'
  }
}
</script>

<style scoped>
.auth-form {
  max-width: 400px;
  margin: 40px auto;
  padding: 24px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: #fafafa;
}

.auth-form input,
.auth-form select {
  display: block;
  width: 100%;
  margin-bottom: 14px;
  padding: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.auth-form button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  font-weight: bold;
  border-radius: 4px;
  cursor: pointer;
}

.auth-form button:hover {
  background-color: #0056b3;
}

.error {
  color: red;
  margin-top: 10px;
  text-align: center;
}
</style>
