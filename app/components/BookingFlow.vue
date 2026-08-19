<template>
  <div dir="rtl"
    class="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50/80 to-slate-100 py-12 px-4 sm:px-6 flex flex-col items-center justify-start selection:bg-electric-sapphire/10 selection:text-electric-sapphire">

    <!-- نور پس‌زمینه تزیینی (Ambient Glow) -->
    <div
      class="fixed top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-64 bg-gradient-to-tr from-electric-sapphire/10 to-light-cyan/20 blur-3xl -z-10 pointer-events-none"></div>

    <!-- هدر صفحه -->
    <div class="w-full max-w-2xl text-center mb-10">
      <div v-dir class="flex items-center justify-end mb-4 dir-ltr">
        <button
          @click="$router.back()"
          v-dir
          class="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:!bg-slate-100 hover:!text-slate-900 hover:!border-slate-300 transition-all dir-rtl"
          :title="t('booking.back')"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
          </svg>
          {{ t('booking.back') }}
        </button>
      </div>
      <div
        class="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-xl shadow-slate-200/60 border border-slate-100/80 mb-6 transition-transform duration-300 hover:scale-105">
        <div class="absolute inset-0 rounded-2xl bg-light-cyan animate-pulse opacity-40"></div>
        <MedicalKit class="w-10 h-10 fill-electric-sapphire relative z-10" />
      </div>
      <h1 class="text-3xl sm:text-4xl font-black text-slate-800 tracking-tight">{{ t('booking.title') }}</h1>
      <p class="text-slate-500 mt-3 text-base sm:text-lg font-medium">{{ headerSubtitle }}</p>
    </div>

    <!-- بدنه اصلی (کارت رزرو) -->
    <div
      class="w-full max-w-2xl bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl shadow-slate-200/70 border border-slate-100/80 overflow-hidden transition-all duration-300">

      <!-- استپر پیشرفت یکپارچه -->
      <div class="px-4 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-slate-100/80 bg-slate-50/50">
        <div class="flex items-center justify-center overflow-x-auto pb-1">
          <template v-for="(label, i) in steps" :key="i">
            <div class="flex items-center gap-1.5 shrink-0">
              <div
                class="w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                :class="step >= i
                  ? 'bg-electric-sapphire text-white shadow-md shadow-electric-sapphire/30'
                  : 'bg-slate-100 text-slate-400'">
                <span v-if="step > i">✓</span>
                <span v-else>{{ i + 1 }}</span>
              </div>
              <span class="text-[11px] md:text-xs font-medium hidden sm:block whitespace-nowrap"
                :class="step >= i ? 'text-electric-sapphire' : 'text-slate-400'">
                {{ label }}
              </span>
            </div>
            <div v-if="i < steps.length - 1" class="h-px flex-1 min-w-1.5 mx-1 sm:mx-2"
              :class="step > i ? 'bg-electric-sapphire' : 'bg-slate-200'"></div>
          </template>
        </div>
      </div>

      <!-- محتوای مراحل -->
      <div class="p-6! sm:p-10! pt-2!">

        <div v-if="!success">

          <!-- مراحل ۱ و ۲: انتخاب سرویس و پزشک -->
          <div v-if="step === 0 || step === 1">
            <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4">
              <v-progress-circular indeterminate color="#4F46E5" size="48" width="4" />
              <span class="text-slate-500 font-medium text-sm sm:text-base animate-pulse">{{ t('booking.servicesLoading') }}</span>
            </div>

            <div v-else-if="error" class="text-center py-12 px-4">
              <div
                class="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-sm">
                <span class="text-2xl">⚠️</span>
              </div>
              <p class="text-slate-700 font-bold mb-1">{{ t('booking.fetchServicesError') }}</p>
              <p class="text-slate-500 text-sm font-medium">{{ error }}</p>
            </div>

            <template v-else>
              <Transition
                enter-active-class="transition duration-300 ease-out"
                enter-from-class="opacity-0 translate-y-2"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition duration-200 ease-in"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 -translate-y-2"
                mode="out-in"
              >
                <!-- مرحله ۱: انتخاب سرویس -->
                <div v-if="step === 0" key="services-step">

                  <div v-if="!services.length"
                    class="text-center py-14 px-4 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
                    <div
                      class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                      <span class="text-2xl">🏥</span>
                    </div>
                    <h3 class="text-slate-800 font-bold mb-1.5">{{ t('booking.noServices') }}</h3>
                    <p class="text-sm text-slate-500">{{ t('booking.noServicesDesc') }}</p>
                  </div>

                  <div v-else class="grid gap-3.5!">
                    <button
                      v-for="svc in services"
                      :key="svc.name"
                      @click="selectService(svc)"
                      class="group relative w-full text-right p-4! sm:p-5! rounded-2xl border-2 transition-all duration-300 flex items-center justify-between gap-4"
                      :class="selectedService?.name === svc.name
                        ? '!border-electric-sapphire !bg-light-cyan/50 !shadow-md !shadow-electric-sapphire/10'
                        : '!border-slate-100 !bg-slate-50/50 hover:!border-periwinkle hover:!bg-slate-200 hover:!shadow-lg hover:!shadow-slate-100'"
                    >
                      <div class="flex items-center gap-4 min-w-0">
                        <div
                          class="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105 shadow-sm"
                          :style="{ backgroundColor: (svc.doctors[0]?.color || '#4F46E5') + '15' }"
                        >
                          <div
                            class="w-5 h-5 rounded-full shadow-inner"
                            :style="{ backgroundColor: svc.doctors[0]?.color || '#4F46E5' }"
                          ></div>
                        </div>
                        <div class="min-w-0">
                          <span class="font-extrabold text-base sm:text-lg text-slate-800 block truncate group-hover:text-electric-sapphire transition-colors">
                            {{ svc.name }}
                          </span>
                          <div class="inline-flex items-center gap-2 mt-1 text-xs font-semibold text-slate-500">
                            <span>{{ t('booking.serviceByDoctors', { count: svc.doctors.length }) }}</span>
                          </div>
                        </div>
                      </div>

                      <div
                        class="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:!border-electric-sapphire/30 group-hover:!text-electric-sapphire group-hover:!bg-electric-sapphire/5 transition-all shrink-0">
                        <svg class="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </button>
                  </div>
                </div>

                <!-- مرحله ۲: انتخاب پزشک -->
                <div v-else key="doctors-step">

                  <div class="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
                    <div class="flex items-center gap-3">
                      <button
                        @click="step = 0"
                        class="w-10 h-10 rounded-xl border border-slate-200/80 bg-slate-50 flex items-center justify-center text-slate-600 hover:!bg-slate-100 hover:!text-slate-900 transition-all"
                        :title="t('booking.back')"
                      >
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div>
                        <h2 class="text-lg font-extrabold text-slate-800">{{ t('booking.selectDoctor') }}</h2>
                        <p class="text-xs font-medium text-electric-sapphire mt-0.5">{{ selectedService?.name }}</p>
                      </div>
                    </div>
                  </div>

                  <div v-if="!selectedService?.doctors.length"
                    class="text-center py-14 px-4 bg-slate-50/80 rounded-2xl border border-dashed border-slate-200">
                    <div
                      class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm border border-slate-100">
                      <span class="text-2xl">👨‍⚕️</span>
                    </div>
                    <h3 class="text-slate-800 font-bold mb-1.5">{{ t('booking.noDoctors') }}</h3>
                    <p class="text-sm text-slate-500">{{ t('booking.noDoctorsDesc') }}</p>
                  </div>

                  <div v-else class="grid gap-4">
                    <button
                      v-for="doc in selectedService!.doctors"
                      :key="doc.doctorId"
                      @click="selectDoctor(doc)"
                      class="group w-full text-right p-5! rounded-2xl border-2 !border-slate-100 !bg-slate-50/40 hover:!border-periwinkle hover:!bg-white hover:!shadow-xl hover:!shadow-slate-200/50 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div class="flex items-start sm:items-center gap-4 min-w-0">
                        <div
                          class="w-14 h-14 rounded-2xl bg-gradient-to-br from-electric-sapphire to-periwinkle flex items-center justify-center shrink-0 text-white font-black text-base shadow-md shadow-electric-sapphire/20 group-hover:scale-105 transition-transform">
                          {{ getInitials(doc.doctorName) }}
                        </div>

                        <div class="min-w-0 flex-1">
                          <div
                            class="font-extrabold text-slate-800 text-base sm:text-lg group-hover:text-electric-sapphire transition-colors">
                            {{ doc.doctorName }}
                          </div>

                          <p v-if="doc.description" class="text-xs font-normal text-slate-500 mt-1 mb-3 line-clamp-1">
                            {{ doc.description }}
                          </p>

                          <div class="flex flex-wrap items-center gap-2.5 mt-2.5 text-xs">
                            <span
                              class="inline-flex items-center gap-1.5 px-2.5! py-1! rounded-lg bg-slate-200/60 text-slate-700 font-medium">
                              <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                              </svg>
                              {{ doc.durationMinutes }} {{ t('booking.minutes') }}
                            </span>

                            <span v-if="doc.price"
                              class="inline-flex items-center gap-1.5 px-2.5! py-1! rounded-lg bg-light-cyan/60 text-electric-sapphire font-extrabold">
                              {{ formatPrice(doc.price) }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div class="shrink-0 w-full sm:w-auto mt-2 sm:mt-0">
                        <span
                          class="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 !bg-electric-sapphire !text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-electric-sapphire/20 group-hover:!bg-electric-sapphire/90 group-hover:!shadow-lg group-hover:!shadow-electric-sapphire/30 transition-all">
                          {{ t('booking.selectTime') }}
                          <svg class="w-4 h-4 rotate-180 transition-transform group-hover:-translate-x-1" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              </Transition>
            </template>
          </div>

          <!-- مراحل ۳ تا ۶: تاریخ، نوع نوبت، زمان و اطلاعات -->
          <template v-else>
            <!-- مرحله ۳: انتخاب تاریخ -->
            <div v-show="step === 2" class="pb-2">
              <div class="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
                <div class="flex items-center gap-3">
                  <button
                    @click="goBackFromDate"
                    class="w-10 h-10 rounded-xl border border-slate-200/80 bg-slate-50 flex items-center justify-center text-slate-600 hover:!bg-slate-100 hover:!text-slate-900 transition-all"
                    :title="t('booking.back')"
                  >
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div>
                    <h2 class="text-lg font-extrabold text-slate-800">{{ t('booking.appointmentDate') }}</h2>
                    <p v-if="activeDoctor" class="text-xs font-medium text-electric-sapphire mt-0.5">{{ activeDoctor }}</p>
                  </div>
                </div>
              </div>

              <div v-if="selectedVisitType"
                class="flex items-center justify-between bg-light-cyan/40 border border-periwinkle/40 rounded-xl mx-8 mb-4 px-4 py-3">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    :style="{ backgroundColor: (selectedVisitType?.color || '#3B82F6') + '20' }">
                    <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: selectedVisitType?.color || '#3B82F6' }"></div>
                  </div>
                  <div class="text-sm">
                    <span class="text-slate-500">{{ t('booking.selectedType') }}</span>
                    <span class="font-bold text-slate-800 mr-1">{{ selectedVisitType?.name }}</span>
                    <span class="text-xs text-slate-400 mr-2">({{ selectedVisitType?.durationMinutes }} {{ t('booking.minutes') }})</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-between bg-slate-50 rounded-2xl border border-slate-100 mx-8">
                <div class="flex flex-col items-center w-full py-2">
                  <span class="text-xs font-medium text-slate-400 mb-0.5">{{ t('booking.appointmentDate') }}</span>
                  <span class="text-sm sm:text-base font-bold text-slate-800">{{ persianDate }}</span>
                </div>
              </div>

              <HijriCalendar v-model="selectedJalaliDate" :marked-dates="markedDates" :loading="calendarLoading"
                @month-change="onMonthChange" />

              <div v-if="selectedJalaliDate && !fetchingSlots && !availableSlots.length"
                class="mt-4 flex items-center gap-2 justify-center py-3 px-4 bg-amber-50 border border-amber-200/60 rounded-xl mx-6">
                <svg class="w-5 h-5 shrink-0 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span class="text-sm font-medium text-amber-700">{{ t('booking.noSlotsForDay') }}</span>
              </div>

              <div v-if="selectedJalaliDate && !fetchingSlots && availableSlots.length" class="my-2 flex justify-center">
                <v-btn variant="flat" color="#4F46E5" size="large"
                  class="px-14 font-bold rounded-xl shadow-md shadow-electric-sapphire/30" :disabled="!selectedJalaliDate || !selectedVisitType"
                  @click="advanceFromDate">
                  {{ t('booking.continue') }}
                </v-btn>
              </div>
            </div>

            <!-- مرحله ۴: انتخاب زمان -->
            <div class="px-2" v-show="step === 3">
              <div class="flex items-center justify-between mb-4 px-2">
                <h2 class="text-lg font-bold text-slate-800">{{ t('booking.selectTime') }}</h2>
                <v-progress-circular v-if="fetchingSlots" indeterminate color="#4F46E5" size="20" width="2" />
              </div>

              <div class="bg-light-cyan/40 border border-periwinkle/40 rounded-xl px-4 py-3 mb-6 flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  :style="{ backgroundColor: (selectedVisitType?.color || '#3B82F6') + '20' }">
                  <div class="w-3 h-3 rounded-full" :style="{ backgroundColor: selectedVisitType?.color || '#3B82F6' }">
                  </div>
                </div>
                <div class="text-sm">
                  <span class="text-slate-600">{{ t('booking.selectedType') }}</span>
                  <span class="font-bold text-slate-800">{{ selectedVisitType?.name }}</span>
                </div>
              </div>

              <div v-if="!fetchingSlots && availableSlots.length"
                class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 px-2">
                <button v-for="slot in availableSlots" :key="slot.startTime" @click="selectSlot(slot)"
                  class="px-2 py-3 text-sm font-medium rounded-lg border-2 border-slate-400 transition-all duration-200"
                  :class="selectedSlot?.startTime === slot.startTime
                    ? 'border-electric-sapphire shadow shadow-electric-sapphire/30 bg-primary'
                    : 'text-slate-600 border-slate-100 hover:border-periwinkle hover:text-electric-sapphire bg-secondary'">
                  {{ slot.startTime }} - {{ slot.endTime }}
                </button>
              </div>

              <div v-if="!fetchingSlots && !availableSlots.length"
                class="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 px-2">
                <div
                  class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                  <span class="text-2xl">📅</span>
                </div>
                <h3 class="text-slate-700 font-bold mb-1">{{ t('booking.noSlotsFound') }}</h3>
                <p class="text-sm text-slate-500">{{ t('booking.noSlotsFoundDesc') }}</p>
              </div>

              <div class="mt-8 flex items-center gap-3 justify-between px-2 pb-2">
                <v-btn variant="text" color="slate-500" size="large" class="rounded-lg font-medium"
                  @click="step = 2">
                  {{ t('booking.back') }}
                </v-btn>
              </div>
            </div>

            <!-- مرحله ۵: اطلاعات بازدیدکننده -->
            <v-expand-transition class="px-2">
              <div v-if="selectedSlot">
                <div class="h-px w-full bg-slate-100 my-8"></div>
                <div class="flex items-center justify-between mb-6 px-2">
                  <h3 class="text-lg font-bold text-slate-800">{{ t('booking.visitorInfo') }}</h3>
                  <span class="bg-light-cyan text-electric-sapphire px-3 py-1 rounded-lg text-xs font-bold">
                    {{ t('booking.selectedTime') }} {{ selectedSlot.startTime }}
                  </span>
                </div>

                <v-form ref="formRef" @submit.prevent="bookAppointment">
                  <v-row class="mt-2 px-2">
                    <v-col cols="12" md="6" class="py-2">
                      <label class="text-sm font-semibold text-slate-700 mb-2 block">{{ t('booking.firstName') }} <span
                          class="text-red-500">*</span></label>
                      <v-text-field v-model="form.firstName" variant="outlined" density="comfortable"
                        :placeholder="t('booking.firstNamePlaceholder')" hide-details="auto" bg-color="white" rounded="lg" dir="rtl"
                        :rules="[v => !!v || t('booking.firstNameRequired')]" append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('firstName')" />
                    </v-col>

                    <v-col cols="12" md="6" class="py-2">
                      <label class="text-sm font-semibold text-slate-700 mb-2 block">{{ t('booking.lastName') }} <span
                          class="text-red-500">*</span></label>
                      <v-text-field v-model="form.lastName" variant="outlined" density="comfortable"
                        :placeholder="t('booking.lastNamePlaceholder')" hide-details="auto" bg-color="white" rounded="lg" dir="rtl"
                        :rules="[v => !!v || t('booking.lastNameRequired')]" append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('lastName')" />
                    </v-col>

                    <v-col cols="12" md="6" class="py-2">
                      <label class="text-sm font-semibold text-slate-700 mb-2 block">{{ t('booking.nationalId') }} <span
                          class="text-red-500">*</span></label>
                      <v-text-field v-model="form.nationalId" variant="outlined" density="comfortable"
                        :placeholder="t('booking.nationalIdPlaceholder')" maxlength="10" hide-details="auto" bg-color="white" rounded="lg"
                        dir="ltr" :rules="[
                          v => !!v || t('booking.nationalIdRequired'),
                          v => /^\d{10}$/.test(v) || t('booking.nationalIdLength')
                        ]" class="text-right" append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('nationalId', true)" />
                    </v-col>

                    <v-col cols="12" md="6" class="py-2">
                      <label class="text-sm font-semibold text-slate-700 mb-2 block">{{ t('booking.phone') }} <span
                          class="text-red-500">*</span></label>
                      <v-text-field v-model="form.phone" variant="outlined" density="comfortable" :placeholder="t('booking.phonePlaceholder')"
                        hide-details="auto" bg-color="white" rounded="lg" :rules="[
                          v => !!v || t('booking.phoneRequired'),
                          v => /^09\d{9}$/.test(v) || t('booking.phoneInvalid')
                        ]"
                        dir="ltr" class="text-right" append-inner-icon="mdi-draw-pen" @click:append-inner="openHandwriting('phone')" />
                    </v-col>
                  </v-row>

                  <div class="mt-8 flex flex-col-reverse sm:flex-row items-center gap-3 py-3 px-3 justify-between">
                    <div>
                      <v-btn variant="text" color="slate-500" size="large" class="rounded-lg font-medium"
                        @click="goBackToSlots">
                        {{ t('booking.back') }}
                      </v-btn>
                    </div>
                    <v-btn variant="flat" color="#4F46E5" size="large" :loading="submitting"
                      class="px-10 font-bold rounded-lg shadow-md shadow-electric-sapphire/30" @click="bookAppointment">
                      {{ t('booking.confirmBooking') }}
                    </v-btn>
                  </div>
                </v-form>
              </div>
            </v-expand-transition>
          </template>
        </div>

        <!-- موفقیت -->
        <div v-else class="p-10 text-center">
          <div class="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto my-6">
            <span class="text-5xl">✅</span>
          </div>
          <h2 class="text-2xl font-extrabold text-slate-800 mb-3">{{ t('booking.bookingSuccess') }}</h2>
          <p class="text-slate-500 mb-8 max-w-sm mx-auto leading-relaxed">
            {{ t('booking.bookingSuccessDesc') }}
          </p>

          <div class="bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-8 max-w-sm mx-auto text-right space-y-3">
            <div class="flex justify-between items-center border-b border-slate-200 pb-3 px-2 py-3">
              <span class="text-sm font-medium text-slate-500">{{ t('booking.visitDate') }}</span>
              <span class="text-sm font-bold text-slate-800">{{ persianDate }}</span>
            </div>
            <div class="flex justify-between items-center border-b border-slate-200 px-2 py-3">
              <span class="text-sm font-medium text-slate-500">{{ t('booking.visitTypeLabel') }}</span>
              <span class="text-sm font-bold text-electric-sapphire">{{ selectedVisitType?.name }}</span>
            </div>
            <div class="flex justify-between items-center px-2 py-3">
              <span class="text-sm font-medium text-slate-500">{{ t('booking.visitTime') }}</span>
              <span class="text-sm font-bold text-electric-sapphire">{{ selectedSlot?.startTime }} {{ t('booking.timeTo') }} {{
                selectedSlot?.endTime }}</span>
            </div>
          </div>

          <v-btn variant="outlined" color="slate-700" size="large" class="px-8 font-bold rounded-xl my-4"
            @click="resetBooking">
            {{ t('booking.bookNew') }}
          </v-btn>
        </div>

      </div>
    </div>
  </div>
  <HandwritingDialog v-model="handwritingOpen" :label="handwritingLabel" :numeric="handwritingNumeric" @insert="applyHandwriting" />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useHandwritingFields } from '~/composables/useHandwritingFields'
