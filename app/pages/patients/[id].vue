<template>
  <div class="max-w-7xl mx-auto p-4 md:p-8 pt-6 space-y-6">
    <div v-if="loading" class="space-y-6">
      <v-skeleton-loader type="card-heading" class="rounded-2xl" />
      <v-skeleton-loader type="image" class="rounded-2xl h-[400px]" />
    </div>

    <template v-else-if="patient">
      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-2xl bg-periwinkle text-electric-sapphire flex items-center justify-center text-xl font-bold shadow-sm">
              {{ patient.firstName?.charAt(0) }}{{ patient.lastName?.charAt(0) }}
            </div>
            <div>
              <h1 class="text-2xl font-extrabold text-slate-800">{{ patient.firstName }} {{ patient.lastName }}</h1>
              <div class="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                <span class="font-mono tracking-wider">{{ patient.nationalId }}</span>
                <span class="w-1 h-1 bg-slate-300 rounded-full" />
                <span dir="ltr">{{ patient.phone || '---' }}</span>
                <span class="w-1 h-1 bg-slate-300 rounded-full" />
                <span>{{ formatDate(patient.birthDate) }}</span>
              </div>
            </div>
          </div>
          <v-btn variant="tonal" color="#5465ff" size="small" class="rounded-lg" @click="refreshAll">بروزرسانی</v-btn>
        </div>
      </div>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-200">
        <v-tabs v-model="activeTab" color="black" bg-color="transparent" slider-color="black">
          <v-tab value="reproductive" class="text-sm font-medium tracking-wide">سابقه باروری</v-tab>
          <v-tab value="lifestyle" class="text-sm font-medium tracking-wide">سبک زندگی</v-tab>
          <v-tab value="screening" class="text-sm font-medium tracking-wide">غربالگری</v-tab>
          <v-tab value="lab" class="text-sm font-medium tracking-wide">آزمایشات</v-tab>
          <v-tab value="consent" class="text-sm font-medium tracking-wide">رضایت‌نامه</v-tab>
        </v-tabs>

        <v-divider />

        <div class="p-6">
          <v-window v-model="activeTab">
            <v-window-item value="reproductive">
              <div v-if="reproLoading" class="space-y-4">
                <v-skeleton-loader type="list-item-two-line" v-for="i in 3" :key="i" />
              </div>
              <div v-else class="space-y-4">
                <v-expansion-panels v-model="reproPanels" multiple variant="accordion" class="rounded-lg overflow-hidden">
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
                        <v-btn variant="flat" color="black" size="small" class="rounded-lg px-6" :loading="menstrualSaving" @click="saveMenstrualHistory">ذخیره</v-btn>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>

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
                        <v-btn variant="flat" color="black" size="small" class="rounded-lg px-6" :loading="sexualSaving" @click="saveSexualHistory">ذخیره</v-btn>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>

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
                            <span class="text-xs font-bold text-slate-500">جراحی شماره {{ i + 1 }}</span>
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
                        <v-btn variant="flat" color="black" size="small" class="rounded-lg px-6" :loading="surgeriesSaving" @click="saveSurgeries">ذخیره</v-btn>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>

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
                            <span class="text-xs font-bold text-slate-500">روش شماره {{ i + 1 }}</span>
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
                        <v-btn variant="flat" color="black" size="small" class="rounded-lg px-6" :loading="contraceptivesSaving" @click="saveContraceptives">ذخیره</v-btn>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>

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
                            <span class="text-xs font-bold text-slate-500">مورد شماره {{ i + 1 }}</span>
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
                        <v-btn variant="flat" color="black" size="small" class="rounded-lg px-6" :loading="familySaving" @click="saveFamilyHistory">ذخیره</v-btn>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>

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
                        <v-btn variant="flat" color="black" size="small" class="rounded-lg px-6" :loading="summarySaving" @click="saveReproductiveSummary">ذخیره</v-btn>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </div>
            </v-window-item>

            <v-window-item value="lifestyle">
              <div class="max-w-2xl space-y-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <v-select v-model="lifestyleForm.smoking" :items="yesNoOptions" label="استعمال دخانیات" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
                  <v-text-field v-model.number="lifestyleForm.bmi" label="BMI" type="number" step="0.1" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
                  <v-text-field v-model="lifestyleForm.exercise" label="فعالیت ورزشی" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
                  <v-select v-model="lifestyleForm.alcohol" :items="yesNoOptions" label="مصرف الکل" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
                </div>
                <div class="flex justify-end">
                  <v-btn variant="flat" color="black" size="small" class="rounded-lg px-8" :loading="lifestyleSaving" @click="saveLifestyle">ذخیره تغییرات</v-btn>
                </div>
              </div>
            </v-window-item>

            <v-window-item value="screening">
              <div v-if="screeningLoading" class="space-y-4">
                <v-skeleton-loader type="list-item-two-line" v-for="i in 3" :key="i" />
              </div>
              <div v-else class="space-y-8">
                <div>
                  <div class="flex items-center justify-between mb-4">
                    <h3 class="text-base font-bold text-slate-800">غربالگری‌های برنامه‌ریزی شده</h3>
                    <v-btn variant="tonal" color="black" size="small" prepend-icon="mdi-plus" class="rounded-lg" @click="screeningDialog = true">ثبت غربالگری جدید</v-btn>
                  </div>
                  <div v-if="screeningSchedules.length === 0" class="text-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
                    <v-icon icon="mdi-clipboard-text-off-outline" size="x-large" class="text-slate-300 mb-2" />
                    <p class="text-sm font-medium text-slate-500">هیچ غربالگری برنامه‌ریزی نشده است.</p>
                  </div>
                  <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div v-for="s in screeningSchedules" :key="s.id" class="bg-slate-50 border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p class="font-medium text-slate-800 text-sm">{{ s.test_name || s.testName || '---' }}</p>
                        <p class="text-xs text-slate-500 mt-1">{{ formatDate(s.scheduled_date || s.scheduledDate) }}</p>
                      </div>
                      <v-chip size="x-small" :color="s.status === 'done' ? 'green' : s.status === 'overdue' ? 'red' : 'amber'" variant="tonal">
                        {{ s.status === 'done' ? 'انجام شده' : s.status === 'overdue' ? 'معوق' : 'در انتظار' }}
                      </v-chip>
                    </div>
                  </div>
                </div>

                <v-divider />

                <div>
                  <h3 class="text-base font-bold text-slate-800 mb-4">نتایج غربالگری</h3>
                  <div v-if="screeningResults.length === 0" class="text-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
                    <v-icon icon="mdi-clipboard-text-off-outline" size="x-large" class="text-slate-300 mb-2" />
                    <p class="text-sm font-medium text-slate-500">نتیجه‌ای ثبت نشده است.</p>
                  </div>
                  <div v-else class="space-y-3">
                    <div v-for="r in screeningResults" :key="r.id" class="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                      <div>
                        <p class="font-medium text-slate-800 text-sm">{{ r.test_name || r.testName || '---' }}</p>
                        <p class="text-xs text-slate-500 mt-1">نتیجه: {{ r.result || '---' }} — {{ formatDate(r.test_date || r.testDate) }}</p>
                      </div>
                      <v-chip size="x-small" :color="r.normal ? 'green' : 'red'" variant="tonal">{{ r.normal ? 'نرمال' : 'غیرنرمال' }}</v-chip>
                    </div>
                  </div>
                </div>

                <v-divider v-if="overdueSchedules.length" />

                <div v-if="overdueSchedules.length">
                  <h3 class="text-base font-bold text-red-600 mb-4">غربالگری‌های معوق</h3>
                  <div v-for="s in overdueSchedules" :key="s.id" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-3 flex items-center justify-between">
                    <div>
                      <p class="font-medium text-red-800 text-sm">{{ s.test_name || s.testName || '---' }}</p>
                      <p class="text-xs text-red-500 mt-1">سررسید: {{ formatDate(s.scheduled_date || s.scheduledDate) }}</p>
                    </div>
                    <v-chip size="x-small" color="red" variant="tonal">معوق</v-chip>
                  </div>
                </div>
              </div>

              <v-dialog v-model="screeningDialog" max-width="550" persistent>
                <v-card class="rounded-2xl">
                  <v-card-title class="text-lg font-bold text-slate-800 px-6 pt-6 pb-4">ثبت غربالگری جدید</v-card-title>
                  <v-card-text class="px-6 pb-6 space-y-4">
                    <v-text-field v-model="screeningForm.test_name" label="نوع غربالگری" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
                    <div class="relative">
                      <PersianDatetimePicker v-model="screeningForm.scheduled_date" type="date" placeholder="تاریخ برنامه‌ریزی"
                        display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" color="#000000" auto-submit clearable
                        custom-input class="w-full !h-[40px] border border-slate-400 hover:border-slate-800 text-sm text-slate-700 outline-none focus:border-electric-sapphire rounded px-3 bg-white transition-colors" />
                    </div>
                    <v-textarea v-model="screeningForm.notes" label="یادداشت" variant="outlined" density="compact" rows="2" hide-details="auto" bg-color="white" />
                  </v-card-text>
                  <v-card-actions class="px-6 pb-6 flex justify-end gap-3">
                    <v-btn variant="text" color="slate-600" @click="screeningDialog = false">انصراف</v-btn>
                    <v-btn variant="flat" color="black" :loading="screeningCreating" @click="createScreening">ثبت</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-window-item>

            <v-window-item value="lab">
              <div v-if="labLoading" class="space-y-4">
                <v-skeleton-loader type="list-item-two-line" v-for="i in 3" :key="i" />
              </div>
              <div v-else class="space-y-8">
                <div class="flex items-center justify-between">
                  <h3 class="text-base font-bold text-slate-800">نتایج آزمایشات</h3>
                  <v-btn variant="tonal" color="black" size="small" prepend-icon="mdi-plus" class="rounded-lg" @click="labDialog = true">ثبت نتیجه جدید</v-btn>
                </div>
                <div v-if="labResults.length === 0" class="text-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
                  <v-icon icon="mdi-clipboard-text-off-outline" size="x-large" class="text-slate-300 mb-2" />
                  <p class="text-sm font-medium text-slate-500">نتیجه آزمایشی ثبت نشده است.</p>
                </div>
                <div v-else class="space-y-3">
                  <div v-for="lab in labResults" :key="lab.id" class="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:border-slate-300 transition-colors cursor-pointer" @click="showLabTrend(lab)">
                    <div class="flex-1">
                      <p class="font-medium text-slate-800 text-sm">{{ lab.test_name || lab.testName || '---' }}</p>
                      <p class="text-xs text-slate-500 mt-1">نتیجه: {{ lab.result || '---' }} (محدوده مرجع: {{ lab.reference_range || lab.referenceRange || '---' }}) — {{ formatDate(lab.test_date || lab.testDate) }}</p>
                    </div>
                    <v-chip size="x-small" :color="lab.abnormal ? 'red' : 'green'" variant="tonal">{{ lab.abnormal ? 'غیرنرمال' : 'نرمال' }}</v-chip>
                  </div>
                </div>

                <v-dialog v-model="labTrendDialog" max-width="700" v-if="selectedLabTest">
                  <v-card class="rounded-2xl">
                    <v-card-title class="text-lg font-bold text-slate-800 px-6 pt-6 pb-4 flex items-center gap-3">
                      <span>روند {{ selectedLabTest.test_name || selectedLabTest.testName }}</span>
                      <v-btn icon variant="text" size="small" class="text-slate-400" @click="labTrendDialog = false">
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </v-card-title>
                    <v-card-text class="px-6 pb-6">
                      <div v-if="labTrendLoading" class="text-center py-8">
                        <v-progress-circular indeterminate color="black" size="40" />
                      </div>
                      <div v-else-if="labTrendData.length === 0" class="text-center py-8 text-sm text-slate-500">
                        داده کافی برای نمایش روند وجود ندارد.
                      </div>
                      <div v-else class="space-y-3">
                        <div v-for="t in labTrendData" :key="t.id" class="bg-slate-50 border border-slate-200 rounded-lg p-3 flex justify-between items-center">
                          <div>
                            <span class="font-medium text-slate-800 text-sm">{{ t.result }}</span>
                            <span class="text-xs text-slate-500 mr-2">{{ formatDate(t.test_date || t.testDate) }}</span>
                          </div>
                          <v-chip size="x-small" :color="t.abnormal ? 'red' : 'green'" variant="tonal">{{ t.abnormal ? 'غیرنرمال' : 'نرمال' }}</v-chip>
                        </div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-dialog>
              </div>

              <v-dialog v-model="labDialog" max-width="550" persistent>
                <v-card class="rounded-2xl">
                  <v-card-title class="text-lg font-bold text-slate-800 px-6 pt-6 pb-4">ثبت نتیجه آزمایش</v-card-title>
                  <v-card-text class="px-6 pb-6 space-y-4">
                    <v-text-field v-model="labForm.test_name" label="نام آزمایش" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
                    <v-text-field v-model="labForm.result" label="نتیجه" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
                    <v-text-field v-model="labForm.reference_range" label="محدوده مرجع" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
                    <v-select v-model="labForm.abnormal" :items="[{ title: 'نرمال', value: false }, { title: 'غیرنرمال', value: true }]" item-title="title" item-value="value" label="وضعیت" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
                    <div class="relative">
                      <PersianDatetimePicker v-model="labForm.test_date" type="date" placeholder="تاریخ آزمایش"
                        display-format="jYYYY/jMM/jDD" format="YYYY-MM-DD" color="#000000" auto-submit clearable
                        custom-input class="w-full !h-[40px] border border-slate-400 hover:border-slate-800 text-sm text-slate-700 outline-none focus:border-electric-sapphire rounded px-3 bg-white transition-colors" />
                    </div>
                    <v-textarea v-model="labForm.notes" label="یادداشت" variant="outlined" density="compact" rows="2" hide-details="auto" bg-color="white" />
                  </v-card-text>
                  <v-card-actions class="px-6 pb-6 flex justify-end gap-3">
                    <v-btn variant="text" color="slate-600" @click="labDialog = false">انصراف</v-btn>
                    <v-btn variant="flat" color="black" :loading="labCreating" @click="createLabResult">ثبت</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-window-item>

            <v-window-item value="consent">
              <div v-if="consentLoading" class="space-y-4">
                <v-skeleton-loader type="list-item-two-line" v-for="i in 3" :key="i" />
              </div>
              <div v-else class="space-y-8">
                <div class="flex items-center justify-between">
                  <h3 class="text-base font-bold text-slate-800">رضایت‌نامه‌ها</h3>
                  <v-btn variant="tonal" color="black" size="small" prepend-icon="mdi-plus" class="rounded-lg" @click="consentDialog = true">ثبت رضایت‌نامه جدید</v-btn>
                </div>
                <div v-if="consentRecords.length === 0" class="text-center py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg">
                  <v-icon icon="mdi-clipboard-text-off-outline" size="x-large" class="text-slate-300 mb-2" />
                  <p class="text-sm font-medium text-slate-500">هیچ رضایت‌نامه‌ای ثبت نشده است.</p>
                </div>
                <div v-else class="space-y-3">
                  <div v-for="c in consentRecords" :key="c.id" class="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between">
                    <div class="flex-1">
                      <p class="font-medium text-slate-800 text-sm">{{ c.type || c.consent_type || '---' }}</p>
                      <p class="text-xs text-slate-500 mt-1">تاریخ: {{ formatDate(c.date || c.createdAt) }}</p>
                      <p v-if="c.revoked_at || c.revokedAt" class="text-xs text-red-500 mt-0.5">لغو شده در: {{ formatDate(c.revoked_at || c.revokedAt) }}</p>
                    </div>
                    <div class="flex items-center gap-2">
                      <v-chip size="x-small" :color="c.revoked_at || c.revokedAt ? 'red' : 'green'" variant="tonal">
                        {{ c.revoked_at || c.revokedAt ? 'لغو شده' : 'فعال' }}
                      </v-chip>
                      <v-btn v-if="!c.revoked_at && !c.revokedAt" variant="text" color="red" size="x-small" :loading="revokingId === c.id" @click="revokeConsent(c)">
                        لغو
                      </v-btn>
                    </div>
                  </div>
                </div>
              </div>

              <v-dialog v-model="consentDialog" max-width="550" persistent>
                <v-card class="rounded-2xl">
                  <v-card-title class="text-lg font-bold text-slate-800 px-6 pt-6 pb-4">ثبت رضایت‌نامه جدید</v-card-title>
                  <v-card-text class="px-6 pb-6 space-y-4">
                    <v-text-field v-model="consentForm.type" label="نوع رضایت‌نامه" variant="outlined" density="compact" hide-details="auto" bg-color="white" />
                    <v-textarea v-model="consentForm.description" label="توضیحات" variant="outlined" density="compact" rows="3" hide-details="auto" bg-color="white" />
                  </v-card-text>
                  <v-card-actions class="px-6 pb-6 flex justify-end gap-3">
                    <v-btn variant="text" color="slate-600" @click="consentDialog = false">انصراف</v-btn>
                    <v-btn variant="flat" color="black" :loading="consentCreating" @click="createConsent">ثبت</v-btn>
                  </v-card-actions>
                </v-card>
              </v-dialog>
            </v-window-item>
          </v-window>
        </div>
      </div>
    </template>

    <div v-else-if="loadError" class="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
      <v-icon icon="mdi-alert-circle-outline" size="x-large" class="text-red-400 mb-4" />
      <h2 class="text-xl font-bold text-slate-700 mb-2">خطا در دریافت اطلاعات بیمار</h2>
      <p class="text-slate-500 mb-6">{{ loadError }}</p>
      <v-btn variant="tonal" color="black" @click="fetchPatient">تلاش مجدد</v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useApi } from '~/composables/useApi'
