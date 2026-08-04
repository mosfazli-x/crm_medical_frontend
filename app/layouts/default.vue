<template>
  <v-locale-provider :rtl="locale === 'fa'">
    <ClinicLoadingScreen :show="isLoading" />

    <v-app v-if="!isLoading" class="!bg-[#f0f2f5] dark:!bg-[#0f1117] transition-colors duration-300 relative">
      <transition name="fade">
        <v-progress-linear v-if="apiLoading" indeterminate color="#4F46E5" height="2"
          class="!fixed !top-0 !left-0 !right-0 !z-[9999] !m-0" />
      </transition>

      <!-- Sidebar -->
      <v-navigation-drawer v-model="drawer" :rail="rail && !isMobile" permanent width="260" rail-width="72"
        class="!border-l !border-[#e5e7eb] dark:!border-[#1e2028] !bg-white dark:!bg-[#13141a] transition-all duration-300"
        elevation="0" :temporary="isMobile">
        <!-- Collapse Toggle -->
        <button v-if="!isMobile" @click="rail = !rail"
          class="absolute -left-3 top-7 z-50 w-6 h-6 bg-white dark:bg-[#1e2028] border border-[#e5e7eb] dark:border-[#2a2c36] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-300">
          <AltArrowLeft class="w-3.5 h-3.5 fill-[#6b7280] dark:fill-[#9ca3af] transition-transform duration-300"
            :class="rail ? '' : 'rotate-180'" />
        </button>

        <!-- Logo -->
        <div class="h-[72px] flex items-center gap-3 transition-all border-b border-[#f3f4f6] dark:border-[#1e2028]"
          :class="rail && !isMobile ? 'justify-center px-0' : 'px-5'">
          <img src="../assets/images/logo.jpg" class="!flex !h-9 !w-9 sm:!h-10 sm:!w-10 !items-center !justify-center !rounded-xl sm:!rounded-2xl !bg-ink !transition-all !duration-300 group-hover:!shadow-[0_0_20px_rgba(62,232,168,0.3)] group-hover:!scale-105">
          
          <div v-if="!rail || isMobile" class="flex flex-col overflow-hidden whitespace-nowrap">
            <span class="font-bold text-sm text-[#111827] dark:text-[#f3f4f6] tracking-tight">{{ t('layout.clinicName') }}</span>
            <span class="text-[10px] text-[#9ca3af] font-medium">{{ t('layout.managementPanel') }}</span>
          </div>
        </div>

        <!-- Navigation -->
        <div class="mt-3 px-3 space-y-6">
          <div v-for="section in menuSections" :key="section.label">
            <div v-if="(!rail || isMobile) && section.items.length"
              class="px-3 my-2! text-[10px] font-semibold text-[#9ca3af] tracking-wider uppercase">
              {{ section.label }}
            </div>
            <v-list v-if="section.items.length" nav class="!p-0">
              <v-tooltip v-for="item in section.items" :key="item.to" location="left" :disabled="!rail || isMobile">
                <template #activator="{ props }">
                  <v-list-item v-bind="props" :to="item.to" nuxt
                    class="rounded-lg! mb-0.5 transition-all duration-200 gap-1 flex"
                    :class="[
                      rail && !isMobile ? 'px-0! justify-center' : 'px-3!',
                      isActive(item.to)
                        ? '!bg-[#EEF2FF] dark:!bg-[#1e1b4b]/50 !text-[#4F46E5] dark:!text-[#818cf8]'
                        : '!text-[#6b7280] dark:!text-[#9ca3af] hover:!bg-[#f9fafb] dark:hover:!bg-[#1e2028]'
                    ]"
                    active-class="">
                    <template #prepend>
                      <div class="flex items-center justify-center"
                        :class="rail && !isMobile ? '' : 'w-5'">
                        <component :is="item.icon" class="w-[18px] h-[18px] shrink-0"
                          :class="isActive(item.to) ? 'fill-[#4F46E5] dark:fill-[#818cf8]' : 'fill-[#9ca3af]'" />
                      </div>
                    </template>
                    <template #title>
                      <span v-if="!rail || isMobile" class="text-[13px] font-medium">{{ item.title }}</span>
                    </template>
                  </v-list-item>
                </template>
                <span class="text-xs">{{ item.title }}</span>
              </v-tooltip>
            </v-list>
          </div>
        </div>

        <!-- User Section -->
        <template #append>
          <div class="p-3 border-t border-[#f3f4f6] dark:border-[#1e2028]">
            <div class="flex items-center gap-3 p-2! rounded-lg hover:bg-[#f9fafb] dark:hover:bg-[#1e2028] transition-colors cursor-pointer"
              :class="rail && !isMobile ? 'justify-center' : ''">
              <div class="w-8 h-8 rounded-lg bg-[#EEF2FF] dark:bg-[#1e1b4b]/50 flex items-center justify-center shrink-0">
                <span class="text-[#4F46E5] dark:text-[#818cf8] font-bold text-xs">{{ userInitial }}</span>
              </div>
              <div v-if="!rail || isMobile" class="flex-1 min-w-0 overflow-hidden">
                <p class="text-xs font-semibold text-[#111827] dark:text-[#f3f4f6] truncate">{{ user?.fullName || t('layout.guestUser') }}</p>
                <p class="text-[10px] text-[#9ca3af]">{{ roleLabel }}</p>
              </div>
              <button v-if="!rail || isMobile" @click.stop="logout"
                class="p-1.5 rounded-md hover:bg-[#fef2f2] dark:hover:bg-[#7f1d1d]/20 transition-colors group"
                :title="t('layout.logout')">
                <TurnOffIcon class="w-4 h-4 fill-[#9ca3af] group-hover:fill-[#ef4444] transition-colors" />
              </button>
            </div>
          </div>
        </template>
      </v-navigation-drawer>

      <!-- Top Bar -->
      <v-app-bar height="64" flat
        class="!bg-white/80 dark:!bg-[#13141a]/80 backdrop-blur-xl !border-b !border-[#e5e7eb] dark:!border-[#1e2028] px-3"
        elevation="0">
        <template #prepend>
          <v-app-bar-nav-icon variant="text" @click="drawer = !drawer" class="!text-[#6b7280] lg:!hidden" />
        </template>

        <div class="hidden lg:flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-[#f0fdf4] dark:bg-[#064e3b]/30 flex items-center justify-center">
            <span class="text-[#059669] text-sm">&#10003;</span>
          </div>
          <div>
            <p class="text-sm font-semibold text-[#111827] dark:text-[#f3f4f6] leading-tight">{{ t('dashboard.patientWelcome') }}</p>
            <p class="text-[11px] text-[#9ca3af]">{{ t('dashboard.adminWelcome') }}</p>
          </div>
        </div>

        <v-spacer />

        <div class="flex items-center gap-1">
          <v-btn icon variant="text" size="small" @click="showTutorial" class="!text-[#6b7280]" title="Help">
            <svg class="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </v-btn>
          <v-btn icon variant="text" size="small" @click="toggleTheme" class="!text-[#6b7280]">
            <Sun v-if="!isDark" class="w-[18px] h-[18px] stroke-[#6b7280] fill-none" />
            <Moon v-else class="w-[18px] h-[18px] fill-[#9ca3af]" />
          </v-btn>

          <v-menu offset-y :close-on-content-click="true">
            <template #activator="{ props }">
              <v-btn v-bind="props" icon variant="text" size="small" class="!text-[#6b7280]">
                <Globe class="w-[18px] h-[18px]" />
              </v-btn>
            </template>
            <v-list density="compact" class="!py-1 !rounded-lg !border !border-[#e5e7eb] dark:!border-[#2a2c36] !bg-white dark:!bg-[#1e2028] min-w-[140px]">
              <v-list-item
                v-for="lang in languages"
                :key="lang.code"
                @click="switchLanguage(lang.code)"
                :active="locale === lang.code"
                active-class="!bg-[#EEF2FF] dark:!bg-[#1e1b4b]/50 !text-[#4F46E5] dark:!text-[#818cf8]"
                class="!rounded-md !mx-1 !my-0.5"
              >
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
  </v-locale-provider>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
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

