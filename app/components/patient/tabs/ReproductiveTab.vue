<template>
  <div class="space-y-4">
    <v-expansion-panels v-model="reproPanels" multiple variant="accordion" class="rounded-lg overflow-hidden">
      <!-- Menstrual History -->
      <v-expansion-panel value="menstrual" class="border border-slate-100 mb-2 rounded-lg">
        <v-expansion-panel-title class="font-bold text-slate-700 text-sm bg-slate-50/50">قاعدگی</v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            <v-text-field v-model.number="reproForm.menstrual.menarche_age" label="سن منارک" type="number" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
            <v-text-field v-model.number="reproForm.menstrual.cycle_length" label="طول سیکل (روز)" type="number" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
            <v-text-field v-model.number="reproForm.menstrual.cycle_length_max" label="حداکثر طول سیکل" type="number" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
            <v-text-field v-model.number="reproForm.menstrual.flow_duration" label="مدت خونریزی (روز)" type="number" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
            <v-select v-model="reproForm.menstrual.flow_volume" :items="flowVolumeOptions" label="حجم خونریزی" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
            <div class="relative">
              <PersianDatetimePicker v-model="reproForm.menstrual.lmp" type="date" placeholder="تاریخ LMP"
                display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" color="#000000" auto-submit clearable
                custom-input class="w-full !h-[40px] border border-slate-400 hover:border-slate-800 text-sm text-slate-700 outline-none focus:border-electric-sapphire rounded px-3 bg-white transition-colors" />
            </div>
            <v-text-field v-model.number="reproForm.menstrual.dysmenorrhea_vas" label="دیسمنوره (VAS 0-10)" type="number" min="0" max="10" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
            <v-select v-model="reproForm.menstrual.pms" :items="yesNoOptions" label="PMS" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
            <v-select v-model="reproForm.menstrual.pmdd" :items="yesNoOptions" label="PMDD" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
          </div>
          <div class="flex justify-end pt-4 border-t border-slate-100">
            <v-btn variant="flat" color="black" size="small" class="rounded-lg px-6" :loading="saving" @click="emit('save', 'menstrual')">ذخیره</v-btn>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Sexual History -->
      <v-expansion-panel value="sexual" class="border border-slate-100 mb-2 rounded-lg">
        <v-expansion-panel-title class="font-bold text-slate-700 text-sm bg-slate-50/50">سابقه جنسی</v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="space-y-4 py-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <v-select v-model="reproForm.sexual.sexually_active" :items="yesNoOptions" label="فعالیت جنسی" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
              <v-text-field v-model="reproForm.sexual.current_contraceptive_method" label="روش پیشگیری فعلی" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
              <v-text-field v-model.number="reproForm.sexual.partner_count" label="تعداد شرکا" type="number" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
              <v-select v-model="reproForm.sexual.dyspareunia" :items="yesNoOptions" label="دیسپارونیا" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
            </div>
            <div>
              <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-slate-600">روش‌های پیشگیری قبلی</span>
                <v-btn icon size="x-small" variant="tonal" color="black" @click="reproForm.sexual.past_methods.push('')">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
              </div>
              <div v-for="(m, i) in reproForm.sexual.past_methods" :key="i" class="flex gap-2 mb-2">
                <v-text-field v-model="reproForm.sexual.past_methods[i]" label="روش" variant="outlined" density="compact" hide-details="auto" bg-color="white" class="flex-1" />
                <v-btn icon size="small" variant="text" color="error" @click="reproForm.sexual.past_methods.splice(i, 1)">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
            </div>
            <v-textarea v-model="reproForm.sexual.notes" label="یادداشت" variant="outlined" density="compact" rows="2" hide-details="auto" bg-color="white" />
          </div>
          <div class="flex justify-end pt-4 border-t border-slate-100">
            <v-btn variant="flat" color="black" size="small" class="rounded-lg px-6" :loading="saving" @click="emit('save', 'sexual')">ذخیره</v-btn>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Surgeries -->
      <v-expansion-panel value="surgeries" class="border border-slate-100 mb-2 rounded-lg">
        <v-expansion-panel-title class="font-bold text-slate-700 text-sm bg-slate-50/50">جراحی‌های زنان</v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="space-y-4 py-4">
            <div v-if="reproForm.surgeries.length === 0" class="text-center py-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
              <v-icon icon="mdi-clipboard-text-off-outline" size="x-large" class="text-slate-300 mb-2" />
              <p class="text-sm font-medium text-slate-500">هیچ جراحی ثبت نشده است.</p>
            </div>
            <div v-for="(surg, i) in reproForm.surgeries" :key="i" class="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold text-slate-500">جراحی شماره {{ Number(i) + 1 }}</span>
                <v-btn icon size="x-small" variant="text" color="error" @click="reproForm.surgeries.splice(i, 1)">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <v-text-field v-model="surg.surgery_type" label="نوع جراحی" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
                <div class="relative">
                  <PersianDatetimePicker v-model="surg.surgery_date" type="date" placeholder="تاریخ جراحی"
                    display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" color="#000000" auto-submit clearable
                    custom-input class="w-full !h-[40px] border border-slate-400 hover:border-slate-800 text-sm text-slate-700 outline-none focus:border-electric-sapphire rounded px-3 bg-white transition-colors" />
                </div>
                <v-text-field v-model="surg.hospital" label="بیمارستان" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
              </div>
              <v-textarea v-model="surg.notes" label="یادداشت" variant="outlined" density="compact" rows="1" hide-details="auto" bg-color="white" />
            </div>
            <v-btn variant="tonal" color="black" size="small" prepend-icon="mdi-plus" class="rounded-lg" @click="reproForm.surgeries.push({ surgery_type: '', surgery_date: null, hospital: '', notes: '' })">افزودن جراحی</v-btn>
          </div>
          <div class="flex justify-end pt-4 border-t border-slate-100">
            <v-btn variant="flat" color="black" size="small" class="rounded-lg px-6" :loading="saving" @click="emit('save', 'surgeries')">ذخیره</v-btn>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Contraceptives -->
      <v-expansion-panel value="contraceptives" class="border border-slate-100 mb-2 rounded-lg">
        <v-expansion-panel-title class="font-bold text-slate-700 text-sm bg-slate-50/50">سابقه پیشگیری از بارداری</v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="space-y-4 py-4">
            <div v-if="reproForm.contraceptives.length === 0" class="text-center py-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
              <v-icon icon="mdi-clipboard-text-off-outline" size="x-large" class="text-slate-300 mb-2" />
              <p class="text-sm font-medium text-slate-500">هیچ روش پیشگیری ثبت نشده است.</p>
            </div>
            <div v-for="(c, i) in reproForm.contraceptives" :key="i" class="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold text-slate-500">روش شماره {{ Number(i) + 1 }}</span>
                <v-btn icon size="x-small" variant="text" color="error" @click="reproForm.contraceptives.splice(i, 1)">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <v-text-field v-model="c.method" label="روش" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
                <div class="relative">
                  <PersianDatetimePicker v-model="c.start_date" type="date" placeholder="تاریخ شروع"
                    display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" color="#000000" auto-submit clearable
                    custom-input class="w-full !h-[40px] border border-slate-400 hover:border-slate-800 text-sm text-slate-700 outline-none focus:border-electric-sapphire rounded px-3 bg-white transition-colors" />
                </div>
                <div class="relative">
                  <PersianDatetimePicker v-model="c.end_date" type="date" placeholder="تاریخ پایان"
                    display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" color="#000000" auto-submit clearable
                    custom-input class="w-full !h-[40px] border border-slate-400 hover:border-slate-800 text-sm text-slate-700 outline-none focus:border-electric-sapphire rounded px-3 bg-white transition-colors" />
                </div>
              </div>
              <v-text-field v-model="c.reason_stopped" label="دلیل قطع" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
            </div>
            <v-btn variant="tonal" color="black" size="small" prepend-icon="mdi-plus" class="rounded-lg" @click="reproForm.contraceptives.push({ method: '', start_date: null, end_date: null, reason_stopped: '' })">افزودن روش</v-btn>
          </div>
          <div class="flex justify-end pt-4 border-t border-slate-100">
            <v-btn variant="flat" color="black" size="small" class="rounded-lg px-6" :loading="saving" @click="emit('save', 'contraceptives')">ذخیره</v-btn>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Family History -->
      <v-expansion-panel value="family" class="border border-slate-100 mb-2 rounded-lg">
        <v-expansion-panel-title class="font-bold text-slate-700 text-sm bg-slate-50/50">سابقه خانوادگی</v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="space-y-4 py-4">
            <div v-if="reproForm.family_history.length === 0" class="text-center py-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
              <v-icon icon="mdi-clipboard-text-off-outline" size="x-large" class="text-slate-300 mb-2" />
              <p class="text-sm font-medium text-slate-500">هیچ سابقه خانوادگی ثبت نشده است.</p>
            </div>
            <div v-for="(fh, i) in reproForm.family_history" :key="i" class="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-xs font-bold text-slate-500">مورد شماره {{ Number(i) + 1 }}</span>
                <v-btn icon size="x-small" variant="text" color="error" @click="reproForm.family_history.splice(i, 1)">
                  <v-icon>mdi-close</v-icon>
                </v-btn>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <v-text-field v-model="fh.relation" label="نسبت" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
                <v-text-field v-model="fh.condition" label="بیماری/شرایط" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
                <v-select v-model="fh.brca_mutation" :items="yesNoUnknownOptions" label="جهش BRCA" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
              </div>
              <v-textarea v-model="fh.notes" label="یادداشت" variant="outlined" density="compact" rows="1" hide-details="auto" bg-color="white" />
            </div>
            <v-btn variant="tonal" color="black" size="small" prepend-icon="mdi-plus" class="rounded-lg" @click="reproForm.family_history.push({ relation: '', condition: '', brca_mutation: '', notes: '' })">افزودن سابقه</v-btn>
          </div>
          <div class="flex justify-end pt-4 border-t border-slate-100">
            <v-btn variant="flat" color="black" size="small" class="rounded-lg px-6" :loading="saving" @click="emit('save', 'family_history')">ذخیره</v-btn>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>

      <!-- Summary -->
      <v-expansion-panel value="summary" class="border border-slate-100 mb-2 rounded-lg">
        <v-expansion-panel-title class="font-bold text-slate-700 text-sm bg-slate-50/50">خلاصه باروری</v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="grid grid-cols-2 md:grid-cols-5 gap-4 py-4">
            <v-text-field v-model.number="reproForm.summary.gravida" label="Gravida" type="number" min="0" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
            <v-text-field v-model.number="reproForm.summary.para" label="Para" type="number" min="0" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
            <v-text-field v-model.number="reproForm.summary.abortus" label="Abortus" type="number" min="0" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
            <v-text-field v-model.number="reproForm.summary.ectopics" label="حاملگی خارج رحم" type="number" min="0" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
            <v-text-field v-model.number="reproForm.summary.live_births" label="تولد زنده" type="number" min="0" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
            <v-text-field v-model.number="reproForm.summary.preterm_births" label="زایمان زودرس" type="number" min="0" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
            <v-text-field v-model.number="reproForm.summary.stillbirths" label="مرده‌زایی" type="number" min="0" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
            <v-text-field v-model.number="reproForm.summary.c_sections" label="سزارین" type="number" min="0" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
            <v-text-field v-model.number="reproForm.summary.vaginal_deliveries" label="زایمان طبیعی" type="number" min="0" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
          </div>
          <div class="flex justify-end pt-4 border-t border-slate-100">
            <v-btn variant="flat" color="black" size="small" class="rounded-lg px-6" :loading="saving" @click="emit('save', 'summary')">ذخیره</v-btn>
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  reproForm: any
  saving: boolean
  flowVolumeOptions: string[]
  yesNoOptions: string[]
  yesNoUnknownOptions: string[]
}>()

const emit = defineEmits<{
  save: [section: string]
}>()

const reproPanels = ref(['menstrual'])
</script>