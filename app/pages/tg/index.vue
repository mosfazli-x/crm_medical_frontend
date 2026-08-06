<template>
  <div class="tg-fade-in min-h-full">
    <div v-if="status === 'loading'" class="tg-empty" style="min-height: 70vh;">
      <div class="w-9 h-9 rounded-full" style="border: 3px solid var(--tg-sec-bg); border-top-color: var(--tg-btn); animation: spin 0.8s linear infinite;"/>
      <p class="text-sm">در حال ورود...</p>
    </div>

    <TgLoginScreen v-else-if="status === 'login'" :telegram-user="tgUser" @logged-in="onLoggedIn" />

    <div v-else class="px-4 pt-4">
      <header class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-3">
          <div
            class="flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg"
            style="background: color-mix(in srgb, var(--tg-btn) 16%, transparent); color: var(--tg-btn);"
          >
            {{ initials }}
          </div>
          <div>
            <p class="text-xs" style="color: var(--tg-hint);">خوش آمدید 👋</p>
            <h1 class="text-[17px] font-bold" style="color: var(--tg-text);">{{ greetingName }}</h1>
          </div>
        </div>
        <NuxtLink to="/tg/profile" class="w-9 h-9 flex items-center justify-center rounded-full" style="background: var(--tg-sec-bg);">
          <Icon name="lucide:settings" size="20" style="color: var(--tg-hint);" />
        </NuxtLink>
      </header>

      <NuxtLink to="/tg/book" class="block mb-4">
        <div
          class="tg-card relative overflow-hidden p-5"
          style="background: linear-gradient(135deg, var(--tg-btn), color-mix(in srgb, var(--tg-accent) 80%, var(--tg-btn))); border: none;"
        >
          <div class="absolute -left-6 -top-6 w-28 h-28 rounded-full opacity-20" style="background: white;"/>
          <p class="text-white text-sm font-medium opacity-90 mb-1">نوبت آنلاین</p>
          <p class="text-white text-[20px] font-bold leading-snug">رزرو نوبت با پزشک متخصص</p>
          <div class="mt-3 inline-flex items-center gap-1.5 text-white text-sm font-bold" style="background: rgba(255,255,255,0.18); border-radius: 999px; padding: 8px 14px;">
            رزرو نوبت
            <Icon name="lucide:arrow-left" size="18" />
          </div>
        </div>
      </NuxtLink>

      <div v-if="!hasPatientProfile" class="tg-card mb-4 flex items-center gap-3" style="border-color: color-mix(in srgb, var(--tg-btn) 40%, transparent);">
        <div class="flex items-center justify-center w-11 h-11 rounded-full shrink-0" style="background: color-mix(in srgb, var(--tg-btn) 14%, transparent);">
          <Icon name="lucide:id-card" size="22" style="color: var(--tg-btn);" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-[14px] font-bold" style="color: var(--tg-text);">تکمیل مشخصات</p>
          <p class="text-xs mt-0.5 leading-relaxed" style="color: var(--tg-hint);">برای رزرو نوبت، ابتدا پرونده بیمار شما باید ساخته شود.</p>
        </div>
        <NuxtLink to="/tg/profile" class="shrink-0 text-sm font-bold" style="color: var(--tg-btn);">تکمیل</NuxtLink>
      </div>

      <div class="flex items-center justify-between mb-3 mt-1">
        <h2 class="text-[15px] font-bold" style="color: var(--tg-text);">نزدیک‌ترین نوبت</h2>
        <NuxtLink to="/tg/appointments" class="text-xs font-semibold" style="color: var(--tg-btn);">مشاهده همه</NuxtLink>
      </div>

      <div v-if="nextAppointment" class="tg-card tg-pop">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full" :style="{ background: nextAppointment.visitTypeColor || 'var(--tg-btn)' }"/>
            <span class="font-bold text-[14.5px]" style="color: var(--tg-text);">{{ nextAppointment.visitTypeName || 'ویزیت' }}</span>
          </div>
          <span class="tg-badge" :class="badgeClass(nextAppointment.status)">{{ statusLabel(nextAppointment.status) }}</span>
        </div>
        <div class="flex items-center justify-between">
          <div class="text-[13px]" style="color: var(--tg-hint);">
            <div class="mb-1">{{ nextAppointment.doctorName }}</div>
            <div>{{ formatJalali(nextAppointment.appointmentDate) }}</div>
          </div>
          <div class="text-left">
            <div class="text-[22px] font-black" style="color: var(--tg-btn);">{{ nextAppointment.startTime }}</div>
            <div class="text-[11px]" style="color: var(--tg-hint);">ساعت شروع</div>
          </div>
        </div>
      </div>

      <div v-else class="tg-card tg-empty" style="padding: 28px 20px;">
        <Icon name="lucide:calendar-x" size="34" style="color: var(--tg-hint);" />
        <p class="text-sm font-medium">نوبت فعالی ندارید</p>
        <NuxtLink to="/tg/book" class="tg-btn tg-btn-primary mt-2 text-sm" style="padding: 10px 18px; width: auto;">رزرو نوبت</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import moment from 'moment-jalaali'
import { useTelegramApp } from '~/composables/useTelegramApp'
import { useMiniAppAuth, type TelegramUserInfo } from '~/composables/useMiniAppAuth'

definePageMeta({ layout: 'tg' })

const { initData, telegramUser } = useTelegramApp()
const auth = useMiniAppAuth()

const status = ref<'loading' | 'login' | 'home'>('loading')
const upcoming = ref<any[]>([])
const tgUser = ref<TelegramUserInfo | null>(null)

const greetingName = computed(() => {
  return auth.user.value?.fullName || tgUser.value?.first_name || 'دوست عزیز'
})

const initials = computed(() => {
  const name = auth.user.value?.fullName || tgUser.value?.first_name || ''
  return name.trim().slice(0, 2)
})

const hasPatientProfile = computed(() => !!auth.user.value?.patientId)
const nextAppointment = computed(() => upcoming.value[0] || null)

const formatJalali = (date: string) => moment(date, 'YYYY-MM-DD').format('jDD jMMMM jYYYY')
const statusLabel = (s: string) =>
  ({ pending: 'در انتظار', confirmed: 'تأیید شده', completed: 'انجام شده', cancelled: 'لغو شده' } as Record<string, string>)[s] || s
const badgeClass = (s: string) =>
  ({ pending: 'tg-badge-pending', confirmed: 'tg-badge-confirmed', completed: 'tg-badge-completed', cancelled: 'tg-badge-cancelled' } as Record<string, string>)[s] || 'tg-badge-info'

const loadUpcoming = async () => {
  if (!auth.isAuthenticated.value) return
  try {
    const res = await auth.api<any>('/api/miniapp/appointments', { method: 'GET' })
    upcoming.value = res.upcoming || []
  } catch {
    upcoming.value = []
  }
}

const onLoggedIn = () => {
  status.value = 'home'
  loadUpcoming()
}

onMounted(async () => {
  auth.hydrate()
  if (auth.isAuthenticated.value && !initData.value) {
    try {
      await auth.api('/api/miniapp/auth/status', { method: 'GET' })
      status.value = 'home'
      loadUpcoming()
    } catch {
      status.value = 'login'
    }
    return
  }
  const result = await auth.autoLogin(initData.value)
  tgUser.value = result.telegramUser || telegramUser.value || null
  if (result.needsLogin || !auth.isAuthenticated.value) {
    status.value = 'login'
  } else {
    status.value = 'home'
    loadUpcoming()
  }
})

useHead({ title: 'کلینیک دکتر حسینی' })
</script>
