import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import progress from 'vite-plugin-progress';

export default defineConfig({
  plugins: [createVuePlugin(), progress()]
})