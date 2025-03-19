<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white dark:bg-law-800 rounded-lg shadow-xl w-full max-w-md mx-4">
      <div class="p-5 border-b border-law-200 dark:border-law-700">
        <h3 class="text-lg font-semibold text-law-800 dark:text-white">{{ $t('knowledge_base.upload_document') || '上传文档' }}</h3>
      </div>
      <div class="p-5">
        <div class="mb-4">
          <label class="block text-sm font-medium text-law-700 dark:text-law-300 mb-2">{{ $t('knowledge_base.select_kb') || '选择知识库' }}</label>
          <select 
            v-model="localKbId" 
            disabled
            class="w-full px-3 py-2 border border-law-300 dark:border-law-600 rounded-md bg-white dark:bg-law-700 text-law-700 dark:text-law-300 focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option v-for="kb in knowledgeBaseList" :key="kb.kb_id" :value="kb.kb_id" :selected="selectedKb && kb.kb_id === selectedKb.kb_id">
              {{ kb.kb_name }}
            </option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-law-700 dark:text-law-300 mb-2">{{ $t('knowledge_base.upload_file') || '上传文件' }}</label>
          <div 
            class="border-2 border-dashed border-law-300 dark:border-law-600 rounded-md p-6 text-center"
            @dragover.prevent="onDragOver" 
            @dragleave.prevent="onDragLeave" 
            @drop.prevent="onDrop"
            :class="{'border-accent bg-accent bg-opacity-5': isDragging}"
          >
            <input 
              type="file" 
              ref="fileInput" 
              multiple 
              class="hidden" 
              @change="onFileSelected" 
              accept=".pdf,.docx,.txt,.md"
            />
            <svg class="w-12 h-12 mx-auto text-law-400 dark:text-law-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <p class="mt-2 text-sm text-law-600 dark:text-law-400">{{ $t('knowledge_base.drag_drop') || '拖拽文件到此处或' }}</p>
            <button 
              @click.prevent="$refs.fileInput.click()" 
              class="mt-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors"
            >
              {{ $t('knowledge_base.browse_files') || '浏览文件' }}
            </button>
            <p class="mt-2 text-xs text-law-500 dark:text-law-400">{{ $t('knowledge_base.supported_formats') || '支持的格式: PDF, DOCX, TXT, MD' }}</p>
          </div>
        </div>
        
        <!-- 选择的文件列表 -->
        <div v-if="selectedFiles.length > 0" class="mt-4">
          <h4 class="text-sm font-medium text-law-700 dark:text-law-300 mb-2">{{ $t('knowledge_base.selected_files') || '已选择文件' }}</h4>
          <ul class="max-h-40 overflow-y-auto bg-law-50 dark:bg-law-700 rounded-md p-2">
            <li v-for="(file, index) in selectedFiles" :key="index" class="flex justify-between items-center py-1">
              <div class="flex items-center truncate">
                <svg class="w-4 h-4 mr-2 text-law-500 dark:text-law-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <span class="text-sm text-law-700 dark:text-law-300 truncate">{{ file.name }}</span>
              </div>
              <button @click="removeFile(index)" class="text-red-500 hover:text-red-600">
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </li>
          </ul>
        </div>
      </div>
      <div class="p-4 flex justify-end space-x-3 border-t border-law-200 dark:border-law-700">
        <button 
          @click="$emit('close')" 
          class="px-4 py-2 text-law-700 dark:text-law-300 hover:bg-law-100 dark:hover:bg-law-700 rounded-md transition-colors"
        >
          {{ $t('common.cancel') || '取消' }}
        </button>
        <button 
          @click="$emit('upload', { files: selectedFiles, kbId: localKbId })" 
          class="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors"
          :disabled="selectedFiles.length === 0 || isUploading"
        >
          <span v-if="isUploading" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ $t('knowledge_base.uploading') || '上传中...' }}
          </span>
          <span v-else>{{ $t('knowledge_base.upload') || '上传' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  knowledgeBaseList: {
    type: Array,
    default: () => []
  },
  selectedKb: {
    type: Object,
    default: null
  },
  isUploading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'upload']);

// 上传状态
const fileInput = ref(null);
const localKbId = ref(props.selectedKb ? props.selectedKb.kb_id : '');
const selectedFiles = ref([]);
const isDragging = ref(false);

// 当选中的知识库变化时更新localKbId
watch(() => props.selectedKb, (newVal) => {
  if (newVal) {
    localKbId.value = newVal.kb_id;
  }
});

// 文件拖拽相关方法
const onDragOver = () => {
  isDragging.value = true;
};

const onDragLeave = () => {
  isDragging.value = false;
};

const onDrop = (event) => {
  isDragging.value = false;
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    addFiles(files);
  }
};

// 文件选择
const onFileSelected = (event) => {
  const files = event.target.files;
  if (files.length > 0) {
    addFiles(files);
  }
  // 重置文件输入，以便可以重新选择相同的文件
  event.target.value = '';
};

// 添加文件到选择列表
const addFiles = (files) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    // 检查文件类型是否支持
    if (['pdf', 'docx', 'txt', 'md'].includes(fileExtension)) {
      // 检查文件是否已经在列表中
      const isDuplicate = selectedFiles.value.some(existingFile => 
        existingFile.name === file.name && existingFile.size === file.size
      );
      
      if (!isDuplicate) {
        selectedFiles.value.push(file);
      }
    }
  }
};

// 从选择列表中移除文件
const removeFile = (index) => {
  selectedFiles.value.splice(index, 1);
};
</script> 