import { useState } from 'react';

/**
 * Custom hook for toast notification management
 * Provides centralized toast state and helper functions
 * @returns {{ toast: {message: string, type: string} | null, showToast: Function, hideToast: Function }}
 */
export function useToast() {
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
    };

    const hideToast = () => {
        setToast(null);
    };

    return { toast, showToast, hideToast };
}
