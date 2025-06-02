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
    userStore.login(data.token)
    router.push('/dashboard')
  } catch {
    error.value = 'Неверный логин или пароль'
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

.auth-form input {
  display: block;
  width: 100%;
  margin-bottom: 14px;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid #ccc;
  border-radius: 6px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.auth-form input:focus {
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
  font-size: 14px;
  margin-top: 10px;
  text-align: center;
}
</style>