const route = useRoute()
const { user, logout } = useAuth()
const { apiLoading } = useApi()
const { smAndDown } = useDisplay()
const { isDark, toggleTheme, initTheme } = useThemeMode()
const { t, locale, setLocale } = useI18n()

const tutorial = useTutorial()
const showTutorial = async () => {
  tutorial.resetTutorial()
  await nextTick()
  tutorial.startTutorial()
}

const languages = [
  { code: 'fa' as const, label: t('layout.langFa'), flag: '🇮🇷' },
  { code: 'en' as const, label: t('layout.langEn'), flag: '🇬🇧' },
]

const switchLanguage = async (code: 'fa' | 'en') => {
  await setLocale(code)
}

const drawer = ref(true)
const rail = ref(false)
const isLoading = ref(true)
const isMobile = computed(() => smAndDown.value)

const isActive = (path: string) => {
  if (path === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(path)
}

const updateDrawerState = () => {
  drawer.value = !isMobile.value
}

onMounted(() => {
  setTimeout(() => { isLoading.value = false }, 1400)
  updateDrawerState()
  window.addEventListener('resize', updateDrawerState)
  initTheme()
  tutorial.fetchStatus()

  const savedLocale = localStorage.getItem('locale')
  if (savedLocale && (savedLocale === 'fa' || savedLocale === 'en')) {
    setLocale(savedLocale)
  }
})

watch(() => route.path, (path) => {
  if (path === '/dashboard' && !tutorial.completed.value && !tutorial.loading.value) {
    nextTick(() => {
      setTimeout(() => tutorial.startTutorial(), 600)
    })
  }
}, { immediate: true })

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateDrawerState)
})

  const roleLabel = computed(() => {
    const roles: Record<string, string> = {
      admin_doctor: t('users.roles.admin_doctor'),
      doctor: t('users.roles.doctor'),
      pharmacy: t('users.roles.pharmacy'),
      lab: t('users.roles.lab'),
      patient: t('users.roles.patient'),
    }
    const currentRole = user?.value?.role || (user as any)?.role
    return roles[currentRole] || t('layout.systemUser')
  })

