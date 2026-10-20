<template>
  <div class="app-rise">
    <!-- Loading -->
    <div v-if="loading" class="app-list">
      <div class="app-skel" style="height: 130px;" />
      <div class="app-skel" style="height: 52px;" />
      <div class="app-skel" style="height: 260px;" />
    </div>

    <!-- Error -->
    <div v-else-if="error || !profile" class="app-empty">
      <span class="app-empty__icon"><Icon name="lucide:file-x" size="26" /></span>
      <p>اطلاعات این بیمار یافت نشد</p>
      <NuxtLink to="/app/patients" class="app-btn app-btn--ghost" style="width: auto;">بازگشت به لیست</NuxtLink>
    </div>

    <template v-else>
      <!-- ─── Identity hero ─── -->
      <section class="app-card pr-hero">
        <div class="pr-hero__row">
          <span class="app-avatar pr-avatar">{{ initials }}</span>
          <div class="pr-hero__copy">
            <h1 class="pr-hero__name">{{ fullName }}</h1>
            <p class="pr-hero__sub">
              {{ insuranceLabel || 'بدون نوع بیمه' }}
              <template v-if="basic.insuranceCode"> · کد {{ basic.insuranceCode }}</template>
            </p>
          </div>
          <div v-if="age !== null" class="pr-age">
            <span class="pr-age__value">{{ pn(age) }}</span>
            <span class="pr-age__label">سال</span>
          </div>
        </div>

        <div class="pr-hero__pills">
          <span v-if="basic.phone" class="app-pill app-pill--neutral" dir="ltr">
            <Icon name="lucide:phone" size="12" /> {{ basic.phone }}
          </span>
          <span v-if="basic.nationalId" class="app-pill app-pill--neutral" dir="ltr">
            <Icon name="lucide:id-card" size="12" /> {{ basic.nationalId }}
          </span>
          <span v-if="basic.maritalStatus" class="app-pill app-pill--neutral">{{ basic.maritalStatus }}</span>
        </div>
      </section>

      <!-- ─── Quick actions ─── -->
      <div class="app-grid-2 app-mt-16 pr-actions">
        <a v-if="basic.phone" class="app-btn app-btn--ghost" :href="`tel:${basic.phone}`">
          <Icon name="lucide:phone" size="18" /> تماس
        </a>
        <a v-if="basic.phone" class="app-btn app-btn--ghost" :href="`sms:${basic.phone}`">
          <Icon name="lucide:message-square" size="18" /> پیامک
        </a>
        <NuxtLink :to="`/app/patients/${id}/edit`" class="app-btn app-btn--primary pr-edit">
          <Icon name="lucide:pencil" size="18" /> ویرایش اطلاعات
        </NuxtLink>
      </div>

      <!-- ─── Alert strip (allergies + abnormal labs) ─── -->
      <section v-if="alerts.length" class="pr-alerts">
        <div v-for="a in alerts" :key="a.text" class="pr-alert" :class="`pr-alert--${a.tone}`">
          <Icon :name="a.icon" size="16" />
          <span>{{ a.text }}</span>
        </div>
      </section>

      <!-- ─── Section tabs ─── -->
      <div class="app-seg pr-seg app-mt-16">
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
          <span v-if="tab.count" class="pr-seg__count">{{ pn(tab.count) }}</span>
        </button>
      </div>

      <!-- ─── Overview ─── -->
      <template v-if="activeTab === 'overview'">
        <div class="pr-stats app-mt-16">
          <div class="app-stat">
            <span class="app-stat__label"><Icon name="lucide:stethoscope" size="14" /> ویزیت‌ها</span>
            <span class="app-stat__value">{{ pn(stats.visits) }}</span>
          </div>
          <div class="app-stat">
            <span class="app-stat__label"><Icon name="lucide:pill" size="14" /> داروها</span>
            <span class="app-stat__value">{{ pn(stats.medications) }}</span>
          </div>
          <div class="app-stat">
            <span class="app-stat__label"><Icon name="lucide:flask-conical" size="14" /> آزمایش‌ها</span>
            <span class="app-stat__value">{{ pn(stats.labs) }}</span>
          </div>
        </div>

        <div class="app-section"><h2>مشخصات</h2></div>
        <section class="app-card app-pad">
          <dl class="pr-dl">
            <div v-for="row in details" :key="row.label" class="pr-dl__row">
              <dt>{{ row.label }}</dt>
              <dd>{{ row.value }}</dd>
            </div>
          </dl>
        </section>

        <div v-if="latestVisit" class="app-section"><h2>آخرین ویزیت</h2></div>
        <section v-if="latestVisit" class="app-card app-pad pr-visit">
          <div class="pr-visit__head">
            <span class="app-pill app-pill--teal">{{ latestVisit.visitType || 'ویزیت' }}</span>
            <span class="app-muted" style="font-size: 12px;">{{ jDate(latestVisit.visitDate) }}</span>
          </div>
          <p v-if="latestVisit.visitReason" class="pr-visit__reason">{{ latestVisit.visitReason }}</p>
          <p v-if="latestVisit.notes" class="pr-visit__notes">{{ latestVisit.notes }}</p>
        </section>
      </template>

      <!-- ─── Medical history ─── -->
      <template v-else-if="activeTab === 'medical'">
        <AppRecordGroup icon="lucide:alert-triangle" tint="rose" title="حساسیت‌ها" :items="allergyItems" />
        <AppRecordGroup icon="lucide:activity" tint="amber" title="بیماری‌ها" :items="diseaseItems" />
        <AppRecordGroup icon="lucide:pill" tint="green" title="داروهای مصرفی" :items="medicationItems" />
        <AppRecordGroup icon="lucide:syringe" tint="indigo" title="واکسیناسیون" :items="vaccinationItems" />
      </template>

      <!-- ─── Visits ─── -->
      <template v-else-if="activeTab === 'visits'">
        <template v-if="visits.length">
          <article v-for="v in visits" :key="v.id" class="app-card app-pad pr-timeline-item">
            <div class="pr-timeline-item__head">
              <span class="app-pill app-pill--teal">{{ v.visitType || 'ویزیت' }}</span>
              <span class="app-muted" style="font-size: 12px;">{{ jDate(v.visitDate) }}</span>
            </div>
            <p v-if="v.visitReason" class="pr-timeline-item__title">{{ v.visitReason }}</p>
            <p v-if="v.notes" class="pr-timeline-item__body">{{ v.notes }}</p>
            <p v-if="v.nextVisitDate" class="pr-timeline-item__meta">
              <Icon name="lucide:calendar-clock" size="13" /> ویزیت بعدی: {{ jDate(v.nextVisitDate) }}
            </p>
          </article>
        </template>
        <AppEmpty v-else icon="lucide:stethoscope" text="ویزیتی ثبت نشده است" />
      </template>

      <!-- ─── Labs & screenings ─── -->
      <template v-else-if="activeTab === 'labs'">
        <AppRecordGroup icon="lucide:flask-conical" tint="indigo" title="نتایج آزمایش" :items="labItems" />
        <AppRecordGroup icon="lucide:shield-check" tint="amber" title="غربالگری‌ها" :items="screeningItems" />
      </template>

      <!-- ─── Obstetric ─── -->
      <template v-else-if="activeTab === 'obstetric'">
        <section v-if="hasReproSummary" class="app-card app-pad">
          <div class="pr-summary">
            <div v-for="s in reproSummary" :key="s.label" class="pr-summary__cell">
              <span class="pr-summary__value">{{ pn(s.value) }}</span>
              <span class="pr-summary__label">{{ s.label }}</span>
            </div>
          </div>
        </section>

        <template v-if="pregnancies.length">
          <article v-for="pg in pregnancies" :key="pg.id" class="app-card app-pad pr-timeline-item">
            <div class="pr-timeline-item__head">
              <span class="app-pill app-pill--indigo">بارداری {{ pn(pg.gravidaIndex ?? '') }}</span>
              <span class="app-muted" style="font-size: 12px;">{{ jDate(pg.lmp) }}</span>
            </div>
            <p v-if="pg.outcome || pg.deliveryMethod" class="pr-timeline-item__title">
              {{ pg.outcome || '' }}<template v-if="pg.deliveryMethod"> · {{ pg.deliveryMethod }}</template>
            </p>
            <p v-if="pg.notes" class="pr-timeline-item__body">{{ pg.notes }}</p>
          </article>
        </template>
        <AppEmpty v-else-if="!hasReproSummary" icon="lucide:baby" text="سابقه بارداری ثبت نشده است" />
      </template>

      <!-- ─── Attachments ─── -->
      <template v-else-if="activeTab === 'files'">
        <button type="button" class="app-btn app-btn--primary app-mt-16 pr-upload" @click="openUpload">
          <Icon name="lucide:upload" size="17" /> بارگذاری مستند
        </button>

        <section v-for="group in attachmentGroups" v-show="group.files.length" :key="group.key" class="app-mt-16">
          <div class="app-section">
            <h2>
              <Icon :name="group.icon" size="16" class="pr-group-icon" />
              {{ group.title }}
            </h2>
            <span class="app-muted" style="font-size: 12px; font-weight: 600;">{{ pn(group.files.length) }}</span>
          </div>
          <div class="app-card pr-files">
            <div v-for="file in group.files" :key="file.id" class="pr-file">
              <span class="pr-file__ico" :class="`pr-file__ico--${group.tint}`">
                <Icon :name="fileIcon(file.mimeType)" size="18" />
              </span>
              <div class="pr-file__body">
                <span class="pr-file__name">{{ file.fileName }}</span>
                <span class="pr-file__meta">
                  {{ formatSize(file.fileSize) }}
                  <template v-if="file.createdAt"> · {{ jDate(file.createdAt) }}</template>
                </span>
              </div>
              <div class="pr-file__acts">
                <button
                  type="button"
                  class="pr-icon-btn"
                  aria-label="مشاهده"
                  :disabled="busy.has(file.id)"
                  @click="viewFile(file)"
                >
                  <Icon
                    :name="busy.get(file.id) === 'view' ? 'lucide:loader-2' : 'lucide:eye'"
                    size="17"
                    :class="{ 'pr-spin': busy.get(file.id) === 'view' }"
                  />
                </button>
                <button
                  type="button"
                  class="pr-icon-btn"
                  aria-label="دانلود"
                  :disabled="busy.has(file.id)"
                  @click="downloadFile(file)"
                >
                  <Icon
                    :name="busy.get(file.id) === 'download' ? 'lucide:loader-2' : 'lucide:download'"
                    size="17"
                    :class="{ 'pr-spin': busy.get(file.id) === 'download' }"
                  />
                </button>
                <button
                  type="button"
                  class="pr-icon-btn pr-icon-btn--danger"
                  aria-label="حذف"
                  :disabled="busy.has(file.id)"
                  @click="confirmDelete(file)"
                >
                  <Icon
                    :name="busy.get(file.id) === 'delete' ? 'lucide:loader-2' : 'lucide:trash-2'"
                    size="17"
                    :class="{ 'pr-spin': busy.get(file.id) === 'delete' }"
                  />
                </button>
              </div>
            </div>
          </div>
        </section>

        <AppEmpty v-if="!attachmentCount" icon="lucide:paperclip" text="مستندی بارگذاری نشده است" />
      </template>

      <NuxtLink :to="`/patients/${id}`" class="app-btn app-btn--ghost app-mt-16 pr-web-link">
        <Icon name="lucide:external-link" size="17" />
        پروندهٔ کامل در نسخهٔ وب
      </NuxtLink>
    </template>

    <!-- ─── Upload dialog ─── -->
    <UiDialog v-model="uploadOpen" title="بارگذاری مستند" size="sm">
      <div class="pr-upload-form">
        <AppField label="نوع مستند" required :error="uploadTypeError">
          <select v-model="uploadType" class="app-input">
            <option value="">— انتخاب کنید —</option>
            <option v-for="opt in documentTypes" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </AppField>

        <AppField label="فایل‌ها" required :error="uploadFilesError">
          <label class="pr-drop">
            <Icon name="lucide:upload-cloud" size="26" />
            <span>انتخاب فایل (تصویر یا PDF)</span>
            <input
              type="file"
              class="pr-drop__input"
              accept="image/*,application/pdf"
              multiple
              @change="onPickFiles"
            >
          </label>
        </AppField>

        <div v-if="uploadFiles.length" class="pr-picked">
          <div v-for="(f, i) in uploadFiles" :key="`${f.name}-${i}`" class="pr-picked__row">
            <Icon name="lucide:file" size="15" />
            <span class="pr-picked__name">{{ f.name }}</span>
            <span class="pr-picked__size">{{ formatSize(f.size) }}</span>
            <button type="button" class="pr-picked__rm" aria-label="حذف" @click="uploadFiles.splice(i, 1)">
              <Icon name="lucide:x" size="15" />
            </button>
          </div>
        </div>
      </div>
      <template #footer>
        <button type="button" class="app-btn app-btn--ghost" @click="uploadOpen = false">انصراف</button>
        <button type="button" class="app-btn app-btn--primary" :disabled="uploading" @click="submitUpload">
          <Icon v-if="uploading" name="lucide:loader-2" size="17" class="pr-spin" />
          <Icon v-else name="lucide:upload" size="17" />
          {{ uploading ? 'در حال بارگذاری…' : 'بارگذاری' }}
        </button>
      </template>
    </UiDialog>

    <UiConfirmDialog
      v-model="deleteOpen"
      title="حذف مستند"
      :message="deleteTarget ? `آیا از حذف «${deleteTarget.fileName}» اطمینان دارید؟` : ''"
      confirm-label="حذف"
      cancel-label="انصراف"
      variant="danger"
      :loading="deleting"
      @confirm="doDelete"
    />
  </div>
