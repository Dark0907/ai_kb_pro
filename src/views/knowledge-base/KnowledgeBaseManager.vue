<template>
  <div class="knowledge-base-manager h-screen flex flex-col">
    <!-- 顶部标题栏 -->
    <div class="flex items-center justify-between h-16 flex-shrink-0 bg-white p-4 border-b border-law-200 dark:border-law-700 dark:bg-law-800">
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
        <language-switcher class="hidden md:block" />
        <theme-switcher />
      </div>
    </div>
    
    <!-- 主内容区域 - 移除固定高度，使用flex布局自动填充剩余空间 -->
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
      
      <!-- 左侧知识库列表 - 移除固定高度计算，使用flex布局 -->
      <div 
        class="w-full md:w-64 border-b md:border-b-0 md:border-r border-law-200 dark:border-law-700 bg-law-50 dark:bg-law-800 overflow-y-auto flex-shrink-0"
        :class="{'hidden md:block': activeTab === 'doc', 'block': activeTab === 'kb' || !isMobile}"
      >
        <div class="p-3 flex items-center space-x-2">
          <button 
            v-if="!isSearchActive"
            @click="showCreateKbModal = true" 
            class="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent-dark transition-colors"
          >
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>{{ $t('knowledge_base.create_new') || '新建知识库' }}</span>
          </button>
          
          <!-- 搜索图标按钮 -->
          <button 
            @click="toggleSearch" 
            class="p-2 bg-law-100 dark:bg-law-700 text-law-900 dark:text-law-100 rounded-md hover:bg-law-200 dark:hover:bg-law-600 transition-all duration-200"
            :class="{ 'hidden': isSearchActive }"
          >
            <span class="text-lg">🔍</span>
          </button>
          
          <!-- 搜索框 -->
          <div 
            v-if="isSearchActive" 
            class="flex-1 relative animate-slide-in"
          >
            <input 
              v-model="searchQuery"
              type="text"
              :placeholder="$t('knowledge_base.search_kb') || '搜索知识库'"
              class="w-full pl-10 pr-4 py-2 bg-law-100 dark:bg-law-700 text-law-900 dark:text-law-100 rounded-md focus:outline-none focus:ring-2 focus:ring-accent border border-law-200 dark:border-law-600"
              @blur="onSearchBlur"
              ref="searchInput"
            />
            <span class="absolute left-3 top-2.5 text-lg">🔍</span>
          </div>
        </div>
        
        <div class="px-2 pb-4">
          <div 
            v-for="kb in filteredKnowledgeBaseList" 
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
      
      <!-- 右侧知识库详情 - 完全重构这部分布局 -->
      <div 
        class="flex-1 flex flex-col overflow-hidden"
        :class="{'hidden md:flex': activeTab === 'kb' && isMobile, 'flex': activeTab === 'doc' || !isMobile}"
      >
        <!-- 无选中知识库时的提示 -->
        <div v-if="!selectedKb" class="flex-1 flex items-center justify-center text-law-500 dark:text-law-400">
          <div class="text-center">
            <svg class="w-16 h-16 mx-auto mb-4 text-law-300 dark:text-law-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
            </svg>
            <p>{{ $t('knowledge_base.select_kb_tip') || '请选择一个知识库查看详情' }}</p>
          </div>
        </div>
        
        <!-- 有选中知识库时的详情区域 -->
        <div v-else class="flex-1 flex flex-col overflow-hidden">
          <!-- 头部信息区域 - 固定不滚动 -->
          <div class="flex-shrink-0 p-4 border-b border-law-200 dark:border-law-700 bg-white dark:bg-law-900">
            <div class="flex flex-col md:flex-row md:justify-between md:items-center">
              <div class="flex items-center">
                <h2 class="text-lg font-semibold text-law-800 dark:text-white mb-2 md:mb-0">
                  {{ selectedKb.kb_name }}
                </h2>
                <span class="text-sm text-law-500 dark:text-law-400 ml-2 mb-2 md:mb-0">{{ $t('knowledge_base.document_count', { count: documents.length }) || `共 ${documents.length} 个文档` }}</span>
              </div>
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
          </div>
          
          <!-- PC端表格区域 - 自适应剩余空间并滚动 -->
          <div class="hidden md:flex md:flex-col flex-1 overflow-hidden">
            <!-- 表格头部 - 固定不滚动 -->
            <div class="flex-shrink-0 bg-law-50 dark:bg-law-800">
              <table class="min-w-full divide-y divide-law-200 dark:divide-law-700">
                <thead>
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
                      {{ $t('knowledge_base.actions') || '操作' }}
                    </th>
                  </tr>
                </thead>
              </table>
            </div>
            
            <!-- 表格内容区域 - 自适应剩余空间并滚动 -->
            <div class="flex-1 overflow-y-auto bg-white dark:bg-law-900">
              <table class="min-w-full divide-y divide-law-200 dark:divide-law-700">
                <tbody class="divide-y divide-law-200 dark:divide-law-700">
                  <tr v-for="(doc, index) in paginatedDocuments" :key="doc.file_id" class="hover:bg-law-50 dark:hover:bg-law-800 transition-colors">
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-law-500 dark:text-law-400">
                      {{ totalItems - ((currentPage - 1) * pageSize) - index }}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-law-800 dark:text-white">
                      {{ doc.file_name }}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm">
                      <span 
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        :class="{
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': doc.status === 'green',
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': doc.status === 'yellow',
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': doc.status === 'red'
                        }"
                      >
                        {{ 
                          doc.status === 'green' ? ($t('knowledge_base.status_success') || '已完成') : 
                          doc.status === 'yellow' ? ($t('knowledge_base.status_processing') || '处理中') : 
                          ($t('knowledge_base.status_failed') || '失败') 
                        }}
                      </span>
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-law-500 dark:text-law-400">
                      {{ formatFileSize(doc.bytes) }}
                    </td>
                    <td class="px-4 py-3 whitespace-nowrap text-sm text-law-500 dark:text-law-400">
                      {{ formatDate(doc.timestamp) }}
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
                    <td colspan="6" class="px-4 py-8 text-center text-law-500 dark:text-law-400">
                      {{ $t('knowledge_base.no_documents') || '暂无文档，请上传新文档' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <!-- 分页导航（桌面端） - 固定在底部 -->
            <div v-if="documents.length > 0" class="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-white dark:bg-law-900 border-t border-law-200 dark:border-law-700">
              <div class="flex items-center text-sm text-law-700 dark:text-law-300">
                {{ $t('knowledge_base.showing') || '显示' }} {{ (currentPage - 1) * pageSize + 1 }}-{{ Math.min(currentPage * pageSize, totalItems) }} {{ $t('knowledge_base.of') || '共' }} {{ totalItems }} {{ $t('knowledge_base.items') || '条' }}
              </div>
              
              <div class="flex items-center space-x-2">
                <!-- 上一页 -->
                <button 
                  @click="changePage(currentPage - 1)" 
                  :disabled="currentPage === 1"
                  class="px-3 py-1 rounded-md border border-law-200 dark:border-law-700 bg-white dark:bg-law-800 text-law-700 dark:text-law-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ $t('knowledge_base.previous') || '上一页' }}
                </button>
                
                <!-- 页码 -->
                <div class="flex items-center space-x-1">
                  <!-- 第一页 -->
                  <button 
                    v-if="currentPage > 3" 
                    @click="changePage(1)"
                    class="w-8 h-8 flex items-center justify-center rounded-md border border-law-200 dark:border-law-700 bg-white dark:bg-law-800 text-law-700 dark:text-law-300"
                  >
                    1
                  </button>
                  
                  <!-- 省略号 -->
                  <span v-if="currentPage > 3" class="text-law-500 dark:text-law-400">...</span>
                  
                  <!-- 当前页前一页 -->
                  <button 
                    v-if="currentPage > 1" 
                    @click="changePage(currentPage - 1)"
                    class="w-8 h-8 flex items-center justify-center rounded-md border border-law-200 dark:border-law-700 bg-white dark:bg-law-800 text-law-700 dark:text-law-300"
                  >
                    {{ currentPage - 1 }}
                  </button>
                  
                  <!-- 当前页 -->
                  <button 
                    class="w-8 h-8 flex items-center justify-center rounded-md border border-accent bg-accent text-white"
                  >
                    {{ currentPage }}
                  </button>
                  
                  <!-- 当前页后一页 -->
                  <button 
                    v-if="currentPage < totalPages" 
                    @click="changePage(currentPage + 1)"
                    class="w-8 h-8 flex items-center justify-center rounded-md border border-law-200 dark:border-law-700 bg-white dark:bg-law-800 text-law-700 dark:text-law-300"
                  >
                    {{ currentPage + 1 }}
                  </button>
                  
                  <!-- 省略号 -->
                  <span v-if="currentPage < totalPages - 2" class="text-law-500 dark:text-law-400">...</span>
                  
                  <!-- 最后一页 -->
                  <button 
                    v-if="currentPage < totalPages - 2" 
                    @click="changePage(totalPages)"
                    class="w-8 h-8 flex items-center justify-center rounded-md border border-law-200 dark:border-law-700 bg-white dark:bg-law-800 text-law-700 dark:text-law-300"
                  >
                    {{ totalPages }}
                  </button>
                </div>
                
                <!-- 下一页 -->
                <button 
                  @click="changePage(currentPage + 1)" 
                  :disabled="currentPage === totalPages"
                  class="px-3 py-1 rounded-md border border-law-200 dark:border-law-700 bg-white dark:bg-law-800 text-law-700 dark:text-law-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ $t('knowledge_base.next') || '下一页' }}
                </button>
                
                <!-- 跳转到指定页 -->
                <div class="flex items-center space-x-1">
                  <span class="text-sm text-law-700 dark:text-law-300">{{ $t('knowledge_base.go_to') || '跳转到' }}</span>
                  <input 
                    type="number" 
                    min="1" 
                    :max="totalPages" 
                    v-model="currentPage"
                    class="w-16 px-2 py-1 rounded-md border border-law-200 dark:border-law-700 bg-white dark:bg-law-800 text-law-700 dark:text-law-300 text-center"
                    @keyup.enter="goToPage"
                  />
                  <span class="text-sm text-law-700 dark:text-law-300">{{ $t('knowledge_base.page') || '页' }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 移动端文档列表 - 自适应高度 -->
          <div class="md:hidden mobile-document-container flex-1 overflow-y-auto">
            <div v-if="documents.length === 0" class="py-8 text-center text-law-500 dark:text-law-400">
              {{ $t('knowledge_base.no_documents') || '暂无文档，请上传新文档' }}
            </div>
            <div v-else class="space-y-4">
              <div 
                v-for="(doc, index) in paginatedDocuments" 
                :key="doc.file_id"
                class="bg-law-50 dark:bg-law-800 rounded-lg border border-law-200 dark:border-law-700 p-4"
              >
                <div class="flex justify-between items-start">
                  <div class="flex-1">
                    <h3 class="font-medium text-law-800 dark:text-white">{{ doc.file_name }}</h3>
                    <div class="mt-2 space-y-1">
                      <p class="text-xs text-law-500 dark:text-law-400 flex items-center">
                        <span class="font-medium mr-2">ID:</span> {{ totalItems - ((currentPage - 1) * pageSize) - index }}
                      </p>
                      <p class="text-xs text-law-500 dark:text-law-400 flex items-center">
                        <span class="font-medium mr-2">{{ $t('knowledge_base.status') || '状态' }}:</span>
                        <span 
                          class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                          :class="{
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200': doc.status === 'green',
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200': doc.status === 'yellow',
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200': doc.status === 'red'
                          }"
                        >
                          {{ 
                            doc.status === 'green' ? ($t('knowledge_base.status_success') || '已完成') : 
                            doc.status === 'yellow' ? ($t('knowledge_base.status_processing') || '处理中') : 
                            ($t('knowledge_base.status_failed') || '失败') 
                          }}
                        </span>
                      </p>
                      <p class="text-xs text-law-500 dark:text-law-400 flex items-center">
                        <span class="font-medium mr-2">{{ $t('knowledge_base.file_size') || '文件大小' }}:</span> {{ formatFileSize(doc.bytes) }}
                      </p>
                      <p class="text-xs text-law-500 dark:text-law-400 flex items-center">
                        <span class="font-medium mr-2">{{ $t('knowledge_base.created_at') || '创建日期' }}:</span> {{ formatDate(doc.timestamp) }}
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
          <p class="text-law-700 dark:text-law-300">{{ $t('knowledge_base.delete_document_confirm', { name: docToDelete?.file_name }) || `确定要删除文档 "${docToDelete?.file_name}" 吗？此操作不可恢复。` }}</p>
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

    <!-- 文档详情模态框 -->
    <reference-modal
      v-if="showModal"
      :isVisible="showModal" 
      :referenceId="activeReferenceId"
      :referenceTitle="activeReferenceTitle"
      :referenceSection="activeReferenceSection"
      @close="closeActiveReference"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useKnowledgeBase } from '@/stores/useKnowledgeBase';
import { storeToRefs } from 'pinia';
import LanguageSwitcher from '../../components/layout/LanguageSwitcher.vue'
import ThemeSwitcher from '../../components/layout/ThemeSwitcher.vue'
import ReferenceModal from '../../components/reference/ReferenceModal.vue'
import urlRequest from '@/services/urlConfig'
import ipsResquest from '@/services/ipsConfig'


const router = useRouter();
const route = useRoute();
const knowledgeBaseStore = useKnowledgeBase();
const { knowledgeBaseList, hasLoadedData } = storeToRefs(knowledgeBaseStore);

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
const isSearchActive = ref(false);
const searchQuery = ref('');
const searchInput = ref(null);
const showModal = ref(false)
const activeReferenceId = ref('')
const activeReferenceTitle = ref('')
const activeReferenceSection = ref('')

// 分页相关
const pageSize = ref(15); // 每页显示15条
const currentPage = ref(1);
const totalItems = ref(0); // 修改为总条数
const totalPages = ref(0); // 修改为总页数

// 移动端滚动加载
const mobileLoadedItems = ref(15); // 移动端初始加载10条
const isLoadingMore = ref(false);
const mobilePage = ref(1); // 添加移动端专用的页码计数器

// 计算当前页显示的文档
const paginatedDocuments = computed(() => {
  if (isMobile.value) {
    // 移动端滚动加载
    return documents.value.slice(0, mobileLoadedItems.value);
  } else {
    // PC端分页 - 当使用API分页时直接返回documents
    return documents.value;
  }
});

// 监听滚动事件（移动端）
const handleScroll = (event) => {
  if (!isMobile.value) return;
  
  const documentContainer = document.querySelector('.mobile-document-container');
  if (!documentContainer) return;
  
  const { scrollTop, scrollHeight, clientHeight } = documentContainer;
  
  // 当滚动到距离底部50px时加载更多
  if (scrollHeight - scrollTop - clientHeight < 50 && !isLoadingMore.value && mobileLoadedItems.value < documents.value.length) {
    loadMoreDocuments();
  }
};

// 加载更多文档（移动端）
const loadMoreDocuments = async () => {
  if (isLoadingMore.value || mobileLoadedItems.value >= totalItems.value) return;
  
  isLoadingMore.value = true;
  console.log('加载更多文档，当前已加载:', mobileLoadedItems.value);
  
  try {
    // 使用移动端专用页码，递增页码
    mobilePage.value += 1;
    
    // 调用API获取下一页数据
    const response = await urlRequest.fileList({
      kb_id: selectedKb.value.kb_id,
      page: mobilePage.value,
      page_size: pageSize.value
    });
    
    if (response && response.data && response.data.details) {
      // 将新数据追加到现有数据
      documents.value = [...documents.value, ...response.data.details];
      // 更新已加载条数
      mobileLoadedItems.value = Math.min(mobileLoadedItems.value + response.data.details.length, totalItems.value);
    }
  } catch (error) {
    console.error('加载更多文档失败:', error);
  } finally {
    isLoadingMore.value = false;
  }
};

// 切换页码，更新为调用API获取数据
const changePage = (page) => {
  currentPage.value = page;
  // 重新获取当前页的数据
  fetchDocuments(selectedKb.value.kb_id);
};

// 跳转到指定页
const goToPage = (event) => {
  const page = parseInt(event.target.value);
  if (page && page > 0 && page <= totalPages.value) {
    currentPage.value = page;
    // 重新获取当前页的数据
    fetchDocuments(selectedKb.value.kb_id);
  }
};

// 重置分页状态
const resetPagination = () => {
  currentPage.value = 1;
  mobileLoadedItems.value = 10;
};

// 检测设备类型
const checkDeviceType = () => {
  isMobile.value = window.innerWidth < 768;
};

// 初始化
onMounted(() => {
  // 检测设备类型
  checkDeviceType();
  window.addEventListener('resize', checkDeviceType);
  
  // 延迟添加滚动事件监听（移动端），确保DOM已经渲染
  setTimeout(() => {
    const documentContainer = document.querySelector('.mobile-document-container');
    if (documentContainer) {
      documentContainer.addEventListener('scroll', handleScroll);
      console.log('已添加滚动事件监听');
    }
  }, 500);
  
  // 只有当知识库列表为空或未加载过数据时才获取列表
  if (!hasLoadedData.value || !knowledgeBaseList.value || knowledgeBaseList.value.length === 0) {
    knowledgeBaseStore.getList().then(() => {
      // 自动选择第一个知识库
      if (knowledgeBaseList.value && knowledgeBaseList.value.length > 0) {
        filteredKnowledgeBaseList.value = [...knowledgeBaseList.value];
        selectKnowledgeBase(knowledgeBaseList.value[0]);
      }
    });
  } else if (knowledgeBaseList.value && knowledgeBaseList.value.length > 0) {
    // 如果已有知识库列表数据，直接选择第一个
    filteredKnowledgeBaseList.value = [...knowledgeBaseList.value];
    selectKnowledgeBase(knowledgeBaseList.value[0]);
  }
});

// 在组件销毁时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', checkDeviceType);
  
  // 移除滚动事件监听（移动端）
  const documentContainer = document.querySelector('.mobile-document-container');
  if (documentContainer) {
    documentContainer.removeEventListener('scroll', handleScroll);
  }
});

