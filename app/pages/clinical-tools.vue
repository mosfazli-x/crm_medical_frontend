<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8 pt-6 space-y-6">
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 pb-1 border-b border-slate-100">
      <div>
        <h1 class="text-2xl font-extrabold text-slate-800 tracking-tight">ابزارهای تصمیم‌گیری بالینی</h1>
        <p class="text-sm text-slate-500 mt-1 font-medium">ابزارهای کمک تشخیصی و ارزیابی بالینی</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <v-card class="rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
        <v-card-text class="p-6">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-11 h-11 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
              <v-icon size="24">mdi-clipboard-pulse-outline</v-icon>
            </div>
            <div>
              <h3 class="font-bold text-slate-800">ارزیابی PCOS (Rotterdam)</h3>
              <p class="text-xs text-slate-500">تشخیص سندرم تخمدان پلی‌کیستیک بر اساس معیارهای Rotterdam</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <v-text-field v-model.number="pcos.age" label="سن" type="number" variant="outlined" density="compact" hide-details="auto" min="0" />
            <v-text-field v-model.number="pcos.bmi" label="BMI" type="number" variant="outlined" density="compact" hide-details="auto" min="0" step="0.1" />
            <v-text-field v-model.number="pcos.cycle_length_days" label="طول سیکل (روز)" type="number" variant="outlined" density="compact" hide-details="auto" min="0" />
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div class="flex items-center gap-2 mb-3">
                <span class="w-6 h-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xs font-bold">1</span>
                <span class="text-sm font-bold text-slate-700">الیگو / آنوولاسیون</span>
              </div>
              <v-checkbox v-model="pcos.oligo_anovulation" label="الیگو-تخمک‌گذاری / آنوولاسیون" hide-details density="compact" color="purple" class="text-slate-700" />
            </div>

            <div class="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div class="flex items-center gap-2 mb-3">
                <span class="w-6 h-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xs font-bold">2a</span>
                <span class="text-sm font-bold text-slate-700">هیپرآندروژنیسم بالینی</span>
              </div>
              <div class="space-y-0">
                <v-checkbox v-model="pcos.hirsutism" label="هیرسوتیسم" hide-details density="compact" color="purple" />
                <v-checkbox v-model="pcos.acne" label="آکنه" hide-details density="compact" color="purple" />
                <v-checkbox v-model="pcos.alopecia" label="آلوپسی" hide-details density="compact" color="purple" />
                <v-checkbox v-model="pcos.acanthosis_nigricans" label="آکانتوزیس نیگریکانس" hide-details density="compact" color="purple" />
              </div>
            </div>

            <div class="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div class="flex items-center gap-2 mb-3">
                <span class="w-6 h-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xs font-bold">2b</span>
                <span class="text-sm font-bold text-slate-700">هیپرآندروژنیسم بیوشیمیایی</span>
              </div>
              <div class="space-y-0">
                <v-checkbox v-model="pcos.testosterone_elevated" label="تستوسترون بالا" hide-details density="compact" color="purple" />
                <v-checkbox v-model="pcos.dheas_elevated" label="DHEAS بالا" hide-details density="compact" color="purple" />
                <v-checkbox v-model="pcos.free_androgen_index_elevated" label="شاخص آندروژن آزاد (FAI) بالا" hide-details density="compact" color="purple" />
              </div>
            </div>

            <div class="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div class="flex items-center gap-2 mb-3">
                <span class="w-6 h-6 rounded-full bg-purple-200 text-purple-700 flex items-center justify-center text-xs font-bold">3</span>
                <span class="text-sm font-bold text-slate-700">تخمدان پلی‌کیستیک در سونوگرافی</span>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <v-checkbox v-model="pcos.polycystic_ovaries_us" label="PCO در سونوگرافی" hide-details density="compact" color="purple" />
                <v-text-field v-model.number="pcos.follicle_count_per_ovary" label="تعداد فولیکول" type="number" variant="outlined" density="compact" hide-details="auto" min="0" />
                <v-text-field v-model.number="pcos.ovarian_volume_ml" label="حجم تخمدان (ml)" type="number" variant="outlined" density="compact" hide-details="auto" min="0" step="0.1" />
              </div>
            </div>
          </div>

          <div class="bg-amber-50 rounded-xl p-4 border border-amber-200 mb-6">
            <div class="flex items-center gap-2 mb-3">
              <v-icon size="small" color="amber-darken-3">mdi-alert-outline</v-icon>
              <span class="text-sm font-bold text-amber-800">بیماری‌های رد شده (Exclusions)</span>
            </div>
            <div class="flex flex-wrap gap-4">
              <v-checkbox v-model="pcos.excluded_cah" label="CAH رد شده" hide-details density="compact" color="amber" />
              <v-checkbox v-model="pcos.excluded_cushing" label="کوشینگ رد شده" hide-details density="compact" color="amber" />
              <v-checkbox v-model="pcos.excluded_tumor" label="تومور رد شده" hide-details density="compact" color="amber" />
            </div>
          </div>

          <v-textarea v-model="pcos.notes" label="یادداشت‌های بالینی" variant="outlined" density="compact" rows="2" hide-details="auto" class="mb-4" />

          <v-btn block color="purple-darken-1" variant="flat" :loading="pcosLoading" @click="assessPCOS">
            ارزیابی PCOS
          </v-btn>

          <v-card v-if="pcosResult" variant="tonal" color="purple-lighten-5" class="mt-5 rounded-xl border border-purple-200">
            <v-card-text class="p-5 space-y-4">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <v-chip :color="pcosResult.diagnosed ? 'red' : 'green'" variant="flat" size="large" class="font-bold px-4">
                    {{ pcosResult.diagnosis }}
                  </v-chip>
                  <v-chip v-if="pcosResult.phenotype" color="purple" variant="outlined" size="small">
                    {{ pcosResult.phenotype }}
                  </v-chip>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-black" :class="pcosResult.diagnosed ? 'text-red-600' : 'text-green-600'">
                    {{ pcosResult.criteriaMet }}/{{ pcosResult.criteriaRequired }}
                  </div>
                  <div class="text-[10px] text-slate-500 font-medium">معیار مثبت</div>
                </div>
              </div>

              <v-divider />

              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div v-for="c in pcosResult.criteriaDetails" :key="c.key" class="flex items-center gap-2 p-2 rounded-lg" :class="c.met ? 'bg-green-50' : 'bg-red-50'">
                  <v-icon size="small" :color="c.met ? 'green' : 'red'">{{ c.met ? 'mdi-check-circle' : 'mdi-close-circle' }}</v-icon>
                  <div class="text-xs">
                    <div class="font-bold" :class="c.met ? 'text-green-700' : 'text-red-700'">{{ c.label }}</div>
                    <div class="text-slate-500 mt-0.5">{{ c.description }}</div>
                  </div>
                </div>
              </div>

              <v-card v-if="pcosResult.recommendation" variant="text" color="info" class="bg-light-cyan rounded-lg">
                <v-card-text class="text-sm text-electric-sapphire p-3">
                  <v-icon size="small" color="#5465ff" class="ml-1">mdi-lightbulb-outline</v-icon>
                  {{ pcosResult.recommendation }}
                </v-card-text>
              </v-card>
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>

      <v-card class="rounded-2xl border border-slate-200 shadow-sm">
        <v-card-text class="p-6">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-11 h-11 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <v-icon size="24">mdi-fire</v-icon>
            </div>
            <div>
              <h3 class="font-bold text-slate-800">امتیاز یائسگی (Menopause)</h3>
              <p class="text-xs text-slate-500">ارزیابی شدت علائم یائسگی</p>
            </div>
          </div>

          <v-text-field v-model.number="menopause.age" label="سن" type="number" variant="outlined" density="compact" hide-details="auto" class="mb-4" min="0" max="120" />

          <div class="space-y-1">
            <div v-for="symptom in menopauseSymptoms" :key="symptom.key" class="mb-4">
              <div class="flex justify-between text-xs mb-1">
                <span class="text-slate-700 font-medium">{{ symptom.label }}</span>
                <span class="text-slate-400 font-bold">{{ menopause[symptom.key as keyof typeof menopause] }}</span>
              </div>
              <v-slider
                v-model.number="menopause[symptom.key as keyof typeof menopause]"
                :min="0" :max="3" :step="1"
                show-ticks="always"
                :tick-labels="['بدون', 'خفیف', 'متوسط', 'شدید']"
                hide-details
                density="compact"
                color="orange-darken-1"
                track-color="orange-lighten-4"
                thumb-size="16"
              />
            </div>
          </div>

          <v-btn block color="orange-darken-1" variant="flat" :loading="menopauseLoading" @click="assessMenopause" class="mt-2">
            محاسبه امتیاز یائسگی
          </v-btn>

          <v-card v-if="menopauseResult" variant="tonal" :color="menopauseResult.color" class="mt-4 rounded-xl">
            <v-card-text class="text-center py-4">
              <v-chip :color="menopauseResult.color" size="large" variant="outlined" class="font-bold mb-2">
                امتیاز: {{ menopauseResult.score }}
              </v-chip>
              <div class="text-sm font-bold">{{ menopauseResult.interpretation }}</div>
              <div class="text-xs mt-1 opacity-80">{{ menopauseResult.severity }}</div>
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>

      <v-card class="rounded-2xl border border-slate-200 shadow-sm">
        <v-card-text class="p-6">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-11 h-11 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
              <v-icon size="24">mdi-human-pregnant</v-icon>
            </div>
            <div>
              <h3 class="font-bold text-slate-800">امتیاز بیشاپ (Bishop Score)</h3>
              <p class="text-xs text-slate-500">ارزیابی آمادگی دهانه رحم برای القای زایمان</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <v-text-field v-model.number="bishop.dilation" label="اتساع (0-5)" type="number" variant="outlined" density="compact" hide-details="auto" min="0" max="5" step="1" />
            <v-text-field v-model.number="bishop.effacement" label="محو شدن (0-3)" type="number" variant="outlined" density="compact" hide-details="auto" min="0" max="3" step="1" />
            <v-text-field v-model.number="bishop.station" label="استیشن (3- تا 3)" type="number" variant="outlined" density="compact" hide-details="auto" min="-3" max="3" step="1" />
            <v-select v-model="bishop.consistency" :items="consistencyOptions" label="قوام" variant="outlined" density="compact" hide-details="auto" />
            <v-select v-model="bishop.position" :items="positionOptions" label="موقعیت" variant="outlined" density="compact" hide-details="auto" class="col-span-2 sm:col-span-1" />
          </div>

          <v-btn block color="pink-darken-1" variant="flat" :loading="bishopLoading" @click="assessBishop">
            محاسبه امتیاز بیشاپ
          </v-btn>

          <v-card v-if="bishopResult" variant="tonal" :color="bishopResult.color" class="mt-4 rounded-xl">
            <v-card-text class="text-center py-4">
              <v-chip :color="bishopResult.color" size="large" variant="outlined" class="font-bold mb-2">
                امتیاز: {{ bishopResult.score }}
              </v-chip>
              <div class="text-sm font-bold">{{ bishopResult.interpretation }}</div>
              <div class="text-xs mt-1 opacity-80">{{ bishopResult.detail }}</div>
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>

      <v-card class="rounded-2xl border border-slate-200 shadow-sm">
        <v-card-text class="p-6">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-11 h-11 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
              <v-icon size="24">mdi-ribbon</v-icon>
            </div>
            <div>
              <h3 class="font-bold text-slate-800">ریسک سرطان پستان</h3>
              <p class="text-xs text-slate-500">ارزیابی ریسک ابتلا به سرطان پستان</p>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 mb-4">
            <v-text-field v-model.number="breastCancer.age" label="سن" type="number" variant="outlined" density="compact" hide-details="auto" min="0" />
            <v-text-field v-model.number="breastCancer.menarche_age" label="سن اولین قاعدگی" type="number" variant="outlined" density="compact" hide-details="auto" min="0" />
          </div>

          <div class="flex items-center gap-2 mb-4">
            <v-checkbox v-model="breastCancer.noLiveBirth" label="عدم سابقه زایمان" hide-details density="compact" color="red" class="text-slate-700 shrink-0" @update:model-value="onNoLiveBirthChange" />
            <v-text-field
              v-model.number="breastCancer.first_live_birth_age"
              label="سن اولین زایمان"
              type="number"
              variant="outlined"
              density="compact"
              hide-details="auto"
              min="0"
              :disabled="breastCancer.noLiveBirth"
              class="flex-1"
            />
          </div>

          <div class="space-y-1 mb-2">
            <v-checkbox v-model="breastCancer.family_history_breast_cancer" label="سابقه خانوادگی سرطان پستان" hide-details density="compact" color="red" class="text-slate-700" />
            <v-checkbox v-model="breastCancer.previous_biopsy" label="بیوپسی قبلی پستان" hide-details density="compact" color="red" class="text-slate-700" />
          </div>

          <v-select
            v-model="breastCancer.brca_mutation"
            :items="brcaOptions"
            label="جهش BRCA"
            variant="outlined"
            density="compact"
            hide-details="auto"
            class="mb-4"
          />

          <v-btn block color="red-darken-1" variant="flat" :loading="breastCancerLoading" @click="assessBreastCancer">
            ارزیابی ریسک
          </v-btn>

          <v-card v-if="breastCancerResult" variant="tonal" :color="breastCancerResult.color" class="mt-4 rounded-xl">
            <v-card-text class="text-center py-4">
              <v-icon :color="breastCancerResult.color" size="36" class="mb-1">{{ breastCancerResult.icon }}</v-icon>
              <v-chip :color="breastCancerResult.color" size="large" variant="outlined" class="font-bold mb-2">
                {{ breastCancerResult.risk }}
              </v-chip>
              <div class="text-sm font-bold">{{ breastCancerResult.interpretation }}</div>
              <div class="text-xs mt-1 opacity-80">{{ breastCancerResult.detail }}</div>
            </v-card-text>
          </v-card>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

