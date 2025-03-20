import { createApp } from 'vue'
import pinia from './stores/index'
import { createI18n } from 'vue-i18n'
import App from './App.vue'
import Antd from 'ant-design-vue';
import router from './router'
import './styles/style.css'

// 国际化配置
import zh from './locales/zh.json'
import en from './locales/en.json'
import ja from './locales/ja.json'

// 获取用户首选语言
const savedLanguage = localStorage.getItem('language')
const browserLanguage = navigator.language.split('-')[0]
const defaultLanguage = savedLanguage || (browserLanguage && ['zh', 'en', 'ja'].includes(browserLanguage) ? browserLanguage : 'zh')

const i18n = createI18n({
  legacy: false,
  locale: defaultLanguage, // 优先使用本地存储的语言
  fallbackLocale: 'zh', // 回退语言
  messages: {
    zh,
    en,
    ja
  }
})

const app = createApp(App)

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(Antd)
app.mount('#app')
