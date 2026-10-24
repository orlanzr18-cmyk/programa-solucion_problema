import React, { useRef } from 'react';
import { Download, Upload, RefreshCw, CheckCircle2, AlertTriangle, ArrowUpRight, ArrowDownLeft, Shield, DollarSign } from 'lucide-react';
import { LoanItem, Contact } from '../types';

interface StatsOverviewProps {
  loans: LoanItem[];
  contacts: Contact[];
  onImportData: (data: { loans: LoanItem[]; contacts: Contact[] }) => void;
  onResetData: () => void;
}

export function StatsOverview({ loans, contacts, onImportData, onResetData }: StatsOverviewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const lentLoans = loans.filter(l => l.type === 'lent');
  const borrowedLoans = loans.filter(l => l.type === 'borrowed');

  const activeLent = lentLoans.filter(l => !l.returned);
  const returnedLent = lentLoans.filter(l => l.returned);

  const activeBorrowed = borrowedLoans.filter(l => !l.returned);

  const today = new Date().toISOString().slice(0, 10);
  const overdueLent = activeLent.filter(l => l.dueDate && l.dueDate < today);

  const totalEstimatedValueLent = activeLent.reduce((acc, l) => acc + (l.estimatedValue || 0), 0);

  const returnRatePercent = lentLoans.length > 0 
    ? Math.round((returnedLent.length / lentLoans.length) * 100) 
    : 100;

  // Category breakdown
  const categoryCounts = lentLoans.reduce<Record<string, number>>((acc, l) => {
    acc[l.category] = (acc[l.category] || 0) + 1;
    return acc;
  }, {});

  const handleExport = () => {
    const data = {
      loans,
      contacts,
      exportedAt: new Date().toISOString(),
      app: 'Devuélvemelo',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devuelvemelo-backup-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result as string);
        if (Array.isArray(parsed.loans) && Array.isArray(parsed.contacts)) {
          onImportData({ loans: parsed.loans, contacts: parsed.contacts });
          alert('¡Copia de seguridad restaurada con éxito!');
        } else {
          alert('El archivo no tiene el formato válido de Devuélvemelo.');
        }
      } catch {
        alert('Error al leer el archivo JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Resumen & Estadísticas de préstamos</h2>
        <p className="text-xs text-slate-500">Métricas clave sobre tus pertenencias prestadas y prestadas a ti</p>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Cosas que presté</span>
            <ArrowUpRight className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-slate-900 font-mono tabular-nums">
              {activeLent.length}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              {returnedLent.length} ya devueltas
            </span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Me prestaron a mí</span>
            <ArrowDownLeft className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-indigo-600 font-mono tabular-nums">
              {activeBorrowed.length}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Para no olvidar devolver
            </span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Vencidos sin devolver</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-rose-600 font-mono tabular-nums">
              {overdueLent.length}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Requieren recordatorio
            </span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tasa de devolución</span>
            <Shield className="w-4 h-4 text-emerald-500" />
          </div>
          <div>
            <div className="text-2xl font-extrabold text-emerald-600 font-mono tabular-nums">
              {returnRatePercent}%
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Historial acumulado
            </span>
          </div>
        </div>
      </div>

      {/* Secondary Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Value Protected Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-600" />
              Valor estimado en la calle
            </h3>
            <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
              ${totalEstimatedValueLent}
            </span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            Es la suma de los valores estimados de los objetos que tienes actualmente prestados a otras personas. Mantener el registro te ahorra pérdidas sorpresa.
          </p>
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Contactos con préstamos activos:</span>
            <span className="font-bold text-slate-900 font-mono">
              {new Set(activeLent.map(l => l.contactId)).size} personas
            </span>
          </div>
        </div>

        {/* Data Persistence & Backup */}
        <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            Copia de seguridad local & Restauración
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Todos tus préstamos y fotos se guardan en el almacenamiento local de tu navegador. Puedes descargar un respaldo en JSON en cualquier momento.
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleExport}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Exportar copia JSON
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              Importar copia
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => {
                if (confirm('¿Restaurar los datos de muestra iniciales? Esto reiniciará tus préstamos.')) {
                  onResetData();
                }
              }}
              className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-medium flex items-center gap-1 ml-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Restablecer muestra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
