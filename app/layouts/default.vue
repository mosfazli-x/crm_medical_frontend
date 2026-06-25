<template>
  <v-locale-provider rtl>
    <transition name="fade">
      <div v-if="isLoading" class="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-50 dark:bg-slate-600 transition-colors duration-300">
        <div class="absolute inset-0 bg-periwinkle/30 dark:bg-electric-sapphire/20 backdrop-blur-sm"></div>

        <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-baby-blue-ice/40 dark:bg-electric-sapphire/30 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3"></div>
        <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-periwinkle/40 dark:bg-electric-sapphire/30 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/3"></div>

        <div class="relative z-10 flex flex-col items-center gap-8">
          <div class="p-8 rounded-3xl shadow-2xl shadow-electric-sapphire/50 dark:shadow-electric-sapphire/50 backdrop-blur-md">
            <MedicalKit class="w-20 h-20 fill-electric-sapphire dark:fill-cornflower-blue" />
          </div>

          <v-progress-circular indeterminate color="#5465ff" size="80" width="8" class="drop-shadow-lg" />

          <div class="text-center">
            <h3 class="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">در حال بارگذاری پنل کلینیک</h3>
            <p class="fill-slate-300 dark:text-slate-400 text-lg">لطفاً صبر کنید...</p>
          </div>

          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-96 h-96 bg-baby-blue-ice/20 dark:bg-electric-sapphire/10 rounded-full animate-ping-slow"></div>
          </div>
        </div>
      </div>
    </transition>

    <v-app v-if="!isLoading" class="bg-slate-50 dark:bg-slate-900 transition-colors duration-300 relative">
      <div class="fixed top-0 right-0 w-[500px] h-[500px] bg-periwinkle/50 dark:bg-electric-sapphire/20 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
      
      <v-navigation-drawer 
        v-model="drawer" 
        :rail="rail && !isMobile" 
        permanent 
        width="290" 
        rail-width="75" 
        class="border-e border-slate-200 dark:border-slate-800 !bg-electric-sapphire dark:bg-electric-sapphire/20! transition-all duration-300"
        elevation="0"
        :temporary="isMobile"
      >
        <button 
          v-if="!isMobile"
          @click="rail = !rail" 
          class="absolute -left-3 top-8 z-50 w-6 h-6 !bg-baby-blue-ice border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-300"
        >
          <AltArrowLeft class="w-4 h-4 fill-white dark:fill-black! transition-transform duration-300" :class="rail ? '' : 'rotate-180'" />
        </button>

        <div class="h-24 flex items-center gap-3 transition-all" :class="rail && !isMobile ? 'justify-center px-0' : 'px-6'">
          <MedicalKit class="w-10 h-10 shrink-0 fill-periwinkle dark:fill-periwinkle" />
          <div v-if="!rail || isMobile" class="flex flex-col overflow-hidden whitespace-nowrap">
            <span class="font-bold text-lg text-slate-50 dark:text-slate-100 tracking-tight">کلینیک دکتر حسینی</span>
            <span class="text-[11px] text-slate-200 dark:fill-slate-300 font-medium">پنل پزشک و مدیریت</span>
          </div>
        </div>

        <div class="space-y-6 mt-4">
          <div>
            <div v-if="!rail || isMobile" class="px-6 mb-2 text-[10px] font-bold text-slate-200 dark:fill-slate-300 tracking-widest uppercase">
              اصلی
            </div>
            <v-list nav class="px-3">
              <v-tooltip 
                v-for="item in primaryMenu" 
                :key="item.to"
                location="left" 
                :disabled="!rail || isMobile"
              >
                <template #activator="{ props }">
                  <v-list-item 
                    v-bind="props" 
                    :to="item.to" 
                    nuxt 
                    class="rounded-xl transition-all mb-1 dark:hover:bg-slate-800" 
                    :class="rail && !isMobile ? 'px-0 justify-center' : 'px-4'"
                    active-class="bg-light-cyan dark:bg-electric-sapphire/30 text-electric-sapphire dark:text-cornflower-blue"
                  >
                    <template #title>
                      <div class="flex items-center" :class="rail && !isMobile ? 'justify-center w-full' : 'gap-3'">
                        <component :is="item.icon" class="w-5.5 h-5.5 shrink-0 fill-slate-300 dark:text-slate-400" />
                        <span v-if="!rail || isMobile" class="text-[14px] font-medium text-slate-50 dark:text-slate-200">{{ item.title }}</span>
                      </div>
                    </template>
                  </v-list-item>
                </template>
                <span>{{ item.title }}</span>
              </v-tooltip>
            </v-list>
          </div>

          <div v-if="patientMenu.length">
            <div v-if="!rail || isMobile" class="px-6 mb-2 text-[10px] font-bold text-slate-200 dark:fill-slate-300 tracking-widest uppercase">
              بیماران
            </div>
            <v-list nav class="px-3">
              <v-tooltip 
                v-for="item in patientMenu" 
                :key="item.to"
                location="left" 
                :disabled="!rail || isMobile"
              >
                <template #activator="{ props }">
                  <v-list-item 
                    v-bind="props" 
                    :to="item.to" 
                    nuxt 
                    class="rounded-xl transition-all mb-1 dark:hover:bg-slate-800" 
                    :class="rail && !isMobile ? 'px-0 justify-center' : 'px-4'"
                    active-class="bg-light-cyan dark:bg-electric-sapphire/30 text-electric-sapphire dark:text-cornflower-blue"
                  >
                    <template #title>
                      <div class="flex items-center" :class="rail && !isMobile ? 'justify-center w-full' : 'gap-3'">
                        <component :is="item.icon" class="w-5.5 h-5.5 shrink-0 fill-slate-300 dark:text-slate-400" />
                        <span v-if="!rail || isMobile" class="text-[14px] font-medium text-slate-50 dark:text-slate-200">{{ item.title }}</span>
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
          <div class="py-4 border-t border-slate-100 dark:border-slate-800 flex items-center" :class="rail && !isMobile ? 'justify-center' : 'px-6 gap-3'">
            <div class="w-9 h-9 rounded-full bg-periwinkle dark:bg-electric-sapphire/60 flex items-center justify-center shrink-0">
              <span class="text-electric-sapphire dark:text-periwinkle font-bold text-sm">{{ userInitial }}</span>
            </div>
            <div v-if="!rail || isMobile" class="flex flex-col overflow-hidden whitespace-nowrap">
              <span class="text-sm font-bold text-slate-50 dark:text-slate-200 truncate">{{ user?.fullName || 'کاربر مهمان' }}</span>
              <span class="text-[10px] text-slate-200 dark:fill-slate-300">{{ roleLabel }}</span>
            </div>
          </div>
        </template>
      </v-navigation-drawer>

      <v-app-bar height="80" class="!bg-electric-sapphire/60 dark:!bg-electric-sapphire/30 backdrop-blur-md px-4 md:px-6 border-b border-slate-200 dark:border-slate-800" elevation="0">
        <template v-slot:prepend>
          <v-app-bar-nav-icon variant="text" @click="drawer = !drawer" class="!text-light-cyan lg:hidden !flex"></v-app-bar-nav-icon>
          <div class="hidden lg:flex flex-col">
            <h2 class="text-xl font-bold text-slate-50 select-none">خوش آمدید</h2>
            <div class="text-slate-100 text-xs mt-1 select-none">
              امروز یک روز عالی برای مدیریت کلینیک است.
            </div>
          </div>
        </template>

        <v-spacer></v-spacer>

        <div class="flex items-center gap-2 md:gap-4">
         <!--
          <div class="hidden md:flex items-center bg-slate-50 dark:bg-slate-400 border border-slate-200 dark:border-slate-700 rounded-xl px-4 h-11 w-80 transition-all focus-within:shadow-md focus-within:border-cornflower-blue">
            <Magnify class="w-5 h-5 text-slate-800" />
            <input type="text" placeholder="جستجو (نام بیمار، کدملی...)" class="w-full text-sm outline-none text-slate-700 dark:text-slate-200 placeholder:text-slate-600 bg-transparent pr-3 h-full" />
          </div>
          -->
          
          <v-divider vertical inset class="mx-2 hidden md:block border-slate-100"></v-divider>

          
          <v-btn icon variant="text" @click="toggleTheme" class="hidden sm:flex">
             <Sun v-if="!isDark" class="w-5.5 h-5.5 stroke-slate-100!" />
             <Moon v-else class="w-5.5 h-5.5 fill-slate-200" />
          </v-btn>
        

          <NuxtLink to="/my-profile">
            <v-btn icon variant="text" class="fill-slate-100 hover:fill-slate-300 hidden sm:flex">
              <Settings class="w-5.5 h-5.5" />
            </v-btn>
          </NuxtLink>

          <v-btn icon variant="text" class="fill-slate-100 hover:fill-red-600 dark:hover:fill-red-400" @click="logout">
            <TurnOffIcon class="w-5.5 h-5.5" />
          </v-btn>
        </div>
      </v-app-bar>

      <v-main class="bg-transparent min-h-screen pt-20">
        <div class="px-4 md:px-10 pb-10 max-w-[1600px] mx-auto bg-white dark:bg-dark-grey!">
          <slot />
        </div>
      </v-main>

    </v-app>
  </v-locale-provider>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useDisplay } from 'vuetify'