import { useRoute } from 'vue-router'

const route = useRoute()
const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

const patientId = computed(() => route.params.id as string)

const loading = ref(true)
const loadError = ref('')
const activeTab = ref('reproductive')

const patient = ref<any>(null)

const reproLoading = ref(false)
const reproPanels = ref(['menstrual'])
const menstrualSaving = ref(false)
const sexualSaving = ref(false)
const surgeriesSaving = ref(false)
const contraceptivesSaving = ref(false)
const familySaving = ref(false)
const summarySaving = ref(false)

const lifestyleSaving = ref(false)

const screeningLoading = ref(false)
const screeningDialog = ref(false)
const screeningCreating = ref(false)
const screeningSchedules = ref<any[]>([])
const screeningResults = ref<any[]>([])
const overdueSchedules = ref<any[]>([])

const labLoading = ref(false)
const labDialog = ref(false)
const labCreating = ref(false)
const labResults = ref<any[]>([])
const labTrendDialog = ref(false)
const labTrendLoading = ref(false)
const labTrendData = ref<any[]>([])
const selectedLabTest = ref<any>(null)

const consentLoading = ref(false)
const consentDialog = ref(false)
const consentCreating = ref(false)
const consentRecords = ref<any[]>([])
const revokingId = ref('')

const screeningForm = reactive({
  test_name: '',
  scheduled_date: null as string | null,
  notes: ''
})

