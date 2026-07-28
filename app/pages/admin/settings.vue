<template>
  <UiPageContainer>
    <UiPageHeader :title="$t('adminSettings.title')" :subtitle="$t('adminSettings.subtitle')">
      <template #actions>
        <v-chip size="small" color="indigo" variant="tonal" prepend-icon="mdi-shield-lock">
          {{ $t('adminSettings.adminOnly') }}
        </v-chip>
      </template>
    </UiPageHeader>

    <div class="space-y-6!">
      <!-- ═══ SMS Credit ═══ -->
      <UiContentCard>
        <div class="crm-card-header">
          <div class="flex items-center! gap-3">
            <div class="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <v-icon icon="mdi-message-text" size="20" />
            </div>
            <div>
              <h3 class="text-sm font-semibold text-slate-800">{{ $t('adminSettings.smsCredit') }}</h3>
              <p class="text-xs text-slate-400">{{ $t('adminSettings.smsCreditDesc') }}</p>
            </div>
          </div>
        </div>

        <div v-if="loading" class="text-center py-8">
          <v-progress-circular indeterminate color="#4F46E5" size="32" />
        </div>

        <div v-else class="space-y-6 px-10! py-3!">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div class="bg-slate-50 rounded-xl p-4 text-center py-2!">
              <p class="text-2xl font-bold text-indigo-600" dir="ltr">{{ fmt(smsStats.remaining) }}</p>
              <p class="text-xs text-slate-500 mt-1">{{ $t('adminSettings.remaining') }}</p>
            </div>
            <div class="bg-slate-50 rounded-xl p-4 text-center py-2!">
              <p class="text-2xl font-bold text-slate-700" dir="ltr">{{ fmt(smsStats.sent) }}</p>
              <p class="text-xs text-slate-500 mt-1">{{ $t('adminSettings.sent') }}</p>
            </div>
            <div class="bg-slate-50 rounded-xl p-4 text-center py-2!">
              <p class="text-2xl font-bold text-slate-700" dir="ltr">{{ fmt(smsStats.total) }}</p>
              <p class="text-xs text-slate-500 mt-1">{{ $t('adminSettings.totalCredit') }}</p>
            </div>
          </div>

          <div class="my-4!">
            <div class="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>{{ $t('adminSettings.percentRemaining') }}</span>
              <span>{{ smsPercent }}%</span>
            </div>
            <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div class="h-full rounded-full transition-all duration-500"
                :class="smsPercent > 20 ? 'bg-indigo-600' : smsPercent > 5 ? 'bg-amber-500' : 'bg-rose-500'"
                :style="{ width: smsPercent + '%' }" />
            </div>
          </div>

          <div class="border-t border-slate-100 py-3! flex justify-between align-middle items-center">
            <label class="text-sm font-medium text-slate-700 mb-3 block">{{ $t('adminSettings.setNewCredit') }}</label>
            <div class="flex gap-4 justify-between align-middle items-center">
              <v-text-field v-model="newCredit" type="number" min="0" :label="$t('adminSettings.smsCount')" variant="outlined"
                density="compact" hide-details="auto" class="max-w-xs" bg-color="white" />
              <v-btn color="#4F46E5" variant="flat" size="small" class="rounded-lg px-6"
                :disabled="saving || newCredit === ''" :loading="saving" @click="saveCredit">
                {{ $t('common.save') }}
              </v-btn>
            </div>
          </div>

          <div class="border-t border-slate-100 py-3! flex justify-between align-middle items-center">
            <label class="text-sm font-medium text-slate-700 mb-3 block">{{ $t('adminSettings.quickIncrease') }}</label>
            <div class="flex flex-wrap gap-2">
              <v-btn v-for="amount in [100, 500, 1000, 2000, 5000]" :key="amount" variant="tonal" size="small"
                class="rounded-lg" :disabled="saving" @click="addCredit(amount)">
                +{{ fmt(amount) }}
              </v-btn>
            </div>
          </div>

          <div class="border-t border-slate-100 py-3!">
            <div class="flex items-center justify-between p-4 bg-slate-50 rounded-xl px-5! py-2 overflow-hidden">
              <div>
                <p class="text-sm font-medium text-slate-700">{{ $t('adminSettings.smsSending') }}</p>
                <p class="text-xs text-slate-400">{{ $t('adminSettings.smsSendingDesc') }}</p>
              </div>
              <v-switch v-model="smsEnabled" color="#4F46E5" density="compact" hide-details :loading="savingEnabled"
                @update:model-value="(val: any) => toggleSmsEnabled(val === true)" />
            </div>
          </div>
        </div>
      </UiContentCard>

      <!-- ═══ Notification Settings by Category ═══ -->
      <UiContentCard v-for="cat in categories" :key="cat.key">
        <div class="crm-card-header">
          <div class="flex items-center gap-3">
            <div class="p-2! rounded-xl" :class="cat.bgClass">
              <v-icon :icon="cat.icon" size="20" :class="cat.iconClass" />
            </div>
            <div>
              <h3 class="text-sm font-semibold text-slate-800">{{ cat.label }}</h3>
              <p class="text-xs text-slate-400">{{ cat.description }}</p>
            </div>
          </div>
        </div>

        <div class="divide-y divide-slate-100 pl-8 pr-6">
          <div v-for="event in eventsByCategory(cat.key)" :key="event.key"
            class="flex items-center justify-between py-4 first:pt-0 last:pb-0">
            <div class="flex-1 min-w-0 ms-4">
              <div class="flex items-center gap-2">
                <p class="text-sm font-medium text-slate-700">{{ event.label }}</p>
                <v-chip v-if="event.critical" size="x-small" color="amber" variant="tonal">{{ $t('adminSettings.criticalLabel') }}</v-chip>
              </div>
              <p class="text-xs text-slate-400 mt-0.5">{{ event.description }}</p>
            </div>

            <div class="flex items-center gap-6 shrink-0">
              <!-- SMS toggle -->
              <div v-if="event.channels.includes('sms')" class="flex items-center gap-2">
                <v-icon icon="mdi-cellphone" size="16" class="text-slate-400" />
                <v-switch v-model="event.sms" color="#4F46E5" density="compact" hide-details
                  :disabled="event.critical && event.key === 'auth_otp'"
                  @update:model-value="(val: any) => toggleEvent(event.key, 'sms', val === true)" />
              </div>

              <!-- Telegram toggle -->
              <div v-if="event.channels.includes('telegram')" class="flex items-center gap-2">
                <v-icon icon="mdi-telegram" size="16" class="text-blue-400" />
                <v-switch v-model="event.telegram" color="#4F46E5" density="compact" hide-details
                  @update:model-value="(val: any) => toggleEvent(event.key, 'telegram', val === true)" />
              </div>
            </div>
          </div>
        </div>
      </UiContentCard>

      <!-- ═══ Quick Controls ═══ -->
      <UiContentCard>
        <div class="crm-card-header">
          <div class="flex items-center gap-3">
            <div class="p-2.5 rounded-xl bg-rose-50 text-rose-600">
              <v-icon icon="mdi-lightning-bolt" size="20" />
            </div>
            <div>
              <h3 class="text-sm font-semibold text-slate-800">{{ $t('adminSettings.quickControl') }}</h3>
              <p class="text-xs text-slate-400">{{ $t('adminSettings.quickControlDesc') }}</p>
            </div>
          </div>
        </div>

        <div class="flex flex-wrap gap-3 px-5 pb-3">
          <v-btn variant="tonal" size="small" class="rounded-lg" :disabled="savingBulk" @click="toggleAll(true, true)">
            <v-icon icon="mdi-check-all" size="16" class="ms-1 pl-2" />
            {{ $t('adminSettings.enableAllSms') }}
          </v-btn>
          <v-btn variant="tonal" size="small" class="rounded-lg" :disabled="savingBulk" @click="toggleAll(true, false)">
            <v-icon icon="mdi-close-box-multiple" size="16" class="ms-1 pl-2" />
            {{ $t('adminSettings.disableAllSms') }}
          </v-btn>
          <v-btn variant="tonal" size="small" class="rounded-lg" :disabled="savingBulk" @click="toggleAll(false, true)">
            <v-icon icon="mdi-check-all" size="16" class="ms-1 pl-2" />
            {{ $t('adminSettings.enableAllTelegram') }}
          </v-btn>
          <v-btn variant="tonal" size="small" class="rounded-lg" :disabled="savingBulk"
            @click="toggleAll(false, false)">
            <v-icon icon="mdi-close-box-multiple" size="16" class="ms-1 pl-2" />
            {{ $t('adminSettings.disableAllTelegram') }}
          </v-btn>
        </div>
      </UiContentCard>
    </div>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { useApi } from '~/composables/useApi'

