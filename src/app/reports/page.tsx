'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '../../components/templates/MainLayout';
import { CashFlowChart } from '../../components/organisms/CashFlowChart';
import { ExpenseDistributionChart } from '../../components/organisms/ExpenseDistributionChart';
import { PdfExportModal } from '../../components/organisms/PdfExportModal';
import { StatCard } from '../../components/molecules/StatCard';
import { Button } from '../../components/atoms/Button';
import { Icon } from '../../components/atoms/Icon';

export default function ReportsPage() {
  const router = useRouter();
  const now = new Date();
  const [year, setYear] = useState<number>(now.getUTCFullYear());
  const [month, setMonth] = useState<string>('ALL');
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  const loadReport = useCallback(async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      if (authRes.status === 401) {
        router.push('/login');
        return;
      }

      const monthParam = month === 'ALL' ? '' : `&month=${month}`;
      const res = await fetch(`/api/reports?year=${year}${monthParam}`);
      const json = await res.json();
      setReportData(json.data || null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [router, year, month]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const baseCurrencyCode = reportData?.baseCurrencyCode || 'USD';
  const summary = reportData?.summary || {};

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Reportes Financieros & Analítica
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Análisis de flujo de caja, distribución de gastos y exportación en PDF profesional
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-2xl shadow-sm">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 px-2 py-1.5 outline-none cursor-pointer"
            >
              <option value="ALL" className="dark:bg-slate-900">Todo el Año</option>
              <option value="1" className="dark:bg-slate-900">Enero</option>
              <option value="2" className="dark:bg-slate-900">Febrero</option>
              <option value="3" className="dark:bg-slate-900">Marzo</option>
              <option value="4" className="dark:bg-slate-900">Abril</option>
              <option value="5" className="dark:bg-slate-900">Mayo</option>
              <option value="6" className="dark:bg-slate-900">Junio</option>
              <option value="7" className="dark:bg-slate-900">Julio</option>
              <option value="8" className="dark:bg-slate-900">Agosto</option>
              <option value="9" className="dark:bg-slate-900">Septiembre</option>
              <option value="10" className="dark:bg-slate-900">Octubre</option>
              <option value="11" className="dark:bg-slate-900">Noviembre</option>
              <option value="12" className="dark:bg-slate-900">Diciembre</option>
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
            leftIcon={<Icon name="file-down" size={16} />}
            onClick={() => setIsPdfModalOpen(true)}
          >
            Descargar PDF
          </Button>
        </div>
      </div>

      {/* Tarjetas de Resumen del Periodo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Ingresos del Periodo"
          value={`+$${(summary.totalIncome || 0).toLocaleString()} ${baseCurrencyCode}`}
          subtitle="Total ingresado"
          icon="trending-up"
          iconBgColor="bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
          textColor="text-emerald-600 dark:text-emerald-400"
        />

        <StatCard
          title="Gastos del Periodo"
          value={`-$${(summary.totalExpense || 0).toLocaleString()} ${baseCurrencyCode}`}
          subtitle="Total egresado"
          icon="trending-down"
          iconBgColor="bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
          textColor="text-rose-600 dark:text-rose-400"
        />

        <StatCard
          title="Ahorro Neto"
          value={`${(summary.netSavings || 0) >= 0 ? '+' : ''}$${(summary.netSavings || 0).toLocaleString()} ${baseCurrencyCode}`}
          subtitle="Superávit / Déficit"
          icon="wallet"
          iconBgColor="bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
          textColor={(summary.netSavings || 0) >= 0 ? 'text-blue-600' : 'text-rose-600'}
        />

        <StatCard
          title="Tasa de Ahorro"
          value={`${summary.savingsRate || 0}%`}
          subtitle="Porcentaje sobre ingresos"
          icon="pie-chart"
          iconBgColor="bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400"
          textColor="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Gráficos de Flujo y Distribución */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CashFlowChart
            data={reportData?.monthlyCashFlow || []}
            baseCurrencyCode={baseCurrencyCode}
          />
        </div>
        <div>
          <ExpenseDistributionChart
            data={reportData?.expenseDistribution || []}
            baseCurrencyCode={baseCurrencyCode}
          />
        </div>
      </div>

      {/* Tabla Desglose de Gastos por Categoría */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon name="list" size={16} className="text-blue-600" />
            <span>Desglose Cuantitativo de Gastos</span>
          </h2>
          <span className="text-xs text-slate-400">Ordenado por mayor gasto</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-400 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-5">Categoría</th>
                <th className="py-3 px-5 text-right">Total Gastado ({baseCurrencyCode})</th>
                <th className="py-3 px-5 text-right">% del Gasto Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">
                    Cargando datos analíticos...
                  </td>
                </tr>
              ) : (reportData?.expenseDistribution || []).length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-400">
                    No se registran gastos en este periodo.
                  </td>
                </tr>
              ) : (
                reportData?.expenseDistribution.map((cat: any) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3.5 px-5 flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color || '#3B82F6' }} />
                      <span className="font-bold text-slate-900 dark:text-white">{cat.name}</span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                      ${cat.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-blue-600">
                      {cat.percentage}%
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        baseCurrencyCode={baseCurrencyCode}
      />
    </MainLayout>
  );
}