import moment from 'moment-jalaali'
import HijriCalendar from '~/components/HijriCalendar.vue'
import MedicalKit from '~/components/icons/MedicalKit.vue'
import HandwritingDialog from '~/components/HandwritingDialog.vue'

const props = defineProps<{
  initialDoctorId?: string
  initialVisitTypeId?: string
}>()

const { t, tm } = useI18n()
const router = useRouter()
const { $toast } = useNuxtApp()
const { apiFetch } = useApi()

const startedWithDoctor = computed(() => !!props.initialDoctorId)

// === مراحل یکپارچه: ۰ سرویس، ۱ پزشک، ۲ تاریخ، ۳ زمان، ۴ اطلاعات ===
const step = ref(props.initialDoctorId ? 2 : 0)

const steps = computed(() => {
  const raw = tm('booking.steps') as unknown[]
  return raw.map((_, i) => t(`booking.steps.${i}`))
})

interface ServiceDoctor {
  doctorId: string
  doctorName: string
  visitTypeId: string
  name: string
  description: string | null
  durationMinutes: number
  price: string | null
  color: string | null
}

interface ServiceGroup {
  name: string
  doctors: ServiceDoctor[]
}

const services = ref<ServiceGroup[]>([])
const selectedService = ref<ServiceGroup | null>(null)
const selectedDoctor = ref<ServiceDoctor | null>(null)
const loading = ref(true)
const error = ref('')

