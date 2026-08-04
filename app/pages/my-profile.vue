<template>
  <UiPageContainer>
    <UiPageHeader :title="$t('myProfile.title')" :subtitle="$t('myProfile.subtitle')" />

    <UiContentCard card-class="mb-8! p-6! md:p-8!">
      <div class="!flex !items-center !gap-6">
        <div
          class="!w-20 !h-20 !rounded-full !bg-gradient-to-tr !from-blue-600 !to-indigo-500 !p-1 !shadow-md !shrink-0">
          <div class="!w-full !h-full !rounded-full !bg-white dark:!bg-slate-900 !flex !items-center !justify-center">
            <span class="!text-3xl !font-bold !text-blue-600 dark:!text-blue-400">{{ userInitial }}</span>
          </div>
        </div>

        <div class="!flex !flex-col !min-w-0 !gap-1.5">
          <h2 class="!text-2xl !font-bold !text-slate-800 dark:!text-slate-100 !truncate">
            {{ userData?.fullName || t('myProfile.helloUser') }}
          </h2>
          <div class="!flex !items-center !gap-3 !text-sm">
            <v-chip size="small" color="primary" variant="flat" class="!font-bold !px-3">
              {{ roleLabel }}
            </v-chip>
            <span class="!text-slate-500 dark:!text-slate-400 !font-medium" dir="ltr">
              {{ userData?.phone }}
            </span>
          </div>
        </div>
      </div>
    </UiContentCard>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

      <div
        class="!bg-white dark:!bg-slate-800 !rounded-3xl !border !border-slate-200 dark:!border-slate-700 !shadow-sm !overflow-hidden !transition-all !duration-300 hover:!shadow-md">
        <div
          class="!px-8 !py-6 !border-b !border-slate-100 dark:!border-slate-700/80 !bg-slate-50/50 dark:!bg-slate-800/50">
          <div class="!flex !items-center !gap-3">
            <v-icon color="primary" size="x-large">mdi-account-details-outline</v-icon>
            <div>
              <h2 class="!text-lg !font-bold !text-slate-800 dark:!text-slate-100">{{ t('myProfile.identityInfo') }}</h2>
              <p class="!text-xs !text-slate-500 dark:!text-slate-400 !mt-1">{{ t('myProfile.identityInfoDesc') }}
              </p>
            </div>
          </div>
        </div>

        <div class="!p-8">
          <v-form ref="profileFormRef" @submit.prevent="handleUpdateProfile">
            <v-text-field v-model="profileForm.fullName" :label="$t('myProfile.fullName')" variant="outlined"
              density="comfortable" prepend-inner-icon="mdi-account-edit-outline"
              :rules="[v => !v || v.length >= 2 || t('myProfile.fullNameMinError')]" class="!mb-2" dir="rtl" clearable />

            <v-text-field v-if="isLabOrPharmacy" v-model="profileForm.organizationName" :label="$t('myProfile.organizationName')"
              variant="outlined" density="comfortable" prepend-inner-icon="mdi-domain"
              :rules="[v => !v || v.length >= 1 || t('myProfile.organizationMinError')]" class="!mb-2" dir="rtl" clearable />

            <div class="!mb-6">
              <label class="!text-sm !font-semibold !text-slate-600 dark:!text-slate-300 !mb-2 !block">{{ t('myProfile.mobileLabel') }}</label>
              <div
                class="!flex !items-center !gap-4 !px-5 !py-4 !rounded-xl !bg-slate-100 dark:!bg-slate-900/50 !border !border-slate-200 dark:!border-slate-700">
                <v-icon class="!text-slate-500">mdi-cellphone</v-icon>
                <span dir="ltr" class="!text-base !font-bold !text-slate-800 dark:!text-slate-200 !tracking-widest">
                  {{ userData?.phone || '---' }}
                </span>
                <v-tooltip :text="$t('myProfile.phoneTooltip')" location="top">
                  <template v-slot:activator="{ props }">
                    <v-chip v-bind="props" size="small" color="grey" variant="tonal"
                      class="!mr-auto !text-xs !font-bold !cursor-help">
                      <v-icon start icon="mdi-lock-outline" size="small"></v-icon>
                      {{ t('myProfile.immutable') }}
                    </v-chip>
                  </template>
                </v-tooltip>
              </div>
            </div>

            <v-btn type="submit" color="primary" size="x-large" block elevation="2" :loading="profileLoading"
              class="!font-bold !tracking-wide !rounded-xl !mt-2">
              <v-icon start>mdi-check-circle-outline</v-icon>
              {{ t('myProfile.saveProfile') }}
            </v-btn>
          </v-form>
        </div>
      </div>

      <div
        class="!bg-white dark:!bg-slate-800 !rounded-3xl !border !border-slate-200 dark:!border-slate-700 !shadow-sm !overflow-hidden !transition-all !duration-300 hover:!shadow-md">
        <div
          class="!px-8 !py-6 !border-b !border-slate-100 dark:!border-slate-700/80 !bg-slate-50/50 dark:!bg-slate-800/50">
          <div class="!flex !items-center !gap-3">
            <v-icon color="error" size="x-large">mdi-shield-lock-outline</v-icon>
            <div>
              <h2 class="!text-lg !font-bold !text-slate-800 dark:!text-slate-100">{{ t('myProfile.security') }}</h2>
              <p class="!text-xs !text-slate-500 dark:!text-slate-400 !mt-1">{{ t('myProfile.securityDesc') }}</p>
            </div>
          </div>
        </div>

        <div class="!p-8">
          <v-form ref="passwordFormRef" @submit.prevent="handleChangePassword">
            <v-text-field v-model="passwordForm.currentPassword" :label="$t('myProfile.currentPassword')"
              :type="showCurrentPassword ? 'text' : 'password'" variant="outlined" density="comfortable"
              prepend-inner-icon="mdi-lock-outline" :append-inner-icon="showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showCurrentPassword = !showCurrentPassword"
              :rules="[v => !!v || t('myProfile.currentPasswordRequired')]" class="ltr-field !mb-2" />

            <v-text-field v-model="passwordForm.newPassword" :label="$t('myProfile.newPassword')"
              :type="showNewPassword ? 'text' : 'password'" variant="outlined" density="comfortable"
              prepend-inner-icon="mdi-lock-plus-outline"
              :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showNewPassword = !showNewPassword" :rules="[
                v => !!v || t('myProfile.newPasswordRequired'),
                v => (v && v.length >= 8) || t('myProfile.passwordMinError')
              ]" class="ltr-field !mb-2" />

            <v-text-field v-model="passwordForm.confirmPassword" :label="$t('myProfile.confirmPassword')"
              :type="showConfirmPassword ? 'text' : 'password'" variant="outlined" density="comfortable"
              prepend-inner-icon="mdi-lock-check-outline"
              :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showConfirmPassword = !showConfirmPassword" :rules="[
                v => !!v || t('myProfile.confirmPasswordRequired'),
                v => v === passwordForm.newPassword || t('myProfile.passwordMismatch')
              ]" class="ltr-field !mb-6" />

            <v-btn type="submit" color="error" size="x-large" block elevation="2" variant="flat"
              :loading="passwordLoading" class="!font-bold !tracking-wide !rounded-xl">
              <v-icon start>mdi-key-variant</v-icon>
              {{ t('myProfile.changePassword') }}
            </v-btn>
          </v-form>
        </div>
      </div>

    </div>

    <div v-if="isDoctor"
      class="!bg-white dark:!bg-slate-800 !rounded-3xl !border !border-slate-200 dark:!border-slate-700 !shadow-sm !overflow-hidden !transition-all !duration-300 hover:!shadow-md !mt-8">
      <div
        class="!px-8 !py-6 !border-b !border-slate-100 dark:!border-slate-700/80 !bg-slate-50/50 dark:!bg-slate-800/50">
        <div class="!flex !items-center !gap-3">
          <v-icon color="primary" size="x-large">mdi-bell-ring-outline</v-icon>
          <div>
              <h2 class="!text-lg !font-bold !text-slate-800 dark:!text-slate-100">{{ t('myProfile.notifications') }}</h2>
              <p class="!text-xs !text-slate-500 dark:!text-slate-400 !mt-1">{{ t('myProfile.notificationsDesc') }}</p>
          </div>
        </div>
      </div>

      <div class="!p-8">
        <div v-if="!prefsLoaded" class="!space-y-4">
          <div v-for="i in 2" :key="i" class="!flex !items-center !gap-4 !p-4 !rounded-xl !bg-slate-50 dark:!bg-slate-900/30 !animate-pulse">
            <div class="!w-10 !h-10 !rounded-full !bg-slate-200 dark:!bg-slate-700"></div>
            <div class="!flex-1 !space-y-2">
              <div class="!h-4 !w-28 !rounded !bg-slate-200 dark:!bg-slate-700"></div>
              <div class="!h-3 !w-44 !rounded !bg-slate-100 dark:!bg-slate-800"></div>
            </div>
            <div class="!w-10 !h-6 !rounded-full !bg-slate-200 dark:!bg-slate-700"></div>
          </div>
        </div>

        <div v-else class="!space-y-3">
          <div class="!flex !items-center !justify-between !gap-4 !p-4 !rounded-xl !border !border-slate-200 dark:!border-slate-700 !transition-all !duration-200 hover:!border-blue-300 dark:hover:!border-blue-700 hover:!shadow-sm">
            <div class="!flex !items-center !gap-3">
              <div class="!w-10 !h-10 !rounded-full !bg-blue-50 dark:!bg-blue-900/30 !flex !items-center !justify-center !shrink-0">
                <v-icon color="primary" size="22">mdi-message-text-outline</v-icon>
              </div>
              <div>
                <p class="!font-bold !text-slate-800 dark:!text-slate-100">{{ t('myProfile.smsNotifications') }}</p>
                <p class="!text-xs !text-slate-500 dark:!text-slate-400">{{ t('myProfile.smsNotificationsDesc') }}</p>
              </div>
            </div>
            <v-switch
              :model-value="smsEnabled"
              color="primary"
              hide-details
              :loading="smsToggleLoading"
              @update:model-value="(val: boolean) => togglePref('sms', val)"
            />
          </div>

          <div class="!flex !items-center !justify-between !gap-4 !p-4 !rounded-xl !border !border-slate-200 dark:!border-slate-700 !transition-all !duration-200 hover:!border-sky-300 dark:hover:!border-sky-700 hover:!shadow-sm"
            :class="{ '!opacity-60': telegramToggleDisabled }">
            <div class="!flex !items-center !gap-3">
              <div class="!w-10 !h-10 !rounded-full !bg-sky-50 dark:!bg-sky-900/30 !flex !items-center !justify-center !shrink-0">
                <v-icon color="info" size="22">mdi-send-variant-outline</v-icon>
              </div>
              <div>
                <p class="!font-bold !text-slate-800 dark:!text-slate-100">{{ t('myProfile.telegramNotifications') }}</p>
                <p class="!text-xs !text-slate-500 dark:!text-slate-400">{{ t('myProfile.telegramNotificationsDesc') }}</p>
              </div>
            </div>
            <v-tooltip v-if="telegramToggleDisabled" :text="$t('myProfile.connectTelegramFirst')" location="top">
              <template v-slot:activator="{ props }">
                <div v-bind="props">
                  <v-switch
                    :model-value="telegramEnabled"
                    color="info"
                    hide-details
                    disabled
                    :loading="telegramToggleLoading"
                  />
                </div>
              </template>
            </v-tooltip>
            <v-switch
              v-else
              :model-value="telegramEnabled"
              color="info"
              hide-details
              :loading="telegramToggleLoading"
              @update:model-value="(val: boolean) => togglePref('telegram', val)"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      class="!bg-white dark:!bg-slate-800 !rounded-3xl !border !border-slate-200 dark:!border-slate-700 !shadow-sm !overflow-hidden !transition-all !duration-300 hover:!shadow-md !mt-8">
      <div
        class="!px-8 !py-6 !border-b !border-slate-100 dark:!border-slate-700/80 !bg-slate-50/50 dark:!bg-slate-800/50">
        <div class="!flex !items-center !gap-3">
          <v-icon color="primary" size="x-large">mdi-send-variant-outline</v-icon>
          <div>
            <h2 class="!text-lg !font-bold !text-slate-800 dark:!text-slate-100">{{ t('myProfile.telegramConnection') }}</h2>
            <p class="!text-xs !text-slate-500 dark:!text-slate-400 !mt-1">{{ t('myProfile.telegramConnectionDesc') }}
            </p>
          </div>
        </div>
      </div>

      <div class="!p-8">

        <div v-if="telegramLinked">
          <div class="!flex !items-center !gap-4 !p-4 !rounded-xl !bg-green-50 dark:!bg-green-900/20 !border !border-green-200 dark:!border-green-700/50">
            <div class="!w-12 !h-12 !rounded-full !bg-green-100 dark:!bg-green-800/50 !flex !items-center !justify-center !shrink-0">
              <v-icon color="success" size="28">mdi-check-circle</v-icon>
            </div>
            <div class="!flex-1 !min-w-0">
              <p class="!font-bold !text-green-800 dark:!text-green-200">
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
              <p class="!text-xs !text-green-600 dark:!text-green-400 !mt-0.5">{{ t('myProfile.connectedDesc') }}</p>
            </div>
            <v-btn color="error" variant="tonal" size="small" @click="confirmUnlink">
              <v-icon start size="small">mdi-link-variant-off</v-icon>
              {{ t('myProfile.unlinkButton') }}
            </v-btn>
          </div>
        </div>

        <div v-else-if="telegramState === 'code' || telegramState === 'polling'">
          <div class="!text-center !py-4">
            <div class="!w-16 !h-16 !rounded-full !bg-sky-50 dark:!bg-sky-900/30 !flex !items-center !justify-center !mx-auto !mb-4">
              <v-icon color="info" size="32">mdi-telegram</v-icon>
            </div>
            
            <h3 class="!text-lg !font-bold !text-slate-800 dark:!text-slate-100 !mb-2">
              {{ t('myProfile.oneClickConnect') }}
            </h3>
            <p class="!text-sm !text-slate-500 dark:!text-slate-400 !max-w-md !mx-auto !mb-6">
              {{ t('myProfile.oneClickDesc') }}
            </p>

            <!-- 1-Click Telegram Button -->
            <div class="!mb-6">
              <v-btn
                :href="telegramDeepLink"
                target="_blank"
                color="info"
                size="x-large"
                elevation="3"
                class="!font-bold !rounded-2xl !px-8 !py-4 !h-auto !text-base"
                @click="telegramState = 'polling'"
              >
                <v-icon start size="28">mdi-telegram</v-icon>
                {{ t('myProfile.openTelegramBot') }}
              </v-btn>
            </div>

            <!-- Polling Indicator -->
            <div v-if="telegramState === 'polling'" class="!flex !items-center !justify-center !gap-3 !mb-6 !bg-blue-50 dark:!bg-blue-900/20 !border !border-blue-200 dark:!border-blue-700/50 !rounded-xl !p-4 !max-w-md !mx-auto">
              <v-progress-circular indeterminate color="primary" size="24" width="3" />
              <span class="!text-sm !font-semibold !text-blue-700 dark:!text-blue-300">{{ t('myProfile.waitConfirmation') }}</span>
            </div>

            <!-- Alternative Manual Code Details -->
            <div class="!mt-8 !pt-6 !border-t !border-slate-100 dark:!border-slate-700/80 !text-left" dir="rtl">
              <details class="!group">
                <summary class="!cursor-pointer !text-xs !font-semibold !text-slate-500 dark:!text-slate-400 hover:!text-blue-600 dark:hover:!text-blue-400 !flex !items-center !gap-1 !justify-center">
                  <v-icon size="small">mdi-code-braces</v-icon>
                  {{ t('myProfile.advancedManualCode') }}
                </summary>
                <div class="!mt-4 !bg-slate-50 dark:!bg-slate-900/50 !rounded-xl !p-4 !text-center">
                  <p class="!text-xs !text-slate-500 dark:!text-slate-400 !mb-2">{{ t('myProfile.enterCodePrompt') }}</p>
                  <div class="!inline-block !bg-white dark:!bg-slate-950 !border !border-slate-200 dark:!border-slate-700 !rounded-xl !px-6 !py-3 !tracking-[0.2em] !font-mono !text-2xl !font-bold !text-blue-600 dark:!text-blue-400 !select-all !mb-3">
                    {{ linkCode }}
                  </div>
                  <div>
                    <v-btn size="small" variant="text" color="primary" @click="copyCode">
                      <v-icon start size="small">{{ codeCopied ? 'mdi-check' : 'mdi-content-copy' }}</v-icon>
                      {{ codeCopied ? t('common.copied') : t('common.copy') }}
                    </v-btn>
                  </div>
                  <p class="!text-xs !text-orange-500 dark:!text-orange-400 !mt-2">
                    {{ t('myProfile.codeValidStill', { minutes: countdownDisplay }) }}
                  </p>
                </div>
              </details>
            </div>

            <div class="!mt-6">
              <v-btn variant="text" color="grey" size="small" @click="resetTelegram">
                <v-icon start size="small">mdi-close</v-icon>
                {{ $t('common.cancel') }}
              </v-btn>
            </div>
          </div>
        </div>

        <div v-else-if="telegramError">
          <div
            class="!flex !items-center !gap-4 !p-4 !rounded-xl !bg-red-50 dark:!bg-red-900/20 !border !border-red-200 dark:!border-red-700/50">
            <v-icon color="error" size="28">mdi-alert-circle-outline</v-icon>
            <div class="!flex-1">
              <p class="!font-bold !text-red-700 dark:!text-red-300">{{ t('myProfile.connectionError') }}</p>
              <p class="!text-xs !text-red-500 dark:!text-red-400 !mt-0.5">{{ telegramError }}</p>
            </div>
            <v-btn color="error" variant="tonal" size="small" @click="resetTelegram">
              {{ $t('common.retry') }}
            </v-btn>
          </div>
        </div>

        <div v-else>
          <div class="!text-center !py-4">
            <div class="!w-16 !h-16 !rounded-full !bg-blue-50 dark:!bg-blue-900/30 !flex !items-center !justify-center !mx-auto !mb-4">
              <v-icon color="primary" size="32">mdi-send-variant-outline</v-icon>
            </div>
            <p class="!text-slate-600 dark:!text-slate-300 !font-medium !mb-1">{{ t('myProfile.notConnected') }}</p>
            <p class="!text-xs !text-slate-400 dark:!text-slate-500 !mb-6">{{ t('myProfile.connectDescription') }}</p>
            <v-btn color="primary" size="large" elevation="2" :loading="codeLoading" @click="handleGenerateCode"
              class="!font-bold !rounded-xl !px-8">
              <v-icon start>mdi-send-variant-outline</v-icon>
              {{ t('myProfile.connectButton') }}
            </v-btn>
          </div>
        </div>

      </div>
    </div>

    <v-dialog v-model="unlinkDialog" max-width="420" persistent>
      <v-card class="!rounded-2xl !text-center !pa-6">
        <div class="!w-14 !h-14 !rounded-full !bg-red-50 dark:!bg-red-900/30 !flex !items-center !justify-center !mx-auto !mb-4">
          <v-icon color="error" size="28">mdi-link-variant-off</v-icon>
        </div>
        <v-card-title class="!text-lg !font-bold !text-slate-800 dark:!text-slate-100 !justify-center !px-0 !pt-0">
          {{ t('myProfile.unlinkTitle') }}
        </v-card-title>
        <v-card-text class="!text-sm !text-slate-500 dark:!text-slate-400 !px-0 !pb-2">
          {{ t('myProfile.unlinkConfirm') }}
        </v-card-text>
        <v-card-actions class="!justify-center !gap-3 !px-0 !pb-0 !pt-2">
          <v-btn variant="outlined" color="grey" size="large" @click="unlinkDialog = false" class="!rounded-xl !px-6">
            {{ $t('common.cancel') }}
          </v-btn>
          <v-btn color="error" size="large" :loading="unlinkLoading" @click="handleUnlink" class="!rounded-xl !px-6">
            <v-icon start size="small">mdi-link-variant-off</v-icon>
            {{ t('myProfile.unlinkButton') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from 'vue'

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
  const username = botUsername.value || 'doctor_hosseini_bot'
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
    botUsername.value = res.botUsername || 'doctor_hosseini_bot'
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
/* استفاده از important برای غلبه بر استایل‌های داخلی Vuetify */
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

/* نرم کردن فوکوس اینپوت‌های Vuetify برای ظاهر مدرن‌تر */
:deep(.v-field--active) {
  box-shadow: 0 4px 12px -2px rgba(59, 130, 246, 0.1) !important;
  transition: box-shadow 0.2s ease-in-out !important;
}
</style>