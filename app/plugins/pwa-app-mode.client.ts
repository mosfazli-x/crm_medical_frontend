import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { usePwaApp } from '~/composables/usePwaApp'

/**
 * When the clinic PWA is launched as an installed app (standalone display
 * mode), redirect its entry routes to the native-style `/app` shell. Runs on
 * the client only and is a no-op in a normal browser tab, so the standard
 * website is unaffected.
 */
export default defineNuxtPlugin((nuxtApp) => {
  if (!import.meta.client) return

  const { detectStandalone, resolveAppEntryRoute } = usePwaApp()
  if (!detectStandalone()) return

  const router = nuxtApp.$router

  const steer = (route: Pick<RouteLocationNormalizedLoaded, 'path' | 'query' | 'hash'>) => {
    const target = resolveAppEntryRoute(route.path, route.query)
    if (target) void router.replace({ path: target, query: route.query, hash: route.hash })
  }

  void router.isReady().then(() => steer(router.currentRoute.value))
  router.afterEach((to, _from, failure) => {
    if (!failure) steer(to)
  })
})
