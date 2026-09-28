<template>
  <v-locale-provider :rtl="locale === 'fa'">
    <v-app v-if="!isLoading" class="!bg-[#f0f2f5] dark:!bg-[#0f1117] transition-colors duration-300 relative">
      <transition name="fade">
        <v-progress-linear v-if="apiLoading" indeterminate color="#40E0D0" height="2"
          class="!fixed !top-0 !left-0 !right-0 !z-[9999] !m-0" />
      </transition>

      <!-- Ambient gradient orbs behind the glass surfaces -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <span class="dash-orb dash-orb-a" />
        <span class="dash-orb dash-orb-b" />
        <span class="dash-orb dash-orb-c" />
      </div>

      <!-- ── Header ─────────────────────────────────────────── -->
      <header ref="headerEl" class="crm-header">
        <div class="crm-header__inner" :class="{ 'is-scrolled': scrolled }">
          <!-- Mobile / tablet hamburger -->
          <div class="flex gap-1">
            <button class="crm-nav-toggle" :class="{ 'is-open': menuOpen }" aria-label="Toggle menu"
              :aria-expanded="menuOpen" @click="menuOpen = !menuOpen">
              <span class="crm-nav-toggle__line crm-nav-toggle__line--top" />
              <span class="crm-nav-toggle__line crm-nav-toggle__line--mid" />
              <span class="crm-nav-toggle__line crm-nav-toggle__line--bot" />
            </button>

            <!-- Brand -->
            <router-link to="/dashboard" class="crm-brand">
              <img src="../assets/images/logo.svg" alt="" class="crm-brand__logo">
              <div class="crm-brand__text">
                <h2 class="crm-brand__name">{{ t('layout.clinicName') }}</h2>
                <span class="crm-brand__sub">{{ t('layout.managementPanel') }}</span>
              </div>
            </router-link>
          </div>

          <!-- Navigation groups with hover dropdowns -->
          <nav class="crm-nav" :aria-label="t('layout.managementPanel')" @mouseenter="onNavEnter"
            @mouseleave="onNavLeave">
            <div v-for="group in visibleGroups" :key="group.key" class="crm-nav__group"
              @mouseenter="setHoverGroup(group.key)">
              <button class="crm-nav__trigger"
                :class="{ 'crm-nav__trigger--active': activeGroupKey === group.key || activeMenu === group.key }"
                :aria-expanded="activeMenu === group.key" @click="toggleGroupMenu(group.key)">
                <!-- <component :is="group.icon" class="crm-nav__trigger-icon" /> -->
                <span>{{ group.label }}</span>
                <!-- <svg class="crm-nav__chevron" viewBox="0 0 20 20" fill="currentColor"
                  :class="{ 'is-rotated': activeMenu === group.key }">
                  <path fill-rule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clip-rule="evenodd" />
                </svg> -->
              </button>

              <transition name="dropdown">
                <div v-if="activeMenu === group.key" class="crm-nav__dropdown" @mouseenter="setHoverGroup(group.key)"
                  @mouseleave="setHoverGroup(null)">
                  <div class="crm-nav__dropdown-head">
                    <component :is="group.icon" class="w-4 h-4 opacity-50" />
                    <span>{{ group.label }}</span>
                  </div>
                  <router-link v-for="item in group.items" :key="item.to" :to="item.to" class="crm-nav__item"
                    :class="{ 'crm-nav__item--active': isActive(item.to) }"
                    @click="hoveredGroup = null; lockedGroup = null; clearHoverCloseTimer()">
                    <span class="crm-nav__item-icon">
                      <component :is="item.icon" class="w-[18px] h-[18px]" />
                    </span>
                    <span class="flex-1 truncate">{{ item.title }}</span>
                    <!-- <svg v-if="isActive(item.to)" class="w-3.5 h-3.5 flex-shrink-0 opacity-60" viewBox="0 0 20 20"
                      fill="currentColor">
                      <path fill-rule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clip-rule="evenodd" />
                    </svg> -->
                  </router-link>
                </div>
              </transition>
            </div>
          </nav>

          <!-- Search -->
          <!-- <div class="crm-header__center">
            <div class="crm-search">
              <button
                class="crm-search__btn"
                aria-label="Search"
                @click="searchOpen = true"
              >
                <Magnify class="w-4 h-4" />
                <kbd class="crm-search__kbd">/</kbd>
              </button>
            </div>
          </div> -->

          <!-- Actions -->
          <div class="crm-actions">

            <button class="crm-user-chip">
              <span class="crm-user-chip__avatar">{{ userInitial }}</span>
              <span class="crm-user-chip__meta">
                <span class="crm-user-chip__name">{{ userName }}</span>
                <span class="crm-user-chip__role">{{ roleLabel }}</span>
              </span>
            </button>

            <button class="crm-icon-btn crm-icon-btn--theme" :aria-label="isDark ? 'Light mode' : 'Dark mode'"
              @click="toggleTheme">
              <Sun v-if="isDark" class="w-[20px] h-[20px]" />
              <Moon v-else class="w-[20px] h-[20px]" />
            </button>

            <div class="crm-lang" @mouseenter="langHover = true" @mouseleave="langHover = false">
              <button class="crm-icon-btn" :aria-label="'Switch language'" @click="toggleLang">
                <Language class="w-[20px] h-[20px]" />
              </button>
              <transition name="dropdown">
                <div v-if="langOpen" class="crm-lang__dropdown" @mouseenter="langHover = true"
                  @mouseleave="langHover = false">
                  <button v-for="lang in languages" :key="lang.code" class="crm-lang__option"
                    :class="{ 'crm-lang__option--active': locale === lang.code }" @click="switchLanguage(lang.code)">
                    <span class="text-sm">{{ lang.flag }}</span>
                    <span>{{ lang.label }}</span>
                  </button>
                </div>
              </transition>
            </div>

            <button class="crm-icon-btn">
              <Bell class="w-[20px] h-[20px] fill-inherit" />
              <span v-if="unreadNotifications > 0" class="crm-notice-dot" />
            </button>

            <div class="crm-divider" />

            <button class="crm-icon-btn crm-icon-btn--logout" :aria-label="t('layout.logout')" @click="logout()">
              <TurnOffIcon class="w-[20px] h-[20px]" />
            </button>
          </div>
        </div>

        <!-- Search modal -->
        <transition name="fade">
          <div v-if="searchOpen" class="crm-search-modal" @click.self="searchOpen = false">
            <div class="crm-search-modal__box">
              <Magnify class="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input ref="searchInput" type="text" :placeholder="t('common.search')"
                class="flex-1 bg-transparent outline-none text-sm text-slate-700 dark:text-slate-200">
              <button class="text-xs text-slate-400 hover:text-slate-600" @click="searchOpen = false">
                ESC
              </button>
            </div>
          </div>
        </transition>
      </header>

      <!-- ── Side navigation (mobile / tablet) ───────────────── -->
      <v-navigation-drawer v-model="menuOpen" temporary location="start" width="480" class="crm-drawer">
        <div class="crm-drawer__head">
          <router-link to="/dashboard" class="crm-drawer__brand" @click="menuOpen = false">
            <img src="../assets/images/logo.svg" alt="" class="crm-drawer__logo">
            <div class="crm-drawer__brand-text">
              <h2>{{ t('layout.clinicName') }}</h2>
              <span>{{ t('layout.managementPanel') }}</span>
            </div>
          </router-link>
          <button class="crm-drawer__close" aria-label="Close menu" @click="menuOpen = false">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav class="crm-drawer__nav" :aria-label="t('layout.managementPanel')">
          <div v-for="group in visibleGroups" :key="group.key" class="crm-drawer__group"
            :class="{ 'crm-drawer__group--open': isDrawerGroupOpen(group.key) }">
            <button class="crm-drawer__group-trigger"
              :class="{ 'crm-drawer__group-trigger--active': activeGroupKey === group.key }"
              :aria-expanded="isDrawerGroupOpen(group.key)" @click="toggleDrawerGroup(group.key)">
              <span class="crm-drawer__group-icon">
                <component :is="group.icon" class="w-[18px] h-[18px]" />
              </span>
              <span class="flex-1 truncate text-start">{{ group.label }}</span>
              <svg class="crm-drawer__chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            <div class="crm-drawer__group-body" :aria-hidden="!isDrawerGroupOpen(group.key)">
              <div class="crm-drawer__group-body-inner">
                <router-link v-for="item in group.items" :key="item.to" :to="item.to" class="crm-drawer__item"
                  :class="{ 'crm-drawer__item--active': isActive(item.to) }" @click="menuOpen = false">
                  <span class="crm-drawer__item-icon">
                    <component :is="item.icon" class="w-[16px] h-[16px]" />
                  </span>
                  <span class="flex-1 truncate">{{ item.title }}</span>
                </router-link>
              </div>
            </div>
          </div>
        </nav>

        <div class="crm-drawer__foot">
          <div class="crm-drawer__user">
            <span class="crm-drawer__avatar">{{ userInitial }}</span>
            <div class="crm-drawer__user-meta">
              <span class="crm-drawer__user-name">{{ userName }}</span>
              <span class="crm-drawer__user-role">{{ roleLabel }}</span>
            </div>
          </div>

          <div class="crm-drawer__actions">
            <button class="crm-drawer__icon-btn" :aria-label="isDark ? 'Light mode' : 'Dark mode'" @click="toggleTheme">
              <Sun v-if="isDark" class="w-[20px] h-[20px]" />
              <Moon v-else class="w-[20px] h-[20px]" />
            </button>
            <button class="crm-drawer__icon-btn" aria-label="Switch language" @click="toggleLang">
              <Language class="w-[20px] h-[20px]" />
            </button>
            <button class="crm-drawer__logout" :aria-label="t('layout.logout')" @click="logout()">
              <TurnOffIcon class="w-4 h-4" />
              <span>{{ t('layout.logout') }}</span>
            </button>
          </div>
        </div>
      </v-navigation-drawer>

      <!-- ── Main content ───────────────────────────────────── -->
      <v-main class="bg-transparent! min-h-screen">
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
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'

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
import Language from '~/components/icons/Language.vue'
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
import FaqIcon from '~/components/icons/FaqIcon.vue'
import Magnify from '~/components/icons/Magnify.vue'

