<template>
  <UiPageContainer class="!space-y-8">
    <!-- ─── Dashboard Header ─── -->
    <UiPageHeader :title="'داشبورد'" :subtitle="todayPersian">
      <template v-if="!isPatient && canViewDashboard && !loading" #badge>
        <div class="!flex !items-center !gap-2 !px-3 !py-1 !rounded-full !border !border-emerald-500/10 !bg-emerald-500/5 !text-xs !font-medium !text-emerald-600 dark:!text-emerald-400">
          <span class="!w-1.5 !h-1.5 !rounded-full !bg-emerald-500 !animate-pulse !shrink-0" />
          به پنل مدیریت کلینیک خوش آمدید
        </div>
      </template>
    </UiPageHeader>

    <template v-if="loading">
      <UiLoadingSpinner />
    </template>

    <!-- ─── Patient Dashboard ─── -->
    <template v-else-if="isPatient && patientData">
      <!-- Unread Messages Banner -->
      <div
        v-if="patientData.messages.unread > 0"
        class="!relative !overflow-hidden !rounded-2xl !border !border-amber-200/60 dark:!border-amber-900/30 !bg-amber-50/40 dark:!bg-amber-950/10 !p-5 !flex !items-center !justify-between !gap-4"
      >
        <div class="!flex !items-center !gap-4">
          <div class="!relative !shrink-0">
            <div class="!w-10 !h-10 !flex !items-center !justify-center !rounded-xl !bg-amber-500/10 !text-amber-600 dark:!text-amber-400">
              <Bell class="!w-5 !h-5 !fill-current" />
            </div>
            <span class="!absolute -!top-1 -!end-1 !w-4 !h-4 !bg-rose-500 !border-2 !border-white dark:!border-zinc-900 !rounded-full !flex !items-center !justify-center !text-[10px] !font-bold !text-white">
              {{ patientData.messages.unread }}
            </span>
          </div>
          <div class="!flex-1 !min-w-0">
            <p class="!text-sm !font-semibold !text-amber-900 dark:!text-amber-300">
              {{ patientData.messages.unread }} پیام خوانده نشده دارید
            </p>
            <p class="!text-xs !text-amber-700/80 dark:!text-amber-400/60 !mt-0.5">
              برای مشاهده و پاسخ به پیام‌های جدید به بخش پیام‌ها مراجعه کنید.
            </p>
          </div>
        </div>
        <NuxtLink
          to="/patient/messaging"
          class="!shrink-0 !px-4 !py-2 !bg-amber-600 hover:!bg-amber-700 active:!bg-amber-800 !text-white !text-xs !font-medium !rounded-xl !transition-all !duration-200"
        >
          مشاهده پیام‌ها
        </NuxtLink>
      </div>

      <!-- Welcome Card -->
      <div class="!rounded-2xl !bg-gradient-to-br !from-indigo-600 !to-indigo-800 dark:!from-indigo-700 dark:!to-indigo-950 !p-8 !text-white">
        <div class="!flex !items-start !justify-between !gap-6">
          <div class="!space-y-3 !flex-1">
            <h1 class="!text-2xl !font-bold !tracking-tight">
              {{ patientData.patient.first_name ? `خوش آمدید، ${patientData.patient.first_name} عزیز` : 'خوش آمدید' }}
            </h1>
            <p class="!text-indigo-100 !text-sm !leading-relaxed !max-w-lg">
              به پنل کاربری خود خوش آمدید. از اینجا می‌توانید پیام‌های خود را مشاهده کنید، نوبت‌های آتی را ببینید و اطلاعات پرونده خود را به‌روزرسانی کنید.
            </p>
          </div>
          <div class="!shrink-0 !hidden sm:!block">
            <div class="!w-16 !h-16 !rounded-2xl !bg-white/15 !flex !items-center !justify-center !backdrop-blur-sm">
              <Profile class="!w-8 !h-8 !fill-current" />
            </div>
          </div>
        </div>
      </div>

      <!-- ── Stats Cards ── -->
      <div class="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-3 !gap-6">
        <!-- Messages Card -->
        <div class="!relative !rounded-2xl !bg-white dark:!bg-zinc-900 !border !border-slate-100 dark:!border-zinc-800/80 !p-6 !transition-all !duration-300 hover:!shadow-xl hover:!shadow-slate-100/50 dark:hover:!shadow-none hover:!-translate-y-0.5">
          <div class="!flex !items-start !justify-between">
            <div class="!space-y-2">
              <p class="!text-xs !font-medium !text-slate-400 dark:!text-zinc-500">پیام‌ها</p>
              <p class="!text-3xl !font-bold !text-slate-900 dark:!text-white !tracking-tight">
                {{ formatNumber(patientData.messages.total) }}
              </p>
            </div>
            <div class="!p-3 !rounded-xl !bg-amber-50 dark:!bg-amber-950/30 !text-amber-600 dark:!text-amber-400">
              <ChatDots class="!w-5 !h-5 !fill-current" />
            </div>
          </div>
          <div class="!mt-4 !pt-4 !border-t !border-slate-100 dark:!border-zinc-800/80 !flex !items-center !gap-1.5 !text-xs">
            <span v-if="patientData.messages.unread > 0" class="!text-rose-500 dark:!text-rose-400 !font-semibold">
              {{ formatNumber(patientData.messages.unread) }} پیام خوانده نشده
            </span>
            <span v-else class="!text-emerald-500 !font-semibold">هیچ پیام خوانده نشده‌ای ندارید</span>
          </div>
        </div>

        <!-- Appointments Card -->
        <div class="!relative !rounded-2xl !bg-white dark:!bg-zinc-900 !border !border-slate-100 dark:!border-zinc-800/80 !p-6 !transition-all !duration-300 hover:!shadow-xl hover:!shadow-slate-100/50 dark:hover:!shadow-none hover:!-translate-y-0.5">
          <div class="!flex !items-start !justify-between">
            <div class="!space-y-2">
              <p class="!text-xs !font-medium !text-slate-400 dark:!text-zinc-500">نوبت‌های پیش رو</p>
              <p class="!text-3xl !font-bold !text-slate-900 dark:!text-white !tracking-tight">
                {{ formatNumber(patientData.appointments.length) }}
              </p>
            </div>
            <div class="!p-3 !rounded-xl !bg-emerald-50 dark:!bg-emerald-950/30 !text-emerald-600 dark:!text-emerald-400">
              <Calendar class="!w-5 !h-5 !fill-current" />
            </div>
          </div>
          <div class="!mt-4 !pt-4 !border-t !border-slate-100 dark:!border-zinc-800/80 !text-xs !text-slate-400 dark:!text-zinc-500">
            نوبت‌های فعال و آتی شما
          </div>
        </div>

        <!-- Profile Status Card -->
        <div class="!relative !rounded-2xl !bg-white dark:!bg-zinc-900 !border !border-slate-100 dark:!border-zinc-800/80 !p-6 !transition-all !duration-300 hover:!shadow-xl hover:!shadow-slate-100/50 dark:hover:!shadow-none hover:!-translate-y-0.5">
          <div class="!flex !items-start !justify-between">
            <div class="!space-y-2">
              <p class="!text-xs !font-medium !text-slate-400 dark:!text-zinc-500">وضعیت پرونده</p>
              <p class="!text-sm !font-semibold !text-slate-900 dark:!text-white !tracking-tight">
                {{ profileComplete ? 'تکمیل شده' : 'ناقص' }}
              </p>
            </div>
            <div class="!p-3 !rounded-xl !bg-violet-50 dark:!bg-violet-950/30 !text-violet-600 dark:!text-violet-400">
              <DocumentText class="!w-5 !h-5 !fill-current" />
            </div>
          </div>
          <div class="!mt-4 !pt-4 !border-t !border-slate-100 dark:!border-zinc-800/80 !flex !items-center !gap-1.5 !text-xs">
            <span v-if="profileComplete" class="!text-emerald-500 !font-semibold">مشخصات شما کامل است</span>
            <span v-else class="!text-amber-500 !font-semibold">برای تکمیل پرونده کلیک کنید</span>
          </div>
        </div>
      </div>

      <!-- ── Upcoming Appointments ── -->
      <section>
        <div class="!flex !items-center !gap-2 !mb-6">
          <div class="!w-1 !h-4 !rounded-full !bg-emerald-600 dark:!bg-emerald-500" />
          <h2 class="!text-xs !font-semibold !text-slate-400 dark:!text-zinc-500 !uppercase !tracking-wider">نوبت‌های پیش رو</h2>
        </div>

        <div class="!rounded-2xl !bg-white dark:!bg-zinc-900 !border !border-slate-100 dark:!border-zinc-800/80 !overflow-hidden">
          <div v-if="!patientData.appointments.length" class="!py-16 !text-center">
            <Calendar class="!w-10 !h-10 !text-slate-300 dark:!text-zinc-600 !fill-current !mx-auto !mb-4" />
            <p class="!text-sm !font-semibold !text-slate-500 dark:!text-zinc-400">نوبتی ثبت نشده است</p>
            <p class="!text-xs !text-slate-400 dark:!text-zinc-500 !mt-2">نوبت‌های آتی شما در این قسمت نمایش داده می‌شوند.</p>
          </div>

          <div v-else class="!divide-y !divide-slate-100/60 dark:!divide-zinc-800/60">
            <div
              v-for="appt in patientData.appointments"
              :key="appt.id"
              class="!p-5 !flex !items-center !justify-between !gap-4 hover:!bg-slate-50/50 dark:hover:!bg-zinc-800/20 !transition-all"
            >
              <div class="!flex !items-center !gap-6">
                <div class="!flex !flex-col !items-center !justify-center !px-4 !py-2 !rounded-xl !bg-emerald-50 dark:!bg-emerald-950/20 !border !border-emerald-100 dark:!border-emerald-900/30 !min-w-[80px]">
                  <span class="!text-lg !font-bold !text-emerald-700 dark:!text-emerald-400">
                    {{ formatJalaliDate(appt.date) }}
                  </span>
                  <span class="!text-[10px] !text-emerald-500 dark:!text-emerald-500 !mt-0.5">
                    {{ appt.time ? appt.time.slice(0, 5) : '---' }}
                  </span>
                </div>

                <div class="!space-y-1">
                  <h4 class="!text-sm !font-semibold !text-slate-900 dark:!text-white">
                    {{ appt.doctor_name || 'پزشک' }}
                  </h4>
                  <p class="!text-xs !text-slate-400 dark:!text-zinc-500">
                    {{ appt.status ? statusLabel(appt.status) : 'در انتظار تایید' }}
                  </p>
                </div>
              </div>

              <UiStatusBadge :status="appt.status || 'pending'" />
            </div>
          </div>
        </div>
      </section>

      <!-- ── Patient Profile Info ── -->
      <section>
        <div class="!flex !items-center !gap-2 !mb-6">
          <div class="!w-1 !h-4 !rounded-full !bg-indigo-600 dark:!bg-indigo-500" />
          <h2 class="!text-xs !font-semibold !text-slate-400 dark:!text-zinc-500 !uppercase !tracking-wider">اطلاعات پرونده</h2>
        </div>

        <div class="!rounded-2xl !bg-white dark:!bg-zinc-900 !border !border-slate-100 dark:!border-zinc-800/80 !overflow-hidden">
          <div class="!p-6 !space-y-5">
            <div class="!grid !grid-cols-1 md:!grid-cols-2 lg:!grid-cols-3 !gap-5">
              <div>
                <p class="!text-[11px] !font-medium !text-slate-400 dark:!text-zinc-500 !mb-1">نام</p>
                <p class="!text-sm !font-semibold !text-slate-800 dark:!text-zinc-200">
                  {{ patientData.patient.first_name || '---' }} {{ patientData.patient.last_name || '' }}
                </p>
              </div>
              <div>
                <p class="!text-[11px] !font-medium !text-slate-400 dark:!text-zinc-500 !mb-1">کد ملی</p>
                <p class="!text-sm !font-semibold !text-slate-800 dark:!text-zinc-200" dir="ltr">{{ patientData.patient.national_id || '---' }}</p>
              </div>
              <div>
                <p class="!text-[11px] !font-medium !text-slate-400 dark:!text-zinc-500 !mb-1">تلفن همراه</p>
                <p class="!text-sm !font-semibold !text-slate-800 dark:!text-zinc-200" dir="ltr">{{ patientData.patient.phone || '---' }}</p>
              </div>
              <div>
                <p class="!text-[11px] !font-medium !text-slate-400 dark:!text-zinc-500 !mb-1">تاریخ تولد</p>
                <p class="!text-sm !font-semibold !text-slate-800 dark:!text-zinc-200">{{ formatJalaliDate(patientData.patient.birth_date) }}</p>
              </div>
              <div>
                <p class="!text-[11px] !font-medium !text-slate-400 dark:!text-zinc-500 !mb-1">بیمه</p>
                <p class="!text-sm !font-semibold !text-slate-800 dark:!text-zinc-200">{{ insuranceLabel(patientData.patient.insurance_type) }}</p>
              </div>
              <div>
                <p class="!text-[11px] !font-medium !text-slate-400 dark:!text-zinc-500 !mb-1">آدرس</p>
                <p class="!text-sm !font-semibold !text-slate-800 dark:!text-zinc-200">{{ patientData.patient.address || '---' }}</p>
              </div>
            </div>
          </div>

          <div class="!px-6 !py-4 !bg-slate-50/50 dark:!bg-zinc-800/30 !border-t !border-slate-100 dark:!border-zinc-800/80 !flex !items-center !justify-between">
            <p class="!text-xs !text-slate-400 dark:!text-zinc-500">
              {{ profileComplete ? 'پرونده شما کامل است' : 'برخی اطلاعات مانند تلفن، آدرس یا بیمه ثبت نشده است' }}
            </p>
            <button
              class="!shrink-0 !px-5 !py-2 !bg-indigo-600 hover:!bg-indigo-700 active:!bg-indigo-800 !text-white !text-xs !font-medium !rounded-xl !transition-all !duration-200 !flex !items-center !gap-2"
              @click="openEditDialog"
            >
              <v-icon size="16" color="white">mdi-pencil-outline</v-icon>
              ویرایش اطلاعات
            </button>
          </div>
        </div>
      </section>

      <!-- ── Edit Profile Dialog ── -->
      <v-dialog v-model="editDialogOpen" max-width="600" persistent scrollable transition="dialog-bottom-transition" @keydown.esc="editDialogOpen = false">
        <v-card class="crm-dialog overflow-hidden!" elevation="0">
          <div class="crm-dialog-header">
            <div>
              <h2 class="crm-dialog-title text-xl!">ویرایش اطلاعات پرونده</h2>
              <span class="!text-xs !text-slate-500 dark:!text-slate-400 !mt-1 !block !font-normal">تکمیل اطلاعات تماس و بیمه</span>
            </div>
            <v-btn icon variant="text" size="small" class="!text-slate-400 hover:!text-slate-800" @click="editDialogOpen = false">
              <CloseCircle class="!w-6 !h-6 !fill-slate-600! dark:!fill-slate-200!" />
            </v-btn>
          </div>

          <v-card-text class="!p-8 !bg-slate-50/30 dark:!bg-slate-900/30">
            <div class="!space-y-5">
              <div>
                <label class="!text-xs !font-medium !text-slate-600 dark:!text-zinc-400 !mb-1.5 !block">تلفن همراه</label>
                <v-text-field
                  v-model="editForm.phone"
                  variant="outlined"
                  density="comfortable"
                  placeholder="09123456789"
                  dir="ltr"
                  hide-details
                  class="!rounded-xl"
                />
              </div>
              <div>
                <label class="!text-xs !font-medium !text-slate-600 dark:!text-zinc-400 !mb-1.5 !block">آدرس</label>
                <v-textarea
                  v-model="editForm.address"
                  variant="outlined"
                  density="comfortable"
                  placeholder="تهران، خیابان ..."
                  rows="2"
                  hide-details
                  class="!rounded-xl"
                />
              </div>
              <div>
                <label class="!text-xs !font-medium !text-slate-600 dark:!text-zinc-400 !mb-1.5 !block">نوع بیمه</label>
                <v-select
                  v-model="editForm.insurance_type"
                  :items="insuranceOptions"
                  item-title="label"
                  item-value="key"
                  variant="outlined"
                  density="comfortable"
                  placeholder="نوع بیمه خود را انتخاب کنید"
                  hide-details
                  class="!rounded-xl"
                />
              </div>
            </div>
          </v-card-text>

          <v-card-actions class="!px-8 !py-4 !border-t !border-slate-100 dark:!border-zinc-800">
            <v-spacer />
            <button class="crm-btn crm-btn-ghost" @click="editDialogOpen = false">انصراف</button>
            <button class="crm-btn crm-btn-accent" :disabled="saving" @click="saveProfile">
              {{ saving ? 'در حال ذخیره...' : 'ذخیره تغییرات' }}
            </button>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </template>

    <!-- ─── Restricted Access (non-patient, non-admin) ─── -->
    <template v-else-if="!isPatient && !canViewDashboard">
      <UiEmptyState title="دسترسی محدود" description="شما دسترسی لازم برای مشاهده داشبورد را ندارید.">
        <template #icon>
          <ShieldCheck class="!w-8 !h-8 !text-slate-300 dark:!text-zinc-600 !fill-current" />
        </template>
      </UiEmptyState>
    </template>

    <!-- ─── Full Dashboard ─── -->
    <template v-else-if="data">
      <!-- Unread Messages Banner -->
      <div
        v-if="data.messages.unread > 0"
        class="!relative !overflow-hidden !rounded-2xl !border !border-amber-200/60 dark:!border-amber-900/30 !bg-amber-50/40 dark:!bg-amber-950/10 !p-5 !flex !items-center !justify-between !gap-4"
      >
        <div class="!flex !items-center !gap-4">
          <div class="!relative !shrink-0">
            <div class="!w-10 !h-10 !flex !items-center !justify-center !rounded-xl !bg-amber-500/10 !text-amber-600 dark:!text-amber-400">
              <Bell class="!w-5 !h-5 !fill-current" />
            </div>
            <span class="!absolute -!top-1 -!end-1 !w-4 !h-4 !bg-rose-500 !border-2 !border-white dark:!border-zinc-900 !rounded-full !flex !items-center !justify-center !text-[10px] !font-bold !text-white">
              {{ data.messages.unread }}
            </span>
          </div>
          <div class="!flex-1 !min-w-0">
            <p class="!text-sm !font-semibold !text-amber-900 dark:!text-amber-300">
              {{ data.messages.unread }} پیام خوانده نشده دارید
            </p>
            <p class="!text-xs !text-amber-700/80 dark:!text-amber-400/60 !mt-0.5">
              برای مشاهده و پاسخ به پیام‌های جدید به بخش پیام‌ها مراجعه کنید.
            </p>
          </div>
        </div>
        <NuxtLink
          to="/messaging"
          class="!shrink-0 !px-4 !py-2 !bg-amber-600 hover:!bg-amber-700 active:!bg-amber-800 !text-white !text-xs !font-medium !rounded-xl !transition-all !duration-200"
        >
          مشاهده پیام‌ها
        </NuxtLink>
      </div>

      <!-- ── Key Metrics ── -->
      <section>
        <div class="!flex !items-center !gap-2 !mb-6">
          <div class="!w-1 !h-4 !rounded-full !bg-indigo-600 dark:!bg-indigo-500" />
          <h2 class="!text-xs !font-semibold !text-slate-400 dark:!text-zinc-500 !uppercase !tracking-wider">آمار کلی</h2>
        </div>
        
        <div class="!grid !grid-cols-1 sm:!grid-cols-2 lg:!grid-cols-4 !gap-6">
          <!-- Total Patients Card -->
          <div class="!relative !rounded-2xl !bg-white dark:!bg-zinc-900 !border !border-slate-100 dark:!border-zinc-800/80 !p-6 !transition-all !duration-300 hover:!shadow-xl hover:!shadow-slate-100/50 dark:hover:!shadow-none hover:!-translate-y-0.5">
            <div class="!flex !items-start !justify-between">
              <div class="!space-y-2">
                <p class="!text-xs !font-medium !text-slate-400 dark:!text-zinc-500">کل بیماران</p>
                <p class="!text-3xl !font-bold !text-slate-900 dark:!text-white !tracking-tight">
                  {{ formatNumber(data.patients.total) }}
                </p>
              </div>
              <div class="!p-3 !rounded-xl !bg-indigo-50 dark:!bg-indigo-950/30 !text-indigo-600 dark:!text-indigo-400">
                <UsersGroup class="!w-5 !h-5 !fill-current" />
              </div>
            </div>
            <div class="!mt-4 !pt-4 !border-t !border-slate-100 dark:!border-zinc-800/80 !flex !items-center !gap-1.5 !text-xs !text-slate-400 dark:!text-zinc-500">
              <span class="!inline-block !w-1.5 !h-1.5 !rounded-full !bg-emerald-500" />
              <span>+{{ formatNumber(data.patients.yesterday) }} دیروز</span>
            </div>
          </div>

          <!-- Appointments Card -->
          <div class="!relative !rounded-2xl !bg-white dark:!bg-zinc-900 !border !border-slate-100 dark:!border-zinc-800/80 !p-6 !transition-all !duration-300 hover:!shadow-xl hover:!shadow-slate-100/50 dark:hover:!shadow-none hover:!-translate-y-0.5">
            <div class="!flex !items-start !justify-between">
              <div class="!space-y-2">
                <p class="!text-xs !font-medium !text-slate-400 dark:!text-zinc-500">نوبت‌های امروز</p>
                <p class="!text-3xl !font-bold !text-slate-900 dark:!text-white !tracking-tight">
                  {{ formatNumber(data.appointments.today) }}
                </p>
              </div>
              <div class="!p-3 !rounded-xl !bg-emerald-50 dark:!bg-emerald-950/30 !text-emerald-600 dark:!text-emerald-400">
                <Calendar class="!w-5 !h-5 !fill-current" />
              </div>
            </div>
            <div class="!mt-4 !pt-4 !border-t !border-slate-100 dark:!border-zinc-800/80 !flex !items-center !gap-3 !text-xs !text-slate-400 dark:!text-zinc-500">
              <span>دیروز: {{ formatNumber(data.appointments.yesterday) }}</span>
              <span class="!w-1 !h-1 !rounded-full !bg-slate-200 dark:!bg-zinc-700" />
              <span>فردا: {{ formatNumber(data.appointments.tomorrow) }}</span>
            </div>
          </div>

          <!-- Messages Card -->
          <div class="!relative !rounded-2xl !bg-white dark:!bg-zinc-900 !border !border-slate-100 dark:!border-zinc-800/80 !p-6 !transition-all !duration-300 hover:!shadow-xl hover:!shadow-slate-100/50 dark:hover:!shadow-none hover:!-translate-y-0.5">
            <div class="!flex !items-start !justify-between">
              <div class="!space-y-2">
                <p class="!text-xs !font-medium !text-slate-400 dark:!text-zinc-500">پیام‌های امروز</p>
                <p class="!text-3xl !font-bold !text-slate-900 dark:!text-white !tracking-tight">
                  {{ formatNumber(data.messages.today) }}
                </p>
              </div>
              <div class="!p-3 !rounded-xl !bg-amber-50 dark:!bg-amber-950/30 !text-amber-600 dark:!text-amber-400">
                <ChatDots class="!w-5 !h-5 !fill-current" />
              </div>
            </div>
            <div class="!mt-4 !pt-4 !border-t !border-slate-100 dark:!border-zinc-800/80 !flex !items-center !gap-3 !text-xs !text-slate-400 dark:!text-zinc-500">
              <span>دیروز: {{ formatNumber(data.messages.yesterday) }}</span>
              <span class="!w-1 !h-1 !rounded-full !bg-slate-200 dark:!bg-zinc-700" />
              <span v-if="data.messages.unread > 0" class="!text-rose-500 dark:!text-rose-400 !font-semibold">
                {{ formatNumber(data.messages.unread) }} نخوانده
              </span>
              <span v-else>0 نخوانده</span>
            </div>
          </div>

          <!-- Visits Card -->
          <div class="!relative !rounded-2xl !bg-white dark:!bg-zinc-900 !border !border-slate-100 dark:!border-zinc-800/80 !p-6 !transition-all !duration-300 hover:!shadow-xl hover:!shadow-slate-100/50 dark:hover:!shadow-none hover:!-translate-y-0.5">
            <div class="!flex !items-start !justify-between">
              <div class="!space-y-2">
                <p class="!text-xs !font-medium !text-slate-400 dark:!text-zinc-500">ویزیت‌های امروز</p>
                <p class="!text-3xl !font-bold !text-slate-900 dark:!text-white !tracking-tight">
                  {{ formatNumber(data.visits.today) }}
                </p>
              </div>
              <div class="!p-3 !rounded-xl !bg-rose-50 dark:!bg-rose-950/30 !text-rose-600 dark:!text-rose-400">
                <HeartPulse class="!w-5 !h-5 !fill-current" />
              </div>
            </div>
            <div class="!mt-4 !pt-4 !border-t !border-slate-100 dark:!border-zinc-800/80 !flex !items-center !gap-3 !text-xs !text-slate-400 dark:!text-zinc-500">
              <span>دیروز: {{ formatNumber(data.visits.yesterday) }}</span>
              <span class="!w-1 !h-1 !rounded-full !bg-slate-200 dark:!bg-zinc-700" />
              <span>کل: {{ formatNumber(data.visits.total) }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Resource Status ── -->
      <section>
        <div class="!flex !items-center !gap-2 !mb-6">
          <div class="!w-1 !h-4 !rounded-full !bg-violet-600 dark:!bg-violet-500" />
          <h2 class="!text-xs !font-semibold !text-slate-400 dark:!text-zinc-500 !uppercase !tracking-wider">وضعیت منابع</h2>
        </div>

        <div class="!grid !grid-cols-1 lg:!grid-cols-2 !gap-6">
          <!-- SMS Credit -->
          <div class="!rounded-2xl !bg-white dark:!bg-zinc-900 !border !border-slate-100 dark:!border-zinc-800/80 !p-6">
            <div class="!flex !items-center !gap-3 !mb-6">
              <div class="!p-2.5 !rounded-xl !bg-indigo-50 dark:!bg-indigo-950/30 !text-indigo-600 dark:!text-indigo-400">
                <ChatDots class="!w-5 !h-5 !fill-current" />
              </div>
              <div>
                <h3 class="!text-sm !font-semibold !text-slate-800 dark:!text-zinc-200">اعتبار پیامک</h3>
                <p class="!text-xs !text-slate-400 dark:!text-zinc-500">وضعیت کلی لوکال پنل سامانه</p>
              </div>
            </div>

            <div v-if="smsAvailable" class="!space-y-4">
              <div class="!flex !items-baseline !justify-between">
                <span class="!text-2xl !font-bold !text-slate-900 dark:!text-white !tracking-tight" dir="ltr">
                  {{ formatNumber(data.sms_credit!.remaining) }}
                </span>
                <span class="!text-xs !text-slate-400 dark:!text-zinc-500">
                  از {{ formatNumber(data.sms_credit!.sent + data.sms_credit!.remaining) }} پیامک
                </span>
              </div>

              <div class="!relative !h-1.5 !bg-slate-100 dark:!bg-zinc-800 !rounded-full !overflow-hidden">
                <div
                  class="!h-full !rounded-full !transition-all !duration-1000 !ease-out"
                  :class="smsPercent > 20 ? '!bg-indigo-600 dark:!bg-indigo-500' : smsPercent > 5 ? '!bg-amber-500' : '!bg-rose-500'"
                  :style="{ width: smsPercent + '%' }"
                />
              </div>

              <div class="!flex !items-center !justify-between !text-xs">
                <span
                  class="!font-medium !px-2.5 !py-0.5 !rounded-full"
                  :class="smsPercent > 20 ? '!bg-emerald-500/5 !text-emerald-600 dark:!text-emerald-400' : smsPercent > 5 ? '!bg-amber-500/5 !text-amber-600 dark:!text-amber-400' : '!bg-rose-500/5 !text-rose-600 dark:!text-rose-400'"
                >
                  {{ smsPercent }}% باقی‌مانده
                </span>
                <span class="!text-slate-400 dark:!text-zinc-500">
                  {{ formatNumber(data.sms_credit!.sent) }} ارسال شده
                </span>
              </div>
            </div>

            <div v-else class="!text-center !py-6">
              <p class="!text-xs !text-slate-400 dark:!text-zinc-500">اطلاعات اعتبار پیامک در دسترس نیست</p>
            </div>
          </div>

          <!-- Storage -->
          <div class="!rounded-2xl !bg-white dark:!bg-zinc-900 !border !border-slate-100 dark:!border-zinc-800/80 !p-6">
            <div class="!flex !items-center !gap-3 !mb-6">
              <div class="!p-2.5 !rounded-xl !bg-indigo-50 dark:!bg-indigo-950/30 !text-indigo-600 dark:!text-indigo-400">
                <DocumentText class="!w-5 !h-5 !fill-current" />
              </div>
              <div>
                <h3 class="!text-sm !font-semibold !text-slate-800 dark:!text-zinc-200">فضای ذخیره‌سازی</h3>
                <p class="!text-xs !text-slate-400 dark:!text-zinc-500">حجم استفاده شده از فایل‌های کلینیک</p>
              </div>
            </div>

            <div class="!space-y-4">
              <div class="!flex !items-baseline !justify-between">
                <span class="!text-2xl !font-bold !text-slate-900 dark:!text-white !tracking-tight">
                  {{ data.storage.usedFormatted }}
                </span>
                <span class="!text-xs !text-slate-400 dark:!text-zinc-500">کل ظرفیت تخصیص یافته</span>
              </div>

              <div class="!relative !h-1.5 !bg-slate-100 dark:!bg-zinc-800 !rounded-full !overflow-hidden">
                <div
                  class="!h-full !rounded-full !bg-indigo-600 dark:!bg-indigo-500 !transition-all !duration-1000 !ease-out"
                  :style="{ width: storagePercent + '%' }"
                />
              </div>

              <div class="!flex !items-center !justify-between !text-xs">
                <span class="!font-medium !px-2.5 !py-0.5 !rounded-full !bg-indigo-500/5 !text-indigo-600 dark:!text-indigo-400">
                  {{ storagePercent }}% استفاده شده
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── Daily Breakdowns ── -->
      <section>
        <div class="!flex !items-center !gap-2 !mb-6">
          <div class="!w-1 !h-4 !rounded-full !bg-emerald-600 dark:!bg-emerald-500" />
          <h2 class="!text-xs !font-semibold !text-slate-400 dark:!text-zinc-500 !uppercase !tracking-wider">گزارش‌های روزانه</h2>
        </div>

        <div class="!grid !grid-cols-1 lg:!grid-cols-3 !gap-6">
          <!-- Patients Breakdown -->
          <UiContentCard title="بیماران" class="!bg-white dark:!bg-zinc-900 !border !border-slate-100 dark:!border-zinc-800/80 !rounded-2xl">
            <template #headerAction>
              <NuxtLink to="/patients" class="!text-xs !font-medium !text-indigo-600 dark:!text-indigo-400 hover:!underline">
                مشاهده همه &larr;
              </NuxtLink>
            </template>
            <div class="!divide-y !divide-slate-100/60 dark:!divide-zinc-800/60">
              <BreakdownRow label="دیروز" :value="data.patients.yesterday" class="!p-4" />
              <BreakdownRow label="امروز" :value="data.patients.today" highlight class="!p-4 !bg-slate-50/40 dark:!bg-zinc-800/20" />
              <BreakdownRow label="فردا" :value="data.patients.tomorrow" muted class="!p-4" />
            </div>
          </UiContentCard>

          <!-- Appointments Breakdown -->
          <UiContentCard title="نوبت‌ها" class="!bg-white dark:!bg-zinc-900 !border !border-slate-100 dark:!border-zinc-800/80 !rounded-2xl">
            <template #headerAction>
              <NuxtLink to="/appointments" class="!text-xs !font-medium !text-indigo-600 dark:!text-indigo-400 hover:!underline">
                مشاهده همه &larr;
              </NuxtLink>
            </template>
            <div class="!divide-y !divide-slate-100/60 dark:!divide-zinc-800/60">
              <BreakdownRow label="دیروز" :value="data.appointments.yesterday" class="!p-4" />
              <BreakdownRow label="امروز" :value="data.appointments.today" highlight class="!p-4 !bg-slate-50/40 dark:!bg-zinc-800/20" />
              <BreakdownRow label="فردا" :value="data.appointments.tomorrow" class="!p-4" />
            </div>
          </UiContentCard>

          <!-- Messages Breakdown -->
          <UiContentCard title="پیام‌ها" class="!bg-white dark:!bg-zinc-900 !border !border-slate-100 dark:!border-zinc-800/80 !rounded-2xl">
            <template #headerAction>
              <NuxtLink to="/messaging" class="!text-xs !font-medium !text-indigo-600 dark:!text-indigo-400 hover:!underline">
                مشاهده همه &larr;
              </NuxtLink>
            </template>
            <div class="!divide-y !divide-slate-100/60 dark:!divide-zinc-800/60">
              <BreakdownRow label="دیروز" :value="data.messages.yesterday" class="!p-4" />
              <BreakdownRow label="امروز" :value="data.messages.today" highlight class="!p-4 !bg-slate-50/40 dark:!bg-zinc-800/20" />
              <BreakdownRow label="فردا" :value="data.messages.tomorrow" muted class="!p-4" />
              <div class="!flex !items-center !justify-between !px-4 !py-3.5">
                <span class="!text-xs !font-medium !text-slate-500 dark:!text-zinc-400">خوانده نشده</span>
                <span v-if="data.messages.unread > 0" class="!inline-flex !items-center !gap-1.5 !px-2.5 !py-0.5 !bg-rose-500/5 !text-rose-600 dark:!text-rose-400 !text-xs !font-semibold !rounded-full">
                  <span class="!w-1 !h-1 !rounded-full !bg-rose-500 !animate-pulse" />
                  {{ data.messages.unread }} پیام
                </span>
                <span v-else class="!text-xs !font-medium !text-emerald-600 dark:!text-emerald-400">0</span>
              </div>
            </div>
          </UiContentCard>
        </div>
      </section>

      <!-- ── Visits + Billing ── -->
      <section>
        <div class="!flex !items-center !gap-2 !mb-6">
          <div class="!w-1 !h-4 !rounded-full !bg-amber-600 dark:!bg-amber-500" />
          <h2 class="!text-xs !font-semibold !text-slate-400 dark:!text-zinc-500 !uppercase !tracking-wider">گزارش‌های تکمیلی</h2>
        </div>

        <div class="!grid !grid-cols-1 lg:!grid-cols-2 !gap-6">
          <!-- Site Visits -->
          <UiContentCard title="بازدیدهای سایت" class="!bg-white dark:!bg-zinc-900 !border !border-slate-100 dark:!border-zinc-800/80 !rounded-2xl">
            <div class="!p-6">
              <div class="!grid !grid-cols-3 !gap-4">
                <div class="!text-center !p-4 !rounded-xl !border !border-slate-100 dark:!border-zinc-800/80">
                  <div class="!text-xl !font-bold !text-slate-900 dark:!text-white !mb-1">{{ formatNumber(data.visits.total) }}</div>
                  <div class="!text-[11px] !font-medium !text-slate-400 dark:!text-zinc-500">کل بازدیدها</div>
                </div>
                <div class="!text-center !p-4 !rounded-xl !border !border-slate-100 dark:!border-zinc-800/80">
                  <div class="!text-xl !font-bold !text-slate-700 dark:!text-zinc-300 !mb-1">{{ formatNumber(data.visits.yesterday) }}</div>
                  <div class="!text-[11px] !font-medium !text-slate-400 dark:!text-zinc-500">دیروز</div>
                </div>
                <div class="!text-center !p-4 !rounded-xl !border !border-indigo-500/10 !bg-indigo-500/5">
                  <div class="!text-xl !font-bold !text-indigo-600 dark:!text-indigo-400 !mb-1">{{ formatNumber(data.visits.today) }}</div>
                  <div class="!text-[11px] !font-medium !text-indigo-600/80 dark:!text-indigo-400">امروز</div>
                </div>
              </div>
            </div>
          </UiContentCard>

          <!-- Billing Summary -->
          <UiContentCard title="خلاصه مالی" class="!bg-white dark:!bg-zinc-900 !border !border-slate-100 dark:!border-zinc-800/80 !rounded-2xl">
            <template #headerAction>
              <NuxtLink to="/billing" class="!text-xs !font-medium !text-indigo-600 dark:!text-indigo-400 hover:!underline">
                مشاهده همه &larr;
              </NuxtLink>
            </template>
            <div class="!p-6 !space-y-5">
              <div class="!grid !grid-cols-2 !gap-4">
                <div class="!p-4 !rounded-xl !border !border-emerald-500/10 !bg-emerald-500/5">
                  <div class="!flex !items-center !gap-1.5 !mb-1">
                    <span class="!w-1 !h-1 !rounded-full !bg-emerald-500" />
                    <span class="!text-[11px] !font-medium !text-emerald-600 dark:!text-emerald-400">درآمد کل</span>
                  </div>
                  <div class="!text-lg !font-bold !text-emerald-700 dark:!text-emerald-400" dir="ltr">{{ formatToman(data.billing.total_revenue) }}</div>
                </div>
                
                <div class="!p-4 !rounded-xl !border !border-amber-500/10 !bg-amber-500/5">
                  <div class="!flex !items-center !gap-1.5 !mb-1">
                    <span class="!w-1 !h-1 !rounded-full !bg-amber-500" />
                    <span class="!text-[11px] !font-medium !text-amber-600 dark:!text-amber-400">در انتظار پرداخت</span>
                  </div>
                  <div class="!text-lg !font-bold !text-amber-700 dark:!text-amber-400" dir="ltr">{{ formatToman(data.billing.pending_revenue) }}</div>
                </div>
              </div>

              <div class="!flex !items-center !justify-between !text-xs !text-slate-400 dark:!text-zinc-500 !pt-4 !border-t !border-slate-100 dark:!border-zinc-800/80">
                <span>صورتحساب‌ها: <strong class="!text-slate-700 dark:!text-zinc-300">{{ data.billing.total }}</strong></span>
                <span>پرداخت شده: <strong class="!text-emerald-600 dark:!text-emerald-400">{{ data.billing.paid }}</strong></span>
                <span>در انتظار: <strong class="!text-amber-600 dark:!text-amber-400">{{ data.billing.pending }}</strong></span>
              </div>
            </div>
          </UiContentCard>
        </div>
      </section>
    </template>

    <!-- ─── Doctor Schedule Block ─── -->
    <template v-if="hasSchedule && data">
      <section>
        <div class="!flex !items-center !gap-2 !mb-6">
          <div class="!w-1 !h-4 !rounded-full !bg-indigo-600 dark:!bg-indigo-500" />
          <h2 class="!text-xs !font-semibold !text-slate-400 dark:!text-zinc-500 !uppercase !tracking-wider">برنامه امروز شما</h2>
        </div>

        <div class="!rounded-2xl !bg-white dark:!bg-zinc-900 !border !border-slate-100 dark:!border-zinc-800/80 !overflow-hidden">
          <UiLoadingSpinner v-if="loadingSchedule" class="!my-8" />

          <UiEmptyState
            v-else-if="!todayAppointments.length"
            title="هیچ نوبتی برای امروز ثبت نشده است"
            description="برنامه امروز شما خالی است."
            class="!py-12"
          >
            <template #icon>
              <Calendar class="!w-8 !h-8 !text-slate-300 dark:!text-zinc-600 !fill-current" />
            </template>
          </UiEmptyState>

          <div v-else class="!divide-y !divide-slate-100/60 dark:!divide-zinc-800/60">
            <div
              v-for="appt in todayAppointments"
              :key="appt.id"
              class="!p-5 !flex !items-center !justify-between !gap-4 hover:!bg-slate-50/50 dark:hover:!bg-zinc-800/20 !transition-all"
            >
              <div class="!flex !items-center !gap-6">
                <!-- Clean Modernized Timeline Block -->
                <div class="!flex !flex-col !items-center !justify-center !px-3 !py-1.5 !rounded-xl !bg-slate-50 dark:!bg-zinc-800/50 !border !border-slate-100 dark:!border-zinc-800 !min-w-[70px]" dir="ltr">
                  <span class="!text-xs !font-bold !text-slate-800 dark:!text-zinc-200">{{ appt.startTime?.slice(0, 5) }}</span>
                  <span class="!text-[10px] !text-slate-400 dark:!text-zinc-500 !mt-0.5">تا {{ appt.endTime?.slice(0, 5) }}</span>
                </div>

                <div class="!space-y-1">
                  <h4 class="!text-sm !font-semibold !text-slate-900 dark:!text-white">
                    {{ appt.patientFirstName }} {{ appt.patientLastName }}
                  </h4>
                  <div class="!flex !items-center !gap-2 !text-xs !text-slate-400 dark:!text-zinc-500">
                    <span>{{ appt.patientPhone }}</span>
                    <span class="!w-1 !h-1 !rounded-full !bg-slate-200 dark:!bg-zinc-700" />
                    <span>کد ملی: {{ appt.patientNationalId }}</span>
                  </div>
                </div>
              </div>

              <div class="!shrink-0">
                <UiStatusBadge :status="appt.status" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </UiPageContainer>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import Calendar from '~/components/icons/Calendar.vue'
import UsersGroup from '~/components/icons/UsersGroup.vue'
import ChatDots from '~/components/icons/ChatDots.vue'
import HeartPulse from '~/components/icons/HeartPulse.vue'
import DocumentText from '~/components/icons/DocumentText.vue'
import Bell from '~/components/icons/Bell.vue'
import ShieldCheck from '~/components/icons/ShieldCheck.vue'
import Profile from '~/components/icons/Profile.vue'
import CloseCircle from '~/components/icons/CloseCircle.vue'
import BreakdownRow from '~/components/dashboard/BreakdownRow.vue'
import { INSURANCE_TYPES, INSURANCE_TYPE_KEYS } from '~/types/insurance'
import type { InsuranceTypeKey } from '~/types/insurance'

interface DashboardSmsCredit {
  sent: number
  remaining: number
}

interface DashboardStorage {
  usedBytes: number
  usedFormatted: string
}

interface DashboardCounts {
  total: number
  yesterday: number
  today: number
  tomorrow: number
}

interface DashboardMessages extends DashboardCounts {
  unread: number
}

interface DashboardVisits {
  total: number
  yesterday: number
  today: number
}

interface DashboardBilling {
  total: number
  pending: number
  paid: number
  total_revenue: number
  pending_revenue: number
}

interface DashboardData {
  sms_credit: DashboardSmsCredit | null
  storage: DashboardStorage
  patients: DashboardCounts
  appointments: Omit<DashboardCounts, 'total'>
  messages: DashboardMessages
  visits: DashboardVisits
  billing: DashboardBilling
}

// ─── Patient Dashboard Types ───
interface PatientDashboardPatient {
  id: string
  first_name?: string
  last_name?: string
  national_id?: string
  phone?: string
  address?: string
  insurance_type?: string
  birth_date?: string
  marital_status?: string
}

interface PatientDashboardMessage {
  unread: number
  total: number
}

interface PatientDashboardAppointment {
  id: string
  doctor_name?: string
  date?: string
  time?: string
  status?: string
}

interface PatientDashboardData {
  patient: PatientDashboardPatient
  messages: PatientDashboardMessage
  appointments: PatientDashboardAppointment[]
}

const { apiFetch } = useApi()
const { user } = useAuth()
const { formatJalaliLong, formatJalaliDate, toDateStr } = useFormatting()

const data = ref<DashboardData | null>(null)
const loading = ref(true)

const todayAppointments = ref<any[]>([])
const loadingSchedule = ref(false)

const role = computed(() => user?.value?.role || (user as any)?.role)

const isPatient = computed(() => role.value === 'patient')

const canViewDashboard = computed(() => {
  return ['admin_doctor', 'doctor', 'lab', 'pharmacy'].includes(role.value)
})

const hasSchedule = computed(() => {
  return role.value === 'admin_doctor' || role.value === 'doctor'
})

const todayPersian = computed(() => formatJalaliLong())
const todayDateStr = computed(() => toDateStr(new Date()))

const smsAvailable = computed(() => data.value?.sms_credit != null)

const smsPercent = computed(() => {
  if (!data.value?.sms_credit) return 0
  const { sent, remaining } = data.value.sms_credit
  const total = sent + remaining
  return total > 0 ? Math.round((remaining / total) * 100) : 0
})

const storagePercent = computed(() => {
  if (!data.value?.storage) return 0
  const used = data.value.storage.usedBytes
  const maxStorage = 5 * 1024 * 1024 * 1024
  return Math.min(100, Math.round((used / maxStorage) * 100))
})

// ─── Patient Dashboard State ───
const patientData = ref<PatientDashboardData | null>(null)

const profileComplete = computed(() => {
  const p = patientData.value?.patient
  if (!p) return false
  return !!(p.phone && p.address && p.insurance_type)
})

const insuranceOptions = computed(() =>
  INSURANCE_TYPE_KEYS.map((key: InsuranceTypeKey) => ({
    key,
    label: INSURANCE_TYPES[key].label,
  }))
)

function insuranceLabel(key: string | undefined | null): string {
  if (!key) return '---'
  const info = INSURANCE_TYPES[key as InsuranceTypeKey]
  return info?.label || key
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: 'در انتظار تایید',
    confirmed: 'تایید شده',
    rejected: 'رد شده',
    cancelled: 'لغو شده',
    completed: 'انجام شده',
  }
  return map[status] || status
}

