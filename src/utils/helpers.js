import { CreditCard, Wallet, Banknote } from 'lucide-react';

/**
 * Format number as Indonesian Rupiah currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount) => {
    return `Rp ${amount?.toLocaleString('id-ID') || 0}`;
};

/**
 * Check if a message indicates an error/warning state
 * Used for determining toast/message styling
 * @param {string} message - Message to check
 * @returns {boolean} True if message is error type
 */
export const isErrorMessage = (message) => {
    if (!message) return false;
    const errorKeywords = ['Gagal', 'tidak bisa', 'sudah ada', 'dihapus'];
    return errorKeywords.some(keyword => message.includes(keyword));
};

/**
 * Get wallet icon component based on wallet type
 * @param {string} type - Wallet type ('bank', 'ewallet', 'cash')
 * @returns {React.Component} Lucide icon component
 */
export const getWalletIcon = (type) => {
    const icons = {
        bank: CreditCard,
        ewallet: Wallet,
        cash: Banknote
    };
    return icons[type] || Banknote;
};

/**
 * Get wallet icon background color class based on type
 * @param {string} type - Wallet type
 * @returns {string} Tailwind classes for background and text color
 */
export const getWalletIconStyle = (type) => {
    const styles = {
        bank: 'bg-sky-50 text-sky-600',
        ewallet: 'bg-teal-50 text-teal-600',
        cash: 'bg-emerald-50 text-emerald-600'
    };
    return styles[type] || styles.cash;
};

/**
 * Check if name already exists in array (case-insensitive)
 * @param {Array} items - Array of items with 'name' property
 * @param {string} name - Name to check
 * @returns {boolean} True if name exists
 */
export const isDuplicateName = (items, name) => {
    if (!items || !name) return false;
    return items.some(item =>
        item.name.toLowerCase() === name.trim().toLowerCase()
    );
};
