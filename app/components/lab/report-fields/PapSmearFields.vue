<template>
  <div>
    <div v-for="(section, si) in sections" :key="si" class="!border-b !border-zinc-100 last:!border-b-0">
      <button class="!w-full !flex !items-center justify-between !px-6 !py-3.5 hover:!bg-zinc-50/50 !transition-colors !text-right"
        @click="toggle(si)">
        <div class="!flex !items-center !gap-2.5">
          <Icon :name="section.icon" class="!w-4 !h-4 !text-zinc-500" />
          <span class="!text-xs !font-bold !text-zinc-800">{{ section.title }}</span>
          <span v-if="section.required" class="!text-red-400 !text-[10px]">*{{ t('papSmear.required') }}</span>
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
import { ref, reactive, watch } from 'vue'
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
  get miscarriage_history() { return model.value.miscarriage_history || '' },
  set miscarriage_history(v: string) { model.value.miscarriage_history = v },
  get referral_reason() { return model.value.referral_reason || '' },
  set referral_reason(v: string) { model.value.referral_reason = v },
  get iud_duration() { return model.value.iud_duration || '' },
  set iud_duration(v: string) { model.value.iud_duration = v },
  get staining_technique() { return model.value.staining_technique || '' },
  set staining_technique(v: string) { model.value.staining_technique = v },
  get sampling_source() { return model.value.sampling_source || '' },
  set sampling_source(v: string) { model.value.sampling_source = v },
  get sample_quality() { return model.value.sample_quality || '' },
  set sample_quality(v: string) { model.value.sample_quality = v },
  get asc_us() { return model.value.asc_us || false },
  set asc_us(v: boolean) { model.value.asc_us = v },
  get asc_h() { return model.value.asc_h || false },
  set asc_h(v: boolean) { model.value.asc_h = v },
  get lsil() { return model.value.lsil || false },
  set lsil(v: boolean) { model.value.lsil = v },
  get hsil() { return model.value.hsil || false },
  set hsil(v: boolean) { model.value.hsil = v },
  get scc() { return model.value.scc || false },
  set scc(v: boolean) { model.value.scc = v },
  get agc() { return model.value.agc || false },
  set agc(v: boolean) { model.value.agc = v },
  get ais() { return model.value.ais || false },
  set ais(v: boolean) { model.value.ais = v },
  get ac() { return model.value.ac || false },
  set ac(v: boolean) { model.value.ac = v },
  get endocervical_cells() { return model.value.endocervical_cells || false },
  set endocervical_cells(v: boolean) { model.value.endocervical_cells = v },
  get endometrial_cells() { return model.value.endometrial_cells || false },
  set endometrial_cells(v: boolean) { model.value.endometrial_cells = v },
  get inflammatory_cells() { return model.value.inflammatory_cells || '' },
  set inflammatory_cells(v: string) { model.value.inflammatory_cells = v },
  get conclusion() { return model.value.conclusion || '' },
  set conclusion(v: string) { model.value.conclusion = v },
  get recommendations() { return model.value.recommendations || '' },
  set recommendations(v: string) { model.value.recommendations = v },
  get follow_up() { return model.value.follow_up || '' },
  set follow_up(v: string) { model.value.follow_up = v },
})

const stainingOptions = ['Liquid Based (LBC)', 'Conventional Pap Smear', 'Cell Block']
const sourceOptions = ['Endocervical', 'Ectocervical', 'Vaginal fornix', 'Mixed']
const qualityOptions = ['Adequate', 'Suboptimal - Blood', 'Suboptimal - Inflammation', 'Inadequate - Dry', 'Inadequate - Obscured']
const fluidOptions = ['Clear', 'Pink', 'Red', 'Brown', 'Yellow', 'Green']

