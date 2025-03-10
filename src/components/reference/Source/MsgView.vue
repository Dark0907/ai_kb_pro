<template>
  <div class="msg-view-comp">
    <h2>{{ msgInfo.subject }}</h2>
    <p><strong>发送人:</strong> {{ msgInfo.senderName }} ({{ msgInfo.senderEmail }})</p>
    <p><strong>发送日期:</strong> {{ new Date(msgInfo.clientSubmitTime).toLocaleString() }}</p>
    <div v-html="msgInfo.body"></div>
    <p><strong>关联附件</strong></p>
    <div v-html="attachmentsHtml"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
// import iconv from 'iconv-lite';
// import MsgReader from '@kenjiuno/msgreader';

export default defineComponent({
  props: {
    sourceUrl: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const msgInfo = ref({
      subject: '',
      senderName: '',
      senderEmail: '',
      clientSubmitTime: '',
      body: '',
    });
    const attachmentsHtml = ref('');

    // 换行处理
    // const formattedContent = (string: string) => {
    //   // 将换行符转换为 <br> 标签
    //   return string.replace(/(\r\n\r\n)/g, '<br>');
    // };

    // // 编码转换
    // const transcoding = (string: string) => {
    //   // 将换行符转换为 <br> 标签
    //   return iconv.decode(string, 'gb2312');
    // };

    // const fetchData = async () => {
    //   try {
    //     const response = await fetch(props.sourceUrl);
    //     const arrayBuffer = await response.arrayBuffer();
    //     const msgReader = new MsgReader(arrayBuffer);
    //     const info = msgReader.getFileData();
    //     // 解码转换输出html
    //     msgInfo.value = {
    //       subject: transcoding(info.subject) || 'No Subject',
    //       senderName: transcoding(info.senderName) || 'Unknown Sender',
    //       senderEmail: transcoding(info.senderEmail) || '',
    //       clientSubmitTime: info.clientSubmitTime || '',
    //       body: formattedContent(transcoding(info.body)) || '',
    //     };
    //     // console.log('info', msgInfo.value);
    //     attachmentsHtml.value = info.attachments
    //       .map((attachment, i) => {
    //         const fileName = transcoding(attachment.fileName);
    //         const file = msgReader.getAttachment(i);
    //         const fileUrl = URL.createObjectURL(
    //           new File([file.content], fileName, {
    //             type: attachment.attachMimeTag
    //               ? attachment.attachMimeTag
    //               : 'application/octet-stream',
    //           })
    //         );
    //         return `<p>${fileName}<a target="_blank" href="${fileUrl}"> 查看</a></p>`;
    //       })
    //       .join('');
    //   } catch (error) {
    //     console.error('读取失败:', error);
    //   }
    // };

    onMounted(() => {
      fetchData();
    });

    return {
      msgInfo,
      attachmentsHtml,
    };
  },
});
</script>

<style lang="scss">
.msg-view-comp {
  // width: fit-content;
  width: 750px;
  padding: 0 20px 20px 20px;
}
</style>
