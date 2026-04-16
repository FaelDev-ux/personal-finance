import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useSupabaseAuth } from '../hooks/useSupabaseAuth'
import { useCategories } from '../hooks/useCategories'
import { useTransactions } from '../hooks/useTransactions'
import type { TransactionFormValues, TransactionType, UUID } from '../types'
import { formatBRL, formatDateBR } from '../utils/format'

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
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Transações</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">CRUD completo: receitas, despesas e categorias.</p>
      </header>

      {txError ? <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{txError}</div> : null}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <label className="text-sm text-slate-700 dark:text-slate-200">Filtro:</label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-900"
          >
            <option value="all">Todas</option>
            <option value="income">Receitas</option>
            <option value="expense">Despesas</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 dark:text-slate-400">
          {txLoading ? 'Atualizando...' : `Exibindo ${transactions.length} transações`}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
        <section className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{formModeLabel}</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">O valor deve ser positivo. O tipo define receita/despesa.</p>
            </div>
            {editingId ? (
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              >
                Cancelar
              </button>
            ) : null}
          </div>

          <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Tipo</label>
                <select
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-900"
                  {...register('type')}
                >
                  <option value="income">Receita</option>
                  <option value="expense">Despesa</option>
                </select>
                {errors.type ? <p className="text-xs text-rose-600">{errors.type.message}</p> : null}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Data</label>
                <input
                  type="date"
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-900"
                  {...register('date')}
                />
                {errors.date ? <p className="text-xs text-rose-600">{errors.date.message}</p> : null}
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Título</label>
              <input
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:border-slate-800 dark:bg-slate-900"
                placeholder="Ex.: Salário, Mercado..."
                {...register('title')}
              />
              {errors.title ? <p className="text-xs text-rose-600">{errors.title.message}</p> : null}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Valor</label>
              <input
                type="number"
                inputMode="decimal"
                step="0.01"
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:border-slate-800 dark:bg-slate-900"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount ? <p className="text-xs text-rose-600">{errors.amount.message}</p> : null}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Categoria (opcional)</label>
              <select
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none dark:border-slate-800 dark:bg-slate-900"
                {...register('category_id', { setValueAs: (v) => (v === '' ? null : v) })}
              >
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.category_id ? <p className="text-xs text-rose-600">{errors.category_id.message}</p> : null}
            </div>

            <div className="flex items-center gap-3">
              <button
                disabled={isSubmitting}
                type="submit"
                className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-60"
              >
                {isSubmitting ? 'Salvando...' : editingId ? 'Salvar alterações' : 'Adicionar'}
              </button>
              {editingId ? (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                >
                  Limpar
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Lista</h2>
            <div className="text-xs text-slate-500 dark:text-slate-400">Edita ou exclui diretamente.</div>
          </div>

          <div className="mt-3 overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-2 py-2">Data</th>
                  <th className="px-2 py-2">Título</th>
                  <th className="px-2 py-2">Categoria</th>
                  <th className="px-2 py-2">Tipo</th>
                  <th className="px-2 py-2 text-right">Valor</th>
                  <th className="px-2 py-2 text-right">Ações</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {txLoading ? (
                  <tr>
                    <td colSpan={6} className="px-2 py-4 text-center text-slate-500">
                      Carregando...
                    </td>
                  </tr>
                ) : null}

                {!txLoading && transactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-2 py-4 text-center text-slate-500">
                      Nenhuma transação encontrada.
                    </td>
                  </tr>
                ) : null}

                {transactions.map((t) => (
                  <tr key={t.id}>
                    <td className="px-2 py-3 whitespace-nowrap text-slate-700 dark:text-slate-200">
                      {formatDateBR(t.date)}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-slate-700 dark:text-slate-200">{t.title}</td>
                    <td className="px-2 py-3 whitespace-nowrap text-slate-600 dark:text-slate-300">
                      {t.category_name ?? '—'}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap">
                      {t.type === 'income' ? (
                        <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                          Receita
                        </span>
                      ) : (
                        <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-800 dark:bg-rose-950/40 dark:text-rose-200">
                          Despesa
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-right font-medium">
                      {t.type === 'income' ? (
                        <span className="text-emerald-700 dark:text-emerald-300">{formatBRL(t.amount)}</span>
                      ) : (
                        <span className="text-rose-700 dark:text-rose-300">-{formatBRL(t.amount)}</span>
                      )}
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => startEdit(t.id)}
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(t.id)}
                          className="rounded-md border border-rose-200 bg-white px-2 py-1 text-xs text-rose-700 hover:bg-rose-50 dark:border-rose-900/50 dark:bg-slate-900 dark:text-rose-200"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}

