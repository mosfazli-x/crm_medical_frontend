import { reactive, ref } from 'vue'

/**
 * Shared login form state and logic.
 *
 * Kept as a composable so the desktop and the mobile login surfaces stay in
 * lock-step: identical validation, identical API call, no duplicated rules.
 */
export function useLoginForm() {
  const { t } = useI18n()
  const { login } = useAuth()

  const phone = ref('')
  const password = ref('')
  const loading = ref(false)
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

  async function submit() {
    formError.value = ''
    if (!validatePhone()) return
    if (!password.value) {
      formError.value = t('auth.login.passwordRequired')
      return
    }

    loading.value = true
    try {
      await login({ phone: phone.value, password: password.value })
    } finally {
      loading.value = false
    }
  }

  return {
    phone,
    password,
    loading,
    phoneError,
    formError,
    validatePhone,
    submit,
  }
}
