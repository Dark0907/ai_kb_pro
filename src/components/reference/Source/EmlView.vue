<template>
  <div class="eml-view-comp">
    <h2 class="text-lg font-bold mb-4">{{ emlInfo.subject }}</h2>
    <div class="mb-4 p-2 border-b border-law-200 dark:border-law-700">
      <p>
        <strong>发送人:</strong> {{ emlInfo.senderName }}
        <span v-if="emlInfo.senderEmail"> ({{ emlInfo.senderEmail }})</span>
      </p>
      <p v-if="emlInfo.to"><strong>收件人:</strong> {{ emlInfo.to }}</p>
      <p v-if="emlInfo.cc"><strong>抄送:</strong> {{ emlInfo.cc }}</p>
      <p v-if="emlInfo.date"><strong>日期:</strong> {{ emlInfo.date }}</p>
    </div>
    
    <!-- HTML 内容显示（仅当确实是 HTML 内容时） -->
    <div v-html="emlInfo.body" class="email-html-content"></div>
    <!-- <div v-if="emlInfo.isHtml" v-html="emlInfo.body" class="email-html-content"></div> -->
    
    <!-- 纯文本内容显示 -->
    <!-- <pre v-else class="email-text-content">{{ emlInfo.body }}</pre> -->
    
    <!-- 附件显示 -->
    <div v-if="emlInfo.attachments && emlInfo.attachments.length > 0" class="mt-4 p-2 border-t border-law-200 dark:border-law-700">
      <h3 class="text-md font-semibold mb-2">附件 ({{ emlInfo.attachments.length }})</h3>
      <ul class="list-disc pl-5">
        <li v-for="(attachment, index) in emlInfo.attachments" :key="index" class="mb-1">
          {{ attachment.filename }} ({{ formatSize(attachment.size) }})
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from 'vue';
import emailParser from 'emailjs-mime-parser';

