export type CashbookKind = 'income' | 'expense'
export type CashbookStatus = 'active' | 'voided'
export type CashbookAccountType = 'cash' | 'bank' | 'card' | 'other'

export interface CashbookCategory {
  id: string
  name: string
  kind: CashbookKind
  color: string | null
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface CashbookAccount {
  id: string
  name: string
  type: CashbookAccountType
  openingBalanceRial: string
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export interface CashbookReceipt {
  id: string
  originalName: string
  mimeType: string
  fileSize: number
}

export interface CashbookEntry {
  id: string
  userId: string
  entryDate: string
  kind: CashbookKind
  amountRial: string
  categoryId: string
  categoryName: string
  categoryColor: string | null
  accountId: string
  accountName: string
  accountType: CashbookAccountType
  description: string
  notes: string | null
  reference: string | null
  status: CashbookStatus
  voidReason: string | null
  voidedAt: string | null
  createdAt: string
  updatedAt: string
  receipt: CashbookReceipt | null
}

export interface CashbookBudget {
  id: string
  categoryId: string
  categoryName: string
  kind: CashbookKind
  color: string | null
  month: string
  amountRial: string
  spentRial: string
  remainingRial: string
}

export interface CashbookSummary {
  period: { from: string; to: string }
  totals: {
    incomeRial: string
    expenseRial: string
    netRial: string
    entryCount: number
  }
  byDay: Array<{ date: string; incomeRial: string; expenseRial: string }>
  byCategory: Array<{
    categoryId: string
    categoryName: string
    kind: CashbookKind
    color: string | null
    amountRial: string
  }>
  accounts: Array<{
    id: string
    name: string
    type: CashbookAccountType
    openingBalanceRial: string
    balanceRial: string
  }>
  budgets: CashbookBudget[]
}

export interface CashbookEntryPage {
  data: CashbookEntry[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface CashbookOwner {
  id: string
  fullName: string | null
  role: string
}

export interface CashbookApiResponse<T> {
  success: boolean
  data: T
}