// 修改返回函数，优先返回到之前的对话页面
const goBack = () => {
  // 如果是从聊天页面跳转过来的，则返回到那个聊天页面
  if (router.options.history.state.back && router.options.history.state.back.includes('/chat/')) {
    router.back()
  } else {
    // 否则返回首页，但不触发重新加载
    router.push({ path: '/', replace: true })
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
const fetchDocuments = async (kbId) => {
  try {
    // 调用API获取文档列表
    const response = await urlRequest.fileList({
      kb_id: kbId,
      page: isMobile.value ? mobilePage.value : currentPage.value,
      page_size: pageSize.value
    });
    
    if (response && response.data) {
      // 更新文档列表
      documents.value = response.data.details || [];
      // 更新分页信息
      totalItems.value = response.data.total || 0;
      totalPages.value = response.data.total_pages || 1;
    } else {
      documents.value = [];
      totalItems.value = 0;
      totalPages.value = 1;
    }
  } catch (error) {
    console.error('获取文档列表失败:', error);
    documents.value = [];
    totalItems.value = 0;
    totalPages.value = 1;
  }
  
  // 重置移动端加载状态
  mobileLoadedItems.value = Math.min(10, documents.value.length);
  isLoadingMore.value = false;
};

// 创建知识库
const createKnowledgeBase = async () => {
  if (!newKbName.value.trim()) return;

  try {
    // 调用API创建知识库
    const response = await urlRequest.createKb({ kb_name: newKbName.value.trim() });
    
    if (response.code === 200) {
      // 使用API返回的kb_id
      await ipsResquest.ipsCreateKb({ kb_id: response.data.kb_id, kb_name: response.data.kb_name });
      const newKb = {
        kb_id: response.data.kb_id,
        kb_name: response.data.kb_name,
      };
      knowledgeBaseList.value.push(newKb); // 更新知识库列表
      showCreateKbModal.value = false; // 关闭模态框
      newKbName.value = ''; // 清空输入框

      filteredKnowledgeBaseList.value = [...knowledgeBaseList.value];
      // 选择新创建的知识库
      selectKnowledgeBase(newKb);
    } else {
      message.error(response.msg || '创建知识库失败'); // 显示错误信息
    }
  } catch (error) {
    console.error(error);
    message.error(error.msg || '创建知识库时发生错误'); // 错误处理
  }
};

// 显示重命名模态框
const showRenameKbModal = (kb) => {
  kbToRename.value = kb;
  renameKbName.value = kb.kb_name;
  showRenameModal.value = true;
};

// 重命名知识库
const renameKnowledgeBase = async () => {
  if (!renameKbName.value.trim() || !kbToRename.value) return;
  
  // 调用API重命名知识库
  const response = await urlRequest.kbConfig({ kb_id: kbToRename.value.kb_id, new_kb_name: renameKbName.value.trim()});
  if (response.code === 200) {
    await ipsResquest.ipsKbConfig({ kb_id: kbToRename.value.kb_id, kb_name: renameKbName.value.trim()});
    // 更新列表数据
    const index = knowledgeBaseList.value.findIndex(kb => kb.kb_id === kbToRename.value.kb_id);
    if (index !== -1) {
      knowledgeBaseList.value[index].kb_name = renameKbName.value.trim();
      
      // 如果当前选中的是被重命名的知识库，更新选中的知识库
      if (selectedKb.value && selectedKb.value.kb_id === kbToRename.value.kb_id) {
        selectedKb.value = { ...knowledgeBaseList.value[index] };
      }
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
const deleteKnowledgeBase = async() => {
  if (!kbToDelete.value) return;

  // 调用API删除知识库
  const response = await urlRequest.deleteKB({ kb_ids: [kbToDelete.value.kb_id] });
  if (response.code === 200) {
    await ipsResquest.ipsDeleteKB({ kb_idList: [kbToDelete.value.kb_id] });
    // 删除成功，重新获取知识库列表
    knowledgeBaseStore.getList(true).then(() => {
      // 自动选择第一个知识库
      if (knowledgeBaseList.value && knowledgeBaseList.value.length > 0) {
        filteredKnowledgeBaseList.value = [...knowledgeBaseList.value];
        selectKnowledgeBase(knowledgeBaseList.value[0]);
      }
    });
  }
  console.log(response)

  
  showDeleteKbConfirm.value = false;
  kbToDelete.value = null;
};

// 查看文档
const viewDocument = (doc) => {
  console.log('查看文档', doc);
  if (showModal.value && activeReferenceId.value === doc.file_id) {
    closeActiveReference()
  } else {
    // 否则设置为新的活动引用
    activeReferenceId.value = doc.file_id
    activeReferenceTitle.value = doc.file_name
    activeReferenceSection.value = ''
    showModal.value = true
  }
};

// 关闭文档
const closeActiveReference = () => {
  showModal.value = false
}

// 确认删除文档
const confirmDeleteDocument = (doc) => {
  docToDelete.value = doc;
  showDeleteDocConfirm.value = true;
};

// 删除文档
const deleteDocument = async () => {
  if (!docToDelete.value) return;
  
  try {
    // 调用API删除文档
    const response = await urlRequest.deleteFile({
      kb_id: selectedKb.value.kb_id,
      file_ids: [docToDelete.value.file_id]
    });
    
    if (response && response.code === 200) {
      // 删除成功，重新获取文档列表
      fetchDocuments(selectedKb.value.kb_id);
      // 显示成功提示
      alert('文档删除成功');
    } else {
      // 显示失败提示
      alert('文档删除失败：' + (response?.msg || '未知错误'));
    }
  } catch (error) {
    console.error('删除文档失败:', error);
    alert('文档删除失败：' + error.message);
  } finally {
    showDeleteDocConfirm.value = false;
    docToDelete.value = null;
  }
};

// 格式化日期 - 修改为处理timestamp格式
const formatDate = (timestamp) => {
  if (!timestamp) return '-';
  
  try {
    // 处理格式为"202503121229"的时间戳
    const year = timestamp.substring(0, 4);
    const month = timestamp.substring(4, 6);
    const day = timestamp.substring(6, 8);
    const hour = timestamp.substring(8, 10);
    const minute = timestamp.substring(10, 12);
    
    return `${year}-${month}-${day} ${hour}:${minute}`;
  } catch (e) {
    return timestamp;
  }
};

// 格式化文件大小
const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

// 上传文档
const uploadDocument = async () => {
  const list = [];
  showUploadModal.value = false; // 关闭上传模态框
  showUploadList.value = true; // 显示上传列表

  // 遍历待上传文件列表，筛选出状态为'loading'的文件
  uploadFileList.value.forEach((file) => {
    if (file.status === 'loading') {
      list.push(file);
    }
  });

  const formData = new FormData();
  for (let i = 0; i < list.length; i++) {
    formData.append('files', list[i]?.file); // 添加文件到FormData
  }
  formData.append('kb_id', currentId.value); // 添加知识库ID
  formData.append('user_id', userId); // 添加用户ID
  formData.append('mode', 'strong'); // 上传模式

  try {
    const response = await urlRequest.uploadFile({
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const data = await response.json(); // 解析响应为JSON
      if (data.code === 200) {
        list.forEach((item, index) => {
          let status = data.data[index].status;
          if (status === 'green' || status === 'gray') {
            status = 'success';
          } else {
            status = 'error';
          }
          uploadFileList.value[item.order].status = status; // 更新文件状态
          uploadFileList.value[item.order].errorText = common.upSucceeded; // 成功提示
        });
      } else {
        message.error(data.msg || '出错了');
        list.forEach(item => {
          uploadFileList.value[item.order].status = 'error'; // 更新为错误状态
          uploadFileList.value[item.order].errorText = data?.msg || common.upFailed; // 错误提示
        });
      }
    } else {
      throw new Error('上传失败');
    }
  } catch (error) {
    list.forEach(item => {
      uploadFileList.value[item.order].status = 'error'; // 更新为错误状态
      uploadFileList.value[item.order].errorText = error?.msg || common.upFailed; // 错误提示
    });
    message.error(JSON.stringify(error?.msg) || '出错了');
  }
};

// 过滤知识库列表
const filteredKnowledgeBaseList = ref([]);

// 搜索知识库
const toggleSearch = () => {
  isSearchActive.value = !isSearchActive.value;
  if (isSearchActive.value) {
    nextTick(() => {
      searchInput.value.focus();
    });
  }
};

// 监听搜索关键词变化
watch(searchQuery, (newVal) => {
  if (newVal.trim() === '') {
    filteredKnowledgeBaseList.value = [...knowledgeBaseList.value];
  } else {
    filteredKnowledgeBaseList.value = knowledgeBaseList.value.filter(kb => 
      kb.kb_name.toLowerCase().includes(newVal.toLowerCase())
    );
  }
});

// 搜索框失去焦点
const onSearchBlur = () => {
  if (searchQuery.value.trim() === '') {
    isSearchActive.value = false;
  }
};
</script>

<style scoped>
/* 可以添加特定的样式 */
.animate-slide-in {
  animation: slideIn 0.3s ease-out forwards;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style> 