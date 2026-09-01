/// <reference types="vite/client" />

/**
 * Метка сборки — подставляется Vite через `define`, см. `vite.config.ts`.
 * Ею версионируются картинки из `public/`: у них нет хеша в имени.
 */
declare const __BUILD_ID__: string
