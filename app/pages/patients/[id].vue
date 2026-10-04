<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- ─── Loading ─── -->
    <div v-if="profileLoading" class="pr-skel-wrap">
      <div class="asa-skel rounded-[28px]! h-44!" />
      <div class="grid! grid-cols-2! min-[520px]:grid-cols-4! gap-3! sm:gap-4!">
        <div v-for="i in 4" :key="`ms-${i}`" class="asa-skel rounded-[22px]! h-28!" />
      </div>
      <div class="asa-skel rounded-[22px]! h-96!" />
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

    <template v-else>
      <!-- ─── Apple-style large-title header ─── -->
      <header class="pr-head">
        <div class="pr-head__copy">
          <NuxtLink to="/patients" class="pr-back">
            <AltArrowLeft class="w-3.5! h-3.5! fill-current" />
            <span>{{ t('patientRecord.backToList') }}</span>
          </NuxtLink>
          <h1 class="pr-head__title">{{ fullName }}</h1>
          <p class="pr-head__date">{{ t('patientRecord.subtitle') }}</p>
        </div>
        <div class="pr-head__actions">
          <button
            class="asa-btn asa-btn--ghost"
            :disabled="profileLoading"
            :aria-label="t('patientRecord.refresh')"
            @click="refreshAll"
          >
            <v-icon size="16" :class="{ 'pf-spin': refreshing }">mdi-refresh</v-icon>
          </button>
        </div>
      </header>

      <!-- ─── Identity hero ─── -->
      <section class="asa-hero pr-hero">
        <div class="pr-hero__glow" aria-hidden="true" />

        <div class="pr-hero__top">
          <div class="pr-avatar" aria-hidden="true">{{ initials }}</div>

          <div class="pr-hero__id">
            <h2 class="pr-hero__name">{{ fullName }}</h2>

            <div class="pr-hero__pills">
              <span v-if="isForeign" class="pr-hero__pill">
                <img v-if="countryFlag" :src="countryFlag" alt="" class="w-4! h-3! object-contain" />
                <span>{{ nationalityLabel }}</span>
              </span>
              <span v-if="nationalId" class="pr-hero__pill pr-hero__pill--mono" dir="ltr">
                {{ nationalId }}
              </span>
              <span v-if="phone" class="pr-hero__pill" dir="ltr">
                <v-icon size="13">mdi-phone-outline</v-icon>
                {{ phone }}
              </span>
              <span v-if="birthDate && birthDateExact === false" class="pr-hero__pill">
                {{ t('patients.approxDob') }}
              </span>
            </div>
          </div>

          <div class="pr-hero__badge">
            <HeartPulse class="w-6! h-6! fill-current" />
            <span class="pr-hero__badge-value">{{ toPersianNum(age ?? 0) }}</span>
            <span class="pr-hero__badge-label">{{ t('patientRecord.yearsOld') }}</span>
          </div>
        </div>

        <dl class="pr-facts">
          <div v-for="fact in facts" :key="fact.label" class="pr-facts__cell">
            <dt class="pr-facts__label">{{ fact.label }}</dt>
            <dd class="pr-facts__value" :dir="fact.ltr ? 'ltr' : undefined">
              <component :is="fact.icon" v-if="fact.icon" class="w-3.5! h-3.5! fill-current" />
              <span>{{ fact.value }}</span>
            </dd>
          </div>
        </dl>
      </section>

      <!-- ─── Record metrics ─── -->
      <div class="grid! grid-cols-2! min-[520px]:grid-cols-4! gap-3! sm:gap-4! mt-5!">
        <div class="asa-card pf-metric">
          <div class="asa-tint asa-tint--indigo">
            <MedicalKit class="w-5! h-5! fill-current" />
          </div>
          <div class="pf-metric__copy">
            <p class="pf-metric__value">{{ toPersianNum(recordStats.visits) }}</p>
            <p class="pf-metric__label">{{ t('patientRecord.statsVisits') }}</p>
          </div>
        </div>

        <div class="asa-card pf-metric">
          <div class="asa-tint asa-tint--green">
            <ClipboardCheck class="w-5! h-5! fill-current" />
          </div>
          <div class="pf-metric__copy">
            <p class="pf-metric__value">{{ toPersianNum(recordStats.prescriptions) }}</p>
            <p class="pf-metric__label">{{ t('patientRecord.statsPrescriptions') }}</p>
          </div>
        </div>

        <div class="asa-card pf-metric">
          <div class="asa-tint asa-tint--amber">
            <DocumentText class="w-5! h-5! fill-current" />
          </div>
          <div class="pf-metric__copy">
            <p class="pf-metric__value">{{ toPersianNum(recordStats.notes) }}</p>
            <p class="pf-metric__label">{{ t('patientRecord.statsNotes') }}</p>
          </div>
        </div>

        <div class="asa-card pf-metric">
          <div class="asa-tint asa-tint--teal">
            <UsersGroup class="w-5! h-5! fill-current" />
          </div>
          <div class="pf-metric__copy">
            <p class="pf-metric__value">{{ toPersianNum(recordStats.doctors) }}</p>
            <p class="pf-metric__label">{{ t('patientRecord.statsDoctors') }}</p>
          </div>
        </div>
      </div>

      <!-- ─── Case summary (unified feed) ─── -->
      <PatientCaseFeed :patient-id="patientId" :patient-name="fullName" @stats="onFeedStats" />

      <!-- ─── Test results ─── -->
      <section class="pr-sec">
        <div class="pr-sec__head">
          <div class="pr-sec__copy">
            <h2 class="asa-card-title">{{ t('patientRecord.tests') }}</h2>
            <p class="asa-card-sub">{{ t('patientRecord.testsDesc') }}</p>
          </div>
        </div>
        <div class="pr-lab">
          <LabResultsSection :patient-id="patientId" />
        </div>
      </section>
    </template>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePatientProfile } from '~/composables/usePatientProfile'
