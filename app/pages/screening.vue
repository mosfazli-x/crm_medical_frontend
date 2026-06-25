<template>
  <div class="!mx-auto !max-w-7xl !px-4 !py-8 !md:px-8 !min-h-screen !space-y-8 !bg-[#fafafa]">
    <div class="!flex !flex-col sm:!flex-row !justify-between !items-start sm:!items-center !gap-4">
      <div class="!space-y-1">
        <h1 class="!text-2xl md:!text-3xl !font-bold !text-zinc-900 !tracking-tight">غربالگری و مراقبت پیشگیرانه</h1>
        <p class="!text-sm !text-zinc-500 !font-medium">مدیریت برنامه‌های غربالگری و نتایج آزمایشات بیماران</p>
      </div>
      <div class="!flex !items-center !gap-3">
        <button 
          @click="openAddSchedule"
          class="!flex !items-center !gap-2 !bg-zinc-900 hover:!bg-zinc-800 !text-white !px-4 !py-2.5 !rounded-lg !text-sm !font-medium !shadow-[0_2px_8px_-2px_rgba(0,0,0,0.12)] !transition-all active:!scale-[0.98]"
        >
          <Icon name="lucide:plus" class="!w-4 !h-4" />
          <span>غربالگری جدید</span>
        </button>
      </div>
    </div>

    <div class="!grid !grid-cols-1 sm:!grid-cols-3 !gap-4 md:!gap-6">
      <div class="!bg-white !rounded-xl !border !border-zinc-200/80 !p-5 !flex !items-center !gap-4 !shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div class="!w-10 !h-10 !rounded-lg !bg-zinc-100 !text-zinc-700 !flex !items-center !justify-center !shrink-0 !border !border-zinc-200/50">
          <Icon name="lucide:clipboard-list" class="!w-5 !h-5" />
        </div>
        <div>
          <p class="!text-sm !text-zinc-500 !font-medium !mb-0.5">کل برنامه‌ها</p>
          <p class="!text-2xl !font-semibold !text-zinc-900 !tracking-tight">{{ stats.total }}</p>
        </div>
      </div>
      <div class="!bg-white !rounded-xl !border !border-zinc-200/80 !p-5 !flex !items-center !gap-4 !shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div class="!w-10 !h-10 !rounded-lg !bg-red-50 !text-red-600 !flex !items-center !justify-center !shrink-0 !border !border-red-100">
          <Icon name="lucide:alert-circle" class="!w-5 !h-5" />
        </div>
        <div>
          <p class="!text-sm !text-zinc-500 !font-medium !mb-0.5">معوق</p>
          <p class="!text-2xl !font-semibold !text-zinc-900 !tracking-tight">{{ stats.overdue }}</p>
        </div>
      </div>
      <div class="!bg-white !rounded-xl !border !border-zinc-200/80 !p-5 !flex !items-center !gap-4 !shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div class="!w-10 !h-10 !rounded-lg !bg-emerald-50 !text-emerald-600 !flex !items-center !justify-center !shrink-0 !border !border-emerald-100">
          <Icon name="lucide:check-circle-2" class="!w-5 !h-5" />
        </div>
        <div>
          <p class="!text-sm !text-zinc-500 !font-medium !mb-0.5">تکمیل شده (این ماه)</p>
          <p class="!text-2xl !font-semibold !text-zinc-900 !tracking-tight">{{ stats.completedThisMonth }}</p>
        </div>
      </div>
    </div>

    <div class="!bg-white !rounded-xl !border !border-zinc-200/80 !shadow-[0_2px_8px_-2px_rgba(0,0,0,0.04)] !overflow-hidden !min-h-[400px] !flex !flex-col">
      
      <div class="!border-b !border-zinc-200/80 !bg-white/50 !backdrop-blur-xl">
        <div class="!flex !flex-col sm:!flex-row sm:!items-center !justify-between !px-6 !pt-2">
          
          <nav class="!flex !gap-6 !overflow-x-auto !scrollbar-hide">
            <button 
              @click="activeTab = 'all'" 
              :class="['!py-3.5 !text-sm !font-medium !transition-colors !border-b-[2px] !whitespace-nowrap', activeTab === 'all' ? '!border-zinc-900 !text-zinc-900' : '!border-transparent !text-zinc-500 hover:!text-zinc-800 hover:!border-zinc-300']"
            >
              همه برنامه‌ها
            </button>
            <button 
              @click="activeTab = 'overdue'" 
              :class="['!py-3.5 !text-sm !font-medium !transition-colors !border-b-[2px] !whitespace-nowrap', activeTab === 'overdue' ? '!border-zinc-900 !text-zinc-900' : '!border-transparent !text-zinc-500 hover:!text-zinc-800 hover:!border-zinc-300']"
            >
              معوق
            </button>
            <button 
              @click="activeTab = 'upcoming'" 
              :class="['!py-3.5 !text-sm !font-medium !transition-colors !border-b-[2px] !whitespace-nowrap', activeTab === 'upcoming' ? '!border-zinc-900 !text-zinc-900' : '!border-transparent !text-zinc-500 hover:!text-zinc-800 hover:!border-zinc-300']"
            >
              پیش‌رو (۳۰ روز)
            </button>
            <button 
              @click="activeTab = 'results'" 
              :class="['!py-3.5 !text-sm !font-medium !transition-colors !border-b-[2px] !whitespace-nowrap', activeTab === 'results' ? '!border-zinc-900 !text-zinc-900' : '!border-transparent !text-zinc-500 hover:!text-zinc-800 hover:!border-zinc-300']"
            >
              نتایج آزمایشات
            </button>
          </nav>

          <div v-if="activeTab !== 'results'" class="!pb-3 sm:!pb-0">
            <div class="!relative !flex !items-center">
              <Icon name="lucide:search" class="!absolute !right-3 !w-4 !h-4 !text-zinc-400" />
              <input 
                v-model="searchQuery" 
                type="text" 
                placeholder="جستجو..." 
                class="!w-full sm:!w-[240px] !bg-zinc-50 !border !border-zinc-200 !text-zinc-800 !text-sm !rounded-lg !py-1.5 !pr-9 !pl-3 focus:!outline-none focus:!ring-2 focus:!ring-zinc-900/10 focus:!border-zinc-900 !transition-all placeholder:!text-zinc-400" 
              />
              <button v-if="searchQuery" @click="searchQuery = ''" class="!absolute !left-3 !text-zinc-400 hover:!text-zinc-600">
                <Icon name="lucide:x" class="!w-3.5 !h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="!flex-1 !flex !flex-col">
        <div v-if="loading" class="!flex-1 !flex !flex-col !items-center !justify-center !py-24">
          <Icon name="lucide:loader-2" class="!animate-spin !w-8 !h-8 !text-zinc-300 !mb-4" />
          <span class="!text-sm !text-zinc-500 !font-medium">در حال دریافت اطلاعات...</span>
        </div>

        <div v-else-if="['all', 'overdue', 'upcoming'].includes(activeTab)" class="!overflow-x-auto !flex-1">
          <table class="!min-w-full !text-right !border-collapse">
            <thead class="!bg-zinc-50/50">
              <tr>
                <th class="!px-6 !py-3.5 !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">بیمار</th>
                <th class="!px-6 !py-3.5 !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">نوع غربالگری</th>
                <th class="!px-6 !py-3.5 !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">تاریخ سررسید</th>
                <th class="!px-6 !py-3.5 !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">سطح خطر</th>
                <th class="!px-6 !py-3.5 !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">وضعیت</th>
                <th class="!px-6 !py-3.5 !text-center !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">عملیات</th>
              </tr>
            </thead>
            <tbody class="!divide-y !divide-zinc-100">
              
              <tr v-if="currentSchedules.length === 0">
                <td colspan="6" class="!py-24 !text-center">
                  <div class="!flex !flex-col !items-center !justify-center !space-y-3">
                    <div class="!bg-zinc-50 !p-3 !rounded-xl !border !border-zinc-100">
                      <Icon name="lucide:inbox" class="!w-6 !h-6 !text-zinc-400" />
                    </div>
                    <p class="!text-zinc-500 !text-sm !font-medium">اطلاعاتی برای نمایش وجود ندارد.</p>
                  </div>
                </td>
              </tr>

              <tr v-else v-for="schedule in currentSchedules" :key="schedule.id" class="hover:!bg-zinc-50/80 !transition-colors !group">
                <td class="!px-6 !py-3.5 !text-sm !font-medium !text-zinc-900 !whitespace-nowrap">{{ schedule.patient_name || schedule.patientFirstName + ' ' + schedule.patientLastName || '---' }}</td>
                <td class="!px-6 !py-3.5 !text-sm !text-zinc-600 !whitespace-nowrap">{{ screeningTypeLabel(schedule.screening_type || schedule.screeningType) }}</td>
                <td class="!px-6 !py-3.5 !text-sm !text-zinc-600 !whitespace-nowrap">{{ formatJalaliDate(schedule.due_date || schedule.dueDate) }}</td>
                
                <td class="!px-6 !py-3.5 !whitespace-nowrap">
                  <span :class="[
                    '!inline-flex !items-center !px-2.5 !py-1 !rounded-md !text-xs !font-medium !border',
                    (schedule.risk_level || schedule.riskLevel) === 'low' ? '!bg-emerald-50 !text-emerald-700 !border-emerald-200/60' : '',
                    (schedule.risk_level || schedule.riskLevel) === 'moderate' ? '!bg-amber-50 !text-amber-700 !border-amber-200/60' : '',
                    (schedule.risk_level || schedule.riskLevel) === 'high' ? '!bg-red-50 !text-red-700 !border-red-200/60' : ''
                  ]">
                    {{ riskLabel(schedule.risk_level || schedule.riskLevel) }}
                  </span>
                </td>
                
                <td class="!px-6 !py-3.5 !whitespace-nowrap">
                  <span :class="[
                    '!inline-flex !items-center !px-2.5 !py-1 !rounded-md !text-xs !font-medium !border',
                    schedule.status === 'pending' ? '!bg-amber-50 !text-amber-700 !border-amber-200/60' : '',
                    schedule.status === 'completed' ? '!bg-emerald-50 !text-emerald-700 !border-emerald-200/60' : '',
                    schedule.status === 'overdue' ? '!bg-red-50 !text-red-700 !border-red-200/60' : '',
                    schedule.status === 'cancelled' ? '!bg-zinc-100 !text-zinc-600 !border-zinc-200/60' : ''
                  ]">
                    {{ statusLabel(schedule.status) }}
                  </span>
                </td>

                <td class="!px-6 !py-3.5 !text-center !whitespace-nowrap">
                  <button 
                    @click="confirmDelete(schedule)"
                    class="!p-1.5 !rounded-md !text-zinc-400 hover:!text-red-600 hover:!bg-red-50 !transition-colors !opacity-0 group-hover:!opacity-100"
                    title="حذف برنامه"
                  >
                    <Icon name="lucide:trash-2" class="!w-4 !h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else-if="activeTab === 'results'" class="!flex-1 !flex !flex-col">
          <div class="!px-6 !py-4 !flex !items-center !justify-between !border-b !border-zinc-200/80 !bg-zinc-50/30">
            <span class="!text-sm !font-medium !text-zinc-500">{{ results.length }} نتیجه ثبت شده</span>
            <button 
              @click="openAddResult"
              class="!flex !items-center !gap-1.5 !bg-white !border !border-zinc-200 hover:!border-zinc-300 hover:!bg-zinc-50 !text-zinc-700 !px-3 !py-1.5 !rounded-lg !text-xs !font-medium !transition-colors !shadow-sm"
            >
              <Icon name="lucide:plus" class="!w-3.5 !h-3.5" />
              ثبت نتیجه
            </button>
          </div>
          <div class="!overflow-x-auto !flex-1">
            <table class="!min-w-full !text-right !border-collapse">
              <thead class="!bg-zinc-50/50">
                <tr>
                  <th class="!px-6 !py-3.5 !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">بیمار</th>
                  <th class="!px-6 !py-3.5 !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">نوع غربالگری</th>
                  <th class="!px-6 !py-3.5 !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">نتیجه</th>
                  <th class="!px-6 !py-3.5 !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">تاریخ</th>
                  <th class="!px-6 !py-3.5 !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">وضعیت</th>
                  <th class="!px-6 !py-3.5 !text-center !text-xs !font-medium !text-zinc-500 !border-b !border-zinc-200/80 !whitespace-nowrap">یادداشت</th>
                </tr>
              </thead>
              <tbody class="!divide-y !divide-zinc-100">
                <tr v-if="results.length === 0">
                  <td colspan="6" class="!py-24 !text-center">
                    <div class="!flex !flex-col !items-center !justify-center !space-y-3">
                      <div class="!bg-zinc-50 !p-3 !rounded-xl !border !border-zinc-100">
                        <Icon name="lucide:file-x-2" class="!w-6 !h-6 !text-zinc-400" />
                      </div>
                      <p class="!text-zinc-500 !text-sm !font-medium">نتیجه غربالگری ثبت نشده است.</p>
                    </div>
                  </td>
                </tr>
                <tr v-else v-for="result in results" :key="result.id" class="hover:!bg-zinc-50/80 !transition-colors">
                  <td class="!px-6 !py-3.5 !text-sm !font-medium !text-zinc-900 !whitespace-nowrap">{{ result.patient_name || result.patientFirstName + ' ' + result.patientLastName || '---' }}</td>
                  <td class="!px-6 !py-3.5 !text-sm !text-zinc-600 !whitespace-nowrap">{{ screeningTypeLabel(result.screening_type || result.screeningType) }}</td>
                  <td class="!px-6 !py-3.5 !text-sm !text-zinc-800 !font-medium !whitespace-nowrap">{{ result.result || '---' }}</td>
                  <td class="!px-6 !py-3.5 !text-sm !text-zinc-500 !whitespace-nowrap">{{ formatJalaliDate(result.test_date || result.testDate || result.created_at || result.createdAt) }}</td>
                  
                  <td class="!px-6 !py-3.5 !whitespace-nowrap">
                    <span :class="[
                      '!inline-flex !items-center !px-2.5 !py-1 !rounded-md !text-xs !font-medium !border',
                      (result.is_abnormal || result.abnormal) ? '!bg-red-50 !text-red-700 !border-red-200/60' : '!bg-emerald-50 !text-emerald-700 !border-emerald-200/60'
                    ]">
                      {{ (result.is_abnormal || result.abnormal) ? 'غیرنرمال' : 'نرمال' }}
                    </span>
                  </td>

                  <td class="!px-6 !py-3.5 !text-center !whitespace-nowrap">
                    <button v-if="result.notes" :title="result.notes" class="!text-zinc-400 hover:!text-zinc-700 !transition-colors">
                      <Icon name="lucide:message-square-text" class="!w-4 !h-4" />
                    </button>
                    <span v-else class="!text-zinc-300">-</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <v-dialog v-model="addScheduleDialog" max-width="500" persistent class="!backdrop-blur-[2px]">
      <div class="!bg-white !rounded-2xl !border !border-zinc-200/80 !shadow-2xl !overflow-hidden">
        
        <div class="!px-6 !py-4 !border-b !border-zinc-100 !flex !items-center !justify-between !bg-zinc-50/30">
          <h3 class="!text-base !font-semibold !text-zinc-900">برنامه غربالگری جدید</h3>
          <button @click="addScheduleDialog = false" class="!p-1.5 !rounded-md !text-zinc-400 hover:!text-zinc-700 hover:!bg-zinc-100 !transition-colors">
            <Icon name="lucide:x" class="!w-4 !h-4" />
          </button>
        </div>

        <div class="!p-6 !space-y-4">
          <div class="!space-y-1.5">
            <label class="!text-xs !font-medium !text-zinc-700">شناسه بیمار</label>
            <input 
              v-model="scheduleForm.patient_id" 
              type="text" 
              placeholder="آیدی بیمار (UUID) را وارد کنید" 
              class="!w-full !px-3 !py-2 !bg-white !border !border-zinc-200 !rounded-lg !text-sm !text-zinc-800 focus:!outline-none focus:!ring-2 focus:!ring-zinc-900/10 focus:!border-zinc-900 !transition-all"
            />
          </div>

          <div class="!space-y-1.5">
            <label class="!text-xs !font-medium !text-zinc-700">نوع غربالگری</label>
            <select 
              v-model="scheduleForm.screening_type" 
              class="!w-full !px-3 !py-2 !bg-white !border !border-zinc-200 !rounded-lg !text-sm !text-zinc-800 focus:!outline-none focus:!ring-2 focus:!ring-zinc-900/10 focus:!border-zinc-900 !transition-all !appearance-none"
            >
              <option value="" disabled>انتخاب کنید...</option>
              <option v-for="opt in screeningTypeOptions" :key="opt.value" :value="opt.value">{{ opt.title }}</option>
            </select>
          </div>

          <div class="!space-y-1.5">
            <label class="!text-xs !font-medium !text-zinc-700">تاریخ سررسید</label>
            <div class="!relative">
              <PersianDatetimePicker 
                v-model="scheduleForm.due_date" 
                type="date" 
                placeholder="انتخاب تاریخ"
                display-format="jYYYY/jMM/jDD" 
                format="YYYY-MM-DD" 
                color="#000000" 
                auto-submit 
                clearable
                custom-input 
                class="!w-full !h-[38px] !border !border-zinc-200 hover:!border-zinc-300 !text-sm !text-zinc-800 !outline-none focus:!ring-2 focus:!ring-zinc-900/10 focus:!border-zinc-900 !rounded-lg !px-3 !bg-white !transition-all" 
              />
            </div>
          </div>

          <div class="!space-y-1.5">
            <label class="!text-xs !font-medium !text-zinc-700">سطح خطر</label>
            <select 
              v-model="scheduleForm.risk_level" 
              class="!w-full !px-3 !py-2 !bg-white !border !border-zinc-200 !rounded-lg !text-sm !text-zinc-800 focus:!outline-none focus:!ring-2 focus:!ring-zinc-900/10 focus:!border-zinc-900 !transition-all !appearance-none"
            >
              <option value="" disabled>انتخاب کنید...</option>
              <option v-for="opt in riskOptions" :key="opt.value" :value="opt.value">{{ opt.title }}</option>
            </select>
          </div>

          <div class="!space-y-1.5">
            <label class="!text-xs !font-medium !text-zinc-700">یادداشت</label>
            <textarea 
              v-model="scheduleForm.notes" 
              rows="3" 
              placeholder="توضیحات تکمیلی..."
              class="!w-full !px-3 !py-2 !bg-white !border !border-zinc-200 !rounded-lg !text-sm !text-zinc-800 focus:!outline-none focus:!ring-2 focus:!ring-zinc-900/10 focus:!border-zinc-900 !transition-all !resize-none"
            ></textarea>
          </div>
        </div>

        <div class="!px-6 !py-4 !border-t !border-zinc-100 !bg-zinc-50/50 !flex !items-center !justify-end !gap-3">
          <button @click="addScheduleDialog = false" class="!px-4 !py-2 !text-sm !font-medium !text-zinc-600 hover:!text-zinc-900 !transition-colors">
            انصراف
          </button>
          <button 
            @click="submitSchedule" 
            :disabled="savingSchedule"
            class="!flex !items-center !gap-2 !bg-zinc-900 hover:!bg-zinc-800 disabled:!bg-zinc-300 disabled:!cursor-not-allowed !text-white !px-4 !py-2 !rounded-lg !text-sm !font-medium !shadow-sm !transition-all"
          >
            <Icon v-if="savingSchedule" name="lucide:loader-2" class="!animate-spin !w-4 !h-4" />
            <span>ثبت برنامه</span>
          </button>
        </div>
      </div>
    </v-dialog>

    <v-dialog v-model="addResultDialog" max-width="500" persistent class="!backdrop-blur-[2px]">
      <div class="!bg-white !rounded-2xl !border !border-zinc-200/80 !shadow-2xl !overflow-hidden">
        
        <div class="!px-6 !py-4 !border-b !border-zinc-100 !flex !items-center !justify-between !bg-zinc-50/30">
          <h3 class="!text-base !font-semibold !text-zinc-900">ثبت نتیجه غربالگری</h3>
          <button @click="addResultDialog = false" class="!p-1.5 !rounded-md !text-zinc-400 hover:!text-zinc-700 hover:!bg-zinc-100 !transition-colors">
            <Icon name="lucide:x" class="!w-4 !h-4" />
          </button>
        </div>

        <div class="!p-6 !space-y-4">
          <div class="!space-y-1.5">
            <label class="!text-xs !font-medium !text-zinc-700">شناسه بیمار</label>
            <input 
              v-model="resultForm.patient_id" 
              type="text" 
              placeholder="آیدی بیمار (UUID) را وارد کنید" 
              class="!w-full !px-3 !py-2 !bg-white !border !border-zinc-200 !rounded-lg !text-sm !text-zinc-800 focus:!outline-none focus:!ring-2 focus:!ring-zinc-900/10 focus:!border-zinc-900 !transition-all"
            />
          </div>

          <div class="!space-y-1.5">
            <label class="!text-xs !font-medium !text-zinc-700">نوع غربالگری</label>
            <select 
              v-model="resultForm.screening_type" 
              class="!w-full !px-3 !py-2 !bg-white !border !border-zinc-200 !rounded-lg !text-sm !text-zinc-800 focus:!outline-none focus:!ring-2 focus:!ring-zinc-900/10 focus:!border-zinc-900 !transition-all !appearance-none"
            >
              <option value="" disabled>انتخاب کنید...</option>
              <option v-for="opt in screeningTypeOptions" :key="opt.value" :value="opt.value">{{ opt.title }}</option>
            </select>
          </div>

          <div class="!space-y-1.5">
            <label class="!text-xs !font-medium !text-zinc-700">نتیجه آزمایش</label>
            <input 
              v-model="resultForm.result" 
              type="text" 
              placeholder="مثال: Negative, High Risk..." 
              class="!w-full !px-3 !py-2 !bg-white !border !border-zinc-200 !rounded-lg !text-sm !text-zinc-800 focus:!outline-none focus:!ring-2 focus:!ring-zinc-900/10 focus:!border-zinc-900 !transition-all"
            />
          </div>

          <div class="!grid !grid-cols-2 !gap-4">
            <div class="!space-y-1.5">
              <label class="!text-xs !font-medium !text-zinc-700">تاریخ آزمایش</label>
              <div class="!relative">
                <PersianDatetimePicker 
                  v-model="resultForm.test_date" 
                  type="date" 
                  placeholder="انتخاب تاریخ"
                  display-format="jYYYY/jMM/jDD" 
                  format="YYYY-MM-DD" 
                  color="#000000" 
                  auto-submit 
                  clearable
                  custom-input 
                  class="!w-full !h-[38px] !border !border-zinc-200 hover:!border-zinc-300 !text-sm !text-zinc-800 !outline-none focus:!ring-2 focus:!ring-zinc-900/10 focus:!border-zinc-900 !rounded-lg !px-3 !bg-white !transition-all" 
                />
              </div>
            </div>

            <div class="!space-y-1.5">
              <label class="!text-xs !font-medium !text-zinc-700">وضعیت بالینی</label>
              <select 
                v-model="resultForm.is_abnormal" 
                class="!w-full !px-3 !py-2 !bg-white !border !border-zinc-200 !rounded-lg !text-sm !text-zinc-800 focus:!outline-none focus:!ring-2 focus:!ring-zinc-900/10 focus:!border-zinc-900 !transition-all !appearance-none"
              >
                <option :value="false">نرمال</option>
                <option :value="true">غیرنرمال</option>
              </select>
            </div>
          </div>

          <div class="!space-y-1.5">
            <label class="!text-xs !font-medium !text-zinc-700">یادداشت</label>
            <textarea 
              v-model="resultForm.notes" 
              rows="2" 
              placeholder="توضیحات تکمیلی..."
              class="!w-full !px-3 !py-2 !bg-white !border !border-zinc-200 !rounded-lg !text-sm !text-zinc-800 focus:!outline-none focus:!ring-2 focus:!ring-zinc-900/10 focus:!border-zinc-900 !transition-all !resize-none"
            ></textarea>
          </div>
        </div>

        <div class="!px-6 !py-4 !border-t !border-zinc-100 !bg-zinc-50/50 !flex !items-center !justify-end !gap-3">
          <button @click="addResultDialog = false" class="!px-4 !py-2 !text-sm !font-medium !text-zinc-600 hover:!text-zinc-900 !transition-colors">
            انصراف
          </button>
          <button 
            @click="submitResult" 
            :disabled="savingResult"
            class="!flex !items-center !gap-2 !bg-zinc-900 hover:!bg-zinc-800 disabled:!bg-zinc-300 disabled:!cursor-not-allowed !text-white !px-4 !py-2 !rounded-lg !text-sm !font-medium !shadow-sm !transition-all"
          >
            <Icon v-if="savingResult" name="lucide:loader-2" class="!animate-spin !w-4 !h-4" />
            <span>ثبت نتیجه</span>
          </button>
        </div>
      </div>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'

