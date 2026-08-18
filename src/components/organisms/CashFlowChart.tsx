'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Icon } from '../atoms/Icon';

interface MonthlyData {
  monthName: string;
  income: number;
  expense: number;
  savings: number;
}

interface CashFlowChartProps {
  data: MonthlyData[];
  baseCurrencyCode?: string;
  className?: string;
}

export const CashFlowChart: React.FC<CashFlowChartProps> = ({
  data,
  baseCurrencyCode = 'USD',
  className = '',
}) => {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs border border-slate-800 space-y-1">
          <p className="font-bold text-slate-300 mb-1">{label}</p>
          <p className="text-emerald-400 font-mono">
            Ingresos: +${payload[0]?.value?.toLocaleString()} {baseCurrencyCode}
          </p>
          <p className="text-rose-400 font-mono">
            Gastos: -${payload[1]?.value?.toLocaleString()} {baseCurrencyCode}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Flujo de Caja Anual</h3>
          <p className="text-xs text-slate-500">Ingresos vs Gastos por mes</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
          <Icon name="bar-chart-3" size={18} />
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
            <XAxis
              dataKey="monthName"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              align="right"
              height={36}
              formatter={(val) => (
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {val === 'income' ? 'Ingresos' : 'Gastos'}
                </span>
              )}
            />
            <Bar dataKey="income" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={28} />
            <Bar dataKey="expense" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
