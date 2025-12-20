'use client'

import { type ButtonHTMLAttributes, type ReactNode } from 'react'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'glass' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  children: ReactNode
  loading?: boolean
  icon?: ReactNode
  fullWidth?: boolean
  className?: string
}

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  disabled,
  loading,
  icon,
  fullWidth,
  className = '',
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-bold rounded-lg transition-smooth btn-press focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-foundation disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary: 'glass-primary shadow-glass-inset hover:shadow-glow-primary text-textWhite',
    secondary: 'glass border-primary/20 hover:border-primary/50 hover:shadow-glow-primary text-textWhite',
    ghost: 'bg-transparent hover:bg-surface/50 text-primary',
    glass: 'glass hover:shadow-glow-primary text-textWhite',
    danger: 'glass border-accent/30 hover:border-accent hover:shadow-glow-accent text-textWhite bg-gradient-to-br from-accent/20 to-transparent',
  }

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[40px]',
    md: 'px-4 py-3 text-base min-h-[48px] min-w-[48px]',
    lg: 'px-6 py-4 text-lg min-h-[56px]',
    icon: 'p-3 min-h-[48px] min-w-[48px]',
  }

  const widthClass = fullWidth ? 'w-full' : ''

  const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children}
        </>
      )}
    </button>
  )
}
