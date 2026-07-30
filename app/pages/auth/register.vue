<script setup lang="ts">
/**
 * Register — Premium registration page.
 * Uses AuthShell for split-screen layout with role selection.
 */
const { t } = useI18n()
const { register } = useAuth()

const phone = ref('')
const fullName = ref('')
const password = ref('')
const role = ref<string>('doctor')
const loading = ref(false)
const showPassword = ref(false)

const errors = reactive({
  phone: '',
  fullName: '',
  password: '',
})

const roleItems = computed(() => [
  { label: t('users.roles.doctor'), value: 'doctor', icon: 'M4.26 10.147a60 60 0 0 0-.491 6.347A48.6 48.6 0 0 1 12 20.904a48.6 48.6 0 0 1 8.232-4.41 60.5 60.5 0 0 0-.491-6.347m-15.482 0a50 50 0 0 0-2.658-.813A50 50 0 0 1 12 3.493a50 50 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.7 50.7 0 0 1 12 13.489a50.7 50.7 0 0 1 7.74-3.342' },
  { label: t('users.roles.lab'), value: 'lab', icon: 'M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.3 24.3 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5' },
  { label: t('users.roles.pharmacy'), value: 'pharmacy', icon: 'M13.5 3v3.75m0 0L18 11.25m-4.5-8.25L9 11.25m4.5-8.25V11.25m-9 7.5h16.5a1.5 1.5 0 0 0 1.5-1.5v-6a1.5 1.5 0 0 0-1.5-1.5H6a1.5 1.5 0 0 0-1.5 1.5v6a1.5 1.5 0 0 0 1.5 1.5Zm13.5-9a3 3 0 0 0-3-3H6a3 3 0 0 0-3 3v9a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-9Z' },
  { label: t('users.roles.patient'), value: 'patient', icon: 'M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z' },
])

function validate(field?: string) {
  if (!field || field === 'phone') {
    errors.phone = ''
    if (!phone.value.trim()) errors.phone = t('auth.register.phoneRequired')
    else if (!/^09\d{9}$/.test(phone.value)) errors.phone = t('auth.register.phoneInvalid')
  }
  if (!field || field === 'fullName') {
    errors.fullName = ''
    if (!fullName.value.trim()) errors.fullName = t('auth.register.fullNameRequired')
    else if (fullName.value.trim().length < 3) errors.fullName = t('auth.register.fullNameMinLength')
  }
  if (!field || field === 'password') {
    errors.password = ''
    if (!password.value) errors.password = t('auth.register.passwordRequired')
    else if (password.value.length < 8) errors.password = t('auth.register.passwordMinLength')
  }
}

function hasErrors(): boolean {
  validate()
  return !!(errors.phone || errors.fullName || errors.password)
}

const handleRegister = async () => {
  if (hasErrors()) return

  loading.value = true
  await register({
    phone: phone.value,
    fullName: fullName.value,
    password: password.value,
    role: role.value as any,
  })
  loading.value = false
}

useSeoMeta({ title: t('auth.register.titleSeo') })
definePageMeta({ layout: false })
</script>