const { apiFetch } = useApi()
const { $toast } = useNuxtApp()
const { t } = useI18n()

const loading = ref(true)
const saving = ref(false)
const savingEnabled = ref(false)
const savingBulk = ref(false)

const smsStats = ref({ remaining: 0, sent: 0, total: 0 })
const newCredit = ref<number | string>('')
const smsEnabled = ref(true)

interface NotificationEventUI {
  key: string
  label: string
  description: string
  category: string
  channels: string[]
  critical: boolean
  sms: boolean
  telegram: boolean
}

const events = ref<NotificationEventUI[]>([])

const categories = computed(() => [
  { key: 'auth', label: t('adminSettings.categories.auth'), description: t('adminSettings.categories.authDesc'), icon: 'mdi-shield-lock', bgClass: 'bg-blue-50', iconClass: 'text-blue-600' },
  { key: 'patient', label: t('adminSettings.categories.patient'), description: t('adminSettings.categories.patientDesc'), icon: 'mdi-account-group', bgClass: 'bg-green-50', iconClass: 'text-green-600' },
  { key: 'appointment', label: t('adminSettings.categories.appointment'), description: t('adminSettings.categories.appointmentDesc'), icon: 'mdi-calendar-clock', bgClass: 'bg-orange-50', iconClass: 'text-orange-600' },
  { key: "messaging", label: t('adminSettings.categories.messaging'), description: t('adminSettings.categories.messagingDesc'), icon: 'mdi-message-text', bgClass: 'bg-purple-50', iconClass: 'text-purple-600' },
])

