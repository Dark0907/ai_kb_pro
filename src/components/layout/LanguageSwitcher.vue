<template>
  <div class="relative">
    <button 
      @click="isOpen = !isOpen"
      class="flex items-center space-x-1 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-accent transition-colors duration-200"
      :class="{
        'hover:bg-law-100 text-law-700 dark:text-white dark:hover:bg-law-700': true
      }"
    >
      <span>{{ currentLanguageLabel }}</span>
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-law-600 dark:text-law-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    <div 
      v-if="isOpen" 
      class="absolute right-0 mt-2 w-48 bg-white dark:bg-law-800 rounded-md shadow-law z-50 border border-law-200 dark:border-law-700 overflow-hidden"
    >
      <div class="py-1">
        <button 
          v-for="lang in languages" 
          :key="lang.code"
          @click="changeLanguage(lang.code)"
          class="w-full text-left px-4 py-2 text-sm text-law-700 dark:text-law-200 hover:bg-law-100 dark:hover:bg-law-700 transition-colors duration-200"
          :class="{ 'bg-law-100 dark:bg-law-700 font-medium text-accent dark:text-accent': currentLanguage === lang.code }"
        >
          {{ lang.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../../stores/settings'

const i18n = useI18n()
const settingsStore = useSettingsStore()
const isOpen = ref(false)

// 可用语言列表
const languages = [
  { code: 'zh', label: '简体中文' },
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' }
]

// 当前语言
const currentLanguage = computed(() => settingsStore.language)

// 当前语言标签
const currentLanguageLabel = computed(() => {
  const lang = languages.find(lang => lang.code === currentLanguage.value)
  return lang ? lang.label : '简体中文'
})

// 切换语言
const changeLanguage = (langCode) => {
  settingsStore.setLanguage(langCode)
  i18n.locale.value = langCode
  isOpen.value = false
}

// 点击外部关闭下拉菜单
const handleClickOutside = (event) => {
  if (isOpen.value && !event.target.closest('.relative')) {
    isOpen.value = false
  }
}

// 监听点击事件
watch(isOpen, (newValue) => {
  if (newValue) {
    setTimeout(() => {
      window.addEventListener('click', handleClickOutside)
    }, 0)
  } else {
    window.removeEventListener('click', handleClickOutside)
  }
})
</script>
