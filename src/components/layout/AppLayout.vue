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
          <div class="flex items-center">
            <span class="text-2xl mr-2">⚖️</span>
            <h1 class="text-xl font-bold text-law-800 dark:text-white">{{ $t('app.title') }}</h1>
          </div>
        </div>
        
        <!-- 右侧区域：知识库下拉列表、语言切换和主题切换 -->
        <div class="flex items-center space-x-3">
          <!-- 知识库下拉列表 -->
          <div class="relative kb-dropdown">
            <button 
              @click.stop="toggleKbDropdown" 
              class="flex items-center space-x-1 px-2.5 py-1.5 rounded-full bg-law-50 dark:bg-law-700 hover:bg-law-100 dark:hover:bg-law-600 transition-colors duration-200 text-law-800 dark:text-law-100 border border-law-200 dark:border-law-600 shadow-sm"
            >
              <svg class="w-4 h-4 text-accent" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
              </svg>
              <span class="text-sm font-medium hidden md:inline">
                {{ $t('sidebar.knowledge_base') }}
              </span>
              <svg 
                class="w-4 h-4" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2" 
                stroke-linecap="round" 
                stroke-linejoin="round"
                :class="{ 'transform rotate-180': isKbDropdownOpen }"
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              <span v-if="selectedKbs.length > 0" class="ml-1 flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-accent rounded-full">
                {{ selectedKbs.length }}
              </span>
            </button>
            
            <!-- 下拉菜单 -->
            <div 
              v-if="isKbDropdownOpen" 
              class="absolute right-0 md:left-auto md:right-0 mt-2 w-72 md:w-[28rem] lg:w-[36rem] max-h-[70vh] overflow-y-auto bg-white dark:bg-law-800 rounded-lg shadow-xl border border-law-200 dark:border-law-700 z-50"
              @click.stop
            >
              <div class="p-4">
                <div v-if="knowledgeBaseList.length === 0" class="text-center text-law-500 dark:text-law-400 text-sm py-4">
                  {{ $t('sidebar.no_knowledge_base') }}
                </div>
                
                <div v-else>
                  <div class="flex items-center justify-between mb-3 pb-3 border-b border-law-200 dark:border-law-700">
                    <h3 class="text-base font-semibold text-law-800 dark:text-law-100">{{ $t('sidebar.knowledge_base') }}</h3>
                    <div class="flex space-x-2">
                      <button 
                        @click="selectAllKbs" 
                        class="text-xs px-3 py-1.5 rounded-full bg-accent bg-opacity-10 hover:bg-opacity-20 text-accent transition-colors"
                      >
                        {{ $t('sidebar.select_all') || '全选' }}
                      </button>
                      <button 
                        @click="clearSelection" 
                        class="text-xs px-3 py-1.5 rounded-full bg-law-100 dark:bg-law-700 hover:bg-law-200 dark:hover:bg-law-600 text-law-700 dark:text-law-200 transition-colors"
                      >
                        {{ $t('sidebar.clear') || '清空' }}
                      </button>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    <div 
                      v-for="kb in knowledgeBaseList" 
                      :key="kb.kb_id"
                      class="flex items-center p-2.5 rounded-lg hover:bg-law-50 dark:hover:bg-law-700 transition-colors duration-200"
                    >
                      <div class="relative flex items-center">
                        <input 
                          type="checkbox" 
                          :id="`header-${kb.kb_id}`" 
                          :value="kb.kb_id" 
                          v-model="selectedKbs"
                          class="w-4 h-4 text-accent bg-white dark:bg-law-700 border-law-300 dark:border-law-600 rounded focus:ring-accent focus:ring-2"
                          @change="updateSelection"
                        />
                        <label 
                          :for="`header-${kb.kb_id}`" 
                          class="ml-2.5 text-sm font-medium text-law-900 dark:text-law-100 cursor-pointer truncate"
                        >
                          {{ kb.kb_name }}
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
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
import SidebarComponent from '../sidebar/SidebarComponent.vue'
import ReferencePanel from '../reference/ReferencePanel.vue'
import LanguageSwitcher from './LanguageSwitcher.vue'
import ThemeSwitcher from './ThemeSwitcher.vue'
import { useSettingsStore } from '../../stores/settings'
import { useReferenceStore } from '../../stores/reference'
import { useKnowledgeBase } from '@/stores/useKnowledgeBase';

// 获取知识库列表
const knowledgeBaseStore = useKnowledgeBase();
const { getList } = knowledgeBaseStore;
const { knowledgeBaseList, selectList } = storeToRefs(knowledgeBaseStore);

// 状态
const isSidebarOpen = ref(false)
const windowWidth = ref(window.innerWidth)
const settingsStore = useSettingsStore()
const referenceStore = useReferenceStore()
const selectedKbs = ref([])
const isKbDropdownOpen = ref(false)

// 计算属性
const isLargeScreen = computed(() => windowWidth.value >= 1024) // lg breakpoint

// 计算选中的知识库名称
const selectedKbName = computed(() => {
  if (selectedKbs.value.length === 0) {
    return '';
  } else if (selectedKbs.value.length === 1) {
    const kb = knowledgeBaseList.value.find(kb => kb.kb_id === selectedKbs.value[0]);
    return kb ? kb.kb_name : '';
  } else {
    return `${$t('sidebar.selected_count', { count: selectedKbs.value.length })}`;
  }
});

// 初始化选中的知识库
watch(() => selectList.value, (newValue) => {
  if (newValue && newValue.length > 0) {
    selectedKbs.value = [...newValue];
  }
}, { immediate: true, deep: true });

// 方法
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

const toggleReference = () => {
  console.log('toggleReference',referenceStore.showReferencePanel)
  console.log('toggleReference',isLargeScreen.value)
  referenceStore.setShowReferencePanel(!referenceStore.showReferencePanel)
}

const closeReferencePanel = () => {
  referenceStore.setShowReferencePanel(false)
}

const toggleKbDropdown = () => {
  isKbDropdownOpen.value = !isKbDropdownOpen.value
}

const updateSelection = () => {
  knowledgeBaseStore.setSelectList([...selectedKbs.value]);
}

const selectAllKbs = () => {
  selectedKbs.value = knowledgeBaseList.value.map(kb => kb.kb_id);
  updateSelection();
}

const clearSelection = () => {
  selectedKbs.value = [];
  updateSelection();
}

// 点击外部关闭下拉列表
const handleClickOutside = (event) => {
  const dropdown = document.querySelector('.kb-dropdown');
  if (dropdown && !dropdown.contains(event.target) && isKbDropdownOpen.value) {
    isKbDropdownOpen.value = false;
  }
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
  window.addEventListener('click', handleClickOutside)
  settingsStore.initTheme()
  getList()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('click', handleClickOutside)
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

/* 知识库下拉列表样式 */
.kb-dropdown {
  position: relative;
}

/* 滚动条样式 */
.max-h-[70vh] {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.max-h-[70vh]::-webkit-scrollbar {
  width: 6px;
}

.max-h-[70vh]::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-[70vh]::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

/* 暗色模式滚动条 */
.dark .max-h-[70vh]::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}

/* 移动设备适配 */
@media (max-width: 640px) {
  .kb-dropdown .absolute {
    width: calc(100vw - 2rem);
    max-width: 20rem;
    right: 0;
  }
}

/* 下拉菜单动画 */
.kb-dropdown .absolute {
  animation: dropdownFadeIn 0.2s ease-out;
  transform-origin: top right;
}

@keyframes dropdownFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style> 