const labForm = reactive({
  test_name: '',
  result: '',
  reference_range: '',
  abnormal: false,
  test_date: null as string | null,
  notes: ''
})

const consentForm = reactive({
  type: '',
  description: ''
})

const lifestyleForm = reactive({
  smoking: '',
  bmi: null as number | null,
  exercise: '',
  alcohol: ''
})

const reproForm = reactive({
  menstrual: {
    menarche_age: null as number | null,
    cycle_length: null as number | null,
    cycle_length_max: null as number | null,
    flow_duration: null as number | null,
    flow_volume: '',
    lmp: null as string | null,
    dysmenorrhea_vas: null as number | null,
    pms: '',
    pmdd: ''
  },
  sexual: {
    sexually_active: '',
    current_contraceptive_method: '',
    past_methods: [] as string[],
    partner_count: null as number | null,
    dyspareunia: '',
    notes: ''
  },
  surgeries: [] as Array<{ surgery_type: string; surgery_date: string | null; hospital: string; notes: string }>,
  contraceptives: [] as Array<{ method: string; start_date: string | null; end_date: string | null; reason_stopped: string }>,
  family_history: [] as Array<{ relation: string; condition: string; brca_mutation: string; notes: string }>,
  summary: {
    gravida: null as number | null,
    para: null as number | null,
    abortus: null as number | null,
    ectopics: null as number | null,
    live_births: null as number | null,
    preterm_births: null as number | null,
    stillbirths: null as number | null,
    c_sections: null as number | null,
    vaginal_deliveries: null as number | null
  }
})

