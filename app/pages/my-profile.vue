<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- ─── Apple-style large-title header ─── -->
    <header class="dash-head">
      <div class="dash-head__copy">
        <h1 class="dash-head__title">{{ t('myProfile.title') }}</h1>
        <p class="dash-head__date">{{ t('myProfile.subtitle') }}</p>
      </div>
    </header>

    <!-- ─── Identity hero ─── -->
    <section class="pf-hero">
      <span class="pf-hero__orb pf-hero__orb--a" />
      <span class="pf-hero__orb pf-hero__orb--b" />
      <div class="pf-hero__inner">
        <div class="pf-hero__avatar">{{ userInitial }}</div>
        <div class="pf-hero__copy">
          <h2 class="pf-hero__name">{{ userData?.fullName || t('myProfile.helloUser') }}</h2>
          <div class="pf-hero__meta">
            <span class="pf-hero__pill" :class="rolePillClass">{{ roleLabel }}</span>
            <span class="pf-hero__divider" />
            <span dir="ltr">{{ userData?.phone }}</span>
            <template v-if="isLabOrPharmacy && userData?.organizationName">
              <span class="pf-hero__divider" />
              <span>{{ userData.organizationName }}</span>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- ─── Identity + Security ─── -->
    <div class="grid! grid-cols-1! xl:grid-cols-2! gap-5! mt-5!">

      <!-- Identity Information -->
      <article class="pf-card" style="animation-delay: 60ms">
        <div class="pf-card__head">
          <div class="asa-tint asa-tint--teal">
            <UserDeatils class="w-5! h-5! fill-current" />
          </div>
          <div class="min-w-0!">
            <h2 class="asa-card-title">{{ t('myProfile.identityInfo') }}</h2>
            <p class="asa-card-sub">{{ t('myProfile.identityInfoDesc') }}</p>
          </div>
        </div>
        <div class="pf-card__body">
          <v-form ref="profileFormRef" @submit.prevent="handleUpdateProfile">
            <div class="pf-stack">
              <div class="pf-field">
                <v-text-field v-model="profileForm.fullName" :label="t('myProfile.fullName')" variant="solo"
                  density="comfortable" dir="rtl" clearable append-inner-icon="mdi-draw-pen"
                  @click:append-inner="openHandwriting('fullName')"
                  :rules="[v => !v || v.length >= 2 || t('myProfile.fullNameMinError')]" />
              </div>

              <div v-if="isLabOrPharmacy" class="pf-field">
                <v-text-field v-model="profileForm.organizationName" :label="t('myProfile.organizationName')"
                  variant="solo" density="comfortable" dir="rtl" clearable append-inner-icon="mdi-draw-pen"
                  @click:append-inner="openHandwriting('organizationName')"
                  :rules="[v => !v || v.length >= 1 || t('myProfile.organizationMinError')]" />
              </div>

              <div>
                <span class="asa-field-label">{{ t('myProfile.mobileLabel') }}</span>
                <div class="pf-phone">
                  <div class="asa-tint asa-tint--teal asa-tint--sm">
                    <v-icon size="18">mdi-cellphone</v-icon>
                  </div>
                  <span dir="ltr" class="pf-phone__num">{{ userData?.phone || '---' }}</span>
                  <v-tooltip :text="t('myProfile.phoneTooltip')" location="top">
                    <template #activator="{ props }">
                      <span v-bind="props" class="pf-lock">
                        <v-icon size="13">mdi-lock-outline</v-icon>
                        <span>{{ t('myProfile.immutable') }}</span>
                      </span>
                    </template>
                  </v-tooltip>
                </div>
              </div>

              <button class="asa-btn asa-btn--primary pf-btn--block" type="submit" :disabled="profileLoading">
                <v-progress-circular v-if="profileLoading" indeterminate size="18" width="2" color="#ffffff" />
                <template v-else>
                  <UserDeatils class="w-4! h-4! fill-current" />
                  <span>{{ t('myProfile.saveProfile') }}</span>
                </template>
              </button>
            </div>
          </v-form>
        </div>
      </article>

      <!-- Security & Password -->
      <article class="pf-card" style="animation-delay: 120ms">
        <div class="pf-card__head">
          <div class="asa-tint asa-tint--rose">
            <Security class="w-5! h-5! fill-current" />
          </div>
          <div class="min-w-0!">
            <h2 class="asa-card-title">{{ t('myProfile.security') }}</h2>
            <p class="asa-card-sub">{{ t('myProfile.securityDesc') }}</p>
          </div>
        </div>
        <div class="pf-card__body">
          <v-form ref="passwordFormRef" @submit.prevent="handleChangePassword">
            <div class="pf-stack">
              <div class="pf-field">
                <v-text-field v-model="passwordForm.currentPassword" :label="t('myProfile.currentPassword')"
                  class="ltr-field" :type="showCurrentPassword ? 'text' : 'password'" variant="solo"
                  density="comfortable" :append-inner-icon="showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showCurrentPassword = !showCurrentPassword"
                  :rules="[v => !!v || t('myProfile.currentPasswordRequired')]" />
              </div>

              <div class="pf-field">
                <v-text-field v-model="passwordForm.newPassword" :label="t('myProfile.newPassword')"
                  class="ltr-field" :type="showNewPassword ? 'text' : 'password'" variant="solo"
                  density="comfortable" :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showNewPassword = !showNewPassword" :rules="[
                    v => !!v || t('myProfile.newPasswordRequired'),
                    v => (v && v.length >= 8) || t('myProfile.passwordMinError')
                  ]" />
              </div>

              <div class="pf-field">
                <v-text-field v-model="passwordForm.confirmPassword" :label="t('myProfile.confirmPassword')"
                  class="ltr-field" :type="showConfirmPassword ? 'text' : 'password'" variant="solo"
                  density="comfortable" :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  @click:append-inner="showConfirmPassword = !showConfirmPassword" :rules="[
                    v => !!v || t('myProfile.confirmPasswordRequired'),
                    v => v === passwordForm.newPassword || t('myProfile.passwordMismatch')
                  ]" />
              </div>

              <button class="asa-btn asa-btn--ghost pf-btn--block" type="submit" :disabled="passwordLoading">
                <v-progress-circular v-if="passwordLoading" indeterminate size="18" width="2" color="currentColor" />
                <template v-else>
                  <Security class="w-4! h-4! fill-current" />
                  <span>{{ t('myProfile.changePassword') }}</span>
                </template>
              </button>
            </div>
          </v-form>
        </div>
      </article>
    </div>

    <!-- Notification settings — intentionally disabled for now
    <article v-if="isDoctor" class="pf-card pf-card--telegram" style="animation-delay: 240ms">
      <div class="pf-card__head">
        <div class="asa-tint asa-tint--teal">
          <v-icon size="24">mdi-bell-ring-outline</v-icon>
        </div>
        <div class="min-w-0!">
          <h2 class="asa-card-title">{{ t('myProfile.notifications') }}</h2>
          <p class="asa-card-sub">{{ t('myProfile.notificationsDesc') }}</p>
        </div>
      </div>
      <div class="pf-card__body">
        <div v-if="!prefsLoaded" class="space-y-3!">
          <div v-for="i in 2" :key="i" class="asa-skel h-16! rounded-2xl!" />
        </div>
        <div v-else class="pf-list">
          <div class="pf-row">
            <div class="pf-row__main">
              <div class="asa-tint asa-tint--teal asa-tint--sm">
                <v-icon size="18">mdi-message-text-outline</v-icon>
              </div>
              <div class="min-w-0!">
                <p class="pf-row__title">{{ t('myProfile.smsNotifications') }}</p>
                <p class="pf-row__sub">{{ t('myProfile.smsNotificationsDesc') }}</p>
              </div>
            </div>
            <v-switch :model-value="smsEnabled" color="#5f8feb" hide-details :loading="smsToggleLoading"
              @update:model-value="(val: boolean) => togglePref('sms', val)" />
          </div>

          <div class="pf-row" :class="{ 'pf-row--disabled': telegramToggleDisabled }">
            <div class="pf-row__main">
              <div class="asa-tint asa-tint--indigo asa-tint--sm">
                <Telegram class="w-4! h-4! fill-current" />
              </div>
              <div class="min-w-0!">
                <p class="pf-row__title">{{ t('myProfile.telegramNotifications') }}</p>
                <p class="pf-row__sub">{{ t('myProfile.telegramNotificationsDesc') }}</p>
              </div>
            </div>
            <v-tooltip v-if="telegramToggleDisabled" :text="t('myProfile.connectTelegramFirst')" location="top">
              <template #activator="{ props }">
                <div v-bind="props">
                  <v-switch :model-value="telegramEnabled" color="#5f8feb" hide-details disabled
                    :loading="telegramToggleLoading" />
                </div>
              </template>
            </v-tooltip>
            <v-switch v-else :model-value="telegramEnabled" color="#5f8feb" hide-details
              :loading="telegramToggleLoading"
              @update:model-value="(val: boolean) => togglePref('telegram', val)" />
          </div>
        </div>
      </div>
    </article>
    -->

    <!-- ─── Telegram connection ─── -->
    <article class="pf-card pf-card--telegram" style="animation-delay: 180ms">
      <div class="pf-card__head">
        <div class="asa-tint asa-tint--indigo">
          <Telegram class="w-5! h-5! fill-current" />
        </div>
        <div class="min-w-0!">
          <h2 class="asa-card-title">{{ t('myProfile.telegramConnection') }}</h2>
          <p class="asa-card-sub">{{ t('myProfile.telegramConnectionDesc') }}</p>
        </div>
      </div>
      <div class="pf-card__body">

        <div v-if="telegramLinked">
          <div class="pf-alert pf-alert--green">
            <div class="asa-tint asa-tint--green">
              <v-icon size="26">mdi-check-circle</v-icon>
            </div>
            <div class="pf-alert__body">
              <p class="pf-alert__title">
                <template v-if="telegramData?.username">
                  {{ t('myProfile.linkedToUser') }}{{ telegramData.username }}
                </template>
                <template v-else-if="telegramData?.firstName">
                  {{ t('myProfile.linkedToFirst') }}{{ telegramData.firstName }}
                </template>
                <template v-else>
                  {{ t('myProfile.connectedToBot') }}
                </template>
              </p>
              <p class="pf-alert__desc">{{ t('myProfile.connectedDesc') }}</p>
            </div>
            <button class="asa-btn asa-btn--rose asa-btn--sm" @click="confirmUnlink">
              <v-icon size="15">mdi-link-variant-off</v-icon>
              <span>{{ t('myProfile.unlinkButton') }}</span>
            </button>
          </div>
        </div>

        <div v-else-if="telegramState === 'code' || telegramState === 'polling'">
          <div class="pf-center">
            <div class="pf-center__icon">
              <div class="asa-tint asa-tint--indigo w-full! h-full!">
                <Telegram class="w-6! h-6! fill-current" />
              </div>
            </div>

            <h3 class="pf-center__title">{{ t('myProfile.oneClickConnect') }}</h3>
            <p class="pf-center__desc">{{ t('myProfile.oneClickDesc') }}</p>

            <a :href="telegramDeepLink" target="_blank" rel="noopener" class="asa-btn asa-btn--primary pf-btn--lg"
              @click="telegramState = 'polling'">
              <Telegram class="w-5! h-5! fill-current" />
              <span>{{ t('myProfile.openTelegramBot') }}</span>
            </a>

            <div v-if="telegramState === 'polling'" class="pf-poll">
              <v-progress-circular indeterminate size="22" width="3" color="var(--asa-accent)" />
              <span>{{ t('myProfile.waitConfirmation') }}</span>
            </div>

            <div class="pf-manual">
              <details>
                <summary class="pf-summary">
                  <v-icon size="15">mdi-code-braces</v-icon>
                  <span>{{ t('myProfile.advancedManualCode') }}</span>
                </summary>
                <div class="pf-codebox">
                  <p class="pf-codebox__hint">{{ t('myProfile.enterCodePrompt') }}</p>
                  <div class="pf-code">{{ linkCode }}</div>
                  <div>
                    <button class="pf-link" @click="copyCode">
                      <v-icon size="15" :icon="codeCopied ? 'mdi-check' : 'mdi-content-copy'" />
                      <span>{{ codeCopied ? t('common.copied') : t('common.copy') }}</span>
                    </button>
                  </div>
                  <p class="pf-codebox__note">{{ t('myProfile.codeValidStill', { minutes: countdownDisplay }) }}</p>
                </div>
              </details>
            </div>

            <div class="pf-center__cancel">
              <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="resetTelegram">
                <v-icon size="15">mdi-close</v-icon>
                <span>{{ t('common.cancel') }}</span>
              </button>
            </div>
          </div>
        </div>

        <div v-else-if="telegramError">
          <div class="pf-alert pf-alert--rose">
            <div class="asa-tint asa-tint--rose">
              <v-icon size="26">mdi-alert-circle-outline</v-icon>
            </div>
            <div class="pf-alert__body">
              <p class="pf-alert__title">{{ t('myProfile.connectionError') }}</p>
              <p class="pf-alert__desc">{{ telegramError }}</p>
            </div>
            <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="resetTelegram">
              <span>{{ t('common.retry') }}</span>
            </button>
          </div>
        </div>

        <div v-else>
          <div class="pf-center">
            <div class="pf-center__icon">
              <div class="asa-tint asa-tint--indigo w-full! h-full!">
                <Telegram class="w-6! h-6! fill-current" />
              </div>
            </div>
            <p class="pf-center__muted">{{ t('myProfile.notConnected') }}</p>
            <p class="pf-center__desc">{{ t('myProfile.connectDescription') }}</p>
            <button class="asa-btn asa-btn--primary pf-btn--lg" :disabled="codeLoading" @click="handleGenerateCode">
              <v-progress-circular v-if="codeLoading" indeterminate size="18" width="2" color="#ffffff" />
              <template v-else>
                <Telegram class="w-5! h-5! fill-current" />
                <span>{{ t('myProfile.connectButton') }}</span>
              </template>
            </button>
          </div>
        </div>

      </div>
    </article>

    <!-- ─── Unlink dialog ─── -->
    <v-dialog v-model="unlinkDialog" max-width="440" persistent transition="dialog-bottom-transition">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ t('myProfile.unlinkTitle') }}</h2>
            <span class="asa-dialog__sub">{{ t('myProfile.unlinkConfirm') }}</span>
          </div>
          <button class="pf-x" aria-label="close" @click="unlinkDialog = false">
            <v-icon size="18">mdi-close</v-icon>
          </button>
        </div>
        <v-card-text class="asa-dialog__body">
          <div class="pf-alert pf-alert--rose">
            <div class="asa-tint asa-tint--rose">
              <v-icon size="24">mdi-link-variant-off</v-icon>
            </div>
            <div class="pf-alert__body">
              <p class="pf-alert__title">{{ t('myProfile.unlinkTitle') }}</p>
              <p class="pf-alert__desc">{{ t('myProfile.unlinkConfirm') }}</p>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="unlinkDialog = false">
            <span>{{ t('common.cancel') }}</span>
          </button>
          <button class="asa-btn asa-btn--rose asa-btn--sm" :disabled="unlinkLoading" @click="handleUnlink">
            <v-progress-circular v-if="unlinkLoading" indeterminate size="16" width="2" color="#ffffff" />
            <template v-else>
              <v-icon size="15">mdi-link-variant-off</v-icon>
              <span>{{ t('myProfile.unlinkButton') }}</span>
            </template>
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <HandwritingDialog v-model="handwritingOpen" :label="handwritingLabel" :numeric="handwritingNumeric"
      @insert="applyHandwriting" />
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'
import Security from '~/components/icons/Security.vue'
import Telegram from '~/components/icons/Telegram.vue'
import UserDeatils from '~/components/icons/UserDeatils.vue'
import { useHandwritingFields } from '~/composables/useHandwritingFields'
import HandwritingDialog from '~/components/HandwritingDialog.vue'

