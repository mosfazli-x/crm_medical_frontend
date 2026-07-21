<template>
  <UiPageContainer>
    <UiPageHeader
      title="ابزارهای تصمیم‌گیری بالینی"
      subtitle="ابزارهای کمک تشخیصی و ارزیابی بالینی بیماران"
    />

    <div class="crm-clinical-grid">
      <!-- PCOS Assessment -->
      <UiClinicalToolCard
        title="ارزیابی PCOS (Rotterdam)"
        subtitle="تشخیص سندرم تخمدان پلی‌کیستیک بر اساس معیارهای Rotterdam"
        icon-class="crm-tool-icon--primary"
        :span-two="true"
      >
        <template #icon>
          <svg class="crm-tool-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </template>

        <div class="crm-field-grid-3">
          <div>
            <label class="crm-label">سن</label>
            <input v-model.number="pcos.age" type="number" min="0" class="crm-input" />
          </div>
          <div>
            <label class="crm-label">BMI</label>
            <input v-model.number="pcos.bmi" type="number" min="0" step="0.1" class="crm-input" />
          </div>
          <div>
            <label class="crm-label">طول سیکل (روز)</label>
            <input v-model.number="pcos.cycle_length_days" type="number" min="0" class="crm-input" />
          </div>
        </div>

        <div class="crm-criteria-grid">
          <div class="crm-criteria-panel">
            <div class="crm-criteria-panel-header">
              <span class="crm-criteria-badge">1</span>
              <span class="crm-criteria-title">الیگو / آنوولاسیون</span>
            </div>
            <UiClinicalCheckbox v-model="pcos.oligo_anovulation" label="الیگو-تخمک‌گذاری / آنوولاسیون" />
          </div>

          <div class="crm-criteria-panel">
            <div class="crm-criteria-panel-header">
              <span class="crm-criteria-badge">2a</span>
              <span class="crm-criteria-title">هیپرآندروژنیسم بالینی</span>
            </div>
            <div class="crm-checkbox-stack">
              <UiClinicalCheckbox v-model="pcos.hirsutism" label="هیرسوتیسم" />
              <UiClinicalCheckbox v-model="pcos.acne" label="آکنه" />
              <UiClinicalCheckbox v-model="pcos.alopecia" label="آلوپسی" />
              <UiClinicalCheckbox v-model="pcos.acanthosis_nigricans" label="آکانتوزیس نیگریکانس" />
            </div>
          </div>

          <div class="crm-criteria-panel">
            <div class="crm-criteria-panel-header">
              <span class="crm-criteria-badge">2b</span>
              <span class="crm-criteria-title">هیپرآندروژنیسم بیوشیمیایی</span>
            </div>
            <div class="crm-checkbox-stack">
              <UiClinicalCheckbox v-model="pcos.testosterone_elevated" label="تستوسترون بالا" />
              <UiClinicalCheckbox v-model="pcos.dheas_elevated" label="DHEAS بالا" />
              <UiClinicalCheckbox v-model="pcos.free_androgen_index_elevated" label="شاخص آندروژن آزاد (FAI) بالا" />
            </div>
          </div>

          <div class="crm-criteria-panel crm-criteria-grid-span-3">
            <div class="crm-criteria-panel-header">
              <span class="crm-criteria-badge">3</span>
              <span class="crm-criteria-title">تخمدان پلی‌کیستیک در سونوگرافی</span>
            </div>
            <div class="crm-criteria-inner-grid">
              <UiClinicalCheckbox v-model="pcos.polycystic_ovaries_us" label="PCO در سونوگرافی" />
              <div>
                <label class="crm-label">تعداد فولیکول</label>
                <input v-model.number="pcos.follicle_count_per_ovary" type="number" min="0" class="crm-input" />
              </div>
              <div>
                <label class="crm-label">حجم تخمدان (ml)</label>
                <input v-model.number="pcos.ovarian_volume_ml" type="number" min="0" step="0.1" class="crm-input" />
              </div>
            </div>
          </div>
        </div>

        <div class="crm-exclusion-panel">
          <div class="crm-exclusion-header">
            <svg class="crm-exclusion-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span class="crm-exclusion-title">بیماری‌های رد شده (Exclusions)</span>
          </div>
          <div class="crm-exclusion-checks">
            <UiClinicalCheckbox v-model="pcos.excluded_cah" label="CAH رد شده" variant="warning" />
            <UiClinicalCheckbox v-model="pcos.excluded_cushing" label="کوشینگ رد شده" variant="warning" />
            <UiClinicalCheckbox v-model="pcos.excluded_tumor" label="تومور رد شده" variant="warning" />
          </div>
        </div>

        <textarea
          v-model="pcos.notes"
          rows="2"
          placeholder="یادداشت‌های بالینی..."
          class="crm-input crm-textarea crm-clinical-notes"
        />

        <button class="crm-btn crm-btn-accent crm-btn-lg" :disabled="pcosLoading" @click="assessPCOS">
          <svg v-if="pcosLoading" class="crm-btn-spinner" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="crm-btn-spinner-track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="crm-btn-spinner-head" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>{{ pcosLoading ? 'در حال ارزیابی...' : 'ارزیابی نهایی PCOS' }}</span>
        </button>

        <div
          v-if="pcosResult"
          class="crm-pcos-result"
          :class="pcosResult.diagnosed ? 'crm-pcos-result--positive' : 'crm-pcos-result--negative'"
        >
          <div class="crm-pcos-result-header">
            <div class="crm-pcos-badges">
              <span
                class="crm-pcos-diagnosis-badge"
                :class="pcosResult.diagnosed ? 'crm-pcos-diagnosis-badge--positive' : 'crm-pcos-diagnosis-badge--negative'"
              >
                {{ pcosResult.diagnosis }}
              </span>
              <span
                v-if="pcosResult.phenotype"
                class="crm-pcos-phenotype-badge"
                :class="pcosResult.diagnosed ? 'crm-pcos-phenotype-badge--positive' : 'crm-pcos-phenotype-badge--negative'"
              >
                {{ pcosResult.phenotype }}
              </span>
            </div>
            <div class="crm-pcos-score-box">
              <div
                class="crm-pcos-score-value"
                :class="pcosResult.diagnosed ? 'crm-pcos-score-value--positive' : 'crm-pcos-score-value--negative'"
              >
                {{ pcosResult.criteriaMet }}<span class="crm-pcos-score-denom">/{{ pcosResult.criteriaRequired }}</span>
              </div>
              <div class="crm-pcos-score-label">معیار مثبت</div>
            </div>
          </div>

          <div class="crm-pcos-criteria-grid">
            <div
              v-for="c in pcosResult.criteriaDetails"
              :key="c.key"
              class="crm-pcos-criterion"
              :class="c.met ? 'crm-pcos-criterion--met' : 'crm-pcos-criterion--unmet'"
            >
              <svg
                v-if="c.met"
                class="crm-pcos-criterion-icon crm-pcos-criterion-icon--met"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="3"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <svg
                v-else
                class="crm-pcos-criterion-icon crm-pcos-criterion-icon--unmet"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="3"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              <div>
                <div
                  class="crm-pcos-criterion-label"
                  :class="c.met ? 'crm-pcos-criterion-label--met' : 'crm-pcos-criterion-label--unmet'"
                >
                  {{ c.label }}
                </div>
                <div class="crm-pcos-criterion-desc">{{ c.description }}</div>
              </div>
            </div>
          </div>

          <div v-if="pcosResult.recommendation" class="crm-info-box crm-pcos-recommendation">
            <svg class="crm-info-box-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p class="crm-info-box-text">{{ pcosResult.recommendation }}</p>
          </div>
        </div>
      </UiClinicalToolCard>

      <!-- Menopause Score -->
      <UiClinicalToolCard
        title="امتیاز یائسگی (Menopause)"
        subtitle="ارزیابی شدت علائم یائسگی"
        icon-class="crm-tool-icon--orange"
      >
        <template #icon>
          <svg class="crm-tool-card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
        </template>

        <div class="crm-clinical-section">
          <label class="crm-label">سن</label>
          <input v-model.number="menopause.age" type="number" min="0" max="120" class="crm-input" />

          <div class="crm-symptom-list">
            <div v-for="symptom in menopauseSymptoms" :key="symptom.key" class="crm-symptom-row">
              <div class="crm-symptom-header">
                <span class="crm-symptom-label">{{ symptom.label }}</span>
                <span class="crm-symptom-score">{{ menopause[symptom.key] }}</span>
              </div>
              <input
                v-model.number="menopause[symptom.key]"
                type="range"
                min="0"
                max="3"
                step="1"
                class="crm-range crm-range--orange"
              />
              <div class="crm-range-labels">
                <span>بدون</span><span>خفیف</span><span>متوسط</span><span>شدید</span>
              </div>
            </div>
          </div>
        </div>

        <button class="crm-btn crm-btn-orange crm-btn-lg" :disabled="menopauseLoading" @click="assessMenopause">
          <svg v-if="menopauseLoading" class="crm-btn-spinner" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="crm-btn-spinner-track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="crm-btn-spinner-head" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>{{ menopauseLoading ? 'در حال محاسبه...' : 'محاسبه امتیاز' }}</span>
        </button>

        <div
          v-if="menopauseResult"
          class="crm-result-box"
          :class="menopauseSeverityClass"
        >
          <div class="crm-result-score-badge" :class="menopauseBadgeClass">
            امتیاز: {{ menopauseResult.score }}
          </div>
          <div class="crm-result-title">{{ menopauseResult.interpretation }}</div>
          <div class="crm-result-detail">{{ menopauseResult.severity }}</div>
        </div>
      </UiClinicalToolCard>

      <!-- Bishop Score -->
      <UiClinicalToolCard
        title="امتیاز بیشاپ (Bishop Score)"
        subtitle="ارزیابی آمادگی دهانه رحم برای القای زایمان"
        icon-class="crm-tool-icon--pink"
      >
        <template #icon>
          <svg class="crm-tool-card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </template>

        <div class="crm-field-grid-2">
          <div>
            <label class="crm-label">اتساع (0-5)</label>
            <input v-model.number="bishop.dilation" type="number" min="0" max="5" class="crm-input" />
          </div>
          <div>
            <label class="crm-label">محو شدن (0-3)</label>
            <input v-model.number="bishop.effacement" type="number" min="0" max="3" class="crm-input" />
          </div>
          <div>
            <label class="crm-label">استیشن (-3 تا 3)</label>
            <input v-model.number="bishop.station" type="number" min="-3" max="3" class="crm-input" />
          </div>
          <div>
            <label class="crm-label">قوام</label>
            <select v-model="bishop.consistency" class="crm-select">
              <option v-for="opt in consistencyOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div class="crm-bishop-position">
            <label class="crm-label">موقعیت</label>
            <select v-model="bishop.position" class="crm-select">
              <option v-for="opt in positionOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
        </div>

        <button class="crm-btn crm-btn-pink crm-btn-lg" :disabled="bishopLoading" @click="assessBishop">
          <svg v-if="bishopLoading" class="crm-btn-spinner" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="crm-btn-spinner-track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="crm-btn-spinner-head" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>{{ bishopLoading ? 'در حال محاسبه...' : 'محاسبه امتیاز بیشاپ' }}</span>
        </button>

        <div
          v-if="bishopResult"
          class="crm-result-box"
          :class="bishopSeverityClass"
        >
          <div class="crm-result-score-badge" :class="bishopBadgeClass">
            امتیاز: {{ bishopResult.score }}
          </div>
          <div class="crm-result-title">{{ bishopResult.interpretation }}</div>
          <div class="crm-result-detail">{{ bishopResult.detail }}</div>
        </div>
      </UiClinicalToolCard>

      <!-- Breast Cancer Risk -->
      <UiClinicalToolCard
        title="ریسک سرطان پستان"
        subtitle="ارزیابی ریسک ابتلا به سرطان پستان"
        icon-class="crm-tool-icon--red"
        :span-two="true"
      >
        <template #icon>
          <svg class="crm-tool-card-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </template>

        <div class="crm-breast-grid">
          <div class="crm-breast-col">
            <div class="crm-breast-age-grid">
              <div>
                <label class="crm-label">سن</label>
                <input v-model.number="breastCancer.age" type="number" min="0" class="crm-input" />
              </div>
              <div>
                <label class="crm-label">سن اولین قاعدگی</label>
                <input v-model.number="breastCancer.menarche_age" type="number" min="0" class="crm-input" />
              </div>
            </div>

            <div class="crm-criteria-panel">
              <UiClinicalCheckbox
                v-model="breastCancer.noLiveBirth"
                label="عدم سابقه زایمان"
                variant="danger"
                class="crm-breast-no-birth"
              />
              <div :class="{ 'crm-field-disabled': breastCancer.noLiveBirth }">
                <label class="crm-label">سن اولین زایمان</label>
                <input
                  v-model.number="breastCancer.first_live_birth_age"
                  type="number"
                  min="0"
                  :disabled="breastCancer.noLiveBirth"
                  class="crm-input"
                />
              </div>
            </div>
          </div>

          <div class="crm-breast-col">
            <div class="crm-criteria-panel crm-breast-checks">
              <UiClinicalCheckbox v-model="breastCancer.family_history_breast_cancer" label="سابقه خانوادگی سرطان پستان" variant="danger" />
              <hr class="crm-divider" />
              <UiClinicalCheckbox v-model="breastCancer.previous_biopsy" label="بیوپسی قبلی پستان" variant="danger" />
            </div>

            <div>
              <label class="crm-label">جهش BRCA</label>
              <select v-model="breastCancer.brca_mutation" class="crm-select">
                <option v-for="opt in brcaOptions" :key="opt.title" :value="opt.value">{{ opt.title }}</option>
              </select>
            </div>
          </div>
        </div>

        <button class="crm-btn crm-btn-red crm-btn-lg crm-btn-red-half" :disabled="breastCancerLoading" @click="assessBreastCancer">
          <svg v-if="breastCancerLoading" class="crm-btn-spinner" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle class="crm-btn-spinner-track" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="crm-btn-spinner-head" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span>{{ breastCancerLoading ? 'در حال ارزیابی...' : 'ارزیابی ریسک' }}</span>
        </button>

        <div
          v-if="breastCancerResult"
          class="crm-result-box crm-result-box-lg"
          :class="breastCancerSeverityClass"
        >
          <div class="crm-result-score-badge crm-result-score-badge-xl" :class="breastCancerBadgeClass">
            {{ breastCancerResult.risk }}
          </div>
          <div class="crm-result-title">{{ breastCancerResult.interpretation }}</div>
          <div class="crm-result-detail">{{ breastCancerResult.detail }}</div>
        </div>
      </UiClinicalToolCard>
    </div>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'

