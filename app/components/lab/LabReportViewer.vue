<template>
  <div class="!bg-white !border !border-zinc-200/80 !rounded-2xl !overflow-hidden" dir="rtl">

    <div class="!flex !items-center justify-between !px-6 !py-4 !border-b !border-zinc-100 !bg-zinc-50/30">
      <div class="!flex !items-center !gap-2.5">
        <div :class="[
          '!w-8 !h-8 !rounded-lg !flex !items-center !justify-center',
          reportType === 'hpv_dna' ? '!bg-emerald-600' : '!bg-zinc-900'
        ]">
          <Icon :name="reportType === 'hpv_dna' ? 'lucide:shield-check' : 'lucide:microscope'" class="!w-4 !h-4 !text-white" />
        </div>
        <div>
          <h3 class="!text-xs !font-bold !text-zinc-900">{{ reportTypeLabel }}</h3>
          <p class="!text-[10px] !text-zinc-400 !mt-0.5">{{ formatDate(result.performed_date) }}</p>
        </div>
      </div>
      <div class="!flex !items-center !gap-2">
        <button v-if="canEdit"
          class="!p-1.5 !text-zinc-400 hover:!text-zinc-900 hover:!bg-zinc-100 !rounded-lg !transition-colors"
          :title="t('labReportViewer.edit')" @click="$emit('edit', result)">
          <Icon name="lucide:pencil" class="!w-4 !h-4" />
        </button>
        <button
          class="!p-1.5 !text-zinc-400 hover:!text-red-600 hover:!bg-red-50 !rounded-lg !transition-colors"
          :title="t('labReportViewer.delete')" @click="$emit('delete', result)">
          <Icon name="lucide:trash-2" class="!w-4 !h-4" />
        </button>
      </div>
    </div>

    <div v-if="data" class="!divide-y !divide-zinc-100">

      <div class="!px-6 !py-4">
        <div class="!grid !grid-cols-2 md:!grid-cols-4 !gap-4">
          <InfoItem :label="t('labReportViewer.patientName')" :value="data.patient_name" />
          <InfoItem :label="t('labReportViewer.recordNumber')" :value="data.record_number" mono />
          <InfoItem :label="t('labReportViewer.sampler')" :value="data.sampler_name" />
          <InfoItem :label="t('labReportViewer.receiptDate')" :value="data.receipt_date" />
        </div>
      </div>

      <div class="!px-6 !py-4" v-if="hasAnyField('sample_code', 'sample_volume', 'container_type', 'sample_condition')">
        <p class="!text-[10px] !font-bold !text-zinc-600 !uppercase !tracking-wider">{{ t('labReportViewer.sampleInfo') }}</p>
        <div class="!grid !grid-cols-2 md:!grid-cols-4 !gap-4 !mt-3">
          <InfoItem :label="t('labReportViewer.sampleCode')" :value="data.sample_code" :mono="true" />
          <InfoItem :label="t('labReportViewer.volume')" :value="data.sample_volume ? data.sample_volume + ' ml' : null" />
          <InfoItem :label="t('labReportViewer.containerType')" :value="data.container_type" />
          <InfoItem :label="t('labReportViewer.condition')" :value="data.sample_condition" />
        </div>
      </div>

      <div class="!px-6 !py-4" v-if="hasAnyField('patient_age', 'last_menstruation', 'referral_reason')">
        <p class="!text-[10px] !font-bold !text-zinc-600 !uppercase !tracking-wider">{{ t('labReportViewer.clinicalInfo') }}</p>
        <div class="!grid !grid-cols-2 md:!grid-cols-4 !gap-4 !mt-3">
          <InfoItem :label="t('labReportViewer.age')" :value="data.patient_age ? data.patient_age + ' ' + t('labReportViewer.yearsSuffix') : null" />
          <InfoItem :label="t('labReportViewer.lastMenstruation')" :value="data.last_menstruation" />
          <InfoItem :label="t('labReportViewer.deliveryHistory')" :value="data.delivery_history" />
          <InfoItem :label="t('labReportViewer.referralReason')" :value="data.referral_reason" />
        </div>
      </div>

      <div class="!px-6 !py-4" v-if="reportType === 'pap_smear'">
        <p class="!text-[10px] !font-bold !text-zinc-600 !uppercase !tracking-wider">{{ t('labReportViewer.cytologyResults') }}</p>
        <div class="!grid !grid-cols-3 !gap-3 !mt-3">
          <InfoItem :label="t('labReportViewer.stainingTechnique')" :value="data.staining_technique" />
          <InfoItem :label="t('labReportViewer.samplingSource')" :value="data.sampling_source" />
          <InfoItem :label="t('labReportViewer.sampleQuality')" :value="data.sample_quality" />
        </div>
        <div class="!mt-4">
          <p class="!text-[10px] !font-bold !text-zinc-500 !mb-2 !uppercase !tracking-wider">{{ t('labReportViewer.squamousCells') }}</p>
          <div class="!flex !flex-wrap !gap-2">
            <TagBadge v-if="data.asc_us" label="ASC-US" color="amber" />
            <TagBadge v-if="data.asc_h" label="ASC-H" color="red" />
            <TagBadge v-if="data.lsil" label="LSIL" color="orange" />
            <TagBadge v-if="data.hsil" label="HSIL" color="red" />
            <TagBadge v-if="data.scc" label="SCC" color="red" />
            <span v-if="!hasAnyField('asc_us', 'asc_h', 'lsil', 'hsil', 'scc')" class="!text-xs !text-zinc-400">---</span>
          </div>
        </div>
        <div class="!mt-3">
          <p class="!text-[10px] !font-bold !text-zinc-500 !mb-2 !uppercase !tracking-wider">{{ t('labReportViewer.glandularCells') }}</p>
          <div class="!flex !flex-wrap !gap-2">
            <TagBadge v-if="data.agc" label="AGC" color="red" />
            <TagBadge v-if="data.ais" label="AIS" color="red" />
            <TagBadge v-if="data.ac" label="AC" color="red" />
            <span v-if="!hasAnyField('agc', 'ais', 'ac')" class="!text-xs !text-zinc-400">---</span>
          </div>
        </div>
        <div class="!mt-3">
          <InfoItem :label="t('labReportViewer.inflammatoryCells')" :value="data.inflammatory_cells" />
          <div class="!flex !gap-4 !mt-2">
            <span v-if="data.endocervical_cells" class="!text-xs !text-emerald-600 !font-medium">{{ t('labReportViewer.endocervicalPresent') }}</span>
            <span v-if="data.endometrial_cells" class="!text-xs !text-emerald-600 !font-medium">{{ t('labReportViewer.endometrialPresent') }}</span>
          </div>
        </div>
      </div>

      <div class="!px-6 !py-4" v-if="reportType === 'hpv_dna'">
        <p class="!text-[10px] !font-bold !text-zinc-600 !uppercase !tracking-wider">{{ t('labReportViewer.hpvDnaStatus') }}</p>
        <div class="!grid !grid-cols-2 !gap-4 !mt-3">
          <InfoItem :label="t('labReportViewer.hpvLabel')" :value="data.hpv_status" />
          <InfoItem :label="t('labReportViewer.viralLoad')" :value="data.viral_load" />
        </div>
        <div class="!mt-4">
          <p class="!text-[10px] !font-bold !text-zinc-500 !mb-2 !uppercase !tracking-wider">{{ t('labReportViewer.genotypes') }}</p>
          <div class="!flex !flex-wrap !gap-2">
            <template v-for="t in hrTypes" :key="t.key">
              <TagBadge v-if="data[t.key]" :label="t.label" color="red" />
            </template>
            <InfoItem v-if="data.other_genotypes" :label="t('labReportViewer.other')" :value="data.other_genotypes" />
            <span v-if="!hasHrTypes" class="!text-xs !text-zinc-400">---</span>
          </div>
        </div>
        <div v-if="data.p16_ki67_result" class="!mt-3">
          <InfoItem label="p16/Ki-67" :value="data.p16_ki67_result" />
        </div>
      </div>

      <div class="!px-6 !py-4 !bg-zinc-50/30" v-if="data.conclusion || data.recommendations">
        <p class="!text-[10px] !font-bold !text-zinc-600 !uppercase !tracking-wider">{{ t('labReportViewer.conclusion') }}</p>
        <div class="!space-y-3 !mt-3">
          <div v-if="data.conclusion">
            <p class="!text-[10px] !font-bold !text-zinc-500 !uppercase !tracking-wider">{{ t('labReportViewer.findings') }}</p>
            <p class="!text-xs !text-zinc-800 !mt-1 !leading-relaxed">{{ data.conclusion }}</p>
          </div>
          <div v-if="data.recommendations">
            <p class="!text-[10px] !font-bold !text-zinc-500 !uppercase !tracking-wider">{{ t('labReportViewer.recommendations') }}</p>
            <p class="!text-xs !text-zinc-800 !mt-1 !leading-relaxed">{{ data.recommendations }}</p>
          </div>
          <div v-if="data.follow_up">
            <p class="!text-[10px] !font-bold !text-zinc-500 !uppercase !tracking-wider">{{ t('labReportViewer.followUp') }}</p>
            <p class="!text-xs !text-zinc-800 !mt-1">{{ data.follow_up }}</p>
          </div>
        </div>
      </div>

      <div v-if="result.notes" class="!px-6 !py-4">
        <p class="!text-[10px] !font-bold !text-zinc-600 !uppercase !tracking-wider">{{ t('labReportViewer.notes') }}</p>
        <p class="!text-xs !text-zinc-600 !mt-2 !leading-relaxed">{{ result.notes }}</p>
      </div>
    </div>

    <div v-else class="!px-6 !py-8 !text-center">
      <p class="!text-xs !text-zinc-400">{{ t('labReportViewer.noStructuredData') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'

const { t } = useI18n()

const props = defineProps<{
  result: any
  canEdit?: boolean
}>()

defineEmits<{
  edit: [result: any]
  delete: [result: any]
}>()

const reportType = computed(() => props.result?.report_type || 'pap_smear')
const data = computed(() => props.result?.report_data || {})
const reportTypeLabel = computed(() =>
  reportType.value === 'hpv_dna' ? t('labReportViewer.hpvMolecular') : t('labReportViewer.cervicalCytology')
)

function formatDate(date: string) {
  if (!date) return '---'
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date))
}

