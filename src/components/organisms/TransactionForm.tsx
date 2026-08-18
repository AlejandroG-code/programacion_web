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
  currentBalance: number;
}

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (alertData?: any) => void;
  accounts: AccountOption[];
  categories: CategoryOption[];
}

export const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  accounts,
  categories,
}) => {
  const [type, setType] = useState<'EXPENSE' | 'INCOME' | 'TRANSFER'>('EXPENSE');
  const [accountId, setAccountId] = useState(accounts[0]?.id || '');
  const [destinationAccountId, setDestinationAccountId] = useState(accounts[1]?.id || '');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
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
      setError('Debes seleccionar una cuenta');
      return;
    }
    if (type === 'TRANSFER' && (!destinationAccountId || destinationAccountId === accountId)) {
      setError('Debes seleccionar una cuenta de destino diferente');
      return;
    }
    if (type !== 'TRANSFER' && !categoryId) {
      setError('Debes seleccionar una categoría');
      return;
    }
    if (!description.trim()) {
      setError('La descripción es obligatoria');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId,
          destinationAccountId: type === 'TRANSFER' ? destinationAccountId : undefined,
          categoryId: type !== 'TRANSFER' ? categoryId : undefined,
          amount,
          type,
          currencyCode: selectedAccount?.currencyCode || 'USD',
          date,
          description,
          notes: notes || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Error al registrar el movimiento.');
      }

      onSuccess(json.data?.budgetAlert);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al procesar la transacción.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <Icon name="plus" size={18} />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Registrar Movimiento</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Icon name="x" size={20} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs font-semibold text-rose-600 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl">
              {error}
            </div>
          )}

          {/* Selector de Tipo (Gasto / Ingreso / Transferencia) */}
          <div className="grid grid-cols-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl gap-1">
            <button
              type="button"
              onClick={() => { setType('EXPENSE'); setCategoryId(''); }}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                type === 'EXPENSE'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Gasto
            </button>
            <button
              type="button"
              onClick={() => { setType('INCOME'); setCategoryId(''); }}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                type === 'INCOME'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Ingreso
            </button>
            <button
              type="button"
              onClick={() => setType('TRANSFER')}
              className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                type === 'TRANSFER'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Transferencia
            </button>
          </div>

          {/* Monto */}
          <FormField label="Monto" required>
            <InputCurrency
              value={amount}
              currencyCode={selectedAccount?.currencyCode || 'USD'}
              onChange={setAmount}
              autoFocus
            />
          </FormField>

          {/* Cuentas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label={type === 'TRANSFER' ? 'Cuenta Origen' : 'Cuenta'} required>
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

            {type === 'TRANSFER' ? (
              <FormField label="Cuenta Destino" required>
                <select
                  value={destinationAccountId}
                  onChange={(e) => setDestinationAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Selecciona destino...</option>
                  {accounts.filter(a => a.id !== accountId).map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.currencyCode})
                    </option>
                  ))}
                </select>
              </FormField>
            ) : (
              <FormField label="Categoría" required>
                <SelectCategory
                  categories={categories}
                  value={categoryId}
                  onChange={setCategoryId}
                  filterType={type as any}
                />
              </FormField>
            )}
          </div>

          {/* Fecha y Descripción */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Fecha" required>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </FormField>

            <FormField label="Descripción" required>
              <input
                type="text"
                placeholder="Ej. Supermercado semanal, Nómina..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </FormField>
          </div>

          {/* Notas */}
          <FormField label="Notas (Opcional)">
            <input
              type="text"
              placeholder="Detalles adicionales..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-xs outline-none"
            />
          </FormField>

          {/* Acciones */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="md" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant={type === 'EXPENSE' ? 'danger' : type === 'INCOME' ? 'success' : 'primary'}
              size="md"
              type="submit"
              isLoading={isLoading}
            >
              Guardar Movimiento
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
