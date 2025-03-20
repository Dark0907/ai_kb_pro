import axios from './axiosInterceptor/index';

// API基础路径设置
export const apiBase = import.meta.env.VITE_APP_MODE === 'dev' 
  ? '' 
  : import.meta.env.VITE_APP_API_HOST;

// 获取子目录前缀 - 仅用于前端路由，不用于API请求
export const webPrefix = import.meta.env.VITE_APP_WEB_PREFIX || '/KnowledgeBase';

function validateStatus(status: number) {
  return status >= 200 && status < 300;
}

//获取到当前业务线之后设置
export const bondParams = {};

export default {
  get(baseUrl: string, _query = {} as any, option = {} as any) {
    // 如果是完整URL，直接使用，否则添加API基础路径
    // 注意：这里不添加webPrefix，确保API请求不会带上子目录前缀
    let url = /http/.test(baseUrl) ? `${baseUrl}` : `${apiBase}${baseUrl}`;
    const query = {
      ...bondParams,
      ..._query,
    };

    const { getResponseHeader, ...others } = option;
    const options = {
      method: 'get',
      url,
      mode: 'cors',
      withCredentials: false,
      validateStatus,
      // transformRequest,
      ...others,
      params: query,
    };
    const data = axios.request(options).then(
      res => (getResponseHeader ? res : res.data),
      error => error
    );
    return data;
  },
  post(baseUrl: string, data = {}, option = {} as any) {
    const params = {
      ...bondParams,
      ...data,
    } as any;
    
    // 如果是完整URL，直接使用，否则添加API基础路径
    // 注意：这里不添加webPrefix，确保API请求不会带上子目录前缀
    const _url = `${apiBase}${baseUrl}`;
    const url = /http/.test(baseUrl) ? baseUrl : _url;
    const { getResponseHeader, ...others } = option;

    const options = {
      method: 'post',
      url,
      mode: 'cors',
      withCredentials: false,
      validateStatus,
      // transformRequest,
      data: params,
      ...option,
      ...others,
    };
    const resData = axios.request(options).then(
      res => (getResponseHeader ? res : res.data),
      error => Promise.reject(error)
    );
    return resData;
  },
  ipsPost(baseUrl: string, data = {}, option = {} as any) {
    // 如果是完整URL，直接使用，否则添加API基础路径
    // 注意：这里不添加webPrefix，确保API请求不会带上子目录前缀
    const _url = `${apiBase}${baseUrl}`;
    const url = /http/.test(baseUrl) ? baseUrl : _url;
    const { getResponseHeader, ...others } = option;

    const options = {
      method: 'post',
      url,
      mode: 'cors',
      withCredentials: false,
      validateStatus,
      // transformRequest,
      data: data,
      ...option,
      ...others,
    };
    const resData = axios.request(options).then(
      res => (getResponseHeader ? res : res.data),
      error => Promise.reject(error)
    );
    return resData;
  },
} as any;
