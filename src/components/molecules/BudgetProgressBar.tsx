import React from 'react';
import { ProgressBar } from '../atoms/ProgressBar';
import { BadgeStatus } from '../atoms/BadgeStatus';

interface BudgetProgressBarProps {
  monthlyLimit: number;
  totalSpent: number;
  executionPercentage: number;
  currencyCode?: string;
  className?: string;
}

export const BudgetProgressBar: React.FC<BudgetProgressBarProps> = ({
  monthlyLimit,
  totalSpent,
  executionPercentage,
  currencyCode = 'USD',
  className = '',
}) => {
  let colorClass = 'bg-emerald-500';
  let alertStatus: 'OK' | 'WARNING_80' | 'EXCEEDED_100' = 'OK';

  if (executionPercentage >= 100) {
    colorClass = 'bg-rose-600';
    alertStatus = 'EXCEEDED_100';
  } else if (executionPercentage >= 80) {
    colorClass = 'bg-amber-500';
    alertStatus = 'WARNING_80';
  }

  const remaining = Math.max(0, monthlyLimit - totalSpent);

  return (
    <div className={`flex flex-col gap-2 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Ejecución:</span>
          <span className={`text-sm font-bold ${executionPercentage >= 100 ? 'text-rose-600' : executionPercentage >= 80 ? 'text-amber-600' : 'text-slate-800 dark:text-slate-200'}`}>
            {executionPercentage.toFixed(1)}%
          </span>
        </div>
        <BadgeStatus status={alertStatus} />
      </div>

      <ProgressBar
        progress={executionPercentage}
        colorClass={colorClass}
        height="md"
      />

      <div className="flex justify-between items-center text-xs font-medium text-slate-600 dark:text-slate-400 pt-0.5">
        <div>
          <span>Gastado: </span>
          <strong className="text-slate-900 dark:text-white font-mono">${totalSpent.toLocaleString()} {currencyCode}</strong>
        </div>
        <div>
          <span>Límite: </span>
          <strong className="text-slate-900 dark:text-white font-mono">${monthlyLimit.toLocaleString()} {currencyCode}</strong>
        </div>
      </div>
      {executionPercentage >= 100 ? (
        <div className="text-xs text-rose-600 font-semibold bg-rose-50 dark:bg-rose-950/40 p-1.5 rounded-lg text-center mt-1">
          ¡Has sobrepasado tu límite por ${(totalSpent - monthlyLimit).toLocaleString()} {currencyCode}!
        </div>
      ) : (
        <div className="text-[11px] text-slate-500 text-right">
          Disponible: <span className="font-semibold text-emerald-600">${remaining.toLocaleString()} {currencyCode}</span>
        </div>
      )}
    </div>
  );
};
