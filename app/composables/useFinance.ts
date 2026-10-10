import moment from 'moment-jalaali'
import type {
  CashbookAccount,
  CashbookAccountType,
  CashbookApiResponse,
  CashbookBudget,
  CashbookCategory,
  CashbookEntry,
  CashbookGrant,
  CashbookGrantCandidate,
  CashbookKind,
  CashbookLedger,
  CashbookStatus,
  CashbookSummary,
} from '~/types/finance'

export type CashbookRangeMode = 'month' | 'custom'

export interface CashbookRangePreset {
  key: string
  from: string
  to: string
}

export interface CashbookMonthlyPoint {
  key: string
  label: string
  short: string
  incomeRial: string
  expenseRial: string
  netRial: string
}

export interface CashbookWeekdayPoint {
  index: number
  incomeRial: string
  expenseRial: string
}

export interface CashbookTotals {
  incomeRial: string
  expenseRial: string
  netRial: string
  entryCount: number
}

export interface CashbookDeltas {
  income: number | null
  expense: number | null
  net: number | null
  entryCount: number | null
}

function addJalaaliMonth<T>(value: T): T {
  return (value as unknown as { add: (amount: number, unit: string) => T }).add(1, 'jMonth')
}

/** Gregorian ISO date of a jalaali year/month's first day. */
function jMonthStart(jYear: number, jMonth: number): string {
  return moment(`${jYear}-${String(jMonth).padStart(2, '0')}-01`, 'jYYYY-jMM-jDD').format('YYYY-MM-DD')
}

/** Gregorian ISO date of a jalaali year/month's last day. */
function jMonthEnd(jYear: number, jMonth: number): string {
  return moment(`${jYear}-${String(jMonth).padStart(2, '0')}-01`, 'jYYYY-jMM-jDD').add(1, 'jMonth').subtract(1, 'day').format('YYYY-MM-DD')
}

function jalaaliKey(date: string): string {
  return moment(date, 'YYYY-MM-DD').format('jYYYY-jMM')
}

/** Pure jalaali month arithmetic, avoiding moment's jMonth unit typing quirks. */
function addMonths(jYear: number, jMonth: number, delta: number): { jYear: number; jMonth: number } {
  const total = jYear * 12 + (jMonth - 1) + delta
  return { jYear: Math.floor(total / 12), jMonth: (total % 12) + 1 }
}

function queryString(values: Record<string, string | number | null | undefined>): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    if (value !== null && value !== undefined && value !== '') params.set(key, String(value))
  }
  const result = params.toString()
  return result ? `?${result}` : ''
}

function filenameFromDisposition(value: string | null, fallback: string): string {
  if (!value) return fallback
  const encoded = value.match(/filename\*\s*=\s*UTF-8''([^;]+)/i)?.[1]
  if (encoded) {
    try {
      return decodeURIComponent(encoded.replace(/^"|"$/g, '')) || fallback
    } catch {
      return fallback
    }
  }
  return value.match(/filename\s*=\s*"?([^";]+)"?/i)?.[1] || fallback
}

