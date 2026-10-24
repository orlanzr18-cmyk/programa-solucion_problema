import { ArrowUpRight, ArrowDownLeft, Users, BarChart3 } from 'lucide-react';

interface MobileBottomNavProps {
  currentTab: 'lent' | 'borrowed' | 'contacts' | 'stats';
  onSelectTab: (tab: 'lent' | 'borrowed' | 'contacts' | 'stats') => void;
  pendingLentCount: number;
  pendingBorrowedCount: number;
}

export function MobileBottomNav({
  currentTab,
  onSelectTab,
  pendingLentCount,
  pendingBorrowedCount,
}: MobileBottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200">
      <div className="grid grid-cols-4 items-center h-16 max-w-lg mx-auto px-2">
        {/* Tab 1 */}
        <button
          type="button"
          onClick={() => onSelectTab('lent')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            currentTab === 'lent' ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <ArrowUpRight className="w-5 h-5" />
            {pendingLentCount > 0 && (
              <span className="absolute -top-1 -right-2.5 w-4 h-4 bg-amber-500 text-slate-950 font-bold text-[9px] rounded-full flex items-center justify-center">
                {pendingLentCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Presté</span>
        </button>

        {/* Tab 2 */}
        <button
          type="button"
          onClick={() => onSelectTab('borrowed')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            currentTab === 'borrowed' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <div className="relative">
            <ArrowDownLeft className="w-5 h-5" />
            {pendingBorrowedCount > 0 && (
              <span className="absolute -top-1 -right-2.5 w-4 h-4 bg-indigo-600 text-white font-bold text-[9px] rounded-full flex items-center justify-center">
                {pendingBorrowedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight mt-1">Me prestaron</span>
        </button>

        {/* Tab 3 */}
        <button
          type="button"
          onClick={() => onSelectTab('contacts')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            currentTab === 'contacts' ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Personas</span>
        </button>

        {/* Tab 4 */}
        <button
          type="button"
          onClick={() => onSelectTab('stats')}
          className={`flex flex-col items-center justify-center h-full min-h-[44px] transition-colors ${
            currentTab === 'stats' ? 'text-amber-600 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px] tracking-tight mt-1">Balance</span>
        </button>
      </div>
    </nav>
  );
}