const flowVolumeOptions = ['کم', 'متوسط', 'زیاد', 'خیلی زیاد']
const yesNoOptions = ['بله', 'خیر']
const yesNoUnknownOptions = ['بله', 'خیر', 'نامشخص']

const formatDate = (date: string | null) => {
  if (!date) return '---'
  try {
    return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date))
  } catch {
    return date
  }
}

const fetchPatient = async () => {
  loading.value = true
  loadError.value = ''
  try {
    const res = await apiFetch<any>(`/api/patients/${patientId.value}`, {
      baseURL: useRuntimeConfig().public.apiBase
    })
    if (res.success) {
      patient.value = res.data
      if (res.data) {
        lifestyleForm.smoking = res.data.smoking ?? ''
        lifestyleForm.bmi = res.data.bmi ?? null
        lifestyleForm.exercise = res.data.exercise ?? ''
        lifestyleForm.alcohol = res.data.alcohol ?? ''
      }
    } else {
      loadError.value = res.error || 'خطا در دریافت اطلاعات بیمار'
    }
  } catch (err: any) {
    loadError.value = err.data?.error || 'خطا در ارتباط با سرور'
  } finally {
    loading.value = false
  }
}

const fetchReproductive = async () => {
  if (!patientId.value) return
  reproLoading.value = true
  try {
    const res = await apiFetch<any>(`/api/reproductive/${patientId.value}`, {
      baseURL: useRuntimeConfig().public.apiBase
    })
    if (res.success && res.data) {
      const d = res.data
      if (d.menstrual_history) {
        Object.assign(reproForm.menstrual, {
          menarche_age: d.menstrual_history.menarche_age ?? null,
          cycle_length: d.menstrual_history.cycle_length ?? null,
          cycle_length_max: d.menstrual_history.cycle_length_max ?? null,
          flow_duration: d.menstrual_history.flow_duration ?? null,
          flow_volume: d.menstrual_history.flow_volume ?? '',
          lmp: d.menstrual_history.lmp ?? null,
          dysmenorrhea_vas: d.menstrual_history.dysmenorrhea_vas ?? null,
          pms: d.menstrual_history.pms ?? '',
          pmdd: d.menstrual_history.pmdd ?? ''
        })
      }
      if (d.sexual_history) {
        Object.assign(reproForm.sexual, {
          sexually_active: d.sexual_history.sexually_active ?? '',
          current_contraceptive_method: d.sexual_history.current_contraceptive_method ?? '',
          past_methods: d.sexual_history.past_methods ?? [],
          partner_count: d.sexual_history.partner_count ?? null,
          dyspareunia: d.sexual_history.dyspareunia ?? '',
          notes: d.sexual_history.notes ?? ''
        })
      }
      reproForm.surgeries = d.gynecologic_surgeries ?? []
      reproForm.contraceptives = d.contraceptive_history ?? []
      reproForm.family_history = d.family_history ?? []
      if (d.reproductive_summary) {
        Object.assign(reproForm.summary, {
          gravida: d.reproductive_summary.gravida ?? null,
          para: d.reproductive_summary.para ?? null,
          abortus: d.reproductive_summary.abortus ?? null,
          ectopics: d.reproductive_summary.ectopics ?? null,
          live_births: d.reproductive_summary.live_births ?? null,
          preterm_births: d.reproductive_summary.preterm_births ?? null,
          stillbirths: d.reproductive_summary.stillbirths ?? null,
          c_sections: d.reproductive_summary.c_sections ?? null,
          vaginal_deliveries: d.reproductive_summary.vaginal_deliveries ?? null
        })
      }
    }
  } catch {
    $toast.error('خطا در دریافت سابقه باروری')
  } finally {
    reproLoading.value = false
  }
}

