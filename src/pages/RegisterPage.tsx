import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { supabase } from '../services/supabaseClient'

const registerSchema = z
  .object({
    email: z.string().email('Informe um e-mail válido'),
    password: z.string().min(6, 'Sua senha precisa ter ao menos 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirme sua senha'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: 'As senhas precisam ser iguais',
    path: ['confirmPassword'],
  })

type RegisterValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const navigate = useNavigate()
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (values: RegisterValues) => {
    setError(null)
    setMessage(null)

    const { data, error: supaError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
    })

    if (supaError) {
      setError(supaError.message)
      return
    }

    if (data.session) {
      navigate('/dashboard')
      return
    }

    setMessage('Conta criada! Verifique seu e-mail para confirmar o acesso (se necessário).')
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md items-center justify-center px-4">
      <div className="w-full rounded-xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-950/40">
        <h1 className="text-2xl font-semibold">Criar conta</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Comece seu controle financeiro em minutos.</p>

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
              autoComplete="new-password"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              {...register('password')}
            />
            {errors.password ? <p className="text-xs text-rose-600">{errors.password.message}</p> : null}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Confirmar senha</label>
            <input
              type="password"
              autoComplete="new-password"
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword ? <p className="text-xs text-rose-600">{errors.confirmPassword.message}</p> : null}
          </div>

          {error ? <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950/40 dark:text-rose-200">{error}</div> : null}
          {message ? <div className="rounded-md bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">{message}</div> : null}

          <button
            disabled={isSubmitting}
            className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-60"
            type="submit"
          >
            {isSubmitting ? 'Criando...' : 'Criar conta'}
          </button>

          <div className="text-center text-sm text-slate-600 dark:text-slate-300">
            Já tem conta?{' '}
            <Link to="/login" className="font-medium text-purple-700 hover:underline dark:text-purple-300">
              Entrar
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

