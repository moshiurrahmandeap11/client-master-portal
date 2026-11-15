import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 
    | 'primary' 
    | 'secondary' 
    | 'outline' 
    | 'outline-emerald'
    | 'ghost' 
    | 'danger' 
    | 'success' 
    | 'subtle'
    | 'glass';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'icon' | 'icon-sm' | 'icon-lg';
  loading?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-emerald-700 text-white hover:bg-emerald-800 active:bg-emerald-900 shadow-sm focus-visible:ring-emerald-600',
  secondary: 'bg-slate-800 text-white hover:bg-slate-700 active:bg-slate-900 shadow-sm focus-visible:ring-slate-600',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 focus-visible:ring-slate-400',
  'outline-emerald': 'border border-emerald-600 text-emerald-800 bg-emerald-50/50 hover:bg-emerald-100/60 active:bg-emerald-100 focus-visible:ring-emerald-500',
  ghost: 'text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400',
  danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm shadow-rose-900/10 focus-visible:ring-rose-500',
  success: 'bg-emerald-700 text-white hover:bg-emerald-800 active:bg-emerald-900 shadow-sm focus-visible:ring-emerald-600',
  subtle: 'bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 border border-slate-200/80 focus-visible:ring-slate-400',
  glass: 'bg-white/80 hover:bg-white text-slate-900 border border-slate-200/80 shadow-xs backdrop-blur-md active:bg-slate-50 focus-visible:ring-slate-400',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  xs: 'h-7 px-2.5 text-xs font-normal gap-1.5',
  sm: 'h-8 px-3 text-xs font-normal gap-1.5',
  md: 'h-10 px-4 text-sm font-normal gap-2',
  lg: 'h-11 px-5 text-base font-normal gap-2.5',
  xl: 'h-12 px-7 text-base font-normal gap-3',
  icon: 'h-9 w-9 p-0 flex items-center justify-center',
  'icon-sm': 'h-8 w-8 p-0 flex items-center justify-center',
  'icon-lg': 'h-11 w-11 p-0 flex items-center justify-center',
};

/**
 * Global Sharable Button Component
 * Standardized across Chakri Sheba with an exact border radius of 7px (`rounded-[7px]`).
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      type = 'button',
      loading = false,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const isBusy = Boolean(loading || isLoading);
    const isDisabled = Boolean(disabled || isBusy);

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center select-none font-solaiman transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1',
          'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.99] cursor-pointer',
          'rounded-[7px]', // User mandated strictly 7px border-radius
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {isBusy ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin flex-shrink-0" />
            <span>{loadingText || children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0 inline-flex items-center">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="flex-shrink-0 inline-flex items-center">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
