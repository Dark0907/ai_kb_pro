//对接口的返回值作统一处理
export const resultControl = async res => {
  return new Promise((resolve, reject) => {
    if (res.errorCode === '0' || res.code === 200) {
      resolve(res.result || res.data || res);
    } else if (res.errorCode === '111') {
      setUserInfo({ token: '' });
    } else {
      reject(res);
    }
  });
};