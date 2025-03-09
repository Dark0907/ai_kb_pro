<template>
  <div class="flex flex-col h-full">
    <!-- 引用面板头部 -->
    <div class="p-4 border-b border-law-200 dark:bg-law-800 dark:border-law-700 bg-white-light  dark:text-accent text-primary flex justify-between items-center">
      <div class="flex items-center">
        <span class="text-xl mr-2">📜</span>
        <h2 class="text-xl font-bold">{{ $t('reference.title') }}</h2>
        <span v-if="referenceStore.references.length > 0" class="ml-2 px-2 py-0.5 bg-accent bg-opacity-30 rounded-full text-xs text-white font-semibold">
          {{ referenceStore.references.length }}
        </span>
      </div>
      <button 
        @click="closeReferencePanel"
        class="p-1 rounded-full hover:bg-law-200 dark:hover:bg-law-700 transition-colors duration-200"
      >
        <svg class="w-5 h-5 text-primary dark:text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    
    <!-- 引用内容 -->
    <div class="flex-1 overflow-y-auto p-4 bg-law-50 dark:bg-law-800">
      <!-- 加载中状态 -->
      <div v-if="referenceStore.isLoading" class="flex justify-center items-center h-full">
        <div class="relative w-16 h-16">
          <div class="absolute inset-0 border-4 border-accent border-opacity-20 rounded-full"></div>
          <div class="absolute inset-0 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
      
      <!-- 无引用状态 -->
      <div v-else-if="referenceStore.references.length === 0" class="flex flex-col justify-center items-center h-full text-center">
        <div class="w-20 h-20 rounded-full bg-accent bg-opacity-20 flex items-center justify-center mb-4">
          <span class="text-4xl">📜</span>
        </div>
        <p class="text-law-600 dark:text-law-300">{{ $t('reference.no_references') }}</p>
      </div>
      
      <!-- 引用列表 -->
      <div v-else>
        <!-- 法规引用 -->
        <div v-if="lawReferences.length > 0" class="mb-6">
          <h3 class="text-lg font-semibold text-primary dark:text-accent mb-3 flex items-center">
            <span class="text-xl mr-2">📜</span>
            {{ $t('reference.laws') }}
            <span class="ml-2 px-2 py-0.5 bg-accent bg-opacity-20 rounded-full text-xs text-accent-dark font-semibold">
              {{ lawReferences.length }}
            </span>
          </h3>
          <div class="space-y-3">
            <reference-item 
              v-for="reference in lawReferences" 
              :key="reference.id"
              :reference="reference"
              :is-active="referenceStore.activeReference && referenceStore.activeReference.id === reference.id"
              @click="setActiveReference(reference)"
            />
          </div>
        </div>
        
        <!-- 判例引用 -->
        <div v-if="caseReferences.length > 0" class="mb-6">
          <h3 class="text-lg font-semibold text-primary dark:text-accent mb-3 flex items-center">
            <span class="text-xl mr-2">⚖️</span>
            {{ $t('reference.cases') }}
            <span class="ml-2 px-2 py-0.5 bg-accent bg-opacity-20 rounded-full text-xs text-accent-dark font-semibold">
              {{ caseReferences.length }}
            </span>
          </h3>
          <div class="space-y-3">
            <reference-item 
              v-for="reference in caseReferences" 
              :key="reference.id"
              :reference="reference"
              :is-active="referenceStore.activeReference && referenceStore.activeReference.id === reference.id"
              @click="setActiveReference(reference)"
            />
          </div>
        </div>
      </div>
    </div>
    
    <!-- 引用详情模态框 -->
    <reference-modal
      v-if="showModal"
      :isVisible="showModal" 
      :referenceId="activeReferenceId"
      :referenceTitle="activeReferenceTitle"
      @close="closeActiveReference"
    />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useReferenceStore } from '../../stores/reference'
import ReferenceItem from './ReferenceItem.vue'
import ReferenceModal from './ReferenceModal.vue'

const referenceStore = useReferenceStore()
const showModal = ref(false)
const activeReferenceId = ref('')
const activeReferenceTitle = ref('')

// 法规引用
const lawReferences = computed(() => {
  return referenceStore.references.filter(ref => ref.refType === 'law')
})

// 判例引用
const caseReferences = computed(() => {
  return referenceStore.references.filter(ref => ref.refType === 'case')
})

// 设置活动引用
const setActiveReference = (reference) => {
  // 如果点击的是当前活动引用，则隐藏模态框
  if (showModal.value && activeReferenceId.value === reference.id) {
    closeActiveReference()
  } else {
    // 否则设置为新的活动引用
    activeReferenceId.value = reference.id
    activeReferenceTitle.value = reference.title
    showModal.value = true
    referenceStore.setActiveReference(reference)
  }
}

// 关闭活动引用
const closeActiveReference = () => {
  showModal.value = false
  referenceStore.setActiveReference(null)
}

// 关闭引用面板
const closeReferencePanel = () => {
  // 关闭模态框
  closeActiveReference()
  // 发送事件给父组件
  referenceStore.setShowReferencePanel(false)
}
</script>

<style scoped>
/* 添加动效 */
.flex-col {
  transition: all 0.3s ease-in-out;
}

.shadow-inner {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.06);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-slide-in-up {
  animation: slideInUp 0.3s ease-out;
}
</style>
