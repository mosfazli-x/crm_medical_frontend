export type ProcedureKey = 'mixed_laser' | 'single_laser' | 'colonoscopy' | 'co2_test' | 'other'

export type PaymentMethod = 'card_terminal' | 'cash'

export interface DailyReport {
  id: string
  reportDate: string
  patientId: string
  visitTypes: string[]
  procedures: ProcedureKey[]
  otherProcedureText: string | null
  feeCollected: string | null
  paymentMethod: PaymentMethod
  notes: string | null
  recordedById: string | null
  createdAt: string
  patientFirstName: string | null
  patientLastName: string | null
  patientNationalId: string | null
  patientPhone: string | null
  patientInsuranceType: string | null
}

export interface DailyReportPayload {
  reportDate: string
  patientId: string
  visitTypes: string[]
  procedures: ProcedureKey[]
  otherProcedureText: string | null
  feeCollected: number | null
  paymentMethod: PaymentMethod
  notes: string | null
}

export interface DailyReportListFilters {
  reportDate?: string
  from?: string
  to?: string
  paymentMethod?: string
  procedure?: string
  visitType?: string
  patientId?: string
}

export type DailyReportStatsFilters = Pick<
  DailyReportListFilters,
  'from' | 'to' | 'paymentMethod' | 'procedure' | 'visitType' | 'patientId'
>

export interface DailyReportVisitType {
  id: string
  name: string
  description: string | null
  price: string | null
  color: string | null
  isActive: boolean
  isDeleted: boolean
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface DailyReportVisitTypePayload {
  name: string
  description?: string | null
  price?: number | null
  color?: string | null
}

export interface DailyReportStats {
  totalReports: number
  totalCollected: string
  average: string
  byDay: { date: string; count: number; total: string }[]
  byPaymentMethod: { payment_method: string; count: number; total: string }[]
  byProcedure: { procedure: string; count: number; total: string }[]
  byVisitType: { name: string; count: number; total: string }[]
}

export interface PatientOption {
  id: string
  firstName: string
  lastName: string
  nationalId: string
  phone: string | null
  birthDate: string | null
  insuranceCode: string | null
  insuranceType: string | null
  maritalStatus: string | null
  createdAt: string
}
