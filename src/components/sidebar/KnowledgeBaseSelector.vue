<template>
  <div class="knowledge-base-selector relative kb-dropdown">
    <div class="flex items-center">
      <!-- 下拉按钮 -->
      <button 
        @click.stop="toggleDropdown" 
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
          :class="{ 'transform rotate-180': isDropdownOpen }"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
        <span v-if="selectedKbs.length > 0" class="ml-1 flex items-center justify-center w-5 h-5 text-xs font-semibold text-white bg-accent rounded-full">
          {{ selectedKbs.length }}
        </span>
      </button>
    </div>
    
    <!-- 下拉菜单 -->
    <div 
      v-if="isDropdownOpen" 
      class="absolute right-0 md:left-auto md:right-0 mt-2 w-72 md:w-[28rem] lg:w-[36rem] max-h-[70vh] bg-white dark:bg-law-800 rounded-lg shadow-xl border border-law-200 dark:border-law-700 z-50 flex flex-col overflow-hidden"
      @click.stop
    >
      <div class="p-4 pb-0">
        <div v-if="knowledgeBaseList.length === 0" class="text-center text-law-500 dark:text-law-400 text-sm py-4">
          {{ $t('sidebar.no_knowledge_base') }}
        </div>
        
        <div v-else>
          <div class="flex items-center justify-between mb-3 pb-3 border-b border-law-200 dark:border-law-700">
            <div class="flex items-center">
              <h3 class="text-base font-semibold text-law-800 dark:text-law-100">{{ $t('sidebar.knowledge_base') }}</h3>
              <!-- 设置图标按钮 -->
              <button 
                @click="openKnowledgeBaseManager" 
                class="ml-2 p-1.5 rounded-full bg-law-50 dark:bg-law-700 hover:bg-law-100 dark:hover:bg-law-600 transition-colors duration-200 text-law-800 dark:text-law-100 border border-law-200 dark:border-law-600 shadow-sm"
                :title="$t('knowledge_base.manager_title')"
              >
                <svg class="w-4 h-4 text-accent" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>
            </div>
            
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
        </div>
      </div>

      <!-- 可滚动的内容区域 -->
      <div class="p-4 pt-0 overflow-y-auto kb-content-scroll">
        <div v-if="knowledgeBaseList.length > 0">
          <!-- 分类显示 -->
          <div>
            <div class="flex items-center justify-between mt-3">
              <h4 class="ml-2.5 font-semibold text-law-600 dark:text-law-100 text-sm">{{ $t('knowledge_base.local_knowledge_base') }}</h4>
              <button @click="toggleLocalKb" class="text-xs text-law-500 dark:text-law-400">
                {{ isLocalKbOpen ? $t('common.collapse') : $t('common.expand') }}
              </button>
            </div>
            <div v-show="isLocalKbOpen">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                <div 
                  v-for="kb in localKnowledgeBases" 
                  :key="kb.kb_id"
                  class="flex items-center p-2.5 rounded-lg hover:bg-law-50 dark:hover:bg-law-700 transition-colors duration-200 text-sm text-law-700 dark:text-law-300"
                >
                  <input 
                    type="checkbox" 
                    :id="`local-${kb.kb_id}`" 
                    :value="kb.kb_id" 
                    v-model="selectedKbs"
                    class="w-4 h-4 text-accent bg-white dark:bg-law-700 border-law-300 dark:border-law-600 rounded focus:ring-accent focus:ring-2"
                    @change="updateSelection"
                  />
                  <label 
                    :for="`local-${kb.kb_id}`" 
                    class="ml-2.5 cursor-pointer truncate"
                  >
                    {{ kb.kb_name }}
                  </label>
                </div>
              </div>
            </div>

            <!-- <hr class="my-4 border-law-200 dark:border-law-700" />

            <div class="flex items-center justify-between">
              <h4 class="ml-2.5 font-semibold text-law-600 dark:text-law-100 text-sm">个人文档库</h4>
              <button @click="togglePersonalDocs" class="text-xs text-law-500 dark:text-law-400">
                {{ isPersonalDocsOpen ? '收起' : '展开' }}
              </button>
            </div>
            <div v-show="isPersonalDocsOpen">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                <div 
                  v-for="kb in personalDocuments" 
                  :key="kb.kb_id"
                  class="flex items-center p-2.5 rounded-lg hover:bg-law-50 dark:hover:bg-law-700 transition-colors duration-200 text-sm text-law-700 dark:text-law-300"
                >
                  <input 
                    type="checkbox" 
                    :id="`personal-${kb.kb_id}`" 
                    :value="kb.kb_id" 
                    v-model="selectedKbs"
                    class="w-4 h-4 text-accent bg-white dark:bg-law-700 border-law-300 dark:border-law-600 rounded focus:ring-accent focus:ring-2"
                    @change="updateSelection"
                  />
                  <label 
                    :for="`personal-${kb.kb_id}`" 
                    class="ml-2.5 cursor-pointer truncate"
                  >
                    {{ kb.kb_name }}
                  </label>
                </div>
              </div>
            </div> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useKnowledgeBase } from '@/stores/useKnowledgeBase';
import { storeToRefs } from 'pinia';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n'
import ipsResquest from '@/services/ipsConfig'
import { message } from 'ant-design-vue'
// 使用国际化
const { t } = useI18n();

// 获取路由器
const router = useRouter();