</template>

<script setup lang="ts">
import moment from 'moment-jalaali'
import type {
  PatientFullProfile,
  ProfileAttachment,
} from '~/types/patient'
import { INSURANCE_TYPES, type InsuranceTypeKey } from '~/types/insurance'

definePageMeta({ layout: 'app', appTitle: 'پروندهٔ بیمار', appBack: '/app/patients' })

const route = useRoute()
const id = computed(() => String(route.params.id))
const { apiFetch } = useApi()
const { pn, toPersianNum } = useLang()
const { $toast } = useNuxtApp()

const profile = ref<PatientFullProfile | null>(null)
const loading = ref(true)
const error = ref(false)

const jDate = (value?: string | null) => (value ? moment(value).format('jD jMMMM jYYYY') : '—')

async function load() {
  loading.value = true
  error.value = false
  try {
    const res = await apiFetch<{ success: boolean; data: PatientFullProfile }>(`/api/patients/${id.value}/profile`)
    profile.value = res?.success ? res.data : null
    if (!profile.value) error.value = true
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

const basic = computed(() => profile.value?.basicInfo ?? ({} as PatientFullProfile['basicInfo']))
const fullName = computed(() =>
  [basic.value.firstName, basic.value.lastName].filter(Boolean).join(' ') || 'بیمار بدون نام',
)
const initials = computed(
  () => `${basic.value.firstName?.[0] || ''}${basic.value.lastName?.[0] || ''}` || '؟',
)

const insuranceLabel = computed(() => {
  const key = basic.value.insuranceType as InsuranceTypeKey | null | undefined
  if (!key) return ''
  return basic.value.insuranceInfo?.label || INSURANCE_TYPES[key]?.label || key
})

const age = computed(() => {
  if (!basic.value.birthDate) return null
  const dob = new Date(basic.value.birthDate)
  if (Number.isNaN(dob.getTime())) return null
  const now = new Date()
  let years = now.getFullYear() - dob.getFullYear()
  const m = now.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) years -= 1
  return years >= 0 ? Math.floor(years) : null
})

const details = computed(() => [
  { label: 'شماره تماس', value: basic.value.phone || '—' },
  { label: 'کد ملی', value: basic.value.nationalId || '—' },
  { label: 'تاریخ تولد', value: basic.value.birthDate ? jDate(basic.value.birthDate) : '—' },
  { label: 'وضعیت تأهل', value: basic.value.maritalStatus || '—' },
  { label: 'نوع بیمه', value: insuranceLabel.value || '—' },
  { label: 'کد بیمه', value: basic.value.insuranceCode || '—' },
  { label: 'آدرس', value: basic.value.address || '—' },
  { label: 'تاریخ ثبت پرونده', value: basic.value.createdAt ? jDate(basic.value.createdAt) : '—' },
])

// ─── Data slices ───
const medHistory = computed(() => profile.value?.medicalHistory)
const visits = computed(() => profile.value?.visits ?? [])
const latestVisit = computed(() => visits.value[0] ?? null)
const pregnancies = computed(() => profile.value?.obstetricHistory?.pregnancies ?? [])
const repro = computed(() => profile.value?.reproductiveHealth)

// ─── Record group items ───
type RecordItem = { id: string; title: string; sub?: string; tag?: string; tone?: string }

const allergyItems = computed<RecordItem[]>(() =>
  (medHistory.value?.allergies ?? []).map((a) => ({
    id: a.id,
    title: a.substance,
    tag: a.severity || 'نامشخص',
    tone: severityTone(a.severity),
  })),
)

const diseaseItems = computed<RecordItem[]>(() =>
  (medHistory.value?.diseases ?? []).map((d) => ({
    id: d.id,
    title: d.name,
    sub: d.diagnosedAt ? jDate(d.diagnosedAt) : undefined,
  })),
)

const medicationItems = computed<RecordItem[]>(() =>
  (medHistory.value?.medications ?? []).map((m) => ({
    id: m.id,
    title: m.name,
    sub: m.dosage || undefined,
  })),
)

const vaccinationItems = computed<RecordItem[]>(() =>
  (medHistory.value?.vaccinations ?? []).map((v) => ({
    id: v.id,
    title: v.vaccineName,
    sub: [v.doseNumber ? `دوز ${v.doseNumber}` : '', v.dateAdministered ? jDate(v.dateAdministered) : '']
      .filter(Boolean)
      .join(' · ') || undefined,
  })),
)

const labItems = computed<RecordItem[]>(() =>
  (profile.value?.labResults ?? []).map((l) => ({
    id: l.id,
    title: l.testName,
    sub: [l.value, l.unit, l.performedDate ? jDate(l.performedDate) : ''].filter(Boolean).join(' · '),
    tag: l.isAbnormal ? 'غیرعادی' : undefined,
    tone: l.isAbnormal ? 'rose' : undefined,
  })),
)

const screeningItems = computed<RecordItem[]>(() => [
  ...(profile.value?.screenings?.results ?? []).map((s) => ({
    id: s.id,
    title: s.screeningType,
    sub: [s.result, s.performedDate ? jDate(s.performedDate) : ''].filter(Boolean).join(' · '),
    tag: 'انجام‌شده',
    tone: 'green',
  })),
  ...(profile.value?.screenings?.schedules ?? []).map((s) => ({
    id: s.id,
    title: s.screeningType,
    sub: s.dueDate ? jDate(s.dueDate) : undefined,
    tag: s.status || 'در انتظار',
    tone: s.status === 'overdue' ? 'rose' : 'amber',
  })),
])

const attachmentGroups = computed(() => {
  const a = profile.value?.attachments
  return [
    { key: 'ultrasound', icon: 'lucide:scan', tint: 'indigo', title: 'سونوگرافی', files: a?.ultrasound ?? [] },
    { key: 'lab', icon: 'lucide:flask-conical', tint: 'green', title: 'آزمایش', files: a?.lab ?? [] },
    { key: 'prescription', icon: 'lucide:file-text', tint: 'amber', title: 'نسخه', files: a?.prescription ?? [] },
    { key: 'patientFiles', icon: 'lucide:folder', tint: 'teal', title: 'فایل‌های بیمار', files: a?.patientFiles ?? [] },
    { key: 'other', icon: 'lucide:paperclip', tint: 'rose', title: 'سایر', files: a?.other ?? [] },
  ] as { key: string; icon: string; tint: string; title: string; files: ProfileAttachment[] }[]
})

const attachmentCount = computed(() =>
  attachmentGroups.value.reduce((sum, g) => sum + g.files.length, 0),
)

// ─── Attachment upload / view / delete ───
const documentTypes = [
  { value: 'ultrasound', label: 'سونوگرافی' },
  { value: 'lab', label: 'آزمایش' },
  { value: 'prescription', label: 'نسخه' },
  { value: 'patient_files', label: 'فایل‌های بیمار' },
  { value: 'other', label: 'سایر' },
]

const uploadOpen = ref(false)
const uploading = ref(false)
const uploadType = ref('')
const uploadFiles = ref<File[]>([])
const uploadTypeError = ref('')
const uploadFilesError = ref('')

const deleteOpen = ref(false)
const deleting = ref(false)
const deleteTarget = ref<ProfileAttachment | null>(null)

const busy = reactive(new Map<string, 'view' | 'download' | 'delete'>())

function openUpload() {
  uploadType.value = ''
  uploadFiles.value = []
  uploadTypeError.value = ''
  uploadFilesError.value = ''
  uploadOpen.value = true
}

function onPickFiles(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) uploadFiles.value = [...uploadFiles.value, ...Array.from(input.files)]
  input.value = ''
}

