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
  { nameKey: 'landing.doctors.doctor1Name', nameEn: 'Dr. Sarah Mitchell', specialtyKey: 'landing.doctors.doctor1Specialty', specialtyEn: 'Cardiologist', experienceKey: 'landing.doctors.doctor1Experience', experienceEn: '15 years', patientsKey: 'landing.doctors.doctor1Patients', patientsEn: '5,000+', rating: '4.9', img: '/images/dr_hosseini_2.webp' },
  { nameKey: 'landing.doctors.doctor2Name', nameEn: 'Dr. James Chen', specialtyKey: 'landing.doctors.doctor2Specialty', specialtyEn: 'Dermatologist', experienceKey: 'landing.doctors.doctor2Experience', experienceEn: '12 years', patientsKey: 'landing.doctors.doctor2Patients', patientsEn: '3,200+', rating: '4.8', img: '' },
  { nameKey: 'landing.doctors.doctor3Name', nameEn: 'Dr. Elena Rodriguez', specialtyKey: 'landing.doctors.doctor3Specialty', specialtyEn: 'General Practitioner', experienceKey: 'landing.doctors.doctor3Experience', experienceEn: '10 years', patientsKey: 'landing.doctors.doctor3Patients', patientsEn: '8,500+', rating: '4.9', img: '' },
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
    { icon: 'phone', labelKey: 'landing.contact.phone', value: i18nT('landing.contact.phoneValue').toString(), href: 'tel:09379412491' },
    { icon: 'mail', labelKey: 'landing.contact.email', value: i18nT('landing.contact.emailValue').toString(), href: 'mailto:info@ladiesneeds.com' },
    { icon: 'pin', labelKey: 'landing.contact.address', value: i18nT('landing.contact.addressValue').toString(), href: 'https://maps.app.goo.gl/PWP2be3t8YWw4YMJ8', external: true },
    { icon: 'clock', labelKey: 'landing.contact.hours', value: i18nT('landing.contact.hoursValue').toString(), href: '' },
  ])

  const doctors = computed(() => doctorsData.map(d => ({
    name: t(d.nameKey),
    nameEn: d.nameEn,
    specialty: t(d.specialtyKey),
    specialtyEn: d.specialtyEn,
    experience: t(d.experienceKey),
    experienceEn: d.experienceEn,
    patients: t(d.patientsKey),
    patientsEn: d.patientsEn,
    rating: d.rating,
    img: d.img,
  })))

  return {
    lang,
    t,
    toggleLang,
    isRtl,
    pn,
    toPersianNum,
    services: servicesData,
    doctors,
    testimonials,
    contactItems,
  }
}
