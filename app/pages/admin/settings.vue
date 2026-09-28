<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- ═══ Access gate — non-managers never fire doomed requests ═══ -->
    <template v-if="!isAdmin">
      <header class="dash-head">
        <div class="dash-head__copy">
          <h1 class="dash-head__title">{{ t('adminSettings.title') }}</h1>
          <p class="dash-head__date">{{ t('adminSettings.subtitle') }}</p>
        </div>
      </header>

      <div class="asa-card pf-empty">
        <div class="asa-tint asa-tint--rose pf-tint-lg">
          <Security class="w-6! h-6! fill-current" />
        </div>
        <div>
          <p class="pf-empty__title">{{ t('adminSettings.deniedTitle') }}</p>
          <p class="pf-empty__desc">{{ t('adminSettings.deniedDesc') }}</p>
        </div>
        <div class="pf-empty__actions">
          <NuxtLink to="/dashboard" class="asa-btn asa-btn--ghost asa-btn--sm">
            <v-icon size="16">mdi-home-outline</v-icon>
            <span>{{ t('dashboard.title') }}</span>
          </NuxtLink>
        </div>
      </div>
    </template>

    <template v-else>
      <!-- ═══ Header ═══ -->
      <header class="dash-head">
        <div class="dash-head__copy">
          <h1 class="dash-head__title">{{ t('adminSettings.title') }}</h1>
          <p class="dash-head__date">{{ t('adminSettings.subtitle') }}</p>
        </div>
        <div class="dash-head__actions">
          <span class="asa-pill asa-pill--indigo">
            <Security class="w-3! h-3! fill-current" />
            {{ t('adminSettings.adminOnly') }}
          </span>
          <button
