<template>
  <div class="auth-form">
    <h2>Вход</h2>
    <form @submit.prevent="submitLogin">
      <input v-model="username" placeholder="Имя пользователя" required />
      <input v-model="password" type="password" placeholder="Пароль" required />
      <button type="submit">Войти</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'
import { useUserStore } from '@/stores/user'

const username = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()
const userStore = useUserStore()

async function submitLogin() {
  try {
    const { data } = await api.post('/auth/login', {
      username: username.value,
      password: password.value
    })
    // Сохраняем токен и устанавливаем пользователя
    userStore.login(data.token)
    // Переходим в личный кабинет
    router.push('/dashboard')
  } catch {
    error.value = 'Неверный логин или пароль'
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
.auth-form h2 {
  text-align: center;
  margin-bottom: 16px;
}
.auth-form input {
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
