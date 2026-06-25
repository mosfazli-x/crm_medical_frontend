<template>
  <div class="mx-auto max-w-7xl px-4 py-10 md:px-8 min-h-screen !bg-slate-50/40" dir="rtl">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-200/60 mb-8">
      <div>
        <h1 class="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          <Icon name="lucide:flask-conical" class="text-indigo-600 w-6 h-6" />
          نتایج آزمایشگاه
        </h1>
        <p class="text-xs text-slate-500 mt-1 font-medium">مدیریت، بررسی و ردیابی داده‌های آزمایشگاهی و هورمونی بیماران</p>
      </div>
    </div>

    <v-card class="!mb-8 !rounded-xl !border !border-slate-200/70 !bg-white !shadow-sm" variant="flat">
      <v-card-text class="!p-5">
        <div class="flex flex-col md:flex-row gap-3.5">
          <v-text-field
            v-model="searchQuery"
            label="جستجوی بیمار (نام، نام خانوادگی، کد ملی)"
            variant="outlined"
            density="compact"
            hide-details
            class="flex-1 !rounded-lg"
            clearable
            color="#4f46e5"
            @update:model-value="onSearchInput"
          >
            <template #prepend-inner>
              <Icon name="lucide:search" class="text-slate-400 w-5 h-5 ml-2" />
            </template>
          </v-text-field>
          <v-btn
            variant="flat"
            class="!h-[40px] !bg-indigo-600 !text-white !font-bold !rounded-lg !px-6 !shadow-sm hover:!bg-indigo-700 transition-colors"
            :loading="searching"
            @click="searchPatients"
          >
            <span class="flex items-center gap-2 text-sm">
              <Icon name="lucide:user-search" class="w-4 h-4" />
              جستجو
            </span>
          </v-btn>
        </div>

        <div v-if="searchResults.length > 0" class="mt-6 border-t border-slate-100 pt-5">
          <p class="text-[11px] font-bold text-slate-400 tracking-wider mb-3.5 flex items-center gap-1.5">
            <Icon name="lucide:users" class="w-3.5 h-3.5" />
            {{ searchResults.length }} بیمار یافت شد
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div
              v-for="patient in searchResults"
              :key="patient.id"
              :class="[
                'p-4 rounded-xl border cursor-pointer transition-all duration-200',
                selectedPatient?.id === patient.id
                  ? '!bg-indigo-50/40 !border-indigo-500 !ring-1 !ring-indigo-500/30'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
              ]"
              @click="selectPatient(patient)"
            >
              <div class="flex items-center gap-3.5">
                <div class="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-black border border-indigo-100/70">
                  {{ patient.firstName?.charAt(0) }}{{ patient.lastName?.charAt(0) }}
                </div>
                <div>
                  <p class="font-bold text-slate-800 text-sm">{{ patient.firstName }} {{ patient.lastName }}</p>
                  <p class="text-[11px] text-slate-400 font-mono mt-0.5 tracking-wide">{{ patient.nationalId }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="searchQuery && !searching && searchResults.length === 0 && searchTouched" class="mt-4 text-center py-6 text-slate-400 text-xs flex flex-col items-center gap-2">
          <Icon name="lucide:user-x" class="w-5 h-5 text-slate-300" />
          هیچ بیماری با این مشخصات یافت نشد.
        </div>
      </v-card-text>
    </v-card>

    <template v-if="selectedPatient">
      <div class="mb-6 rounded-xl bg-slate-950 border border-slate-900 p-5 shadow-md text-white relative overflow-hidden group">
        <div class="absolute -right-10 -top-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-2xl transition-all group-hover:bg-indigo-600/20"></div>
        <div class="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-lg font-black text-indigo-300 shrink-0">
              {{ selectedPatient.firstName?.charAt(0) }}{{ selectedPatient.lastName?.charAt(0) }}
            </div>
            <div>
              <h2 class="text-base font-bold text-slate-100 tracking-tight">{{ selectedPatient.firstName }} {{ selectedPatient.lastName }}</h2>
              <div class="flex items-center gap-2 mt-1">
                <span class="text-[11px] text-slate-400 font-medium">کد ملی:</span>
                <span class="text-xs text-indigo-300 font-mono tracking-wider" dir="ltr">{{ selectedPatient.nationalId }}</span>
              </div>
            </div>
          </div>
          <v-btn
            variant="flat"
            class="!bg-white !text-slate-950 !font-bold !rounded-lg !px-4 hover:!bg-slate-100 transition-colors !shadow-sm text-xs"
            @click="openAddDialog"
          >
            <span class="flex items-center gap-1.5 text-xs">
              <Icon name="lucide:plus-circle" class="w-4 h-4 text-indigo-600" />
              افزودن نتیجه آزمایش
            </span>
          </v-btn>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5 mb-6">
        <div
          v-for="(label, key) in categoryLabels"
          :key="key"
          :class="[
            'rounded-xl p-3 border.5 transition-all duration-200 cursor-pointer text-center flex flex-col justify-center items-center',
              categoryFilter === key
                ? 'bg-white border-indigo-600 shadow-sm ring-1 ring-indigo-600/20'
                : 'bg-white border-slate-200/70 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50'
          ]"
          @click="categoryFilter = key"
        >
          <p :class="['text-xl font-black tracking-tight', categoryFilter === key ? 'text-indigo-600' : 'text-slate-800']">
            {{ categoryCounts[key] || 0 }}
          </p>
          <p class="text-[11px] font-medium text-slate-400 mt-0.5">{{ label }}</p>
        </div>
      </div>

      <v-card class="!rounded-xl !border !border-slate-200/70 !bg-white !shadow-sm overflow-hidden" variant="flat">
        <div class="px-5 py-3.5 bg-slate-50/60 border-b border-slate-100 flex items-center justify-between">
          <span class="text-[11px] font-bold text-slate-400 tracking-wide flex items-center gap-1.5">
            <Icon name="lucide:list-filter" class="w-3.5 h-3.5" />
            {{ filteredResults.length }} نتیجه ثبت شده
          </span>
          <div class="flex items-center gap-3">
            <v-btn
              v-if="categoryFilter !== 'all'"
              variant="text"
              class="!text-slate-400 hover:!text-slate-600 !text-xs !font-medium !p-0 !min-w-0"
              @click="categoryFilter = 'all'"
            >
              پاک کردن فیلتر
            </v-btn>
            <div class="w-px h-3 bg-slate-200" v-if="categoryFilter !== 'all'"></div>
            <v-btn
              variant="text"
              class="!text-rose-600 hover:!text-rose-700 !text-xs !font-bold !p-0 !min-w-0"
              @click="selectedPatient = null; results = []; searchQuery = ''; searchResults = []"
            >
              تغییر بیمار
            </v-btn>
          </div>
        </div>

        <div v-if="loadingResults" class="p-12 text-center">
          <v-progress-circular indeterminate color="#4f46e5" size="36" width="3" />
        </div>

        <div v-else-if="filteredResults.length === 0" class="py-16 text-center">
          <div class="flex flex-col items-center max-w-sm mx-auto">
            <div class="bg-slate-50 border border-slate-100 p-3.5 rounded-xl mb-3">
              <Icon name="lucide:flask-round" class="w-8 h-8 text-slate-300" />
            </div>
            <p class="text-slate-500 font-bold text-sm">نتیجه آزمایشگاهی یافت نشد</p>
            <p class="text-xs text-slate-400 mt-1">هیچ سابقه یا فیلتری برای این دسته‌بندی بیمار ثبت نشده است.</p>
          </div>
        </div>

        <div v-else class="overflow-x-auto">
          <table class="w-full text-right border-collapse">
            <thead>
              <tr class="border-b border-slate-100 bg-slate-50/30">
                <th class="px-5 py-3 text-[11px] font-bold text-slate-400 tracking-wider whitespace-nowrap">تاریخ آزمایش</th>
                <th class="px-5 py-3 text-[11px] font-bold text-slate-400 tracking-wider whitespace-nowrap">دسته‌بندی</th>
                <th class="px-5 py-3 text-[11px] font-bold text-slate-400 tracking-wider whitespace-nowrap">نام آزمایش</th>
                <th class="px-5 py-3 text-[11px] font-bold text-slate-400 tracking-wider whitespace-nowrap">مقدار</th>
                <th class="px-5 py-3 text-[11px] font-bold text-slate-400 tracking-wider whitespace-nowrap">واحد</th>
                <th class="px-5 py-3 text-[11px] font-bold text-slate-400 tracking-wider whitespace-nowrap">محدوده مرجع</th>
                <th class="px-5 py-3 text-[11px] font-bold text-slate-400 tracking-wider whitespace-nowrap">وضعیت</th>
                <th class="px-5 py-3 text-[11px] font-bold text-slate-400 tracking-wider whitespace-nowrap text-center">عملیات</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr
                v-for="result in filteredResults"
                :key="result.id"
                class="hover:bg-slate-50/50 transition-colors duration-150 group"
              >
                <td class="px-5 py-3.5 text-xs text-slate-600 font-medium whitespace-nowrap">{{ formatJalaliDate(result.test_date) }}</td>
                <td class="px-5 py-3.5 whitespace-nowrap">
                  <span :class="['px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide border', categoryBadge(result.category)]">
                    {{ categoryLabels[result.category] || result.category }}
                  </span>
                </td>
                <td
                  class="px-5 py-3.5 text-xs font-semibold text-slate-900 cursor-pointer hover:text-indigo-600 transition-colors whitespace-nowrap"
                  @click="showTrend(result)"
                >
                  {{ result.test_name }}
                </td>
                <td class="px-5 py-3.5 text-xs text-slate-900 font-mono font-bold whitespace-nowrap">{{ result.value }}</td>
                <td class="px-5 py-3.5 text-xs text-slate-400 font-mono whitespace-nowrap">{{ result.unit || '---' }}</td>
                <td class="px-5 py-3.5 text-xs text-slate-400 font-mono whitespace-nowrap">{{ result.reference_range || '---' }}</td>
                <td class="px-5 py-3.5 whitespace-nowrap">
                  <span
                    v-if="result.abnormal_flag"
                    class="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-100 rounded-md text-[10px] font-bold flex items-center gap-1 w-max"
                  >
                    <span class="w-1 h-1 rounded-full bg-rose-500"></span>
                    غیرطبیعی
                  </span>
                  <span
                    v-else
                    class="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md text-[10px] font-bold flex items-center gap-1 w-max"
                  >
                    <span class="w-1 h-1 rounded-full bg-emerald-500"></span>
                    طبیعی
                  </span>
                </td>
                <td class="px-5 py-3.5 text-center whitespace-nowrap">
                  <div class="flex items-center justify-center gap-1">
                    <v-tooltip text="نمایش روند" location="top">
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          icon
                          variant="text"
                          class="!text-indigo-500 hover:!bg-indigo-50 !w-8 !h-8 !rounded-lg"
                          @click="showTrend(result)"
                        >
                          <Icon name="lucide:trending-up" class="w-4 h-4" />
                        </v-btn>
                      </template>
                    </v-tooltip>
                    <v-tooltip text="حذف" location="top">
                      <template #activator="{ props }">
                        <v-btn
                          v-bind="props"
                          icon
                          variant="text"
                          class="!text-slate-400 hover:!text-rose-600 hover:!bg-rose-50 !w-8 !h-8 !rounded-lg"
                          @click="confirmDelete(result)"
                        >
                          <Icon name="lucide:trash-2" class="w-4 h-4" />
                        </v-btn>
                      </template>
                    </v-tooltip>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </v-card>
    </template>

    <div v-if="!selectedPatient" class="text-center py-20">
      <div class="bg-white border border-slate-200/60 p-5 rounded-2xl inline-flex shadow-sm mb-5">
        <Icon name="lucide:shield-alert" class="w-10 h-10 text-slate-300" />
      </div>
      <h3 class="text-base font-bold text-slate-700">بیماری انتخاب نشده است</h3>
      <p class="text-xs text-slate-400 mt-1.5 max-w-xs mx-auto leading-relaxed">برای ثبت و مشاهده نوین نتایج و تاریخچه آزمایشگاه، ابتدا نام یا کد ملی بیمار را جستجو کنید.</p>
    </div>

    <v-dialog v-model="addDialog" max-width="600" persistent class="backdrop-blur-sm">
      <v-card class="!rounded-xl !border !border-slate-200/80 !shadow-xl !p-0">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
            <Icon name="lucide:file-plus" class="text-indigo-600 w-4 h-4" />
            افزودن نتیجه آزمایش جدید
          </h3>
          <v-btn icon variant="text" class="!text-slate-400 hover:!bg-slate-50 !w-7 !h-7 !rounded-lg" @click="addDialog = false">
            <Icon name="lucide:x" class="w-4 h-4" />
          </v-btn>
        </div>
        
        <v-card-text class="!p-6">
          <v-form ref="formRef" @submit.prevent="submitResult">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="md:col-span-2">
                <label class="text-xs font-bold text-slate-700 mb-1.5 block">نام آزمایش *</label>
                <v-combobox
                  v-model="form.test_name"
                  variant="outlined"
                  density="compact"
                  :items="commonTestNames"
                  :rules="[v => !!v || 'نام آزمایش الزامی است']"
                  hide-details="auto"
                  class="!rounded-lg"
                  color="#4f46e5"
                />
              </div>

              <div>
                <label class="text-xs font-bold text-slate-700 mb-1.5 block">دسته‌بندی *</label>
                <v-select
                  v-model="form.category"
                  :items="categoryOptions"
                  item-title="label"
                  item-value="value"
                  variant="outlined"
                  density="compact"
                  :rules="[v => !!v || 'دسته‌بندی الزامی است']"
                  hide-details="auto"
                  class="!rounded-lg"
                  color="#4f46e5"
                />
              </div>

              <div>
                <label class="text-xs font-bold text-slate-700 mb-1.5 block">مقدار آزمایش *</label>
                <v-text-field
                  v-model="form.value"
                  variant="outlined"
                  density="compact"
                  type="number"
                  step="any"
                  :rules="[v => !!v || 'مقدار الزامی است']"
                  hide-details="auto"
                  class="!rounded-lg"
                  color="#4f46e5"
                />
              </div>

              <div>
                <label class="text-xs font-bold text-slate-700 mb-1.5 block">واحد اندازه‌گیری</label>
                <v-text-field
                  v-model="form.unit"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  class="!rounded-lg"
                  color="#4f46e5"
                />
              </div>

              <div>
                <label class="text-xs font-bold text-slate-700 mb-1.5 block">محدوده مرجع استاندارد</label>
                <v-text-field
                  v-model="form.reference_range"
                  variant="outlined"
                  density="compact"
                  hide-details="auto"
                  placeholder="مثلاً 1.5 - 5.0"
                  class="!rounded-lg font-mono"
                  color="#4f46e5"
                />
              </div>

              <div class="md:col-span-2 !bg-slate-50/60 p-3 rounded-lg border border-slate-200/60 flex items-center justify-between">
                <div>
                  <label class="text-xs font-bold text-slate-800 block">وضعیت بحرانی یا غیرطبیعی</label>
                  <span class="text-[10px] text-slate-400 block mt-0.5">آیا نتیجه خارج از بازه نرمال آزمایشگاهی است؟</span>
                </div>
                <v-switch
                  v-model="form.abnormal_flag"
                  color="rose"
                  inset
                  hide-details
                  class="!pt-0"
                />
              </div>

              <div class="md:col-span-2">
                <label class="text-xs font-bold text-slate-700 mb-1.5 block">تاریخ انجام آزمایش *</label>
                <PersianDatetimePicker
                  v-model="form.test_date"
                  format="YYYY-MM-DD"
                  placeholder="تاریخ آزمایش را انتخاب کنید"
                  class="custom-picker-input"
                />
                <p v-if="formDateError" class="text-rose-500 text-[11px] font-medium mt-1">{{ formDateError }}</p>
              </div>

              <div class="md:col-span-2">
                <label class="text-xs font-bold text-slate-700 mb-1.5 block">توضیحات و یادداشت پزشک</label>
                <v-textarea
                  v-model="form.notes"
                  variant="outlined"
                  density="compact"
                  rows="3"
                  hide-details
                  class="!rounded-lg"
                  color="#4f46e5"
                />
              </div>
            </div>
          </v-form>
        </v-card-text>

        <div class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2.5">
          <v-btn variant="flat" class="!bg-slate-200 !text-slate-700 !font-bold !text-xs !rounded-lg" @click="addDialog = false">انصراف</v-btn>
          <v-btn variant="flat" class="!bg-indigo-600 !text-white !font-bold !text-xs !rounded-lg !px-5" :loading="submitting" @click="submitResult">ذخیره نتیجه</v-btn>
        </div>
      </v-card>
    </v-dialog>

    <v-dialog v-model="trendDialog" max-width="800" class="backdrop-blur-sm">
      <v-card class="!rounded-xl !border !border-slate-200/80 !shadow-xl" v-if="trendData.length > 0 || trendLoading">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 class="text-base font-bold text-slate-900 flex items-center gap-2">
              <Icon name="lucide:line-chart" class="text-indigo-600 w-4 h-4" />
              روند بیومارکر: {{ trendTestName }}
            </h3>
            <p class="text-[11px] text-slate-400 mt-0.5" v-if="trendUnit">واحد مقیاس سنجش: {{ trendUnit }}</p>
          </div>
          <v-btn icon variant="text" class="!text-slate-400 hover:!bg-slate-50 !w-7 !h-7 !rounded-lg" @click="trendDialog = false">
            <Icon name="lucide:x" class="w-4 h-4" />
          </v-btn>
        </div>
        
        <v-card-text class="!p-6">
          <div v-if="trendLoading" class="flex justify-center py-12">
            <v-progress-circular indeterminate color="#4f46e5" size="36" width="3" />
          </div>
          <template v-else>
            <div class="bg-white rounded-xl border border-slate-200/70 p-4 mb-6 overflow-x-auto shadow-inner bg-gradient-to-b from-slate-50/40 to-white">
              <svg
                :viewBox="`0 0 ${svgWidth} ${svgHeight}`"
                class="w-full max-h-72"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect x="0" y="0" :width="svgWidth" :height="svgHeight" fill="none" />

                <line
                  v-for="(g, gi) in yGridLines"
                  :key="'yg'+gi"
                  :x1="margin.left"
                  :y1="g.y"
                  :x2="svgWidth - margin.right"
                  :y2="g.y"
                  stroke="#f1f5f9"
                  stroke-width="1"
                />
                
                <text
                  v-for="(g, gi) in yGridLines"
                  :key="'yl'+gi"
                  :x="margin.left - 10"
                  :y="g.y + 4"
                  text-anchor="end"
                  class="fill-slate-400 font-mono"
                  font-size="9"
                >
                  {{ g.label }}
                </text>

                <rect
                  v-if="refLow !== null && refHigh !== null"
                  :x="margin.left"
                  :y="scaleY(refHigh)"
                  :width="plotWidth"
                  :height="scaleY(refLow) - scaleY(refHigh)"
                  fill="#e0f2fe"
                  fill-opacity="0.25"
                  rx="2"
                />
                
                <line
                  v-if="refLow !== null"
                  :x1="margin.left"
                  :y1="scaleY(refLow)"
                  :x2="svgWidth - margin.right"
                  :y2="scaleY(refLow)"
                  stroke="#bae6fd"
                  stroke-width="1.2"
                  stroke-dasharray="3,3"
                />
                <line
                  v-if="refHigh !== null"
                  :x1="margin.left"
                  :y1="scaleY(refHigh)"
                  :x2="svgWidth - margin.right"
                  :y2="scaleY(refHigh)"
                  stroke="#bae6fd"
                  stroke-width="1.2"
                  stroke-dasharray="3,3"
                />

                <polyline
                  :points="linePoints"
                  fill="none"
                  stroke="#4f46e5"
                  stroke-width="2"
                  stroke-linejoin="round"
                  stroke-linecap="round"
                />

                <circle
                  v-for="(pt, pi) in trendDataSorted"
                  :key="'pt'+pi"
                  :cx="scaleX(pt.index)"
                  :cy="scaleY(Number(pt.value))"
                  r="4"
                  :fill="pt.abnormal_flag ? '#f43f5e' : '#4f46e5'"
                  stroke="white"
                  stroke-width="2"
                />

                <text
                  v-for="(pt, pi) in trendDataSorted"
                  :key="'xl'+pi"
                  :x="scaleX(pt.index)"
                  :y="svgHeight - margin.bottom + 18"
                  text-anchor="end"
                  transform="rotate(-30, ${scaleX(pt.index)}, ${svgHeight - margin.bottom + 18})"
                  class="fill-slate-400 font-medium"
                  font-size="9"
                >
                  {{ formatShortDate(pt.test_date) }}
                </text>
              </svg>
            </div>

            <div class="overflow-x-auto border border-slate-100 rounded-xl">
              <table class="w-full text-right text-xs">
                <thead>
                  <tr class="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold">
                    <th class="px-4 py-2.5">تاریخ ثبت</th>
                    <th class="px-4 py-2.5">مقدار گزارش شده</th>
                    <th class="px-4 py-2.5">محدوده مرجع</th>
                    <th class="px-4 py-2.5">وضعیت پایدار</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 text-slate-600">
                  <tr v-for="pt in trendDataSorted" :key="pt.id" class="hover:bg-slate-50/50">
                    <td class="px-4 py-2.5 font-medium">{{ formatJalaliDate(pt.test_date) }}</td>
                    <td class="px-4 py-2.5 font-mono font-bold text-slate-900">{{ pt.value }}</td>
                    <td class="px-4 py-2.5 font-mono text-slate-400">{{ pt.reference_range || '---' }}</td>
                    <td class="px-4 py-2.5">
                      <span v-if="pt.abnormal_flag" class="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-[10px] font-bold">غیرطبیعی</span>
                      <span v-else class="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold">طبیعی</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </v-card-text>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="400" class="backdrop-blur-sm">
      <v-card class="!rounded-xl !border !border-slate-200/80 !shadow-xl !p-6">
        <div class="text-center">
          <div class="bg-rose-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3.5 border border-rose-100">
            <Icon name="lucide:alert-triangle" class="w-5 h-5 text-rose-600" />
          </div>
          <h3 class="text-sm font-bold text-slate-900 mb-1.5">حذف سابقه آزمایشگاهی</h3>
          <p class="text-slate-400 text-xs leading-relaxed">آیا از حذف این نتیجه آزمایش اطمینان دارید؟ داده‌های پاک شده به هیچ عنوان قابل بازیابی نخواهند بود.</p>
        </div>
        <div class="flex justify-center gap-2 mt-5">
          <v-btn variant="flat" class="!bg-slate-100 !text-slate-600 !font-bold !text-xs !rounded-lg" @click="deleteDialog = false">انصراف</v-btn>
          <v-btn variant="flat" class="!bg-rose-600 !text-white !font-bold !text-xs !rounded-lg !px-4" :loading="deleting" @click="deleteResult">تایید و حذف قطعی</v-btn>
        </div>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

