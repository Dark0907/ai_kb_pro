<template>
  <div class="knowledge-base-selector">
    <!-- 标题 -->
    <div class="flex items-center justify-between px-4 py-2">
      <h3 class="text-sm font-semibold text-primary dark:text-accent">
        {{ $t('sidebar.knowledge_base') || '知识库列表' }}
      </h3>
      <button 
        @click="toggleExpand" 
        class="text-law-600 dark:text-law-400 hover:text-accent dark:hover:text-accent transition-colors duration-200"
      >
        <svg 
          class="w-4 h-4" 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
          :class="{ 'transform rotate-180': isExpanded }"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
    </div>
    
    <!-- 知识库列表 -->
    <div v-if="isExpanded" class="px-4 pb-3 space-y-2 max-h-60 overflow-y-auto">
      <div v-if="knowledgeBaseList.length === 0" class="text-center text-law-500 dark:text-law-400 text-sm py-2">
        {{ $t('sidebar.no_knowledge_base') || '暂无知识库' }}
      </div>
      
      <div 
        v-for="kb in knowledgeBaseList" 
        :key="kb.kb_id"
        class="flex items-center p-2 rounded-md hover:bg-law-200 dark:hover:bg-law-700 transition-colors duration-200"
      >
        <input 
          type="checkbox" 
          :id="kb.kb_id" 
          :value="kb.kb_id" 
          v-model="selectedKbs"
          class="w-4 h-4 text-accent bg-law-100 dark:bg-law-700 border-law-300 dark:border-law-600 rounded focus:ring-accent focus:ring-2"
          @change="updateSelection"
        />
        <label 
          :for="kb.kb_id" 
          class="ml-2 text-sm font-medium text-law-900 dark:text-law-100 cursor-pointer truncate"
        >
          {{ kb.kb_name }}
        </label>
      </div>
    </div>
    
    <!-- 选中的知识库数量显示 -->
    <div v-if="!isExpanded && selectedKbs.length > 0" class="px-4 pb-2">
      <div class="text-xs text-law-500 dark:text-law-400">
        {{ $t('sidebar.selected_count', { count: selectedKbs.length }) || `已选择 ${selectedKbs.length} 个知识库` }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useKnowledgeBase } from '@/stores/useKnowledgeBase';
import { storeToRefs } from 'pinia';

// 获取知识库数据
const knowledgeBaseStore = useKnowledgeBase();
const { knowledgeBaseList, selectList } = storeToRefs(knowledgeBaseStore);

// 本地状态
const isExpanded = ref(true);
const selectedKbs = ref([]);

// 初始化选中的知识库
onMounted(() => {
  if (selectList.value && selectList.value.length > 0) {
    selectedKbs.value = [...selectList.value];
  }
});

// 监听 selectList 变化
watch(() => selectList.value, (newValue) => {
  if (newValue && newValue.length > 0) {
    selectedKbs.value = [...newValue];
  }
}, { deep: true });

// 切换展开/折叠
const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
};

// 更新选中的知识库
const updateSelection = () => {
  knowledgeBaseStore.setSelectList([...selectedKbs.value]);
};
</script>

<style scoped>
.knowledge-base-selector {
  border-bottom: 1px solid var(--border-color, #e2e8f0);
}

:deep(.dark) .knowledge-base-selector {
  border-color: var(--dark-border-color, #4a5568);
}

/* 自定义复选框样式 */
input[type="checkbox"] {
  cursor: pointer;
}

/* 滚动条样式 */
.max-h-60 {
  scrollbar-width: thin;
  scrollbar-color: rgba(156, 163, 175, 0.5) transparent;
}

.max-h-60::-webkit-scrollbar {
  width: 6px;
}

.max-h-60::-webkit-scrollbar-track {
  background: transparent;
}

.max-h-60::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 3px;
}

/* 暗色模式滚动条 */
:deep(.dark) .max-h-60::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.5);
}
</style> 