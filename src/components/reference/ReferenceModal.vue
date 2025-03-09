<template>
    <div v-if="isVisible" class="modal-overlay" @click.self="close">
      <div class="modal-content" ref="modalContent" @mousedown="startDrag">
        <div class="modal-header">
          <div class="flex items-center">
            <span class="text-xl mr-2">📜</span>
            <h2 class="text-xl font-bold">{{ $t('reference.title') }}</h2>
          </div>
          <button @click="close" class="close-button">
            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <h3 class="modal-title">引用详情</h3>
          <div v-if="referenceData">
            <p class="modal-description">{{ referenceData.title }}</p>
            <p class="modal-description">{{ referenceData.content }}</p>
            <p class="modal-description">来源: {{ referenceData.source }}</p>
            <a :href="referenceData.url" target="_blank" class="text-accent hover:underline">查看更多</a>
          </div>
          <div v-else class="text-center py-4">
            <p>暂无引用详情数据</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue'
  import { useReferenceStore } from '../../stores/reference'
  
  const props = defineProps({
    isVisible: {
      type: Boolean,
      required: true
    }
  })
  
  const emit = defineEmits(['close'])
  const referenceStore = useReferenceStore()
  const referenceData = ref(null)
  
  // 从本地存储获取引用数据
  const getLocalReferenceData = () => {
    const storedData = localStorage.getItem('referenceData')
    if (storedData) {
      try {
        return JSON.parse(storedData)
      } catch (error) {
        console.error('解析本地存储的引用数据失败:', error)
        return null
      }
    }
    return null
  }
  
  // 保存引用数据到本地存储
  const saveReferenceDataToLocal = (data) => {
    if (data) {
      try {
        localStorage.setItem('referenceData', JSON.stringify(data))
      } catch (error) {
        console.error('保存引用数据到本地存储失败:', error)
      }
    }
  }
  
  // 监听 activeReference 变化，更新本地数据
  watch(() => referenceStore.activeReference, (newValue) => {
    if (newValue) {
      referenceData.value = newValue
      saveReferenceDataToLocal(newValue)
    }
  }, { immediate: true })
  
  // 组件挂载时从本地存储获取数据
  onMounted(() => {
    const localData = getLocalReferenceData()
    if (localData) {
      referenceData.value = localData
    }
  })
  
  const close = () => {
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