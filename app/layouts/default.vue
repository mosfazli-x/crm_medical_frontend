<template>
  <v-locale-provider :rtl="locale === 'fa'">
    <ClinicLoadingScreen :show="isLoading" />

    <v-app v-if="!isLoading" class="!bg-[#f0f2f5] dark:!bg-[#0f1117] transition-colors duration-300 relative">
      <transition name="fade">
        <v-progress-linear v-if="apiLoading" indeterminate color="#4F46E5" height="2"
          class="!fixed !top-0 !left-0 !right-0 !z-[9999] !m-0" />
      </transition>

      <!-- Sidebar -->
      <v-navigation-drawer v-model="drawer" :permanent="lgAndUp" :rail="lgAndUp && rail" rail-width="72"
        :scrim="false" width="260"
        class="!border-l !border-[#e5e7eb] dark:!border-[#1e2028] !bg-white dark:!bg-[#13141a]"
        elevation="0">
        <!-- Logo -->
        <div class="h-[72px] flex items-center gap-3 px-5 transition-all border-b border-[#f3f4f6] dark:border-[#1e2028]"
          :class="isCompact ? 'justify-center !px-0' : ''">
          <img src="../assets/images/logo.jpg"
            class="!flex !h-9 !w-9 sm:!h-10 sm:!w-10 !items-center !justify-center !rounded-xl sm:!rounded-2xl !bg-ink !transition-all !duration-300 group-hover:!shadow-[0_0_20px_rgba(62,232,168,0.3)] group-hover:!scale-105">

          <div v-if="!isCompact" class="flex flex-col overflow-hidden whitespace-nowrap">
            <span class="font-bold text-sm text-[#111827] dark:text-[#f3f4f6] tracking-tight">{{ t('layout.clinicName')
              }}</span>
            <span class="text-[10px] text-[#9ca3af] font-medium">{{ t('layout.managementPanel') }}</span>
          </div>
        </div>

        <!-- Navigation -->
        <transition name="menu-fade" mode="out-in">
          <!-- Compact (rail) navigation: icon-only -->
          <nav v-if="isCompact" key="compact" class="mt-3 px-2 flex flex-col items-center gap-1">
            <NuxtLink v-for="item in allVisibleItems" :key="item.to" :to="item.to" :title="item.title"
              class="flex h-9 w-9 items-center justify-center rounded-xl outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40"
              :class="isActive(item.to)
                ? 'bg-[#EEF2FF] dark:bg-[#1e1b4b]/50'
                : 'hover:bg-[#f9fafb] dark:hover:bg-[#1e2028]'">
              <component :is="item.icon" class="h-[18px] w-[18px] transition-colors duration-200"
                :class="isActive(item.to) ? 'fill-[#4F46E5] dark:fill-[#818cf8]' : 'fill-[#9ca3af]'" />
            </NuxtLink>
          </nav>

          <!-- Expanded navigation: accordion sections -->
          <div v-else key="full" class="mt-3 px-3 space-y-0.5">
            <!-- Accordion sections -->
            <div class="flex flex-col gap-1">
            <template v-for="group in visibleGroups" :key="group.key">
              <button type="button" @click="toggleGroup(group.key)"
                class="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2! text-start outline-none transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40"
                :class="isGroupOpen(group.key)
                  ? 'bg-[#EEF2FF] dark:bg-[#1e1b4b]/40'
                  : 'hover:bg-[#f9fafb] dark:hover:bg-[#1e2028]'"
                :aria-expanded="isGroupOpen(group.key) ? 'true' : 'false'"
                :aria-controls="`nav-panel-${group.key}`">
                <span
                  class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors duration-200"
                  :class="isGroupOpen(group.key)
                    ? 'bg-[#E0E7FF] dark:bg-[#312e81]/50'
                    : 'bg-[#f3f4f6] dark:bg-[#1e2028]'">
                  <component :is="group.icon" class="h-[18px] w-[18px] transition-colors duration-200"
                    :class="isGroupOpen(group.key) ? 'fill-[#4F46E5] dark:fill-[#818cf8]' : 'fill-[#9ca3af]'" />
                </span>

                <span class="flex-1 truncate text-[13px] font-semibold transition-colors duration-200"
                  :class="isGroupOpen(group.key)
                    ? 'text-[#4F46E5] dark:text-[#a5b4fc]'
                    : 'text-[#374151] dark:text-[#cbd5e1]'">
                  {{ group.label }}
                </span>

                <span
                  class="shrink-0 rounded-full px-2 pt-1 pb-0.5! text-[10px] font-bold leading-none transition-colors duration-200"
                  :class="isGroupOpen(group.key)
                    ? 'bg-[#C7D2FE] text-[#4338CA] dark:bg-[#312e81] dark:text-[#c7d2fe]'
                    : 'bg-[#f3f4f6] text-[#9ca3af] dark:bg-[#1e2028] dark:text-[#6b7280]'">
                  {{ group.items.length }}
                </span>

                <AltArrowLeft class="h-3.5 w-3.5 shrink-0 fill-[#9ca3af] transition-transform duration-300"
                  :class="isGroupOpen(group.key) ? 'rotate-90 fill-[#4F46E5] dark:fill-[#818cf8]' : ''" />
              </button>

              <transition name="accordion" @before-enter="beforeEnter" @enter="enter" @after-enter="afterEnter"
                @before-leave="beforeLeave" @leave="leave" @after-leave="afterLeave">
                <div v-show="isGroupOpen(group.key)" :id="`nav-panel-${group.key}`" class="accordion-panel">
                  <div class="relative ps-11">
                    <span aria-hidden="true"
                      class="absolute inset-y-2 start-[21px] w-px rounded-full bg-[#e5e7eb] transition-colors duration-300 dark:bg-[#2a2c36]"
                      :class="isGroupOpen(group.key) ? 'bg-[#c7d2fe] dark:bg-[#312e81]' : ''" />
                    <nav class="space-y-1 pb-1 pe-1">
                      <NuxtLink v-for="item in group.items" :key="item.to" :to="item.to"
                        class="group/item relative flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium outline-none transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[#4F46E5]/40"
                        :class="isActive(item.to)
                          ? 'bg-[#EEF2FF] font-semibold text-[#4F46E5] dark:bg-[#1e1b4b]/50 dark:text-[#a5b4fc]'
                          : 'text-[#6b7280] hover:bg-[#f9fafb] hover:text-[#111827] dark:text-[#9ca3af] dark:hover:bg-[#1e2028] dark:hover:text-[#e5e7eb]'">
                        <span aria-hidden="true"
                          class="pointer-events-none absolute inset-y-2 start-0 w-0.5 rounded-full bg-[#4F46E5] opacity-0 transition-opacity duration-200"
                          :class="isActive(item.to) ? 'opacity-100 dark:bg-[#818cf8]' : ''" />
                        <span class="flex w-5 shrink-0 items-center justify-center">
                          <component :is="item.icon" class="h-[18px] w-[18px] transition-colors duration-200"
                            :class="isActive(item.to) ? 'fill-[#4F46E5] dark:fill-[#818cf8]' : 'fill-[#9ca3af]'" />
                        </span>
                        <span class="truncate">{{ item.title }}</span>
                      </NuxtLink>
                    </nav>
                  </div>
                </div>
              </transition>
            </template>
          </div>
        </div>
        </transition>

        <!-- User Section -->
        <template #append>
          <div class="p-3 border-t border-[#f3f4f6] dark:border-[#1e2028]">
            <div
              class="flex items-center gap-3 p-2! rounded-lg hover:bg-[#f9fafb] dark:hover:bg-[#1e2028] transition-colors cursor-pointer"
              :class="isCompact ? 'justify-center' : ''">
              <div
                class="w-8 h-8 rounded-lg bg-[#EEF2FF] dark:bg-[#1e1b4b]/50 flex items-center justify-center shrink-0">
                <span class="text-[#4F46E5] dark:text-[#818cf8] font-bold text-xs">{{ userInitial }}</span>
              </div>
              <template v-if="!isCompact">
                <div class="flex-1 min-w-0 overflow-hidden">
                  <p class="text-xs font-semibold text-[#111827] dark:text-[#f3f4f6] truncate">{{ user?.fullName ||
                    t('layout.guestUser') }}</p>
                  <p class="text-[10px] text-[#9ca3af]">{{ roleLabel }}</p>
                </div>
                <button @click.stop="logout"
                  class="p-1.5 rounded-md hover:bg-[#fef2f2] dark:hover:bg-[#7f1d1d]/20 transition-colors group"
                  :title="t('layout.logout')">
                  <TurnOffIcon class="w-4 h-4 fill-[#9ca3af] group-hover:fill-[#ef4444] transition-colors" />
                </button>
              </template>
            </div>
          </div>
        </template>
      </v-navigation-drawer>

      <!-- Drawer scrim (dark overlay behind the menu, only when the drawer is temporary) -->
      <transition name="scrim-fade">
        <div v-if="!lgAndUp && drawer" class="crm-drawer-scrim" @click="drawer = false" aria-hidden="true" />
      </transition>

      <!-- Top Bar -->
      <v-app-bar height="64" flat
        class="!bg-white/80 dark:!bg-[#13141a]/80 backdrop-blur-xl !border-b !border-[#e5e7eb] dark:!border-[#1e2028] px-3"
        elevation="0">
        <template #prepend>
          <v-app-bar-nav-icon variant="text" @click="onNavToggle" class="!text-[#6b7280]"
            :title="lgAndUp && rail ? t('layout.expandMenu') : t('layout.collapseMenu')" />
        </template>

        <div class="hidden lg:flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-[#f0fdf4] dark:bg-[#064e3b]/30 flex items-center justify-center">
            <Welcome class="w-6 h-6 fill-green-500" />
          </div>
          <div>
            <p class="text-sm font-semibold text-[#111827] dark:text-[#f3f4f6] leading-tight">{{
              t('dashboard.patientWelcome')
              }}</p>
            <p class="text-[11px] text-[#9ca3af]">{{ t('dashboard.adminWelcome') }}</p>
          </div>
        </div>

        <v-spacer />

        <div class="flex items-center gap-1">
          <!-- Tutorial help button disabled (showTutorial) until the dashboard tutorial is revamped. -->
          <!-- <v-btn icon variant="text" size="small" @click="showTutorial" class="!text-[#6b7280]" title="Help">
            <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </v-btn> -->
          <v-btn icon variant="text" size="small" @click="toggleTheme" class="!text-[#6b7280]">
            <Sun v-if="!isDark" class="w-[18px] h-[18px] stroke-[#6b7280] fill-none" />
            <Moon v-else class="w-[18px] h-[18px] fill-[#9ca3af]" />
          </v-btn>

          <v-menu offset-y :close-on-content-click="true">
            <template #activator="{ props }">
              <v-btn v-bind="props" icon variant="text" size="small" class="!text-[#9ca3af]">
                <Globe class="w-[18px] h-[18px]" />
              </v-btn>
            </template>
            <v-list density="compact"
              class="!py-1 !rounded-lg !border !border-[#e5e7eb] dark:!border-[#2a2c36] !bg-white dark:!bg-[#1e2028] min-w-[140px]">
              <v-list-item v-for="lang in languages" :key="lang.code" @click="switchLanguage(lang.code)"
                :active="locale === lang.code"
                active-class="!bg-[#EEF2FF] dark:!bg-[#1e1b4b]/50 !text-[#4F46E5] dark:!text-[#818cf8]"
                class="!rounded-md !mx-1 !my-0.5">
                <template #prepend>
                  <span class="text-base mr-0">{{ lang.flag }}</span>
                </template>
                <v-list-item-title class="text-[13px] font-medium">{{ lang.label }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-btn icon variant="text" size="small" class="!text-[#6b7280] hover:!text-[#ef4444]!" @click="logout">
            <TurnOffIcon class="w-[18px] h-[18px] fill-[#9ca3af]" />
          </v-btn>
        </div>
      </v-app-bar>

      <v-main class="bg-transparent! min-h-screen pt-16">
        <div class="max-w-[1520px] mx-auto">
          <slot />
        </div>
      </v-main>
    </v-app>

    <!-- FAQ Support Widget (outside v-app to avoid overflow:hidden clipping) -->
    <SupportFaqWidget />
  </v-locale-provider>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useDisplay } from 'vuetify'