const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

type MenopauseKey = 'hot_flashes' | 'night_sweats' | 'mood_swings' | 'vaginal_dryness' | 'sleep_disturbance'
type SeverityLevel = 'success' | 'warning' | 'danger'

function severityFromScore(score: number, thresholds: [number, number]): SeverityLevel {
  if (score <= thresholds[0]) return 'success'
  if (score <= thresholds[1]) return 'warning'
  return 'danger'
}

function resultBoxClass(level: SeverityLevel) {
  return {
    'crm-result-box--success': level === 'success',
    'crm-result-box--warning': level === 'warning',
    'crm-result-box--danger': level === 'danger',
  }
}

function badgeClass(level: SeverityLevel) {
  return {
    'crm-result-score-badge--success': level === 'success',
    'crm-result-score-badge--warning': level === 'warning',
    'crm-result-score-badge--danger': level === 'danger',
  }
}

// ── PCOS ──
const pcos = reactive({
  oligo_anovulation: false,
  polycystic_ovaries_us: false,
  age: 28,
  bmi: 25,
  cycle_length_days: 35,
  hirsutism: false,
  acne: false,
  alopecia: false,
  acanthosis_nigricans: false,
  testosterone_elevated: false,
  dheas_elevated: false,
  free_androgen_index_elevated: false,
  follicle_count_per_ovary: 10,
  ovarian_volume_ml: 8,
  excluded_cah: false,
  excluded_cushing: false,
  excluded_tumor: false,
  notes: '',
})

