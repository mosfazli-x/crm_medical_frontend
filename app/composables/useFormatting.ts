import moment from 'moment-jalaali'

const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export const useFormatting = () => {
  const { locale, t } = useI18n()
  const isFa = computed(() => locale.value === 'fa')

  const formatJalaliDate = (date: string | null | undefined) => {
    if (!date) return '---'
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return moment(date, 'jYYYY-jMM-jDD').format('jDD jMMMM jYYYY')
    }
    return moment(date).format('jDD jMMMM jYYYY')
  }

  const formatGregorianDate = (date: string | null | undefined) => {
    if (!date) return '---'
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return moment(date, 'YYYY-MM-DD').format('jDD jMMMM jYYYY')
    }
    return moment(date).format('jDD jMMMM jYYYY')
  }

  const formatJalaliDateShort = (date: string | null | undefined) => {
    if (!date) return '---'
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return moment(date, 'jYYYY-jMM-jDD').format('jYYYY/jMM/jDD')
    }
    return moment(date).format('jYYYY/jMM/jDD')
  }

  const formatJalaliLong = (date?: Date) => {
    const d = date ?? new Date()
    return d.toLocaleDateString(isFa.value ? 'fa-IR' : 'en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatPrice = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(num)) return isFa.value ? '۰' : '0'
    const formatted = new Intl.NumberFormat(isFa.value ? 'fa-IR' : 'en-US').format(num)
    return formatted + ' ' + t('common.toman')
  }

  const toDateStr = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  const toJalaliStr = (date: Date) => {
    return moment(date).format('jYYYY-jMM-jDD')
  }

  const todayJalali = () => {
    return moment().format('jYYYY-jMM-jDD')
  }

  return { formatJalaliDate, formatGregorianDate, formatJalaliDateShort, formatJalaliLong, formatPrice, toDateStr, toJalaliStr, todayJalali }
}