import ClinicLoadingScreen from '~/components/ClinicLoadingScreen.vue'
import AltArrowLeft from '~/components/icons/AltArrowLeft.vue'
import Calendar from '~/components/icons/Calendar.vue'
import Clock from '~/components/icons/Clock.vue'
import Grid from '~/components/icons/Grid.vue'
import HomeAngle from '~/components/icons/HomeAngle.vue'
import MedicalKit from '~/components/icons/MedicalKit.vue'
import TurnOffIcon from '~/components/icons/TurnOffIcon.vue'
import UsersGroup from '~/components/icons/UsersGroup.vue'
import DocumentText from '~/components/icons/DocumentText.vue'
import ShieldCheck from '~/components/icons/ShieldCheck.vue'
import ChatDots from '~/components/icons/ChatDots.vue'
import Calculator from '~/components/icons/Calculator.vue'
import Wallet from '~/components/icons/Wallet.vue'
import Profile from '~/components/icons/Profile.vue'
import Sun from '~/components/icons/Sun.vue'
import Moon from '~/components/icons/Moon.vue'
import Globe from '~/components/icons/Globe.vue'
import Users from '~/components/icons/Users.vue'
import Settings from '~/components/icons/Settings.vue'
import Bell from '~/components/icons/Bell.vue'
import AddClipboard from '~/components/icons/AddClipboard.vue'
import Box from '~/components/icons/Box.vue'
import BookOpen from '~/components/icons/BookOpen.vue'
import Activity from '~/components/icons/Activity.vue'
import FolderHeart from '~/components/icons/FolderHeart.vue'
import FileText from '~/components/icons/FileText.vue'
import ClipboardCheck from '~/components/icons/ClipboardCheck.vue'
import Basket from '~/components/icons/Basket.vue'
import Welcome from '~/components/icons/Welcome.vue'
import FaqIcon from '~/components/icons/FaqIcon.vue'

