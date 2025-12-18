/**
 * Format number with Indonesian thousand separator (dot)
 * @param {number|string} value - Number to format
 * @returns {string} Formatted string with dots
 */
export const formatNumber = (value) => {
    if (!value && value !== 0) return '';
    const num = typeof value === 'string' ? value.replace(/\D/g, '') : String(value);
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Parse formatted number string back to number
 * @param {string} formatted - Formatted string with dots
 * @returns {number} Parsed number
 */
export const parseNumber = (formatted) => {
    if (!formatted) return 0;
    return parseInt(formatted.replace(/\./g, ''), 10) || 0;
};

/**
 * Sort categories array with "Lainnya" always at the end
 * @param {Array} categories - Array of category objects or strings
 * @returns {Array} Sorted array
 */
export const sortCategoriesWithLainnyaLast = (categories) => {
    if (!categories || !Array.isArray(categories)) return [];

    return [...categories].sort((a, b) => {
        const nameA = typeof a === 'string' ? a : a.name;
        const nameB = typeof b === 'string' ? b : b.name;

        if (nameA === 'Lainnya') return 1;
        if (nameB === 'Lainnya') return -1;
        return nameA.localeCompare(nameB);
    });
};

/**
 * Format currency with Rupiah format
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency
 */
export const formatCurrency = (amount) => {
    return `Rp ${formatNumber(amount)}`;
};
