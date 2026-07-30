<template>
  <div>
    <div v-for="(section, si) in sections" :key="si" class="!border-b !border-zinc-100 last:!border-b-0">
      <button class="!w-full !flex !items-center justify-between !px-6 !py-3.5 hover:!bg-zinc-50/50 !transition-colors !text-right"
        @click="toggle(si)">
        <div class="!flex !items-center !gap-2.5">
          <Icon :name="section.icon" class="!w-4 !h-4 !text-zinc-500" />
          <span class="!text-xs !font-bold !text-zinc-800">{{ section.title }}</span>
          <span v-if="section.required" class="!text-red-400 !text-[10px]">*{{ t('hpv.required') }}</span>
        </div>
        <Icon name="lucide:chevron-down" class="!w-3.5 !h-3.5 !text-zinc-400 !transition-transform !duration-200"
          :class="{ '!rotate-180': open.includes(si) }" />
      </button>
      <div v-show="open.includes(si)" class="!px-6 !pb-5">
        <component :is="section.content" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const model = defineModel<Record<string, any>>({ required: true })
const open = ref<number[]>([0, 1])

function toggle(i: number) {
  const idx = open.value.indexOf(i)
  if (idx >= 0) open.value.splice(idx, 1)
  else open.value.push(i)
}

const f = reactive({
  get patient_name() { return model.value.patient_name || '' },
  set patient_name(v: string) { model.value.patient_name = v },
  get record_number() { return model.value.record_number || '' },
  set record_number(v: string) { model.value.record_number = v },
  get sampler_name() { return model.value.sampler_name || '' },
  set sampler_name(v: string) { model.value.sampler_name = v },
  get receipt_date() { return model.value.receipt_date || '' },
  set receipt_date(v: string) { model.value.receipt_date = v },
  get sample_code() { return model.value.sample_code || '' },
  set sample_code(v: string) { model.value.sample_code = v },
  get sample_volume() { return model.value.sample_volume || '' },
  set sample_volume(v: string) { model.value.sample_volume = v },
  get container_type() { return model.value.container_type || '' },
  set container_type(v: string) { model.value.container_type = v },
  get sample_condition() { return model.value.sample_condition || '' },
  set sample_condition(v: string) { model.value.sample_condition = v },
  get fluid_color() { return model.value.fluid_color || '' },
  set fluid_color(v: string) { model.value.fluid_color = v },
  get send_time() { return model.value.send_time || '' },
  set send_time(v: string) { model.value.send_time = v },
  get patient_age() { return model.value.patient_age || '' },
  set patient_age(v: string) { model.value.patient_age = v },
  get last_menstruation() { return model.value.last_menstruation || '' },
  set last_menstruation(v: string) { model.value.last_menstruation = v },
  get delivery_history() { return model.value.delivery_history || '' },
  set delivery_history(v: string) { model.value.delivery_history = v },
  get referral_reason() { return model.value.referral_reason || '' },
  set referral_reason(v: string) { model.value.referral_reason = v },
  get hpv_status() { return model.value.hpv_status || '' },
  set hpv_status(v: string) { model.value.hpv_status = v },
  get hpv16() { return model.value.hpv16 || false },
  set hpv16(v: boolean) { model.value.hpv16 = v },
  get hpv18() { return model.value.hpv18 || false },
  set hpv18(v: boolean) { model.value.hpv18 = v },
  get hpv31() { return model.value.hpv31 || false },
  set hpv31(v: boolean) { model.value.hpv31 = v },
  get hpv33() { return model.value.hpv33 || false },
  set hpv33(v: boolean) { model.value.hpv33 = v },
  get hpv35() { return model.value.hpv35 || false },
  set hpv35(v: boolean) { model.value.hpv35 = v },
  get hpv39() { return model.value.hpv39 || false },
  set hpv39(v: boolean) { model.value.hpv39 = v },
  get hpv45() { return model.value.hpv45 || false },
  set hpv45(v: boolean) { model.value.hpv45 = v },
  get hpv51() { return model.value.hpv51 || false },
  set hpv51(v: boolean) { model.value.hpv51 = v },
  get hpv52() { return model.value.hpv52 || false },
  set hpv52(v: boolean) { model.value.hpv52 = v },
  get hpv56() { return model.value.hpv56 || false },
  set hpv56(v: boolean) { model.value.hpv56 = v },
  get hpv58() { return model.value.hpv58 || false },
  set hpv58(v: boolean) { model.value.hpv58 = v },
  get hpv59() { return model.value.hpv59 || false },
  set hpv59(v: boolean) { model.value.hpv59 = v },
  get hpv66() { return model.value.hpv66 || false },
  set hpv66(v: boolean) { model.value.hpv66 = v },
  get hpv68() { return model.value.hpv68 || false },
  set hpv68(v: boolean) { model.value.hpv68 = v },
  get other_genotypes() { return model.value.other_genotypes || '' },
  set other_genotypes(v: string) { model.value.other_genotypes = v },
  get viral_load() { return model.value.viral_load || '' },
  set viral_load(v: string) { model.value.viral_load = v },
  get p16_ki67_result() { return model.value.p16_ki67_result || '' },
  set p16_ki67_result(v: string) { model.value.p16_ki67_result = v },
  get conclusion() { return model.value.conclusion || '' },
  set conclusion(v: string) { model.value.conclusion = v },
  get recommendations() { return model.value.recommendations || '' },
  set recommendations(v: string) { model.value.recommendations = v },
  get follow_up() { return model.value.follow_up || '' },
  set follow_up(v: string) { model.value.follow_up = v },
})

