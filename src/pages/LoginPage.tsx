import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { supabase } from '../services/supabaseClient'

const loginSchema = z.object({
  email: z.string().email('Informe um e-mail válido'),
  password: z.string().min(6, 'Sua senha precisa ter ao menos 6 caracteres'),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginValues) => {
    setError(null)

    const { error: supaError } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    })

    if (supaError) {
      setError(supaError.message)
      return
    }

    navigate('/dashboard')
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4">
      <div className="w-full rounded-xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
        <h1 className="text-2xl font-semibold">Entrar</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Acesse suas finanças pessoais.</p>

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">E-mail</label>
            <input
              type="email"
              autoComplete="email"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              {...register('email')}
            />
            {errors.email ? <p className="text-xs text-rose-600">{errors.email.message}</p> : null}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Senha</label>
            <input
              type="password"
              autoComplete="current-password"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              {...register('password')}
            />
            {errors.password ? <p className="text-xs text-rose-600">{errors.password.message}</p> : null}
          </div>

          {error ? <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{error}</div> : null}

          <button
            disabled={isSubmitting}
            className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-60"
            type="submit"
          >
            {isSubmitting ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="text-center text-sm text-slate-600 dark:text-slate-300">
            Não tem conta?{' '}
            <Link to="/register" className="font-medium text-purple-700 hover:underline dark:text-purple-300">
              Criar conta
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