const pcosLoading = ref(false)
const pcosResult = ref<{
  diagnosis: string
  diagnosed: boolean
  phenotype: string | null
  criteriaMet: number
  criteriaRequired: number
  criteriaDetails: Array<{ key: string; label: string; description: string; met: boolean }>
  recommendation: string
} | null>(null)

async function assessPCOS() {
  pcosLoading.value = true
  pcosResult.value = null
  try {
    const res = await apiFetch<any>('/api/clinical/assess/pcos-rotterdam', {
      method: 'POST',
      body: {
        oligo_anovulation: pcos.oligo_anovulation,
        clinical_hyperandrogenism: pcos.hirsutism || pcos.acne || pcos.alopecia || pcos.acanthosis_nigricans,
        biochemical_hyperandrogenism: pcos.testosterone_elevated || pcos.dheas_elevated || pcos.free_androgen_index_elevated,
        polycystic_ovaries_us: pcos.polycystic_ovaries_us,
        age: pcos.age,
        bmi: pcos.bmi,
        cycle_length_days: pcos.cycle_length_days,
        hirsutism: pcos.hirsutism,
        acne: pcos.acne,
        alopecia: pcos.alopecia,
        acanthosis_nigricans: pcos.acanthosis_nigricans,
        testosterone_elevated: pcos.testosterone_elevated,
        dheas_elevated: pcos.dheas_elevated,
        free_androgen_index_elevated: pcos.free_androgen_index_elevated,
        follicle_count_per_ovary: pcos.follicle_count_per_ovary,
        ovarian_volume_ml: pcos.ovarian_volume_ml,
        excluded_cah: pcos.excluded_cah,
        excluded_cushing: pcos.excluded_cushing,
        excluded_tumor: pcos.excluded_tumor,
        notes: pcos.notes,
      },
    })
    if (res.success) {
      const d = res.data
      const crit = d.criteria_met ?? 0
      const req = d.criteria_required ?? 2
      const diagnosed = crit >= req
      pcosResult.value = {
        diagnosis: d.diagnosis || (diagnosed ? 'PCOS تشخیص داده شد' : 'PCOS رد شد'),
        diagnosed,
        phenotype: d.phenotype || null,
        criteriaMet: crit,
        criteriaRequired: req,
        criteriaDetails: [
          {
            key: 'c1',
            label: 'الیگو / آنوولاسیون',
            description: d.details?.criterion_1_oligo_anovulation?.description || 'نامنظمی سیکل قاعدگی',
            met: d.details?.criterion_1_oligo_anovulation?.met ?? pcos.oligo_anovulation,
          },
          {
            key: 'c2',
            label: 'هیپرآندروژنیسم',
            description: d.details?.criterion_2_hyperandrogenism?.description || 'علائم بالینی و/یا بیوشیمیایی',
            met: d.details?.criterion_2_hyperandrogenism?.met ?? (
              pcos.hirsutism || pcos.acne || pcos.alopecia || pcos.testosterone_elevated || pcos.dheas_elevated || pcos.free_androgen_index_elevated
            ),
          },
          {
            key: 'c3',
            label: 'تخمدان پلی‌کیستیک',
            description: d.details?.criterion_3_polycystic_ovaries?.description || '≥12 فولیکول یا حجم ≥10ml',
            met: d.details?.criterion_3_polycystic_ovaries?.met ?? pcos.polycystic_ovaries_us,
          },
        ],
        recommendation: d.recommendation || '',
      }
    } else {
      $toast.error('خطا در دریافت نتیجه ارزیابی')
    }
  } catch {
    $toast.error('خطا در ارتباط با سرور')
  } finally {
    pcosLoading.value = false
  }
}

