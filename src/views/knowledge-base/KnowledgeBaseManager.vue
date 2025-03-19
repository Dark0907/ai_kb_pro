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
        :class="{'hidden md:block': activeTab === 'doc', 'block': activeTab === 'kb' || !isMobile}"
      >
        <knowledge-base-list
          :knowledge-base-list="filteredKnowledgeBaseList"
          :selected-kb="selectedKb"
          @select-kb="selectKnowledgeBase"
          @create-kb="showCreateKbModal = true"
          @rename-kb="showRenameKbModal"
          @delete-kb="showDeleteKbModal"
        />
      </div>
      
      <!-- 右侧知识库详情 -->
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
          
          <!-- PC端文档列表 -->
          <document-list
            :documents="documents"
            :current-page="currentPage"
            :total-items="totalItems"
            :total-pages="totalPages"
            :page-size="pageSize"
            @change-page="changePage"
            @view-document="viewDocument"
            @delete-document="confirmDeleteDocument"
          />
          
          <!-- 移动端文档列表 -->
          <mobile-document-list
            :documents="documents"
            :current-page="mobilePage"
            :total-items="totalItems"
            :page-size="pageSize"
            :is-loading-more="isLoadingMore"
            @load-more="loadMoreDocuments"
            @view-document="viewDocument"
            @delete-document="confirmDeleteDocument"
          />
        </div>
      </div>
    </div>
    
    <!-- 模态框组件 -->
    <!-- 新建知识库模态框 -->
    <dialog-modal
      v-if="showCreateKbModal"
      :title="$t('knowledge_base.create_new') || '新建知识库'"
      content-type="input"
      :input-label="$t('knowledge_base.kb_name') || '知识库名称'"
      :input-placeholder="$t('knowledge_base.enter_kb_name') || '请输入知识库名称'"
      :confirm-text="$t('common.confirm') || '确认'"
      :cancel-text="$t('common.cancel') || '取消'"
      @confirm="createKnowledgeBase"
      @cancel="showCreateKbModal = false"
    />
    
    <!-- 重命名知识库模态框 -->
    <dialog-modal
      v-if="showRenameModal"
      :title="$t('knowledge_base.rename_kb') || '重命名知识库'"
      content-type="input"
      :input-label="$t('knowledge_base.kb_name') || '知识库名称'"
      :input-placeholder="$t('knowledge_base.enter_kb_name') || '请输入知识库名称'"
      :default-input-value="renameKbName"
      :confirm-text="$t('common.confirm') || '确认'"
      :cancel-text="$t('common.cancel') || '取消'"
      @confirm="renameKnowledgeBase"
      @cancel="showRenameModal = false"
    />
    
    <!-- 删除知识库确认模态框 -->
    <dialog-modal
      v-if="showDeleteKbConfirm"
      :title="$t('knowledge_base.delete_kb') || '删除知识库'"
      content-type="text"
      :content="$t('knowledge_base.delete_kb_confirm', { name: kbToDelete?.kb_name }) || `确定要删除知识库 '${kbToDelete?.kb_name}' 吗？此操作不可恢复。`"
      :confirm-text="$t('common.delete') || '删除'"
      :cancel-text="$t('common.cancel') || '取消'"
      :confirm-danger="true"
      @confirm="deleteKnowledgeBase"
      @cancel="showDeleteKbConfirm = false"
    />
    
    <!-- 删除文档确认模态框 -->
    <dialog-modal
      v-if="showDeleteDocConfirm"
      :title="$t('knowledge_base.delete_document') || '删除文档'"
      content-type="text"
      :content="$t('knowledge_base.delete_document_confirm', { name: docToDelete?.file_name }) || `确定要删除文档 '${docToDelete?.file_name}' 吗？此操作不可恢复。`"
      :confirm-text="$t('common.delete') || '删除'"
      :cancel-text="$t('common.cancel') || '取消'"
      :confirm-danger="true"
      @confirm="deleteDocument"
      @cancel="showDeleteDocConfirm = false"
    />
    
    <!-- 上传文档模态框 -->
    <upload-modal
      v-if="showUploadModal"
      :knowledge-base-list="knowledgeBaseList"
      :selected-kb="selectedKb"
      :is-uploading="isUploading"
      @upload="uploadDocument"
      @close="closeUploadModal"
    />

    <!-- 上传进度显示模态框 -->
    <upload-progress-modal
      v-if="showUploadProgressModal"
      :files="uploadingFiles"
      @close="closeUploadProgressModal"
    />

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
import LanguageSwitcher from '@/components/layout/LanguageSwitcher.vue'
import ThemeSwitcher from '@/components/layout/ThemeSwitcher.vue'
import ReferenceModal from '@/components/reference/ReferenceModal.vue'
import KnowledgeBaseList from '@/components/knowledge-base/KnowledgeBaseList.vue'
import DocumentList from '@/components/knowledge-base/DocumentList.vue'
import MobileDocumentList from '@/components/knowledge-base/MobileDocumentList.vue'
import UploadModal from '@/components/knowledge-base/UploadModal.vue'
import UploadProgressModal from '@/components/knowledge-base/UploadProgressModal.vue'
import DialogModal from '@/components/knowledge-base/DialogModal.vue'
import urlRequest from '@/services/urlConfig'
import ipsResquest from '@/services/ipsConfig'
import axios from 'axios';
import { apiBase } from '@/services';

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
const kbToDelete = ref(null);
const kbToRename = ref(null);
const docToDelete = ref(null);
const activeTab = ref('kb'); // 移动端标签切换状态：'kb' 或 'doc'
const isMobile = ref(false); // 是否为移动设备
const renameKbName = ref(''); // 重命名知识库时的名称
const showModal = ref(false);
const activeReferenceId = ref('');
const activeReferenceTitle = ref('');
const activeReferenceSection = ref('');

