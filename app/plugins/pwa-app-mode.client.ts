import { APP_HOME, usePwaApp } from '~/composables/usePwaApp'

/**
 * When the clinic PWA is launched as an installed app (standalone display
 * mode), redirect its entry routes to the native-style `/app` shell. Runs on
 * the client only and is a no-op in a normal browser tab, so the standard
 * website is unaffected.
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client) return

  const { detectStandalone, isAppEntryRoute } = usePwaApp()
  if (!detectStandalone()) return

  const router = nuxtApp.$router

  const steer = (path: string) => {
    if (isAppEntryRoute(path)) void router.replace(APP_HOME)
  }

  void router.isReady().then(() => steer(router.currentRoute.value.path))
  router.afterEach((to) => steer(to.path))
})