const { t } = useI18n()
const { apiFetch } = useApi()
const { user: authUser } = useAuth()
const toast = useNuxtApp().$toast

const userData = computed(() => authUser.value)

const profileFormRef = ref<any>(null)
const passwordFormRef = ref<any>(null)

const profileLoading = ref(false)
const passwordLoading = ref(false)

const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

const profileForm = reactive({
  fullName: '',
  organizationName: '',
})

const { handwritingOpen, handwritingLabel, handwritingNumeric, openHandwriting, applyHandwriting } =
  useHandwritingFields({
    fieldLabels: {
      fullName: t('myProfile.fullName'),
      organizationName: t('myProfile.organizationName'),
    },
    target: profileForm,
  })

const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const roleLabel = computed(() => {
  const roles: Record<string, string> = {
    admin_doctor: t('users.roles.admin_doctor'),
    doctor: t('users.roles.doctor'),
    pharmacy: t('users.roles.pharmacy'),
    lab: t('users.roles.lab'),
    patient: t('users.roles.patient'),
  }
  return roles[userData.value?.role ?? ''] || t('users.roles.patient')
})

const rolePillClass = computed(() => {
  const role = userData.value?.role
  if (role === 'lab' || role === 'pharmacy') return 'pf-hero__pill--indigo'
  if (role === 'patient') return 'pf-hero__pill--green'
  return 'pf-hero__pill--teal'
})

