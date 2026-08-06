export default defineNuxtPlugin({
  name: 'i18n-cookie',
  dependsOn: ['i18n:plugin'],
  async setup(nuxtApp) {
    if (!import.meta.client) return
    const cookie = useCookie('i18n_lang').value
    if (cookie !== 'fa' && cookie !== 'en') return
    const i18n = nuxtApp.$i18n
    const current = i18n.locale?.value ?? i18n.locale
    if (current !== cookie) {
      await i18n.setLocale(cookie)
    }
  },
})
