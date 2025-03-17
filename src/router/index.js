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

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 