const sections = [
  {
    title: t('papSmear.sectionIntro'),
    icon: 'lucide:user',
    required: true,
    content: {
      render: () => h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
        h('div', {}, [
          h('label', { class: labelClass }, t('papSmear.patientName')),
          h('input', { modelValue: f.patient_name, 'onUpdate:modelValue': (v: string) => f.patient_name = v, class: inputClass, placeholder: t('papSmear.patientNamePlaceholder') }),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('papSmear.recordNumber')),
          h('input', { modelValue: f.record_number, 'onUpdate:modelValue': (v: string) => f.record_number = v, class: inputClass, placeholder: t('papSmear.recordNumberPlaceholder') }),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('papSmear.samplerName')),
          h('input', { modelValue: f.sampler_name, 'onUpdate:modelValue': (v: string) => f.sampler_name = v, class: inputClass, placeholder: t('papSmear.samplerNamePlaceholder') }),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('papSmear.receiptDate')),
          h('input', { modelValue: f.receipt_date, 'onUpdate:modelValue': (v: string) => f.receipt_date = v, class: inputClass, placeholder: t('papSmear.receiptDatePlaceholder') }),
        ]),
      ]),
    },
  },
  {
    title: t('papSmear.sectionSample'),
    icon: 'lucide:flask-conical',
    required: true,
    content: {
      render: () => h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
        h('div', {}, [
          h('label', { class: labelClass }, t('papSmear.sampleCode')),
          h('input', { modelValue: f.sample_code, 'onUpdate:modelValue': (v: string) => f.sample_code = v, class: inputClass, placeholder: t('papSmear.sampleCodePlaceholder') }),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('papSmear.sampleVolume')),
          h('input', { modelValue: f.sample_volume, 'onUpdate:modelValue': (v: string) => f.sample_volume = v, class: inputClass, placeholder: t('papSmear.sampleVolumePlaceholder') }),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('papSmear.containerType')),
          h('input', { modelValue: f.container_type, 'onUpdate:modelValue': (v: string) => f.container_type = v, class: inputClass, placeholder: t('papSmear.containerTypePlaceholder') }),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('papSmear.sampleCondition')),
          h('select', { modelValue: f.sample_condition, 'onUpdate:modelValue': (v: string) => f.sample_condition = v, class: inputClass },
            ['-', ...qualityOptions].map(opt => h('option', { value: opt === '-' ? '' : opt }, opt === '-' ? t('papSmear.selectPlaceholder') : opt))
          ),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('papSmear.fluidColor')),
          h('select', { modelValue: f.fluid_color, 'onUpdate:modelValue': (v: string) => f.fluid_color = v, class: inputClass },
            ['-', ...fluidOptions].map(opt => h('option', { value: opt === '-' ? '' : opt }, opt === '-' ? t('papSmear.selectPlaceholder') : opt))
          ),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('papSmear.sendTime')),
          h('input', { modelValue: f.send_time, 'onUpdate:modelValue': (v: string) => f.send_time = v, class: inputClass, placeholder: t('papSmear.sendTimePlaceholder') }),
        ]),
      ]),
    },
  },
  {
    title: t('papSmear.sectionClinical'),
    icon: 'lucide:stethoscope',
    required: false,
    content: {
      render: () => h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
        h('div', {}, [
          h('label', { class: labelClass }, t('papSmear.patientAge')),
          h('input', { modelValue: f.patient_age, 'onUpdate:modelValue': (v: string) => f.patient_age = v, class: inputClass, type: 'number', placeholder: t('papSmear.patientAgePlaceholder') }),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('papSmear.lastMenstruation')),
          h('input', { modelValue: f.last_menstruation, 'onUpdate:modelValue': (v: string) => f.last_menstruation = v, class: inputClass, placeholder: t('papSmear.lastMenstruationPlaceholder') }),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('papSmear.deliveryHistory')),
          h('input', { modelValue: f.delivery_history, 'onUpdate:modelValue': (v: string) => f.delivery_history = v, class: inputClass, placeholder: t('papSmear.deliveryHistoryPlaceholder') }),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('papSmear.miscarriageHistory')),
          h('input', { modelValue: f.miscarriage_history, 'onUpdate:modelValue': (v: string) => f.miscarriage_history = v, class: inputClass, placeholder: t('papSmear.miscarriageHistoryPlaceholder') }),
        ]),
        h('div', { class: 'md:col-span-2' }, [
          h('label', { class: labelClass }, t('papSmear.referralReason')),
          h('input', { modelValue: f.referral_reason, 'onUpdate:modelValue': (v: string) => f.referral_reason = v, class: inputClass, placeholder: t('papSmear.referralReasonPlaceholder') }),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('papSmear.iudDuration')),
          h('input', { modelValue: f.iud_duration, 'onUpdate:modelValue': (v: string) => f.iud_duration = v, class: inputClass, type: 'number', placeholder: t('papSmear.iudDurationPlaceholder') }),
        ]),
      ]),
    },
  },
  {
    title: t('papSmear.sectionCyto'),
    icon: 'lucide:microscope',
    required: true,
    content: {
      render: () => h('div', { class: 'space-y-5' }, [
        h('div', { class: 'grid grid-cols-1 md:grid-cols-3 gap-4' }, [
          h('div', {}, [
          h('label', { class: labelClass }, t('papSmear.stainingTechnique')),
          h('select', { modelValue: f.staining_technique, 'onUpdate:modelValue': (v: string) => f.staining_technique = v, class: inputClass },
            ['-', ...stainingOptions].map(opt => h('option', { value: opt === '-' ? '' : opt }, opt === '-' ? t('papSmear.selectPlaceholder') : opt))
          ),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('papSmear.samplingSource')),
          h('select', { modelValue: f.sampling_source, 'onUpdate:modelValue': (v: string) => f.sampling_source = v, class: inputClass },
            ['-', ...sourceOptions].map(opt => h('option', { value: opt === '-' ? '' : opt }, opt === '-' ? t('papSmear.selectPlaceholder') : opt))
          ),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('papSmear.sampleQuality')),
          h('select', { modelValue: f.sample_quality, 'onUpdate:modelValue': (v: string) => f.sample_quality = v, class: inputClass },
            ['-', ...qualityOptions].map(opt => h('option', { value: opt === '-' ? '' : opt }, opt === '-' ? t('papSmear.selectPlaceholder') : opt))
          ),
        ]),
      ]),

        h('div', {}, [
          h('p', { class: '!text-[10px] !font-bold !text-zinc-500 !mb-2.5 !uppercase !tracking-wider' }, t('papSmear.squamousEval')),
          h('div', { class: 'grid grid-cols-2 md:grid-cols-5 gap-2' },
            [
              { label: 'ASC-US', key: 'asc_us' },
              { label: 'ASC-H', key: 'asc_h' },
              { label: 'LSIL', key: 'lsil' },
              { label: 'HSIL', key: 'hsil' },
              { label: 'SCC', key: 'scc' },
            ].map(item => h('button', {
              key: item.key,
              class: [
                '!px-3 !py-2.5 !rounded-xl !text-xs !font-semibold !border !transition-all !duration-200 !text-center',
                f[item.key as keyof typeof f]
                  ? '!bg-red-50 !text-red-700 !border-red-200'
                  : '!bg-white !text-zinc-500 !border-zinc-200 hover:!border-zinc-300 hover:!text-zinc-700'
              ],
              onClick: () => { (f as any)[item.key] = !(f as any)[item.key] }
            }, item.label))
          ),
        ]),

        h('div', {}, [
          h('p', { class: '!text-[10px] !font-bold !text-zinc-500 !mb-2.5 !uppercase !tracking-wider' }, t('papSmear.glandularEval')),
          h('div', { class: 'grid grid-cols-3 gap-2' },
            [
              { label: 'AGC', key: 'agc' },
              { label: 'AIS', key: 'ais' },
              { label: 'AC', key: 'ac' },
            ].map(item => h('button', {
              key: item.key,
              class: [
                '!px-3 !py-2.5 !rounded-xl !text-xs !font-semibold !border !transition-all !duration-200 !text-center',
                f[item.key as keyof typeof f]
                  ? '!bg-red-50 !text-red-700 !border-red-200'
                  : '!bg-white !text-zinc-500 !border-zinc-200 hover:!border-zinc-300 hover:!text-zinc-700'
              ],
              onClick: () => { (f as any)[item.key] = !(f as any)[item.key] }
            }, item.label))
          ),
        ]),
      ]),
    },
  },
  {
    title: t('papSmear.sectionInflammatory'),
    icon: 'lucide:scan-eye',
    required: false,
    content: {
      render: () => h('div', { class: 'space-y-4' }, [
        h('div', { class: 'grid grid-cols-1 md:grid-cols-2 gap-4' }, [
          h('div', {}, [
          h('label', { class: labelClass }, t('papSmear.inflammatoryCells')),
          h('input', { modelValue: f.inflammatory_cells, 'onUpdate:modelValue': (v: string) => f.inflammatory_cells = v, class: inputClass, placeholder: t('papSmear.inflammatoryCellsPlaceholder') }),
          ]),
        ]),
        h('div', { class: 'flex gap-4' }, [
          h('label', { class: '!flex !items-center !gap-2 !cursor-pointer !text-xs !text-zinc-600' }, [
            h('input', { type: 'checkbox', checked: f.endocervical_cells, onChange: (e: any) => f.endocervical_cells = e.target.checked, class: '!w-4 !h-4 !rounded !accent-zinc-900' }),
            t('papSmear.endocervicalCellsPresent'),
          ]),
          h('label', { class: '!flex !items-center !gap-2 !cursor-pointer !text-xs !text-zinc-600' }, [
            h('input', { type: 'checkbox', checked: f.endometrial_cells, onChange: (e: any) => f.endometrial_cells = e.target.checked, class: '!w-4 !h-4 !rounded !accent-zinc-900' }),
            t('papSmear.endometrialCellsPresent'),
          ]),
        ]),
      ]),
    },
  },
  {
    title: t('papSmear.sectionConclusion'),
    icon: 'lucide:clipboard-check',
    required: true,
    content: {
      render: () => h('div', { class: 'space-y-4' }, [
        h('div', {}, [
          h('label', { class: labelClass }, t('papSmear.conclusion')),
          h('textarea', {
            modelValue: f.conclusion,
            'onUpdate:modelValue': (v: string) => f.conclusion = v,
            class: inputClass + ' !min-h-[80px]',
            rows: 4,
            placeholder: t('papSmear.conclusionPlaceholder'),
          }),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('papSmear.recommendations')),
          h('textarea', {
            modelValue: f.recommendations,
            'onUpdate:modelValue': (v: string) => f.recommendations = v,
            class: inputClass + ' !min-h-[60px]',
            rows: 3,
            placeholder: t('papSmear.recommendationsPlaceholder'),
          }),
        ]),
        h('div', {}, [
          h('label', { class: labelClass }, t('papSmear.followUp')),
          h('input', {
            modelValue: f.follow_up,
            'onUpdate:modelValue': (v: string) => f.follow_up = v,
            class: inputClass,
            placeholder: t('papSmear.followUpPlaceholder'),
          }),
        ]),
      ]),
    },
  },
]

const labelClass = '!text-[10px] !font-bold !text-zinc-500 !mb-1.5 !block !uppercase !tracking-wider'
const inputClass = '!w-full !bg-white !border !border-zinc-200/80 !text-zinc-900 !text-xs !rounded-xl focus:!ring-4 focus:!ring-zinc-900/5 focus:!border-zinc-900 !px-3 !py-2.5 !transition-all !outline-none !shadow-sm'

import { h } from 'vue'
</script>

<style scoped>
select {
  appearance: auto;
}
</style>