// Component Imports
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

// Composables
const { user, isAuthenticated, logout } = useAuth()
const { smAndDown } = useDisplay()
const { isDark, toggleTheme, initTheme } = useThemeMode()

// State
const drawer = ref(true)
const rail = ref(false)
const isLoading = ref(true)

// Computed: Check Mobile View
const isMobile = computed(() => smAndDown.value)

// Mobile responsiveness handler
const updateDrawerState = () => {
  drawer.value = !isMobile.value
}

// Lifecycle Hooks
onMounted(() => {
  // شبیه‌سازی لودینگ با یک تایمر تمیز (در پروژه‌های واقعی به هوک‌های Nuxt متصل می‌شود)
  const timer = setTimeout(() => {
    isLoading.value = false
  }, 1200)

  // مدیریت حالت واکنش‌گرا در زمان لود
  updateDrawerState()
  window.addEventListener('resize', updateDrawerState)

  // بازیابی حالت Dark Mode
  initTheme()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateDrawerState)
})

// Functions: Theme Toggle (now handled by useThemeMode composable)

const roleLabel = computed(() => {
  const roles = {
    'admin_doctor': 'مدیر کلینیک',
    'doctor': 'پزشک',
    'pharmacy': 'مسئول داروخانه',
    'lab': 'آزمایشگاه',
    'patient': 'بیمار'
  }
  const currentRole = user?.value?.role || user?.role
  return roles[currentRole] || 'کاربر سیستم'
})

