import React, { useState, useEffect } from 'react';
import { X, Send, Copy, Check, MessageSquare, Sparkles, Smile, Coffee, AlertCircle, Share2, PhoneCall } from 'lucide-react';
import { LoanItem, WhatsAppTone } from '../types';
import { generateWhatsAppMessage, buildWhatsAppUrl, cleanPhoneNumber } from '../utils';

interface WhatsAppReminderModalProps {
  loan: LoanItem | null;
  isOpen: boolean;
  onClose: () => void;
  onReminderSent: (loanId: string) => void;
}

const TONES_OPTIONS: Array<{
  id: WhatsAppTone;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tagline: string;
}> = [
  { id: 'amable', label: 'Amable y casual', icon: Smile, tagline: 'Cálido, sin presionar ni incomodar' },
  { id: 'gracioso', label: 'Con humor', icon: Sparkles, tagline: 'El objeto manda saludos y extraña su casa' },
  { id: 'cafe', label: 'Con pretexto / Café', icon: Coffee, tagline: 'Invita a verse y de paso entrega' },
  { id: 'directo', label: 'Directo y claro', icon: MessageSquare, tagline: 'Al grano con fecha precisa' },
  { id: 'firme', label: 'Firme / Urgente', icon: AlertCircle, tagline: 'Lo necesitas pronto por un compromiso' },
];

export function WhatsAppReminderModal({
  loan,
  isOpen,
  onClose,
  onReminderSent,
}: WhatsAppReminderModalProps) {
  const [selectedTone, setSelectedTone] = useState<WhatsAppTone>('amable');
  const [customMessage, setCustomMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [customPhone, setCustomPhone] = useState('');

  useEffect(() => {
    if (loan) {
      const initialTone: WhatsAppTone = loan.type === 'borrowed' ? 'devolver_yo' : 'amable';
      setSelectedTone(initialTone);
      const generated = generateWhatsAppMessage(loan, initialTone);
      setCustomMessage(generated);
      setCustomPhone(loan.contactPhone || '');
    }
  }, [loan]);

  const handleToneChange = (tone: WhatsAppTone) => {
    if (!loan) return;
    setSelectedTone(tone);
    const generated = generateWhatsAppMessage(loan, tone);
    setCustomMessage(generated);
  };

  const handleCopy = async () => {
    if (!customMessage) return;
    try {
      await navigator.clipboard.writeText(customMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      if (loan) onReminderSent(loan.id);
    } catch {
      // fallback
    }
  };

  const handleShare = async () => {
    if (!customMessage || !navigator.share) return;
    try {
      await navigator.share({
        title: `Devuélvemelo: ${loan?.title}`,
        text: customMessage,
      });
      if (loan) onReminderSent(loan.id);
    } catch {
      // ignore aborts
    }
  };

  const handleOpenWhatsApp = () => {
    if (!loan) return;
    const url = buildWhatsAppUrl(customPhone, customMessage);
    window.open(url, '_blank', 'noopener,noreferrer');
    onReminderSent(loan.id);
    onClose();
  };

  if (!isOpen || !loan) return null;

  const isBorrowedByMe = loan.type === 'borrowed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Send className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isBorrowedByMe ? 'Avisar que vas a devolver' : 'Recordatorio amable'}
              </h3>
              <p className="text-xs text-slate-500">
                Para {loan.contactName} · {loan.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Tone Selector (if user lent the item) */}
          {!isBorrowedByMe && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Elige el tono del mensaje
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {TONES_OPTIONS.map(tone => {
                  const Icon = tone.icon;
                  const isActive = selectedTone === tone.id;
                  return (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => handleToneChange(tone.id)}
                      className={`p-2.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                        isActive
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-medium shadow-sm ring-1 ring-emerald-600'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                        <span className="font-semibold truncate">{tone.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 line-clamp-1">{tone.tagline}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Contact phone field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Número de WhatsApp / Teléfono
              </label>
              {customPhone && (
                <span className="text-[11px] text-emerald-700 font-medium">
                  Listo para enviar directo
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <PhoneCall className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={customPhone}
                onChange={e => setCustomPhone(e.target.value)}
                placeholder="+34 612 345 678 (con prefijo del país)"
                className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-slate-800"
              />
            </div>
          </div>

          {/* Message Text Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Mensaje personalizado (puedes editarlo)
              </label>
              <span className="text-[11px] text-slate-400">
                {customMessage.length} caracteres
              </span>
            </div>
            <div className="relative bg-emerald-50/40 border border-emerald-200/80 rounded-2xl p-3.5">
              <textarea
                value={customMessage}
                onChange={e => setCustomMessage(e.target.value)}
                rows={4}
                className="w-full bg-transparent border-0 p-0 text-slate-800 text-sm focus:ring-0 focus:outline-none resize-none leading-relaxed"
                placeholder="Escribe el mensaje que prefieras..."
              />
              <div className="mt-2 pt-2 border-t border-emerald-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>💬 Se abrirá en el chat de WhatsApp</span>
                {loan.remindersSentCount > 0 && (
                  <span className="text-amber-700 font-medium">
                    Recordatorios previos: {loan.remindersSentCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? '¡Copiado!' : 'Copiar texto'}
            </button>

            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={handleShare}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                Compartir
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleOpenWhatsApp}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-semibold text-sm flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all"
          >
            <Send className="w-4 h-4" />
            Abrir WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