const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

const activeTab = ref('all')
const searchQuery = ref('')
const loading = ref(true)

// Stats
const stats = ref({ total: 0, overdue: 0, completedThisMonth: 0 })

// Schedules
const schedules = ref<any[]>([])
const overdueSchedules = ref<any[]>([])
const upcomingSchedules = ref<any[]>([])

// Results
const results = ref<any[]>([])

// Dialog states
const addScheduleDialog = ref(false)
const addResultDialog = ref(false)
const savingSchedule = ref(false)
const savingResult = ref(false)

// Form data
const scheduleForm = ref({
  patient_id: '',
  screening_type: '',
  due_date: null as string | null,
  risk_level: '',
  notes: '',
})

const resultForm = ref({
  patient_id: '',
  screening_type: '',
  result: '',
  test_date: null as string | null,
  is_abnormal: false,
  notes: '',
})

// Configuration Options
const screeningTypeOptions = [
  { title: 'آزمایش پاپ اسمیر', value: 'pap_smear' },
  { title: 'تست HPV', value: 'hpv' },
  { title: 'ماموگرافی', value: 'mammography' },
  { title: 'تراکم استخوان (DEXA)', value: 'dexa' },
  { title: 'غربالگری STI', value: 'sti' },
  { title: 'کولپوسکوپی', value: 'colposcopy' },
]