const userInitial = computed(() => {
  return userData.value?.fullName?.charAt(0) || 'U'
})

const isLabOrPharmacy = computed(() => {
  const role = userData.value?.role
  return role === 'lab' || role === 'pharmacy'
})

const isDoctor = computed(() => {
  const role = userData.value?.role
  return role === 'admin_doctor' || role === 'doctor'
})

onMounted(() => {
  if (userData.value) {
    profileForm.fullName = userData.value.fullName || ''
    profileForm.organizationName = userData.value.organizationName || ''
  }
  loadNotificationPrefs()
  checkTelegramStatus()
})

async function handleUpdateProfile() {
  const form = profileFormRef.value
  if (!form) return

  const { valid } = await form.validate()
  if (!valid) return

  profileLoading.value = true
  try {
    const body: Record<string, string> = {}

    if (profileForm.fullName && profileForm.fullName !== userData.value?.fullName) {
      body.fullName = profileForm.fullName
    }
    if (isLabOrPharmacy.value && profileForm.organizationName !== undefined && profileForm.organizationName !== userData.value?.organizationName) {
      body.organizationName = profileForm.organizationName
    }

    if (!Object.keys(body).length) {
      toast.info(t('myProfile.noChanges'))
      return
    }

    const res: any = await apiFetch('/api/auth/profile', {
      method: 'PATCH',
      body,
    })

    if (res.success) {
      authUser.value = res.user
      toast.success(res.message || t('myProfile.profileUpdated'))
    }
  } catch (err: any) {
    const msg = err?.data?.error || t('myProfile.profileUpdateError')
    toast.error(msg)
  } finally {
    profileLoading.value = false
  }
}

