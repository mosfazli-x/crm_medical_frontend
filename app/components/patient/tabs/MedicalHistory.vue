<template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div class="bg-white dark:bg-slate-800! border border-slate-200 rounded p-5 shadow-sm col-span-1 md:col-span-2">
            <div class="flex justify-between items-center border-b border-slate-100 py-2 mb-3 px-2">
                <h3 class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <v-icon icon="mdi-heart-pulse" color="red-darken-2" size="small" /> {{ t('medicalHistory.underlyingDiseases') }}
                </h3>
                <v-btn variant="tonal" size="small" prepend-icon="mdi-plus" class="rounded-lg bg-slate-100! dark:bg-slate-400! hover:opacity-80" 
                    @click="form.diseases.push({ name: '', diagnosed_at: null })">{{ t('common.add') }}</v-btn>
            </div>
            
            <div v-if="form.diseases.length === 0" class="text-sm text-slate-400 text-center py-2">{{ t('medicalHistory.noDiseases') }}</div>
            
            <div v-for="(disease, i) in form.diseases" :key="i" class="flex flex-col lg:flex-row gap-4 mb-3 items-start px-2">
                <v-text-field v-model="disease.name" :label="t('medicalHistory.diseaseName')" variant="outlined" density="compact" hide-details class="flex-1 w-full" append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting(t('medicalHistory.diseaseName'), false, (text) => disease.name = text)" />
                <div class="relative h-[40px] border rounded overflow-hidden lg:w-[200px] w-full">
                    <PersianDatetimePicker v-model="disease.diagnosed_at" type="date" :placeholder="t('medicalHistory.diagnosisDate')"
                        display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" auto-submit custom-input 
                        class="w-full border border-slate-300 rounded-md px-3 h-[40px] text-sm" />
                </div>
                <v-btn icon variant="text" size="small" color="error" class="mt-1" @click="form.diseases.splice(i, 1)">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </div>
        </div>

        <div class="bg-white dark:bg-slate-800! border border-slate-200 rounded p-5 shadow-sm">
            <div class="flex justify-between items-center border-b border-slate-100 py-2 mb-3 px-2">
                <h3 class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <v-icon icon="mdi-pill" color="#4F46E5" size="small" /> {{ t('medicalHistory.currentMedications') }}
                </h3>
                <v-btn variant="tonal" color="black" size="small" prepend-icon="mdi-plus" class="rounded-lg bg-slate-100! dark:bg-slate-400! hover:opacity-80" 
                    @click="form.medications.push({ name: '', dosage: '' })">{{ t('common.add') }}</v-btn>
            </div>
            
            <div v-if="form.medications.length === 0" class="text-sm text-slate-400 text-center py-2">{{ t('medicalHistory.noMedications') }}</div>

            <div v-for="(med, i) in form.medications" :key="i" class="flex gap-2 mb-3 px-2">
                <v-text-field v-model="med.name" :label="t('medicalHistory.medicationName')" variant="outlined" density="compact" hide-details class="flex-1" append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting(t('medicalHistory.medicationName'), false, (text) => med.name = text)" />
                <v-text-field v-model="med.dosage" :label="t('medicalHistory.dosage')" variant="outlined" density="compact" hide-details class="w-1/3" append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting(t('medicalHistory.dosage'), false, (text) => med.dosage = text)" />
                <v-btn icon variant="text" size="small" color="error" class="mt-1" @click="form.medications.splice(i, 1)">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </div>
        </div>

        <div class="bg-white dark:bg-slate-800! border border-slate-200 rounded p-5 shadow-sm">
            <div class="flex justify-between items-center border-b border-slate-100 py-2 mb-3 px-2">
                <h3 class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    <v-icon icon="mdi-alert-circle-outline" color="amber-darken-4" size="small" /> {{ t('medicalHistory.allergies') }}
                </h3>
                <v-btn variant="tonal" color="black" size="small" prepend-icon="mdi-plus" class="rounded-lg bg-slate-100! dark:bg-slate-400! hover:opacity-80" 
                    @click="form.allergies.push({ substance: '', severity: t('medicalHistory.moderate') })">{{ t('common.add') }}</v-btn>
            </div>

            <div v-if="form.allergies.length === 0" class="text-sm text-slate-400 text-center py-2">{{ t('medicalHistory.noAllergies') }}</div>

            <div v-for="(allergy, i) in form.allergies" :key="i" class="flex gap-2 mb-3 px-2">
                <v-text-field v-model="allergy.substance" :label="t('medicalHistory.substance')" variant="outlined" density="compact" hide-details class="flex-1" append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting(t('medicalHistory.substance'), false, (text) => allergy.substance = text)" />
                <v-select v-model="allergy.severity" :items="severityOptions" :label="t('medicalHistory.severity')" variant="outlined" density="compact" hide-details class="w-1/3" />
                <v-btn icon variant="text" size="small" color="error" class="mt-1" @click="form.allergies.splice(i, 1)">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </div>
        </div>
    </div>
    <HandwritingDialog v-model="handwritingOpen" :label="handwritingLabel" :numeric="handwritingNumeric" @insert="applyHandwriting" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import HandwritingDialog from '~/components/HandwritingDialog.vue'

const { t } = useI18n()
const form = defineModel<any>({ required: true })

const handwritingOpen = ref(false)
const handwritingLabel = ref('')
const handwritingNumeric = ref(false)
const handwritingCallback = ref<((text: string) => void) | null>(null)

const severityOptions = computed(() => [
  t('medicalHistory.mild'),
  t('medicalHistory.moderate'),
  t('medicalHistory.severe'),
])

function openHandwriting(label: string, numeric: boolean, callback: (text: string) => void) {
  handwritingLabel.value = label
  handwritingNumeric.value = numeric
  handwritingCallback.value = callback
  handwritingOpen.value = true
}

function applyHandwriting(text: string) {
  handwritingCallback.value?.(text)
}
</script>