import { loadFlagSvg, countryName } from '~/composables/useCountries'
import AltArrowLeft from '~/components/icons/AltArrowLeft.vue'
import HeartPulse from '~/components/icons/HeartPulse.vue'
import DocumentText from '~/components/icons/DocumentText.vue'
import UsersGroup from '~/components/icons/UsersGroup.vue'
import Calendar from '~/components/icons/Calendar.vue'
import ShieldCheck from '~/components/icons/ShieldCheck.vue'
import ClipboardCheck from '~/components/icons/ClipboardCheck.vue'
import MedicalKit from '~/components/icons/MedicalKit.vue'
import Profile from '~/components/icons/Profile.vue'
import Task from '~/components/icons/Task.vue'
import Clock from '~/components/icons/Clock.vue'
import PatientCaseFeed from '~/components/patient/PatientCaseFeed.vue'

const route = useRoute()
const { t } = useI18n()
const { toPersianNum } = useLang()

const patientId = computed(() => String(route.params.id || ''))

const {
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

const birthLabel = computed(() => {
  if (!birthDate.value) return '---'
  const text = formatDate(birthDate.value)
  if (age.value === null) return text
  return `${text} (${toPersianNum(age.value)})`
})

function formatDate(value: string): string {
  try {
    const d = new Date(value)
    if (Number.isNaN(d.getTime())) return value
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'long', day: 'numeric' }).format(d)
  } catch {
    return value
  }
}

const facts = computed(() => {
  const list: { label: string; value: string; ltr?: boolean; icon?: any }[] = []

  if (birthDate.value) {
    list.push({ label: t('patientRecord.birthDate'), value: birthLabel.value, icon: Calendar })
  }
  if (phone.value) {
    list.push({ label: t('patientRecord.phone'), value: phone.value, ltr: true, icon: Profile })
  }
  if (maritalStatus.value) {
    list.push({ label: t('patientRecord.maritalStatus'), value: maritalStatus.value, icon: UsersGroup })
  }
  if (insuranceType.value) {
    list.push({ label: t('patientRecord.insuranceType'), value: insuranceType.value, icon: ShieldCheck })
  }
  if (insuranceCode.value) {
    list.push({ label: t('patientRecord.insuranceCode'), value: insuranceCode.value, ltr: true, icon: Task })
  }
  if (createdAt.value) {
    list.push({ label: t('patientRecord.registeredAt'), value: formatDate(createdAt.value), icon: Clock })
  }

  return list
})