const searchQuery = ref('')
const searchResults = ref<any[]>([])
const selectedPatient = ref<any>(null)
const searching = ref(false)
const searchTouched = ref(false)

const results = ref<any[]>([])
const loadingResults = ref(false)
const categoryFilter = ref('all')

const addDialog = ref(false)
const submitting = ref(false)
const formRef = ref<any>(null)
const formDateError = ref('')

const trendDialog = ref(false)
const trendData = ref<any[]>([])
const trendLoading = ref(false)
const trendTestName = ref('')
const trendUnit = ref('')

const deleteDialog = ref(false)
const deleting = ref(false)
const deleteTarget = ref<any>(null)

const categoryLabels: Record<string, string> = {
  all: 'همه نتایج',
  hormone: 'هورمون‌ها',
  tumor_marker: 'مارکرهای توموری',
  cytology: 'سیتولوژی',
  pathology: 'پاتولوژی',
  microbiology: 'میکروبیولوژی',
  genetic: 'ژنتیک',
  other: 'سایر',
}

const categoryOptions = Object.entries(categoryLabels)
  .filter(([key]) => key !== 'all')
  .map(([value, label]) => ({ value, label }))

const commonTestNames = [
  'FSH', 'LH', 'Estradiol (E2)', 'Progesterone', 'Prolactin', 'AMH', 'TSH',
  'Testosterone', 'DHEA-S', 'SHBG', 'CA-125', 'HE4', 'ROMA', 'AFP', 'CEA',
  'CA 15-3', 'CA 19-9',
]

