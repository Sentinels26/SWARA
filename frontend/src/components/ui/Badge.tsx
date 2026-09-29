import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning';
}

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        {
          'border-transparent bg-slate-900 text-white hover:bg-slate-900/80': variant === 'default',
          'border-transparent bg-slate-100 text-slate-900 hover:bg-slate-100/80': variant === 'secondary',
          'border-transparent bg-red-100 text-red-800 hover:bg-red-100/80': variant === 'destructive',
          'border-transparent bg-emerald-100 text-emerald-800 hover:bg-emerald-100/80': variant === 'success',
          'border-transparent bg-amber-100 text-amber-800 hover:bg-amber-100/80': variant === 'warning',
          'text-foreground': variant === 'outline',
        },
        className
      )}
      {...props}
    />
  );
}