const saveMenstrualHistory = async () => {
  menstrualSaving.value = true
  try {
    const res = await apiFetch<any>(`/api/reproductive/${patientId.value}/menstrual-history`, {
      method: 'PUT',
      body: reproForm.menstrual,
      baseURL: useRuntimeConfig().public.apiBase
    })
    if (res.success) {
      $toast.success('تاریخچه قاعدگی با موفقیت ذخیره شد')
    }
  } catch {
    $toast.error('خطا در ذخیره تاریخچه قاعدگی')
  } finally {
    menstrualSaving.value = false
  }
}

const saveSexualHistory = async () => {
  sexualSaving.value = true
  try {
    const res = await apiFetch<any>(`/api/reproductive/${patientId.value}/sexual-history`, {
      method: 'PUT',
      body: reproForm.sexual,
      baseURL: useRuntimeConfig().public.apiBase
    })
    if (res.success) {
      $toast.success('سابقه جنسی با موفقیت ذخیره شد')
    }
  } catch {
    $toast.error('خطا در ذخیره سابقه جنسی')
  } finally {
    sexualSaving.value = false
  }
}

const saveSurgeries = async () => {
  surgeriesSaving.value = true
  try {
    const res = await apiFetch<any>(`/api/reproductive/${patientId.value}/surgeries`, {
      method: 'PUT',
      body: { surgeries: reproForm.surgeries },
      baseURL: useRuntimeConfig().public.apiBase
    })
    if (res.success) {
      $toast.success('جراحی‌ها با موفقیت ذخیره شدند')
    }
  } catch {
    $toast.error('خطا در ذخیره جراحی‌ها')
  } finally {
    surgeriesSaving.value = false
  }
}