// ── Menopause ──
const menopauseSymptoms: Array<{ key: MenopauseKey; label: string }> = [
  { key: 'hot_flashes', label: 'گرگرفتگی' },
  { key: 'night_sweats', label: 'عرق شبانه' },
  { key: 'mood_swings', label: 'نوسانات خلقی' },
  { key: 'vaginal_dryness', label: 'خشکی واژن' },
  { key: 'sleep_disturbance', label: 'اختلال خواب' },
]

const menopause = reactive<Record<MenopauseKey, number> & { age: number }>({
  age: 50,
  hot_flashes: 1,
  night_sweats: 1,
  mood_swings: 1,
  vaginal_dryness: 0,
  sleep_disturbance: 1,
})

const menopauseLoading = ref(false)
const menopauseResult = ref<{ score: number; interpretation: string; severity: string } | null>(null)

const menopauseSeverity = computed(() =>
  menopauseResult.value ? severityFromScore(menopauseResult.value.score, [5, 10]) : 'success',
)
const menopauseSeverityClass = computed(() => resultBoxClass(menopauseSeverity.value))
const menopauseBadgeClass = computed(() => badgeClass(menopauseSeverity.value))

function computedMenopauseScore() {
  return menopause.hot_flashes + menopause.night_sweats + menopause.mood_swings + menopause.vaginal_dryness + menopause.sleep_disturbance
}

