import { useHead, useSeoMeta } from "nuxt/app"

/**
 * Central SEO setup for the landing page: meta tags, OpenGraph, and
 * MedicalClinic JSON-LD structured data. Call once from pages/index.vue.
 */
export function useClinicSeo() {
  const title = 'کلینیک دکتر حسینی | مراقبت پزشکی تخصصی با رویکردی مدرن'
  const description =
    'ارائه خدمات تشخیص، درمان و مشاوره توسط پزشکان متخصص کلینیک دکتر حسینی، با بهره‌گیری از جدیدترین تجهیزات پزشکی. رزرو نوبت آنلاین در کمتر از ۶۰ ثانیه.'
  const url = 'https://lotusclinic.example.com'
  const ogImage = `${url}/og-cover.jpg`

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage,
    ogType: 'website',
    ogLocale: 'fa_IR',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: ogImage
  })

  useHead({
    htmlAttrs: { lang: 'fa', dir: 'rtl' },
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
            addressLocality: 'تهران'
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