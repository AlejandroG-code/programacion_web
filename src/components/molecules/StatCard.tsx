import React from 'react';
import { Icon } from '../atoms/Icon';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: string;
  iconBgColor?: string;
  textColor?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconBgColor = 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400',
  textColor = 'text-slate-900 dark:text-white',
  trend,
  className = '',
}) => {
  return (
    <div className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBgColor}`}>
          <Icon name={icon} size={18} />
        </div>
      </div>

      <div>
        <div className={`text-2xl font-black font-mono tracking-tight ${textColor}`}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
            {subtitle}
          </p>
        )}
        {trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
                trend.isPositive
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
              }`}
            >
              <Icon name={trend.isPositive ? 'trending-up' : 'trending-down'} size={12} className="mr-1" />
              {trend.value}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
