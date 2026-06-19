declare module 'moment-jalaali' {
  import { Moment as BaseMoment, MomentFormatSpecification, MomentInput } from 'moment'

  interface JalaaliMoment extends BaseMoment {
    jYear(): number
    jYear(y: number): JalaaliMoment
    jMonth(): number
    jMonth(m: number): JalaaliMoment
    jDate(): number
    jDate(d: number): JalaaliMoment
    jDayOfYear(): number
    jWeekday(): number
    jIsLeapYear(): boolean
    jDaysInMonth(): number
    format(format?: string): string
  }

  interface MomentJalaaliStatic {
    (inp?: MomentInput, format?: MomentFormatSpecification, strict?: boolean): JalaaliMoment
    jDaysInMonth(year: number, month: number): number
    loadPersian(options?: { dialect?: string; usePersianDigits?: boolean }): void
    jIsLeapYear(year: number): boolean
  }

  const moment: MomentJalaaliStatic
  export default moment
}