const route = useRoute()
const { user, logout } = useAuth()
const { apiLoading } = useApi()
const { isDark, toggleTheme, initTheme } = useThemeMode()
const { t, locale, setLocale } = useI18n()

const tutorial = useTutorial()

const languages = [
  { code: 'fa' as const, label: t('layout.langFa'), flag: '🇮🇷' },
  { code: 'en' as const, label: t('layout.langEn'), flag: '🇬🇧' },
]

const switchLanguage = async (code: 'fa' | 'en') => {
  useCookie('i18n_lang', { sameSite: 'lax', maxAge: 60 * 60 * 24 * 365, path: '/' }).value = code
  await setLocale(code)
}

const isLoading = ref(true)
const scrolled = ref(false)
const hoveredGroup = ref<string | null>(null)
const lockedGroup = ref<string | null>(null)
const langHover = ref(false)
const langLocked = ref(false)
const searchOpen = ref(false)
const unreadNotifications = ref(0)

const menuOpen = ref(false)
const openDrawerGroups = ref<Record<string, boolean>>({})

const isDrawerGroupOpen = (key: string) => !!openDrawerGroups.value[key]

const toggleDrawerGroup = (key: string) => {
  openDrawerGroups.value = {
    ...openDrawerGroups.value,
    [key]: !openDrawerGroups.value[key],
  }
}