<template>
  <AuthShell :title="t('auth.register.title')" :subtitle="t('auth.register.subtitle')">
    <form class="auth-form" @submit.prevent="handleRegister">
      <!-- Full Name -->
      <div class="auth-field" :class="{ 'auth-field--error': errors.fullName }">
        <label class="auth-label" for="reg-name">{{ t('auth.register.fullNameLabel') }}</label>
        <div class="auth-input-wrap">
          <span class="auth-input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </span>
          <input
            id="reg-name"
            v-model="fullName"
            type="text"
            :placeholder="t('auth.register.fullNamePlaceholder')"
            class="auth-input"
            autocomplete="name"
            @blur="validate('fullName')"
          />
        </div>
        <Transition name="auth-err">
          <p v-if="errors.fullName" class="auth-error">{{ errors.fullName }}</p>
        </Transition>
      </div>

      <!-- Phone -->
      <div class="auth-field" :class="{ 'auth-field--error': errors.phone }">
        <label class="auth-label" for="reg-phone">{{ t('auth.register.phoneLabel') }}</label>
        <div class="auth-input-wrap">
          <span class="auth-input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          </span>
          <input
            id="reg-phone"
            v-model="phone"
            type="tel"
            inputmode="numeric"
            dir="ltr"
            placeholder="0912 345 6789"
            class="auth-input auth-input--ltr"
            autocomplete="tel"
            @blur="validate('phone')"
          />
        </div>
        <Transition name="auth-err">
          <p v-if="errors.phone" class="auth-error">{{ errors.phone }}</p>
        </Transition>
      </div>

      <!-- Role Selection -->
      <div class="auth-field">
        <label class="auth-label">{{ t('auth.register.roleLabel') }}</label>
        <div class="auth-role-grid">
          <label
            v-for="item in roleItems"
            :key="item.value"
            class="auth-role-card"
            :class="{ 'auth-role-card--active': role === item.value }"
          >
            <input
              v-model="role"
              type="radio"
              :value="item.value"
              class="sr-only"
            />
            <span class="auth-role-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path :d="item.icon" /></svg>
            </span>
            <span class="auth-role-label">{{ item.label }}</span>
          </label>
        </div>
      </div>

      <!-- Password -->
      <div class="auth-field" :class="{ 'auth-field--error': errors.password }">
        <label class="auth-label" for="reg-password">{{ t('auth.register.password') }}</label>
        <div class="auth-input-wrap">
          <span class="auth-input-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          </span>
          <input
            id="reg-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            dir="ltr"
            :placeholder="t('auth.register.passwordPlaceholder')"
            class="auth-input auth-input--ltr auth-input--password"
            autocomplete="new-password"
            @blur="validate('password')"
          />
          <button type="button" class="auth-input-toggle" @click="showPassword = !showPassword" :aria-label="showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')">
            <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
            <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" x2="22" y1="2" y2="22"/></svg>
          </button>
        </div>
        <Transition name="auth-err">
          <p v-if="errors.password" class="auth-error">{{ errors.password }}</p>
        </Transition>
      </div>

      <!-- Submit -->
      <button type="submit" class="auth-btn" :disabled="loading">
        <span v-if="loading" class="auth-btn__spinner" />
        <span :class="{ 'opacity-0': loading }">{{ t('auth.register.createAccount') }}</span>
        <span v-if="!loading" class="auth-btn__arrow">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </span>
      </button>
    </form>

    <!-- Footer -->
    <div class="auth-footer">
      <span class="auth-footer__text">{{ t('auth.register.alreadyHaveAccount') }}</span>
      <NuxtLink to="/auth/login" class="auth-footer__link">{{ t('auth.register.loginLink') }}</NuxtLink>
    </div>
  </AuthShell>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.125rem;
}

/* ── Field ── */
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
  padding: 0 2.5rem 0 0.5rem;
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
}

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

/* ── Role Grid ── */
.auth-role-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.auth-role-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.375rem;
  padding: 0.75rem 0.5rem;
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

:global([data-theme="dark"]) .auth-role-card {
  background: rgba(255,255,255,0.04);
  border-color: rgba(255,255,255,0.08);
}

.auth-role-card:hover {
  border-color: #c7d2fe;
  background: #f5f3ff;
}

.auth-role-card--active {
  border-color: #4F46E5 !important;
  background: rgba(79, 70, 229, 0.06) !important;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.auth-role-icon {
  color: #94a3b8;
  transition: color 0.2s;
}

.auth-role-card--active .auth-role-icon {
  color: #4F46E5;
}

.auth-role-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #64748b;
  transition: color 0.2s;
}

.auth-role-card--active .auth-role-label {
  color: #4F46E5;
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
  margin-top: 0.375rem;
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

/* Visually hidden for radio inputs */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
</style>
