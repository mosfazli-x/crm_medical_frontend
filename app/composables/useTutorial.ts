import type { DriveStep, Driver } from 'driver.js'

type TutorialRole = 'admin_doctor' | 'doctor' | 'lab' | 'pharmacy' | 'patient'

interface StepDef {
  element?: string
  titleKey: string
  descKey: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  align?: 'start' | 'center' | 'end'
  disableActiveInteraction?: boolean
}

const roleSteps: Record<TutorialRole, StepDef[]> = {
  admin_doctor: [
    {
      titleKey: 'tutorial.steps.welcome.title',
      descKey: 'tutorial.steps.welcome.desc',
    },
    {
      element: '.crm-page-header',
      titleKey: 'tutorial.steps.dashboardOverview.title',
      descKey: 'tutorial.steps.dashboardOverview.desc',
      side: 'bottom',
      align: 'center',
    },
    {
      element: 'a[href="/dashboard"]',
      titleKey: 'tutorial.steps.sidebar.title',
      descKey: 'tutorial.steps.sidebar.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/calendar"]',
      titleKey: 'tutorial.steps.calendar.title',
      descKey: 'tutorial.steps.calendar.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/appointments"]',
      titleKey: 'tutorial.steps.appointments.title',
      descKey: 'tutorial.steps.appointments.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/patients"]',
      titleKey: 'tutorial.steps.patients.title',
      descKey: 'tutorial.steps.patients.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/users"]',
      titleKey: 'tutorial.steps.users.title',
      descKey: 'tutorial.steps.users.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/messaging"]',
      titleKey: 'tutorial.steps.messaging.title',
      descKey: 'tutorial.steps.messaging.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/clinical-tools"]',
      titleKey: 'tutorial.steps.clinicalTools.title',
      descKey: 'tutorial.steps.clinicalTools.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/billing"]',
      titleKey: 'tutorial.steps.billing.title',
      descKey: 'tutorial.steps.billing.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/staff"]',
      titleKey: 'tutorial.steps.staff.title',
      descKey: 'tutorial.steps.staff.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/prescriptions"]',
      titleKey: 'tutorial.steps.prescriptions.title',
      descKey: 'tutorial.steps.prescriptions.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/lab-results"]',
      titleKey: 'tutorial.steps.labResults.title',
      descKey: 'tutorial.steps.labResults.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/my-profile"]',
      titleKey: 'tutorial.steps.profile.title',
      descKey: 'tutorial.steps.profile.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: '.v-app-bar',
      titleKey: 'tutorial.steps.topBar.title',
      descKey: 'tutorial.steps.topBar.desc',
      side: 'bottom',
      align: 'start',
    },
  ],

  doctor: [
    {
      titleKey: 'tutorial.steps.welcome.title',
      descKey: 'tutorial.steps.welcome.desc',
    },
    {
      element: '.crm-page-header',
      titleKey: 'tutorial.steps.dashboardOverview.title',
      descKey: 'tutorial.steps.dashboardOverview.desc',
      side: 'bottom',
      align: 'center',
    },
    {
      element: 'a[href="/dashboard"]',
      titleKey: 'tutorial.steps.sidebar.title',
      descKey: 'tutorial.steps.sidebar.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/calendar"]',
      titleKey: 'tutorial.steps.calendar.title',
      descKey: 'tutorial.steps.calendar.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/appointments"]',
      titleKey: 'tutorial.steps.appointments.title',
      descKey: 'tutorial.steps.appointments.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/patients"]',
      titleKey: 'tutorial.steps.patients.title',
      descKey: 'tutorial.steps.patients.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/messaging"]',
      titleKey: 'tutorial.steps.messaging.title',
      descKey: 'tutorial.steps.messaging.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/clinical-tools"]',
      titleKey: 'tutorial.steps.clinicalTools.title',
      descKey: 'tutorial.steps.clinicalTools.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/prescriptions"]',
      titleKey: 'tutorial.steps.prescriptions.title',
      descKey: 'tutorial.steps.prescriptions.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/lab-results"]',
      titleKey: 'tutorial.steps.labResults.title',
      descKey: 'tutorial.steps.labResults.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/my-profile"]',
      titleKey: 'tutorial.steps.profile.title',
      descKey: 'tutorial.steps.profile.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: '.v-app-bar',
      titleKey: 'tutorial.steps.topBar.title',
      descKey: 'tutorial.steps.topBar.desc',
      side: 'bottom',
      align: 'start',
    },
  ],

  lab: [
    {
      titleKey: 'tutorial.steps.welcome.title',
      descKey: 'tutorial.steps.welcome.desc',
    },
    {
      element: '.crm-page-header',
      titleKey: 'tutorial.steps.dashboardOverview.title',
      descKey: 'tutorial.steps.dashboardOverview.desc',
      side: 'bottom',
      align: 'center',
    },
    {
      element: 'a[href="/messaging"]',
      titleKey: 'tutorial.steps.messaging.title',
      descKey: 'tutorial.steps.messaging.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/lab-results"]',
      titleKey: 'tutorial.steps.labResults.title',
      descKey: 'tutorial.steps.labResults.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/my-profile"]',
      titleKey: 'tutorial.steps.profile.title',
      descKey: 'tutorial.steps.profile.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: '.v-app-bar',
      titleKey: 'tutorial.steps.topBar.title',
      descKey: 'tutorial.steps.topBar.desc',
      side: 'bottom',
      align: 'start',
    },
  ],

  pharmacy: [
    {
      titleKey: 'tutorial.steps.welcome.title',
      descKey: 'tutorial.steps.welcome.desc',
    },
    {
      element: '.crm-page-header',
      titleKey: 'tutorial.steps.dashboardOverview.title',
      descKey: 'tutorial.steps.dashboardOverview.desc',
      side: 'bottom',
      align: 'center',
    },
    {
      element: 'a[href="/messaging"]',
      titleKey: 'tutorial.steps.messaging.title',
      descKey: 'tutorial.steps.messaging.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/prescriptions"]',
      titleKey: 'tutorial.steps.prescriptions.title',
      descKey: 'tutorial.steps.prescriptions.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/my-profile"]',
      titleKey: 'tutorial.steps.profile.title',
      descKey: 'tutorial.steps.profile.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: '.v-app-bar',
      titleKey: 'tutorial.steps.topBar.title',
      descKey: 'tutorial.steps.topBar.desc',
      side: 'bottom',
      align: 'start',
    },
  ],

  patient: [
    {
      titleKey: 'tutorial.steps.welcomePatient.title',
      descKey: 'tutorial.steps.welcomePatient.desc',
    },
    {
      titleKey: 'tutorial.steps.patientDashboard.title',
      descKey: 'tutorial.steps.patientDashboard.desc',
      side: 'bottom',
      align: 'center',
    },
    {
      element: 'a[href="/patient/messaging"]',
      titleKey: 'tutorial.steps.patientMessages.title',
      descKey: 'tutorial.steps.patientMessages.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: 'a[href="/my-profile"]',
      titleKey: 'tutorial.steps.profile.title',
      descKey: 'tutorial.steps.profile.desc',
      side: 'right',
      align: 'start',
    },
    {
      element: '.v-app-bar',
      titleKey: 'tutorial.steps.topBar.title',
      descKey: 'tutorial.steps.topBar.desc',
      side: 'bottom',
      align: 'start',
    },
  ],
}

