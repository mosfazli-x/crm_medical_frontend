import { useHead, useSeoMeta } from "nuxt/app"

export function useClinicSeo() {
  const { t, locale } = useI18n()

  const title = computed(() => t('seo.title'))
  const description = computed(() => t('seo.description'))
  const url = 'https://lotusclinic.example.com'
  const ogImage = `${url}/og-cover.jpg`

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage,
    ogType: 'website',
    ogLocale: computed(() => locale.value === 'fa' ? 'fa_IR' : 'en_US'),
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImage
  })

  useHead({
    htmlAttrs: computed(() => ({ lang: locale.value, dir: locale.value === 'fa' ? 'rtl' : 'ltr' })),
    link: [{ rel: 'canonical', href: url }],
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'MedicalClinic',
          name: 'کلینیک دکتر حسینی',
          url,
          image: ogImage,
          telephone: '+98-21-0000-0000',
          priceRange: '$$$',
          address: {
            '@type': 'PostalAddress',
            addressCountry: 'IR',
            addressLocality: 'Tehran'
          },
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'],
              opens: '08:00',
              closes: '20:00'
            },
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: ['Thursday'],
              opens: '08:00',
              closes: '14:00'
            }
          ],
          medicalSpecialty: [
            'General Practice',
            'Internal Medicine',
            'Dermatology',
            'Cardiology'
          ],
          sameAs: []
        })
      }
    ]
  })
}