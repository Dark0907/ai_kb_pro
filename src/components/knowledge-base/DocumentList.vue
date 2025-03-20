<template>
  <div class="hidden md:flex flex-col flex-1 overflow-hidden bg-white dark:bg-law-900">
    <!-- 表格布局容器 -->
    <div class="flex-1 flex flex-col overflow-hidden px-1">
      <!-- 表格头部 - 使用grid布局代替table使其更容易对齐 -->
      <div class="grid grid-cols-12 gap-4 py-4 border-b border-law-200 dark:border-law-700 flex-shrink-0 bg-law-50 dark:bg-law-800">
        <div class="col-span-1 text-left text-xs font-medium text-law-500 dark:text-law-400 uppercase tracking-wider">
          {{ $t('knowledge_base.doc_id') || '文档ID' }}
        </div>
        <div class="col-span-6 text-left text-xs font-medium text-law-500 dark:text-law-400 uppercase tracking-wider">
          {{ $t('knowledge_base.doc_name') || '文档名称' }}
        </div>
        <div class="col-span-1 text-left text-xs font-medium text-law-500 dark:text-law-400 uppercase tracking-wider">
          {{ $t('knowledge_base.status') || '文档状态' }}
        </div>
        <div class="col-span-1 text-left text-xs font-medium text-law-500 dark:text-law-400 uppercase tracking-wider">
          {{ $t('knowledge_base.file_size') || '大小' }}
        </div>
        <div class="col-span-2 text-left text-xs font-medium text-law-500 dark:text-law-400 uppercase tracking-wider">
          {{ $t('knowledge_base.created_at') || '创建日期' }}
        </div>
        <div class="col-span-1 text-left text-xs font-medium text-law-500 dark:text-law-400 uppercase tracking-wider">
          {{ $t('knowledge_base.actions') || '操作' }}
        </div>
      </div>
      
      <!-- 表格内容区域 - 可滚动 -->
      <div class="flex-1 overflow-y-auto">
        <div v-if="documents.length === 0" class="py-8 text-center text-law-500 dark:text-law-400">
          {{ $t('knowledge_base.no_documents') || '暂无文档，请上传新文档' }}
        </div>
        
        <div v-else>
          <div 
            v-for="(doc, index) in documents" 
            :key="doc.file_id" 
            class="grid grid-cols-12 gap-4 py-3 px-0 border-b border-law-200 dark:border-law-700 hover:bg-law-50 dark:hover:bg-law-800 transition-colors"
          >
            <div class="col-span-1 text-sm text-law-500 dark:text-law-100 truncate flex items-center">
              {{ totalItems - ((currentPage - 1) * pageSize) - index }}
            </div>
            <div class="col-span-6 text-sm text-law-900 dark:text-law-100 truncate flex items-center" :title="doc.file_name">
              {{ doc.file_name }}
            </div>
            <div class="col-span-1 flex items-center">
              <span 
                class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full truncate"
                :class="{
                  'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': doc.status === 'green',
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': doc.status === 'yellow',
                  'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': doc.status === 'red'
                }"
              >
                {{ 
                  doc.status === 'green' ? ($t('knowledge_base.status_success') || '解析成功') : 
                  doc.status === 'yellow' ? ($t('knowledge_base.status_processing') || '处理中') : 
                  ($t('knowledge_base.status_failed') || '处理中') 
                }}
              </span>
            </div>
            <div class="col-span-1 text-sm text-law-500 dark:text-law-400 truncate flex items-center">
              {{ formatFileSize(doc.bytes) }}
            </div>
            <div class="col-span-2 text-sm text-law-500 dark:text-law-400 truncate flex items-center">
              {{ formatDate(doc.timestamp) }}
            </div>
            <div class="col-span-1 flex items-center space-x-2">
              <button 
                @click="$emit('view-document', doc)" 
                class="text-accent hover:text-accent-dark p-1.5 rounded-full hover:bg-law-100 dark:hover:bg-law-800"
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
                class="text-red-500 hover:text-red-600 p-1.5 rounded-full hover:bg-law-100 dark:hover:bg-law-800"
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
      </div>
    </div>
    
    <!-- 优化的分页控件 -->
    <div class="flex-shrink-0 px-6 py-4 border-t border-law-200 dark:border-law-700 bg-law-50 dark:bg-law-800">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div class="mb-4 sm:mb-0">
          <p class="text-sm text-law-700 dark:text-law-300">
            {{ $t('common.pagination_info', { 
              from: (currentPage - 1) * pageSize + 1, 
              to: Math.min(currentPage * pageSize, totalItems), 
              total: totalItems 
            }) || `显示 ${(currentPage - 1) * pageSize + 1} 至 ${Math.min(currentPage * pageSize, totalItems)} 条，共 ${totalItems} 条` }}
          </p>
        </div>
        
        <div class="flex items-center justify-between sm:justify-end space-x-4">
          <!-- 分页按钮 -->
          <div class="flex items-center space-x-1">
            <button 
              @click="changePage(1)" 
              :disabled="currentPage <= 1"
              class="p-1.5 rounded border border-law-300 dark:border-law-600 bg-white dark:bg-law-700 text-law-500 dark:text-law-400 hover:bg-law-50 dark:hover:bg-law-600 disabled:opacity-50 disabled:cursor-not-allowed"
              :title="$t('common.first') || '首页'"
            >
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M15.707 15.707a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 010 1.414zm-6 0a1 1 0 01-1.414 0l-5-5a1 1 0 010-1.414l5-5a1 1 0 011.414 1.414L5.414 10l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <button 
              @click="changePage(currentPage - 1)" 
              :disabled="currentPage <= 1"
              class="p-1.5 rounded border border-law-300 dark:border-law-600 bg-white dark:bg-law-700 text-law-500 dark:text-law-400 hover:bg-law-50 dark:hover:bg-law-600 disabled:opacity-50 disabled:cursor-not-allowed"
              :title="$t('common.previous') || '上一页'"
            >
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
            
            <!-- 页码数字按钮 -->
            <div class="hidden md:flex">
              <template v-for="page in displayedPages">
                <button 
                  v-if="page !== '...'"
                  :key="page"
                  @click="changePage(page)"
                  class="relative inline-flex items-center px-3 py-1.5 border border-law-300 dark:border-law-600 text-sm font-medium"
                  :class="page === currentPage 
                    ? 'z-10 bg-accent-50 dark:bg-accent-900 border-accent text-accent-600 dark:text-accent-300' 
                    : 'bg-white dark:bg-law-700 text-law-500 dark:text-law-400 hover:bg-law-50 dark:hover:bg-law-600'"
                >
                  {{ page }}
                </button>
                <span 
                  v-else
                  :key="'ellipsis-' + page"
                  class="relative inline-flex items-center px-3 py-1.5 border border-law-300 dark:border-law-600 bg-white dark:bg-law-700 text-sm font-medium text-law-700 dark:text-law-300"
                >
                  ...
                </span>
              </template>
            </div>
            
            <button 
              @click="changePage(currentPage + 1)"
              :disabled="currentPage >= totalPages"
              class="p-1.5 rounded border border-law-300 dark:border-law-600 bg-white dark:bg-law-700 text-law-500 dark:text-law-400 hover:bg-law-50 dark:hover:bg-law-600 disabled:opacity-50 disabled:cursor-not-allowed"
              :title="$t('common.next') || '下一页'"
            >
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
            <button 
              @click="changePage(totalPages)"
              :disabled="currentPage >= totalPages"
              class="p-1.5 rounded border border-law-300 dark:border-law-600 bg-white dark:bg-law-700 text-law-500 dark:text-law-400 hover:bg-law-50 dark:hover:bg-law-600 disabled:opacity-50 disabled:cursor-not-allowed"
              :title="$t('common.last') || '末页'"
            >
              <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                <path fill-rule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
          <!-- 页码输入框 -->
          <div class="flex items-center space-x-2">
            <span class="text-sm text-law-600 dark:text-law-400">{{ $t('common.go_to') || '转到' }}</span>
            <input 
              v-model.number="pageInput" 
              @keyup.enter="jumpToPage" 
              type="number" 
              min="1" 
              :max="totalPages" 
              class="w-16 p-1 border border-law-200 dark:border-law-500 rounded text-center bg-white dark:bg-law-800 text-law-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <span class="text-sm text-law-600 dark:text-law-400">/ {{ totalPages }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n'
