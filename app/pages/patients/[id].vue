<template>
  <UiPageContainer class="relative! max-w-[1440px]! mx-auto!">
    <!-- ─── Loading ─── -->
    <div v-if="profileLoading" class="pr-skel-wrap">
      <div class="asa-skel rounded-[22px]! h-28!" />
      <div class="pr-skel-grid">
        <div class="asa-skel rounded-[22px]! h-[440px]!" />
        <div class="asa-skel rounded-[22px]! h-[440px]!" />
      </div>
    </div>

    <!-- ─── Error ─── -->
    <div v-else-if="loadError" class="asa-card pf-empty">
      <div class="asa-tint asa-tint--rose pf-tint-lg">
        <v-icon size="24">mdi-alert-circle-outline</v-icon>
      </div>
      <div>
        <p class="pf-empty__title">{{ t('patientRecord.errorTitle') }}</p>
        <p class="pf-empty__desc">{{ loadError }}</p>
      </div>
      <div class="pf-empty__actions">
        <button class="asa-btn asa-btn--ghost asa-btn--sm" @click="refreshProfile">
          <v-icon size="16">mdi-refresh</v-icon>
          <span>{{ t('patientRecord.retry') }}</span>
        </button>
      </div>
    </div>

    <div v-else class="pr-page">
      <!-- ═══════════════════════════════════════════
           COMMAND HEADER
      ═══════════════════════════════════════════ -->
      <header class="pr-head">
        <div class="pr-head__copy">
          <NuxtLink to="/patients" class="pr-back">
            <AltArrowLeft class="w-3.5! h-3.5! fill-current" />
            <span>{{ t('patientRecord.backToList') }}</span>
          </NuxtLink>
          <div class="pr-head__titleline">
            <h1 class="pr-head__title">{{ fullName }}</h1>
            <span v-if="age !== null" class="asa-pill asa-pill--teal pr-head__age">
              <HeartPulse class="w-3.5! h-3.5! fill-current" />
              {{ toPersianNum(age) }} {{ t('patientRecord.yearsOld') }}
            </span>
            <span v-if="isForeign && nationalityLabel" class="asa-pill asa-pill--indigo">
              <img v-if="countryFlag" :src="countryFlag" alt="" class="w-4! h-3! object-contain" />
              {{ nationalityLabel }}
            </span>
          </div>
          <p class="pr-head__date">{{ t('patientRecord.subtitle') }}</p>
        </div>
        <div class="pr-head__actions">
          <a v-if="phone" class="asa-btn asa-btn--ghost pr-contact" :href="`tel:${phone}`" :aria-label="t('patientRecord.call')">
            <v-icon size="16">mdi-phone-outline</v-icon>
            <span class="pr-hide-sm">{{ t('patientRecord.call') }}</span>
          </a>
          <button v-if="phone" type="button" class="asa-btn asa-btn--ghost pr-contact" :aria-label="t('patientRecord.sms')" @click="openSmsDialog">
            <v-icon size="16">mdi-message-text-outline</v-icon>
            <span class="pr-hide-sm">{{ t('patientRecord.sms') }}</span>
          </button>
          <button
            type="button"
            class="asa-btn asa-btn--ghost"
            :disabled="refreshing"
            :aria-label="t('patientRecord.refresh')"
            @click="refreshAll"
          >
            <v-icon size="16" :class="{ 'pf-spin': refreshing }">mdi-refresh</v-icon>
            <span class="pr-hide-sm">{{ t('patientRecord.refresh') }}</span>
          </button>
          <button type="button" class="asa-btn asa-btn--primary" @click="openNote">
            <Pencil class="w-4! h-4! stroke-current" />
            <span>{{ t('patientRecord.addNote') }}</span>
          </button>
        </div>
      </header>

      <!-- ═══════════════════════════════════════════
           IDENTITY + AT-A-GLANCE STRIP
      ═══════════════════════════════════════════ -->
      <section class="asa-card pr-ident">
        <div class="pr-ident__body">
          <div class="pr-ident__who">
            <span class="pr-ident__avatar" aria-hidden="true">{{ initials }}</span>
            <div class="pr-ident__id">
              <p class="pr-ident__name">{{ fullName }}</p>
              <p class="pr-ident__meta">
                <span v-if="nationalId" class="pr-ident__chip pr-ident__chip--mono" dir="ltr">
                  <v-icon size="13">mdi-card-account-details-outline</v-icon>
                  {{ nationalId }}
                </span>
                <span v-if="phone" class="pr-ident__chip pr-ident__chip--mono" dir="ltr">
                  <v-icon size="13">mdi-phone-outline</v-icon>
                  {{ phone }}
                </span>
                <span v-if="insuranceLabel" class="pr-ident__chip">
                  <v-icon size="13">mdi-shield-check-outline</v-icon>
                  {{ insuranceLabel }}
                  <template v-if="insuranceCode"> · {{ insuranceCode }}</template>
                </span>
                <span v-if="birthDate && birthDateExact === false" class="pr-ident__chip">
                  {{ t('patients.approxDob') }}
                </span>
              </p>
            </div>
          </div>

          <dl class="pr-facts">
            <div v-for="fact in facts" :key="fact.label" class="pr-facts__cell" :class="{ 'pr-facts__cell--wide': fact.wide }">
              <dt class="pr-facts__label">{{ fact.label }}</dt>
              <dd class="pr-facts__value" :dir="fact.ltr ? 'ltr' : undefined" :title="fact.value">
                <component :is="fact.icon" v-if="fact.icon" class="w-3.5! h-3.5! fill-current" />
                <span>{{ fact.value }}</span>
              </dd>
            </div>
          </dl>
        </div>

        <!-- Clinical alerts -->
        <div v-if="alerts.length" class="pr-alertbar">
          <span v-for="a in alerts" :key="a.text" class="pr-alert" :class="`pr-alert--${a.tone}`">
            <v-icon size="14">{{ a.icon }}</v-icon>
            <span>{{ a.text }}</span>
          </span>
        </div>

        <!-- Record metrics -->
        <div class="pr-metrics">
          <div v-for="m in metrics" :key="m.key" class="pr-metric">
            <span class="pr-metric__value">{{ toPersianNum(m.value) }}</span>
            <span class="pr-metric__label">{{ m.label }}</span>
          </div>
        </div>
      </section>

      <!-- ═══════════════════════════════════════════
           SINGLE-SCREEN CHART GRID
      ═══════════════════════════════════════════ -->
      <div class="pr-grid">
        <div class="pr-grid__main">
          <!-- Laboratory panel -->
          <LabResultsSection ref="labRef" :patient-id="patientId" />

          <!-- Case timeline -->
          <div class="pr-feed-panel">
            <PatientCaseFeed
              ref="feedRef"
              :patient-id="patientId"
              :patient-name="fullName"
              @stats="onFeedStats"
            />
          </div>
        </div>

        <!-- ─── Clinical snapshot rail ─── -->
        <aside class="pr-side">
          <section class="asa-card pr-snap">
            <header class="pr-snap__head">
              <div class="pr-snap__heading">
                <span class="asa-tint asa-tint--sm asa-tint--teal" aria-hidden="true">
                  <Activity class="w-4! h-4! fill-current" />
                </span>
                <div class="min-w-0">
                  <h2 class="asa-card-title">{{ t('patientRecord.clinical.snapshot') }}</h2>
                  <p class="asa-card-sub">{{ t('patientRecord.clinical.snapshotDesc') }}</p>
                </div>
              </div>
            </header>

            <!-- Last visit -->
            <div class="pr-snap__block">
              <p class="pr-snap__label">
                <v-icon size="14">mdi-stethoscope</v-icon>
                {{ t('patientRecord.clinical.lastVisit') }}
              </p>
              <div v-if="lastVisit" class="pr-snap__visit">
                <div class="flex! items-center! justify-between! gap-2!">
                  <span class="asa-pill asa-pill--teal">{{ lastVisit.visitType || t('patientRecord.eventTypes.visit') }}</span>
                  <span class="pr-snap__muted">{{ formatDate(lastVisit.visitDate) }}</span>
                </div>
                <p v-if="lastVisit.visitReason" class="pr-snap__visit-title">{{ lastVisit.visitReason }}</p>
                <p v-if="lastVisit.nextVisitDate" class="pr-snap__muted">
                  <v-icon size="12">mdi-calendar-clock</v-icon>
                  {{ t('patientRecord.detailKeys.nextVisit') }}: {{ formatDate(lastVisit.nextVisitDate) }}
                </p>
              </div>
              <p v-else class="pr-snap__empty">{{ t('patientRecord.clinical.noVisit') }}</p>
            </div>

            <!-- Allergies -->
            <div class="pr-snap__block">
              <p class="pr-snap__label">
                <v-icon size="14">mdi-alert-triangle-outline</v-icon>
                {{ t('patientRecord.clinical.allergies') }}
                <span v-if="allergies.length" class="pr-snap__count">{{ toPersianNum(allergies.length) }}</span>
              </p>
              <div v-if="allergies.length" class="pr-snap__tags">
                <span v-for="allergy in allergies.slice(0, 5)" :key="allergy.id" class="asa-pill pr-pill--danger">
                  {{ allergy.substance }}
                  <span v-if="allergy.severity" class="pr-pill__sub">{{ allergy.severity }}</span>
                </span>
                <span v-if="allergies.length > 5" class="pr-snap__more">+{{ toPersianNum(allergies.length - 5) }}</span>
              </div>
              <p v-else class="pr-snap__empty">{{ t('patientRecord.clinical.emptyAllergies') }}</p>
            </div>

            <!-- Active problems -->
            <div class="pr-snap__block">
              <p class="pr-snap__label">
                <v-icon size="14">mdi-heart-pulse</v-icon>
                {{ t('patientRecord.clinical.problems') }}
                <span v-if="activeDiseases.length" class="pr-snap__count">{{ toPersianNum(activeDiseases.length) }}</span>
              </p>
              <ul v-if="activeDiseases.length" class="pr-snap__list">
                <li v-for="disease in activeDiseases.slice(0, 4)" :key="disease.id">
                  <span class="pr-snap__item-name">{{ disease.name }}</span>
                  <span v-if="disease.diagnosedAt" class="pr-snap__muted">{{ formatDate(disease.diagnosedAt) }}</span>
                </li>
              </ul>
              <p v-else class="pr-snap__empty">{{ t('patientRecord.clinical.emptyProblems') }}</p>
              <p v-if="activeDiseases.length > 4" class="pr-snap__more">
                {{ t('patientRecord.clinical.moreItems', { count: toPersianNum(activeDiseases.length - 4) }) }}
              </p>
            </div>

            <!-- Current medications -->
            <div class="pr-snap__block">
              <p class="pr-snap__label">
                <v-icon size="14">mdi-pill</v-icon>
                {{ t('patientRecord.clinical.medications') }}
                <span v-if="currentMedications.length" class="pr-snap__count">{{ toPersianNum(currentMedications.length) }}</span>
              </p>
              <ul v-if="currentMedications.length" class="pr-snap__list">
                <li v-for="medication in currentMedications.slice(0, 4)" :key="medication.id">
                  <span class="pr-snap__item-name">{{ medication.name }}</span>
                  <span v-if="medication.dosage" class="pr-snap__muted" dir="ltr">{{ medication.dosage }}</span>
                </li>
              </ul>
              <p v-else class="pr-snap__empty">{{ t('patientRecord.clinical.emptyMedications') }}</p>
              <p v-if="currentMedications.length > 4" class="pr-snap__more">
                {{ t('patientRecord.clinical.moreItems', { count: toPersianNum(currentMedications.length - 4) }) }}
              </p>
            </div>

            <!-- Obstetric summary -->
            <div v-if="reproSummary.length" class="pr-snap__block">
              <p class="pr-snap__label">
                <v-icon size="14">mdi-baby-face-outline</v-icon>
                {{ t('patientRecord.clinical.obstetric') }}
              </p>
              <div class="pr-gp">
                <div v-for="s in reproSummary" :key="s.label" class="pr-gp__cell">
                  <span class="pr-gp__value">{{ toPersianNum(s.value) }}</span>
                  <span class="pr-gp__label">{{ s.label }}</span>
                </div>
              </div>
            </div>

            <!-- Screenings -->
            <div class="pr-snap__block">
              <p class="pr-snap__label">
                <v-icon size="14">mdi-shield-check-outline</v-icon>
                {{ t('patientRecord.clinical.screenings') }}
                <span v-if="overdueCount" class="pr-snap__count pr-snap__count--danger">{{ toPersianNum(overdueCount) }}</span>
              </p>
              <ul v-if="upcomingScreenings.length" class="pr-snap__list">
                <li v-for="schedule in upcomingScreenings.slice(0, 3)" :key="schedule.id">
                  <span class="pr-snap__item-name">{{ screeningTypeLabel(schedule.screeningType) }}</span>
                  <span class="pr-snap__muted" :class="{ 'pr-snap__muted--danger': isOverdue(schedule) }">
                    {{ formatDate(schedule.dueDate) }}
                  </span>
                </li>
              </ul>
              <p v-else class="pr-snap__empty">{{ t('patientRecord.clinical.emptyScreenings') }}</p>
            </div>

            <!-- Documents shortcut -->
            <button type="button" class="pr-snap__docs" @click="openDocuments">
              <span class="pr-snap__docs-ic" aria-hidden="true">
                <FolderOpen class="w-4! h-4! fill-current" />
              </span>
              <span class="min-w-0 flex-1! text-start!">
                <span class="pr-snap__docs-title">{{ t('patientRecord.clinical.documents') }}</span>
                <span class="pr-snap__muted">{{ t('patientRecord.clinical.filesCount', { count: toPersianNum(documentCount) }) }}</span>
              </span>
              <v-icon size="16" class="pr-snap__docs-arrow">mdi-chevron-left</v-icon>
            </button>
          </section>
        </aside>
      </div>
    </div>
    <!-- ─── SMS delivery dialog ─── -->
    <UiDialog v-model="smsOpen" :title="t('patientRecord.smsTitle')" size="md">
      <div class="pr-sms">
        <div class="pr-sms__patient">
          <span class="pr-sms__avatar" aria-hidden="true">{{ initials }}</span>
          <span class="min-w-0">
            <span class="pr-sms__name">{{ fullName }}</span>
            <span class="pr-sms__phone" dir="ltr">{{ phone }}</span>
          </span>
        </div>

        <p class="pr-sms__label">{{ t('patientRecord.smsChoose') }}</p>

        <div class="pr-sms__options">
          <a v-if="phone" class="pr-sms__option" :href="`sms:${phone}`" @click="smsOpen = false">
            <span class="pr-sms__opt-ic pr-sms__opt-ic--teal" aria-hidden="true">
              <v-icon size="20">mdi-cellphone-message</v-icon>
            </span>
            <span class="min-w-0">
              <span class="pr-sms__opt-title">{{ t('patientRecord.smsDevice') }}</span>
              <span class="pr-sms__opt-desc">{{ t('patientRecord.smsDeviceDesc') }}</span>
            </span>
            <v-icon size="16" class="pr-sms__opt-arrow">mdi-chevron-left</v-icon>
          </a>

          <button
            type="button"
            class="pr-sms__option"
            :class="{ 'pr-sms__option--on': smsMode === 'panel' }"
            :aria-pressed="smsMode === 'panel'"
            @click="smsMode = 'panel'"
          >
            <span class="pr-sms__opt-ic pr-sms__opt-ic--indigo" aria-hidden="true">
              <v-icon size="20">mdi-send-outline</v-icon>
            </span>
            <span class="min-w-0">
              <span class="pr-sms__opt-title">{{ t('patientRecord.smsPanel') }}</span>
              <span class="pr-sms__opt-desc">{{ t('patientRecord.smsPanelDesc') }}</span>
            </span>
            <v-icon size="16" class="pr-sms__opt-arrow">{{ smsMode === 'panel' ? 'mdi-check-circle' : 'mdi-chevron-left' }}</v-icon>
          </button>
        </div>

        <div v-if="smsMode === 'panel'" class="pr-sms__compose">
          <label class="pr-sms__label" for="pr-sms-message">{{ t('patientRecord.smsMessage') }}</label>
          <textarea
            id="pr-sms-message"
            v-model="smsText"
            class="pr-sms__textarea"
            rows="4"
            maxlength="1000"
            :placeholder="t('patientRecord.smsMessageHint')"
          />
          <div class="pr-sms__meta">
            <span>{{ t('patientRecord.smsChars', { n: toPersianNum(smsText.length) }) }}</span>
            <span class="pr-sms__via">
              <v-icon size="13">mdi-shield-check-outline</v-icon>
              {{ t('patientRecord.smsViaPanel') }}
            </span>
          </div>
        </div>
      </div>

      <template #footer>
        <button type="button" class="asa-btn asa-btn--ghost" @click="smsOpen = false">
          {{ t('common.cancel') }}
        </button>
        <button
          v-if="smsMode === 'panel'"
          type="button"
          class="asa-btn asa-btn--primary"
          :disabled="!smsText.trim() || smsSending"
          @click="sendSystemSms"
        >
          <v-progress-circular v-if="smsSending" indeterminate size="14" width="2" />
          <v-icon v-else size="16">mdi-send</v-icon>
          {{ t('patientRecord.smsSend') }}
        </button>
      </template>
    </UiDialog>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePatientProfile } from '~/composables/usePatientProfile'
