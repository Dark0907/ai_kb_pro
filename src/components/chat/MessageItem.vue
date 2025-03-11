<template>
  <div 
    class="mb-6 last:mb-0"
    :class="message.role === 'user' ? 'md:pr-12' : 'md:pl-12'"
  >
    <!-- 用户消息 - 显示在右侧 -->
    <div v-if="message.role === 'user'" class="flex items-start justify-end">
      <div class="flex-1 flex justify-end">
        <div class="max-w-[80%] min-w-[60px]">
          <div class="bg-primary-light dark:bg-primary text-white rounded-lg shadow-law p-4 inline-block">
            <p class="whitespace-pre-line break-words">{{ message.content }}</p>
          </div>
          <div class="mt-1 text-xs text-gray-500 dark:text-gray-400 text-right">
            {{ formatTime(message.timestamp) }}
          </div>
        </div>
      </div>
      <div class="flex-shrink-0 ml-3">
        <div class="w-8 h-8 rounded-full bg-law-600 flex items-center justify-center shadow-sm">
          <svg class="w-5 h-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
      </div>
    </div>
    
    <!-- AI消息 - 显示在左侧 -->
    <div v-else class="flex items-start">
      <div class="flex-shrink-0 mr-3">
        <div class="w-8 h-8 rounded-full bg-accent flex items-center justify-center shadow-sm">
          <span class="text-lg text-white">⚖️</span>
        </div>
      </div>
      <div class="flex-1">
        <div class="max-w-[80%] min-w-[60px]">
          <div class="bg-law-200 dark:bg-law-700 rounded-lg shadow-law p-4 inline-block">
            <div v-html="renderMarkdown(message.content)" class="text-law-900 dark:text-law-100 markdown-content"></div>
            
            <!-- 引用来源 -->
            <div v-if="message.references && message.references.length > 0" class="mt-3 pt-3 border-t border-law-300 dark:border-law-700">
              <div class="flex items-center mb-2">
                <span class="text-lg mr-1">📜</span>
                <button 
                  @click="$emit('reference-click', message.references)"
                  class="text-sm font-medium text-primary dark:text-accent hover:underline hover:text-accent transition-colors duration-200"
                >
                  {{ $t('reference.title') }}
                </button>
                <span class="ml-2 px-2 py-0.5 bg-accent bg-opacity-20 rounded-full text-xs text-accent-dark font-semibold">
                  {{ message.references.length }}
                </span>
              </div>
            </div>
            <div class="mt-2 flex items-start justify-between">
              <span class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {{ formatTime(message.timestamp) }}
              </span>
              
              <div class="flex space-x-3 mt-1">
                <button 
                  @click="copyMessage"
                  class="text-law-600 dark:text-law-400 hover:text-accent dark:hover:text-accent transition-colors duration-200"
                  :title="$t('chat.copy')"
                >
                  <svg v-if="!isCopied" class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <svg v-else class="w-4 h-4 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 6L9 17l-5-5"></path>
                  </svg>
                </button>
                
                <button 
                  @click="toggleReadMessage"
                  :class="{'text-red-500': isReading, 'text-law-600 dark:text-law-400': !isReading}"
                  class="hover:text-accent dark:hover:text-accent transition-colors duration-200"
                  :title="$t('chat.read')"
                >
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                  </svg>
                </button>
                
                <button 
                  @click="shareMessage"
                  class="text-law-600 dark:text-law-400 hover:text-accent dark:hover:text-accent transition-colors duration-200"
                  :title="$t('chat.share')"
                >
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  message: {
    type: Object,
    required: true
  }
})
console.log('message',props);
defineEmits(['reference-click'])

// 状态变量，控制复制图标的状态
const isCopied = ref(false)
const isReading = ref(false) // 控制朗读状态

// 格式化时间
const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }
  return date.toLocaleString('zh-CN', options).replace(/\//g, '-').replace(',', ' ') // 替换斜杠为短横线，并去掉逗号
}

// 渲染 Markdown
const renderMarkdown = (content) => {
  if (!content) return '';

  // 找到 </think> 的位置
  const thinkEndIndex = content.indexOf('</think>');
  let thinkContent = '';
  let markdownContent = content;

  if (thinkEndIndex !== -1) {
    // 截取 </think> 之前的内容
    thinkContent = content.substring(0, thinkEndIndex);
    // 截取 </think> 之后的内容用于 Markdown 渲染
    markdownContent = content.substring(thinkEndIndex + 8); // 8 是 "</think>".length
  }

  // 配置 marked 选项，确保正确解析 Markdown
  marked.setOptions({
    breaks: true, // 允许回车换行
    gfm: true, // 启用 GitHub 风格的 Markdown
    headerIds: true, // 生成标题 ID，便于样式应用
    mangle: false, // 不转义内联 HTML
    pedantic: false, // 不使用严格模式
    sanitize: false, // 不过滤 HTML 标签
    smartLists: true, // 使用更智能的列表行为
    smartypants: true // 使用更智能的标点符号
  });

  // 渲染 Markdown 内容
  const renderedMarkdown = marked(markdownContent);

  // 如果有 think 内容，则添加到渲染结果前面，并应用小字体样式
  if (thinkContent) {
    return `<div class="small-text">${thinkContent}</div>${renderedMarkdown}`;
  }

  return renderedMarkdown;
};


