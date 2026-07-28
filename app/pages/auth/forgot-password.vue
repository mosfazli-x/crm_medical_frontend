<script setup lang="ts">
/**
 * ForgotPassword — Request OTP to reset password.
 * Uses AuthShell for split-screen layout.
 */
const { t } = useI18n()

const phone = ref('')
const loading = ref(false)
const phoneError = ref('')

function validatePhone(): boolean {
  phoneError.value = ''
  if (!phone.value.trim()) {
    phoneError.value = t('auth.forgotPassword.phoneRequired')
    return false
  }
  if (!/^09\d{9}$/.test(phone.value)) {
    phoneError.value = t('auth.forgotPassword.phoneInvalid')
    return false
  }
  return true
}

const handleForgotPassword = async () => {
  if (!validatePhone()) return

  loading.value = true
  try {
    await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: { phone: phone.value },
      baseURL: useRuntimeConfig().public.apiBase,
    })
    useNuxtApp().$toast.success(t('auth.forgotPassword.sendSuccess'))
    await navigateTo(`/auth/reset-password?phone=${encodeURIComponent(phone.value)}`)
  } catch (err: any) {
    const status = err?.response?.status
    if (status === 429) {
      useNuxtApp().$toast.error(t('auth.forgotPassword.rateLimited'))
    } else {
      useNuxtApp().$toast.error(t('auth.forgotPassword.sendError'))
    }
  } finally {
    loading.value = false
  }
}

useSeoMeta({ title: t('auth.forgotPassword.titleSeo') })
definePageMeta({ layout: false })
</script>

<template>
  <AuthShell :title="t('auth.forgotPassword.title')" :subtitle="t('auth.forgotPassword.subtitle')">
    <form class="auth-form" @submit.prevent="handleForgotPassword">
      <!-- Phone -->
      <div class="auth-field" :class="{ 'auth-field--error': phoneError }">
        <label class="auth-label" for="forgot-phone">{{ t('auth.forgotPassword.phone') }}</label>
        <div class="auth-input-wrap">
          <span class="auth-input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </span>
          <input
            id="forgot-phone"
            v-model="phone"
            type="tel"
            inputmode="numeric"
            dir="ltr"
            placeholder="0912 345 6789"
            class="auth-input auth-input--ltr"
            autocomplete="tel"
            @blur="validatePhone"
          />
        </div>
        <Transition name="auth-err">
          <p v-if="phoneError" class="auth-error">{{ phoneError }}</p>
        </Transition>
      </div>

      <!-- Submit -->
      <button type="submit" class="auth-btn" :disabled="loading">
        <span v-if="loading" class="auth-btn__spinner" />
        <span :class="{ 'opacity-0': loading }">{{ t('auth.forgotPassword.sendOtp') }}</span>
        <span v-if="!loading" class="auth-btn__arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13"/><path d="m22 2-7 20-4-9-9-4Z"/></svg>
        </span>
      </button>
    </form>

    <!-- Footer -->
    <div class="auth-footer">
      <NuxtLink to="/auth/login" class="auth-footer__link">{{ t('auth.forgotPassword.backToLogin') }}</NuxtLink>
    </div>
  </AuthShell>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
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

.auth-error {
  font-size: 0.75rem;
  font-weight: 500;
  color: #ef4444;
}

.auth-field--error .auth-input {
  border-color: #ef4444;
}

.auth-field--error .auth-input:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
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

.auth-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  height: 2.875rem;
  margin-top: 0.5rem;
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
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-btn__arrow {
  display: flex;
  align-items: center;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.auth-btn:hover:not(:disabled) .auth-btn__arrow {
  transform: translateX(-4px);
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