const doctorName = ref('')
const pendingVisitTypeId = ref<string | null>(props.initialVisitTypeId ?? null)

const activeDoctorId = computed(() => selectedDoctor.value?.doctorId ?? props.initialDoctorId ?? '')
const activeDoctor = computed(() => doctorName.value || selectedDoctor.value?.doctorName || '')

const headerSubtitle = computed(() => {
  if (step.value === 0) return t('booking.selectServiceDesc')
  if (step.value === 1) return t('booking.selectDoctorDesc')
  return activeDoctor.value ? t('booking.bookWithDoctor', { doctor: activeDoctor.value }) : t('booking.selectServiceDesc')
})

const visitTypes = ref<any[]>([])
const selectedVisitType = ref<any | null>(null)

const availableSlots = ref<{ startTime: string; endTime: string }[]>([])
const selectedSlot = ref<{ startTime: string; endTime: string } | null>(null)
const fetchingSlots = ref(false)
const submitting = ref(false)
const success = ref(false)
const formRef = ref<any>(null)

const now = moment()
const selectedJalaliDate = ref(
  `${now.jYear()}/${String(now.jMonth() + 1).padStart(2, '0')}/${String(now.jDate()).padStart(2, '0')}`
)

const markedDates = ref<string[]>([])
const calendarLoading = ref(false)
const markedDatesCache: Record<string, string[]> = {}

