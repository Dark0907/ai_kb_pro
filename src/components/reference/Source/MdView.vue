<template>
  <div class="md-view-comp" v-html="htmlContent"></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, nextTick } from 'vue';
import { marked } from 'marked';

const props = defineProps({
  sourceUrl: {
    type: String,
    required: true,
  },
});
const htmlContent = ref<string>('');

const ips_token = getHashParameter('token');

function getHashParameter(name: string) {
  const hash = window.location.hash;
  const urlSearchParams = new URLSearchParams(hash.split('?')[1]);
  return urlSearchParams.get(name);
}

const fetchMarkdownContent = async () => {
  try {
    // 读取文件内容
    const response = await fetch(props.sourceUrl);
    const content = await response.text();
    const rawHtml = marked(content);
    htmlContent.value = sanitizeHtml(rawHtml);

    // 确保 DOM 更新后再添加事件监听器
    await nextTick();
    addLinkEventListeners();
  } catch (error) {
    console.error('Failed to decode base64 content:', error);
  }
};

const sanitizeHtml = htmlString => {
  // 在 HTML 字符串中的所有 <a> 标签上添加 target="_blank" 和 rel="noopener noreferrer" 属性
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const links = doc.getElementsByTagName('a');

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  }
  return doc.documentElement.innerHTML;
};

const addLinkEventListeners = () => {
  const links = document.querySelectorAll('.md-view-comp a');
  links.forEach(link => {
    if (ips_token) {
      // 如果有 ips_token，则替换点击事件为复制链接功能
      link.addEventListener('click', event => {
        event.preventDefault();
        copyToClipboard((event.target as HTMLAnchorElement).href);
      });
    }
  });
};

const copyToClipboard = (text: string) => {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    console.error('无法复制链接:', err);
  }
  document.body.removeChild(textArea);
};

onMounted(() => {
  fetchMarkdownContent();
});
</script>

<style lang="scss">
.md-view-comp {
  width: 100%;
  max-width: 750px;
  overflow: auto;
  padding: 0 20px 20px 20px;
  
  h1, h2, h3, h4, h5, h6 {
    margin-top: 1rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
    line-height: 1.25;
  }
  
  h1 {
    font-size: 1.5rem;
  }
  
  h2 {
    font-size: 1.3rem;
  }
  
  h3 {
    font-size: 1.1rem;
  }
  
  p {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    line-height: 1.5;
  }
  
  ul, ol {
    padding-left: 1.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  li {
    margin-bottom: 0.25rem;
  }
  
  a {
    color: #3182ce;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  code {
    font-family: monospace;
    background-color: rgba(0, 0, 0, 0.05);
    padding: 0.2rem 0.4rem;
    border-radius: 0.25rem;
    font-size: 0.9em;
  }
  
  pre {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 1rem;
    border-radius: 0.25rem;
    overflow-x: auto;
    margin: 1rem 0;
    
    code {
      background-color: transparent;
      padding: 0;
    }
  }
  
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 1rem 0;
    
    th, td {
      border: 1px solid #ddd;
      padding: 0.5rem;
    }
    
    th {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
  
  blockquote {
    border-left: 4px solid #ddd;
    padding-left: 1rem;
    color: #666;
    margin: 1rem 0;
  }
  
  hr {
    border: 0;
    border-top: 1px solid #ddd;
    margin: 1rem 0;
  }
  
  img {
    max-width: 100%;
  }
}

.dark {
  .md-view-comp {
    code {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    pre {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    table th {
      background-color: rgba(255, 255, 255, 0.1);
    }
    
    blockquote {
      border-left-color: #444;
      color: #aaa;
    }
    
    hr {
      border-top-color: #444;
    }
    
    a {
      color: #63b3ed;
    }
  }
}
</style>
