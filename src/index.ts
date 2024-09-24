import { createApp } from 'vue'
import '@/styles/index.scss'
import 'element-plus/dist/index.css'
import App from './app.vue'
import i18n from './lang' 

const app = createApp(App)
app.use(i18n)
app.mount('#app')