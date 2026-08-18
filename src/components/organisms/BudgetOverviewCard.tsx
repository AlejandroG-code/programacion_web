'use client';

import React from 'react';
import { Icon } from '../atoms/Icon';
import { BudgetProgressBar } from '../molecules/BudgetProgressBar';

export interface BudgetItem {
  id: string;
  categoryId: string;
  category?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  };
  monthlyLimit: number;
  totalSpent: number;
  remainingAmount: number;
  executionPercentage: number;
  alertLevel: 'OK' | 'WARNING_80' | 'EXCEEDED_100';
  currencyCode: string;
}

interface BudgetOverviewCardProps {
  budget: BudgetItem;
  onEdit?: (budget: BudgetItem) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export const BudgetOverviewCard: React.FC<BudgetOverviewCardProps> = ({
  budget,
  onEdit,
  onDelete,
  className = '',
}) => {
  const catColor = budget.category?.color || '#3B82F6';
  const catIcon = budget.category?.icon || 'tag';
  const catName = budget.category?.name || 'Categoría';

  return (
    <div className={`p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all ${className}`}>
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: catColor }}
            >
              <Icon name={catIcon} size={20} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {catName}
              </h3>
              <p className="text-xs text-slate-500">Presupuesto Mensual</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(budget)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors cursor-pointer"
                title="Editar límite"
              >
                <Icon name="pencil" size={14} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => {
                  if (confirm(`¿Eliminar presupuesto para ${catName}?`)) {
                    onDelete(budget.id);
                  }
                }}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors cursor-pointer"
                title="Eliminar presupuesto"
              >
                <Icon name="trash-2" size={14} />
              </button>
            )}
          </div>
        </div>

        <BudgetProgressBar
          monthlyLimit={budget.monthlyLimit}
          totalSpent={budget.totalSpent}
          executionPercentage={budget.executionPercentage}
          currencyCode={budget.currencyCode}
        />
      </div>
    </div>
  );
};
