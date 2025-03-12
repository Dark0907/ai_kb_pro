enum EUrlType {
  POST = 'ipsPost',
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
interface IIpsConfig {
  [key: string]: IUrlValueConfig;
}
import services from '.';
import Cookies from 'js-cookie';
import { message } from 'ant-design-vue';
let ips_token = Cookies.get('IPSERVICE_token');

if (!ips_token) {
  ips_token = getHashParameter('token');
}
export const ipsToken = ips_token;

function getHashParameter(name: string) {
  const hash = window.location.hash;
  const urlSearchParams = new URLSearchParams(hash.split('?')[1]);
  return urlSearchParams.get(name);
}

//ajax请求接口
const ipsConfig: IIpsConfig = {
  // 获取用户操作知识库的权限
  ipsKbLibPermission: {
    type: EUrlType.POST,
    url: 'ip_service/interface/kbmg/queryKbLibPermission',
    showLoading: true,
    param: {
      tokenID: ipsToken,
    },
  },
  // 获取知识库列表
  ipsKbList: {
    type: EUrlType.POST,
    url: 'ip_service/interface/kbmg/queryUserLibList',
    showLoading: true,
    param: {
      tokenID: ipsToken,
    },
  },
  // 新建知识库
  ipsCreateKb: {
    type: EUrlType.POST,
    url: 'ip_service/interface/kbmg/addKbLib',
    showLoading: true,
    param: {
      tokenID: ipsToken,
    },
  },
  // 删除知识库
  ipsDeleteKB: {
    type: EUrlType.POST,
    url: 'ip_service/interface/kbmg/deleteKbLib',
    param: {
      tokenID: ipsToken,
    },
  },
  // 重命名知识库
  ipsKbConfig: {
    type: EUrlType.POST,
    url: 'ip_service/interface/kbmg/reNameKbLib',
    param: {
      tokenID: ipsToken,
    },
  },
  // 用户正式库，勾选保存
  ipsKbCheck: {
    type: EUrlType.POST,
    url: 'ip_service/interface/kbmg/updateUserCheck',
    param: {
      tokenID: ipsToken,
    },
  },
};
const urlResquest: any = {};
Object.keys(ipsConfig).forEach(key => {
  urlResquest[key] = (params: any, option: any = {}) => {
    // 检查是否有 ipsToken
    if (!ipsToken) {
      message.error('请先登录ips,在进行访问！');
      return Promise.reject('未登录');
    }
    const { type, url, param, ...other } = ipsConfig[key];
    const queryString = new URLSearchParams({ ...param, ...params }).toString();
    return services[type](url, queryString, { ...other, ...option });
  };
});
export default urlResquest;
