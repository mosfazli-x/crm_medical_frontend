<template>
  <div class="app-rise">
    <!-- Loading -->
    <div v-if="loading" class="app-list">
      <div class="app-skel" style="height: 150px;" />
      <div class="app-skel" style="height: 260px;" />
      <div class="app-skel" style="height: 200px;" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="app-empty">
      <span class="app-empty__icon"><Icon name="lucide:file-x" size="26" /></span>
      <p>اطلاعات این بیمار یافت نشد</p>
      <NuxtLink to="/app/patients" class="app-btn app-btn--ghost" style="width: auto;">بازگشت به لیست</NuxtLink>
    </div>

    <!-- Form -->
    <form v-else novalidate @submit.prevent="submit">
      <div class="app-seg pr-seg">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="app-seg__btn"
          :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          <Icon :name="tab.icon" size="15" />
          <span>{{ tab.label }}</span>
        </button>
      </div>

      <!-- ─── Basic ─── -->
      <template v-if="activeTab === 'basic'">
        <div class="app-section"><h2>اطلاعات هویتی</h2></div>
        <section class="app-card app-pad ep-grid">
          <AppField label="نام" required :error="vErrors.firstName">
            <input v-model.trim="form.firstName" class="app-input" type="text" autocomplete="given-name">
          </AppField>
          <AppField label="نام خانوادگی" required :error="vErrors.lastName">
            <input v-model.trim="form.lastName" class="app-input" type="text" autocomplete="family-name">
          </AppField>
          <AppField label="کد ملی" :error="vErrors.nationalId">
            <input v-model.trim="form.nationalId" class="app-input" type="text" inputmode="numeric" dir="ltr" maxlength="10">
          </AppField>
          <AppField label="شماره تماس" :error="vErrors.phone">
            <input v-model.trim="form.phone" class="app-input" type="tel" inputmode="tel" dir="ltr" placeholder="09xxxxxxxxx">
          </AppField>
          <AppField label="تاریخ تولد">
            <PersianDatetimePicker
              v-model="form.birthDate"
              type="date"
              format="YYYY-MM-DD"
              display-format="jYYYY/jMM/jDD"
              color="#17a874"
              auto-submit
              clearable
              custom-input
              placeholder="انتخاب تاریخ تولد"
              input-class="app-input"
            />
            <label class="ep-check">
              <input v-model="form.birthDateExact" type="checkbox">
              <span>تاریخ تولد دقیق است</span>
            </label>
          </AppField>
          <AppField label="وضعیت تأهل">
            <select v-model="form.maritalStatus" class="app-input">
              <option value="">— انتخاب کنید —</option>
              <option v-for="m in maritalOptions" :key="m" :value="m">{{ m }}</option>
            </select>
          </AppField>
          <AppField label="نوع بیمه">
            <select v-model="form.insuranceType" class="app-input">
              <option value="">— انتخاب کنید —</option>
              <option v-for="opt in insuranceOptions" :key="opt.key" :value="opt.key">{{ opt.label }}</option>
            </select>
          </AppField>
          <AppField label="کد بیمه">
            <input v-model.trim="form.insuranceCode" class="app-input" type="text" dir="ltr">
          </AppField>
          <AppField label="آدرس" class="ep-grid__wide">
            <textarea v-model.trim="form.address" class="app-input ep-textarea" rows="2" />
          </AppField>
        </section>
      </template>

      <!-- ─── Lifestyle ─── -->
      <template v-else-if="activeTab === 'lifestyle'">
        <div class="app-section"><h2>سبک زندگی</h2></div>
        <section class="app-card app-pad ep-grid">
          <AppField label="استعمال دخانیات">
            <select v-model="form.smoking" class="app-input">
              <option value="">— نامشخص —</option>
              <option value="بله">بله</option>
              <option value="خیر">خیر</option>
              <option value="ترک کرده">ترک کرده</option>
            </select>
          </AppField>
          <AppField label="فعالیت ورزشی">
            <select v-model="form.exercise" class="app-input">
              <option value="">— نامشخص —</option>
              <option value="بی‌تحرک">بی‌تحرک</option>
              <option value="کم">کم</option>
              <option value="متوسط">متوسط</option>
              <option value="زیاد">زیاد</option>
            </select>
          </AppField>
          <AppField label="مصرف الکل">
            <select v-model="form.alcohol" class="app-input">
              <option value="">— نامشخص —</option>
              <option value="بله">بله</option>
              <option value="خیر">خیر</option>
            </select>
          </AppField>
          <AppField label="BMI" :error="vErrors.bmi">
            <input v-model.number="form.bmi" class="app-input" type="number" step="0.1" min="0" dir="ltr">
          </AppField>
        </section>
      </template>

      <!-- ─── Medical history ─── -->
      <template v-else-if="activeTab === 'medical'">
        <div class="app-section">
          <h2>بیماری‌ها</h2>
          <button type="button" @click="addDisease">افزودن</button>
        </div>
        <section class="app-card app-pad ep-list">
          <div v-for="(d, i) in form.diseases" :key="`d${i}`" class="ep-item">
            <input v-model.trim="d.name" class="app-input" type="text" placeholder="نام بیماری">
            <input v-model="d.diagnosedAt" class="app-input" type="date" dir="ltr" aria-label="تاریخ تشخیص">
            <button type="button" class="ep-remove" aria-label="حذف" @click="form.diseases.splice(i, 1)">
              <Icon name="lucide:trash-2" size="17" />
            </button>
          </div>
          <p v-if="!form.diseases.length" class="ep-hint">موردی ثبت نشده است</p>
        </section>

        <div class="app-section">
          <h2>داروهای مصرفی</h2>
          <button type="button" @click="addMedication">افزودن</button>
        </div>
        <section class="app-card app-pad ep-list">
          <div v-for="(m, i) in form.medications" :key="`m${i}`" class="ep-item">
            <input v-model.trim="m.name" class="app-input" type="text" placeholder="نام دارو">
            <input v-model.trim="m.dosage" class="app-input" type="text" placeholder="دوز" dir="ltr">
            <button type="button" class="ep-remove" aria-label="حذف" @click="form.medications.splice(i, 1)">
              <Icon name="lucide:trash-2" size="17" />
            </button>
          </div>
          <p v-if="!form.medications.length" class="ep-hint">موردی ثبت نشده است</p>
        </section>

        <div class="app-section">
          <h2>حساسیت‌ها</h2>
          <button type="button" @click="addAllergy">افزودن</button>
        </div>
        <section class="app-card app-pad ep-list">
          <div v-for="(a, i) in form.allergies" :key="`a${i}`" class="ep-item">
            <input v-model.trim="a.substance" class="app-input" type="text" placeholder="ماده حساسیت‌زا">
            <select v-model="a.severity" class="app-input">
              <option v-for="s in severityOptions" :key="s" :value="s">{{ s }}</option>
            </select>
            <button type="button" class="ep-remove" aria-label="حذف" @click="form.allergies.splice(i, 1)">
              <Icon name="lucide:trash-2" size="17" />
            </button>
          </div>
          <p v-if="!form.allergies.length" class="ep-hint">موردی ثبت نشده است</p>
        </section>

        <div class="app-section">
          <h2>واکسیناسیون</h2>
          <button type="button" @click="addVaccination">افزودن</button>
        </div>
        <section class="app-card app-pad ep-list">
          <div v-for="(v, i) in form.vaccinations" :key="`v${i}`" class="ep-item">
            <input v-model.trim="v.vaccineName" class="app-input" type="text" placeholder="نام واکسن">
            <input v-model.trim="v.doseNumber" class="app-input" type="text" placeholder="دوز">
            <input v-model="v.dateAdministered" class="app-input" type="date" dir="ltr" aria-label="تاریخ تزریق">
            <button type="button" class="ep-remove" aria-label="حذف" @click="form.vaccinations.splice(i, 1)">
              <Icon name="lucide:trash-2" size="17" />
            </button>
          </div>
          <p v-if="!form.vaccinations.length" class="ep-hint">موردی ثبت نشده است</p>
        </section>
      </template>
    </form>

    <!-- Sticky footer -->
    <div v-if="!loading && !error" class="ep-foot">
      <NuxtLink :to="`/app/patients/${id}`" class="app-btn app-btn--ghost">انصراف</NuxtLink>
      <button type="button" class="app-btn app-btn--primary" :disabled="saving" @click="submit">
        <Icon v-if="saving" name="lucide:loader-2" size="17" class="ep-spin" />
        <Icon v-else name="lucide:check" size="17" />
        {{ saving ? 'در حال ذخیره…' : 'ذخیره تغییرات' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PatientFullProfile } from '~/types/patient'
import { INSURANCE_TYPE_VALUES } from '~/types/insurance'

definePageMeta({ layout: 'app', appTitle: 'ویرایش بیمار', appBack: '/app/patients' })

const route = useRoute()
const id = computed(() => String(route.params.id))
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

const loading = ref(true)
const error = ref(false)
const saving = ref(false)

const form = reactive({
  firstName: '',
  lastName: '',
  nationalId: '',
  insuranceCode: '',
  insuranceType: '',
  phone: '',
  address: '',
  maritalStatus: '',
  birthDate: null as string | null,
  birthDateExact: true as boolean | null,
  smoking: '',
  exercise: '',
  alcohol: '',
  bmi: null as number | null,
  diseases: [] as { id?: string; name: string; diagnosedAt: string | null }[],
  medications: [] as { id?: string; name: string; dosage: string }[],
  allergies: [] as { id?: string; substance: string; severity: string }[],
  vaccinations: [] as {
    id?: string
    vaccineName: string
    doseNumber: string
    dateAdministered: string | null
  }[],
})

const insuranceOptions = INSURANCE_TYPE_VALUES
const maritalOptions = ['مجرد', 'متاهل', 'مطلقه', 'بیوه']
const severityOptions = ['خفیف', 'متوسط', 'شدید']

type TabValue = 'basic' | 'lifestyle' | 'medical'
const activeTab = ref<TabValue>('basic')
const tabs: { value: TabValue; label: string; icon: string }[] = [
  { value: 'basic', label: 'هویتی', icon: 'lucide:user' },
  { value: 'lifestyle', label: 'سبک زندگی', icon: 'lucide:activity' },
  { value: 'medical', label: 'سوابق پزشکی', icon: 'lucide:heart-pulse' },
]

function fill(data: PatientFullProfile) {
  const b = data.basicInfo
  Object.assign(form, {
    firstName: b.firstName ?? '',
    lastName: b.lastName ?? '',
    nationalId: b.nationalId ?? '',
    insuranceCode: b.insuranceCode ?? '',
    insuranceType: b.insuranceType ?? '',
    phone: b.phone ?? '',
    address: b.address ?? '',
    maritalStatus: b.maritalStatus ?? '',
    birthDate: b.birthDate ? String(b.birthDate).slice(0, 10) : null,
    birthDateExact: b.birthDateExact ?? true,
    smoking: b.smoking ?? '',
    exercise: b.exercise ?? '',
    alcohol: b.alcohol ?? '',
    bmi: b.bmi != null && b.bmi !== '' ? Number(b.bmi) : null,
    diseases: (data.medicalHistory?.diseases ?? []).map((d) => ({
      id: d.id,
      name: d.name,
      diagnosedAt: d.diagnosedAt ? String(d.diagnosedAt).slice(0, 10) : null,
    })),
    medications: (data.medicalHistory?.medications ?? []).map((m) => ({
      id: m.id,
      name: m.name,
      dosage: m.dosage ?? '',
    })),
    allergies: (data.medicalHistory?.allergies ?? []).map((a) => ({
      id: a.id,
      substance: a.substance,
      severity: a.severity || 'متوسط',
    })),
    vaccinations: (data.medicalHistory?.vaccinations ?? []).map((v) => ({
      id: v.id,
      vaccineName: v.vaccineName,
      doseNumber: v.doseNumber ?? '',
      dateAdministered: v.dateAdministered ? String(v.dateAdministered).slice(0, 10) : null,
    })),
  })
}

async function load() {
  loading.value = true
  error.value = false
  try {
    const res = await apiFetch<{ success: boolean; data: PatientFullProfile }>(`/api/patients/${id.value}/profile`)
    if (res?.success && res.data) fill(res.data)
    else error.value = true
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

const addDisease = () => form.diseases.push({ name: '', diagnosedAt: null })
const addMedication = () => form.medications.push({ name: '', dosage: '' })
const addAllergy = () => form.allergies.push({ substance: '', severity: 'متوسط' })
const addVaccination = () => form.vaccinations.push({ vaccineName: '', doseNumber: '', dateAdministered: null })

// ─── Validation ───
type ErrorKey = 'firstName' | 'lastName' | 'nationalId' | 'phone' | 'bmi'
const vErrors = reactive<Record<ErrorKey, string>>({
  firstName: '',
  lastName: '',
  nationalId: '',
  phone: '',
  bmi: '',
})

function validate(): boolean {
  vErrors.firstName = form.firstName.length < 2 ? 'نام باید حداقل ۲ حرف باشد' : ''
  vErrors.lastName = form.lastName.length < 2 ? 'نام خانوادگی باید حداقل ۲ حرف باشد' : ''
  vErrors.nationalId = form.nationalId && !/^\d{10}$/.test(form.nationalId) ? 'کد ملی باید ۱۰ رقم باشد' : ''
  vErrors.phone = form.phone && !/^09\d{9}$/.test(form.phone) ? 'شماره تماس معتبر نیست (۰۹xxxxxxxxx)' : ''
  vErrors.bmi = form.bmi !== null && (Number.isNaN(form.bmi) || form.bmi <= 0) ? 'BMI نامعتبر است' : ''

  const firstError = (Object.keys(vErrors) as ErrorKey[]).find((k) => vErrors[k])
  if (firstError) {
    activeTab.value = firstError === 'bmi' ? 'lifestyle' : 'basic'
    $toast.error(vErrors[firstError])
    return false
  }
  return true
}

function buildPayload() {
  const withId = <T extends { id?: string }>(item: T, rest: Record<string, unknown>) =>
    item.id ? { id: item.id, ...rest } : rest

  return {
    first_name: form.firstName,
    last_name: form.lastName,
    national_id: form.nationalId || null,
    insurance_code: form.insuranceCode || null,
    insurance_type: form.insuranceType || null,
    phone: form.phone || '',
    address: form.address || null,
    marital_status: form.maritalStatus || null,
    birth_date: form.birthDate || null,
    birth_date_exact: form.birthDateExact,
    smoking: form.smoking || null,
    exercise: form.exercise || null,
    alcohol: form.alcohol || null,
    bmi: form.bmi ?? null,
    diseases: form.diseases
      .filter((d) => d.name.trim())
      .map((d) => withId(d, { name: d.name, diagnosed_at: d.diagnosedAt || null })),
    medications: form.medications
      .filter((m) => m.name.trim())
      .map((m) => withId(m, { name: m.name, dosage: m.dosage || null })),
    allergies: form.allergies
      .filter((a) => a.substance.trim())
      .map((a) => withId(a, { substance: a.substance, severity: a.severity || 'متوسط' })),
    vaccinations: form.vaccinations
      .filter((v) => v.vaccineName.trim())
      .map((v) =>
        withId(v, {
          vaccine_name: v.vaccineName,
          dose_number: v.doseNumber || null,
          date_administered: v.dateAdministered || null,
        }),
      ),
  }
}

async function submit() {
  if (!validate() || saving.value) return
  saving.value = true
  try {
    const fd = new FormData()
    fd.append('patient', JSON.stringify(buildPayload()))
    await apiFetch(`/api/patients/${id.value}`, { method: 'PUT', body: fd })
    $toast.success('اطلاعات بیمار با موفقیت ذخیره شد')
    await navigateTo(`/app/patients/${id.value}`)
  } catch (err: unknown) {
    const e = err as { data?: { error?: string }; message?: string }
    $toast.error(e?.data?.error || e?.message || 'خطا در ذخیره اطلاعات')
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.pr-seg {
  display: flex;
  width: 100%;
}

.ep-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px 12px;
}

.ep-grid__wide {
  grid-column: 1 / -1;
}

.ep-textarea {
  resize: vertical;
  min-height: 56px;
}

.ep-check {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
  font-size: 12.5px;
  color: var(--app-text-2);
}

.ep-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ep-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.ep-item .app-input {
  flex: 1 1 auto;
  min-width: 0;
}

.ep-item .app-input[type='date'] {
  flex: 0 0 44%;
}

.ep-remove {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: 1px solid var(--app-border);
  background: var(--app-rose-soft);
  color: var(--app-expense);
  cursor: pointer;
}

.ep-hint {
  font-size: 12.5px;
  color: var(--app-muted);
  text-align: center;
  padding: 6px 0;
}

.ep-foot {
  position: sticky;
  bottom: calc(var(--app-nav-h) + env(safe-area-inset-bottom, 0px));
  display: flex;
  gap: 10px;
  margin-top: 20px;
  padding: 12px;
  border-radius: var(--app-radius);
  background: color-mix(in srgb, var(--app-surface) 92%, transparent);
  backdrop-filter: saturate(180%) blur(12px);
  border: 1px solid var(--app-border);
}

.ep-foot .app-btn {
  flex: 1 1 auto;
}

.ep-spin {
  animation: ep-spin 0.8s linear infinite;
}

@keyframes ep-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 440px) {
  .ep-grid {
    grid-template-columns: 1fr;
  }

  .ep-item {
    flex-wrap: wrap;
  }

  .ep-item .app-input[type='date'] {
    flex: 1 1 100%;
  }
}
</style>
