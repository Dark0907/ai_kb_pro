import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import chats from '../assets/mock/chats.json'

export const useChatStore = defineStore('chat', () => {
  // 状态
  const chatHistory = ref([])
  const currentChat = ref(null)
  const isLoading = ref(false)

  // 获取聊天历史
  const fetchChatHistory = async () => {
    try {
      // 模拟API调用
      // const response = await api.get('/chats')
      // chatHistory.value = response.data
      chatHistory.value = chats
    } catch (error) {
      console.error('获取聊天历史失败:', error)
    }
  }

  // 获取单个聊天
  const fetchChat = async (chatId) => {
    try {
      isLoading.value = true
      // 模拟API调用
      // const response = await api.get(`/chats/${chatId}`)
      // currentChat.value = response.data
      currentChat.value = chats.find(chat => chat.id === chatId) || null
    } catch (error) {
      console.error('获取聊天失败:', error)
    } finally {
      isLoading.value = false
    }
  }

  // 发送消息
  const sendMessage = async (message) => {
    try {
      isLoading.value = true
      // 模拟API调用
      // const response = await api.post(`/chats/${currentChat.value.id}/messages`, { content: message })
      // 添加用户消息
      currentChat.value.messages.push({
        id: Date.now().toString(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      })

      // 模拟AI响应
      setTimeout(() => {
        currentChat.value.messages.push({
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: '这是一个模拟的AI回复。在实际应用中，这里将是来自后端API的响应。',
          timestamp: new Date().toISOString(),
          references: [
            { id: '1', type: 'law', title: '中华人民共和国民法典', section: '第一千一百六十五条' },
            { id: '2', type: 'case', title: '张三诉李四合同纠纷案', court: '最高人民法院' }
          ]
        })
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
      // 模拟API调用
      // const response = await api.post('/chats')
      // return response.data.id
      const newChat = {
        id: Date.now().toString(),
        title: '新对话',
        timestamp: new Date().toISOString(),
        messages: []
      }
      chatHistory.value.unshift(newChat)
      return newChat.id
    } catch (error) {
      console.error('创建聊天失败:', error)
    }
  }

  // 固定/取消固定聊天
  const togglePinChat = async (chatId) => {
    try {
      // 模拟API调用
      // await api.patch(`/chats/${chatId}`, { isPinned: !chat.isPinned })
      const chat = chatHistory.value.find(c => c.id === chatId)
      if (chat) {
        chat.isPinned = !chat.isPinned
      }
    } catch (error) {
      console.error('固定/取消固定聊天失败:', error)
    }
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

  return {
    chatHistory,
    currentChat,
    isLoading,
    groupedChats,
    fetchChatHistory,
    fetchChat,
    sendMessage,
    createChat,
    togglePinChat
  }
}) 