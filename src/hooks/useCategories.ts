import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Category, UUID } from '../types'
import { supabase } from '../services/supabaseClient'

type UseCategoriesResult = {
  categories: Category[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  createCategory: (values: { name: string }) => Promise<void>
}

export function useCategories(userId?: UUID | null): UseCategoriesResult {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!userId) {
      setCategories([])
      return
    }
    setLoading(true)
    setError(null)

    const { data, error: supaError } = await supabase
      .from('categories')
      .select('id, user_id, name, created_at')
      .eq('user_id', userId)
      .order('name', { ascending: true })

    if (supaError) {
      setError(supaError.message)
      setCategories([])
      setLoading(false)
      return
    }

    setCategories((data ?? []) as Category[])
    setLoading(false)
  }, [userId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`categories:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'categories' },
        () => {
          void refresh()
        },
      )

    void channel.subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [refresh, userId])

  const createCategory = useCallback(
    async (values: { name: string }) => {
      if (!userId) return
      setLoading(true)
      setError(null)

      const { error: supaError } = await supabase.from('categories').insert({
        user_id: userId,
        name: values.name,
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

  return useMemo(
    () => ({
      categories,
      loading,
      error,
      refresh,
      createCategory,
    }),
    [categories, createCategory, error, loading, refresh],
  )
}

