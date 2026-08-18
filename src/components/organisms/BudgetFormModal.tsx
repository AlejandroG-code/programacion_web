'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../atoms/Button';
import { InputCurrency } from '../atoms/InputCurrency';
import { SelectCategory, CategoryOption } from '../atoms/SelectCategory';
import { FormField } from '../molecules/FormField';
import { Icon } from '../atoms/Icon';

interface BudgetFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  categories: CategoryOption[];
  baseCurrencyCode?: string;
  initialData?: {
    id?: string;
    categoryId: string;
    monthlyLimit: number;
  } | null;
  currentMonth: number;
  currentYear: number;
}

export const BudgetFormModal: React.FC<BudgetFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  categories,
  baseCurrencyCode = 'USD',
  initialData,
  currentMonth,
  currentYear,
}) => {
  const [categoryId, setCategoryId] = useState('');
  const [monthlyLimit, setMonthlyLimit] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setCategoryId(initialData.categoryId);
      setMonthlyLimit(initialData.monthlyLimit);
    } else {
      setCategoryId('');
      setMonthlyLimit(0);
    }
    setError(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!categoryId) {
      setError('Debes seleccionar una categoría.');
      return;
    }
    if (monthlyLimit <= 0) {
      setError('El límite mensual debe ser mayor a 0.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          categoryId,
          monthlyLimit,
          periodMonth: currentMonth,
          periodYear: currentYear,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Error al guardar el presupuesto.');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar presupuesto.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <Icon name="pie-chart" size={18} />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {initialData ? 'Editar Presupuesto' : 'Fijar Nuevo Presupuesto'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <Icon name="x" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 rounded-xl">
              {error}
            </div>
          )}

          <FormField label="Categoría de Gasto" required>
            <SelectCategory
              categories={categories}
              value={categoryId}
              onChange={setCategoryId}
              filterType="EXPENSE"
              disabled={!!initialData}
            />
          </FormField>

          <FormField label="Límite Máximo Mensual" required helperText={`Evaluado en tu divisa base (${baseCurrencyCode})`}>
            <InputCurrency
              value={monthlyLimit}
              currencyCode={baseCurrencyCode}
              onChange={setMonthlyLimit}
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="md" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={isLoading}>
              Guardar Presupuesto
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