const saveContraceptives = async () => {
  contraceptivesSaving.value = true
  try {
    const res = await apiFetch<any>(`/api/reproductive/${patientId.value}/contraceptives`, {
      method: 'PUT',
      body: { contraceptives: reproForm.contraceptives },
      baseURL: useRuntimeConfig().public.apiBase
    })
    if (res.success) {
      $toast.success('سابقه پیشگیری با موفقیت ذخیره شد')
    }
  } catch {
    $toast.error('خطا در ذخیره سابقه پیشگیری')
  } finally {
    contraceptivesSaving.value = false
  }
}

const saveFamilyHistory = async () => {
  familySaving.value = true
  try {
    const res = await apiFetch<any>(`/api/reproductive/${patientId.value}/family-history`, {
      method: 'PUT',
      body: { family_history: reproForm.family_history },
      baseURL: useRuntimeConfig().public.apiBase
    })
    if (res.success) {
      $toast.success('سابقه خانوادگی با موفقیت ذخیره شد')
    }
  } catch {
    $toast.error('خطا در ذخیره سابقه خانوادگی')
  } finally {
    familySaving.value = false
  }
}

const saveReproductiveSummary = async () => {
  summarySaving.value = true
  try {
    const res = await apiFetch<any>(`/api/reproductive/${patientId.value}/reproductive-summary`, {
      method: 'PUT',
      body: reproForm.summary,
      baseURL: useRuntimeConfig().public.apiBase
    })
    if (res.success) {
      $toast.success('خلاصه باروری با موفقیت ذخیره شد')
    }
  } catch {
    $toast.error('خطا در ذخیره خلاصه باروری')
  } finally {
    summarySaving.value = false
  }
}

