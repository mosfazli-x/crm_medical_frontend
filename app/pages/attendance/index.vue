<template>
  <UiPageContainer class="relative! max-w-7xl! mx-auto!">
    <!-- ══════════ HEADER ══════════ -->
    <header class="dash-head">
      <div class="dash-head__copy">
        <h1 class="dash-head__title">{{ t('attendance.title') }}</h1>
        <p class="dash-head__date">
          {{ isAdmin ? t('attendance.adminSubtitle') : t('attendance.employeeSubtitle') }}
        </p>
      </div>
      <div class="dash-head__actions">
        <button
          class="asa-btn asa-btn--ghost"
          :disabled="busy"
          :aria-label="t('attendance.refresh')"
          :title="t('attendance.refresh')"
          @click="refresh"
        >
          <v-icon size="16" :class="{ 'pf-spin': busy }">mdi-refresh</v-icon>
        </button>
        <button v-if="isAdmin" class="asa-btn asa-btn--primary" @click="bulkOpen = true">
          <ClipboardCheck class="w-4! h-4! stroke-current" />
          <span>{{ t('attendance.manualEntry') }}</span>
        </button>
      </div>
    </header>

    <!-- ══════════════════════════════════════════════════════════
         ADMIN VIEW
    ═══════════════════════════════════════════════════════════ -->
    <template v-if="isAdmin">
      <!-- Hero: today's snapshot -->
      <section class="asa-hero">
        <span class="asa-hero__orb asa-hero__orb--a" aria-hidden="true" />
        <span class="asa-hero__orb asa-hero__orb--b" aria-hidden="true" />

        <div class="asa-hero__inner">
          <div class="asa-hero__copy">
            <p class="asa-hero__eyebrow">{{ todayLabel }}</p>
            <h2 class="asa-hero__title">{{ t('attendance.heroTitle') }}</h2>
            <p class="asa-hero__desc">{{ t('attendance.heroDesc') }}</p>
          </div>
          <div class="asa-hero__avatar" aria-hidden="true">
            <ClipboardCheck class="w-6! h-6! stroke-current" />
          </div>
        </div>

        <div class="asa-hero__stats">
          <div v-for="stat in heroStats" :key="stat.key" class="asa-hero__stat">
            <span class="asa-hero__stat-ic">
              <component :is="stat.icon" class="w-3.5! h-3.5! stroke-current" />
            </span>
            <span class="asa-hero__stat-copy">
              <span class="asa-hero__stat-value">{{ pn(stat.value) }}</span>
              <span class="asa-hero__stat-label">{{ stat.label }}</span>
            </span>
          </div>
        </div>
      </section>

      <!-- Report / summary card -->
      <div class="asa-card pf-table-card mt-5!">
        <!-- Toolbar -->
        <div class="pf-toolbar att-toolbar">
          <div class="att-daterange">
            <span class="asa-field-label">{{ t('attendance.fromDate') }}</span>
            <PersianDatetimePicker
              v-model="filters.startDate"
              class="asa-datepicker"
              type="date"
              input-format="jYYYY-jMM-jDD"
              display-format="jYYYY/jMM/jDD"
              format="jYYYY-jMM-jDD"
              color="#00ADB5"
              auto-submit
              clearable
              :max="today"
              :placeholder="t('attendance.fromDate')"
            />
          </div>

          <div class="att-daterange">
            <span class="asa-field-label">{{ t('attendance.toDate') }}</span>
            <PersianDatetimePicker
              v-model="filters.endDate"
              class="asa-datepicker"
              type="date"
              input-format="jYYYY-jMM-jDD"
              display-format="jYYYY/jMM/jDD"
              format="jYYYY-jMM-jDD"
              color="#00ADB5"
              auto-submit
              clearable
              :max="today"
              :placeholder="t('attendance.toDate')"
            />
          </div>

          <div class="pf-seg" role="group" :aria-label="t('attendance.status')">
            <button
              v-for="seg in statusSegments"
              :key="seg.value"
              type="button"
              class="pf-seg__btn"
              :class="{ 'pf-seg__btn--on': status === seg.value }"
              :aria-pressed="status === seg.value"
              @click="status = seg.value"
            >
              <span>{{ seg.label }}</span>
              <span class="pf-seg__count">{{ pn(seg.count) }}</span>
            </button>
          </div>

          <div class="pf-toolbar__tail">
            <v-select
              v-model="filters.staffId"
              :items="staffOptions"
              item-title="title"
              item-value="value"
              variant="solo"
              density="compact"
              hide-details
              clearable
              :placeholder="t('attendance.staffLabel')"
              :aria-label="t('attendance.staffLabel')"
              prepend-inner-icon="mdi-account-search-outline"
              class="att-select"
            />
            <button
              class="pf-icon-btn"
              type="button"
              :class="{ 'pf-icon-btn--on': view === 'summary' }"
              :title="t('attendance.viewToggle')"
              :aria-label="t('attendance.viewToggle')"
              :aria-pressed="view === 'summary'"
              @click="view = view === 'records' ? 'summary' : 'records'"
            >
              <v-icon size="18">
                {{ view === 'records' ? 'mdi-chart-box-outline' : 'mdi-table-large' }}
              </v-icon>
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading">
          <div class="pf-skel">
            <div v-for="i in 6" :key="`sk-${i}`" class="pf-skel__row">
              <div class="asa-skel h-4! w-32! rounded-md!" />
              <div class="asa-skel h-4! w-40! rounded-md!" />
              <div class="asa-skel h-4! w-20! rounded-md!" />
            </div>
          </div>
        </div>

        <!-- Load error -->
        <div v-else-if="error" class="pf-empty">
          <div class="asa-tint asa-tint--rose pf-tint-lg">
            <v-icon size="26">mdi-cloud-alert-outline</v-icon>
          </div>
          <div>
            <p class="pf-empty__title">{{ t('attendance.loadErrorTitle') }}</p>
            <p class="pf-empty__desc">{{ t('attendance.fetchReportError') }}</p>
          </div>
          <div class="pf-empty__actions">
            <button class="asa-btn asa-btn--primary asa-btn--sm" @click="fetchReport">
              <v-icon size="15">mdi-refresh</v-icon>
              <span>{{ t('common.retry') }}</span>
            </button>
          </div>
        </div>

        <!-- No data at all for the range -->
        <div v-else-if="view === 'records' && !filteredRecords.length" class="pf-empty">
          <div class="asa-tint asa-tint--teal pf-tint-lg">
            <CalendarOff class="w-6! h-6! stroke-current" />
          </div>
          <div>
            <p class="pf-empty__title">{{ t('attendance.noRecords') }}</p>
            <p class="pf-empty__desc">{{ t('attendance.noRecordsDesc') }}</p>
          </div>
          <div class="pf-empty__actions">
            <button class="asa-btn asa-btn--primary asa-btn--sm" @click="bulkOpen = true">
              <ClipboardCheck class="w-4! h-4! stroke-current" />
              <span>{{ t('attendance.manualEntry') }}</span>
            </button>
          </div>
        </div>

        <div v-else-if="view === 'summary' && !summaryRows.length" class="pf-empty">
          <div class="asa-tint asa-tint--indigo pf-tint-lg">
            <Activity class="w-6! h-6! stroke-current" />
          </div>
          <div>
            <p class="pf-empty__title">{{ t('attendance.noSummary') }}</p>
            <p class="pf-empty__desc">{{ t('attendance.noSummaryDesc') }}</p>
          </div>
        </div>

        <!-- ── Records table ── -->
        <template v-else-if="view === 'records'">
          <div class="asa-table-wrap att-table-wrap">
            <table class="pf-table">
              <thead>
                <tr>
                  <th class="pf-pl0">
                    <button
                      type="button"
                      class="pf-th-btn"
                      :class="{ 'pf-th-btn--active': sortKey === 'staffName' }"
                      :aria-sort="ariaSort('staffName')"
                      @click="toggleSort('staffName')"
                    >
                      <span>{{ t('attendance.staffName') }}</span>
                      <v-icon size="13" :class="['pf-th-ic', { 'pf-th-ic--on': sortKey === 'staffName' }]">
                        {{ sortIcon('staffName') }}
                      </v-icon>
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      class="pf-th-btn"
                      :class="{ 'pf-th-btn--active': sortKey === 'date' }"
                      :aria-sort="ariaSort('date')"
                      @click="toggleSort('date')"
                    >
                      <span>{{ t('common.date') }}</span>
                      <v-icon size="13" :class="['pf-th-ic', { 'pf-th-ic--on': sortKey === 'date' }]">
                        {{ sortIcon('date') }}
                      </v-icon>
                    </button>
                  </th>
                  <th>
                    <button
                      type="button"
                      class="pf-th-btn"
                      :class="{ 'pf-th-btn--active': sortKey === 'status' }"
                      :aria-sort="ariaSort('status')"
                      @click="toggleSort('status')"
                    >
                      <span>{{ t('attendance.status') }}</span>
                      <v-icon size="13" :class="['pf-th-ic', { 'pf-th-ic--on': sortKey === 'status' }]">
                        {{ sortIcon('status') }}
                      </v-icon>
                    </button>
                  </th>
                  <th>{{ t('attendance.workHours') }}</th>
                  <th>
                    <button
                      type="button"
                      class="pf-th-btn"
                      :class="{ 'pf-th-btn--active': sortKey === 'workedMinutes' }"
                      :aria-sort="ariaSort('workedMinutes')"
                      @click="toggleSort('workedMinutes')"
                    >
                      <span>{{ t('attendance.workDuration') }}</span>
                      <v-icon size="13" :class="['pf-th-ic', { 'pf-th-ic--on': sortKey === 'workedMinutes' }]">
                        {{ sortIcon('workedMinutes') }}
                      </v-icon>
                    </button>
                  </th>
                  <th>{{ t('attendance.workLocation') }}</th>
                  <th class="pf-ta-end">{{ t('attendance.actions') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="record in visibleRecords"
                  :key="record.id"
                  :class="{ 'pf-row-tr--current': record.date === today }"
                >
                  <td class="pf-pl0">
                    <div class="att-person">
                      <span class="att-avatar">{{ initials(record.staffName) }}</span>
                      <span class="att-person__copy">
                        <span class="att-person__name">{{ record.staffName || '---' }}</span>
                        <span v-if="record.staffPosition" class="pf-sub">{{ record.staffPosition }}</span>
                      </span>
                    </div>
                  </td>
                  <td class="pf-dt">{{ prettyDate(record.date) }}</td>
                  <td>
                    <span class="asa-pill" :class="statusPill(record.status)">
                      {{ t(`attendance.status.${record.status}`) }}
                    </span>
                  </td>
                  <td>
                    <span v-if="record.sessions.length" class="att-sessions">
                      <span v-for="(session, i) in record.sessions" :key="i" class="att-session">
                        <v-icon size="11">mdi-arrow-left-right</v-icon>
                        {{ sessionLabel(session) }}
                      </span>
                    </span>
                    <span v-else class="pf-pill--neutral asa-pill">---</span>
                  </td>
                  <td class="att-duration">{{ formatMinutes(record.workedMinutes) }}</td>
                  <td>
                    <span v-if="record.workLocation" class="pf-sub">
                      <v-icon size="13">{{ locationIcon(record.workLocation) }}</v-icon>
                      {{ t(`attendance.location.${record.workLocation}`) }}
                    </span>
                    <span v-else class="pf-pill--neutral asa-pill">---</span>
                  </td>
                  <td class="pf-ta-end">
                    <button
                      class="pf-icon-btn"
                      type="button"
                      :title="t('attendance.edit')"
                      :aria-label="t('attendance.edit')"
                      @click="openEditor(record)"
                    >
                      <Pencil class="w-4! h-4! stroke-current" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Mobile roster -->
          <div v-if="visibleRecords.length" class="pf-roster att-roster">
            <div v-for="record in visibleRecords" :key="`m-${record.id}`" class="pf-roster__item">
              <span class="att-avatar">{{ initials(record.staffName) }}</span>
              <div class="pf-roster__body">
                <div class="pf-roster__top">
                  <span class="pf-roster__name">{{ record.staffName || '---' }}</span>
                  <span class="asa-pill" :class="statusPill(record.status)">
                    {{ t(`attendance.status.${record.status}`) }}
                  </span>
                </div>
                <div class="pf-roster__meta">
                  <span>
                    <v-icon size="13">mdi-calendar-blank-outline</v-icon>
                    {{ prettyDate(record.date) }}
                  </span>
                  <span>
                    <v-icon size="13">mdi-timer-outline</v-icon>
                    {{ formatMinutes(record.workedMinutes) }}
                  </span>
                  <span v-if="record.workLocation">
                    <v-icon size="13">{{ locationIcon(record.workLocation) }}</v-icon>
                    {{ t(`attendance.location.${record.workLocation}`) }}
                  </span>
                </div>
                <div v-if="record.sessions.length" class="att-sessions">
                  <span v-for="(session, i) in record.sessions" :key="`ms-${i}`" class="att-session">
                    <v-icon size="11">mdi-arrow-left-right</v-icon>
                    {{ sessionLabel(session) }}
                  </span>
                </div>
              </div>
              <div class="pf-roster__actions">
                <button
                  class="pf-icon-btn"
                  type="button"
                  :title="t('attendance.edit')"
                  :aria-label="t('attendance.edit')"
                  @click="openEditor(record)"
                >
                  <Pencil class="w-4! h-4! stroke-current" />
                </button>
              </div>
            </div>
          </div>
        </template>

        <!-- ── Summary ── -->
        <template v-else>
          <div class="att-summary">
            <div v-for="row in summaryRows" :key="row.staffId" class="att-sum">
              <div class="att-sum__head">
                <span class="att-avatar">{{ initials(row.staffName) }}</span>
                <div class="att-sum__id">
                  <p class="att-sum__name">{{ row.staffName }}</p>
                  <p class="pf-tiny">{{ t('attendance.totalWorkHours') }} {{ formatMinutes(row.totalWorkedMinutes) }}</p>
                </div>
                <span class="att-sum__rate">{{ pn(rate(row) * 100) }}<small>%</small></span>
              </div>

              <div class="att-rate" role="img" :aria-label="t('attendance.attendanceRate')">
                <span class="att-rate__fill" :style="{ inlineSize: `${rate(row) * 100}%` }" />
              </div>

              <div class="att-sum__chips">
                <span class="att-chip att-chip--present">{{ t('attendance.present') }}: {{ pn(row.presentDays) }}</span>
                <span class="att-chip att-chip--late">{{ t('attendance.late') }}: {{ pn(row.lateDays) }}</span>
                <span class="att-chip att-chip--absent">{{ t('attendance.absent') }}: {{ pn(row.absentDays) }}</span>
                <span class="att-chip att-chip--leave">{{ t('attendance.leave') }}: {{ pn(row.leaveDays) }}</span>
                <span class="att-chip att-chip--holiday">{{ t('attendance.holiday') }}: {{ pn(row.holidayDays) }}</span>
              </div>
            </div>
          </div>
        </template>

        <!-- Footer -->
        <div v-if="!loading && !error && (visibleRecords.length || summaryRows.length)" class="pf-card-foot">
          <p class="pf-card-foot__info">
            <template v-if="view === 'records'">
              {{ t('attendance.showing', { shown: visibleRecords.length, total: filteredRecords.length }) }}
            </template>
            <template v-else>
              {{ t('attendance.summaryStaffCount', { count: summaryRows.length }) }}
            </template>
          </p>
          <p v-if="view === 'records' && !hasFilters" class="att-foot-note">
            <span class="pf-pulse" />
            {{ t('attendance.autoFetchHint') }}
          </p>
        </div>
      </div>
    </template>

    <!-- ══════════════════════════════════════════════════════════
         SELF-SERVICE VIEW
    ═══════════════════════════════════════════════════════════ -->
    <template v-else>
      <!-- Punch card -->
      <section class="asa-hero att-punch">
        <span class="asa-hero__orb asa-hero__orb--a" aria-hidden="true" />
        <span class="asa-hero__orb asa-hero__orb--b" aria-hidden="true" />

        <div class="asa-hero__inner">
          <div class="asa-hero__copy">
            <p class="asa-hero__eyebrow">{{ todayLabel }}</p>
            <h2 class="asa-hero__title">
              {{ selfOpen ? t('attendance.currentlyWorking') : t('attendance.notCheckedIn') }}
            </h2>
            <p class="asa-hero__desc">
              {{ selfOpen ? t('attendance.punchWorkingDesc') : t('attendance.punchIdleDesc') }}
            </p>
          </div>
          <div class="asa-hero__avatar" aria-hidden="true">
            <Activity class="w-6! h-6! stroke-current" />
          </div>
        </div>

        <div class="att-punch__body">
          <button
            class="att-punch__btn"
            :class="selfOpen ? 'att-punch__btn--out' : 'att-punch__btn--in'"
            type="button"
            :disabled="punchBusy || selfLoading"
            @click="togglePunch"
          >
            <v-icon v-if="punchBusy" size="20" class="pf-spin">mdi-loading</v-icon>
            <component :is="selfOpen ? LogOut : LogIn" v-else class="w-5! h-5! stroke-current" />
            <span>{{ selfOpen ? t('attendance.checkOutBtn') : t('attendance.newCheckIn') }}</span>
          </button>

          <div class="att-punch__meta">
            <div class="att-punch__stat">
              <span class="att-punch__label">{{ t('attendance.workDuration') }}</span>
              <span class="att-punch__value">{{ formatMinutes(todayMinutes) }}</span>
            </div>
            <div class="att-punch__stat">
              <span class="att-punch__label">{{ t('attendance.todaySessions') }}</span>
              <span class="att-punch__value">{{ pn(todayRecord?.sessions.length ?? 0) }}</span>
            </div>
          </div>
        </div>

        <!-- Today's sessions -->
        <div v-if="todayRecord?.sessions.length" class="att-today">
          <p class="att-today__label">{{ t('attendance.todaySessionsLabel') }}</p>
          <div class="att-sessions">
            <span v-for="(session, i) in todayRecord.sessions" :key="`ts-${i}`" class="att-session">
              <v-icon size="11">mdi-arrow-left-right</v-icon>
              {{ sessionLabel(session) }}
            </span>
          </div>
        </div>
      </section>

      <!-- History -->
      <div class="asa-card pf-table-card mt-5!">
        <div class="pf-toolbar">
          <div class="att-month">
            <span class="asa-field-label">{{ t('attendance.historyTitle') }}</span>
            <v-select
              id="att-month"
              v-model="selectedMonth"
              :items="monthOptions"
              item-title="title"
              item-value="value"
              variant="solo"
              density="compact"
              hide-details
              :aria-label="t('attendance.historyTitle')"
              prepend-inner-icon="mdi-calendar-month-outline"
              class="att-select att-select--wide"
            />
          </div>

          <div class="pf-toolbar__tail">
            <span class="att-total">
              <v-icon size="14">mdi-timer-outline</v-icon>
              {{ t('attendance.totalWorkHours') }} {{ formatMinutes(monthMinutes) }}
            </span>
          </div>
        </div>

        <div v-if="selfLoading">
          <div class="pf-skel">
            <div v-for="i in 5" :key="`ssk-${i}`" class="pf-skel__row">
              <div class="asa-skel h-4! w-28! rounded-md!" />
              <div class="asa-skel h-4! w-24! rounded-md!" />
            </div>
          </div>
        </div>

        <div v-else-if="selfError" class="pf-empty">
          <div class="asa-tint asa-tint--rose pf-tint-lg">
            <v-icon size="26">mdi-cloud-alert-outline</v-icon>
          </div>
          <div>
            <p class="pf-empty__title">{{ t('attendance.loadErrorTitle') }}</p>
            <p class="pf-empty__desc">{{ t('attendance.fetchReportError') }}</p>
          </div>
          <div class="pf-empty__actions">
            <button class="asa-btn asa-btn--primary asa-btn--sm" @click="fetchSelfRecords">
              <v-icon size="15">mdi-refresh</v-icon>
              <span>{{ t('common.retry') }}</span>
            </button>
          </div>
        </div>

        <div v-else-if="!selfRecords.length" class="pf-empty">
          <div class="asa-tint asa-tint--teal pf-tint-lg">
            <CalendarOff class="w-6! h-6! stroke-current" />
          </div>
          <div>
            <p class="pf-empty__title">{{ t('attendance.noSelfRecords') }}</p>
            <p class="pf-empty__desc">{{ t('attendance.noSelfRecordsDesc') }}</p>
          </div>
        </div>

        <template v-else>
          <div class="asa-table-wrap att-table-wrap">
            <table class="pf-table">
              <thead>
                <tr>
                  <th class="pf-pl0">{{ t('common.date') }}</th>
                  <th>{{ t('attendance.status') }}</th>
                  <th>{{ t('attendance.workHours') }}</th>
                  <th>{{ t('attendance.workDuration') }}</th>
                  <th>{{ t('attendance.workLocation') }}</th>
                  <th class="pf-ta-end">{{ t('attendance.adminNote') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="record in selfRecords"
                  :key="record.id"
                  :class="{ 'pf-row-tr--current': record.date === today }"
                >
                  <td class="pf-pl0 pf-dt">{{ prettyDate(record.date) }}</td>
                  <td>
                    <span class="asa-pill" :class="statusPill(record.status)">
                      {{ t(`attendance.status.${record.status}`) }}
                    </span>
                  </td>
                  <td>
                    <span v-if="record.sessions.length" class="att-sessions">
                      <span v-for="(session, i) in record.sessions" :key="`h-${i}`" class="att-session">
                        <v-icon size="11">mdi-arrow-left-right</v-icon>
                        {{ sessionLabel(session) }}
                      </span>
                    </span>
                    <span v-else class="pf-pill--neutral asa-pill">---</span>
                  </td>
                  <td class="att-duration">{{ formatMinutes(record.workedMinutes) }}</td>
                  <td>
                    <span v-if="record.workLocation" class="pf-sub">
                      <v-icon size="13">{{ locationIcon(record.workLocation) }}</v-icon>
                      {{ t(`attendance.location.${record.workLocation}`) }}
                    </span>
                    <span v-else class="pf-pill--neutral asa-pill">---</span>
                  </td>
                  <td class="pf-ta-end">
                    <span v-if="record.adminNotes" class="att-note" :title="record.adminNotes">
                      <v-icon size="13">mdi-note-text-outline</v-icon>
                      {{ record.adminNotes }}
                    </span>
                    <span v-else class="pf-pill--neutral asa-pill">---</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pf-roster att-roster">
            <div v-for="record in selfRecords" :key="`sm-${record.id}`" class="pf-roster__item">
              <div class="pf-roster__body">
                <div class="pf-roster__top">
                  <span class="pf-roster__name">{{ prettyDate(record.date) }}</span>
                  <span class="asa-pill" :class="statusPill(record.status)">
                    {{ t(`attendance.status.${record.status}`) }}
                  </span>
                </div>
                <div class="pf-roster__meta">
                  <span>
                    <v-icon size="13">mdi-timer-outline</v-icon>
                    {{ formatMinutes(record.workedMinutes) }}
                  </span>
                  <span v-if="record.workLocation">
                    <v-icon size="13">{{ locationIcon(record.workLocation) }}</v-icon>
                    {{ t(`attendance.location.${record.workLocation}`) }}
                  </span>
                </div>
                <div v-if="record.sessions.length" class="att-sessions">
                  <span v-for="(session, i) in record.sessions" :key="`ms-${i}`" class="att-session">
                    <v-icon size="11">mdi-arrow-left-right</v-icon>
                    {{ sessionLabel(session) }}
                  </span>
                </div>
                <p v-if="record.adminNotes" class="att-note att-note--block">
                  <v-icon size="13">mdi-note-text-outline</v-icon>
                  {{ record.adminNotes }}
                </p>
              </div>
            </div>
          </div>

          <div class="pf-card-foot">
            <p class="pf-card-foot__info">
              {{ t('attendance.attendanceRate') }}: {{ pn(monthRate) }}%
            </p>
            <p class="att-foot-note">
              <span class="pf-pulse" />
              {{ t('attendance.showing', { shown: selfRecords.length, total: selfRecords.length }) }}
            </p>
          </div>
        </template>
      </div>
    </template>

    <!-- ══════════ DIALOGS ══════════ -->
    <AttendanceRecordEditorDialog v-if="isAdmin" v-model="editorOpen" :record="editorTarget" @saved="refresh" />
    <AttendanceBulkEntryDialog v-if="isAdmin" v-model="bulkOpen" @saved="refresh" />
  </UiPageContainer>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import moment from 'moment-jalaali'
import Activity from '~/components/icons/Activity.vue'
import CalendarOff from '~/components/icons/CalendarOff.vue'
import CheckCircle from '~/components/icons/CheckCircle.vue'
import ClipboardCheck from '~/components/icons/ClipboardCheck.vue'
import Clock from '~/components/icons/Clock.vue'
import LogIn from '~/components/icons/LogIn.vue'
import LogOut from '~/components/icons/LogOut.vue'
import Pencil from '~/components/icons/Pencil.vue'
import UserX from '~/components/icons/UserX.vue'
import AttendanceRecordEditorDialog from '~/components/attendance/RecordEditorDialog.vue'
import AttendanceBulkEntryDialog from '~/components/attendance/BulkEntryDialog.vue'
import {
  ATTENDANCE_STATUSES,
  MONTH_KEYS,
  type AttendanceRecord,
  type AttendanceReport,
  type AttendanceSession,
  type AttendanceStatus,
  type AttendanceSummary,
  type WorkLocation,
} from '~/types/attendance'

interface StaffOption {
  id: string
  fullName: string
  position: string | null
  isActive: boolean | null
}

interface ApiEnvelope<T> {
  success: boolean
  data: T
}

type SortKey = 'staffName' | 'date' | 'status' | 'workedMinutes'
type StatusFilter = 'all' | AttendanceStatus
type ReportView = 'records' | 'summary'

const STATUS_PILL: Record<AttendanceStatus, string> = {
  present: 'asa-pill--green',
  late: 'asa-pill--amber',
  absent: 'asa-pill--rose',
  leave: 'asa-pill--indigo',
  holiday: 'asa-pill--teal',
}

const LOCATION_ICON: Record<WorkLocation, string> = {
  clinic: 'mdi-hospital-building',
  remote: 'mdi-laptop',
  field: 'mdi-map-marker-outline',
}

/** Sessions that count toward a "worked today" figure, matching backend semantics. */
const isWorked = (status: AttendanceStatus): boolean => status === 'present' || status === 'late'

const { t, locale } = useI18n()
const { pn } = useLang()
const { apiFetch } = useApi()
const { formatMinutes, todayJalali } = useFormatting()
const { $toast } = useNuxtApp()
const { user } = useAuth()

const today = todayJalali()

/* ── Role ─────────────────────────────────────────────────────── */

const isAdmin = computed(() => user.value?.role === 'admin_doctor')

/* ── Admin state ──────────────────────────────────────────────── */

const records = ref<AttendanceRecord[]>([])
const summary = ref<AttendanceSummary[]>([])
const staffList = ref<StaffOption[]>([])
const loading = ref(true)
const error = ref(false)
const busy = ref(false)

const filters = reactive<{ startDate: string; endDate: string; staffId: string | null }>({
  startDate: today,
  endDate: today,
  staffId: null,
})
const status = ref<StatusFilter>('all')
const view = ref<ReportView>('records')
const sortKey = ref<SortKey>('date')
const sortDir = ref<'asc' | 'desc'>('desc')

const editorOpen = ref(false)
const editorTarget = ref<AttendanceRecord | null>(null)
const bulkOpen = ref(false)

/* ── Self state ───────────────────────────────────────────────── */

const selfRecords = ref<AttendanceRecord[]>([])
const selfLoading = ref(true)
const selfError = ref(false)
const punchBusy = ref(false)
const selectedMonth = ref(`${moment().format('jM')}-${moment().format('jYYYY')}`)

/* ── Formatting helpers ───────────────────────────────────────── */

const todayLabel = computed(() => {
  const now = moment()
  return locale.value === 'fa'
    ? pn(now.format('dddd jDD jMMMM jYYYY'))
    : now.format('dddd, D MMMM YYYY')
})

function prettyDate(value: string): string {
  if (!value) return '---'
  return locale.value === 'fa' ? pn(value) : value
}

function initials(name: string | null | undefined): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return '?'
  if (parts.length === 1) return parts[0].charAt(0)
  return parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
}

function statusPill(value: AttendanceStatus): string {
  return STATUS_PILL[value] ?? 'pf-pill--neutral'
}

function locationIcon(value: WorkLocation): string {
  return LOCATION_ICON[value] ?? 'mdi-map-marker-outline'
}

function clockTime(value: string | null | undefined): string {
  if (!value) return '--:--'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return '--:--'
  return `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`
}

function sessionLabel(session: AttendanceSession): string {
  const from = clockTime(session.checkInTime)
  // An open session is the live one, so label it instead of showing a fake time.
  return session.checkOutTime
    ? `${from} → ${clockTime(session.checkOutTime)}`
    : `${from} → ${t('attendance.openSession')}`
}

/* ── Admin derived ────────────────────────────────────────────── */

const todayRecords = computed(() => records.value.filter((record) => record.date === today))

const heroStats = computed(() => {
  const count = (value: AttendanceStatus) => todayRecords.value.filter((r) => r.status === value).length
  const worked = todayRecords.value.filter((r) => isWorked(r.status)).length
  const unrecorded = Math.max(0, staffList.value.filter((s) => s.isActive !== false).length - todayRecords.value.length)
  return [
    { key: 'present', value: count('present'), label: t('attendance.presentToday'), icon: CheckCircle },
    { key: 'late', value: count('late'), label: t('attendance.lateToday'), icon: Clock },
    { key: 'absent', value: count('absent'), label: t('attendance.absentToday'), icon: UserX },
    { key: 'leave', value: count('leave'), label: t('attendance.leaveToday'), icon: CalendarOff },
    { key: 'worked', value: worked, label: t('attendance.workedToday'), icon: Activity },
    { key: 'pending', value: unrecorded, label: t('attendance.notRecordedToday'), icon: ClipboardCheck },
  ]
})

const statusSegments = computed(() => [
  { value: 'all' as StatusFilter, label: t('attendance.filterAll'), count: records.value.length },
  ...ATTENDANCE_STATUSES.map((value) => ({
    value: value as StatusFilter,
    label: t(`attendance.status.${value}`),
    count: records.value.filter((record) => record.status === value).length,
  })),
])

const staffOptions = computed(() =>
  staffList.value.map((member) => ({
    value: member.id,
    title: member.position ? `${member.fullName} — ${member.position}` : member.fullName,
  })),
)

const filteredRecords = computed(() => {
  const byStaff = filters.staffId
    ? records.value.filter((record) => record.staffId === filters.staffId)
    : records.value
  return status.value === 'all' ? byStaff : byStaff.filter((record) => record.status === status.value)
})

const visibleRecords = computed(() => {
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...filteredRecords.value].sort((a, b) => {
    let result: number
    if (sortKey.value === 'workedMinutes') {
      result = (a.workedMinutes || 0) - (b.workedMinutes || 0)
    } else if (sortKey.value === 'date') {
      // Jalali strings are zero-padded, so lexical order is chronological order.
      result = a.date.localeCompare(b.date)
    } else if (sortKey.value === 'status') {
      result = ATTENDANCE_STATUSES.indexOf(a.status) - ATTENDANCE_STATUSES.indexOf(b.status)
    } else {
      const va = a.staffName || ''
      const vb = b.staffName || ''
      result = va.localeCompare(vb, locale.value)
    }
    return result === 0
      ? (a.staffName || '').localeCompare(b.staffName || '', locale.value)
      : result * dir
  })
})

const summaryRows = computed(() =>
  [...summary.value].sort((a, b) => rate(b) - rate(a) || (a.staffName || '').localeCompare(b.staffName || '', locale.value)),
)

/** Share of recorded days the person actually worked. */
function rate(row: AttendanceSummary): number {
  if (!row.totalDays) return 0
  const worked = (row.presentDays || 0) + (row.lateDays || 0)
  return Math.min(100, Math.round((worked / row.totalDays) * 100))
}

const hasFilters = computed(() => status.value !== 'all' || Boolean(filters.staffId))

/* ── Self derived ─────────────────────────────────────────────── */

const monthOptions = computed(() => {
  const now = moment()
  // Offer the previous 11 months so staff can review their history.
  return Array.from({ length: 12 }, (_, offset) => {
    const point = now.clone().subtract(offset, 'month')
    return {
      value: `${point.format('jM')}-${point.format('jYYYY')}`,
      title: `${t(`calendar.month.${MONTH_KEYS[point.month()]}`)} ${point.format('jYYYY')}`,
    }
  })
})

const todayRecord = computed(() => selfRecords.value.find((record) => record.date === today) ?? null)

const selfOpen = computed(() =>
  (todayRecord.value?.sessions ?? []).some((session) => session.checkInTime && !session.checkOutTime),
)

const todayMinutes = computed(() => todayRecord.value?.workedMinutes ?? 0)

const monthMinutes = computed(() =>
  selfRecords.value.reduce((total, record) => total + (record.workedMinutes || 0), 0),
)

/** Share of the month's logged days that were actually worked. */
const monthRate = computed(() => {
  if (!selfRecords.value.length) return 0
  const worked = selfRecords.value.filter((record) => isWorked(record.status)).length
  return Math.round((worked / selfRecords.value.length) * 100)
})

/* ── Sorting ──────────────────────────────────────────────────── */

function toggleSort(key: SortKey) {
  if (sortKey.value === key) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortKey.value = key
    // Newest first is the useful default for an attendance log.
    sortDir.value = key === 'date' ? 'desc' : 'asc'
  }
}

function sortIcon(key: SortKey): string {
  if (sortKey.value !== key) return 'mdi-unfold-more-horizontal'
  return sortDir.value === 'asc' ? 'mdi-chevron-up' : 'mdi-chevron-down'
}

function ariaSort(key: SortKey): 'ascending' | 'descending' | 'none' {
  if (sortKey.value !== key) return 'none'
  return sortDir.value === 'asc' ? 'ascending' : 'descending'
}

/* ── Data ─────────────────────────────────────────────────────── */

function errorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === 'object') {
    const data = (err as { data?: { error?: string; message?: string } }).data
    if (data?.error) return data.error
    if (data?.message) return data.message
  }
  return fallback
}

