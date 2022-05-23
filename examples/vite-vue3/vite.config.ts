import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import progress from 'vite-plugin-progress';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src')
        }
    },
    plugins: [vue(), progress({
        format: 'building [:bar] :percent',
        total: 200,
        width: 60,
        complete: '=',
        incomplete: '',
    })],
    server: {
        port: 8080,
        hmr: {
            host: 'localhost',
            port: 8080
        },
        proxy: {
            '/api': {
                target: 'your https address',
                changeOrigin: true,
                rewrite: (path: string) => path.replace(/^\/api/, '')
            }
        }
    }
});
