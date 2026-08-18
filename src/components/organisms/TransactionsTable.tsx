'use client';

import React, { useState } from 'react';
import { Icon } from '../atoms/Icon';
import { CurrencySymbol } from '../atoms/CurrencySymbol';
import { BadgeStatus } from '../atoms/BadgeStatus';

export interface TransactionItem {
  id: string;
  date: string;
  description: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  amount: number;
  currencyCode: string;
  amountInBaseCurrency: number;
  status: string;
  account?: {
    id: string;
    name: string;
    currencyCode: string;
    color?: string;
  };
  category?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
  };
}

interface TransactionsTableProps {
  transactions: TransactionItem[];
  baseCurrencyCode?: string;
  onDeleteTransaction?: (id: string) => void;
  isLoading?: boolean;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  baseCurrencyCode = 'USD',
  onDeleteTransaction,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filtered = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.category?.name && t.category.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.account?.name && t.account.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'ALL' || t.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Controles de Filtros */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <Icon name="search" size={16} className="absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por descripción, categoría..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Filtro por Tipo */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto overflow-x-auto">
          {['ALL', 'EXPENSE', 'INCOME', 'TRANSFER'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filterType === t
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {t === 'ALL' ? 'Todos' : t === 'EXPENSE' ? 'Gastos' : t === 'INCOME' ? 'Ingresos' : 'Transferencias'}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="py-3 px-5">Fecha</th>
              <th className="py-3 px-5">Descripción</th>
              <th className="py-3 px-5">Cuenta</th>
              <th className="py-3 px-5">Categoría</th>
              <th className="py-3 px-5 text-right">Monto Original</th>
              <th className="py-3 px-5 text-right">Equivalente Base</th>
              <th className="py-3 px-5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  Cargando movimientos...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <Icon name="receipt" size={32} className="text-slate-300 dark:text-slate-700" />
                    <span>No se encontraron transacciones registradas</span>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((tx) => {
                const isIncome = tx.type === 'INCOME';
                const isExpense = tx.type === 'EXPENSE';
                const isTransfer = tx.type === 'TRANSFER';

                return (
                  <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors">
                    {/* Fecha */}
                    <td className="py-3.5 px-5 font-mono text-slate-500 whitespace-nowrap">
                      {tx.date}
                    </td>

                    {/* Descripción */}
                    <td className="py-3.5 px-5 text-slate-900 dark:text-white font-semibold">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center text-white text-xs ${
                            isIncome ? 'bg-emerald-500' : isExpense ? 'bg-rose-500' : 'bg-blue-500'
                          }`}
                        >
                          <Icon name={isIncome ? 'arrow-down-left' : isExpense ? 'arrow-up-right' : 'arrow-left-right'} size={12} />
                        </div>
                        <span className="truncate max-w-xs">{tx.description}</span>
                      </div>
                    </td>

                    {/* Cuenta */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                        {tx.account?.color && (
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: tx.account.color }} />
                        )}
                        {tx.account?.name || 'Cuenta'}
                      </span>
                    </td>

                    {/* Categoría */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      {tx.category ? (
                        <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          {tx.category.icon && <Icon name={tx.category.icon} size={14} />}
                          <span>{tx.category.name}</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Transferencia</span>
                      )}
                    </td>

                    {/* Monto Original */}
                    <td className="py-3.5 px-5 text-right font-mono font-bold whitespace-nowrap">
                      <span className={isIncome ? 'text-emerald-600' : isExpense ? 'text-rose-600' : 'text-blue-600'}>
                        {isIncome ? '+' : isExpense ? '-' : ''}
                        {tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                        <span className="text-[10px] text-slate-400">{tx.currencyCode}</span>
                      </span>
                    </td>

                    {/* Equivalente en Divisa Base */}
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      ${tx.amountInBaseCurrency.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                      <span className="text-[10px] text-slate-400">{baseCurrencyCode}</span>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-5 text-center whitespace-nowrap">
                      {onDeleteTransaction && (
                        <button
                          onClick={() => {
                            if (confirm('¿Deseas eliminar este movimiento y restituir el saldo?')) {
                              onDeleteTransaction(tx.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                          title="Eliminar transacción"
                        >
                          <Icon name="trash-2" size={14} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