import { loadFlagSvg, countryName } from '~/composables/useCountries'
import AltArrowLeft from '~/components/icons/AltArrowLeft.vue'
import HeartPulse from '~/components/icons/HeartPulse.vue'
import Pencil from '~/components/icons/Pencil.vue'
import Activity from '~/components/icons/Activity.vue'
import FolderOpen from '~/components/icons/FolderOpen.vue'
import Calendar from '~/components/icons/Calendar.vue'
import Profile from '~/components/icons/Profile.vue'
import Clock from '~/components/icons/Clock.vue'
import UsersGroup from '~/components/icons/UsersGroup.vue'
import PatientCaseFeed from '~/components/patient/PatientCaseFeed.vue'

const route = useRoute()
const { t } = useI18n()
const { toPersianNum } = useLang()

const patientId = computed(() => String(route.params.id || ''))

const {
  profile,
  basicInfo,
  loading: profileLoading,
  error: profileError,
  fetchProfile,
  refresh: refreshProfile,
  reset,
} = usePatientProfile({ patientId: patientId.value, autoFetch: true })

watch(patientId, (newId) => {
  if (newId) {
    reset()
    fetchProfile()
  }
})

const loadError = computed(() => profileError.value)
const refreshing = ref(false)

const recordStats = ref({ visits: 0, prescriptions: 0, notes: 0, doctors: 0 })
function onFeedStats(stats: { visits: number; prescriptions: number; notes: number; doctors: number }) {
  recordStats.value = stats
}

