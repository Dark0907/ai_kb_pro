<template>
  <div class="knowledge-base-manager h-full flex flex-col">
    <!-- 顶部标题栏 -->
    <div class="flex items-center justify-between h-16 bg-white p-4 border-b border-law-200 dark:border-law-700 dark:bg-law-800">
      <div class="flex items-center">
        <button 
          @click="goBack" 
          class="mr-3 p-1.5 rounded-full hover:bg-law-100 dark:hover:bg-law-700 transition-colors"
        >
          <svg class="w-5 h-5 text-law-600 dark:text-law-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"></path>
          </svg>
        </button>
        <h1 class="text-xl font-bold text-law-800 dark:text-white truncate">{{ $t('knowledge_base.manager_title') || '知识库管理' }}</h1>
      </div>
      
      <!-- 添加语言和主题切换 -->
      <div class="flex items-center space-x-2">
        <language-switcher />
        <theme-switcher />
      </div>
    </div>
    
    <!-- 主内容区域 -->
    <div class="flex flex-col md:flex-row flex-1 overflow-hidden">
      <!-- 移动端标签切换 -->
      <div class="md:hidden flex border-b border-law-200 dark:border-law-700 bg-white dark:bg-law-800">
        <button 
          @click="activeTab = 'kb'" 
          class="flex-1 py-3 px-4 text-center font-medium transition-colors"
          :class="activeTab === 'kb' ? 'text-accent border-b-2 border-accent' : 'text-law-600 dark:text-law-300'"
        >
          {{ $t('knowledge_base.knowledge_bases') || '知识库列表' }}
        </button>
        <button 
          @click="activeTab = 'doc'" 
          class="flex-1 py-3 px-4 text-center font-medium transition-colors"
          :class="activeTab === 'doc' ? 'text-accent border-b-2 border-accent' : 'text-law-600 dark:text-law-300'"
          :disabled="!selectedKb"
        >
          {{ $t('knowledge_base.documents') || '文档列表' }}
        </button>
      </div>
      
      <!-- 左侧知识库列表 -->
      <div 
        class="w-full md:w-64 border-b md:border-b-0 md:border-r border-law-200 dark:border-law-700 bg-law-50 dark:bg-law-800 overflow-y-auto"
        :class="{'hidden md:block': activeTab === 'doc', 'block': activeTab === 'kb' || !isMobile}"
      >
        <div class="p-4">
          <button 
            @click="showCreateKbModal = true" 
            class="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
          >
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>{{ $t('knowledge_base.create_new') || '新建知识库' }}</span>
          </button>
        </div>
        
        <div class="px-2 pb-4">
          <div 
            v-for="kb in knowledgeBaseList" 
            :key="kb.kb_id"
            @click="selectKnowledgeBase(kb)"
            class="flex items-center justify-between p-3 mb-1 rounded-lg cursor-pointer transition-colors"
            :class="selectedKb && selectedKb.kb_id === kb.kb_id ? 'bg-accent bg-opacity-10 text-accent' : 'hover:bg-law-100 dark:hover:bg-law-700 text-law-700 dark:text-law-300'"
          >
            <div class="flex items-center space-x-3">
              <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
              </svg>
              <span class="font-medium truncate">{{ kb.kb_name }}</span>
            </div>
            
            <div class="flex items-center">
              <button 
                @click.stop="showRenameKbModal(kb)" 
                class="p-1 rounded-full hover:bg-law-200 dark:hover:bg-law-600 transition-colors"
                title="重命名"
              >
                <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
              </button>
              <button 
                @click.stop="showDeleteKbModal(kb)" 
                class="p-1 rounded-full hover:bg-law-200 dark:hover:bg-law-600 transition-colors"
                title="删除"
              >
                <svg class="w-4 h-4 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                  <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧知识库详情 -->
      <div 
        class="flex-1 overflow-hidden flex flex-col"
        :class="{'hidden md:flex': activeTab === 'kb' && isMobile, 'flex': activeTab === 'doc' || !isMobile}"
      >
        <div v-if="!selectedKb" class="flex-1 flex items-center justify-center text-law-500 dark:text-law-400">
          <div class="text-center">
            <svg class="w-16 h-16 mx-auto mb-4 text-law-300 dark:text-law-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
            </svg>
            <p>{{ $t('knowledge_base.select_kb_tip') || '请选择一个知识库查看详情' }}</p>
          </div>
        </div>
        
        <div v-else class="flex-1 flex flex-col overflow-hidden">
          <!-- 右侧文档列表 -->
          <div class="flex-1 overflow-y-auto bg-white dark:bg-law-900">
            <div v-if="selectedKb" class="p-4">
              <div class="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
                <h2 class="text-lg font-semibold text-law-800 dark:text-white mb-2 md:mb-0">{{ selectedKb.kb_name }} - {{ $t('knowledge_base.documents') || '文档列表' }}</h2>
                <button 
                  @click="showUploadModal = true" 
                  class="flex items-center justify-center space-x-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
                >
                  <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span>{{ $t('knowledge_base.upload_document') || '上传文档' }}</span>
                </button>
              </div>
              
              <!-- 文档列表 - 表格形式（桌面端） -->
              <div class="hidden md:block overflow-x-auto">
                <table class="min-w-full divide-y divide-law-200 dark:divide-law-700">
                  <thead class="bg-law-50 dark:bg-law-800">
                    <tr>
                      <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-law-500 dark:text-law-400 uppercase tracking-wider">
                        {{ $t('knowledge_base.doc_id') || '文档ID' }}
                      </th>
                      <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-law-500 dark:text-law-400 uppercase tracking-wider">
                        {{ $t('knowledge_base.doc_name') || '文档名称' }}
                      </th>
                      <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-law-500 dark:text-law-400 uppercase tracking-wider">
                        {{ $t('knowledge_base.status') || '状态' }}
                      </th>
                      <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-law-500 dark:text-law-400 uppercase tracking-wider">
                        {{ $t('knowledge_base.file_size') || '文件大小' }}
                      </th>
                      <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-law-500 dark:text-law-400 uppercase tracking-wider">
                        {{ $t('knowledge_base.created_at') || '创建日期' }}
                      </th>
                      <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-law-500 dark:text-law-400 uppercase tracking-wider">
                        {{ $t('knowledge_base.remarks') || '备注' }}
                      </th>
                      <th scope="col" class="px-4 py-3 text-left text-xs font-medium text-law-500 dark:text-law-400 uppercase tracking-wider">
                        {{ $t('knowledge_base.actions') || '操作' }}
                      </th>
                    </tr>
                  </thead>
                  <tbody class="bg-white dark:bg-law-900 divide-y divide-law-200 dark:divide-law-700">
                    <tr v-for="doc in documents" :key="doc.doc_id" class="hover:bg-law-50 dark:hover:bg-law-800 transition-colors">
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-law-500 dark:text-law-400">
                        {{ doc.doc_id }}
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-law-800 dark:text-white">
                        {{ doc.doc_name }}
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm">
                        <span 
                          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          :class="{
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': doc.status === 'success',
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': doc.status === 'processing',
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': doc.status === 'failed'
                          }"
                        >
                          {{ 
                            doc.status === 'success' ? ($t('knowledge_base.status_success') || '已完成') : 
                            doc.status === 'processing' ? ($t('knowledge_base.status_processing') || '处理中') : 
                            ($t('knowledge_base.status_failed') || '失败') 
                          }}
                        </span>
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-law-500 dark:text-law-400">
                        {{ formatFileSize(doc.file_size) }}
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-law-500 dark:text-law-400">
                        {{ formatDate(doc.created_at) }}
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-law-500 dark:text-law-400">
                        {{ doc.remarks || '-' }}
                      </td>
                      <td class="px-4 py-3 whitespace-nowrap text-sm text-law-500 dark:text-law-400">
                        <div class="flex space-x-2">
                          <button 
                            @click="viewDocument(doc)" 
                            class="text-accent hover:text-accent-dark transition-colors"
                            :title="$t('knowledge_base.view') || '查看'"
                          >
                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                          </button>
                          <button 
                            @click="confirmDeleteDocument(doc)" 
                            class="text-red-500 hover:text-red-600 transition-colors"
                            :title="$t('knowledge_base.delete') || '删除'"
                          >
                            <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M3 6h18"></path>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              <line x1="10" y1="11" x2="10" y2="17"></line>
                              <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="documents.length === 0">
                      <td colspan="7" class="px-4 py-8 text-center text-law-500 dark:text-law-400">
                        {{ $t('knowledge_base.no_documents') || '暂无文档，请上传新文档' }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <!-- 文档列表 - 卡片形式（移动端） -->
              <div class="md:hidden">
                <div v-if="documents.length === 0" class="py-8 text-center text-law-500 dark:text-law-400">
                  {{ $t('knowledge_base.no_documents') || '暂无文档，请上传新文档' }}
                </div>
                <div v-else class="space-y-4">
                  <div 
                    v-for="doc in documents" 
                    :key="doc.doc_id"
                    class="bg-law-50 dark:bg-law-800 rounded-lg border border-law-200 dark:border-law-700 p-4"
                  >
                    <div class="flex justify-between items-start">
                      <div class="flex-1">
                        <h3 class="font-medium text-law-800 dark:text-white">{{ doc.doc_name }}</h3>
                        <div class="mt-2 space-y-1">
                          <p class="text-xs text-law-500 dark:text-law-400 flex items-center">
                            <span class="font-medium mr-2">ID:</span> {{ doc.doc_id }}
                          </p>
                          <p class="text-xs text-law-500 dark:text-law-400 flex items-center">
                            <span class="font-medium mr-2">{{ $t('knowledge_base.status') || '状态' }}:</span>
                            <span 
                              class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                              :class="{
                                'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': doc.status === 'success',
                                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': doc.status === 'processing',
                                'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': doc.status === 'failed'
                              }"
                            >
                              {{ 
                                doc.status === 'success' ? ($t('knowledge_base.status_success') || '已完成') : 
                                doc.status === 'processing' ? ($t('knowledge_base.status_processing') || '处理中') : 
                                ($t('knowledge_base.status_failed') || '失败') 
                              }}
                            </span>
                          </p>
                          <p class="text-xs text-law-500 dark:text-law-400 flex items-center">
                            <span class="font-medium mr-2">{{ $t('knowledge_base.file_size') || '文件大小' }}:</span> {{ formatFileSize(doc.file_size) }}
                          </p>
                          <p class="text-xs text-law-500 dark:text-law-400 flex items-center">
                            <span class="font-medium mr-2">{{ $t('knowledge_base.created_at') || '创建日期' }}:</span> {{ formatDate(doc.created_at) }}
                          </p>
                          <p class="text-xs text-law-500 dark:text-law-400 flex items-center">
                            <span class="font-medium mr-2">{{ $t('knowledge_base.remarks') || '备注' }}:</span> {{ doc.remarks || '-' }}
                          </p>
                        </div>
                      </div>
                      <div class="flex space-x-2">
                        <button 
                          @click="viewDocument(doc)" 
                          class="text-accent hover:text-accent-dark transition-colors"
                          :title="$t('knowledge_base.view') || '查看'"
                        >
                          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                        </button>
                        <button 
                          @click="confirmDeleteDocument(doc)" 
                          class="text-red-500 hover:text-red-600 transition-colors"
                          :title="$t('knowledge_base.delete') || '删除'"
                        >
                          <svg class="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            <line x1="10" y1="11" x2="10" y2="17"></line>
                            <line x1="14" y1="11" x2="14" y2="17"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="flex items-center justify-center h-full">
              <div class="text-center text-law-500 dark:text-law-400">
                <svg class="w-16 h-16 mx-auto mb-4 text-law-300 dark:text-law-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                </svg>
                <p>{{ $t('knowledge_base.select_kb_tip') || '请选择一个知识库' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 新建知识库模态框 -->
    <div v-if="showCreateKbModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white dark:bg-law-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div class="p-5 border-b border-law-200 dark:border-law-700">
          <h3 class="text-lg font-semibold text-law-800 dark:text-white">{{ $t('knowledge_base.create_new') || '新建知识库' }}</h3>
        </div>
        <div class="p-5">
          <div class="mb-4">
            <label class="block text-sm font-medium text-law-700 dark:text-law-300 mb-1">{{ $t('knowledge_base.kb_name') || '知识库名称' }}</label>
            <input 
              v-model="newKbName" 
              type="text" 
              class="w-full px-3 py-2 border border-law-300 dark:border-law-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent dark:bg-law-700 dark:text-white"
              :placeholder="$t('knowledge_base.enter_kb_name') || '请输入知识库名称'"
            />
          </div>
        </div>
        <div class="p-4 flex justify-end space-x-3 border-t border-law-200 dark:border-law-700">
          <button 
            @click="showCreateKbModal = false" 
            class="px-4 py-2 text-law-700 dark:text-law-300 hover:bg-law-100 dark:hover:bg-law-700 rounded-md transition-colors"
          >
            {{ $t('common.cancel') || '取消' }}
          </button>
          <button 
            @click="createKnowledgeBase" 
            class="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors"
            :disabled="!newKbName.trim()"
          >
            {{ $t('common.confirm') || '确认' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 重命名知识库模态框 -->
    <div v-if="showRenameModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white dark:bg-law-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div class="p-5 border-b border-law-200 dark:border-law-700">
          <h3 class="text-lg font-semibold text-law-800 dark:text-white">{{ $t('knowledge_base.rename_kb') || '重命名知识库' }}</h3>
        </div>
        <div class="p-5">
          <div class="mb-4">
            <label class="block text-sm font-medium text-law-700 dark:text-law-300 mb-1">{{ $t('knowledge_base.kb_name') || '知识库名称' }}</label>
            <input 
              v-model="renameKbName" 
              type="text" 
              class="w-full px-3 py-2 border border-law-300 dark:border-law-600 rounded-md focus:outline-none focus:ring-2 focus:ring-accent dark:bg-law-700 dark:text-white"
              :placeholder="$t('knowledge_base.enter_kb_name') || '请输入知识库名称'"
            />
          </div>
        </div>
        <div class="p-4 flex justify-end space-x-3 border-t border-law-200 dark:border-law-700">
          <button 
            @click="showRenameModal = false" 
            class="px-4 py-2 text-law-700 dark:text-law-300 hover:bg-law-100 dark:hover:bg-law-700 rounded-md transition-colors"
          >
            {{ $t('common.cancel') || '取消' }}
          </button>
          <button 
            @click="renameKnowledgeBase" 
            class="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors"
            :disabled="!renameKbName.trim()"
          >
            {{ $t('common.confirm') || '确认' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 删除知识库确认模态框 -->
    <div v-if="showDeleteKbConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white dark:bg-law-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div class="p-5 border-b border-law-200 dark:border-law-700">
          <h3 class="text-lg font-semibold text-law-800 dark:text-white">{{ $t('knowledge_base.delete_kb') || '删除知识库' }}</h3>
        </div>
        <div class="p-5">
          <p class="text-law-700 dark:text-law-300">{{ $t('knowledge_base.delete_kb_confirm', { name: kbToDelete?.kb_name }) || `确定要删除知识库 "${kbToDelete?.kb_name}" 吗？此操作不可恢复。` }}</p>
        </div>
        <div class="p-4 flex justify-end space-x-3 border-t border-law-200 dark:border-law-700">
          <button 
            @click="showDeleteKbConfirm = false" 
            class="px-4 py-2 text-law-700 dark:text-law-300 hover:bg-law-100 dark:hover:bg-law-700 rounded-md transition-colors"
          >
            {{ $t('common.cancel') || '取消' }}
          </button>
          <button 
            @click="deleteKnowledgeBase" 
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            {{ $t('common.delete') || '删除' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 删除文档确认模态框 -->
    <div v-if="showDeleteDocConfirm" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white dark:bg-law-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div class="p-5 border-b border-law-200 dark:border-law-700">
          <h3 class="text-lg font-semibold text-law-800 dark:text-white">{{ $t('knowledge_base.delete_document') || '删除文档' }}</h3>
        </div>
        <div class="p-5">
          <p class="text-law-700 dark:text-law-300">{{ $t('knowledge_base.delete_document_confirm', { name: docToDelete?.doc_name }) || `确定要删除文档 "${docToDelete?.doc_name}" 吗？此操作不可恢复。` }}</p>
        </div>
        <div class="p-4 flex justify-end space-x-3 border-t border-law-200 dark:border-law-700">
          <button 
            @click="showDeleteDocConfirm = false" 
            class="px-4 py-2 text-law-700 dark:text-law-300 hover:bg-law-100 dark:hover:bg-law-700 rounded-md transition-colors"
          >
            {{ $t('common.cancel') || '取消' }}
          </button>
          <button 
            @click="deleteDocument" 
            class="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            {{ $t('common.delete') || '删除' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 上传文档模态框 -->
    <div v-if="showUploadModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white dark:bg-law-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        <div class="p-5 border-b border-law-200 dark:border-law-700">
          <h3 class="text-lg font-semibold text-law-800 dark:text-white">{{ $t('knowledge_base.upload_document') || '上传文档' }}</h3>
        </div>
        <div class="p-5">
          <div class="mb-4">
            <label class="block text-sm font-medium text-law-700 dark:text-law-300 mb-2">{{ $t('knowledge_base.select_kb') || '选择知识库' }}</label>
            <select class="w-full px-3 py-2 border border-law-300 dark:border-law-600 rounded-md bg-white dark:bg-law-700 text-law-700 dark:text-law-300 focus:outline-none focus:ring-2 focus:ring-accent">
              <option v-for="kb in knowledgeBaseList" :key="kb.kb_id" :value="kb.kb_id" :selected="selectedKb && kb.kb_id === selectedKb.kb_id">
                {{ kb.kb_name }}
              </option>
            </select>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-law-700 dark:text-law-300 mb-2">{{ $t('knowledge_base.upload_file') || '上传文件' }}</label>
            <div class="border-2 border-dashed border-law-300 dark:border-law-600 rounded-md p-6 text-center">
              <svg class="w-12 h-12 mx-auto text-law-400 dark:text-law-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <p class="mt-2 text-sm text-law-600 dark:text-law-400">{{ $t('knowledge_base.drag_drop') || '拖拽文件到此处或' }}</p>
              <button class="mt-2 px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors">
                {{ $t('knowledge_base.browse_files') || '浏览文件' }}
              </button>
              <p class="mt-2 text-xs text-law-500 dark:text-law-400">{{ $t('knowledge_base.supported_formats') || '支持的格式: PDF, DOCX, TXT, MD' }}</p>
            </div>
          </div>
          <div class="mb-4">
            <label class="block text-sm font-medium text-law-700 dark:text-law-300 mb-2">{{ $t('knowledge_base.remarks') || '备注' }}</label>
            <textarea class="w-full px-3 py-2 border border-law-300 dark:border-law-600 rounded-md bg-white dark:bg-law-700 text-law-700 dark:text-law-300 focus:outline-none focus:ring-2 focus:ring-accent" rows="3" placeholder="添加备注信息（可选）"></textarea>
          </div>
        </div>
        <div class="p-4 flex justify-end space-x-3 border-t border-law-200 dark:border-law-700">
          <button 
            @click="showUploadModal = false" 
            class="px-4 py-2 text-law-700 dark:text-law-300 hover:bg-law-100 dark:hover:bg-law-700 rounded-md transition-colors"
          >
            {{ $t('common.cancel') || '取消' }}
          </button>
          <button 
            @click="uploadDocument" 
            class="px-4 py-2 bg-accent text-white rounded-md hover:bg-accent-dark transition-colors"
          >
            {{ $t('knowledge_base.upload') || '上传' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useKnowledgeBase } from '@/stores/useKnowledgeBase';
import { storeToRefs } from 'pinia';
import LanguageSwitcher from '../../components/layout/LanguageSwitcher.vue'
import ThemeSwitcher from '../../components/layout/ThemeSwitcher.vue'

const router = useRouter();
const route = useRoute();
const knowledgeBaseStore = useKnowledgeBase();
const { knowledgeBaseList } = storeToRefs(knowledgeBaseStore);

// 状态
const selectedKb = ref(null);
const documents = ref([]);
const showCreateKbModal = ref(false);
const showRenameModal = ref(false);
const showDeleteKbConfirm = ref(false);
const showDeleteDocConfirm = ref(false);
const showUploadModal = ref(false);
const newKbName = ref('');
const renameKbName = ref('');
const kbToDelete = ref(null);
const kbToRename = ref(null);
const docToDelete = ref(null);
const activeTab = ref('kb'); // 移动端标签切换状态：'kb' 或 'doc'
const isMobile = ref(false); // 是否为移动设备

// 检测设备类型
const checkDeviceType = () => {
  isMobile.value = window.innerWidth < 768;
};

// 初始化
onMounted(() => {
  // 检测设备类型
  checkDeviceType();
  window.addEventListener('resize', checkDeviceType);
  
  knowledgeBaseStore.getList().then(() => {
    // 自动选择第一个知识库
    if (knowledgeBaseList.value && knowledgeBaseList.value.length > 0) {
      selectKnowledgeBase(knowledgeBaseList.value[0]);
    }
  });
});

// 在组件销毁时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', checkDeviceType);
});

// 修改返回函数，优先返回到之前的对话页面
const goBack = () => {
  // 如果是从聊天页面跳转过来的，则返回到那个聊天页面
  if (router.options.history.state.back && router.options.history.state.back.includes('/chat/')) {
    router.back()
  } else {
    // 否则返回首页
    router.push('/')
  }
}

// 选择知识库
const selectKnowledgeBase = (kb) => {
  selectedKb.value = kb;
  // 模拟获取文档列表
  fetchDocuments(kb.kb_id);
  
  // 在移动端选择知识库后自动切换到文档标签
  if (isMobile.value) {
    activeTab.value = 'doc';
  }
};

// 获取文档列表
const fetchDocuments = (kbId) => {
  // 这里应该调用API获取文档列表
  // 模拟数据
  documents.value = [
    { doc_id: 1, doc_name: '专利优先审查指南.pdf', created_at: '2025-03-12', file_size: 1024 * 1024 * 2.5, status: 'success' },
    { doc_id: 2, doc_name: '商标注册申请指南.docx', created_at: '2025-03-11', file_size: 1024 * 512, status: 'success' },
    { doc_id: 3, doc_name: '著作权登记流程.pdf', created_at: '2025-03-10', file_size: 1024 * 1024 * 1.2, status: 'processing' }
  ];
};

// 创建知识库
const createKnowledgeBase = () => {
  if (!newKbName.value.trim()) return;
  
  // 这里应该调用API创建知识库
  // 模拟创建
  const newKb = {
    kb_id: Date.now().toString(),
    kb_name: newKbName.value.trim(),
    type: 'local'
  };
  
  knowledgeBaseList.value.push(newKb);
  showCreateKbModal.value = false;
  newKbName.value = '';
  
  // 选择新创建的知识库
  selectKnowledgeBase(newKb);
};

// 显示重命名模态框
const showRenameKbModal = (kb) => {
  kbToRename.value = kb;
  renameKbName.value = kb.kb_name;
  showRenameModal.value = true;
};

// 重命名知识库
const renameKnowledgeBase = () => {
  if (!renameKbName.value.trim() || !kbToRename.value) return;
  
  // 这里应该调用API重命名知识库
  // 模拟重命名
  const index = knowledgeBaseList.value.findIndex(kb => kb.kb_id === kbToRename.value.kb_id);
  if (index !== -1) {
    knowledgeBaseList.value[index].kb_name = renameKbName.value.trim();
    
    // 如果当前选中的是被重命名的知识库，更新选中的知识库
    if (selectedKb.value && selectedKb.value.kb_id === kbToRename.value.kb_id) {
      selectedKb.value = { ...knowledgeBaseList.value[index] };
    }
  }
  
  showRenameModal.value = false;
  kbToRename.value = null;
  renameKbName.value = '';
};

// 显示删除知识库确认框
const showDeleteKbModal = (kb) => {
  kbToDelete.value = kb;
  showDeleteKbConfirm.value = true;
};

// 删除知识库
const deleteKnowledgeBase = () => {
  if (!kbToDelete.value) return;
  
  // 这里应该调用API删除知识库
  // 模拟删除
  const index = knowledgeBaseList.value.findIndex(kb => kb.kb_id === kbToDelete.value.kb_id);
  if (index !== -1) {
    knowledgeBaseList.value.splice(index, 1);
    
    // 如果当前选中的是被删除的知识库，清空选中状态
    if (selectedKb.value && selectedKb.value.kb_id === kbToDelete.value.kb_id) {
      selectedKb.value = null;
      documents.value = [];
    }
  }
  
  showDeleteKbConfirm.value = false;
  kbToDelete.value = null;
};

// 查看文档
const viewDocument = (doc) => {
  // 这里应该实现查看文档的逻辑
  // 可以打开一个新窗口或者模态框显示文档内容
  console.log('查看文档', doc);
  alert(`查看文档: ${doc.doc_name}`);
};

// 确认删除文档
const confirmDeleteDocument = (doc) => {
  docToDelete.value = doc;
  showDeleteDocConfirm.value = true;
};

// 删除文档
const deleteDocument = () => {
  if (!docToDelete.value) return;
  
  // 这里应该调用API删除文档
  // 模拟删除
  const index = documents.value.findIndex(doc => doc.doc_id === docToDelete.value.doc_id);
  if (index !== -1) {
    documents.value.splice(index, 1);
  }
  
  showDeleteDocConfirm.value = false;
  docToDelete.value = null;
};

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

// 上传文档
const uploadDocument = () => {
  // 这里应该实现上传文档的逻辑
  // 模拟上传成功
  showUploadModal.value = false;
  
  // 模拟添加一个新文档
  const newDoc = {
    doc_id: Date.now(),
    doc_name: '新上传文档.pdf',
    created_at: new Date().toISOString().split('T')[0],
    file_size: 1024 * 1024 * 1.5,
    status: 'processing',
    remarks: '用户上传的文档'
  };
  
  documents.value.unshift(newDoc);
  
  // 显示上传成功提示
  alert('文档上传成功，正在处理中...');
};
</script>

<style scoped>
/* 可以添加特定的样式 */
</style> 