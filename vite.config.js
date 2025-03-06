import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0', // 监听所有 IP 地址
    port: 5173, // 默认端口
    strictPort: false, // 如果端口已被占用，则尝试下一个可用端口
    open: false, // 启动时不自动打开浏览器
  }
})