const labRef = ref<{ openDocuments: () => void } | null>(null)
const feedRef = ref<{ openNote: () => void } | null>(null)

const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

// ─── SMS delivery ───
const smsOpen = ref(false)
const smsMode = ref<'choice' | 'panel'>('choice')
const smsText = ref('')
const smsSending = ref(false)

function openSmsDialog() {
  smsMode.value = 'choice'
  smsText.value = ''
  smsOpen.value = true
}

function normalizedPhone(value: string): string | null {
  let digits = String(value || '').replace(/\D/g, '')
  if (digits.startsWith('0098')) digits = `0${digits.slice(4)}`
  else if (digits.startsWith('98') && digits.length === 12) digits = `0${digits.slice(2)}`
  else if (digits.length === 10 && digits.startsWith('9')) digits = `0${digits}`
  return /^09\d{9}$/.test(digits) ? digits : null
}

async function sendSystemSms() {
  const text = smsText.value.trim()
  if (!text || smsSending.value) return

  const target = normalizedPhone(phone.value)
  if (!target) {
    $toast.error(t('patientRecord.smsInvalidPhone'))
    return
  }

  smsSending.value = true
  try {
    const res = await apiFetch<{ success: boolean }>('/api/patients/send-sms', {
      method: 'POST',
      body: { phone: target, text },
    })
    if (res?.success) {
      $toast.success(t('patientRecord.smsSent'))
      smsOpen.value = false
      smsText.value = ''
    } else {
      $toast.error(t('patientRecord.smsFailed'))
    }
  } catch (err: unknown) {
    const e = err as { data?: { error?: string } }
    $toast.error(e?.data?.error || t('patientRecord.smsFailed'))
  } finally {
    smsSending.value = false
  }
}

