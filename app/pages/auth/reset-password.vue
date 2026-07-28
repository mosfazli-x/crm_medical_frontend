<script setup lang="ts">
/**
 * ResetPassword — Enter OTP and new password.
 * Uses AuthShell for split-screen layout with custom OTP input.
 */
const { t } = useI18n()
const route = useRoute()

const phone = ref((route.query.phone as string) || '')
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

const passwordRules = computed(() => [
  (v: string) => (v && v.length >= 8) || t('auth.resetPassword.passwordRules'),
])

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
  for (let i = 0; i < digits.length; i++) otp.value[i] = digits[i]!
  setTimeout(() => otpRefs.value[Math.min(digits.length, 4)]?.focus(), 0)
  otpError.value = ''
}

const handleResetPassword = async () => {
  const code = otp.value.join('')
  if (code.length !== 5) {
    otpError.value = t('auth.resetPassword.otpLengthError')
    return
  }
  if (password.value.length < 8) return
  if (password.value !== confirmPassword.value) return

  loading.value = true
  try {
    await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: { phone: phone.value, code, password: password.value },
      baseURL: useRuntimeConfig().public.apiBase,
    })
    useNuxtApp().$toast.success(t('auth.resetPassword.resetSuccess'))
    await navigateTo('/auth/login')
  } catch (err: any) {
    const status = err?.response?.status
    if (status === 401) {
      otpError.value = t('auth.resetPassword.invalidCode')
      otp.value = ['', '', '', '', '']
      otpRefs.value[0]?.focus()
    } else if (status === 429) {
      useNuxtApp().$toast.error(t('auth.resetPassword.rateLimited'))
      await navigateTo('/auth/forgot-password')
    } else if (status === 400) {
      useNuxtApp().$toast.error(t('auth.resetPassword.invalidData'))
    } else {
      useNuxtApp().$toast.error(t('auth.resetPassword.resetError'))
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
    useNuxtApp().$toast.success(t('auth.resetPassword.newCodeSent'))
    otp.value = ['', '', '', '', '']
    otpError.value = ''
    startTimer()
    otpRefs.value[0]?.focus()
  } catch (err: any) {
    const status = err?.response?.status
    if (status === 429) {
      useNuxtApp().$toast.error(t('auth.resetPassword.resendRateLimited'))
    } else {
      useNuxtApp().$toast.error(t('auth.resetPassword.resendError'))
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

useSeoMeta({ title: t('auth.resetPassword.titleSeo') })
definePageMeta({ layout: false })
</script>

<template>
  <AuthShell :title="t('auth.resetPassword.title')" :subtitle="t('auth.resetPassword.subtitle')">
    <form class="auth-form" @submit.prevent="handleResetPassword">
      <!-- Phone (readonly) -->
      <div class="auth-field">
        <label class="auth-label" for="reset-phone">{{ t('auth.resetPassword.phoneLabel') }}</label>
        <div class="auth-input-wrap">
          <span class="auth-input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </span>
          <input
            id="reset-phone"
            :value="phone"
            type="tel"
            dir="ltr"
            class="auth-input auth-input--ltr auth-input--disabled"
            readonly
            disabled
          />
        </div>
      </div>

      <!-- OTP -->
      <div class="auth-field">
        <label class="auth-label">{{ t('auth.resetPassword.otpLabel') }}</label>
        <div class="auth-otp-row" dir="ltr">
          <input
            v-for="i in 5"
            :key="i"
            :ref="(el: any) => { if (el) otpRefs[i - 1] = el }"
            v-model="otp[i - 1]"
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="auth-otp-box"
            @input="onOtpInput(i - 1)"
            @keydown.backspace="onOtpBackspace(i - 1)"
            @paste="onOtpPaste"
          />
        </div>
        <Transition name="auth-err">
          <p v-if="otpError" class="auth-error">{{ otpError }}</p>
        </Transition>
      </div>

      <!-- New Password -->
      <div class="auth-field">
        <label class="auth-label" for="reset-password">{{ t('auth.resetPassword.newPassword') }}</label>
        <div class="auth-input-wrap">
          <span class="auth-input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </span>
          <input
            id="reset-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            dir="ltr"
            :placeholder="t('auth.resetPassword.passwordPlaceholder')"
            class="auth-input auth-input--ltr auth-input--password"
            autocomplete="new-password"
          />
          <button type="button" class="auth-input-toggle" @click="showPassword = !showPassword">
            <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
          </button>
        </div>
      </div>

      <!-- Confirm Password -->
      <div class="auth-field">
        <label class="auth-label" for="reset-confirm">{{ t('auth.resetPassword.confirmPassword') }}</label>
        <div class="auth-input-wrap">
          <span class="auth-input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
          </span>
          <input
            id="reset-confirm"
            v-model="confirmPassword"
            :type="showConfirm ? 'text' : 'password'"
            dir="ltr"
            :placeholder="t('auth.resetPassword.confirmPasswordPlaceholder')"
            class="auth-input auth-input--ltr auth-input--password"
            autocomplete="new-password"
          />
          <button type="button" class="auth-input-toggle" @click="showConfirm = !showConfirm">
            <svg v-if="!showConfirm" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
          </button>
        </div>
      </div>

      <!-- Timer / Resend -->
      <div class="auth-timer-row">
        <template v-if="timer > 0">
          <span class="auth-timer-text">{{ t('auth.resetPassword.timerPrefix') }}</span>
          <span class="auth-timer-count">
            {{ String(Math.floor(timer / 60)).padStart(2, '0') }}:{{ String(timer % 60).padStart(2, '0') }}
          </span>
          <span class="auth-timer-text">{{ t('auth.resetPassword.timerValid') }}</span>
        </template>
        <template v-else>
          <span class="auth-timer-expired">{{ t('auth.resetPassword.timerExpires') }}</span>
        </template>
      </div>

      <button v-if="timer === 0" type="button" class="auth-resend-btn" :disabled="resending" @click="resendCode">
        {{ resending ? t('auth.resetPassword.resending') : t('auth.resetPassword.resendCode') }}
      </button>

      <!-- Submit -->
      <button type="submit" class="auth-btn" :disabled="loading || timer <= 0">
        <span v-if="loading" class="auth-btn__spinner" />
        <span :class="{ 'opacity-0': loading }">{{ t('auth.resetPassword.reset') }}</span>
      </button>
    </form>

    <!-- Footer -->
    <div class="auth-footer">
      <NuxtLink to="/auth/login" class="auth-footer__link">{{ t('auth.resetPassword.backToLogin') }}</NuxtLink>
    </div>
  </AuthShell>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
}

.auth-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.auth-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #334155;
}

:global([data-theme="dark"]) .auth-label {
  color: #cbd5e1;
}

.auth-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.auth-input-icon {
  position: absolute;
  right: 0.875rem;
  color: #94a3b8;
  display: flex;
  align-items: center;
  pointer-events: none;
  transition: color 0.2s;
  z-index: 1;
}

.auth-input {
  width: 100%;
  height: 2.75rem;
  padding: 0 2.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  font-family: var(--font-body);
  color: #0f172a;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.75rem;
  outline: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.auth-input::placeholder {
  color: #94a3b8;
}

.auth-input:focus {
  border-color: #4F46E5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.auth-input-wrap:focus-within .auth-input-icon {
  color: #4F46E5;
}

.auth-input--ltr {
  text-align: left;
  direction: ltr;
}

.auth-input--ltr::placeholder {
  text-align: left;
  direction: ltr;
}

.auth-input--password {
  padding-left: 2.5rem;
}

.auth-input--disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f1f5f9;
}

:global([data-theme="dark"]) .auth-input--disabled {
  background: rgba(255,255,255,0.04);
}

.auth-input-toggle {
  position: absolute;
  left: 0.625rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  color: #94a3b8;
  background: none;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: color 0.2s, background 0.2s;
}

.auth-input-toggle:hover {
  color: #64748b;
  background: rgba(0,0,0,0.04);
}

.auth-error {
  font-size: 0.75rem;
  font-weight: 500;
  color: #ef4444;
}

.auth-err-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.auth-err-leave-active {
  transition: all 0.2s ease;
}
.auth-err-enter-from,
.auth-err-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ── OTP Boxes ── */
.auth-otp-row {
  display: flex;
  justify-content: center;
  gap: 0.625rem;
  padding: 0.25rem 0;
}

.auth-otp-box {
  width: 3rem;
  height: 3.25rem;
  text-align: center;
  font-size: 1.375rem;
  font-weight: 700;
  font-family: var(--font-body);
  color: #0f172a;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.75rem;
  outline: none;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

:global([data-theme="dark"]) .auth-otp-box {
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.1);
  color: #f1f5f9;
}

.auth-otp-box:focus {
  border-color: #4F46E5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
}

@media (max-width: 400px) {
  .auth-otp-box {
    width: 2.5rem;
    height: 2.75rem;
    font-size: 1.125rem;
  }
}

/* ── Timer ── */
.auth-timer-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  font-size: 0.8125rem;
  font-weight: 500;
}

