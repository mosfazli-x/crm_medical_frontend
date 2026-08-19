<template>
  <div class="space-y-4">
    <v-expansion-panels v-model="openPanels" multiple variant="accordion" class="rounded-lg overflow-hidden">
      <!-- Vaccination Records -->
      <v-expansion-panel value="records" class="border border-slate-100 mb-2 rounded-lg">
        <v-expansion-panel-title class="font-bold text-slate-700 text-sm bg-slate-50/50">
          <div class="flex items-center gap-2">
            <v-icon icon="mdi-needle" color="green-darken-2" size="small" />
            {{ t('vaccination.title') }}
            <v-chip v-if="records.length" size="x-small" variant="tonal" color="green" class="ml-2">{{ records.length }}</v-chip>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="space-y-4! gap-2">
            <!-- Empty State -->
            <div v-if="records.length === 0"
              class="text-center py-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
              <v-icon icon="mdi-needle" size="x-large" class="text-slate-300 mb-2" />
              <p class="text-sm font-medium text-slate-500">{{ t('vaccination.noRecords') }}</p>
              <p class="text-xs text-slate-400 mt-1">{{ t('vaccination.addHint') }}</p>
            </div>

            <!-- Vaccination Cards -->
            <div v-for="(vac, i) in records" :key="vac.id || i"
              class="bg-slate-50 border border-slate-200 rounded-lg p-4! space-y-3!">
              <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                  <span class="text-xs font-bold text-slate-500">{{ t('vaccination.vaccineNumber') }} {{ Number(i) + 1 }}</span>
                  <v-chip v-if="vac.status === 'completed'" size="x-small" color="green" variant="tonal">{{ t('vaccination.completed') }}</v-chip>
                  <v-chip v-else-if="vac.status === 'scheduled'" size="x-small" color="blue" variant="tonal">{{ t('vaccination.scheduled') }}</v-chip>
                  <v-chip v-else-if="vac.status === 'missed'" size="x-small" color="red" variant="tonal">{{ t('vaccination.missed') }}</v-chip>
                </div>
                <v-btn icon size="x-small" variant="text" color="error" @click="removeRecord(i)">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <v-select v-model="vac.vaccine_name" :items="commonVaccines" :label="t('vaccination.vaccineName')" variant="outlined"
                  density="compact" hide-details="auto" bg-color="white" />
                <v-select v-model="vac.dose_number" :items="doseOptions" :label="t('vaccination.dose')" variant="outlined"
                  density="compact" hide-details="auto" bg-color="white" />
                <div class="relative h-[40px] border rounded overflow-hidden">
                  <PersianDatetimePicker v-model="vac.date_administered" type="date" :placeholder="t('vaccination.administrationDate')"
                    display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" color="#000000" auto-submit clearable
                    custom-input
                    class="w-full !h-[40px] border border-slate-400 hover:border-slate-800 text-sm text-slate-700 outline-none focus:border-electric-sapphire rounded px-3 bg-white transition-colors" />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <v-text-field v-model="vac.manufacturer" :label="t('vaccination.manufacturer')" variant="outlined" density="compact"
                  hide-details="auto" bg-color="white" placeholder="e.g. Sinovac, Pfizer" append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting(t('vaccination.manufacturer'), false, (text) => vac.manufacturer = text)" />
                <v-text-field v-model="vac.lot_number" :label="t('vaccination.lotNumber')" variant="outlined" density="compact"
                  hide-details="auto" bg-color="white" append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting(t('vaccination.lotNumber'), false, (text) => vac.lot_number = text)" />
                <v-select v-model="vac.site" :items="siteOptions" :label="t('vaccination.injectionSite')" variant="outlined" density="compact"
                  hide-details="auto" bg-color="white" />
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <v-text-field v-model="vac.administered_by" :label="t('vaccination.administeredBy')" variant="outlined" density="compact"
                  hide-details="auto" bg-color="white" append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting(t('vaccination.administeredBy'), false, (text) => vac.administered_by = text)" />
                <div class="relative h-[40px] border rounded overflow-hidden">
                  <PersianDatetimePicker v-model="vac.next_dose_date" type="date" :placeholder="t('vaccination.nextDoseDate')"
                    display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" color="#000000" auto-submit clearable
                    custom-input
                    class="w-full !h-[40px] border border-slate-400 hover:border-slate-800 text-sm text-slate-700 outline-none focus:border-electric-sapphire rounded px-3 bg-white transition-colors" />
                </div>
                <v-select v-model="vac.status" :items="statusOptions" item-title="label" item-value="value"
                  :label="t('vaccination.status')" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
              </div>

              <v-textarea v-model="vac.notes" :label="t('vaccination.notes')" variant="outlined" density="compact" rows="1"
                hide-details="auto" bg-color="white" append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting(t('vaccination.notes'), false, (text) => vac.notes = text)" />
            </div>

            <v-btn variant="tonal" color="black" size="small" prepend-icon="mdi-plus" class="rounded-lg"
              @click="addRecord">
              {{ t('vaccination.addVaccine') }}
            </v-btn>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Upcoming Doses Summary -->
      <v-expansion-panel v-if="upcomingDoses.length > 0" value="upcoming"
        class="border border-slate-100 mb-2 rounded-lg">
        <v-expansion-panel-title class="font-bold text-slate-700 text-sm bg-slate-50/50">
          <div class="flex items-center gap-2">
            <v-icon icon="mdi-calendar-clock" color="blue-darken-2" size="small" />
            {{ t('vaccination.upcomingDoses') }}
            <v-chip size="x-small" variant="tonal" color="blue" class="ml-2">{{ upcomingDoses.length }}</v-chip>
          </div>
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="space-y-2 py-2">
            <div v-for="dose in upcomingDoses" :key="dose.id"
              class="flex items-center justify-between bg-blue-50/50 border border-blue-100 rounded-lg px-4 py-3">
              <div>
                <p class="text-sm font-medium text-slate-800">{{ dose.vaccine_name }} — {{ dose.dose_number }}</p>
                <p class="text-xs text-slate-500 mt-0.5">{{ t('vaccination.administeredDatePrefix') }} {{ dose.next_dose_date }}</p>
              </div>
              <v-chip size="small" color="blue" variant="tonal">
                {{ dose.daysUntil }} {{ t('vaccination.daysRemaining') }}
              </v-chip>
            </div>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
  <HandwritingDialog v-model="handwritingOpen" :label="handwritingLabel" :numeric="handwritingNumeric" @insert="applyHandwriting" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HandwritingDialog from '~/components/HandwritingDialog.vue'