const pcos = reactive({
  oligo_anovulation: false,
  clinical_hyperandrogenism: false,
  biochemical_hyperandrogenism: false,
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

const assessPCOS = async () => {
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
            met: d.details?.criterion_2_hyperandrogenism?.met ?? (pcos.hirsutism || pcos.acne || pcos.alopecia || pcos.testosterone_elevated || pcos.dheas_elevated || pcos.free_androgen_index_elevated),
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

const menopauseSymptoms = [
  { key: 'hot_flashes', label: 'گرگرفتگی' },
  { key: 'night_sweats', label: 'عرق شبانه' },
  { key: 'mood_swings', label: 'نوسانات خلقی' },
  { key: 'vaginal_dryness', label: 'خشکی واژن' },
  { key: 'sleep_disturbance', label: 'اختلال خواب' },
]

const menopause = reactive({
  age: 50,
  hot_flashes: 1,
  night_sweats: 1,
  mood_swings: 1,
  vaginal_dryness: 0,
  sleep_disturbance: 1,
})

const menopauseLoading = ref(false)
const menopauseResult = ref<{ color: string; score: number; interpretation: string; severity: string } | null>(null)

const computedMenopauseScore = () => {
  return menopause.hot_flashes + menopause.night_sweats + menopause.mood_swings + menopause.vaginal_dryness + menopause.sleep_disturbance
}

const assessMenopause = async () => {
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
      const sev = d.severity || (score <= 5 ? 'خفیف' : score <= 10 ? 'متوسط' : score <= 15 ? 'شدید' : 'بسیار شدید')
      menopauseResult.value = {
        score,
        interpretation: d.interpretation || `وضعیت ${sev}`,
        severity: sev,
        color: score <= 5 ? 'green-darken-1' : score <= 10 ? 'orange-darken-1' : 'red-darken-1',
      }
    } else {
      $toast.error('خطا در دریافت نتیجه ارزیابی')
    }
  } catch {
    const score = computedMenopauseScore()
    const sev = score <= 5 ? 'خفیف' : score <= 10 ? 'متوسط' : score <= 15 ? 'شدید' : 'بسیار شدید'
    menopauseResult.value = {
      score,
      interpretation: `وضعیت ${sev}`,
      severity: sev,
      color: score <= 5 ? 'green-darken-1' : score <= 10 ? 'orange-darken-1' : 'red-darken-1',
    }
  } finally {
    menopauseLoading.value = false
  }
}

const consistencyOptions = ['firm', 'medium', 'soft']
const positionOptions = ['posterior', 'mid', 'anterior']

const bishop = reactive({
  dilation: 0,
  effacement: 0,
  station: -3,
  consistency: 'medium',
  position: 'mid',
})

const bishopLoading = ref(false)
const bishopResult = ref<{ color: string; score: number; interpretation: string; detail: string } | null>(null)

const assessBishop = async () => {
  bishopLoading.value = true
  bishopResult.value = null
  try {
    const res = await apiFetch<any>('/api/clinical/assess/bishop-score', {
      method: 'POST',
      body: {
        dilation: bishop.dilation,
        effacement: bishop.effacement,
        station: bishop.station,
        consistency: bishop.consistency,
        position: bishop.position,
      },
    })
    if (res.success) {
      const d = res.data
      const score = d.total_score ?? 0
      bishopResult.value = {
        score,
        interpretation: d.interpretation || (score <= 4 ? 'نامطلوب' : score <= 8 ? 'نسبتاً مطلوب' : 'مطلوب'),
        detail: d.detail || '',
        color: score <= 4 ? 'red-darken-1' : score <= 8 ? 'orange-darken-1' : 'green-darken-1',
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

const onNoLiveBirthChange = (val: boolean) => {
  if (val) {
    breastCancer.first_live_birth_age = null
  }
}

const breastCancerLoading = ref(false)
const breastCancerResult = ref<{ color: string; icon: string; risk: string; interpretation: string; detail: string } | null>(null)

const assessBreastCancer = async () => {
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
        color: isHigh ? 'red-darken-1' : isModerate ? 'orange-darken-1' : 'green-darken-1',
        icon: isHigh ? 'mdi-alert-circle' : isModerate ? 'mdi-help-circle' : 'mdi-check-circle',
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