function openDocuments() {
  labRef.value?.openDocuments()
}

function openNote() {
  feedRef.value?.openNote()
}

async function refreshAll() {
  refreshing.value = true
  try {
    await refreshProfile()
  } finally {
    refreshing.value = false
  }
}

// ─────────────────────────────────────────────────────────────
// Identity — the unified profile endpoint returns camelCase while
// the legacy endpoint returns a mix, so read both.
// ─────────────────────────────────────────────────────────────
const info = computed<Record<string, any>>(() => basicInfo.value || {})
const pick = (...keys: string[]) => {
  for (const k of keys) {
    const v = info.value[k]
    if (v !== undefined && v !== null && v !== '') return v
  }
  return ''
}

const firstName = computed(() => String(pick('firstName', 'first_name') || ''))
const lastName = computed(() => String(pick('lastName', 'last_name') || ''))
const fullName = computed(() => [firstName.value, lastName.value].filter(Boolean).join(' ') || '---')

const initials = computed(() => {
  const a = firstName.value.charAt(0)
  const b = lastName.value.charAt(0)
  return (a + b) || '—'
})

const nationalId = computed(() => String(pick('nationalId', 'national_id') || ''))
const phone = computed(() => String(pick('phone') || ''))
const birthDate = computed(() => String(pick('birthDate', 'birth_date') || ''))
const birthDateExact = computed(() => pick('birthDateExact', 'birth_date_exact'))
const insuranceType = computed(() => String(pick('insuranceType') || ''))
const insuranceCode = computed(() => String(pick('insuranceCode') || ''))
const maritalStatus = computed(() => String(pick('maritalStatus') || ''))
const createdAt = computed(() => String(pick('createdAt', 'created_at') || ''))
const address = computed(() => String(pick('address') || ''))
const bmi = computed(() => info.value.bmi ?? null)
const isForeign = computed(() => pick('isForeign', 'is_foreign') === true)
const nationality = computed(() => String(pick('nationality') || ''))