function fileIcon(mimeType?: string | null): string {
  if (mimeType?.startsWith('image/')) return 'lucide:image'
  if (mimeType === 'application/pdf') return 'lucide:file-text'
  return 'lucide:file'
}

async function submitUpload() {
  uploadTypeError.value = uploadType.value ? '' : 'نوع مستند را انتخاب کنید'
  uploadFilesError.value = uploadFiles.value.length ? '' : 'حداقل یک فایل انتخاب کنید'
  if (uploadTypeError.value || uploadFilesError.value) return

  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('type', uploadType.value)
    for (const file of uploadFiles.value) fd.append('file', file)
    const res = await apiFetch<{ success: boolean }>(`/api/patients/${id.value}/attachments`, {
      method: 'POST',
      body: fd,
    })
    if (res?.success) {
      $toast.success('مستند با موفقیت بارگذاری شد')
      uploadOpen.value = false
      await load()
    } else {
      $toast.error('بارگذاری مستند ناموفق بود')
    }
  } catch (err: unknown) {
    const e = err as { data?: { error?: string } }
    $toast.error(e?.data?.error || 'بارگذاری مستند ناموفق بود')
  } finally {
    uploading.value = false
  }
}

async function getDownloadUrl(file: ProfileAttachment, forceDownload: boolean): Promise<string | null> {
  const query = forceDownload ? '?download=true' : ''
  const res = await apiFetch<{ success: boolean; data?: { downloadUrl: string } }>(
    `/api/patients/${id.value}/attachments/${file.id}/download${query}`,
  )
  return res?.data?.downloadUrl || null
}

