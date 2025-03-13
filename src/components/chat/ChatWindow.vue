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
            <p class="text-sm text-law-600 dark:text-law-300">查看法律文件，获取专业解读</p>
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
    <div class="border-t border-law-200 dark:border-law-700 p-3 bg-white dark:bg-law-800">
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
import { apiBase } from '@services/index';
import { userId } from '@services/urlConfig'; // 引入 userId
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { Typewriter } from '@utils/typewriter';

const props = defineProps({
  chatId: {
    type: String,
    required: true
  }
})

const chatStore = useChatStore()
console.log('chatStore',chatStore.currentChat);
const referenceStore = useReferenceStore()
const messageInput = ref('')
const messagesContainer = ref(null)
const appLayout = inject('appLayout')

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

// 从本地存储获取知识库选择列表
const getLocalSelectList = () => {
  const storedData = localStorage.getItem('selectList')
  if (storedData) {
    try {
      return JSON.parse(storedData)
    } catch (error) {
      console.error('解析本地存储的知识库选择列表失败:', error)
      return ['KB969f8f2f026e478eb98c5c4158c0bbac'] // 默认值
    }
  }
  return ['KB969f8f2f026e478eb98c5c4158c0bbac'] // 默认值
}

// 保存知识库选择列表到本地存储
const saveSelectListToLocal = (data) => {
  if (data) {
    try {
      localStorage.setItem('selectList', JSON.stringify(data))
    } catch (error) {
      console.error('保存知识库选择列表到本地存储失败:', error)
    }
  }
}

// 从本地存储获取当前聊天
const getLocalCurrentChat = () => {
  // const storedData = localStorage.getItem('currentChat')
  // if (storedData) {
  //   try {
  //     return JSON.parse(storedData)
  //   } catch (error) {
  //     console.error('解析本地存储的当前聊天失败:', error)
  //     return null
  //   }
  // }
  return null
}

// 保存当前聊天到本地存储
const saveCurrentChatToLocal = (data) => {
  // if (data) {
  //   try {
  //     localStorage.setItem('currentChat', JSON.stringify(data))
  //   } catch (error) {
  //     console.error('保存当前聊天到本地存储失败:', error)
  //   }
  // }
}

// 聊天对话
const chatHistory = ref(getLocalChatHistory())
const currentChat = ref(getLocalCurrentChat())
const selectList = ref(getLocalSelectList()); // 从本地存储获取知识库ID列表
const history = ref([]); // 聊天历史
const showLoading = ref(false); // 加载状态
const QA_List = ref([{ answer: '' }]); // 问答列表

const typewriter = new Typewriter((str) => {
  if (str && currentMessageId) {
    const currentMessage = chatStore.currentChat.messages.find(m => m.id === currentMessageId);
    if (currentMessage) {
      // 在这里更新 currentMessage.content，恢复打字机效果
      currentMessage.content += str;
      
      // 保存当前聊天到本地存储
      chatStore.saveCurrentChatToLocal(chatStore.currentChat);
    }
  }
});

// 添加一个变量来存储完整的响应内容
let fullResponse = '';

let currentMessageId = null; // 用于存储当前消息的ID

// 获取聊天数据
onMounted(async () => {
  if (props.chatId) {
    await chatStore.fetchChat(props.chatId);
    scrollToBottom();
  }
})

// 监听聊天ID变化
watch(() => props.chatId, async (newChatId) => {
  if (newChatId) {
    await chatStore.fetchChat(newChatId);
    scrollToBottom();
  }
})

// 监听消息变化，自动滚动到底部
watch(() => chatStore.currentChat?.messages.length, () => {
  scrollToBottom();
})

