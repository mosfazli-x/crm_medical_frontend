export type DashboardSectionId =
  | 'alerts'
  | 'quickActions'
  | 'keyMetrics'
  | 'statistics'
  | 'insights'
  | 'dailyBreakdowns'
  | 'supplementary'
  | 'schedule'

export type DashboardSectionSize = 'small' | 'medium' | 'large'

export interface DashboardSectionConfig {
  id: DashboardSectionId
  visible: boolean
  size: DashboardSectionSize
  title: string | null
}

export interface DashboardLayout {
  version: number
  sections: DashboardSectionConfig[]
}

export const DASHBOARD_LAYOUT_VERSION = 1

export const DASHBOARD_SECTION_IDS: DashboardSectionId[] = [
  'alerts',
  'quickActions',
  'keyMetrics',
  'statistics',
  'insights',
  'dailyBreakdowns',
  'supplementary',
  'schedule',
]

export const DASHBOARD_SECTION_SIZE_OPTIONS: { value: DashboardSectionSize; span: number }[] = [
  { value: 'small', span: 4 },
  { value: 'medium', span: 8 },
  { value: 'large', span: 12 },
]