const userInitial = computed(() => {
  const name = user?.value?.fullName || (user as any)?.fullName
  return name ? name.charAt(0) : 'U'
})

const ALL_MENUS = computed(() => [
  { title: t('dashboard.title'), to: '/dashboard', icon: HomeAngle, roles: ['all'], category: 'primary' },
  { title: t('calendar.title'), to: '/calendar', icon: Calendar, roles: ['admin_doctor', 'doctor'], category: 'primary' },
  { title: t('scheduling.title'), to: '/scheduling', icon: Clock, roles: ['admin_doctor', 'doctor'], category: 'primary' },
  { title: t('appointments.title'), to: '/appointments', icon: Grid, roles: ['admin_doctor', 'doctor'], category: 'primary' },
  { title: t('visitTypes.title'), to: '/visit-types', icon: DocumentText, roles: ['admin_doctor', 'doctor'], category: 'primary' },
  { title: t('users.title'), to: '/users', icon: Users, roles: ['admin_doctor'], category: 'primary' },
  { title: t('messaging.title'), to: '/messaging', icon: ChatDots, roles: ['admin_doctor', 'doctor', 'lab', 'pharmacy'], category: 'primary' },
  { title: t('clinicalTools.title'), to: '/clinical-tools', icon: Calculator, roles: ['admin_doctor', 'doctor'], category: 'primary' },
  { title: t('billing.title'), to: '/billing', icon: Wallet, roles: ['admin_doctor'], category: 'primary' },
  { title: t('staff.title'), to: '/staff', icon: UsersGroup, roles: ['admin_doctor'], category: 'primary' },
  { title: t('adminSchedule.title'), to: '/admin/schedule', icon: Clock, roles: ['admin_doctor'], category: 'primary' },
  { title: t('attendance.title'), to: '/attendance', icon: Bell, roles: ['admin_doctor', 'doctor'], category: 'primary' },
  { title: t('adminSettings.title'), to: '/admin/settings', icon: Settings, roles: ['admin_doctor'], category: 'primary' },
  { title: t('screening.title'), to: '/screening', icon: ShieldCheck, roles: ['admin_doctor', 'doctor'], category: 'primary' },
  { title: t('labResults.title'), to: '/lab-results', icon: DocumentText, roles: ['admin_doctor', 'doctor', 'lab'], category: 'primary' },
  { title: t('prescriptions.title'), to: '/prescriptions', icon: MedicalKit, roles: ['admin_doctor', 'doctor', 'pharmacy'], category: 'primary' },
  { title: t('accounting.title'), to: '/accounting', icon: BookOpen, roles: ['admin_doctor'], category: 'primary' },
  { title: t('dailyReports.title'), to: '/daily-reports', icon: FileText, roles: ['admin_doctor', 'doctor'], category: 'primary' },
  { title: t('inventory.title'), to: '/inventory', icon: Box, roles: ['admin_doctor', 'pharmacy'], category: 'primary' },
  { title: t('auditLogs.title'), to: '/admin/audit', icon: AddClipboard, roles: ['admin_doctor'], category: 'primary' },
  { title: t('myProfile.title'), to: '/my-profile', icon: Profile, roles: ['all'], category: 'primary' },
  { title: t('patientMessaging.title'), to: '/patient/messaging', icon: ChatDots, roles: ['patient'], category: 'primary' },
  { title: t('patients.title'), to: '/patients', icon: UsersGroup, roles: ['admin_doctor', 'doctor'], category: 'patient' },
  { title: t('leads.title'), to: '/leads', icon: Activity, roles: ['admin_doctor', 'doctor'], category: 'patient' },
  { title: t('leadSources.title'), to: '/lead-sources', icon: FolderHeart, roles: ['admin_doctor'], category: 'patient' },
])

const hasAccess = (itemRoles: string[]) => {
  if (itemRoles.includes('all')) return true
  const currentUserRole = user?.value?.role || (user as any)?.role
  if (!currentUserRole) return false
  return itemRoles.includes(currentUserRole)
}

const primaryMenu = computed(() =>
  ALL_MENUS.value.filter(item => item.category === 'primary' && hasAccess(item.roles))
)

const patientMenu = computed(() =>
  ALL_MENUS.value.filter(item => item.category === 'patient' && hasAccess(item.roles))
)

const menuSections = computed(() => [
  { label: t('layout.mainMenu'), items: primaryMenu.value },
  { label: t('layout.patientsMenu'), items: patientMenu.value },
])
</script>