const countryFlag = ref('')
watch(
  () => nationality.value,
  async (code) => {
    countryFlag.value = ''
    if (code) countryFlag.value = await loadFlagSvg(code)
  },
  { immediate: true },
)

const nationalityLabel = computed(
  () => (nationality.value ? countryName(nationality.value, 'fa') || nationality.value : ''),
)

const insuranceLabel = computed(() => {
  const label = info.value.insuranceInfo?.label
  return String(label || insuranceType.value || '')
})

const age = computed(() => {
  if (!birthDate.value) return null
  const dob = new Date(birthDate.value)
  if (Number.isNaN(dob.getTime())) return null
  const now = new Date()
  let years = now.getFullYear() - dob.getFullYear()
  const m = now.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) years -= 1
  return years >= 0 ? years : null
})

function formatDate(value: string | null | undefined): string {
  if (!value) return '---'
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return String(value)
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(d)
  } catch {
    return String(value)
  }
}

const birthLabel = computed(() => {
  if (!birthDate.value) return '---'
  const text = formatDate(birthDate.value)
  if (age.value === null) return text
  return `${text} (${toPersianNum(age.value)})`
})

const facts = computed(() => {
  const list: { label: string; value: string; ltr?: boolean; wide?: boolean; icon?: any }[] = []

  if (birthDate.value) {
    list.push({ label: t('patientRecord.birthDate'), value: birthLabel.value, icon: Calendar })
  }
  if (phone.value) {
    list.push({ label: t('patientRecord.phone'), value: phone.value, ltr: true, icon: Profile })
  }
  if (nationalId.value) {
    list.push({ label: t('patientRecord.nationalId'), value: nationalId.value, ltr: true })
  }
  if (maritalStatus.value) {
    list.push({ label: t('patientRecord.maritalStatus'), value: maritalStatus.value, icon: UsersGroup })
  }
  if (insuranceType.value || insuranceCode.value) {
    list.push({
      label: t('patientRecord.insuranceType'),
      value: [insuranceLabel.value, insuranceCode.value].filter(Boolean).join(' · ') || '---',
    })
  }
  if (bmi.value) {
    list.push({ label: t('patientRecord.detailKeys.bmi'), value: String(bmi.value) })
  }
  if (createdAt.value) {
    list.push({ label: t('patientRecord.registeredAt'), value: formatDate(createdAt.value), icon: Clock })
  }
  if (address.value) {
    list.push({ label: t('patients.address'), value: address.value, wide: true })
  }

  return list
})

// ─────────────────────────────────────────────────────────────
// Clinical snapshot data
// ─────────────────────────────────────────────────────────────
const medicalHistory = computed<any>(() => profile.value?.medicalHistory ?? {})
const allergies = computed<any[]>(() => medicalHistory.value?.allergies ?? [])
const activeDiseases = computed<any[]>(() =>
  (medicalHistory.value?.diseases ?? []).filter((d: any) => d?.isActive !== false),
)
const currentMedications = computed<any[]>(() =>
  (medicalHistory.value?.medications ?? []).filter((m: any) => m?.isCurrent !== false),
)
const visits = computed<any[]>(() => profile.value?.visits ?? [])
const lastVisit = computed<any | null>(() => visits.value[0] ?? null)