const smsPercent = computed(() => {
  if (smsStats.value.total === 0) return 0
  return Math.round((smsStats.value.remaining / smsStats.value.total) * 100)
})

function fmt(n: number): string {
  return new Intl.NumberFormat('fa-IR').format(n)
}

function eventsByCategory(catKey: string) {
  return events.value.filter((e) => e.category === catKey)
}

async function fetchSettings() {
  loading.value = true
  try {
    const [statsRes, enabledRes, notifRes] = await Promise.all([
      apiFetch<any>('/api/settings/sms-stats'),
      apiFetch<any>('/api/settings/sms_enabled'),
      apiFetch<any>('/api/settings/notifications/all'),
    ])
    if (statsRes.success) {
      smsStats.value = statsRes.data
      newCredit.value = smsStats.value.total
    }
    if (enabledRes.success) {
      smsEnabled.value = enabledRes.data.value === 'true'
    }
    if (notifRes.success) {
      events.value = notifRes.data
    }
  } catch {
    $toast.error(t('adminSettings.fetchError'))
  } finally {
    loading.value = false
  }
}

async function saveCredit() {
  if (newCredit.value === '' || Number(newCredit.value) < 0) return
  saving.value = true
  try {
    const oldTotal = smsStats.value.total
    const newTotal = Number(newCredit.value)
    const diff = newTotal - oldTotal
    await apiFetch('/api/settings/sms_credit', {
      method: 'PUT',
      body: { value: String(newTotal), description: t('adminSettings.smsRemainingDesc') },
    })
    if (diff !== 0) {
      const newSent = Math.max(0, smsStats.value.sent + diff)
      await apiFetch('/api/settings/sms_sent', {
        method: 'PUT',
        body: { value: String(newSent), description: t('adminSettings.smsSentDesc') },
      })
    }
    $toast.success(t('adminSettings.creditUpdated'))
    await fetchSettings()
  } catch {
    $toast.error(t('adminSettings.saveError'))
  } finally {
    saving.value = false
  }
}

async function addCredit(amount: number) {
  saving.value = true
  try {
    const current = smsStats.value.total + amount
    await apiFetch('/api/settings/sms_credit', {
      method: 'PUT',
      body: { value: String(current), description: t('adminSettings.smsRemainingDesc') },
    })
    $toast.success(t('adminSettings.creditsAdded', { count: fmt(amount) }))
    await fetchSettings()
  } catch {
    $toast.error(t('adminSettings.generalError'))
  } finally {
    saving.value = false
  }
}

async function toggleSmsEnabled(val: boolean) {
  savingEnabled.value = true
  try {
    await apiFetch('/api/settings/sms_enabled', {
      method: 'PUT',
      body: { value: String(val), description: t('adminSettings.smsEnabledDesc') },
    })
    $toast.success(val ? t('adminSettings.smsEnabled') : t('adminSettings.smsDisabled'))
  } catch {
    smsEnabled.value = !val
    $toast.error(t('adminSettings.generalError'))
  } finally {
    savingEnabled.value = false
  }
}

async function toggleEvent(eventKey: string, channel: string, enabled: boolean) {
  try {
    await apiFetch(`/api/settings/notifications/${eventKey}`, {
      method: 'PUT',
      body: { channel, enabled },
    })
    const label = channel === 'sms' ? t('adminSettings.smsSettings') : 'Telegram'
    $toast.success(enabled ? t('adminSettings.channelEnabled', { channel: label }) : t('adminSettings.channelDisabled', { channel: label }))
  } catch {
    $toast.error(t('adminSettings.toggleError'))
    await fetchSettings()
  }
}

async function toggleAll(isSms: boolean, enabled: boolean) {
  savingBulk.value = true
  try {
    const channel = isSms ? 'sms' : 'telegram'
    const settings = events.value
      .filter((e) => e.channels.includes(channel))
      .map((e) => ({ eventKey: e.key, channel, enabled }))
    await apiFetch('/api/settings/notifications', {
      method: 'PUT',
      body: { settings },
    })
    const label = isSms ? t('adminSettings.smsSettings') : 'Telegram'
    $toast.success(t('adminSettings.toggleAllSuccess', { channel: label, status: enabled ? t('common.active') : t('common.inactive') }))
    await fetchSettings()
  } catch {
    $toast.error(t('adminSettings.generalError'))
  } finally {
    savingBulk.value = false
  }
}

onMounted(fetchSettings)

useSeoMeta({ title: t('adminSettings.titleSeo') })
</script>
