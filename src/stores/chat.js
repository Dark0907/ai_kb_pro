import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
// import chats from '../assets/mock/chats.json' // 注释掉模拟数据的导入

export const useChatStore = defineStore('chat', () => {
  // 状态
  const chatHistory = ref([])
  const currentChat = ref(null)
  const isLoading = ref(false)

  // 从本地存储获取聊天历史
  const getLocalChatHistory = () => {
    const storedData = localStorage.getItem('chatHistory')
    if (storedData) {
      try {
        return JSON.parse(storedData)
      } catch (error) {
        console.error('解析本地存储的聊天历史失败:', error)
        return []
      }
    }
    return []
  }

  // 保存聊天历史到本地存储
  const saveChatHistoryToLocal = (data) => {
    if (data) {
      try {
        localStorage.setItem('chatHistory', JSON.stringify(data))
      } catch (error) {
        console.error('保存聊天历史到本地存储失败:', error)
      }
    }
  }

  // 从本地存储获取当前聊天
  const getLocalCurrentChat = (chatId) => {
    if (!chatId) return null
    
    const storedData = localStorage.getItem(`chat_${chatId}`)
    if (storedData) {
      try {
        return JSON.parse(storedData)
      } catch (error) {
        console.error('解析本地存储的当前聊天失败:', error)
        return null
      }
    }
    return null
  }

  // 保存当前聊天到本地存储
  const saveCurrentChatToLocal = (data) => {
    if (data && data.id) {
      try {
        localStorage.setItem(`chat_${data.id}`, JSON.stringify(data))
        
        // 同时更新聊天历史中的对应聊天
        const chatIndex = chatHistory.value.findIndex(chat => chat.id === data.id)
        if (chatIndex !== -1) {
          // 使用深拷贝确保数据完整性
          chatHistory.value[chatIndex] = JSON.parse(JSON.stringify(data))
        } else {
          // 如果在历史中找不到，则添加到历史
          chatHistory.value.unshift(JSON.parse(JSON.stringify(data)))
        }
        
        // 保存聊天历史到本地存储
        saveChatHistoryToLocal(chatHistory.value)
      } catch (error) {
        console.error('保存当前聊天到本地存储失败:', error)
      }
    }
  }

  // 获取聊天历史
  const fetchChatHistory = async () => {
    try {
      // 从本地存储获取聊天历史
      const localChatHistory = getLocalChatHistory()
      if (localChatHistory && localChatHistory.length > 0) {
        chatHistory.value = localChatHistory
      } else {
        // 如果本地没有数据，则初始化为空数组
        chatHistory.value = []
        // 保存到本地存储
        saveChatHistoryToLocal([])
      }
    } catch (error) {
      console.error('获取聊天历史失败:', error)
    }
  }

  // 获取单个聊天
  const fetchChat = async (chatId) => {
    try {
      isLoading.value = true
      // 从本地存储获取当前聊天
      const localCurrentChat = getLocalCurrentChat(chatId)
      if (localCurrentChat) {
        currentChat.value = localCurrentChat
      } else {
        // 如果本地没有数据，则从聊天历史中查找
        const chatFromHistory = chatHistory.value.find(chat => chat.id === chatId) || null
        if (chatFromHistory) {
          currentChat.value = chatFromHistory
          // 保存到本地存储
          saveCurrentChatToLocal(chatFromHistory)
        } else {
          // 如果聊天历史中也没有，则创建一个新的聊天
          const newChat = {
            id: chatId,
            title: '新对话',
            timestamp: new Date().toISOString(),
            pinned: false,
            messages: []
          }
          currentChat.value = newChat
          // 添加到聊天历史
          chatHistory.value.unshift(newChat)
          // 保存聊天历史到本地存储
          saveChatHistoryToLocal(chatHistory.value)
          // 保存新聊天到本地存储
          saveCurrentChatToLocal(newChat)
        }
      }
    } catch (error) {
      console.error('获取聊天失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 更新聊天标题
  const updateChatTitle = (chatId, lastUserMessage) => {
    const chatIndex = chatHistory.value.findIndex(chat => chat.id === chatId)
    if (chatIndex !== -1) {
      // 更新标题为最后一条用户消息的内容（截取前20个字符）
      const title = lastUserMessage.length > 20 ? lastUserMessage.substring(0, 20) + '...' : lastUserMessage
      chatHistory.value[chatIndex].title = title
      
      // 更新时间戳
      chatHistory.value[chatIndex].timestamp = new Date().toISOString()
      
      // 保存聊天历史到本地存储
      saveChatHistoryToLocal(chatHistory.value)
      
      // 如果是当前聊天，也更新当前聊天
      if (currentChat.value && currentChat.value.id === chatId) {
        currentChat.value.title = title
        currentChat.value.timestamp = new Date().toISOString()
        
        // 保存当前聊天到本地存储
        saveCurrentChatToLocal(currentChat.value)
      }
    }
  }

  // 发送消息
  const sendMessage = async (message) => {
    try {
      isLoading.value = true
      
      // 检查 currentChat.value 是否存在
      if (!currentChat.value) {
        // 如果不存在，则创建一个新的聊天
        const newChatId = await createChat()
        await fetchChat(newChatId)
      }
      
      // 添加用户消息
      currentChat.value.messages.push({
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      })

      // 更新聊天标题为用户消息内容
      updateChatTitle(currentChat.value.id, message)

      // 保存当前聊天到本地存储
      saveCurrentChatToLocal(currentChat.value)

      // 模拟AI响应
      setTimeout(() => {
        currentChat.value.messages.push({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '这是一个模拟的AI回复。在实际应用中，这里将是来自后端API的响应。',
          timestamp: new Date().toISOString()
        })
        
        // 保存当前聊天到本地存储
        saveCurrentChatToLocal(currentChat.value)
        
        isLoading.value = false
      }, 1000)
    } catch (error) {
      console.error('发送消息失败:', error)
      isLoading.value = false
    }
  }

  // 创建新聊天
  const createChat = async () => {
    try {
      // 生成唯一ID
      const newId = Date.now().toString()
      
      const newChat = {
        id: newId,
        title: '新对话',
        timestamp: new Date().toISOString(),
        pinned: false,
        messages: []
      }
      
      // 添加到聊天历史
      chatHistory.value.unshift(newChat)
      
      // 保存聊天历史到本地存储
      saveChatHistoryToLocal(chatHistory.value)
      
      // 保存新聊天到本地存储
      saveCurrentChatToLocal(newChat)
      
      return newId
    } catch (error) {
      console.error('创建聊天失败:', error)
      return null
    }
  }

  // 切换置顶状态
  const togglePinChat = async (chatId) => {
    try {
      const chatIndex = chatHistory.value.findIndex(chat => chat.id === chatId)
      if (chatIndex !== -1) {
        chatHistory.value[chatIndex].pinned = !chatHistory.value[chatIndex].pinned
        
        // 重新排序聊天历史（置顶的排在前面）
        chatHistory.value.sort((a, b) => {
          if (a.pinned === b.pinned) {
            return new Date(b.timestamp) - new Date(a.timestamp)
          }
          return a.pinned ? -1 : 1
        })
        
        // 保存聊天历史到本地存储
        saveChatHistoryToLocal(chatHistory.value)
        
        // 如果当前聊天被置顶/取消置顶，也更新当前聊天
        if (currentChat.value && currentChat.value.id === chatId) {
          currentChat.value.pinned = chatHistory.value[chatIndex].pinned
          
          // 保存当前聊天到本地存储
          saveCurrentChatToLocal(currentChat.value)
        }
      }
    } catch (error) {
      console.error('切换置顶状态失败:', error)
    }
  }

  // 格式化时间
  const formatTime = (timestamp, chatId) => {
    const date = new Date(timestamp)
    
    // 基本格式：年/月/日
    const baseFormat = `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`
    
    // 检查指定聊天是否有消息
    const chat = chatHistory.value.find(c => c.id === chatId)
    if (chat && chat.messages && chat.messages.length > 0) {
      // 如果有聊天记录，则添加时分
      return `${baseFormat} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    }
    
    return baseFormat
  }

  // 计算属性：按时间分组的聊天
  const groupedChats = computed(() => {
    const today = new Date()
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(today.getDate() - 7)
    const thirtyDaysAgo = new Date(today)
    thirtyDaysAgo.setDate(today.getDate() - 30)

    const todayChats = []
    const last7DaysChats = []
    const last30DaysChats = []
    const olderChats = []

    chatHistory.value.forEach(chat => {
      const chatDate = new Date(chat.timestamp)
      if (chatDate.toDateString() === today.toDateString()) {
        todayChats.push(chat)
      } else if (chatDate >= sevenDaysAgo) {
        last7DaysChats.push(chat)
      } else if (chatDate >= thirtyDaysAgo) {
        last30DaysChats.push(chat)
      } else {
        olderChats.push(chat)
      }
    })

    return {
      today: todayChats,
      last7Days: last7DaysChats,
      last30Days: last30DaysChats,
      older: olderChats
    }
  })

  // 初始化时从本地存储加载聊天历史
  fetchChatHistory()

  return {
    chatHistory,
    currentChat,
    isLoading,
    fetchChatHistory,
    fetchChat,
    sendMessage,
    createChat,
    togglePinChat,
    formatTime,
    groupedChats,
    updateChatTitle,
    saveCurrentChatToLocal,
    getLocalCurrentChat
  }
}) 