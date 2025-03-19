<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white dark:bg-law-800 rounded-lg shadow-xl w-full max-w-md mx-4">
      <div class="p-5 border-b border-law-200 dark:border-law-700">
        <h3 class="text-lg font-semibold text-law-800 dark:text-white">{{ $t('knowledge_base.upload_progress') || '上传进度' }}</h3>
      </div>
      <div class="p-5">
        <div class="space-y-4">
          <div v-for="(file, index) in files" :key="index" class="w-full">
            <div class="flex justify-between items-center mb-1">
              <span class="text-sm text-law-700 dark:text-law-300 truncate">{{ file.name }}</span>
              <span class="text-xs text-law-500 dark:text-law-400">
                {{ 
                  file.status === 'loading' ? ($t('knowledge_base.uploading') || '上传中...') :
                  file.status === 'success' ? ($t('knowledge_base.upload_success') || '上传成功') :
                  ($t('knowledge_base.upload_failed') || '上传失败')
                }}
              </span>
            </div>
            <div class="w-full h-2 bg-law-200 dark:bg-law-700 rounded-full overflow-hidden">
              <div 
                class="h-full transition-all duration-300 ease-out rounded-full"
                :class="{
                  'bg-accent': file.status === 'loading',
                  'bg-green-500': file.status === 'success',
                  'bg-red-500': file.status === 'error'
                }"
                :style="{ width: file.status === 'loading' ? '90%' : (file.status === 'success' ? '100%' : '30%') }"
              ></div>
            </div>
            <p v-if="file.status === 'error'" class="text-xs text-red-500 mt-1">{{ file.errorText || '上传失败，请重试' }}</p>
          </div>
        </div>
      </div>
      <div class="p-4 flex justify-end space-x-3 border-t border-law-200 dark:border-law-700">
        <button 
          @click="$emit('close')" 
          class="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors"
        >
          {{ $t('common.close') || '关闭' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  files: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close']);
</script> 