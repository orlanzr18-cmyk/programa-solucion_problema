import { useState } from 'react';
import { MessageCircle, CheckCircle2, Clock, Calendar, AlertTriangle, Trash2, ArrowUpRight, ArrowDownLeft, ShieldCheck, Tag } from 'lucide-react';
import { LoanItem } from '../types';
import { CATEGORIES_CONFIG, formatElapsedDays, formatDateSpanish, getDueStatus } from '../utils';

interface LoanCardProps {
  loan: LoanItem;
  onOpenWhatsApp: (loan: LoanItem) => void;
  onOpenReturnModal: (loan: LoanItem) => void;
  onDelete: (id: string) => void;
  onSelectPerson?: (contactId: string) => void;
}

export function LoanCard({
  loan,
  onOpenWhatsApp,
  onOpenReturnModal,
  onDelete,
  onSelectPerson,
}: LoanCardProps) {
  const [imgError, setImgError] = useState(false);
  const dueInfo = getDueStatus(loan);
  const categoryConfig = CATEGORIES_CONFIG[loan.category] || CATEGORIES_CONFIG.otros;
  const isLentByMe = loan.type === 'lent';

  return (
    <div className={`group bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col ${
      dueInfo.status === 'overdue' && !loan.returned
        ? 'border-rose-200/90 shadow-sm hover:border-rose-300'
        : loan.returned
        ? 'border-slate-200/60 opacity-85 hover:opacity-100'
        : 'border-slate-200/80 hover:border-slate-300 hover:shadow-md'
    }`}>
      {/* Top Banner / Image Area */}
      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
        {loan.imageUrl && !imgError ? (
          <img
            src={loan.imageUrl}
            alt={loan.title}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
            <Tag className="w-10 h-10 mb-2 opacity-50 text-slate-500" />
            <span className="text-xs font-semibold text-slate-600 text-center line-clamp-1">{loan.title}</span>
            <span className="text-[11px] text-slate-400">Sin foto adjunta</span>
          </div>
        )}

        {/* Floating badge for Type (Lent vs Borrowed) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur-md shadow-sm ${
            isLentByMe 
              ? 'bg-amber-500/95 text-slate-950' 
              : 'bg-indigo-600/95 text-white'
          }`}>
            {isLentByMe ? (
              <>
                <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                Presté
              </>
            ) : (
              <>
                <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                Me prestaron
              </>
            )}
          </span>
        </div>

        {/* Category tag */}
        <div className="absolute top-3 right-3">
          <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-white/90 backdrop-blur-sm text-slate-700 shadow-sm">
            {categoryConfig.label}
          </span>
        </div>

        {/* Due warning tag if overdue */}
        {dueInfo.status === 'overdue' && !loan.returned && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-rose-600/95 backdrop-blur-md text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center justify-between shadow-md">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-200" />
                {dueInfo.label}
              </span>
              <span className="text-[10px] text-rose-100 font-normal">Requiere reclamo</span>
            </div>
          </div>
        )}
      </div>

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Unboxed Metadata Header (Zero-Pill rule) */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatElapsedDays(loan.loanDate)}
            </span>
            <span aria-hidden="true">·</span>
            <span>{formatDateSpanish(loan.loanDate)}</span>
          </div>

          {/* Title */}
          <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
            {loan.title}
          </h3>

          {/* Contact Person */}
          <div className="mt-2.5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onSelectPerson && onSelectPerson(loan.contactId)}
              className="text-left group/contact flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                {loan.contactName.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-xs font-bold text-slate-800 group-hover/contact:text-amber-600 flex items-center gap-1">
                  {loan.contactName}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {isLentByMe ? 'Tiene tu objeto' : 'Te lo prestó'}
                </span>
              </div>
            </button>

            {loan.estimatedValue && (
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                ${loan.estimatedValue}
              </span>
            )}
          </div>

          {/* Delivery condition notes (Crucial feature for remembering item status) */}
          {loan.initialCondition && (
            <div className="mt-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 mb-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Estado entregado:
              </div>
              <p className="line-clamp-2 italic text-slate-700">"{loan.initialCondition}"</p>
            </div>
          )}

          {/* Due date if active */}
          {!loan.returned && loan.dueDate && dueInfo.status !== 'overdue' && (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Fecha acordada: {formatDateSpanish(loan.dueDate)}</span>
              <span className="text-[11px] font-medium text-amber-700">({dueInfo.label})</span>
            </div>
          )}

          {/* Returned badge details if already returned */}
          {loan.returned && (
            <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 text-emerald-900 text-xs border border-emerald-100">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Devuelto con éxito
                </span>
                {loan.returnedDate && (
                  <span className="text-[11px] text-emerald-700">{formatDateSpanish(loan.returnedDate)}</span>
                )}
              </div>
              {loan.returnNotes && (
                <p className="mt-1 text-[11px] text-emerald-800 line-clamp-2">
                  {loan.returnNotes}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          {!loan.returned ? (
            <>
              {/* WhatsApp reminder button */}
              <button
                type="button"
                onClick={() => onOpenWhatsApp(loan)}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors border border-emerald-200/60"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>{isLentByMe ? 'Recordar (WhatsApp)' : 'Avisar que devuelvo'}</span>
                {loan.remindersSentCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">
                    {loan.remindersSentCount}
                  </span>
                )}
              </button>

              {/* 1-tap Return action */}
              <button
                type="button"
                onClick={() => onOpenReturnModal(loan)}
                className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shrink-0 shadow-sm"
                title="Marcar como devuelto"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Devuelto</span>
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-between text-xs text-slate-500">
              <span className="text-[11px] text-slate-400">Archivado en historial</span>
              <button
                type="button"
                onClick={() => onDelete(loan.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                title="Eliminar registro"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}

          {!loan.returned && (
            <button
              type="button"
              onClick={() => onDelete(loan.id)}
              className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
              title="Eliminar préstamo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
