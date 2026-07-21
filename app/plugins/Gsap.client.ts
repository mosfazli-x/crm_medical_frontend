import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { defineNuxtPlugin, useNuxtApp } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger)

  // Keep ScrollTrigger's measurements in sync with Nuxt page transitions
  // and any layout shifts caused by lazy-loaded images/Lottie assets.
  const nuxtApp = useNuxtApp()
  nuxtApp.hook('page:finish', () => {
    requestAnimationFrame(() => ScrollTrigger.refresh())
  })

  return {
    provide: {
      gsap,
      ScrollTrigger
    }
  }
})