const { t } = useI18n()

const records = defineModel<any[]>('records', { required: true })

const openPanels = ref(['records'])

const handwritingOpen = ref(false)
const handwritingLabel = ref('')
const handwritingNumeric = ref(false)
const handwritingCallback = ref<((text: string) => void) | null>(null)

function openHandwriting(label: string, numeric: boolean, callback: (text: string) => void) {
  handwritingLabel.value = label
  handwritingNumeric.value = numeric
  handwritingCallback.value = callback
  handwritingOpen.value = true
}

function applyHandwriting(text: string) {
  handwritingCallback.value?.(text)
}

const commonVaccines = [
  'COVID-19 (Sinovac)',
  'COVID-19 (Pfizer)',
  'COVID-19 (AstraZeneca)',
  'COVID-19 (Johnson & Johnson)',
  'Hepatitis B',
  'Hepatitis A',
  'HPV (Gardasil)',
  'Influenza',
  'Tetanus (Td)',
  'Tetanus (Tdap)',
  'MMR',
  'Varicella',
  'Polio (IPV)',
  'Pneumococcal',
  'Meningococcal',
  'Rabies',
  'BCG',
  'Encephalitis',
  'Other',
]

const doseOptions = computed(() => t('vaccination.doseOptions'))

const siteOptions = computed(() => t('vaccination.injectionSiteOptions'))

const statusOptions = computed(() => [
  { label: t('vaccination.statusLabels.completed'), value: 'completed' },
  { label: t('vaccination.statusLabels.scheduled'), value: 'scheduled' },
  { label: t('vaccination.statusLabels.missed'), value: 'missed' },
])

function addRecord() {
  records.value.push({
    vaccine_name: '',
    dose_number: '',
    date_administered: null,
    lot_number: '',
    manufacturer: '',
    site: '',
    administered_by: '',
    next_dose_date: null,
    status: 'completed',
    notes: '',
  })
}

function removeRecord(index: number) {
  records.value.splice(index, 1)
}

const upcomingDoses = computed(() => {
  const now = new Date()
  return records.value
    .filter(v => v.next_dose_date && v.status !== 'missed')
    .map(v => {
      const nextDate = new Date(v.next_dose_date!)
      const diffMs = nextDate.getTime() - now.getTime()
      const daysUntil = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
      return { ...v, daysUntil }
    })
    .filter(v => v.daysUntil > 0)
    .sort((a, b) => a.daysUntil - b.daysUntil)
})
</script>
