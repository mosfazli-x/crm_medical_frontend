<template>
  <div class="!max-w-7xl !mx-auto !p-4 md:!p-8 !pt-6 !space-y-8 !font-sans">
    <div class="!flex !flex-col sm:!flex-row !justify-between !items-center !gap-4 !pb-4 !border-b !border-slate-200 dark:!border-slate-700">
      <div class="!text-right !w-full">
        <h1 class="!text-3xl !font-extrabold !text-slate-800 dark:!text-slate-100 !tracking-tight">ابزارهای تصمیم‌گیری بالینی</h1>
        <p class="!text-sm !text-slate-500 dark:!text-slate-400 !mt-2 !font-medium">ابزارهای کمک تشخیصی و ارزیابی بالینی بیماران</p>
      </div>
    </div>

    <div class="!grid !grid-cols-1 lg:!grid-cols-2 !gap-8">
      
      <div class="!bg-white dark:!bg-slate-800 !rounded-3xl !border !border-slate-200/70 dark:!border-slate-700 !shadow-sm lg:!col-span-2 !overflow-hidden !transition-all hover:!shadow-md hover:!border-periwinkle dark:hover:!border-electric-sapphire/50">
        <div class="!p-6 md:!p-8">
          <div class="!flex !items-center !gap-4 !mb-8">
            <div class="!w-14 !h-14 !rounded-2xl !bg-light-cyan dark:!bg-electric-sapphire/20 !text-electric-sapphire !flex !items-center !justify-center !shadow-inner">
              <svg class="!w-7 !h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
            </div>
            <div>
              <h3 class="!text-xl !font-bold !text-slate-800 dark:!text-slate-100">ارزیابی PCOS (Rotterdam)</h3>
              <p class="!text-sm !text-slate-500 dark:!text-slate-400 !mt-1">تشخیص سندرم تخمدان پلی‌کیستیک بر اساس معیارهای Rotterdam</p>
            </div>
          </div>

          <div class="!grid !grid-cols-1 md:!grid-cols-3 !gap-5 !mb-8">
            <div class="!space-y-2">
              <label class="!text-xs !font-bold !text-slate-700 dark:!text-slate-300 !px-1">سن</label>
              <input v-model.number="pcos.age" type="number" min="0" class="!w-full !px-4 !py-3 !bg-slate-50 dark:!bg-slate-700 !border !border-slate-200 dark:!border-slate-700 !rounded-xl focus:!bg-white dark:!bg-slate-800 focus:!border-electric-sapphire focus:!ring-4 focus:!ring-light-cyan !transition-all !outline-none !text-slate-800 dark:!text-slate-100" />
            </div>
            <div class="!space-y-2">
              <label class="!text-xs !font-bold !text-slate-700 dark:!text-slate-300 !px-1">BMI</label>
              <input v-model.number="pcos.bmi" type="number" min="0" step="0.1" class="!w-full !px-4 !py-3 !bg-slate-50 dark:!bg-slate-700 !border !border-slate-200 dark:!border-slate-700 !rounded-xl focus:!bg-white dark:!bg-slate-800 focus:!border-electric-sapphire focus:!ring-4 focus:!ring-light-cyan !transition-all !outline-none !text-slate-800 dark:!text-slate-100" />
            </div>
            <div class="!space-y-2">
              <label class="!text-xs !font-bold !text-slate-700 dark:!text-slate-300 !px-1">طول سیکل (روز)</label>
              <input v-model.number="pcos.cycle_length_days" type="number" min="0" class="!w-full !px-4 !py-3 !bg-slate-50 dark:!bg-slate-700 !border !border-slate-200 dark:!border-slate-700 !rounded-xl focus:!bg-white dark:!bg-slate-800 focus:!border-electric-sapphire focus:!ring-4 focus:!ring-light-cyan !transition-all !outline-none !text-slate-800 dark:!text-slate-100" />
            </div>
          </div>

          <div class="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-3 !gap-5 !mb-8">
            <div class="!bg-slate-50/50 dark:!bg-slate-700/50 !rounded-2xl !p-5 !border !border-slate-200 dark:!border-slate-700">
              <div class="!flex !items-center !gap-3 !mb-4 !pb-3 !border-b !border-slate-200 dark:!border-slate-700">
                <span class="!w-7 !h-7 !rounded-full !bg-baby-blue-ice !text-electric-sapphire !flex !items-center !justify-center !text-sm !font-bold">1</span>
                <span class="!text-sm !font-bold !text-slate-800 dark:!text-slate-100">الیگو / آنوولاسیون</span>
              </div>
              <label class="!flex !items-center !gap-3 !cursor-pointer !group">
                <div class="!relative !flex !items-center !justify-center">
                  <input type="checkbox" v-model="pcos.oligo_anovulation" class="!peer !sr-only" />
                  <div class="!w-5 !h-5 !border-2 !border-slate-300 !rounded-md peer-checked:!bg-electric-sapphire peer-checked:!border-electric-sapphire !transition-colors"></div>
                  <svg class="!absolute !w-3 !h-3 !text-white !opacity-0 peer-checked:!opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span class="!text-sm !font-medium !text-slate-700 dark:!text-slate-300 group-hover:!text-electric-sapphire !transition-colors">الیگو-تخمک‌گذاری / آنوولاسیون</span>
              </label>
            </div>

            <div class="!bg-slate-50/50 dark:!bg-slate-700/50 !rounded-2xl !p-5 !border !border-slate-200 dark:!border-slate-700">
              <div class="!flex !items-center !gap-3 !mb-4 !pb-3 !border-b !border-slate-200 dark:!border-slate-700">
                <span class="!w-7 !h-7 !rounded-full !bg-baby-blue-ice !text-electric-sapphire !flex !items-center !justify-center !text-sm !font-bold">2a</span>
                <span class="!text-sm !font-bold !text-slate-800 dark:!text-slate-100">هیپرآندروژنیسم بالینی</span>
              </div>
              <div class="!space-y-3">
                <label v-for="(label, key) in { hirsutism: 'هیرسوتیسم', acne: 'آکنه', alopecia: 'آلوپسی', acanthosis_nigricans: 'آکانتوزیس نیگریکانس' }" :key="key" class="!flex !items-center !gap-3 !cursor-pointer !group">
                  <div class="!relative !flex !items-center !justify-center">
                    <input type="checkbox" v-model="pcos[key]" class="!peer !sr-only" />
                    <div class="!w-5 !h-5 !border-2 !border-slate-300 !rounded-md peer-checked:!bg-electric-sapphire peer-checked:!border-electric-sapphire !transition-colors"></div>
                    <svg class="!absolute !w-3 !h-3 !text-white !opacity-0 peer-checked:!opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <span class="!text-sm !font-medium !text-slate-700 dark:!text-slate-300 group-hover:!text-electric-sapphire !transition-colors">{{ label }}</span>
                </label>
              </div>
            </div>

            <div class="!bg-slate-50/50 dark:!bg-slate-700/50 !rounded-2xl !p-5 !border !border-slate-200 dark:!border-slate-700">
              <div class="!flex !items-center !gap-3 !mb-4 !pb-3 !border-b !border-slate-200 dark:!border-slate-700">
                <span class="!w-7 !h-7 !rounded-full !bg-baby-blue-ice !text-electric-sapphire !flex !items-center !justify-center !text-sm !font-bold">2b</span>
                <span class="!text-sm !font-bold !text-slate-800 dark:!text-slate-100">هیپرآندروژنیسم بیوشیمیایی</span>
              </div>
              <div class="!space-y-3">
                <label v-for="(label, key) in { testosterone_elevated: 'تستوسترون بالا', dheas_elevated: 'DHEAS بالا', free_androgen_index_elevated: 'شاخص آندروژن آزاد (FAI) بالا' }" :key="key" class="!flex !items-center !gap-3 !cursor-pointer !group">
                  <div class="!relative !flex !items-center !justify-center">
                    <input type="checkbox" v-model="pcos[key]" class="!peer !sr-only" />
                    <div class="!w-5 !h-5 !border-2 !border-slate-300 !rounded-md peer-checked:!bg-electric-sapphire peer-checked:!border-electric-sapphire !transition-colors"></div>
                    <svg class="!absolute !w-3 !h-3 !text-white !opacity-0 peer-checked:!opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <span class="!text-sm !font-medium !text-slate-700 dark:!text-slate-300 group-hover:!text-electric-sapphire !transition-colors">{{ label }}</span>
                </label>
              </div>
            </div>

            <div class="!bg-slate-50/50 dark:!bg-slate-700/50 !rounded-2xl !p-5 !border !border-slate-200 dark:!border-slate-700 lg:!col-span-3">
              <div class="!flex !items-center !gap-3 !mb-4 !pb-3 !border-b !border-slate-200 dark:!border-slate-700">
                <span class="!w-7 !h-7 !rounded-full !bg-baby-blue-ice !text-electric-sapphire !flex !items-center !justify-center !text-sm !font-bold">3</span>
                <span class="!text-sm !font-bold !text-slate-800 dark:!text-slate-100">تخمدان پلی‌کیستیک در سونوگرافی</span>
              </div>
              <div class="!grid !grid-cols-1 sm:!grid-cols-3 !gap-5 !items-center">
                <label class="!flex !items-center !gap-3 !cursor-pointer !group">
                  <div class="!relative !flex !items-center !justify-center">
                    <input type="checkbox" v-model="pcos.polycystic_ovaries_us" class="!peer !sr-only" />
                    <div class="!w-5 !h-5 !border-2 !border-slate-300 !rounded-md peer-checked:!bg-electric-sapphire peer-checked:!border-electric-sapphire !transition-colors"></div>
                    <svg class="!absolute !w-3 !h-3 !text-white !opacity-0 peer-checked:!opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <span class="!text-sm !font-medium !text-slate-700 dark:!text-slate-300 group-hover:!text-electric-sapphire !transition-colors">PCO در سونوگرافی</span>
                </label>
                
                <div class="!space-y-2">
                  <label class="!text-xs !font-bold !text-slate-700 dark:!text-slate-300 !px-1">تعداد فولیکول</label>
                  <input v-model.number="pcos.follicle_count_per_ovary" type="number" min="0" class="!w-full !px-4 !py-2.5 !bg-white dark:!bg-slate-800 !border !border-slate-200 dark:!border-slate-700 !rounded-xl focus:!border-electric-sapphire focus:!ring-4 focus:!ring-light-cyan !transition-all !outline-none !text-slate-800 dark:!text-slate-100" />
                </div>
                <div class="!space-y-2">
                  <label class="!text-xs !font-bold !text-slate-700 dark:!text-slate-300 !px-1">حجم تخمدان (ml)</label>
                  <input v-model.number="pcos.ovarian_volume_ml" type="number" min="0" step="0.1" class="!w-full !px-4 !py-2.5 !bg-white dark:!bg-slate-800 !border !border-slate-200 dark:!border-slate-700 !rounded-xl focus:!border-electric-sapphire focus:!ring-4 focus:!ring-light-cyan !transition-all !outline-none !text-slate-800 dark:!text-slate-100" />
                </div>
              </div>
            </div>
          </div>

          <div class="!bg-orange-50/50 dark:!bg-orange-900/20 !rounded-2xl !p-5 !border !border-orange-200 !mb-8">
            <div class="!flex !items-center !gap-2 !mb-4">
              <svg class="!w-5 !h-5 !text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
              <span class="!text-sm !font-bold !text-orange-800 dark:!text-orange-300">بیماری‌های رد شده (Exclusions)</span>
            </div>
            <div class="!flex !flex-wrap !gap-6">
              <label v-for="(label, key) in { excluded_cah: 'CAH رد شده', excluded_cushing: 'کوشینگ رد شده', excluded_tumor: 'تومور رد شده' }" :key="key" class="!flex !items-center !gap-3 !cursor-pointer !group">
                <div class="!relative !flex !items-center !justify-center">
                  <input type="checkbox" v-model="pcos[key]" class="!peer !sr-only" />
                  <div class="!w-5 !h-5 !border-2 !border-orange-300 !bg-white dark:!bg-slate-800 !rounded-md peer-checked:!bg-orange-500 peer-checked:!border-orange-500 !transition-colors"></div>
                  <svg class="!absolute !w-3 !h-3 !text-white !opacity-0 peer-checked:!opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <span class="!text-sm !font-medium !text-orange-900 dark:!text-orange-300 group-hover:!text-orange-700 !transition-colors">{{ label }}</span>
              </label>
            </div>
          </div>

          <div class="!space-y-5">
            <textarea v-model="pcos.notes" rows="2" placeholder="یادداشت‌های بالینی..." class="!w-full !px-4 !py-3 !bg-slate-50 dark:!bg-slate-700 !border !border-slate-200 dark:!border-slate-700 !rounded-xl focus:!bg-white dark:!bg-slate-800 focus:!border-electric-sapphire focus:!ring-4 focus:!ring-light-cyan !transition-all !outline-none !text-slate-800 dark:!text-slate-100 !resize-y"></textarea>

            <button @click="assessPCOS" :disabled="pcosLoading" class="!w-full !py-4 !px-6 !bg-electric-sapphire hover:!bg-cornflower-blue !text-white !font-extrabold !text-lg !rounded-2xl !shadow-lg !shadow-electric-sapphire/30 !transition-all !flex !justify-center !items-center !gap-3 disabled:!opacity-70 disabled:!cursor-not-allowed">
              <svg v-if="pcosLoading" class="!w-6 !h-6 !text-white !animate-spin" fill="none" viewBox="0 0 24 24"><circle class="!opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="!opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
              <span v-else>ارزیابی نهایی PCOS</span>
            </button>
          </div>

          <div v-if="pcosResult" class="!mt-8 !p-6 !rounded-3xl !border" :class="pcosResult.diagnosed ? '!bg-red-50 dark:!bg-red-900/30 !border-red-200' : '!bg-green-50 dark:!bg-green-900/30 !border-green-200'">
            <div class="!flex !flex-col sm:!flex-row !items-center !justify-between !gap-4 !mb-6">
              <div class="!flex !items-center !gap-3">
                <span class="!px-5 !py-2 !rounded-full !font-black !text-white !shadow-sm" :class="pcosResult.diagnosed ? '!bg-red-500' : '!bg-green-500'">
                  {{ pcosResult.diagnosis }}
                </span>
                <span v-if="pcosResult.phenotype" class="!px-4 !py-1.5 !rounded-full !border-2 !font-bold !text-sm" :class="pcosResult.diagnosed ? '!border-red-200 !text-red-700' : '!border-green-200 !text-green-700'">
                  {{ pcosResult.phenotype }}
                </span>
              </div>
              <div class="!text-center !bg-white dark:!bg-slate-800 !px-6 !py-2 !rounded-2xl !shadow-sm">
                <div class="!text-3xl !font-black" :class="pcosResult.diagnosed ? '!text-red-600' : '!text-green-600'">
                  {{ pcosResult.criteriaMet }}<span class="!text-lg !text-slate-400 dark:!text-slate-500">/{{ pcosResult.criteriaRequired }}</span>
                </div>
                <div class="!text-[11px] !text-slate-500 dark:!text-slate-400 !font-bold">معیار مثبت</div>
              </div>
            </div>

            <div class="!grid !grid-cols-1 sm:!grid-cols-3 !gap-4">
              <div v-for="c in pcosResult.criteriaDetails" :key="c.key" class="!flex !items-start !gap-3 !p-4 !rounded-2xl !bg-white dark:!bg-slate-800 !border !shadow-sm" :class="c.met ? '!border-green-200' : '!border-red-100'">
                <div class="!mt-0.5">
                  <svg v-if="c.met" class="!w-5 !h-5 !text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  <svg v-else class="!w-5 !h-5 !text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg>
                </div>
                <div>
                  <div class="!text-sm !font-bold" :class="c.met ? '!text-green-700' : '!text-red-600'">{{ c.label }}</div>
                  <div class="!text-xs !text-slate-500 dark:!text-slate-400 !mt-1 !leading-relaxed">{{ c.description }}</div>
                </div>
              </div>
            </div>

            <div v-if="pcosResult.recommendation" class="!mt-5 !bg-light-cyan dark:!bg-electric-sapphire/20 !border !border-periwinkle dark:!border-electric-sapphire/50 !rounded-2xl !p-4 !flex !gap-3 !items-start">
              <svg class="!w-5 !h-5 !text-electric-sapphire !shrink-0 !mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <p class="!text-sm !text-electric-sapphire !font-bold !leading-relaxed">{{ pcosResult.recommendation }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="!bg-white dark:!bg-slate-800 !rounded-3xl !border !border-slate-200/70 dark:!border-slate-700 !shadow-sm !overflow-hidden !transition-all hover:!shadow-md hover:!border-periwinkle dark:hover:!border-electric-sapphire/50">
        <div class="!p-6 md:!p-8">
          <div class="!flex !items-center !gap-4 !mb-8">
            <div class="!w-14 !h-14 !rounded-2xl !bg-orange-50 dark:!bg-orange-900/20 !text-orange-500 !flex !items-center !justify-center !shadow-inner">
              <svg class="!w-7 !h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"></path><path stroke-linecap="round" stroke-linejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"></path></svg>
            </div>
            <div>
              <h3 class="!text-xl !font-bold !text-slate-800 dark:!text-slate-100">امتیاز یائسگی (Menopause)</h3>
              <p class="!text-sm !text-slate-500 dark:!text-slate-400 !mt-1">ارزیابی شدت علائم یائسگی</p>
            </div>
          </div>

          <div class="!space-y-4 !mb-8">
            <div class="!space-y-2">
              <label class="!text-xs !font-bold !text-slate-700 dark:!text-slate-300 !px-1">سن</label>
              <input v-model.number="menopause.age" type="number" min="0" max="120" class="!w-full !px-4 !py-3 !bg-slate-50 dark:!bg-slate-700 !border !border-slate-200 dark:!border-slate-700 !rounded-xl focus:!bg-white dark:!bg-slate-800 focus:!border-electric-sapphire focus:!ring-4 focus:!ring-light-cyan !transition-all !outline-none !text-slate-800 dark:!text-slate-100" />
            </div>

            <div class="!space-y-6 !pt-4">
              <div v-for="symptom in menopauseSymptoms" :key="symptom.key">
                <div class="!flex !justify-between !text-sm !mb-3">
                  <span class="!font-bold !text-slate-700 dark:!text-slate-300">{{ symptom.label }}</span>
                  <span class="!font-black !text-orange-500 !bg-orange-50 dark:!bg-orange-900/20 !px-3 !py-0.5 !rounded-full">{{ menopause[symptom.key] }}</span>
                </div>
                <input type="range" v-model.number="menopause[symptom.key]" min="0" max="3" step="1" class="!w-full !h-2.5 !bg-slate-200 dark:!bg-slate-700 !rounded-lg !appearance-none !cursor-pointer accent-orange-500 hover:accent-orange-600 !transition-all" />
                <div class="!flex !justify-between !text-[10px] !font-bold !text-slate-400 dark:!text-slate-500 !mt-2 !px-1">
                  <span>بدون</span><span>خفیف</span><span>متوسط</span><span>شدید</span>
                </div>
              </div>
            </div>
          </div>

          <button @click="assessMenopause" :disabled="menopauseLoading" class="!w-full !py-4 !px-6 !bg-orange-500 hover:!bg-orange-600 !text-white !font-extrabold !text-lg !rounded-2xl !shadow-lg !shadow-orange-500/30 !transition-all !flex !justify-center !items-center !gap-3 disabled:!opacity-70 disabled:!cursor-not-allowed">
            <svg v-if="menopauseLoading" class="!w-6 !h-6 !text-white !animate-spin" fill="none" viewBox="0 0 24 24"><circle class="!opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="!opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span v-else>محاسبه امتیاز</span>
          </button>

          <div v-if="menopauseResult" class="!mt-6 !p-5 !rounded-2xl !border !text-center" :class="menopauseResult.score <= 5 ? '!bg-green-50 dark:!bg-green-900/30 !border-green-200 !text-green-800' : menopauseResult.score <= 10 ? '!bg-orange-50 dark:!bg-orange-900/20 !border-orange-200 !text-orange-800 dark:!text-orange-300' : '!bg-red-50 dark:!bg-red-900/30 !border-red-200 !text-red-800'">
            <div class="!inline-block !px-5 !py-1.5 !rounded-full !border-2 !font-black !text-lg !mb-3 !bg-white dark:!bg-slate-800" :class="menopauseResult.score <= 5 ? '!border-green-300' : menopauseResult.score <= 10 ? '!border-orange-300' : '!border-red-300'">
              امتیاز: {{ menopauseResult.score }}
            </div>
            <div class="!text-lg !font-extrabold">{{ menopauseResult.interpretation }}</div>
            <div class="!text-sm !mt-1 !font-medium !opacity-80">{{ menopauseResult.severity }}</div>
          </div>
        </div>
      </div>

      <div class="!bg-white dark:!bg-slate-800 !rounded-3xl !border !border-slate-200/70 dark:!border-slate-700 !shadow-sm !overflow-hidden !transition-all hover:!shadow-md hover:!border-periwinkle dark:hover:!border-electric-sapphire/50">
        <div class="!p-6 md:!p-8">
          <div class="!flex !items-center !gap-4 !mb-8">
            <div class="!w-14 !h-14 !rounded-2xl !bg-pink-50 !text-pink-500 !flex !items-center !justify-center !shadow-inner">
               <svg class="!w-7 !h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <div>
              <h3 class="!text-xl !font-bold !text-slate-800 dark:!text-slate-100">امتیاز بیشاپ (Bishop Score)</h3>
              <p class="!text-sm !text-slate-500 dark:!text-slate-400 !mt-1">ارزیابی آمادگی دهانه رحم برای القای زایمان</p>
            </div>
          </div>

          <div class="!grid !grid-cols-2 !gap-5 !mb-8">
            <div class="!space-y-2">
              <label class="!text-xs !font-bold !text-slate-700 dark:!text-slate-300 !px-1">اتساع (0-5)</label>
              <input v-model.number="bishop.dilation" type="number" min="0" max="5" class="!w-full !px-4 !py-3 !bg-slate-50 dark:!bg-slate-700 !border !border-slate-200 dark:!border-slate-700 !rounded-xl focus:!bg-white dark:!bg-slate-800 focus:!border-electric-sapphire focus:!ring-4 focus:!ring-light-cyan !transition-all !outline-none !text-slate-800 dark:!text-slate-100" />
            </div>
            <div class="!space-y-2">
              <label class="!text-xs !font-bold !text-slate-700 dark:!text-slate-300 !px-1">محو شدن (0-3)</label>
              <input v-model.number="bishop.effacement" type="number" min="0" max="3" class="!w-full !px-4 !py-3 !bg-slate-50 dark:!bg-slate-700 !border !border-slate-200 dark:!border-slate-700 !rounded-xl focus:!bg-white dark:!bg-slate-800 focus:!border-electric-sapphire focus:!ring-4 focus:!ring-light-cyan !transition-all !outline-none !text-slate-800 dark:!text-slate-100" />
            </div>
            <div class="!space-y-2">
              <label class="!text-xs !font-bold !text-slate-700 dark:!text-slate-300 !px-1">استیشن (3- تا 3)</label>
              <input v-model.number="bishop.station" type="number" min="-3" max="3" class="!w-full !px-4 !py-3 !bg-slate-50 dark:!bg-slate-700 !border !border-slate-200 dark:!border-slate-700 !rounded-xl focus:!bg-white dark:!bg-slate-800 focus:!border-electric-sapphire focus:!ring-4 focus:!ring-light-cyan !transition-all !outline-none !text-slate-800 dark:!text-slate-100" />
            </div>
            <div class="!space-y-2">
              <label class="!text-xs !font-bold !text-slate-700 dark:!text-slate-300 !px-1">قوام</label>
              <select v-model="bishop.consistency" class="!w-full !px-4 !py-3 !bg-slate-50 dark:!bg-slate-700 !border !border-slate-200 dark:!border-slate-700 !rounded-xl focus:!bg-white dark:!bg-slate-800 focus:!border-electric-sapphire focus:!ring-4 focus:!ring-light-cyan !transition-all !outline-none !text-slate-800 dark:!text-slate-100 !appearance-none">
                <option v-for="opt in consistencyOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>
            <div class="!space-y-2 !col-span-2 sm:!col-span-1">
              <label class="!text-xs !font-bold !text-slate-700 dark:!text-slate-300 !px-1">موقعیت</label>
              <select v-model="bishop.position" class="!w-full !px-4 !py-3 !bg-slate-50 dark:!bg-slate-700 !border !border-slate-200 dark:!border-slate-700 !rounded-xl focus:!bg-white dark:!bg-slate-800 focus:!border-electric-sapphire focus:!ring-4 focus:!ring-light-cyan !transition-all !outline-none !text-slate-800 dark:!text-slate-100 !appearance-none">
                <option v-for="opt in positionOptions" :key="opt" :value="opt">{{ opt }}</option>
              </select>
            </div>
          </div>

          <button @click="assessBishop" :disabled="bishopLoading" class="!w-full !py-4 !px-6 !bg-pink-500 hover:!bg-pink-600 !text-white !font-extrabold !text-lg !rounded-2xl !shadow-lg !shadow-pink-500/30 !transition-all !flex !justify-center !items-center !gap-3 disabled:!opacity-70 disabled:!cursor-not-allowed">
            <svg v-if="bishopLoading" class="!w-6 !h-6 !text-white !animate-spin" fill="none" viewBox="0 0 24 24"><circle class="!opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="!opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span v-else>محاسبه امتیاز بیشاپ</span>
          </button>

          <div v-if="bishopResult" class="!mt-6 !p-5 !rounded-2xl !border !text-center" :class="bishopResult.score <= 4 ? '!bg-red-50 dark:!bg-red-900/30 !border-red-200 !text-red-800' : bishopResult.score <= 8 ? '!bg-orange-50 dark:!bg-orange-900/20 !border-orange-200 !text-orange-800 dark:!text-orange-300' : '!bg-green-50 dark:!bg-green-900/30 !border-green-200 !text-green-800'">
            <div class="!inline-block !px-5 !py-1.5 !rounded-full !border-2 !font-black !text-lg !mb-3 !bg-white dark:!bg-slate-800" :class="bishopResult.score <= 4 ? '!border-red-300' : bishopResult.score <= 8 ? '!border-orange-300' : '!border-green-300'">
              امتیاز: {{ bishopResult.score }}
            </div>
            <div class="!text-lg !font-extrabold">{{ bishopResult.interpretation }}</div>
            <div class="!text-sm !mt-1 !font-medium !opacity-80">{{ bishopResult.detail }}</div>
          </div>
        </div>
      </div>

      <div class="!bg-white dark:!bg-slate-800 !rounded-3xl !border !border-slate-200/70 dark:!border-slate-700 !shadow-sm !overflow-hidden !transition-all hover:!shadow-md hover:!border-periwinkle dark:hover:!border-electric-sapphire/50 lg:!col-span-2">
        <div class="!p-6 md:!p-8">
          <div class="!flex !items-center !gap-4 !mb-8">
            <div class="!w-14 !h-14 !rounded-2xl !bg-red-50 dark:!bg-red-900/30 !text-red-500 !flex !items-center !justify-center !shadow-inner">
               <svg class="!w-7 !h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
            </div>
            <div>
              <h3 class="!text-xl !font-bold !text-slate-800 dark:!text-slate-100">ریسک سرطان پستان</h3>
              <p class="!text-sm !text-slate-500 dark:!text-slate-400 !mt-1">ارزیابی ریسک ابتلا به سرطان پستان</p>
            </div>
          </div>

          <div class="!grid !grid-cols-1 md:!grid-cols-2 !gap-x-8 !gap-y-6 !mb-8">
            <div class="!space-y-6">
              <div class="!grid !grid-cols-2 !gap-5">
                <div class="!space-y-2">
                  <label class="!text-xs !font-bold !text-slate-700 dark:!text-slate-300 !px-1">سن</label>
                  <input v-model.number="breastCancer.age" type="number" min="0" class="!w-full !px-4 !py-3 !bg-slate-50 dark:!bg-slate-700 !border !border-slate-200 dark:!border-slate-700 !rounded-xl focus:!bg-white dark:!bg-slate-800 focus:!border-electric-sapphire focus:!ring-4 focus:!ring-light-cyan !transition-all !outline-none !text-slate-800 dark:!text-slate-100" />
                </div>
                <div class="!space-y-2">
                  <label class="!text-xs !font-bold !text-slate-700 dark:!text-slate-300 !px-1">سن اولین قاعدگی</label>
                  <input v-model.number="breastCancer.menarche_age" type="number" min="0" class="!w-full !px-4 !py-3 !bg-slate-50 dark:!bg-slate-700 !border !border-slate-200 dark:!border-slate-700 !rounded-xl focus:!bg-white dark:!bg-slate-800 focus:!border-electric-sapphire focus:!ring-4 focus:!ring-light-cyan !transition-all !outline-none !text-slate-800 dark:!text-slate-100" />
                </div>
              </div>

              <div class="!space-y-2 !bg-slate-50 dark:!bg-slate-700 !p-4 !rounded-2xl !border !border-slate-200 dark:!border-slate-700">
                 <label class="!flex !items-center !gap-3 !cursor-pointer !group !mb-3">
                  <div class="!relative !flex !items-center !justify-center">
                    <input type="checkbox" v-model="breastCancer.noLiveBirth" @change="onNoLiveBirthChange($event.target.checked)" class="!peer !sr-only" />
                    <div class="!w-5 !h-5 !border-2 !border-slate-300 !bg-white dark:!bg-slate-800 !rounded-md peer-checked:!bg-red-500 peer-checked:!border-red-500 !transition-colors"></div>
                    <svg class="!absolute !w-3 !h-3 !text-white !opacity-0 peer-checked:!opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <span class="!text-sm !font-bold !text-slate-700 dark:!text-slate-300 group-hover:!text-red-600 !transition-colors">عدم سابقه زایمان</span>
                </label>
                <div class="!space-y-2" :class="breastCancer.noLiveBirth ? '!opacity-50' : ''">
                  <label class="!text-xs !font-bold !text-slate-700 dark:!text-slate-300 !px-1">سن اولین زایمان</label>
                  <input v-model.number="breastCancer.first_live_birth_age" :disabled="breastCancer.noLiveBirth" type="number" min="0" class="!w-full !px-4 !py-3 !bg-white dark:!bg-slate-800 !border !border-slate-200 dark:!border-slate-700 !rounded-xl focus:!border-electric-sapphire focus:!ring-4 focus:!ring-light-cyan !transition-all !outline-none !text-slate-800 dark:!text-slate-100 disabled:!cursor-not-allowed" />
                </div>
              </div>
            </div>

            <div class="!space-y-6">
              <div class="!bg-slate-50 dark:!bg-slate-700 !p-5 !rounded-2xl !border !border-slate-200 dark:!border-slate-700 !space-y-4">
                <label class="!flex !items-center !gap-3 !cursor-pointer !group">
                  <div class="!relative !flex !items-center !justify-center">
                    <input type="checkbox" v-model="breastCancer.family_history_breast_cancer" class="!peer !sr-only" />
                    <div class="!w-5 !h-5 !border-2 !border-slate-300 !bg-white dark:!bg-slate-800 !rounded-md peer-checked:!bg-red-500 peer-checked:!border-red-500 !transition-colors"></div>
                    <svg class="!absolute !w-3 !h-3 !text-white !opacity-0 peer-checked:!opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <span class="!text-sm !font-bold !text-slate-700 dark:!text-slate-300 group-hover:!text-red-600 !transition-colors">سابقه خانوادگی سرطان پستان</span>
                </label>
                <div class="!w-full !h-px !bg-slate-200 dark:!bg-slate-700"></div>
                <label class="!flex !items-center !gap-3 !cursor-pointer !group">
                  <div class="!relative !flex !items-center !justify-center">
                    <input type="checkbox" v-model="breastCancer.previous_biopsy" class="!peer !sr-only" />
                    <div class="!w-5 !h-5 !border-2 !border-slate-300 !bg-white dark:!bg-slate-800 !rounded-md peer-checked:!bg-red-500 peer-checked:!border-red-500 !transition-colors"></div>
                    <svg class="!absolute !w-3 !h-3 !text-white !opacity-0 peer-checked:!opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path></svg>
                  </div>
                  <span class="!text-sm !font-bold !text-slate-700 dark:!text-slate-300 group-hover:!text-red-600 !transition-colors">بیوپسی قبلی پستان</span>
                </label>
              </div>

              <div class="!space-y-2">
                <label class="!text-xs !font-bold !text-slate-700 dark:!text-slate-300 !px-1">جهش BRCA</label>
                <select v-model="breastCancer.brca_mutation" class="!w-full !px-4 !py-3 !bg-slate-50 dark:!bg-slate-700 !border !border-slate-200 dark:!border-slate-700 !rounded-xl focus:!bg-white dark:!bg-slate-800 focus:!border-electric-sapphire focus:!ring-4 focus:!ring-light-cyan !transition-all !outline-none !text-slate-800 dark:!text-slate-100 !appearance-none">
                  <option v-for="opt in brcaOptions" :key="opt.title" :value="opt.value">{{ opt.title }}</option>
                </select>
              </div>
            </div>
          </div>

          <button @click="assessBreastCancer" :disabled="breastCancerLoading" class="!w-full md:!w-1/2 !mx-auto !block !py-4 !px-6 !bg-red-500 hover:!bg-red-600 !text-white !font-extrabold !text-lg !rounded-2xl !shadow-lg !shadow-red-500/30 !transition-all !flex !justify-center !items-center !gap-3 disabled:!opacity-70 disabled:!cursor-not-allowed">
            <svg v-if="breastCancerLoading" class="!w-6 !h-6 !text-white !animate-spin" fill="none" viewBox="0 0 24 24"><circle class="!opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="!opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            <span v-else>ارزیابی ریسک</span>
          </button>

          <div v-if="breastCancerResult" class="!mt-8 !p-6 !rounded-3xl !border !text-center" :class="breastCancerResult.color === 'red-darken-1' ? '!bg-red-50 dark:!bg-red-900/30 !border-red-200 !text-red-800' : breastCancerResult.color === 'orange-darken-1' ? '!bg-orange-50 dark:!bg-orange-900/20 !border-orange-200 !text-orange-800 dark:!text-orange-300' : '!bg-green-50 dark:!bg-green-900/30 !border-green-200 !text-green-800'">
             <div class="!inline-block !px-8 !py-2 !rounded-full !border-2 !font-black !text-xl !mb-4 !bg-white dark:!bg-slate-800" :class="breastCancerResult.color === 'red-darken-1' ? '!border-red-300' : breastCancerResult.color === 'orange-darken-1' ? '!border-orange-300' : '!border-green-300'">
              {{ breastCancerResult.risk }}
            </div>
            <div class="!text-xl !font-extrabold">{{ breastCancerResult.interpretation }}</div>
            <div class="!text-sm !mt-2 !font-medium !opacity-80">{{ breastCancerResult.detail }}</div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const { apiFetch } = useApi()
