import type { ReactNode } from 'react'

type BadgeVariant = 'default' | 'income' | 'expense' | 'neutral'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200',
  income: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  expense: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  neutral: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}
