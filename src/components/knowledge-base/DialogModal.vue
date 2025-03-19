<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white dark:bg-law-800 rounded-lg shadow-xl w-full max-w-md mx-4">
      <div class="p-5 border-b border-law-200 dark:border-law-700">
        <h3 class="text-lg font-semibold text-law-800 dark:text-white">{{ title }}</h3>
      </div>
      
      <!-- 内容区域 -->
      <div class="p-5">
        <!-- 文本内容（用于删除确认等） -->
        <p v-if="contentType === 'text'" class="text-law-700 dark:text-law-300">{{ content }}</p>
        
        <!-- 输入框（用于新建/重命名知识库等） -->
        <div v-if="contentType === 'input'" class="mb-4">
          <label class="block text-sm font-medium text-law-700 dark:text-law-300 mb-1">{{ inputLabel }}</label>
          <input 
            v-model="inputValue" 
            type="text" 
            :placeholder="inputPlaceholder"
            class="w-full px-3 py-2 border border-law-300 dark:border-law-600 rounded-md bg-white dark:bg-law-700 text-law-700 dark:text-law-300 focus:outline-none focus:ring-2 focus:ring-accent"
            @keyup.enter="handleConfirm"
          />
        </div>
      </div>
      
      <!-- 底部按钮区域 -->
      <div class="p-4 flex justify-end space-x-3 border-t border-law-200 dark:border-law-700">
        <button 
          @click="$emit('cancel')" 
          class="px-4 py-2 text-law-700 dark:text-law-300 hover:bg-law-100 dark:hover:bg-law-700 rounded-md transition-colors"
        >
          {{ cancelText }}
        </button>
        <button 
          @click="handleConfirm"
          class="px-4 py-2 text-white rounded-md transition-colors"
          :class="confirmDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-accent hover:bg-accent-dark'"
        >
          {{ confirmText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  contentType: {
    type: String,
    default: 'text', // 'text' 或 'input'
    validator: value => ['text', 'input'].includes(value)
  },
  content: {
    type: String,
    default: ''
  },
  inputLabel: {
    type: String,
    default: ''
  },
  inputPlaceholder: {
    type: String,
    default: ''
  },
  defaultInputValue: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: '确认'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  confirmDanger: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['confirm', 'cancel']);

// 输入框值
const inputValue = ref(props.defaultInputValue);

// 确认回调
const handleConfirm = () => {
  if (props.contentType === 'input') {
    emit('confirm', inputValue.value);
  } else {
    emit('confirm');
  }
};
</script> 