// ─── Edit Profile State ───
const editDialogOpen = ref(false)
const saving = ref(false)
const editForm = reactive({
  phone: '',
  address: '',
  insurance_type: '',
})

function openEditDialog() {
  const p = patientData.value?.patient
  if (p) {
    editForm.phone = p.phone || ''
    editForm.address = p.address || ''
    editForm.insurance_type = p.insurance_type || ''
  }
  editDialogOpen.value = true
}

async function saveProfile() {
  saving.value = true
  try {
    const res = await apiFetch<{ success: boolean; message: string; patient: PatientDashboardPatient }>('/api/patient/me', {
      method: 'PATCH',
      body: {
        phone: editForm.phone,
        address: editForm.address,
        insurance_type: editForm.insurance_type,
      },
    })
    if (res.success && patientData.value) {
      patientData.value.patient = res.patient
      useNuxtApp().$toast.success(res.message || 'پروفایل با موفقیت به‌روزرسانی شد.')
      editDialogOpen.value = false
    }
  } catch (err: any) {
    useNuxtApp().$toast.error(err?.data?.error || 'خطا در به‌روزرسانی پروفایل')
  } finally {
    saving.value = false
  }
}

// ─── Shared ───
function formatNumber(n: number): string {
  return new Intl.NumberFormat('fa-IR').format(n)
}

