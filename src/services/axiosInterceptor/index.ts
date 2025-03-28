/*
 * @Author: 祝占朋 wb.zhuzhanpeng01@mesg.corp.netease.com
 * @Date: 2024-01-09 15:28:56
 * @LastEditors: 祝占朋 wb.zhuzhanpeng01@mesg.corp.netease.com
 * @LastEditTime: 2024-01-11 11:33:25
 * @FilePath: /QAnything/front_end/src/services/axiosInterceptor/index.ts
 * @Description:
 */

import axios from 'axios';
import interceptors from './interceptors/index';
axios.defaults.withCredentials = false;

// 创建实例
const http = axios.create({
  headers: {},
});

// 添加一个自定义拦截器移除KnowledgeBase前缀
http.interceptors.request.use(config => {
  // 检查URL是否包含/KnowledgeBase/kb_api或/KnowledgeBase/ip_service
  if (config.url && (
    config.url.includes('/KnowledgeBase/kb_api') || 
    config.url.includes('/KnowledgeBase/ip_service')
  )) {
    // 移除KnowledgeBase前缀
    config.url = config.url.replace('/KnowledgeBase', '');
    console.log('Fixed URL:', config.url);
  }
  return config;
});

function isInterceptor(config: any, name: string) {
  return config[name];
}
function getInterceptors() {
  return {
    ...interceptors,
  };
}
const alwaysOpen = ['errorToast', 'rdLoginReqToken'];
function runInterceptors(instance: any) {
  if (!instance) return;
  const allInterceptor = getInterceptors() as any;
  Object.keys(allInterceptor).forEach(name => {
    const interceptor = allInterceptor[name];
    if (interceptor.request || interceptor.requestError) {
      instance.interceptors.request.use(
        (config: any) => {
          if (
            alwaysOpen.indexOf(name) > -1 ||
            (interceptor.request && isInterceptor(config, name))
          ) {
            return interceptor.request(config, instance);
          }
          return config;
        },
        (error: any) => {
          if (interceptor.requestError) {
            // && error.config[name]请求报错自动开启toast提示
            return interceptor.requestError(error);
          }
          return Promise.reject(error);
        }
      );
    }
    if (interceptor.response || interceptor.responseError) {
      instance.interceptors.response.use(
        (response: any) => {
          return cheakcCanResponse(response, name, interceptor, instance);
        },
        (error: any) => {
          const { config = {}, headers = {} } = error;
          const responseData = {
            config,
            statusText: 'OK',
            headers,
            status: 200,
            data: {
              code: 500,
              data: '',
              msg: '请求失败',
            },
          };
          if (interceptor.responseError && (config[name] || alwaysOpen.indexOf(name) > -1)) {
            interceptor.responseError(error, instance);
          }
          return cheakcCanResponse(responseData, name, interceptor, instance);
          // return Promise.reject(error);
        }
      );
    }
  });
}
function cheakcCanResponse(response, name, interceptor, instance) {
  const { config = {} } = response || {};
  if (alwaysOpen.indexOf(name) > -1 || (interceptor.response && config[name])) {
    return interceptor.response(response, instance);
  }
  return response;
}

runInterceptors(http);
export default http;
