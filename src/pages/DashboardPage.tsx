import { useMemo } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'

import { useSupabaseAuth } from '../hooks/useSupabaseAuth'
import { useTransactions } from '../hooks/useTransactions'
import { formatBRL, formatDateBR } from '../utils/format'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

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

  const lastTransactions = transactions.slice(0, 10)

  return (
    <div className="flex flex-col gap-4 md:gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Visão geral do seu mês e do seu saldo.</p>
      </header>

      {error ? (
        <div className="rounded-lg bg-rose-50 p-3 text-xs sm:text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      ) : null}

      {/* Cards Resumo */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-3 sm:p-4">
          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Saldo total</p>
            <div className={`text-lg sm:text-2xl font-bold ${balanceTotal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatBRL(balanceTotal)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-500">Receitas - despesas</p>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Total de receitas</p>
            <div className="text-lg sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
              {formatBRL(incomeTotal)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-500">Entradas do período</p>
          </div>
        </Card>

        <Card className="p-3 sm:p-4">
          <div className="space-y-2">
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Total de despesas</p>
            <div className="text-lg sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
              {formatBRL(expenseTotal)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-500">Saídas do período</p>
          </div>
        </Card>
      </div>

      {/* Gráfico */}
      <Card className="p-3 sm:p-4 md:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Receitas vs Despesas</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">Atualiza automaticamente</span>
        </div>

        {loading ? (
          <div className="h-64 sm:h-80 flex items-center justify-center">
            <LoadingSpinner size="md" message="Carregando gráfico..." />
          </div>
        ) : (
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={70}
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
          </div>
        )}
      </Card>

      {/* Últimas Transações */}
      <Card className="p-3 sm:p-4 md:p-6 overflow-hidden">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Últimas transações</h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">{lastTransactions.length} registros</span>
        </div>

        {lastTransactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma transação ainda.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {lastTransactions.map((t) => (
              <div
                key={t.id}
                className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-white truncate">{t.title}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Badge variant={t.type === 'income' ? 'income' : 'expense'} className="text-xs">
                      {t.type === 'income' ? '↓ Receita' : '↑ Despesa'}
                    </Badge>
                    {t.category_name && (
                      <span className="text-xs text-slate-500 dark:text-slate-400">{t.category_name}</span>
                    )}
                    <span className="text-xs text-slate-500 dark:text-slate-400">{formatDateBR(t.date)}</span>
                  </div>
                </div>
                <div className={`font-semibold text-sm sm:text-base whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatBRL(t.amount)}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

