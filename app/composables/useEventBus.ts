// composables/useEventBus.ts
import mitt from 'mitt'

type Events = {
  'patient:changed': void
}

const emitter = mitt<Events>()

export const useEventBus = () => {
  return {
    emit: emitter.emit,
    on: emitter.on,
    off: emitter.off,
  }
}