<template>
  <div class="auth-form">
    <h2>Регистрация</h2>
    <form @submit.prevent="register">
      <input v-model="form.firstName" placeholder="Имя" required />
      <input v-model="form.lastName" placeholder="Фамилия" required />
      <input v-model="form.email" type="email" placeholder="Email" required />
      <input v-model="form.phoneNumber" placeholder="Телефон" required />
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
  phoneNumber: '',
  username: '',
  password: '',
  role: ''
})

const register = async () => {
  try {
    const { data } = await api.post('/users/register', form.value)

    if (data.token) {
      localStorage.setItem('token', data.token)
      window.dispatchEvent(new Event('storage'))
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
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap');

* {
  font-family: 'Lato', sans-serif;
  box-sizing: border-box;
}

.auth-form {
  max-width: 400px;
  margin: 40px auto;
  padding: 24px;
  border: 1px solid #efefef;
  border-radius: 8px;
  background-color: #f8f8f8;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.auth-form h2 {
  text-align: center;
  font-size: 20px;
  font-weight: 600;
  color: #424242;
  margin-bottom: 16px;
}

.auth-form input,
.auth-form select {
  display: block;
  width: 100%;
  margin-bottom: 14px;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.auth-form input:focus,
.auth-form select:focus {
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  outline: none;
}

.auth-form button {
  width: 100%;
  padding: 10px;
  background-color: #4f46e5;
  color: white;
  border: none;
  font-weight: 600;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

.auth-form button:hover {
  background-color: #4338ca;
  transform: translateY(-1px);
}

.error {
  color: #e11d48;
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
}
</style>
