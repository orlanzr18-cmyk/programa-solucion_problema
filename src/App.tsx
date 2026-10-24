import { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Filter, AlertTriangle, CheckCircle2, Clock, RotateCcw, Sparkles } from 'lucide-react';
import { Contact, LoanItem, LoanType, Category } from './types';
import { INITIAL_CONTACTS, INITIAL_LOANS } from './data/initialData';
import { CATEGORIES_CONFIG } from './utils';
import { Header } from './components/Header';
import { LoanCard } from './components/LoanCard';
import { WhatsAppReminderModal } from './components/WhatsAppReminderModal';
import { MarkAsReturnedModal } from './components/MarkAsReturnedModal';
import { NewLoanModal } from './components/NewLoanModal';
import { ContactsManager } from './components/ContactsManager';
import { StatsOverview } from './components/StatsOverview';
import { MobileBottomNav } from './components/MobileBottomNav';

const STORAGE_KEY_LOANS = 'devuelvemelo_loans_v1';
const STORAGE_KEY_CONTACTS = 'devuelvemelo_contacts_v1';

export default function App() {
  // Persistence state
  const [loans, setLoans] = useState<LoanItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LOANS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading loans from storage', e);
    }
    return INITIAL_LOANS;
  });

  const [contacts, setContacts] = useState<Contact[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONTACTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Error reading contacts from storage', e);
    }
    return INITIAL_CONTACTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LOANS, JSON.stringify(loans));
    } catch (e) {
      console.warn('Error saving loans', e);
    }
  }, [loans]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONTACTS, JSON.stringify(contacts));
    } catch (e) {
      console.warn('Error saving contacts', e);
    }
  }, [contacts]);

  // Navigation & Filter state
  const [activeTab, setActiveTab] = useState<'lent' | 'borrowed' | 'contacts' | 'stats'>('lent');
  const [statusFilter, setStatusFilter] = useState<'active' | 'overdue' | 'returned' | 'all'>('active');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isNewLoanOpen, setIsNewLoanOpen] = useState(false);
  const [initialLoanType, setInitialLoanType] = useState<LoanType>('lent');
  const [preselectedContactId, setPreselectedContactId] = useState<string | null>(null);

  const [whatsappLoan, setWhatsappLoan] = useState<LoanItem | null>(null);
  const [returnLoan, setReturnLoan] = useState<LoanItem | null>(null);

  // Undo notification state
  const [lastReturnedItem, setLastReturnedItem] = useState<{ id: string; title: string } | null>(null);

  // Counters
  const pendingLentCount = useMemo(
    () => loans.filter(l => l.type === 'lent' && !l.returned).length,
    [loans]
  );
  const pendingBorrowedCount = useMemo(
    () => loans.filter(l => l.type === 'borrowed' && !l.returned).length,
    [loans]
  );

  // Filtered Loans for active list
  const filteredLoans = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return loans.filter(loan => {
      // 1. Type match
      if (loan.type !== activeTab) return false;

      // 2. Status match
      if (statusFilter === 'active' && loan.returned) return false;
      if (statusFilter === 'returned' && !loan.returned) return false;
      if (statusFilter === 'overdue') {
        if (loan.returned) return false;
        if (!loan.dueDate || loan.dueDate >= today) return false;
      }

      // 3. Category match
      if (categoryFilter !== 'all' && loan.category !== categoryFilter) return false;

      // 4. Search text match
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = loan.title.toLowerCase().includes(query);
        const matchesContact = loan.contactName.toLowerCase().includes(query);
        const matchesDesc = loan.description?.toLowerCase().includes(query);
        const matchesCondition = loan.initialCondition?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesContact && !matchesDesc && !matchesCondition) return false;
      }

      return true;
    });
  }, [loans, activeTab, statusFilter, categoryFilter, searchQuery]);

  // Loan Operations
  const handleSaveLoan = (
    newLoanData: Omit<LoanItem, 'id' | 'createdAt' | 'remindersSentCount' | 'returned'>
  ) => {
    const newLoan: LoanItem = {
      ...newLoanData,
      id: 'l-' + Date.now(),
      createdAt: new Date().toISOString(),
      returned: false,
      remindersSentCount: 0,
    };
    setLoans(prev => [newLoan, ...prev]);
  };

  const handleConfirmReturn = (
    loanId: string,
    returnedDate: string,
    notes?: string,
    rating?: 1 | 2 | 3 | 4 | 5
  ) => {
    const target = loans.find(l => l.id === loanId);
    if (target) {
      setLastReturnedItem({ id: target.id, title: target.title });
      setTimeout(() => setLastReturnedItem(null), 7000);
    }

    setLoans(prev =>
      prev.map(l =>
        l.id === loanId
          ? {
              ...l,
              returned: true,
              returnedDate,
              returnNotes: notes,
              returnConditionRating: rating,
            }
          : l
      )
    );
  };

  const handleUndoReturn = (loanId: string) => {
    setLoans(prev =>
      prev.map(l =>
        l.id === loanId
          ? {
              ...l,
              returned: false,
              returnedDate: undefined,
              returnNotes: undefined,
              returnConditionRating: undefined,
            }
          : l
      )
    );
    setLastReturnedItem(null);
  };

  const handleDeleteLoan = (loanId: string) => {
    if (confirm('¿Eliminar este registro de préstamo?')) {
      setLoans(prev => prev.filter(l => l.id !== loanId));
    }
  };

  const handleReminderSent = (loanId: string) => {
    setLoans(prev =>
      prev.map(l =>
        l.id === loanId
          ? {
              ...l,
              remindersSentCount: (l.remindersSentCount || 0) + 1,
              lastReminderDate: new Date().toISOString(),
            }
          : l
      )
    );
  };

  const handleAddContact = (newContactData: Omit<Contact, 'id' | 'createdAt'>): Contact => {
    const created: Contact = {
      ...newContactData,
      id: 'c-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setContacts(prev => [...prev, created]);
    return created;
  };

  const handleResetData = () => {
    setLoans(INITIAL_LOANS);
    setContacts(INITIAL_CONTACTS);
  };

  const handleImportData = (data: { loans: LoanItem[]; contacts: Contact[] }) => {
    setLoans(data.loans);
    setContacts(data.contacts);
  };

  const openNewLoanModalWithType = (type: LoanType, contactId?: string) => {
    setInitialLoanType(type);
    if (contactId) {
      setPreselectedContactId(contactId);
    }
    setIsNewLoanOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-20 md:pb-12 text-slate-900">
      {/* Top Bar Header */}
      <Header
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewLoan={() => openNewLoanModalWithType(activeTab === 'borrowed' ? 'borrowed' : 'lent')}
        pendingLentCount={pendingLentCount}
        pendingBorrowedCount={pendingBorrowedCount}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex-1 w-full">
        {/* Undo Return Toast Notification */}
        {lastReturnedItem && (
          <div className="mb-4 p-3.5 bg-slate-900 text-white rounded-2xl flex items-center justify-between gap-3 shadow-lg animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Objeto <strong>"{lastReturnedItem.title}"</strong> marcado como devuelto.
              </span>
            </div>
            <button
              onClick={() => handleUndoReturn(lastReturnedItem.id)}
              className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-lg text-xs flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Deshacer
            </button>
          </div>
        )}

        {/* View Switcher: Loans (Lent / Borrowed) vs Contacts vs Stats */}
        {activeTab === 'contacts' ? (
          <ContactsManager
            contacts={contacts}
            loans={loans}
            onAddContact={handleAddContact}
            onOpenWhatsApp={loan => setWhatsappLoan(loan)}
            onOpenNewLoanWithContact={cId => openNewLoanModalWithType('lent', cId)}
            selectedContactId={preselectedContactId}
          />
        ) : activeTab === 'stats' ? (
          <StatsOverview
            loans={loans}
            contacts={contacts}
            onImportData={handleImportData}
            onResetData={handleResetData}
          />
        ) : (
          /* Loans List View (Lent or Borrowed) */
          <div className="space-y-6">
            {/* View Title & Description */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                  {activeTab === 'lent' ? 'Lo que he prestado' : 'Lo que me han prestado'}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeTab === 'lent'
                    ? 'Lleva el control exacto para no perder tus cosas ni olvidar a quién se las diste.'
                    : 'Anota lo que otros te prestaron para devolverlo a tiempo y mantener su confianza.'}
                </p>
              </div>

              {/* Status Segmented Controls (Interactive buttons) */}
              <div className="flex items-center gap-1 p-1 bg-slate-200/80 rounded-xl self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setStatusFilter('active')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    statusFilter === 'active'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Pendientes
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('overdue')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
                    statusFilter === 'overdue'
                      ? 'bg-rose-50 text-rose-700 shadow-sm font-bold'
                      : 'text-slate-600 hover:text-rose-600'
                  }`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  Vencidos
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('returned')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    statusFilter === 'returned'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Devueltos
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    statusFilter === 'all'
                      ? 'bg-white text-slate-950 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos
                </button>
              </div>
            </div>

            {/* Search & Category Filter Toolbar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar por objeto, nombre de persona o estado..."
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Borrar
                  </button>
                )}
              </div>

              {/* Category Dropdown/Chips */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                <button
                  onClick={() => setCategoryFilter('all')}
                  className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                    categoryFilter === 'all'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  Todas las categorías
                </button>
                {Object.entries(CATEGORIES_CONFIG).map(([key, cat]) => (
                  <button
                    key={key}
                    onClick={() => setCategoryFilter(key)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                      categoryFilter === key
                        ? 'bg-slate-900 text-white font-bold'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Loans Grid or Empty State */}
            {filteredLoans.length === 0 ? (
              <div className="py-16 px-6 bg-white rounded-3xl border border-slate-200 text-center max-w-lg mx-auto shadow-sm">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto mb-4 flex items-center justify-center">
                  <Sparkles className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {searchQuery || categoryFilter !== 'all' || statusFilter !== 'active'
                    ? 'No hay resultados con estos filtros'
                    : activeTab === 'lent'
                    ? 'No tienes préstamos pendientes registrados'
                    : 'No tienes objetos prestados por devolver'}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                  {searchQuery || categoryFilter !== 'all' || statusFilter !== 'active'
                    ? 'Prueba cambiando los filtros o el término de búsqueda.'
                    : activeTab === 'lent'
                    ? '¿Le prestaste una herramienta, un libro, dinero o ropa a alguien? Regístralo con una foto para que no se te olvide.'
                    : '¿Alguien te prestó algo útil? Anótalo aquí para recordar devolvérselo a tiempo.'}
                </p>
                <button
                  type="button"
                  onClick={() => openNewLoanModalWithType(activeTab)}
                  className="mt-5 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 shadow-md shadow-amber-500/20"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>
                    {activeTab === 'lent' ? 'Registrar lo que presté' : 'Registrar lo que me prestaron'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredLoans.map(loan => (
                  <LoanCard
                    key={loan.id}
                    loan={loan}
                    onOpenWhatsApp={l => setWhatsappLoan(l)}
                    onOpenReturnModal={l => setReturnLoan(l)}
                    onDelete={handleDeleteLoan}
                    onSelectPerson={cId => {
                      setPreselectedContactId(cId);
                      setActiveTab('contacts');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating Action Button on Mobile */}
      <button
        onClick={() => openNewLoanModalWithType(activeTab === 'borrowed' ? 'borrowed' : 'lent')}
        className="md:hidden fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black shadow-xl shadow-amber-500/30 flex items-center justify-center transition-transform"
        aria-label="Registrar nuevo préstamo"
      >
        <Plus className="w-7 h-7 stroke-[2.5]" />
      </button>

      {/* Mobile Bottom Tab Navigation */}
      <MobileBottomNav
        currentTab={activeTab}
        onSelectTab={setActiveTab}
        pendingLentCount={pendingLentCount}
        pendingBorrowedCount={pendingBorrowedCount}
      />

      {/* WhatsApp Reminder Modal */}
      <WhatsAppReminderModal
        loan={whatsappLoan}
        isOpen={!!whatsappLoan}
        onClose={() => setWhatsappLoan(null)}
        onReminderSent={handleReminderSent}
      />

      {/* Mark As Returned Modal */}
      <MarkAsReturnedModal
        loan={returnLoan}
        isOpen={!!returnLoan}
        onClose={() => setReturnLoan(null)}
        onConfirmReturn={handleConfirmReturn}
      />

      {/* New Loan Modal */}
      <NewLoanModal
        isOpen={isNewLoanOpen}
        contacts={contacts}
        onClose={() => setIsNewLoanOpen(false)}
        onSaveLoan={handleSaveLoan}
        onAddContact={handleAddContact}
        initialType={initialLoanType}
      />
    </div>
  );
}
