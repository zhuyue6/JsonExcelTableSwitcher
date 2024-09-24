import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import '@/styles/index.scss'
import 'element-plus/dist/index.css'
import App from './app.vue'

const app = createApp(App)
app.mount('#app')

app.use(ElementPlus, {
  locale: zhCn,
})