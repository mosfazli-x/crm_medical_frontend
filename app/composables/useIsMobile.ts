/**
 * SSR-safe mobile viewport detection.
 *
 * The server reads the User-Agent so the very first paint already renders the
 * right branch (no layout flash / hydration mismatch), then the client keeps a
 * media query in sync and reacts to live viewport changes (rotation, resize,
 * devtools toggling). The state is shared through `useState` so every consumer
 * — pages and components — agrees on a single value.
 */
const MOBILE_MEDIA_QUERY = '(max-width: 1023px)'

function userAgentIsMobile(userAgent: string): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|Windows Phone/i.test(
    userAgent,
  )
}

export function useIsMobile() {
  const isMobile = useState<boolean>('is-mobile-device', () => false)

  if (import.meta.server) {
    const headers = useRequestHeaders(['user-agent'])
    isMobile.value = userAgentIsMobile(headers['user-agent'] || '')
  }

  if (import.meta.client) {
    onMounted(() => {
      const query = window.matchMedia(MOBILE_MEDIA_QUERY)
      isMobile.value = query.matches

      const onChange = (event: MediaQueryListEvent) => {
        isMobile.value = event.matches
      }

      query.addEventListener('change', onChange)
      onBeforeUnmount(() => query.removeEventListener('change', onChange))
    })
  }

  return isMobile
}