const saveLifestyle = async () => {
  lifestyleSaving.value = true
  try {
    const res = await apiFetch<any>(`/api/patients/${patientId.value}`, {
      method: 'PUT',
      body: {
        smoking: lifestyleForm.smoking,
        bmi: lifestyleForm.bmi,
        exercise: lifestyleForm.exercise,
        alcohol: lifestyleForm.alcohol
      },
      baseURL: useRuntimeConfig().public.apiBase
    })
    if (res.success) {
      $toast.success('سبک زندگی با موفقیت ذخیره شد')
    }
  } catch {
    $toast.error('خطا در ذخیره سبک زندگی')
  } finally {
    lifestyleSaving.value = false
  }
}

const fetchScreening = async () => {
  if (!patientId.value) return
  screeningLoading.value = true
  try {
    const [schedulesRes, resultsRes, overdueRes] = await Promise.all([
      apiFetch<any>(`/api/screening/schedules?patientId=${patientId.value}`, {
        baseURL: useRuntimeConfig().public.apiBase
      }),
      apiFetch<any>(`/api/screening/results?patientId=${patientId.value}`, {
        baseURL: useRuntimeConfig().public.apiBase
      }),
      apiFetch<any>(`/api/screening/schedules/overdue?patientId=${patientId.value}`, {
        baseURL: useRuntimeConfig().public.apiBase
      })
    ])
    if (schedulesRes.success) screeningSchedules.value = schedulesRes.data ?? []
    if (resultsRes.success) screeningResults.value = resultsRes.data ?? []
    if (overdueRes.success) overdueSchedules.value = overdueRes.data ?? []
  } catch {
    $toast.error('خطا در دریافت اطلاعات غربالگری')
  } finally {
    screeningLoading.value = false
  }
}

const createScreening = async () => {
  screeningCreating.value = true
  try {
    const res = await apiFetch<any>('/api/screening/schedules', {
      method: 'POST',
      body: {
        patientId: patientId.value,
        test_name: screeningForm.test_name,
        scheduled_date: screeningForm.scheduled_date,
        notes: screeningForm.notes
      },
      baseURL: useRuntimeConfig().public.apiBase
    })
    if (res.success) {
      $toast.success('غربالگری با موفقیت ثبت شد')
      screeningDialog.value = false
      screeningForm.test_name = ''
      screeningForm.scheduled_date = null
      screeningForm.notes = ''
      fetchScreening()
    }
  } catch {
    $toast.error('خطا در ثبت غربالگری')
  } finally {
    screeningCreating.value = false
  }
}