const { $toast } = useNuxtApp()

// --- PCOS Logic ---
const pcos = reactive({
  oligo_anovulation: false,
  clinical_hyperandrogenism: false,
  biochemical_hyperandrogenism: false,
  polycystic_ovaries_us: false,
  age: 28,
  bmi: 25,
  cycle_length_days: 35,
  hirsutism: false,
  acne: false,
  alopecia: false,
  acanthosis_nigricans: false,
  testosterone_elevated: false,
  dheas_elevated: false,
  free_androgen_index_elevated: false,
  follicle_count_per_ovary: 10,
  ovarian_volume_ml: 8,
  excluded_cah: false,
  excluded_cushing: false,
  excluded_tumor: false,
  notes: '',
})

const pcosLoading = ref(false)
const pcosResult = ref<{
  diagnosis: string
  diagnosed: boolean
  phenotype: string | null
  criteriaMet: number
  criteriaRequired: number
  criteriaDetails: Array<{ key: string; label: string; description: string; met: boolean }>
  recommendation: string
} | null>(null)

const assessPCOS = async () => {
  pcosLoading.value = true
  pcosResult.value = null
  try {
    const res = await apiFetch<any>('/api/clinical/assess/pcos-rotterdam', {
      method: 'POST',
      body: {
        oligo_anovulation: pcos.oligo_anovulation,
        clinical_hyperandrogenism: pcos.hirsutism || pcos.acne || pcos.alopecia || pcos.acanthosis_nigricans,
        biochemical_hyperandrogenism: pcos.testosterone_elevated || pcos.dheas_elevated || pcos.free_androgen_index_elevated,
        polycystic_ovaries_us: pcos.polycystic_ovaries_us,
        age: pcos.age,
        bmi: pcos.bmi,
        cycle_length_days: pcos.cycle_length_days,
        hirsutism: pcos.hirsutism,
        acne: pcos.acne,
        alopecia: pcos.alopecia,
        acanthosis_nigricans: pcos.acanthosis_nigricans,
        testosterone_elevated: pcos.testosterone_elevated,
        dheas_elevated: pcos.dheas_elevated,
        free_androgen_index_elevated: pcos.free_androgen_index_elevated,
        follicle_count_per_ovary: pcos.follicle_count_per_ovary,
        ovarian_volume_ml: pcos.ovarian_volume_ml,
        excluded_cah: pcos.excluded_cah,
        excluded_cushing: pcos.excluded_cushing,
        excluded_tumor: pcos.excluded_tumor,
        notes: pcos.notes,
      },
    })
    if (res.success) {
      const d = res.data
      const crit = d.criteria_met ?? 0
      const req = d.criteria_required ?? 2
      const diagnosed = crit >= req
      pcosResult.value = {
        diagnosis: d.diagnosis || (diagnosed ? 'PCOS تشخیص داده شد' : 'PCOS رد شد'),
        diagnosed,
        phenotype: d.phenotype || null,
        criteriaMet: crit,
        criteriaRequired: req,
        criteriaDetails: [
          {
            key: 'c1',
            label: 'الیگو / آنوولاسیون',
            description: d.details?.criterion_1_oligo_anovulation?.description || 'نامنظمی سیکل قاعدگی',
            met: d.details?.criterion_1_oligo_anovulation?.met ?? pcos.oligo_anovulation,
          },
          {
            key: 'c2',
            label: 'هیپرآندروژنیسم',
            description: d.details?.criterion_2_hyperandrogenism?.description || 'علائم بالینی و/یا بیوشیمیایی',
            met: d.details?.criterion_2_hyperandrogenism?.met ?? (pcos.hirsutism || pcos.acne || pcos.alopecia || pcos.testosterone_elevated || pcos.dheas_elevated || pcos.free_androgen_index_elevated),
          },
          {
            key: 'c3',
            label: 'تخمدان پلی‌کیستیک',
            description: d.details?.criterion_3_polycystic_ovaries?.description || '≥12 فولیکول یا حجم ≥10ml',
            met: d.details?.criterion_3_polycystic_ovaries?.met ?? pcos.polycystic_ovaries_us,
          },
        ],
        recommendation: d.recommendation || '',
      }
    } else {
      $toast.error('خطا در دریافت نتیجه ارزیابی')
    }
  } catch {
    $toast.error('خطا در ارتباط با سرور')
  } finally {
    pcosLoading.value = false
  }
}

