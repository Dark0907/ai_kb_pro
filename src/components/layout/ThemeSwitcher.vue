<template>
  <button 
    @click="toggleTheme"
    class="p-2 rounded-md hover:bg-law-100 dark:hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-accent transition-colors duration-200"
  >
    <!-- 暗色主题图标 -->
    <span v-if="currentTheme === 'light'" class="text-xl">🌙</span>
    
    <!-- 亮色主题图标 -->
    <span v-else class="text-xl">🌞</span>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { useSettingsStore } from '../../stores/settings'

const settingsStore = useSettingsStore()

// 当前主题
const currentTheme = computed(() => settingsStore.theme)

// 切换主题
const toggleTheme = () => {
  const newTheme = currentTheme.value === 'light' ? 'dark' : 'light'
  settingsStore.setTheme(newTheme)
}
</script>
