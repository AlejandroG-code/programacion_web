'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '../../components/templates/MainLayout';
import { BudgetOverviewCard, BudgetItem } from '../../components/organisms/BudgetOverviewCard';
import { BudgetFormModal } from '../../components/organisms/BudgetFormModal';
import { StatCard } from '../../components/molecules/StatCard';
import { Button } from '../../components/atoms/Button';
import { Icon } from '../../components/atoms/Icon';

export default function BudgetsPage() {
  const router = useRouter();
  const now = new Date();
  const [month, setMonth] = useState<number>(now.getUTCMonth() + 1);
  const [year, setYear] = useState<number>(now.getUTCFullYear());
  const [budgets, setBudgets] = useState<BudgetItem[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [categories, setCategories] = useState<any[]>([]);
  const [baseCurrencyCode, setBaseCurrencyCode] = useState('USD');
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);

  const loadBudgets = useCallback(async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      if (authRes.status === 401) {
        router.push('/login');
        return;
      }

      const [bRes, cRes] = await Promise.all([
        fetch(`/api/budgets?month=${month}&year=${year}`),
        fetch('/api/categories'),
      ]);

      const [bJson, cJson] = await Promise.all([bRes.json(), cRes.json()]);

      setBudgets(bJson.data?.budgets || []);
      setSummary(bJson.data?.summary || {});
      setBaseCurrencyCode(bJson.data?.baseCurrencyCode || 'USD');
      setCategories(cJson.data?.categories || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [router, month, year]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const handleDeleteBudget = async (id: string) => {
    try {
      const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadBudgets();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Presupuestos & Techos Mensuales
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Control de gastos por categoría con disparadores de alerta al <strong className="text-amber-600">80%</strong> y <strong className="text-rose-600">100%</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Selector de Mes y Año */}
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl shadow-sm">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 px-2 py-1.5 outline-none cursor-pointer"
            >
              {months.map((m, i) => (
                <option key={m} value={i + 1} className="dark:bg-slate-900">{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 px-2 py-1.5 outline-none cursor-pointer"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y} className="dark:bg-slate-900">{y}</option>
              ))}
            </select>
          </div>

          <Button
            variant="primary"
            size="md"
            leftIcon={<Icon name="plus" size={16} />}
            onClick={() => {
              setEditingBudget(null);
              setIsModalOpen(true);
            }}
          >
            Fijar Presupuesto
          </Button>
        </div>
      </div>

      {/* Tarjetas de Resumen Global de Presupuesto */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Presupuestado"
          value={`$${(summary.totalBudgeted || 0).toLocaleString()} ${baseCurrencyCode}`}
          subtitle={`${months[month - 1]} ${year}`}
          icon="pie-chart"
          iconBgColor="bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
          textColor="text-blue-600 dark:text-blue-400"
        />

        <StatCard
          title="Total Gastado"
          value={`$${(summary.totalSpent || 0).toLocaleString()} ${baseCurrencyCode}`}
          subtitle="En categorías presupuestadas"
          icon="shopping-bag"
          iconBgColor="bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400"
          textColor="text-amber-600 dark:text-amber-400"
        />

        <StatCard
          title="Monto Restante"
          value={`$${(summary.totalRemaining || 0).toLocaleString()} ${baseCurrencyCode}`}
          subtitle="Disponible para gastar"
          icon="shield-check"
          iconBgColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
          textColor="text-emerald-600 dark:text-emerald-400"
        />

        <StatCard
          title="Ejecución Global"
          value={`${summary.overallPercentage || 0}%`}
          subtitle="Porcentaje de consumo"
          icon="activity"
          iconBgColor="bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400"
          textColor={summary.overallPercentage >= 100 ? 'text-rose-600' : summary.overallPercentage >= 80 ? 'text-amber-600' : 'text-purple-600'}
        />
      </div>

      {/* Cuadrícula de Presupuestos por Categoría */}
      <section className="space-y-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Icon name="layers" size={18} className="text-blue-600" />
          <span>Categorías Presupuestadas ({budgets.length})</span>
        </h2>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            Cargando presupuestos...
          </div>
        ) : budgets.length === 0 ? (
          <div className="p-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center mx-auto">
              <Icon name="pie-chart" size={28} />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Sin presupuestos asignados</h3>
              <p className="text-xs text-slate-500 mt-1">
                Fija límites mensuales por categoría para recibir alertas cuando alcances el 80% o 100% de tu gasto previsto.
              </p>
            </div>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Icon name="plus" size={16} />}
              onClick={() => {
                setEditingBudget(null);
                setIsModalOpen(true);
              }}
            >
              Crear mi primer presupuesto
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {budgets.map((b) => (
              <BudgetOverviewCard
                key={b.id}
                budget={b}
                onEdit={(item) => {
                  setEditingBudget({
                    id: item.id,
                    categoryId: item.categoryId,
                    monthlyLimit: item.monthlyLimit,
                  });
                  setIsModalOpen(true);
                }}
                onDelete={handleDeleteBudget}
              />
            ))}
          </div>
        )}
      </section>

      {/* Modal de Presupuesto */}
      <BudgetFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBudget(null);
        }}
        onSuccess={() => loadBudgets()}
        categories={categories}
        baseCurrencyCode={baseCurrencyCode}
        initialData={editingBudget}
        currentMonth={month}
        currentYear={year}
      />
    </MainLayout>
  );
}