// 获取知识库数据
const knowledgeBaseStore = useKnowledgeBase();
const { getList } = knowledgeBaseStore;
const { knowledgeBaseList, selectList, hasLoadedData } = storeToRefs(knowledgeBaseStore);

// 本地状态
const isDropdownOpen = ref(false);
const isLocalKbOpen = ref(true);
const isPersonalDocsOpen = ref(true);
const selectedKbs = ref([]);
const localKnowledgeBases = ref([]);
const personalDocuments = ref([]);

// 初始化
onMounted(() => {
  // 只有当知识库列表为空或者未加载过数据时才获取列表
  if (!hasLoadedData.value || knowledgeBaseList.value.length === 0) {
    // getList();
  }
  
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

// 在获取知识库列表时，进行分类
watch(knowledgeBaseList, () => {
  localKnowledgeBases.value = [];
  personalDocuments.value = [];
  
  knowledgeBaseList.value.forEach(kb => {
    // 这里可以根据实际情况添加分类逻辑
    // 例如：if (kb.type === 'local') { ... } else if (kb.type === 'personal') { ... }
    localKnowledgeBases.value.push(kb);
    personalDocuments.value.push(kb);
  });
}, { immediate: true, deep: true });

// 切换下拉菜单
const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

// 切换本地知识库展开/折叠
const toggleLocalKb = () => {
  isLocalKbOpen.value = !isLocalKbOpen.value;
};

// 切换个人文档库展开/折叠
const togglePersonalDocs = () => {
  isPersonalDocsOpen.value = !isPersonalDocsOpen.value;
};

// 更新选中的知识库
const updateSelection = async (e) => {
  // 更新Store中的数据
  knowledgeBaseStore.setSelectList([...selectedKbs.value]);
  
  // 保存到localStorage，确保刷新后能保持选择状态
  try {
    localStorage.setItem('selectList', JSON.stringify(selectedKbs.value));
    
    // 如果有事件对象，说明是通过checkbox触发的
    if (e && e.target) {
      const kbId = e.target.value;
      const checked = e.target.checked;
      
      // 调用ipsKbCheck接口保存状态
      try {
        const res = await ipsResquest.ipsKbCheck({ 
          kb_id: kbId, 
          ucheck: checked ? 1 : 0 
        });
        
        if (!res.success) {
          message.error('保存知识库状态失败');
          console.error('保存知识库状态失败:', res);
        }
      } catch (error) {
        message.error('保存知识库状态失败');
        console.error('调用ipsKbCheck接口失败:', error);
      }
    }
  } catch (error) {
    console.error('保存知识库选择列表到本地存储失败:', error);
  }
};

// 全选知识库
const selectAllKbs = async () => {
  selectedKbs.value = knowledgeBaseList.value.map(kb => kb.kb_id);
  
  // 更新Store中的数据
  knowledgeBaseStore.setSelectList([...selectedKbs.value]);
  
  // 保存到localStorage
  try {
    localStorage.setItem('selectList', JSON.stringify(selectedKbs.value));
    
    // 对所有知识库调用ipsKbCheck接口
    for (const kbId of selectedKbs.value) {
      try {
        await ipsResquest.ipsKbCheck({ kb_id: kbId, ucheck: 1 });
      } catch (error) {
        console.error(`知识库${kbId}状态保存失败:`, error);
      }
    }
  } catch (error) {
    console.error('保存知识库选择列表到本地存储失败:', error);
  }
};

// 清空选择
const clearSelection = async () => {
  // 记录之前选中的知识库ID
  const previousSelected = [...selectedKbs.value];
  
  // 清空选择
  selectedKbs.value = [];
  
  // 更新Store中的数据
  knowledgeBaseStore.setSelectList([]);
  
  // 保存到localStorage
  try {
    localStorage.setItem('selectList', JSON.stringify([]));
    
    // 对之前选中的所有知识库调用ipsKbCheck接口取消选择
    for (const kbId of previousSelected) {
      try {
        await ipsResquest.ipsKbCheck({ kb_id: kbId, ucheck: 0 });
      } catch (error) {
        console.error(`知识库${kbId}状态保存失败:`, error);
      }
    }
  } catch (error) {
    console.error('保存知识库选择列表到本地存储失败:', error);
  }
};

// 打开知识库管理界面
const openKnowledgeBaseManager = () => {
  // 关闭下拉菜单
  isDropdownOpen.value = false;
  // 导航到知识库管理页面
  router.push('/knowledge-base-manager');
};

// 点击外部关闭下拉列表
const handleClickOutside = (event) => {
  const dropdown = document.querySelector('.kb-dropdown');
  if (dropdown && !dropdown.contains(event.target) && isDropdownOpen.value) {
    isDropdownOpen.value = false;
  }
};

// 添加和移除事件监听器
onMounted(() => {
  window.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside);
});
</script>

<style scoped>
.knowledge-base-selector {
  position: relative;
}

/* 滚动条样式 */
.kb-content-scroll::-webkit-scrollbar {
  width: 6px;
}

.kb-content-scroll::-webkit-scrollbar-track {
  background: rgba(156, 163, 175, 0.1);
}

.kb-content-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 10px;
}

.kb-content-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(156, 163, 175, 0.5);
}

/* 暗色模式滚动条 */
.dark .kb-content-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(75, 85, 99, 0.3);
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