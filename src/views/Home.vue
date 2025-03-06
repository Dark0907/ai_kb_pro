<template>
  <div class="flex flex-col h-full">
    <div class="flex flex-col items-center justify-center h-full p-4 text-center">
      <div class="max-w-2xl">
        <h1 class="text-3xl md:text-4xl font-bold text-legal-dark dark:text-white mb-4">
          {{ $t('app.title') }}
        </h1>
        <p class="text-lg text-gray-600 dark:text-gray-400 mb-8">
          {{ $t('app.subtitle') }}
        </p>
        
        <button 
          @click="createNewChat"
          class="btn btn-primary px-6 py-3 text-lg flex items-center justify-center mx-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          {{ $t('chat.new_chat') }}
        </button>
        
        <!-- 最近对话 -->
        <div v-if="recentChats.length > 0" class="mt-12">
          <h2 class="text-xl font-semibold text-legal-dark dark:text-white mb-4">
            {{ $t('sidebar.recent') }}
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div 
              v-for="chat in recentChats" 
              :key="chat.id"
              class="card cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750"
              @click="goToChat(chat.id)"
            >
              <h3 class="font-medium text-legal-dark dark:text-white mb-2">{{ chat.title }}</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                {{ getLastMessage(chat) }}
              </p>
              <div class="mt-3 text-xs text-gray-400 dark:text-gray-500">
                {{ formatDate(chat.timestamp) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '../stores/chat'

const router = useRouter()
const chatStore = useChatStore()

// 获取最近的3个对话
const recentChats = computed(() => {
  const allChats = [
    ...chatStore.groupedChats.today,
    ...chatStore.groupedChats.last7Days
  ]
  
  return allChats.slice(0, 3)
})

// 创建新对话
const createNewChat = async () => {
  const newChatId = await chatStore.createChat()
  if (newChatId) {
    router.push(`/chat/${newChatId}`)
  }
}

// 跳转到对话
const goToChat = (chatId) => {
  router.push(`/chat/${chatId}`)
}

// 获取最后一条消息
const getLastMessage = (chat) => {
  if (!chat.messages || chat.messages.length === 0) {
    return ''
  }
  
  const lastMessage = chat.messages[chat.messages.length - 1]
  return lastMessage.content
}

// 格式化日期
const formatDate = (timestamp) => {
  const date = new Date(timestamp)
  return date.toLocaleDateString()
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
