import { createI18n } from 'vue-i18n'
import cn from './cn'
import en from './en'

const messages = {
    en,
    cn
}

const i18n = createI18n({
    legacy: true, // VUE3 组合式API
    locale: 'en', // 默认cn语言环境
    fallbackLocale: 'cn',  //备用语言环境
    messages
})

export default i18n