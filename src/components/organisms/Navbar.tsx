'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '../atoms/Icon';
import { Button } from '../atoms/Button';

interface NavbarProps {
  userName?: string;
  userEmail?: string;
  baseCurrencyCode?: string;
  onOpenNewTransaction?: () => void;
  onOpenExportPdf?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userName = 'Usuario',
  userEmail = 'usuario@ejemplo.com',
  baseCurrencyCode = 'USD',
  onOpenNewTransaction,
  onOpenExportPdf,
}) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChangingCurrency, setIsChangingCurrency] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleChangeCurrency = async (newCode: string) => {
    setIsChangingCurrency(true);
    try {
      await fetch('/api/currencies', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ baseCurrencyCode: newCode }),
      });
      window.location.reload();
    } catch (e) {
      console.error(e);
    } finally {
      setIsChangingCurrency(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div className="md:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            FP
          </div>
          <span className="font-bold text-slate-900 dark:text-white text-base">Finanzas</span>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Divisa Principal:</span>
          <select
            value={baseCurrencyCode}
            disabled={isChangingCurrency}
            onChange={(e) => handleChangeCurrency(e.target.value)}
            className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 font-mono font-bold text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="MXN">MXN ($)</option>
            <option value="GBP">GBP (£)</option>
            <option value="CAD">CAD ($)</option>
            <option value="JPY">JPY (¥)</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onOpenExportPdf && (
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Icon name="file-down" size={16} />}
            onClick={onOpenExportPdf}
            className="hidden sm:inline-flex"
          >
            Exportar PDF
          </Button>
        )}

        {onOpenNewTransaction && (
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Icon name="plus" size={16} />}
            onClick={onOpenNewTransaction}
          >
            Nuevo Movimiento
          </Button>
        )}

        {/* Menú de Usuario */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{userName}</p>
              <p className="text-[10px] text-slate-500 leading-tight">{userEmail}</p>
            </div>
            <Icon name="chevron-down" size={14} className="text-slate-400" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 animate-fadeIn">
              <div className="p-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{userName}</p>
                <p className="text-xs text-slate-500 truncate">{userEmail}</p>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors text-left"
              >
                <Icon name="log-out" size={14} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
