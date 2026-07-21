<template>
  <UiPageContainer class="!max-w-7xl !mx-auto !px-4 sm:!px-6 lg:!px-8 !py-8" dir="rtl">

    <div class="!mb-8 flex flex-col md:flex-row md:!items-center justify-between !gap-6">
      <div>
        <h1 class="crm-page-title">نتایج آزمایشگاه</h1>
        <p class="crm-page-subtitle">مدیریت، بررسی عمیق و ردیابی نموداری بیومارکرهای
          آزمایشگاهی و هورمونی بیماران</p>
      </div>

      <div class="!relative !w-full md:!w-96 group">
        <div class="!absolute !inset-y-0 !right-0 !flex !items-center !pr-3.5 !pointer-events-none">
          <Icon name="lucide:search"
            class="!w-4 !h-4 !text-zinc-400 group-focus-within:!text-zinc-900 !transition-colors" />
        </div>
        <input v-model="searchQuery" type="text"
          class="!w-full !bg-white !border !border-zinc-200/80 !text-zinc-900 !text-xs !rounded-xl focus:!ring-4 focus:!ring-zinc-900/5 focus:!border-zinc-900 !block !pr-10 !pl-12 !py-3 !transition-all !outline-none placeholder:!text-zinc-400 !shadow-sm"
          placeholder="جستجوی پرونده بیمار (نام، کد ملی)..." @input="onSearchInput" />
        <div class="!absolute !inset-y-0 !left-3 !flex !items-center">
          <v-progress-circular v-if="searching" indeterminate size="14" width="2" color="#18181b" />
          <button v-else-if="searchQuery" @click="clearSearch"
            class="!p-1 !text-zinc-400 hover:!text-zinc-900 !transition-colors !rounded-lg hover:!bg-zinc-100">
            <Icon name="lucide:x" class="!w-3.5 !h-3.5" />
          </button>
        </div>
      </div>
    </div>

    <div v-if="searchResults.length > 0 && !selectedPatient"
      class="!mb-8 !bg-white !border !border-zinc-200/80 !rounded-2xl !p-2 !shadow-[0_8px_30px_rgb(0,0,0,0.04)] !animate-in !fade-in !slide-in-from-top-2 !duration-200">
      <div class="!px-3 !py-2 !border-b !border-zinc-100 !mb-1.5">
        <p class="!text-[10px] !font-bold !text-zinc-400 !tracking-wider !flex !items-center !gap-2">
          <Icon name="lucide:users" class="!w-3.5 !h-3.5" />
          نتیجه همپوشانی پرونده‌ها ({{ searchResults.length }} مورد)
        </p>
      </div>
      <div class="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-3 !gap-1">
        <div v-for="patient in searchResults" :key="patient.id"
          class="!flex !items-center !gap-3.5 !p-3 !rounded-xl !cursor-pointer !transition-all !duration-200 !bg-white hover:!bg-zinc-50/80 !border !border-transparent hover:!border-zinc-200/60"
          @click="selectPatient(patient)">
          <div
            class="!w-9 !h-9 !rounded-lg !bg-zinc-100 !text-zinc-700 !flex !items-center !justify-center !text-xs !font-bold !border !border-zinc-200/40">
            {{ patient.firstName?.charAt(0) }}{{ patient.lastName?.charAt(0) }}
          </div>
          <div>
            <p class="!font-semibold !text-zinc-900 !text-xs !tracking-tight">{{ patient.firstName }} {{
              patient.lastName }}</p>
            <p class="!text-[10px] !text-zinc-400 !font-mono !mt-0.5 !tracking-wide">{{ patient.nationalId }}</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="searchQuery && !searching && searchResults.length === 0 && searchTouched && !selectedPatient"
      class="!mb-8 !bg-white !border !border-zinc-200/80 !rounded-2xl !py-10 !flex !flex-col !items-center !justify-center !text-center !shadow-sm">
      <div
        class="!w-10 !h-10 !bg-zinc-50 !rounded-xl !flex !items-center !justify-center !mb-3 !border !border-zinc-100">
        <Icon name="lucide:user-x" class="!w-4 !h-4 !text-zinc-400" />
      </div>
      <p class="!text-xs !font-semibold !text-zinc-900">هیچ رکوردی یافت نشد</p>
      <p class="!text-[11px] !text-zinc-400 !mt-1">عبارت جستجو شده با هیچ پرونده فعالی مطابقت ندارد.</p>
    </div>

    <template v-if="selectedPatient">

      <div
        class="!mb-8 !flex !flex-col sm:!flex-row !items-start sm:!items-center justify-between !gap-4 !p-5 !bg-white !border !border-zinc-200/80 !rounded-2xl !shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
        <div class="!flex !items-center !gap-4">
          <div
            class="!w-11 !h-11 !rounded-xl !bg-zinc-900 !text-white !flex !items-center !justify-center !text-sm !font-bold">
            {{ selectedPatient.firstName?.charAt(0) }}{{ selectedPatient.lastName?.charAt(0) }}
          </div>
          <div>
            <div class="!flex !items-center !gap-2">
              <h2 class="!text-sm !font-bold !text-zinc-900 !tracking-tight">{{ selectedPatient.firstName }} {{
                selectedPatient.lastName }}</h2>
              <span class="!px-2 !py-0.5 !bg-zinc-100 !text-zinc-700 !rounded-md !text-[9px] !font-bold">پرونده
                فعال</span>
            </div>
            <div class="!flex !items-center !gap-1.5 !mt-1 !text-[11px] !text-zinc-400">
              <span>شناسه ملی:</span>
              <span class="!font-mono !tracking-wider !text-zinc-600" dir="ltr">{{ selectedPatient.nationalId }}</span>
            </div>
          </div>
        </div>
        <div class="!flex !items-center !gap-2 !w-full sm:!w-auto">
          <button
            class="!flex-1 sm:!flex-none !flex !items-center !justify-center !gap-1.5 !px-3.5 !py-2.5 !bg-white !border !border-zinc-200 hover:!border-zinc-300 !text-zinc-700 !text-xs !font-semibold !rounded-xl !transition-all !shadow-sm"
            @click="clearPatient">
            <Icon name="lucide:arrow-right-left" class="!w-3.5 !h-3.5 !text-zinc-400" />
            تغییر پرونده بیمار
          </button>
          <button
            class="!flex-1 sm:!flex-none !flex !items-center !justify-center !gap-1.5 !px-4 !py-2.5 !bg-zinc-900 hover:!bg-zinc-800 !text-white !text-xs !font-semibold !rounded-xl !transition-all !shadow-sm"
            @click="openAddDialog">
            <Icon name="lucide:plus" class="!w-3.5 !h-3.5" />
            ثبت آزمایش جدید
          </button>
        </div>
      </div>

      <div class="!flex !items-center !gap-1.5 !mb-5 !overflow-x-auto !pb-2.5 !scrollbar-none">
        <button v-for="(label, key) in categoryLabels" :key="key" @click="categoryFilter = key" :class="[
          '!whitespace-nowrap !px-4 !py-2 !rounded-xl !text-xs !font-semibold !transition-all !duration-200 !border',
          categoryFilter === key
            ? '!bg-zinc-900 !text-white !border-zinc-900 !shadow-sm'
            : '!bg-white !text-zinc-500 !border-zinc-200/60 hover:!text-zinc-900 hover:!border-zinc-300 hover:!bg-zinc-50/50'
        ]">
          {{ label }}
          <span :class="[
            '!mr-1.5 !px-1.5 !py-0.5 !rounded-md !text-[10px] !font-mono !font-bold',
            categoryFilter === key ? '!bg-zinc-800 !text-zinc-300' : '!bg-zinc-100 !text-zinc-500'
          ]">
            {{ categoryCounts[key] || 0 }}
          </span>
        </button>
      </div>

      <div
        class="!bg-white !border !border-zinc-200/80 !rounded-2xl !shadow-[0_1px_3px_rgba(0,0,0,0.02)] !overflow-hidden">

        <div v-if="loadingResults" class="!p-16 !text-center !flex !flex-col !items-center !justify-center">
          <v-progress-circular indeterminate color="#18181b" size="28" width="2" />
          <p class="!text-xs !text-zinc-400 !mt-4 !font-medium">در حال واکشی ترنزکشن‌های آزمایشگاهی...</p>
        </div>

        <div v-else-if="filteredResults.length === 0" class="!py-20 !text-center">
          <div class="!flex !flex-col !items-center !max-w-sm !mx-auto">
            <div
              class="!w-10 !h-10 !rounded-xl !bg-zinc-50 !border !border-zinc-100 !flex !items-center !justify-center !mb-3.5">
              <Icon name="lucide:microscope" class="!w-4 !h-4 !text-zinc-400" />
            </div>
            <p class="!text-zinc-900 !font-semibold !text-xs">هیچ رکوردی یافت نشد</p>
            <p class="!text-[11px] !text-zinc-400 !mt-1">در این دسته‌بندی دیتای ثبت شده‌ای وجود ندارد.</p>
          </div>
        </div>

        <div v-else class="!overflow-x-auto">
          <table class="!w-full !text-right !border-collapse">
            <thead>
              <tr class="!bg-zinc-50/60 !border-b !border-zinc-200/60">
                <th class="!px-6 !py-3.5 !text-[10px] !font-bold !text-zinc-400 !tracking-wider !whitespace-nowrap">
                  بیومارکر / تست</th>
                <th class="!px-6 !py-3.5 !text-[10px] !font-bold !text-zinc-400 !tracking-wider !whitespace-nowrap">
                  تاریخ ثبت</th>
                <th class="!px-6 !py-3.5 !text-[10px] !font-bold !text-zinc-400 !tracking-wider !whitespace-nowrap">
                  مقدار گزارش شده</th>
                <th class="!px-6 !py-3.5 !text-[10px] !font-bold !text-zinc-400 !tracking-wider !whitespace-nowrap">بازه
                  رفرنس استاندارد</th>
                <th class="!px-6 !py-3.5 !text-[10px] !font-bold !text-zinc-400 !tracking-wider !whitespace-nowrap">
                  وضعیت کلینیکال</th>
                <th
                  class="!px-6 !py-3.5 !text-[10px] !font-bold !text-zinc-400 !tracking-wider !whitespace-nowrap !text-left">
                  اقدامات</th>
              </tr>
            </thead>
            <tbody class="!divide-y !divide-zinc-100">
              <tr v-for="result in filteredResults" :key="result.id"
                class="hover:!bg-zinc-50/50 !transition-colors !duration-150 group">
                <td class="!px-6 !py-4 !whitespace-nowrap">
                  <div class="!flex !flex-col">
                    <span
                      class="!text-xs !font-semibold !text-zinc-900 hover:!text-blue-600 !cursor-pointer !transition-colors"
                      @click="showTrend(result)">
                      {{ result.test_name }}
                    </span>
                    <span class="!text-[10px] !text-zinc-400 !font-medium !mt-0.5">{{ categoryLabels[result.category] ||
                      result.category }}</span>
                  </div>
                </td>

                <td class="!px-6 !py-4 !text-xs !text-zinc-500 !font-medium !whitespace-nowrap">
                  {{ formatJalaliDate(result.performed_date) }}
                </td>

                <td class="!px-6 !py-4 !whitespace-nowrap">
                  <div class="!flex !items-baseline !gap-1">
                    <span class="!text-xs !text-zinc-900 !font-mono !font-bold">{{ result.value }}</span>
                    <span class="!text-[10px] !text-zinc-400 !font-mono">{{ result.unit || '' }}</span>
                  </div>
                </td>

                <td class="!px-6 !py-4 !text-xs !text-zinc-400 !font-mono !whitespace-nowrap">
                  {{ result.reference_range || '---' }}
                </td>

                <td class="!px-6 !py-4 !whitespace-nowrap">
                  <div class="!flex !items-center !gap-1.5">
                    <span
                      :class="['!w-1.5 !h-1.5 !rounded-full', result.abnormal_flag ? '!bg-red-500' : '!bg-emerald-500']"></span>
                    <span
                      :class="['!text-[11px] !font-semibold', result.abnormal_flag ? '!text-red-600' : '!text-zinc-600']">
                      {{ result.abnormal_flag ? 'خارج از محدوده مرجع' : 'نرمال و طبیعی' }}
                    </span>
                  </div>
                </td>

                <td class="!px-6 !py-4 !whitespace-nowrap !text-left">
                  <div
                    class="!flex !items-center !justify-end !gap-0.5 md:!opacity-0 group-hover:!opacity-100 !transition-opacity">
                    <button
                      class="!p-1.5 !text-zinc-400 hover:!text-zinc-900 hover:!bg-zinc-100 !rounded-lg !transition-colors"
                      title="آنالیز روند تغییرات" @click="showTrend(result)">
                      <Icon name="lucide:line-chart" class="!w-4 !h-4" />
                    </button>
                    <button
                      class="!p-1.5 !text-zinc-400 hover:!text-red-600 hover:!bg-red-50 !rounded-lg !transition-colors"
                      title="حذف رکورد" @click="confirmDelete(result)">
                      <Icon name="lucide:trash-2" class="!w-4 !h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <div v-if="!selectedPatient && searchResults.length === 0 && !searchQuery"
      class="!mt-16 !text-center !flex !flex-col !items-center">
      <div
        class="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-5 border border-slate-100 dark:border-slate-700">
        <Icon name="lucide:folder-heart" class="!w-6 !h-6 !text-zinc-300" />
      </div>
      <h3 class="text-lg font-bold text-slate-700 dark:text-slate-300">میز کار پایش اسناد آزمایشگاهی</h3>
      <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">برای بررسی بیومارکرها، مشاهده گراف‌های تحلیلی
        یا
        ثبت نتایج آزمایش جدید، پرونده بیمار مورد نظر را از کادر بالا فراخوانی کنید.</p>
    </div>

    <v-dialog v-model="addDialog" max-width="540" persistent class="backdrop-blur-sm">
      <div class="!bg-white !rounded-2xl !border !border-zinc-200/80 !shadow-2xl !overflow-hidden">
        <div class="!flex !items-center justify-between !px-6 !py-4 !border-b !border-zinc-100">
          <h3 class="!text-xs !font-bold !text-zinc-900">ثبت رسمی نتیجه آزمایش جدید</h3>
          <button class="!text-zinc-400 hover:!text-zinc-900 !transition-colors" @click="addDialog = false">
            <Icon name="lucide:x" class="!w-4 !h-4" />
          </button>
        </div>

        <div class="!p-6 !bg-zinc-50/20">
          <v-form ref="formRef" @submit.prevent="submitResult">
            <div class="!grid !grid-cols-1 md:!grid-cols-2 !gap-4">

              <div class="md:!col-span-2">
                <label class="!text-[10px] !font-bold !text-zinc-500 !mb-1.5 !block !uppercase !tracking-wider">عنوان
                  آزمایش
                  / بیومارکر</label>
                <v-combobox v-model="form.test_name" variant="outlined" density="compact" :items="commonTestNames"
                  :rules="[v => !!v || 'وارد کردن نام آزمایش الزامی است']" hide-details="auto" class="custom-v-input"
                  color="#18181b" base-color="#e4e4e7" />
              </div>

              <div>
                <label
                  class="!text-[10px] !font-bold !text-zinc-500 !mb-1.5 !block !uppercase !tracking-wider">دسته‌بندی
                  ارجاع</label>
                <v-select v-model="form.category" :items="categoryOptions" item-title="label" item-value="value"
                  variant="outlined" density="compact" :rules="[v => !!v || 'انتخاب دسته‌بندی الزامی است']"
                  hide-details="auto" class="custom-v-input" color="#18181b" base-color="#e4e4e7" />
              </div>

              <div>
                <label class="!text-[10px] !font-bold !text-zinc-500 !mb-1.5 !block !uppercase !tracking-wider">مقدار
                  کمی
                  (Value)</label>
                <v-text-field v-model="form.value" variant="outlined" density="compact" type="number" step="any"
                  :rules="[v => !!v || 'درج مقدار الزامی است']" hide-details="auto" class="custom-v-input !font-mono"
                  color="#18181b" base-color="#e4e4e7" />
              </div>

              <div>
                <label class="!text-[10px] !font-bold !text-zinc-500 !mb-1.5 !block !uppercase !tracking-wider">واحد
                  سنجش
                  (Unit)</label>
                <v-text-field v-model="form.unit" variant="outlined" density="compact" hide-details="auto"
                  placeholder="e.g. mIU/L" class="custom-v-input !font-mono" color="#18181b" base-color="#e4e4e7" />
              </div>

              <div>
                <label class="!text-[10px] !font-bold !text-zinc-500 !mb-1.5 !block !uppercase !tracking-wider">بازه
                  رفرنس
                  (Reference Range)</label>
                <v-text-field v-model="form.reference_range" variant="outlined" density="compact" hide-details="auto"
                  placeholder="e.g. 0.5 - 4.5" class="custom-v-input !font-mono" color="#18181b" base-color="#e4e4e7" />
              </div>

              <div
                class="md:!col-span-2 !bg-white !border !border-zinc-200/80 !rounded-xl !p-3.5 !flex !items-center !justify-between !mt-1">
                <div>
                  <label class="!text-xs !font-semibold !text-zinc-900 !block">نشان‌گذاری کلینیکال به عنوان
                    غیرطبیعی</label>
                  <span class="!text-[10px] !text-zinc-400 !block !mt-0.5">آیا نتیجه خارج از حدود فیزیولوژیک یا نرمال
                    کیت
                    آزمایشگاهی است؟</span>
                </div>
                <v-switch v-model="form.abnormal_flag" color="error" inset hide-details
                  class="!pt-0 !mt-0 !flex-none" />
              </div>

              <div class="md:!col-span-2 !mt-1">
                <label class="!text-[10px] !font-bold !text-zinc-500 !mb-1.5 !block !uppercase !tracking-wider">تاریخ
                  دقیق
                  انجام نمونه‌گیری</label>
                <PersianDatetimePicker v-model="form.performed_date" format="YYYY-MM-DD"
                  placeholder="انتخاب تاریخ خورشیدی..." class="custom-picker-input" />
                <p v-if="formDateError" class="!text-red-500 !text-[10px] !font-semibold !mt-1">{{ formDateError }}</p>
              </div>

              <div class="md:!col-span-2">
                <label
                  class="!text-[10px] !font-bold !text-zinc-500 !mb-1.5 !block !uppercase !tracking-wider">یادداشت‌های
                  پیوست یا تشخیصی پزشک</label>
                <v-textarea v-model="form.notes" variant="outlined" density="compact" rows="2" hide-details
                  class="custom-v-input" color="#18181b" base-color="#e4e4e7" />
              </div>
            </div>
          </v-form>
        </div>

        <div class="!px-6 !py-4 !bg-white !border-t !border-zinc-100 !flex !justify-end !gap-2.5">
          <button
            class="!px-4 !py-2 !text-xs !font-semibold !text-zinc-500 hover:!bg-zinc-100 !rounded-xl !transition-colors"
            @click="addDialog = false">انصراف</button>
          <button
            class="!px-5 !py-2 !text-xs !font-semibold !text-white !bg-zinc-900 hover:!bg-zinc-800 !rounded-xl !transition-colors !shadow-sm !flex !items-center !justify-center !min-w-[100px]"
            :disabled="submitting" @click="submitResult">
            <v-progress-circular v-if="submitting" indeterminate size="12" width="2" color="white" class="!ml-2" />
            ذخیره و ثبت نهایی
          </button>
        </div>
      </div>
    </v-dialog>

    <v-dialog v-model="trendDialog" max-width="680" class="backdrop-blur-sm">
      <div class="!bg-white !rounded-2xl !border !border-zinc-200/80 !shadow-2xl !overflow-hidden"
        v-if="trendData.length > 0 || trendLoading">
        <div class="!flex !items-center justify-between !px-6 !py-4 !border-b !border-zinc-100">
          <div>
            <h3 class="!text-xs !font-bold !text-zinc-900 !flex !items-center !gap-2">
              <Icon name="lucide:activity" class="!text-zinc-900 !w-4 !h-4" />
              منحنی تغییرات دوره‌ای بیومارکر: <span class="!font-mono !text-xs !text-blue-600 !font-bold">{{
                trendTestName
                }}</span>
            </h3>
          </div>
          <button class="!text-zinc-400 hover:!text-zinc-900 !transition-colors" @click="trendDialog = false">
            <Icon name="lucide:x" class="!w-4 !h-4" />
          </button>
        </div>

        <div class="!p-6">
          <div v-if="trendLoading" class="!flex !justify-center !py-12">
            <v-progress-circular indeterminate color="#18181b" size="24" width="2" />
          </div>
          <template v-else>
            <div
              class="!bg-white !border !border-zinc-200/60 !rounded-xl !p-4 !mb-5 !shadow-sm !overflow-hidden !relative">
              <span v-if="trendUnit"
                class="!absolute !top-4 !left-4 !text-[9px] !font-mono !text-zinc-400 !border !border-zinc-100 !px-2 !py-0.5 !rounded !bg-zinc-50/50">{{
                trendUnit }}</span>

              <svg :viewBox="`0 0 ${svgWidth} ${svgHeight}`" class="!w-full !max-h-64"
                xmlns="http://www.w3.org/2000/svg">
                <line v-for="(g, gi) in yGridLines" :key="'yg' + gi" :x1="margin.left" :y1="g.y"
                  :x2="svgWidth - margin.right" :y2="g.y" stroke="#f4f4f5" stroke-width="1" stroke-dasharray="4,4" />

                <text v-for="(g, gi) in yGridLines" :key="'yl' + gi" :x="margin.left - 12" :y="g.y + 3" text-anchor="end"
                  class="!fill-zinc-400 !font-mono" font-size="9">
                  {{ g.label }}
                </text>

                <rect v-if="refLow !== null && refHigh !== null" :x="margin.left" :y="scaleY(refHigh)"
                  :width="plotWidth" :height="scaleY(refLow) - scaleY(refHigh)" fill="#f0fdf4" />
                <line v-if="refLow !== null" :x1="margin.left" :y1="scaleY(refLow)" :x2="svgWidth - margin.right"
                  :y2="scaleY(refLow)" stroke="#dcfce7" stroke-width="1" />
                <line v-if="refHigh !== null" :x1="margin.left" :y1="scaleY(refHigh)" :x2="svgWidth - margin.right"
                  :y2="scaleY(refHigh)" stroke="#dcfce7" stroke-width="1" />

                <polyline :points="linePoints" fill="none" stroke="#18181b" stroke-width="1.5"
                  stroke-linejoin="round" />

                <circle v-for="(pt, pi) in trendDataSorted" :key="'pt' + pi" :cx="scaleX(pt.index)"
                  :cy="scaleY(Number(pt.value))" r="3.5" :fill="pt.abnormal_flag ? '#ef4444' : '#18181b'"
                  stroke="#ffffff" stroke-width="1.5" />

                <text v-for="(pt, pi) in trendDataSorted" :key="'xl' + pi" :x="scaleX(pt.index)"
                  :y="svgHeight - margin.bottom + 22" text-anchor="end"
                  transform="rotate(-40, ${scaleX(pt.index)}, ${svgHeight - margin.bottom + 22})"
                  class="!fill-zinc-400 !font-medium" font-size="9">
                  {{ formatShortDate(pt.performed_date) }}
                </text>
              </svg>
            </div>

            <div class="!overflow-x-auto !border !border-zinc-200/60 !rounded-xl">
              <table class="!w-full !text-right !text-xs">
                <thead>
                  <tr class="!bg-zinc-50/50 !border-b !border-zinc-200/60 !text-zinc-400">
                    <th class="!px-4 !py-3 !font-semibold">تاریخ نمونه‌گیری</th>
                    <th class="!px-4 !py-3 !font-semibold">مقدار یافته</th>
                    <th class="!px-4 !py-3 !font-semibold">محدوده مرجع کیت</th>
                  </tr>
                </thead>
                <tbody class="!divide-y !divide-zinc-100 !text-zinc-600">
                  <tr v-for="pt in trendDataSorted" :key="pt.id" class="hover:!bg-zinc-50/30">
                    <td class="!px-4 !py-3 !font-medium">{{ formatJalaliDate(pt.performed_date) }}</td>
                    <td class="!px-4 !py-3 !font-mono !font-bold">
                      <span :class="pt.abnormal_flag ? '!text-red-500' : '!text-zinc-900'">{{ pt.value }}</span>
                    </td>
                    <td class="!px-4 !py-3 !font-mono !text-zinc-400">{{ pt.reference_range || '---' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
        </div>
      </div>
    </v-dialog>

    <v-dialog v-model="deleteDialog" max-width="360" class="backdrop-blur-sm">
      <div class="!bg-white !rounded-2xl !border !border-zinc-200/80 !shadow-2xl !p-6 !text-center">
        <div
          class="!w-11 !h-11 !rounded-xl !bg-red-50 !flex !items-center !justify-center !mx-auto !mb-3.5 !border !border-red-100">
          <Icon name="lucide:trash-2" class="!w-4 !h-4 !text-red-600" />
        </div>
        <h3 class="!text-xs !font-bold !text-zinc-900 !mb-1.5">حذف سابقه تراکنش آزمایشگاه</h3>
        <p class="!text-zinc-400 !text-[11px] !leading-relaxed">آیا از پاک کردن کامل این رکورد اطمینان دارید؟ این عمل
          قابل
          لغو یا بازیابی نخواهد بود.</p>

        <div class="!flex !justify-center !gap-2 !mt-5">
          <button
            class="!flex-1 !px-4 !py-2 !bg-zinc-100 hover:!bg-zinc-200 !text-zinc-600 !text-xs !font-semibold !rounded-xl !transition-colors"
            @click="deleteDialog = false">انصراف</button>
          <button
            class="!flex-1 !px-4 !py-2 !bg-red-600 hover:!bg-red-700 !text-white !text-xs !font-semibold !rounded-xl !transition-colors !shadow-sm !flex !items-center !justify-center"
            :disabled="deleting" @click="deleteResult">
            <v-progress-circular v-if="deleting" indeterminate size="12" width="2" color="white" class="!mr-2" />
            <span v-else>پاک کردن قطعی</span>
          </button>
        </div>
      </div>
    </v-dialog>
  </UiPageContainer>
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
  all: 'همه نتایج اسناد',
  hormone: 'هورمون‌ها',
  tumor_marker: 'مارکرهای توموری',
  cytology: 'سیتولوژی',
  pathology: 'پاتولوژی',
  microbiology: 'میکروبیولوژی',
  genetic: 'ژنتیک',
  other: 'سایر موارد',
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
  performed_date: '',
})

