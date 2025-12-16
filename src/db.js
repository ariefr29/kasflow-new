import Dexie from 'dexie';
import { v4 as uuidv4 } from 'uuid';

export const db = new Dexie('kasflow_db');

// Default categories
export const DEFAULT_EXPENSE_CATEGORIES = ['Makan', 'Belanja', 'Transport', 'Tagihan', 'Kesehatan', 'Hiburan', 'Lainnya'];
export const DEFAULT_INCOME_CATEGORIES = ['Gaji', 'Usaha', 'Investasi', 'Hadiah', 'Lainnya'];

// Default funds
export const DEFAULT_FUNDS = [
  { name: 'Pribadi', icon: '💰', color: 'emerald' },
  { name: 'Titipan', icon: '🤝', color: 'sky' },
  { name: 'Usaha', icon: '💼', color: 'amber' },
  { name: 'Tabungan', icon: '🎯', color: 'violet' }
];

db.version(1).stores({
  wallets: '++id, &uuid, name, type',
  transactions: '++id, &uuid, walletId, type, category, date, transferId'
});

db.version(2).stores({
  wallets: '++id, &uuid, name, type',
  transactions: '++id, &uuid, walletId, type, category, date, transferId',
  categories: '++id, &uuid, name, type'
});

db.version(3).stores({
  wallets: '++id, &uuid, name, type',
  transactions: '++id, &uuid, walletId, type, category, date, transferId, fundId',
  categories: '++id, &uuid, name, type',
  funds: '++id, &uuid, name, icon, color'
});

db.on('populate', async () => {
  await db.wallets.add({
    uuid: uuidv4(),
    name: 'Dompet Tunai',
    type: 'cash',
    initialBalance: 0,
    createdAt: new Date().toISOString()
  });

  // Add default expense categories
  for (const cat of DEFAULT_EXPENSE_CATEGORIES) {
    await db.categories.add({
      uuid: uuidv4(),
      name: cat,
      type: 'expense',
      createdAt: new Date().toISOString()
    });
  }

  // Add default income categories
  for (const cat of DEFAULT_INCOME_CATEGORIES) {
    await db.categories.add({
      uuid: uuidv4(),
      name: cat,
      type: 'income',
      createdAt: new Date().toISOString()
    });
  }

  // Add default funds
  for (const fund of DEFAULT_FUNDS) {
    await db.funds.add({
      uuid: uuidv4(),
      name: fund.name,
      icon: fund.icon,
      color: fund.color,
      createdAt: new Date().toISOString()
    });
  }
});

// Migration: Add defaults for existing users
db.on('ready', async () => {
  // Add default categories if empty
  const catCount = await db.categories.count();
  if (catCount === 0) {
    for (const cat of DEFAULT_EXPENSE_CATEGORIES) {
      await db.categories.add({
        uuid: uuidv4(),
        name: cat,
        type: 'expense',
        createdAt: new Date().toISOString()
      });
    }
    for (const cat of DEFAULT_INCOME_CATEGORIES) {
      await db.categories.add({
        uuid: uuidv4(),
        name: cat,
        type: 'income',
        createdAt: new Date().toISOString()
      });
    }
  }

  // Add default funds if empty
  const fundCount = await db.funds.count();
  if (fundCount === 0) {
    for (const fund of DEFAULT_FUNDS) {
      await db.funds.add({
        uuid: uuidv4(),
        name: fund.name,
        icon: fund.icon,
        color: fund.color,
        createdAt: new Date().toISOString()
      });
    }
  }
});

export default db;
