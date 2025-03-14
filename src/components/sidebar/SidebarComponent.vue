<template>
  <div class="flex flex-col h-full">
    <!-- 侧边栏头部 -->
    <!-- <div class="p-4 border-b border-law-200 dark:border-law-700 bg-primary-light dark:bg-primary text-white">
      <div class="flex items-center mb-2">
        <span class="text-2xl mr-2">⚖️</span>
        <h2 class="text-xl font-bold">{{ $t('app.title') }}</h2>
      </div>
      <p class="text-sm text-law-100 opacity-80">{{ $t('app.subtitle') }}</p>
    </div> -->
    
    <!-- 新建聊天按钮和搜索 -->
    <div class="p-3 flex items-center space-x-2">
      <!-- 新建聊天按钮 -->
      <button 
        v-if="!isSearchActive"
        @click="createNewChat"
        class="flex-1 flex items-center justify-center space-x-2 p-2 bg-accent text-white rounded-md hover:bg-accent-light transition-all duration-200 shadow-law hover:shadow-md hover:translate-y-[-1px]"
      >
        <span class="text-lg">✨</span>
        <span class="font-medium">{{ $t('chat.new_chat') }}</span>
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
          v-model="searchQuery"
          type="text"
          :placeholder="$t('sidebar.search')"
          class="w-full pl-10 pr-4 py-2 bg-law-100 dark:bg-law-700 text-law-900 dark:text-law-100 rounded-md focus:outline-none focus:ring-2 focus:ring-accent border border-law-200 dark:border-law-600"
          @blur="onSearchBlur"
          ref="searchInput"
        />
        <span class="absolute left-3 top-2.5 text-lg">🔍</span>
      </div>
    </div>
    
    <!-- 聊天历史列表 -->
    <div class="flex-1 overflow-y-auto p-2">
      <!-- 今天 -->
      <div v-if="filteredChats.today.length > 0" class="mb-4">
        <h3 class="px-2 py-1 text-xs font-semibold text-primary dark:text-accent uppercase tracking-wider">
          {{ $t('sidebar.today') }}
        </h3>
        <chat-item 
          v-for="chat in filteredChats.today" 
          :key="chat.id"
          :chat="chat"
          :is-active="currentChatId === chat.id"
          @click="selectChat(chat.id)"
          @toggle-pin="togglePinChat(chat.id)"
          @delete="deleteChat(chat.id)"
        />
      </div>
      
      <!-- 最近7天 -->
      <div v-if="filteredChats.last7Days.length > 0" class="mb-4">
        <h3 class="px-2 py-1 text-xs font-semibold text-primary dark:text-accent uppercase tracking-wider">
          {{ $t('sidebar.last_7_days') }}
        </h3>
        <chat-item 
          v-for="chat in filteredChats.last7Days" 
          :key="chat.id"
          :chat="chat"
          :is-active="currentChatId === chat.id"
          @click="selectChat(chat.id)"
          @toggle-pin="togglePinChat(chat.id)"
          @delete="deleteChat(chat.id)"
        />
      </div>
      
      <!-- 最近30天 -->
      <div v-if="filteredChats.last30Days.length > 0" class="mb-4">
        <h3 class="px-2 py-1 text-xs font-semibold text-primary dark:text-accent uppercase tracking-wider">
          {{ $t('sidebar.last_30_days') }}
        </h3>
        <chat-item 
          v-for="chat in filteredChats.last30Days" 
          :key="chat.id"
          :chat="chat"
          :is-active="currentChatId === chat.id"
          @click="selectChat(chat.id)"
          @toggle-pin="togglePinChat(chat.id)"
          @delete="deleteChat(chat.id)"
        />
      </div>
    </div>
    
    <!-- 底部版权信息 -->
    <div class="p-3 text-xs text-center text-law-500 dark:text-law-400 border-t border-law-200 dark:border-law-700">
      © 2025 法律AI助手 | 专业法律咨询
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useChatStore } from '../../stores/chat'
import ChatItem from './ChatItem.vue'

const router = useRouter()
const chatStore = useChatStore()
const searchQuery = ref('')
const currentChatId = ref('')
const isSearchActive = ref(false)
const searchInput = ref(null)

// 获取聊天历史
onMounted(async () => {
  await chatStore.fetchChatHistory()
  
  // 如果当前路由是聊天页面，设置当前聊天ID
  const route = router.currentRoute.value
  if (route.name === 'Chat' && route.params.id) {
    currentChatId.value = route.params.id
  }
})

// 过滤聊天历史
const filteredChats = computed(() => {
  const query = searchQuery.value.toLowerCase()
  
  // 如果没有搜索查询，直接返回分组的聊天
  if (!query) {
    return chatStore.groupedChats
  }
  
  // 过滤聊天历史
  const filterByQuery = (chats) => {
    return chats.filter(chat => 
      chat.title.toLowerCase().includes(query) || 
      chat.messages.some(msg => msg.content.toLowerCase().includes(query))
    )
  }
  
  return {
    today: filterByQuery(chatStore.groupedChats.today),
    last7Days: filterByQuery(chatStore.groupedChats.last7Days),
    last30Days: filterByQuery(chatStore.groupedChats.last30Days),
    older: filterByQuery(chatStore.groupedChats.older)
  }
})

// 选择聊天
const selectChat = (chatId) => {
  currentChatId.value = chatId
  router.push(`/chat/${chatId}`)
}

// 创建新聊天
const createNewChat = async () => {
  const newChatId = await chatStore.createChat()
  if (newChatId) {
    selectChat(newChatId)
  }
}

// 固定/取消固定聊天
const togglePinChat = (chatId) => {
  chatStore.togglePinChat(chatId)
}

// 删除聊天
const deleteChat = (chatId) => {
  chatStore.deleteChat(chatId)
  // 如果删除的是当前活动的聊天，则切换到第一个聊天
  if (chatId === currentChatId.value && chatStore.chatHistory.length > 0) {
    selectChat(chatStore.chatHistory[0].id)
  }
}

// 切换搜索状态
const toggleSearch = () => {
  isSearchActive.value = !isSearchActive.value
  if (isSearchActive.value) {
    nextTick(() => {
      searchInput.value.focus()
    })
  }
}

// 处理搜索框失去焦点
const onSearchBlur = () => {
  // 如果搜索框为空，则隐藏搜索框
  if (!searchQuery.value.trim()) {
    isSearchActive.value = false;
  }
}
</script>

<style scoped>
/* 添加动画 */
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