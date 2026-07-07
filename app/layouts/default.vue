<template>
  <v-locale-provider rtl>
    <transition name="fade">
      <div v-if="isLoading"
        class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        <div class="absolute inset-0 bg-periwinkle/30 dark:bg-electric-sapphire/20 backdrop-blur-sm"></div>
        <div
          class="absolute top-0 right-0 w-[600px] h-[600px] bg-baby-blue-ice/40 dark:bg-electric-sapphire/30 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3">
        </div>
        <div
          class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-periwinkle/40 dark:bg-electric-sapphire/30 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/3">
        </div>

        <div class="relative z-10 flex flex-col items-center gap-8">
          <div class="p-8 rounded-3xl shadow-2xl shadow-electric-sapphire/50 backdrop-blur-md">
            <MedicalKit class="w-20 h-20 fill-electric-sapphire dark:fill-cornflower-blue" />
          </div>
          <v-progress-circular indeterminate color="#5465ff" size="80" width="8" class="drop-shadow-lg" />
          <div class="text-center">
            <h3 class="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">در حال بارگذاری پنل کلینیک</h3>
            <p class="text-slate-400 dark:text-slate-400 text-lg">لطفاً صبر کنید...</p>
          </div>
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-96 h-96 bg-baby-blue-ice/20 dark:bg-electric-sapphire/10 rounded-full animate-ping-slow">
            </div>
          </div>
        </div>
      </div>
    </transition>

    <v-app v-if="!isLoading" class="bg-slate-50! dark:bg-slate-900! transition-colors duration-300 relative">
      <transition name="fade">
        <v-progress-linear v-if="apiLoading" indeterminate color="#5465ff" height="3"
          class="!fixed !top-0 !left-0 !right-0 !z-[9999] !m-0" />
      </transition>
      <div
        class="fixed top-0 right-0 w-[500px] h-[500px] bg-periwinkle/50 dark:bg-electric-sapphire/20 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2">
      </div>

      <v-navigation-drawer v-model="drawer" :rail="rail && !isMobile" permanent width="290" rail-width="75"
        class="border-e border-slate-200/60! dark:border-slate-800! !bg-electric-sapphire dark:!bg-electric-sapphire/20 transition-all duration-300"
        elevation="0" :temporary="isMobile">
        <button v-if="!isMobile" @click="rail = !rail"
          class="absolute -left-3 top-8 z-50 w-6 h-6 !bg-baby-blue-ice border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300">
          <AltArrowLeft class="w-4 h-4 fill-white dark:fill-black! transition-transform duration-300"
            :class="rail ? '' : 'rotate-180'" />
        </button>

        <div class="h-24 flex items-center gap-3 transition-all"
          :class="rail && !isMobile ? 'justify-center px-0' : 'px-6'">
          <MedicalKit class="w-10 h-10 shrink-0 fill-periwinkle" />
          <div v-if="!rail || isMobile" class="flex flex-col overflow-hidden whitespace-nowrap">
            <span class="font-bold text-lg text-slate-50 tracking-tight">کلینیک دکتر حسینی</span>
            <span class="text-[11px] text-slate-200 font-medium">پنل پزشک و مدیریت</span>
          </div>
        </div>

        <div class="space-y-6 mt-4">
          <div v-for="section in menuSections" :key="section.label">
            <div v-if="(!rail || isMobile) && section.items.length"
              class="px-6 mb-2 text-[10px] font-bold text-slate-200 tracking-widest uppercase">
              {{ section.label }}
            </div>
            <v-list v-if="section.items.length" nav class="px-3">
              <v-tooltip v-for="item in section.items" :key="item.to" location="left" :disabled="!rail || isMobile">
                <template #activator="{ props }">
                  <v-list-item v-bind="props" :to="item.to" nuxt class="rounded-xl! transition-all mb-1"
                    :class="rail && !isMobile ? 'px-0! justify-center' : 'px-4!'"
                    active-class="!bg-light-cyan/30 dark:!bg-electric-sapphire/30 !text-electric-sapphire dark:!text-cornflower-blue">
                    <template #title>
                      <div class="flex items-center" :class="rail && !isMobile ? 'justify-center w-full' : 'gap-3'">
                        <component :is="item.icon" class="w-5.5 h-5.5 shrink-0 fill-slate-300" />
                        <span v-if="!rail || isMobile" class="text-[14px] font-medium text-slate-50">{{ item.title
                          }}</span>
                      </div>
                    </template>
                  </v-list-item>
                </template>
                <span>{{ item.title }}</span>
              </v-tooltip>
            </v-list>
          </div>
        </div>

        <template #append>
          <div class="py-4 border-t border-white/10 flex items-center"
            :class="rail && !isMobile ? 'justify-center' : 'px-6 gap-3'">
            <div class="w-9 h-9 rounded-full bg-periwinkle flex items-center justify-center shrink-0">
              <span class="text-electric-sapphire font-bold text-sm">{{ userInitial }}</span>
            </div>
            <div v-if="!rail || isMobile" class="flex flex-col overflow-hidden whitespace-nowrap">
              <span class="text-sm font-bold text-slate-50 truncate">{{ user?.fullName || 'کاربر مهمان' }}</span>
              <span class="text-[10px] text-slate-200">{{ roleLabel }}</span>
            </div>
          </div>
        </template>
      </v-navigation-drawer>

      <v-app-bar height="80"
        class="!bg-electric-sapphire/60 dark:!bg-electric-sapphire/30 backdrop-blur-md px-4 md:px-6 border-b border-white/10!"
        elevation="0">
        <template #prepend>
          <v-app-bar-nav-icon variant="text" @click="drawer = !drawer" class="!text-light-cyan lg:!hidden" />
          <div class="hidden lg:flex flex-col">
            <h2 class="text-xl font-bold text-slate-50 select-none">خوش آمدید</h2>
            <p class="text-slate-100/80 text-xs mt-1 select-none">امروز یک روز عالی برای مدیریت کلینیک است.</p>
          </div>
        </template>

        <v-spacer />

        <div class="flex items-center gap-2 md:gap-4">
          <v-btn icon variant="text" @click="toggleTheme" class="hidden sm:flex">
            <Sun v-if="!isDark" class="w-5.5 h-5.5 stroke-slate-100!" />
            <Moon v-else class="w-5.5 h-5.5 fill-slate-200" />
          </v-btn>

          <!--
          <NuxtLink to="/my-profile">
            <v-btn icon variant="text" class="fill-slate-100 hover:fill-slate-300 hidden sm:flex">
              <Settings class="w-5.5 h-5.5" />
            </v-btn>
          </NuxtLink>
          -->

          <v-btn icon variant="text" class="fill-slate-100 hover:fill-red-400!" @click="logout">
            <TurnOffIcon class="w-5.5 h-5.5" />
          </v-btn>
        </div>
      </v-app-bar>

      <v-main class="bg-transparent! min-h-screen pt-20">
        <div class="max-w-[1600px] mx-auto">
          <slot />
        </div>
      </v-main>
    </v-app>
  </v-locale-provider>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useDisplay } from 'vuetify'
