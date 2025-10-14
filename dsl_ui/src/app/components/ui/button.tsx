// src/components/ui/button.tsx
import * as React from 'react'
import { cn } from '../../lib/utils'   // or inline your own `join` helper

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost'
}

export function Button({
  className,
  variant = 'default',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
        variant === 'outline' && 'border border-gray-300 hover:bg-gray-100',
        variant === 'ghost'   && 'bg-transparent hover:bg-gray-100',
        className
      )}
      {...props}
    />
  )
}