class="asa-btn asa-btn--ghost" :disabled="loading" :aria-label="t('adminSettings.refresh')"
            @click="fetchAll">
            <v-icon size="16" :class="{ 'pf-spin': loading }">mdi-refresh</v-icon>
          </button>
        </div>
      </header>

      <!-- ═══ Load failure — offers retry instead of blank spinners ═══ -->
      <div v-if="loadFailed && !loading" class="asa-card pf-empty" role="alert">
        <div class="asa-tint asa-tint--rose pf-tint-lg">
          <v-icon size="26">mdi-alert-circle-outline</v-icon>
        </div>
        <div>
          <p class="pf-empty__title">{{ t('adminSettings.fetchError') }}</p>
          <p class="pf-empty__desc">{{ t('adminSettings.fetchErrorDesc') }}</p>
        </div>
        <div class="pf-empty__actions">
          <button class="asa-btn asa-btn--primary asa-btn--sm" @click="fetchAll">
            <v-icon size="16">mdi-refresh</v-icon>
            <span>{{ t('common.retry') }}</span>
          </button>
        </div>
      </div>

      <template v-else>
        <!-- ═══ SMS wallet hero ═══ -->
        <section class="asa-hero" :aria-busy="loading">
          <div class="asa-hero__inner">
            <div class="asa-hero__copy">
              <p class="asa-hero__eyebrow">{{ t('adminSettings.heroEyebrow') }}</p>

              <div v-if="loading" class="asa-skel mt-3! h-11! w-40! rounded-xl! bg-white/25!" />

              <template v-else>
                <p class="asa-hero__title" dir="ltr">{{ pn(smsStats.remaining) }}</p>
                <p class="asa-hero__desc">{{ t('adminSettings.balanceLabel') }}</p>
              </template>
            </div>

            <!-- Master switch lives in the hero so the "off" state is unmissable -->
            <div class="st-master">
              <span class="asa-pill" :class="smsEnabled ? 'asa-pill--green' : 'asa-pill--rose'">
                <span v-if="smsEnabled" class="pf-pulse" />
                {{ smsEnabled ? t('common.active') : t('adminSettings.smsOffBadge') }}
              </span>
              <v-switch
                :model-value="smsEnabled"
                color="#00adb5"
                hide-details
                density="compact"
                :loading="savingMaster"
                :aria-label="t('adminSettings.smsSending')"
                @update:model-value="onToggleMaster"
              />
              <p class="st-master__hint">{{ t('adminSettings.smsSendingDesc') }}</p>
            </div>
          </div>

          <!-- Usage meter: single source of truth for "how much is left" -->
          <div class="asa-hero__stats">
            <div class="st-meter">
              <div class="st-meter__top">
                <span class="st-meter__label">{{ t('adminSettings.remaining') }}</span>
                <span class="st-meter__pct" dir="ltr">{{ pn(remainingPercent) }}%</span>
              </div>
              <div
                class="st-meter__track"
                role="progressbar"
                :aria-label="t('adminSettings.percentRemaining')"
                :aria-valuenow="remainingPercent"
                aria-valuemin="0"
                aria-valuemax="100"
              >
                <div class="st-meter__fill" :class="meterToneClass" :style="{ width: remainingPercent + '%' }" />
              </div>
              <p class="st-meter__hint">{{ creditStatus.desc }}</p>
            </div>
          </div>
        </section>

        <!-- ═══ Credit breakdown + top-up ═══ -->
        <section class="asa-sec">
          <p class="asa-sec__label">{{ t('adminSettings.creditTitle') }}</p>

          <div class="grid! grid-cols-1! lg:grid-cols-3! gap-3! sm:gap-4!">
            <div class="asa-card pf-metric">
              <div class="asa-tint asa-tint--teal">
                <Wallet class="w-5! h-5! fill-current" />
              </div>
              <div class="pf-metric__copy">
                <p class="pf-metric__value">{{ pn(smsStats.remaining) }}</p>
                <p class="pf-metric__label">{{ t('adminSettings.remaining') }}</p>
              </div>
            </div>

            <div class="asa-card pf-metric">
              <div class="asa-tint asa-tint--indigo">
                <CheckCircle class="w-5! h-5! fill-current" />
              </div>
              <div class="pf-metric__copy">
                <p class="pf-metric__value">{{ pn(smsStats.sent) }}</p>
                <p class="pf-metric__label">{{ t('adminSettings.sent') }}</p>
              </div>
            </div>

            <div class="asa-card pf-metric">
              <div class="asa-tint asa-tint--amber">
                <Activity class="w-5! h-5! fill-current" />
              </div>
              <div class="pf-metric__copy">
                <p class="pf-metric__value">{{ pn(smsStats.total) }}</p>
                <p class="pf-metric__label">{{ t('adminSettings.totalCredit') }}</p>
              </div>
            </div>
          </div>

          <!-- Top-up panel -->
          <div class="asa-card mt-3! sm:mt-4!">
            <div class="st-head">
              <div class="asa-tint asa-tint--teal">
                <Plus class="w-5! h-5! fill-current" />
              </div>
              <div class="min-w-0!">
                <h2 class="asa-card-title">{{ t('adminSettings.topUpTitle') }}</h2>
                <p class="asa-card-sub">{{ t('adminSettings.topUpDesc') }}</p>
              </div>
            </div>

            <div class="st-body">
              <!-- Exact balance -->
              <div class="st-field">
                <label class="asa-field-label" for="st-exact">{{ t('adminSettings.newBalanceLabel') }}</label>
                <div class="st-field__row">
                  <input
                    id="st-exact"
                    v-model="balanceInput"
                    class="asa-input st-input"
                    type="number"
                    inputmode="numeric"
                    min="0"
                    step="1"
                    aria-describedby="st-exact-hint"

                    :disabled="savingCredit"
                    @keyup.enter="applyExactBalance"
                  >
                  <button
                    class="asa-btn asa-btn--primary"
                    :disabled="savingCredit || !exactDirty"
                    @click="applyExactBalance"
                  >
                    <v-icon v-if="savingCredit" size="16" class="pf-spin">mdi-loading</v-icon>
                    <span v-else>{{ t('adminSettings.setExact') }}</span>
                  </button>
                </div>
                <p id="st-exact-hint" class="st-hint" :class="{ 'st-hint--muted': !exactDirty }">
                  {{ exactDirty ? t('adminSettings.newBalance', { count: pn(exactTarget) }) : t('adminSettings.balanceUnchanged') }}
                </p>
              </div>

              <div class="st-divider" />

              <!-- Quick top-up -->
              <div class="st-field">
                <p class="asa-field-label">{{ t('adminSettings.addToBalance') }}</p>
                <div class="st-chips">
                  <button
                    v-for="amount in TOPUP_PRESETS"
                    :key="amount"
                    class="asa-btn asa-btn--ghost asa-btn--sm st-chip"
                    :disabled="savingCredit"
                    @click="addToBalance(amount)"
                  >
                    <v-icon size="14">mdi-plus</v-icon>
                    <span dir="ltr">{{ pn(amount) }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- ═══ Follow-up reminder window ═══ -->
        <section class="asa-sec">
          <p class="asa-sec__label">{{ t('adminSettings.followupWindow') }}</p>

          <div class="asa-card">
            <div class="st-head">
              <div class="asa-tint asa-tint--teal">
                <Calendar class="w-5! h-5! fill-current" />
              </div>
              <div class="min-w-0!">
                <h2 class="asa-card-title">{{ t('adminSettings.followupDaysLabel') }}</h2>
                <p class="asa-card-sub">{{ t('adminSettings.followupDaysDesc') }}</p>
              </div>
            </div>

            <div class="st-body">
              <div class="st-field">
                <div class="st-field__row">
                  <input
                    id="st-followup"
                    v-model="followupInput"
                    class="asa-input st-input st-input--narrow"
                    type="number"
                    inputmode="numeric"
                    min="0"
                    max="90"
                    step="1"
                    aria-describedby="st-followup-hint"
                    :disabled="savingFollowup"
                    @keyup.enter="applyFollowupDays"
                  >
                  <span class="st-suffix">{{ t('followups.daysUnit') }}</span>
                  <button
                    class="asa-btn asa-btn--primary"
                    :disabled="savingFollowup || !followupDirty"
                    @click="applyFollowupDays"
                  >
                    <v-icon v-if="savingFollowup" size="16" class="pf-spin">mdi-loading</v-icon>
                    <span v-else>{{ t('common.save') }}</span>
                  </button>
                </div>
                <p id="st-followup-hint" class="st-hint" :class="{ 'st-hint--muted': !followupDirty }">
                  {{ followupDirty ? t('adminSettings.followupDaysRange') : t('adminSettings.balanceUnchanged') }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- ═══ Notification matrix ═══ -->
        <section class="asa-sec">
          <p class="asa-sec__label">{{ t('adminSettings.matrixTitle') }}</p>

          <div class="asa-card mb-3!">
            <div class="st-head">
              <div class="asa-tint asa-tint--indigo">
                <Bell class="w-5! h-5! fill-current" />
              </div>
              <div class="min-w-0!">
                <h2 class="asa-card-title">{{ t('adminSettings.bulkTitle') }}</h2>
                <p class="asa-card-sub">{{ t('adminSettings.bulkDesc') }}</p>
              </div>
            </div>

            <div class="st-body st-body--tight">
              <div v-for="ch in CHANNELS" :key="ch.value" class="st-bulk">
                <div class="min-w-0!">
                  <p class="st-bulk__label">{{ t(ch.labelKey) }}</p>
                </div>
                <div class="st-bulk__actions">
                  <button
                    class="asa-btn asa-btn--ghost asa-btn--sm"
                    :disabled="savingBulk"
                    @click="askBulk(ch, true, null)"
                  >
                    <v-icon size="14">mdi-check-all</v-icon>
                    <span>{{ t('adminSettings.bulkEnableAll') }}</span>
                  </button>
                  <button
                    class="asa-btn asa-btn--ghost asa-btn--sm"
                    :disabled="savingBulk"
                    @click="askBulk(ch, false, null)"
                  >
                    <v-icon size="14">mdi-close-box-multiple</v-icon>
                    <span>{{ t('adminSettings.bulkDisableAll') }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading skeleton -->
          <div v-if="loading" class="grid! grid-cols-1! lg:grid-cols-2! gap-3! sm:gap-4!" aria-hidden="true">
            <div v-for="i in 4" :key="`st-sk-${i}`" class="asa-card">
              <div class="st-head">
                <div class="asa-skel asa-tint! rounded-[14px]!" />
                <div class="flex-1!">
                  <div class="asa-skel h-4! w-32! rounded-md!" />
                  <div class="asa-skel mt-2! h-3! w-48! rounded-md!" />
                </div>
              </div>
              <div class="st-body">
                <div v-for="j in 2" :key="`r-${j}`" class="asa-skel mt-3! h-12! rounded-xl!" />
              </div>
            </div>
          </div>

          <!-- Category groups -->
          <div v-else class="grid! grid-cols-1! lg:grid-cols-2! gap-3! sm:gap-4!">
            <article v-for="cat in categories" :key="cat.key" class="asa-card">
              <div class="st-head">
                <div class="asa-tint" :class="cat.tint">
                  <component :is="cat.icon" class="w-5! h-5! fill-current" />
                </div>
                <div class="min-w-0! flex-1!">
                  <h2 class="asa-card-title">{{ cat.label }}</h2>
                  <p class="asa-card-sub">{{ cat.description }}</p>
                </div>
                <span class="asa-pill pf-pill--neutral">
                  {{ t('adminSettings.eventCount', { count: pn(cat.events.length) }) }}
                </span>
              </div>

              <div class="st-list">
                <div
                  v-for="ev in cat.events"
                  :key="ev.key"
                  class="st-row"
                  :class="{ 'st-row--locked': ev.lockedChannels.length > 0 }"
                >
                  <div class="st-row__main">
                    <div class="min-w-0!">
                      <div class="st-row__title">
                        <span>{{ ev.label }}</span>
                        <span v-if="ev.critical" class="asa-pill asa-pill--amber">{{ t('adminSettings.criticalLabel') }}</span>
                      </div>
                      <p class="st-row__sub">{{ ev.description }}</p>
                    </div>
                  </div>

                  <div class="st-row__channels">
                    <template v-for="ch in CHANNELS" :key="ch.value">
                      <div v-if="ev.channels.includes(ch.value)" class="st-channel">
                        <v-tooltip
                          v-if="ev.lockedChannels.includes(ch.value)"
                          :text="t('adminSettings.criticalHint')"
                          location="top"
                        >
                          <template #activator="{ props }">
                            <span v-bind="props" class="st-channel__slot">
                              <v-icon :icon="ch.glyph" size="16" :class="ch.iconClass" />
                              <v-switch
                                :model-value="ev.state[ch.value] === true"
                                color="#00adb5"
                                hide-details
                                density="compact"
                                disabled
                                :aria-label="t(ch.ariaKey, { event: ev.label })"
                              />
                            </span>
                          </template>
                        </v-tooltip>

                        <span v-else class="st-channel__slot">
                          <v-icon :icon="ch.glyph" size="16" :class="ch.iconClass" />
                          <v-switch
                            :model-value="ev.state[ch.value] === true"
                            color="#00adb5"
                            hide-details
                            density="compact"
                            :loading="isPending(ev.key, ch.value)"
                            :aria-label="t(ch.ariaKey, { event: ev.label })"
                            @update:model-value="(val: boolean) => onToggleEvent(ev, ch.value, val)"
                          />
                        </span>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
      </template>
    </template>

    <!-- ═══ Bulk-action confirmation ═══ -->
    <UiConfirmDialog
      v-model="bulkDialog"
      :title="bulkDialogTitle"
      :message="bulkDialogMessage"
      :variant="bulkDialogEnabled ? 'default' : 'warning'"
      :confirm-label="bulkDialogEnabled ? t('common.confirm') : t('adminSettings.bulkDisableAll')"
      :loading="savingBulk"
      @confirm="confirmBulk"
    />
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import Activity from '~/components/icons/Activity.vue'
import Bell from '~/components/icons/Bell.vue'
import Calendar from '~/components/icons/Calendar.vue'
import CheckCircle from '~/components/icons/CheckCircle.vue'
import Plus from '~/components/icons/Plus.vue'
import Security from '~/components/icons/Security.vue'
import Settings from '~/components/icons/Settings.vue'
import Wallet from '~/components/icons/Wallet.vue'
import UserDeatils from '~/components/icons/UserDeatils.vue'
import UsersGroup from '~/components/icons/UsersGroup.vue'

definePageMeta({ roles: ['admin_doctor'] })

type Channel = 'sms' | 'telegram'
// 'other' is not a backend category; it is the local bucket for events whose
// category the UI does not recognise yet.
type CategoryKey = 'auth' | 'patient' | 'appointment' | 'messaging' | 'followup' | 'other'

interface RawEvent {
  key: string
  label: string
  description: string
  category: string
  channels: Channel[]
  critical: boolean
  sms: boolean
  telegram: boolean
}

interface SettingValue { value: string }

interface CategoryDef {
  key: CategoryKey
  labelKey: string
  descKey: string
  tint: string
  icon: unknown
}

interface ChannelDef {
  value: Channel
  labelKey: string
  ariaKey: string
  glyph: string
  iconClass: string
}

const { t } = useI18n()
const { pn } = useLang()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()
const { user } = useAuth()

const TOPUP_PRESETS = [100, 500, 1000, 2000, 5000]

const CHANNELS: ChannelDef[] = [
  {
    value: 'sms',
    labelKey: 'adminSettings.channelSms',
    ariaKey: 'adminSettings.toggleSmsFor',
    glyph: 'mdi-message-text-outline',
    iconClass: 'text-teal-600 dark:text-teal-300',
  },
  {
    value: 'telegram',
    labelKey: 'adminSettings.channelTelegram',
    ariaKey: 'adminSettings.toggleTelegramFor',
    glyph: 'mdi-telegram',
    iconClass: 'text-indigo-500 dark:text-indigo-300',
  },
]

const CATEGORIES: CategoryDef[] = [
  { key: 'auth', labelKey: 'auth', descKey: 'authDesc', tint: 'asa-tint--indigo', icon: Security },
  { key: 'patient', labelKey: 'patient', descKey: 'patientDesc', tint: 'asa-tint--green', icon: UserDeatils },
  { key: 'appointment', labelKey: 'appointment', descKey: 'appointmentDesc', tint: 'asa-tint--amber', icon: Calendar },
  { key: 'messaging', labelKey: 'messaging', descKey: 'messagingDesc', tint: 'asa-tint--rose', icon: UsersGroup },
  { key: 'followup', labelKey: 'followup', descKey: 'followupDesc', tint: 'asa-tint--teal', icon: Bell },
]

const isAdmin = computed(() => user.value?.role === 'admin_doctor')

const loading = ref(false)
const loadFailed = ref(false)

const savingCredit = ref(false)
const savingMaster = ref(false)
const savingFollowup = ref(false)
const savingBulk = ref(false)
const bulkDialog = ref(false)

const smsStats = ref({ remaining: 0, sent: 0, total: 0 })
const smsEnabled = ref(false)
const followupDays = ref(3)
const rawEvents = ref<RawEvent[]>([])

/** "eventKey:channel" keys currently in flight, so rows can show their own spinner. */
const pending = ref<Set<string>>(new Set())

/* ── Balance input (means REMAINING, matching backend sms_credit) ── */
const balanceInput = ref<string | number>('')
const followupInput = ref<string | number>(3)

/* ── Localized view model ── */
interface EventVM {
  key: string
  label: string
  description: string
  critical: boolean
  /** Channels the backend refuses to let us switch off, per channel. */
  lockedChannels: Channel[]
  channels: Channel[]
  state: Record<Channel, boolean>
}

interface CategoryVM {
  key: CategoryKey
  label: string
  description: string
  tint: string
  icon: unknown
  events: EventVM[]
}

/** A channel the backend will not let us turn off, regardless of stored value. */
function isLocked(ev: RawEvent, channel: Channel): boolean {
  return ev.key === 'auth_otp' && channel === 'sms'
}

const categories = computed<CategoryVM[]>(() => {
  const toVM = (ev: RawEvent): EventVM => ({
    key: ev.key,
    // Prefer the locale file; fall back to the backend's own label.
    label: t(`adminSettings.events.${ev.key}.label`, ev.label),
    description: t(`adminSettings.events.${ev.key}.description`, ev.description),
    critical: ev.critical === true,
    lockedChannels: ev.channels.filter((c) => isLocked(ev, c)),
    channels: ev.channels,
    state: {
      sms: isLocked(ev, 'sms') ? true : ev.sms === true,
      telegram: isLocked(ev, 'telegram') ? true : ev.telegram === true,
    },
  })

  const known = CATEGORIES.map((cat) => ({
    key: cat.key,
    label: t(`adminSettings.categories.${cat.labelKey}`),
    description: t(`adminSettings.categories.${cat.descKey}`),
    tint: cat.tint,
    icon: cat.icon,
    events: rawEvents.value.filter((e) => e.category === cat.key).map(toVM),
  })).filter((cat) => cat.events.length > 0)

  // Never silently hide an event: if the backend introduces a category the UI
  // does not know about yet, surface it instead of dropping it from the matrix.
  const knownKeys = new Set(CATEGORIES.map((c) => c.key))
  const orphans = rawEvents.value.filter((e) => !knownKeys.has(e.category as CategoryKey))
  if (orphans.length) {
    known.push({
      key: 'other',
      label: t('adminSettings.categoryOther'),
      description: t('adminSettings.categoryOtherDesc'),
      tint: 'asa-tint--indigo',
      icon: Settings,
      events: orphans.map(toVM),
    })
  }

  return known
})

/* ── Credit derived metrics ── */
const remainingPercent = computed(() => {
  const { remaining, total } = smsStats.value
  if (total <= 0) return 0
  return Math.min(100, Math.max(0, Math.round((remaining / total) * 100)))
})

const creditStatus = computed(() => {
  const pct = remainingPercent.value
  if (smsStats.value.total <= 0 || smsStats.value.remaining <= 0) {
    return { key: 'empty', desc: t('adminSettings.statusEmptyDesc') }
  }
  if (pct <= 5) {
    return { key: 'critical', desc: t('adminSettings.statusCriticalDesc') }
  }
  if (pct <= 20) {
    return { key: 'low', desc: t('adminSettings.statusLowDesc') }
  }
  return { key: 'healthy', desc: t('adminSettings.statusHealthyDesc') }
})

/** The meter shows credit left, so the tone tracks the same remaining balance. */
const meterToneClass = computed(() => {
  switch (creditStatus.value.key) {
    case 'critical':
    case 'empty':
      return 'st-meter__fill--rose'
    case 'low':
      return 'st-meter__fill--amber'
    default:
      return 'st-meter__fill--teal'
  }
})

/* ── Dirty-state guards ── */
const exactTarget = computed(() => toInt(balanceInput.value, -1))
const exactDirty = computed(
  () => exactTarget.value >= 0 && exactTarget.value !== smsStats.value.remaining
)
const followupParsed = computed(() => toInt(followupInput.value, -1))
const followupDirty = computed(
  () => followupParsed.value >= 0 && followupParsed.value <= 90 && followupParsed.value !== followupDays.value
)

/** Whole numbers only; anything else is rejected before it reaches the API. */
function toInt(value: string | number, fallback: number): number {
  const raw = String(value ?? '').trim()
  if (raw === '') return fallback
  if (!/^\d+$/.test(raw)) return fallback
  const n = Number(raw)
  return Number.isSafeInteger(n) ? n : fallback
}

function isPending(eventKey: string, channel: Channel): boolean {
  return pending.value.has(`${eventKey}:${channel}`)
}

function setPending(eventKey: string, channel: Channel, on: boolean) {
  const next = new Set(pending.value)
  if (on) next.add(`${eventKey}:${channel}`)
  else next.delete(`${eventKey}:${channel}`)
  pending.value = next
}

const channelLabel = (ch: Channel) => t(`adminSettings.channel${ch === 'sms' ? 'Sms' : 'Telegram'}`)

/* ── Loading ── */
async function fetchAll() {
  if (!isAdmin.value) return
  loading.value = true
  loadFailed.value = false
  try {
    const [statsRes, enabledRes, notifRes, followupRes] = await Promise.all([
      apiFetch<{ success: boolean; data: { remaining: number; sent: number; total: number } }>(
        '/api/settings/sms-stats'
      ),
      apiFetch<{ success: boolean; data: SettingValue }>('/api/settings/sms_enabled'),
      apiFetch<{ success: boolean; data: RawEvent[] }>('/api/settings/notifications/all'),
      apiFetch<{ success: boolean; data: SettingValue | null }>('/api/settings/followup_reminder_days'),
    ])

    // apiFetch resolves with {} on 401/403 after redirecting, so check success.
    if (!statsRes?.success || !enabledRes?.success) {
      loadFailed.value = true
      return
    }

    smsStats.value = statsRes.data ?? { remaining: 0, sent: 0, total: 0 }
    // The field edits the REMAINING balance — this is what sms_credit stores.
    balanceInput.value = smsStats.value.remaining
    smsEnabled.value = enabledRes.data?.value === 'true'

    rawEvents.value = notifRes?.success && Array.isArray(notifRes.data) ? notifRes.data : []

    if (followupRes?.success) {
      const parsed = toInt(followupRes.data?.value ?? '', -1)
      followupDays.value = parsed >= 0 ? parsed : 3
      followupInput.value = followupDays.value
    }
  } catch {
    loadFailed.value = true
  } finally {
    loading.value = false
  }
}

async function refreshStats() {
  try {
    const res = await apiFetch<{ success: boolean; data: { remaining: number; sent: number; total: number } }>(
      '/api/settings/sms-stats'
    )
    if (res?.success) {
      smsStats.value = res.data
      balanceInput.value = res.data.remaining
    }
  } catch {
    /* a stale header number is better than a failed action */
  }
}

/* ── Credit: only sms_credit (remaining) is ever written ── */
async function writeBalance(next: number, description: string) {
  return apiFetch('/api/settings/sms_credit', {
    method: 'PUT',
    body: { value: String(next), description },
  })
}

async function applyExactBalance() {
  const next = exactTarget.value
  if (next < 0) {
    $toast.error(t('adminSettings.invalidAmount'))
    return
  }
  if (next === smsStats.value.remaining) {
    $toast.info(t('adminSettings.noChange'))
    return
  }
  savingCredit.value = true
  try {
    await writeBalance(next, t('adminSettings.smsRemainingDesc'))
    $toast.success(t('adminSettings.creditUpdated'))
    await refreshStats()
  } catch {
    balanceInput.value = smsStats.value.remaining
    $toast.error(t('adminSettings.saveError'))
  } finally {
    savingCredit.value = false
  }
}

async function addToBalance(amount: number) {
  savingCredit.value = true
  try {
    // Remaining + amount. Previously this used `total + amount`, which silently
    // credited the already-spent messages too.
    await writeBalance(smsStats.value.remaining + amount, t('adminSettings.smsRemainingDesc'))
    $toast.success(t('adminSettings.creditsAdded', { count: pn(amount) }))
    await refreshStats()
  } catch {
    $toast.error(t('adminSettings.saveError'))
  } finally {
    savingCredit.value = false
  }
}

/* ── Master switch ── */
async function onToggleMaster(val: boolean) {
  if (savingMaster.value) return
  const previous = smsEnabled.value
  smsEnabled.value = val
  savingMaster.value = true
  try {
    await apiFetch('/api/settings/sms_enabled', {
      method: 'PUT',
      body: { value: String(val), description: t('adminSettings.smsEnabledDesc') },
    })
    $toast.success(val ? t('adminSettings.smsEnabled') : t('adminSettings.smsDisabled'))
  } catch {
    smsEnabled.value = previous
    $toast.error(t('adminSettings.saveError'))
  } finally {
    savingMaster.value = false
  }
}

/* ── Follow-up window ── */
async function applyFollowupDays() {
  const next = followupParsed.value
  if (next < 0 || next > 90) {
    $toast.error(t('adminSettings.invalidDays'))
    return
  }
  if (next === followupDays.value) {
    $toast.info(t('adminSettings.noChange'))
    return
  }
  savingFollowup.value = true
  try {
    await apiFetch('/api/settings/followup_reminder_days', {
      method: 'PUT',
      body: { value: String(next), description: t('adminSettings.followupDaysDesc') },
    })
    followupDays.value = next
    $toast.success(t('adminSettings.followupDaysSaved'))
  } catch {
    followupInput.value = followupDays.value
    $toast.error(t('adminSettings.saveError'))
  } finally {
    savingFollowup.value = false
  }
}

/* ── Per-event toggles ── */
async function onToggleEvent(ev: EventVM, channel: Channel, val: boolean) {
  if (pending.value.has(`${ev.key}:${channel}`)) return

  const raw = rawEvents.value.find((e) => e.key === ev.key)
  if (!raw) return

  // Read the previous value from rawEvents — the EventVM handed to this handler
  // is rebuilt by the `categories` computed on every evaluation, so mutating
  // its `state` would neither re-render nor survive the next recompute.
  const previous = isLocked(raw, channel) ? true : raw[channel] === true
  if (previous === val) return

  const setChannel = (next: boolean) => {
    rawEvents.value = rawEvents.value.map((e) => (e.key === ev.key ? { ...e, [channel]: next } : e))
  }

  setChannel(val) // optimistic
  setPending(ev.key, channel, true)
  try {
    await apiFetch(`/api/settings/notifications/${ev.key}`, {
      method: 'PUT',
      body: { channel, enabled: val },
    })
    const label = channelLabel(channel)
    $toast.success(
      val
        ? t('adminSettings.channelEnabled', { channel: label })
        : t('adminSettings.channelDisabled', { channel: label })
    )
  } catch {
    setChannel(previous) // roll back to what the server still has
    $toast.error(t('adminSettings.toggleError'))
  } finally {
    setPending(ev.key, channel, false)
  }
}

/* ── Bulk actions, behind a confirmation ── */
interface BulkRequest {
  channel: Channel
  enabled: boolean
  category: CategoryKey | null
}

const bulkRequest = ref<BulkRequest | null>(null)

const bulkDialogEnabled = computed(() => bulkRequest.value?.enabled === true)

const bulkDialogTitle = computed(() => {
  const req = bulkRequest.value
  if (!req) return t('adminSettings.bulkTitle')
  const label = channelLabel(req.channel)
  return t(
    req.enabled ? 'adminSettings.bulkTitleConfirm' : 'adminSettings.bulkDisableTitleConfirm',
    { channel: label }
  )
})

const bulkDialogMessage = computed(() => {
  const req = bulkRequest.value
  if (!req) return ''
  const scope = req.category
    ? t('adminSettings.bulkScopeCategory', { category: t(`adminSettings.categories.${req.category}`) })
    : t('adminSettings.bulkScopeAll')
  return t('adminSettings.bulkMessage', {
    scope,
    action: t(req.enabled ? 'adminSettings.bulkActionOn' : 'adminSettings.bulkActionOff'),
  })
})

function askBulk(channel: Channel, enabled: boolean, category: CategoryKey | null) {
  bulkRequest.value = { channel, enabled, category }
  bulkDialog.value = true
}

async function confirmBulk() {
  const req = bulkRequest.value
  if (!req || savingBulk.value) return
  savingBulk.value = true
  try {
    const targets = rawEvents.value.filter((e) => {
      if (!e.channels.includes(req.channel)) return false
      if (req.category && e.category !== req.category) return false
      return !isLocked(e, req.channel)
    })

    await apiFetch('/api/settings/notifications', {
      method: 'PUT',
      body: {
        settings: targets.map((e) => ({ eventKey: e.key, channel: req.channel, enabled: req.enabled })),
      },
    })

    // Reflect locally so the matrix updates without a second round trip.
    const keys = new Set(targets.map((e) => e.key))
    rawEvents.value = rawEvents.value.map((e) =>
      keys.has(e.key) ? { ...e, [req.channel]: req.enabled } : e
    )

    const label = channelLabel(req.channel)
    $toast.success(
      t('adminSettings.bulkDone', {
        channel: label,
        action: t(req.enabled ? 'adminSettings.bulkActionOn' : 'adminSettings.bulkActionOff'),
      })
    )
    bulkDialog.value = false
  } catch {
    $toast.error(t('adminSettings.saveError'))
  } finally {
    savingBulk.value = false
  }
}

// Fetch exactly once, as soon as the role is known. `immediate` covers the
// case where the user is already restored at setup, and the reactive half
// covers async hydration — onMounted + watch would double-fire in between.
watch(
  () => user.value?.role,
  (role) => {
    if (role === 'admin_doctor') fetchAll()
  },
  { immediate: true }
)

useSeoMeta({ title: t('adminSettings.titleSeo') })
</script>

<style scoped>
/* ── Master switch in hero ────────────────────────────────────── */
.st-master {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.375rem;
  flex-shrink: 0;
  max-width: 15rem;
}

.st-master__hint {
  font-size: 0.6875rem;
  line-height: 1.5;
  text-align: end;
  color: rgba(255, 255, 255, 0.78);
}

/* ── Usage meter ─────────────────────────────────────────────── */
.st-meter {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.875rem 1rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.18);
  grid-column: 1 / -1;
}

.st-meter__top {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
}

.st-meter__label {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
}

.st-meter__pct {
  font-size: 1rem;
  font-weight: 700;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
}

.st-meter__track {
  height: 0.5rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.22);
  overflow: hidden;
}

.st-meter__fill {
  height: 100%;
  border-radius: 9999px;
  background: #ffffff;
  transition: width 420ms var(--ease-premium), background-color 220ms var(--ease-default);
}

.st-meter__fill--teal {
  background: #5eead4;
}

.st-meter__fill--amber {
  background: #fcd34d;
}

.st-meter__fill--rose {
  background: #fda4af;
}

.st-meter__hint {
  font-size: 0.6875rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.78);
}