async function handleChangePassword() {
  const form = passwordFormRef.value
  if (!form) return

  const { valid } = await form.validate()
  if (!valid) return

  passwordLoading.value = true
  try {
    const res: any = await apiFetch('/api/auth/change-password', {
      method: 'PATCH',
      body: {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      },
    })

    if (res.success) {
      toast.success(res.message || t('myProfile.passwordChanged'))

      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      passwordFormRef.value?.resetValidation()

      showCurrentPassword.value = false
      showNewPassword.value = false
      showConfirmPassword.value = false
    }
  } catch (err: any) {
    const status = err?.response?.status
    if (status === 401) {
      toast.error(t('myProfile.wrongPassword'))
    } else {
      toast.error(err?.data?.error || t('myProfile.passwordChangeError'))
    }
  } finally {
    passwordLoading.value = false
  }
}

// -- تنظیمات اعلان‌ها --
const { getPreferences, updatePreferences } = useNotificationPreferences()

const smsEnabled = ref<boolean | null>(null)
const telegramEnabled = ref<boolean | null>(null)
const prefsLoaded = ref(false)
const smsToggleLoading = ref(false)
const telegramToggleLoading = ref(false)

const telegramToggleDisabled = computed(() => {
  return !telegramLinked.value
})

async function loadNotificationPrefs() {
  if (!isDoctor.value || !userData.value?.id) {
    prefsLoaded.value = true
    return
  }
  try {
    const prefs = await getPreferences(userData.value.id)
    smsEnabled.value = prefs.smsEnabled
    telegramEnabled.value = prefs.telegramEnabled
  } catch {
    smsEnabled.value = userData.value?.smsEnabled ?? false
    telegramEnabled.value = userData.value?.telegramEnabled ?? false
  } finally {
    prefsLoaded.value = true
  }
}

