import React from 'react';
import { db } from '../db';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownLeft, Trash2, Wallet, Search } from 'lucide-react';
import { useBalance } from '../hooks/useBalance';

export default function TransactionHistory({ activeFundId }) {
  const { allTransactions } = useBalance(activeFundId);
  const transactions = allTransactions?.slice(0, 100);

  const deleteTransaction = async (tx) => {
    if (!confirm('Hapus transaksi ini?')) return;
    
    if (tx.transferId) {
      if (confirm('Ini adalah bagian dari transfer. Hapus kedua sisi transaksi?')) {
        const related = await db.transactions.where({ transferId: tx.transferId }).toArray();
        await db.transactions.bulkDelete(related.map(t => t.id));
        return;
      }
    }
    await db.transactions.delete(tx.id);
  };

  return (
    <div className="p-5 pb-24 space-y-4">
      <div className="flex items-center justify-between">
         <h2 className="text-lg font-semibold text-slate-800">Riwayat</h2>
         <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-400">
           <Search size={18} />
         </div>
      </div>
      
      <div className="space-y-2">
        {transactions?.map(tx => (
          <div key={tx.id} className="group bg-white p-3.5 rounded-xl border border-slate-100 flex justify-between items-center">
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
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1 flex-wrap">
                  <span className="px-1.5 py-0.5 bg-slate-50 rounded text-slate-500">{tx.walletName}</span>
                  <span className="px-1.5 py-0.5 bg-emerald-50 rounded text-emerald-600">{tx.fundIcon} {tx.fundName}</span>
                  <span>•</span>
                  <span>{format(new Date(tx.date), 'dd MMM yyyy', { locale: id })}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-semibold text-sm ${
                tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('id-ID')}
              </span>
              <button onClick={() => deleteTransaction(tx)} className="text-slate-200 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        
        {transactions?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-300">
            <div className="p-3 bg-slate-50 rounded-full mb-3">
              <Search size={24} />
            </div>
            <p className="text-sm">Belum ada transaksi.</p>
          </div>
        )}
      </div>
    </div>
  );
}
