import { useMemo } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

import { useSupabaseAuth } from '../hooks/useSupabaseAuth'
import { useTransactions } from '../hooks/useTransactions'
import { formatBRL, formatDateBR } from '../utils/format'

const INCOME_COLOR = '#a855f7' // roxo
const EXPENSE_COLOR = '#f43f5e' // rosa

export function DashboardPage() {
  const { user } = useSupabaseAuth()
  const userId = user?.id

  const { transactions, loading, error } = useTransactions(userId ?? null, 'all', 1000)

  const { incomeTotal, expenseTotal, balanceTotal } = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (Number.isFinite(t.amount) ? t.amount : 0), 0)

    const expense = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (Number.isFinite(t.amount) ? t.amount : 0), 0)

    return {
      incomeTotal: income,
      expenseTotal: expense,
      balanceTotal: income - expense,
    }
  }, [transactions])

  const chartData = useMemo(
    () => [
      { name: 'Receitas', value: incomeTotal, color: INCOME_COLOR },
      { name: 'Despesas', value: expenseTotal, color: EXPENSE_COLOR },
    ],
    [incomeTotal, expenseTotal],
  )

  const lastTransactions = transactions.slice(0, 7)

  return (
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Visão geral do seu mês e do seu saldo.</p>
      </header>

      {error ? <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{error}</div> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
          <div className="text-sm text-slate-600 dark:text-slate-300">Saldo total</div>
          <div className="mt-2 text-2xl font-semibold">{formatBRL(balanceTotal)}</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Receitas - despesas</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
          <div className="text-sm text-slate-600 dark:text-slate-300">Total de receitas</div>
          <div className="mt-2 text-2xl font-semibold text-purple-700 dark:text-purple-300">{formatBRL(incomeTotal)}</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Entradas do período</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
          <div className="text-sm text-slate-600 dark:text-slate-300">Total de despesas</div>
          <div className="mt-2 text-2xl font-semibold text-rose-700 dark:text-rose-300">{formatBRL(expenseTotal)}</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Saídas do período</div>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Receitas vs Despesas</h2>
          <div className="text-xs text-slate-500 dark:text-slate-400">Atualiza automaticamente</div>
        </div>

        <div className="mt-3 h-[280px]">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-slate-500 dark:text-slate-400">Carregando gráfico...</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={95}
                  stroke="none"
                >
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatBRL(Number(value))}
                  labelFormatter={(label) => String(label)}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Últimas transações</h2>
          <div className="text-xs text-slate-500 dark:text-slate-400">Mostrando {lastTransactions.length} registros</div>
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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {lastTransactions.length === 0 ? (
                <tr>
                  <td className="px-2 py-4 text-center text-slate-500" colSpan={5}>
                    Nenhuma transação ainda.
                  </td>
                </tr>
              ) : null}

              {lastTransactions.map((t) => (
                <tr key={t.id}>
                  <td className="px-2 py-3 whitespace-nowrap text-slate-700 dark:text-slate-200">{formatDateBR(t.date)}</td>
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
                  <td className="px-2 py-3 whitespace-nowrap text-right font-medium text-slate-800 dark:text-slate-50">
                    {t.type === 'income' ? formatBRL(t.amount) : `-${formatBRL(t.amount)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

