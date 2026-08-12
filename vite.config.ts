import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { fileURLToPath } from 'node:url'

const src = fileURLToPath(new URL('./src', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  resolve: {
    alias: {
      '@': src,
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Токены и миксины доступны в каждом *.scss без ручного @use
        loadPaths: [`${src}/styles`],
        additionalData: '@use "core" as *;\n',
      },
    },
  },
})
