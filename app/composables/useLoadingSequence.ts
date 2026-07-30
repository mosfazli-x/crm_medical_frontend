export const LOADING_STATUSES = [
  'Connecting to Medical Records',
  'Loading Patient Database',
  'Synchronizing Appointments',
  'Preparing Dashboard',
  'Initializing AI Assistant',
  'Finalizing Workspace',
] as const

export type LoadingStatus = (typeof LOADING_STATUSES)[number]

export function useLoadingSequence() {
  const currentIndex = ref(0)
  const progress = ref(0)
  const isComplete = ref(false)

  const SOFT_CAP = 92

  let interval: ReturnType<typeof setInterval> | null = null

  function start() {
    if (interval) return
    interval = setInterval(() => {
      const remaining = SOFT_CAP - progress.value
      progress.value += Math.max(remaining * 0.12, 0.15)
      if (progress.value >= SOFT_CAP) {
        progress.value = SOFT_CAP
        stop()
      }
      if (progress.value > 15 && currentIndex.value === 0) currentIndex.value = 1
      else if (progress.value > 32 && currentIndex.value === 1) currentIndex.value = 2
      else if (progress.value > 50 && currentIndex.value === 2) currentIndex.value = 3
      else if (progress.value > 68 && currentIndex.value === 3) currentIndex.value = 4
      else if (progress.value > 84 && currentIndex.value === 4) currentIndex.value = 5
    }, 120)
  }

  function stop() {
    if (interval) {
      clearInterval(interval)
      interval = null
    }
  }

  function finish() {
    stop()
    progress.value = 100
    isComplete.value = true
  }

  function reset() {
    stop()
    currentIndex.value = 0
    progress.value = 0
    isComplete.value = false
  }

  return {
    currentIndex,
    progress,
    isComplete,
    statuses: LOADING_STATUSES,
    start,
    stop,
    finish,
    reset,
  }
}
