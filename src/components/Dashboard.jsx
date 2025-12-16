import React from 'react';
import { useBalance } from '../hooks/useBalance';
import { ArrowUpRight, ArrowDownLeft, Wallet, TrendingUp, Calendar, CreditCard, Banknote, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import clsx from 'clsx';

export default function Dashboard({ onAddTransaction, onViewWallets, activeFundId }) {
  const { totalBalance, filteredBalance, walletBalances, activeFund, incomeThisMonth, expenseThisMonth, recentTransactions } = useBalance(activeFundId);

  return (
    <div className="p-5 space-y-5 pb-24">
      {/* Total Balance Card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-2xl shadow-lg shadow-emerald-200/50">
        <div className="absolute top-0 right-0 -mr-4 -mt-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-4 -mb-4 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-1.5 text-emerald-100 text-xs mb-1">
            {activeFund ? (
              <>
                <span>{activeFund.icon}</span>
                <span>Saldo {activeFund.name}</span>
              </>
            ) : (
              <>
                <Wallet size={14} />
                <span>Total Saldo</span>
              </>
            )}
          </div>
          <div className="text-3xl font-bold tracking-tight mb-3">
            <span className="text-lg opacity-80 mr-0.5">Rp</span>
            {filteredBalance.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] bg-white/20 w-fit px-2.5 py-1 rounded-full">
             <Calendar size={11} />
             <span>{format(new Date(), 'EEEE, dd MMM yyyy', { locale: id })}</span>
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <ArrowUpRight size={18} />
            </div>
            <span className="text-[11px] font-medium text-slate-400 uppercase">Masuk</span>
          </div>
          <div className="text-base font-semibold text-slate-800">Rp {incomeThisMonth.toLocaleString('id-ID')}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 group hover:border-rose-200 transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <ArrowDownLeft size={18} />
            </div>
            <span className="text-[11px] font-medium text-slate-400 uppercase">Keluar</span>
          </div>
          <div className="text-base font-semibold text-slate-800">Rp {expenseThisMonth.toLocaleString('id-ID')}</div>
        </div>
      </div>

      {/* Wallet Balances */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
            <Wallet size={16} className="text-emerald-500" />
            Saldo Dompet
          </h3>
          <button onClick={onViewWallets} className="text-xs font-medium text-emerald-600 flex items-center gap-0.5 hover:text-emerald-700">
            Kelola <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="space-y-2">
          {walletBalances?.slice(0, 3).map(wallet => (
            <div key={wallet.id} className="bg-white p-3.5 rounded-xl border border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "p-2 rounded-lg",
                  wallet.type === 'bank' ? "bg-sky-50 text-sky-600" : 
                  wallet.type === 'ewallet' ? "bg-teal-50 text-teal-600" : "bg-emerald-50 text-emerald-600"
                )}>
                  {wallet.type === 'bank' ? <CreditCard size={16} /> : 
                   wallet.type === 'ewallet' ? <Wallet size={16} /> : <Banknote size={16} />}
                </div>
                <span className="font-medium text-slate-700 text-sm">{wallet.name}</span>
              </div>
              <span className={clsx("font-semibold text-sm", wallet.balance >= 0 ? "text-slate-800" : "text-rose-600")}>
                Rp {wallet.balance.toLocaleString('id-ID')}
              </span>
            </div>
          ))}
          {walletBalances?.length > 3 && (
            <button onClick={onViewWallets} className="w-full text-center text-xs text-slate-400 hover:text-emerald-600 py-2">
              +{walletBalances.length - 3} dompet lainnya
            </button>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-3">
           <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
             <TrendingUp size={16} className="text-emerald-500" />
             Transaksi Terakhir
           </h3>
        </div>
        
        <div className="space-y-2">
          {recentTransactions.length === 0 ? (
            <div className="text-center text-slate-400 py-10 bg-white rounded-xl border border-dashed border-slate-200">
              <p className="text-sm">Belum ada transaksi</p>
            </div>
          ) : (
            recentTransactions.map(tx => (
              <div key={tx.id} className="bg-white p-3.5 rounded-xl border border-slate-100 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    tx.category.includes('Transfer') ? 'bg-teal-50 text-teal-600' :
                    tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  }`}>
                    {tx.category.includes('Transfer') ? <Wallet size={16}/> : 
                     tx.type === 'income' ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 text-sm">{tx.category}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <span className="px-1.5 py-0.5 bg-slate-50 rounded text-slate-500">{tx.walletName}</span>
                      <span>•</span>
                      <span>{format(new Date(tx.date), 'dd MMM', { locale: id })}</span>
                    </div>
                  </div>
                </div>
                <span className={`font-semibold text-sm ${
                  tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                }`}>
                  {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('id-ID')}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