export default defineComponent({
  props: {
    sourceUrl: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const emlInfo = ref({
      subject: '',
      senderName: '',
      senderEmail: '',
      to: '',
      cc: '',
      date: '',
      body: '',
      isHtml: false,
      attachments: [],
    });

    const formatSize = (size) => {
      if (!size) return '0 KB';
      const kb = Math.round(size / 1024);
      if (kb < 1024) return `${kb} KB`;
      return `${(kb / 1024).toFixed(1)} MB`;
    };

    const parseAddressList = (addresses) => {
      if (!addresses || !addresses.length) return '';
      return addresses.map(addr => {
        const value = addr.value;
        if (!value || !value.length) return '';
        return value.map(v => v.name ? `${v.name} <${v.address}>` : v.address).join(', ');
      }).join(', ');
    };

    // 检查内容是否为 HTML（包含 HTML 标签）
    const isHtmlContent = (content) => {
      if (!content) return false;
      
      // 检查是否包含常见的 HTML 标签
      const htmlTagPattern = /<\/?[a-z][\s\S]*?>/i;
      return htmlTagPattern.test(content);
    };

    const processMultipart = (node) => {
      // 处理多部分邮件
      const parts = [];
      let htmlContent = null;
      let textContent = null;
      const attachments = [];
      
      // 递归查找所有内容部分
      const processNode = (node) => {
        if (!node) return;
        
        // 处理当前节点
        if (node.contentType) {
          // 检查是否为附件
          const disposition = node.headers && node.headers['content-disposition'] && 
                              node.headers['content-disposition'][0] ? 
                              node.headers['content-disposition'][0].value : null;
          
          const isAttachment = disposition && disposition.indexOf('attachment') >= 0;
          
          if (isAttachment) {
            // 处理附件
            const filename = disposition.match(/filename="([^"]+)"/);
            const size = node.content ? Object.keys(node.content).length : 0;
            
            attachments.push({
              filename: filename ? filename[1] : '未命名附件',
              size: size,
              content: node.content
            });
          } else if (node.contentType.value === 'text/html' && node.content) {
            // HTML 内容
            const content = new Uint8Array(Object.values(node.content));
            const decodedContent = new TextDecoder('utf-8').decode(content);
            
            // 只有当内容确实包含 HTML 标签时才将其视为 HTML
            if (isHtmlContent(decodedContent)) {
              htmlContent = decodedContent;
            } else {
              // 如果标记为 HTML 但实际上是纯文本，作为纯文本处理
              textContent = decodedContent;
            }
          } else if (node.contentType.value === 'text/plain' && node.content) {
            // 纯文本内容
            const content = new Uint8Array(Object.values(node.content));
            textContent = new TextDecoder('utf-8').decode(content);
          }
        }
        
        // 处理子节点
        if (node.childNodes && node.childNodes.length) {
          node.childNodes.forEach(child => processNode(child));
        }
      };
      
      // 开始处理
      processNode(node);
      
      return {
        htmlContent,
        textContent,
        attachments
      };
    };

    const fetchData = async () => {
      try {
        const response = await fetch(props.sourceUrl);
        const arrayBuffer = await response.text();
        const info = emailParser(arrayBuffer);
        console.log('info', info);
        
        // 获取发件人信息
        const sender = info.headers.from ? info.headers.from[0]?.value[0] : null;
        const senderName = sender ? sender.name : '';
        const senderEmail = sender ? sender.address : '';
        
        // 获取收件人信息
        const to = info.headers.to ? parseAddressList(info.headers.to) : '';
        const cc = info.headers.cc ? parseAddressList(info.headers.cc) : '';
        
        // 获取日期
        const date = info.headers.date ? info.headers.date[0]?.value : '';
        
        // 获取主题
        const subject = info.headers.subject ? info.headers.subject[0]?.value || '' : '';
        
        let bodyContent = '';
        let isHtml = false;
        let attachments = [];
        
        // 根据内容类型处理内容
        if (info.contentType && info.contentType.type === 'multipart') {
          // 多部分内容处理
          const { htmlContent, textContent, attachments: atts } = processMultipart(info);
          bodyContent = htmlContent || textContent || '';
          isHtml = !!htmlContent;
          attachments = atts;
        } else {
          // 单部分内容处理
          let uint8Array;
          if (info.content) {
            uint8Array = new Uint8Array(Object.values(info.content));
          } else if (
            info.childNodes &&
            info.childNodes[0] &&
            info.childNodes[0].childNodes[0] &&
            info.childNodes[0].childNodes[0].content
          ) {
            uint8Array = new Uint8Array(Object.values(info.childNodes[0].childNodes[0].content));
          } else {
            throw new Error('No valid content found');
          }
          
          bodyContent = new TextDecoder('utf-8').decode(uint8Array);
          
          // 判断内容类型是否是HTML
          const contentTypeIsHtml = info.contentType && 
                   info.contentType.value && 
                   info.contentType.value.toLowerCase().includes('html');
          
          // 同时检查内容类型和实际内容
          isHtml = contentTypeIsHtml && isHtmlContent(bodyContent);
          
          // 如果标记为 HTML 但实际没有 HTML 标签，打印调试信息
          if (contentTypeIsHtml && !isHtml) {
            console.log('邮件标记为 HTML 但实际内容是纯文本');
          }
        }
        
        // console.log('Content type:', info.contentType);
        // console.log('Is HTML:', isHtml);
        // console.log('Body:', bodyContent.substring(0, 200) + '...');
        
        emlInfo.value = {
          subject,
          senderName,
          senderEmail,
          to,
          cc,
          date,
          body: bodyContent,
          isHtml,
          attachments,
        };
      } catch (error) {
        console.error('读取失败:', error);
        emlInfo.value.body = '邮件解析失败: ' + error.message;
      }
    };

    onMounted(() => {
      fetchData();
    });

    return {
      emlInfo,
      formatSize,
    };
  },
});
</script>

<style lang="scss">
.eml-view-comp {
  width: 100%;
  max-width: 750px;
  overflow: auto;
  padding: 0 20px 20px 20px;
  
  h2 {
    border-bottom: 1px solid #eee;
    padding-bottom: 8px;
    margin-bottom: 16px;
  }
}

.email-text-content {
  white-space: pre-wrap; /* 保留换行和空格 */
  word-wrap: break-word; /* 自动换行 */
  font-family: monospace;
  background-color: #f9f9f9;
  padding: 16px;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.5;
}

.email-html-content {
  margin-top: 16px;
  padding: 8px;
  border-radius: 4px;
  max-width: 100%;
  overflow-x: auto;
  
  img {
    max-width: 100%;
    height: auto;
  }
  
  table {
    border-collapse: collapse;
    max-width: 100%;
    
    td, th {
      border: 1px solid #ddd;
      padding: 8px;
    }
  }
  
  a {
    color: #3182ce;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
}

/* 暗黑模式适配 */
.dark {
  .email-text-content {
    background-color: #2d3748;
    color: #e2e8f0;
  }
  
  .email-html-content {
    color: #e2e8f0;
    
    a {
      color: #63b3ed;
    }
  }
}
</style>
