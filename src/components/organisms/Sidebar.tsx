'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '../atoms/Icon';

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: 'layout-dashboard' },
    { label: 'Transacciones', href: '/transactions', icon: 'arrow-left-right' },
    { label: 'Presupuestos', href: '/budgets', icon: 'pie-chart' },
    { label: 'Recurrentes', href: '/recurring', icon: 'repeat' },
    { label: 'Reportes & PDF', href: '/reports', icon: 'file-bar-chart' },
  ];

  return (
    <aside className="w-64 flex-shrink-0 hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 min-h-screen">
      {/* Brand Header */}
      <div className="flex items-center gap-3 h-16 px-6 border-b border-slate-200 dark:border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-base shadow-md shadow-blue-500/20">
          FP
        </div>
        <div>
          <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">Finanzas Pro</span>
          <span className="block text-[10px] font-bold text-blue-600 uppercase tracking-widest">Multi-Divisa</span>
        </div>
      </div>

      {/* Navegación */}
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 mb-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Menú Principal
        </div>

        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 text-center">
        <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200 dark:border-slate-700/50">
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Aislamiento Seguro</p>
          <p className="text-[10px] text-slate-500 mt-0.5">PostgreSQL + UUIDv4</p>
        </div>
      </div>
    </aside>
  );
};
