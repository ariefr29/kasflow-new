import React, { useRef, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import WalletManager from './components/WalletManager';
import TransactionHistory from './components/TransactionHistory';
import BackupRestore from './components/BackupRestore';
import TransactionForm from './components/TransactionForm';
import InstallPrompt from './components/InstallPrompt';
import Toast from './components/Toast';
import { useSettings } from './hooks/useSettings';
import { useBalance } from './hooks/useBalance';
import { useToast } from './hooks/useToast';
import { formatCurrency } from './utils/helpers';
import { Home, Wallet, History, Settings, Plus, ChevronDown, Globe } from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFundDropdown, setShowFundDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Custom hooks
  const { activeFundId, setActiveFundId } = useSettings();
  const { funds, fundBalances, totalBalance } = useBalance();
  const { toast, showToast, hideToast } = useToast();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowFundDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get active fund info
  const activeFund = activeFundId ? funds?.find(f => f.uuid === activeFundId) : null;

  return (
    <div className="min-h-screen flex justify-center bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col sm:border-x sm:border-slate-200">

        {/* Header */}
        <header className="px-5 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex justify-between items-center border-b border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Kasflow</h1>
            <p className="text-xs text-slate-400">Catat Keuangan Mudah</p>
          </div>

          {/* Dana Switcher */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowFundDropdown(!showFundDropdown)}
              className="flex items-center gap-2 px-3 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200"
            >
              <span className="text-base">{activeFund?.icon || '🌐'}</span>
              <span className="text-sm font-medium text-slate-700 max-w-[80px] truncate">
                {activeFund?.name || 'Semua Dana'}
              </span>
              <ChevronDown size={14} className={clsx("text-slate-400 transition-transform", showFundDropdown && "rotate-180")} />
            </button>

            {/* Dropdown Menu */}
            {showFundDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 overflow-hidden">
                <button
                  onClick={() => { setActiveFundId(null); setShowFundDropdown(false); }}
                  className={clsx(
                    "w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors",
                    !activeFundId && "bg-emerald-50"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <Globe size={18} className="text-slate-500" />
                    <span className="font-medium text-slate-700">Semua Dana</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    {formatCurrency(totalBalance)}
                  </span>
                </button>

                <div className="border-t border-slate-100 my-1"></div>

                {fundBalances?.map(fund => (
                  <button
                    key={fund.uuid}
                    onClick={() => { setActiveFundId(fund.uuid); setShowFundDropdown(false); }}
                    className={clsx(
                      "w-full px-4 py-2.5 flex items-center justify-between hover:bg-slate-50 transition-colors",
                      activeFundId === fund.uuid && "bg-emerald-50"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-base">{fund.icon}</span>
                      <span className="font-medium text-slate-700">{fund.name}</span>
                    </div>
                    <span className={clsx(
                      "text-xs font-semibold",
                      fund.balance >= 0 ? "text-slate-500" : "text-rose-500"
                    )}>
                      {formatCurrency(fund.balance)}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 scroll-smooth">
          {activeTab === 'home' && <Dashboard onViewWallets={() => setActiveTab('wallets')} activeFundId={activeFundId} />}
          {activeTab === 'wallets' && <WalletManager onClose={() => setActiveTab('home')} />}
          {activeTab === 'history' && <TransactionHistory activeFundId={activeFundId} />}
          {activeTab === 'settings' && <BackupRestore />}
        </main>

        {/* Bottom Nav */}
        <nav className="bg-white/90 backdrop-blur-lg border-t border-slate-100 px-6 py-2 flex justify-between items-end sticky bottom-0 z-40 pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
          <NavButton active={activeTab === 'home'} onClick={() => setActiveTab('home')} icon={Home} label="Home" />
          <NavButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} icon={History} label="Riwayat" />

          {/* FAB Button */}
          <div className="-mt-10 relative group">
            <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
            <button
              onClick={() => setShowAddModal(true)}
              className="relative bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 rounded-2xl shadow-xl shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center border-4 border-white active:scale-95"
            >
              <Plus size={26} strokeWidth={2.5} />
            </button>
          </div>

          <NavButton active={activeTab === 'wallets'} onClick={() => setActiveTab('wallets')} icon={Wallet} label="Dompet" />
          <NavButton active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} icon={Settings} label="Menu" />
        </nav>

        {/* Transaction Modal */}
        {showAddModal && (
          <TransactionForm
            onClose={() => setShowAddModal(false)}
            onSuccess={() => { }}
            activeFundId={activeFundId}
            onShowToast={showToast}
          />
        )}

        {/* PWA Install Prompt */}
        <InstallPrompt />

        {/* Toast Notification */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        )}
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200",
        active ? "text-emerald-600" : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
      )}
    >
      <Icon size={22} strokeWidth={active ? 2.5 : 2} className={clsx("transition-transform duration-200", active && "scale-110")} />
      <span className={clsx("text-[10px] font-medium", active ? "opacity-100" : "opacity-0 h-0 w-0 overflow-hidden")}>
        {label}
      </span>
    </button>
  );
}

export default App;