function normalizeRecords(input: unknown): AttendanceRecord[] {
  if (!Array.isArray(input)) return []
  return input.map((row) => {
    const record = row as Partial<AttendanceRecord> & { status?: string }
    return {
      ...(record as AttendanceRecord),
      status: (ATTENDANCE_STATUSES as readonly string[]).includes(record.status ?? '')
        ? (record.status as AttendanceStatus)
        : 'present',
      sessions: Array.isArray(record.sessions) ? record.sessions : [],
      workedMinutes: typeof record.workedMinutes === 'number' ? record.workedMinutes : 0,
    }
  })
}

async function fetchReport() {
  if (!filters.startDate || !filters.endDate) {
    records.value = []
    summary.value = []
    return
  }

  loading.value = true
  error.value = false
  try {
    const params = new URLSearchParams({
      startDate: filters.startDate,
      endDate: filters.endDate,
    })
    if (filters.staffId) params.set('staffId', filters.staffId)
    // `status` stays client-side: sending it would zero out the other segment counts.

    const res = await apiFetch<ApiEnvelope<AttendanceReport>>(
      `/api/staff/attendance/report?${params.toString()}`,
    )
    const data = res.success ? res.data : undefined
    records.value = normalizeRecords(data?.records)
    summary.value = Array.isArray(data?.summary) ? data.summary : []
  } catch {
    records.value = []
    summary.value = []
    error.value = true
    $toast.error(t('attendance.fetchReportError'))
  } finally {
    loading.value = false
  }
}

