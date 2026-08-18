'use client';

import React from 'react';
import { Icon } from './Icon';

export interface CategoryOption {
  id: string;
  name: string;
  type: string;
  icon?: string;
  color?: string;
}

interface SelectCategoryProps {
  categories: CategoryOption[];
  value: string;
  onChange: (val: string) => void;
  filterType?: 'INCOME' | 'EXPENSE' | null;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const SelectCategory: React.FC<SelectCategoryProps> = ({
  categories,
  value,
  onChange,
  filterType = null,
  placeholder = 'Seleccionar categoría...',
  className = '',
  disabled = false,
}) => {
  const filtered = filterType ? categories.filter(c => c.type === filterType) : categories;

  return (
    <div className={`relative w-full ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full pl-3.5 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none appearance-none disabled:opacity-50 cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {filtered.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name} ({cat.type === 'INCOME' ? 'Ingreso' : 'Gasto'})
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
        <Icon name="chevron-down" size={16} />
      </div>
    </div>
  );
};
