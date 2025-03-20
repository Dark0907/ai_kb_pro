import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Home',
    redirect: '/chat/new'
  },
  {
    path: '/chat/new',
    name: 'NewChat',
    component: () => import('../views/NewChat.vue')
  },
  {
    path: '/chat/:id',
    name: 'Chat',
    component: () => import('../views/Chat.vue')
  },
  {
    path: '/knowledge-base-manager',
    name: 'KnowledgeBaseManager',
    component: () => import('../views/knowledge-base/KnowledgeBaseManager.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFound.vue')
  }
]

// 获取环境变量中的子目录配置
const baseUrl = import.meta.env.VITE_APP_WEB_PREFIX || '/KnowledgeBase'

const router = createRouter({
  // 使用子目录作为基础路径
  history: createWebHistory(baseUrl),
  routes
})

export default router 