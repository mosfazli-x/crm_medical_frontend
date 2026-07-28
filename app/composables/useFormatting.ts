import moment from 'moment-jalaali'

export const useFormatting = () => {
  const formatJalaliDate = (date: string | null | undefined) => {
    if (!date) return '---'
    // Shamsi date string like "1404-05-01"
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return moment(date, 'jYYYY-jMM-jDD').format('jDD jMMMM jYYYY')
    }
    // Gregorian date string fallback
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
    return d.toLocaleDateString('fa-IR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatPrice = (amount: number | string) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(num)) return '۰'
    return new Intl.NumberFormat('fa-IR').format(num) + ' تومان'
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

  return { formatJalaliDate, formatJalaliDateShort, formatJalaliLong, formatPrice, toDateStr, toJalaliStr, todayJalali }
}
