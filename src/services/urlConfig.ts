enum EUrlType {
  POST = 'post',
  GET = 'get',
}
interface IUrlValueConfig {
  type: EUrlType;
  url: string;
  showLoading?: boolean;
  loadingId?: string;
  // errorToast?: boolean;//默认开启
  cancelRepeat?: boolean;
  sign?: boolean; // 是否开启签名
  param?: any;
  [key: string]: any;
}
interface IUrlConfig {
  [key: string]: IUrlValueConfig;
}
import services from '.';

export const userId = 'zzp';

//ajax请求接口
const urlConfig: IUrlConfig = {
  checkLogin: {
    type: EUrlType.GET,
    url: '/kb_api/checkLogin.s',
  },
  getLoginInfo: {
    type: EUrlType.POST,
    url: '/kb_api/j_spring_security_check',
  },
  // 获取知识库列表
  kbList: {
    type: EUrlType.POST,
    url: '/kb_api/local_doc_qa/list_knowledge_base',
    showLoading: true,
    param: {
      user_id: userId,
    },
  },
  // 新建知识库
  createKb: {
    type: EUrlType.POST,
    url: '/kb_api/local_doc_qa/new_knowledge_base',
    showLoading: true,
    param: {
      user_id: userId,
    },
  },
  // 上传文件
  uploadFile: {
    type: EUrlType.POST,
    url: '/kb_api/local_doc_qa/upload_files',
    param: {
      user_id: userId,
    },
  },
  // 删除知识库
  deleteKB: {
    type: EUrlType.POST,
    url: '/kb_api/local_doc_qa/delete_knowledge_base',
    param: {
      user_id: userId,
    },
  },
  // 删除文件
  deleteFile: {
    type: EUrlType.POST,
    url: '/kb_api/local_doc_qa/delete_files',
    showLoading: true,
    param: {
      user_id: userId,
      kb_id: '',
      file_ids: [],
    },
  },
  // 上传网页文件
  uploadUrl: {
    type: EUrlType.POST,
    url: '/kb_api/local_doc_qa/upload_weblink',
    param: {
      user_id: userId,
    },
  },
  kbConfig: {
    type: EUrlType.POST,
    url: '/kb_api/local_doc_qa/rename_knowledge_base',
    showLoading: true,
    param: {
      user_id: userId,
      kb_id: '',
      new_kb_name: '',
    },
  },
  //获取知识库已上传文件状态
  fileList: {
    type: EUrlType.POST,
    url: '/kb_api/local_doc_qa/list_files',
    param: {
      user_id: userId,
      kb_id: '',
      page: 1,
    },
  },
  //获取文件base64
  getFile: {
    type: EUrlType.POST,
    url: '/kb_api/local_doc_qa/get_file_base64',
    param: {
      user_id: userId,
    },
  },
};
const urlResquest: any = {};
Object.keys(urlConfig).forEach(key => {
  urlResquest[key] = (params: any, option: any = {}) => {
    const { type, url, param, ...other } = urlConfig[key];
    return services[type](url, { ...param, ...params }, { ...other, ...option });
  };
});
export default urlResquest;