const route = useRoute()
const { user, logout } = useAuth()
const { apiLoading } = useApi()
const { isDark, toggleTheme, initTheme } = useThemeMode()
const { t, locale, setLocale } = useI18n()
const { lgAndUp } = useDisplay()

const tutorial = useTutorial()
const showTutorial = async () => {
  tutorial.resetTutorial()
  drawer.value = true
  await nextTick()
  tutorial.startTutorial()
}

const languages = [
  { code: 'fa' as const, label: t('layout.langFa'), flag: '🇮🇷' },
  { code: 'en' as const, label: t('layout.langEn'), flag: '🇬🇧' },
]

const switchLanguage = async (code: 'fa' | 'en') => {
  useCookie('i18n_lang', { sameSite: 'lax', maxAge: 60 * 60 * 24 * 365, path: '/' }).value = code
  await setLocale(code)
}

const drawer = ref(false)
const rail = ref(false)
const isLoading = ref(true)

const isCompact = computed(() => lgAndUp.value && rail.value)

const onNavToggle = () => {
  if (lgAndUp.value) {
    rail.value = !rail.value
  } else {
    drawer.value = !drawer.value
  }
}

watch(lgAndUp, (isDesktop) => {
  drawer.value = !!isDesktop
}, { immediate: true })

const isActive = (path: string) => {
  if (path === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(path)
}

onMounted(() => {
  setTimeout(() => { isLoading.value = false }, 1400)
  initTheme()
  tutorial.fetchStatus()

  const savedLocale = localStorage.getItem('locale')
  if (savedLocale && (savedLocale === 'fa' || savedLocale === 'en')) {
    setLocale(savedLocale)
  }

  window.addEventListener('keydown', onDrawerKeydown)
})

const onDrawerKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && drawer.value && !lgAndUp.value) {
    drawer.value = false
  }
}