const riskOptions = [
  { title: 'کم', value: 'low' },
  { title: 'متوسط', value: 'moderate' },
  { title: 'زیاد', value: 'high' },
]

const screeningTypeMap: Record<string, string> = {
  pap_smear: 'آزمایش پاپ اسمیر',
  hpv: 'تست HPV',
  mammography: 'ماموگرافی',
  dexa: 'تراکم استخوان (DEXA)',
  sti: 'غربالگری STI',
  colposcopy: 'کولپوسکوپی',
}

const riskMap: Record<string, string> = {
  low: 'کم',
  moderate: 'متوسط',
  high: 'زیاد',
}

const statusMap: Record<string, string> = {
  pending: 'در انتظار',
  completed: 'تکمیل شده',
  overdue: 'معوق',
  cancelled: 'لغو شده',
}

function screeningTypeLabel(type: string): string {
  return screeningTypeMap[type] || type
}

function riskLabel(level: string): string {
  return riskMap[level] || level
}

function statusLabel(status: string): string {
  return statusMap[status] || status
}

// Logic to switch active array based on tab
const currentSchedules = computed(() => {
  let list = []
  if (activeTab.value === 'all') list = schedules.value
  else if (activeTab.value === 'overdue') list = overdueSchedules.value
  else if (activeTab.value === 'upcoming') list = upcomingSchedules.value
  
  if (!searchQuery.value.trim()) return list
  const q = searchQuery.value.trim().toLowerCase()
  return list.filter((s: any) => {
    const name = (s.patient_name || s.patientFirstName + ' ' + s.patientLastName || '').toLowerCase()
    const type = screeningTypeLabel(s.screening_type || s.screeningType).toLowerCase()
    return name.includes(q) || type.includes(q)
  })
})

