import { useState } from 'react';
import { User, Phone, Plus, Search, ChevronRight, MessageCircle, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Contact, LoanItem } from '../types';
import { calculateReputation, RELATIONSHIP_LABELS, formatDateSpanish } from '../utils';

interface ContactsManagerProps {
  contacts: Contact[];
  loans: LoanItem[];
  onAddContact: (contact: Omit<Contact, 'id' | 'createdAt'>) => Contact;
  onOpenWhatsApp: (loan: LoanItem) => void;
  onOpenNewLoanWithContact: (contactId: string) => void;
  selectedContactId?: string | null;
}

export function ContactsManager({
  contacts,
  loans,
  onAddContact,
  onOpenWhatsApp,
  onOpenNewLoanWithContact,
  selectedContactId,
}: ContactsManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeContactId, setActiveContactId] = useState<string | null>(selectedContactId || contacts[0]?.id || null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelationship, setNewRelationship] = useState<Contact['relationship']>('amigo');
  const [newNotes, setNewNotes] = useState('');

  const filteredContacts = contacts.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  const activeContact = contacts.find(c => c.id === activeContactId) || filteredContacts[0];
  const activeReputation = activeContact ? calculateReputation(activeContact, loans) : null;
  const activeContactLoans = activeContact
    ? loans.filter(l => l.contactId === activeContact.id || l.contactName.toLowerCase() === activeContact.name.toLowerCase())
    : [];

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const colors = ['bg-indigo-600', 'bg-blue-600', 'bg-emerald-600', 'bg-amber-600', 'bg-rose-600', 'bg-teal-600'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const created = onAddContact({
      name: newName.trim(),
      phone: newPhone.trim() || undefined,
      relationship: newRelationship,
      avatarColor: randomColor,
      notes: newNotes.trim() || undefined,
    });

    setActiveContactId(created.id);
    setShowAddForm(false);
    setNewName('');
    setNewPhone('');
    setNewNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Historial & Reputación por persona</h2>
          <p className="text-xs text-slate-500">
            Descubre quién devuelve rápido, quién tiene cosas pendientes y a quién mejor no prestarle
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar persona o teléfono..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva persona</span>
          </button>
        </div>
      </div>

      {/* Quick Add Form if opened */}
      {showAddForm && (
        <form onSubmit={handleCreateContact} className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-3">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Añadir contacto</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              required
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nombre completo *"
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <input
              type="tel"
              value={newPhone}
              onChange={e => setNewPhone(e.target.value)}
              placeholder="WhatsApp (+34 600...)"
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <select
              value={newRelationship}
              onChange={e => setNewRelationship(e.target.value as Contact['relationship'])}
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="amigo">Amigo/a</option>
              <option value="familia">Familia</option>
              <option value="trabajo">Trabajo</option>
              <option value="estudio">Estudio</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <input
              type="text"
              value={newNotes}
              onChange={e => setNewNotes(e.target.value)}
              placeholder="Nota privada (ej: suele devolver en persona)"
              className="flex-1 mr-3 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                Guardar contacto
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Main Grid: Left contacts list, Right detailed reputation profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Contact cards */}
        <div className="lg:col-span-5 space-y-2">
          {filteredContacts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
              No se encontraron contactos.
            </div>
          ) : (
            filteredContacts.map(c => {
              const rep = calculateReputation(c, loans);
              const isSelected = activeContact?.id === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => setActiveContactId(c.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => e.key === 'Enter' && setActiveContactId(c.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-amber-50/70 border-amber-300 ring-1 ring-amber-300 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white font-bold text-sm flex items-center justify-center shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 truncate">{c.name}</span>
                        <span className="text-[10px] text-slate-500">
                          {RELATIONSHIP_LABELS[c.relationship] || c.relationship}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                        {rep.currentlyPending > 0 ? (
                          <span className="text-amber-800 font-semibold">
                            {rep.currentlyPending} {rep.currentlyPending === 1 ? 'cosa activa' : 'cosas activas'}
                          </span>
                        ) : (
                          <span>Al día</span>
                        )}
                        <span aria-hidden="true">·</span>
                        <span className="truncate">{rep.badge.label.split(' ')[0]}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {rep.overdueCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-rose-500" title="Tiene objetos vencidos" />
                    )}
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right column: Detailed reputation dossier */}
        {activeContact && activeReputation ? (
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
            {/* Contact dossier header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white text-xl font-bold flex items-center justify-center shadow-md">
                  {activeContact.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{activeContact.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span>{RELATIONSHIP_LABELS[activeContact.relationship]}</span>
                    {activeContact.phone && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{activeContact.phone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenNewLoanWithContact(activeContact.id)}
                  className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Prestarle algo
                </button>
              </div>
            </div>

            {/* Karma & Reputation Card */}
            <div className={`p-4 rounded-2xl border ${
              activeReputation.badge.level === 'danger'
                ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                : activeReputation.badge.level === 'warning'
                ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                : activeReputation.badge.level === 'excellent'
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold opacity-75">
                    Índice de Confiabilidad / Karma
                  </span>
                  <h4 className="text-base font-extrabold mt-0.5">{activeReputation.badge.label}</h4>
                  <p className="text-xs opacity-90 mt-1 leading-relaxed">{activeReputation.badge.description}</p>
                </div>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[11px] text-slate-500 block mb-0.5">Total prestado</span>
                <span className="text-xl font-extrabold text-slate-900 font-mono tabular-nums">
                  {activeReputation.totalLentToThem}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[11px] text-slate-500 block mb-0.5">En su poder hoy</span>
                <span className={`text-xl font-extrabold font-mono tabular-nums ${
                  activeReputation.currentlyPending > 0 ? 'text-amber-600' : 'text-slate-900'
                }`}>
                  {activeReputation.currentlyPending}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[11px] text-slate-500 block mb-0.5">Devueltos</span>
                <span className="text-xl font-extrabold text-emerald-600 font-mono tabular-nums">
                  {activeReputation.returnedCount}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[11px] text-slate-500 block mb-0.5">Promedio días</span>
                <span className="text-xl font-extrabold text-slate-900 font-mono tabular-nums">
                  {activeReputation.avgReturnDays > 0 ? `${activeReputation.avgReturnDays}d` : '—'}
                </span>
              </div>
            </div>

            {/* Associated loans list */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
                Historial de objetos ({activeContactLoans.length})
              </h4>

              {activeContactLoans.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-2xl text-xs text-slate-400">
                  No hay préstamos registrados con esta persona todavía.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {activeContactLoans.map(loan => (
                    <div
                      key={loan.id}
                      className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {loan.imageUrl ? (
                          <img
                            src={loan.imageUrl}
                            alt={loan.title}
                            className="w-11 h-11 rounded-xl object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-slate-200 flex items-center justify-center shrink-0 text-slate-500">
                            <Clock className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h5 className="font-bold text-xs text-slate-900 truncate">{loan.title}</h5>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            <span>{loan.type === 'lent' ? 'Prestado el' : 'Recibido el'} {formatDateSpanish(loan.loanDate)}</span>
                            {loan.returned ? (
                              <span className="text-emerald-700 font-semibold ml-2">· Devuelto</span>
                            ) : loan.dueDate ? (
                              <span className="text-amber-700 font-semibold ml-2">· Plazo: {formatDateSpanish(loan.dueDate)}</span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {!loan.returned && (
                          <button
                            type="button"
                            onClick={() => onOpenWhatsApp(loan)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold flex items-center gap-1 shadow-sm"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
