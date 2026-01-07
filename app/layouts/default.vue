<template>
  <v-locale-provider rtl>
    <!-- Full-screen Loading Overlay -->
    <transition name="fade">
      <div v-if="isLoading" class="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F8FAFC]">
        <!-- Background Blur Effect (هماهنگ با طراحی اصلی) -->
        <div class="absolute inset-0 bg-blue-100/30 backdrop-blur-sm"></div>

        <!-- Large Blur Circle (مشابه افکت پس‌زمینه اصلی) -->
        <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3"></div>
        <div class="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-100/40 rounded-full blur-[120px] -translate-x-1/3 translate-y-1/3"></div>

        <!-- Content Centered -->
        <div class="relative z-10 flex flex-col items-center gap-8">
          <!-- Medical Icon با انیمیشن نرم -->
          <div class="p-8 rounded-3xl shadow-2xl shadow-blue-200/50">
            <MedicalKit class="w-20 h-20 fill-blue-600" />
          </div>

          <!-- Professional Spinner با رنگ آبی هماهنگ -->
          <v-progress-circular indeterminate color="blue" size="80" width="8" class="drop-shadow-lg" />

          <!-- Text حرفه‌ای -->
          <div class="text-center">
            <h3 class="text-2xl font-bold text-slate-800 mb-2">در حال بارگذاری پنل کلینیک</h3>
            <p class="text-slate-500 text-lg">لطفاً صبر کنید...</p>
          </div>

          <!-- Pulse Animation برای جذابیت بیشتر -->
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div class="w-96 h-96 bg-blue-300/20 rounded-full animate-ping-slow"></div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Main App (فقط وقتی loading تمام شد نمایش داده می‌شود) -->
    <v-app v-if="!isLoading" class="bg-[#F8FAFC] relative">
      <!-- بقیه کد اصلی شما بدون تغییر -->
      <div class="fixed top-0 right-0 w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px] -z-10 translate-x-1/2 -translate-y-1/2"></div>
      <v-navigation-drawer v-model="drawer" :rail="rail" permanent width="290" rail-width="70" color="white" class="border-e border-slate-100 !shadow-xl !shadow-slate-200/40 transition-all duration-300 relative" elevation="0">

        <!-- Collapse Button (FIXED & FLOATING) -->
        <button @click="rail = !rail" class="absolute -left-3 top-8 z-50 w-6 h-6 bg-white border border-slate-200 rounded-full
           flex items-center justify-center shadow-md hover:shadow-lg
           transition-all duration-300">
          <AltArrowLeft class="w-4 h-4 text-slate-500 transition-transform duration-300" :class="rail ? '' : 'rotate-180'" />
        </button>

        <!-- Header -->
        <div class="h-24 flex items-center gap-3" :class="rail ? 'justify-center px-0' : 'px-6'">
          <MedicalKit class="w-10 h-10 shrink-0" />
          <div v-if="!rail" class="flex flex-col">
            <span class="font-bold text-lg text-slate-800 tracking-tight">
              کلینیک دکتر حسینی
            </span>
            <span class="text-[11px] text-slate-400 font-medium">
              پنل پزشک و مدیریت
            </span>
          </div>
        </div>

        <!-- Action Button -->


        <!-- Menu -->
        <div class="space-y-8">

          <!-- MAIN -->
          <div>
            <div v-if="!rail" class="px-4 mb-3 text-[10px] font-bold text-slate-400 tracking-widest">
              اصلی
            </div>
            <v-list nav>
              <!-- داشبورد -->
              <v-tooltip location="left" :disabled="!rail">
                <template #activator="{ props }">
                  <v-list-item v-bind="props" to="/" nuxt class="rounded-2xl transition-all" :class="rail ? 'px-0' : 'px-4'">
                    <template #title>
                      <div class="flex items-center" :class="rail ? 'justify-center w-full' : 'gap-3'">
                        <HomeAngle class="w-5.5 h-5.5 shrink-0" />
                        <span v-if="!rail" class="text-[14px] font-medium">داشبورد</span>
                      </div>
                    </template>
                  </v-list-item>
                </template>
                <span>داشبورد</span>
              </v-tooltip>

              <!-- تقویم کاری -->
              <v-tooltip v-if="['admin_doctor', 'doctor'].includes(user?.role)" location="left" :disabled="!rail">
                <template #activator="{ props }">
                  <v-list-item v-bind="props" to="/calendar" nuxt class="rounded-2xl transition-all" :class="rail ? 'px-0' : 'px-4'">
                    <template #title>
                      <div class="flex items-center" :class="rail ? 'justify-center w-full' : 'gap-3'">
                        <Calendar class="w-5.5 h-5.5 shrink-0" />
                        <span v-if="!rail" class="text-[14px] font-medium">تقویم کاری</span>
                      </div>
                    </template>
                  </v-list-item>
                </template>
                <span>تقویم کاری</span>
              </v-tooltip>

              <!-- لیست کاربران -->
              <v-tooltip v-if="['admin_doctor', 'doctor'].includes(user?.role)" location="left" :disabled="!rail">
                <template #activator="{ props }">
                  <v-list-item v-bind="props" to="/users" nuxt class="rounded-2xl transition-all" :class="rail ? 'px-0' : 'px-4'">
                    <template #title>
                      <div class="flex items-center" :class="rail ? 'justify-center w-full' : 'gap-3'">
                        <Users class="w-5.5 h-5.5 shrink-0" />
                        <span v-if="!rail" class="text-[14px] font-medium">لیست کاربران</span>
                      </div>
                    </template>
                  </v-list-item>
                </template>
                <span>لیست کاربران</span>
              </v-tooltip>

              <!-- نتایج آزمایش -->
              <v-tooltip v-if="['lab'].includes(user?.role)" location="left" :disabled="!rail">
                <template #activator="{ props }">
                  <v-list-item v-bind="props" to="/lab-results" nuxt class="rounded-2xl transition-all" :class="rail ? 'px-0' : 'px-4'">
                    <template #title>
                      <div class="flex items-center" :class="rail ? 'justify-center w-full' : 'gap-3'">
                        <Calendar class="w-5.5 h-5.5 shrink-0" />
                        <span v-if="!rail" class="text-[14px] font-medium">نتایج آزمایش</span>
                      </div>
                    </template>
                  </v-list-item>
                </template>
                <span>نتایج آزمایش</span>
              </v-tooltip>

              <!-- نسخه‌ها -->
              <v-tooltip v-if="['pharmacy'].includes(user?.role)" location="left" :disabled="!rail">
                <template #activator="{ props }">
                  <v-list-item v-bind="props" to="/prescriptions" nuxt class="rounded-2xl transition-all" :class="rail ? 'px-0' : 'px-4'">
                    <template #title>
                      <div class="flex items-center" :class="rail ? 'justify-center w-full' : 'gap-3'">
                        <Calendar class="w-5.5 h-5.5 shrink-0" />
                        <span v-if="!rail" class="text-[14px] font-medium">نسخه‌ها</span>
                      </div>
                    </template>
                  </v-list-item>
                </template>
                <span>نسخه‌ها</span>
              </v-tooltip>

              <!-- پرونده من -->
              <v-tooltip v-if="['patient'].includes(user?.role)" location="left" :disabled="!rail">
                <template #activator="{ props }">
                  <v-list-item v-bind="props" to="/my-profile" nuxt class="rounded-2xl transition-all" :class="rail ? 'px-0' : 'px-4'">
                    <template #title>
                      <div class="flex items-center" :class="rail ? 'justify-center w-full' : 'gap-3'">
                        <Calendar class="w-5.5 h-5.5 shrink-0" />
                        <span v-if="!rail" class="text-[14px] font-medium">پرونده من</span>
                      </div>
                    </template>
                  </v-list-item>
                </template>
                <span>پرونده من</span>
              </v-tooltip>

            </v-list>
          </div>

          <!-- PATIENTS -->
          <div v-if="['admin_doctor', 'doctor'].includes(user?.role)">
            <div v-if="!rail" class="px-4 mb-3 text-[10px] font-bold text-slate-400 tracking-widest">
              بیماران
            </div>

            <v-list nav>
              <!-- لیست بیماران -->
              <v-tooltip location="left" :disabled="!rail">
                <template #activator="{ props }">
                  <v-list-item v-bind="props" to="/patients" nuxt class="rounded-2xl transition-all" :class="rail ? 'px-0' : 'px-4'">
                    <template #title>
                      <div class="flex items-center" :class="rail ? 'justify-center w-full' : 'gap-3'">
                        <UsersGroup class="w-5.5 h-5.5 shrink-0" />
                        <span v-if="!rail" class="text-[14px] font-medium">لیست بیماران</span>
                      </div>
                    </template>
                  </v-list-item>
                </template>
                <span>لیست بیماران</span>
              </v-tooltip>

            </v-list>
          </div>
        </div>

        <!-- Footer -->
        <template #append>
          <div class="py-3! border-t border-slate-100 flex items-center" :class="rail ? 'justify-center' : 'px-4! gap-3'">

            <!--
            <v-avatar size="36">
              <v-img src="https://i.pravatar.cc/300" />
            </v-avatar>
            -->

            <div v-if="!rail" class="flex flex-col align-middle items-center justify-center">
              <span class="text-sm font-bold text-slate-700">{{ user.fullName }}</span>
              <span v-if="user.role === 'admin_doctor'" class="text-[10px] text-slate-400">مدیر کلینیک</span>
              <span v-if="user.role === 'doctor'" class="text-[10px] text-slate-400">دکتر</span>
              <span v-if="user.role === 'pharmacy'" class="text-[10px] text-slate-400">داروخانه</span>
              <span v-if="user.role === 'lab'" class="text-[10px] text-slate-400">آزمایشگاه</span>
              <span v-if="user.role === 'patient'" class="text-[10px] text-slate-400">بیمار</span>
            </div>
          </div>
        </template>

      </v-navigation-drawer>

      <v-app-bar height="80" class="!bg-white px-6" elevation="0">
        <template v-slot:prepend>
          <v-app-bar-nav-icon variant="text" @click="drawer = !drawer" class="text-slate-600 lg:hidden"></v-app-bar-nav-icon>
          <div class="hidden md:flex flex-col">
            <div class="flex items-center gap-2 text-slate-400 text-xs mb-1 select-none pt-6">
              <span class="truncate">پنل مدیریت</span>
              <!--
              <AltArrowLeft class="w-4 h-4" />
              <span class="text-slate-600 font-medium">داشبورد</span>
              -->
            </div>
            <h2 class="text-xl font-bold text-slate-800 select-none">خوش آمدید</h2>
          </div>
        </template>

        <v-spacer></v-spacer>

        <div class="flex items-center gap-3">
          <div class="hidden md:flex items-center bg-white border border-slate-200 rounded-lg px-4 h-11 w-80 transition-shadow focus-within:shadow-md focus-within:border-blue-300">
            <Magnify class="w-8 h-8 pl-2"></Magnify>
            <input type="text" placeholder="جستجو (نام بیمار، کدملی...)" class="w-full text-sm outline-none text-slate-700 placeholder:text-slate-400 h-full" />
          </div>

          <v-divider vertical inset class="mx-2 hidden md:block"></v-divider>

          <!--
          <v-btn icon class="bg-white border border-slate-100 shadow-sm text-slate-500 hover:text-blue-600 hover:border-blue-100 rounded-xl w-11 h-11 transition-all">
            <v-badge dot color="error">
              <Bell class="w-5.5 h-5.5"></Bell>
            </v-badge>
          </v-btn>
          -->

          <v-btn icon class="bg-white border border-slate-100 shadow-sm text-slate-500 hover:text-blue-600 hover:border-blue-100 rounded-xl w-11 h-11 transition-all hidden sm:flex">
            <Settings class="w-5.5 h-5.5"></Settings>
          </v-btn>

          <v-btn icon class="bg-white border border-slate-100 shadow-sm text-slate-500 hover:text-blue-600 hover:border-blue-100 rounded-xl w-11 h-11 transition-all hidden sm:flex" @click="logout">
            <TurnOffIcon class="w-5.5 h-5.5 fill-red-700"></TurnOffIcon>
          </v-btn>
        </div>
      </v-app-bar>

      <v-main class="bg-transparent min-h-screen pt-[30px]">
        <div class="md:px-10 pb-10 max-w-[1600px] mx-auto">
          <slot />
        </div>
      </v-main>

    </v-app>
  </v-locale-provider>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AltArrowLeft from '~/components/icons/AltArrowLeft.vue';