// --- Menopause Logic ---
const menopauseSymptoms = [
  { key: 'hot_flashes', label: 'گرگرفتگی' },
  { key: 'night_sweats', label: 'عرق شبانه' },
  { key: 'mood_swings', label: 'نوسانات خلقی' },
  { key: 'vaginal_dryness', label: 'خشکی واژن' },
  { key: 'sleep_disturbance', label: 'اختلال خواب' },
]

const menopause = reactive({
  age: 50,
  hot_flashes: 1,
  night_sweats: 1,
  mood_swings: 1,
  vaginal_dryness: 0,
  sleep_disturbance: 1,
})

const menopauseLoading = ref(false)
const menopauseResult = ref<{ color: string; score: number; interpretation: string; severity: string } | null>(null)

const computedMenopauseScore = () => {
  return menopause.hot_flashes + menopause.night_sweats + menopause.mood_swings + menopause.vaginal_dryness + menopause.sleep_disturbance
}

const assessMenopause = async () => {
  menopauseLoading.value = true
  menopauseResult.value = null
  try {
    const res = await apiFetch<any>('/api/clinical/assess/menopause-score', {
      method: 'POST',
      body: {
        age: menopause.age,
        hot_flashes: menopause.hot_flashes,
        night_sweats: menopause.night_sweats,
        mood_swings: menopause.mood_swings,
        vaginal_dryness: menopause.vaginal_dryness,
        sleep_disturbance: menopause.sleep_disturbance,
      },
    })
    if (res.success) {
      const d = res.data
      const score = d.total_score ?? computedMenopauseScore()
      const sev = d.severity || (score <= 5 ? 'خفیف' : score <= 10 ? 'متوسط' : score <= 15 ? 'شدید' : 'بسیار شدید')
      menopauseResult.value = {
        score,
        interpretation: d.interpretation || `وضعیت ${sev}`,
        severity: sev,
        color: score <= 5 ? 'green-darken-1' : score <= 10 ? 'orange-darken-1' : 'red-darken-1',
      }
    } else {
      $toast.error('خطا در دریافت نتیجه ارزیابی')
    }
  } catch {
    const score = computedMenopauseScore()
    const sev = score <= 5 ? 'خفیف' : score <= 10 ? 'متوسط' : score <= 15 ? 'شدید' : 'بسیار شدید'
    menopauseResult.value = {
      score,
      interpretation: `وضعیت ${sev}`,
      severity: sev,
      color: score <= 5 ? 'green-darken-1' : score <= 10 ? 'orange-darken-1' : 'red-darken-1',
    }
  } finally {
    menopauseLoading.value = false
  }
}

