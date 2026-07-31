export const LEAD_STATUSES = [
  'new',
  'contacted',
  'qualified',
  'appointment_booked',
  'visited',
  'converted',
  'lost',
] as const
export type LeadStatus = (typeof LEAD_STATUSES)[number]

export const LEAD_PRIORITIES = ['low', 'medium', 'high'] as const
export type LeadPriority = (typeof LEAD_PRIORITIES)[number]

export const LEAD_LOST_REASONS = [
  'not_interested',
  'budget',
  'competitor',
  'unreachable',
  'wrong_number',
  'duplicate',
  'other',
] as const
export type LeadLostReason = (typeof LEAD_LOST_REASONS)[number]

export const LEAD_ACTIVITY_TYPES = [
  'created',
  'contacted',
  'note_added',
  'status_changed',
  'assigned',
  'qualified',
  'appointment_booked',
  'visit_completed',
  'converted',
  'lost',
] as const
export type LeadActivityType = (typeof LEAD_ACTIVITY_TYPES)[number]

export const LEAD_SOURCE_TYPES = [
  'instagram',
  'google_ads',
  'google_search',
  'website',
  'referral',
  'walk_in',
  'whatsapp',
  'telegram',
  'phone_call',
  'other',
] as const
export type LeadSourceType = (typeof LEAD_SOURCE_TYPES)[number]

export const LEAD_SOURCE_CATEGORIES = [
  'social',
  'paid_ads',
  'organic',
  'referral',
  'direct',
  'messaging',
  'other',
] as const
export type LeadSourceCategory = (typeof LEAD_SOURCE_CATEGORIES)[number]

export interface LeadSource {
  id: string
  name: string
  type: LeadSourceType
  category: LeadSourceCategory
  description?: string | null
  color: string
  sortOrder: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Lead {
  id: string
  firstName: string
  lastName: string
  phone: string | null
  nationalId: string | null
  sourceId: string | null
  sourceName: string | null
  sourceType: LeadSourceType | null
  sourceCategory: LeadSourceCategory | null
  campaignName: string | null
  status: LeadStatus
  priority: LeadPriority
  tags: string[]
  expectedServiceId: string | null
  expectedServiceCode: string | null
  expectedServiceName: string | null
  expectedVisitTypeId: string | null
  expectedVisitTypeName: string | null
  expectedValue: number | string | null
  assignedStaffId: string | null
  assignedStaffName: string | null
  assignedDoctorId: string | null
  assignedDoctorName: string | null
  firstContactAt: string | null
  lastContactAt: string | null
  nextFollowUpAt: string | null
  lastActivityAt: string | null
  convertedPatientId: string | null
  conversionDate: string | null
  convertedById: string | null
  convertedByName: string | null
  lostReason: LeadLostReason | null
  lostAt: string | null
  note: string | null
  marketingConsent: boolean
  createdAt: string
  updatedAt: string
}

export interface LeadActivity {
  id: string
  type: LeadActivityType
  note: string | null
  oldStatus: LeadStatus | null
  newStatus: LeadStatus | null
  metadata: Record<string, unknown> | null
  createdAt: string
  performedBy: string | null
  performedByName: string | null
}

export interface LeadNote {
  id: string
  body: string
  createdAt: string
  authorId: string | null
  authorName: string | null
}

export interface LeadDetail extends Lead {
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  referrerUrl: string | null
  landingUrl: string | null
  marketingConsentAt: string | null
  conversionNote: string | null
  convertedByName: string | null
  activities: LeadActivity[]
  notes: LeadNote[]
}

export interface LeadPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface LeadsListResponse {
  success: boolean
  data: Lead[]
  pagination: LeadPagination
}

export interface LeadSummary {
  totalLeads: number
  activeLeads: number
  convertedLeads: number
  lostLeads: number
  conversionRate: number
  avgDaysToConvert: number | null
  expectedValue: { total: number; converted: number }
  pipeline: { status: LeadStatus; count: number }[]
  bySource: { sourceId: string | null; sourceName: string | null; sourceType: string | null; category: string | null; count: number }[]
  byCategory: { category: string; count: number }[]
  followUps: { overdue: number; today: number; upcoming: number }
}

export interface LeadFilters {
  page?: number
  limit?: number
  status?: LeadStatus | ''
  priority?: LeadPriority | ''
  sourceId?: string | ''
  tag?: string | ''
  q?: string
  dueFollowUp?: 'overdue' | 'today' | 'upcoming' | ''
  sort?: string
}
