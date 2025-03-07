// 该文件用于定义与后端 API 交互的具体接口配置，包括请求类型、URL 和参数等。
import services from './api'; // 引入 API 服务

export const userId = 'zzp'; // 固定当前用户的 ID

// 定义请求类型
const EUrlType = {
  POST: 'post',
  GET: 'get',
};

// ajax请求接口
const urlConfig = {
  checkLogin: {
    type: EUrlType.GET,
    url: 'kb_api/checkLogin.s',
  },
  getLoginInfo: {
    type: EUrlType.POST,
    url: 'kb_api/j_spring_security_check',
  },
  // 获取知识库列表
  kbList: {
    type: EUrlType.POST,
    url: 'kb_api/local_doc_qa/list_knowledge_base',
    showLoading: true,
    param: {
      user_id: userId,
    },
  },
  // 新建知识库
  createKb: {
    type: EUrlType.POST,
    url: 'kb_api/local_doc_qa/new_knowledge_base',
    showLoading: true,
    param: {
      user_id: userId,
    },
  },
  // 上传文件
  uploadFile: {
    type: EUrlType.POST,
    url: 'kb_api/local_doc_qa/upload_files',
    param: {
      user_id: userId,
    },
  },
  // 删除知识库
  deleteKB: {
    type: EUrlType.POST,
    url: 'kb_api/local_doc_qa/delete_knowledge_base',
    param: {
      user_id: userId,
    },
  },
  // 删除文件
  deleteFile: {
    type: EUrlType.POST,
    url: 'kb_api/local_doc_qa/delete_files',
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
    url: 'kb_api/local_doc_qa/upload_weblink',
    param: {
      user_id: userId,
    },
  },
  kbConfig: {
    type: EUrlType.POST,
    url: 'kb_api/local_doc_qa/rename_knowledge_base',
    showLoading: true,
    param: {
      user_id: userId,
      kb_id: '',
      new_kb_name: '',
    },
  },
  // 获取知识库已上传文件状态
  fileList: {
    type: EUrlType.POST,
    url: 'kb_api/local_doc_qa/list_files',
    param: {
      user_id: userId,
      kb_id: '',
      page: 1,
    },
  },
  // 创建Bot
  createBot: {
    type: EUrlType.POST,
    url: 'kb_api/local_doc_qa/new_bot',
    param: {
      user_id: userId,
    },
  },
  // 更新Bot
  updateBot: {
    type: EUrlType.POST,
    url: 'kb_api/local_doc_qa/update_bot',
    param: {
      user_id: userId,
    },
  },
  // 获取Bot信息/列表
  queryBotInfo: {
    type: EUrlType.POST,
    url: 'kb_api/local_doc_qa/get_bot_info',
    param: {
      user_id: userId,
    },
  },
  // 删除Bot
  deleteBot: {
    type: EUrlType.POST,
    url: 'kb_api/local_doc_qa/delete_bot',
    param: {
      user_id: userId,
    },
  },
  // 上传faq
  uploadFaqs: {
    type: EUrlType.POST,
    url: 'kb_api/local_doc_qa/upload_faqs',
    param: {
      user_id: userId,
    },
  },
  // 获取文件base64
  getFile: {
    type: EUrlType.POST,
    url: 'kb_api/local_doc_qa/get_file_base64',
    param: {
      user_id: userId,
    },
  },
};

const urlRequest = {};
Object.keys(urlConfig).forEach(key => {
  urlRequest[key] = async (params = {}, option = {}) => {
    const { type, url, param, ...other } = urlConfig[key];
    const requestParams = { ...param, ...params };

    // 根据请求类型调用相应的服务方法
    if (type === EUrlType.GET) {
      return await services.get(url, requestParams, { ...other, ...option });
    } else if (type === EUrlType.POST) {
      return await services.post(url, requestParams, { ...other, ...option });
    }
  };
});

export default urlRequest;
