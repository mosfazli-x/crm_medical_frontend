import { watch, type Directive, type DirectiveBinding } from 'vue'

const dirClass = { fa: 'rtl', en: 'ltr' } as const

export default defineNuxtPlugin(() => {
  const nuxtApp = useNuxtApp()
  const app = nuxtApp.vueApp
  const i18n = nuxtApp.$i18n

  app.directive<HTMLElement, string>('dir', {
    mounted(el: HTMLElement, _binding: DirectiveBinding) {
      const update = () => {
        el.classList.remove('rtl', 'ltr')
        el.classList.add(dirClass[i18n.locale.value as 'fa' | 'en'] ?? 'rtl')
      }

      update()
      ;(el as any).__dirStop = watch(() => i18n.locale.value, update)
    },

    unmounted(el: HTMLElement) {
      ;(el as any).__dirStop?.()
      el.classList.remove('rtl', 'ltr')
    },
  })
})