const userInitial = computed(() => {
  return user?.fullName ? user.fullName.charAt(0) : 'U'
})

// Data: Menu Configuration
// با این روش اضافه کردن منوهای جدید نیازی به دستکاری HTML ندارد
const ALL_MENUS = [
  { title: 'داشبورد', to: '/dashboard', icon: HomeAngle, roles: ['all'], category: 'primary' },
  { title: 'تقویم کاری', to: '/calendar', icon: Calendar, roles: ['admin_doctor', 'doctor'], category: 'primary' },
  { title: 'تنظیم زمانبندی رزروها', to: '/scheduling', icon: Clock, roles: ['admin_doctor', 'doctor'], category: 'primary' },
  { title: 'نوبت‌های بیماران', to: '/appointments', icon: Grid, roles: ['admin_doctor', 'doctor'], category: 'primary' },
  { title: 'انواع نوبت', to: '/visit-types', icon: DocumentText, roles: ['admin_doctor', 'doctor'], category: 'primary' },
  { title: 'لیست کاربران', to: '/users', icon: Users, roles: ['admin_doctor', 'doctor'], category: 'primary' },
  { title: 'پیام‌ها', to: '/messaging', icon: ChatDots, roles: ['admin_doctor', 'doctor', 'lab', 'pharmacy'], category: 'primary' },
  { title: 'ابزارهای بالینی', to: '/clinical-tools', icon: Calculator, roles: ['admin_doctor', 'doctor'], category: 'primary' },
  { title: 'صورتحساب', to: '/billing', icon: Wallet, roles: ['admin_doctor'], category: 'primary' },
  { title: 'غربالگری', to: '/screening', icon: ShieldCheck, roles: ['admin_doctor', 'doctor'], category: 'primary' },
  { title: 'نتایج آزمایش', to: '/lab-results', icon: DocumentText, roles: ['admin_doctor', 'doctor', 'lab'], category: 'primary' },
  { title: 'نسخه‌ها', to: '/prescriptions', icon: Calendar, roles: ['pharmacy'], category: 'primary' },
  { title: 'پروفایل من', to: '/my-profile', icon: Profile, roles: ['all'], category: 'primary' },
  
  { title: 'لیست بیماران', to: '/patients', icon: UsersGroup, roles: ['admin_doctor', 'doctor'], category: 'patient' }
]