const form = ref({
  category: 'hormone',
  test_name: '',
  value: '',
  unit: '',
  reference_range: '',
  abnormal_flag: false,
  notes: '',
  test_date: '',
})

watch(addDialog, (val) => {
  if (!val) {
    form.value = { category: 'hormone', test_name: '', value: '', unit: '', reference_range: '', abnormal_flag: false, notes: '', test_date: '' }
    formDateError.value = ''
  }
})

function categoryBadge(cat: string) {
  const map: Record<string, string> = {
    hormone: 'bg-pink-50/60 text-pink-700 border-pink-100',
    tumor_marker: 'bg-purple-50/60 text-purple-700 border-purple-100',
    cytology: 'bg-cyan-50/60 text-cyan-700 border-cyan-100',
    pathology: 'bg-amber-50/60 text-amber-700 border-amber-100',
    microbiology: 'bg-emerald-50/60 text-emerald-700 border-emerald-100',
    genetic: 'bg-indigo-50/60 text-indigo-700 border-indigo-100',
    other: 'bg-slate-50/80 text-slate-600 border-slate-200',
  }
  return map[cat] || map.other
}

const categoryCounts = computed(() => {
  const counts: Record<string, number> = { all: results.value.length }
  for (const r of results.value) {
    counts[r.category] = (counts[r.category] || 0) + 1
  }
  return counts
})