export const useFinance = () => {
  const { user, token } = useAuth()
  const { apiFetch } = useApi()
  const { t } = useI18n()
  const { $toast } = useNuxtApp()

  const canEdit = computed(() => user.value?.role === 'admin_doctor' || user.value?.role === 'doctor')
  const year = ref(moment().format('jYYYY'))
  const month = ref(moment().format('jMM'))
  const ownerId = ref<string | null>(null)
  /**
   * Reporting window can either follow the jalaali month grid or an arbitrary
   * hand-picked span. Both resolve to the same `{ from, to }` Gregorian pair the
   * backend already understands, so every downstream query stays unchanged.
   */
  const rangeMode = ref<CashbookRangeMode>('month')
  const customFrom = ref(jMonthStart(Number(moment().format('jYYYY')), Number(moment().format('jMM'))))
  const customTo = ref(moment().format('YYYY-MM-DD'))
  const ledgers = ref<CashbookLedger[]>([])
  const grants = ref<CashbookGrant[]>([])
  const candidates = ref<CashbookGrantCandidate[]>([])
  const accessSaving = ref(false)
  const summary = ref<CashbookSummary | null>(null)
  const entries = ref<CashbookEntry[]>([])
  const categories = ref<CashbookCategory[]>([])
  const accounts = ref<CashbookAccount[]>([])
  const loading = ref(false)
  const loadError = ref('')
  let loadRequest = 0
  const page = ref(1)
  const pagination = ref({ total: 0, totalPages: 0, limit: 25 })
  const filters = ref<{ kind: CashbookKind | ''; status: CashbookStatus | ''; search: string }>({
    kind: '',
    status: '',
    search: '',
  })

  // Comparative analytics. All of it is derived from the existing summary
  // endpoint, so the backend contract is untouched.
  const comparisonCount = ref<6 | 12>(6)
  const comparisonSeries = ref<CashbookMonthlyPoint[]>([])
  const previousTotals = ref<CashbookTotals | null>(null)
  const analyticsLoading = ref(false)

  /** Jalaali week is Saturday-first; `byDay` rows fold into that grid. */
  const weekdaySeries = computed<CashbookWeekdayPoint[]>(() => {
    const buckets = Array.from({ length: 7 }, (_, index) => ({ index, incomeRial: 0n, expenseRial: 0n }))
    for (const row of summary.value?.byDay || []) {
      const pIndex = (moment(row.date, 'YYYY-MM-DD').day() + 1) % 7
      const bucket = buckets[pIndex]!
      bucket.incomeRial += BigInt(row.incomeRial || '0')
      bucket.expenseRial += BigInt(row.expenseRial || '0')
    }
    return buckets.map((bucket) => ({
      index: bucket.index,
      incomeRial: bucket.incomeRial.toString(),
      expenseRial: bucket.expenseRial.toString(),
    }))
  })

  const currentTotals = computed<CashbookTotals>(() => ({
    incomeRial: summary.value?.totals.incomeRial || '0',
    expenseRial: summary.value?.totals.expenseRial || '0',
    netRial: summary.value?.totals.netRial || '0',
    entryCount: summary.value?.totals.entryCount || 0,
  }))

  /** Percentage change of each headline number against the preceding period. */
  const deltas = computed<CashbookDeltas>(() => {
    const previous = previousTotals.value
    const pct = (current: string, before: string | undefined): number | null => {
      if (before === undefined || before === null) return null
      const b = Number(before)
      const c = Number(current)
      if (!Number.isFinite(b) || !Number.isFinite(c)) return null
      if (b === 0) return c === 0 ? 0 : null
      return ((c - b) / Math.abs(b)) * 100
    }
    const countPct = (() => {
      if (!previous) return null
      const b = previous.entryCount
      const c = currentTotals.value.entryCount
      if (b === 0) return c === 0 ? 0 : null
      return ((c - b) / b) * 100
    })()
    return {
      income: pct(currentTotals.value.incomeRial, previous?.incomeRial),
      expense: pct(currentTotals.value.expenseRial, previous?.expenseRial),
      net: pct(currentTotals.value.netRial, previous?.netRial),
      entryCount: countPct,
    }
  })

  const range = computed(() => {
    if (rangeMode.value === 'custom') return { from: customFrom.value, to: customTo.value }
    const start = moment(`${year.value}-${month.value}-01`, 'jYYYY-jMM-jDD')
    const end = addJalaaliMonth(start.clone()).subtract(1, 'day')
    return {
      from: start.format('YYYY-MM-DD'),
      to: end.format('YYYY-MM-DD'),
    }
  })
  const monthOptions = computed(() =>
    Array.from({ length: 12 }, (_, index) => ({
      title: t(`cashbook.months.m${index + 1}`),
      value: String(index + 1).padStart(2, '0'),
    })),
  )
  function dayMonthLabel(date: string): string {
    const value = moment(date, 'YYYY-MM-DD')
    const name = monthOptions.value[Number(value.format('jM')) - 1]?.title || value.format('jMMMM')
    return `${Number(value.format('jDD'))} ${name} ${value.format('jYYYY')}`
  }
  const rangeLabel = computed(() => {
    if (range.value.from === range.value.to) return dayMonthLabel(range.value.from)
    return `${dayMonthLabel(range.value.from)} – ${dayMonthLabel(range.value.to)}`
  })
  const monthLabel = computed(() => {
    if (rangeMode.value === 'custom') return rangeLabel.value
    const index = Number(month.value) - 1
    return `${monthOptions.value[index]?.title || month.value} ${year.value}`
  })
  const period = computed(() => ({ year: year.value, month: month.value }))

  /** One-tap spans over the trailing jalaali calendar, chosen against "today". */
  const rangePresets = computed<CashbookRangePreset[]>(() => {
    const now = moment()
    const today = now.format('YYYY-MM-DD')
    const jYear = Number(now.format('jYYYY'))
    const jMonth = Number(now.format('jMM'))
    const trailing = (months: number) => ({
      from: (() => {
        const start = addMonths(jYear, jMonth, -(months - 1))
        return jMonthStart(start.jYear, start.jMonth)
      })(),
      to: today,
    })
    const prevMonth = addMonths(jYear, jMonth, -1)
    return [
      { key: 'thisMonth', from: jMonthStart(jYear, jMonth), to: jMonthEnd(jYear, jMonth) },
      { key: 'lastMonth', from: jMonthStart(prevMonth.jYear, prevMonth.jMonth), to: jMonthEnd(prevMonth.jYear, prevMonth.jMonth) },
      { key: 'last3', ...trailing(3) },
      { key: 'last6', ...trailing(6) },
      { key: 'last12', ...trailing(12) },
      { key: 'thisYear', from: jMonthStart(jYear, 1), to: today },
      { key: 'lastYear', from: jMonthStart(jYear - 1, 1), to: jMonthEnd(jYear - 1, 12) },
    ]
  })
  /**
   * A ledger is editable only when the signed-in user owns it. Every other ledger is
   * reachable read-only through an explicit owner grant, so this must key off ownership
   * rather than role.
   */
  const isOwnLedger = computed(() => !ownerId.value || ownerId.value === user.value?.id)
  const isReadOnly = computed(() => !isOwnLedger.value)
  const ownerQuery = computed(() => ownerId.value && ownerId.value !== user.value?.id ? { userId: ownerId.value } : {})
  const hasSharedLedgers = computed(() => ledgers.value.some((ledger) => ledger.ownerId !== user.value?.id))

  const selectedOwnerLabel = computed(() => {
    if (!ownerId.value || ownerId.value === user.value?.id) return t('cashbook.myLedger')
    return ledgers.value.find((ledger) => ledger.ownerId === ownerId.value)?.ownerName || t('cashbook.selectedLedger')
  })

  /**
   * Ledgers the backend will actually let us read. The switcher is populated from the
   * grant table rather than the full doctor list, so it can never offer a ledger whose
   * owner never shared it.
   */
  async function loadLedgers() {
    const response = await apiFetch<CashbookApiResponse<CashbookLedger[]>>('/api/cashbook/access/ledgers')
    ledgers.value = response?.success ? response.data || [] : []
    // Drop a selection that is no longer authorised, e.g. after a revocation.
    if (ownerId.value && !ledgers.value.some((ledger) => ledger.ownerId === ownerId.value)) {
      ownerId.value = null
    }
  }

  async function loadAccess() {
    const [grantsResponse, candidatesResponse] = await Promise.all([
      apiFetch<CashbookApiResponse<CashbookGrant[]>>('/api/cashbook/access/grants'),
      apiFetch<CashbookApiResponse<CashbookGrantCandidate[]>>('/api/cashbook/access/candidates'),
    ])
    grants.value = grantsResponse?.success ? grantsResponse.data || [] : []
    candidates.value = candidatesResponse?.success ? candidatesResponse.data || [] : []
  }

  async function grantAccess(granteeId: string) {
    if (!granteeId || accessSaving.value) return
    accessSaving.value = true
    try {
      await apiFetch<CashbookApiResponse<CashbookGrant>>('/api/cashbook/access/grants', {
        method: 'POST',
        body: { granteeId },
      })
      await Promise.all([loadAccess(), loadLedgers()])
      $toast.success(t('cashbook.accessGranted'))
    } finally {
      accessSaving.value = false
    }
  }

  async function revokeAccess(grantId: string) {
    if (accessSaving.value) return
    accessSaving.value = true
    try {
      await apiFetch(`/api/cashbook/access/grants/${grantId}`, { method: 'DELETE' })
      // A revoked ledger may be the one currently on screen; reset it if so.
      if (ownerId.value && grants.value.some((grant) => grant.id === grantId && grant.granteeId === ownerId.value)) {
        ownerId.value = null
      }
      await Promise.all([loadAccess(), loadLedgers()])
      $toast.success(t('cashbook.accessRevoked'))
    } finally {
      accessSaving.value = false
    }
  }

  async function load() {
    if (!canEdit.value) return
    const requestId = ++loadRequest
    loading.value = true
    loadError.value = ''
    const owner = ownerQuery.value
    const summaryQuery = queryString({ ...range.value, month: range.value.from.slice(0, 7), ...owner })
    const entriesQuery = queryString({
      ...range.value,
      ...owner,
      kind: filters.value.kind,
      status: filters.value.status,
      search: filters.value.search.trim(),
      page: page.value,
      limit: pagination.value.limit,
    })

    const resourceQuery = queryString({ ...owner, includeArchived: 'true' })
    const [summaryResult, entriesResult, categoriesResult, accountsResult] = await Promise.allSettled([
      apiFetch<CashbookApiResponse<CashbookSummary>>(`/api/cashbook/summary${summaryQuery}`),
      apiFetch<CashbookApiResponse<CashbookEntry[]> & { pagination: { page: number; limit: number; total: number; totalPages: number } }>(`/api/cashbook/entries${entriesQuery}`),
      apiFetch<CashbookApiResponse<CashbookCategory[]>>(`/api/cashbook/categories${resourceQuery}`),
      apiFetch<CashbookApiResponse<CashbookAccount[]>>(`/api/cashbook/accounts${resourceQuery}`),
    ])
    if (requestId !== loadRequest) return
    const summaryResponse = summaryResult.status === 'fulfilled' ? summaryResult.value : null
    const entriesResponse = entriesResult.status === 'fulfilled' ? entriesResult.value : null
    const categoriesResponse = categoriesResult.status === 'fulfilled' ? categoriesResult.value : null
    const accountsResponse = accountsResult.status === 'fulfilled' ? accountsResult.value : null

    summary.value = summaryResponse?.success ? summaryResponse.data : null
    if (entriesResponse?.success) {
      entries.value = entriesResponse.data
      pagination.value = entriesResponse.pagination
    } else {
      entries.value = []
      pagination.value = { total: 0, totalPages: 0, limit: pagination.value.limit }
    }
    categories.value = categoriesResponse?.success ? categoriesResponse.data : []
    accounts.value = accountsResponse?.success ? accountsResponse.data : []
    if (!summary.value || !entriesResponse?.success) loadError.value = t('cashbook.loadError')
    loading.value = false
  }

  /** The immediately preceding span of equal length, used for the deltas. */
  function previousRange(): { from: string; to: string } | null {
    if (rangeMode.value === 'custom') {
      const DAY = 86_400_000
      const fromMs = moment(customFrom.value, 'YYYY-MM-DD').valueOf()
      const toMs = moment(customTo.value, 'YYYY-MM-DD').valueOf()
      if (!Number.isFinite(fromMs) || !Number.isFinite(toMs) || fromMs > toMs) return null
      const length = Math.round((toMs - fromMs) / DAY)
      const iso = (ms: number) => moment(ms).format('YYYY-MM-DD')
      return { from: iso(fromMs - DAY * (length + 1)), to: iso(fromMs - DAY) }
    }
    const start = moment(`${year.value}-${month.value}-01`, 'jYYYY-jMM-jDD')
    const previousStart = addMonths(Number(year.value), Number(month.value), -1)
    return {
      from: jMonthStart(previousStart.jYear, previousStart.jMonth),
      to: start.clone().subtract(1, 'day').format('YYYY-MM-DD'),
    }
  }

  /** Fold a wide daily series into `count` trailing jalaali month buckets. */
  function buildComparison(byDay: CashbookSummary['byDay'], endJYear: number, endJMonth: number, count: number): CashbookMonthlyPoint[] {
    const totals = new Map<string, { income: bigint; expense: bigint }>()
    for (const row of byDay) {
      const key = jalaaliKey(row.date)
      const bucket = totals.get(key) || { income: 0n, expense: 0n }
      bucket.income += BigInt(row.incomeRial || '0')
      bucket.expense += BigInt(row.expenseRial || '0')
      totals.set(key, bucket)
    }
    return Array.from({ length: count }, (_, i) => {
      const point = addMonths(endJYear, endJMonth, i - (count - 1))
      const key = `${point.jYear}-${String(point.jMonth).padStart(2, '0')}`
      const name = monthOptions.value[point.jMonth - 1]?.title || String(point.jMonth)
      const bucket = totals.get(key) || { income: 0n, expense: 0n }
      return {
        key,
        label: `${name} ${point.jYear}`,
        short: name,
        incomeRial: bucket.income.toString(),
        expenseRial: bucket.expense.toString(),
        netRial: (bucket.income - bucket.expense).toString(),
      }
    })
  }

  async function loadAnalytics() {
    if (!canEdit.value) return
    analyticsLoading.value = true
    try {
      const owner = ownerQuery.value
      const count = comparisonCount.value
      const endMonth = moment(range.value.to, 'YYYY-MM-DD')
      const endJYear = Number(endMonth.format('jYYYY'))
      const endJMonth = Number(endMonth.format('jMM'))
      const startMonth = addMonths(endJYear, endJMonth, -(count - 1))
      const windowFrom = jMonthStart(startMonth.jYear, startMonth.jMonth)
      const windowTo = jMonthEnd(endJYear, endJMonth)
      const previous = previousRange()
      const [windowResult, previousResult] = await Promise.allSettled([
        apiFetch<CashbookApiResponse<CashbookSummary>>(`/api/cashbook/summary${queryString({ from: windowFrom, to: windowTo, ...owner })}`),
        previous
          ? apiFetch<CashbookApiResponse<CashbookSummary>>(`/api/cashbook/summary${queryString({ ...previous, ...owner })}`)
          : Promise.resolve(null),
      ])
      const windowDays = windowResult.status === 'fulfilled' && windowResult.value?.success ? windowResult.value.data.byDay : []
      comparisonSeries.value = buildComparison(windowDays, endJYear, endJMonth, count)
      const previousSummary = previousResult.status === 'fulfilled' ? previousResult.value : null
      previousTotals.value = previousSummary?.success
        ? {
            incomeRial: previousSummary.data.totals.incomeRial,
            expenseRial: previousSummary.data.totals.expenseRial,
            netRial: previousSummary.data.totals.netRial,
            entryCount: previousSummary.data.totals.entryCount,
          }
        : null
    } finally {
      analyticsLoading.value = false
    }
  }

  async function refresh() {
    try {
      await Promise.all([loadLedgers(), load()])
      await loadAnalytics()
    } catch {
      loadError.value = t('cashbook.loadError')
    }
  }

  async function applyFilters() {
    page.value = 1
    await load()
  }

  async function changePage(nextPage: number) {
    page.value = Math.max(1, Math.min(nextPage, pagination.value.totalPages || 1))
    await load()
  }

  function shiftMonth(delta: number) {
    rangeMode.value = 'month'
    const next = moment(`${year.value}-${month.value}-01`, 'jYYYY-jMM-jDD').add(delta, 'jMonth')
    year.value = next.format('jYYYY')
    month.value = next.format('jMM')
  }

  function setPeriod(next: { year: string; month: string }) {
    rangeMode.value = 'month'
    year.value = next.year
    month.value = next.month
  }

  function goToday() {
    rangeMode.value = 'month'
    year.value = moment().format('jYYYY')
    month.value = moment().format('jMM')
  }

  function setRangeMode(mode: CashbookRangeMode) {
    if (rangeMode.value === mode) return
    rangeMode.value = mode
  }

  function setCustomRange(from: string, to: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to)) return
    const [start, end] = from <= to ? [from, to] : [to, from]
    rangeMode.value = 'custom'
    customFrom.value = start
    customTo.value = end
  }

  function applyPreset(key: string) {
    const preset = rangePresets.value.find((item) => item.key === key)
    if (preset) setCustomRange(preset.from, preset.to)
  }

  async function saveEntry(payload: {
    entryDate: string
    kind: CashbookKind
    amountRial: string
    categoryId: string
    accountId: string
    description: string
    notes?: string | null
    reference?: string | null
  }) {
    const response = await apiFetch<CashbookApiResponse<CashbookEntry>>('/api/cashbook/entries', {
      method: 'POST',
      body: payload,
    })
    if (!response?.success) throw new Error('Unable to save entry')
    await load()
    $toast.success(t('cashbook.entrySaved'))
    return response.data
  }

  async function updateEntry(id: string, payload: {
    entryDate: string
    kind: CashbookKind
    amountRial: string
    categoryId: string
    accountId: string
    description: string
    notes?: string | null
    reference?: string | null
  }) {
    const response = await apiFetch<CashbookApiResponse<CashbookEntry>>(`/api/cashbook/entries/${id}`, {
      method: 'PATCH',
      body: payload,
    })
    if (!response?.success) throw new Error('Unable to update entry')
    await load()
    $toast.success(t('cashbook.entryUpdated'))
    return response.data
  }

  async function voidEntry(id: string, reason: string) {
    const response = await apiFetch<CashbookApiResponse<CashbookEntry>>(`/api/cashbook/entries/${id}/void`, {
      method: 'POST',
      body: { reason },
    })
    if (!response?.success) throw new Error('Unable to void entry')
    await load()
    $toast.success(t('cashbook.entryVoided'))
  }

  async function updateCategory(id: string, payload: { name: string; kind: CashbookKind; color?: string | null; isArchived?: boolean }) {
    const response = await apiFetch<CashbookApiResponse<CashbookCategory>>(`/api/cashbook/categories/${id}`, {
      method: 'PATCH',
      body: payload,
    })
    if (!response?.success) throw new Error('Unable to update category')
    await load()
    $toast.success(t('cashbook.categoryUpdated'))
  }

  async function saveCategory(payload: { name: string; kind: CashbookKind; color?: string | null }) {
    const response = await apiFetch<CashbookApiResponse<CashbookCategory>>('/api/cashbook/categories', {
      method: 'POST',
      body: payload,
    })
    if (!response?.success) throw new Error('Unable to save category')
    await load()
    $toast.success(t('cashbook.categorySaved'))
  }

  async function updateAccount(id: string, payload: { name: string; type: CashbookAccountType; openingBalanceRial: string; isArchived?: boolean }) {
    const response = await apiFetch<CashbookApiResponse<CashbookAccount>>(`/api/cashbook/accounts/${id}`, {
      method: 'PATCH',
      body: payload,
    })
    if (!response?.success) throw new Error('Unable to update account')
    await load()
    $toast.success(t('cashbook.accountUpdated'))
  }

  async function saveAccount(payload: { name: string; type: CashbookAccountType; openingBalanceRial: string }) {
    const response = await apiFetch<CashbookApiResponse<CashbookAccount>>('/api/cashbook/accounts', {
      method: 'POST',
      body: payload,
    })
    if (!response?.success) throw new Error('Unable to save account')
    await load()
    $toast.success(t('cashbook.accountSaved'))
  }

  async function saveBudget(payload: { categoryId: string; month: string; amountRial: string }) {
    const response = await apiFetch<CashbookApiResponse<CashbookBudget>>('/api/cashbook/budgets', {
      method: 'POST',
      body: payload,
    })
    if (!response?.success) throw new Error('Unable to save budget')
    await load()
    $toast.success(t('cashbook.budgetSaved'))
  }

  async function deleteBudget(id: string) {
    const response = await apiFetch<CashbookApiResponse<{ id: string }>>(`/api/cashbook/budgets/${id}`, { method: 'DELETE' })
    if (!response?.success) throw new Error('Unable to delete budget')
    await load()
    $toast.success(t('cashbook.budgetDeleted'))
  }

  async function uploadReceipt(entryId: string, file: File) {
    const body = new FormData()
    body.append('file', file)
    const response = await apiFetch<CashbookApiResponse<{ id: string }>>(`/api/cashbook/entries/${entryId}/receipt`, {
      method: 'POST',
      body,
    })
    if (!response?.success) throw new Error('Unable to upload receipt')
    await load()
    $toast.success(t('cashbook.receiptUploaded'))
  }

  async function downloadReceipt(receiptId: string, fallbackName = 'cashbook-receipt') {
    // No userId is sent: the receipt's own owner is authoritative server-side, so a
    // supplied owner could only ever be redundant.
    const response = await fetch(`${useRuntimeConfig().public.apiBase}/api/cashbook/receipts/${receiptId}`, {
      headers: { Authorization: `Bearer ${token.value || ''}` },
    })
    if (!response.ok) throw new Error('Receipt download failed')
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filenameFromDisposition(response.headers.get('content-disposition'), fallbackName)
    link.click()
    URL.revokeObjectURL(url)
  }

  async function exportData(format: 'xlsx' | 'csv') {
    const params = queryString({
      ...range.value,
      month: range.value.from.slice(0, 7),
      ...ownerQuery.value,
      kind: filters.value.kind,
      status: filters.value.status,
      search: filters.value.search.trim(),
      format,
    })
    const response = await fetch(`${useRuntimeConfig().public.apiBase}/api/cashbook/export${params}`, {
      headers: { Authorization: `Bearer ${token.value || ''}` },
    })
    if (!response.ok) throw new Error('Export failed')
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `cashbook-${range.value.from.slice(0, 7)}.${format}`
    link.click()
    URL.revokeObjectURL(url)
  }

  watch([year, month, ownerId, rangeMode, customFrom, customTo], () => {
    page.value = 1
    void load().then(() => loadAnalytics())
  })
  watch(comparisonCount, () => {
    void loadAnalytics()
  })
  onMounted(() => {
    refresh()
  })

  return {
    canEdit,
    isReadOnly,
    isOwnLedger,
    hasSharedLedgers,
    year,
    month,
    period,
    monthOptions,
    monthLabel,
    rangeMode,
    customFrom,
    customTo,
    setRangeMode,
    setCustomRange,
    applyPreset,
    rangePresets,
    rangeLabel,
    ledgers,
    grants,
    candidates,
    accessSaving,
    ownerId,
    selectedOwnerLabel,
    loadAccess,
    grantAccess,
    revokeAccess,
    range,
    summary,
    entries,
    categories,
    accounts,
    loading,
    loadError,
    page,
    pagination,
    filters,
    comparisonCount,
    comparisonSeries,
    weekdaySeries,
    previousTotals,
    currentTotals,
    deltas,
    analyticsLoading,
    load,
    loadAnalytics,
    refresh,
    applyFilters,
    changePage,
    shiftMonth,
    setPeriod,
    goToday,
    saveEntry,
    updateEntry,
    voidEntry,
    saveCategory,
    updateCategory,
    saveAccount,
    updateAccount,
    saveBudget,
    deleteBudget,
    uploadReceipt,
    downloadReceipt,
    exportData,
  }
}