async function viewFile(file: ProfileAttachment) {
  if (busy.has(file.id)) return
  busy.set(file.id, 'view')
  try {
    const url = await getDownloadUrl(file, false)
    if (url) window.open(url, '_blank', 'noopener')
    else $toast.error('دریافت لینک فایل ناموفق بود')
  } catch {
    $toast.error('دریافت لینک فایل ناموفق بود')
  } finally {
    busy.delete(file.id)
  }
}

async function downloadFile(file: ProfileAttachment) {
  if (busy.has(file.id)) return
  busy.set(file.id, 'download')
  try {
    const url = await getDownloadUrl(file, true)
    if (!url) {
      $toast.error('دریافت لینک فایل ناموفق بود')
      return
    }
    const a = document.createElement('a')
    a.href = url
    a.download = file.fileName || 'document'
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } catch {
    $toast.error('دانلود فایل ناموفق بود')
  } finally {
    busy.delete(file.id)
  }
}

function confirmDelete(file: ProfileAttachment) {
  deleteTarget.value = file
  deleteOpen.value = true
}

async function doDelete() {
  const file = deleteTarget.value
  if (!file || deleting.value) return
  deleting.value = true
  busy.set(file.id, 'delete')
  try {
    await apiFetch(`/api/patients/${id.value}/attachments/${file.id}`, { method: 'DELETE' })
    $toast.success('مستند حذف شد')
    deleteOpen.value = false
    deleteTarget.value = null
    await load()
  } catch (err: unknown) {
    const e = err as { data?: { error?: string } }
    $toast.error(e?.data?.error || 'حذف مستند ناموفق بود')
  } finally {
    deleting.value = false
    busy.delete(file.id)
  }
}