watch(addDialog, (val) => {
  if (!val) {
    form.value = { category: 'hormone', test_name: '', value: '', unit: '', reference_range: '', abnormal_flag: false, notes: '', performed_date: '' }
    formDateError.value = ''
  }
})

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
  searchTimer = setTimeout(() => searchPatients(), 400)
}

function clearSearch() {
  searchQuery.value = ''
  searchResults.value = []
}

function clearPatient() {
  selectedPatient.value = null
  results.value = []
  searchQuery.value = ''
  searchResults.value = []
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
  form.value = { category: 'hormone', test_name: '', value: '', unit: '', reference_range: '', abnormal_flag: false, notes: '', performed_date: '' }
  formDateError.value = ''
  addDialog.value = true
}

async function submitResult() {
  if (!form.value.performed_date) {
    formDateError.value = 'تاریخ انجام آزمایش الزامی است'
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
      value: form.value.value,
      unit: form.value.unit,
      reference_range: form.value.reference_range,
      abnormal_flag: form.value.abnormal_flag,
      notes: form.value.notes,
      performed_date: form.value.performed_date,
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
        (a: any, b: any) => new Date(a.performed_date).getTime() - new Date(b.performed_date).getTime()
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

const margin = { top: 30, right: 20, bottom: 60, left: 50 }
const svgWidth = 620
const svgHeight = 260
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
  const steps = 4
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
/* استایل‌های شخصی‌سازی دیت‌پیکر و کامپوننت‌های توکار بدون استفاده از دستور apply@ برای پایداری و نگهداری آسان‌تر */
:deep(.custom-picker-input) {
  width: 100% !important;
  height: 40px !important;
  border: 1px solid rgba(228, 228, 231, 0.8) !important;
  border-radius: 12px !important;
  padding: 0 16px !important;
  font-size: 12px !important;
  outline: none !important;
  transition: all 0.2s ease-in-out !important;
  color: #18181b !important;
}

:deep(.custom-picker-input::placeholder) {
  color: #a1a1aa !important;
}

:deep(.custom-picker-input:focus) {
  border-color: #18181b !important;
  box-shadow: 0 0 0 4px rgba(24, 24, 27, 0.05) !important;
}

:deep(.custom-v-input .v-field) {
  border-radius: 12px !important;
  font-size: 12px !important;
}

:deep(.scrollbar-none::-webkit-scrollbar) {
  display: none !important;
}

:deep(.scrollbar-none) {
  -ms-overflow-style: none !important;
  scrollbar-width: none !important;
}
</style>