// 分页相关
const pageSize = ref(15); // 每页显示15条
const currentPage = ref(1);
const totalItems = ref(0); // 总条数
const totalPages = ref(0); // 总页数

// 移动端滚动加载
const isLoadingMore = ref(false);
const mobilePage = ref(1); // 移动端专用的页码计数器

// 文件上传相关
const showUploadProgressModal = ref(false);
const uploadingFiles = ref([]);
const isUploading = ref(false);

// 过滤知识库列表
const filteredKnowledgeBaseList = ref([]);

// 检测设备类型
const checkDeviceType = () => {
  isMobile.value = window.innerWidth < 768;
};

// 初始化
onMounted(() => {
  // 检测设备类型
  checkDeviceType();
  window.addEventListener('resize', checkDeviceType);
  
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
});

// 修改返回函数，优先返回到之前的对话页面
const goBack = () => {
  // 如果是从聊天页面跳转过来的，则返回到那个聊天页面
  if (router.options.history.state.back && router.options.history.state.back.includes('/chat/')) {
    router.back();
  } else {
    // 否则返回首页，但不触发重新加载
    router.push({ path: '/', replace: true });
  }
};

// 选择知识库
const selectKnowledgeBase = (kb) => {
  selectedKb.value = kb;
  // 获取文档列表
  fetchDocuments(kb.kb_id);
  
  // 在移动端选择知识库后自动切换到文档标签
  if (isMobile.value) {
    activeTab.value = 'doc';
  }

  // 重置移动端页码
  mobilePage.value = 1;
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
};

// 加载更多文档（移动端）
const loadMoreDocuments = async () => {
  if (isLoadingMore.value || documents.value.length >= totalItems.value) return;
  
  isLoadingMore.value = true;
  console.log('加载更多文档，当前已加载:', documents.value.length);
  
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
    }
  } catch (error) {
    console.error('加载更多文档失败:', error);
  } finally {
    isLoadingMore.value = false;
  }
};

// 切换页码
const changePage = (page) => {
  currentPage.value = page;
  // 重新获取当前页的数据
  fetchDocuments(selectedKb.value.kb_id);
};

// 创建知识库
const createKnowledgeBase = async (name) => {
  if (!name) return;

  try {
    // 调用API创建知识库
    const response = await urlRequest.createKb({ kb_name: name });
    
    if (response.code === 200) {
      // 使用API返回的kb_id
      await ipsResquest.ipsCreateKb({ kb_id: response.data.kb_id, kb_name: response.data.kb_name });
      const newKb = {
        kb_id: response.data.kb_id,
        kb_name: response.data.kb_name,
      };
      knowledgeBaseList.value.push(newKb); // 更新知识库列表
      showCreateKbModal.value = false; // 关闭模态框

      filteredKnowledgeBaseList.value = [...knowledgeBaseList.value];
      // 选择新创建的知识库
      selectKnowledgeBase(newKb);
    } else {
      alert(response.msg || '创建知识库失败'); // 显示错误信息
    }
  } catch (error) {
    console.error(error);
    alert(error.msg || '创建知识库时发生错误'); // 错误处理
  }
};

// 显示重命名模态框
const showRenameKbModal = (kb) => {
  kbToRename.value = kb;
  renameKbName.value = kb.kb_name;
  showRenameModal.value = true;
};

