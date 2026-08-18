'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Icon } from '../atoms/Icon';

interface CategoryExpense {
  id: string;
  name: string;
  total: number;
  percentage: number;
  color?: string;
  icon?: string;
}

interface ExpenseDistributionChartProps {
  data: CategoryExpense[];
  baseCurrencyCode?: string;
  className?: string;
}

export const ExpenseDistributionChart: React.FC<ExpenseDistributionChartProps> = ({
  data,
  baseCurrencyCode = 'USD',
  className = '',
}) => {
  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#6366F1', '#D946EF', '#14B8A6'];

  if (!data || data.length === 0) {
    return (
      <div className={`p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-slate-400 ${className}`}>
        <Icon name="pie-chart" size={36} className="text-slate-300 dark:text-slate-700 mb-2" />
        <p className="text-xs font-semibold">Sin gastos registrados en este periodo</p>
      </div>
    );
  }

  const chartData = data.map((item, index) => ({
    name: item.name,
    value: item.total,
    percentage: item.percentage,
    color: item.color || COLORS[index % COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs font-medium border border-slate-800">
          <p className="font-bold">{d.name}</p>
          <p className="text-blue-400 font-mono mt-1">
            ${d.value.toLocaleString()} {baseCurrencyCode}
          </p>
          <p className="text-slate-400 text-[10px]">{d.percentage}% del total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Distribución de Gastos</h3>
          <p className="text-xs text-slate-500">Porcentaje por categoría</p>
        </div>
        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
          <Icon name="pie-chart" size={18} />
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => <span className="text-xs text-slate-600 dark:text-slate-400">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
