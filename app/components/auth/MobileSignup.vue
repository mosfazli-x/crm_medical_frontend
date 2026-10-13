<script setup lang="ts">
/**
 * Mobile sign-up screen. Shares `useRegisterForm` with the desktop screen so
 * validation and submission stay identical.
 */
const { t, locale } = useI18n()
const {
  phone,
  fullName,
  password,
  role,
  website,
  loading,
  errors,
  roleItems,
  validate,
  submit,
} = useRegisterForm()

const showPassword = ref(false)
const arrowIcon = computed(() => (locale.value === 'fa' ? 'lucide:arrow-left' : 'lucide:arrow-right'))

function onPhoneInput(event: Event) {
  const input = event.target as HTMLInputElement
  const digits = input.value.replace(/\D/g, '').slice(0, 11)
  input.value = digits
  phone.value = digits
}
</script>

<template>
  <AuthMobileShell
    variant="register"
    :eyebrow="t('auth.mobile.eyebrowSignup')"
    :title="t('auth.mobile.signupTitle')"
    :subtitle="t('auth.register.subtitle')"
  >
    <form class="ma-form" novalidate @submit.prevent="submit">
      <div aria-hidden="true" class="ma-honeypot">
        <label for="m-reg-website">Website</label>
        <input id="m-reg-website" v-model="website" type="text" name="website" tabindex="-1" autocomplete="off" />
      </div>

      <div class="ma-field" :class="{ 'is-invalid': errors.fullName }">
        <label class="ma-label" for="m-reg-name">{{ t('auth.register.fullNameLabel') }}</label>
        <div class="ma-input">
          <span class="ma-input__icon">
            <Icon name="lucide:user-round" size="19" />
          </span>
          <input
            id="m-reg-name"
            v-model="fullName"
            type="text"
            autocomplete="name"
            :placeholder="t('auth.register.fullNamePlaceholder')"
            class="ma-input__field"
            :aria-invalid="!!errors.fullName"
            aria-describedby="m-reg-name-err"
            @blur="validate('fullName')"
          />
        </div>
        <Transition name="ma-err">
          <p v-if="errors.fullName" id="m-reg-name-err" class="ma-error">{{ errors.fullName }}</p>
        </Transition>
      </div>

      <div class="ma-field" :class="{ 'is-invalid': errors.phone }">
        <label class="ma-label" for="m-reg-phone">{{ t('auth.register.phoneLabel') }}</label>
        <div class="ma-input">
          <span class="ma-input__icon">
            <Icon name="lucide:smartphone" size="19" />
          </span>
          <input
            id="m-reg-phone"
            :value="phone"
            type="tel"
            inputmode="numeric"
            autocomplete="tel"
            dir="ltr"
            placeholder="0912 345 6789"
            class="ma-input__field is-ltr"
            :aria-invalid="!!errors.phone"
            aria-describedby="m-reg-phone-err"
            @input="onPhoneInput"
            @blur="validate('phone')"
          />
        </div>
        <Transition name="ma-err">
          <p v-if="errors.phone" id="m-reg-phone-err" class="ma-error">{{ errors.phone }}</p>
        </Transition>
      </div>

      <fieldset class="ma-field">
        <legend class="ma-label">{{ t('auth.register.roleLabel') }}</legend>
        <div class="ma-roles">
          <label
            v-for="item in roleItems"
            :key="item.value"
            class="ma-role"
            :class="{ 'is-active': role === item.value }"
          >
            <input v-model="role" type="radio" :value="item.value" class="sr-only" />
            <span class="ma-role__icon">
              <Icon :name="item.icon" size="22" />
            </span>
            <span class="ma-role__label">{{ item.label }}</span>
          </label>
        </div>
      </fieldset>

      <div class="ma-field" :class="{ 'is-invalid': errors.password }">
        <label class="ma-label" for="m-reg-password">{{ t('auth.register.password') }}</label>
        <div class="ma-input">
          <span class="ma-input__icon">
            <Icon name="lucide:lock" size="19" />
          </span>
          <input
            id="m-reg-password"
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            dir="ltr"
            :placeholder="t('auth.register.passwordPlaceholder')"
            class="ma-input__field is-ltr has-trail"
            :aria-invalid="!!errors.password"
            aria-describedby="m-reg-password-err"
            @blur="validate('password')"
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
        <Transition name="ma-err">
          <p v-if="errors.password" id="m-reg-password-err" class="ma-error">{{ errors.password }}</p>
        </Transition>
      </div>

      <button type="submit" class="ma-btn" :disabled="loading">
        <span v-if="loading" class="ma-btn__spinner" />
        <span class="ma-btn__label" :class="{ 'is-hidden': loading }">{{ t('auth.register.createAccount') }}</span>
        <span v-if="!loading" class="ma-btn__arrow">
          <Icon :name="arrowIcon" size="18" />
        </span>
      </button>
    </form>
  </AuthMobileShell>
</template>
