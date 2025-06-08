import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Login from '@/views/Login.vue'
import Register from '@/views/Register.vue'
import Dashboard from '@/views/Dashboard.vue'
import CreateProperty from '@/views/CreateProperty.vue'
import PropertyList from '@/views/PropertyList.vue'
import PropertyDetail from '@/views/PropertyDetail.vue'
import MyProperties from '@/views/MyProperties.vue'
import EditProperty from '@/views/EditProperty.vue'
import UploadPhotos from '@/views/UploadPhotos.vue'
import MyRentals from '@/views/MyRentals.vue'
import RentalRequests from '@/views/RentalRequests.vue'
import MyRequests from '@/views/MyRequests.vue'
import ComPropertyList from '@/views/ComPropertyList.vue'
import ComPropertyDetail from '@/views/ComPropertyDetail.vue'
import PropertyDetailsPage from '@/views/PropertyDetailsPage.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/properties', component: PropertyList },
  { path: '/properties/:id', component: PropertyDetail },
  { path: '/properties/create', component: CreateProperty, meta: { requiresAuth: true } },
  { path: '/my-properties', component: MyProperties, meta: { requiresAuth: true } },
  { path: '/properties/edit/:id', component: EditProperty, meta: { requiresAuth: true } },
  { path: '/properties/:id/photos', component: UploadPhotos, meta: { requiresAuth: true } },
  { path: '/my-rentals', name: 'MyRentals', component: MyRentals, meta: { requiresAuth: true } },
  { path: '/rental-requests', name: 'RentalRequests', component: RentalRequests, meta: { requiresAuth: true } },
  { path: '/my-requests', name: 'MyRequests', component: MyRequests, meta: { requiresAuth: true } },
  { path: '/properties/commercial', component: ComPropertyList },
  { path: '/commercial/:id', component: ComPropertyDetail },
  { path: '/properties/details/:id', name: 'PropertyDetails', component: PropertyDetailsPage },

]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