function menopauseSeverityLabel(score: number) {
  if (score <= 5) return 'خفیف'
  if (score <= 10) return 'متوسط'
  if (score <= 15) return 'شدید'
  return 'بسیار شدید'
}

async function assessMenopause() {
  menopauseLoading.value = true
  menopauseResult.value = null
  try {
    const res = await apiFetch<any>('/api/clinical/assess/menopause-score', {
      method: 'POST',
      body: {
        age: menopause.age,
        hot_flashes: menopause.hot_flashes,
        night_sweats: menopause.night_sweats,
        mood_swings: menopause.mood_swings,
        vaginal_dryness: menopause.vaginal_dryness,
        sleep_disturbance: menopause.sleep_disturbance,
      },
    })
    if (res.success) {
      const d = res.data
      const score = d.total_score ?? computedMenopauseScore()
      const sev = d.severity || menopauseSeverityLabel(score)
      menopauseResult.value = { score, interpretation: d.interpretation || `وضعیت ${sev}`, severity: sev }
    } else {
      $toast.error('خطا در دریافت نتیجه ارزیابی')
    }
  } catch {
    const score = computedMenopauseScore()
    const sev = menopauseSeverityLabel(score)
    menopauseResult.value = { score, interpretation: `وضعیت ${sev}`, severity: sev }
  } finally {
    menopauseLoading.value = false
  }
}