// 复制消息
const copyMessage = () => {
  navigator.clipboard.writeText(props.message.content)
    .then(() => {
      isCopied.value = true // 设置为已复制状态
      setTimeout(() => {
        isCopied.value = false // 2秒后恢复状态
      }, 2000)
      console.log('消息已复制到剪贴板')
    })
    .catch(err => {
      console.error('复制失败:', err)
    })
}

// 切换朗读状态
const toggleReadMessage = () => {
  if (isReading.value) {
    window.speechSynthesis.cancel() // 取消朗读
    isReading.value = false
  } else {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(props.message.content)
      utterance.lang = document.documentElement.lang || 'zh-CN'
      window.speechSynthesis.speak(utterance)
      isReading.value = true
      utterance.onend = () => {
        isReading.value = false // 朗读结束后恢复状态
      }
    } else {
      console.error('浏览器不支持语音合成')
    }
  }
}

// 分享消息
const shareMessage = () => {
  if (navigator.share) {
    navigator.share({
      title: '法律AI助手回复',
      text: props.message.content
    })
    .catch(err => {
      console.error('分享失败:', err)
    })
  } else {
    console.log('浏览器不支持原生分享')
  }
}
</script>

<style>
/* 注意：这里不使用 scoped，以便样式能够应用到 v-html 渲染的内容 */
.markdown-content {
  color: inherit;
  font-family: inherit;
  line-height: 1.6;
  word-break: break-word;
}

.markdown-content .small-text {
  font-size: 0.8em;
  color: #8b8b8b;
  white-space: pre-wrap;
  line-height: 1.4;
  margin-bottom: 1em;
}

/* 标题样式 */
.markdown-content h1 {
  font-size: 1.8em;
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: bold;
}

.markdown-content h2 {
  font-size: 1.5em;
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: bold;
}

.markdown-content h3 {
  font-size: 1.3em;
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: bold;
}

.markdown-content h4, .markdown-content h5, .markdown-content h6 {
  font-size: 1.1em;
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: bold;
}

/* 段落样式 */
.markdown-content p {
  /* margin-bottom: 1em; */
}

/* 列表样式 */
.markdown-content ul, .markdown-content ol {
  padding-left: 2em;
  margin: 1em 0;
}

.markdown-content li {
  margin-bottom: 0.5em;
}

.markdown-content ul {
  list-style-type: disc;
}

.markdown-content ol {
  list-style-type: decimal;
}

/* 代码样式 */
.markdown-content code {
  font-family: monospace;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-size: 0.9em;
}

.markdown-content pre {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 1em;
  border-radius: 5px;
  overflow-x: auto;
  margin: 1em 0;
}

.markdown-content pre code {
  background-color: transparent;
  padding: 0;
  border-radius: 0;
  font-size: 0.9em;
}

/* 引用样式 */
.markdown-content blockquote {
  border-left: 4px solid #ddd;
  padding-left: 1em;
  margin: 1em 0;
  color: #666;
}

/* 表格样式 */
.markdown-content table {
  border-collapse: collapse;
  width: 100%;
  margin: 1em 0;
}

.markdown-content th, .markdown-content td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.markdown-content th {
  background-color: rgba(0, 0, 0, 0.05);
  font-weight: bold;
}

/* 水平线样式 */
.markdown-content hr {
  border: 0;
  border-top: 1px solid #e0e2e4;
  margin: 1em 0;
}

/* 链接样式 */
.markdown-content a {
  color: #0366d6;
  text-decoration: none;
}

.markdown-content a:hover {
  text-decoration: underline;
}

/* 图片样式 */
.markdown-content img {
  max-width: 100%;
  height: auto;
}

/* 适配暗色模式 */
.dark .markdown-content code,
.dark .markdown-content pre {
  background-color: rgba(255, 255, 255, 0.05);
}

.dark .markdown-content blockquote {
  border-left-color: #555;
  color: #aaa;
}

.dark .markdown-content th, .dark .markdown-content td {
  border-color: #555;
}

.dark .markdown-content th {
  background-color: rgba(255, 255, 255, 0.05);
}

.dark .markdown-content hr {
  border-top-color: rgba(255, 255, 255, 0.1);
}

.dark .markdown-content a {
  color: #58a6ff;
}
</style>