const filteredResults = computed(() => {
  if (categoryFilter.value === 'all') return results.value
  return results.value.filter(r => r.category === categoryFilter.value)
})

function formatJalaliDate(date: string | null) {
  if (!date) return '---'
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date))
}

function formatShortDate(date: string) {
  if (!date) return ''
  return new Intl.DateTimeFormat('fa-IR', { month: 'short', day: 'numeric' }).format(new Date(date))
}

let searchTimer: ReturnType<typeof setTimeout> | null = null

function onSearchInput() {
  searchTouched.value = true
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => searchPatients(), 500)
}

async function searchPatients() {
  const q = searchQuery.value.trim()
  if (!q) {
    searchResults.value = []
    return
  }
  searching.value = true
  try {
    const res = await apiFetch<any>(`/api/patients?search=${encodeURIComponent(q)}`)
    if (res.success) {
      searchResults.value = res.data || []
    } else {
      searchResults.value = []
    }
  } catch {
    searchResults.value = []
    $toast.error('خطا در جستجوی بیماران')
  } finally {
    searching.value = false
  }
}

async function selectPatient(patient: any) {
  selectedPatient.value = patient
  searchQuery.value = `${patient.firstName} ${patient.lastName}`
  categoryFilter.value = 'all'
  await fetchResults()
}