const screeningSchedules = computed<any[]>(() => profile.value?.screenings?.schedules ?? [])

function isOverdue(schedule: any): boolean {
  if (!schedule?.dueDate) return false
  if (schedule.status === 'overdue') return true
  if (schedule.status === 'completed' || schedule.status === 'cancelled') return false
  return String(schedule.dueDate).slice(0, 10) < new Date().toISOString().slice(0, 10)
}

const upcomingScreenings = computed<any[]>(() =>
  [...screeningSchedules.value].sort((a, b) => String(a.dueDate || '').localeCompare(String(b.dueDate || ''))),
)
const overdueCount = computed(() => screeningSchedules.value.filter((s) => isOverdue(s)).length)

function screeningTypeLabel(type: string | null | undefined): string {
  if (!type) return '---'
  const key = `screening.screeningTypes.${type}`
  const label = t(key)
  return label === key ? type : label
}

const reproSummary = computed<{ label: string; value: number }[]>(() => {
  const s = profile.value?.reproductiveHealth?.summary
  if (!s) return []
  const entries: { label: string; value: number | null | undefined }[] = [
    { label: t('patientRecord.clinical.gravida'), value: s.gravida },
    { label: t('patientRecord.clinical.para'), value: s.para },
    { label: t('patientRecord.clinical.abortus'), value: s.abortions ?? s.abortus },
    { label: t('patientRecord.clinical.ectopic'), value: s.ectopics },
    { label: t('patientRecord.clinical.liveBirths'), value: s.liveBirths ?? s.live_births },
    { label: t('patientRecord.clinical.cesarean'), value: s.cesareanSections ?? s.cSections },
    { label: t('patientRecord.clinical.vaginal'), value: s.vaginalDeliveries ?? s.vaginal_deliveries },
  ]
  return entries
    .filter((e): e is { label: string; value: number } => e.value !== null && e.value !== undefined)
})

const documentCount = computed(() => {
  const groups = profile.value?.attachments
  if (!groups) return 0
  return Object.values(groups).reduce<number>(
    (sum, files) => sum + (Array.isArray(files) ? files.length : 0),
    0,
  )
})

// ─────────────────────────────────────────────────────────────
// Metrics + alerts
// ─────────────────────────────────────────────────────────────
const metrics = computed(() => [
  { key: 'visits', value: recordStats.value.visits, label: t('patientRecord.statsVisits') },
  { key: 'prescriptions', value: recordStats.value.prescriptions, label: t('patientRecord.statsPrescriptions') },
  { key: 'notes', value: recordStats.value.notes, label: t('patientRecord.statsNotes') },
  { key: 'doctors', value: recordStats.value.doctors, label: t('patientRecord.statsDoctors') },
])

const abnormalLabs = computed(() =>
  (profile.value?.labResults ?? []).filter((l: any) => l?.isAbnormal === true),
)

const alerts = computed(() => {
  const list: { icon: string; text: string; tone: string }[] = []
  if (allergies.value.length) {
    list.push({
      icon: 'mdi-alert-triangle-outline',
      text: `${toPersianNum(allergies.value.length)} ${t('patientRecord.clinical.allergies')}: ${allergies.value
        .slice(0, 3)
        .map((a) => a.substance)
        .join('، ')}`,
      tone: 'rose',
    })
  }
  if (abnormalLabs.value.length) {
    list.push({
      icon: 'mdi-flask-outline',
      text: t('patientRecord.clinical.abnormalLabs', { count: toPersianNum(abnormalLabs.value.length) }),
      tone: 'amber',
    })
  }
  if (overdueCount.value) {
    list.push({
      icon: 'mdi-shield-alert-outline',
      text: t('patientRecord.clinical.overdueScreenings', { count: toPersianNum(overdueCount.value) }),
      tone: 'rose',
    })
  }
  return list
})

useSeoMeta({ title: () => `${fullName.value} | ${t('patientRecord.title')}` })
</script>

<style scoped>
.pr-skel-wrap {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pr-skel-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 1rem;
}

/* ─── Page shell ─── */
.pr-page {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pr-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.pr-head__copy {
  min-width: 0;
}

.pr-back {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  color: var(--asa-accent-deep);
  font-size: 0.8125rem;
  font-weight: 600;
  transition: opacity 180ms var(--ease-premium);
}

.pr-back:hover {
  opacity: 0.75;
}

.pr-head__titleline {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  flex-wrap: wrap;
  margin-top: 0.375rem;
}

.pr-head__title {
  font-size: clamp(1.5rem, 1.15rem + 1.3vw, 2.125rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: var(--asa-label);
}

.pr-head__age {
  white-space: nowrap;
}

.pr-head__date {
  margin-top: 0.25rem;
  font-size: 0.8125rem;
  color: var(--asa-label-2);
}

.pr-head__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

/* ─── Identity strip ─── */
.pr-ident {
  padding: 1.125rem 1.25rem 0;
  overflow: hidden;
  background:
    radial-gradient(120% 160% at 100% 0%, color-mix(in srgb, var(--asa-accent) 12%, transparent), transparent 58%),
    var(--asa-bg-card);
}

.pr-ident__body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.45fr);
  gap: 1.25rem 1.75rem;
  align-items: center;
}

