import React, { useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowUpRight, ArrowDownLeft, Wallet, Search, Edit3 } from 'lucide-react';
import { useBalance } from '../hooks/useBalance';
import { useToast } from '../hooks/useToast';
import TransactionForm from './TransactionForm';
import Toast from './Toast';
import clsx from 'clsx';

export default function TransactionHistory({ activeFundId }) {
  const { allTransactions } = useBalance(activeFundId);
  const transactions = allTransactions?.slice(0, 100);

  const [editingTransaction, setEditingTransaction] = useState(null);
  const { toast, showToast, hideToast } = useToast();

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
          <div
            key={tx.id}
            className="group bg-white p-3.5 rounded-xl border border-slate-100 flex justify-between items-center cursor-pointer hover:border-slate-200 transition-colors"
            onClick={() => setEditingTransaction(tx)}
          >
            <div className="flex items-center gap-3">
              <div className={clsx(
                "p-2 rounded-lg",
                tx.category.includes('Transfer') ? 'bg-teal-50 text-teal-600' :
                  tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
              )}>
                {tx.category.includes('Transfer') ? <Wallet size={16} /> :
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
              <span className={clsx(
                "font-semibold text-sm",
                tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
              )}>
                {tx.type === 'income' ? '+' : '-'}{tx.amount.toLocaleString('id-ID')}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); setEditingTransaction(tx); }}
                className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <Edit3 size={14} />
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

      {/* Edit Modal */}
      {editingTransaction && (
        <TransactionForm
          editData={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSuccess={() => setEditingTransaction(null)}
          activeFundId={activeFundId}
          onShowToast={showToast}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  );
}
