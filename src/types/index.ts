export type TransactionType = 'income' | 'expense'

export type UUID = string

export type DbTimestamp = string

export interface Profile {
  id: UUID
  user_id: UUID
  created_at: DbTimestamp
}

export interface Category {
  id: UUID
  user_id: UUID
  name: string
  created_at: DbTimestamp
}

export interface Transaction {
  id: UUID
  user_id: UUID
  type: TransactionType
  title: string
  amount: number
  date: string // YYYY-MM-DD
  category_id: UUID | null
  created_at: DbTimestamp
}

// Utilitário para formulários (sem campos de DB)
export interface TransactionFormValues {
  type: TransactionType
  title: string
  amount: number
  date: string
  category_id: UUID | null
}

export interface CategoryFormValues {
  name: string
}