async function fetchResults() {
  if (!selectedPatient.value) return
  loadingResults.value = true
  try {
    const res = await apiFetch<any>(`/api/lab-results/patient/${selectedPatient.value.id}`)
    if (res.success) {
      results.value = res.data || []
    } else {
      results.value = []
      $toast.error('خطا در دریافت نتایج آزمایشگاه')
    }
  } catch {
    results.value = []
    $toast.error('خطا در ارتباط با سرور')
  } finally {
    loadingResults.value = false
  }
}

function openAddDialog() {
  form.value = { category: 'hormone', test_name: '', value: '', unit: '', reference_range: '', abnormal_flag: false, notes: '', test_date: '' }
  formDateError.value = ''
  addDialog.value = true
}

async function submitResult() {
  if (!form.value.test_date) {
    formDateError.value = 'تاریخ آزمایش الزامی است'
    return
  }
  formDateError.value = ''

  const valid = await formRef.value?.validate()
  if (!valid?.valid) return

  submitting.value = true
  try {
    const body = {
      patient_id: selectedPatient.value.id,
      category: form.value.category,
      test_name: form.value.test_name,
      value: parseFloat(form.value.value),
      unit: form.value.unit,
      reference_range: form.value.reference_range,
      abnormal_flag: form.value.abnormal_flag,
      notes: form.value.notes,
      test_date: form.value.test_date,
    }
    const res = await apiFetch<any>('/api/lab-results', {
      method: 'POST',
      body,
    })
    if (res.success) {
      $toast.success('نتیجه آزمایش با موفقیت ثبت شد')
      addDialog.value = false
      await fetchResults()
    } else {
      $toast.error(res.error || 'خطا در ثبت نتیجه')
    }
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در ثبت نتیجه آزمایش')
  } finally {
    submitting.value = false
  }
}

