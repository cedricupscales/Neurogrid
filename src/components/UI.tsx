import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Card = ({ children, className, style, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("bg-[#1E1E1E] border border-white/5 rounded-xl p-4 shadow-lg", className)} style={style} {...props}>
    {children}
  </div>
);

export const Button = ({ 
  children, 
  onClick, 
  className, 
  variant = 'primary',
  disabled,
  loading
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  className?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
}) => {
  const variants = {
    primary: "bg-gradient-to-br from-[#22C55E] via-[#4ADE80] to-[#16A34A] hover:from-[#16A34A] hover:to-[#15803D] text-white shadow-[0_0_20px_rgba(34,197,94,0.3)] border border-white/10",
    secondary: "bg-white/5 hover:bg-white/10 text-white border border-white/10",
    ghost: "bg-transparent hover:bg-white/5 text-white/70 hover:text-white",
    danger: "bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
    >
      {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
      {children}
    </button>
  );
};

export const Badge = ({ children, className, variant = 'default', style }: { children: React.ReactNode; className?: string; variant?: 'default' | 'success' | 'warning' | 'error'; style?: React.CSSProperties }) => {
  const variants = {
    default: "bg-white/10 text-white/70",
    success: "bg-green-500/10 text-green-500",
    warning: "bg-yellow-500/10 text-yellow-500",
    error: "bg-red-500/10 text-red-500"
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider", variants[variant], className)} style={style}>
      {children}
    </span>
  );
};