async function togglePref(type: 'sms' | 'telegram', newValue: boolean) {
  if (!userData.value?.id) return

  const loadingRef = type === 'sms' ? smsToggleLoading : telegramToggleLoading
  loadingRef.value = true

  const prevSms = smsEnabled.value ?? false
  const prevTelegram = telegramEnabled.value ?? false
  const nextSms = type === 'sms' ? newValue : prevSms
  const nextTelegram = type === 'telegram' ? newValue : prevTelegram

  smsEnabled.value = nextSms
  telegramEnabled.value = nextTelegram

  try {
    const updated = await updatePreferences(userData.value.id, {
      smsEnabled: nextSms,
      telegramEnabled: nextTelegram,
    })
    smsEnabled.value = updated.smsEnabled
    telegramEnabled.value = updated.telegramEnabled
    if (authUser.value) {
      authUser.value = {
        ...authUser.value,
        smsEnabled: updated.smsEnabled,
        telegramEnabled: updated.telegramEnabled,
      }
    }
    toast.success(t('myProfile.notificationUpdated'))
  } catch (err: any) {
    smsEnabled.value = prevSms
    telegramEnabled.value = prevTelegram
    toast.error(err?.data?.error || t('myProfile.notificationUpdateError'))
  } finally {
    loadingRef.value = false
  }
}

// -- اتصال به ربات تلگرام --
const { generateLinkCode, getStatus, unlink: unlinkTelegram } = useTelegram()

const telegramLinked = ref(false)
const telegramData = ref<{ username: string | null; firstName: string | null } | null>(null)
const telegramState = ref<'idle' | 'code' | 'polling'>('idle')
const telegramError = ref<string | null>(null)
const linkCode = ref('')
const botUsername = ref<string | null>(null)
const codeLoading = ref(false)
const unlinkLoading = ref(false)
const codeExpiresAt = ref<number>(0)
const countdownDisplay = ref('')
const unlinkDialog = ref(false)
let countdownTimer: ReturnType<typeof setInterval> | null = null
let pollingTimer: ReturnType<typeof setInterval> | null = null
const codeCopied = ref(false)

const telegramDeepLink = computed(() => {
  console.log(linkCode)
  const username = botUsername.value || 'hastihosseini_bot'
  return `https://t.me/${username}?start=${linkCode.value}`
})

onBeforeUnmount(() => {
  clearTimers()
})

