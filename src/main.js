import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import router from './router'
import './style.css'

// 国际化配置
import zh from './locales/zh.json'
import en from './locales/en.json'
import ja from './locales/ja.json'

const i18n = createI18n({
  legacy: false,
  locale: navigator.language.split('-')[0] || 'zh', // 默认使用浏览器语言
  fallbackLocale: 'zh', // 回退语言
  messages: {
    zh,
    en,
    ja
  }
})

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(i18n)

app.mount('#app')