const hasAccess = (itemRoles) => {
  // اگر منو برای همه آزاد بود
  if (itemRoles.includes('all')) return true
  
  // گرفتن نقش کاربر با احتیاط (اطمینان از وجود user و مقدار داخل آن)
  const currentUserRole = user?.value?.role || user?.role
  
  if (!currentUserRole) return false
  
  return itemRoles.includes(currentUserRole)
}


const primaryMenu = computed(() => 
  ALL_MENUS.filter(item => item.category === 'primary' && hasAccess(item.roles))
)

const patientMenu = computed(() => 
  ALL_MENUS.filter(item => item.category === 'patient' && hasAccess(item.roles))
)

const filteredMenus = computed(() => {
  // این خط باعث می‌شود هر زمان اطلاعات کاربر لود شد، منو دوباره محاسبه شود
  const role = user?.value?.role || user?.role
  
  return ALL_MENUS.filter(item => {
    if (item.roles.includes('all')) return true
    return item.roles.includes(role)
  })
})

definePageMeta({
  middleware: 'auth'
})

</script>

<style>
/* انیمیشن Loading Overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease, backdrop-filter 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  backdrop-filter: blur(0px);
}

@keyframes ping-slow {
  0%, 100% {
    transform: scale(0.8);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.5;
  }
}

.animate-ping-slow {
  animation: ping-slow 4s cubic-bezier(0, 0, 0.2, 1) infinite;
}

/* Scrollbar Styling (پشتیبانی از Dark Mode) */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.dark ::-webkit-scrollbar-thumb {
  background: #475569;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.dark ::-webkit-scrollbar-thumb:hover {
  background: #64748b;
}

/* رفع باگ دکمه منوی موبایل در Vuetify */
.v-app-bar-nav-icon {
  display: flex !important;
}
@media (min-width: 1024px) {
  .v-app-bar-nav-icon {
    display: none !important;
  }
}

.v-list-item__content {
  min-width: 0px !important;
}


.v-navigation-drawer__content {
    -ms-overflow-style: none !important;  /* Internet Explorer 10+ */
    scrollbar-width: none !important;  /* Firefox, Safari 18.2+, Chromium 121+ */
}
.v-navigation-drawer__content::-webkit-scrollbar { 
    display: none !important;  /* Older Safari and Chromium */
}

</style>