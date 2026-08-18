'use client';

import React from 'react';
import { CurrencySymbol } from './CurrencySymbol';

interface InputCurrencyProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number | string;
  currencyCode?: string;
  onChange: (val: number) => void;
  className?: string;
}

export const InputCurrency: React.FC<InputCurrencyProps> = ({
  value,
  currencyCode = 'USD',
  onChange,
  className = '',
  placeholder = '0.00',
  disabled,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(rawVal);
    onChange(isNaN(parsed) ? 0 : parsed);
  };

  return (
    <div className="relative flex items-center w-full">
      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-slate-400">
        <CurrencySymbol currencyCode={currencyCode} className="text-base" />
      </div>
      <input
        type="number"
        step="0.01"
        min="0"
        value={value === 0 || value === '' ? '' : value}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full pl-8 pr-14 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none disabled:opacity-50 ${className}`}
        {...props}
      />
      <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-semibold text-slate-400">
        {currencyCode}
      </div>
    </div>
  );
};
