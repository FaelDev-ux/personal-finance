import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

export function Input({ label, error, helper, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</label>}
      <input
        className={`
          rounded-md border border-slate-200 bg-white px-3 py-2 text-sm
          text-slate-900 outline-none transition-colors
          focus:border-purple-500 focus:ring-2 focus:ring-purple-500/10
          dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100
          placeholder:text-slate-500 dark:placeholder:text-slate-400
          disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
          dark:disabled:bg-slate-900 dark:disabled:text-slate-400
          ${error ? 'border-rose-500 dark:border-rose-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
      {helper && <p className="text-xs text-slate-500 dark:text-slate-400">{helper}</p>}
    </div>
  )
}