const headerEl = ref<HTMLElement | null>(null)
let headerObserver: ResizeObserver | undefined

const measureHeader = () => {
  if (!headerEl.value) return
  const h = headerEl.value.offsetHeight
  document.documentElement.style.setProperty('--crm-header-h', `${h}px`)
}

const onDocClick = (e: MouseEvent) => {
  const target = e.target as Node
  if (target instanceof Node && !(target as Element).closest('.crm-nav, .crm-lang')) {
    clearHoverCloseTimer()
    hoveredGroup.value = null
    lockedGroup.value = null
    langHover.value = false
    langLocked.value = false
  }
}

const activeMenu = computed(() => hoveredGroup.value ?? lockedGroup.value)
const langOpen = computed(() => langHover.value || langLocked.value)

let hoverCloseTimer: ReturnType<typeof setTimeout> | undefined

const clearHoverCloseTimer = () => {
  if (hoverCloseTimer) {
    clearTimeout(hoverCloseTimer)
    hoverCloseTimer = undefined
  }
}

const setHoverGroup = (key: string | null) => {
  clearHoverCloseTimer()
  if (key) {
    hoveredGroup.value = key
    return
  }
  hoverCloseTimer = setTimeout(() => {
    hoveredGroup.value = null
  }, 150)
}

const onNavEnter = () => {
  clearHoverCloseTimer()
}

const onNavLeave = () => {
  clearHoverCloseTimer()
  hoverCloseTimer = setTimeout(() => {
    hoveredGroup.value = null
  }, 150)
}

const isActive = (path: string) => {
  if (path === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(path)
}

const toggleGroupMenu = (key: string) => {
  if (lockedGroup.value === key) {
    lockedGroup.value = null
  } else {
    lockedGroup.value = key
  }
  hoveredGroup.value = null
}

const toggleLang = () => {
  langLocked.value = !langLocked.value
  langHover.value = false
}

onMounted(() => {
  setTimeout(() => { isLoading.value = false }, 1400)
  initTheme()
  tutorial.fetchStatus()

  const savedLocale = localStorage.getItem('locale')
  if (savedLocale && (savedLocale === 'fa' || savedLocale === 'en')) {
    setLocale(savedLocale)
  }

  window.addEventListener('scroll', onScroll)
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('click', onDocClick)
})

watch(isLoading, async (val) => {
  if (!val) {
    await nextTick()
    measureHeader()
    headerObserver = new ResizeObserver(() => measureHeader())
    if (headerEl.value) headerObserver.observe(headerEl.value)
  }
})

const onScroll = () => {
  scrolled.value = window.scrollY > 8
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === '/' && !searchOpen.value && !(e.target instanceof HTMLInputElement)) {
    e.preventDefault()
    searchOpen.value = true
    setTimeout(() => searchInput.value?.focus(), 60)
  }
  if (e.key === 'Escape') {
    searchOpen.value = false
    menuOpen.value = false
    clearHoverCloseTimer()
    hoveredGroup.value = null
    lockedGroup.value = null
    langHover.value = false
    langLocked.value = false
  }
}

const searchInput = ref<HTMLInputElement | null>(null)

watch(() => route.path, () => {
  menuOpen.value = false
  clearHoverCloseTimer()
  hoveredGroup.value = null
  lockedGroup.value = null
  langHover.value = false
  langLocked.value = false
})

watch(menuOpen, (open) => {
  document.body.style.overflow = open ? 'hidden' : ''
  if (open && activeGroupKey.value) {
    openDrawerGroups.value = {
      ...openDrawerGroups.value,
      [activeGroupKey.value]: true,
    }
  }
})

onBeforeUnmount(() => {
  document.body.style.overflow = ''
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('click', onDocClick)
  headerObserver?.disconnect()
  document.documentElement.style.removeProperty('--crm-header-h')
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
  const currentRole = user.value?.role
  return currentRole ? roles[currentRole] || t('layout.systemUser') : t('layout.systemUser')
})

const userInitial = computed(() => {
  const name = user.value?.fullName
  return name ? name.charAt(0) : 'U'
})

const userName = computed(() => {
  return user.value?.fullName || t('layout.guestUser')
})

const ALL_MENUS = computed(() => [
  { title: t('dashboard.title'), to: '/dashboard', icon: HomeAngle, roles: ['all'], group: 'main' },
  { title: t('myProfile.title'), to: '/my-profile', icon: Profile, roles: ['all'], group: 'main' },
  { title: t('mySessions.title'), to: '/my-sessions', icon: ShieldCheck, roles: ['all'], group: 'main' },
  { title: t('calendar.title'), to: '/calendar', icon: Calendar, roles: ['admin_doctor', 'doctor'], group: 'clinical' },
  { title: t('followups.title'), to: '/follow-ups', icon: Bell, roles: ['admin_doctor', 'doctor'], group: 'clinical' },
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
  { title: t('finance.title'), to: '/finance', icon: Wallet, roles: ['admin_doctor', 'doctor'], group: 'finance' },
  { title: t('inventory.title'), to: '/inventory', icon: Box, roles: ['admin_doctor', 'pharmacy'], group: 'finance' },
  { title: t('accounting.title'), to: '/accounting', icon: BookOpen, roles: ['admin_doctor'], group: 'finance' },
  { title: t('consumables.title'), to: '/consumables', icon: Basket, roles: ['admin_doctor', 'doctor'], group: 'finance' },
  { title: t('dailyReports.title'), to: '/daily-reports', icon: FileText, roles: ['admin_doctor', 'doctor'], group: 'finance' },
])