function severityTone(severity?: string | null): string {
  if (!severity) return 'neutral'
  if (severity.includes('شدید')) return 'rose'
  if (severity.includes('متوسط')) return 'amber'
  return 'green'
}

function formatSize(bytes?: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

// ─── Reproductive summary ───
const reproSummary = computed(() => {
  const s = repro.value?.summary
  if (!s) return []
  const entries: { label: string; value?: number | null }[] = [
    { label: 'بارداری', value: s.gravida },
    { label: 'زایمان', value: s.para },
    { label: 'سقط', value: s.abortus },
    { label: 'خارج رحمی', value: s.ectopics },
    { label: 'موالید زنده', value: s.liveBirths },
    { label: 'زایمان طبیعی', value: s.vaginalDeliveries },
    { label: 'سزارین', value: s.cSections },
  ]
  return entries.filter((e) => e.value !== null && e.value !== undefined)
})
const hasReproSummary = computed(() => reproSummary.value.length > 0)

// ─── Stats ───
const stats = computed(() => ({
  visits: visits.value.length,
  medications: medHistory.value?.medications?.length ?? 0,
  labs: profile.value?.labResults?.length ?? 0,
}))

// ─── Alerts ───
const alerts = computed(() => {
  const list: { icon: string; text: string; tone: string }[] = []
  const allergies = medHistory.value?.allergies ?? []
  if (allergies.length) {
    list.push({
      icon: 'lucide:alert-triangle',
      text: `${toPersianNum(allergies.length)} حساسیت ثبت‌شده: ${allergies.map((a) => a.substance).join('، ')}`,
      tone: 'rose',
    })
  }
  const abnormal = (profile.value?.labResults ?? []).filter((l) => l.isAbnormal)
  if (abnormal.length) {
    list.push({
      icon: 'lucide:flask-conical',
      text: `${toPersianNum(abnormal.length)} نتیجهٔ آزمایش غیرعادی`,
      tone: 'amber',
    })
  }
  return list
})

// ─── Tabs ───
type TabValue = 'overview' | 'medical' | 'visits' | 'labs' | 'obstetric' | 'files'
const activeTab = ref<TabValue>('overview')

const tabs = computed<{ value: TabValue; label: string; icon: string; count: number }[]>(() => [
  { value: 'overview', label: 'خلاصه', icon: 'lucide:layout-grid', count: 0 },
  {
    value: 'medical',
    label: 'سوابق پزشکی',
    icon: 'lucide:heart-pulse',
    count:
      (medHistory.value?.allergies?.length ?? 0) +
      (medHistory.value?.diseases?.length ?? 0) +
      (medHistory.value?.medications?.length ?? 0) +
      (medHistory.value?.vaccinations?.length ?? 0),
  },
  { value: 'visits', label: 'ویزیت‌ها', icon: 'lucide:stethoscope', count: visits.value.length },
  {
    value: 'labs',
    label: 'آزمایش‌ها',
    icon: 'lucide:flask-conical',
    count: (profile.value?.labResults?.length ?? 0) + (profile.value?.screenings?.results?.length ?? 0),
  },
  {
    value: 'obstetric',
    label: 'باروری',
    icon: 'lucide:baby',
    count: pregnancies.value.length,
  },
  { value: 'files', label: 'مستندات', icon: 'lucide:paperclip', count: attachmentCount.value },
])

watch(profile, (value) => {
  if (value) route.meta.appTitle = fullName.value
})

onMounted(load)
</script>

<style scoped>
/* ─── Hero ─── */
.pr-hero {
  padding: 18px;
  background: linear-gradient(135deg, var(--app-brand-deep), var(--app-brand));
  color: #fff;
  border: none;
  box-shadow: 0 18px 40px -26px var(--app-brand-deep);
}

.pr-hero__row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.pr-avatar {
  width: 58px;
  height: 58px;
  font-size: 19px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
}

.pr-hero__copy {
  flex: 1;
  min-width: 0;
}

.pr-hero__name {
  font-size: 18px;
  font-weight: 800;
  color: #fff;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.pr-hero__sub {
  margin-top: 4px;
  font-size: 12.5px;
  color: rgba(255, 255, 255, 0.82);
}

.pr-age {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 12px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.22);
}