watch(() => route.path, (path) => {
  // Tutorial auto-start disabled (showTutorial) until the dashboard tutorial is revamped.
  // if (path === '/dashboard' && !tutorial.completed.value && !tutorial.loading.value) {
  //   drawer.value = true
  //   nextTick(() => {
  //     setTimeout(() => tutorial.startTutorial(), 600)
  //   })
  // } else
  if (!lgAndUp.value) {
    drawer.value = false
  }
}, { immediate: true })

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onDrawerKeydown)
})

const roleLabel = computed(() => {
  const roles: Record<string, string> = {
    admin_doctor: t('users.roles.admin_doctor'),
    doctor: t('users.roles.doctor'),
    pharmacy: t('users.roles.pharmacy'),
    lab: t('users.roles.lab'),
    patient: t('users.roles.patient'),
    clinic_staff: t('users.roles.clinic_staff'),
  }
  const currentRole = user?.value?.role || (user as any)?.role
  return roles[currentRole] || t('layout.systemUser')
})

const userInitial = computed(() => {
  const name = user?.value?.fullName || (user as any)?.fullName
  return name ? name.charAt(0) : 'U'
})

const ALL_MENUS = computed(() => [
  { title: t('dashboard.title'), to: '/dashboard', icon: HomeAngle, roles: ['all'], group: 'main' },
  { title: t('myProfile.title'), to: '/my-profile', icon: Profile, roles: ['all'], group: 'main' },
  { title: t('mySessions.title'), to: '/my-sessions', icon: ShieldCheck, roles: ['all'], group: 'main' },
  { title: t('calendar.title'), to: '/calendar', icon: Calendar, roles: ['admin_doctor', 'doctor'], group: 'clinical' },
  { title: t('scheduling.title'), to: '/scheduling', icon: Clock, roles: ['admin_doctor', 'doctor'], group: 'clinical' },
  { title: t('appointments.title'), to: '/appointments', icon: Grid, roles: ['admin_doctor', 'doctor'], group: 'clinical' },
  { title: t('visitTypes.title'), to: '/visit-types', icon: DocumentText, roles: ['admin_doctor', 'doctor'], group: 'clinical' },
  { title: t('clinicalTools.title'), to: '/clinical-tools', icon: Calculator, roles: ['admin_doctor', 'doctor'], group: 'clinical' },
  { title: t('screening.title'), to: '/screening', icon: ShieldCheck, roles: ['admin_doctor', 'doctor'], group: 'clinical' },
  { title: t('labResults.title'), to: '/lab-results', icon: DocumentText, roles: ['admin_doctor', 'doctor', 'lab'], group: 'clinical' },
  { title: t('prescriptions.title'), to: '/prescriptions', icon: MedicalKit, roles: ['admin_doctor', 'doctor', 'pharmacy'], group: 'clinical' },
  { title: t('patients.title'), to: '/patients', icon: UsersGroup, roles: ['admin_doctor', 'doctor'], group: 'patients' },
  { title: t('leads.title'), to: '/leads', icon: Activity, roles: ['admin_doctor', 'doctor'], group: 'patients' },
  { title: t('leadSources.title'), to: '/lead-sources', icon: FolderHeart, roles: ['admin_doctor'], group: 'patients' },
  { title: t('messaging.title'), to: '/messaging', icon: ChatDots, roles: ['admin_doctor', 'doctor', 'lab', 'pharmacy'], group: 'communication' },
  { title: t('patientMessaging.title'), to: '/patient/messaging', icon: ChatDots, roles: ['patient'], group: 'communication' },
  { title: t('users.title'), to: '/users', icon: Users, roles: ['admin_doctor'], group: 'management' },
  { title: t('staff.title'), to: '/staff', icon: UsersGroup, roles: ['admin_doctor'], group: 'management' },
  { title: t('attendance.title'), to: '/attendance', icon: Bell, roles: ['admin_doctor', 'doctor'], group: 'management' },
  { title: t('schedule.title'), to: '/schedule', icon: ClipboardCheck, roles: ['admin_doctor', 'doctor', 'lab', 'pharmacy', 'clinic_staff'], group: 'management' },
  { title: t('adminSchedule.title'), to: '/admin/schedule', icon: Clock, roles: ['admin_doctor'], group: 'management' },
  { title: t('adminSettings.title'), to: '/admin/settings', icon: Settings, roles: ['admin_doctor'], group: 'management' },
  { title: t('auditLogs.title'), to: '/admin/audit', icon: AddClipboard, roles: ['admin_doctor'], group: 'management' },
  { title: t('loginHistory.adminTitle'), to: '/admin/login-history', icon: ShieldCheck, roles: ['admin_doctor'], group: 'management' },
  { title: t('support.admin.title'), to: '/admin/faq-management', icon: FaqIcon, roles: ['admin_doctor'], group: 'management' },
  { title: t('blog.admin.title'), to: '/admin/blog', icon: FileText, roles: ['admin_doctor'], group: 'management' },
  { title: t('blog.admin.commentsTitle'), to: '/admin/blog/comments', icon: ChatDots, roles: ['admin_doctor'], group: 'management' },
  { title: t('billing.title'), to: '/billing', icon: Wallet, roles: ['admin_doctor'], group: 'finance' },
  { title: t('inventory.title'), to: '/inventory', icon: Box, roles: ['admin_doctor', 'pharmacy'], group: 'finance' },
  { title: t('accounting.title'), to: '/accounting', icon: BookOpen, roles: ['admin_doctor'], group: 'finance' },
  { title: t('consumables.title'), to: '/consumables', icon: Basket, roles: ['admin_doctor', 'doctor'], group: 'finance' },
  { title: t('dailyReports.title'), to: '/daily-reports', icon: FileText, roles: ['admin_doctor', 'doctor'], group: 'finance' },
])