function formatToman(rials: number): string {
  const toman = Math.round(rials / 10)
  return new Intl.NumberFormat('fa-IR').format(toman) + ' تومان'
}

async function fetchDashboard() {
  loading.value = true
  try {
    const res = await apiFetch<{ success: boolean; data: DashboardData }>('/api/dashboard')
    if (res.success) {
      data.value = res.data
    }
  } catch {
    // Degrade gracefully
  } finally {
    loading.value = false
  }
}

async function fetchPatientDashboard() {
  loading.value = true
  try {
    const res = await apiFetch<{ success: boolean; data: PatientDashboardData }>('/api/dashboard')
    if (res.success) {
      patientData.value = res.data
    }
  } catch {
    // Degrade gracefully
  } finally {
    loading.value = false
  }
}

async function fetchDoctorSchedule() {
  if (!hasSchedule.value) return
  loadingSchedule.value = true
  try {
    const apptRes = await apiFetch<any>(`/api/scheduling/appointments?date=${todayDateStr.value}`)
    if (apptRes.success) todayAppointments.value = apptRes.data
  } catch {
    // Silently fail
  } finally {
    loadingSchedule.value = false
  }
}

onMounted(() => {
  if (isPatient.value) {
    fetchPatientDashboard()
  } else if (canViewDashboard.value) {
    fetchDashboard()
  } else {
    loading.value = false
  }
  if (hasSchedule.value) {
    fetchDoctorSchedule()
  }
})

useSeoMeta({ title: 'داشبورد | سیستم مدیریت', ogTitle: 'صفحه اصلی' })
</script>