'use client';

import React from 'react';
import { Icon } from '../atoms/Icon';
import { CurrencySymbol } from '../atoms/CurrencySymbol';

interface AccountCardProps {
  id: string;
  name: string;
  type: string;
  currencyCode: string;
  currentBalance: number;
  balanceInBaseCurrency?: number;
  baseCurrencyCode?: string;
  color?: string;
  icon?: string;
  isIncludedInNetWorth?: boolean;
  onSelect?: () => void;
  className?: string;
}

export const AccountCard: React.FC<AccountCardProps> = ({
  name,
  type,
  currencyCode,
  currentBalance,
  balanceInBaseCurrency,
  baseCurrencyCode = 'USD',
  color = '#3B82F6',
  icon = 'wallet',
  onSelect,
  className = '',
}) => {
  const typeLabels: Record<string, string> = {
    CASH: 'Efectivo',
    DEBIT: 'Débito / Nómina',
    CREDIT: 'Tarjeta Crédito',
    SAVINGS: 'Ahorro',
    INVESTMENT: 'Inversión',
  };

  const isCredit = type === 'CREDIT';
  const showConverted = currencyCode !== baseCurrencyCode && balanceInBaseCurrency !== undefined;

  return (
    <div
      onClick={onSelect}
      className={`group relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300 ${onSelect ? 'cursor-pointer hover:border-blue-500' : ''} ${className}`}
    >
      <div
        className="absolute top-0 left-0 right-0 h-1.5"
        style={{ backgroundColor: color }}
      />

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
            style={{ backgroundColor: color }}
          >
            <Icon name={icon} size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
              {name}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              {typeLabels[type] || type}
            </span>
          </div>
        </div>

        <span className="text-xs font-mono font-bold px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg">
          {currencyCode}
        </span>
      </div>

      <div className="mt-2">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          {isCredit ? 'Saldo Actual' : 'Saldo Disponible'}
        </div>
        <div className="flex items-baseline gap-1">
          <CurrencySymbol currencyCode={currencyCode} className="text-xl text-slate-500" />
          <span className={`text-2xl font-extrabold font-mono tracking-tight ${currentBalance < 0 ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
            {currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {showConverted && (
          <div className="mt-1.5 text-xs text-slate-500 flex items-center gap-1 font-mono">
            <span>≈</span>
            <span>${balanceInBaseCurrency?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {baseCurrencyCode}</span>
          </div>
        )}
      </div>
    </div>
  );
};
