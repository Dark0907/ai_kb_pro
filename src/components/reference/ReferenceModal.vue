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
          <p class="modal-description">
            这是一些模拟数据，用于展示模态框的内容。你可以在这里添加更多信息，比如法律条款、案例分析等。
          </p>
          <p class="modal-description">
            继续添加更多内容以测试滚动效果。继续添加更多内容以测试滚动效果。继续添加更多内容以测试滚动效果。
          </p>
          <p class="modal-description">
            继续添加更多内容以测试滚动效果。继续添加更多内容以测试滚动效果。继续添加更多内容以测试滚动效果。
          </p>
          <p class="modal-description">
            继续添加更多内容以测试滚动效果。继续添加更多内容以测试滚动效果。继续添加更多内容以测试滚动效果。
          </p>
          <p class="modal-description">
            继续添加更多内容以测试滚动效果。继续添加更多内容以测试滚动效果。继续添加更多内容以测试滚动效果。
          </p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const props = defineProps({
    isVisible: {
      type: Boolean,
      required: true
    }
  })
  
  const emit = defineEmits(['close'])
  
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