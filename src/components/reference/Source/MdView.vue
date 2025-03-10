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
  width: 100vh;
  max-width: 750px;
  overflow: auto;
  padding: 0 20px 20px 20px;
}
</style>
