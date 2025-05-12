<template>
  <div class="bell-wrapper" @click="toggleDropdown">
    <span class="icon">🔔</span>
    <span v-if="unreadCount > 0" class="badge">{{ unreadCount }}</span>

    <div v-if="showDropdown" class="dropdown">
      <h4>Уведомления</h4>
      <ul v-if="notifications.length">
        <li v-for="n in notifications" :key="n.id" :class="{ unread: !n.read }">
          <div class="message">{{ n.message }}</div>
          <small>{{ formatDate(n.createdAt) }}</small>
          <button v-if="!n.read" @click.stop="markAsRead(n.id)">Прочитано</button>
        </li>
      </ul>
      <p v-else>Уведомлений нет</p>

      <button
        v-if="notifications.length"
        class="delete-all"
        @click.stop="deleteAllNotifications"
      >
        🗑 Удалить все
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'
import dayjs from 'dayjs'

const notifications = ref([])
const showDropdown = ref(false)
const unreadCount = ref(0)
const userId = ref(null)

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const formatDate = (date) => dayjs(date).format('DD.MM.YYYY HH:mm')

const fetchNotifications = async () => {
  const token = localStorage.getItem('token')
  if (!token) return

  const payload = JSON.parse(atob(token.split('.')[1]))
  userId.value = payload.id

  const { data } = await api.get(`/notifications?userId=${userId.value}`)
  notifications.value = data
  unreadCount.value = data.filter(n => !n.read).length
}

const markAsRead = async (id) => {
  const notification = notifications.value.find(n => n.id === id)
  if (!notification) return

  await api.put(`/notifications/${id}`, {
    userId: notification.userId,
    message: notification.message,
    type: notification.type
  })

  notification.read = true
  unreadCount.value = notifications.value.filter(n => !n.read).length
}

const deleteAllNotifications = async () => {
  if (!userId.value) return
  try {
    await api.delete(`/notifications/user/${userId.value}`)
    notifications.value = []
    unreadCount.value = 0
  } catch (err) {
    console.error('Ошибка при удалении уведомлений', err)
  }
}

onMounted(fetchNotifications)
</script>

<style scoped>
.bell-wrapper {
  position: relative;
  cursor: pointer;
}

.icon {
  font-size: 22px;
}

.badge {
  position: absolute;
  top: -4px;
  right: -8px;
  background: red;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 50%;
}

.dropdown {
  position: absolute;
  right: 0;
  top: 32px;
  background: white;
  border: 1px solid #ccc;
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
  padding: 12px;
  border-radius: 6px;
  z-index: 999;
}

.dropdown ul {
  list-style: none;
  padding: 0;
}

.dropdown li {
  border-bottom: 1px solid #eee;
  margin-bottom: 8px;
  padding-bottom: 6px;
}

.dropdown li.unread {
  font-weight: bold;
  background-color: #f9f9f9;
}

.dropdown .message {
  margin-bottom: 4px;
}

.delete-all {
  margin-top: 10px;
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.delete-all:hover {
  background-color: #b02a37;
}
</style>