/* ── Card section head ───────────────────────────────────────── */
.st-head {
  display: flex;
  align-items: center;
  gap: 0.875rem;
}

.st-body {
  margin-top: 1.25rem;
}

.st-body--tight {
  margin-top: 1rem;
}

.st-divider {
  height: 1px;
  margin: 1.125rem 0;
  background: var(--asa-sep);
}

.st-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.st-field__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.st-input {
  flex: 1 1 9rem;
  min-width: 0;
  max-width: 14rem;
}

.st-input--narrow {
  flex: 0 1 7rem;
  max-width: 7rem;
}

.st-suffix {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label-2);
}

.st-hint {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--asa-accent-deep);
}

.dark .st-hint {
  color: var(--asa-accent);
}

.st-hint--muted {
  color: var(--asa-label-3);
}

.st-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.st-chip {
  font-variant-numeric: tabular-nums;
}

/* ── Bulk rows ───────────────────────────────────────────────── */
.st-bulk {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.875rem 0;
}

.st-bulk + .st-bulk {
  border-top: 1px solid var(--asa-sep);
}

.st-bulk__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--asa-label);
}

.st-bulk__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* ── Notification list ───────────────────────────────────────── */
.st-list {
  margin-top: 1rem;
}

.st-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9375rem 0;
  border-top: 1px solid var(--asa-sep);
}

.st-row:first-child {
  border-top: none;
  padding-top: 0.25rem;
}

.st-row__main {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  min-width: 0;
  flex: 1;
}

.st-row__title {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--asa-label);
}

.st-row__sub {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  line-height: 1.55;
  color: var(--asa-label-2);
}

.st-row__channels {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.st-channel {
  display: flex;
  align-items: center;
}

.st-channel__slot {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  opacity: 0.85;
}

.st-row--locked .st-row__title {
  color: var(--asa-label-2);
}
</style>
