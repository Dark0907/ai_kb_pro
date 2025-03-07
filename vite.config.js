import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

function resovePath(paths) {
  return path.resolve(__dirname, paths);
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    // 设置别名
    alias: {
      '@': resovePath('src'),
      '@views/': resovePath('src/views'),
      '@comps': resovePath('./src/components'),
      '@imgs': resovePath('./src/assets/img'),
      '@icons': resovePath('./src/assets/icons'),
      '@utils': resovePath('./src/utils'),
      '@stores': resovePath('./src/store'),
      '@plugins': resovePath('./src/plugins'),
      '@styles': resovePath('./src/styles'),
      '@services': resovePath('./src/services'),
    },
  },
  server: {
    host: '0.0.0.0', // 监听所有 IP 地址
    port: 5173, // 默认端口
    strictPort: false, // 如果端口已被占用，则尝试下一个可用端口
    open: false, // 启动时不自动打开浏览器
    usePolling: true,
    fs: {
      strict: false,
    },
    cors: true,
    proxy: {
      // 请求地址
      '/kb_api': {
        target: 'https://ipc.wanhuida.com/kb_api/',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/kb_api/, ''), 
      },
      // '/kb_api': {
      //   target: 'http://192.168.89.6:8777',
      //   changeOrigin: true,
      //   rewrite: path => path.replace(/^\/kb_api/, '/api'), 
      // },
      '/ip_service': {
        target: 'http://192.168.0.168:8000',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/ip_service/, '/ip_service'),
      }
    },
  },
})
