<script setup lang="ts">
/**
 * Mobile login screen. State and validation come from `useLoginForm` so the
 * mobile and desktop experiences share one implementation.
 */
const { t, locale } = useI18n()
const { phone, password, loading, phoneError, formError, validatePhone, submit } = useLoginForm()

const showPassword = ref(false)
const arrowIcon = computed(() => (locale.value === 'fa' ? 'lucide:arrow-left' : 'lucide:arrow-right'))

/** Keep the field to digits only (Iranian mobile numbers are 11 digits). */
function onPhoneInput(event: Event) {
  const input = event.target as HTMLInputElement
  const digits = input.value.replace(/\D/g, '').slice(0, 11)
  input.value = digits
  phone.value = digits
}
</script>

<template>
  <AuthMobileShell
    variant="login"
    :eyebrow="t('auth.mobile.eyebrowLogin')"
    :title="t('auth.mobile.loginTitle')"
    :subtitle="t('auth.login.subtitle')"
  >
    <form class="ma-form" novalidate @submit.prevent="submit">
      <div class="ma-field" :class="{ 'is-invalid': phoneError }">
        <label class="ma-label" for="m-login-phone">{{ t('auth.login.phoneLabel') }}</label>
        <div class="ma-input">
          <span class="ma-input__icon">
            <Icon name="lucide:smartphone" size="19" />
          </span>
          <input
            id="m-login-phone"
            :value="phone"
            type="tel"
            inputmode="numeric"
            autocomplete="tel"
            dir="ltr"
            placeholder="0912 345 6789"
            class="ma-input__field is-ltr"
            :aria-invalid="!!phoneError"
            aria-describedby="m-login-phone-err"
            @input="onPhoneInput"
            @blur="validatePhone"
          />
        </div>
        <Transition name="ma-err">
          <p v-if="phoneError" id="m-login-phone-err" class="ma-error">{{ phoneError }}</p>
        </Transition>
      </div>

      <div class="ma-field">
        <div class="ma-labelrow">
          <label class="ma-label" for="m-login-password">{{ t('auth.login.password') }}</label>
          <NuxtLink class="ma-link" to="/auth/forgot-password">
            {{ t('auth.login.forgotPasswordLink') }}
          </NuxtLink>
        </div>
        <div class="ma-input">
          <span class="ma-input__icon">
            <Icon name="lucide:lock" size="19" />
          </span>
          <input
            id="m-login-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="current-password"
            dir="ltr"
            placeholder="••••••••"
            class="ma-input__field is-ltr has-trail"
          />
          <button
            type="button"
            class="ma-trail"
            :aria-label="showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')"
            @click="showPassword = !showPassword"
          >
            <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" size="19" />
          </button>
        </div>
      </div>

      <Transition name="ma-err">
        <p v-if="formError" class="ma-error ma-error--global" role="alert">{{ formError }}</p>
      </Transition>

      <button type="submit" class="ma-btn" :disabled="loading">
        <span v-if="loading" class="ma-btn__spinner" />
        <span class="ma-btn__label" :class="{ 'is-hidden': loading }">{{ t('auth.login.login') }}</span>
        <span v-if="!loading" class="ma-btn__arrow">
          <Icon :name="arrowIcon" size="18" />
        </span>
      </button>
    </form>
  </AuthMobileShell>
</template>