const stainingOptions = ['PCR', 'Hybrid Capture', 'In Situ Hybridization']
const qualityOptions = ['Adequate', 'Suboptimal - Blood', 'Suboptimal - Inflammation', 'Inadequate']
const fluidOptions = ['Clear', 'Pink', 'Red', 'Brown', 'Yellow', 'Green']
const hpvStatusOptions = ['Positive', 'Negative', 'Indeterminate']
const p16Options = ['Positive', 'Negative', 'Equivocal', 'Not performed']

const highRiskTypes = [
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

const labelClass = '!text-[10px] !font-bold !text-zinc-500 !mb-1.5 !block !uppercase !tracking-wider'
const inputClass = '!w-full !bg-white !border !border-zinc-200/80 !text-zinc-900 !text-xs !rounded-xl focus:!ring-4 focus:!ring-zinc-900/5 focus:!border-zinc-900 !px-3 !py-2.5 !transition-all !outline-none !shadow-sm'

import { h } from 'vue'

const sections = [
  {
    title: t('hpv.sectionIntro'),
    icon: 'lucide:user',
    required: true,
    content: {
      render: () => h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
        h('div', {}, [
          h('label', { class: labelClass }, t('hpv.patientName')),
          h('input', { modelValue: f.patient_name, 'onUpdate:modelValue': (v: string) => f.patient_name = v, class: inputClass, placeholder: t('hpv.patientNamePlaceholder') }),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('hpv.recordNumber')),
          h('input', { modelValue: f.record_number, 'onUpdate:modelValue': (v: string) => f.record_number = v, class: inputClass, placeholder: t('hpv.recordNumberPlaceholder') }),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('hpv.samplerName')),
          h('input', { modelValue: f.sampler_name, 'onUpdate:modelValue': (v: string) => f.sampler_name = v, class: inputClass, placeholder: t('hpv.samplerNamePlaceholder') }),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('hpv.receiptDate')),
          h('input', { modelValue: f.receipt_date, 'onUpdate:modelValue': (v: string) => f.receipt_date = v, class: inputClass, placeholder: t('hpv.receiptDatePlaceholder') }),
        ]),
      ]),
    },
  },
  {
    title: t('hpv.sectionSample'),
    icon: 'lucide:flask-conical',
    required: true,
    content: {
      render: () => h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
        h('div', {}, [
          h('label', { class: labelClass }, t('hpv.sampleCode')),
          h('input', { modelValue: f.sample_code, 'onUpdate:modelValue': (v: string) => f.sample_code = v, class: inputClass, placeholder: t('hpv.sampleCodePlaceholder') }),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('hpv.sampleVolume')),
          h('input', { modelValue: f.sample_volume, 'onUpdate:modelValue': (v: string) => f.sample_volume = v, class: inputClass, placeholder: t('hpv.sampleVolumePlaceholder') }),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('hpv.containerType')),
          h('input', { modelValue: f.container_type, 'onUpdate:modelValue': (v: string) => f.container_type = v, class: inputClass, placeholder: t('hpv.containerTypePlaceholder') }),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('hpv.sampleCondition')),
          h('select', { modelValue: f.sample_condition, 'onUpdate:modelValue': (v: string) => f.sample_condition = v, class: inputClass },
            ['-', ...qualityOptions].map(opt => h('option', { value: opt === '-' ? '' : opt }, opt === '-' ? t('hpv.selectPlaceholder') : opt))
          ),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('hpv.fluidColor')),
          h('select', { modelValue: f.fluid_color, 'onUpdate:modelValue': (v: string) => f.fluid_color = v, class: inputClass },
            ['-', ...fluidOptions].map(opt => h('option', { value: opt === '-' ? '' : opt }, opt === '-' ? t('hpv.selectPlaceholder') : opt))
          ),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('hpv.sendTime')),
          h('input', { modelValue: f.send_time, 'onUpdate:modelValue': (v: string) => f.send_time = v, class: inputClass, placeholder: t('hpv.sendTimePlaceholder') }),
        ]),
      ]),
    },
  },
  {
    title: t('hpv.sectionClinical'),
    icon: 'lucide:stethoscope',
    required: false,
    content: {
      render: () => h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
        h('div', {}, [
          h('label', { class: labelClass }, t('hpv.patientAge')),
          h('input', { modelValue: f.patient_age, 'onUpdate:modelValue': (v: string) => f.patient_age = v, class: inputClass, type: 'number', placeholder: t('hpv.patientAgePlaceholder') }),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('hpv.lastMenstruation')),
          h('input', { modelValue: f.last_menstruation, 'onUpdate:modelValue': (v: string) => f.last_menstruation = v, class: inputClass, placeholder: t('hpv.lastMenstruationPlaceholder') }),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('hpv.deliveryHistory')),
          h('input', { modelValue: f.delivery_history, 'onUpdate:modelValue': (v: string) => f.delivery_history = v, class: inputClass, placeholder: t('hpv.deliveryHistoryPlaceholder') }),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('hpv.referralReason')),
          h('input', { modelValue: f.referral_reason, 'onUpdate:modelValue': (v: string) => f.referral_reason = v, class: inputClass, placeholder: t('hpv.referralReasonPlaceholder') }),
        ]),
      ]),
    },
  },
  {
    title: t('hpv.sectionHpvStatus'),
    icon: 'lucide:shield-check',
    required: true,
    content: {
      render: () => h('div', { class: 'space-y-5' }, [
        h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
          h('div', {}, [
          h('label', { class: labelClass }, t('hpv.hpvStatus')),
          h('select', { modelValue: f.hpv_status, 'onUpdate:modelValue': (v: string) => f.hpv_status = v, class: inputClass },
            ['-', ...hpvStatusOptions].map(opt => h('option', { value: opt === '-' ? '' : opt }, opt === '-' ? t('hpv.selectPlaceholder') : opt))
          ),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('hpv.viralLoad')),
          h('input', { modelValue: f.viral_load, 'onUpdate:modelValue': (v: string) => f.viral_load = v, class: inputClass, placeholder: t('hpv.viralLoadPlaceholder') }),
        ]),
      ]),

        h('div', {}, [
          h('p', { class: '!text-[10px] !font-bold !text-zinc-500 !mb-2.5 !uppercase !tracking-wider' }, t('hpv.genotyping')),
          h('div', { class: 'grid grid-cols-3 md:grid-cols-7 gap-2' },
            highRiskTypes.map(item => h('button', {
              key: item.key,
              class: [
                '!px-2 !py-2 !rounded-lg !text-[11px] !font-semibold !border !transition-all !duration-200 !text-center',
                f[item.key as keyof typeof f]
                  ? '!bg-red-50 !text-red-700 !border-red-200'
                  : '!bg-white !text-zinc-500 !border-zinc-200 hover:!border-zinc-300 hover:!text-zinc-700'
              ],
              onClick: () => { (f as any)[item.key] = !(f as any)[item.key] }
            }, item.label))
          ),
          h('div', { class: 'mt-3' }, [
            h('label', { class: labelClass }, t('hpv.otherGenotypes')),
            h('input', { modelValue: f.other_genotypes, 'onUpdate:modelValue': (v: string) => f.other_genotypes = v, class: inputClass, placeholder: t('hpv.otherGenotypesPlaceholder') }),
          ]),
        ]),
      ]),
    },
  },
  {
    title: t('hpv.sectionAdditional'),
    icon: 'lucide:flask-conical',
    required: false,
    content: {
      render: () => h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
        h('div', {}, [
          h('label', { class: labelClass }, t('hpv.p16Result')),
          h('select', { modelValue: f.p16_ki67_result, 'onUpdate:modelValue': (v: string) => f.p16_ki67_result = v, class: inputClass },
            ['-', ...p16Options].map(opt => h('option', { value: opt === '-' ? '' : opt }, opt === '-' ? t('hpv.selectPlaceholder') : opt))
          ),
        ]),
      ]),
    },
  },
  {
    title: t('hpv.sectionConclusion'),
    icon: 'lucide:clipboard-check',
    required: true,
    content: {
      render: () => h('div', { class: 'space-y-4' }, [
        h('div', {}, [
          h('label', { class: labelClass }, t('hpv.conclusion')),
          h('textarea', {
            modelValue: f.conclusion,
            'onUpdate:modelValue': (v: string) => f.conclusion = v,
            class: inputClass + ' !min-h-[80px]',
            rows: 4,
            placeholder: t('hpv.conclusionPlaceholder'),
          }),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('hpv.recommendations')),
          h('textarea', {
            modelValue: f.recommendations,
            'onUpdate:modelValue': (v: string) => f.recommendations = v,
            class: inputClass + ' !min-h-[60px]',
            rows: 3,
            placeholder: t('hpv.recommendationsPlaceholder'),
          }),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('hpv.followUp')),
          h('input', {
            modelValue: f.follow_up,
            'onUpdate:modelValue': (v: string) => f.follow_up = v,
            class: inputClass,
            placeholder: t('hpv.followUpPlaceholder'),
          }),
        ]),
      ]),
    },
  },
]
</script>

<style scoped>
select {
  appearance: auto;
}
</style>