// Format date to Jalali
function formatJalaliDate(date: string | null): string {
  if (!date) return '---'
  return new Intl.DateTimeFormat('fa-IR', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(date))
}

// Fetch Data from Server
async function fetchAll() {
  loading.value = true
  try {
    const [schedulesRes, overdueRes, upcomingRes, resultsRes] = await Promise.all([
      apiFetch<any>('/api/screening/schedules'),
      apiFetch<any>('/api/screening/schedules/overdue'),
      apiFetch<any>('/api/screening/schedules/upcoming?days=30'),
      apiFetch<any>('/api/screening/results'),
    ])

    if (schedulesRes.success) schedules.value = schedulesRes.data
    if (overdueRes.success) overdueSchedules.value = overdueRes.data
    if (upcomingRes.success) upcomingSchedules.value = upcomingRes.data
    if (resultsRes.success) results.value = resultsRes.data

    computeStats()
  } catch (err: any) {
    $toast.error('خطا در دریافت اطلاعات')
  } finally {
    loading.value = false
  }
}

function computeStats() {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  stats.value = {
    total: schedules.value.length,
    overdue: overdueSchedules.value.length || schedules.value.filter((s: any) => s.status === 'overdue').length,
    completedThisMonth: results.value.filter((r: any) => {
      const d = new Date(r.test_date || r.testDate || r.created_at || r.createdAt)
      return d >= startOfMonth
    }).length,
  }
}

