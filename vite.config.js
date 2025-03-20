import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

//不需要手动引入ref等
import AutoImport from 'unplugin-auto-import/vite';

function resovePath(paths) {
  return path.resolve(__dirname, paths);
}

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd())
  const baseUrl = env.VITE_APP_WEB_PREFIX || '/KnowledgeBase'
  
  return {
    base: baseUrl, // 设置基础路径，用于子目录部署
    plugins: [
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        //下面配置生成自动导入 eslint规则json 生成后enabled改为false，避免重复生成  esint extend导入生成的自动导入json规则
        dts: './auto-imports.d.ts',
        eslintrc: {
          enabled: true,
        },
      }),
      vue()
    ],
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
        '@language': resovePath('./src/language'),
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
        // 处理直接以/kb_api开头的请求
        '^/kb_api': {
          target: 'https://ips.wanhuida.cn/kb_api/',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/kb_api/, ''), 
        },
        // 处理直接以/ip_service开头的请求
        '^/ip_service': {
          target: 'http://192.168.0.168:8000',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/ip_service/, '/ip_service'),
        },
      },
    },
  }
})
