import { Plus, Sparkles, Repeat } from 'lucide-react';

interface HeaderProps {
  currentTab: 'lent' | 'borrowed' | 'contacts' | 'stats';
  onSelectTab: (tab: 'lent' | 'borrowed' | 'contacts' | 'stats') => void;
  onOpenNewLoan: () => void;
  pendingLentCount: number;
  pendingBorrowedCount: number;
}

export function Header({
  currentTab,
  onSelectTab,
  onOpenNewLoan,
  pendingLentCount,
  pendingBorrowedCount,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onSelectTab('lent')}
          className="flex items-center gap-2.5 text-left focus:outline-none whitespace-nowrap shrink-0 group"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 group-hover:rotate-6 transition-transform">
            <Repeat className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div className="leading-none">
            <span className="text-lg font-black tracking-tight text-slate-900 block">
              Devuélvemelo
            </span>
            <span className="text-[10px] font-medium text-slate-400">
              Control de préstamos
            </span>
          </div>
        </button>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
          <button
            onClick={() => onSelectTab('lent')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
              currentTab === 'lent'
                ? 'text-amber-600 border-b-2 border-amber-500 font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <span>Lo que presté</span>
            {pendingLentCount > 0 && (
              <span className="text-[11px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded-md">
                {pendingLentCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('borrowed')}
            className={`transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 py-1 ${
              currentTab === 'borrowed'
                ? 'text-indigo-600 border-b-2 border-indigo-600 font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <span>Me prestaron</span>
            {pendingBorrowedCount > 0 && (
              <span className="text-[11px] font-mono bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded-md">
                {pendingBorrowedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectTab('contacts')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              currentTab === 'contacts'
                ? 'text-amber-600 border-b-2 border-amber-500 font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <span>Personas & Karma</span>
          </button>

          <button
            onClick={() => onSelectTab('stats')}
            className={`transition-colors whitespace-nowrap shrink-0 py-1 ${
              currentTab === 'stats'
                ? 'text-amber-600 border-b-2 border-amber-500 font-bold'
                : 'hover:text-slate-900'
            }`}
          >
            <span>Estadísticas</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenNewLoan}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 active:scale-[0.98] rounded-xl transition-all shadow-md shadow-amber-500/20 whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Prestar / Pedir</span>
          </button>
        </div>
      </div>
    </header>
  );
}