.pr-ident__who {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  min-width: 0;
}

.pr-ident__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  flex-shrink: 0;
  border-radius: 1.125rem;
  background: linear-gradient(140deg, #0e9a92 0%, #0b7c77 100%);
  box-shadow: 0 12px 24px -12px rgba(11, 124, 119, 0.55);
  color: #fff;
  font-size: 1.125rem;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.pr-ident__id {
  min-width: 0;
}

.pr-ident__name {
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--asa-label);
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.pr-ident__meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

.pr-ident__chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  padding: 0.1875rem 0.5rem;
  border-radius: 0.5rem;
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
  color: var(--asa-label-2);
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.4;
}

.pr-ident__chip--mono {
  font-family: ui-monospace, monospace;
  letter-spacing: 0.04em;
}

/* Facts */
.pr-facts {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.625rem 0.875rem;
  min-width: 0;
}

.pr-facts__cell {
  min-width: 0;
}

.pr-facts__cell--wide {
  grid-column: span 2;
}

.pr-facts__label {
  font-size: 0.625rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--asa-label-3);
}

.pr-facts__value {
  display: flex;
  align-items: center;
  gap: 0.3125rem;
  margin-top: 0.125rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--asa-label);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Alerts */
.pr-alertbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.875rem;
  padding-top: 0.875rem;
  border-top: 1px solid var(--asa-sep);
}

.pr-alert {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.3125rem 0.625rem;
  border-radius: 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  line-height: 1.4;
}

.pr-alert--rose {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

.pr-alert--amber {
  background: var(--asa-amber-soft);
  color: var(--asa-amber);
}

/* Metrics */
.pr-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 0.875rem -1.25rem 0;
  border-top: 1px solid var(--asa-sep);
}

.pr-metric {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  padding: 0.625rem 0.5rem;
  border-inline-end: 1px solid var(--asa-sep);
}

.pr-metric:last-child {
  border-inline-end: none;
}

.pr-metric__value {
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.pr-metric__label {
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--asa-label-2);
  text-align: center;
}

/* ─── Chart grid ─── */
.pr-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.62fr) minmax(19rem, 1fr);
  gap: 1rem;
  align-items: start;
}

.pr-grid__main {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.pr-side {
  min-width: 0;
}

/* ─── Snapshot rail ─── */
.pr-snap {
  padding: 0;
  overflow: hidden;
}

.pr-snap__head {
  padding: 1rem 1.125rem 0.875rem;
  border-bottom: 1px solid var(--asa-sep);
}

.pr-snap__heading {
  display: flex;
  align-items: center;
  gap: 0.625rem;
}

.pr-snap__block {
  padding: 0.75rem 1.125rem;
  border-bottom: 1px solid var(--asa-sep);
}

.pr-snap__block:last-of-type {
  border-bottom: none;
}

.pr-snap__label {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: var(--asa-label-2);
}

.pr-snap__count {
  margin-inline-start: auto;
  padding: 0 0.375rem;
  border-radius: 0.375rem;
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
  font-family: ui-monospace, monospace;
  font-size: 0.625rem;
  font-weight: 700;
  color: var(--asa-label-2);
}

.pr-snap__count--danger {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

.pr-snap__visit {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin-top: 0.5rem;
}

.pr-snap__visit-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
  line-height: 1.5;
}

.pr-snap__muted {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.6875rem;
  color: var(--asa-label-3);
  white-space: nowrap;
}

.pr-snap__muted--danger {
  color: var(--asa-rose);
  font-weight: 700;
}

.pr-snap__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.3125rem;
  margin-top: 0.5rem;
}

.pr-pill--danger {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

.pr-pill__sub {
  opacity: 0.8;
  font-size: 0.5625rem;
}

.pr-snap__list {
  display: flex;
  flex-direction: column;
  gap: 0.3125rem;
  margin-top: 0.5rem;
  list-style: none;
}

.pr-snap__list li {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.75rem;
  min-width: 0;
}

.pr-snap__item-name {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--asa-label);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pr-snap__empty {
  margin-top: 0.4375rem;
  font-size: 0.6875rem;
  color: var(--asa-label-3);
}

.pr-snap__more {
  margin-top: 0.375rem;
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--asa-accent-deep);
}

.pr-gp {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(3.5rem, 1fr));
  gap: 0.4375rem;
  margin-top: 0.5rem;
}

.pr-gp__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.0625rem;
  padding: 0.375rem 0.25rem;
  border-radius: 0.5rem;
  background: color-mix(in srgb, var(--asa-accent) 8%, transparent);
}

.pr-gp__value {
  font-size: 0.9375rem;
  font-weight: 800;
  color: var(--asa-accent-deep);
  line-height: 1.1;
}

