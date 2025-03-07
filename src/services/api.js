// 定义与后端 API 交互的函数，包括 GET 和 POST 请求等。
import axios from 'axios';

export const API_URL = import.meta.env.VITE_APP_MODE === 'dev' ? '' : import.meta.env.VITE_APP_API_HOST; // 使用 Vite 环境变量

const createRequestOptions = (method, url, data = {}, option = {}) => {
  const { getResponseHeader, ...others } = option;
  return {
    method,
    url,
    mode: 'cors',
    withCredentials: false,
    validateStatus: (status) => status >= 200 && status < 300, // 默认的状态码验证
    ...others,
    ...(method === 'get' ? { params: data } : { data }),
  };
};

const handleResponse = (response, getResponseHeader) => {
  return getResponseHeader ? response : response.data;
};

export default {
  async get(baseUrl, _query = {}, option = {}) {
    const url = /http/.test(baseUrl) ? baseUrl : `${API_URL}${baseUrl}`;
    const options = createRequestOptions('get', url, _query, option);
    
    try {
      const response = await axios.request(options);
      return handleResponse(response, option.getResponseHeader);
    } catch (error) {
      console.error('GET 请求失败:', error);
      throw error; // 抛出错误以便调用者处理
    }
  },

  async post(baseUrl, data = {}, option = {}) {
    const url = /http/.test(baseUrl) ? baseUrl : `${API_URL}${baseUrl}`;
    const options = createRequestOptions('post', url, data, option);
    
    try {
      const response = await axios.request(options);
      return handleResponse(response, option.getResponseHeader);
    } catch (error) {
      console.error('POST 请求失败:', error);
      throw error; // 抛出错误以便调用者处理
    }
  },

  async ipsPost(baseUrl, data = {}, option = {}) {
    const url = /http/.test(baseUrl) ? baseUrl : `${API_URL}${baseUrl}`;
    const options = createRequestOptions('post', url, data, option);
    
    try {
      const response = await axios.request(options);
      return handleResponse(response, option.getResponseHeader);
    } catch (error) {
      console.error('IPS POST 请求失败:', error);
      throw error; // 抛出错误以便调用者处理
    }
  },
};