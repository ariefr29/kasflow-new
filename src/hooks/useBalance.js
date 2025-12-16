import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";

export function useBalance(activeFundId = null) {
  const wallets = useLiveQuery(() => db.wallets.toArray());
  const transactions = useLiveQuery(() => db.transactions.toArray());
  const funds = useLiveQuery(() => db.funds.toArray());

  // Create wallet map for quick lookup
  const walletMap = wallets?.reduce((acc, w) => {
    acc[w.uuid] = w;
    return acc;
  }, {}) || {};

  // Create fund map for quick lookup
  const fundMap = funds?.reduce((acc, f) => {
    acc[f.uuid] = f;
    return acc;
  }, {}) || {};

  // Get default fund (Pribadi) for transactions without fundId
  const defaultFund = funds?.find(f => f.name === 'Pribadi');

  const walletBalances = wallets?.map(w => {
    const txs = transactions?.filter(t => t.walletId === w.uuid) || [];
    const income = txs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return {
      ...w,
      balance: w.initialBalance + income - expense
    };
  }) || [];

  const totalBalance = walletBalances.reduce((acc, w) => acc + w.balance, 0);

  // Calculate balance per fund
  const fundBalances = funds?.map(f => {
    const txs = transactions?.filter(t => {
      const txFundId = t.fundId || defaultFund?.uuid;
      return txFundId === f.uuid;
    }) || [];
    
    // Calculate from all wallets' initial balances that use this fund (for Pribadi only as default)
    let initialBalance = 0;
    if (f.name === 'Pribadi' && defaultFund?.uuid === f.uuid) {
      // Add initial balances from wallets for "Pribadi" fund (existing money before tracking)
      initialBalance = wallets?.reduce((acc, w) => acc + (w.initialBalance || 0), 0) || 0;
    }
    
    const income = txs.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = txs.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    
    return {
      ...f,
      balance: initialBalance + income - expense
    };
  }) || [];

  // Filter transactions by activeFundId if specified
  const filteredTransactions = activeFundId 
    ? transactions?.filter(t => {
        const txFundId = t.fundId || defaultFund?.uuid;
        return txFundId === activeFundId;
      })
    : transactions;

  // Calculate filtered balance (for specific fund view)
  const filteredBalance = activeFundId
    ? (() => {
        const activeFund = fundBalances?.find(f => f.uuid === activeFundId);
        return activeFund?.balance || 0;
      })()
    : totalBalance;

  // Monthly stats (filtered by activeFundId)
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthTransactions = filteredTransactions?.filter(t => {
    const d = new Date(t.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }) || [];

  const incomeThisMonth = thisMonthTransactions
    .filter(t => t.type === 'income' && t.category !== 'Transfer In')
    .reduce((acc, t) => acc + t.amount, 0);

  const expenseThisMonth = thisMonthTransactions
    .filter(t => t.type === 'expense' && t.category !== 'Transfer Out')
    .reduce((acc, t) => acc + t.amount, 0);

  // Enrich transactions with wallet and fund info (filtered)
  const enrichedTransactions = filteredTransactions?.map(t => {
    const txFundId = t.fundId || defaultFund?.uuid;
    const fund = fundMap[txFundId];
    return {
      ...t,
      walletName: walletMap[t.walletId]?.name || 'Dompet Dihapus',
      walletType: walletMap[t.walletId]?.type || 'cash',
      fundName: fund?.name || 'Pribadi',
      fundIcon: fund?.icon || '💰',
      fundColor: fund?.color || 'emerald'
    };
  }).sort((a, b) => new Date(b.date) - new Date(a.date)) || [];

  // Get active fund info
  const activeFund = activeFundId ? funds?.find(f => f.uuid === activeFundId) : null;

  return {
    totalBalance,
    filteredBalance,
    walletBalances,
    walletMap,
    fundBalances,
    fundMap,
    funds,
    defaultFund,
    activeFund,
    incomeThisMonth,
    expenseThisMonth,
    recentTransactions: enrichedTransactions.slice(0, 5),
    allTransactions: enrichedTransactions
  };
}
