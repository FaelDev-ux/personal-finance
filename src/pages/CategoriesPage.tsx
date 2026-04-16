import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useSupabaseAuth } from '../hooks/useSupabaseAuth'
import { useCategories } from '../hooks/useCategories'
import { formatDateBR } from '../utils/format'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'

const categorySchema = z.object({
  name: z.string().min(2, 'Informe um nome com pelo menos 2 caracteres'),
})

type CategoryValues = z.infer<typeof categorySchema>

export function CategoriesPage() {
  const { user } = useSupabaseAuth()
  const userId = user?.id

  const { categories, loading, error, createCategory } = useCategories(userId ?? null)

  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
    },
  })

  const onSubmit = async (values: CategoryValues) => {
    setFormError(null)
    await createCategory(values).catch((e) => setFormError(e instanceof Error ? e.message : String(e)))
    reset()
  }

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">Categorias</h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Crie categorias para organizar suas transações.</p>
      </header>

      {error && (
        <div className="rounded-lg bg-rose-50 p-3 text-xs sm:text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 md:gap-6 lg:grid lg:grid-cols-[1fr_2fr]">
        {/* Formulário */}
        <Card className="p-4 sm:p-5 md:p-6 order-2 lg:order-1">
          <CardContent className="space-y-4">
            <div>
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Nova categoria</h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Associada ao seu usuário.</p>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <Input
                label="Nome"
                placeholder="Ex.: Alimentação, Saúde, Transporte..."
                error={errors.name?.message}
                {...register('name')}
              />

              {formError && (
                <div className="rounded-lg bg-rose-50 p-3 text-xs sm:text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">
                  {formError}
                </div>
              )}

              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting || loading}
                size="md"
                className="w-full"
              >
                Criar categoria
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de categorias */}
        <Card className="p-4 sm:p-5 md:p-6 order-1 lg:order-2">
          <CardContent>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <h2 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white">Suas categorias</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {loading ? 'Carregando...' : `${categories.length} ${categories.length === 1 ? 'categoria' : 'categorias'}`}
              </span>
            </div>

            {loading ? (
              <LoadingSpinner size="md" message="Carregando categorias..." />
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-slate-500 dark:text-slate-400">Nenhuma categoria criada ainda.</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">Crie uma categoria para organizar suas transações!</p>
              </div>
            ) : (
              <div className="grid gap-2">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/30 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{c.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Criada em {formatDateBR(c.created_at.slice(0, 10))}
                      </p>
                    </div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30">
                      <span className="text-sm text-purple-600 dark:text-purple-300">🏷️</span>
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