.auth-timer-text {
  color: #64748b;
}

:global([data-theme="dark"]) .auth-timer-text {
  color: #94a3b8;
}

.auth-timer-count {
  font-weight: 700;
  color: #4F46E5;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.05em;
}

.auth-timer-expired {
  color: #ef4444;
  font-weight: 600;
}

/* ── Resend Button ── */
.auth-resend-btn {
  width: 100%;
  height: 2.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  font-family: var(--font-body);
  color: #4F46E5;
  background: transparent;
  border: 1.5px solid rgba(79, 70, 229, 0.2);
  border-radius: 0.625rem;
  cursor: pointer;
  transition: all 0.2s;
}

.auth-resend-btn:hover:not(:disabled) {
  background: rgba(79, 70, 229, 0.06);
  border-color: rgba(79, 70, 229, 0.35);
}

.auth-resend-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Submit Button ── */
.auth-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  height: 2.875rem;
  margin-top: 0.25rem;
  font-size: 0.9375rem;
  font-weight: 700;
  font-family: var(--font-body);
  color: #ffffff;
  background: linear-gradient(135deg, #4F46E5, #6366F1);
  border: none;
  border-radius: 0.75rem;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.25), 0 1px 2px rgba(79, 70, 229, 0.15);
}

.auth-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(79, 70, 229, 0.35);
  background: linear-gradient(135deg, #5551E8, #6D70F5);
}

.auth-btn:active:not(:disabled) {
  transform: translateY(0);
}

.auth-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.auth-btn__spinner {
  position: absolute;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: authSpin 0.6s linear infinite;
}

@keyframes authSpin {
  to { transform: rotate(360deg); }
}

/* ── Footer ── */
.auth-footer {
  text-align: center;
  margin-top: 1.75rem;
  font-size: 0.8125rem;
  color: #64748b;
}

:global([data-theme="dark"]) .auth-footer {
  color: #94a3b8;
}

.auth-footer__link {
  font-weight: 700;
  color: #4F46E5;
  text-decoration: none;
  transition: color 0.2s;
}

.auth-footer__link:hover {
  color: #6366f1;
  text-decoration: underline;
}
</style>
