import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { X, Check, ArrowRightLeft, Calendar as CalendarIcon, FileText, Trash2 } from 'lucide-react';
import clsx from 'clsx';

export default function TransactionForm({ onClose, onSuccess, activeFundId, editData, onShowToast }) {
  const wallets = useLiveQuery(() => db.wallets.toArray());
  const categories = useLiveQuery(() => db.categories.toArray());
  const funds = useLiveQuery(() => db.funds.toArray());

  const expenseCategories = categories?.filter(c => c.type === 'expense').map(c => c.name) || DEFAULT_EXPENSE_CATEGORIES;
  const incomeCategories = categories?.filter(c => c.type === 'income').map(c => c.name) || DEFAULT_INCOME_CATEGORIES;

  // Determine if this is a transfer based on editData
  const isEditingTransfer = editData?.transferId && (editData?.category === 'Transfer Out' || editData?.category === 'Transfer In');

  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [walletId, setWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [fundId, setFundId] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Populate form when editing
  useEffect(() => {
    if (editData) {
      setAmount(editData.amount?.toString() || '');
      setWalletId(editData.walletId || '');
      setFundId(editData.fundId || '');
      setDate(editData.date || format(new Date(), 'yyyy-MM-dd'));
      setNote(editData.note || '');

      if (isEditingTransfer) {
        setType('transfer');
        // For transfer, we need to find the other side to get toWalletId
        if (editData.category === 'Transfer Out') {
          // Find the Transfer In transaction with same transferId
          db.transactions.where('transferId').equals(editData.transferId).toArray().then(txs => {
            const inTx = txs.find(t => t.category === 'Transfer In');
            if (inTx) setToWalletId(inTx.walletId);
          });
        } else {
          // This is Transfer In, the current wallet is destination
          db.transactions.where('transferId').equals(editData.transferId).toArray().then(txs => {
            const outTx = txs.find(t => t.category === 'Transfer Out');
            if (outTx) {
              setWalletId(outTx.walletId);
              setToWalletId(editData.walletId);
            }
          });
        }
      } else {
        setType(editData.type || 'expense');
        setCategory(editData.category || '');
      }
    }
  }, [editData, isEditingTransfer]);

  // Auto select first wallet and default fund
  useEffect(() => {
    if (wallets?.length && !walletId && !editData) {
      setWalletId(wallets[0].uuid);
    }
  }, [wallets, editData]);

  useEffect(() => {
    if (funds?.length && !fundId && !editData) {
      if (activeFundId) {
        setFundId(activeFundId);
      } else {
        const defaultFund = funds.find(f => f.name === 'Pribadi') || funds[0];
        setFundId(defaultFund?.uuid || '');
      }
    }
  }, [funds, activeFundId, editData]);

  const getSuccessMessage = (txType) => {
    if (txType === 'transfer') return 'Berhasil mencatat transfer dana';
    if (txType === 'income') return 'Berhasil mencatat pemasukan';
    return 'Berhasil mencatat pengeluaran';
  };

  const handleSubmit = async () => {
    if (!amount || !walletId) return;
    const numAmount = parseFloat(amount);

    try {
      if (editData) {
        // UPDATE MODE
        if (type === 'transfer' && isEditingTransfer) {
          // Update both sides of the transfer
          const relatedTxs = await db.transactions.where('transferId').equals(editData.transferId).toArray();

          for (const tx of relatedTxs) {
            if (tx.category === 'Transfer Out') {
              await db.transactions.update(tx.id, {
                walletId,
                amount: numAmount,
                date,
                note: `Transfer ke ${wallets.find(w => w.uuid === toWalletId)?.name}`,
                fundId
              });
            } else {
              await db.transactions.update(tx.id, {
                walletId: toWalletId,
                amount: numAmount,
                date,
                note: `Transfer dari ${wallets.find(w => w.uuid === walletId)?.name}`,
                fundId
              });
            }
          }
          onShowToast?.('Berhasil mengubah transfer dana');
        } else {
          // Update regular transaction
          await db.transactions.update(editData.id, {
            walletId,
            type,
            category: category || 'Lainnya',
            amount: numAmount,
            date,
            note,
            fundId
          });
          onShowToast?.(type === 'income' ? 'Berhasil mengubah pemasukan' : 'Berhasil mengubah pengeluaran');
        }
      } else {
        // CREATE MODE
        if (type === 'transfer') {
          if (!toWalletId || walletId === toWalletId) {
            alert('Pilih dompet tujuan yang berbeda.');
            return;
          }

          const transferId = uuidv4();
          await db.transactions.add({
            uuid: uuidv4(),
            walletId,
            type: 'expense',
            category: 'Transfer Out',
            amount: numAmount,
            date,
            note: `Transfer ke ${wallets.find(w => w.uuid === toWalletId)?.name}`,
            transferId,
            fundId,
            createdAt: new Date().toISOString()
          });
          await db.transactions.add({
            uuid: uuidv4(),
            walletId: toWalletId,
            type: 'income',
            category: 'Transfer In',
            amount: numAmount,
            date,
            note: `Transfer dari ${wallets.find(w => w.uuid === walletId)?.name}`,
            transferId,
            fundId,
            createdAt: new Date().toISOString()
          });
        } else {
          await db.transactions.add({
            uuid: uuidv4(),
            walletId,
            type,
            category: category || 'Lainnya',
            amount: numAmount,
            date,
            note,
            fundId,
            createdAt: new Date().toISOString()
          });
        }
        onShowToast?.(getSuccessMessage(type));
      }

      onSuccess?.();
      onClose();
    } catch (e) {
      console.error(e);
      alert('Gagal menyimpan transaksi');
    }
  };

  const handleDelete = async () => {
    if (!editData) return;

    setIsDeleting(true);
    try {
      if (editData.transferId) {
        // Delete both sides of transfer
        const relatedTxs = await db.transactions.where('transferId').equals(editData.transferId).toArray();
        await db.transactions.bulkDelete(relatedTxs.map(t => t.id));
        onShowToast?.('Transfer dana berhasil dihapus');
      } else {
        await db.transactions.delete(editData.id);
        onShowToast?.(editData.type === 'income' ? 'Pemasukan berhasil dihapus' : 'Pengeluaran berhasil dihapus');
      }
      onSuccess?.();
      onClose();
    } catch (e) {
      console.error(e);
      alert('Gagal menghapus transaksi');
    } finally {
      setIsDeleting(false);
    }
  };

  const isEditMode = !!editData;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity">
      <div className="bg-white w-full max-w-md h-[92vh] sm:h-auto sm:rounded-2xl flex flex-col shadow-2xl rounded-t-2xl overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-slate-800">
            {isEditMode ? 'Edit Transaksi' : 'Catat Transaksi'}
          </h2>
          <button onClick={onClose} className="p-1.5 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"><X size={18} className="text-slate-600" /></button>
        </div>

        {/* Tabs - Disable type switching in edit mode */}
        <div className="px-5 pt-4 bg-white">
          <div className="flex p-1 gap-1 bg-slate-100 rounded-xl">
            {['expense', 'income', 'transfer'].map(t => (
              <button
                key={t}
                onClick={() => !isEditMode && setType(t)}
                disabled={isEditMode}
                className={clsx(
                  "flex-1 py-2 rounded-lg font-medium text-xs capitalize transition-all duration-200",
                  type === t ?
                    "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                  isEditMode && "cursor-not-allowed opacity-60"
                )}
              >
                {t === 'expense' ? 'Pengeluaran' : t === 'income' ? 'Pemasukan' : 'Transfer'}
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="px-5 py-5 flex-1 overflow-y-auto space-y-5">
          {/* Amount */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 focus-within:ring-2 focus-within:ring-emerald-100 transition-shadow">
            <label className="block text-[11px] font-medium text-slate-400 uppercase mb-1">Nominal</label>
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold text-slate-400">Rp</span>
              <input
                type="number"
                className="text-2xl font-bold w-full bg-transparent outline-none text-slate-800 placeholder-slate-300"
                placeholder="0"
                autoFocus={!isEditMode}
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>
          </div>

          {/* Wallet Selection */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-[11px] font-medium text-slate-400 uppercase mb-1.5">
                {type === 'transfer' ? 'Dari' : 'Dompet'}
              </label>
              <div className="relative">
                <select
                  className="w-full p-2.5 pl-3 pr-8 bg-white border border-slate-200 rounded-lg appearance-none text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  value={walletId}
                  onChange={e => setWalletId(e.target.value)}
                >
                  {wallets?.map(w => <option key={w.uuid} value={w.uuid}>{w.name}</option>)}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
              </div>
            </div>

            {type === 'transfer' && (
              <div className="flex items-center pt-5 text-teal-500">
                <ArrowRightLeft size={20} />
              </div>
            )}

            {type === 'transfer' && (
              <div className="flex-1">
                <label className="block text-[11px] font-medium text-slate-400 uppercase mb-1.5">Ke</label>
                <div className="relative">
                  <select
                    className="w-full p-2.5 pl-3 pr-8 bg-white border border-slate-200 rounded-lg appearance-none text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    value={toWalletId}
                    onChange={e => setToWalletId(e.target.value)}
                  >
                    <option value="">Pilih...</option>
                    {wallets?.filter(w => w.uuid !== walletId).map(w => <option key={w.uuid} value={w.uuid}>{w.name}</option>)}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Fund Selection - Only show if no activeFundId (Semua Dana mode) */}
          {!activeFundId ? (
            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase mb-2">Dana</label>
              <div className="flex flex-wrap gap-2">
                {funds?.map(f => (
                  <button
                    key={f.uuid}
                    onClick={() => setFundId(f.uuid)}
                    className={clsx(
                      "px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 flex items-center gap-1.5",
                      fundId === f.uuid
                        ? "bg-slate-800 text-white border-slate-800"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                    )}
                  >
                    <span>{f.icon}</span>
                    <span>{f.name}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase mb-2">Dana Aktif</label>
              <div className="flex items-center gap-2 px-3 py-2 bg-emerald-50 rounded-lg border border-emerald-200">
                <span className="text-base">{funds?.find(f => f.uuid === activeFundId)?.icon}</span>
                <span className="text-sm font-medium text-emerald-700">{funds?.find(f => f.uuid === activeFundId)?.name}</span>
                <span className="text-xs text-emerald-500 ml-auto">Otomatis</span>
              </div>
            </div>
          )}

          {/* Categories (Not for Transfer) */}
          {type !== 'transfer' && (
            <div>
              <label className="block text-[11px] font-medium text-slate-400 uppercase mb-2">Kategori</label>
              <div className="grid grid-cols-3 gap-2">
                {(type === 'expense' ? expenseCategories : incomeCategories).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={clsx(
                      "p-2 rounded-lg text-xs font-medium border transition-all duration-200",
                      category === cat ?
                        (type === 'expense' ? "bg-rose-50 text-rose-600 border-rose-200" : "bg-emerald-50 text-emerald-600 border-emerald-200")
                        : "bg-white text-slate-500 border-slate-100 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date & Note */}
          <div>
            <label className="block text-[11px] font-medium text-slate-400 uppercase mb-1.5">Tanggal & Catatan</label>
            <div className="flex gap-2">
              <div className="w-1/3 relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><CalendarIcon size={14} /></div>
                <input
                  type="date"
                  className="w-full p-2.5 pl-8 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>
              <div className="flex-1 relative">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><FileText size={14} /></div>
                <input
                  type="text"
                  className="w-full p-2.5 pl-8 border border-slate-200 rounded-lg text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  placeholder="Catatan opsional..."
                  value={note}
                  onChange={e => setNote(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 space-y-2">
          <button
            onClick={handleSubmit}
            disabled={!amount || !walletId}
            className="w-full bg-slate-900 dark:bg-slate-800/75 disabled:bg-slate-300 dark:disabled:bg-slate-400 text-white py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 active:scale-[0.98] transition-all"
          >
            <Check size={18} strokeWidth={2.5} /> {isEditMode ? 'Simpan Perubahan' : 'Simpan Transaksi'}
          </button>

          {isEditMode && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full bg-white border border-rose-200 text-rose-600 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:bg-rose-50 active:scale-[0.98] transition-all"
            >
              <Trash2 size={16} /> {isDeleting ? 'Menghapus...' : 'Hapus Transaksi'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