.pr-age__value {
  font-size: 18px;
  font-weight: 800;
  line-height: 1.1;
}

.pr-age__label {
  font-size: 10px;
  opacity: 0.82;
}

.pr-hero__pills {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 14px;
}

.pr-hero__pills .app-pill {
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
}

/* ─── Actions ─── */
.pr-actions {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.pr-actions .pr-edit {
  grid-column: 1 / -1;
}

.pr-edit {
  text-decoration: none;
}

/* ─── Alerts ─── */
.pr-alerts {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 16px;
}

.pr-alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: var(--app-radius);
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.6;
}

.pr-alert--rose {
  background: var(--app-rose-soft);
  color: var(--app-expense);
}

.pr-alert--amber {
  background: var(--app-amber-soft);
  color: var(--app-amber);
}

/* ─── Segmented tabs ─── */
.pr-seg {
  display: flex;
  width: 100%;
}

.pr-seg__count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  margin-inline-start: 5px;
  border-radius: 999px;
  background: var(--app-brand-soft);
  color: var(--app-brand-deep);
  font-size: 10.5px;
  font-weight: 700;
}

.dark .pr-seg__count {
  color: var(--app-brand-ink);
}

/* ─── Definition list ─── */
.pr-dl {
  display: flex;
  flex-direction: column;
}