function clearTimers() {
  if (countdownTimer) { clearInterval(countdownTimer); countdownTimer = null }
  if (pollingTimer) { clearInterval(pollingTimer); pollingTimer = null }
}

async function checkTelegramStatus() {
  try {
    const status = await getStatus()
    telegramLinked.value = status.linked
    telegramData.value = status
    if (status.linked) {
      telegramState.value = 'idle'
      clearTimers()
    }
  } catch {
    // silently fail on initial check
  }
}

async function handleGenerateCode() {
  codeLoading.value = true
  telegramError.value = null
  try {
    const res = await generateLinkCode()
    linkCode.value = res.code
    botUsername.value = res.botUsername || 'hastihosseini_bot'
    codeExpiresAt.value = Date.now() + res.expires_in_minutes * 60 * 1000
    codeCopied.value = false
    telegramState.value = 'code'
    startCountdown()
    startPolling()
  } catch (err: any) {
    const status = err?.response?.status
    if (status === 409) {
      telegramError.value = t('myProfile.existingConnectionError')
    } else {
      telegramError.value = err?.data?.error || t('myProfile.generateCodeError')
    }
    telegramState.value = 'idle'
  } finally {
    codeLoading.value = false
  }
}

function startCountdown() {
  if (countdownTimer) clearInterval(countdownTimer)
  const update = () => {
    const remaining = Math.max(0, Math.floor((codeExpiresAt.value - Date.now()) / 1000))
    const minutes = Math.floor(remaining / 60)
    const seconds = remaining % 60
    countdownDisplay.value = `${minutes}:${seconds.toString().padStart(2, '0')}`
    if (remaining <= 0) {
      clearTimers()
      telegramError.value = t('myProfile.codeExpired')
      telegramState.value = 'idle'
    }
  }
  update()
  countdownTimer = setInterval(update, 1000)
}

function startPolling() {
  if (pollingTimer) clearInterval(pollingTimer)
  pollingTimer = setInterval(async () => {
    try {
      const status = await getStatus()
      if (status.linked) {
        telegramLinked.value = true
        telegramData.value = status
        telegramState.value = 'idle'
        clearTimers()
        toast.success(t('myProfile.connectedSuccess'))
      } else {
        telegramState.value = 'polling'
      }
    } catch {
      // continue polling
    }
  }, 5000)
}

function copyCode() {
  if (linkCode.value) {
    navigator.clipboard.writeText(linkCode.value)
    codeCopied.value = true
    setTimeout(() => { codeCopied.value = false }, 2000)
  }
}

function confirmUnlink() {
  unlinkDialog.value = true
}

async function handleUnlink() {
  unlinkLoading.value = true
  try {
    await unlinkTelegram()
    telegramLinked.value = false
    telegramData.value = null
    telegramState.value = 'idle'
    telegramEnabled.value = false
    unlinkDialog.value = false
    toast.success(t('myProfile.unlinkSuccess'))
  } catch (err: any) {
    if (err?.response?.status === 404) {
      toast.error(t('myProfile.telegramNotFound'))
    } else {
      toast.error(err?.data?.error || t('myProfile.telegramDisconnectError'))
    }
  } finally {
    unlinkLoading.value = false
  }
}

function resetTelegram() {
  clearTimers()
  telegramState.value = 'idle'
  telegramError.value = null
  linkCode.value = ''
  botUsername.value = null
  codeCopied.value = false
}

useSeoMeta({
  title: t('myProfile.titleSeo'),
  ogTitle: t('myProfile.title'),
})

definePageMeta({
  // Auth is handled globally by auth.global.ts middleware
})
</script>

