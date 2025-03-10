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
  // 获取文件base64
  getFile: {
    type: EUrlType.POST,
    url: '/kb_api/local_doc_qa/get_file_base64',
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
