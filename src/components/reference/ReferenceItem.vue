<template>
  <div 
    class="bg-white dark:bg-law-800 rounded-lg shadow-law p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:translate-y-[-2px] border"
    :class="[
      isActive 
        ? 'border-accent dark:border-accent' 
        : 'border-law-200 dark:border-law-700',
      isActive 
        ? 'bg-accent bg-opacity-5 dark:bg-accent dark:bg-opacity-10' 
        : 'bg-white dark:bg-law-800'
    ]"
    @click="$emit('click')"
  >
    <!-- 引用类型图标 -->
    <div class="flex items-center mb-2">
      <!-- 法规图标 -->
      <span v-if="reference.refType === 'law'" class="text-xl mr-2 text-primary dark:text-accent">📜</span>
      
      <!-- 判例图标 -->
      <span v-else-if="reference.refType === 'case'" class="text-xl mr-2 text-primary dark:text-accent">⚖️</span>
      
      <h4 class="text-sm font-medium text-primary dark:text-accent truncate">
        {{ reference.title }}
      </h4>
    </div>
    
    <!-- 引用内容预览 -->
    <p class="text-xs text-law-600 dark:text-law-300 mb-2 flex items-center">
      <span class="text-xs mr-1">📌</span>
      {{ reference.section }}
    </p>
    
    <div class="bg-law-50 dark:bg-law-900 p-3 rounded-md border border-law-200 dark:border-law-700">
      <p class="text-xs text-law-600 dark:text-law-300 line-clamp-2">
        {{ getContentPreview(reference.content) }}
      </p>
    </div>
    
    <div class="mt-2 flex justify-end">
      <span class="text-xs text-accent hover:underline flex items-center">
        <span>{{ isActive ? '收起详情' : '查看详情' }}</span>
        <svg 
          class="w-3 h-3 ml-1 transition-transform duration-200" 
          :class="{ 'rotate-180': isActive }"
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2" 
          stroke-linecap="round" 
          stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  reference: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click'])

// 获取内容预览
const getContentPreview = (content) => {
  if (!content) return ''
  return content.length > 150 ? content.substring(0, 150) + '...' : content
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>