const currentDate = computed(() => {
  if (!selectedJalaliDate.value) return new Date()
  const m = moment(selectedJalaliDate.value, 'jYYYY/jMM/jDD')
  return m.toDate()
})

const form = ref({
  firstName: '',
  lastName: '',
  nationalId: '',
  phone: '',
})

const { handwritingOpen, handwritingLabel, handwritingNumeric, openHandwriting, applyHandwriting } =
  useHandwritingFields({
    fieldLabels: {
      firstName: t('booking.firstName'),
      lastName: t('booking.lastName'),
      nationalId: t('booking.nationalId'),
      phone: t('booking.phone'),
    },
    target: form,
  })

const persianDate = computed(() => {
  const d = currentDate.value
  return d.toLocaleDateString('fa-IR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})

const dateStr = computed(() => {
  const d = currentDate.value
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
})

watch(selectedJalaliDate, () => {
  selectedSlot.value = null
  fetchSlots()
}, { immediate: true })

// === فرمت قیمت با جداسازی ۳ رقمی و تبدیل ارقام به فارسی ===
function formatPrice(price: number | string | null | undefined): string {
  if (price == null) return `۰ ${t('common.toman')}`
  const num = typeof price === 'string' ? parseFloat(price) : price
  if (isNaN(num)) return `۰ ${t('common.toman')}`
  const separated = num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const persianDigits = separated.replace(/\d/g, (d) => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d)])
  return persianDigits + ' ' + t('common.toman')
}

function getInitials(name: string): string {
  if (!name) return 'DR'
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function selectService(svc: ServiceGroup) {
  selectedService.value = svc
  step.value = 1
}

function selectDoctor(doc: ServiceDoctor) {
  selectedDoctor.value = doc
  doctorName.value = doc.doctorName
  selectedVisitType.value = null
  pendingVisitTypeId.value = doc.visitTypeId || null
  step.value = 2
  fetchVisitTypes()
  fetchMonthAvailability(now.jYear(), now.jMonth() + 1)
}

function goBackFromDate() {
  if (startedWithDoctor.value) {
    router.push('/booking')
  } else {
    step.value = 1
  }
}

function selectVisitType(vt: any) {
  selectedVisitType.value = vt
}

function selectSlot(slot: { startTime: string; endTime: string }) {
  selectedSlot.value = slot
  step.value = 4
}

function advanceFromDate() {
  step.value = 3
}

function goBackToSlots() {
  selectedSlot.value = null
  step.value = 3
}

function resetBooking() {
  success.value = false
  selectedSlot.value = null
  selectedVisitType.value = null
  form.value = { firstName: '', lastName: '', nationalId: '', phone: '' }

  const today = moment()
  selectedJalaliDate.value = `${today.jYear()}/${String(today.jMonth() + 1).padStart(2, '0')}/${String(today.jDate()).padStart(2, '0')}`

  if (startedWithDoctor.value) {
    step.value = 2
    pendingVisitTypeId.value = props.initialVisitTypeId ?? null
    fetchVisitTypes()
    Object.keys(markedDatesCache).forEach(k => delete markedDatesCache[k])
    fetchMonthAvailability(today.jYear(), today.jMonth() + 1)
  } else {
    step.value = 0
    selectedDoctor.value = null
    selectedService.value = null
    doctorName.value = ''
    pendingVisitTypeId.value = null
    fetchServices()
  }
}

function onMonthChange(payload: { year: number; month: number }) {
  fetchMonthAvailability(payload.year, payload.month)
}

async function fetchServices() {
  loading.value = true
  error.value = ''
  try {
    const res = await apiFetch<any>('/api/booking/services')
    if (res.success) {
      services.value = (res.data || []).map((g: any) => ({
        name: g.name,
        doctors: (g.doctors || []).map((d: any) => ({
          doctorId: d.doctorId,
          doctorName: d.doctorName,
          visitTypeId: d.visitTypeId,
          name: d.name,
          description: d.description,
          durationMinutes: d.duration_minutes ?? d.durationMinutes ?? 30,
          price: d.price ?? null,
          color: d.color || '#4F46E5',
        })),
      }))
    }
  } catch (err: any) {
    error.value = err.data?.error || 'Failed to load services'
    $toast.error(error.value)
  } finally {
    loading.value = false
  }
}

async function fetchDoctorName() {
  try {
    const res = await apiFetch<any>('/api/booking/doctors')
    if (res.success) {
      const doctor = res.data.find((d: any) => d.id === activeDoctorId.value)
      if (doctor) {
        doctorName.value = doctor.fullName
        return
      }
    }
    const svc = await apiFetch<any>(`/api/booking/services?doctorId=${activeDoctorId.value}`)
    if (svc.success) {
      for (const group of svc.data || []) {
        const match = group.doctors?.find((d: any) => d.doctorId === activeDoctorId.value)
        if (match) {
          doctorName.value = match.doctorName
          return
        }
      }
    }
  } catch {
    // silently fail
  }
}

async function fetchVisitTypes() {
  if (!activeDoctorId.value) return
  try {
    const res = await apiFetch<any>(`/api/visit-types/${activeDoctorId.value}`)
    if (res.success) {
      visitTypes.value = (res.data || []).filter((vt: any) => {
        const active = vt.is_active ?? vt.isActive ?? true
        return active
      }).map((vt: any) => ({
        id: vt.id,
        name: vt.name,
        description: vt.description,
        durationMinutes: vt.duration_minutes ?? vt.durationMinutes ?? 30,
        price: vt.price ?? 0,
        color: vt.color || '#3B82F6',
        isActive: vt.is_active ?? vt.isActive ?? true,
      }))
    }
  } catch {
    $toast.error(t('booking.fetchVisitTypesError'))
  }
}

async function fetchMonthAvailability(year: number, month: number) {
  if (!activeDoctorId.value) return
  const cacheKey = `${year}-${month}`
  if (markedDatesCache[cacheKey]) {
    markedDates.value = markedDatesCache[cacheKey]
    return
  }

  calendarLoading.value = true
  markedDates.value = []

  const todayJalali = `${now.jYear()}/${String(now.jMonth() + 1).padStart(2, '0')}/${String(now.jDate()).padStart(2, '0')}`
  const daysInMonth = moment.jDaysInMonth(year, month - 1)
  const promises = []

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStrJ = `${year}/${String(month).padStart(2, '0')}/${String(d).padStart(2, '0')}`
    if (dateStrJ < todayJalali) continue

    const gregDate = moment(dateStrJ, 'jYYYY/jMM/jDD').toDate()
    const apiDateStr = `${gregDate.getFullYear()}-${String(gregDate.getMonth() + 1).padStart(2, '0')}-${String(gregDate.getDate()).padStart(2, '0')}`

    promises.push(
      apiFetch<any>(`/api/booking/slots/${activeDoctorId.value}?date=${apiDateStr}`)
        .then(res => ({ dateStr: dateStrJ, hasSlots: res.success && res.data?.length > 0 }))
        .catch(() => ({ dateStr: dateStrJ, hasSlots: false }))
    )
  }

  const results = await Promise.allSettled(promises)
  const dates: string[] = []
  results.forEach(r => {
    if (r.status === 'fulfilled' && r.value.hasSlots) {
      dates.push(r.value.dateStr)
    }
  })

  markedDatesCache[cacheKey] = dates
  markedDates.value = dates
  calendarLoading.value = false
}

async function fetchSlots() {
  if (!activeDoctorId.value) return
  fetchingSlots.value = true
  try {
    const res = await apiFetch<any>(`/api/booking/slots/${activeDoctorId.value}?date=${dateStr.value}`)
    if (res.success) {
      availableSlots.value = res.data
    }
  } catch (err: any) {
    $toast.error(err.data?.error || t('booking.fetchSlotsError'))
  } finally {
    fetchingSlots.value = false
  }
}

async function bookAppointment() {
  if (!activeDoctorId.value) return
  const formEl = formRef.value
  if (formEl) {
    const { valid } = await formEl.validate()
    if (!valid) return
  }

  if (!selectedSlot.value || !selectedVisitType.value) return

  submitting.value = true
  try {
    await apiFetch('/api/booking/appointments', {
      method: 'POST',
      body: {
        doctorId: activeDoctorId.value,
        appointmentDate: dateStr.value,
        startTime: selectedSlot.value.startTime,
        endTime: selectedSlot.value.endTime,
        visitTypeId: selectedVisitType.value.id,
        patientFirstName: form.value.firstName,
        patientLastName: form.value.lastName,
        patientNationalId: form.value.nationalId,
        patientPhone: form.value.phone,
      },
    })
    success.value = true
    Object.keys(markedDatesCache).forEach(k => delete markedDatesCache[k])
    $toast.success(t('booking.bookingSuccessDetail'))
  } catch (err: any) {
    $toast.error(err.data?.error || t('booking.bookingError'))
  } finally {
    submitting.value = false
  }
}

watch(visitTypes, (types) => {
  if (!types.length || selectedVisitType.value) return
  const match = pendingVisitTypeId.value
    ? types.find((vt: any) => vt.id === pendingVisitTypeId.value)
    : types[0]
  if (match) selectVisitType(match)
})

onMounted(() => {
  if (startedWithDoctor.value) {
    fetchDoctorName()
    fetchVisitTypes()
    fetchMonthAvailability(now.jYear(), now.jMonth() + 1)
  } else {
    fetchServices()
  }
})
</script>
