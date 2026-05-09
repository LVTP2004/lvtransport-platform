import type { InputHTMLAttributes } from 'react';

export function Input({ className = '', ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`h-11 w-full rounded-xl border border-lv-slate bg-lv-graphite px-3 text-sm text-white placeholder:text-lv-mist/70 outline-none ring-lv-gold transition focus:ring-2 ${className}`}
      {...props}
    />
  );
}