<style scoped>
/* ── Identity hero ──────────────────────────────── */
.pf-hero {
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
  background: linear-gradient(140deg, #0e9a92 0%, #0b7c77 52%, #0a6764 100%);
  box-shadow: 0 24px 48px -20px rgba(11, 124, 119, 0.5);
  color: #ffffff;
}

.dark .pf-hero {
  background: linear-gradient(140deg, #0f7f78 0%, #0d615d 60%, rgba(9, 45, 44, 0.95) 100%);
}

.pf-hero__orb {
  position: absolute;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  pointer-events: none;
}

.pf-hero__orb--a {
  width: 16rem;
  height: 16rem;
  top: -6rem;
  inset-inline-end: -4rem;
}

.pf-hero__orb--b {
  width: 10rem;
  height: 10rem;
  bottom: -5rem;
  inset-inline-start: -3rem;
}

.pf-hero__inner {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.75rem 1.5rem;
}

@media (min-width: 640px) {
  .pf-hero__inner {
    padding: 2.25rem 2.25rem;
    gap: 1.5rem;
  }
}

.pf-hero__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4.5rem;
  height: 4.5rem;
  flex-shrink: 0;
  border-radius: 1.375rem;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.28);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.pf-hero__copy {
  min-width: 0;
}

.pf-hero__name {
  font-size: clamp(1.375rem, 3vw, 1.75rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.pf-hero__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  font-size: 0.8125rem;
  color: rgba(255, 255, 255, 0.85);
}

.pf-hero__pill {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

.pf-hero__pill--teal {
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.28);
  color: #fff;
}

.pf-hero__pill--green {
  background: rgba(48, 209, 88, 0.28);
  border: 1px solid rgba(48, 209, 88, 0.4);
  color: #fff;
}

.pf-hero__pill--indigo {
  background: rgba(147, 146, 248, 0.32);
  border: 1px solid rgba(155, 155, 255, 0.42);
  color: #fff;
}

.pf-hero__divider {
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

/* ── Cards (Apple inset grouped) ────────────────── */
.pf-card {
  position: relative;
  background: var(--asa-bg-card);
  border: 1px solid var(--asa-card-ring);
  border-radius: 1.375rem;
  box-shadow: var(--asa-card-shadow);
  color: var(--asa-label);
  overflow: hidden;
  transition: transform 220ms var(--ease-premium), box-shadow 220ms var(--ease-premium),
    border-color 220ms var(--ease-premium);
  animation: asa-rise 480ms var(--ease-premium) both;
}

@media (hover: hover) {
  .pf-card:hover {
    box-shadow: 0 2px 4px rgba(17, 24, 39, 0.04), 0 16px 32px -14px rgba(17, 24, 39, 0.2);
  }

  .dark .pf-card:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4), 0 22px 44px -22px rgba(0, 0, 0, 0.8);
  }
}

.pf-card--telegram {
  margin-top: 1.25rem;
}

.pf-card__head {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1.125rem 1.375rem;
  border-bottom: 1px solid var(--asa-sep);
  background: color-mix(in srgb, var(--asa-bg-card) 55%, transparent);
}

.pf-card__body {
  padding: 1.375rem;
}

.pf-stack > * + * {
  margin-top: 1rem;
}

/* ── Apple-styled Vuetify solo fields ───────────── */
.pf-field :deep(.v-field) {
  background-color: color-mix(in srgb, var(--asa-label) 5%, transparent);
  border-radius: 0.875rem;
  box-shadow: none;
  color: var(--asa-label);
}

.pf-field :deep(.v-field--focused) {
  background-color: color-mix(in srgb, var(--asa-label) 8%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--asa-accent) 18%, transparent);
}

.pf-field :deep(.v-field__overlay) {
  background: transparent;
}

.pf-field :deep(.v-field__input),
.pf-field :deep(.v-field__input::placeholder),
.pf-field :deep(.v-label) {
  color: var(--asa-label);
}

.pf-field :deep(.v-field__input::placeholder) {
  color: var(--asa-label-3);
}

.pf-field :deep(.v-icon) {
  color: var(--asa-label-2);
}

.pf-field :deep(.v-field--focused .v-icon) {
  color: var(--asa-accent);
}

/* Read-only phone field */
.pf-phone {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  border-radius: 1rem;
  border: 1px solid var(--asa-card-ring);
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
}

.pf-phone__num {
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.pf-lock {
  margin-inline-start: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  background: var(--asa-amber-soft);
  color: var(--asa-amber);
  font-size: 0.6875rem;
  font-weight: 600;
  cursor: help;
  white-space: nowrap;
}

/* ── Buttons ────────────────────────────────────── */
.pf-btn--block {
  width: 100%;
}

.pf-btn--lg {
  height: auto;
  padding: 0.875rem 1.75rem;
  border-radius: 1rem;
  font-size: 0.9375rem;
  font-weight: 700;
}

/* ── Tinted alerts ──────────────────────────────── */
.pf-alert {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  border-radius: 1.25rem;
  border: 1px solid transparent;
}

.pf-alert--green {
  background: var(--asa-green-soft);
  border-color: color-mix(in srgb, var(--asa-green) 28%, transparent);
}

.pf-alert--rose {
  background: var(--asa-rose-soft);
  border-color: color-mix(in srgb, var(--asa-rose) 26%, transparent);
}

.pf-alert__body {
  flex: 1 1 14rem;
  min-width: 0;
}

.pf-alert__title {
  font-size: 0.875rem;
  font-weight: 700;
  line-height: 1.4;
  color: var(--asa-label);
}

.pf-alert--green .pf-alert__title {
  color: var(--asa-green);
}

.pf-alert--rose .pf-alert__title {
  color: var(--asa-rose);
}

.pf-alert__desc {
  margin-top: 0.125rem;
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--asa-label-2);
}

/* ── Centered connect flows ─────────────────────── */
.pf-center {
  text-align: center;
  padding: 0.25rem 0;
}

