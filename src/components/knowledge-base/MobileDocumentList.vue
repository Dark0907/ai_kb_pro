<template>
  <div class="md:hidden mobile-document-container flex-1 overflow-y-auto">
    <div v-if="documents.length === 0" class="py-8 text-center text-law-500 dark:text-law-400">
      {{ $t('knowledge_base.no_documents') || '暂无文档，请上传新文档' }}
    </div>
    <div v-else class="space-y-4">
      <div 
        v-for="(doc, index) in documents" 
        :key="doc.file_id"
        class="bg-law-50 dark:bg-law-800 rounded-lg border border-law-200 dark:border-law-700 p-4"
      >
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h3 class="font-medium text-law-800 dark:text-white">{{ doc.file_name }}</h3>
            <div class="mt-2 space-y-1">
              <p class="text-xs text-law-500 dark:text-law-400 flex items-center">
                <span class="font-medium mr-2">ID:</span> {{ totalItems - ((currentPage - 1) * pageSize) - index }}
              </p>
              <p class="text-xs text-law-500 dark:text-law-400 flex items-center">
                <span class="font-medium mr-2">{{ $t('knowledge_base.status') || '状态' }}:</span>
                <span 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': doc.status === 'green',
                    'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': doc.status === 'yellow',
                    'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': doc.status === 'red'
                  }"
                >
                  {{ 
                    doc.status === 'green' ? ($t('knowledge_base.status_success') || '已完成') : 
                    doc.status === 'yellow' ? ($t('knowledge_base.status_processing') || '处理中') : 
                    ($t('knowledge_base.status_failed') || '失败') 
                  }}
                </span>
              </p>
              <p class="text-xs text-law-500 dark:text-law-400 flex items-center">
                <span class="font-medium mr-2">{{ $t('knowledge_base.file_size') || '文件大小' }}:</span> {{ formatFileSize(doc.bytes) }}
              </p>
              <p class="text-xs text-law-500 dark:text-law-400 flex items-center">
                <span class="font-medium mr-2">{{ $t('knowledge_base.created_at') || '创建日期' }}:</span> {{ formatDate(doc.timestamp) }}
              </p>
            </div>
          </div>
          <div class="flex space-x-2">
            <button 
              @click="$emit('view-document', doc)" 
              class="text-accent hover:text-accent-dark transition-colors"
              :title="$t('knowledge_base.view') || '查看'"
            >
              <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
            <button
              v-if="selectedKb.delPermission"
              @click="$emit('delete-document', doc)" 
              class="text-red-500 hover:text-red-600 transition-colors"
              :title="$t('knowledge_base.delete') || '删除'"
            >
              <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 6h18"></path>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <!-- 加载更多指示器 -->
      <div v-if="isLoadingMore" class="py-4 text-center text-law-500 dark:text-law-400">
        <svg class="animate-spin w-5 h-5 mx-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 6v6l4 2"></path>
        </svg>
        <p class="mt-2">{{ $t('knowledge_base.loading_more') || '加载更多...' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  documents: {
    type: Array,
    default: () => []
  },
  currentPage: {
    type: Number,
    default: 1
  },
  totalItems: {
    type: Number,
    default: 0
  },
  pageSize: {
    type: Number,
    default: 15
  },
  isLoadingMore: {
    type: Boolean,
    default: false
  },
  selectedKb: {
    type: Object,
    default: null
  },
});

const emit = defineEmits(['load-more', 'view-document', 'delete-document']);

// 监听滚动事件
const handleScroll = (event) => {
  const container = event.target;
  if (!container) return;
  
  const { scrollTop, scrollHeight, clientHeight } = container;
  
  // 当滚动到距离底部50px时加载更多
  if (scrollHeight - scrollTop - clientHeight < 50 && !props.isLoadingMore) {
    emit('load-more');
  }
};

onMounted(() => {
  // 获取容器元素并添加滚动事件监听
  const container = document.querySelector('.mobile-document-container');
  if (container) {
    container.addEventListener('scroll', handleScroll);
  }
});

onUnmounted(() => {
  // 移除滚动事件监听
  const container = document.querySelector('.mobile-document-container');
  if (container) {
    container.removeEventListener('scroll', handleScroll);
  }
});

// 格式化日期 - 处理timestamp格式
const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  
  try {
    // 处理格式为"202503121229"的时间戳
    const year = timestamp.substring(0, 4);
    const month = timestamp.substring(4, 6);
    const day = timestamp.substring(6, 8);
    const hour = timestamp.substring(8, 10);
    const minute = timestamp.substring(10, 12);
    
    return `${year}-${month}-${day} ${hour}:${minute}`;
  } catch (e) {
    return timestamp;
  }
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return '-';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};
</script> 