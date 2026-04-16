import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useSupabaseAuth } from '../hooks/useSupabaseAuth'
import { useCategories } from '../hooks/useCategories'
import { useTransactions } from '../hooks/useTransactions'
import type { TransactionFormValues, TransactionType, UUID } from '../types'
import { formatBRL, formatDateBR } from '../utils/format'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

const transactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  title: z.string().min(1, 'Informe um título'),
  amount: z.number().positive('Informe um valor maior que zero'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data válida (YYYY-MM-DD)'),
  category_id: z.string().nullable(),
})

type TransactionValues = z.infer<typeof transactionSchema>

function toFormValues(values: TransactionValues): TransactionFormValues {
  return {
    type: values.type,
    title: values.title,
    amount: values.amount,
    date: values.date,
    category_id: values.category_id,
  }
}

export function TransactionsPage() {
  const { user } = useSupabaseAuth()
  const userId = user?.id

  const [typeFilter, setTypeFilter] = useState<TransactionType | 'all'>('all')
  const [editingId, setEditingId] = useState<UUID | null>(null)

  const { categories } = useCategories(userId ?? null)
  const {
    transactions,
    loading: txLoading,
    error: txError,
    createTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactions(userId ?? null, typeFilter, 200)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'income',
      title: '',
      amount: 0,
      date: new Date().toISOString().slice(0, 10),
      category_id: null,
    },
  })

  const formModeLabel = editingId ? 'Editar transação' : 'Adicionar transação'

  const onSubmit = async (values: TransactionValues) => {
    const payload = toFormValues(values)

    if (editingId) {
      await updateTransaction(editingId, payload)
      setEditingId(null)
      reset()
      return
    }

    await createTransaction(payload)
    reset()
  }

  const startEdit = (id: UUID) => {
    const t = transactions.find((x) => x.id === id)
    if (!t) return

    setEditingId(id)
    setValue('type', t.type)
    setValue('title', t.title)
    setValue('amount', t.amount)
    setValue('date', t.date)
    setValue('category_id', t.category_id)
  }

  const cancelEdit = () => {
    setEditingId(null)
    reset()
  }

  const onDelete = async (id: UUID) => {
    const ok = window.confirm('Excluir esta transação?')
    if (!ok) return
    await deleteTransaction(id)
    if (editingId === id) cancelEdit()
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Transações</h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Gerencie suas receitas e despesas.</p>
      </header>

      {txError && (
        <div className="rounded-lg bg-rose-50 p-3 text-xs sm:text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
          {txError}
        </div>
      )}

      {/* Filtro */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">Filtro:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs sm:text-sm text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          >
            <option value="all">Todas</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">
          {txLoading ? 'Atualizando...' : `${transactions.length} transações`}
        </div>
      </div>

      {/* Layout responsivo: mobile = stack, desktop = grid */}
      <div className="flex flex-col gap-4 md:gap-6 lg:grid lg:grid-cols-[1fr_2fr]">
        {/* Formulário */}
        <Card className="p-4 sm:p-5 md:p-6 order-2 lg:order-1">
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">{formModeLabel}</h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Preencha os campos abaixo.</p>
              </div>
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="px-2 py-1 text-xs rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                >
                  ✕
                </button>
              )}
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {/* Type e Date em grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">Tipo</label>
                  <select
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm outline-none dark:border-slate-800 dark:bg-slate-900"
                    {...register('type')}
                  >
                    <option value="income">📥 Receita</option>
                    <option value="expense">📤 Despesa</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">Data</label>
                  <input
                    type="date"
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm outline-none dark:border-slate-800 dark:bg-slate-900"
                    {...register('date')}
                  />
                </div>
              </div>

              {errors.type && <p className="text-xs text-rose-600">{errors.type.message}</p>}
              {errors.date && <p className="text-xs text-rose-600">{errors.date.message}</p>}

              <Input
                label="Título"
                placeholder="Ex.: Salário, Mercado..."
                error={errors.title?.message}
                {...register('title')}
              />

              <Input
                label="Valor"
                type="number"
                inputMode="decimal"
                placeholder="0.00"
                step="0.01"
                error={errors.amount?.message}
                {...register('amount', { valueAsNumber: true })}
              />

              <div className="flex flex-col gap-1">
                <label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200">Categoria</label>
                <select
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm outline-none dark:border-slate-800 dark:bg-slate-900"
                  {...register('category_id', { setValueAs: (v) => (v === '' ? null : v) })}
                >
                  <option value="">Sem categoria</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  isLoading={isSubmitting}
                  disabled={isSubmitting}
                  size="md"
                  className="flex-1"
                >
                  {editingId ? 'Atualizar' : 'Adicionar'}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="md"
                    onClick={cancelEdit}
                  >
                    Limpar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Lista de transações */}
        <Card className="p-4 sm:p-5 md:p-6 order-1 lg:order-2">
          <CardContent>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Lista de transações</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">Clique para editar ou excluir</span>
            </div>

            {txLoading ? (
              <LoadingSpinner size="md" message="Carregando transações..." />
            ) : transactions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma transação encontrada.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {transactions.map((t) => (
                  <div
                    key={t.id}
                    className="flex items-start justify-between gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white truncate">{t.title}</p>
                      <div className="flex flex-wrap gap-2 mt-1.5">
                        <Badge 
                          variant={t.type === 'income' ? 'income' : 'expense'} 
                          className="text-xs"
                        >
                          {t.type === 'income' ? '📥 Receita' : '📤 Despesa'}
                        </Badge>
                        {t.category_name && (
                          <span className="inline-block px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-xs text-slate-700 dark:text-slate-300">
                            {t.category_name}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatDateBR(t.date)}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <span className={`font-semibold text-sm whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatBRL(t.amount)}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => startEdit(t.id)}
                          className="px-2 py-1 text-xs rounded-md bg-purple-100 hover:bg-purple-200 text-purple-700 dark:bg-purple-900/30 dark:hover:bg-purple-900/50 dark:text-purple-300"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(t.id)}
                          className="px-2 py-1 text-xs rounded-md bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-300"
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