async function showTrend(result: any) {
  trendTestName.value = result.test_name
  trendUnit.value = result.unit || ''
  trendDialog.value = true
  trendLoading.value = true
  trendData.value = []
  try {
    const res = await apiFetch<any>(`/api/lab-results/patient/${selectedPatient.value.id}/trend?testName=${encodeURIComponent(result.test_name)}`)
    if (res.success) {
      trendData.value = (res.data || []).sort(
        (a: any, b: any) => new Date(a.test_date).getTime() - new Date(b.test_date).getTime()
      )
    } else {
      trendData.value = []
      $toast.error('خطا در دریافت داده‌های روند')
    }
  } catch {
    trendData.value = []
    $toast.error('خطا در دریافت روند آزمایش')
  } finally {
    trendLoading.value = false
  }
}

const trendDataSorted = computed(() => {
  return trendData.value.map((d: any, i: number) => ({ ...d, index: i }))
})

const margin = { top: 30, right: 20, bottom: 60, left: 55 }
const svgWidth = 750
const svgHeight = 320
const plotWidth = svgWidth - margin.left - margin.right
const plotHeight = svgHeight - margin.top - margin.bottom

function scaleX(index: number) {
  const count = trendDataSorted.value.length
  if (count <= 1) return margin.left + plotWidth / 2
  return margin.left + (index / (count - 1)) * plotWidth
}