import AltArrowLeft from '~/components/icons/AltArrowLeft.vue'
import Calendar from '~/components/icons/Calendar.vue'
import Clock from '~/components/icons/Clock.vue'
import Grid from '~/components/icons/Grid.vue'
import HomeAngle from '~/components/icons/HomeAngle.vue'
import MedicalKit from '~/components/icons/MedicalKit.vue'
import Settings from '~/components/icons/Settings.vue'
import TurnOffIcon from '~/components/icons/TurnOffIcon.vue'
import Users from '~/components/icons/Users.vue'
import UsersGroup from '~/components/icons/UsersGroup.vue'
import DocumentText from '~/components/icons/DocumentText.vue'
import ShieldCheck from '~/components/icons/ShieldCheck.vue'
import ChatDots from '~/components/icons/ChatDots.vue'
import Calculator from '~/components/icons/Calculator.vue'
import Wallet from '~/components/icons/Wallet.vue'
import Profile from '~/components/icons/Profile.vue'
import Sun from '~/components/icons/Sun.vue'
import Moon from '~/components/icons/Moon.vue'

const { user, logout } = useAuth()
const { apiLoading } = useApi()
const { smAndDown } = useDisplay()
const { isDark, toggleTheme, initTheme } = useThemeMode()

const drawer = ref(true)
const rail = ref(false)
const isLoading = ref(true)
const isMobile = computed(() => smAndDown.value)

