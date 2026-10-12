export interface AppNavItem {
  path: string
  label: string
  icon: string
}

/** Primary destinations of the app shell (shared by the rail and bottom nav). */
export const APP_NAV: AppNavItem[] = [
  { path: '/app', label: 'خانه', icon: 'lucide:home' },
  { path: '/app/patients', label: 'بیماران', icon: 'lucide:users' },
  { path: '/app/attendance', label: 'حضور و غیاب', icon: 'lucide:clock' },
  { path: '/app/finance', label: 'مالی', icon: 'lucide:wallet' },
  { path: '/app/schedule', label: 'برنامه کاری', icon: 'lucide:calendar-days' },
]