function scaleY(value: number) {
  const vals = trendDataSorted.value.map(d => Number(d.value))
  const min = Math.min(...vals, 0)
  const max = Math.max(...vals)
  const padding = (max - min) * 0.15 || 1
  const yMin = min - padding
  const yMax = max + padding
  return margin.top + ((yMax - value) / (yMax - yMin)) * plotHeight
}

const refLow = computed(() => {
  if (trendDataSorted.value.length === 0) return null
  const range = trendDataSorted.value[0].reference_range
  if (!range) return null
  const parts = range.split('-').map((s: string) => parseFloat(s.trim()))
  if (parts.length === 2 && !isNaN(parts[0])) return parts[0]
  const match = range.match(/([\d.]+)\s*[-–]\s*([\d.]+)/)
  if (match) return parseFloat(match[1])
  return null
})

const refHigh = computed(() => {
  if (trendDataSorted.value.length === 0) return null
  const range = trendDataSorted.value[0].reference_range
  if (!range) return null
  const parts = range.split('-').map((s: string) => parseFloat(s.trim()))
  if (parts.length === 2 && !isNaN(parts[1])) return parts[1]
  const match = range.match(/([\d.]+)\s*[-–]\s*([\d.]+)/)
  if (match) return parseFloat(match[2])
  return null
})

