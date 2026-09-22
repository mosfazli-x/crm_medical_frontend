<template>
  <div class="dash-app relative">

    <UiPageContainer class="relative! max-w-7xl! mx-auto!">
      <!-- ─── Apple-style large-title header ─── -->
      <header class="dash-head">
        <div class="dash-head__copy">
          <h1 class="dash-head__title">{{ $t('dashboard.title') }}</h1>
          <p class="dash-head__date">{{ todayPersian }}</p>
        </div>
        <div v-if="isPatient && patientData" class="dash-head__actions">
          <button class="asa-btn asa-btn--primary" @click="openEditDialog">
            <Profile class="w-4! h-4! fill-current" />
            {{ $t('dashboard.editProfile') }}
          </button>
        </div>
        <div v-else-if="canViewDashboard" class="dash-head__actions">
          <button class="asa-btn asa-btn--ghost" @click="customizeOpen = true">
            <Settings class="w-4! h-4! fill-current" />
            {{ $t('dashboard.customize') }}
          </button>
        </div>
      </header>

      <!-- ─── Loading ─── -->
      <div v-if="loading" class="space-y-5!">
        <div class="grid! grid-cols-2! min-[480px]:grid-cols-2! xl:grid-cols-4! gap-3! sm:gap-4!">
          <div v-for="n in 4" :key="`s-${n}`" class="asa-skel h-36! rounded-[22px]!" />
        </div>
        <div class="asa-skel h-72! rounded-[22px]!" />
      </div>

      <!-- ═══════════════ Patient Dashboard ═══════════════ -->
      <template v-else-if="isPatient && patientData">
        <!-- Unread Messages Banner -->
        <div v-if="patientData.messages.unread > 0" class="asa-alert asa-alert--amber" role="status">
          <span class="asa-alert__icon" aria-hidden="true">
            <Bell class="w-5! h-5! fill-current" />
            <span class="asa-alert__badge">{{ patientData.messages.unread }}</span>
          </span>
          <div class="asa-alert__body">
            <p class="asa-alert__title">
              {{ $t('dashboard.messagesUnreadCount', { count: patientData.messages.unread }) }}
            </p>
            <p class="asa-alert__desc">{{ $t('dashboard.messagesUnreadDesc') }}</p>
          </div>
          <NuxtLink to="/patient/messaging" class="asa-btn asa-btn--amber solid shrink-0!">
            {{ $t('common.viewMessages') }}
          </NuxtLink>
        </div>

        <!-- Welcome Hero -->
        <section class="asa-hero">
          <span class="asa-hero__orb asa-hero__orb--a" aria-hidden="true" />
          <span class="asa-hero__orb asa-hero__orb--b" aria-hidden="true" />
          <div class="asa-hero__inner">
            <div class="asa-hero__copy">
              <p class="asa-hero__eyebrow">{{ $t('dashboard.patientWelcome') }}</p>
              <h1 class="asa-hero__title">
                {{ patientData.patient.first_name
                  ? $t('dashboard.patientWelcomeName', { name: patientData.patient.first_name })
                  : $t('dashboard.patientWelcome')
                }}
              </h1>
              <p class="asa-hero__desc">{{ $t('dashboard.patientWelcomeDesc') }}</p>
            </div>
            <div class="asa-hero__avatar" aria-hidden="true">
              <Profile class="w-8! h-8! fill-current" />
            </div>
          </div>
        </section>

        <!-- Patient Stats -->
        <section class="asa-sec">
          <p class="asa-sec__label">{{ $t('dashboard.stats') }}</p>
          <div class="grid! grid-cols-1! min-[480px]:grid-cols-2! lg:grid-cols-3! gap-3! sm:gap-4! xl:gap-5!">
            <article class="asa-card asa-metric">
              <span class="asa-metric__icon asa-tint asa-tint--teal">
                <ChatDots class="w-5! h-5! fill-current" />
              </span>
              <div class="asa-metric__copy">
                <p class="asa-metric__value">{{ formatNumber(patientData.messages.total) }}</p>
                <p class="asa-metric__label">{{ $t('dashboard.messages') }}</p>
              </div>
              <p v-if="patientData.messages.unread > 0" class="asa-metric__foot text-rose-500! dark:!text-rose-400!">
                {{ $t('dashboard.messagesUnreadCountShort', { count: formatNumber(patientData.messages.unread) }) }}
              </p>
              <p v-else class="asa-metric__foot">{{ $t('common.noUnreadMessages') }}</p>
            </article>

            <article class="asa-card asa-metric">
              <span class="asa-metric__icon asa-tint asa-tint--green">
                <Calendar class="w-5! h-5! fill-current" />
              </span>
              <div class="asa-metric__copy">
                <p class="asa-metric__value">{{ formatNumber(patientData.appointments.length) }}</p>
                <p class="asa-metric__label">{{ $t('dashboard.appointmentsUpcoming') }}</p>
              </div>
              <p class="asa-metric__foot">{{ $t('dashboard.appointmentsUpcomingDesc') }}</p>
            </article>

            <article class="asa-card asa-metric">
              <span class="asa-metric__icon asa-tint asa-tint--indigo">
                <DocumentText class="w-5! h-5! fill-current" />
              </span>
              <div class="asa-metric__copy">
                <p class="asa-metric__value" :class="profileComplete ? 'asa-green' : 'asa-amber'">
                  {{ profileComplete ? $t('dashboard.profileComplete') : $t('dashboard.profileIncomplete') }}
                </p>
                <p class="asa-metric__label">{{ $t('dashboard.profileStatus') }}</p>
              </div>
              <p v-if="profileComplete" class="asa-metric__foot asa-green">
                {{ $t('dashboard.profileCompleteMsg') }}
              </p>
              <p v-else class="asa-metric__foot asa-amber">
                {{ $t('dashboard.profileIncompleteMsg') }}
              </p>
            </article>
          </div>
        </section>

        <!-- Upcoming Appointments -->
        <section class="asa-sec">
          <p class="asa-sec__label">{{ $t('dashboard.appointmentsUpcoming') }}</p>
          <div class="asa-card asa-list-card">
            <UiEmptyState v-if="!patientData.appointments.length" :title="$t('dashboard.noAppointments')"
              :description="$t('dashboard.noAppointmentsDesc')" class="py-12!">
              <template #icon>
                <Calendar class="w-10! h-10! text-slate-300! dark:!text-zinc-600! fill-current" />
              </template>
            </UiEmptyState>

            <ul v-else class="asa-list">
              <li v-for="appt in patientData.appointments" :key="appt.id" class="asa-row">
                <div class="asa-row__main">
                  <div class="asa-date">
                    <span class="asa-date__day">{{ formatJalaliDate(appt.date) }}</span>
                    <span class="asa-date__time">{{ appt.time ? appt.time.slice(0, 5) : '---' }}</span>
                  </div>
                  <div class="asa-row__text">
                    <h4 class="asa-row__title">{{ appt.doctor_name || $t('dashboard.doctor') }}</h4>
                    <p class="asa-row__sub">
                      {{ appt.status ? statusLabel(appt.status) : $t('dashboard.awaitingConfirmation') }}
                    </p>
                  </div>
                </div>
                <UiStatusBadge :status="appt.status || 'pending'" class="shrink-0!" />
              </li>
            </ul>
          </div>
        </section>

        <!-- Profile Information -->
        <section class="asa-sec">
          <p class="asa-sec__label">{{ $t('dashboard.profileInfo') }}</p>
          <div class="asa-card asa-list-card">
            <dl class="asa-info-grid grid! grid-cols-1! md:!grid-cols-2! xl:!grid-cols-3! gap-x-6! gap-y-7! p-6! md:p-7! m-0!">
              <div class="asa-info-cell">
                <dt class="asa-info-label">{{ $t('dashboard.firstName') }}</dt>
                <dd class="asa-info-value">
                  {{ patientData.patient.first_name || '---' }} {{ patientData.patient.last_name || '' }}
                </dd>
              </div>
              <div class="asa-info-cell">
                <dt class="asa-info-label">{{ $t('dashboard.nationalId') }}</dt>
                <dd class="asa-info-value" dir="ltr">{{ patientData.patient.national_id || '---' }}</dd>
              </div>
              <div class="asa-info-cell">
                <dt class="asa-info-label">{{ $t('dashboard.phone') }}</dt>
                <dd class="asa-info-value" dir="ltr">{{ patientData.patient.phone || '---' }}</dd>
              </div>
              <div class="asa-info-cell">
                <dt class="asa-info-label">{{ $t('dashboard.birthDate') }}</dt>
                <dd class="asa-info-value">{{ formatGregorianDate(patientData.patient.birth_date) }}</dd>
              </div>
              <div class="asa-info-cell">
                <dt class="asa-info-label">{{ $t('dashboard.insurance') }}</dt>
                <dd class="asa-info-value">{{ insuranceLabel(patientData.patient.insurance_type) }}</dd>
              </div>
              <div class="asa-info-cell">
                <dt class="asa-info-label">{{ $t('dashboard.address') }}</dt>
                <dd class="asa-info-value">{{ patientData.patient.address || '---' }}</dd>
              </div>
            </dl>

            <div class="asa-card-foot">
              <p class="asa-card-foot__text">
                {{ profileComplete ? $t('dashboard.profileCompleteFull') : $t('dashboard.profileIncompleteFull') }}
              </p>
              <button class="asa-btn asa-btn--primary shrink-0!" @click="openEditDialog">
                <Profile class="w-4! h-4! fill-current" />
                {{ $t('dashboard.editProfile') }}
              </button>
            </div>
          </div>
        </section>
      </template>

      <!-- ═══════════════ Restricted Access ═══════════════ -->
      <template v-else-if="!isPatient && !canViewDashboard">
        <UiEmptyState :title="$t('dashboard.restrictedAccess')" :description="$t('dashboard.restrictedAccessDesc')">
          <template #icon>
            <ShieldCheck class="w-8! h-8! text-slate-300! dark:!text-zinc-600! fill-current" />
          </template>
        </UiEmptyState>
      </template>

      <!-- ═══════════════ Staff / Clinic Dashboard ═══════════════ -->
      <template v-else-if="data">
        <div class="dash-grid xl:grid! xl:grid-cols-12! xl:gap-x-5! xl:items-start!">
          <template v-for="sec in layout.sections" :key="sec.id">
        <!-- Alerts -->
        <div v-if="sec.id === 'alerts' && sec.visible && hasAlerts" :class="sectionSpanOf(sec)" class="space-y-3! sm:space-y-4!">
          <div v-if="data.messages.unread > 0" class="asa-alert asa-alert--amber" role="status">
            <span class="asa-alert__icon" aria-hidden="true">
              <Bell class="w-5! h-5! fill-current" />
              <span class="asa-alert__badge">{{ data.messages.unread }}</span>
            </span>
            <div class="asa-alert__body">
              <p class="asa-alert__title">
                {{ $t('dashboard.messagesUnreadCount', { count: data.messages.unread }) }}
              </p>
              <p class="asa-alert__desc">{{ $t('dashboard.messagesUnreadDesc') }}</p>
            </div>
            <NuxtLink to="/messaging" class="asa-btn asa-btn--amber solid shrink-0!">
              {{ $t('common.viewMessages') }}
            </NuxtLink>
          </div>

          <div v-if="data.low_stock && data.low_stock.count > 0" class="asa-alert asa-alert--rose" role="status">
            <span class="asa-alert__icon" aria-hidden="true">
              <Box class="w-5! h-5! fill-current" />
              <span class="asa-alert__badge">{{ data.low_stock.count }}</span>
            </span>
            <div class="asa-alert__body">
              <p class="asa-alert__title">{{ $t('dashboard.lowStockTitle') }}</p>
              <p class="asa-alert__desc">{{ $t('dashboard.lowStockDesc', { count: data.low_stock.count }) }}</p>
            </div>
            <NuxtLink to="/inventory" class="asa-btn asa-btn--rose solid shrink-0!">
              {{ $t('dashboard.lowStockView') }}
            </NuxtLink>
          </div>
        </div>

        <!-- Quick Actions -->
        <section v-else-if="sec.id === 'quickActions' && sec.visible" :class="sectionSpanOf(sec)" class="asa-sec">
          <p class="asa-sec__label">{{ sectionTitleOf(sec) }}</p>
          <div class="grid! grid-cols-2! min-[480px]:grid-cols-3! sm:grid-cols-5! lg:grid-cols-5! xl:grid-cols-2! gap-3! sm:gap-4! xl:gap-5!">
            <NuxtLink v-for="link in quickLinks" :key="link.key" :to="link.to" class="asa-card asa-tile">
              <span class="asa-tile__icon asa-tint" :class="['asa-tint--' + link.key]">
                <component :is="link.icon" class="w-[22px]! h-[22px]! fill-current" />
              </span>
              <span class="asa-tile__label">{{ link.label }}</span>
            </NuxtLink>
          </div>
        </section>

        <!-- Key Metrics -->
        <section v-else-if="sec.id === 'keyMetrics' && sec.visible" :class="sectionSpanOf(sec)" class="asa-sec">
          <p class="asa-sec__label">{{ sectionTitleOf(sec) }}</p>
          <div class="grid! grid-cols-1! min-[480px]:grid-cols-2! lg:grid-cols-4! gap-3! sm:gap-4! xl:gap-5!">
            <article class="asa-card asa-metric">
              <span class="asa-metric__icon asa-tint asa-tint--teal">
                <UsersGroup class="w-5! h-5! fill-current" />
              </span>
              <div class="asa-metric__copy">
                <p class="asa-metric__value">{{ formatNumber(data.patients.total) }}</p>
                <p class="asa-metric__label">{{ $t('dashboard.totalPatients') }}</p>
              </div>
              <p class="asa-metric__foot">
                <span class="asa-dot asa-dot--green" aria-hidden="true" />
                <span>+{{ formatNumber(data.patients.yesterday) }} {{ $t('common.yesterday') }}</span>
              </p>
            </article>

            <article class="asa-card asa-metric">
              <span class="asa-metric__icon asa-tint asa-tint--green">
                <Calendar class="w-5! h-5! fill-current" />
              </span>
              <div class="asa-metric__copy">
                <p class="asa-metric__value">{{ formatNumber(data.appointments.today) }}</p>
                <p class="asa-metric__label">{{ $t('dashboard.todayAppointments') }}</p>
              </div>
              <p class="asa-metric__foot">
                <span>{{ $t('common.yesterday') }}: {{ formatNumber(data.appointments.yesterday) }}</span>
                <span class="asa-dot" aria-hidden="true" />
                <span>{{ $t('common.tomorrow') }}: {{ formatNumber(data.appointments.tomorrow) }}</span>
              </p>
            </article>

            <article class="asa-card asa-metric">
              <span class="asa-metric__icon asa-tint asa-tint--orange">
                <ChatDots class="w-5! h-5! fill-current" />
              </span>
              <div class="asa-metric__copy">
                <p class="asa-metric__value">{{ formatNumber(data.messages.today) }}</p>
                <p class="asa-metric__label">{{ $t('dashboard.todayMessages') }}</p>
              </div>
              <p class="asa-metric__foot">
                <span>{{ $t('common.yesterday') }}: {{ formatNumber(data.messages.yesterday) }}</span>
                <span class="asa-dot" aria-hidden="true" />
                <span v-if="data.messages.unread > 0" class="text-rose-500! dark:!text-rose-400!">
                  {{ $t('dashboard.unreadCount', { count: formatNumber(data.messages.unread) }) }}
                </span>
                <span v-else>0</span>
              </p>
            </article>

            <article class="asa-card asa-metric">
              <span class="asa-metric__icon asa-tint asa-tint--rose">
                <HeartPulse class="w-5! h-5! fill-current" />
              </span>
              <div class="asa-metric__copy">
                <p class="asa-metric__value">{{ formatNumber(data.visits.today) }}</p>
                <p class="asa-metric__label">{{ $t('dashboard.todayVisits') }}</p>
              </div>
              <p class="asa-metric__foot">
                <span>{{ $t('common.yesterday') }}: {{ formatNumber(data.visits.yesterday) }}</span>
                <span class="asa-dot" aria-hidden="true" />
                <span>{{ $t('dashboard.totalVisits') }}: {{ formatNumber(data.visits.total) }}</span>
              </p>
            </article>
          </div>
        </section>

        <!-- Insights & Resource Usage -->
        <section v-else-if="sec.id === 'insights' && sec.visible" :class="sectionSpanOf(sec)" class="asa-sec">
          <p class="asa-sec__label">{{ sectionTitleOf(sec) }}</p>

          <div class="grid! grid-cols-1! lg:grid-cols-3! gap-3! sm:gap-4! xl:gap-5!">
            <!-- Revenue Trend -->
            <div class="asa-card lg:col-span-2! asa-trend">
              <div class="asa-trend__head">
                <div class="asa-trend__titles">
                  <h3 class="asa-card-title">{{ $t('dashboard.revenueTrend') }}</h3>
                  <p class="asa-card-sub">{{ $t('dashboard.revenueTrendDesc') }}</p>
                </div>
                <div class="asa-trend__total">
                  <p class="asa-trend__value" dir="ltr">{{ formatToman(revenueTotal) }}</p>
                  <p class="asa-trend__caption">{{ $t('dashboard.trendTotal') }}</p>
                </div>
              </div>

              <div v-if="hasTrendData" class="relative! mt-4! animate-fade-in-up">
                <svg :viewBox="`0 0 600 210`" class="w-full! h-auto! select-none!" role="img"
                  :aria-label="$t('dashboard.revenueTrend')">
                  <defs>
                    <linearGradient id="dash-rev-fill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="var(--asa-accent)" stop-opacity="0.24" />
                      <stop offset="100%" stop-color="var(--asa-accent)" stop-opacity="0" />
                    </linearGradient>
                  </defs>

                  <line v-for="gy in yGridLines" :key="gy.id" :x1="0" :x2="600" :y1="gy.y" :y2="gy.y"
                    class="asa-chart-grid" stroke-width="1" />
                  <text v-for="gy in yGridLines" :key="gy.id" :x="600" :y="gy.y - 5" text-anchor="end"
                    class="asa-chart-axis">
                    {{ gy.label }}
                  </text>

                  <path :d="trendLayout.area" fill="url(#dash-rev-fill)" />
                  <path :d="trendLayout.line" fill="none" stroke="var(--asa-accent)" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round" />
                  <circle v-for="pt in trendLayout.dots" :key="pt.key" :cx="pt.x" :cy="pt.y" r="3"
                    fill="var(--asa-accent)" />

                  <text v-for="xl in xLabels" :key="xl.key" :x="xl.x" :y="196" text-anchor="middle"
                    class="asa-chart-axis">
                    {{ xl.label }}
                  </text>
                </svg>
              </div>

              <UiEmptyState v-else :title="$t('dashboard.noTrendData')" :description="$t('dashboard.noTrendDataDesc')"
                class="py-10!">
                <template #icon>
                  <LineChart class="w-8! h-8! text-slate-300! dark:!text-zinc-600! fill-current" />
                </template>
              </UiEmptyState>

              <div v-if="hasTrendData" class="asa-trend__foot">
                <span class="asa-legend">
                  <span class="asa-legend__dot" aria-hidden="true" />
                  {{ $t('dashboard.visitsLabel') }}
                </span>
                <NuxtLink to="/daily-reports" class="asa-link">{{ $t('common.viewAll') }}</NuxtLink>
              </div>
            </div>

            <!-- Resource Usage -->
            <div class="flex! flex-col! gap-3! sm:gap-4! xl:gap-5!">
              <div class="asa-card asa-meter">
                <div class="asa-meter__head">
                  <span class="asa-meter__icon asa-tint asa-tint--teal">
                    <ChatDots class="w-5! h-5! fill-current" />
                  </span>
                  <div>
                    <h3 class="asa-card-title">{{ $t('dashboard.smsCredit') }}</h3>
                    <p class="asa-card-sub">{{ $t('dashboard.smsCreditDesc') }}</p>
                  </div>
                </div>

                <div v-if="smsAvailable" class="asa-meter__body">
                  <div class="asa-meter__count">
                    <span class="asa-meter__value" dir="ltr">{{ formatNumber(data.sms_credit!.remaining) }}</span>
                    <span class="asa-meter__hint">
                      {{ $t('dashboard.smsOf', {
                        total: formatNumber(data.sms_credit!.sent + data.sms_credit!.remaining)
                      }) }}
                    </span>
                  </div>

                  <div class="asa-bar" role="progressbar" :aria-valuenow="smsPercent" aria-valuemin="0" aria-valuemax="100">
                    <div class="asa-bar__fill"
                      :class="smsPercent > 20 ? 'asa-bar__fill--teal' : smsPercent > 5 ? 'asa-bar__fill--amber' : 'asa-bar__fill--rose'"
                      :style="{ width: smsPercent + '%' }" />
                  </div>

                  <div class="asa-meter__meta">
                    <span class="asa-pill"
                      :class="smsPercent > 20 ? 'asa-pill--teal' : smsPercent > 5 ? 'asa-pill--amber' : 'asa-pill--rose'">
                      {{ $t('dashboard.smsRemaining', { percent: smsPercent }) }}
                    </span>
                    <span class="asa-meter__hint">
                      {{ $t('dashboard.smsSent', { count: formatNumber(data.sms_credit!.sent) }) }}
                    </span>
                  </div>
                </div>

                <div v-else class="text-center! py-7!">
                  <p class="asa-card-sub">{{ $t('dashboard.smsUnavailable') }}</p>
                </div>
              </div>

              <div class="asa-card asa-meter flex-1!">
                <div class="asa-meter__head">
                  <span class="asa-meter__icon asa-tint asa-tint--green">
                    <DocumentText class="w-5! h-5! fill-current" />
                  </span>
                  <div>
                    <h3 class="asa-card-title">{{ $t('dashboard.storage') }}</h3>
                    <p class="asa-card-sub">{{ $t('dashboard.storageDesc') }}</p>
                  </div>
                </div>

                <div class="asa-meter__body">
                  <div class="asa-meter__count">
                    <span class="asa-meter__value">{{ data.storage.usedFormatted }}</span>
                    <span class="asa-meter__hint">{{ $t('dashboard.storageCapacity') }}</span>
                  </div>

                  <div class="asa-bar" role="progressbar" :aria-valuenow="storagePercent" aria-valuemin="0" aria-valuemax="100">
                    <div class="asa-bar__fill asa-bar__fill--green" :style="{ width: storagePercent + '%' }" />
                  </div>

                  <div class="asa-meter__meta">
                    <span class="asa-pill asa-pill--green">
                      {{ $t('dashboard.storageUsed', { percent: storagePercent }) }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Daily Breakdowns -->
        <section v-else-if="sec.id === 'dailyBreakdowns' && sec.visible" :class="sectionSpanOf(sec)" class="asa-sec">
          <p class="asa-sec__label">{{ sectionTitleOf(sec) }}</p>

          <div class="grid! grid-cols-1! md:grid-cols-3! gap-3! sm:gap-4! xl:gap-5!">
            <div class="asa-card asa-panel">
              <div class="asa-panel__head">
                <span class="asa-panel__icon asa-tint asa-tint--teal asa-tint--sm">
                  <UsersGroup class="w-4! h-4! fill-current" />
                </span>
                <h3 class="asa-panel__title">{{ $t('dashboard.patients') }}</h3>
                <NuxtLink to="/patients" class="asa-link asa-link--start-end">{{ $t('common.viewAll') }}</NuxtLink>
              </div>
              <div class="asa-break">
                <BreakdownRow :label="$t('common.yesterday')" :value="data.patients.yesterday" />
                <BreakdownRow :label="$t('common.today')" :value="data.patients.today" highlight />
              </div>
            </div>

            <div class="asa-card asa-panel">
              <div class="asa-panel__head">
                <span class="asa-panel__icon asa-tint asa-tint--green asa-tint--sm">
                  <Calendar class="w-4! h-4! fill-current" />
                </span>
                <h3 class="asa-panel__title">{{ $t('dashboard.appointments') }}</h3>
                <NuxtLink to="/appointments" class="asa-link asa-link--start-end">{{ $t('common.viewAll') }}</NuxtLink>
              </div>
              <div class="asa-break">
                <BreakdownRow :label="$t('common.yesterday')" :value="data.appointments.yesterday" />
                <BreakdownRow :label="$t('common.today')" :value="data.appointments.today" highlight />
                <BreakdownRow :label="$t('common.tomorrow')" :value="data.appointments.tomorrow" />
              </div>
            </div>

            <div class="asa-card asa-panel">
              <div class="asa-panel__head">
                <span class="asa-panel__icon asa-tint asa-tint--orange asa-tint--sm">
                  <ChatDots class="w-4! h-4! fill-current" />
                </span>
                <h3 class="asa-panel__title">{{ $t('dashboard.messagesTab') }}</h3>
                <NuxtLink to="/messaging" class="asa-link asa-link--start-end">{{ $t('common.viewAll') }}</NuxtLink>
              </div>
              <div class="asa-break">
                <BreakdownRow :label="$t('common.yesterday')" :value="data.messages.yesterday" />
                <BreakdownRow :label="$t('common.today')" :value="data.messages.today" highlight />
                <div class="asa-break__row">
                  <span class="asa-break__label">{{ $t('common.unreadOnly') }}</span>
                  <span v-if="data.messages.unread > 0" class="asa-pill asa-pill--rose">
                    <span class="asa-dot asa-dot--pulse" aria-hidden="true" />
                    {{ $t('dashboard.unreadCount', { count: formatNumber(data.messages.unread) }) }}
                  </span>
                  <span v-else class="asa-break__value asa-green">0</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Visits & Financial Summary -->
        <section v-else-if="sec.id === 'supplementary' && sec.visible" :class="sectionSpanOf(sec)" class="asa-sec">
          <p class="asa-sec__label">{{ sectionTitleOf(sec) }}</p>

          <div class="grid! grid-cols-1! md:grid-cols-2! gap-3! sm:gap-4! xl:gap-5!">
            <div class="asa-card asa-panel">
              <div class="asa-panel__head">
                <span class="asa-panel__icon asa-tint asa-tint--indigo asa-tint--sm">
                  <Activity class="w-4! h-4! fill-current" />
                </span>
                <h3 class="asa-panel__title">{{ $t('dashboard.siteVisits') }}</h3>
              </div>
              <div class="asa-minis">
                <div class="asa-mini">
                  <div class="asa-mini__value">{{ formatNumber(data.visits.total) }}</div>
                  <div class="asa-mini__label">{{ $t('dashboard.totalVisits') }}</div>
                </div>
                <div class="asa-mini">
                  <div class="asa-mini__value">{{ formatNumber(data.visits.yesterday) }}</div>
                  <div class="asa-mini__label">{{ $t('common.yesterday') }}</div>
                </div>
                <div class="asa-mini asa-mini--accent">
                  <div class="asa-mini__value">{{ formatNumber(data.visits.today) }}</div>
                  <div class="asa-mini__label">{{ $t('common.today') }}</div>
                </div>
              </div>
            </div>

            <div class="asa-card asa-panel">
              <div class="asa-panel__head">
                <span class="asa-panel__icon asa-tint asa-tint--green asa-tint--sm">
                  <Wallet class="w-4! h-4! fill-current" />
                </span>
                <h3 class="asa-panel__title">{{ $t('dashboard.financialSummary') }}</h3>
                <NuxtLink to="/billing" class="asa-link asa-link--start-end">{{ $t('common.viewAll') }}</NuxtLink>
              </div>
              <div class="asa-money">
                <div class="asa-money__grid">
                  <div class="asa-money__cell asa-money__cell--green">
                    <p class="asa-money__label">{{ $t('dashboard.totalRevenue') }}</p>
                    <p class="asa-money__value" dir="ltr">{{ formatToman(data.billing.total_revenue) }}</p>
                  </div>
                  <div class="asa-money__cell asa-money__cell--amber">
                    <p class="asa-money__label">{{ $t('dashboard.pendingPayment') }}</p>
                    <p class="asa-money__value" dir="ltr">{{ formatToman(data.billing.pending_revenue) }}</p>
                  </div>
                </div>

                <div class="asa-money__foot">
                  <span>{{ $t('dashboard.invoices') }}:
                    <strong class="asa-money__strong">{{ data.billing.total }}</strong>
                  </span>
                  <span>{{ $t('dashboard.paidCount') }}:
                    <strong class="asa-money__strong asa-green">{{ data.billing.paid }}</strong>
                  </span>
                  <span>{{ $t('dashboard.pendingCount') }}:
                    <strong class="asa-money__strong asa-amber">{{ data.billing.pending }}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Doctor Schedule -->
        <section v-else-if="sec.id === 'schedule' && sec.visible && hasSchedule" :class="sectionSpanOf(sec)" class="asa-sec">
          <p class="asa-sec__label">{{ sectionTitleOf(sec) }}</p>

          <div class="asa-card asa-list-card">
            <UiLoadingSpinner v-if="loadingSchedule" class="my-8!" />

            <UiEmptyState v-else-if="!todayAppointments.length" :title="$t('dashboard.noTodayAppointments')"
              :description="$t('dashboard.todayScheduleEmpty')" class="py-12!">
              <template #icon>
                <Calendar class="w-8! h-8! text-slate-300! dark:!text-zinc-600! fill-current" />
              </template>
            </UiEmptyState>

            <ul v-else class="asa-list">
              <li v-for="appt in todayAppointments" :key="appt.id" class="asa-row">
                <div class="asa-row__main">
                  <div class="asa-date asa-date--time" dir="ltr">
                    <span class="asa-date__day">{{ appt.startTime?.slice(0, 5) }}</span>
                    <span class="asa-date__time">{{ $t('dashboard.until') }} {{ appt.endTime?.slice(0, 5) }}</span>
                  </div>
                  <div class="asa-row__text">
                    <h4 class="asa-row__title">{{ appt.patientFirstName }} {{ appt.patientLastName }}</h4>
                    <div class="asa-row__sub">
                      <span dir="ltr">{{ appt.patientPhone }}</span>
                      <span class="asa-dot" aria-hidden="true" />
                      <span>{{ $t('dashboard.nationalIdLabel') }}
                        <span dir="ltr">{{ appt.patientNationalId }}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <UiStatusBadge :status="appt.status || 'pending'" class="shrink-0!" />
              </li>
            </ul>
          </div>
        </section>
        </template>
        </div>
      </template>
    </UiPageContainer>

    <!-- ─── Edit Profile Dialog ─── -->
    <v-dialog v-model="editDialogOpen" max-width="600" persistent scrollable transition="dialog-bottom-transition"
      @keydown.esc="editDialogOpen = false">
      <v-card class="asa-dialog overflow-hidden!" elevation="0">
        <div class="asa-dialog__head">
          <div>
            <h2 class="asa-dialog__title">{{ $t('dashboard.editProfileTitle') }}</h2>
            <span class="asa-dialog__sub">{{ $t('dashboard.editProfileSubtitle') }}</span>
          </div>
          <v-btn icon variant="text" size="small" class="!text-slate-400 hover:!text-slate-800"
            @click="editDialogOpen = false">
            <CloseCircle class="w-6! h-6! fill-slate-600! dark:!fill-slate-200!" />
          </v-btn>
        </div>

        <v-card-text class="asa-dialog__body">
          <div class="space-y-5!">
            <div>
              <label class="asa-field-label">{{ $t('dashboard.phone') }}</label>
              <v-text-field v-model="editForm.phone" variant="outlined" density="comfortable" placeholder="09123456789"
                dir="ltr" hide-details class="rounded-xl!" />
            </div>
            <div>
              <label class="asa-field-label">{{ $t('dashboard.address') }}</label>
              <v-textarea v-model="editForm.address" variant="outlined" density="comfortable"
                :placeholder="$t('dashboard.addressPlaceholder')" rows="2" hide-details class="rounded-xl!" />
            </div>
            <div>
              <label class="asa-field-label">{{ $t('dashboard.insuranceType') }}</label>
              <v-select v-model="editForm.insurance_type" :items="insuranceOptions" item-title="label"
                item-value="key" variant="outlined" density="comfortable"
                :placeholder="$t('dashboard.selectInsurance')" hide-details class="rounded-xl!" />
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="asa-dialog__foot">
          <v-spacer />
          <button class="asa-btn asa-btn--ghost" @click="editDialogOpen = false">{{ $t('common.cancel') }}</button>
          <button class="asa-btn asa-btn--primary" :disabled="saving" @click="saveProfile">
            {{ saving ? $t('common.saving') : $t('dashboard.saveChanges') }}
          </button>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- ─── Customize Dashboard Dialog ─── -->
    <CustomizeDashboardDialog v-model="customizeOpen" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import moment from 'moment-jalaali'
import Calendar from '~/components/icons/Calendar.vue'
import UsersGroup from '~/components/icons/UsersGroup.vue'
import ChatDots from '~/components/icons/ChatDots.vue'
import HeartPulse from '~/components/icons/HeartPulse.vue'
import DocumentText from '~/components/icons/DocumentText.vue'
import Bell from '~/components/icons/Bell.vue'
import Box from '~/components/icons/Box.vue'
import ShieldCheck from '~/components/icons/ShieldCheck.vue'
import Profile from '~/components/icons/Profile.vue'
import CloseCircle from '~/components/icons/CloseCircle.vue'
import Settings from '~/components/icons/Settings.vue'
import Activity from '~/components/icons/Activity.vue'
import Wallet from '~/components/icons/Wallet.vue'
import FileText from '~/components/icons/FileText.vue'
import LineChart from '~/components/icons/LineChart.vue'
import BreakdownRow from '~/components/dashboard/BreakdownRow.vue'
import CustomizeDashboardDialog from '~/components/dashboard/CustomizeDashboardDialog.vue'
import { INSURANCE_TYPES, INSURANCE_TYPE_KEYS } from '~/types/insurance'
import type { InsuranceTypeKey } from '~/types/insurance'
import type { UserRole } from '~/types/user'
import type { DashboardSectionConfig } from '~/types/dashboard-layout'
const { t } = useI18n()

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

interface DashboardTrendPoint {
  date: string
  count: number
  revenue: number
}

interface DashboardLowStockItem {
  id: string
  name: string
  sku: string | null
  currentStock: string | null
  minStockLevel: number | null
  unit: string
}

interface DashboardData {
  sms_credit: DashboardSmsCredit | null
  storage: DashboardStorage
  patients: DashboardCounts
  appointments: Omit<DashboardCounts, 'total'>
  messages: DashboardMessages
  visits: DashboardVisits
  billing: DashboardBilling
  trend: DashboardTrendPoint[]
  low_stock?: {
    count: number
    items: DashboardLowStockItem[]
  }
}

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

interface ScheduleAppointment {
  id: string
  startTime?: string
  endTime?: string
  patientFirstName?: string
  patientLastName?: string
  patientPhone?: string
  patientNationalId?: string
  status?: string
}

const { apiFetch } = useApi()
const { user } = useAuth()
const { layout, sizeSpanClass, sectionTitleOf, loadLayout } = useDashboardLayout()
const { formatJalaliLong, formatJalaliDate, formatGregorianDate, toDateStr } = useFormatting()

const customizeOpen = ref(false)

const data = ref<DashboardData | null>(null)
const loading = ref(true)

const todayAppointments = ref<ScheduleAppointment[]>([])
const loadingSchedule = ref(false)

const role = computed<UserRole | undefined>(() => user?.value?.role)

const isPatient = computed(() => role.value === 'patient')

const canViewDashboard = computed(() => {
  const r = role.value
  return !!r && ['admin_doctor', 'doctor', 'lab', 'pharmacy'].includes(r)
})

const hasSchedule = computed(() => {
  return role.value === 'admin_doctor' || role.value === 'doctor'
})

const hasAlerts = computed(() => {
  return (data.value?.messages.unread ?? 0) > 0 || (data.value?.low_stock?.count ?? 0) > 0
})

function sectionSpanOf(sec: DashboardSectionConfig): string {
  return sizeSpanClass[sec.size]
}

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

const quickLinks = computed(() => [
  { key: 'inventory', label: t('inventory.title'), icon: Box, to: '/inventory' },
  { key: 'dailyReports', label: t('dailyReports.title'), icon: FileText, to: '/daily-reports' },
])

const trendData = computed(() => {
  const pts = data.value?.trend ?? []
  const map = new Map(pts.map((p) => [p.date, p]))
  const days: { key: string; label: string; value: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = toDateStr(d)
    const point = map.get(key)
    days.push({ key, label: moment(d).format('jDD'), value: (point?.revenue ?? 0) })
  }
  return days
})

const hasTrendData = computed(() => trendData.value.some((p) => p.value > 0))

const revenueTotal = computed(() => trendData.value.reduce((sum, p) => sum + p.value, 0))

const trendMax = computed(() => {
  const m = Math.max(...trendData.value.map((p) => p.value), 0)
  const inToman = m / 10
  if (inToman <= 0) return 100000
  const magnitude = Math.pow(10, Math.floor(Math.log10(inToman)))
  return magnitude * Math.ceil((inToman * 1.12) / magnitude) * 10
})

const yGridLines = computed(() => {
  const H = 210
  const PT = 18
  const PB = 26
  const innerH = H - PT - PB
  const steps = [1, 0.75, 0.5, 0.25]
  return steps.map((f, i) => ({
    id: `gy-${i}`,
    y: PT + innerH - f * innerH,
    label: formatCompactToman(trendMax.value * f / 10),
  }))
})

const trendLayout = computed(() => {
  const W = 600
  const H = 210
  const PX = 14
  const PT = 18
  const PB = 26
  const innerW = W - PX * 2
  const innerH = H - PT - PB
  const n = trendData.value.length
  const step = n > 1 ? innerW / (n - 1) : 0
  const dots = trendData.value.map((p, i) => ({
    key: p.key,
    x: PX + i * step,
    y: PT + innerH - (p.value / trendMax.value) * innerH,
  }))
  const line = dots.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(2)},${p.y.toFixed(2)}`).join(' ')
  const last = dots[dots.length - 1]!
  const first = dots[0]!
  const area = `${line} L${last.x.toFixed(2)},${(H - PB).toFixed(2)} L${first.x.toFixed(2)},${(H - PB).toFixed(2)} Z`
  return { dots, line, area }
})

const xLabels = computed(() => {
  const n = trendData.value.length
  const PX = 14
  const innerW = 600 - PX * 2
  const step = n > 1 ? innerW / (n - 1) : 0
  const indices = new Set<number>([0])
  for (let i = 1; i < n - 1; i++) if (i % 3 === 0) indices.add(i)
  indices.add(n - 1)
  return trendData.value
    .map((p, i) => ({ key: p.key, label: p.label, x: PX + i * step }))
    .filter((_, i) => indices.has(i))
})

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
    pending: t('dashboard.statusPending'),
    confirmed: t('dashboard.statusConfirmed'),
    rejected: t('dashboard.statusRejected'),
    cancelled: t('dashboard.statusCancelled'),
    completed: t('dashboard.statusCompleted'),
  }
  return map[status] || status
}

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
      useNuxtApp().$toast.success(res.message || t('dashboard.savedSuccess'))
      editDialogOpen.value = false
    }
  } catch (err: unknown) {
    const errData = (err as { data?: { error?: string } })?.data
    useNuxtApp().$toast.error(errData?.error || t('dashboard.saveError'))
  } finally {
    saving.value = false
  }
}

function formatNumber(n: number): string {
  return new Intl.NumberFormat('fa-IR').format(n)
}

function formatToman(rials: number): string {
  const toman = Math.round(rials / 10)
  return new Intl.NumberFormat('fa-IR').format(toman) + ' ' + t('common.toman')
}

function formatCompactToman(rials: number): string {
  const toman = Math.max(0, Math.round(rials / 10))
  return new Intl.NumberFormat('fa-IR', { notation: 'compact', maximumFractionDigits: 1 }).format(toman)
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
    const apptRes = await apiFetch<{ success: boolean; data: ScheduleAppointment[] }>(`/api/scheduling/appointments?date=${todayDateStr.value}`)
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
    const uid = user.value?.id
    if (uid) loadLayout(uid)
  } else {
    loading.value = false
  }
  if (hasSchedule.value) {
    fetchDoctorSchedule()
  }
})

useSeoMeta({ title: () => `${t('dashboard.title')} | ${t('seo.systemManagement')}`, ogTitle: () => t('seo.homepage') })
</script>

<style scoped>
/* ═══════════════════════════════════════════════════
   DASHBOARD — Apple / iOS design language
   inset grouped cards · system tints · SF type rhythm
   ═══════════════════════════════════════════════════ */

/* ── Large-title page header ───────────────────────── */

.dash-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-top: 0.25rem;
}

.dash-head__title {
  font-size: clamp(1.9rem, 4.5vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: var(--asa-label);
}

.dash-head__date {
  margin-top: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 400;
  color: var(--asa-label-2);
}

.dash-head__actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
  margin-bottom: 0.125rem;
}

/* ── Section captions (iOS grouped-list headers) ───── */

.asa-sec {
  margin-top: 2.25rem;
}

.asa-sec__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label-2);
  margin-bottom: 0.75rem;
  padding-inline: 0.25rem;
}

/* ── Buttons ───────────────────────────────────────── */

.asa-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: 2.5rem;
  padding: 0 1.25rem;
  border: none;
  border-radius: 0.75rem;
  font-size: 0.8125rem;
  font-weight: 600;
  letter-spacing: 0.01em;
  cursor: pointer;
  white-space: nowrap;
  transition: background-color 150ms var(--ease-default), transform 120ms var(--ease-default),
    box-shadow 150ms var(--ease-default);
  box-shadow: inset 0 -1px 0 rgba(0, 0, 0, 0.08);
  text-decoration: none;
}

.asa-btn:active {
  transform: scale(0.97);
}

.asa-btn:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--asa-accent) 45%, transparent);
  outline-offset: 2px;
}

.asa-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.asa-btn--primary {
  background: var(--asa-accent);
  color: #ffffff;
}

.asa-btn--primary:hover {
  background: color-mix(in srgb, var(--asa-accent) 88%, #000);
}

.dark .asa-btn--primary:hover {
  background: color-mix(in srgb, var(--asa-accent) 78%, #fff);
}

.asa-btn--ghost {
  background: rgba(116, 116, 128, 0.12);
  color: var(--asa-label);
  box-shadow: none;
}

.asa-btn--ghost:hover {
  background: rgba(116, 116, 128, 0.2);
}

.asa-btn--amber {
  background: #ff9500;
  color: #ffffff;
}

.asa-btn--amber:hover {
  background: #e08600;
}

.asa-btn--rose {
  background: #ff3b30;
  color: #ffffff;
}

.asa-btn--rose:hover {
  background: #d6231a;
}

/* ── Base card (iOS inset grouped) ─────────────────── */

.asa-card {
  position: relative;
  background: var(--asa-bg-card);
  border: 1px solid var(--asa-card-ring);
  border-radius: 1.375rem;
  box-shadow: var(--asa-card-shadow);
  padding: 1.375rem;
  color: var(--asa-label);
  transition: transform 220ms var(--ease-premium), box-shadow 220ms var(--ease-premium),
    border-color 220ms var(--ease-premium);
}

@media (hover: hover) {

  .asa-card:hover {
    box-shadow: 0 2px 4px rgba(17, 24, 39, 0.04), 0 16px 32px -14px rgba(17, 24, 39, 0.2);
  }

  .asa-tile:hover {
    transform: translateY(-2px);
  }

  .dark .asa-card:hover {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4), 0 22px 44px -22px rgba(0, 0, 0, 0.8);
  }
}

.asa-card-title {
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.3;
  color: var(--asa-label);
}

.asa-card-sub {
  margin-top: 0.125rem;
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--asa-label-2);
}

.asa-link {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-accent-deep);
  text-decoration: none;
}

.dark .asa-link {
  color: var(--asa-accent);
}

.asa-link:hover {
  text-decoration: underline;
}

.asa-link--start-end {
  margin-inline-start: auto;
}

/* ── Tints (Apple system swatches) ─────────────────── */

.asa-tint {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.875rem;
  flex-shrink: 0;
}

.asa-tint--sm {
  width: 2rem;
  height: 2rem;
  border-radius: 0.625rem;
}

.asa-tint--teal {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.dark .asa-tint--teal {
  color: var(--asa-accent);
}

.asa-tint--green {
  background: var(--asa-green-soft);
  color: var(--asa-green);
}

.asa-tint--orange {
  background: var(--asa-amber-soft);
  color: var(--asa-amber);
}

.asa-tint--rose {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

.asa-tint--indigo {
  background: var(--asa-indigo-soft);
  color: var(--asa-indigo);
}

/* Semantic text helpers */
.asa-green {
  color: var(--asa-green) !important;
}

.asa-amber {
  color: var(--asa-amber) !important;
}

.asa-text-xl {
  font-size: 1.375rem !important;
}

/* ── Metric cards ──────────────────────────────────── */

.asa-metric {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 0.5rem 1rem;
}

.asa-metric__copy {
  min-width: 0;
  text-align: end;
}

.asa-metric__value {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.1;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.asa-metric__label {
  margin-top: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-2);
}

.asa-metric__foot {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--asa-sep);
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

/* Small inline dots */
.asa-dot {
  display: inline-block;
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background: var(--asa-label-3);
  flex-shrink: 0;
}

.asa-dot--green {
  background: var(--asa-green);
}

.asa-dot--pulse {
  background: var(--asa-rose);
  animation: asa-pulse 2s ease-in-out infinite;
}

@keyframes asa-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}

/* ── Quick-action tiles (iOS widget style) ─────────── */

.asa-tile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  min-height: 8.25rem;
  padding: 1.25rem 1rem;
  text-decoration: none;
}

.asa-tile:focus-visible {
  outline: 3px solid color-mix(in srgb, var(--asa-accent) 45%, transparent);
  outline-offset: 2px;
}

.asa-tile__icon {
  width: 3.25rem;
  height: 3.25rem;
  border-radius: 1rem;
}

.asa-tile__label {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label);
  text-align: center;
}

/* ── Alerts (tinted announcement cards) ────────────── */

.asa-alert {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.875rem;
  padding: 0.875rem 1rem;
  border-radius: 1.25rem;
  border: 1px solid transparent;
}

.asa-alert--amber {
  background: #fff6e5;
  border-color: rgba(255, 149, 0, 0.32);
}

.dark .asa-alert--amber {
  background: rgba(255, 149, 0, 0.12);
  border-color: rgba(255, 149, 0, 0.28);
}

.asa-alert--rose {
  background: #fff1f2;
  border-color: rgba(255, 59, 48, 0.26);
}

.dark .asa-alert--rose {
  background: rgba(255, 59, 48, 0.12);
  border-color: rgba(255, 59, 48, 0.26);
}

.asa-alert__icon {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.875rem;
  flex-shrink: 0;
}

.asa-alert--amber .asa-alert__icon {
  background: var(--asa-amber-soft);
  color: var(--asa-amber);
}

.asa-alert--rose .asa-alert__icon {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

.asa-alert__badge {
  position: absolute;
  top: -0.375rem;
  inset-inline-end: -0.375rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.15rem;
  height: 1.15rem;
  padding: 0 0.25rem;
  border-radius: 9999px;
  background: #ff453a;
  color: #ffffff;
  font-size: 0.625rem;
  font-weight: 700;
}

.dark .asa-alert__badge {
  background: #ff453a;
}

.asa-alert__body {
  flex: 1 1 14rem;
  min-width: 0;
}

.asa-alert__title {
  font-size: 0.8125rem;
  font-weight: 700;
  line-height: 1.4;
  color: var(--asa-label);
}

.asa-alert__desc {
  margin-top: 0.125rem;
  font-size: 0.75rem;
  line-height: 1.5;
  color: var(--asa-label-2);
}

/* ── Welcome hero (patient) ────────────────────────── */

.asa-hero {
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
  background: linear-gradient(140deg, #0e9a92 0%, #0b7c77 52%, #0a6764 100%);
  box-shadow: 0 24px 48px -20px rgba(11, 124, 119, 0.5);
  color: #ffffff;
}

.dark .asa-hero {
  background: linear-gradient(140deg, #0f7f78 0%, #0d615d 60%, rgba(9, 45, 44, 0.95) 100%);
}

.asa-hero__orb {
  position: absolute;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  pointer-events: none;
}

.asa-hero__orb--a {
  width: 16rem;
  height: 16rem;
  top: -6rem;
  inset-inline-end: -4rem;
}

.asa-hero__orb--b {
  width: 10rem;
  height: 10rem;
  bottom: -5rem;
  inset-inline-start: -3rem;
}

.asa-hero__inner {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.75rem 1.5rem;
}

@media (min-width: 640px) {
  .asa-hero__inner {
    padding: 2.25rem 2.25rem;
  }
}

.asa-hero__eyebrow {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: rgba(255, 255, 255, 0.72);
}

.asa-hero__title {
  margin-top: 0.5rem;
  font-size: clamp(1.375rem, 4vw, 2.25rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.asa-hero__desc {
  margin-top: 0.625rem;
  max-width: 36rem;
  font-size: 0.8125rem;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.85);
}

.asa-hero__avatar {
  display: none;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  flex-shrink: 0;
  border-radius: 1.25rem;
  background: rgba(255, 255, 255, 0.16);
  border: 1px solid rgba(255, 255, 255, 0.28);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

@media (min-width: 640px) {
  .asa-hero__avatar {
    display: inline-flex;
  }
}

/* ── Revenue trend card ────────────────────────────── */

.asa-trend__head {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.asa-trend__titles {
  min-width: 0;
}

.asa-trend__total {
  text-align: end;
}

.asa-trend__value {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.asa-trend__caption {
  margin-top: 0.125rem;
  font-size: 0.6875rem;
  color: var(--asa-label-2);
}

.asa-trend__foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.875rem;
  padding-top: 0.875rem;
  border-top: 1px solid var(--asa-sep);
}

.asa-legend {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

.asa-legend__dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  background: var(--asa-accent);
  box-shadow: 0 0 0 3px var(--asa-accent-soft);
}

.asa-chart-grid {
  stroke: var(--asa-sep);
}

.asa-chart-axis {
  fill: var(--asa-label-3);
  font-size: 10px;
}

/* ── Meters (SMS / storage) ────────────────────────── */

.asa-meter {
  display: flex;
  flex-direction: column;
}

.asa-meter__head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.125rem;
}

.asa-meter__icon {
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.875rem;
}

.asa-meter__body {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  flex: 1;
}

.asa-meter__count {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
}

.asa-meter__value {
  font-size: 1.625rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.asa-meter__hint {
  font-size: 0.75rem;
  color: var(--asa-label-2);
  text-align: end;
}

.asa-meter__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: auto;
}

/* Thin iOS progress bar */
.asa-bar {
  height: 0.375rem;
  border-radius: 9999px;
  background: var(--asa-track);
  overflow: hidden;
}

.asa-bar__fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 1000ms var(--ease-premium);
}

.asa-bar__fill--teal {
  background: linear-gradient(90deg, #17c9cf, var(--asa-accent));
}

.asa-bar__fill--green {
  background: linear-gradient(90deg, #3ddc84, #28a745);
}

.asa-bar__fill--amber {
  background: linear-gradient(90deg, #ffd60a, #ff9f0a);
}

.asa-bar__fill--rose {
  background: linear-gradient(90deg, #ff6961, #ff3b30);
}

/* Pills */
.asa-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: 0.6875rem;
  font-weight: 600;
}

.asa-pill--teal {
  background: var(--asa-accent-soft);
  color: var(--asa-accent-deep);
}

.dark .asa-pill--teal {
  color: var(--asa-accent);
}

.asa-pill--green {
  background: var(--asa-green-soft);
  color: var(--asa-green);
}

.asa-pill--amber {
  background: var(--asa-amber-soft);
  color: var(--asa-amber);
}

.asa-pill--rose {
  background: var(--asa-rose-soft);
  color: var(--asa-rose);
}

/* ── Panels (breakdowns / visits / finance) ────────── */

.asa-panel {
  padding: 0;
  overflow: hidden;
}

.asa-panel__head {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.125rem 1.25rem;
  border-bottom: 1px solid var(--asa-sep);
}

.asa-panel__title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--asa-label);
}

.asa-break {
  padding-top: 0.25rem;
}

.asa-break__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-inline: 1.25rem;
  padding-block: 0.875rem;
}

.asa-break__label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--asa-label-2);
}

.asa-break__value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--asa-label);
}

/* Mini stats (site visits) */
.asa-minis {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem;
  padding: 1.25rem;
}

.asa-mini {
  padding: 0.875rem 0.5rem;
  border-radius: 1rem;
  background: color-mix(in srgb, var(--asa-label) 5%, transparent);
  text-align: center;
}

.dark .asa-mini {
  background: rgba(255, 255, 255, 0.06);
}

.asa-mini--accent {
  background: var(--asa-accent-soft);
}

.asa-mini__value {
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.015em;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.asa-mini--accent .asa-mini__value {
  color: var(--asa-accent-deep);
}

.dark .asa-mini--accent .asa-mini__value {
  color: var(--asa-accent);
}

.asa-mini__label {
  margin-top: 0.25rem;
  font-size: 0.6875rem;
  font-weight: 500;
  color: var(--asa-label-2);
}

/* Financial summary */
.asa-money {
  padding: 1.25rem;
}

.asa-money__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.asa-money__cell {
  padding: 0.875rem 1rem;
  border-radius: 1rem;
  border: 1px solid transparent;
}

.asa-money__cell--green {
  background: var(--asa-green-soft);
  border-color: color-mix(in srgb, var(--asa-green) 28%, transparent);
}

.asa-money__cell--amber {
  background: var(--asa-amber-soft);
  border-color: color-mix(in srgb, var(--asa-amber) 28%, transparent);
}

.asa-money__label {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--asa-label-2);
}

.asa-money__value {
  margin-top: 0.375rem;
  font-size: 1.0625rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--asa-label);
  font-variant-numeric: tabular-nums;
}

.asa-money__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--asa-sep);
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

.asa-money__strong {
  font-weight: 600;
  color: var(--asa-label);
}

/* ── Inset lists & rows ────────────────────────────── */

.asa-list-card {
  padding: 0;
  overflow: hidden;
}

.asa-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.25rem;
  transition: background-color 150ms var(--ease-default);
}

.asa-list .asa-row + .asa-row {
  border-top: 1px solid var(--asa-sep);
}

@media (hover: hover) {

  .asa-row:hover {
    background-color: color-mix(in srgb, var(--asa-label) 4%, transparent);
  }

  .dark .asa-row:hover {
    background-color: rgba(255, 255, 255, 0.04);
  }
}

.asa-row__main {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
  flex: 1 1 auto;
}

.asa-row__text {
  min-width: 0;
}

.asa-row__title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--asa-label);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.asa-row__sub {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.375rem;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

/* Date / time chips */
.asa-date {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 4.5rem;
  padding: 0.5rem 0.875rem;
  border-radius: 0.875rem;
  background: var(--asa-green-soft);
  border: 1px solid color-mix(in srgb, var(--asa-green) 24%, transparent);
}

.asa-date--time {
  background: color-mix(in srgb, var(--asa-label) 6%, transparent);
  border-color: var(--asa-sep);
  min-width: 4.25rem;
}

.asa-date__day {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--asa-green);
}

.asa-date--time .asa-date__day {
  color: var(--asa-label);
}

.asa-date__time {
  margin-top: 0.125rem;
  font-size: 0.625rem;
  color: var(--asa-label-2);
}

/* Info grid (patient profile) */
.asa-info-cell {
  min-width: 0;
}

.asa-info-label {
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--asa-label-2);
  margin-bottom: 0.375rem;
}

.asa-info-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--asa-label);
  overflow-wrap: anywhere;
}

/* Card footer bar (profile edit) */
.asa-card-foot {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--asa-sep);
  background: color-mix(in srgb, var(--asa-label) 3%, transparent);
}

@media (min-width: 640px) {
  .asa-card-foot {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding-inline: 1.5rem;
  }
}

.asa-card-foot__text {
  font-size: 0.75rem;
  color: var(--asa-label-2);
}

/* ── Skeleton ──────────────────────────────────────── */

.asa-skel {
  position: relative;
  overflow: hidden;
  background: color-mix(in srgb, var(--asa-label) 7%, transparent);
}

.dark .asa-skel {
  background: rgba(255, 255, 255, 0.07);
}

.asa-skel::after {
  content: '';
  position: absolute;
  inset: 0;
  transform: translateX(-100%);
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.55), transparent);
  animation: asa-shimmer 1.6s ease-in-out infinite;
}

.dark .asa-skel::after {
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.07), transparent);
}

@keyframes asa-shimmer {
  100% {
    transform: translateX(100%);
  }
}

/* ── Edit profile dialog ───────────────────────────── */

.asa-dialog {
  border-radius: 1.25rem !important;
  border: 1px solid var(--asa-card-ring);
}

.asa-dialog__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.375rem 1.5rem 0.75rem;
}

.asa-dialog__title {
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--asa-label);
}

.asa-dialog__sub {
  display: block;
  margin-top: 0.375rem;
  font-size: 0.8125rem;
  color: var(--asa-label-2);
}

.asa-dialog__body {
  padding: 1rem 1.5rem !important;
  background: transparent !important;
}

.asa-field-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--asa-label-2);
}

.asa-dialog__foot {
  padding: 0.875rem 1.5rem 1.25rem !important;
  border-top: 1px solid var(--asa-sep);
}

/* ── Scroll reveal (entrance, one pass) ────────────── */

.asa-card,
.asa-hero,
.asa-alert {
  animation: asa-rise 480ms var(--ease-premium) both;
}

.asa-sec:nth-of-type(2) .asa-card,
.asa-sec:nth-of-type(2) .asa-hero {
  animation-delay: 60ms;
}

.asa-sec:nth-of-type(3) .asa-card,
.asa-sec:nth-of-type(3) .asa-hero {
  animation-delay: 120ms;
}

.asa-sec:nth-of-type(4) .asa-card,
.asa-sec:nth-of-type(4) .asa-hero {
  animation-delay: 180ms;
}

@keyframes asa-rise {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ── Responsive tuning ─────────────────────────────── */

@media (max-width: 639px) {
  .dash-head {
    margin-bottom: 1.25rem;
  }

  .asa-sec {
    margin-top: 1.75rem;
  }

  .asa-card {
    padding: 1.125rem;
    border-radius: 1.125rem;
  }

  .asa-metric__value {
    font-size: 1.625rem;
  }

  .asa-tile {
    min-height: 7rem;
    padding: 1rem 0.75rem;
  }

  .asa-tile__icon {
    width: 2.875rem;
    height: 2.875rem;
  }

  .asa-row {
    padding: 0.875rem 1rem;
  }

  .asa-row__main {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .asa-alert {
    padding: 0.75rem 0.875rem;
  }

  .asa-alert__body {
    flex-basis: calc(100% - 4.5rem);
  }
}

@media (min-width: 1280px) {
  .asa-sec {
    margin-top: 2rem;
  }

  .dash-grid .asa-metric {
    padding: 1.125rem 1.25rem;
  }

  .dash-grid .asa-metric__value {
    font-size: 1.625rem;
  }

  .dash-grid .asa-tile {
    min-height: 7.5rem;
    padding: 1rem 0.75rem;
  }

  .dash-grid .asa-tile__icon {
    width: 2.875rem;
    height: 2.875rem;
  }
}

/* ── Motion preferences ────────────────────────────── */

@media (prefers-reduced-motion: reduce) {

  .asa-card,
  .asa-hero,
  .asa-alert {
    animation: none;
  }

  .asa-card,
  .asa-tile {
    transition: none;
  }

  .asa-dot--pulse {
    animation: none;
  }

  .asa-skel::after {
    animation: none;
  }
}
</style>

<style>
/* ─────────────────────────────────────────────────────
   DASHBOARD — design tokens (global so both the page and
   the teleported edit dialog inherit the correct values)
   ───────────────────────────────────────────────────── */

:root {
  --asa-bg-card: #ffffff;
  --asa-card-ring: rgba(0, 0, 0, 0.055);
  --asa-card-shadow: 0 1px 2px rgba(17, 24, 39, 0.04), 0 10px 22px -14px rgba(17, 24, 39, 0.16);
  --asa-label: #1d1d1f;
  --asa-label-2: #6e6e73;
  --asa-label-3: #aeaeb2;
  --asa-sep: rgba(60, 60, 67, 0.16);
  --asa-track: rgba(120, 120, 128, 0.18);
  --asa-accent: #00adb5;
  --asa-accent-deep: #008c93;
  --asa-accent-soft: rgba(0, 173, 181, 0.14);
  --asa-green: #1a7f37;
  --asa-green-soft: rgba(52, 199, 89, 0.16);
  --asa-amber: #a15c00;
  --asa-amber-soft: rgba(255, 149, 0, 0.16);
  --asa-rose: #d70015;
  --asa-rose-soft: rgba(255, 59, 48, 0.14);
  --asa-indigo: #4b47b3;
  --asa-indigo-soft: rgba(88, 86, 214, 0.16);
}

:root.dark {
  --asa-bg-card: #1c1c1e;
  --asa-card-ring: rgba(255, 255, 255, 0.09);
  --asa-card-shadow: 0 1px 2px rgba(0, 0, 0, 0.4), 0 18px 36px -20px rgba(0, 0, 0, 0.7);
  --asa-label: #f5f5f7;
  --asa-label-2: rgba(235, 235, 245, 0.6);
  --asa-label-3: rgba(235, 235, 245, 0.3);
  --asa-sep: rgba(255, 255, 255, 0.09);
  --asa-track: rgba(120, 120, 128, 0.34);
  --asa-accent: #22d3ee;
  --asa-accent-deep: #67e8f9;
  --asa-accent-soft: rgba(34, 211, 238, 0.16);
  --asa-green: #30d158;
  --asa-green-soft: rgba(48, 209, 88, 0.16);
  --asa-amber: #ff9f0a;
  --asa-amber-soft: rgba(255, 159, 10, 0.16);
  --asa-rose: #ff453a;
  --asa-rose-soft: rgba(255, 69, 58, 0.14);
  --asa-indigo: #9290f8;
  --asa-indigo-soft: rgba(94, 92, 230, 0.2);
}
</style>