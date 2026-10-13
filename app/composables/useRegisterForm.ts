import { computed, reactive, ref } from 'vue'

type RegisterField = 'phone' | 'fullName' | 'password'

/**
 * Shared registration form state and logic.
 *
 * Mirrors `useLoginForm`: one source of truth for validation and submission so
 * the desktop and mobile sign-up screens can never drift apart.
 */
export function useRegisterForm() {
  const { t } = useI18n()
  const { register } = useAuth()

  const phone = ref('')
  const fullName = ref('')
  const password = ref('')
  const role = ref<string>('doctor')
  const website = ref('')
  const loading = ref(false)

  const errors = reactive({
    phone: '',
    fullName: '',
    password: '',
  })

  const roleItems = computed(() => [
    { label: t('users.roles.doctor'), value: 'doctor', icon: 'lucide:stethoscope' },
    { label: t('users.roles.lab'), value: 'lab', icon: 'lucide:flask-conical' },
    { label: t('users.roles.pharmacy'), value: 'pharmacy', icon: 'lucide:pill' },
    { label: t('users.roles.patient'), value: 'patient', icon: 'lucide:user-round' },
  ])

  function validate(field?: RegisterField) {
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

  async function submit() {
    if (hasErrors()) return

    loading.value = true
    try {
      await register({
        phone: phone.value,
        fullName: fullName.value,
        password: password.value,
        role: role.value as any,
        website: website.value,
      })
    } finally {
      loading.value = false
    }
  }

  return {
    phone,
    fullName,
    password,
    role,
    website,
    loading,
    errors,
    roleItems,
    validate,
    hasErrors,
    submit,
  }
}