.pr-dl__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 16px;
  padding: 10px 0;
  border-bottom: 1px solid var(--app-border);
}

.pr-dl__row:last-child {
  border-bottom: none;
}

.pr-dl__row dt {
  flex: 0 0 auto;
  font-size: 12.5px;
  color: var(--app-muted);
}

.pr-dl__row dd {
  flex: 1 1 auto;
  text-align: end;
  font-size: 14px;
  font-weight: 600;
  color: var(--app-text);
  word-break: break-word;
}

/* ─── Latest visit ─── */
.pr-visit__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.pr-visit__reason {
  margin-top: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--app-text);
}

.pr-visit__notes {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.9;
  color: var(--app-text-2);
}

/* ─── Timeline items ─── */
.pr-timeline-item {
  margin-top: 10px;
}

.pr-timeline-item__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.pr-timeline-item__title {
  margin-top: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--app-text);
}

.pr-timeline-item__body {
  margin-top: 5px;
  font-size: 13px;
  line-height: 1.9;
  color: var(--app-text-2);
}

.pr-timeline-item__meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--app-muted);
}

/* ─── Reproductive summary ─── */
.pr-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(72px, 1fr));
  gap: 12px;
}

.pr-summary__cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.pr-summary__value {
  font-size: 19px;
  font-weight: 800;
  color: var(--app-brand-deep);
}

