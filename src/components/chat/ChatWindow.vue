<template>
  <div class="flex flex-col h-full">
    <!-- 聊天消息区域 -->
    <div class="flex-1 overflow-y-auto p-4 bg-law-100 dark:bg-law-800" ref="messagesContainer">
      <div v-if="!chatStore.currentChat || chatStore.currentChat.messages.length === 0" class="flex flex-col justify-center items-center h-full text-center">
        <div class="w-24 h-24 rounded-full bg-accent bg-opacity-20 flex items-center justify-center mb-6">
          <span class="text-5xl">⚖️</span>
        </div>
        <h3 class="text-2xl font-semibold text-primary dark:text-accent mb-4">{{ $t('chat.start_new') }}</h3>
        <p class="text-law-600 dark:text-law-300 max-w-md leading-relaxed">{{ $t('chat.start_description') }}</p>
        
        <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          <div class="bg-white dark:bg-law-700 p-4 rounded-lg shadow-law hover:shadow-md transition-all duration-200 hover:translate-y-[-2px] cursor-pointer">
            <div class="flex items-center mb-2">
              <span class="text-2xl mr-2">📜</span>
              <h4 class="font-medium text-primary dark:text-accent">法律咨询</h4>
            </div>
            <p class="text-sm text-law-600 dark:text-law-300">询问法律问题，获取专业解答</p>
          </div>
          
          <div class="bg-white dark:bg-law-700 p-4 rounded-lg shadow-law hover:shadow-md transition-all duration-200 hover:translate-y-[-2px] cursor-pointer">
            <div class="flex items-center mb-2">
              <span class="text-2xl mr-2">📋</span>
              <h4 class="font-medium text-primary dark:text-accent">文档分析</h4>
            </div>
            <p class="text-sm text-law-600 dark:text-law-300">上传法律文件，获取专业解读</p>
          </div>
        </div>
      </div>
      
      <template v-else>
        <message-item 
          v-for="message in chatStore.currentChat.messages" 
          :key="message.id"
          :message="message"
          @reference-click="handleReferenceClick"
        />
      </template>
    </div>
    
    <!-- 输入区域 -->
    <div class="border-t border-law-200 dark:border-law-700 p-4 bg-white dark:bg-law-800">
      <div class="relative">
        <textarea 
          v-model="messageInput"
          :placeholder="$t('chat.placeholder')"
          class="w-full pl-4 pr-12 py-3 bg-white dark:bg-law-800 border border-law-300 dark:border-law-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-law-800 dark:text-law-100 resize-none shadow-sm min-h-[60px] max-h-[120px]"
          rows="2"
          @keydown.enter.prevent="sendMessage"
        ></textarea>
        
        <button 
          @click="sendMessage"
          :disabled="!messageInput.trim() || chatStore.isLoading"
          class="absolute right-3 bottom-3 p-2 rounded-full bg-accent hover:bg-accent-light dark:bg-accent-dark dark:hover:bg-accent text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-sm"
        >
          <svg v-if="!chatStore.isLoading" class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
          <svg v-else class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </button>
      </div>
      
      <div class="mt-2 flex justify-between items-center text-xs text-law-500 dark:text-law-400 px-1">
        <div>
          <span>按 Enter 发送消息</span>
        </div>
        <div>
          <span>法律AI助手提供的信息仅供参考，不构成法律建议</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onMounted, defineProps, inject } from 'vue'
import { useChatStore } from '../../stores/chat'
import { useReferenceStore } from '../../stores/reference'
import MessageItem from './MessageItem.vue'

const props = defineProps({
  chatId: {
    type: String,
    required: true
  }
})

const chatStore = useChatStore()
const referenceStore = useReferenceStore()
const messageInput = ref('')
const messagesContainer = ref(null)
const appLayout = inject('appLayout')

// 获取聊天数据
onMounted(async () => {
  await chatStore.fetchChat(props.chatId)
  scrollToBottom()
})

// 监听聊天ID变化
watch(() => props.chatId, async (newChatId) => {
  if (newChatId) {
    await chatStore.fetchChat(newChatId)
    scrollToBottom()
  }
})

// 监听消息变化，自动滚动到底部
watch(() => chatStore.currentChat?.messages.length, () => {
  scrollToBottom()
})

// 发送消息
const sendMessage = async () => {
  if (!messageInput.value.trim() || chatStore.isLoading) return
  
  const message = messageInput.value
  messageInput.value = ''
  
  await chatStore.sendMessage(message)
}

// 处理引用点击
const handleReferenceClick = (references) => {
  if (references && references.length > 0) {
    referenceStore.fetchReferences(references)
    // 引用面板的显示现在由 referenceStore.showReferencePanel 控制
    // 如果在小屏幕上，可能还需要调用 appLayout.toggleReference()
    if (window.innerWidth < 1024 && appLayout) {
      appLayout.toggleReference()
    }
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}
</script>