// Delete schedule
async function confirmDelete(schedule: any) {
  if (!confirm(`آیا از حذف این برنامه غربالگری اطمینان دارید؟`)) return
  try {
    const res = await apiFetch(`/api/screening/schedules/${schedule.id}`, { method: 'DELETE' })
    if (res.success) {
      $toast.success('برنامه غربالگری حذف شد')
      await fetchAll()
    } else {
      $toast.error(res.error || 'خطا در حذف برنامه')
    }
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در ارتباط با سرور')
  }
}

// Open Form Dialogs
function openAddSchedule() {
  scheduleForm.value = { patient_id: '', screening_type: '', due_date: null, risk_level: '', notes: '' }
  addScheduleDialog.value = true
}

// Submit forms keeping UUID intact
async function submitSchedule() {
  if (!scheduleForm.value.patient_id || !scheduleForm.value.screening_type || !scheduleForm.value.due_date) {
    $toast.error('لطفاً فیلدهای ضروری را پر کنید')
    return
  }
  savingSchedule.value = true
  try {
    const res = await apiFetch('/api/screening/schedules', {
      method: 'POST',
      body: {
        patient_id: scheduleForm.value.patient_id,
        screening_type: scheduleForm.value.screening_type,
        due_date: scheduleForm.value.due_date,
        risk_level: scheduleForm.value.risk_level || undefined,
        notes: scheduleForm.value.notes || undefined,
      },
    })
    if (res.success) {
      $toast.success('برنامه غربالگری با موفقیت ثبت شد')
      addScheduleDialog.value = false
      await fetchAll()
    } else {
      $toast.error(res.error || 'خطا در ثبت برنامه')
    }
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در ارتباط با سرور')
  } finally {
    savingSchedule.value = false
  }
}