.dark .pr-summary__value {
  color: var(--app-brand-ink);
}

.pr-summary__label {
  font-size: 11px;
  color: var(--app-muted);
}

.pr-web-link {
  text-decoration: none;
}

/* ─── Attachments ─── */
.pr-upload {
  width: 100%;
}

.pr-group-icon {
  vertical-align: -3px;
  margin-inline-end: 6px;
  color: var(--app-muted);
}

.pr-files {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.pr-file {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 11px 14px;
  border-bottom: 1px solid var(--app-border);
}

.pr-file:last-child {
  border-bottom: none;
}

.pr-file__ico {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 11px;
  background: var(--app-surface-2);
  color: var(--app-muted);
}

.pr-file__ico--indigo { background: var(--app-indigo-soft); color: var(--app-indigo); }
.pr-file__ico--green { background: var(--app-brand-soft); color: var(--app-income); }
.pr-file__ico--amber { background: var(--app-amber-soft); color: var(--app-amber); }
.pr-file__ico--teal { background: var(--app-brand-soft); color: var(--app-brand-deep); }
.pr-file__ico--rose { background: var(--app-rose-soft); color: var(--app-expense); }

.pr-file__body {
  flex: 1 1 auto;
  min-width: 0;
}

.pr-file__name {
  display: block;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--app-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pr-file__meta {
  display: block;
  margin-top: 2px;
  font-size: 11.5px;
  color: var(--app-muted);
}

.pr-file__acts {
  display: flex;
  flex: 0 0 auto;
  gap: 4px;
}

.pr-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: 1px solid var(--app-border);
  border-radius: 10px;
  background: var(--app-surface);
  color: var(--app-text-2);
  cursor: pointer;
}

.pr-icon-btn:disabled {
  opacity: 0.55;
  cursor: default;
}

.pr-icon-btn--danger {
  color: var(--app-expense);
}

/* Upload dialog */
.pr-upload-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pr-drop {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 22px 14px;
  border: 2px dashed var(--app-border-strong);
  border-radius: var(--app-radius);
  background: var(--app-surface-2);
  color: var(--app-muted);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
}

.pr-drop__input {
  display: none;
}

.pr-picked {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.pr-picked__row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  background: var(--app-surface-2);
  font-size: 12.5px;
  color: var(--app-text-2);
}

.pr-picked__name {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pr-picked__size {
  flex: 0 0 auto;
  color: var(--app-muted);
}

.pr-picked__rm {
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: var(--app-expense);
  cursor: pointer;
}

.pr-spin {
  animation: pr-spin 0.8s linear infinite;
}

@keyframes pr-spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 420px) {
  .pr-actions {
    grid-template-columns: 1fr;
  }
}
</style>
