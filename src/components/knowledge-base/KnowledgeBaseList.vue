<template>
  <div class="knowledge-base-list-container w-full md:w-64 border-b md:border-b-0 md:border-r border-law-200 dark:border-law-700 bg-law-50 dark:bg-law-800 h-[calc(100vh-64px)] md:h-full flex flex-col">
    <!-- 头部搜索区域 - 固定不滚动 -->
    <div class="p-3 flex items-center space-x-2 flex-shrink-0 border-b border-law-200 dark:border-law-700">
      <!-- 新建知识库按钮 -->
      <button 
        v-if="!isSearchActive && kbLibPermission"
        @click="$emit('create-kb')" 
        class="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
      >
        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>{{ $t('knowledge_base.create_new') || '新建知识库' }}</span>
      </button>
      
      <!-- 搜索图标按钮 -->
      <button 
        @click="toggleSearch" 
        class="p-2 bg-law-100 dark:bg-law-700 text-law-900 dark:text-law-100 rounded-md hover:bg-law-200 dark:hover:bg-law-600 transition-all duration-200"
        :class="{ 'hidden': isSearchActive }"
      >
        <span class="text-lg">🔍</span>
      </button>
      
      <!-- 搜索框 -->
      <div 
        v-if="isSearchActive" 
        class="flex-1 relative animate-slide-in"
      >
        <input 
          v-model="localSearchQuery"
          type="text"
          :placeholder="$t('knowledge_base.search_kb') || '搜索知识库'"
          class="w-full pl-10 pr-4 py-2 bg-law-100 dark:bg-law-700 text-law-900 dark:text-law-100 rounded-md focus:outline-none focus:ring-2 focus:ring-accent border border-law-200 dark:border-law-600"
          @blur="onSearchBlur"
          ref="searchInput"
        />
        <span class="absolute left-3 top-2.5 text-lg">🔍</span>
      </div>
    </div>
    
    <!-- 知识库列表 - 可滚动区域 -->
    <div class="kb-scroll-container flex-1 overflow-y-auto px-2 pb-4" ref="scrollContainer">
      <div class="kb-list-items">
        <div 
          v-for="kb in filteredList" 
          :key="kb.kb_id"
          @click="$emit('select-kb', kb)"
          class="flex items-center justify-between p-3 mb-2 rounded-lg cursor-pointer transition-colors"
          :class="selectedKb && selectedKb.kb_id === kb.kb_id ? 'bg-accent bg-opacity-10 text-accent' : 'hover:bg-law-100 dark:hover:bg-law-700 text-law-700 dark:text-law-300'"
        >
          <div class="flex items-center space-x-3">
            <svg class="w-5 h-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
            </svg>
            <span class="font-medium truncate">{{ kb.kb_name }}</span>
          </div>
          
          <div class="flex items-center" v-if="kb.delPermission">
            <button 
              @click.stop="$emit('rename-kb', kb)" 
              class="p-1.5 rounded-full hover:bg-law-200 dark:hover:bg-law-600 transition-colors"
              title="重命名"
            >
              <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
            </button>
            <button 
              @click.stop="$emit('delete-kb', kb)" 
              class="p-1.5 rounded-full hover:bg-law-200 dark:hover:bg-law-600 transition-colors ml-1"
              title="删除"
            >
              <svg class="w-4 h-4 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- 确保移动端有足够的空间滚动 -->
        <div v-if="filteredList.length <= 4" class="h-[50vh] md:h-0"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useKnowledgeBase } from '@/stores/useKnowledgeBase';
