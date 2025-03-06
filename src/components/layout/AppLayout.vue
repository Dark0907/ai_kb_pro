<template>
  <div class="flex h-screen bg-law-100 dark:bg-law-900">
    <!-- 左侧侧边栏 - 在移动端默认隐藏 -->
    <div 
      :class="[
        'fixed md:relative z-20 w-64 h-full transition-all duration-300 bg-law-50 dark:bg-law-800 shadow-law border-r border-law-200 dark:border-law-700',
        isSidebarOpen ? 'left-0' : '-left-64 md:left-0'
      ]"
    >
      <sidebar-component />
    </div>
    
    <!-- 遮罩层 - 移动端侧边栏打开时显示 -->
    <div 
      v-if="isSidebarOpen" 
      class="fixed inset-0 z-10 bg-black bg-opacity-50 md:hidden"
      @click="toggleSidebar"
    ></div>
    
    <!-- 主内容区 -->
    <div class="flex flex-col flex-1 overflow-hidden">
      <!-- 顶部导航栏 -->
      <header class="flex items-center justify-between h-16 px-4 bg-white dark:bg-law-800 text-law-800 dark:text-white shadow-md border-b border-law-200 dark:border-law-700">
        <!-- 移动端侧边栏切换按钮 -->
        <button 
          class="p-2 rounded-md md:hidden focus:outline-none focus:ring-2 focus:ring-accent"
          @click="toggleSidebar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-law-800 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <!-- 应用标题 -->
        <div class="flex items-center">
          <span class="text-2xl mr-2">⚖️</span>
          <h1 class="text-xl font-bold text-law-800 dark:text-white">{{ $t('app.title') }}</h1>
        </div>
        
        <!-- 导航菜单 - 在非移动端显示 -->
        <!-- <div class="hidden md:flex items-center space-x-6">
          <a href="#" class="text-law-700 dark:text-law-200 hover:text-accent dark:hover:text-accent transition-colors duration-200">{{ $t('nav.home') }}</a>
          <a href="#" class="text-law-700 dark:text-law-200 hover:text-accent dark:hover:text-accent transition-colors duration-200">{{ $t('nav.features') }}</a>
          <a href="#" class="text-law-700 dark:text-law-200 hover:text-accent dark:hover:text-accent transition-colors duration-200">{{ $t('nav.about') }}</a>
          <a href="#" class="text-law-700 dark:text-law-200 hover:text-accent dark:hover:text-accent transition-colors duration-200">{{ $t('nav.contact') }}</a>
        </div> -->
        
        <!-- 语言切换和主题切换 -->
        <div class="flex items-center space-x-4">
          <language-switcher class="hidden md:flex" />
          <theme-switcher />
        </div>
      </header>
      
      <!-- 内容区域 -->
      <main class="flex flex-1 overflow-hidden">
        <!-- 中间聊天区域 -->
        <div class="flex flex-col flex-1 overflow-hidden bg-white dark:bg-law-900 shadow-inner">
          <router-view />
        </div>
        
        <!-- 右侧引用区域 - 默认隐藏，点击引用时显示 -->
        <div 
          v-if="referenceStore.showReferencePanel"
          :class="[
            'w-80 h-full transition-all duration-300 bg-white dark:bg-law-800 shadow-law overflow-y-auto',
            'fixed right-0 top-16 bottom-0 z-30 lg:relative lg:top-0 lg:z-10',
            { 'animate-slide-in-right': referenceStore.showReferencePanel }
          ]"
        >
          <reference-panel />
        </div>
        
        <!-- 引用面板遮罩层 - 在小屏幕上显示 -->
        <div 
          v-if="referenceStore.showReferencePanel && !isLargeScreen" 
          class="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          @click="closeReferencePanel"
        ></div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import SidebarComponent from '../sidebar/SidebarComponent.vue'
import ReferencePanel from '../reference/ReferencePanel.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
import { useSettingsStore } from '../../stores/settings'
import { useReferenceStore } from '../../stores/reference'

// 状态
const isSidebarOpen = ref(false)
const windowWidth = ref(window.innerWidth)
const settingsStore = useSettingsStore()
const referenceStore = useReferenceStore()

// 计算属性
const isLargeScreen = computed(() => windowWidth.value >= 1024) // lg breakpoint

// 方法
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const toggleReference = () => {
  referenceStore.setShowReferencePanel(!referenceStore.showReferencePanel)
}

const closeReferencePanel = () => {
  referenceStore.setShowReferencePanel(false)
}

// 监听窗口大小变化
const handleResize = () => {
  windowWidth.value = window.innerWidth
  if (windowWidth.value >= 768) { // md breakpoint
    isSidebarOpen.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  window.addEventListener('resize', handleResize)
  settingsStore.initTheme()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// 暴露方法给父组件
defineExpose({
  toggleReference
})
</script>

<style scoped>
.animate-slide-in-right {
  animation: slideInRight 0.3s ease-in-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.shadow-inner {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

/* 添加自定义颜色 */
:root {
  --sidebar-bg-light: #f8f9fa;
  --sidebar-bg-dark: #2d3748;
}
</style> 