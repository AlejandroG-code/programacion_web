'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../organisms/Sidebar';
import { Navbar } from '../organisms/Navbar';
import { TransactionForm } from '../organisms/TransactionForm';
import { PdfExportModal } from '../organisms/PdfExportModal';
import { Icon } from '../atoms/Icon';

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [activeAlert, setActiveAlert] = useState<any>(null);

  const fetchLayoutData = async () => {
    try {
      const [userRes, accRes, catRes] = await Promise.all([
        fetch('/api/auth/me'),
        fetch('/api/accounts'),
        fetch('/api/categories'),
      ]);

      if (userRes.ok) {
        const u = await userRes.json();
        setUser(u.data?.user);
      }
      if (accRes.ok) {
        const a = await accRes.json();
        setAccounts(a.data?.accounts || []);
      }
      if (catRes.ok) {
        const c = await catRes.json();
        setCategories(c.data?.categories || []);
      }
    } catch (e) {
      console.error('Error cargando layout data:', e);
    }
  };

  useEffect(() => {
    fetchLayoutData();
  }, []);

  const handleTxSuccess = (budgetAlert?: any) => {
    fetchLayoutData();
    if (budgetAlert && (budgetAlert.level === 'WARNING_80' || budgetAlert.level === 'EXCEEDED_100')) {
      setActiveAlert(budgetAlert);
      setTimeout(() => setActiveAlert(null), 8000);
    }
    // Refrescar página para sincronizar listas
    window.dispatchEvent(new Event('transaction-updated'));
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar fijo */}
      <Sidebar />

      {/* Área Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          userName={user ? `${user.firstName} ${user.lastName}` : 'Usuario'}
          userEmail={user?.email || ''}
          baseCurrencyCode={user?.baseCurrencyCode || 'USD'}
          onOpenNewTransaction={() => setIsTxModalOpen(true)}
          onOpenExportPdf={() => setIsPdfModalOpen(true)}
        />

        {/* Toast Alerta Presupuestaria */}
        {activeAlert && (
          <div className="fixed top-20 right-6 z-50 max-w-md p-4 bg-white dark:bg-slate-900 border-2 border-rose-500 rounded-2xl shadow-2xl animate-fadeIn flex items-start gap-3">
            <div className={`p-2 rounded-xl text-white ${activeAlert.level === 'EXCEEDED_100' ? 'bg-rose-600 animate-pulse' : 'bg-amber-500'}`}>
              <Icon name="alert-triangle" size={20} />
            </div>
            <div className="flex-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-rose-600">
                {activeAlert.level === 'EXCEEDED_100' ? 'Límite Presupuestario Superado' : 'Advertencia de Presupuesto (≥80%)'}
              </h4>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
                {activeAlert.message}
              </p>
            </div>
            <button onClick={() => setActiveAlert(null)} className="text-slate-400 hover:text-slate-600">
              <Icon name="x" size={16} />
            </button>
          </div>
        )}

        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>

      {/* Modales Globales */}
      <TransactionForm
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        onSuccess={handleTxSuccess}
        accounts={accounts}
        categories={categories}
      />

      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        baseCurrencyCode={user?.baseCurrencyCode || 'USD'}
      />
    </div>
  );
};