async function fetchStaff() {
  try {
    const res = await apiFetch<ApiEnvelope<StaffOption[]>>('/api/staff')
    staffList.value = res.success && Array.isArray(res.data) ? res.data : []
  } catch {
    staffList.value = []
  }
}

async function fetchSelfRecords() {
  selfLoading.value = true
  selfError.value = false
  try {
    const [month, year] = selectedMonth.value.split('-')
    const res = await apiFetch<ApiEnvelope<AttendanceRecord[]>>(
      `/api/staff/attendance/me?month=${month}&year=${year}`,
    )
    selfRecords.value = normalizeRecords(res.success ? res.data : [])
      .sort((a, b) => b.date.localeCompare(a.date))
  } catch {
    selfRecords.value = []
    selfError.value = true
    $toast.error(t('attendance.fetchReportError'))
  } finally {
    selfLoading.value = false
  }
}

async function refresh() {
  busy.value = true
  try {
    if (isAdmin.value) await Promise.all([fetchReport(), fetchStaff()])
    else await fetchSelfRecords()
  } finally {
    busy.value = false
  }
}

async function togglePunch() {
  if (!todayRecord.value) return
  punchBusy.value = true
  try {
    if (selfOpen.value) {
      const res = await apiFetch<{ success: boolean }>('/api/staff/attendance/check-out', {
        method: 'POST',
        body: { notes: null },
      })
      if (res.success) {
        $toast.success(t('attendance.checkOutSuccess'))
        await fetchSelfRecords()
      }
    } else {
      const res = await apiFetch<{ success: boolean }>('/api/staff/attendance/check-in', {
        method: 'POST',
        body: { workLocation: 'clinic', notes: null },
      })
      if (res.success) {
        $toast.success(t('attendance.checkInSuccess'))
        await fetchSelfRecords()
      }
    }
  } catch (err: unknown) {
    $toast.error(
      errorMessage(err, selfOpen.value ? t('attendance.checkOutError') : t('attendance.checkInError')),
    )
  } finally {
    punchBusy.value = false
  }
}

