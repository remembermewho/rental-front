<template>
  <div>
    <nav class="navbar">
      <div class="nav-left">
        <router-link class="logo" to="/">🏠 RentNow</router-link>
        <router-link to="/properties">Недвижимость</router-link>
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
.navbar {
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 12px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-left,
.nav-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  font-weight: bold;
  font-size: 20px;
  color: #333;
  text-decoration: none;
}

.nav-left a,
.nav-right a,
.logout-btn {
  color: #333;
  text-decoration: none;
  font-size: 14px;
  background: none;
  border: none;
  cursor: pointer;
}

.nav-left a:hover,
.nav-right a:hover,
.logout-btn:hover {
  color: #007bff;
}

.container {
  padding: 24px;
}
</style>