function hasAnyField(...keys: string[]) {
  return keys.some(k => data.value[k])
}

const hrTypes = [
  { key: 'hpv16', label: 'HPV 16' },
  { key: 'hpv18', label: 'HPV 18' },
  { key: 'hpv31', label: 'HPV 31' },
  { key: 'hpv33', label: 'HPV 33' },
  { key: 'hpv35', label: 'HPV 35' },
  { key: 'hpv39', label: 'HPV 39' },
  { key: 'hpv45', label: 'HPV 45' },
  { key: 'hpv51', label: 'HPV 51' },
  { key: 'hpv52', label: 'HPV 52' },
  { key: 'hpv56', label: 'HPV 56' },
  { key: 'hpv58', label: 'HPV 58' },
  { key: 'hpv59', label: 'HPV 59' },
  { key: 'hpv66', label: 'HPV 66' },
  { key: 'hpv68', label: 'HPV 68' },
]

const hasHrTypes = computed(() => hrTypes.some(t => data.value[t.key]))
</script>

<script lang="ts">
function InfoItem(props: { label: string; value?: string | null; mono?: boolean }) {
  if (!props.value) return h('div', {}, [
    h('p', { class: '!text-[10px] !font-bold !text-zinc-400 !uppercase !tracking-wider' }, props.label),
    h('p', { class: '!text-xs !text-zinc-300 !mt-1' }, '---'),
  ])
  return h('div', {}, [
    h('p', { class: '!text-[10px] !font-bold !text-zinc-400 !uppercase !tracking-wider' }, props.label),
    h('p', { class: '!text-xs !text-zinc-800 !font-semibold !mt-1' + (props.mono ? ' !font-mono' : '') }, props.value),
  ])
}

function SectionTitle(_props: any, ctx: any) {
  return h('div', { class: '!flex !items-center !gap-2' }, [
    h('span', { class: '!text-[10px] !font-bold !text-zinc-600 !uppercase !tracking-wider' }, ctx.slots.default?.()),
  ])
}

function TagBadge(props: { label: string; color: string }) {
  const colors: Record<string, string> = {
    red: '!bg-red-50 !text-red-700 !border-red-200',
    amber: '!bg-amber-50 !text-amber-700 !border-amber-200',
    orange: '!bg-orange-50 !text-orange-700 !border-orange-200',
    green: '!bg-emerald-50 !text-emerald-700 !border-emerald-200',
  }
  return h('span', {
    class: `!px-2.5 !py-1 !rounded-lg !text-[10px] !font-bold !border ${colors[props.color] || colors.red}`
  }, props.label)
}

export { InfoItem, TagBadge }
</script>
