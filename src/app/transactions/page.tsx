'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '../../components/templates/MainLayout';
import { TransactionsTable } from '../../components/organisms/TransactionsTable';
import { TransactionForm } from '../../components/organisms/TransactionForm';
import { Button } from '../../components/atoms/Button';
import { Icon } from '../../components/atoms/Icon';

export default function TransactionsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [baseCurrencyCode, setBaseCurrencyCode] = useState('USD');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filtros
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const loadData = useCallback(async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      if (authRes.status === 401) {
        router.push('/login');
        return;
      }

      let url = '/api/transactions?limit=100';
      if (selectedAccountId) url += `&accountId=${selectedAccountId}`;
      if (selectedCategoryId) url += `&categoryId=${selectedCategoryId}`;
      if (selectedType) url += `&type=${selectedType}`;

      const [txRes, accRes, catRes] = await Promise.all([
        fetch(url),
        fetch('/api/accounts'),
        fetch('/api/categories'),
      ]);

      const [txJson, accJson, catJson] = await Promise.all([
        txRes.json(),
        accRes.json(),
        catRes.json(),
      ]);

      setTransactions(txJson.data?.transactions || []);
      setSummary(txJson.data?.summary || {});
      setBaseCurrencyCode(txJson.data?.summary?.baseCurrencyCode || 'USD');
      setAccounts(accJson.data?.accounts || []);
      setCategories(catJson.data?.categories || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [router, selectedAccountId, selectedCategoryId, selectedType]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Transacciones & Movimientos
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Registro contable completo de ingresos, gastos y transferencias
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Icon name="plus" size={16} />}
          onClick={() => setIsModalOpen(true)}
        >
          Nuevo Movimiento
        </Button>
      </div>

      {/* Barra de Resumen Financiero del Filtro */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              Ingresos Filtrados
            </span>
            <div className="text-xl font-extrabold font-mono text-emerald-600 mt-0.5">
              +${(summary.totalIncome || 0).toLocaleString()} {baseCurrencyCode}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 flex items-center justify-center">
            <Icon name="trending-up" size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
              Gastos Filtrados
            </span>
            <div className="text-xl font-extrabold font-mono text-rose-600 mt-0.5">
              -${(summary.totalExpense || 0).toLocaleString()} {baseCurrencyCode}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-600 flex items-center justify-center">
            <Icon name="trending-down" size={18} />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
              Balance Neto
            </span>
            <div className={`text-xl font-extrabold font-mono mt-0.5 ${(summary.netBalance || 0) >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
              ${(summary.netBalance || 0).toLocaleString()} {baseCurrencyCode}
            </div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 flex items-center justify-center">
            <Icon name="wallet" size={18} />
          </div>
        </div>
      </div>

      {/* Selectores de Filtro Avanzados */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-3 items-center">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filtrar por:</span>

        <select
          value={selectedAccountId}
          onChange={(e) => setSelectedAccountId(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 outline-none"
        >
          <option value="">Todas las cuentas</option>
          {accounts.map(a => (
            <option key={a.id} value={a.id}>{a.name} ({a.currencyCode})</option>
          ))}
        </select>

        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 outline-none"
        >
          <option value="">Todas las categorías</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 outline-none"
        >
          <option value="">Todos los tipos</option>
          <option value="EXPENSE">Gastos</option>
          <option value="INCOME">Ingresos</option>
          <option value="TRANSFER">Transferencias</option>
        </select>

        {(selectedAccountId || selectedCategoryId || selectedType) && (
          <button
            onClick={() => {
              setSelectedAccountId('');
              setSelectedCategoryId('');
              setSelectedType('');
            }}
            className="text-xs text-rose-600 font-bold hover:underline ml-auto cursor-pointer"
          >
            Limpiar Filtros
          </button>
        )}
      </div>

      {/* Tabla Principal */}
      <TransactionsTable
        transactions={transactions}
        baseCurrencyCode={baseCurrencyCode}
        onDeleteTransaction={handleDelete}
        isLoading={isLoading}
      />

      {/* Modal de Transacción */}
      <TransactionForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => loadData()}
        accounts={accounts}
        categories={categories}
      />
    </MainLayout>
  );
}
