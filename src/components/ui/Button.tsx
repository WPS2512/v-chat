import React from 'react'
import { Spinner } from './Spinner'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-primary-500 hover:bg-primary-600 active:bg-primary-700
    text-white shadow-md shadow-primary-500/25
    disabled:bg-primary-300
  `,
  secondary: `
    bg-dark-100 hover:bg-dark-200 active:bg-dark-300
    dark:bg-dark-800 dark:hover:bg-dark-700 dark:active:bg-dark-600
    text-dark-800 dark:text-dark-100
  `,
  ghost: `
    hover:bg-dark-100 active:bg-dark-200
    dark:hover:bg-dark-800 dark:active:bg-dark-700
    text-dark-600 dark:text-dark-400
  `,
  danger: `
    bg-red-500 hover:bg-red-600 active:bg-red-700
    text-white shadow-md shadow-red-500/25
  `,
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-xl',
  md: 'h-10 px-4 text-sm gap-2 rounded-2xl',
  lg: 'h-12 px-6 text-base gap-2 rounded-2xl',
}

export const Button = React.memo<ButtonProps>(({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  fullWidth = false,
  children,
  disabled,
  className = '',
  ...props
}) => {
  return (
    <button
      className={`
        inline-flex items-center justify-center font-medium
        transition-all duration-150 ease-ios
        focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2
        active:scale-95
        disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? <Spinner size="sm" /> : icon}
      {children}
    </button>
  )
})

Button.displayName = 'Button'