function openAddResult() {
  resultForm.value = { patient_id: '', screening_type: '', result: '', test_date: null, is_abnormal: false, notes: '' }
  addResultDialog.value = true
}

async function submitResult() {
  if (!resultForm.value.patient_id || !resultForm.value.screening_type || !resultForm.value.result) {
    $toast.error('لطفاً فیلدهای ضروری را پر کنید')
    return
  }
  savingResult.value = true
  try {
    const res = await apiFetch('/api/screening/results', {
      method: 'POST',
      body: {
        patient_id: resultForm.value.patient_id,
        screening_type: resultForm.value.screening_type,
        result: resultForm.value.result,
        test_date: resultForm.value.test_date || undefined,
        is_abnormal: resultForm.value.is_abnormal,
        notes: resultForm.value.notes || undefined,
      },
    })
    if (res.success) {
      $toast.success('نتیجه غربالگری با موفقیت ثبت شد')
      addResultDialog.value = false
      await fetchAll()
    } else {
      $toast.error(res.error || 'خطا در ثبت نتیجه')
    }
  } catch (err: any) {
    $toast.error(err.data?.error || 'خطا در ارتباط با سرور')
  } finally {
    savingResult.value = false
  }
}

watch(activeTab, () => {
  if (activeTab.value === 'results' && results.value.length === 0) {
    fetchAll()
  }
})

onMounted(() => {
  fetchAll()
})

useSeoMeta({ title: 'غربالگری و مراقبت پیشگیرانه | سیستم کلینیک' })
</script>