<template>
  <div 
    class="flex items-center p-2 rounded-md cursor-pointer transition-all duration-200 mb-1 border border-transparent"
    :class="isActive ? 'bg-primary bg-opacity-10 border-primary border-opacity-20' : 'hover:bg-law-100 dark:hover:bg-law-700 hover:border-law-200 dark:hover:border-law-600'"
    @click="$emit('click')"
  >
    <!-- 聊天图标 -->
    <div class="flex-shrink-0 mr-3">
      <span class="text-lg text-accent">💬</span>
    </div>
    
    <!-- 聊天标题和时间 -->
    <div class="flex-1 min-w-0">
      <h4 class="text-sm font-medium text-primary dark:text-accent truncate">
        {{ chat.title }}
      </h4>
      <p class="text-xs text-law-500 dark:text-law-400">
        {{ formatDate(chat.timestamp) }}
      </p>
    </div>
    
    <!-- 固定按钮 -->
    <button 
      v-if="chat.pinned || isHovered"
      class="ml-2 p-1 rounded-full hover:bg-law-200 dark:hover:bg-law-600 transition-colors duration-200"
      @click.stop="$emit('toggle-pin')"
    >
      <span 
        class="text-sm"
        :class="chat.pinned ? 'text-accent' : 'text-law-400 dark:text-law-500'"
      >
        📌
      </span>
    </button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue'
import { useChatStore } from '../../stores/chat'

const props = defineProps({
  chat: {
    type: Object,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  }
})

defineEmits(['click', 'toggle-pin'])

const chatStore = useChatStore()
const isHovered = ref(false)

// 格式化日期
const formatDate = (timestamp) => {
  return chatStore.formatTime(timestamp)
}
</script>

<style scoped>
.flex:hover .ml-2 {
  display: block;
}
</style>
