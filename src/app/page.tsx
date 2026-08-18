'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '../components/templates/MainLayout';
import { StatCard } from '../components/molecules/StatCard';
import { AccountCard } from '../components/molecules/AccountCard';
import { TransactionsTable } from '../components/organisms/TransactionsTable';
import { BudgetOverviewCard } from '../components/organisms/BudgetOverviewCard';
import { ExpenseDistributionChart } from '../components/organisms/ExpenseDistributionChart';
import { CashFlowChart } from '../components/organisms/CashFlowChart';
import { Button } from '../components/atoms/Button';
import { Icon } from '../components/atoms/Icon';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>({
    accounts: [],
    transactions: [],
    budgets: [],
    reports: null,
    totalNetWorth: 0,
    baseCurrencyCode: 'USD',
  });

  const loadDashboardData = useCallback(async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      if (authRes.status === 401) {
        router.push('/login');
        return;
      }

      const [accountsRes, txRes, budgetsRes, reportsRes] = await Promise.all([
        fetch('/api/accounts'),
        fetch('/api/transactions?limit=10'),
        fetch('/api/budgets'),
        fetch('/api/reports'),
      ]);

      const [accData, txData, budData, repData] = await Promise.all([
        accountsRes.json(),
        txRes.json(),
        budgetsRes.json(),
        reportsRes.json(),
      ]);

      setData({
        accounts: accData.data?.accounts || [],
        totalNetWorth: accData.data?.totalNetWorth || 0,
        baseCurrencyCode: accData.data?.baseCurrencyCode || 'USD',
        transactions: txData.data?.transactions || [],
        txSummary: txData.data?.summary || {},
        budgets: budData.data?.budgets || [],
        budgetSummary: budData.data?.summary || {},
        reports: repData.data || null,
      });
    } catch (e) {
      console.error('Error cargando dashboard:', e);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadDashboardData();

    const handleUpdate = () => loadDashboardData();
    window.addEventListener('transaction-updated', handleUpdate);
    return () => window.removeEventListener('transaction-updated', handleUpdate);
  }, [loadDashboardData]);

  const handleDeleteTransaction = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: 'DELETE' });
      if (res.ok) {
        loadDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-400">Cargando tu panel financiero...</p>
        </div>
      </div>
    );
  }

  const {
    accounts,
    totalNetWorth,
    baseCurrencyCode,
    transactions,
    budgets,
    budgetSummary,
    reports,
  } = data;

  return (
    <MainLayout>
      {/* 1. Header & Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Panel Financiero
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Resumen consolidado en tiempo real en <span className="font-bold text-blue-600">{baseCurrencyCode}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/transactions">
            <Button variant="outline" size="sm" leftIcon={<Icon name="arrow-left-right" size={16} />}>
              Ver Historial
            </Button>
          </Link>
          <Link href="/budgets">
            <Button variant="outline" size="sm" leftIcon={<Icon name="pie-chart" size={16} />}>
              Presupuestos
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Tarjetas de Métricas Principales (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Patrimonio Neto"
          value={`$${totalNetWorth.toLocaleString()} ${baseCurrencyCode}`}
          subtitle="Saldo total en todas tus cuentas"
          icon="wallet-cards"
          iconBgColor="bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
          textColor="text-blue-600 dark:text-blue-400"
        />

        <StatCard
          title="Ingresos Anuales"
          value={`+$${(reports?.summary?.totalIncome || 0).toLocaleString()} ${baseCurrencyCode}`}
          subtitle="Total acumulado en el año"
          icon="trending-up"
          iconBgColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
          textColor="text-emerald-600 dark:text-emerald-400"
        />

        <StatCard
          title="Gastos Anuales"
          value={`-$${(reports?.summary?.totalExpense || 0).toLocaleString()} ${baseCurrencyCode}`}
          subtitle="Total acumulado en el año"
          icon="trending-down"
          iconBgColor="bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
          textColor="text-rose-600 dark:text-rose-400"
        />

        <StatCard
          title="Tasa de Ahorro"
          value={`${reports?.summary?.savingsRate || 0}%`}
          subtitle={`Flujo neto: $${(reports?.summary?.netSavings || 0).toLocaleString()} ${baseCurrencyCode}`}
          icon="piggy-bank"
          iconBgColor="bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400"
          textColor="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* 3. Cuentas Financieras */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon name="credit-card" size={18} className="text-blue-600" />
            <span>Mis Cuentas ({accounts.length})</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {accounts.map((acc: any) => (
            <AccountCard
              key={acc.id}
              id={acc.id}
              name={acc.name}
              type={acc.type}
              currencyCode={acc.currencyCode}
              currentBalance={acc.currentBalance}
              balanceInBaseCurrency={acc.balanceInBaseCurrency}
              baseCurrencyCode={baseCurrencyCode}
              color={acc.color}
              icon={acc.icon}
            />
          ))}
        </div>
      </section>

      {/* 4. Gráficos de Distribución y Flujo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CashFlowChart
            data={reports?.monthlyCashFlow || []}
            baseCurrencyCode={baseCurrencyCode}
          />
        </div>
        <div>
          <ExpenseDistributionChart
            data={reports?.expenseDistribution || []}
            baseCurrencyCode={baseCurrencyCode}
          />
        </div>
      </div>

      {/* 5. Presupuestos y Alertas */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Icon name="pie-chart" size={18} className="text-blue-600" />
              <span>Presupuestos del Mes</span>
            </h2>
            <p className="text-xs text-slate-500">
              Ejecución global: <span className="font-bold text-slate-800 dark:text-slate-200">{budgetSummary.overallPercentage || 0}%</span> de tus techos presupuestarios
            </p>
          </div>

          <Link href="/budgets">
            <Button variant="ghost" size="sm" rightIcon={<Icon name="arrow-right" size={14} />}>
              Gestionar todos
            </Button>
          </Link>
        </div>

        {budgets.length === 0 ? (
          <div className="p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
            <Icon name="pie-chart" size={36} className="mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-xs font-semibold text-slate-500">No has fijado ningún presupuesto mensual.</p>
            <Link href="/budgets">
              <Button variant="primary" size="sm">
                Configurar Presupuestos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.slice(0, 3).map((b: any) => (
              <BudgetOverviewCard key={b.id} budget={b} />
            ))}
          </div>
        )}
      </section>

      {/* 6. Últimas Transacciones */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon name="history" size={18} className="text-blue-600" />
            <span>Últimos Movimientos</span>
          </h2>
          <Link href="/transactions">
            <Button variant="ghost" size="sm" rightIcon={<Icon name="arrow-right" size={14} />}>
              Ver todas ({transactions.length})
            </Button>
          </Link>
        </div>

        <TransactionsTable
          transactions={transactions}
          baseCurrencyCode={baseCurrencyCode}
          onDeleteTransaction={handleDeleteTransaction}
        />
      </section>
    </MainLayout>
  );
}