const updateDrawerState = () => {
  drawer.value = !isMobile.value
}

onMounted(() => {
  setTimeout(() => { isLoading.value = false }, 1200)
  updateDrawerState()
  window.addEventListener('resize', updateDrawerState)
  initTheme()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateDrawerState)
})

const roleLabel = computed(() => {
  const roles: Record<string, string> = {
    admin_doctor: 'مدیر کلینیک',
    doctor: 'پزشک',
    pharmacy: 'مسئول داروخانه',
    lab: 'آزمایشگاه',
    patient: 'بیمار',
  }
  const currentRole = user?.value?.role || (user as any)?.role
  return roles[currentRole] || 'کاربر سیستم'
})

const userInitial = computed(() => {
  const name = user?.value?.fullName || (user as any)?.fullName
  return name ? name.charAt(0) : 'U'
})

const ALL_MENUS = [
  { title: 'داشبورد', to: '/dashboard', icon: HomeAngle, roles: ['all'], category: 'primary' },
  { title: 'تقویم کاری', to: '/calendar', icon: Calendar, roles: ['admin_doctor', 'doctor'], category: 'primary' },
  { title: 'تنظیم زمانبندی رزروها', to: '/scheduling', icon: Clock, roles: ['admin_doctor', 'doctor'], category: 'primary' },
  { title: 'نوبت‌های بیماران', to: '/appointments', icon: Grid, roles: ['admin_doctor', 'doctor'], category: 'primary' },
  { title: 'انواع نوبت', to: '/visit-types', icon: DocumentText, roles: ['admin_doctor', 'doctor'], category: 'primary' },
  { title: 'لیست کاربران', to: '/users', icon: Users, roles: ['admin_doctor'], category: 'primary' },
  { title: 'پیام‌ها', to: '/messaging', icon: ChatDots, roles: ['admin_doctor', 'doctor', 'lab', 'pharmacy'], category: 'primary' },
  { title: 'ابزارهای بالینی', to: '/clinical-tools', icon: Calculator, roles: ['admin_doctor', 'doctor'], category: 'primary' },
  { title: 'صورتحساب', to: '/billing', icon: Wallet, roles: ['admin_doctor'], category: 'primary' },
  { title: 'غربالگری', to: '/screening', icon: ShieldCheck, roles: ['admin_doctor', 'doctor'], category: 'primary' },
  { title: 'نتایج آزمایش', to: '/lab-results', icon: DocumentText, roles: ['admin_doctor', 'doctor', 'lab'], category: 'primary' },
  { title: 'نسخه‌ها', to: '/prescriptions', icon: Calendar, roles: ['pharmacy'], category: 'primary' },
  { title: 'پروفایل من', to: '/my-profile', icon: Profile, roles: ['all'], category: 'primary' },
  { title: 'پیام‌ها', to: '/patient/messaging', icon: ChatDots, roles: ['patient'], category: 'primary' },
  { title: 'لیست بیماران', to: '/patients', icon: UsersGroup, roles: ['admin_doctor', 'doctor'], category: 'patient' },
]

const hasAccess = (itemRoles: string[]) => {
  if (itemRoles.includes('all')) return true
  const currentUserRole = user?.value?.role || (user as any)?.role
  if (!currentUserRole) return false
  return itemRoles.includes(currentUserRole)
}

const primaryMenu = computed(() =>
  ALL_MENUS.filter(item => item.category === 'primary' && hasAccess(item.roles))
)

const patientMenu = computed(() =>
  ALL_MENUS.filter(item => item.category === 'patient' && hasAccess(item.roles))
)

const menuSections = computed(() => [
  { label: 'اصلی', items: primaryMenu.value },
  { label: 'بیماران', items: patientMenu.value },
])
</script>
