<template>
   <div class="w-full md:w-64 border-b md:border-b-0 md:border-r border-law-200 dark:border-law-700 bg-law-50 dark:bg-law-800 overflow-y-auto flex-shrink-0 h-full flex flex-col">
    <div class="p-3 flex items-center space-x-2 flex-shrink-0">
      <!-- 新建知识库按钮 -->
      <button 
        v-if="!isSearchActive"
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
    
    <!-- 知识库列表 -->
    <div class="px-2 pb-4">
      <div 
        v-for="kb in filteredList" 
        :key="kb.kb_id"
        @click="$emit('select-kb', kb)"
        class="flex items-center justify-between p-3 mb-1 rounded-lg cursor-pointer transition-colors"
        :class="selectedKb && selectedKb.kb_id === kb.kb_id ? 'bg-accent bg-opacity-10 text-accent' : 'hover:bg-law-100 dark:hover:bg-law-700 text-law-700 dark:text-law-300'"
      >
        <div class="flex items-center space-x-3">
          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
          </svg>
          <span class="font-medium truncate">{{ kb.kb_name }}</span>
        </div>
        
        <div class="flex items-center">
          <button 
            @click.stop="$emit('rename-kb', kb)" 
            class="p-1 rounded-full hover:bg-law-200 dark:hover:bg-law-600 transition-colors"
            title="重命名"
          >
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
            </svg>
          </button>
          <button 
            @click.stop="$emit('delete-kb', kb)" 
            class="p-1 rounded-full hover:bg-law-200 dark:hover:bg-law-600 transition-colors"
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
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

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
</style> 