<script setup>
import { ref, provide, onMounted } from 'vue'
import AppLayout from './components/layout/AppLayout.vue'
import { useChatStore } from './stores/chat'
import { useSettingsStore } from './stores/settings'

const appLayoutRef = ref(null)
const chatStore = useChatStore()
const settingsStore = useSettingsStore()

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
})
</script>

<template>
  <app-layout ref="appLayoutRef" />
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
