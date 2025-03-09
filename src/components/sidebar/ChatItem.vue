<template>
  <div 
    class="flex items-center p-2 rounded-md cursor-pointer transition-all duration-200 mb-1 border border-transparent"
    :class="isActive ? 'bg-primary bg-opacity-10 border-primary border-opacity-20' : 'hover:bg-law-100 dark:hover:bg-law-700 hover:border-law-200 dark:hover:border-law-600'"
    @click="$emit('click')"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
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

    <!-- 删除按钮 -->
    <button v-if="isHovered" 
      class="ml-2 p-1 rounded-full hover:bg-law-200 dark:hover:bg-law-600 transition-colors duration-200"
      @click.stop="showDeleteConfirm = true"
    >
      <span 
        class="text-sm"
        :class="'text-law-400 dark:text-law-500'"
      >
        🗑️
      </span>
    </button>
    
    <!-- 删除确认弹框 -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" @click.self="showDeleteConfirm = false">
      <div class="bg-white dark:bg-law-800 rounded-lg p-6 max-w-sm w-full shadow-xl">
        <h3 class="text-lg font-medium text-primary dark:text-accent mb-4">确认删除</h3>
        <p class="text-law-600 dark:text-law-300 mb-6">确定要删除这个聊天吗？此操作无法撤销。</p>
        <div class="flex justify-end space-x-3">
          <button 
            class="px-4 py-2 rounded-md bg-law-200 dark:bg-law-700 text-law-700 dark:text-law-300 hover:bg-law-300 dark:hover:bg-law-600 transition-colors duration-200"
            @click="showDeleteConfirm = false"
          >
            取消
          </button>
          <button 
            class="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors duration-200"
            @click="confirmDelete"
          >
            删除
          </button>
        </div>
      </div>
    </div>
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

const emit = defineEmits(['click', 'toggle-pin', 'delete'])

const chatStore = useChatStore()
const isHovered = ref(false)
const showDeleteConfirm = ref(false)

// 格式化日期
const formatDate = (timestamp) => {
  return chatStore.formatTime(timestamp, props.chat.id)
}

// 删除聊天确认
const confirmDelete = async () => {
  try {
    // 调用 store 中的删除方法
    await chatStore.deleteChat(props.chat.id)
    
    // 关闭确认弹框
    showDeleteConfirm.value = false
    
    // 通知父组件聊天已被删除
    emit('delete', props.chat.id)
  } catch (error) {
    console.error('删除聊天失败:', error)
  }
}
</script>

<style scoped>
.flex:hover .ml-2 {
  display: block;
}
</style>
