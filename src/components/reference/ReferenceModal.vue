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
            <div v-else-if="sourceUrl" class="source-content">
                <!-- 使用不同的组件显示不同类型的文件 -->
                <PdfView v-if="sourceType === 'pdf'" :source-url="sourceUrl" />
                <DocxView v-if="sourceType === 'docx'" :source-url="sourceUrl" />
                <ExcelView v-if="sourceType === 'xlsx'" :source-url="sourceUrl" />
                <MsgView v-if="sourceType === 'msg'" :source-url="sourceUrl" />
                <MdView v-if="sourceType === 'md'" :source-url="sourceUrl" />
                <EmlView v-if="sourceType === 'eml'" :source-url="sourceUrl" />
                
                <!-- 图片显示 -->
                <img 
                  v-if="imageArr.includes(sourceType)" 
                  :src="sourceUrl" 
                  class="max-w-full h-auto mx-auto"
                  alt="图片预览"
                />
                
                <!-- 文本显示 -->
                <div v-if="sourceType === 'txt'" class="txt-content">
                  {{ textContent }}
                </div>
            </div>
            <div v-else class="text-center py-4">
                <p>暂无内容</p>
            </div>
        </div>
      </div>
    </div>
</template>
  
<script setup>
  import { ref, watch } from 'vue'
  import urlResquest from '@/services/urlConfig'
  import { resultControl } from '@/utils/utils'
  import PdfView from './Source/PdfView.vue'
  import DocxView from './Source/DocxView.vue'
  import ExcelView from './Source/ExcelView.vue'
  import MsgView from './Source/MsgView.vue'
  import MdView from './Source/MdView.vue'
  import EmlView from './Source/EmlView.vue'
  
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
  const sourceUrl = ref(null)
  const sourceType = ref('')
  const textContent = ref('')
  
  // 图片类型数组
  const imageArr = ['jpg', 'png', 'jpeg']
  
  // 支持的文件类型
  const supportSourceTypes = ['pdf', 'docx', 'xlsx', 'txt', 'jpg', 'png', 'jpeg', 'msg', 'md', 'eml']
  
  // Base64 类型映射
  const b64Types = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/jpeg',
    'application/msg',
    'application/md',
    'application/eml',
  ]
  
  // 获取 Base64 类型
  const getB64Type = (suffix) => {
    const index = supportSourceTypes.indexOf(suffix)
    return b64Types[index]
  }
  
  // 获取引用数据
  const fetchReferenceData = async (referenceId) => {
    if (!referenceId) {
      error.value = '引用ID不存在'
      return
    }
    
    loading.value = true
    error.value = null
    sourceUrl.value = null
    textContent.value = ''
    
    try {
      console.log('请求参数:', { file_id: referenceId })
      
      // 使用与 Chat.vue 相同的请求方式
      const res = await resultControl(await urlResquest.getFile({ file_id: referenceId }))
      
      if (res && res.base64_content) {
        // 获取文件后缀
        const suffix = props.referenceTitle.split('.').pop().toLowerCase()
        
        // 检查是否支持该文件类型
        if (supportSourceTypes.includes(suffix)) {
          const b64Type = getB64Type(suffix)
          console.log('b64Type', b64Type)
          
          sourceType.value = suffix
          sourceUrl.value = `data:${b64Type};base64,${res.base64_content}`
          // console.log('sourceUrl', sourceUrl.value)
          // 如果是文本文件，解码内容
          if (suffix === 'txt') {
            try {
              const decodedTxt = atob(res.base64_content)
              const correctStr = decodeURIComponent(escape(decodedTxt))
              console.log('decodedTxt', correctStr)
              textContent.value = correctStr
            } catch (e) {
              console.error('解码文本失败:', e)
              textContent.value = '文本解码失败'
            }
          }
        } else {
          error.value = '不支持的文件类型'
        }
      } else {
        error.value = '未能获取有效数据'
      }
    } catch (err) {
      error.value = err.msg || '获取引用内容失败，请稍后重试'
      console.error('获取引用内容失败:', err)
    } finally {
      loading.value = false
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
    }
  })
  
  // 关闭模态框
  const close = () => {
    // 通知父组件关闭模态框
    emit('close')
  }
  
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
  width: 70%; /* 调整宽度 */
  max-width: 800px;
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
  max-height: 70vh; /* 设置最大高度 */
  overflow-y: auto; /* 超出时显示滚动条 */
  padding-top: 10px; /* 增加顶部间距 */
}

.source-content {
  width: 100%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.txt-content {
  width: 100%;
  padding: 10px;
  white-space: pre-wrap;
  font-family: monospace;
  background-color: #f5f5f5;
  border-radius: 4px;
  max-height: 500px;
  overflow-y: auto;
}
</style>