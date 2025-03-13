<script setup>
import { ref, provide, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from './components/layout/AppLayout.vue'
import { useChatStore } from './stores/chat'
import { useSettingsStore } from './stores/settings'
import { useKnowledgeBase } from './stores/useKnowledgeBase'

const appLayoutRef = ref(null)
const chatStore = useChatStore()
const settingsStore = useSettingsStore()
const knowledgeBaseStore = useKnowledgeBase()
const route = useRoute()

// 计算当前路由是否需要使用常规布局
const useAppLayout = computed(() => {
  // 知识库管理页面不使用常规布局
  return route.name !== 'KnowledgeBaseManager'
})

// 提供布局组件给子组件
provide('appLayout', {
  toggleReference: () => {
    if (appLayoutRef.value) {
      appLayoutRef.value.toggleReference()
    }
  }
})

// 初始化获取聊天历史和设置主题
onMounted(async () => {
  await chatStore.fetchChatHistory()
  settingsStore.initTheme()
  
  // 预加载知识库数据
  await knowledgeBaseStore.getList()
})
</script>

<template>
  <!-- 根据路由决定是否使用常规布局 -->
  <app-layout v-if="useAppLayout" ref="appLayoutRef" />
  <router-view v-else />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