function openEditor(record: AttendanceRecord) {
  editorTarget.value = record
  editorOpen.value = true
}

/* ── Lifecycle ────────────────────────────────────────────────── */

// Re-query whenever the report inputs actually change, but debounce so typing
// in the pickers does not fire a request per keystroke.
let reportTimer: ReturnType<typeof setTimeout> | undefined
watch(
  () => [filters.startDate, filters.endDate, filters.staffId, status.value],
  () => {
    if (!isAdmin.value) return
    clearTimeout(reportTimer)
    reportTimer = setTimeout(() => void fetchReport(), 250)
  },
)

watch(selectedMonth, () => {
  if (!isAdmin.value) void fetchSelfRecords()
})

// `user` is hydrated from localStorage on mount, so the role can resolve a tick
// after this page's own hook. Re-run once it lands so neither view stays empty.
let bootstrapped = false
watch(isAdmin, () => {
  if (bootstrapped) void refresh()
})

onMounted(() => {
  bootstrapped = true
  if (user.value) void refresh()
})

useSeoMeta({ title: t('attendance.titleSeo') })
</script>

<style scoped>
/* ── Toolbar ── */
.att-toolbar {
  flex-wrap: wrap;
  row-gap: 0.75rem;
}

.att-daterange {
  display: grid;
  gap: 0.25rem;
  min-inline-size: 10.5rem;
}