// --- Bishop Score Logic ---
const consistencyOptions = ['firm', 'medium', 'soft']
const positionOptions = ['posterior', 'mid', 'anterior']

const bishop = reactive({
  dilation: 0,
  effacement: 0,
  station: -3,
  consistency: 'medium',
  position: 'mid',
})

const bishopLoading = ref(false)
const bishopResult = ref<{ color: string; score: number; interpretation: string; detail: string } | null>(null)

const assessBishop = async () => {
  bishopLoading.value = true
  bishopResult.value = null
  try {
    const res = await apiFetch<any>('/api/clinical/assess/bishop-score', {
      method: 'POST',
      body: {
        dilation: bishop.dilation,
        effacement: bishop.effacement,
        station: bishop.station,
        consistency: bishop.consistency,
        position: bishop.position,
      },
    })
    if (res.success) {
      const d = res.data
      const score = d.total_score ?? 0
      const interpretation = d.interpretation || (score <= 4 ? 'نامطلوب' : score <= 8 ? 'نسبتاً مطلوب' : 'مطلوب')
      bishopResult.value = {
        score,
        interpretation,
        detail: d.detail || '',
        color: score <= 4 ? 'red-darken-1' : score <= 8 ? 'orange-darken-1' : 'green-darken-1',
      }
    } else {
      $toast.error('خطا در دریافت نتیجه ارزیابی')
    }
  } catch {
    $toast.error('خطا در ارتباط با سرور')
  } finally {
    bishopLoading.value = false
  }
}