const yGridLines = computed(() => {
  const vals = trendDataSorted.value.map(d => Number(d.value))
  if (vals.length === 0) return []
  const min = Math.min(...vals, 0)
  const max = Math.max(...vals)
  const padding = (max - min) * 0.15 || 1
  const yMin = min - padding
  const yMax = max + padding
  const steps = 5
  const lines = []
  for (let i = 0; i <= steps; i++) {
    const val = yMin + ((yMax - yMin) * i) / steps
    lines.push({
      y: margin.top + ((yMax - val) / (yMax - yMin)) * plotHeight,
      label: val.toFixed(1),
    })
  }
  return lines
})

const linePoints = computed(() => {
  return trendDataSorted.value
    .map((d: any) => `${scaleX(d.index)},${scaleY(Number(d.value))}`)
    .join(' ')
})

function confirmDelete(result: any) {
  deleteTarget.value = result
  deleteDialog.value = true
}

async function deleteResult() {
  if (!deleteTarget.value) return
  deleting.value = true
  try {
    const res = await apiFetch<any>(`/api/lab-results/${deleteTarget.value.id}`, { method: 'DELETE' })
    if (res.success) {
      $toast.success('نتیجه آزمایش با موفقیت حذف شد')
      deleteDialog.value = false
      deleteTarget.value = null
      await fetchResults()
    } else {
      $toast.error(res.error || 'خطا در حذف نتیجه')
    }
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در حذف نتیجه آزمایش')
  } finally {
    deleting.value = false
  }
}

useSeoMeta({ title: 'نتایج آزمایشگاه | سیستم کلینیک' })
</script>

<style scoped>
/* استایل کاستوم برای دیت‌پیکر برای همخوانی ۱۰۰٪ با هویت بصری مدرن تایلوند بدون استفاده از apply */
:deep(.custom-picker-input) {
  width: 100%;
  height: 40px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 13px;
  outline: none;
  transition: all 0.15s ease-in-out;
}
:deep(.custom-picker-input:focus) {
  border-color: #4f46e5;
  box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
}
</style>