const fetchLabResults = async () => {
  if (!patientId.value) return
  labLoading.value = true
  try {
    const res = await apiFetch<any>(`/api/lab-results/patient/${patientId.value}`, {
      baseURL: useRuntimeConfig().public.apiBase
    })
    if (res.success) labResults.value = res.data ?? []
  } catch {
    $toast.error('خطا در دریافت نتایج آزمایشات')
  } finally {
    labLoading.value = false
  }
}

const createLabResult = async () => {
  labCreating.value = true
  try {
    const res = await apiFetch<any>('/api/lab-results', {
      method: 'POST',
      body: {
        patientId: patientId.value,
        test_name: labForm.test_name,
        result: labForm.result,
        reference_range: labForm.reference_range,
        abnormal: labForm.abnormal,
        test_date: labForm.test_date,
        notes: labForm.notes
      },
      baseURL: useRuntimeConfig().public.apiBase
    })
    if (res.success) {
      $toast.success('نتیجه آزمایش با موفقیت ثبت شد')
      labDialog.value = false
      labForm.test_name = ''
      labForm.result = ''
      labForm.reference_range = ''
      labForm.abnormal = false
      labForm.test_date = null
      labForm.notes = ''
      fetchLabResults()
    }
  } catch {
    $toast.error('خطا در ثبت نتیجه آزمایش')
  } finally {
    labCreating.value = false
  }
}

const showLabTrend = async (lab: any) => {
  selectedLabTest.value = lab
  labTrendDialog.value = true
  labTrendLoading.value = true
  labTrendData.value = []
  try {
    const res = await apiFetch<any>(`/api/lab-results/patient/${patientId.value}/trend?testName=${encodeURIComponent(lab.test_name || lab.testName)}`, {
      baseURL: useRuntimeConfig().public.apiBase
    })
    if (res.success) labTrendData.value = res.data ?? []
  } catch {
    labTrendData.value = []
  } finally {
    labTrendLoading.value = false
  }
}

const fetchConsents = async () => {
  if (!patientId.value) return
  consentLoading.value = true
  try {
    const res = await apiFetch<any>(`/api/consent/patient/${patientId.value}`, {
      baseURL: useRuntimeConfig().public.apiBase
    })
    if (res.success) consentRecords.value = res.data ?? []
  } catch {
    $toast.error('خطا در دریافت رضایت‌نامه‌ها')
  } finally {
    consentLoading.value = false
  }
}

const createConsent = async () => {
  consentCreating.value = true
  try {
    const res = await apiFetch<any>(`/api/consent/patient/${patientId.value}`, {
      method: 'POST',
      body: {
        type: consentForm.type,
        description: consentForm.description
      },
      baseURL: useRuntimeConfig().public.apiBase
    })
    if (res.success) {
      $toast.success('رضایت‌نامه با موفقیت ثبت شد')
      consentDialog.value = false
      consentForm.type = ''
      consentForm.description = ''
      fetchConsents()
    }
  } catch {
    $toast.error('خطا در ثبت رضایت‌نامه')
  } finally {
    consentCreating.value = false
  }
}

const revokeConsent = async (c: any) => {
  revokingId.value = c.id
  try {
    const res = await apiFetch<any>(`/api/consent/${c.id}/revoke`, {
      method: 'PATCH',
      baseURL: useRuntimeConfig().public.apiBase
    })
    if (res.success) {
      $toast.success('رضایت‌نامه با موفقیت لغو شد')
      fetchConsents()
    }
  } catch {
    $toast.error('خطا در لغو رضایت‌نامه')
  } finally {
    revokingId.value = ''
  }
}

const refreshAll = () => {
  fetchPatient()
  fetchReproductive()
  fetchScreening()
  fetchLabResults()
  fetchConsents()
}

watch(activeTab, (tab) => {
  if (tab === 'reproductive' && reproLoading.value === false) fetchReproductive()
  if (tab === 'screening' && screeningLoading.value === false) fetchScreening()
  if (tab === 'lab' && labLoading.value === false) fetchLabResults()
  if (tab === 'consent' && consentLoading.value === false) fetchConsents()
})

onMounted(() => {
  fetchPatient()
  fetchReproductive()
  fetchScreening()
  fetchLabResults()
  fetchConsents()
})

useSeoMeta({ title: 'پرونده بیمار | سیستم کلینیک' })
</script>
