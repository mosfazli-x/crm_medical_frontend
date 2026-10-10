import { defineNuxtPlugin } from 'nuxt/app'

/**
 * Attaches the `beforeinstallprompt` listener as early as possible so we
 * never miss the one-shot event before the install dialog mounts.
 */
export default defineNuxtPlugin(() => {
  initPwaInstall()
})
