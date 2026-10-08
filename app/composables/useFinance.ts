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

function addJalaaliMonth<T>(value: T): T {
  return (value as unknown as { add: (amount: number, unit: string) => T }).add(1, 'jMonth')
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

  const range = computed(() => {
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
  const monthLabel = computed(() => {
    const index = Number(month.value) - 1
    return `${monthOptions.value[index]?.title || month.value} ${year.value}`
  })
  const period = computed(() => ({ year: year.value, month: month.value }))
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

  async function refresh() {
    try {
      await Promise.all([loadLedgers(), load()])
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
    const next = moment(`${year.value}-${month.value}-01`, 'jYYYY-jMM-jDD').add(delta, 'jMonth')
    year.value = next.format('jYYYY')
    month.value = next.format('jMM')
  }

  function setPeriod(next: { year: string; month: string }) {
    year.value = next.year
    month.value = next.month
  }

  function goToday() {
    year.value = moment().format('jYYYY')
    month.value = moment().format('jMM')
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

  watch([year, month, ownerId], () => {
    page.value = 1
    load()
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
    load,
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
