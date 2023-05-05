import { createApp, ref } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { VueQueryPlugin } from '@tanstack/vue-query'

import Notification from './components/Notification.vue'

const app = createApp(App)

// 全局组件
app.component('Notification', Notification)

// 全局状态
const walletContainer = ref(null)
app.provide('wallet', walletContainer)
app.provide('notifying', ref(false))

app.use(router)
app.use(VueQueryPlugin)
app.mount('body')
