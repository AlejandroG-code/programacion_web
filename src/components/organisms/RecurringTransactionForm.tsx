'use client';

import React, { useState } from 'react';
import { Button } from '../atoms/Button';
import { InputCurrency } from '../atoms/InputCurrency';
import { SelectCategory, CategoryOption } from '../atoms/SelectCategory';
import { FormField } from '../molecules/FormField';
import { Icon } from '../atoms/Icon';

interface AccountOption {
  id: string;
  name: string;
  currencyCode: string;
}

interface RecurringTransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accounts: AccountOption[];
  categories: CategoryOption[];
}

export const RecurringTransactionForm: React.FC<RecurringTransactionFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  accounts,
  categories,
}) => {
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [frequency, setFrequency] = useState<'MONTHLY' | 'WEEKLY' | 'BIWEEKLY' | 'DAILY' | 'YEARLY'>('MONTHLY');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const selectedAccount = accounts.find(a => a.id === accountId) || accounts[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount <= 0) {
      setError('El monto debe ser mayor a 0');
      return;
    }
    if (!accountId) {
      setError('Selecciona una cuenta.');
      return;
    }
    if (!categoryId) {
      setError('Selecciona una categoría.');
      return;
    }
    if (!description.trim()) {
      setError('La descripción es obligatoria.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          categoryId,
          amount,
          type,
          currencyCode: selectedAccount?.currencyCode || 'USD',
          frequency,
          intervalCount: 1,
          startDate,
          endDate: endDate || null,
          description,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Error al programar recurrencia.');

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al guardar la regla de recurrencia.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <Icon name="repeat" size={18} />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Programar Movimiento Recurrente</h2>
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

          {/* Tipo */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => setType('EXPENSE')}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                type === 'EXPENSE' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Gasto Fijo
            </button>
            <button
              type="button"
              onClick={() => setType('INCOME')}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                type === 'INCOME' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Ingreso Fijo (Sueldo)
            </button>
          </div>

          <FormField label="Monto Recurrente" required>
            <InputCurrency
              value={amount}
              currencyCode={selectedAccount?.currencyCode || 'USD'}
              onChange={setAmount}
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Cuenta" required>
              <select
                value={accountId}
                onChange={(e) => setAccountId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.currencyCode})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Categoría" required>
              <SelectCategory
                categories={categories}
                value={categoryId}
                onChange={setCategoryId}
                filterType={type}
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Frecuencia" required>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="DAILY">Diaria</option>
                <option value="WEEKLY">Semanal</option>
                <option value="BIWEEKLY">Quincenal (Cada 2 semanas)</option>
                <option value="MONTHLY">Mensual</option>
                <option value="YEARLY">Anual</option>
              </select>
            </FormField>

            <FormField label="Primera Ejecución" required>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </FormField>
          </div>

          <FormField label="Descripción" required>
            <input
              type="text"
              placeholder="Ej. Renta mensual, Sueldo, Netflix, Luz..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="md" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="primary" size="md" type="submit" isLoading={isLoading}>
              Programar Recurrencia
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
