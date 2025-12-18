import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { Trash2, Plus, Wallet, CreditCard, Banknote, ArrowLeft, Edit3, Check, X } from 'lucide-react';
import clsx from 'clsx';
import { useBalance } from '../hooks/useBalance';
import { useToast } from '../hooks/useToast';
import { isDuplicateName, getWalletIcon, getWalletIconStyle } from '../utils/helpers';
import { formatNumber } from '../utils/formatters';
import Toast from './Toast';
import ConfirmDialog from './ui/ConfirmDialog';

export default function WalletManager({ onClose }) {
  const { walletBalances, totalBalance } = useBalance();
  const wallets = useLiveQuery(() => db.wallets.toArray());
  const [isAdding, setIsAdding] = useState(false);
  const [editingWallet, setEditingWallet] = useState(null);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState('cash');
  const [initialBalance, setInitialBalance] = useState('');
  const { toast, showToast, hideToast } = useToast();

  // Confirm dialog state
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, wallet: null });

  const resetForm = () => {
    setNewName('');
    setNewType('cash');
    setInitialBalance('');
    setIsAdding(false);
    setEditingWallet(null);
  };

  const addWallet = async () => {
    if (!newName.trim()) {
      showToast('Nama dompet tidak boleh kosong!', 'error');
      return;
    }

    if (isDuplicateName(wallets, newName)) {
      showToast('Dompet dengan nama tersebut sudah ada!', 'error');
      return;
    }

    const parsedBalance = initialBalance ? parseInt(initialBalance.replace(/\./g, ''), 10) : 0;

    await db.wallets.add({
      uuid: uuidv4(),
      name: newName.trim(),
      type: newType,
      initialBalance: parsedBalance,
      createdAt: new Date().toISOString()
    });
    resetForm();
    showToast('Dompet berhasil ditambahkan!', 'success');
  };

  const startEditing = (wallet) => {
    setEditingWallet(wallet);
    setNewName(wallet.name);
    setNewType(wallet.type);
  };

  const saveEdit = async () => {
    if (!newName.trim()) {
      showToast('Nama dompet tidak boleh kosong!', 'error');
      return;
    }

    // Check duplicate name (excluding current wallet)
    const duplicate = wallets?.find(w =>
      w.name.toLowerCase() === newName.trim().toLowerCase() && w.id !== editingWallet.id
    );
    if (duplicate) {
      showToast('Dompet dengan nama tersebut sudah ada!', 'error');
      return;
    }

    await db.wallets.update(editingWallet.id, {
      name: newName.trim(),
      type: newType
    });
    resetForm();
    showToast('Dompet berhasil diubah!', 'success');
  };

  const requestDeleteWallet = (wallet) => {
    // Check if wallet balance is 0
    const walletWithBalance = walletBalances?.find(w => w.id === wallet.id);
    if (walletWithBalance && walletWithBalance.balance !== 0) {
      showToast(`Saldo dompet "${wallet.name}" masih Rp ${formatNumber(Math.abs(walletWithBalance.balance))}. Pindahkan saldo terlebih dahulu sebelum menghapus.`, 'error');
      return;
    }

    setConfirmDialog({
      isOpen: true,
      wallet,
      title: 'Hapus Dompet?',
      message: `Dompet "${wallet.name}" akan dihapus. Transaksi terkait tidak akan dihapus tapi mungkin menjadi orphan.`
    });
  };

  const confirmDeleteWallet = async () => {
    if (confirmDialog.wallet) {
      await db.wallets.delete(confirmDialog.wallet.id);
      showToast('Dompet berhasil dihapus', 'error');
    }
    setConfirmDialog({ isOpen: false, wallet: null });
  };

  const handleBalanceInput = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    setInitialBalance(formatNumber(value));
  };

  const WalletTypeButton = ({ type, label }) => {
    const Icon = getWalletIcon(type);
    return (
      <button
        onClick={() => setNewType(type)}
        className={clsx(
          "p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all",
          newType === type
            ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-500"
            : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
        )}
      >
        <Icon size={20} />
        <span className="text-[11px] font-medium capitalize">{label}</span>
      </button>
    );
  };

  // Add New Wallet Form
  if (isAdding) {
    return (
      <div className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={resetForm} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
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
              <WalletTypeButton type="cash" label="Cash" />
              <WalletTypeButton type="bank" label="Bank" />
              <WalletTypeButton type="ewallet" label="E-Wallet" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 uppercase mb-1.5">Saldo Awal</label>
            <div className="flex items-center gap-2 border border-slate-200 p-3 rounded-xl focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-500 bg-white">
              <span className="font-semibold text-slate-400 text-sm">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                className="w-full font-semibold text-base outline-none text-slate-800 placeholder-slate-300"
                placeholder="0"
                value={initialBalance}
                onChange={handleBalanceInput}
              />
            </div>
          </div>

          <div className="pt-3">
            <button onClick={addWallet} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-slate-800 active:scale-[0.98] transition-all">
              Simpan Dompet
            </button>
          </div>
        </div>

        {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      </div>
    );
  }

  // Edit Wallet Form
  if (editingWallet) {
    return (
      <div className="p-5">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={resetForm} className="p-2 -ml-2 text-slate-400 hover:text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <h3 className="text-lg font-semibold text-slate-800">Edit Dompet</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-medium text-slate-400 uppercase mb-1.5">Nama Dompet</label>
            <input
              className="w-full p-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none"
              placeholder="Nama dompet"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 uppercase mb-1.5">Tipe</label>
            <div className="grid grid-cols-3 gap-2">
              <WalletTypeButton type="cash" label="Cash" />
              <WalletTypeButton type="bank" label="Bank" />
              <WalletTypeButton type="ewallet" label="E-Wallet" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-400 uppercase mb-1.5">Saldo Saat Ini</label>
            <div className="flex items-center gap-2 border border-slate-200 p-3 rounded-xl bg-slate-50">
              <span className="font-semibold text-slate-400 text-sm">Rp</span>
              <span className="font-semibold text-base text-slate-500">
                {formatNumber(walletBalances?.find(w => w.id === editingWallet.id)?.balance || 0)}
              </span>
              <span className="text-xs text-slate-400 ml-auto">Tidak bisa diedit</span>
            </div>
          </div>

          <div className="pt-3">
            <button onClick={saveEdit} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-slate-800 active:scale-[0.98] transition-all">
              Simpan Perubahan
            </button>
          </div>
        </div>

        {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
      </div>
    );
  }

  return (
    <div className="p-5 pb-24">
      <h2 className="text-lg font-semibold text-slate-800 mb-4">Dompet Saya</h2>

      {/* Total Balance Summary */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-4 rounded-2xl mb-5">
        <div className="text-xs text-emerald-100 mb-0.5">Total Semua Dompet</div>
        <div className="text-2xl font-bold">Rp {formatNumber(totalBalance)}</div>
      </div>

      <div className="space-y-3 mb-6">
        {walletBalances?.map(wallet => {
          const Icon = getWalletIcon(wallet.type);
          return (
            <div
              key={wallet.id}
              className="bg-white p-4 rounded-xl border border-slate-100 cursor-pointer hover:border-slate-200 transition-colors"
              onClick={() => startEditing(wallet)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={clsx("p-2.5 rounded-lg", getWalletIconStyle(wallet.type))}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <div className="font-medium text-slate-800 text-sm">{wallet.name}</div>
                    <div className="text-[11px] text-slate-400 capitalize">{wallet.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <div className={clsx("font-semibold text-sm", wallet.balance >= 0 ? "text-slate-800" : "text-rose-600")}>
                      Rp {formatNumber(wallet.balance)}
                    </div>
                    <div className="text-[10px] text-slate-400">Saldo aktual</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); startEditing(wallet); }}
                    className="p-1.5 text-slate-300 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); requestDeleteWallet(wallet); }}
                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => setIsAdding(true)}
        className="w-full py-3 border-2 border-dashed border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2 text-sm font-medium"
      >
        <Plus size={18} /> Tambah Dompet Baru
      </button>

      {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        type="danger"
        confirmText="Ya, Hapus"
        onConfirm={confirmDeleteWallet}
        onCancel={() => setConfirmDialog({ isOpen: false, wallet: null })}
      />
    </div>
  );
}