.pr-gp__label {
  font-size: 0.5625rem;
  font-weight: 600;
  color: var(--asa-label-2);
  text-align: center;
}

.pr-snap__docs {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.75rem 1.125rem;
  border: none;
  border-top: 1px solid var(--asa-sep);
  background: color-mix(in srgb, var(--asa-accent) 5%, transparent);
  color: var(--asa-label);
  cursor: pointer;
  transition: background 180ms var(--ease-premium);
}

.pr-snap__docs:hover {
  background: color-mix(in srgb, var(--asa-accent) 10%, transparent);
}

.pr-snap__docs-ic {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.875rem;
  height: 1.875rem;
  flex-shrink: 0;
  border-radius: 0.5625rem;
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.pr-snap__docs-title {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
}

.pr-snap__docs-arrow {
  color: var(--asa-label-3);
}

/* ─── Feed panel: internal scroll on wide screens ─── */
.pr-feed-panel :deep(.pr-sec) {
  margin-top: 0;
}

@media (min-width: 1100px) {
  .pr-feed-panel :deep(.pr-card) {
    display: flex;
    flex-direction: column;
    min-height: 0;
    max-height: clamp(19rem, 46vh, 32rem);
  }

  .pr-feed-panel :deep(.pr-feed) {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
  }
}

/* ─── SMS dialog ─── */
.pr-sms {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.pr-sms__patient {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid var(--asa-sep);
  background: color-mix(in srgb, var(--asa-accent) 6%, transparent);
}

.pr-sms__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  border-radius: 0.75rem;
  background: linear-gradient(140deg, #0e9a92 0%, #0b7c77 100%);
  color: #fff;
  font-size: 0.8125rem;
  font-weight: 800;
}

.pr-sms__name {
  display: block;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--asa-label);
}

.pr-sms__phone {
  display: block;
  margin-top: 0.0625rem;
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

.pr-sms__label {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--asa-label-2);
}

.pr-sms__options {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.5rem;
}

.pr-sms__option {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--asa-sep);
  border-radius: 0.75rem;
  background: var(--asa-bg-card);
  color: inherit;
  text-decoration: none;
  text-align: start;
  cursor: pointer;
  transition: border-color 150ms var(--ease-default), background 150ms var(--ease-default);
}

.pr-sms__option:hover {
  border-color: color-mix(in srgb, var(--asa-accent) 45%, transparent);
}

.pr-sms__option--on {
  border-color: color-mix(in srgb, var(--asa-accent) 55%, transparent);
  background: var(--asa-accent-soft);
}

.pr-sms__opt-ic {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  flex-shrink: 0;
  border-radius: 0.625rem;
}

.pr-sms__opt-ic--teal {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.pr-sms__opt-ic--indigo {
  background: var(--asa-indigo-soft);
  color: var(--asa-indigo);
}

.pr-sms__opt-title {
  display: block;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--asa-label);
}

.pr-sms__opt-desc {
  display: block;
  margin-top: 0.125rem;
  font-size: 0.6875rem;
  line-height: 1.45;
  color: var(--asa-label-2);
}

.pr-sms__opt-arrow {
  margin-inline-start: auto;
  flex-shrink: 0;
  color: var(--asa-label-3);
}

.pr-sms__compose {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding-top: 0.25rem;
}

.pr-sms__textarea {
  width: 100%;
  min-height: 6rem;
  padding: 0.625rem 0.75rem;
  border: 1px solid var(--asa-card-ring);
  border-radius: 0.75rem;
  background: color-mix(in srgb, var(--asa-label) 4%, transparent);
  color: var(--asa-label);
  font-family: inherit;
  font-size: 0.8125rem;
  line-height: 1.7;
  resize: vertical;
  outline: none;
  transition: border-color 150ms var(--ease-default), box-shadow 150ms var(--ease-default);
}

.pr-sms__textarea::placeholder {
  color: var(--asa-label-3);
}

.pr-sms__textarea:focus {
  border-color: var(--asa-accent);
  box-shadow: 0 0 0 3px var(--asa-accent-soft);
}

.pr-sms__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  flex-wrap: wrap;
  font-size: 0.625rem;
  color: var(--asa-label-3);
}

.pr-sms__via {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

@media (min-width: 480px) {
  .pr-sms__options {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
}

/* ─── Responsive ─── */
@media (max-width: 1180px) {
  .pr-ident__body {
    grid-template-columns: minmax(0, 1fr);
    gap: 0.875rem;
  }
}

@media (max-width: 1099px) {
  .pr-grid {
    grid-template-columns: minmax(0, 1fr);
  }

  .pr-side {
    order: 2;
  }
}

@media (max-width: 720px) {
  .pr-facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .pr-facts__cell--wide {
    grid-column: span 2;
  }

  .pr-head {
    align-items: flex-start;
  }

  .pr-head__actions {
    width: 100%;
  }

  .pr-head__actions .asa-btn {
    flex: 1;
  }

  .pr-contact {
    flex: 0 0 auto;
  }

  .pr-hide-sm {
    display: none;
  }

  .pr-skel-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 420px) {
  .pr-metric__label {
    font-size: 0.625rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .pr-back,
  .pr-snap__docs {
    transition: none;
  }
}
</style>
