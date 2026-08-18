import React from 'react';
import { clsx } from 'clsx';

export type StatusType = 'COMPLETED' | 'PENDING' | 'RECONCILED' | 'OK' | 'WARNING_80' | 'EXCEEDED_100';

interface BadgeStatusProps {
  status: StatusType | string;
  label?: string;
  className?: string;
}

export const BadgeStatus: React.FC<BadgeStatusProps> = ({ status, label, className = '' }) => {
  const config: Record<string, { bg: string; text: string; defaultLabel: string; dot: string }> = {
    COMPLETED: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      text: 'text-emerald-700 dark:text-emerald-300',
      defaultLabel: 'Completado',
      dot: 'bg-emerald-500',
    },
    PENDING: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      defaultLabel: 'Pendiente',
      dot: 'bg-amber-500',
    },
    RECONCILED: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800',
      text: 'text-blue-700 dark:text-blue-300',
      defaultLabel: 'Conciliado',
      dot: 'bg-blue-500',
    },
    OK: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
      text: 'text-emerald-700',
      defaultLabel: 'Normal (<80%)',
      dot: 'bg-emerald-500',
    },
    WARNING_80: {
      bg: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700',
      text: 'text-amber-800',
      defaultLabel: 'Alerta (≥80%)',
      dot: 'bg-amber-500 animate-pulse',
    },
    EXCEEDED_100: {
      bg: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700',
      text: 'text-rose-700',
      defaultLabel: 'Superado (≥100%)',
      dot: 'bg-rose-600 animate-ping',
    },
  };

  const item = config[status] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    text: 'text-slate-700',
    defaultLabel: status,
    dot: 'bg-slate-400',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        item.bg,
        className
      )}
    >
      <span className={clsx('w-1.5 h-1.5 rounded-full', item.dot)} />
      <span>{label || item.defaultLabel}</span>
    </span>
  );
};
