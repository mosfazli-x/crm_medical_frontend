import { computed } from 'vue'

const servicesData = [
  { icon: 'heart', titleKey: 'landing.services.cardiologyTitle', descKey: 'landing.services.cardiologyDesc', colorClass: 'blue' },
  { icon: 'shield', titleKey: 'landing.services.dermatologyTitle', descKey: 'landing.services.dermatologyDesc', colorClass: 'cyan' },
  { icon: 'pulse', titleKey: 'landing.services.generalTitle', descKey: 'landing.services.generalDesc', colorClass: 'indigo' },
  { icon: 'flask', titleKey: 'landing.services.labTitle', descKey: 'landing.services.labDesc', colorClass: 'sky' },
  { icon: 'clock', titleKey: 'landing.services.emergencyTitle', descKey: 'landing.services.emergencyDesc', colorClass: 'violet' },
  { icon: 'users', titleKey: 'landing.services.consultTitle', descKey: 'landing.services.consultDesc', colorClass: 'teal' },
]

const doctorsData = [
  { name: 'دکتر سارا احمدی', nameEn: 'Dr. Sarah Mitchell', specialty: 'متخصص قلب', specialtyEn: 'Cardiologist', experience: '۱۵ سال', experienceEn: '15 years', patients: '۵,۰۰۰+', patientsEn: '5,000+', rating: '4.9', img: '/images/dr_hosseini_2.webp' },
  { name: 'دکتر جیمز چن', nameEn: 'Dr. James Chen', specialty: 'متخصص پوست', specialtyEn: 'Dermatologist', experience: '۱۲ سال', experienceEn: '12 years', patients: '۳,۲۰۰+', patientsEn: '3,200+', rating: '4.8', img: '' },
  { name: 'دکتر النا رودریگز', nameEn: 'Dr. Elena Rodriguez', specialty: 'طب عمومی', specialtyEn: 'General Practitioner', experience: '۱۰ سال', experienceEn: '10 years', patients: '۸,۵۰۰+', patientsEn: '8,500+', rating: '4.9', img: '' },
]

function toPersianNum(input: string | number): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
  return String(input).replace(/\d/g, d => persianDigits[Number(d)])
}

export function useLang() {
  const { t: i18nT, locale, setLocale } = useI18n()

  const lang = computed(() => locale.value as 'fa' | 'en')

  function t(key: string): string {
    return i18nT(key).toString()
  }

  async function toggleLang() {
    const newLang = lang.value === 'fa' ? 'en' : 'fa'
    await setLocale(newLang)
    if (typeof document !== 'undefined') {
      document.documentElement.dir = newLang === 'fa' ? 'rtl' : 'ltr'
      document.documentElement.lang = newLang
    }
  }

  const isRtl = computed(() => lang.value === 'fa')

  function pn(input: string | number): string {
    if (lang.value !== 'fa') return String(input)
    return toPersianNum(input)
  }

  const testimonials = computed(() => {
    return i18nT('landing.testimonials.items', { missingWarn: false }) as unknown as Array<{ text: string; name: string; role: string; initials: string }>
  })

  const contactItems = computed(() => [
    { icon: 'phone', labelKey: 'landing.contact.phone', value: i18nT('landing.contact.phoneValue').toString() },
    { icon: 'pin', labelKey: 'landing.contact.address', value: i18nT('landing.contact.addressValue').toString() },
    { icon: 'clock', labelKey: 'landing.contact.hours', value: i18nT('landing.contact.hoursValue').toString() },
  ])

  return {
    lang,
    t,
    toggleLang,
    isRtl,
    pn,
    toPersianNum,
    services: servicesData,
    doctors: doctorsData,
    testimonials,
    contactItems,
  }
}
