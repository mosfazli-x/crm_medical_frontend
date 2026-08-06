import { defineNitroPlugin } from 'nitropack/runtime'
import { getCookie } from 'h3'

const SUPPORTED = new Set(['fa', 'en'])

export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('render:before', ({ event }) => {
    const cookie = getCookie(event, 'i18n_lang')
    if (!cookie || !SUPPORTED.has(cookie)) return
    const ctx = event.context.nuxtI18n
    if (ctx?.vueI18nOptions && ctx.vueI18nOptions.locale !== cookie) {
      ctx.vueI18nOptions.locale = cookie
    }
  })
})