const hasAccess = (itemRoles: string[]) => {
  if (itemRoles.includes('all')) return true
  const currentUserRole = user.value?.role
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

const activeGroupKey = computed(() => {
  const group = visibleGroups.value.find((g) =>
    g.items.some((item) => isActive(item.to))
  )
  return group ? group.key : null
})
</script>

<style scoped>
/* ── Header shell ─────────────────────────────────────────── */

.crm-header {
  position: sticky;
  top: 0;
  z-index: 100;
}

.crm-header__inner {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  transition: box-shadow 0.3s ease, background-color 0.3s ease;
}

/* Frosted glass layer lives on ::before so the header itself never
   becomes a containing block for any fixed-position overlays. */
.crm-header__inner::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
}

.crm-header__inner.is-scrolled::before {
  background: rgba(255, 255, 255, 0.9);
}

:global(.dark) .crm-header__inner::before {
  background: rgba(15, 17, 23, 0.78);
}

:global(.dark) .crm-header__inner.is-scrolled::before {
  background: rgba(15, 17, 23, 0.9);
}

/* ── Brand ────────────────────────────────────────────────── */

.crm-brand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  text-decoration: none;
  flex-shrink: 0;
  border-radius: 12px;
  outline: none;
}

.crm-brand:focus-visible {
  outline: 2px solid #00adb5;
  outline-offset: 2px;
}

.crm-brand__logo {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
}

.crm-brand__name {
  font-size: 0.9375rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.25;
  white-space: nowrap;
}

:global(.dark) .crm-brand__name {
  color: #e2e8f0;
}

.crm-brand__sub {
  display: block;
  font-size: 0.6875rem;
  font-weight: 600;
  color: #00adb5;
  line-height: 1.25;
  white-space: nowrap;
}

:global(.dark) .crm-brand__sub {
  color: #22d3ee;
}

/* ── Navigation ───────────────────────────────────────────── */

.crm-nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  min-width: 0;
  max-width: min-content;
  margin-inline: 0.25rem;
  background-color: white;
  border-radius: 9999px;
  padding: 0.25rem 0.25rem;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

:global(.dark) .crm-nav {
  background: rgba(15, 17, 23, 0.5);
  border-color: rgba(255, 255, 255, 0.06);
}

/* ── Mobile / tablet menu toggle ──────────────────────────── */

.crm-nav-toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #475569;
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  transition: background-color 0.18s ease, color 0.18s ease;
}

.crm-nav-toggle:hover {
  background: rgba(0, 173, 181, 0.08);
  color: #00838f;
}

.crm-nav-toggle:focus-visible {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(0, 173, 181, 0.5);
}

:global(.dark) .crm-nav-toggle {
  color: #94a3b8;
}

:global(.dark) .crm-nav-toggle:hover {
  background: rgba(34, 211, 238, 0.1);
  color: #22d3ee;
}

.crm-nav-toggle__line {
  position: absolute;
  left: 50%;
  width: 18px;
  height: 2px;
  border-radius: 9999px;
  background: currentColor;
  transform: translateX(-50%);
  transition: transform 0.28s ease, opacity 0.2s ease, top 0.28s ease;
}

.crm-nav-toggle__line--top {
  top: calc(50% - 7px);
}

.crm-nav-toggle__line--mid {
  top: calc(50% - 1px);
}

.crm-nav-toggle__line--bot {
  top: calc(50% + 5px);
}

.crm-nav-toggle.is-open .crm-nav-toggle__line--top {
  top: 50%;
  transform: translate(-50%, -50%) rotate(45deg);
}

.crm-nav-toggle.is-open .crm-nav-toggle__line--mid {
  opacity: 0;
}

.crm-nav-toggle.is-open .crm-nav-toggle__line--bot {
  top: 50%;
  transform: translate(-50%, -50%) rotate(-45deg);
}

.crm-nav__group {
  position: relative;
}

.crm-nav__trigger {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.75rem 1.25rem;
  border-radius: 9999px;
  border: none;
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
  outline: none;
}

.crm-nav__trigger:hover {
  background: rgba(0, 173, 181, 0.08);
  color: #00838f;
}

.crm-nav__trigger--active {
  background: #00adb5;
  color: #f8f9fb;
  fill: #00adb5;
  font-weight: 600;
}

:global(.dark) .crm-nav__trigger {
  color: #94a3b8;
}

:global(.dark) .crm-nav__trigger:hover {
  background: rgba(0, 173, 181, 0.1);
  color: #22d3ee;
}

:global(.dark) .crm-nav__trigger--active {
  background: rgba(0, 173, 181, 0.14);
  color: #22d3ee;
}

.crm-nav__trigger:focus-visible {
  outline: 2px solid #00adb5;
  outline-offset: 2px;
}

.crm-nav__trigger-icon {
  width: 1rem;
  height: 1rem;
  opacity: 0.7;
  flex-shrink: 0;
}

.crm-nav__chevron {
  width: 0.75rem;
  height: 0.75rem;
  opacity: 0.5;
  transition: transform 0.2s ease;
}

.crm-nav__chevron.is-rotated {
  transform: rotate(180deg);
}

/* ── Dropdown ─────────────────────────────────────────────── */

.crm-nav__dropdown {
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: absolute;
  top: calc(100% + 10px);
  inset-inline-start: 0;
  min-width: 248px;
  padding: 0.5rem;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 14px;
  box-shadow: 0 20px 40px -12px rgba(15, 23, 42, 0.18);
  backdrop-filter: blur(24px) saturate(1.6);
  -webkit-backdrop-filter: blur(24px) saturate(1.6);
  z-index: 110;
}