useSeoMeta({ title: () => `${fullName.value} | ${t('patientRecord.title')}` })
</script>

<style scoped>
.pr-skel-wrap {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.pr-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.25rem;
  flex-wrap: wrap;
}

.pr-head__copy {
  min-width: 0;
}

.pr-head__title {
  margin-top: 0.5rem;
  font-size: clamp(1.75rem, 1.2rem + 2vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--asa-label);
  line-height: 1.15;
}

.pr-head__date {
  margin-top: 0.375rem;
  font-size: 0.875rem;
  color: var(--asa-label-2);
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

/* ─── Identity hero ─── */
.pr-hero {
  position: relative;
  margin-top: 1.25rem;
  padding: 1.75rem;
}

.pr-hero__glow {
  position: absolute;
  inset-inline-end: -4rem;
  top: -6rem;
  width: 22rem;
  height: 22rem;
  border-radius: 9999px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.16), transparent 62%);
  pointer-events: none;
}

.pr-hero__top {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1.125rem;
  flex-wrap: wrap;
}

.pr-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  flex-shrink: 0;
  border-radius: 1.375rem;
  background: rgba(255, 255, 255, 0.18);
  border: 1px solid rgba(255, 255, 255, 0.28);
  backdrop-filter: blur(6px);
  font-size: 1.375rem;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.pr-hero__id {
  flex: 1;
  min-width: 0;
}

.pr-hero__name {
  font-size: 1.375rem;
  font-weight: 800;
  color: #fff;
  line-height: 1.3;
  overflow-wrap: anywhere;
}

.pr-hero__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4375rem;
  margin-top: 0.625rem;
}

.pr-hero__pill {
  display: inline-flex;
  align-items: center;
  gap: 0.3125rem;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.22);
  font-size: 0.6875rem;
  font-weight: 600;
  color: #fff;
}

.pr-hero__pill--mono {
  font-family: ui-monospace, monospace;
  letter-spacing: 0.08em;
}

.pr-hero__badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  padding: 0.875rem 1.125rem;
  border-radius: 1.125rem;
  background: rgba(255, 255, 255, 0.14);
  border: 1px solid rgba(255, 255, 255, 0.24);
  color: #fff;
}

.pr-hero__badge-value {
  font-size: 1.375rem;
  font-weight: 800;
  line-height: 1.1;
}

.pr-hero__badge-label {
  font-size: 0.625rem;
  font-weight: 600;
  opacity: 0.82;
}

/* ─── Facts strip ─── */
.pr-facts {
  position: relative;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: 1rem 1.25rem;
  margin-top: 1.5rem;
  padding-top: 1.375rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.pr-facts__cell {
  min-width: 0;
}

.pr-facts__label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.72);
}

.pr-facts__value {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.3125rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #fff;
  overflow-wrap: anywhere;
}

/* ─── Tests section ─── */
.pr-sec {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2.25rem;
}

.pr-sec__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.pr-sec__copy {
  min-width: 0;
}

/* LabResultsSection brings its own heading; the page already provides
   one, so suppress the duplicate and keep its action button. */
.pr-lab :deep(.crm-section-title),
.pr-lab :deep(.crm-section-subtitle) {
  display: none;
}

.pr-lab :deep(.space-y-6 > div:first-child) {
  justify-content: flex-end;
}

@media (max-width: 560px) {
  .pr-hero {
    padding: 1.25rem;
  }

  .pr-hero__badge {
    flex-direction: row;
    align-items: baseline;
    gap: 0.375rem;
    padding: 0.625rem 0.875rem;
  }

  .pr-hero__name {
    font-size: 1.125rem;
  }
}
</style>
