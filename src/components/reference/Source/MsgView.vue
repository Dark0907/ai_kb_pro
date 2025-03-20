<template>
  <div class="msg-view-comp">
    <div v-if="loading" class="loading-container">
      <div class="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-accent"></div>
      <p class="mt-2 text-law-600 dark:text-law-300">{{ $t('common.loading') }}</p>
    </div>
    
    <div v-else-if="error" class="error-container">
      <p class="text-red-500">{{ error }}</p>
      <button @click="downloadFile" class="download-btn mt-4">
        <span class="mr-2">⬇️</span> {{ $t('knowledge_base.download_original_file') }}
      </button>
    </div>
    
    <div v-else-if="msgInfo.subject" class="email-content">
      <h2 class="text-lg font-bold mb-4">{{ msgInfo.subject }}</h2>
      <div class="email-header mb-4 p-3 bg-law-50 dark:bg-law-700/50 rounded-lg">
        <p><strong>{{ $t('knowledge_base.sender') }}:</strong> {{ msgInfo.senderName }} <span v-if="msgInfo.senderEmail">({{ msgInfo.senderEmail }})</span></p>
        <p v-if="msgInfo.recipients && msgInfo.recipients.length > 0"><strong>{{ $t('knowledge_base.recipients') }}:</strong> {{ formatRecipients(msgInfo.recipients) }}</p>
        <p v-if="msgInfo.clientSubmitTime"><strong>{{ t('knowledge_base.send_date') }}:</strong> {{ formatDate(msgInfo.clientSubmitTime) }}</p>
      </div>
      
      <div class="email-body mb-4 p-4 bg-white dark:bg-law-800 rounded-lg border border-law-200 dark:border-law-700" v-html="formattedBody"></div>
      
      <!-- <div v-if="msgInfo.attachments && msgInfo.attachments.length > 0" class="email-attachments mt-4 p-3 bg-law-50 dark:bg-law-700/50 rounded-lg">
        <h3 class="text-md font-semibold mb-2">{{ $t('knowledge_base.attachments') }} ({{ msgInfo.attachments.length }})</h3>
        <ul class="list-disc pl-5">
          <li v-for="(attachment, index) in attachmentList" :key="index" class="mb-2 flex items-center">
            <span class="mr-2">📎</span>
            <span>{{ attachment.name }}</span>
            <a v-if="attachment.url" @click.prevent="downloadAttachment(attachment)" href="#" class="ml-2 text-accent hover:underline">{{ t('common.download') }}</a>
          </li>
        </ul>
      </div> -->
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import MsgReader from 'msgreader';
import { message } from 'ant-design-vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    sourceUrl: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    // 使用国际化
    const { t } = useI18n();
    
    const loading = ref(true);
    const error = ref(null);
    const msgInfo = ref({
      subject: '',
      senderName: '',
      senderEmail: '',
      recipients: [],
      clientSubmitTime: '',
      body: '',
      attachments: []
    });
    const attachmentList = ref([]);

    // 格式化日期
    const formatDate = (dateString) => {
      try {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString();
      } catch (e) {
        return dateString || '';
      }
    };

    // 格式化收件人列表
    const formatRecipients = (recipients) => {
      if (!recipients || !recipients.length) return '';
      return recipients.map(r => r.name ? `${r.name} <${r.email}>` : r.email).join(', ');
    };

    // 处理邮件正文格式
    const formattedBody = computed(() => {
      if (!msgInfo.value.body) return '';
      
      // 将换行符转换为<br>标签
      let formatted = msgInfo.value.body
        .replace(/(\r\n\r\n|\n\n)/g, '<br><br>')
        .replace(/(\r\n|\n)/g, '<br>');
      
      // 检测是否已经是HTML内容
      if (formatted.toLowerCase().includes('<html') || 
          formatted.toLowerCase().includes('<body') || 
          formatted.toLowerCase().includes('<div') || 
          formatted.toLowerCase().includes('<p>')) {
        return formatted;
      }
      
      // 不是HTML内容，则包装在<div>中
      return `<div class="msg-body">${formatted}</div>`;
    });

    // 下载原始文件
    const downloadFile = () => {
      try {
        // 获取文件名
        const urlParts = props.sourceUrl.split('/');
        let fileName = urlParts[urlParts.length - 1];
        
        // 如果是data URL，则使用默认名称
        if (props.sourceUrl.startsWith('data:')) {
          fileName = 'email.msg';
        }
        
        // 创建下载链接
        const link = document.createElement('a');
        link.href = props.sourceUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        console.error('下载文件失败:', e);
        message.error(t('knowledge_base.download_attachment_failed', { reason: e.message || '' }));
      }
    };

    // 下载附件
    const downloadAttachment = (attachment) => {
      try {
        if (!attachment.url || !attachment.name) {
          console.error('附件下载失败：缺少URL或文件名');
          message.error(t('knowledge_base.download_attachment_failed', { reason: t('common.missing_url_filename') }));
          return;
        }
        
        // 创建下载链接
        const link = document.createElement('a');
        link.href = attachment.url;
        link.download = attachment.name; // 确保使用正确的文件名（包含扩展名）
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (e) {
        console.error('附件下载失败:', e);
        message.error(t('knowledge_base.download_attachment_failed', { reason: e.message || '' }));
      }
    };

    // 获取MSG文件内容
    const fetchData = async () => {
      try {
        loading.value = true;
        error.value = null;

        // 从URL获取MSG文件
        const response = await fetch(props.sourceUrl);
        if (!response.ok) {
          throw new Error(t('knowledge_base.fetch_file_failed', { status: response.status, statusText: response.statusText }));
        }

        // 转换为ArrayBuffer
        const arrayBuffer = await response.arrayBuffer();
        
        // 解析MSG文件
        const msgReader = new MsgReader(arrayBuffer);
        const msgData = msgReader.getFileData();
        // 提取需要的信息
        msgInfo.value = {
          subject: msgData.subject || t('knowledge_base.no_subject'),
          senderName: msgData.senderName || '',
          senderEmail: msgData.senderEmail || '',
          recipients: msgData.recipients || [],
          clientSubmitTime: msgData.clientSubmitTime || '',
          body: msgData.body || msgData.bodyHTML || t('knowledge_base.no_body'),
          attachments: msgData.attachments || []
        };
        
        // console.log('MSG解析结果:', msgInfo.value);
        
        // 处理附件
        if (msgData.attachments && msgData.attachments.length > 0) {
          attachmentList.value = msgData.attachments.map((attachment, index) => {
            let fileUrl = null;
            let fileName = attachment.fileName || `${t('knowledge_base.attachment')}${index + 1}`;
            
            try {
              // 尝试获取附件内容并创建URL
              const attachmentData = msgReader.getAttachment(index);
              if (attachmentData && attachmentData.content) {
                // 确保文件名包含扩展名
                if (!fileName.includes('.')) {
                  // 根据MIME类型添加默认扩展名
                  const contentType = attachment.contentType || '';
                  if (contentType.includes('pdf')) {
                    fileName += '.pdf';
                  } else if (contentType.includes('word') || contentType.includes('document')) {
                    fileName += '.docx';
                  } else if (contentType.includes('excel') || contentType.includes('sheet')) {
                    fileName += '.xlsx';
                  } else if (contentType.includes('image/jpeg')) {
                    fileName += '.jpg';
                  } else if (contentType.includes('image/png')) {
                    fileName += '.png';
                  } else if (contentType.includes('text/plain')) {
                    fileName += '.txt';
                  } else if (contentType.includes('html')) {
                    fileName += '.html';
                  } else {
                    // 默认添加通用扩展名
                    fileName += '.bin';
                  }
                }
                
                // 创建Blob对象并附带文件名
                const blob = new Blob([attachmentData.content], {
                  type: attachment.contentType || 'application/octet-stream'
                });
                
                fileUrl = URL.createObjectURL(blob);
              }
            } catch (e) {
              console.warn(t('knowledge_base.attachment_content_failed', { name: fileName }), e);
            }
            
            return {
              name: fileName,
              url: fileUrl
            };
          });
        }
      } catch (e) {
        console.error(t('knowledge_base.parse_msg_failed'), e);
        error.value = t('knowledge_base.cannot_parse_msg', { reason: e.message || t('common.unknown_error') });
        message.error(t('knowledge_base.parse_msg_failed_notification'));
      } finally {
        loading.value = false;
      }
    };

    // 组件挂载时获取数据
    onMounted(() => {
      fetchData();
    });

    return {
      loading,
      error,
      msgInfo,
      attachmentList,
      formattedBody,
      formatDate,
      formatRecipients,
      downloadFile,
      downloadAttachment
    };
  }
});
</script>

<style lang="scss">
.msg-view-comp {
  width: 100%;
  max-width: 750px;
  margin: 0 auto;
  padding: 1rem;
  
  .loading-container, .error-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    text-align: center;
  }
  
  .email-content {
    h2 {
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 0.5rem;
    }
  }
  
  .email-body {
    line-height: 1.6;
    
    a {
      color: #3182ce;
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
    
    .msg-body {
      white-space: pre-wrap;
    }
  }
  
  .download-btn {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: #3182ce;
    color: white;
    border-radius: 0.375rem;
    font-weight: 500;
    transition: background-color 0.2s;
    
    &:hover {
      background-color: #2c5282;
    }
  }
}

/* 暗黑模式适配 */
.dark {
  .msg-view-comp {
    .email-body {
      a {
        color: #63b3ed;
      }
    }
  }
}
</style>
