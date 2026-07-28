<script setup lang="ts">
/**
 * Login — Premium authentication page.
 * Uses AuthShell for split-screen layout with custom form fields.
 */
const { t } = useI18n()
const { login } = useAuth()

const phone = ref('')
const password = ref('')
const loading = ref(false)
const showPassword = ref(false)
const phoneError = ref('')
const formError = ref('')

function validatePhone(): boolean {
  phoneError.value = ''
  if (!phone.value.trim()) {
    phoneError.value = t('auth.login.phoneRequired')
    return false
  }
  if (!/^09\d{9}$/.test(phone.value)) {
    phoneError.value = t('auth.login.phoneInvalid')
    return false
  }
  return true
}

const handleLogin = async () => {
  formError.value = ''
  if (!validatePhone()) return
  if (!password.value) {
    formError.value = t('auth.login.passwordRequired')
    return
  }

  loading.value = true
  await login({ phone: phone.value, password: password.value })
  loading.value = false
}

useSeoMeta({ title: t('auth.login.titleSeo') })
definePageMeta({ layout: false })
</script>

<template>
  <AuthShell :title="t('auth.login.title')" :subtitle="t('auth.login.subtitle')">
    <form class="auth-form" @submit.prevent="handleLogin">
      <!-- Phone -->
      <div class="auth-field" :class="{ 'auth-field--error': phoneError }">
        <label class="auth-label" for="login-phone">{{ t('auth.login.phoneLabel') }}</label>
        <div class="auth-input-wrap">
          <span class="auth-input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </span>
          <input
            id="login-phone"
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

      <!-- Password -->
      <div class="auth-field">
        <div class="auth-label-row">
          <label class="auth-label" for="login-password">{{ t('auth.login.password') }}</label>
          <NuxtLink to="/auth/forgot-password" class="auth-link-sm">{{ t('auth.login.forgotPasswordLink') }}</NuxtLink>
        </div>
        <div class="auth-input-wrap">
          <span class="auth-input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </span>
          <input
            id="login-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            dir="ltr"
            placeholder="••••••••"
            class="auth-input auth-input--ltr auth-input--password"
            autocomplete="current-password"
          />
          <button type="button" class="auth-input-toggle" @click="showPassword = !showPassword" :aria-label="showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')">
            <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
          </button>
        </div>
      </div>

      <!-- Global error -->
      <Transition name="auth-err">
        <p v-if="formError" class="auth-error auth-error--global">{{ formError }}</p>
      </Transition>

      <!-- Submit -->
      <button type="submit" class="auth-btn" :disabled="loading">
        <span v-if="loading" class="auth-btn__spinner" />
        <span :class="{ 'opacity-0': loading }">{{ t('auth.login.login') }}</span>
        <span v-if="!loading" class="auth-btn__arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </span>
      </button>
    </form>

    <!-- Footer -->
    <div class="auth-footer">
      <span class="auth-footer__text">{{ t('auth.login.noAccount') }}</span>
      <NuxtLink to="/auth/register" class="auth-footer__link">{{ t('auth.login.register') }}</NuxtLink>
    </div>
  </AuthShell>
</template>

<style scoped>
/* ═══════════════════════════════════════════
   Auth Form Styles — Shared across auth pages
   ═══════════════════════════════════════════ */

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Field ── */
.auth-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.auth-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.auth-label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: #334155;
}

:global([data-theme="dark"]) .auth-label {
  color: #cbd5e1;
}

.auth-link-sm {
  font-size: 0.75rem;
  font-weight: 600;
  color: #4F46E5;
  text-decoration: none;
  transition: color 0.2s;
}

.auth-link-sm:hover {
  color: #6366f1;
  text-decoration: underline;
}

/* ── Input ── */
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
  background: #ffffff;
}

.auth-input:focus + .auth-input-icon,
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

/* Password toggle */
.auth-input--password {
  padding-left: 2.5rem;
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

/* Error */
.auth-error {
  font-size: 0.75rem;
  font-weight: 500;
  color: #ef4444;
  padding-left: 0.125rem;
}

.auth-error--global {
  background: rgba(239, 68, 68, 0.08);
  border: 1px solid rgba(239, 68, 68, 0.15);
  border-radius: 0.625rem;
  padding: 0.625rem 0.75rem;
}

.auth-err-enter-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}
.auth-err-leave-active {
  transition: all 0.2s ease;
}
.auth-err-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
.auth-err-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ── Field error state ── */
.auth-field--error .auth-input {
  border-color: #ef4444;
}

.auth-field--error .auth-input:focus {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.auth-field--error .auth-input-icon {
  color: #ef4444;
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
  box-shadow: 0 4px 16px rgba(79, 70, 229, 0.35), 0 2px 4px rgba(79, 70, 229, 0.2);
  background: linear-gradient(135deg, #5551E8, #6D70F5);
}

.auth-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(79, 70, 229, 0.2);
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

/* ── Footer ── */
.auth-footer {
  text-align: center;
  margin-top: 1.75rem;
  font-size: 0.8125rem;
  color: #64748b;
  animation: authCardIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both;
}

:global([data-theme="dark"]) .auth-footer {
  color: #94a3b8;
}

.auth-footer__link {
  font-weight: 700;
  color: #4F46E5;
  text-decoration: none;
  margin-inline-start: 0.25rem;
  transition: color 0.2s;
}

.auth-footer__link:hover {
  color: #6366f1;
  text-decoration: underline;
}

@keyframes authCardIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.98);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
    filter: blur(0);
  }
}
</style>