// ── Bishop Score ──
const consistencyOptions = [
  { label: 'سفت', value: 'firm' },
  { label: 'متوسط', value: 'medium' },
  { label: 'نرم', value: 'soft' },
]

const positionOptions = [
  { label: 'خلفی', value: 'posterior' },
  { label: 'میانی', value: 'mid' },
  { label: 'قدامی', value: 'anterior' },
]

const bishop = reactive({
  dilation: 0,
  effacement: 0,
  station: -3,
  consistency: 'medium',
  position: 'mid',
})

const bishopLoading = ref(false)
const bishopResult = ref<{ score: number; interpretation: string; detail: string } | null>(null)

const bishopSeverity = computed(() => {
  if (!bishopResult.value) return 'success'
  const score = bishopResult.value.score
  if (score <= 4) return 'danger'
  if (score <= 8) return 'warning'
  return 'success'
})
const bishopSeverityClass = computed(() => resultBoxClass(bishopSeverity.value))
const bishopBadgeClass = computed(() => badgeClass(bishopSeverity.value))

async function assessBishop() {
  bishopLoading.value = true
  bishopResult.value = null
  try {
    const res = await apiFetch<any>('/api/clinical/assess/bishop-score', {
      method: 'POST',
      body: { ...bishop },
    })
    if (res.success) {
      const d = res.data
      const score = d.total_score ?? 0
      bishopResult.value = {
        score,
        interpretation: d.interpretation || (score <= 4 ? 'نامطلوب' : score <= 8 ? 'نسبتاً مطلوب' : 'مطلوب'),
        detail: d.detail || '',
      }
    } else {
      $toast.error('خطا در دریافت نتیجه ارزیابی')
    }
  } catch {
    $toast.error('خطا در ارتباط با سرور')
  } finally {
    bishopLoading.value = false
  }
}

