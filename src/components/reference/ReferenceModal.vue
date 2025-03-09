<template>
    <div v-if="isVisible" class="modal-overlay" @click.self="close">
      <div class="modal-content" ref="modalContent" @mousedown="startDrag">
        <div class="modal-header">
          <div class="flex items-center">
            <span class="text-xl mr-2">📜</span>
            <h2 class="text-xl font-bold">{{ referenceTitle }}</h2>
          </div>
          <button @click="close" class="close-button">
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
            <div v-if="loading" class="text-center py-4">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
              <p class="mt-2">加载中...</p>
            </div>
            <div v-else-if="error" class="text-center text-red-500 py-4">{{ error }}</div>
            <div v-else-if="fileContent" class="py-2">
                <div v-if="isBase64" v-html="decodedContent"></div>
                <div v-else>{{ fileContent }}</div>
            </div>
            <div v-else class="text-center py-4">
                <p>暂无内容</p>
            </div>
        </div>
      </div>
    </div>
</template>
  
<script setup>
  import { ref, onMounted, watch, computed, onUnmounted } from 'vue'
  import { API_URL } from '@services/api'
  import { userId } from '@services/urlConfig'
  
  const props = defineProps({
    isVisible: {
      type: Boolean,
      required: true
    },
    referenceId: {
      type: String,
      default: ''
    },
    referenceTitle: {
      type: String,
      default: '引用详情'
    }
  })
  
  const emit = defineEmits(['close'])
  
  const loading = ref(false)
  const error = ref(null)
  const fileContent = ref('')
  const isBase64 = ref(false)
  let abortController = null // 用于取消请求
  
  // 解码 Base64 内容
  const decodedContent = computed(() => {
    if (fileContent.value) {
      try {
        // 尝试解码 Base64 内容
        const decoded = atob(fileContent.value)
        return decoded
      } catch (e) {
        console.error('Base64 解码失败:', e)
        return fileContent.value
      }
    }
    return ''
  })
  
  // 取消当前请求
  const cancelCurrentRequest = () => {
    if (abortController) {
      console.log('取消当前请求')
      abortController.abort()
      abortController = null
    }
  }
  
  // 获取引用数据
  const fetchReferenceData = async (referenceId) => {
    if (referenceId) {
      error.value = '引用ID不存在'
      return
    }
    
    // 取消之前的请求
    cancelCurrentRequest()
    
    // 创建新的 AbortController
    abortController = new AbortController()
    
    loading.value = true
    error.value = null
    fileContent.value = ''
    
    try {
      console.log('请求参数:', { user_id: userId, file_id: referenceId })
      
      // 设置超时
      const timeoutId = setTimeout(() => {
        if (abortController) {
          abortController.abort()
          error.value = '请求超时，请稍后重试'
          loading.value = false
        }
      }, 10000) // 10秒超时
      
      const response = await fetch(`${API_URL}/kb_api/local_doc_qa/get_file_base64`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, file_id: referenceId }),
        signal: abortController.signal // 添加 signal 以支持取消
      })
      
      // 清除超时
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`请求失败: ${response.status} ${response.statusText}`)
      }
      
      const data = await response.json()
      console.log('接口返回数据:', data)
      
      if (data && data.base64_content) {
        isBase64.value = true
        fileContent.value = data.base64_content
      } else {
        error.value = '未能获取有效数据'
      }
    } catch (err) {
      // 如果是取消请求导致的错误，不显示错误信息
      if (err.name === 'AbortError') {
        console.log('请求已取消')
      } else {
        error.value = '获取引用内容失败，请稍后重试。'
        console.error('获取引用内容失败:', err)
      }
    } finally {
      loading.value = false
      abortController = null
    }
  }
  
  // 监听 referenceId 变化，每次都重新获取数据
  watch(() => props.referenceId, (newValue) => {
    if (newValue && props.isVisible) {
      fetchReferenceData(newValue)
    }
  }, { immediate: true })
  
  // 监听 isVisible 变化
  watch(() => props.isVisible, (newValue) => {
    if (newValue && props.referenceId) {
      fetchReferenceData(props.referenceId)
    } else if (!newValue) {
      // 当模态框关闭时，取消当前请求
      cancelCurrentRequest()
    }
  })
  
  // 关闭模态框
  const close = () => {
    // 取消当前请求
    cancelCurrentRequest()
    // 通知父组件关闭模态框
    emit('close')
  }
  
  // 组件卸载时取消请求
  onUnmounted(() => {
    cancelCurrentRequest()
  })
  
  // 拖动功能
  const modalContent = ref(null)
  let isDragging = false
  let offset = { x: 0, y: 0 }
  
  const startDrag = (event) => {
    isDragging = true
    offset.x = event.clientX - modalContent.value.getBoundingClientRect().left
    offset.y = event.clientY - modalContent.value.getBoundingClientRect().top
    window.addEventListener('mousemove', drag)
    window.addEventListener('mouseup', stopDrag)
  }
  
  const drag = (event) => {
    if (isDragging) {
      modalContent.value.style.position = 'absolute'
      modalContent.value.style.left = `${event.clientX - offset.x}px`
      modalContent.value.style.top = `${event.clientY - offset.y}px`
    }
  }
  
  const stopDrag = () => {
    isDragging = false
    window.removeEventListener('mousemove', drag)
    window.removeEventListener('mouseup', stopDrag)
  }
</script>
  
<style scoped>
.modal-overlay {
  position: fixed;    
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent; /* 保持背景透明 */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
} 

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 60%; /* 调整宽度 */
  max-width: 500px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); 
  position: relative; /* 使关闭按钮相对定位 */
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0; /* 添加底部边框 */
  padding-bottom: 10px;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
}

.modal-body {
  max-height: 400px; /* 设置最大高度 */
  overflow-y: auto; /* 超出时显示滚动条 */
  padding-top: 10px; /* 增加顶部间距 */
}

.modal-title {
  font-size: 1.5em;
  margin-bottom: 10px;
}

.modal-description {
  margin-bottom: 10px;
}
</style>