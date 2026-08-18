'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MainLayout } from '../../components/templates/MainLayout';
import { RecurringTransactionForm } from '../../components/organisms/RecurringTransactionForm';
import { Button } from '../../components/atoms/Button';
import { Icon } from '../../components/atoms/Icon';

export default function RecurringPage() {
  const router = useRouter();
  const [recurringList, setRecurringList] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const authRes = await fetch('/api/auth/me');
      if (authRes.status === 401) {
        router.push('/login');
        return;
      }

      const [recRes, accRes, catRes] = await Promise.all([
        fetch('/api/recurring'),
        fetch('/api/accounts'),
        fetch('/api/categories'),
      ]);

      const [recJson, accJson, catJson] = await Promise.all([
        recRes.json(),
        accRes.json(),
        catRes.json(),
      ]);

      setRecurringList(recJson.data?.recurringTransactions || []);
      setAccounts(accJson.data?.accounts || []);
      setCategories(catJson.data?.categories || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleProcessNow = async () => {
    setIsProcessing(true);
    setMessage(null);
    try {
      const res = await fetch('/api/recurring/process', { method: 'POST' });
      const json = await res.json();
      if (res.ok) {
        setMessage(json.message || 'Procesamiento completado con éxito.');
        loadData();
      } else {
        throw new Error(json.error || 'Error al procesar.');
      }
    } catch (e: any) {
      setMessage(`❌ ${e.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await fetch(`/api/recurring/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentStatus }),
      });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Deseas eliminar esta regla de recurrencia?')) return;
    try {
      await fetch(`/api/recurring/${id}`, { method: 'DELETE' });
      loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const freqLabels: Record<string, string> = {
    DAILY: 'Diaria',
    WEEKLY: 'Semanal',
    BIWEEKLY: 'Quincenal',
    MONTHLY: 'Mensual',
    YEARLY: 'Anual',
  };

  return (
    <MainLayout>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Transacciones Recurrentes
          </h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Motor de automatización para sueldos, rentas, suscripciones y servicios fijos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="md"
            leftIcon={<Icon name="play" size={16} />}
            onClick={handleProcessNow}
            isLoading={isProcessing}
          >
            Ejecutar Pendientes
          </Button>

          <Button
            variant="primary"
            size="md"
            leftIcon={<Icon name="plus" size={16} />}
            onClick={() => setIsModalOpen(true)}
          >
            Programar Recurrencia
          </Button>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl text-xs font-semibold text-blue-700 dark:text-blue-300 flex items-center justify-between">
          <span>{message}</span>
          <button onClick={() => setMessage(null)} className="text-slate-400 hover:text-slate-600">
            <Icon name="x" size={14} />
          </button>
        </div>
      )}

      {/* Lista de Recurrencias */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Icon name="repeat" size={16} className="text-blue-600" />
            <span>Reglas Programadas Activas ({recurringList.length})</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            Cargando reglas recurrentes...
          </div>
        ) : recurringList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Icon name="repeat" size={36} className="mx-auto text-slate-300 dark:text-slate-700" />
            <p className="text-xs font-semibold text-slate-500">No tienes ninguna transacción periódica programada.</p>
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              Crear primera recurrencia
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {recurringList.map((item) => {
              const isIncome = item.type === 'INCOME';
              return (
                <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-start gap-3.5">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${isIncome ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                      <Icon name={isIncome ? 'arrow-down-left' : 'arrow-up-right'} size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {item.description}
                        </h3>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                          {item.isActive ? 'Activo' : 'Pausado'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span>Frecuencia: <strong className="text-slate-700 dark:text-slate-300">{freqLabels[item.frequency] || item.frequency}</strong></span>
                        <span>•</span>
                        <span>Cuenta: <strong className="text-slate-700 dark:text-slate-300">{item.account?.name}</strong></span>
                        <span>•</span>
                        <span>Categoría: <strong className="text-slate-700 dark:text-slate-300">{item.category?.name}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6">
                    <div className="text-right">
                      <div className={`text-base font-extrabold font-mono ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isIncome ? '+' : '-'}${Number(item.amount).toLocaleString()} {item.currencyCode}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Próxima: {item.nextExecutionDate}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleActive(item.id, item.isActive)}
                        className={`p-2 rounded-xl transition-colors cursor-pointer ${item.isActive ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}
                        title={item.isActive ? 'Pausar recurrencia' : 'Activar recurrencia'}
                      >
                        <Icon name={item.isActive ? 'pause' : 'play'} size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                        title="Eliminar regla"
                      >
                        <Icon name="trash-2" size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <RecurringTransactionForm
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => loadData()}
        accounts={accounts}
        categories={categories}
      />
    </MainLayout>
  );
}