// 使用国际化
const { t } = useI18n();

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
  totalPages: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 15
  },
  selectedKb: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['change-page', 'view-document', 'delete-document']);

// 页码输入框
const pageInput = ref(props.currentPage);

// 监听当前页码变化，更新输入框
watch(() => props.currentPage, (newPage) => {
  pageInput.value = newPage;
});

// 跳转到指定页
const jumpToPage = () => {
  if (pageInput.value < 1) {
    pageInput.value = 1;
  } else if (pageInput.value > props.totalPages) {
    pageInput.value = props.totalPages;
  }
  changePage(pageInput.value);
};

// 切换页码
const changePage = (page) => {
  if (page >= 1 && page <= props.totalPages) {
    emit('change-page', page);
  }
};

// 获取要显示的页码按钮
const displayedPages = computed(() => {
  const pages = [];
  
  // 显示当前页码附近的页码
  const siblingCount = 1; // 当前页前后显示几个页码
  const ellipsis = '...'; // 省略号
  
  // 如果总页数小于7，显示所有页码
  if (props.totalPages <= 7) {
    for (let i = 1; i <= props.totalPages; i++) {
      pages.push(i);
    }
  } else {
    // 总页数大于7，需要显示省略号
    
    // 总是添加第一页
    pages.push(1);
    
    // 如果当前页接近第一页，不显示前面的省略号
    if (props.currentPage - siblingCount > 2) {
      pages.push(ellipsis);
    }
    
    // 获取当前页前后的页码
    const start = Math.max(2, props.currentPage - siblingCount);
    const end = Math.min(props.totalPages - 1, props.currentPage + siblingCount);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    // 如果当前页接近最后一页，不显示后面的省略号
    if (props.currentPage + siblingCount < props.totalPages - 1) {
      pages.push(ellipsis);
    }
    
    // 总是添加最后一页
    pages.push(props.totalPages);
  }
  
  return pages;
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

<style scoped>
/* 响应式调整 */
@media (max-width: 1280px) {
  .grid-cols-12 > .col-span-4 {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 180px;
  }
}

@media (max-width: 1024px) {
  .grid-cols-12 > .col-span-4 {
    max-width: 150px;
  }
}
</style> 