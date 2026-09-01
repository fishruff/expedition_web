/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { fileURLToPath } from 'node:url'

const src = fileURLToPath(new URL('./src', import.meta.url))
const contract = fileURLToPath(new URL('./contract', import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],
  /**
   * Метка сборки. Ею сбрасывается кеш у картинок из `public/`: они уезжают
   * к посетителю под своим именем, без хеша, поэтому замена файла сама по себе
   * до вернувшегося игрока не доедет.
   *
   * Арты участников владелец меняет чуть ли не ежедневно, и проставлять им
   * версию руками — работа, которую всё равно забудут. Файл и сборка едут
   * вместе, значит метка сборки и есть их версия.
   */
  define: {
    __BUILD_ID__: JSON.stringify(Date.now().toString(36)),
  },
  resolve: {
    alias: {
      '@': src,
      // Формы обмена: их знают сайт, приёмник и плагин. Лежат вне `src`, потому
      // что приёмник не должен зависеть от каталога сайта, чтобы собраться.
      '@contract': contract,
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
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
