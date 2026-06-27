import React, { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  leftIcon,
  rightIcon,
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id ?? `input-${Math.random().toString(36).slice(2)}`

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-dark-700 dark:text-dark-300">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full h-11 px-4
            bg-dark-100 dark:bg-dark-800
            border border-transparent
            rounded-2xl
            text-dark-900 dark:text-dark-100
            placeholder-dark-400 dark:placeholder-dark-500
            text-[15px]
            transition-all duration-150
            focus:outline-none focus:border-primary-400 focus:bg-white dark:focus:bg-dark-700
            focus:ring-2 focus:ring-primary-400/20
            ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/20' : ''}
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${className}
          `}
          {...props}
        />
        {rightIcon && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400">
            {rightIcon}
          </span>
        )}
      </div>
      {error && (
        <p className="text-xs text-red-500 pl-1">{error}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'
