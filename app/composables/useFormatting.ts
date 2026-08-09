import moment from 'moment-jalaali'
import { numberToWords } from '@persian-tools/persian-tools'

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

  const toPriceNumber = (amount: number | string | null | undefined): number => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return num === null || num === undefined ? NaN : num
  }

  const formatPriceDetail = (amount: number | string | null | undefined) => {
    const num = toPriceNumber(amount)
    if (isNaN(num)) return { digits: '', unit: t('common.toman'), words: '', hasValue: false }
    const unit = t('common.toman')
    const digits = new Intl.NumberFormat(isFa.value ? 'fa-IR' : 'en-US').format(num)
    const words = isFa.value ? `${numberToWords(Math.round(num))} ${unit}` : ''
    return { digits, unit, words, hasValue: true }
  }

  const formatPriceWords = (amount: number | string | null | undefined) => {
    return formatPriceDetail(amount).words
  }

  const formatThousandToman = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(num) || num <= 0) return ''
    const formatted = new Intl.NumberFormat(isFa.value ? 'fa-IR' : 'en-US').format(num / 1000)
    return formatted + ' ' + t('common.thousandToman')
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

  const formatMinutes = (mins: number | null | undefined) => {
    if (mins === null || mins === undefined || Number.isNaN(mins)) return '---'
    const h = Math.floor(mins / 60)
    const m = mins % 60
    if (h === 0 && m === 0) return isFa.value ? '۰' : '0'
    const hLabel = t('schedule.timeShortHour')
    const mLabel = t('schedule.timeShortMinute')
    if (h === 0) return `${m}${mLabel}`
    if (m === 0) return `${h}${hLabel}`
    return `${h}${hLabel} ${m}${mLabel}`
  }

  return { formatJalaliDate, formatGregorianDate, formatJalaliDateShort, formatJalaliLong, formatPrice, formatPriceDetail, formatPriceWords, formatThousandToman, toDateStr, toJalaliStr, todayJalali, formatMinutes }
}