import Calendar from '~/components/icons/Calendar.vue';
import Clock from '~/components/icons/Clock.vue';
import HomeAngle from '~/components/icons/HomeAngle.vue';
import Magnify from '~/components/icons/Magnify.vue';
import MedicalKit from '~/components/icons/MedicalKit.vue';
import Settings from '~/components/icons/Settings.vue';
import TurnOffIcon from '~/components/icons/TurnOffIcon.vue';
import Users from '~/components/icons/Users.vue';
import UsersGroup from '~/components/icons/UsersGroup.vue';
const { logout } = useAuth()

const drawer = ref(true)
const rail = ref(false)
const isLoading = ref(true)
const { user, isAuthenticated } = useAuth()

onMounted(() => {
  window.addEventListener('load', () => {
    setTimeout(() => {
      isLoading.value = false
    }, 800)
  })

  if (document.readyState === 'complete') {
    setTimeout(() => {
      isLoading.value = false
    }, 1500)
  }
})

definePageMeta({
  middleware: 'auth'
})
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.8s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes ping-slow {

  0%,
  100% {
    transform: scale(0.8);
    opacity: 0.3;
  }

  50% {
    transform: scale(1.2);
    opacity: 0.6;
  }
}

.animate-ping-slow {
  animation: ping-slow 4s cubic-bezier(0, 0, 0.2, 1) infinite;
}

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

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.v-app-bar-nav-icon {
  display: none !important;
}

.v-list-item {
  transition: all 0.2s ease;
}

.v-list-item:hover {
  background-color: rgba(186, 230, 253, 0.35) !important;
}

.v-list-item__content {
  min-width: 0px !important;
}
</style>