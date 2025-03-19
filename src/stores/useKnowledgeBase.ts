import { IKnowledgeItem } from '@/utils/types';
import { pageStatus } from '@/utils/enum';
// import { resultControl } from '@/utils/utils';
import message from 'ant-design-vue/es/message';

// import urlResquest from '@/services/urlConfig';
import ipsResquest from '@/services/ipsConfig';


export const useKnowledgeBase = defineStore('knowledgeBase', () => {
  // 标记是否已经加载过知识库列表数据
  const hasLoadedData = ref(false);

  // 当前操作的知识库id
  const currentId = ref('');
  const setCurrentId = (id: string) => {
    currentId.value = id;
  };

  //选中的知识库id
  const selectList = ref([]);
  const setSelectList = list => {
    selectList.value = list;
    console.log('selectList1232',selectList.value)
  };

  // 当前操作的知识库名字
  const currentKbName = ref('');
  const setCurrentKbName = (id: string) => {
    currentKbName.value = id;
  };

  // 知识库库权限
  const kbLibPermission = ref(0);
  const setPermission = state => {
    kbLibPermission.value = state;
  };

  // ips 当前库操作权限 上传文件
  const upPermission = ref(0);
  const setUpPermission = state => {
    upPermission.value = state;
  };

  // ips 当前库操作权限 删除文件
  const delPermission = ref(0);
  const setDelPermission = state => {
    delPermission.value = state;
  };

  //获取到的知识库列表
  const knowledgeBaseList = ref<Array<IKnowledgeItem>>([]);
  const setKnowledgeBaseList = list => {
    knowledgeBaseList.value = list;
  };

  //需要判断是否有知识库 如果没有知识库 展示default内容
  const showDefault = ref(pageStatus.initing);
  const setDefault = str => {
    showDefault.value = str;
  };

  //是否展示删除弹窗
  const showDeleteModal = ref(false);
  const setShowDeleteModal = (flag: boolean) => {
    showDeleteModal.value = flag;
  };

  // 获取知识库库权限
  const ipsKbLibPermission = async () => {
    try {
      const res: any = await ipsResquest.ipsKbLibPermission();
      if (res.success) {
        setPermission(res.data.KbLibPermission);
      }
    } catch (e) {
      console.log(e.msg);
    }
  };

  //获取知识库列表
  const getList = async (forceLoad = false) => {
    // 如果已经加载过数据且列表不为空，并且没有强制加载，则直接返回
    if (!forceLoad && hasLoadedData.value && knowledgeBaseList.value.length > 0) {
      return;
    }
    
    try {
      // 先获取知识库库权限
      await ipsKbLibPermission();
      
      // 改为获取ips数据
      const res: any = await ipsResquest.ipsKbList();
      if (res.success) {
        if (res?.data?.length > 0) {
          const list = res.data;
          setKnowledgeBaseList(list);
          setDefault(pageStatus.normal);
          hasLoadedData.value = true; // 标记已加载数据
          if (!selectList.value.length) {
            // 首先遍历 selectList.value 数组
            list.forEach(item => {
              if (item.ucheck) {
                selectList.value.push(item.kb_id);
              }
            });
            // 如果在遍历后 selectList.value 仍然为空，则推入 list[0].kb_id
            if (!selectList.value.length) {
              selectList.value.push(list[0].kb_id);
              ipsResquest.ipsKbCheck({ kb_id: list[0].kb_id, ucheck: 1 });
            }
          }
        } else {
          setDefault(pageStatus.default);
        }
      } else if (res.messageType === -100) {
        message.error('ips身份已过期，请重新登录！');
      }
    } catch (e) {
      message.error(e.msg);
    }
  };

  return {
    hasLoadedData,
    currentId,
    setCurrentId,
    knowledgeBaseList,
    setKnowledgeBaseList,
    showDeleteModal,
    setShowDeleteModal,
    showDefault,
    setDefault,
    getList,
    currentKbName,
    setCurrentKbName,
    upPermission,
    setUpPermission,
    delPermission,
    setDelPermission,
    selectList,
    setSelectList,
    kbLibPermission,
    setPermission,
    ipsKbLibPermission,
  };
});
