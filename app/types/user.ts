export type UserRole = 'admin_doctor' | 'doctor' | 'lab' | 'pharmacy' | 'patient'
export type UserStatus = 'pending' | 'approved' | 'rejected'

export interface User {
  id: string
  fullName: string
  phone: string
  role: UserRole
  status: UserStatus
  organizationName?: string
  email?: string
  smsEnabled: boolean
  telegramEnabled: boolean
  createdAt?: string
}