const hasAccess = (itemRoles: string[]) => {
  if (itemRoles.includes('all')) return true
  const currentUserRole = user?.value?.role || (user as any)?.role
  if (!currentUserRole) return false
  return itemRoles.includes(currentUserRole)
}

const GROUP_DEFS = [
  { key: 'main', labelKey: 'layout.menuMain', icon: HomeAngle },
  { key: 'clinical', labelKey: 'layout.menuClinical', icon: MedicalKit },
  { key: 'patients', labelKey: 'layout.menuPatients', icon: UsersGroup },
  { key: 'communication', labelKey: 'layout.menuCommunication', icon: ChatDots },
  { key: 'management', labelKey: 'layout.menuManagement', icon: Settings },
  { key: 'finance', labelKey: 'layout.menuFinance', icon: Wallet },
]

const visibleGroups = computed(() =>
  GROUP_DEFS
    .map((group) => ({
      ...group,
      label: t(group.labelKey),
      items: ALL_MENUS.value.filter((item) => item.group === group.key && hasAccess(item.roles)),
    }))
    .filter((group) => group.items.length > 0)
)

const allVisibleItems = computed(() =>
  ALL_MENUS.value.filter((item) => hasAccess(item.roles))
)

const openGroupKey = ref<string | null>(null)

const isGroupOpen = (key: string) => openGroupKey.value === key

