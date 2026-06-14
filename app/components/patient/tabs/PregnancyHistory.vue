<template>
  <div class="max-w-6xl mx-auto space-y-6">
    
    <div class="bg-white p-6 shadow-sm rounded flex justify-between items-center mb-1 py-2 px-1">
      <div class="flex items-center gap-3">
        <v-icon icon="mdi-human-pregnant" class="text-pink-600" size="large" />
        <h3 class="text-base font-bold text-slate-800">
          تاریخچه بارداری و زایمان
        </h3>
      </div>
      
      <v-btn color="blue-600" variant="flat" prepend-icon="mdi-plus" class="rounded" size="small"
             @click="records.push({
               gravida_index: records.length + 1,
               status: 'current',
               lmp: null, edd: null,
               gestational_age_weeks: null, gestational_age_days: null,
               end_date: null, outcome: null, delivery_method: null, anesthesia_type: null,
               maternal_complications: [],
               prenatal_screenings: { nt_done: false, anomaly_done: false, nipt_done: false, gdm_done: false },
               newborns_details: [], notes: ''
             })">
        ثبت بارداری جدید
      </v-btn>
    </div>

    <div v-if="records.length === 0" class="text-center py-12 bg-slate-50 border-2 border-dashed border-slate-200 rounded">
      <v-icon icon="mdi-clipboard-text-off-outline" size="x-large" class="text-slate-300 mb-3" />
      <p class="text-sm font-medium text-slate-500">هیچ سابقه بارداری برای این بیمار ثبت نشده است.</p>
    </div>

    <v-expansion-panels v-else variant="accordion" class="rounded shadow-sm overflow-hidden">
      <v-expansion-panel v-for="(rec, index) in records" :key="index" class="bg-white border-b border-slate-100 last:border-0">
        
        <v-expansion-panel-title class="py-4 hover:bg-slate-50 transition-colors">
          <div class="flex justify-between w-full items-center pr-2">
            
            <div class="flex items-center gap-4">
              <span class="bg-blue-50 border border-blue-100 text-blue-700 w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold shadow-sm">
                G{{ rec.gravida_index }}
              </span>
              <div class="flex flex-col">
                <span class="font-bold text-slate-700 text-sm">بارداری شماره {{ rec.gravida_index }}</span>
                <span class="text-xs text-slate-400 mt-0.5">وضعیت: {{ rec.status === 'current' ? 'جاری' : 'خاتمه یافته' }}</span>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <v-chip size="small" :color="rec.status === 'current' ? 'emerald' : 'slate'" :variant="rec.status === 'current' ? 'flat' : 'tonal'" class="font-medium">
                {{ rec.status === 'current' ? 'در حال جریان' : 'پایان یافته' }}
              </v-chip>
              <v-btn icon="mdi-trash-can-outline" variant="text" color="error" size="small" density="comfortable"
                     @click.stop="records.splice(index, 1)" title="حذف این سابقه" />
            </div>
            
          </div>
        </v-expansion-panel-title>

        <v-expansion-panel-text class="bg-slate-50/30 pt-4">
          <div class="space-y-6">
            
            <div class="grid grid-cols-1 md:grid-cols-4 sm:grid-cols-2 gap-4">
              <v-text-field v-model.number="rec.gravida_index" label="اندیس بارداری (Gravida)" type="number" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
              <v-select v-model="rec.status" :items="statusOptions" label="وضعیت بارداری" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
              
              <div class="relative">
                <PersianDatetimePicker v-model="rec.lmp" type="date" placeholder="تاریخ LMP"
                  display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" color="#000000" auto-submit clearable
                  custom-input class="w-full !h-[40px] border border-slate-400 hover:border-slate-800 text-sm text-slate-700 outline-none focus:border-blue-600 rounded px-3 bg-white transition-colors" />
              </div>

              <div class="relative">
                <PersianDatetimePicker v-model="rec.edd" type="date" placeholder="تاریخ EDD"
                  display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" color="#000000" auto-submit clearable
                  custom-input class="w-full !h-[40px] border border-slate-400 hover:border-slate-800 text-sm text-slate-700 outline-none focus:border-blue-600 rounded px-3 bg-white transition-colors" />
              </div>

              <v-text-field v-model.number="rec.gestational_age_weeks" label="سن بارداری (هفته)" type="number" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
              <v-text-field v-model.number="rec.gestational_age_days" label="سن بارداری (روز)" type="number" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
              
              <div v-if="rec.status === 'completed'" class="relative">
                <PersianDatetimePicker v-model="rec.end_date" type="date" placeholder="تاریخ پایان (زایمان/سقط)"
                  display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" color="#000000" auto-submit clearable
                  custom-input class="w-full !h-[40px] border border-slate-400 hover:border-slate-800 text-sm text-slate-700 outline-none focus:border-blue-600 rounded px-3 bg-white transition-colors" />
              </div>
            </div>

            <v-divider class="border-slate-200" />

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <v-select v-model="rec.outcome" :items="outcomeOptions" label="نتیجه بارداری (Outcome)" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
              <v-select v-model="rec.delivery_method" :items="deliveryOptions" label="روش زایمان" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
              <v-select v-model="rec.anesthesia_type" :items="anesthesiaOptions" label="نوع بیهوشی" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
            </div>

            <div class="bg-white border border-slate-200 rounded p-4 px-2 shadow-sm">
              <h4 class="font-bold text-slate-700 text-sm my-3 flex items-center gap-2">
                <v-icon icon="mdi-microscope" size="small" class="text-indigo-500" />
                تست‌ها و غربالگری‌های انجام شده
              </h4>
              <div class="flex flex-wrap items-center gap-x-6 gap-y-2">
                <v-checkbox v-model="rec.prenatal_screenings.nt_done" label="سونوگرافی NT" density="compact" hide-details color="indigo" />
                <v-checkbox v-model="rec.prenatal_screenings.anomaly_done" label="اسکن آنومالی" density="compact" hide-details color="indigo" />
                <v-checkbox v-model="rec.prenatal_screenings.nipt_done" label="آزمایش NIPT" density="compact" hide-details color="indigo" />
                <v-checkbox v-model="rec.prenatal_screenings.gdm_done" label="تست دیابت (GDM)" density="compact" hide-details color="indigo" />
              </div>
            </div>

            <div class="bg-white mt-2 rounded p-4 shadow-sm">
              <div class="flex justify-between items-center my-4 py-2 px-2 border-b border-slate-100">
                <h4 class="font-bold text-slate-700 text-sm flex items-center gap-2">
                  <v-icon icon="mdi-alert-plus-outline" size="small" class="text-orange-500" />
                  عوارض مادر (Complications)
                </h4>
                <v-btn size="small" color="orange-darken-1" variant="tonal" prepend-icon="mdi-plus"
                       @click="rec.maternal_complications.push({ title: '', severity: 'mild' })">
                  افزودن عارضه
                </v-btn>
              </div>

              <div class="space-y-3">
                <div v-for="(c, i) in rec.maternal_complications" :key="'comp-'+i" class="flex gap-3 items-start">
                  <v-text-field v-model="c.title" label="عنوان عارضه (مثل مسمومیت حاملگی)" variant="outlined" density="compact" hide-details="auto" class="flex-1" />
                  <v-select v-model="c.severity" :items="severityOptions" label="شدت" variant="outlined" density="compact" hide-details="auto" class="w-32 shrink-0" />
                  <v-btn icon="mdi-close" variant="text" color="error" size="small" density="comfortable" class="mt-1"
                         @click="rec.maternal_complications.splice(i, 1)" />
                </div>
                <div v-if="!rec.maternal_complications.length" class="text-xs text-slate-400 font-medium py-2">
                  هیچ عارضه‌ای ثبت نشده است.
                </div>
              </div>
            </div>

            <div class="bg-white border border-slate-200 rounded p-4 my-2 shadow-sm">
              <div class="flex justify-between items-center my-2 py-2 px-2 border-b border-slate-100">
                <h4 class="font-bold text-slate-700 text-sm flex items-center gap-2">
                  <v-icon icon="mdi-baby-face-outline" size="small" class="text-blue-500" />
                  اطلاعات نوزادان
                </h4>
                <v-btn size="small" color="blue-darken-1" variant="tonal" prepend-icon="mdi-plus"
                       @click="rec.newborns_details.push({ gender: '', weight: null, height: null, head_circumference: null, apgar1: null, apgar5: null, nicu: false })">
                  افزودن نوزاد (چندقلویی)
                </v-btn>
              </div>

              <div class="space-y-4">
                <div v-for="(b, i) in rec.newborns_details" :key="'baby-'+i" class="bg-slate-50 border border-slate-200 rounded-lg p-4 relative group">
                  
                  <v-btn icon="mdi-close-circle" variant="text" color="error" size="small" density="compact" class="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                         @click="rec.newborns_details.splice(i, 1)" title="حذف نوزاد" />
                         
                  <div class="px-2 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 items-center">
                    <v-text-field v-model="b.gender" label="جنسیت" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
                    <v-text-field v-model.number="b.weight" label="وزن (گرم)" type="number" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
                    <v-text-field v-model.number="b.height" label="قد (cm)" type="number" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
                    <v-text-field v-model.number="b.head_circumference" label="دور سر" type="number" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
                    <v-text-field v-model.number="b.apgar1" label="آپگار 1" type="number" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
                    <v-text-field v-model.number="b.apgar5" label="آپگار 5" type="number" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
                    <v-checkbox v-model="b.nicu" label="بستری NICU" density="compact" hide-details color="red" class="mx-auto" />
                  </div>
                </div>
                <div v-if="!rec.newborns_details.length" class="text-xs text-slate-400 font-medium py-2">
                  اطلاعات نوزادی ثبت نشده است.
                </div>
              </div>
            </div>

            <v-textarea v-model="rec.notes" label="یادداشت‌های پزشک برای این بارداری" variant="outlined" density="compact" rows="2" hide-details="auto" bg-color="white" />
            
          </div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <div class="bg-white p-6 shadow-sm rounded-2xl">
      <h4 class="text-sm font-bold text-slate-800 my-4 flex items-center gap-2">
        <v-icon icon="mdi-note-text-outline" class="text-slate-500" size="small" />
        توضیحات و سوابق کلی بیمار
      </h4>
      <v-textarea v-model="generalNotes" label="یادداشت‌های عمومی، حساسیت‌ها یا موارد خاص مربوط به کل سوابق زایمان..." variant="outlined" density="compact" rows="3" hide-details="auto" bg-color="slate-50" />
    </div>

  </div>
</template>

<script setup lang="ts">
const records = defineModel<any[]>('records', { required: true })
const generalNotes = defineModel<string>('generalNotes', { required: true })

const statusOptions = ['current', 'completed']

const outcomeOptions = [
  'live_birth',
  'stillbirth',
  'miscarriage',
  'abortion',
  'ectopic',
  'molar'
]

const deliveryOptions = [
  'nvd',
  'c_section_elective',
  'c_section_emergency',
  'forceps_vacuum'
]

const anesthesiaOptions = [
  'none',
  'spinal',
  'epidural',
  'general'
]

const severityOptions = ['mild', 'moderate', 'severe']
</script>