:global(.dark) .crm-nav__dropdown {
  background: rgba(30, 41, 59, 0.96);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.5);
}

/* Invisible hover bridge: keeps the menu open while the cursor
   crosses the gap between the trigger pill and the dropdown. */
.crm-nav__dropdown::after {
  content: '';
  position: absolute;
  top: -10px;
  inset-inline-start: 0;
  inset-inline-end: 0;
  height: 10px;
}

:global(.dark) .crm-nav__dropdown::before {
  border-bottom-color: rgba(30, 41, 59, 0.96);
}

.crm-nav__dropdown-head {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.625rem 0.625rem;
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #00adb5;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 0.375rem;
}

:global(.dark) .crm-nav__dropdown-head {
  color: #22d3ee;
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.crm-nav__item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.625rem;
  border-radius: 10px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #475569;
  text-decoration: none;
  transition: all 0.15s ease;
  outline: none;
}

.crm-nav__item:hover {
  background: rgba(0, 173, 181, 0.07);
  color: #00838f;
}

.crm-nav__item--active {
  background: rgba(0, 173, 181, 0.1);
  color: #00adb5;
  font-weight: 600;
}

:global(.dark) .crm-nav__item {
  color: #cbd5e1;
}

:global(.dark) .crm-nav__item:hover {
  background: rgba(0, 173, 181, 0.1);
  color: #22d3ee;
}

:global(.dark) .crm-nav__item--active {
  background: rgba(0, 173, 181, 0.14);
  color: #22d3ee;
}

.crm-nav__item:focus-visible {
  outline: 2px solid #00adb5;
  outline-offset: -2px;
}

.crm-nav__item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.03);
  color: #94a3b8;
  flex-shrink: 0;
  transition: all 0.15s ease;
}

:global(.dark) .crm-nav__item-icon {
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
}

.crm-nav__item:hover .crm-nav__item-icon {
  background: rgba(0, 173, 181, 0.12);
  color: #00adb5;
}

.crm-nav__item--active .crm-nav__item-icon {
  background: rgba(0, 173, 181, 0.14);
  color: #00adb5;
}

:global(.dark) .crm-nav__item:hover .crm-nav__item-icon {
  color: #22d3ee;
}

:global(.dark) .crm-nav__item--active .crm-nav__item-icon {
  color: #22d3ee;
}

/* ── Header center (search) ───────────────────────────────── */

.crm-header__center {
  flex: 1;
  display: flex;
  justify-content: center;
  min-width: 0;
}

.crm-search {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  max-width: 360px;
  height: 36px;
  padding: 0.6875rem;
  background: rgba(0, 0, 0, 0.03);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 10px;
  transition: all 0.2s ease;
}

:global(.dark) .crm-search {
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.06);
}

.crm-search:focus-within {
  border-color: rgba(0, 173, 181, 0.4);
  box-shadow: 0 0 0 3px rgba(0, 173, 181, 0.08);
  background: white;
}

:global(.dark) .crm-search:focus-within {
  background: rgba(15, 17, 23, 0.9);
}

.crm-search__btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background: none;
  cursor: pointer;
  outline: none;
  color: #94a3b8;
}

.crm-search__btn::placeholder {
  color: #94a3b8;
}

.crm-search__btn:focus-visible {
  outline: 2px solid #00adb5;
  outline-offset: -2px;
  border-radius: 8px;
}

.crm-search__kbd {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  min-width: 20px;
  padding: 0 5px;
  border-radius: 5px;
  font-size: 0.6875rem;
  font-weight: 600;
  font-family: inherit;
  color: #94a3b8;
  background: rgba(0, 0, 0, 0.04);
  border: 1px solid rgba(0, 0, 0, 0.06);
}

:global(.dark) .crm-search__kbd {
  color: #64748b;
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(255, 255, 255, 0.08);
}

/* ── Search modal ─────────────────────────────────────────── */

.crm-search-modal {
  position: fixed;
  inset: 0;
  z-index: 200;
  background: rgba(15, 17, 23, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 12vh;
}

.crm-search-modal__box {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: min(560px, 92vw);
  padding: 0.875rem 1rem;
  background: white;
  border-radius: 14px;
  box-shadow: 0 24px 56px -16px rgba(15, 23, 42, 0.35);
}

:global(.dark) .crm-search-modal__box {
  background: #1e293b;
}

/* ── Actions ──────────────────────────────────────────────── */

.crm-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  flex-shrink: 0;
}

.crm-icon-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #64748b;
  fill: #64748b;
  stroke: #64748b;
  stroke-width: 0.5px;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  appearance: none;
  outline: none;
  transition: background-color 0.18s ease, color 0.18s ease, fill 0.18s ease,
    stroke 0.18s ease, transform 0.12s ease;
}

.crm-icon-btn:hover {
  background: rgba(0, 173, 181, 0.08);
  color: #0f766e;
  fill: #0f766e;
  stroke: #0f766e;
}

.crm-icon-btn:active {
  transform: scale(0.92);
  background: rgba(0, 173, 181, 0.14);
}

:global(.dark) .crm-icon-btn {
  color: #94a3b8;
  fill: #94a3b8;
  stroke: #94a3b8;
}

:global(.dark) .crm-icon-btn:hover {
  background: rgba(34, 211, 238, 0.1);
  color: #22d3ee;
  fill: #22d3ee;
  stroke: #22d3ee;
}

.crm-icon-btn:focus-visible {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(0, 173, 181, 0.5);
}

:global(.dark) .crm-icon-btn:focus-visible {
  box-shadow: 0 0 0 2px #0f1117, 0 0 0 4px rgba(34, 211, 238, 0.55);
}

