import { useState } from 'react';
import { X, CheckCircle2, Star, Calendar, MessageSquare } from 'lucide-react';
import { LoanItem } from '../types';
import { formatDateSpanish } from '../utils';

interface MarkAsReturnedModalProps {
  loan: LoanItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReturn: (loanId: string, returnedDate: string, notes?: string, rating?: 1 | 2 | 3 | 4 | 5) => void;
}

export function MarkAsReturnedModal({
  loan,
  isOpen,
  onClose,
  onConfirmReturn,
}: MarkAsReturnedModalProps) {
  const [returnDate, setReturnDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [returnNotes, setReturnNotes] = useState('');

  if (!isOpen || !loan) return null;

  const handleConfirm = () => {
    onConfirmReturn(loan.id, returnDate, returnNotes, rating);
    onClose();
  };

  const isLent = loan.type === 'lent';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-emerald-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isLent ? 'Confirmar devolución recibida' : 'Confirmar objeto devuelto'}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1">{loan.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 bg-slate-50 rounded-2xl text-xs text-slate-600 space-y-1 border border-slate-100">
            <div className="flex justify-between">
              <span className="text-slate-500">Persona:</span>
              <span className="font-semibold text-slate-800">{loan.contactName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Fecha de entrega:</span>
              <span>{formatDateSpanish(loan.loanDate)}</span>
            </div>
            {loan.initialCondition && (
              <div className="flex justify-between pt-1 border-t border-slate-200/60">
                <span className="text-slate-500">Estado inicial:</span>
                <span className="italic text-slate-700">{loan.initialCondition}</span>
              </div>
            )}
          </div>

          {/* Return Date */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Fecha de devolución
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                value={returnDate}
                onChange={e => setReturnDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Condition Rating */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              ¿En qué estado fue devuelto?
            </label>
            <div className="flex items-center gap-2">
              {([1, 2, 3, 4, 5] as const).map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-xl border transition-all flex items-center justify-center ${
                    rating >= star
                      ? 'bg-amber-50 border-amber-300 text-amber-500'
                      : 'bg-slate-50 border-slate-200 text-slate-300 hover:text-slate-400'
                  }`}
                  aria-label={`${star} estrellas`}
                >
                  <Star className="w-5 h-5 fill-current" />
                </button>
              ))}
              <span className="text-xs font-medium text-slate-600 ml-2">
                {rating === 5 && '¡Impecable!'}
                {rating === 4 && 'Muy buen estado'}
                {rating === 3 && 'Aceptable'}
                {rating === 2 && 'Con detalles'}
                {rating === 1 && 'Dañado / Con faltantes'}
              </span>
            </div>
          </div>

          {/* Return Notes */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
              Notas adicionales (opcional)
            </label>
            <div className="relative">
              <div className="absolute top-2.5 left-3 text-slate-400 pointer-events-none">
                <MessageSquare className="w-4 h-4" />
              </div>
              <textarea
                value={returnNotes}
                onChange={e => setReturnNotes(e.target.value)}
                rows={2}
                placeholder="Ej: Devuelto completo, sin rayones ni faltantes."
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            Marcar como devuelto
          </button>
        </div>
      </div>
    </div>
  );
}
