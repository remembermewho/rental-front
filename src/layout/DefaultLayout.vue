<template>
  <div>
    <nav class="navbar">
      <div class="nav-left">
        <router-link class="logo" to="/">🏠 RentNow</router-link>
        <router-link to="/properties">Жилая недвижимость</router-link>
        <router-link to="/properties/commercial">Коммерческая недвижимость</router-link>
        <router-link
          v-if="user?.role === 'landlord'"
          to="/properties/create"
        >
          Добавить объект
        </router-link>
      </div>
      <div class="nav-right">
        <NotificationBell v-if="user" />
        <router-link v-if="user" to="/dashboard">Личный кабинет</router-link>
        <button v-if="user" @click="onLogout" class="logout-btn">Выйти</button>
        <router-link v-if="!user" to="/login">Войти</router-link>
        <router-link v-if="!user" to="/register">Регистрация</router-link>
      </div>
    </nav>

    <main class="container">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import NotificationBell from '@/components/NotificationBell.vue'

const router = useRouter()
const userStore = useUserStore()
const { user } = storeToRefs(userStore)

onMounted(() => {
  userStore.initialize()
})

function onLogout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');

* {
  font-family: 'Poppins', sans-serif;
  box-sizing: border-box;
}

.navbar {
  background: linear-gradient(90deg, #e0e7ff, #f0f4ff);

  color: #333;
  padding: 16px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  border-radius: 12px;
  margin: 16px;
}

.nav-left,
.nav-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo {
  font-weight: 700;
  font-size: 24px;
  color: #4f46e5;
  text-decoration: none;
}

.nav-left a,
.nav-right a,
.logout-btn {
  color: #333;
  text-decoration: none;
  font-size: 15px;
  background: rgba(0, 0, 0, 0.03);
  padding: 6px 14px;
  border-radius: 6px;
  transition: background 0.2s, transform 0.2s;
}

.nav-left a:hover,
.nav-right a:hover,
.logout-btn:hover {
  background: rgba(79, 70, 229, 0.1);
  color: #4f46e5;
  transform: scale(1.05);
}

.logout-btn {
  border: none;
  cursor: pointer;
}

.container {
  padding: 32px;
}
</style>