const activeGroupKey = computed(() => {
  const path = route.path
  const group = visibleGroups.value.find((g) =>
    g.items.some((item) => isActive(item.to))
  )
  return group ? group.key : null
})

const toggleGroup = (key: string) => {
  openGroupKey.value = openGroupKey.value === key ? null : key
}

watch(activeGroupKey, (key) => {
  if (key) openGroupKey.value = key
}, { immediate: true })

const panel = (el: Element) => el as HTMLElement

const beforeEnter = (el: Element) => {
  const node = panel(el)
  node.style.maxHeight = '0px'
  node.style.opacity = '0'
}

const enter = (el: Element) => {
  const node = panel(el)
  void node.offsetHeight
  node.style.maxHeight = `${node.scrollHeight}px`
  node.style.opacity = '1'
}

const afterEnter = (el: Element) => {
  const node = panel(el)
  node.style.maxHeight = ''
  node.style.opacity = ''
}

const beforeLeave = (el: Element) => {
  const node = panel(el)
  node.style.maxHeight = `${node.scrollHeight}px`
}

const leave = (el: Element) => {
  const node = panel(el)
  void node.offsetHeight
  node.style.maxHeight = '0px'
  node.style.opacity = '0'
}

const afterLeave = (el: Element) => {
  const node = panel(el)
  node.style.maxHeight = ''
  node.style.opacity = ''
}
</script>

<style scoped>
.crm-drawer-scrim {
  position: fixed;
  inset: 0;
  z-index: 1005;
  background: rgba(15, 17, 23, 0.55);
  backdrop-filter: blur(2px);
  -webkit-backdrop-filter: blur(2px);
}

.scrim-fade-enter-active,
.scrim-fade-leave-active {
  transition: opacity 0.3s ease;
}

.scrim-fade-enter-from,
.scrim-fade-leave-to {
  opacity: 0;
}

.scrim-fade-leave-active {
  pointer-events: none;
}

.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: opacity 0.18s ease;
}

.menu-fade-enter-from,
.menu-fade-leave-to {
  opacity: 0;
}

.menu-fade-leave-active {
  pointer-events: none;
}

.accordion-panel {
  overflow: hidden;
  transition: max-height 0.32s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.22s ease;
}
</style>
