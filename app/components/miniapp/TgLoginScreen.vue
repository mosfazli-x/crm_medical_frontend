<template>
  <div class="tg-fade-in flex flex-col px-5 pt-10" style="min-height: 80vh;">
    <div class="text-center mb-8">
      <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style="background: linear-gradient(135deg, var(--tg-btn), var(--tg-accent));">
        <Icon name="lucide:hospital" size="34" style="color: white;" />
      </div>
      <h1 class="text-[22px] font-black mb-1" style="color: var(--tg-text);">کلینیک دکتر حسینی</h1>
      <p class="text-sm" style="color: var(--tg-hint);">ورود به حساب کاربری</p>
    </div>

    <div v-if="telegramUser" class="tg-card mb-4 flex items-center gap-3" style="background: color-mix(in srgb, var(--tg-btn) 8%, var(--tg-section-bg));">
      <div class="flex items-center justify-center w-11 h-11 rounded-full font-bold" style="background: var(--tg-sec-bg); color: var(--tg-btn);">
        {{ tgInitials }}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[14px] font-bold truncate" style="color: var(--tg-text);">{{ tgName }}</p>
        <p class="text-xs mt-0.5" style="color: var(--tg-hint);">این حساب تلگرام هنوز به پرونده‌ای متصل نشده است.</p>
      </div>
    </div>

    <form class="tg-card space-y-4" @submit.prevent="submit">
      <div>
        <label class="tg-field-label" for="tg-phone">شماره موبایل</label>
        <input
          id="tg-phone"
          v-model="phone"
          type="tel"
          inputmode="numeric"
          class="tg-input"
          placeholder="مثال: 09123456789"
          dir="rtl"
          autocomplete="tel"
        >
      </div>

      <div>
        <label class="tg-field-label" for="tg-pass">رمز عبور</label>
        <input
          id="tg-pass"
          v-model="password"
          type="password"
          class="tg-input"
          placeholder="رمز عبور"
          dir="rtl"
          autocomplete="current-password"
        >
      </div>

      <p v-if="error" class="text-[13px] font-semibold" style="color: var(--tg-destructive);">{{ error }}</p>

      <button type="submit" class="tg-btn tg-btn-primary" :disabled="loading || !phone || !password">
        <span v-if="loading" class="w-4 h-4 rounded-full" style="border: 2px solid rgba(255,255,255,0.35); border-top-color: white; animation: spin 0.8s linear infinite;"/>
        <span>{{ loading ? 'در حال ورود...' : 'ورود' }}</span>
      </button>
    </form>

    <p class="text-center text-xs mt-5 leading-relaxed" style="color: var(--tg-hint);">
      حساب ندارید؟ در وب‌سایت کلینیک ثبت‌نام کنید و از بخش پروفایل، دکمه
      <span class="font-bold" style="color: var(--tg-btn);">«اتصال با تلگرام»</span>
      را انتخاب کنید تا این گفتگو به حساب شما متصل شود.
    </p>
  </div>
</template>

<script setup lang="ts">
import { useTelegramApp } from '~/composables/useTelegramApp'
import { useMiniAppAuth, type TelegramUserInfo } from '~/composables/useMiniAppAuth'

const props = defineProps<{ telegramUser?: TelegramUserInfo | null }>()
const emit = defineEmits<{ (e: 'logged-in'): void }>()

const { initData } = useTelegramApp()
const auth = useMiniAppAuth()

const phone = ref('')
const password = ref('')
const error = ref('')
const loading = computed(() => auth.loading.value)

const tgName = computed(() => {
  const u = props.telegramUser
  return u ? `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.username || 'کاربر تلگرام' : 'کاربر تلگرام'
})
const tgInitials = computed(() => tgName.value.trim().slice(0, 2))

const submit = async () => {
  error.value = ''
  if (!/^09\d{9}$/.test(phone.value)) {
    error.value = 'شماره موبایل معتبر نیست'
    return
  }
  const result = await auth.login(phone.value, password.value, initData.value || undefined)
  if (result.ok) {
    emit('logged-in')
  } else {
    error.value = result.error || 'خطا در ورود'
  }
}
</script>