.att-month {
  display: grid;
  gap: 0.25rem;
  min-inline-size: 13rem;
}

.att-select :deep(.v-field) {
  border-radius: 0.85rem;
}

.att-select--wide {
  min-inline-size: 15rem;
}

/* ── Table cells ── */
.att-person {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  min-inline-size: 0;
}

.att-avatar {
  display: grid;
  place-items: center;
  inline-size: 1.9rem;
  block-size: 1.9rem;
  flex: none;
  border-radius: 999px;
  background: rgb(0 173 181 / 0.14);
  color: #00838a;
  font-size: 0.72rem;
  font-weight: 700;
}

.att-person__copy {
  display: grid;
  min-inline-size: 0;
}

.att-person__name {
  font-size: 0.85rem;
  font-weight: 600;
}

.att-sessions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.att-session {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.15rem 0.4rem;
  border-radius: 0.5rem;
  background: rgb(148 163 184 / 0.16);
  color: rgb(71 85 105);
  font-size: 0.72rem;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.att-duration {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  white-space: nowrap;
}

.att-note {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  max-inline-size: 14rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.78rem;
  color: rgb(100 116 139);
}

.att-note--block {
  display: flex;
  max-inline-size: none;
  margin: 0.25rem 0 0;
}

.att-foot-note {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  margin: 0;
  font-size: 0.75rem;
  color: rgb(100 116 139);
}

/* ── Summary ── */
.att-summary {
  display: grid;
  gap: 0.6rem;
  padding: 0.9rem;
  grid-template-columns: repeat(auto-fill, minmax(19rem, 1fr));
}

.att-sum {
  display: grid;
  gap: 0.5rem;
  padding: 0.75rem 0.85rem;
  border: 1px solid rgb(226 232 240 / 0.9);
  border-radius: 1rem;
  background: rgb(248 250 252 / 0.65);
}

.att-sum__head {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.att-sum__id {
  display: grid;
  min-inline-size: 0;
  flex: 1 1 auto;
}

.att-sum__name {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.att-sum__rate {
  font-size: 1.15rem;
  font-weight: 800;
  color: #00838a;
  font-variant-numeric: tabular-nums;
  flex: none;
}

.att-sum__rate small {
  font-size: 0.7rem;
  font-weight: 600;
}

.att-rate {
  block-size: 0.4rem;
  border-radius: 999px;
  background: rgb(148 163 184 / 0.25);
  overflow: hidden;
}

.att-rate__fill {
  display: block;
  block-size: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #00adb5, #34d399);
  transition: inline-size 0.35s ease;
}

.att-sum__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.att-chip {
  padding: 0.1rem 0.4rem;
  border-radius: 0.5rem;
  font-size: 0.7rem;
  font-variant-numeric: tabular-nums;
}

.att-chip--present { background: rgb(13 148 136 / 0.14); color: #0d9488; }
.att-chip--late { background: rgb(217 119 6 / 0.14); color: #b45309; }
.att-chip--absent { background: rgb(225 29 72 / 0.14); color: #be123c; }
.att-chip--leave { background: rgb(79 70 229 / 0.14); color: #4338ca; }
.att-chip--holiday { background: rgb(8 145 178 / 0.14); color: #0e7490; }

/* ── Self punch card ── */
.att-punch__body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.9rem;
  padding: 0.9rem 1.15rem 1.1rem;
}

.att-punch__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-inline-size: 12rem;
  padding: 0.8rem 1.4rem;
  border: 0;
  border-radius: 999px;
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 10px 24px -12px rgb(15 23 42 / 0.6);
  transition: transform 0.15s ease, filter 0.15s ease;
}

.att-punch__btn--in {
  background: linear-gradient(135deg, #00adb5, #0ea5a4);
}

.att-punch__btn--out {
  background: linear-gradient(135deg, #f43f5e, #e11d48);
}

.att-punch__btn:hover:not(:disabled) {
  filter: brightness(1.05);
  transform: translateY(-1px);
}

.att-punch__btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
  box-shadow: none;
}

.att-punch__meta {
  display: flex;
  gap: 1.4rem;
}

.att-punch__stat {
  display: grid;
}

.att-punch__label {
  font-size: 0.72rem;
  opacity: 0.8;
}

.att-punch__value {
  font-size: 1.05rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.att-today {
  padding: 0 1.15rem 1.1rem;
}

.att-today__label {
  margin: 0 0 0.35rem;
  font-size: 0.75rem;
  opacity: 0.8;
}

.att-punch .att-session {
  background: rgb(255 255 255 / 0.2);
  color: inherit;
}

.att-total {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.3rem 0.65rem;
  border-radius: 999px;
  background: rgb(0 173 181 / 0.1);
  color: #00838a;
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
}

/* ── Dark mode ── */
.dark .att-sum,
.dark .attb-row {
  border-color: rgb(51 65 85);
  background: rgb(30 41 59 / 0.45);
}

.dark .att-session {
  background: rgb(51 65 85 / 0.6);
  color: rgb(203 213 225);
}

.dark .att-note,
.dark .att-foot-note {
  color: rgb(148 163 184);
}

.dark .att-punch .att-session {
  background: rgb(255 255 255 / 0.15);
}

.dark .att-total {
  background: rgb(0 173 181 / 0.16);
  color: rgb(94 234 212);
}

.dark :deep(.att-chip--present) { color: rgb(94 234 212); }
.dark :deep(.att-chip--late) { color: rgb(253 224 71); }
.dark :deep(.att-chip--absent) { color: rgb(253 164 175); }
.dark :deep(.att-chip--leave) { color: rgb(165 180 252); }
.dark :deep(.att-chip--holiday) { color: rgb(103 232 249); }
.dark :deep(.att-sum__rate) { color: rgb(94 234 212); }

/* ── Responsive ── */
@media (max-width: 900px) {
  .att-summary {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (max-width: 600px) {
  .att-daterange,
  .att-month,
  .att-select--wide {
    min-inline-size: 100%;
  }

  .att-punch__body {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }

  .att-punch__meta {
    justify-content: center;
  }
}

@media (prefers-reduced-motion: reduce) {
  .att-punch__btn,
  .att-rate__fill {
    transition: none;
  }
}
</style>
