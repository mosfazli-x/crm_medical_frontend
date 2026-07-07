export const useFormatting = () => {
  const formatJalaliDate = (date: string | null | undefined, options?: Intl.DateTimeFormatOptions) => {
    if (!date) return '---'
    const defaults: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }
    return new Intl.DateTimeFormat('fa-IR', options ?? defaults).format(new Date(date))
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

  return { formatJalaliDate, formatJalaliLong, formatPrice, toDateStr }
}