.pf-center__icon {
  width: 4rem;
  height: 4rem;
  border-radius: 1.25rem;
  margin-inline: auto;
  margin-bottom: 1rem;
}

.pf-center__title {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--asa-label);
}

.pf-center__muted {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--asa-label);
}

.pf-center__desc {
  max-width: 26rem;
  margin: 0.5rem auto 1.25rem;
  font-size: 0.8125rem;
  line-height: 1.7;
  color: var(--asa-label-2);
}

.pf-center__cancel {
  margin-top: 1.25rem;
}

.pf-poll {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: min(100%, 22rem);
  margin: 1.25rem auto 0;
  padding: 0.8rem 1rem;
  border-radius: 1rem;
  background: var(--asa-accent-soft);
  border: 1px solid color-mix(in srgb, var(--asa-accent) 28%, transparent);
  color: var(--asa-label);
  font-size: 0.8125rem;
  font-weight: 600;
}

.pf-manual {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--asa-sep);
}

.pf-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  cursor: pointer;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label-2);
  transition: color 150ms var(--ease-default);
  list-style: none;
}

.pf-summary::-webkit-details-marker {
  display: none;
}

.pf-summary:hover {
  color: var(--asa-accent-deep);
}

.dark .pf-summary:hover {
  color: var(--asa-accent);
}

.pf-manual details[open] .pf-summary {
  margin-bottom: 0.875rem;
}

.pf-codebox {
  margin-top: 0.875rem;
  padding: 1rem;
  border-radius: 1rem;
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
  border: 1px solid var(--asa-card-ring);
  text-align: center;
}

.pf-codebox__hint {
  font-size: 0.75rem;
  color: var(--asa-label-2);
  margin-bottom: 0.75rem;
}

.pf-code {
  display: inline-block;
  padding: 0.625rem 1.25rem;
  border-radius: 1rem;
  background: color-mix(in srgb, var(--asa-label) 8%, transparent);
  border: 1px solid var(--asa-card-ring);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: var(--asa-label);
  user-select: all;
}

.pf-link {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.625rem;
  padding: 0.375rem 0.75rem;
  border-radius: 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--asa-accent-deep);
  transition: background-color 150ms var(--ease-default);
}

.dark .pf-link {
  color: var(--asa-accent);
}

.pf-link:hover {
  background: color-mix(in srgb, var(--asa-label) 6%, transparent);
}

.pf-codebox__note {
  margin-top: 0.625rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--asa-amber);
}

/* ── List rows (notification settings) ──────────── */
.pf-list {
  overflow: hidden;
}

.pf-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.875rem 1rem;
  border-radius: 1rem;
  transition: background-color 150ms var(--ease-default);
}

@media (hover: hover) {
  .pf-row:hover {
    background-color: color-mix(in srgb, var(--asa-label) 4%, transparent);
  }

  .dark .pf-row:hover {
    background-color: rgba(255, 255, 255, 0.04);
  }
}

.pf-list .pf-row + .pf-row {
  margin-top: 0.75rem;
}

.pf-row--disabled {
  opacity: 0.6;
}

.pf-row__main {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  min-width: 0;
  flex: 1 1 auto;
}

.pf-row__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--asa-label);
}

.pf-row__sub {
  margin-top: 0.125rem;
  font-size: 0.75rem;
  line-height: 1.4;
  color: var(--asa-label-2);
}

/* ── Dialog close ───────────────────────────────── */
.pf-x {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  color: var(--asa-label-2);
  transition: background-color 150ms var(--ease-default), color 150ms var(--ease-default);
}

.pf-x:hover {
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
  color: var(--asa-label);
}

/* ── Password field overrides ───────────────────── */
:deep(.ltr-field .v-field__input) {
  text-align: left !important;
  direction: ltr !important;
  font-family: ui-sans-serif, system-ui, sans-serif !important;
  /* بهتر است پسوردها فونت استاندارد انگلیسی داشته باشند */
  letter-spacing: 0.05em !important;
}

:deep(.ltr-field ::placeholder) {
  text-align: right !important;
  /* راست‌چین نگه داشتن placeholder در فرم‌های چپ‌چین */
  direction: rtl !important;
  opacity: 0.6 !important;
  font-family: inherit !important;
  letter-spacing: normal !important;
}

:deep(.v-field--disabled .v-field__input) {
  opacity: 0.6 !important;
}

:deep(.v-field--active) {
  box-shadow: 0 4px 12px -2px rgba(59, 130, 246, 0.1) !important;
  transition: box-shadow 0.2s ease-in-out !important;
}

@media (prefers-reduced-motion: reduce) {
  .pf-card {
    animation: none;
  }
}
</style>