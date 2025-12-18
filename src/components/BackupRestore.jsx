import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { v4 as uuidv4 } from 'uuid';
import { Download, Upload, CheckCircle, AlertTriangle, Database, Tag, Plus, X, ArrowDownLeft, ArrowUpRight, Settings, Moon, Sun, Type, PiggyBank } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import { useSettings } from '../hooks/useSettings';
import TabSwitcher from './ui/TabSwitcher';
import ConfirmDialog from './ui/ConfirmDialog';
import { isErrorMessage } from '../utils/helpers';
import { sortCategoriesWithLainnyaLast } from '../utils/formatters';

export default function BackupRestore() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [newCategory, setNewCategory] = useState('');
  const [categoryType, setCategoryType] = useState('expense');
  const [newFundName, setNewFundName] = useState('');
  const [newFundIcon, setNewFundIcon] = useState('💰');
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, type: '', id: null, name: '' });

  const { settings, toggleDarkMode, setDisplaySize } = useSettings();

  const categories = useLiveQuery(() => db.categories.toArray());
  const funds = useLiveQuery(() => db.funds.toArray());

  // Sort categories with "Lainnya" at the end
  const expenseCategories = sortCategoriesWithLainnyaLast(categories?.filter(c => c.type === 'expense') || []);
  const incomeCategories = sortCategoriesWithLainnyaLast(categories?.filter(c => c.type === 'income') || []);

  const FUND_ICONS = ['💰', '🤝', '💼', '🎯', '🏦', '💳', '🛒', '🏠', '🚗', '✈️', '🎓', '💊'];

  const addCategory = async () => {
    if (!newCategory.trim()) return;
    const exists = categories?.find(c => c.name.toLowerCase() === newCategory.toLowerCase() && c.type === categoryType);
    if (exists) {
      setMessage('Kategori sudah ada!');
      return;
    }
    await db.categories.add({
      uuid: uuidv4(),
      name: newCategory.trim(),
      type: categoryType,
      createdAt: new Date().toISOString()
    });
    setNewCategory('');
    setMessage('Kategori berhasil ditambah!');
  };

  const requestDeleteCategory = (id, name) => {
    if (name === 'Lainnya') {
      setMessage('Kategori "Lainnya" tidak bisa dihapus.');
      return;
    }
    setConfirmDialog({ isOpen: true, type: 'category', id, name });
  };

  const requestDeleteFund = (id, name) => {
    if (name === 'Pribadi') {
      setMessage('Dana "Pribadi" tidak bisa dihapus.');
      return;
    }
    setConfirmDialog({ isOpen: true, type: 'fund', id, name });
  };

  const handleConfirmDelete = async () => {
    const { type, id, name } = confirmDialog;
    if (type === 'category') {
      await db.categories.delete(id);
      setMessage('Kategori dihapus.');
    } else if (type === 'fund') {
      await db.funds.delete(id);
      setMessage('Dana dihapus.');
    }
    setConfirmDialog({ isOpen: false, type: '', id: null, name: '' });
  };

  const addFund = async () => {
    if (!newFundName.trim()) return;
    const exists = funds?.find(f => f.name.toLowerCase() === newFundName.toLowerCase());
    if (exists) {
      setMessage('Dana sudah ada!');
      return;
    }
    await db.funds.add({
      uuid: uuidv4(),
      name: newFundName.trim(),
      icon: newFundIcon,
      color: 'emerald',
      createdAt: new Date().toISOString()
    });
    setNewFundName('');
    setNewFundIcon('💰');
    setMessage('Dana berhasil ditambah!');
  };

  const handleExport = async () => {
    try {
      const wallets = await db.wallets.toArray();
      const transactions = await db.transactions.toArray();
      const cats = await db.categories.toArray();
      const fundsData = await db.funds.toArray();
      const data = { wallets, transactions, categories: cats, funds: fundsData, version: 3, exportedAt: new Date().toISOString() };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_kasflow_${format(new Date(), 'yyyy-MM-dd')}.json`;
      a.click();
      setMessage('Backup berhasil didownload!');
    } catch (e) {
      console.error(e);
      setMessage('Gagal melakukan backup.');
    }
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.wallets || !data.transactions) {
        throw new Error('Format file tidak valid');
      }

      await db.transaction('rw', db.wallets, db.transactions, db.categories, db.funds, async () => {
        let walletsProcessed = 0;
        for (const w of data.wallets) {
          // Check by name (case-insensitive) for replacement
          const existing = await db.wallets.filter(wallet =>
            wallet.name.toLowerCase() === w.name.toLowerCase()
          ).first();

          if (existing) {
            // Update existing wallet, keep original id and uuid
            await db.wallets.update(existing.id, {
              ...w,
              id: existing.id,
              uuid: existing.uuid
            });
          } else {
            // Add new wallet
            delete w.id;
            await db.wallets.add(w);
          }
          walletsProcessed++;
        }

        let txAdded = 0;
        for (const t of data.transactions) {
          const exists = await db.transactions.where('uuid').equals(t.uuid).count();
          if (!exists) {
            delete t.id;
            await db.transactions.add(t);
            txAdded++;
          }
        }

        let catsProcessed = 0;
        if (data.categories) {
          for (const c of data.categories) {
            // Check by name + type for categories
            const existing = await db.categories.filter(cat =>
              cat.name.toLowerCase() === c.name.toLowerCase() && cat.type === c.type
            ).first();

            if (existing) {
              // Update existing category
              await db.categories.update(existing.id, {
                ...c,
                id: existing.id,
                uuid: existing.uuid
              });
            } else {
              // Add new category
              delete c.id;
              await db.categories.add(c);
            }
            catsProcessed++;
          }
        }

        let fundsProcessed = 0;
        if (data.funds) {
          for (const f of data.funds) {
            // Check by name for funds
            const existing = await db.funds.filter(fund =>
              fund.name.toLowerCase() === f.name.toLowerCase()
            ).first();

            if (existing) {
              // Update existing fund
              await db.funds.update(existing.id, {
                ...f,
                id: existing.id,
                uuid: existing.uuid
              });
            } else {
              // Add new fund
              delete f.id;
              await db.funds.add(f);
            }
            fundsProcessed++;
          }
        }

        setMessage(`Restore Berhasil! ${walletsProcessed} dompet, ${txAdded} transaksi baru, ${catsProcessed} kategori, ${fundsProcessed} dana diproses.`);
      });
    } catch (e) {
      console.error(e);
      setMessage('Gagal restore: ' + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-5 space-y-4 pb-24">
      <h2 className="text-lg font-semibold text-slate-800">Pengaturan</h2>

      {/* Tab Switcher */}
      <TabSwitcher
        tabs={[
          { key: 'general', label: 'Umum' },
          { key: 'funds', label: 'Dana' },
          { key: 'categories', label: 'Kategori' },
          { key: 'backup', label: 'Backup' }
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* General Tab */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
              <Settings size={18} />
            </div>
            <div>
              <h3 className="font-medium text-slate-800 text-sm">Pengaturan Umum</h3>
              <p className="text-[11px] text-slate-400">Sesuaikan tampilan aplikasi</p>
            </div>
          </div>

          {/* Dark Mode */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "p-2 rounded-lg transition-colors",
                  settings.darkMode ? "bg-slate-700 text-yellow-400" : "bg-amber-50 text-amber-600"
                )}>
                  {settings.darkMode ? <Moon size={16} /> : <Sun size={16} />}
                </div>
                <div>
                  <h4 className="font-medium text-slate-800 text-sm">Mode Gelap</h4>
                  <p className="text-[11px] text-slate-400">Tampilan nyaman di malam hari</p>
                </div>
              </div>
              <button
                onClick={toggleDarkMode}
                className={clsx(
                  "w-12 h-7 rounded-full p-1 transition-colors",
                  settings.darkMode ? "bg-emerald-500" : "bg-slate-200"
                )}
              >
                <div className={clsx(
                  "w-5 h-5 bg-white rounded-full shadow-sm transition-transform",
                  settings.darkMode && "translate-x-5"
                )} />
              </button>
            </div>
          </div>

          {/* Display Size */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Type size={16} />
              </div>
              <div>
                <h4 className="font-medium text-slate-800 text-sm">Ukuran Tampilan</h4>
                <p className="text-[11px] text-slate-400">Sesuaikan ukuran teks</p>
              </div>
            </div>
            <div className="flex gap-2">
              {[
                { key: 'small', label: 'Kecil', size: 'text-[11px]' },
                { key: 'medium', label: 'Sedang', size: 'text-xs' },
                { key: 'large', label: 'Besar', size: 'text-sm' }
              ].map(({ key, label, size }) => (
                <button
                  key={key}
                  onClick={() => setDisplaySize(key)}
                  className={clsx(
                    "flex-1 py-2.5 rounded-lg font-medium transition-all",
                    size,
                    settings.displaySize === key
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-slate-50 text-slate-500 border border-transparent hover:border-slate-200"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Funds Tab */}
      {activeTab === 'funds' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
              <PiggyBank size={18} />
            </div>
            <div>
              <h3 className="font-medium text-slate-800 text-sm">Kelola Dana</h3>
              <p className="text-[11px] text-slate-400">Pisahkan saldo berdasarkan kepemilikan</p>
            </div>
          </div>

          {/* Add Fund */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl">
            <div className="mb-3">
              <label className="block text-[11px] font-medium text-slate-400 uppercase mb-2">Pilih Ikon</label>
              <div className="flex flex-wrap gap-2">
                {FUND_ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setNewFundIcon(icon)}
                    className={clsx(
                      "w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all",
                      newFundIcon === icon
                        ? "bg-emerald-100 ring-2 ring-emerald-500"
                        : "bg-slate-50 hover:bg-slate-100"
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nama dana baru..."
                value={newFundName}
                onChange={e => setNewFundName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addFund()}
                className="flex-1 p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                onClick={addFund}
                className="p-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Fund List */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <PiggyBank size={14} />
              </div>
              <span className="text-xs font-medium text-slate-600">Daftar Dana ({funds?.length || 0})</span>
            </div>
            <div className="space-y-2">
              {funds?.map(fund => (
                <div key={fund.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{fund.icon}</span>
                    <span className="text-sm font-medium text-slate-700">{fund.name}</span>
                  </div>
                  {fund.name !== 'Pribadi' && (
                    <button
                      onClick={() => requestDeleteFund(fund.id, fund.name)}
                      className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
              <Tag size={18} />
            </div>
            <div>
              <h3 className="font-medium text-slate-800 text-sm">Kelola Kategori</h3>
              <p className="text-[11px] text-slate-400">Tambah atau hapus kategori transaksi</p>
            </div>
          </div>

          {/* Add Category */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => setCategoryType('expense')}
                className={clsx(
                  "flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all",
                  categoryType === 'expense' ? "bg-rose-50 text-rose-600 border border-rose-200" : "bg-slate-50 text-slate-500"
                )}
              >
                <ArrowDownLeft size={14} /> Pengeluaran
              </button>
              <button
                onClick={() => setCategoryType('income')}
                className={clsx(
                  "flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all",
                  categoryType === 'income' ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-slate-50 text-slate-500"
                )}
              >
                <ArrowUpRight size={14} /> Pemasukan
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Nama kategori baru..."
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addCategory()}
                className="flex-1 p-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
              <button
                onClick={addCategory}
                className="p-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          {/* Expense Categories */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
                <ArrowDownLeft size={14} />
              </div>
              <span className="text-xs font-medium text-slate-600">Pengeluaran ({expenseCategories.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {expenseCategories.map(cat => (
                <div key={cat.id} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-lg group">
                  <span className="text-xs text-slate-700">{cat.name}</span>
                  {cat.name !== 'Lainnya' && (
                    <button
                      onClick={() => requestDeleteCategory(cat.id, cat.name)}
                      className="text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Income Categories */}
          <div className="p-4 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                <ArrowUpRight size={14} />
              </div>
              <span className="text-xs font-medium text-slate-600">Pemasukan ({incomeCategories.length})</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {incomeCategories.map(cat => (
                <div key={cat.id} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-lg group">
                  <span className="text-xs text-slate-700">{cat.name}</span>
                  {cat.name !== 'Lainnya' && (
                    <button
                      onClick={() => deleteCategory(cat.id, cat.name)}
                      className="text-slate-300 hover:text-rose-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Backup Tab */}
      {activeTab === 'backup' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-600">
              <Database size={18} />
            </div>
            <div>
              <h3 className="font-medium text-slate-800 text-sm">Backup & Restore</h3>
              <p className="text-[11px] text-slate-400">Simpan dan pulihkan data</p>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 bg-white rounded-lg text-emerald-600">
                <Download size={16} />
              </div>
              <h3 className="font-medium text-emerald-900 text-sm">Backup Data</h3>
            </div>
            <p className="text-xs text-emerald-700 mb-4 leading-relaxed">
              Simpan data keuangan Anda secara aman. Download file backup JSON untuk berjaga-jaga jika ganti perangkat.
            </p>
            <button
              onClick={handleExport}
              className="bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm w-full hover:bg-emerald-700 active:scale-[0.98] transition-all"
            >
              Download Backup
            </button>
          </div>

          <div className="p-4 bg-white border border-slate-200 rounded-xl">
            <div className="flex items-center gap-2.5 mb-2">
              <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                <Upload size={16} />
              </div>
              <h3 className="font-medium text-slate-800 text-sm">Restore Data</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Punya file backup? Upload di sini untuk mengembalikan data Anda. Tenang, data yang ada tidak akan tertimpa (Smart Append).
            </p>
            <div className="relative group">
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                disabled={isLoading}
              />
              <button className="bg-white border-2 border-dashed border-slate-200 text-slate-600 px-4 py-2.5 rounded-lg font-medium text-sm w-full group-hover:bg-slate-50 group-hover:border-slate-300 transition-all flex items-center justify-center gap-2">
                {isLoading ? 'Memproses...' : 'Pilih File Backup (.json)'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Toast */}
      {message && (
        <div className={`p-3 rounded-lg flex items-start gap-2.5 ${isErrorMessage(message) ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
          <div className="mt-0.5">
            {isErrorMessage(message) ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
          </div>
          <span className="text-xs font-medium leading-relaxed">{message}</span>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.type === 'category' ? 'Hapus Kategori?' : 'Hapus Dana?'}
        message={confirmDialog.type === 'category'
          ? `Kategori "${confirmDialog.name}" akan dihapus.`
          : `Dana "${confirmDialog.name}" akan dihapus. Transaksi dengan dana ini akan menjadi "Pribadi".`
        }
        type="danger"
        confirmText="Ya, Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirmDialog({ isOpen: false, type: '', id: null, name: '' })}
      />
    </div>
  );
}
