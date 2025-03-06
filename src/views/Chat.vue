<template>
  <div class="h-full">
    <chat-window 
      :chat-id="chatId"
      @toggle-reference="toggleReference"
    />
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import { useRoute } from 'vue-router'
import ChatWindow from '../components/chat/ChatWindow.vue'

const route = useRoute()
const appLayout = inject('appLayout')

// 获取聊天ID
const chatId = computed(() => route.params.id)

// 切换引用面板
const toggleReference = () => {
  if (appLayout && appLayout.toggleReference) {
    appLayout.toggleReference()
  }
}
</script>