// --- Breast Cancer Risk Logic ---
const brcaOptions = [
  { title: 'مشخص نشده', value: null },
  { title: 'مثبت', value: true },
  { title: 'منفی', value: false },
]

const breastCancer = reactive({
  age: 40,
  menarche_age: 13,
  first_live_birth_age: null as number | null,
  noLiveBirth: false,
  family_history_breast_cancer: false,
  previous_biopsy: false,
  brca_mutation: null as boolean | null,
})

const onNoLiveBirthChange = (val: boolean) => {
  if (val) {
    breastCancer.first_live_birth_age = null
  }
}

const breastCancerLoading = ref(false)
const breastCancerResult = ref<{ color: string; icon: string; risk: string; interpretation: string; detail: string } | null>(null)

const assessBreastCancer = async () => {
  breastCancerLoading.value = true
  breastCancerResult.value = null
  try {
    const res = await apiFetch<any>('/api/clinical/assess/breast-cancer-risk', {
      method: 'POST',
      body: {
        age: breastCancer.age,
        menarche_age: breastCancer.menarche_age,
        first_live_birth_age: breastCancer.noLiveBirth ? null : breastCancer.first_live_birth_age,
        family_history_breast_cancer: breastCancer.family_history_breast_cancer,
        previous_biopsy: breastCancer.previous_biopsy,
        brca_mutation: breastCancer.brca_mutation,
      },
    })
    if (res.success) {
      const d = res.data
      const risk = d.risk || d.risk_level || ''
      const riskNorm = risk?.toLowerCase() || ''
      const isHigh = riskNorm.includes('high') || riskNorm.includes('بالا')
      const isModerate = riskNorm.includes('moderate') || riskNorm.includes('متوسط')
      breastCancerResult.value = {
        risk: d.risk || 'نامشخص',
        interpretation: d.interpretation || '',
        detail: d.detail || '',
        color: isHigh ? 'red-darken-1' : isModerate ? 'orange-darken-1' : 'green-darken-1',
        icon: isHigh ? 'mdi-alert-circle' : isModerate ? 'mdi-help-circle' : 'mdi-check-circle',
      }
    } else {
      $toast.error('خطا در دریافت نتیجه ارزیابی')
    }
  } catch {
    $toast.error('خطا در ارتباط با سرور')
  } finally {
    breastCancerLoading.value = false
  }
}

useSeoMeta({ title: 'ابزارهای تصمیم‌گیری بالینی | سیستم کلینیک' })
</script>