.crm-icon-btn--logout:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #dc2626;
  fill: #dc2626;
  stroke: #dc2626;
}

:global(.dark) .crm-icon-btn--logout:hover {
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
  fill: #f87171;
  stroke: #f87171;
}

@media (prefers-reduced-motion: reduce) {
  .crm-icon-btn {
    transition: none;
  }
}

.crm-notice-dot {
  position: absolute;
  top: 7px;
  inset-inline-end: 7px;
  width: 6px;
  height: 6px;
  background: #ef4444;
  border-radius: 9999px;
  border: 2px solid white;
  box-sizing: content-box;
}

:global(.dark) .crm-notice-dot {
  border-color: #0f1117;
}

/* ── Language dropdown ────────────────────────────────────── */

.crm-lang {
  position: relative;
}

.crm-lang__dropdown {
  position: absolute;
  top: calc(100% + 10px);
  inset-inline-end: 0;
  min-width: 140px;
  padding: 0.375rem;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: 12px;
  box-shadow: 0 16px 32px -12px rgba(15, 23, 42, 0.18);
  z-index: 115;
}

/* Invisible hover bridge for the language dropdown */
.crm-lang__dropdown::before {
  content: '';
  position: absolute;
  top: -10px;
  inset-inline-start: 0;
  inset-inline-end: 0;
  height: 10px;
}

:global(.dark) .crm-lang__dropdown {
  background: rgba(30, 41, 59, 0.96);
  border-color: rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 32px -12px rgba(0, 0, 0, 0.5);
}

.crm-lang__option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.625rem;
  border: none;
  background: none;
  border-radius: 8px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #475569;
  cursor: pointer;
  transition: all 0.15s ease;
  outline: none;
}

.crm-lang__option:hover {
  background: rgba(0, 173, 181, 0.07);
  color: #00adb5;
}

.crm-lang__option--active {
  background: rgba(0, 173, 181, 0.1);
  color: #00adb5;
  font-weight: 600;
}

:global(.dark) .crm-lang__option {
  color: #cbd5e1;
}

:global(.dark) .crm-lang__option:hover {
  background: rgba(0, 173, 181, 0.1);
  color: #22d3ee;
}

:global(.dark) .crm-lang__option--active {
  background: rgba(0, 173, 181, 0.14);
  color: #22d3ee;
}

.crm-lang__option:focus-visible {
  outline: 2px solid #00adb5;
  outline-offset: -2px;
}

/* ── Divider ──────────────────────────────────────────────── */

.crm-divider {
  width: 1px;
  height: 24px;
  background: rgba(0, 0, 0, 0.07);
  margin-inline: 0.375rem;
}

:global(.dark) .crm-divider {
  background: rgba(255, 255, 255, 0.08);
}

/* ── User chip ────────────────────────────────────────────── */

.crm-user-chip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem .3rem 0.3rem 0.6rem;
  border: none;
  background: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  outline: none;
}

.crm-user-chip:hover {
  background: rgba(0, 0, 0, 0.03);
}

:global(.dark) .crm-user-chip:hover {
  background: rgba(255, 255, 255, 0.04);
}

.crm-user-chip:focus-visible {
  outline: 2px solid #00adb5;
  outline-offset: 2px;
}

.crm-user-chip__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: linear-gradient(135deg, #00adb5, #0ea5e9);
  color: white;
  font-size: 0.8125rem;
  font-weight: 700;
  flex-shrink: 0;
}

.crm-user-chip__name {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #1e293b;
  line-height: 1.2;
  text-align: start;
  white-space: nowrap;
  max-width: 132px;
  overflow: hidden;
  text-overflow: ellipsis;
}

:global(.dark) .crm-user-chip__name {
  color: #e2e8f0;
}

.crm-user-chip__role {
  display: block;
  font-size: 0.6875rem;
  font-weight: 500;
  color: #00adb5;
  line-height: 1.2;
  text-align: start;
  white-space: nowrap;
}

.crm-user-chip__meta {
  display: flex;
  flex-direction: column;
  gap: 2px
}

:global(.dark) .crm-user-chip__role {
  color: #22d3ee;
}

/* ── Ambient orbs ─────────────────────────────────────────── */

.dash-orb {
  position: fixed;
  border-radius: 9999px;
  filter: blur(64px);
  opacity: 0.55;
  pointer-events: none;
}

.dash-orb-a {
  width: 880px;
  height: 880px;
  top: -280px;
  inset-inline-end: -180px;
  background: radial-gradient(circle, rgba(0, 173, 181, 0.3), transparent 70%);
}

.dash-orb-b {
  width: 380px;
  height: 380px;
  top: 260px;
  inset-inline-start: -70px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.2), transparent 70%);
}

.dash-orb-c {
  width: 520px;
  height: 520px;
  inset-inline-start: 35%;
  bottom: -200px;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.16), transparent 70%);
}

:global(.dark) .dash-orb-a {
  opacity: 0.32;
  background: radial-gradient(circle, rgba(0, 173, 181, 0.4), transparent 70%);
}

:global(.dark) .dash-orb-b {
  opacity: 0.26;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.32), transparent 70%);
}

:global(.dark) .dash-orb-c {
  opacity: 0.22;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.3), transparent 70%);
}

/* ── Dropdown transition ──────────────────────────────────── */

.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
  transform-origin: top;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
}

.dropdown-leave-active {
  pointer-events: none;
}

/* ── Generic fade ─────────────────────────────────────────── */

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-leave-active {
  pointer-events: none;
}

/* ── Side navigation drawer (mobile / tablet) ─────────────── */

