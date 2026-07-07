<template>
  <UiAuthLayout
    title="تغییر رمز عبور"
    subtitle="کد تایید و رمز جدید را وارد کنید"
    hero-title="تغییر رمز عبور"
    hero-subtitle="کد تایید و رمز جدید را وارد کنید"
  >
    <v-form ref="formRef" @submit.prevent="handleResetPassword" class="space-y-5">
      <v-text-field v-model="phone" label="شماره تلفن" variant="outlined"
        density="comfortable" class="ltr-field" prepend-inner-icon="mdi-phone-outline"
        readonly disabled />

      <div class="text-center pb-2">
        <p class="text-slate-600 dark:text-slate-400 mb-3 text-sm font-medium">کد تایید ۵ رقمی</p>
        <div class="flex justify-center gap-3" dir="ltr">
          <input v-for="i in 5" :key="i"
            :ref="(el: any) => { if (el) otpRefs[i - 1] = el }"
            v-model="otp[i - 1]" type="text" inputmode="numeric" maxlength="1"
            class="otp-box"
            @input="onOtpInput(i - 1)"
            @keydown.backspace="onOtpBackspace(i - 1)"
            @paste="onOtpPaste" />
        </div>
        <p v-if="otpError" class="text-red-500 text-xs mt-2">{{ otpError }}</p>
      </div>

      <v-text-field v-model="password" label="رمز عبور جدید"
        :type="showPassword ? 'text' : 'password'" variant="outlined"
        density="comfortable" class="ltr-field" prepend-inner-icon="mdi-lock-outline"
        :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="showPassword = !showPassword"
        :rules="passwordRules" required />

      <v-text-field v-model="confirmPassword" label="تکرار رمز عبور"
        :type="showConfirm ? 'text' : 'password'" variant="outlined"
        density="comfortable" class="ltr-field" prepend-inner-icon="mdi-lock-outline"
        :append-inner-icon="showConfirm ? 'mdi-eye-off' : 'mdi-eye'"
        @click:append-inner="showConfirm = !showConfirm"
        :rules="[(v: string) => v === password || 'رمز عبور همسان نیست']" required />

      <div class="text-center text-sm">
        <template v-if="timer > 0">
          <span class="text-slate-500">کد تا </span>
          <span class="text-red-500 font-bold crm-ltr">
            {{ String(Math.floor(timer / 60)).padStart(2, '0') }}:{{ String(timer % 60).padStart(2, '0') }}
          </span>
          <span class="text-slate-500"> اعتبار دارد</span>
        </template>
        <template v-else>
          <span class="text-red-500">کد منقضی شده است</span>
        </template>
      </div>

      <v-btn v-if="timer === 0" variant="text" color="#5465ff"
        :loading="resending" block @click="resendCode">ارسال مجدد کد</v-btn>

      <v-btn type="submit" color="#5465ff" size="x-large" block
        :loading="loading" :disabled="timer <= 0"
        class="crm-btn-accent rounded-xl! h-12!">
        تغییر رمز عبور
      </v-btn>
    </v-form>

    <div class="text-center mt-6 text-sm text-slate-600 dark:text-slate-400">
      <NuxtLink to="/auth/login" class="text-electric-sapphire font-medium hover:underline">بازگشت به ورود</NuxtLink>
    </div>
  </UiAuthLayout>
</template>

<script setup lang="ts">
const route = useRoute()
const formRef = ref<any>(null)

const phone = ref(route.query.phone as string || '')
const otp = ref(['', '', '', '', ''])
const otpRefs = ref<HTMLInputElement[]>([])
const otpError = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const resending = ref(false)
const showPassword = ref(false)
const showConfirm = ref(false)
const timer = ref(300)

let timerInterval: ReturnType<typeof setInterval> | null = null

const passwordRules = [
  (v: string) => (v && v.length >= 8) || 'حداقل ۸ کاراکتر',
]

if (!phone.value) {
  navigateTo('/auth/forgot-password')
}

const startTimer = () => {
  timer.value = 300
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    if (timer.value > 0) timer.value--
    else if (timerInterval) clearInterval(timerInterval)
  }, 1000)
}

const onOtpInput = (index: number) => {
  otpError.value = ''
  const val = otp.value[index]
  if (val && !/^\d$/.test(val)) {
    otp.value[index] = ''
    return
  }
  if (val && index < 4) otpRefs.value[index + 1]?.focus()
}

const onOtpBackspace = (index: number) => {
  if (!otp.value[index] && index > 0) otpRefs.value[index - 1]?.focus()
}

const onOtpPaste = (e: ClipboardEvent) => {
  e.preventDefault()
  const pasted = e.clipboardData?.getData('text') || ''
  const digits = pasted.replace(/\D/g, '').slice(0, 5)
  for (let i = 0; i < digits.length; i++) otp.value[i] = digits[i]
  setTimeout(() => otpRefs.value[Math.min(digits.length, 4)]?.focus(), 0)
  otpError.value = ''
}

const handleResetPassword = async () => {
  if (!formRef.value) return
  const { valid } = await formRef.value.validate()
  if (!valid) return

  const code = otp.value.join('')
  if (code.length !== 5) {
    otpError.value = 'کد تایید باید ۵ رقم باشد'
    return
  }

  loading.value = true
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: { phone: phone.value, code, password: password.value },
      baseURL: useRuntimeConfig().public.apiBase,
    })
    useNuxtApp().$toast.success('رمز عبور با موفقیت تغییر یافت.')
    await navigateTo('/auth/login')
  } catch (err: any) {
    const status = err?.response?.status
    if (status === 401) {
      otpError.value = 'کد نامعتبر یا منقضی شده است'
      otp.value = ['', '', '', '', '']
      otpRefs.value[0]?.focus()
    } else if (status === 429) {
      useNuxtApp().$toast.error('تعداد تلاش‌های ناموفق بیش از حد مجاز است. مجدداً درخواست کد کنید')
      await navigateTo('/auth/forgot-password')
    } else if (status === 400) {
      useNuxtApp().$toast.error('اطلاعات وارد شده معتبر نیست')
    } else {
      useNuxtApp().$toast.error('خطا در تغییر رمز عبور. بعداً تلاش کنید')
    }
  } finally {
    loading.value = false
  }
}

const resendCode = async () => {
  resending.value = true
  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { phone: phone.value },
      baseURL: useRuntimeConfig().public.apiBase,
    })
    useNuxtApp().$toast.success('کد جدید ارسال شد')
    otp.value = ['', '', '', '', '']
    otpError.value = ''
    startTimer()
    otpRefs.value[0]?.focus()
  } catch (err: any) {
    const status = err?.response?.status
    if (status === 429) {
      useNuxtApp().$toast.error('تعداد درخواست‌ها بیش از حد مجاز است')
    } else {
      useNuxtApp().$toast.error('خطا در ارسال کد')
    }
  } finally {
    resending.value = false
  }
}

onMounted(() => {
  startTimer()
  nextTick(() => otpRefs.value[0]?.focus())
})

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})

useSeoMeta({ title: 'تغییر رمز عبور' })
definePageMeta({ layout: false })
</script>

<style scoped>
.otp-box {
  width: 48px;
  height: 56px;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 700;
  border: 2px solid #cbd5e1;
  border-radius: 12px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #fff;
  color: #1e293b;
  font-family: inherit;
}

.dark .otp-box {
  background: #334155;
  border-color: #475569;
  color: #f1f5f9;
}

.otp-box:focus {
  border-color: #5465ff !important;
  box-shadow: 0 0 0 3px rgba(84, 101, 255, 0.15) !important;
}
</style>
