'use client';

import React, { useState } from 'react';
import { Button } from '../atoms/Button';
import { FormField } from '../molecules/FormField';
import { Icon } from '../atoms/Icon';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  baseCurrencyCode?: string;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  baseCurrencyCode = 'USD',
}) => {
  const now = new Date();
  const [year, setYear] = useState<number>(now.getUTCFullYear());
  const [month, setMonth] = useState<string>(String(now.getUTCMonth() + 1));
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    setIsExporting(true);
    try {
      const monthQuery = month === 'ALL' ? '' : `&month=${month}`;
      const url = `/api/reports/export-pdf?year=${year}${monthQuery}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error('Error al generar el documento PDF.');

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = `reporte_financiero_${year}_${month === 'ALL' ? 'anual' : `mes_${month}`}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

      onClose();
    } catch (error) {
      console.error('Error descargando PDF:', error);
      alert('Hubo un problema al generar el reporte PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  const months = [
    { val: 'ALL', name: 'Todo el Año (Anual Completo)' },
    { val: '1', name: 'Enero' },
    { val: '2', name: 'Febrero' },
    { val: '3', name: 'Marzo' },
    { val: '4', name: 'Abril' },
    { val: '5', name: 'Mayo' },
    { val: '6', name: 'Junio' },
    { val: '7', name: 'Julio' },
    { val: '8', name: 'Agosto' },
    { val: '9', name: 'Septiembre' },
    { val: '10', name: 'Octubre' },
    { val: '11', name: 'Noviembre' },
    { val: '12', name: 'Diciembre' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 flex items-center justify-center">
              <Icon name="file-down" size={18} />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Exportar Reporte PDF</h2>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <Icon name="x" size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500">
            Descarga un estado de cuenta y balance financiero formal con métricas consolidadas en tu divisa base ({baseCurrencyCode}).
          </p>

          <FormField label="Año del Reporte">
            <input
              type="number"
              min="2000"
              max="2100"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </FormField>

          <FormField label="Periodo">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
            >
              {months.map(m => (
                <option key={m.val} value={m.val}>
                  {m.name}
                </option>
              ))}
            </select>
          </FormField>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="md" type="button" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              size="md"
              leftIcon={<Icon name="file-down" size={16} />}
              onClick={handleDownload}
              isLoading={isExporting}
            >
              Descargar PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
