import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Transaction, TransactionFormValues, TransactionType, UUID } from '../types'
import { supabase } from '../services/supabaseClient'

type TransactionWithCategory = Transaction & { category_name: string | null }

type UseTransactionsResult = {
  transactions: TransactionWithCategory[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  createTransaction: (values: TransactionFormValues) => Promise<void>
  updateTransaction: (id: UUID, values: TransactionFormValues) => Promise<void>
  deleteTransaction: (id: UUID) => Promise<void>
}

export function useTransactions(
  userId?: UUID | null,
  typeFilter: TransactionType | 'all' = 'all',
  limit: number = 100,
): UseTransactionsResult {
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) {
      setTransactions([])
      return
    }

    setLoading(true)
    setError(null)

    let query = supabase
      .from('transactions')
      .select('id,user_id,type,title,amount,date,category_id,created_at,category:categories(name)')
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit)

    if (typeFilter !== 'all') {
      query = query.eq('type', typeFilter)
    }

    const { data, error: supaError } = await query

    if (supaError) {
      setError(supaError.message)
      setTransactions([])
      setLoading(false)
      return
    }

    const rows = (data ?? []) as Array<
      Transaction & {
        // Dependendo do relacionamento/seleção, o Supabase pode retornar como objeto ou array.
        category?: Array<{ name: string }> | { name: string } | null
      }
    >

    setTransactions(
      rows.map((t) => {
        const rawAmount = (t as any).amount as unknown
        const amount = typeof rawAmount === 'string' ? Number(rawAmount) : (rawAmount as number)
        const categoryName = Array.isArray(t.category)
          ? t.category[0]?.name ?? null
          : (t.category as { name: string } | null)?.name ?? null

        return {
          ...t,
          amount: Number.isFinite(amount) ? amount : 0,
          category_name: categoryName,
        }
      }),
    )
    setLoading(false)
  }, [limit, typeFilter, userId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`transactions:${userId}:${typeFilter}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          void refresh()
        },
      )

    void channel.subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [refresh, typeFilter, userId])

  const createTransaction = useCallback(
    async (values: TransactionFormValues) => {
      if (!userId) return
      setLoading(true)
      setError(null)

      const { error: supaError } = await supabase.from('transactions').insert({
        user_id: userId,
        type: values.type,
        title: values.title,
        amount: values.amount,
        date: values.date,
        category_id: values.category_id,
      })

      if (supaError) {
        setError(supaError.message)
        setLoading(false)
        return
      }

      await refresh()
      setLoading(false)
    },
    [refresh, userId],
  )

  const updateTransaction = useCallback(
    async (id: UUID, values: TransactionFormValues) => {
      setLoading(true)
      setError(null)

      const { error: supaError } = await supabase
        .from('transactions')
        .update({
        type: values.type,
        title: values.title,
        amount: values.amount,
        date: values.date,
        category_id: values.category_id,
        })
        .eq('id', id)

      if (supaError) {
        setError(supaError.message)
        setLoading(false)
        return
      }

      // RLS garante que somente seu registro será alterado
      await refresh()
      setLoading(false)
    },
    [refresh],
  )

  const deleteTransaction = useCallback(
    async (id: UUID) => {
      setLoading(true)
      setError(null)

      const { error: supaError } = await supabase.from('transactions').delete().eq('id', id)

      if (supaError) {
        setError(supaError.message)
        setLoading(false)
        return
      }

      await refresh()
      setLoading(false)
    },
    [refresh],
  )

  return useMemo(
    () => ({
      transactions,
      loading,
      error,
      refresh,
      createTransaction,
      updateTransaction,
      deleteTransaction,
    }),
    [createTransaction, deleteTransaction, error, refresh, transactions, updateTransaction, loading],
  )
}

