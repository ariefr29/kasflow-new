import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import WalletManager from './components/WalletManager';
import TransactionHistory from './components/TransactionHistory';
import BackupRestore from './components/BackupRestore';
import TransactionForm from './components/TransactionForm';
import { useSettings } from './hooks/useSettings';
import { Home, Wallet, History, Settings, Plus } from 'lucide-react';
import clsx from 'clsx';

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Initialize settings (applies dark mode and display size on mount)
  useSettings();

  return (
    <div className="min-h-screen flex justify-center bg-slate-50 font-sans text-slate-900 selection:bg-emerald-100">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col sm:border-x sm:border-slate-200">
        
        {/* Header */}
        <header className="px-5 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-30 flex justify-between items-center border-b border-slate-100">
          <div>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">Kasflow</h1>
            <p className="text-xs text-slate-400">Catat Keuanganmu</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Offline</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 scroll-smooth">
          {activeTab === 'home' && <Dashboard onViewWallets={() => setActiveTab('wallets')} />}
          {activeTab === 'wallets' && <WalletManager onClose={() => setActiveTab('home')} />}
          {activeTab === 'history' && <TransactionHistory />}
          {activeTab === 'settings' && <BackupRestore />}
        </main>

        {/* Bottom Nav */}
        <nav className="bg-white/90 backdrop-blur-lg border-t border-slate-100 px-6 py-2 flex justify-between items-end sticky bottom-0 z-40 pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
          <NavButton 
            active={activeTab === 'home'} 
            onClick={() => setActiveTab('home')} 
            icon={Home} 
            label="Home" 
          />
          
          <NavButton 
            active={activeTab === 'history'} 
            onClick={() => setActiveTab('history')} 
            icon={History} 
            label="Riwayat" 
          />

          {/* FAB Button - Modern & Floating */}
          <div className="-mt-10 relative group">
            <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition duration-300"></div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="relative bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-4 rounded-2xl shadow-xl shadow-emerald-200 hover:shadow-emerald-300 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center border-4 border-white active:scale-95"
            >
              <Plus size={26} strokeWidth={2.5} />
            </button>
          </div>

          <NavButton 
            active={activeTab === 'wallets'} 
            onClick={() => setActiveTab('wallets')} 
            icon={Wallet} 
            label="Dompet" 
          />

          <NavButton 
            active={activeTab === 'settings'} 
            onClick={() => setActiveTab('settings')} 
            icon={Settings} 
            label="Menu" 
          />
        </nav>

        {/* Transaction Modal */}
        {showAddModal && (
          <TransactionForm 
            onClose={() => setShowAddModal(false)} 
            onSuccess={() => {}}
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
