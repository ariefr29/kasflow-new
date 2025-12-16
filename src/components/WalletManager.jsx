import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, Plus, Wallet, CreditCard, Banknote, ArrowLeft } from 'lucide-react';
import clsx from 'clsx';
import { useBalance } from '../hooks/useBalance';

export default function WalletManager({ onClose }) {
  const { walletBalances, totalBalance } = useBalance();
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('cash');
  const [initialBalance, setInitialBalance] = useState(0);

  const addWallet = async () => {
    if (!newName) return;
    await db.wallets.add({
      uuid: uuidv4(),
      name: newName,
      type: newType,
      initialBalance: parseFloat(initialBalance) || 0,
      createdAt: new Date().toISOString()
    });
    setIsAdding(false);
    setNewName('');
    setInitialBalance(0);
  };

  const deleteWallet = async (id) => {
    if (confirm('Hapus dompet ini? Transaksi terkait tidak akan dihapus tapi mungkin menjadi orphan.')) {
      await db.wallets.delete(id);
    }
  };

  if (isAdding) {
    return (
      <div className="p-5">
        <div className="flex items-center gap-3 mb-5">
           <button onClick={() => setIsAdding(false)} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
             <ArrowLeft size={20} />
           </button>
           <h3 className="text-lg font-semibold text-slate-800">Tambah Dompet</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 uppercase mb-1.5">Nama Dompet</label>
            <input
              className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              placeholder="Contoh: BCA, Dompet Saku"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-[11px] font-medium text-slate-400 uppercase mb-1.5">Tipe</label>
            <div className="grid grid-cols-3 gap-2">
              {['cash', 'bank', 'ewallet'].map(t => (
                <button
                  key={t}
                  onClick={() => setNewType(t)}
                  className={clsx(
                    "p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all",
                    newType === t ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500" : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                  )}
                >
                  {t === 'cash' ? <Banknote size={20} /> : t === 'bank' ? <CreditCard size={20} /> : <Wallet size={20} />}
                  <span className="text-[11px] font-medium capitalize">{t}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 uppercase mb-1.5">Saldo Awal</label>
            <div className="flex items-center gap-2 border border-slate-200 p-3 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 bg-white">
              <span className="font-semibold text-slate-400 text-sm">Rp</span>
              <input
                type="number"
                className="w-full font-semibold text-base outline-none text-slate-800 placeholder-slate-300"
                placeholder="0"
                value={initialBalance}
                onChange={e => setInitialBalance(e.target.value)}
              />
            </div>
          </div>

          <div className="pt-3">
            <button onClick={addWallet} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-slate-800 active:scale-[0.98] transition-all">
              Simpan Dompet
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 pb-24">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Dompet Saya</h2>
      
      {/* Total Balance Summary */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-2xl mb-5">
        <div className="text-xs text-emerald-100 mb-0.5">Total Semua Dompet</div>
        <div className="text-2xl font-bold">Rp {totalBalance.toLocaleString('id-ID')}</div>
      </div>
      
      <div className="space-y-3 mb-6">
        {walletBalances?.map(wallet => (
          <div key={wallet.id} className="bg-white p-4 rounded-xl border border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "p-2.5 rounded-lg",
                  wallet.type === 'bank' ? "bg-sky-50 text-sky-600" : 
                  wallet.type === 'ewallet' ? "bg-teal-50 text-teal-600" : "bg-emerald-50 text-emerald-600"
                )}>
                  {wallet.type === 'bank' ? <CreditCard size={20} /> : 
                   wallet.type === 'ewallet' ? <Wallet size={20} /> : <Banknote size={20} />}
                </div>
                <div>
                  <div className="font-medium text-slate-800 text-sm">{wallet.name}</div>
                  <div className="text-[11px] text-slate-400 capitalize">{wallet.type}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className={clsx("font-semibold text-sm", wallet.balance >= 0 ? "text-slate-800" : "text-rose-600")}>
                    Rp {wallet.balance.toLocaleString('id-ID')}
                  </div>
                  <div className="text-[10px] text-slate-400">Saldo aktual</div>
                </div>
                <button onClick={() => deleteWallet(wallet.id)} className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setIsAdding(true)}
        className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 text-sm font-medium"
      >
        <Plus size={18} /> Tambah Dompet Baru
      </button>
    </div>
  );
}
