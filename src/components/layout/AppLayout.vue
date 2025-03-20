<template>
  <div class="flex h-screen bg-law-100 dark:bg-law-900">
    <!-- 左侧侧边栏 - 在移动端默认隐藏，添加收起/展开功能 -->
    <div 
      v-if="!isSidebarCollapsed"
      :class="[
        'fixed md:relative z-20 h-full w-64 transition-all duration-300 bg-law-50 dark:bg-law-800 shadow-law border-r border-law-200 dark:border-law-700',
        isSidebarOpen ? 'left-0' : '-left-64 md:left-0'
      ]"
    >
      <!-- 侧边栏收起/展开按钮 - 放在侧边栏右侧边缘 -->
      <button 
        @click="toggleSidebarCollapse"
        class="absolute -right-5 top-4 z-10 bg-white dark:bg-law-800 rounded-full p-1.5 shadow-md border border-law-200 dark:border-law-700 hover:bg-law-100 dark:hover:bg-law-700 transition-colors hidden md:block"
        :title="$t('sidebar.collapse')"
      >
        <svg 
          class="w-4 h-4 text-law-600 dark:text-law-300"
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      
      <!-- 侧边栏内容 -->
      <div class="h-full overflow-hidden">
        <sidebar-component />
      </div>
    </div>
    
    <!-- 侧边栏展开按钮 - 仅在侧边栏收起时显示 -->
    <div 
      v-if="isSidebarCollapsed" 
      class="fixed top-4 left-0 z-30 hidden md:block"
    >
      <button 
        @click="toggleSidebarCollapse"
        class="p-1.5 rounded-r-full bg-white dark:bg-law-800 shadow-md border border-law-200 dark:border-law-700 hover:bg-law-100 dark:hover:bg-law-700 transition-colors"
        :title="$t('sidebar.expand')"
      >
        <svg 
          class="w-4 h-4 text-law-600 dark:text-law-300"
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
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
        <!-- 左侧区域：汉堡菜单和应用标题 -->
        <div class="flex items-center">
          <!-- 移动端侧边栏切换按钮 -->
          <button 
            class="p-2 rounded-md md:hidden focus:outline-none focus:ring-2 focus:ring-accent mr-2"
            @click="toggleSidebar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-law-800 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <!-- 应用标题 -->
          <div class="flex items-center" :class="{ 'ml-4': isLargeScreen }">
            <span class="text-2xl mr-2">⚖️</span>
            <h1 class="text-xl font-bold text-law-800 dark:text-white mobile-title">{{ $t('app.title') }}</h1>
          </div>
        </div>
        
        <!-- 右侧区域：知识库下拉列表、语言切换和主题切换 -->
        <div class="flex items-center space-x-3">
          <!-- 知识库下拉列表 -->
          <knowledge-base-selector />
          
          <language-switcher class="hidden md:block" />
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
            'w-80 h-full transition-all duration-300 bg-white dark:bg-law-800 shadow-law overflow-y-auto dark:border-law-700 border-l',
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
        >
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import SidebarComponent from '../sidebar/SidebarComponent.vue'
import ReferencePanel from '../reference/ReferencePanel.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
import { useSettingsStore } from '../../stores/settings'
import { useReferenceStore } from '../../stores/reference'
import KnowledgeBaseSelector from '../sidebar/KnowledgeBaseSelector.vue'

const router = useRouter()

// 状态
const isSidebarOpen = ref(false)
const isSidebarCollapsed = ref(false) // 侧边栏收起状态
const windowWidth = ref(window.innerWidth)
const settingsStore = useSettingsStore()
const referenceStore = useReferenceStore()

// 计算属性
const isLargeScreen = computed(() => windowWidth.value >= 1024) // lg breakpoint

// 方法
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
  // 如果侧边栏打开，则确保不收起
  if (isSidebarOpen.value) {
    isSidebarCollapsed.value = false
  }
}

// 切换侧边栏收起/展开状态
const toggleSidebarCollapse = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
  // 保存状态到本地存储
  localStorage.setItem('sidebarCollapsed', isSidebarCollapsed.value)
}

// 创建新对话 - 修改为跳转到新对话页面，而不是直接创建对话
const createNewChat = () => {
  router.push('/chat/new')
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
  
  // 监听关闭侧边栏事件
  window.addEventListener('close-sidebar', () => {
    isSidebarOpen.value = false
  })
  
  settingsStore.initTheme()
  
  // 从本地存储中恢复侧边栏状态
  const savedState = localStorage.getItem('sidebarCollapsed')
  if (savedState !== null) {
    isSidebarCollapsed.value = savedState === 'true'
  }
  
  // 如果当前是首页，则重定向到新对话页面
  if (router.currentRoute.value.path === '/') {
    router.push('/chat/new')
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('close-sidebar', () => {
    isSidebarOpen.value = false
  })
})

// 暴露方法给父组件
defineExpose({
  createNewChat
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

/* 移动设备适配 */
@media (max-width: 640px) {
  .kb-dropdown .absolute {
    width: calc(100vw - 2rem);
    max-width: 20rem;
    right: 0;
  }
}
@media (max-width: 768px) {
  .mobile-title {
    font-size: 1rem; /* 缩小字体大小 */
    overflow: hidden; /* 隐藏超出部分 */
    text-overflow: ellipsis; /* 超出部分用省略号表示 */
  }
}
</style> 