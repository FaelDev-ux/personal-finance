import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { useSupabaseAuth } from '../hooks/useSupabaseAuth'
import { useCategories } from '../hooks/useCategories'
import { formatDateBR } from '../utils/format'

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
    <div className="flex flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Categorias</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Crie categorias para organizar suas transações.</p>
      </header>

      {error ? <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{error}</div> : null}

      <div className="grid gap-4 lg:grid-cols-[420px_1fr]">
        <section className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Nova categoria</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">As categorias ficam associadas ao seu usuário.</p>

          <form className="mt-4 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Nome</label>
              <input
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 dark:border-slate-800 dark:bg-slate-900"
                placeholder="Ex.: Alimentação, Saúde..."
                {...register('name')}
              />
              {errors.name ? <p className="text-xs text-rose-600">{errors.name.message}</p> : null}
            </div>

            {formError ? (
              <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{formError}</div>
            ) : null}

            <button
              disabled={isSubmitting || loading}
              type="submit"
              className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-60"
            >
              {isSubmitting ? 'Criando...' : 'Criar categoria'}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">Lista</h2>
            <div className="text-xs text-slate-500 dark:text-slate-400">{loading ? 'Carregando...' : `${categories.length} categorias`}</div>
          </div>

          <div className="mt-3 overflow-auto">
            <table className="min-w-full text-sm">
              <thead className="text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-2 py-2">Nome</th>
                  <th className="px-2 py-2">Criada em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-2 py-4 text-center text-slate-500">
                      Nenhuma categoria ainda.
                    </td>
                  </tr>
                ) : null}

                {categories.map((c) => (
                  <tr key={c.id}>
                    <td className="px-2 py-3 text-slate-700 dark:text-slate-200">{c.name}</td>
                    <td className="px-2 py-3 text-slate-600 dark:text-slate-300">{formatDateBR(c.created_at.slice(0, 10))}</td>
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