.crm-drawer {
  display: flex;
  flex-direction: column;
  background: rgba(248, 250, 252, 0.98);
  border-inline-end: 1px solid rgba(15, 23, 42, 0.08);
}

:global(.dark) .crm-drawer {
  background: rgba(15, 17, 23, 0.98);
  border-inline-end-color: rgba(255, 255, 255, 0.08);
}

.crm-drawer__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1rem 0.875rem 0.875rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.07);
}

:global(.dark) .crm-drawer__head {
  border-bottom-color: rgba(255, 255, 255, 0.08);
}

.crm-drawer__brand {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-width: 0;
  border-radius: 12px;
  text-decoration: none;
  outline: none;
}

.crm-drawer__brand:focus-visible {
  outline: 2px solid #00adb5;
  outline-offset: 2px;
}

.crm-drawer__logo {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
}

.crm-drawer__brand-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.crm-drawer__brand-text h2 {
  font-size: 0.875rem;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:global(.dark) .crm-drawer__brand-text h2 {
  color: #e2e8f0;
}

.crm-drawer__brand-text span {
  font-size: 0.6875rem;
  font-weight: 600;
  color: #00adb5;
  line-height: 1.25;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.crm-drawer__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border: none;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.03);
  color: #64748b;
  cursor: pointer;
  outline: none;
  transition: all 0.18s ease;
}

.crm-drawer__close:hover {
  background: rgba(0, 173, 181, 0.1);
  color: #00838f;
  transform: rotate(90deg);
}

.crm-drawer__close:focus-visible {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(0, 173, 181, 0.5);
}

.crm-drawer__close svg {
  width: 18px;
  height: 18px;
}

:global(.dark) .crm-drawer__close {
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
}

:global(.dark) .crm-drawer__close:hover {
  background: rgba(34, 211, 238, 0.12);
  color: #22d3ee;
}

.crm-drawer__nav {
  flex: 1 1 auto;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 173, 181, 0.35) transparent;
}

.crm-drawer__group {
  margin-bottom: 0.25rem;
}

.crm-drawer__group-trigger {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: none;
  border-radius: 12px;
  background: transparent;
  font-size: 0.8125rem;
  font-weight: 600;
  color: #475569;
  text-align: start;
  cursor: pointer;
  outline: none;
  -webkit-tap-highlight-color: transparent;
  transition: all 0.18s ease;
}

.crm-drawer__group-trigger:hover {
  background: rgba(0, 173, 181, 0.07);
  color: #0f766e;
}

.crm-drawer__group-trigger--active {
  background: linear-gradient(90deg, rgba(0, 173, 181, 0.12), rgba(0, 173, 181, 0.04));
  color: #00838f;
}

.crm-drawer__group-trigger:focus-visible {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(0, 173, 181, 0.5);
}

.crm-drawer__group-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  flex-shrink: 0;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.04);
  color: #64748b;
  transition: all 0.18s ease;
}

.crm-drawer__group-trigger--active .crm-drawer__group-icon {
  background: rgba(0, 173, 181, 0.14);
  color: #00adb5;
}

.crm-drawer__chevron {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #94a3b8;
  transition: transform 0.28s ease;
}

.crm-drawer__group--open .crm-drawer__chevron {
  transform: rotate(180deg);
}

.crm-drawer__group-body {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.32s ease;
}

.crm-drawer__group--open .crm-drawer__group-body {
  grid-template-rows: 1fr;
}

.crm-drawer__group-body-inner {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 0.1rem 0.375rem;
  min-height: 0;
  overflow: hidden;
}

.crm-drawer__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: #4b5563;
  text-decoration: none;
  outline: none;
  transition: all 0.15s ease;
}

.crm-drawer__item:hover {
  background: rgba(0, 173, 181, 0.06);
  color: #0f766e;
}

.crm-drawer__item--active {
  background: rgba(0, 173, 181, 0.1);
  color: #00838f;
  font-weight: 600;
}

.crm-drawer__item:focus-visible {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(0, 173, 181, 0.5);
}

.crm-drawer__item-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.03);
  color: #94a3b8;
  transition: all 0.15s ease;
}

.crm-drawer__item--active .crm-drawer__item-icon {
  background: rgba(0, 173, 181, 0.14);
  color: #00adb5;
}

:global(.dark) .crm-drawer__group-trigger {
  color: #94a3b8;
}

:global(.dark) .crm-drawer__group-trigger:hover {
  background: rgba(0, 173, 181, 0.1);
  color: #22d3ee;
}

:global(.dark) .crm-drawer__group-trigger--active {
  background: linear-gradient(90deg, rgba(0, 173, 181, 0.16), rgba(0, 173, 181, 0.06));
  color: #22d3ee;
}

:global(.dark) .crm-drawer__group-icon {
  background: rgba(255, 255, 255, 0.06);
  color: #94a3b8;
}

:global(.dark) .crm-drawer__group-trigger--active .crm-drawer__group-icon {
  background: rgba(0, 173, 181, 0.18);
  color: #22d3ee;
}

:global(.dark) .crm-drawer__chevron {
  color: #64748b;
}

:global(.dark) .crm-drawer__item {
  color: #cbd5e1;
}

:global(.dark) .crm-drawer__item:hover {
  background: rgba(0, 173, 181, 0.1);
  color: #22d3ee;
}

:global(.dark) .crm-drawer__item--active {
  background: rgba(0, 173, 181, 0.14);
  color: #22d3ee;
}

:global(.dark) .crm-drawer__item-icon {
  background: rgba(255, 255, 255, 0.06);
  color: #94a3b8;
}

:global(.dark) .crm-drawer__item--active .crm-drawer__item-icon {
  background: rgba(0, 173, 181, 0.18);
  color: #22d3ee;
}

