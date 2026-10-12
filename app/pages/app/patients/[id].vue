<template>
  <div class="app-rise">
    <div v-if="loading" class="app-list">
      <div class="app-skel" style="height: 140px;" />
      <div class="app-skel" style="height: 220px;" />
    </div>

    <div v-else-if="error || !profile" class="app-empty">
      <span class="app-empty__icon"><Icon name="lucide:file-x" size="26" /></span>
      <p>اطلاعات این بیمار یافت نشد</p>
      <NuxtLink to="/app/patients" class="app-btn app-btn--ghost" style="width: auto;">بازگشت به لیست</NuxtLink>
    </div>

    <template v-else>
      <!-- Identity -->
      <section class="app-card app-pad" style="display: flex; align-items: center; gap: 14px;">
        <span class="app-avatar" style="width: 58px; height: 58px; font-size: 19px;">{{ initials }}</span>
        <div style="min-width: 0; flex: 1;">
          <h1 style="font-size: 18px; font-weight: 800;">{{ fullName }}</h1>
          <p class="app-muted" style="font-size: 12.5px; margin-top: 4px;">
            {{ basic.insurance_type || 'بدون نوع بیمه' }}
            <template v-if="basic.insurance_code"> · کد {{ basic.insurance_code }}</template>
          </p>
        </div>
      </section>

      <!-- Quick actions -->
      <div class="app-grid-2 app-mt-16">
        <a
          v-if="basic.phone"
          class="app-btn app-btn--ghost"
          :href="`tel:${basic.phone}`"
        >
          <Icon name="lucide:phone" size="18" />
          تماس
        </a>
        <a
          v-if="basic.phone"
          class="app-btn app-btn--ghost"
          :href="`sms:${basic.phone}`"
        >
          <Icon name="lucide:message-square" size="18" />
          پیامک
        </a>
      </div>

      <!-- Details -->
      <div class="app-section">
        <h2>مشخصات</h2>
      </div>
      <section class="app-card app-pad">
        <dl class="app-dl">
          <div v-for="row in details" :key="row.label" class="app-dl__row">
            <dt>{{ row.label }}</dt>
            <dd>{{ row.value }}</dd>
          </div>
        </dl>
      </section>

      <!-- Latest visit -->
      <template v-if="basic.latest_visit?.visit_date || basic.latest_visit?.pregnancy_notes">
        <div class="app-section">
          <h2>آخرین ویزیت</h2>
        </div>
        <section class="app-card app-pad">
          <p class="app-muted" style="font-size: 12.5px;">
            {{ jDate(basic.latest_visit?.visit_date) }}
          </p>
          <p v-if="basic.latest_visit?.pregnancy_notes" style="margin-top: 8px; font-size: 14px; line-height: 1.9;">
            {{ basic.latest_visit.pregnancy_notes }}
          </p>
        </section>
      </template>

      <NuxtLink
        :to="`/patients/${id}`"
        class="app-btn app-btn--ghost app-mt-16"
        style="text-decoration: none;"
      >
        <Icon name="lucide:external-link" size="18" />
        پروندهٔ کامل در نسخهٔ وب
      </NuxtLink>
    </template>
  </div>
</template>

<script setup lang="ts">
import moment from 'moment-jalaali'
import type { PatientProfile } from '~/types/patient'

definePageMeta({ layout: 'app', appTitle: 'پروندهٔ بیمار', appBack: '/app/patients' })

const route = useRoute()
const id = computed(() => String(route.params.id))
const { apiFetch } = useApi()

const profile = ref<PatientProfile | null>(null)
const loading = ref(true)
const error = ref(false)

const basic = computed(() => profile.value?.basicInfo ?? ({} as PatientProfile['basicInfo']))

const fullName = computed(() =>
  [basic.value.first_name, basic.value.last_name].filter(Boolean).join(' ') || 'بیمار بدون نام',
)
const initials = computed(() => `${basic.value.first_name?.[0] || ''}${basic.value.last_name?.[0] || ''}` || '؟')

const jDate = (value?: string | null) => (value ? moment(value).format('jD jMMMM jYYYY') : '—')

const details = computed(() => [
  { label: 'شماره تماس', value: basic.value.phone || '—' },
  { label: 'کد ملی', value: basic.value.national_id || '—' },
  { label: 'تاریخ تولد', value: jDate(basic.value.birth_date) },
  { label: 'وضعیت تأهل', value: basic.value.marital_status || '—' },
  { label: 'نوع بیمه', value: basic.value.insurance_type || '—' },
  { label: 'کد بیمه', value: basic.value.insurance_code || '—' },
  { label: 'آدرس', value: basic.value.address || '—' },
])

async function load() {
  loading.value = true
  error.value = false
  try {
    const res = await apiFetch<{ success: boolean; data: PatientProfile }>(`/api/patients/${id.value}/profile`)
    profile.value = res?.success ? res.data : null
    if (!profile.value) error.value = true
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

watch(profile, (value) => {
  if (value) route.meta.appTitle = fullName.value
})

onMounted(load)
</script>

<style scoped>
.app-dl {
  display: flex;
  flex-direction: column;
}

.app-dl__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid var(--app-border);
}

.app-dl__row:last-child {
  border-bottom: none;
}

.app-dl__row dt {
  flex: 0 0 auto;
  font-size: 12.5px;
  color: var(--app-muted);
}

.app-dl__row dd {
  flex: 1 1 auto;
  text-align: end;
  font-size: 14px;
  font-weight: 600;
  color: var(--app-text);
  word-break: break-word;
}
</style>