const knowledgeBaseStore = useKnowledgeBase();
const { kbLibPermission } = storeToRefs(knowledgeBaseStore);
console.log('kbLibPermission',kbLibPermission.value)
const props = defineProps({
  knowledgeBaseList: {
    type: Array,
    default: () => []
  },
  selectedKb: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['select-kb', 'create-kb', 'rename-kb', 'delete-kb']);

// 搜索相关
const isSearchActive = ref(false);
const localSearchQuery = ref('');
const searchInput = ref(null);
const scrollContainer = ref(null);

// 过滤后的知识库列表
const filteredList = computed(() => {
  if (localSearchQuery.value.trim() === '') {
    return props.knowledgeBaseList;
  } else {
    return props.knowledgeBaseList.filter(kb => 
      kb.kb_name.toLowerCase().includes(localSearchQuery.value.toLowerCase())
    );
  }
});

// 切换搜索框显示
const toggleSearch = () => {
  isSearchActive.value = !isSearchActive.value;
  if (isSearchActive.value) {
    nextTick(() => {
      searchInput.value.focus();
    });
  }
};

// 搜索框失去焦点
const onSearchBlur = () => {
  if (localSearchQuery.value.trim() === '') {
    isSearchActive.value = false;
  }
};

// 处理触摸事件，以支持移动端滚动
let touchStartY = 0;
let touchStartScrollTop = 0;

const handleTouchStart = (e) => {
  if (!scrollContainer.value) return;
  touchStartY = e.touches[0].clientY;
  touchStartScrollTop = scrollContainer.value.scrollTop;
};

const handleTouchMove = (e) => {
  if (!scrollContainer.value) return;
  const touchCurrentY = e.touches[0].clientY;
  const touchDelta = touchStartY - touchCurrentY;
  scrollContainer.value.scrollTop = touchStartScrollTop + touchDelta;
  
  // 阻止默认行为，防止页面整体滚动
  if (scrollContainer.value.scrollHeight > scrollContainer.value.clientHeight) {
    e.preventDefault();
  }
};

// 修复移动端滚动
onMounted(() => {
  // 检测是否为移动设备
  const isMobile = window.innerWidth < 768;
  
  if (scrollContainer.value) {
    // 应用移动端必要的样式
    scrollContainer.value.style.overflowY = 'auto';
    scrollContainer.value.style.webkitOverflowScrolling = 'touch';
    
    // 为移动端添加触摸事件监听
    if (isMobile) {
      scrollContainer.value.addEventListener('touchstart', handleTouchStart, { passive: false });
      scrollContainer.value.addEventListener('touchmove', handleTouchMove, { passive: false });
    }
  }
  
  // 添加特殊样式类
  if (isMobile) {
    document.body.classList.add('mobile-scroll-fix');
  }
  
  // 确保滚动容器初始高度正确
  nextTick(() => {
    if (scrollContainer.value) {
      // 强制重新计算滚动高度
      scrollContainer.value.style.height = 'auto';
      scrollContainer.value.style.height = `${scrollContainer.value.parentElement.clientHeight - 60}px`; // 减去头部高度
    }
  });
});

// 清理事件监听
onUnmounted(() => {
  if (scrollContainer.value) {
    scrollContainer.value.removeEventListener('touchstart', handleTouchStart);
    scrollContainer.value.removeEventListener('touchmove', handleTouchMove);
  }
  
  document.body.classList.remove('mobile-scroll-fix');
});
</script>

<style scoped>
.animate-slide-in {
  animation: slideIn 0.3s ease-out forwards;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 知识库列表容器样式 */
.knowledge-base-list-container {
  position: relative;
  z-index: 10;
}

/* 滚动容器基础样式 */
.kb-scroll-container {
  -webkit-overflow-scrolling: touch !important;
  position: relative;
  overscroll-behavior: contain;
  touch-action: pan-y;
}

/* 专门针对移动端的滚动修复 */
@media (max-width: 768px) {
  .kb-scroll-container {
    min-height: 200px;
    height: calc(100vh - 120px) !important; /* 减去头部和其他可能的高度 */
    overflow-y: auto !important;
    touch-action: pan-y;
  }
  
  .kb-list-items {
    padding-bottom: 50px; /* 确保最后一项也能完全滚动到视图中 */
  }
  
  /* 为了保证滚动流畅性，移动端项目间距略大 */
  .kb-list-items > div {
    margin-bottom: 0.75rem;
  }
}
</style> 