.crm-drawer__foot {
  padding: 0.75rem 0.875rem 1rem;
  border-top: 1px solid rgba(15, 23, 42, 0.07);
}

:global(.dark) .crm-drawer__foot {
  border-top-color: rgba(255, 255, 255, 0.08);
}

.crm-drawer__user {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.25rem 0.75rem;
}

.crm-drawer__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 12px;
  background: linear-gradient(135deg, #00adb5, #0ea5e9);
  color: white;
  font-size: 0.9375rem;
  font-weight: 700;
}

.crm-drawer__user-meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.crm-drawer__user-name {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #1e293b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:global(.dark) .crm-drawer__user-name {
  color: #e2e8f0;
}

.crm-drawer__user-role {
  font-size: 0.6875rem;
  font-weight: 500;
  color: #00adb5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

:global(.dark) .crm-drawer__user-role {
  color: #22d3ee;
}

.crm-drawer__actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding-top: 0.625rem;
  border-top: 1px solid rgba(15, 23, 42, 0.07);
}

:global(.dark) .crm-drawer__actions {
  border-top-color: rgba(255, 255, 255, 0.07);
}

.crm-drawer__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border: none;
  border-radius: 12px;
  background: transparent;
  color: #64748b;
  cursor: pointer;
  outline: none;
  transition: all 0.18s ease;
}

.crm-drawer__icon-btn:hover {
  background: rgba(0, 173, 181, 0.08);
  color: #0f766e;
}

.crm-drawer__icon-btn:focus-visible {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(0, 173, 181, 0.5);
}

:global(.dark) .crm-drawer__icon-btn {
  color: #94a3b8;
}

:global(.dark) .crm-drawer__icon-btn:hover {
  background: rgba(34, 211, 238, 0.1);
  color: #22d3ee;
}

.crm-drawer__logout {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-inline-start: auto;
  padding: 0.5rem 0.875rem;
  border: 1px solid rgba(239, 68, 68, 0.25);
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.06);
  color: #dc2626;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  outline: none;
  white-space: nowrap;
  transition: all 0.18s ease;
}

.crm-drawer__logout:hover {
  background: rgba(239, 68, 68, 0.12);
}

.crm-drawer__logout:focus-visible {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px rgba(239, 68, 68, 0.5);
}

:global(.dark) .crm-drawer__logout {
  border-color: rgba(248, 113, 113, 0.3);
  background: rgba(239, 68, 68, 0.12);
  color: #f87171;
}

:global(.dark) .crm-drawer__logout:hover {
  background: rgba(239, 68, 68, 0.18);
}

/* ── Responsive ───────────────────────────────────────────── */

@media (max-width: 1279px) {
  .crm-header__inner {
    flex-wrap: nowrap;
  }

  /* Pill navigation is replaced by the side drawer on mobile / tablet */
  .crm-nav {
    display: none;
  }
}

@media (min-width: 1280px) {
  .crm-nav-toggle {
    display: none;
  }
}

@media (max-width: 767px) {
  .crm-header__inner {
    padding: 0.625rem 0.875rem;
    gap: 0.5rem;
    flex-wrap: nowrap;
    overflow: hidden;
  }

  .crm-brand {
    flex-shrink: 1;
    min-width: 0;
  }

  .crm-brand__logo {
    width: 36px;
    height: 36px;
  }

  .crm-brand__name {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .crm-brand__sub {
    display: none;
  }

  .crm-header__center {
    display: none;
  }

  .crm-user-chip__meta {
    display: none;
  }

  .crm-divider {
    display: none;
  }

  /* On phones keep the header to a single compact row: theme / language /
     logout are already available inside the drawer, so hide them here. */
  .crm-icon-btn--theme,
  .crm-lang,
  .crm-icon-btn--logout {
    display: none;
  }
}

/* Small phones */
@media (max-width: 420px) {
  .crm-header__inner {
    padding: 0.5rem 0.625rem;
    gap: 0.375rem;
  }

  .crm-brand__logo {
    width: 32px;
    height: 32px;
  }

  .crm-icon-btn {
    width: 38px;
    height: 38px;
  }

  .crm-brand__name {
    font-size: 0.875rem;
  }

  .crm-drawer {
    width: 100% !important;
    max-width: 100vw;
  }
}

/* TV screens */
@media (min-width: 1536px) {
  .crm-header__inner {
    padding: 1rem 2rem;
  }

  .crm-brand__logo {
    width: 48px;
    height: 48px;
  }

  .crm-nav {
    flex: 1 1 auto;
    justify-content: center;
    margin-inline: 2rem;
  }

  .crm-nav__trigger {
    padding: 0.9rem 1.5rem;
    font-size: 0.9rem;
  }

  .crm-nav__dropdown {
    min-width: 280px;
  }

  .crm-icon-btn {
    width: 44px;
    height: 44px;
  }
}

/* 4K TVs */
@media (min-width: 2560px) {
  .crm-header__inner {
    padding: 1.25rem 3rem;
  }

  .crm-brand__logo {
    width: 54px;
    height: 54px;
  }

  .crm-nav__trigger {
    padding: 1rem 1.75rem;
    font-size: 1rem;
  }

  .crm-nav__dropdown {
    min-width: 300px;
  }
}

/* ── Reduced motion ───────────────────────────────────────── */

@media (prefers-reduced-motion: reduce) {

  .crm-header__inner,
  .crm-nav__trigger,
  .crm-nav__item,
  .crm-nav__dropdown,
  .dash-orb {
    animation: none !important;
    transition: none !important;
  }

  .dropdown-enter-active,
  .dropdown-leave-active,
  .fade-enter-active,
  .fade-leave-active {
    transition: none !important;
  }
}
</style>