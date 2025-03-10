<template>
  <div class="eml-view-comp">
    <!-- <h2>{{ emlInfo.subject }}</h2>
    <p>
      <strong>发送人:</strong> {{ emlInfo.senderName }}
      <span v-if="emlInfo.senderEmail"> ({{ emlInfo.senderEmail }})</span>
    </p> -->
    <!-- <div v-html="emlInfo.body"></div> -->
    <!-- <pre>{{ emlInfo.body }}</pre> -->
  </div>
</template>

<!-- <script>
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
      body: '',
    });

    const fetchData = async () => {
      try {
        const response = await fetch(props.sourceUrl);
        const arrayBuffer = await response.text();
        const info = emailParser(arrayBuffer);
        console.log('info', info);

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

        const html = new TextDecoder('utf-8').decode(uint8Array);
        console.log('html', html);
        const sender = info.headers.from[0]?.value[0];
        const senderName = sender ? sender.name : '';
        const senderEmail = sender ? sender.address : '';

        emlInfo.value = {
          subject: info.headers.subject[0]?.value || '',
          senderName: senderName,
          senderEmail: senderEmail,
          body: html || '',
        };
      } catch (error) {
        console.error('读取失败:', error);
      }
    };

    onMounted(() => {
      fetchData();
    });

    return {
      emlInfo,
    };
  },
});
</script>

<style lang="scss">
.eml-view-comp {
  width: 100vh;
  max-width: 750px;
  overflow: auto;
  padding: 0 20px 20px 20px;
}
pre {
  white-space: pre-wrap; /* 保留换行和空格 */
  word-wrap: break-word; /* 自动换行 */
}
</style> -->
