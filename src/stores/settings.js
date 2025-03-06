import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  // 状态
  const language = ref(localStorage.getItem('language') || navigator.language.split('-')[0] || 'zh')
  const theme = ref(localStorage.getItem('theme') || 'light')

  // 监听语言变化，保存到本地存储
  watch(language, (newLanguage) => {
    localStorage.setItem('language', newLanguage)
  })

  // 监听主题变化，保存到本地存储
  watch(theme, (newTheme) => {
    localStorage.setItem('theme', newTheme)
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  })

  // 设置语言
  const setLanguage = (newLanguage) => {
    language.value = newLanguage
  }

  // 设置主题
  const setTheme = (newTheme) => {
    theme.value = newTheme
  }

  // 初始化主题
  const initTheme = () => {
    if (theme.value === 'dark' || 
        (theme.value === 'system' && 
         window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return {
    language,
    theme,
    setLanguage,
    setTheme,
    initTheme
  }
}) 