// 发送消息
const sendMessage = async () => {
  if (!messageInput.value.trim() || chatStore.isLoading) return
  
  const q = messageInput.value // 用户输入的问题
  messageInput.value = ''
  
  try {
    chatStore.isLoading = true
    
    // 添加用户消息
    chatStore.currentChat.messages.push({
      id: Date.now().toString(),
      role: 'user',
      content: q,
      timestamp: new Date().toISOString()
    })
    
    // 更新聊天标题为用户消息内容
    chatStore.updateChatTitle(chatStore.currentChat.id, q)
    
    // 保存当前聊天到本地存储
    chatStore.saveCurrentChatToLocal(chatStore.currentChat);

    // 重置完整响应内容
    fullResponse = '';

    // 使用 fetchEventSource 发送请求
    const ctrl = new AbortController(); // 创建一个 AbortController 实例

    fetchEventSource(apiBase + '/kb_api/local_doc_qa/local_doc_chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: ['text/event-stream', 'application/json'],
      },
      openWhenHidden: true,
      body: JSON.stringify({
        user_id: userId,
        kb_ids: selectList.value,
        history: history.value,
        question: q,
        streaming: true,
        networking: false,
        product_source: 'saas',
        is_internal: true, // true 为内部人员传参，false 为外部人员传参
      }),
      signal: ctrl.signal,
      onopen(e) {
        console.log('open');
        if (e.ok && e.headers.get('content-type') === 'text/event-stream') {
          console.log("everything's good");
          
          // 创建一个新的消息对象
          const newMessageId = Date.now().toString();
          currentMessageId = newMessageId;
          
          chatStore.currentChat.messages.push({
            id: newMessageId,
            role: 'assistant',
            content: '', // 初始内容为空
            timestamp: new Date().toISOString(),
            references: [] // 初始引用为空
          });
          
          // 保存当前聊天到本地存储
          chatStore.saveCurrentChatToLocal(chatStore.currentChat);
          
          typewriter.start();
        } else if (e.headers.get('content-type') === 'application/json') {
          chatStore.isLoading = false;
          return e.json().then(data => {
            message.error(data?.msg || '出错了,请稍后刷新重试。');
          }).catch(e => {
            console.log(e);
            message.error('出错了,请稍后刷新重试。');
          });
        }
      },
      onmessage(msg) {
        const res = JSON.parse(msg.data);
        
        if (res?.code == 200) {
          // 查找当前消息
          const currentMessage = chatStore.currentChat.messages.find(m => m.id === currentMessageId);
          
          if (currentMessage) {
            // 如果 response 为空但 history 有值，说明这是最后一条消息
            if (res.response === "" && res.history && res.history.length > 0) {
              // 最后一条消息，包含完整的对话历史
              // 不做任何处理，等待 onclose 处理
              console.log("收到最后一条消息，包含完整历史");
            } else {
              // 正常的消息片段，累加到 fullResponse
              fullResponse += res.response;
              
              // 使用打字机效果，只传递当前的响应片段
              typewriter.add(res.response);
            }

            // 如果有引用文档，更新引用
            if (res.source_documents && res.source_documents.length > 0) { 
              // 确保不重复添加相同的引用
              const existingIds = new Set(currentMessage.references.map(ref => ref.id));
              
              const newReferences = res.source_documents
                .filter(doc => !existingIds.has(doc.file_id))
                .map(doc => ({
                  file_id: doc.file_id,
                  title: doc.file_name,
                  type: 'law',
                  section: doc.content
                }));
              
              currentMessage.references = [...currentMessage.references, ...newReferences];
            }
            
            // 保存当前聊天到本地存储
            chatStore.saveCurrentChatToLocal(chatStore.currentChat);
          }
          
          scrollToBottom();
        }
      },
      onclose(e) {
        typewriter.done();
        
        // 查找当前消息并进行最终的格式处理
        const currentMessage = chatStore.currentChat.messages.find(m => m.id === currentMessageId);
        if (currentMessage) {
          // 保存当前聊天到本地存储
          chatStore.saveCurrentChatToLocal(chatStore.currentChat);
        }
        
        ctrl.abort();
        chatStore.isLoading = false;
        nextTick(() => {
          scrollToBottom();
        });
      },
      onerror(err) {
        console.log('error',err);
        typewriter.done();
        ctrl.abort();
        chatStore.isLoading = false;
        message.error(err.msg || '出错了');
        nextTick(() => {
          scrollToBottom();
        });
        throw err;
      },
    });
  } catch (error) {
    console.error('发送消息失败:', error);
    chatStore.isLoading = false;
  }
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