export function useTutorial() {
  const { t } = useI18n()
  const { user } = useAuth()

  const completed = useState<boolean>('tutorial_completed', () => true)
  const loading = ref(true)

  const currentRole = computed<TutorialRole>(() => {
    const role = user?.value?.role || 'patient'
    return (role in roleSteps ? role : 'patient') as TutorialRole
  })

  async function fetchStatus() {
    const local = localStorage.getItem('tutorial_completed')
    if (local === 'true') {
      completed.value = true
      loading.value = false
      return
    }
    try {
      const res = await $fetch<{ completed: boolean }>('/_tutorial/progress')
      completed.value = res.completed
    } catch {
      completed.value = false
    }
    loading.value = false
  }

  async function markCompleted() {
    completed.value = true
    localStorage.setItem('tutorial_completed', 'true')
    try {
      await $fetch('/_tutorial/progress', {
        method: 'POST',
        body: { completed: true },
      })
    } catch {

    }
  }

  function resetTutorial() {
    completed.value = false
    localStorage.removeItem('tutorial_completed')
  }

  function buildSteps(driver: Driver) {
    const steps: DriveStep[] = roleSteps[currentRole.value].map((def, index, arr) => {
      const isLast = index === arr.length - 1
      const isFirst = index === 0
      const buttons = isFirst
        ? ['next' as const]
        : (isLast ? ['previous' as const, 'next' as const] : ['next' as const, 'previous' as const])

      return {
        element: def.element,
        popover: {
          title: t(def.titleKey),
          description: t(def.descKey),
          side: def.side,
          align: def.align,
          showButtons: buttons,
          showProgress: true,
          progressText: t('tutorial.progressText'),
          nextBtnText: isLast ? undefined : t('tutorial.nextBtn'),
          prevBtnText: t('tutorial.prevBtn'),
          doneBtnText: t('tutorial.doneBtn'),
          onNextClick: () => {
            if (isLast) {
              markCompleted()
              driver.destroy()
            } else {
              driver.moveNext()
            }
          },
          onPrevClick: () => driver.movePrevious(),
          onCloseClick: () => markCompleted(),
        },
        disableActiveInteraction: true,
      }
    })
    return steps
  }

  async function startTutorial() {
    const { driver } = await import('driver.js')

    const d = driver({
      animate: true,
      overlayColor: '#000',
      overlayOpacity: 0.6,
      stagePadding: 8,
      stageRadius: 8,
      smoothScroll: true,
      allowClose: false,
      showProgress: true,
      popoverClass: 'crm-tutorial-popover',
      onDestroyed: () => {
        markCompleted()
      },
    })

    const steps = buildSteps(d)
    d.setSteps(steps)
    d.drive()
  }

  return {
    completed,
    loading,
    currentRole,
    startTutorial,
    resetTutorial,
    fetchStatus,
    markCompleted,
  }
}
