import type {
  DashboardLayout,
  DashboardSectionConfig,
  DashboardSectionId,
  DashboardSectionSize,
} from '~/types/dashboard-layout'
import { DASHBOARD_LAYOUT_VERSION } from '~/types/dashboard-layout'

const SIZES: DashboardSectionSize[] = ['small', 'medium', 'large']

function defaultSections(): DashboardSectionConfig[] {
  return [
    { id: 'alerts', visible: true, size: 'large', title: null },
    { id: 'keyMetrics', visible: true, size: 'medium', title: null },
    { id: 'quickActions', visible: true, size: 'small', title: null },
    { id: 'statistics', visible: true, size: 'large', title: null },
    { id: 'insights', visible: true, size: 'medium', title: null },
    { id: 'schedule', visible: true, size: 'small', title: null },
    { id: 'dailyBreakdowns', visible: true, size: 'large', title: null },
    { id: 'supplementary', visible: true, size: 'large', title: null },
  ]
}

export function buildDefaultLayout(): DashboardLayout {
  return { version: DASHBOARD_LAYOUT_VERSION, sections: defaultSections() }
}

function normalizeSections(sections: DashboardSectionConfig[]): DashboardSectionConfig[] {
  return sections.map((sec) => ({
    id: sec.id,
    visible: sec.visible !== false,
    size: SIZES.includes(sec.size) ? sec.size : 'medium',
    title: sec.title && sec.title.trim() ? sec.title.trim().slice(0, 40) : null,
  }))
}

function mergeLayout(saved: DashboardLayout | null | undefined): DashboardLayout {
  const defaults = defaultSections()
  if (!saved || !Array.isArray(saved.sections) || saved.sections.length === 0) {
    return buildDefaultLayout()
  }

  const byId = new Map<string, DashboardSectionConfig>(saved.sections.map((s) => [s.id, s]))
  const order = saved.sections.map((s) => s.id)
  for (const d of defaults) {
    if (!byId.has(d.id)) order.push(d.id)
  }

  const sections = order
    .filter((id, index) => order.indexOf(id) === index)
    .map((id): DashboardSectionConfig => {
      const def = defaults.find((x) => x.id === id)!
      const savedSec = byId.get(id)
      if (!savedSec) return { ...def }
      return {
        id,
        visible: savedSec.visible !== false,
        size: SIZES.includes(savedSec.size) ? savedSec.size : def.size,
        title: typeof savedSec.title === 'string' && savedSec.title.trim()
          ? savedSec.title.trim().slice(0, 40)
          : null,
      }
    })

  return { version: DASHBOARD_LAYOUT_VERSION, sections }
}

export const useDashboardLayout = () => {
  const { apiFetch } = useApi()
  const { t } = useI18n()

  const layout = useState<DashboardLayout>('dashboard-layout', () => buildDefaultLayout())
  const loadState = useState<'idle' | 'loading' | 'loaded'>(
    'dashboard-layout-load-state',
    () => 'idle'
  )

  const defaultSectionTitles = computed<Record<DashboardSectionId, string>>(() => ({
    alerts: t('dashboard.alerts'),
    quickActions: t('dashboard.quickActions'),
    keyMetrics: t('dashboard.stats'),
    statistics: t('dashboard.comprehensiveStats'),
    insights: t('dashboard.insights'),
    dailyBreakdowns: t('dashboard.dailyReports'),
    supplementary: t('dashboard.supplementaryReports'),
    schedule: t('dashboard.todaySchedule'),
  }))

  const sizeSpanClass: Record<DashboardSectionSize, string> = {
    small: 'xl:col-span-4!',
    medium: 'xl:col-span-8!',
    large: 'xl:col-span-12!',
  }

  const sectionTitleOf = (sec: DashboardSectionConfig): string =>
    sec.title && sec.title.trim() ? sec.title.trim() : defaultSectionTitles.value[sec.id]

  const canViewStaffDashboard = (role?: string) =>
    !!role && ['admin_doctor', 'doctor', 'lab', 'pharmacy'].includes(role)

  const loadLayout = async (userId: string): Promise<void> => {
    if (!userId || loadState.value !== 'idle') return
    loadState.value = 'loading'
    try {
      const res = await apiFetch<{ success: boolean; data: DashboardLayout | null }>(
        `/api/dashboard-layout/${userId}`
      )
      if (res?.success) {
        layout.value = mergeLayout(res.data)
      }
    } catch {
      // Keep the default layout
    } finally {
      loadState.value = 'loaded'
    }
  }

  const saveLayout = async (userId: string): Promise<boolean> => {
    if (!userId) return false
    try {
      const res = await apiFetch<{ success: boolean }>(`/api/dashboard-layout/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({
          version: DASHBOARD_LAYOUT_VERSION,
          sections: layout.value.sections,
        }),
        headers: { 'Content-Type': 'application/json' },
      })
      return !!res?.success
    } catch {
      return false
    }
  }

  const applyLayout = (next: DashboardSectionConfig[]): void => {
    layout.value = { version: DASHBOARD_LAYOUT_VERSION, sections: normalizeSections(next) }
  }

  const resetLayout = (): void => {
    layout.value = buildDefaultLayout()
  }

  return {
    layout,
    loadState,
    defaultSectionTitles,
    sizeSpanClass,
    sectionTitleOf,
    canViewStaffDashboard,
    loadLayout,
    saveLayout,
    applyLayout,
    resetLayout,
    buildDefaultLayout,
  }
}