// ── Breast Cancer Risk ──
const brcaOptions = [
  { title: 'مشخص نشده', value: null },
  { title: 'مثبت', value: true },
  { title: 'منفی', value: false },
]

const breastCancer = reactive({
  age: 40,
  menarche_age: 13,
  first_live_birth_age: null as number | null,
  noLiveBirth: false,
  family_history_breast_cancer: false,
  previous_biopsy: false,
  brca_mutation: null as boolean | null,
})

watch(() => breastCancer.noLiveBirth, (val) => {
  if (val) breastCancer.first_live_birth_age = null
})

const breastCancerLoading = ref(false)
const breastCancerResult = ref<{ risk: string; interpretation: string; detail: string; level: SeverityLevel } | null>(null)

const breastCancerSeverityClass = computed(() =>
  breastCancerResult.value ? resultBoxClass(breastCancerResult.value.level) : {},
)
const breastCancerBadgeClass = computed(() =>
  breastCancerResult.value ? badgeClass(breastCancerResult.value.level) : {},
)

async function assessBreastCancer() {
  breastCancerLoading.value = true
  breastCancerResult.value = null
  try {
    const res = await apiFetch<any>('/api/clinical/assess/breast-cancer-risk', {
      method: 'POST',
      body: {
        age: breastCancer.age,
        menarche_age: breastCancer.menarche_age,
        first_live_birth_age: breastCancer.noLiveBirth ? null : breastCancer.first_live_birth_age,
        family_history_breast_cancer: breastCancer.family_history_breast_cancer,
        previous_biopsy: breastCancer.previous_biopsy,
        brca_mutation: breastCancer.brca_mutation,
      },
    })
    if (res.success) {
      const d = res.data
      const risk = d.risk || d.risk_level || ''
      const riskNorm = risk?.toLowerCase() || ''
      const isHigh = riskNorm.includes('high') || riskNorm.includes('بالا')
      const isModerate = riskNorm.includes('moderate') || riskNorm.includes('متوسط')
      breastCancerResult.value = {
        risk: d.risk || 'نامشخص',
        interpretation: d.interpretation || '',
        detail: d.detail || '',
        level: isHigh ? 'danger' : isModerate ? 'warning' : 'success',
      }
    } else {
      $toast.error('خطا در دریافت نتیجه ارزیابی')
    }
  } catch {
    $toast.error('خطا در ارتباط با سرور')
  } finally {
    breastCancerLoading.value = false
  }
}

useSeoMeta({ title: 'ابزارهای تصمیم‌گیری بالینی | سیستم کلینیک' })
</script>

<style scoped>
.crm-tool-card-icon {
  width: 1.75rem !important;
  height: 1.75rem !important;
}

.crm-exclusion-icon {
  width: 1.25rem !important;
  height: 1.25rem !important;
  color: #ea580c !important;
  flex-shrink: 0 !important;
}

.crm-clinical-notes {
  margin-bottom: 1.25rem !important;
}

.crm-clinical-section {
  margin-bottom: 2rem !important;
}

.crm-bishop-position {
  grid-column: span 2 !important;
}

@media (min-width: 640px) {
  .crm-bishop-position {
    grid-column: span 1 !important;
  }
}

.crm-breast-no-birth {
  margin-bottom: 1rem !important;
}

.crm-info-box {
  display: flex !important;
  gap: 0.75rem !important;
  align-items: flex-start !important;
}

.crm-info-box-icon {
  width: 1.25rem !important;
  height: 1.25rem !important;
  color: #4F46E5 !important;
  flex-shrink: 0 !important;
  margin-top: 0.125rem !important;
}

.crm-info-box-text {
  font-size: 0.875rem !important;
  color: #4F46E5 !important;
  font-weight: 700 !important;
  line-height: 1.6 !important;
  margin: 0 !important;
}

.crm-btn-spinner-track {
  opacity: 0.25 !important;
}

.crm-btn-spinner-head {
  opacity: 0.75 !important;
}
</style>