// 重命名知识库
const renameKnowledgeBase = async (newName) => {
  if (!newName || !kbToRename.value) return;
  
  // 调用API重命名知识库
  const response = await urlRequest.kbConfig({ kb_id: kbToRename.value.kb_id, new_kb_name: newName});
  if (response.code === 200) {
    await ipsResquest.ipsKbConfig({ kb_id: kbToRename.value.kb_id, kb_name: newName});
    // 更新列表数据
    const index = knowledgeBaseList.value.findIndex(kb => kb.kb_id === kbToRename.value.kb_id);
    if (index !== -1) {
      knowledgeBaseList.value[index].kb_name = newName;
      
      // 如果当前选中的是被重命名的知识库，更新选中的知识库
      if (selectedKb.value && selectedKb.value.kb_id === kbToRename.value.kb_id) {
        selectedKb.value = { ...knowledgeBaseList.value[index] };
      }
    }
  }  
  showRenameModal.value = false;
  kbToRename.value = null;
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
  
  showDeleteKbConfirm.value = false;
  kbToDelete.value = null;
};

// 查看文档
const viewDocument = (doc) => {
  if (showModal.value && activeReferenceId.value === doc.file_id) {
    closeActiveReference();
  } else {
    // 否则设置为新的活动引用
    activeReferenceId.value = doc.file_id;
    activeReferenceTitle.value = doc.file_name;
    activeReferenceSection.value = '';
    showModal.value = true;
  }
};

// 关闭文档
const closeActiveReference = () => {
  showModal.value = false;
};

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

// 关闭上传模态框
const closeUploadModal = () => {
  if (!isUploading.value) {
    showUploadModal.value = false;
  }
};

// 关闭上传进度模态框
const closeUploadProgressModal = () => {
  showUploadProgressModal.value = false;
  uploadingFiles.value = [];
  // 重新获取文档列表
  if (selectedKb.value) {
    fetchDocuments(selectedKb.value.kb_id);
  }
};

// 上传文档函数
const uploadDocument = async ({ files, kbId }) => {
  if (files.length === 0 || !kbId) return;
  
  isUploading.value = true;
  showUploadModal.value = false;
  showUploadProgressModal.value = true;
  
  // 准备上传文件列表
  uploadingFiles.value = files.map((file, index) => ({
    name: file.name,
    file: file,
    status: 'loading',
    order: index,
    errorText: ''
  }));
  
  // 为每个文件单独发起上传请求
  for (let i = 0; i < uploadingFiles.value.length; i++) {
    const fileItem = uploadingFiles.value[i];
    if (fileItem.status === 'loading') {
      try {
        // 创建FormData对象并添加文件和参数
        const formData = new FormData();
        formData.append('files', fileItem.file);
        formData.append('kb_id', kbId);
        formData.append('user_id', 'zzp');
        formData.append('mode', 'strong');
        
        // 直接使用axios发送请求
        const response = await axios.post(
          `${apiBase}kb_api/local_doc_qa/upload_files`, 
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        
        // 获取响应数据
        const data = response.data;
        
        if (data && data.code === 200) {
          // 获取上传结果并更新状态
          const result = data.data[0];
          if (result.status !== 'red' && result.status !== 'yellow') {
            // 上传成功
            uploadingFiles.value[i].status = 'success';
            uploadingFiles.value[i].file_id = result.file_id;
          } else {
            // 上传状态异常
            uploadingFiles.value[i].status = 'error';
            uploadingFiles.value[i].errorText = '上传失败';
          }
        } else {
          // API返回错误
          uploadingFiles.value[i].status = 'error';
          uploadingFiles.value[i].errorText = data?.msg || '上传失败';
        }
      } catch (error) {
        console.error('上传文档出错:', error);
        // 标记文件为上传失败
        uploadingFiles.value[i].status = 'error';
        uploadingFiles.value[i].errorText = error.message || '上传失败';
      }
    }
  }
  
  isUploading.value = false;
  
  // 如果全部上传结束，刷新文档列表
  const successCount = uploadingFiles.value.filter(file => file.status === 'success').length;
  if (successCount > 0 && selectedKb.value) {
    // 重置移动端页码
    mobilePage.value = 1;
    // 延迟一下再刷新文档列表，确保服务器处理完成
    setTimeout(() => {
      fetchDocuments(selectedKb.value.kb_id);
    }, 1000);
  }
};
</script>

<style scoped>
/* 可以添加特定的样式 */
</style> 