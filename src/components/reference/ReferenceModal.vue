<template>
    <div v-if="isVisible" class="modal-overlay" @click.self="close">
      <div class="modal-content bg-white dark:bg-law-800 border border-law-200 dark:border-law-700 w-[90%] md:w-[70%] lg:w-[60%] max-w-4xl" ref="modalContent" @mousedown="startDrag">
        <div class="modal-header flex justify-between items-center border-b border-law-200 dark:border-law-700 pb-3 mb-3">
          <div class="flex items-center">
            <span class="text-xl mr-2">📜</span>
            <h2 class="text-sm md:text-lg font-bold text-primary dark:text-accent break-words max-w-full">{{ referenceTitle }}</h2>
          </div>
          <button @click="close" class="close-button p-1 rounded-full hover:bg-law-200 dark:hover:bg-law-700 transition-colors duration-200">
            <svg class="w-5 h-5 text-primary dark:text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body max-h-[60vh] md:max-h-[70vh] overflow-y-auto pt-2">
            <div v-if="loading" class="flex flex-col justify-center items-center py-8">
              <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-accent"></div>
              <p class="mt-2 text-law-600 dark:text-law-300">加载中...</p>
            </div>
            <div v-else-if="error" class="text-center text-red-500 py-4">{{ error }}</div>
            <div v-else-if="sourceUrl" class="source-content w-full min-h-[200px] md:min-h-[300px] flex flex-col items-center">
                <!-- 使用不同的组件显示不同类型的文件 -->
                <PdfView v-if="sourceType === 'pdf'" :source-url="sourceUrl" class="w-full" />
                <DocxView v-if="sourceType === 'docx'" :source-url="sourceUrl" class="w-full" />
                <ExcelView v-if="sourceType === 'xlsx'" :source-url="sourceUrl" class="w-full" />
                <MsgView v-if="sourceType === 'msg'" :source-url="sourceUrl" class="w-full" />
                <MdView v-if="sourceType === 'md'" :source-url="sourceUrl" class="w-full" />
                <EmlView v-if="sourceType === 'eml'" :source-url="sourceUrl" class="w-full" />
                
                <!-- 图片显示 -->
                <img 
                  v-if="imageArr.includes(sourceType)" 
                  :src="sourceUrl" 
                  class="max-w-full h-auto mx-auto object-contain max-h-[50vh]"
                  alt="图片预览"
                />
                
                <!-- 文本显示 -->
                <div 
                  v-if="sourceType === 'txt'" 
                  ref="highlightedText" 
                  class="w-full p-3 md:p-4 whitespace-pre-wrap font-sans text-xs md:text-sm text-law-900 dark:text-law-100 bg-law-50 dark:bg-law-700 rounded-md max-h-[50vh] overflow-y-auto border border-law-200 dark:border-law-600" 
                  v-html="highlightTextContent"
                ></div>
            </div>
            <div v-else class="flex flex-col justify-center items-center py-8">
                <p class="text-law-600 dark:text-law-300">暂无内容</p>
            </div>
        </div>
      </div>
    </div>
</template>
  
<script setup>
  import { ref, watch, computed, nextTick } from 'vue'
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
    },
    referenceSection: {
      type: String,
      default: ''
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
              // console.log('decodedTxt', correctStr)
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

// 高亮显示文本内容
const highlightTextContent = computed(() => {
  if (textContent.value && props.referenceSection) {
    // 提取文件名，去掉后缀
    const fileNameWithoutExtension = props.referenceTitle.replace(/\.[^/.]+$/, ""); // 去掉文件后缀
    const sectionRegex = new RegExp(`${fileNameWithoutExtension} : (.*)`, 'i'); // 创建正则表达式，匹配文件名后面的内容

    // 从 referenceSection 中提取出需要的部分
    const match = props.referenceSection.match(sectionRegex);
    const matchedText = match ? match[1] : ''; // 获取匹配的内容

    // 创建高亮显示的正则表达式
    const highlightRegex = new RegExp(`(${matchedText})`, 'gi'); // 创建高亮显示的正则表达式

    // 返回高亮后的文本内容
    return textContent.value.replace(highlightRegex, '<span class="bg-yellow-300 dark:bg-yellow-600">$1</span>');
  }
  return textContent.value;
});

// 自动滚动到高亮位置
watch(highlightTextContent, (newValue) => {
  nextTick(() => {
    const highlightedElement = document.querySelector('.bg-yellow-300, .dark\\:bg-yellow-600');
    if (highlightedElement) {
      highlightedElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });
});
  
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
    // 在移动设备上禁用拖动
    if (window.innerWidth < 768) return;
    
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
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); 
  position: relative;
  transition: all 0.3s ease-in-out;
}

@media (max-width: 640px) {
  .modal-content {
    width: 95%;
    padding: 12px;
  }
  
  .modal-body {
    max-height: 70vh;
  }
}

/* 添加动效 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.source-content {
  animation: fadeIn 0.3s ease-out;
}
</style>